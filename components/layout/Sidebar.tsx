'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useSidebarStore } from '@/store/useSidebarStore';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/products',
    label: 'Produtos',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: '/sales',
    label: 'Vendas',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useSidebarStore();

  const showLabels = !collapsed || mobileOpen;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-slate-900',
          'transition-[width,transform] duration-300 ease-in-out',
          'lg:relative lg:z-auto lg:translate-x-0',
          collapsed ? 'lg:w-[70px] ' : 'lg:w-60',
          mobileOpen ? 'translate-x-0 ml-0' : '-translate-x-full lg:translate-x-0 lg:ml-5 mt-3 mb-3 rounded-2xl  '
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-white/[0.06] px-4',
            showLabels ? 'gap-3' : 'justify-center'
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          {showLabels && (
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-sm font-semibold text-white">PDV Mercado</p>
              <p className="truncate text-xs text-slate-500">Sistema de Vendas</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {showLabels && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Menu
            </p>
          )}
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    title={!showLabels ? item.label : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      !showLabels && 'justify-center',
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-300'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-indigo-400" />
                    )}
                    <span
                      className={cn(
                        isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    >
                      {item.icon}
                    </span>
                    {showLabels && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.06] p-3 space-y-0.5">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            title={!showLabels ? (isDark ? 'Modo Claro' : 'Modo Escuro') : undefined}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200',
              !showLabels && 'justify-center'
            )}
          >
            {isDark ? (
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            {showLabels && <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>}
          </button>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir menu' : undefined}
            className={cn(
              'hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200',
              !showLabels && 'justify-center'
            )}
          >
            <svg
              className={cn(
                'h-4 w-4 shrink-0 transition-transform duration-300',
                collapsed && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {showLabels && <span>Recolher</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
