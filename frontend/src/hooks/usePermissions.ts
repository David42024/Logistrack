import { useState, useEffect, useCallback } from 'react';
import { rolesApi } from '../api/roles.api';

const permissionCache = new Map<string, string[]>();

const PERMISSIONS_CHANGED_EVENT = 'opencode-permissions-changed';

export function clearPermissionCache() {
  permissionCache.clear();
  window.dispatchEvent(new CustomEvent(PERMISSIONS_CHANGED_EVENT));
}

export function usePermissions(role?: string) {
  const [permissions, setPermissions] = useState<string[]>(() => {
    if (role && permissionCache.has(role)) return permissionCache.get(role)!;
    return [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!role) return;

    const doFetch = () => {
      if (permissionCache.has(role)) {
        if (mounted) setPermissions(permissionCache.get(role)!);
        return;
      }
      setLoading(true);
      rolesApi.getOne(role).then((res) => {
        if (!mounted) return;
        const perms = res.data?.permissions || [];
        permissionCache.set(role, perms);
        setPermissions(perms);
      }).catch(() => {
        if (!mounted) return;
        permissionCache.set(role, []);
        setPermissions([]);
      }).finally(() => {
        if (mounted) setLoading(false);
      });
    };

    doFetch();

    const handler = () => doFetch();
    window.addEventListener(PERMISSIONS_CHANGED_EVENT, handler);
    return () => {
      mounted = false;
      window.removeEventListener(PERMISSIONS_CHANGED_EVENT, handler);
    };
  }, [role]);

  const can = useCallback((permission: string): boolean => {
    if (!role) return false;
    return permissions.includes(permission);
  }, [role, permissions]);

  const canAny = useCallback((...perms: string[]): boolean => {
    return perms.some(p => permissions.includes(p));
  }, [permissions]);

  const canAll = useCallback((...perms: string[]): boolean => {
    return perms.every(p => permissions.includes(p));
  }, [permissions]);

  return { permissions, loading, can, canAny, canAll };
}
