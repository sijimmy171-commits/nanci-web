import React from 'react';
import Link from 'next/link';
import { Save, ArrowLeft, Package } from 'lucide-react';
import ProductCategoryFields from '@/components/admin/ProductCategoryFields';
import { requireAdminSession } from '@/lib/admin-auth';
import { createProduct } from '../actions';

export default async function NewProductPage() {
  await requireAdminSession({ redirectToLogin: true });

  const translationReady = Boolean(process.env.OPENAI_API_KEY);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 bg-white border border-gray-200 hover:border-bmw-black transition-colors">
          <ArrowLeft className="w-4 h-4 text-bmw-black" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-bmw-black tracking-tight">新建产品</h1>
          <p className="text-gray-500 mt-2 font-light">填写产品详情，并同时准备英文主版本与自动翻译配置。</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm">
        <form action={createProduct} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-bmw-blue mb-2">
                <Package className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">中文主版本</h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">产品名称 *</label>
                <input required name="name" type="text" placeholder="例如：支柱绝缘子" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">型号 *</label>
                <input required name="model" type="text" placeholder="NC-35KV" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
              </div>

              <ProductCategoryFields />

              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">中文规格</label>
                <textarea name="specs" rows={4} placeholder="35kV, 10kN, 硅橡胶" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">中文详细描述 *</label>
                <textarea required name="description" rows={8} placeholder="请输入产品的技术参数、应用场景及补充说明..." className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all resize-none" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-bmw-blue mb-2">
                <Package className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">英文主版本</h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">英文产品名称</label>
                <input name="nameEn" type="text" placeholder="e.g. Post Insulator" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">英文规格</label>
                <textarea name="specsEn" rows={4} placeholder="35kV, 10kN, silicone rubber" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">英文详细描述</label>
                <textarea name="descriptionEn" rows={8} placeholder="Summarize the application, structure, and key value of this product in English..." className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all resize-none" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-bmw-lightgray/50 p-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">产品主图上传</label>
                <input type="file" name="imageFile" accept=".jpg,.jpeg,.png,.webp,image/png,image/jpeg,image/webp" className="w-full bg-white border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all file:mr-4 file:border-0 file:bg-bmw-black file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-white" />
              </div>
            </div>
            <label className="flex items-start gap-3">
              <input type="checkbox" name="autoTranslate" defaultChecked={translationReady} className="mt-1 h-4 w-4 accent-bmw-blue" />
              <span className="text-sm text-gray-700 leading-relaxed">
                保存时自动将中文与英文产品内容同步生成到 `es / fr / ar / ru / de / id / vi`。如果当前环境未配置 `OPENAI_API_KEY`，其他语言会继续回退到英文版本。
              </span>
            </label>
          </div>

          <div className="pt-8 border-t border-gray-100 flex justify-end">
            <button type="submit" className="group bg-bmw-black text-white px-12 py-5 font-bold text-xs tracking-widest uppercase flex items-center hover:bg-bmw-blue transition-all shadow-xl">
              <Save className="w-4 h-4 mr-3" />
              <span>立即发布产品</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
