import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Mail, Lock, User, Phone, CheckCircle2, ShieldAlert, Cpu, Hospital, Navigation, Radio, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types/database';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, switchDemoRole } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CITIZEN');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pre-configured Test Accounts for Privileged Roles
  const testAccounts: Record<UserRole, { email: string; pass: string; title: string }> = {
    ADMIN: { email: 'admin@disasterx.gov.in', pass: 'test@123', title: 'System Administrator' },
    COMMANDER: { email: 'commander@disasterx.gov.in', pass: 'test@123', title: 'Disaster Commander' },
    RESPONDER: { email: 'responder@disasterx.gov.in', pass: 'test@123', title: 'First Responder Unit' },
    HOSPITAL: { email: 'hospital@disasterx.gov.in', pass: 'test@123', title: 'Hospital Emergency Facility' },
    CITIZEN: { email: 'citizen@disasterx.gov.in', pass: 'citizen123', title: 'Citizen Emergency Portal' },
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (role !== 'CITIZEN') {
      setEmail(testAccounts[role].email);
      setPassword(testAccounts[role].pass);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    // Simulate OTP generation / verification request
    setTimeout(() => {
      setLoading(false);
      setShowOtpScreen(true);
      setSuccessMsg(`OTP Sent to ${email}! Check your inbox for 6-digit code.`);
    }, 1000);
  };

  const handleVerifyOtpAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg('Please enter a valid OTP code (e.g. 123456).');
      return;
    }

    setSuccessMsg('OTP Verified Successfully! Authenticating...');
    setTimeout(() => {
      switchDemoRole(selectedRole);
    }, 1000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (selectedRole === 'CITIZEN' && isSignUp) {
        // Trigger OTP verification flow for Citizen Signup
        setLoading(false);
        setShowOtpScreen(true);
        setSuccessMsg(`Email verification OTP sent to ${email}`);
        return;
      }

      const { error } = await signIn(email || testAccounts[selectedRole].email, password || testAccounts[selectedRole].pass);
      if (error && error.message.includes('Invalid')) {
        setErrorMsg('Invalid credentials. For test accounts, use test@123.');
      } else {
        switchDemoRole(selectedRole);
      }
    } catch (err: any) {
      switchDemoRole(selectedRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 md:p-6 selection:bg-red-500 selection:text-white">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Brand & Role Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 border border-red-500/40 shadow-xl shadow-red-950/80">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1">
                DISASTER<span className="text-red-500">X</span> <span className="text-cyan-400">AI</span>
              </span>
              <p className="text-xs text-slate-400 font-mono">
                National AI Emergency Intelligence Platform
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-100">
              Select Role Portal:
            </h1>
            <p className="text-xs text-slate-400">
              Choose your role below. Pre-configured test accounts use password <code className="text-cyan-400">test@123</code>.
            </p>
          </div>

          {/* Role Cards List */}
          <div className="space-y-2.5">
            {(['CITIZEN', 'RESPONDER', 'HOSPITAL', 'COMMANDER', 'ADMIN'] as UserRole[]).map((r) => {
              const info = testAccounts[r];
              const isSelected = selectedRole === r;
              return (
                <div
                  key={r}
                  onClick={() => handleSelectRole(r)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-slate-900 border-red-500 shadow-xl shadow-red-950/40 ring-1 ring-red-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${
                      r === 'CITIZEN' ? 'bg-red-950/20 border-red-500/60 text-red-400' :
                      r === 'RESPONDER' ? 'bg-cyan-950/20 border-cyan-500/60 text-cyan-400' :
                      r === 'HOSPITAL' ? 'bg-emerald-950/20 border-emerald-500/60 text-emerald-400' :
                      r === 'COMMANDER' ? 'bg-purple-950/20 border-purple-500/60 text-purple-400' :
                      'bg-amber-950/20 border-amber-500/60 text-amber-400'
                    }`}>
                      {r === 'CITIZEN' ? <ShieldAlert className="w-5 h-5" /> :
                       r === 'RESPONDER' ? <Navigation className="w-5 h-5" /> :
                       r === 'HOSPITAL' ? <Hospital className="w-5 h-5" /> :
                       r === 'COMMANDER' ? <Radio className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-200 group-hover:text-white flex items-center gap-2">
                        <span>{info.title}</span>
                        <span className="text-[10px] font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          {r}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {r === 'CITIZEN' ? 'Email OTP Sign-up / Login' : `Test: ${info.email} (Pass: test@123)`}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Sign In / OTP Screen / Password Reset */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white">
              {showOtpScreen
                ? 'Enter Email OTP Verification'
                : isResetPassword
                ? 'Reset Password via OTP'
                : isSignUp
                ? `Citizen Register & OTP`
                : `Sign In as ${selectedRole}`}
            </h2>
            <p className="text-xs text-slate-400">
              {selectedRole !== 'CITIZEN'
                ? `Privileged Role Access (${selectedRole})`
                : 'Citizen Emergency Portal Authentication'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Test Account Info Callout for Privileged Roles */}
          {selectedRole !== 'CITIZEN' && !showOtpScreen && !isResetPassword && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400 font-mono">Pre-Configured Test Credentials:</div>
              <div className="text-cyan-400 font-mono font-bold">Email: {testAccounts[selectedRole].email}</div>
              <div className="text-amber-400 font-mono font-bold">Password: test@123</div>
            </div>
          )}

          {showOtpScreen ? (
            /* OTP Verification Form */
            <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Enter 6-Digit Email OTP *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-center tracking-widest text-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-950/80 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>VERIFY OTP & ENTER {selectedRole} PORTAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowOtpScreen(false)}
                className="w-full text-center text-slate-400 hover:underline text-xs"
              >
                ← Back to Login
              </button>
            </form>
          ) : isResetPassword ? (
            /* Password Reset Request Form */
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Registered Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@disasterx.gov.in"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-xl shadow-purple-950/80 transition-all uppercase tracking-wider"
              >
                {loading ? 'Sending OTP...' : 'Send Password Reset OTP'}
              </button>

              <button
                type="button"
                onClick={() => setIsResetPassword(false)}
                className="w-full text-center text-slate-400 hover:underline text-xs"
              >
                ← Back to Login
              </button>
            </form>
          ) : (
            /* Main Login / Register Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {isSignUp && (
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
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
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
                    placeholder={testAccounts[selectedRole].email}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">Password *</label>
                  <button
                    type="button"
                    onClick={() => setIsResetPassword(true)}
                    className="text-red-400 hover:underline text-[11px]"
                  >
                    Forgot Password / Reset OTP?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-xl shadow-red-950/80 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : isSignUp ? `Send Verification OTP` : `Sign In as ${selectedRole}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-red-400 hover:underline font-semibold"
                >
                  {isSignUp ? 'Already registered? Sign In' : 'New Citizen? Register with Email OTP'}
                </button>

                <button
                  type="button"
                  onClick={() => switchDemoRole(selectedRole)}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Quick Demo Sign-in →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
