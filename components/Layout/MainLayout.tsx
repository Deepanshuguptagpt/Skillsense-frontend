'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  User,
  Sparkles,
  Map,
  FolderKanban,
  ClipboardList,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Zap,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/lib/auth';
import { APP_ROUTES } from '@/lib/constants';
import { cn, getInitials } from '@/lib/utils';
import NotificationBell from '@/components/NotificationBell';
import SkillGenieWidget from '@/components/SkillGenieWidget';

const candidateNav = [
  { name: 'Dashboard',    href: APP_ROUTES.DASHBOARD,    icon: LayoutDashboard },
  { name: 'Internships',  href: APP_ROUTES.INTERNSHIPS,  icon: Briefcase },
  { name: 'Profile',      href: APP_ROUTES.PROFILE,      icon: User },
  { name: 'SkillGenie',   href: APP_ROUTES.SKILLGENIE,   icon: Sparkles },
  { name: 'Learning',     href: APP_ROUTES.LEARNING,     icon: Map },
  { name: 'Projects',     href: APP_ROUTES.PROJECTS,     icon: FolderKanban },
  { name: 'Applications', href: '/applications',         icon: ClipboardList },
];

const recruiterNav = [
  { name: 'Dashboard', href: APP_ROUTES.RECRUITER_DASHBOARD, icon: LayoutDashboard },
  { name: 'Jobs',      href: APP_ROUTES.RECRUITER_JOBS,      icon: Briefcase },
  { name: 'Profile',   href: APP_ROUTES.RECRUITER_PROFILE,   icon: User },
];

function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { user, signOut, deleteAccount, isDeletingAccount } = useAuth();
  const authUser = useAuthStore((s) => s.user);
  const isRecruiter = authUser?.role === 'recruiter';
  const { profile } = useProfile();
  const nav = isRecruiter ? recruiterNav : candidateNav;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const displayName = isRecruiter
    ? authUser?.name || 'Recruiter'
    : profile?.personalInfo?.name || user?.name || 'User';
  const displayEmail = isRecruiter
    ? authUser?.email || ''
    : profile?.personalInfo?.email || user?.email || '';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-4">
        <Link href={APP_ROUTES.DASHBOARD} className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-600">
            <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div>
              <p className="font-sora text-[14px] font-bold leading-none text-slate-900">
                Skill<span className="text-violet-600">Sense</span>
              </p>
              <p className="text-[10px] font-medium text-slate-400 leading-none mt-0.5">
                Engineering Excellence
              </p>
            </div>
          )}
        </Link>
        {/* Collapse toggle — only visible on desktop */}
        <button
          onClick={onToggle}
          className={cn(
            'ml-auto hidden rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:flex',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== APP_ROUTES.DASHBOARD && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'border-l-2 border-violet-600 bg-violet-50 text-violet-700'
                    : 'border-l-2 border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                  collapsed && 'justify-center border-l-0 px-2'
                )}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] shrink-0',
                    isActive ? 'text-violet-600' : 'text-slate-400'
                  )}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User section at bottom */}
      <div className="shrink-0 border-t border-slate-100 p-3 relative group">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl p-2 cursor-default hover:bg-slate-50 transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
            {user ? getInitials(user.name) : 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">
                {displayName}
              </p>
              <p className="truncate text-[10px] font-medium text-slate-400">
                {displayEmail}
              </p>
            </div>
          )}
        </div>

        {/* Hover Menu */}
        <div className="absolute bottom-[calc(100%-12px)] left-0 w-full px-3 pb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl flex flex-col gap-1">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 text-left"
              title={collapsed ? "Sign out" : undefined}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0 text-slate-400" />
              {!collapsed && <span>Sign Out</span>}
            </button>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 text-left"
                title={collapsed ? "Delete Account" : undefined}
              >
                <Trash2 className="h-[18px] w-[18px] shrink-0 text-red-500" />
                {!collapsed && <span>Delete Account</span>}
              </button>
            ) : (
              <div className="rounded-lg border border-red-100 bg-red-50 p-2">
                {!collapsed && (
                  <p className="text-[11px] font-bold text-red-800 mb-2 leading-tight">
                    Are you sure? This is permanent.
                  </p>
                )}
                <div className={cn("flex gap-1", collapsed && "flex-col")}>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      deleteAccount();
                    }}
                    disabled={isDeletingAccount}
                    className="flex-1 rounded-md bg-red-600 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeletingAccount ? '...' : collapsed ? 'Yes' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeletingAccount}
                    className="flex-1 rounded-md border border-slate-200 bg-white py-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    {collapsed ? 'No' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const { user } = useAuth();
  const authUser = useAuthStore((s) => s.user);
  const isRecruiter = authUser?.role === 'recruiter';

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-6 backdrop-blur-sm transition-all duration-300',
        sidebarCollapsed ? 'left-[68px]' : 'left-60'
      )}
    >
      {/* Search */}
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 max-w-xs focus-within:border-slate-300 focus-within:bg-white transition-colors">
        <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <input
          type="text"
          placeholder="Search skills, jobs..."
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        {!isRecruiter && <NotificationBell />}

        {/* User avatar */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {user?.name?.split(' ')[0] || 'Account'}
          </span>
        </div>
      </div>
    </header>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <Topbar sidebarCollapsed={collapsed} />

        {/* Main content — offset by sidebar + topbar */}
        <main
          className={cn(
            'pt-16 transition-all duration-300 min-h-screen',
            collapsed ? 'pl-[68px]' : 'pl-60'
          )}
        >
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* SkillGenie floating widget */}
        <SkillGenieWidget />
      </div>
    </ProtectedRoute>
  );
}
