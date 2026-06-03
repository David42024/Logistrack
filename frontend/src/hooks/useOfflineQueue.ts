import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { ordersApi } from '../api/orders.api';

interface QueuedAction {
  id: string;
  orderId: string;
  data: any;
  timestamp: number;
}

const QUEUE_KEY = 'offline_status_queue';

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localforage.getItem<QueuedAction[]>(QUEUE_KEY).then((q) => {
      if (q) setQueue(q);
    });
  }, []);

  const addToQueue = useCallback(async (orderId: string, data: any) => {
    const action: QueuedAction = {
      id: `${Date.now()}-${Math.random()}`,
      orderId,
      data,
      timestamp: Date.now(),
    };
    const newQueue = [...queue, action];
    setQueue(newQueue);
    await localforage.setItem(QUEUE_KEY, newQueue);
  }, [queue]);

  const syncQueue = useCallback(async () => {
    if (isSyncing || queue.length === 0) return;
    setIsSyncing(true);
    const remaining: QueuedAction[] = [];

    for (const action of queue) {
      try {
        await ordersApi.updateStatus(action.orderId, action.data);
      } catch {
        remaining.push(action);
      }
    }

    setQueue(remaining);
    await localforage.setItem(QUEUE_KEY, remaining);
    setIsSyncing(false);
  }, [queue, isSyncing]);

  useEffect(() => {
    const handleOnline = () => syncQueue();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncQueue]);

  return { queue, addToQueue, syncQueue, isSyncing };
};
