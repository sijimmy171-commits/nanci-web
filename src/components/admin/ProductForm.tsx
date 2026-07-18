'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Save } from 'lucide-react';
import ProductCategoryFields from '@/components/admin/ProductCategoryFields';
import { createProductImageUploadTargetAction, type ProductFormState } from '@/app/admin/products/actions';

type ProductFormInitial = {
  id: string;
  name: string;
  model: string;
  specs: string | null;
  imageUrl: string | null;
  productCategory: string | null;
  translations: {
    name: { en: string };
    specs: { en: string };
  };
};

type Props = {
  mode: 'create' | 'edit';
  action: (formData: FormData) => Promise<ProductFormState>;
  initial?: ProductFormInitial | null;
  translationReady: boolean;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold text-bmw-black uppercase">{children}</label>;
}

function SubmitButton({ mode, pending }: { mode: 'create' | 'edit'; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="group bg-bmw-black text-white px-12 py-5 font-bold text-xs tracking-widest uppercase flex items-center hover:bg-bmw-blue transition-all shadow-xl disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      <Save className="w-4 h-4 mr-3" />
      <span>{pending ? '保存中...' : mode === 'create' ? '立即发布产品' : '保存产品资料'}</span>
    </button>
  );
}

export default function ProductForm({ mode, action, initial, translationReady }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadImageDirectly(file: File) {
    const target = await createProductImageUploadTargetAction({
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
      const imageFile = formData.get('imageFile');

      if (imageFile instanceof File && imageFile.size > 0) {
        const imageUrl = await uploadImageDirectly(imageFile);
        formData.delete('imageFile');
        formData.set('imageUrl', imageUrl);
      }

      const result = await action(formData);
      if (!result.success) {
        setError(result.error || '产品保存失败，请稍后重试。');
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : '产品保存失败，请检查内容后重试。');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={mode === 'edit' ? 'max-w-4xl space-y-8' : 'space-y-8'}>
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 bg-white border border-gray-200 hover:border-bmw-black transition-colors">
          <ArrowLeft className="w-4 h-4 text-bmw-black" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-bmw-black tracking-tight">{mode === 'create' ? '新建产品' : '编辑产品信息'}</h1>
          <p className="text-gray-500 mt-2 font-light">
            {mode === 'create' ? '填写产品详情，并同时准备英文主版本与自动翻译配置。' : `更新型号为 ${initial?.model ?? ''} 的多语言产品内容。`}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-bmw-blue mb-2">
                <Package className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">中文主版本</h3>
              </div>

              <div className="space-y-2">
                <FieldLabel>产品名称 *</FieldLabel>
                <input required name="name" type="text" defaultValue={initial?.name ?? ''} placeholder="例如：支柱绝缘子" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
              </div>

              <div className="space-y-2">
                <FieldLabel>型号 *</FieldLabel>
                <input required name="model" type="text" defaultValue={initial?.model ?? ''} placeholder="NC-35KV" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
              </div>

              <ProductCategoryFields
                initialProductCategory={initial?.productCategory}
              />

              <div className="space-y-2">
                <FieldLabel>中文简要规格 *</FieldLabel>
                <textarea required name="specs" rows={3} defaultValue={initial?.specs ?? ''} placeholder="例如：35kV / 10kN / 硅橡胶" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all resize-none" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-bmw-blue mb-2">
                <Package className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">英文主版本</h3>
              </div>

              <div className="space-y-2">
                <FieldLabel>英文产品名称</FieldLabel>
                <input name="nameEn" type="text" defaultValue={initial?.translations.name.en ?? ''} placeholder="e.g. Post Insulator" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
              </div>

              <div className="space-y-2">
                <FieldLabel>英文简要规格</FieldLabel>
                <textarea name="specsEn" rows={3} defaultValue={initial?.translations.specs.en ?? ''} placeholder="e.g. 35kV / 10kN / silicone rubber" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all resize-none" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-bmw-lightgray/50 p-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <FieldLabel>产品主图上传</FieldLabel>
                <input required={mode === 'create'} type="file" name="imageFile" accept=".jpg,.jpeg,.png,.webp,image/png,image/jpeg,image/webp" className="w-full bg-white border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all file:mr-4 file:border-0 file:bg-bmw-black file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-white" />
                {initial?.imageUrl && (
                  <div className="border border-gray-200 bg-white p-3 w-48 h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={initial.imageUrl} alt={initial.name} className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
            <label className="flex items-start gap-3">
              <input type="checkbox" name="autoTranslate" defaultChecked={translationReady} className="mt-1 h-4 w-4 accent-bmw-blue" />
              <span className="text-sm text-gray-700 leading-relaxed">
                保存时自动将中文与英文产品内容同步生成到 es / fr / ar / ru / de / id / vi。如果当前环境未配置 OPENAI_API_KEY，其他语言会继续回退到英文版本。
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
