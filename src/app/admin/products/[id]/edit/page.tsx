import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Save, ChevronLeft } from 'lucide-react';
import ProductCategoryFields from '@/components/admin/ProductCategoryFields';
import { requireAdminSession } from '@/lib/admin-auth';
import { getProductById, getProductTranslations } from '@/lib/product-content';
import { updateProduct } from '../../actions';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession({ redirectToLogin: true });

  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const translations = await getProductTranslations(product.id);
  const updateProductWithId = updateProduct.bind(null, product.id);
  const translationReady = Boolean(process.env.OPENAI_API_KEY);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/admin/products" className="flex items-center text-xs font-bold text-bmw-silver hover:text-bmw-black uppercase tracking-widest transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> 返回产品列表
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-bmw-black tracking-tight">编辑产品信息</h1>
        <p className="text-gray-500 mt-2 font-light">更新型号为 <span className="font-bold text-bmw-black">{product.model}</span> 的多语言产品内容。</p>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm">
        <form action={updateProductWithId} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-bmw-black uppercase tracking-widest">中文产品名称</label>
              <input required name="name" type="text" defaultValue={product.name} className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-bmw-black uppercase tracking-widest">英文产品名称</label>
              <input name="nameEn" type="text" defaultValue={translations.name.en} className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-bmw-black uppercase tracking-widest">产品型号</label>
              <input required name="model" type="text" defaultValue={product.model} className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-bmw-black uppercase tracking-widest">所属分类</label>
              <ProductCategoryFields
                initialPrimaryCategory={product.primaryCategory}
                initialSecondaryCategory={product.secondaryCategory}
                initialTertiaryCategory={product.tertiaryCategory}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-bmw-black uppercase tracking-widest">中文产品简介</label>
              <textarea name="description" rows={6} defaultValue={product.description || ''} className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-bmw-black uppercase tracking-widest">英文产品简介</label>
              <textarea name="descriptionEn" rows={6} defaultValue={translations.description.en} className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all resize-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-bmw-black uppercase tracking-widest">中文详细技术规格</label>
              <textarea name="specs" rows={8} placeholder="e.g. 35kV, 10kN, silicone rubber" defaultValue={product.specs || ''} className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm font-mono focus:outline-none focus:border-bmw-blue transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-bmw-black uppercase tracking-widest">英文详细技术规格</label>
              <textarea name="specsEn" rows={8} placeholder="e.g. Rated Voltage: 110kV" defaultValue={translations.specs.en} className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm font-mono focus:outline-none focus:border-bmw-blue transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-bmw-black uppercase tracking-widest">产品主图上传</label>
              <input type="file" name="imageFile" accept=".jpg,.jpeg,.png,.webp,image/png,image/jpeg,image/webp" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all file:mr-4 file:border-0 file:bg-bmw-black file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-white" />
              {product.imageUrl && (
                <div className="border border-gray-200 bg-white p-3 w-48 h-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-bmw-lightgray/50 p-6 space-y-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" name="autoTranslate" defaultChecked={translationReady} className="mt-1 h-4 w-4 accent-bmw-blue" />
              <span className="text-sm text-gray-700 leading-relaxed">
                保存时自动将当前中文与英文产品内容同步生成到 `es / fr / ar / ru / de / id / vi`。如果当前环境未配置 `OPENAI_API_KEY`，其他语言会继续回退到英文版本。
              </span>
            </label>
          </div>

          <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
            <p className="text-[10px] text-gray-400 italic">保存后，产品资料会同步更新到前台目录页与详情页。</p>
            <button type="submit" className="group bg-bmw-black text-white px-10 py-4 font-bold text-xs tracking-widest uppercase flex items-center hover:bg-bmw-blue transition-all shadow-xl">
              <Save className="w-4 h-4 mr-3" />
              <span>保存产品资料</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
