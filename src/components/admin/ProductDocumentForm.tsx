'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import type { ProductDocumentFormState } from '@/app/admin/product-documents/actions';
import type { LocalizedProductDocumentRecord } from '@/lib/product-documents';

type Props = {
  mode: 'create' | 'edit';
  action: (state: ProductDocumentFormState, formData: FormData) => Promise<ProductDocumentFormState>;
  initial?: LocalizedProductDocumentRecord | null;
  translationReady: boolean;
};

function TextField({
  label,
  name,
  defaultValue,
  required = false,
  type = 'text',
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  required?: boolean;
  type?: 'text' | 'number';
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-bmw-black uppercase">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all"
      />
    </div>
  );
}

function TextareaField({
  label,
  name,
  defaultValue,
  required = false,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-bmw-black uppercase">{label}</label>
      <textarea
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? ''}
        className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all resize-none"
      />
    </div>
  );
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group bg-bmw-black text-white px-10 py-4 font-bold text-xs tracking-widest uppercase flex items-center hover:bg-bmw-blue transition-all shadow-xl disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      <Save className="w-4 h-4 mr-3" />
      <span>{pending ? '保存中...' : mode === 'create' ? '保存资料' : '保存修改'}</span>
    </button>
  );
}

export default function ProductDocumentForm({ mode, action, initial, translationReady }: Props) {
  const [state, formAction] = useActionState(action, { error: null });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/product-documents" className="p-2 bg-white border border-gray-200 hover:border-bmw-black transition-colors">
          <ArrowLeft className="w-4 h-4 text-bmw-black" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-bmw-black tracking-tight">{mode === 'create' ? '新建产品资料' : '编辑产品资料'}</h1>
          <p className="text-gray-500 mt-2 font-light">维护产品中心底部弹窗中的 PDF 文档列表。</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm">
        <form action={formAction} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-bmw-blue mb-2">
                <FileText className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">中文主版本</h3>
              </div>
              <TextField label="文档标题 *" name="titleZh" defaultValue={initial?.title} required />
              <TextareaField label="文档简介 *" name="summaryZh" defaultValue={initial?.summary} required rows={6} />
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-bmw-blue mb-2">
                <FileText className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">英文主版本</h3>
              </div>
              <TextField label="Document Title" name="titleEn" defaultValue={initial?.translations.title.en} />
              <TextareaField label="Document Summary" name="summaryEn" defaultValue={initial?.translations.summary.en} rows={6} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-bmw-black uppercase">PDF 文件</label>
              <input
                type="file"
                name="file"
                accept=".pdf,application/pdf"
                required={mode === 'create'}
                className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all file:mr-4 file:border-0 file:bg-bmw-black file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-white"
              />
              {initial?.fileUrl && (
                <Link href={initial.fileUrl} target="_blank" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-bmw-blue hover:text-bmw-black transition-colors">
                  查看当前 PDF
                </Link>
              )}
            </div>

            <div className="space-y-6">
              <TextField label="排序值" name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} />
              <label className="flex items-start gap-3">
                <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} className="mt-1 h-4 w-4 accent-bmw-blue" />
                <span className="text-sm text-gray-700 leading-relaxed">发布后会出现在产品中心底部的资料列表弹窗里。</span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-bmw-lightgray/50 p-6 space-y-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" name="autoTranslate" defaultChecked={translationReady} className="mt-1 h-4 w-4 accent-bmw-blue" />
              <span className="text-sm text-gray-700 leading-relaxed">
                保存时自动将中英文资料简介同步生成到 es / fr / ar / ru / de / id / vi。如果当前环境未配置 OPENAI_API_KEY，其他语言将继续回退到英文版本。
              </span>
            </label>
          </div>

          {state.error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert" aria-live="polite">
              {state.error}
            </div>
          )}

          <div className="pt-8 border-t border-gray-100 flex justify-end">
            <SubmitButton mode={mode} />
          </div>
        </form>
      </div>
    </div>
  );
}
