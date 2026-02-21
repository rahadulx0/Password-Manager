import { useState, useRef, useEffect } from 'react';
import {
  User, AtSign, Mail, Lock, Shield, ShieldCheck, ShieldOff,
  Eye, EyeOff, Sun, Moon, LogOut, Trash2, Pencil, X, Check,
  ArrowRight, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Settings({ passwords, favoritePasswords }) {
  const { user, token, logout, updateUser } = useAuth();
  const { dark, toggle } = useTheme();

  // Profile edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Change email
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [emailStep, setEmailStep] = useState(1); // 1 = form, 2 = OTP
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPw, setShowEmailPw] = useState(false);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);
  const emailOtpRefs = useRef([]);

  // Change password
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // 2FA
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAPw, setTwoFAPw] = useState('');
  const [show2FAPw, setShow2FAPw] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);

  // Delete account
  const [showDelete, setShowDelete] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Email OTP resend cooldown
  useEffect(() => {
    if (emailResendCooldown <= 0) return;
    const timer = setTimeout(() => setEmailResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [emailResendCooldown]);

  // Auto-focus OTP input
  useEffect(() => {
    if (emailStep === 2) emailOtpRefs.current[0]?.focus();
  }, [emailStep]);

  // ─── Profile ────────────────────────────────────────────

  function startEditProfile() {
    setEditName(user?.name || '');
    setEditUsername(user?.username || '');
    setEditingProfile(true);
  }

  async function saveProfile() {
    if (!editName.trim() || !editUsername.trim()) {
      toast.error('Name and username are required');
      return;
    }
    setProfileLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName.trim(), username: editUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      updateUser(data);
      setEditingProfile(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProfileLoading(false);
    }
  }

  // ─── Change Email ───────────────────────────────────────

  async function handleEmailSendOtp(e) {
    e.preventDefault();
    if (!newEmail || !emailPassword) {
      toast.error('All fields are required');
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch('/api/user/change-email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Verification code sent!');
      setEmailStep(2);
      setEmailResendCooldown(60);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleEmailVerify(code) {
    if (code.length !== 6) return;
    setEmailLoading(true);
    try {
      const res = await fetch('/api/user/change-email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      updateUser(data);
      toast.success('Email updated!');
      resetEmailState();
    } catch (err) {
      toast.error(err.message);
      setEmailOtp(['', '', '', '', '', '']);
      emailOtpRefs.current[0]?.focus();
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleEmailResend() {
    if (emailResendCooldown > 0) return;
    setEmailLoading(true);
    try {
      const res = await fetch('/api/user/change-email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('New code sent!');
      setEmailResendCooldown(60);
      setEmailOtp(['', '', '', '', '', '']);
      emailOtpRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEmailLoading(false);
    }
  }

  function handleEmailOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...emailOtp];
    newOtp[index] = value.slice(-1);
    setEmailOtp(newOtp);
    if (value && index < 5) emailOtpRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      setTimeout(() => handleEmailVerify(newOtp.join('')), 100);
    }
  }

  function handleEmailOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
      emailOtpRefs.current[index - 1]?.focus();
    }
  }

  function handleEmailOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...emailOtp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || '';
    setEmailOtp(newOtp);
    emailOtpRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) setTimeout(() => handleEmailVerify(pasted), 100);
  }

  function resetEmailState() {
    setShowChangeEmail(false);
    setEmailStep(1);
    setNewEmail('');
    setEmailPassword('');
    setShowEmailPw(false);
    setEmailOtp(['', '', '', '', '', '']);
  }

  // ─── Change Password ───────────────────────────────────

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPw.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Password changed!');
      setShowChangePassword(false);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPwLoading(false);
    }
  }

  // ─── 2FA Toggle ─────────────────────────────────────────

  async function handleToggle2FA(e) {
    e.preventDefault();
    if (!twoFAPw) {
      toast.error('Password is required');
      return;
    }
    setTwoFALoading(true);
    try {
      const res = await fetch('/api/user/two-factor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: !user?.twoFactorEnabled, password: twoFAPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      updateUser({ ...user, twoFactorEnabled: data.twoFactorEnabled });
      toast.success(data.message);
      setShow2FA(false);
      setTwoFAPw('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTwoFALoading(false);
    }
  }

  // ─── Delete Account ─────────────────────────────────────

  async function handleDeleteAccount(e) {
    e.preventDefault();
    if (!deletePw) {
      toast.error('Password is required');
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: deletePw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Account deleted');
      logout();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  // ─── Password input helper ─────────────────────────────

  function PasswordInput({ value, onChange, show, onToggle, placeholder, autoComplete }) {
    return (
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto w-full space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Settings</h2>

      {/* ─── Profile Card ─── */}
      <div className="glass-card overflow-hidden">
        <div className="p-4">
          {!editingProfile ? (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xl shrink-0">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user?.username}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={startEditProfile}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xl shrink-0">
                  {(editName || user?.name)?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                />
              </div>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProfile(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={profileLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {profileLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Account Security ─── */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Account Security</p>
        </div>

        {/* Change Email */}
        <div className="divide-y divide-gray-200 dark:divide-white/10">
          <div>
            <button
              onClick={() => { if (showChangeEmail) { resetEmailState(); } else { setShowChangeEmail(true); } }}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Email</span>
              </div>
              <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform ${showChangeEmail ? 'rotate-90' : ''}`} />
            </button>

            {showChangeEmail && (
              <div className="px-4 pb-4 animate-scale-in">
                {emailStep === 1 ? (
                  <form onSubmit={handleEmailSendOtp} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="New email address"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                      />
                    </div>
                    <PasswordInput
                      value={emailPassword}
                      onChange={setEmailPassword}
                      show={showEmailPw}
                      onToggle={() => setShowEmailPw(!showEmailPw)}
                      placeholder="Current password"
                      autoComplete="current-password"
                    />
                    <button
                      type="submit"
                      disabled={emailLoading}
                      className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {emailLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : 'Send Verification Code'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Code sent to <span className="font-medium text-gray-700 dark:text-gray-300">{newEmail}</span>
                    </p>
                    <div className="flex justify-center gap-2" onPaste={handleEmailOtpPaste}>
                      {emailOtp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (emailOtpRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleEmailOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleEmailOtpKeyDown(i, e)}
                          className="w-10 h-12 text-center text-lg font-bold rounded-xl bg-gray-100 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleEmailVerify(emailOtp.join(''))}
                      disabled={emailLoading || emailOtp.join('').length !== 6}
                      className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {emailLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : 'Verify & Update Email'}
                    </button>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => { setEmailStep(1); setEmailOtp(['', '', '', '', '', '']); }}
                        className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleEmailResend}
                        disabled={emailResendCooldown > 0 || emailLoading}
                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                      >
                        {emailResendCooldown > 0 ? `Resend in ${emailResendCooldown}s` : 'Resend code'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Change Password */}
          <div>
            <button
              onClick={() => { setShowChangePassword(!showChangePassword); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Password</span>
              </div>
              <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform ${showChangePassword ? 'rotate-90' : ''}`} />
            </button>

            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="px-4 pb-4 space-y-3 animate-scale-in">
                <PasswordInput
                  value={currentPw}
                  onChange={setCurrentPw}
                  show={showCurrentPw}
                  onToggle={() => setShowCurrentPw(!showCurrentPw)}
                  placeholder="Current password"
                  autoComplete="current-password"
                />
                <PasswordInput
                  value={newPw}
                  onChange={setNewPw}
                  show={showNewPw}
                  onToggle={() => setShowNewPw(!showNewPw)}
                  placeholder="New password (min. 8 characters)"
                  autoComplete="new-password"
                />
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                    autoComplete="new-password"
                  />
                </div>
                {newPw && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const strength = getStrength(newPw);
                      return (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            level <= strength
                              ? strength <= 1 ? 'bg-red-500'
                              : strength <= 2 ? 'bg-orange-500'
                              : strength <= 3 ? 'bg-yellow-500'
                              : 'bg-green-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {pwLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Update Password'}
                </button>
              </form>
            )}
          </div>

          {/* 2-Step Verification */}
          <div>
            <button
              onClick={() => { setShow2FA(!show2FA); setTwoFAPw(''); }}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div className="text-left">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">2-Step Verification</span>
                  <span className={`text-xs ${user?.twoFactorEnabled ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${user?.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${user?.twoFactorEnabled ? 'translate-x-5' : ''}`} />
              </div>
            </button>

            {show2FA && (
              <form onSubmit={handleToggle2FA} className="px-4 pb-4 space-y-3 animate-scale-in">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.twoFactorEnabled
                    ? 'Enter your password to disable 2-step verification.'
                    : 'Enter your password to enable 2-step verification. You\'ll need to verify a code sent to your email each time you sign in.'}
                </p>
                <PasswordInput
                  value={twoFAPw}
                  onChange={setTwoFAPw}
                  show={show2FAPw}
                  onToggle={() => setShow2FAPw(!show2FAPw)}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="submit"
                  disabled={twoFALoading}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                    user?.twoFactorEnabled
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {twoFALoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {user?.twoFactorEnabled ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      {user?.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ─── Statistics ─── */}
      <div className="glass-card overflow-hidden">
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Statistics</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{passwords.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{favoritePasswords.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Favorites</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{new Set(passwords.map((p) => p.category)).size}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Appearance ─── */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            {dark ? <Sun className="w-5 h-5 text-gray-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </span>
          </div>
          <div className={`w-12 h-7 rounded-full p-1 transition-colors ${dark ? 'bg-primary-600' : 'bg-gray-200'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-5' : ''}`} />
          </div>
        </button>
      </div>

      {/* ─── Danger Zone ─── */}
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-white/10">
          {/* Delete Account */}
          <div>
            <button
              onClick={() => { setShowDelete(!showDelete); setDeletePw(''); }}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-500">Delete Account</span>
              </div>
              <ArrowRight className={`w-4 h-4 text-red-400 transition-transform ${showDelete ? 'rotate-90' : ''}`} />
            </button>

            {showDelete && (
              <form onSubmit={handleDeleteAccount} className="px-4 pb-4 space-y-3 animate-scale-in">
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">
                    This action is permanent and cannot be undone. All your saved passwords will be deleted.
                  </p>
                </div>
                <PasswordInput
                  value={deletePw}
                  onChange={setDeletePw}
                  show={showDeletePw}
                  onToggle={() => setShowDeletePw(!showDeletePw)}
                  placeholder="Enter your password to confirm"
                  autoComplete="current-password"
                />
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {deleteLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete My Account
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sign Out */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-500">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
