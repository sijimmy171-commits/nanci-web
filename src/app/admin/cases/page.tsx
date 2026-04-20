import React from 'react';
import Link from 'next/link';
import { Briefcase, Edit2, ExternalLink, Plus } from 'lucide-react';
import { defaultLocale } from '@/lib/i18n';
import { listEditorialRecords } from '@/lib/editorial';
import DeleteCaseButton from './DeleteButton';

export default async function AdminCasesPage() {
  const cases = await listEditorialRecords('case-study');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-bmw-black tracking-tight">工程案例</h1>
          <p className="text-gray-500 mt-2 font-light">管理案例列表与案例详情页内容。</p>
        </div>
        <Link href="/admin/cases/new" className="group bg-bmw-black text-white px-8 py-3 font-bold text-xs tracking-widest uppercase flex items-center hover:bg-bmw-blue transition-all shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> 新建案例
        </Link>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-[10px] font-black text-bmw-silver uppercase tracking-[0.2em]">案例</th>
              <th className="px-6 py-4 text-[10px] font-black text-bmw-silver uppercase tracking-[0.2em]">分类</th>
              <th className="px-6 py-4 text-[10px] font-black text-bmw-silver uppercase tracking-[0.2em]">地区</th>
              <th className="px-6 py-4 text-[10px] font-black text-bmw-silver uppercase tracking-[0.2em]">状态</th>
              <th className="px-6 py-4 text-[10px] font-black text-bmw-silver uppercase tracking-[0.2em] text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-light italic">
                  暂无案例，请先创建第一条案例内容。
                </td>
              </tr>
            ) : (
              cases.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-bmw-lightgray border border-gray-100 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-bmw-silver" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-bmw-black">{item.title}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-1">/{item.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-600">{item.category}</td>
                  <td className="px-6 py-6 text-sm text-gray-600">{item.region || '-'}</td>
                  <td className="px-6 py-6 text-xs">
                    <span className={`px-2 py-1 rounded-sm font-bold ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/${defaultLocale}/cases/${item.slug}`} className="p-2 text-bmw-silver hover:text-bmw-black transition-colors" title="查看前台">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/cases/${item.id}/edit`} className="p-2 text-bmw-silver hover:text-bmw-blue transition-colors" title="编辑案例">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <DeleteCaseButton id={item.id} title={item.title} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
