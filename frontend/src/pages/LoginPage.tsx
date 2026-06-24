import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import toast from 'react-hot-toast';
import { reportsApi } from '../api/reports.api';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sun,
  Moon,
  Truck,
  Package,
  Route,
  Gauge,
  Users,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
type LoginMetrics = {
  activeOrders: number;
  inTransit: number;
  deliveryEfficiency: number;
  vehiclesInFleet: number;
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
const SkeletonMetricCard: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div
    className={`rounded-xl p-4 animate-pulse ${
      isDark
        ? 'border border-white/10 bg-white/10 backdrop-blur-sm'
        : 'border border-blue-100 bg-white shadow-md'
    }`}
  >
    <div className={`h-3 w-24 rounded mb-3 ${isDark ? 'bg-white/10' : 'bg-blue-50'}`} />
    <div className={`h-7 w-16 rounded ${isDark ? 'bg-white/10' : 'bg-blue-50'}`} />
  </div>
);

// ─── Metric Card ─────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
  isDark: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, accent, isDark }) => {
  const isEmpty = value === 0 || value === '0%';

  if (isDark) {
    return (
      <div className="group rounded-xl border border-white/10 bg-white/10 backdrop-blur-sm p-4 hover:bg-white/15 transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
          <span className="text-gray-500 group-hover:text-blue-400 transition-colors">{icon}</span>
        </div>
        <p className={`text-2xl font-bold leading-none ${accent ? 'text-blue-400' : 'text-white'}`}>
          {value}
        </p>
      </div>
    );
  }

  // ── Light mode card ──
  return (
    <div className="group rounded-xl border border-blue-100 bg-white shadow-md hover:shadow-lg transition-all duration-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
        <span className="flex-shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-500 group-hover:bg-blue-100 transition-colors">
          {icon}
        </span>
      </div>
      <p
        className={`text-3xl font-bold leading-none tracking-tight ${
          isEmpty ? 'text-gray-400' : accent ? 'text-blue-600' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [metrics, setMetrics] = useState<LoginMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Fetch public metrics
  useEffect(() => {
    reportsApi
      .getLoginMetrics()
      .then((res) => setMetrics(res.data))
      .catch(() => setMetrics(null))
      .finally(() => setMetricsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('¡Bienvenido!');
      setTimeout(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u.role === 'driver') navigate('/driver-dashboard');
          else if (u.role === 'customer') navigate('/track');
          else navigate('/dashboard');
        }
      }, 100);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const showPasswordHint = password.length > 0 && password.length < 8;

  return (
    <div className="login-shell relative min-h-screen overflow-hidden">
      {/* Background decorative layers */}
      <div className="login-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="login-orb login-orb--left absolute pointer-events-none" aria-hidden="true" />
      <div className="login-orb login-orb--right absolute pointer-events-none" aria-hidden="true" />

      {/* ── Theme toggle ── fixed top-right ─────────────────────────────── */}
      <button
        id="login-theme-toggle"
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className={`
          fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full
          transition-all duration-200 hover:scale-105
          ${isDark
            ? 'border border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 shadow-lg'
            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-md'
          }
        `}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 lg:px-10">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">

          {/* ══════════════════════════════════════════════════════════════════
              LEFT COLUMN — Hero + Metrics
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-10">

            {/* Label */}
            <div className={`inline-flex items-center border-l-2 pl-3 ${isDark ? 'border-blue-400' : 'border-blue-600'}`}>
              <span className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Plataforma Logística
              </span>
            </div>

            {/* Hero headline */}
            <div className="space-y-4 -mt-4">
              <h1
                className={`text-4xl font-extrabold leading-tight sm:text-5xl ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Gestión inteligente de{' '}
                <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>
                  rutas y pedidos
                </span>
              </h1>
              <p className={`max-w-md text-base font-light leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Visibilidad total de tu cadena de suministro en tiempo real.
              </p>
            </div>

            {/* ── Metrics grid 2×2 ─────────────────────────────────────── */}
            {metricsLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <SkeletonMetricCard isDark={isDark} />
                <SkeletonMetricCard isDark={isDark} />
                <SkeletonMetricCard isDark={isDark} />
                <SkeletonMetricCard isDark={isDark} />
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  label="Pedidos activos"
                  value={metrics.activeOrders}
                  icon={<Package size={15} />}
                  isDark={isDark}
                />
                <MetricCard
                  label="Rutas en tránsito"
                  value={metrics.inTransit}
                  icon={<Route size={15} />}
                  isDark={isDark}
                />
                <MetricCard
                  label="Eficiencia de entrega"
                  value={`${metrics.deliveryEfficiency}%`}
                  icon={<Gauge size={15} />}
                  accent
                  isDark={isDark}
                />
                <MetricCard
                  label="Vehículos en flota"
                  value={metrics.vehiclesInFleet}
                  icon={<Users size={15} />}
                  isDark={isDark}
                />
              </div>
            ) : (
              <div
                className={`rounded-xl px-4 py-3 text-xs ${
                  isDark
                    ? 'border border-white/10 bg-white/5 text-gray-400'
                    : 'border border-blue-100 bg-white text-gray-500 shadow-sm'
                }`}
              >
                Métricas no disponibles en este momento.
              </div>
            )}

            {/* Footer status */}
            <div
              className={`flex items-center gap-2 pt-2 border-t text-xs ${
                isDark
                  ? 'border-white/10 text-gray-500'
                  : 'border-blue-100/60 text-gray-600'
              }`}
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Sistema operativo · Todos los servicios activos · Última sincronización: hace 2 min
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT COLUMN — Login Card
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="mx-auto w-full max-w-[420px]">
            <div
              className={`rounded-3xl px-8 py-9 ${
                isDark
                  ? 'bg-gray-900 shadow-[0_32px_72px_rgba(0,0,0,0.6)]'
                  : 'bg-white border border-gray-100 shadow-2xl shadow-blue-100/50'
              }`}
            >
              {/* Card header */}
              <div className="flex flex-col items-center text-center">
                {/* Logo badge */}
                <div
                  className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 ${
                    isDark ? 'shadow-lg shadow-blue-500/30' : 'shadow-lg shadow-blue-200'
                  }`}
                >
                  <Truck size={28} className="text-white" strokeWidth={1.8} />
                </div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  Logistrack Enterprise
                </h2>
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sistema de Gestión de Transporte y Logística
                </p>
                <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Accede con tus credenciales corporativas
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>

                {/* Email */}
                <div>
                  <label
                    htmlFor="login-email"
                    className={`mb-1.5 block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <span
                      className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-blue-400'
                      }`}
                    >
                      <Mail size={16} />
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="correo@empresa.com"
                      className={`
                        w-full rounded-xl py-3 pl-10 pr-4 text-sm placeholder-gray-400 transition
                        focus:outline-none focus:ring-2 focus:border-transparent
                        ${isDark
                          ? 'border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500 focus:ring-blue-500'
                          : 'border border-blue-100 bg-blue-50/60 text-gray-800 placeholder-gray-400 focus:ring-blue-100 focus:border-blue-400 focus:ring-2'
                        }
                      `}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="login-password"
                    className={`mb-1.5 block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <span
                      className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-blue-400'
                      }`}
                    >
                      <Lock size={16} />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={`
                        w-full rounded-xl py-3 pl-10 pr-11 text-sm placeholder-gray-400 transition
                        focus:outline-none focus:ring-2 focus:border-transparent
                        ${isDark
                          ? 'border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500 focus:ring-blue-500'
                          : 'border border-blue-100 bg-blue-50/60 text-gray-800 placeholder-gray-400 focus:ring-blue-100 focus:border-blue-400 focus:ring-2'
                        }
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                        isDark
                          ? 'text-gray-400 hover:text-gray-300'
                          : 'text-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password hint */}
                  {showPasswordHint && (
                    <p className="mt-1.5 text-[11px] text-red-500">
                      La contraseña debe tener al menos 8 caracteres
                    </p>
                  )}

                  {/* Forgot password */}
                  <Link
                    to="/forgot-password"
                    className={`mt-2 inline-block text-sm transition-colors ${
                      isDark
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-blue-500 hover:text-blue-700'
                    }`}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Submit button */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={loading}
                  className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 bg-blue-600 hover:bg-blue-700 ${
                    isDark
                      ? 'shadow-md shadow-blue-500/20'
                      : 'shadow-lg shadow-blue-200'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>
              </form>

              {/* Support link */}
              <div className={`mt-6 text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                ¿Necesitas ayuda? Contacta a soporte técnico
                <div className="mt-0.5">
                  <a
                    href="mailto:soporte@logistrack.com"
                    className={`font-medium transition-colors ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'
                    }`}
                  >
                    soporte@logistrack.com
                  </a>
                </div>
              </div>

              {/* Card footer */}
              <div
                className={`mt-5 flex items-center justify-between text-[10px] border-t pt-4 ${
                  isDark
                    ? 'border-gray-700 text-gray-500'
                    : 'border-gray-100 text-gray-400'
                }`}
              >
                <span>v3.2.1</span>
                <span>© 2025 LogisTrack Enterprise</span>
              </div>
            </div>
          </div>
          {/* ─────────────────────────────────────────────────────────────── */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
