'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Users, Package, MessageSquare, TrendingUp, ArrowUpRight, Settings, FolderOpen } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session } = useSession();

  const stats = [
    { label: '在线产品', value: '动态目录', icon: Package, color: 'text-bmw-blue', bg: 'bg-bmw-blue/10' },
    { label: '询盘中心', value: '待跟进', icon: MessageSquare, color: 'text-bmw-red', bg: 'bg-bmw-red/10' },
    { label: '内容更新', value: '多语言', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: '后台用户', value: 'ADMIN', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const quickActions = [
    { label: '发布新产品', href: '/admin/products/new', icon: Package },
    { label: '维护产品资料库', href: '/admin/product-documents', icon: FolderOpen },
    { label: '查看询盘消息', href: '/admin/inquiries', icon: MessageSquare },
    { label: '修改全站设置', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-bmw-black tracking-tight">你好，{session?.user?.email?.split('@')[0] ?? '管理员'}</h1>
          <p className="text-gray-500 mt-2 font-light">欢迎回到苏州南瓷管理后台。这里是今天的业务概览。</p>
        </div>
        <div className="text-xs font-bold text-bmw-silver uppercase tracking-widest bg-white px-4 py-2 border border-gray-200">
          Management Console
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-green-500 flex items-center">
                Live <ArrowUpRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            <div className="text-2xl font-black text-bmw-black">{stat.value}</div>
            <div className="text-xs font-bold text-bmw-silver uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-bmw-black uppercase tracking-wider text-sm flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-bmw-blue" /> 工作台入口
            </h3>
            <Link href="/admin/inquiries" className="text-[10px] font-bold text-bmw-blue uppercase tracking-widest hover:underline">
              查看询盘
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-50">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center text-sm font-bold text-bmw-black group-hover:text-bmw-blue transition-colors">
                      <action.icon className="w-4 h-4 mr-2" /> {action.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">进入对应后台模块继续维护官网内容。</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-bmw-silver group-hover:text-bmw-blue group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-bmw-black p-8 text-white">
            <h3 className="text-xs font-bold text-bmw-blue tracking-[0.2em] uppercase mb-6">下一步建议</h3>
            <div className="space-y-4 text-sm text-bmw-silver leading-relaxed">
              <p>1. 校对旧产品分类并保存为新的专业分类结构。</p>
              <p>2. 确认上传资源在生产环境中的持久化策略。</p>
              <p>3. 整理 Vercel、数据库、认证、SMTP 等生产环境变量。</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-8 shadow-sm">
            <h3 className="text-xs font-bold text-bmw-black tracking-[0.2em] uppercase mb-6">系统状态</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">PostgreSQL 数据库</span>
                <div className="flex items-center text-[10px] font-bold text-green-500 uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" /> 已接入
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">后台权限保护</span>
                <div className="flex items-center text-[10px] font-bold text-green-500 uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" /> 已启用
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">多语言内容</span>
                <div className="flex items-center text-[10px] font-bold text-green-500 uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" /> 运行中
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
