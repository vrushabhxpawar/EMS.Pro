// src/pages/user/MyProfile.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  User,
  Mail,
  Shield,
  ShieldOff,
  Camera,
  Check,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';

// ── Constants ────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: 'bg-red-500',    label: 'Red'    },
  { bg: 'bg-orange-500', label: 'Orange' },
  { bg: 'bg-amber-500',  label: 'Amber'  },
  { bg: 'bg-green-500',  label: 'Green'  },
  { bg: 'bg-teal-500',   label: 'Teal'   },
  { bg: 'bg-blue-500',   label: 'Blue'   },
  { bg: 'bg-violet-500', label: 'Violet' },
  { bg: 'bg-pink-500',   label: 'Pink'   },
  { bg: 'bg-gray-800',   label: 'Dark'   },
];

// ── Helpers ──────────────────────────────────────────────
const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const getStrength = (pwd) =>
  (pwd.length >= 8          ? 1 : 0) +
  (/[A-Z]/.test(pwd)        ? 1 : 0) +
  (/[0-9]/.test(pwd)        ? 1 : 0) +
  (/[^A-Za-z0-9]/.test(pwd) ? 1 : 0);

const strengthLabel = (s) =>
  s <= 1 ? 'Weak' : s === 2 ? 'Fair' : s === 3 ? 'Good' : 'Strong';

const strengthColor = (s) =>
  s <= 1 ? 'bg-red-400' : s === 2 ? 'bg-amber-400' : s === 3 ? 'bg-blue-400' : 'bg-green-500';

// ── Sub-components ───────────────────────────────────────
function Section({ title, description, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function PasswordInput({ id, value, onChange, placeholder, show, onToggle, error }) {
  return (
    <div>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`pr-10 ${error ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3
      rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2
      ${type === 'success'
        ? 'bg-green-50 text-green-700 border border-green-200'
        : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 shrink-0" />
        : <span className="text-red-500 font-bold shrink-0">!</span>
      }
      {message}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────
export default function MyProfile() {
  const { user, setUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [avatarColor,   setAvatarColor]   = useState('bg-gray-800');
  const [showPasswords, setShowPasswords] = useState({
    current: false, new: false, confirm: false,
  });
  const [loadingProfile,  setLoadingProfile]  = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingAvatar,   setLoadingAvatar]   = useState(false);
  const [passwordErrors,  setPasswordErrors]  = useState({});
  const [toast, setToast] = useState({ message: '', type: '' });

  // Init from auth user
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '' });
      setAvatarColor(user.avatarColor || 'bg-gray-800');
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const toggleShow = (field) =>
    setShowPasswords(p => ({ ...p, [field]: !p[field] }));

  // ── Handlers ─────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    setLoadingProfile(true);
    try {
      const res = await api.put('/auth/update-profile', profileForm);
      console.log(res.data)
      setUser(res.data.data);
      showToast('Profile updated successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleAvatarSave = async (color) => {
    setAvatarColor(color);
    setLoadingAvatar(true);
    try {
      const res = await api.put('/auth/update-profile', { avatarColor: color });
      setUser(res.data.data);
      showToast('Avatar updated.');
    } catch (err) {
      showToast('Failed to update avatar.', 'error');
      setAvatarColor(user?.avatarColor || 'bg-gray-800'); // revert on error
    } finally {
      setLoadingAvatar(false);
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword)
      errors.currentPassword = 'Current password is required.';
    if (passwordForm.newPassword.length < 8)
      errors.newPassword = 'Must be at least 8 characters.';
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errors.confirmPassword = 'Passwords do not match.';
    return errors;
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const errors = validatePassword();
    if (Object.keys(errors).length) { setPasswordErrors(errors); return; }
    setPasswordErrors({});
    setLoadingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  // ── Derived values ────────────────────────────────────
  const initials = getInitials(profileForm.name);
  const strength = getStrength(passwordForm.newPassword);
  const passwordsMatch =
    passwordForm.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  return (
    <div className="max-w-2xl space-y-5 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal info and account security.
        </p>
      </div>

      {/* ── Avatar ─────────────────────────────────────── */}
      <Section icon={Camera} title="Avatar" description="Pick a color for your profile avatar.">
        <div className="flex items-center gap-6">

          {/* Preview */}
          <div className={`w-16 h-16 rounded-full ${avatarColor} shrink-0
            flex items-center justify-center text-white text-xl font-bold shadow-sm
            transition-colors duration-200`}
          >
            {initials || <User className="w-7 h-7" />}
          </div>

          {/* Picker */}
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-2.5">Select a color</p>
            <div className="flex flex-wrap gap-2.5">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c.bg}
                  type="button"
                  title={c.label}
                  onClick={() => handleAvatarSave(c.bg)}
                  disabled={loadingAvatar}
                  className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center
                    transition-all duration-150 disabled:opacity-60
                    ${avatarColor === c.bg
                      ? 'ring-2 ring-offset-2 ring-gray-700 scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                >
                  {avatarColor === c.bg && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              ))}
            </div>

            {loadingAvatar && (
              <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving…
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* ── Basic Info ─────────────────────────────────── */}
      <Section icon={User} title="Basic Information" description="Update your display name and email.">
        <form onSubmit={handleProfileSave} className="space-y-4">

          {/* Role — read only */}
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">Role</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
              ${user?.role === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600'
              }`}
            >
              {user?.role === 'admin' ? 'Admin' : 'Employee'}
            </span>
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              className="mt-1"
              value={profileForm.name}
              placeholder="Your full name"
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="email"
                type="email"
                className="pl-9"
                value={profileForm.email}
                placeholder="you@example.com"
                onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loadingProfile}
            className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
          >
            {loadingProfile
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
              : 'Save Changes'
            }
          </Button>
        </form>
      </Section>

      {/* ── Password & Security ────────────────────────── */}
      <Section
        icon={KeyRound}
        title="Password & Security"
        description="Change your password to keep your account secure."
      >
        <form onSubmit={handlePasswordSave} className="space-y-4">

          {/* Current password */}
          <div>
            <Label htmlFor="currentPassword" className="mb-1 block">
              Current Password
            </Label>
            <PasswordInput
              id="currentPassword"
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
              placeholder="Enter current password"
              show={showPasswords.current}
              onToggle={() => toggleShow('current')}
              error={passwordErrors.currentPassword}
            />
          </div>

          {/* New password */}
          <div>
            <Label htmlFor="newPassword" className="mb-1 block">
              New Password
            </Label>
            <PasswordInput
              id="newPassword"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
              placeholder="Min 8 characters"
              show={showPasswords.new}
              onToggle={() => toggleShow('new')}
              error={passwordErrors.newPassword}
            />

            {/* Strength meter */}
            {passwordForm.newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        i <= strength ? strengthColor(strength) : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-gray-400">
                  <span className={`font-medium ${
                    strength <= 1 ? 'text-red-500' :
                    strength === 2 ? 'text-amber-500' :
                    strength === 3 ? 'text-blue-500' : 'text-green-600'
                  }`}>
                    {strengthLabel(strength)}
                  </span>
                  {' · '}Add uppercase, numbers and symbols to strengthen it.
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <Label htmlFor="confirmPassword" className="mb-1 block">
              Confirm New Password
            </Label>
            <PasswordInput
              id="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Repeat new password"
              show={showPasswords.confirm}
              onToggle={() => toggleShow('confirm')}
              error={passwordErrors.confirmPassword}
            />

            {/* Match indicator */}
            {passwordForm.confirmPassword && !passwordErrors.confirmPassword && (
              <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                passwordsMatch ? 'text-green-600' : 'text-red-500'
              }`}>
                {passwordsMatch
                  ? <><Check className="w-3 h-3" /> Passwords match</>
                  : '✕ Passwords do not match'
                }
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loadingPassword}
            className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
          >
            {loadingPassword
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating…</>
              : 'Update Password'
            }
          </Button>
        </form>
      </Section>

      {/* ── Account Info ───────────────────────────────── */}
      <Section icon={Shield} title="Account Info" description="Read-only details about your account.">
        <div className="divide-y divide-gray-50">
          {[
            {
              label: 'User ID',
              value: user?._id ?? '—',
              mono: true,
            },
            {
              label: 'Member since',
              value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })
                : '—',
              mono: false,
            },
            {
              label: 'Account status',
              value: (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Active
                </span>
              ),
              mono: false,
            },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex items-center justify-between py-2.5">
              <span className="text-xs text-gray-500">{label}</span>
              <span className={`text-xs text-gray-700 ${mono ? 'font-mono' : ''}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}