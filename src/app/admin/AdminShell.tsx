'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Settings,
  Package,
  MessageSquare,
  LogOut,
  User,
  ChevronRight,
  Globe,
  Briefcase,
  Newspaper,
  Building2,
  FolderOpen,
} from 'lucide-react';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen bg-bmw-black flex items-center justify-center text-white">Authenticating...</div>;
  }

  const menuItems = [
    { label: '仪表盘', icon: LayoutDashboard, href: '/admin' },
    { label: '全站设置', icon: Settings, href: '/admin/settings' },
    { label: '关于我们', icon: Building2, href: '/admin/about' },
    { label: '产品管理', icon: Package, href: '/admin/products' },
    { label: '产品资料库', icon: FolderOpen, href: '/admin/product-documents' },
    { label: '工程案例', icon: Briefcase, href: '/admin/cases' },
    { label: '新闻动态', icon: Newspaper, href: '/admin/news' },
    { label: '询盘消息', icon: MessageSquare, href: '/admin/inquiries' },
  ];

  return (
    <div className="flex min-h-screen bg-bmw-lightgray">
      <aside className="w-64 bg-bmw-black text-white flex flex-col fixed h-full z-20 transition-all duration-300">
        <div className="p-8 border-b border-white/10">
          <Link href="/admin" className="text-2xl font-black tracking-widest text-white">
            SUCI<span className="text-bmw-blue">.</span>
          </Link>
          <p className="text-[10px] text-bmw-silver font-bold uppercase tracking-[0.2em] mt-2">Management</p>
        </div>

        <nav className="flex-1 py-10 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium tracking-wide uppercase transition-all group ${
                  isActive
                    ? 'bg-bmw-blue text-white'
                    : 'text-bmw-silver hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-bmw-silver group-hover:text-bmw-blue'}`} />
                  {item.label}
                </div>
                {isActive && <ChevronRight className="w-3 h-3" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center px-4 py-3 space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-bmw-graphite flex items-center justify-center border border-white/20">
              <User className="w-4 h-4 text-bmw-silver" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{session?.user?.email}</p>
              <p className="text-[10px] text-bmw-blue font-bold uppercase tracking-wider">Administrator</p>
            </div>
          </div>

          <Link href="/" className="flex items-center px-4 py-3 text-xs font-bold text-bmw-silver hover:text-white transition-colors group">
            <Globe className="w-4 h-4 mr-3" /> 查看前台网站
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center w-full px-4 py-3 text-xs font-bold text-bmw-red hover:bg-bmw-red/10 transition-all group"
          >
            <LogOut className="w-4 h-4 mr-3" /> 安全退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-10">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
