'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import { createProductDocumentUploadTargetAction, type ProductDocumentFormState } from '@/app/admin/product-documents/actions';
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

function SubmitButton({ mode, pending }: { mode: 'create' | 'edit'; pending: boolean }) {
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
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function uploadFileDirectly(file: File) {
    const target = await createProductDocumentUploadTargetAction({
      filename: file.name,
      contentType: file.type,
      size: file.size,
    });

    const uploadBody = new FormData();
    uploadBody.append('cacheControl', '31536000');
    uploadBody.append('', file);

    const response = await fetch(target.signedUrl, {
      method: 'PUT',
      headers: {
        'x-upsert': 'false',
      },
      body: uploadBody,
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`Supabase upload failed (${response.status}): ${details || response.statusText}`);
    }

    return target.fileUrl;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const formData = new FormData(form);
      const file = formData.get('file');

      if (file instanceof File && file.size > 0) {
        const fileUrl = await uploadFileDirectly(file);
        formData.delete('file');
        formData.set('fileUrl', fileUrl);
      } else if (mode === 'create') {
        throw new Error('请上传 PDF 文件。');
      }

      const result = await action({ error: null }, formData);
      if (result.error) {
        setError(result.error);
        return;
      }

      router.push('/admin/product-documents');
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : '保存失败，请检查资料内容后重试。');
    } finally {
      setPending(false);
    }
  }

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
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
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

          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <div className="pt-8 border-t border-gray-100 flex justify-end">
            <SubmitButton mode={mode} pending={pending} />
          </div>
        </form>
      </div>
    </div>
  );
}
