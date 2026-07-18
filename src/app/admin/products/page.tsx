import React from 'react';
import Link from 'next/link';
import { Edit2, ExternalLink, Package, Plus, Search } from 'lucide-react';
import { requireAdminSession } from '@/lib/admin-auth';
import { listProducts } from '@/lib/product-content';
import {
  getProductCategories,
  getProductCategoryLabel,
  isProductCategoryKey,
} from '@/lib/product-taxonomy';
import DeleteProductButton from './DeleteButton';

type SearchParams = Promise<{
  q?: string | string[];
  category?: string | string[];
}>;

export default async function AdminProductsPage({ searchParams }: { searchParams?: SearchParams }) {
  await requireAdminSession({ redirectToLogin: true });

  const params: Awaited<SearchParams> = await (searchParams ?? Promise.resolve({}));
  const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
  const categoryValue = Array.isArray(params.category) ? params.category[0] : params.category;
  const query = queryValue?.trim().toLowerCase() ?? '';
  const activeCategory = isProductCategoryKey(categoryValue) ? categoryValue : '';
  const products = await listProducts();
  const categories = getProductCategories('zh');
  const filteredProducts = products.filter((product) => {
    const matchesCategory = !activeCategory || product.productCategory === activeCategory;
    const matchesQuery = !query
      || product.name.toLowerCase().includes(query)
      || product.model.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bmw-black tracking-tight">产品管理</h1>
          <p className="text-gray-500 mt-2 font-light">维护六大产品分类中的图片、名称、型号和简要规格。</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center justify-center bg-bmw-black text-white px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-bmw-blue transition-colors">
          <Plus className="w-4 h-4 mr-2" /> 新建产品
        </Link>
      </div>

      <form action="/admin/products" className="grid grid-cols-1 gap-4 border border-gray-200 bg-white p-5 md:grid-cols-[1fr_16rem_auto]">
        <label className="relative block">
          <span className="sr-only">搜索产品</span>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input name="q" defaultValue={queryValue ?? ''} placeholder="搜索产品名称或型号" className="w-full border border-gray-200 bg-bmw-lightgray py-3 pl-11 pr-4 text-sm focus:border-bmw-blue focus:outline-none" />
        </label>
        <select name="category" defaultValue={activeCategory} className="w-full border border-gray-200 bg-bmw-lightgray px-4 py-3 text-sm focus:border-bmw-blue focus:outline-none">
          <option value="">全部分类</option>
          {categories.map((category) => (
            <option key={category.key} value={category.key}>{category.label}</option>
          ))}
        </select>
        <button type="submit" className="bg-bmw-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-bmw-blue transition-colors">筛选</button>
      </form>

      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="border-b border-gray-200 bg-bmw-lightgray/60">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-bmw-silver">产品</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-bmw-silver">分类</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-bmw-silver">型号</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-bmw-silver">更新时间</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-bmw-silver">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-20 text-center text-sm text-gray-400">当前筛选条件下暂无产品。</td></tr>
            ) : filteredProducts.map((product) => (
              <tr key={product.id} className="group hover:bg-gray-50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden border border-gray-100 bg-bmw-lightgray">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
                      ) : <Package className="h-5 w-5 text-bmw-silver" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-bmw-black">{product.name}</div>
                      <div className="mt-1 max-w-xs truncate text-xs text-gray-400">{product.specs || '暂无规格'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">{getProductCategoryLabel(product.productCategory, 'zh') || '未分类'}</td>
                <td className="px-6 py-5"><span className="border border-gray-200 bg-bmw-lightgray px-2 py-1 text-[10px] font-bold text-bmw-black">{product.model}</span></td>
                <td className="px-6 py-5 text-xs text-gray-400">{new Date(product.updatedAt).toLocaleDateString('zh-CN')}</td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {product.productCategory && (
                      <Link href={`/zh/products?category=${product.productCategory}`} className="p-2 text-bmw-silver hover:text-bmw-black" title="查看所属分类">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                    <Link href={`/admin/products/${product.id}/edit`} className="p-2 text-bmw-silver hover:text-bmw-blue" title="编辑产品">
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
