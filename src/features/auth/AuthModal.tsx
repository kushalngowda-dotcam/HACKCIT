import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Mail, Lock, User, Phone, X, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp } = useAuth();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUpMode) {
        const { error } = await signUp(email, password, fullName, phone);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Account created successfully! Default role: CITIZEN.');
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              {isSignUpMode ? 'Create Citizen Profile' : 'Sign In to DisasterX AI'}
            </h3>
            <p className="text-xs text-slate-400">
              {isSignUpMode ? 'New public users become CITIZEN by default' : 'Secure Supabase Auth session'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignUpMode && (
            <>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Emergency Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@emergency.gov.in"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-red-950/50 transition-all"
          >
            {loading ? 'Processing...' : isSignUpMode ? 'Register Citizen Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-3">
          {isSignUpMode ? (
            <span>
              Already registered?{' '}
              <button
                onClick={() => {
                  setIsSignUpMode(false);
                  setErrorMsg(null);
                }}
                className="text-red-400 hover:underline font-semibold"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a citizen account?{' '}
              <button
                onClick={() => {
                  setIsSignUpMode(true);
                  setErrorMsg(null);
                }}
                className="text-red-400 hover:underline font-semibold"
              >
                Register Now
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
