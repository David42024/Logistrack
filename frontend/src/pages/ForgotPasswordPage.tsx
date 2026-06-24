import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import toast from 'react-hot-toast';
import {
  Mail,
  Sun,
  Moon,
  Truck,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor, ingresa tu correo electrónico');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor, ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    // Simular envío de código de verificación
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
      toast.success('Código de verificación enviado a tu correo');
    }, 1200);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error('El código debe ser de 6 dígitos');
      return;
    }

    setVerifying(true);
    // Simular verificación exitosa
    setTimeout(() => {
      setVerifying(false);
      toast.success('Código verificado con éxito. Redirigiendo...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }, 1200);
  };

  return (
    <div className="login-shell relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Background decorative layers */}
      <div className="login-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="login-orb login-orb--left absolute pointer-events-none" aria-hidden="true" />
      <div className="login-orb login-orb--right absolute pointer-events-none" aria-hidden="true" />

      {/* ── Theme toggle ── fixed top-right ─────────────────────────────── */}
      <button
        id="forgot-password-theme-toggle"
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

      {/* ── Main Container ────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-[420px] px-6 py-12">
        <div
          className={`rounded-3xl px-8 py-9 transition-all duration-300 ${
            isDark
              ? 'bg-gray-900 shadow-[0_32px_72px_rgba(0,0,0,0.6)] border border-white/5'
              : 'bg-white border border-gray-100 shadow-2xl shadow-blue-100/50'
          }`}
        >
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={`group inline-flex items-center gap-2 mb-6 text-xs font-semibold uppercase tracking-wider transition-colors ${
              isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Volver al inicio
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 ${
                isDark ? 'shadow-lg shadow-blue-500/30' : 'shadow-lg shadow-blue-200'
              }`}
            >
              <Truck size={28} className="text-white" strokeWidth={1.8} />
            </div>
            
            <h2 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              ¿Olvidaste tu contraseña?
            </h2>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isSent
                ? 'Hemos enviado un código de verificación de 6 dígitos a tu correo'
                : 'Ingresa tu correo institucional y te enviaremos las instrucciones de recuperación'}
            </p>
          </div>

          {/* Content forms */}
          {!isSent ? (
            <form onSubmit={handleSendCode} className="mt-8 space-y-5" noValidate>
              <div>
                <label
                  htmlFor="recovery-email"
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
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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

              <button
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 bg-blue-600 hover:bg-blue-700 ${
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
                    Enviando código...
                  </>
                ) : (
                  'Enviar código de verificación'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="mt-8 space-y-5" noValidate>
              <div className="p-4 rounded-xl border flex gap-3 items-start bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold block mb-0.5">Correo enviado</span>
                  Código enviado a: <span className="font-medium underline">{email}</span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="verification-code"
                  className={`mb-1.5 block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Código de verificación
                </label>
                <input
                  id="verification-code"
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="000000"
                  className={`
                    w-full rounded-xl py-3 px-4 text-center text-lg font-bold tracking-[0.5em] placeholder-gray-400 transition
                    focus:outline-none focus:ring-2 focus:border-transparent
                    ${isDark
                      ? 'border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500 focus:ring-blue-500'
                      : 'border border-blue-100 bg-blue-50/60 text-gray-800 placeholder-gray-400 focus:ring-blue-100 focus:border-blue-400 focus:ring-2'
                    }
                  `}
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 bg-blue-600 hover:bg-blue-700 ${
                  isDark
                    ? 'shadow-md shadow-blue-500/20'
                    : 'shadow-lg shadow-blue-200'
                }`}
              >
                {verifying ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verificando...
                  </>
                ) : (
                  'Verificar código'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSent(false);
                    setEmail('');
                    setVerificationCode('');
                  }}
                  className={`text-xs font-semibold transition-colors ${
                    isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  ¿No recibiste el código? Intentar con otro correo
                </button>
              </div>
            </form>
          )}

          {/* Support section */}
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

          {/* Footer copyright */}
          <div
            className={`mt-6 flex items-center justify-between text-[10px] border-t pt-4 ${
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
    </div>
  );
};

export default ForgotPasswordPage;
