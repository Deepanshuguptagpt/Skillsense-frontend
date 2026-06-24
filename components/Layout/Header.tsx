'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  Briefcase,
  FolderKanban,
  LogOut,
  Map,
  Brain,
  Sparkles,
  ClipboardList,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/lib/auth';
import { APP_ROUTES } from '@/lib/constants';
import { cn, getInitials } from '@/lib/utils';
import { notify } from '@/hooks/useNotifications';
import NotificationBell from '@/components/NotificationBell';

const candidateNavigation = [
  { name: 'Dashboard', href: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Profile', href: APP_ROUTES.PROFILE, icon: User },
  { name: 'Internships', href: APP_ROUTES.INTERNSHIPS, icon: Briefcase },
  { name: 'Applications', href: '/applications', icon: ClipboardList },
  { name: 'Learning', href: APP_ROUTES.LEARNING, icon: Map },
  { name: 'Projects', href: APP_ROUTES.PROJECTS, icon: FolderKanban },
  { name: 'SkillGenie', href: APP_ROUTES.SKILLGENIE, icon: Sparkles },
];

const recruiterNavigation = [
  {
    name: 'Dashboard',
    href: APP_ROUTES.RECRUITER_DASHBOARD,
    icon: LayoutDashboard,
  },
  { name: 'Jobs', href: APP_ROUTES.RECRUITER_JOBS, icon: Briefcase },
  { name: 'Profile', href: APP_ROUTES.RECRUITER_PROFILE, icon: User },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const pathname = usePathname();
  const { user, signOut, deleteAccount, isDeletingAccount } = useAuth();
  const authUser = useAuthStore((s) => s.user);
  const isRecruiter = authUser?.role === 'recruiter';
  const navigation = isRecruiter ? recruiterNavigation : candidateNavigation;
  const homeRoute = isRecruiter
    ? APP_ROUTES.RECRUITER_DASHBOARD
    : APP_ROUTES.DASHBOARD;

  // Only fetch candidate profile for non-recruiter users
  const { profile } = useProfile();
  const displayName = isRecruiter
    ? authUser?.name || 'Recruiter'
    : profile?.personalInfo?.name || user?.name || 'User';
  const displayEmail = isRecruiter
    ? authUser?.email || ''
    : profile?.personalInfo?.email || user?.email || '';

  return (
    <header className="sticky top-0 z-40 w-full pt-4 pb-2 px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
      <div className="relative rounded-[20px] bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-200 p-[1.5px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] shadow-violet-500/10 transition-all duration-300">
        <nav className="flex items-center justify-between rounded-[18px] bg-white/90 px-4 py-3 backdrop-blur-2xl backdrop-saturate-200 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Link href={homeRoute} className="group flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm transition-shadow group-hover:shadow-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="gradient-text-primary font-sora text-xl font-extrabold">
                SkillSense
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden flex-1 items-center justify-center gap-2 md:flex lg:gap-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200',
                    isActive
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-violet-600' : 'text-slate-400'
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full bg-gradient-to-r from-violet-600 to-indigo-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Notification Bell — only for candidates */}
            {!isRecruiter && <NotificationBell />}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition-colors hover:border-slate-100 hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-bold text-white shadow-sm ring-2 ring-white">
                  {user ? getInitials(user.name) : 'U'}
                </div>
                <span className="hidden px-1 text-sm font-semibold text-slate-700 sm:block">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setShowDeleteConfirm(false);
                    }}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                    {/* Header — gradient with name + email */}
                    <div className="bg-gradient-to-br from-violet-50 via-pink-50 to-indigo-50 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-bold text-white shadow-sm">
                          {user ? getInitials(user.name) : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-slate-900">
                            {displayName}
                          </p>
                          <p className="truncate text-sm text-slate-500">
                            {displayEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                      {!isRecruiter && (
                        <Link
                          href={APP_ROUTES.PROFILE}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-5 w-5 text-slate-400" />
                          View Profile
                        </Link>
                      )}

                      {/* Sign Out */}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          notify.info('Signing you out...');
                          signOut();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <LogOut className="h-5 w-5 text-slate-500" />
                        Sign Out
                      </button>

                      <div className="my-1 mx-2 border-t border-slate-100" />

                      {/* Delete Account */}
                      {showDeleteConfirm ? (
                        <div className="mx-1 rounded-xl bg-red-50 p-3">
                          <p className="mb-2.5 text-xs font-semibold text-red-700">
                            This permanently deletes your account and all data. Cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { deleteAccount(); notify.error('Account deletion in progress...'); }}
                              disabled={isDeletingAccount}
                              className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {isDeletingAccount ? 'Deleting...' : 'Yes, delete'}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              disabled={isDeletingAccount}
                              className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5 text-red-500" />
                          Delete Account
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2.5 transition-colors hover:bg-slate-50 hover:text-violet-600 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute w-full border-t border-slate-100 bg-white/95 px-4 py-4 shadow-lg backdrop-blur-xl md:hidden">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200',
                    isActive
                      ? 'border border-violet-100 bg-gradient-to-r from-violet-50 to-pink-50 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-violet-600' : 'text-slate-400'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
