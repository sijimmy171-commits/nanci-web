import React from 'react';
import Link from 'next/link';
import { Edit2, ExternalLink, Package, Plus, Search } from 'lucide-react';
import { listProducts, type ProductRecord } from '@/lib/product-content';
import {
  getAllSpecificCategoryOptions,
  getCategoryTrailLabels,
  getPrimaryCategories,
  getSpecificCategoryOptions,
  isPrimaryCategoryKey,
  parseSpecificCategory,
  type ProductPrimaryCategoryKey,
} from '@/lib/product-taxonomy';
import DeleteProductButton from './DeleteButton';

type SearchParams = Promise<{
  q?: string | string[] | undefined;
  primary?: string | string[] | undefined;
  specific?: string | string[] | undefined;
  status?: string | string[] | undefined;
}>;

type CategoryAuditStatus = ProductRecord['categoryStatus'] | 'all';

const auditStatusCopy: Record<ProductRecord['categoryStatus'], { label: string; className: string }> = {
  structured: {
    label: '已归类',
    className: 'bg-green-50 text-green-700',
  },
  legacy: {
    label: '旧分类兼容',
    className: 'bg-amber-50 text-amber-700',
  },
  unmapped: {
    label: '需重新归类',
    className: 'bg-bmw-red/10 text-bmw-red',
  },
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getAuditStatus(value: string | string[] | undefined): CategoryAuditStatus {
  const status = getSingleParam(value);
  return status === 'structured' || status === 'legacy' || status === 'unmapped' ? status : 'all';
}

function filterProducts(
  products: ProductRecord[],
  filters: {
    query: string;
    primaryCategory: ProductPrimaryCategoryKey | null;
    specific: string;
    auditStatus: CategoryAuditStatus;
  }
) {
  const selectedSpecific = parseSpecificCategory(filters.specific);
  const query = filters.query.toLowerCase();

  return products.filter((product) => {
    const categoryText = [...getCategoryTrailLabels(product, 'zh'), product.category].join(' ').toLowerCase();
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.model.toLowerCase().includes(query) ||
      categoryText.includes(query);
    const matchesPrimary = !filters.primaryCategory || product.primaryCategory === filters.primaryCategory;
    const matchesSpecific =
      !filters.specific ||
      (product.secondaryCategory === selectedSpecific.secondaryCategory &&
        (selectedSpecific.tertiaryCategory ? product.tertiaryCategory === selectedSpecific.tertiaryCategory : true));
    const matchesAuditStatus = filters.auditStatus === 'all' || product.categoryStatus === filters.auditStatus;

    return matchesQuery && matchesPrimary && matchesSpecific && matchesAuditStatus;
  });
}

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = getSingleParam(params.q)?.trim() ?? '';
  const primaryParam = getSingleParam(params.primary);
  const primaryCategory = isPrimaryCategoryKey(primaryParam) ? primaryParam : null;
  const specific = getSingleParam(params.specific) ?? '';
  const auditStatus = getAuditStatus(params.status);

  const products = await listProducts();
  const filteredProducts = filterProducts(products, {
    query,
    primaryCategory,
    specific,
    auditStatus,
  });
  const primaryOptions = getPrimaryCategories('zh');
  const specificOptions = primaryCategory
    ? getSpecificCategoryOptions(primaryCategory, 'zh').map((option) => ({ value: option.value, label: option.label }))
    : getAllSpecificCategoryOptions('zh').map((option) => ({ value: option.value, label: option.labelWithPrimary }));
  const auditCounts = products.reduce(
    (counts, product) => {
      counts[product.categoryStatus] += 1;
      return counts;
    },
    { structured: 0, legacy: 0, unmapped: 0 }
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-bmw-black tracking-tight">产品目录管理</h1>
          <p className="text-gray-500 mt-2 font-light">发布、编辑和下架官网展示的产品资料，并校对专业分类归档。</p>
        </div>
        <Link
          href="/admin/products/new"
          className="group bg-bmw-black text-white px-8 py-3 font-bold text-xs tracking-widest uppercase flex items-center hover:bg-bmw-blue transition-all shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" /> 新建产品
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-5">
          <div className="text-2xl font-black text-bmw-black">{products.length}</div>
          <div className="mt-2 text-[10px] font-bold text-bmw-silver uppercase tracking-[0.2em]">全部产品</div>
        </div>
        <div className="bg-green-50 border border-green-100 p-5">
          <div className="text-2xl font-black text-green-700">{auditCounts.structured}</div>
          <div className="mt-2 text-[10px] font-bold text-green-700 uppercase tracking-[0.2em]">已归类</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-5">
          <div className="text-2xl font-black text-amber-700">{auditCounts.legacy}</div>
          <div className="mt-2 text-[10px] font-bold text-amber-700 uppercase tracking-[0.2em]">旧分类兼容</div>
        </div>
        <div className="bg-bmw-red/5 border border-bmw-red/10 p-5">
          <div className="text-2xl font-black text-bmw-red">{auditCounts.unmapped}</div>
          <div className="mt-2 text-[10px] font-bold text-bmw-red uppercase tracking-[0.2em]">需重新归类</div>
        </div>
      </div>

      <form action="/admin/products" className="bg-white border border-gray-200 p-4 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="搜索产品名称、型号或分类..."
            className="w-full pl-10 pr-4 py-3 bg-bmw-lightgray border border-gray-200 text-sm focus:outline-none focus:border-bmw-blue transition-all"
          />
        </div>

        <select
          name="primary"
          defaultValue={primaryCategory ?? ''}
          className="bg-bmw-lightgray border border-gray-200 px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-bmw-blue"
        >
          <option value="">全部一级分类</option>
          {primaryOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          name="specific"
          defaultValue={specific}
          className="bg-bmw-lightgray border border-gray-200 px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-bmw-blue"
        >
          <option value="">全部具体分类</option>
          {specificOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={auditStatus}
          className="bg-bmw-lightgray border border-gray-200 px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-bmw-blue"
        >
          <option value="all">全部归档状态</option>
          <option value="structured">已归类</option>
          <option value="legacy">旧分类兼容</option>
          <option value="unmapped">需重新归类</option>
        </select>

        <div className="flex gap-2">
          <button type="submit" className="bg-bmw-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-bmw-blue transition-colors">
            筛选
          </button>
          <Link href="/admin/products" className="border border-gray-200 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:border-bmw-black hover:text-bmw-black transition-colors">
            重置
          </Link>
        </div>
      </form>

      <div className="text-xs text-gray-500">
        当前显示 <span className="font-bold text-bmw-black">{filteredProducts.length}</span> / {products.length} 个产品。
        {auditCounts.legacy + auditCounts.unmapped > 0 && (
          <span className="ml-2 text-amber-700">建议优先编辑“旧分类兼容”和“需重新归类”的产品，保存后会写入新的专业分类字段。</span>
        )}
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-[10px] font-black text-bmw-silver uppercase tracking-[0.2em]">产品信息</th>
              <th className="px-6 py-4 text-[10px] font-black text-bmw-silver uppercase tracking-[0.2em]">分类</th>
              <th className="px-6 py-4 text-[10px] font-black text-bmw-silver uppercase tracking-[0.2em]">型号</th>
              <th className="px-6 py-4 text-[10px] font-black text-bmw-silver uppercase tracking-[0.2em]">更新时间</th>
              <th className="px-6 py-4 text-[10px] font-black text-bmw-silver uppercase tracking-[0.2em] text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-light italic">
                  当前筛选条件下暂无产品。
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const trail = getCategoryTrailLabels(product, 'zh');
                const audit = auditStatusCopy[product.categoryStatus];

                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-bmw-lightgray border border-gray-100 flex items-center justify-center mr-4 overflow-hidden">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-bmw-silver" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-bmw-black group-hover:text-bmw-blue transition-colors line-clamp-1">{product.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-1">ID: {product.id.substring(0, 8)}...</div>
                          <div className="mt-2 flex gap-2">
                            {product.imageUrl && <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded-sm">图片</span>}
                            {product.catalogUrl && <span className="text-[10px] px-2 py-1 bg-green-50 text-green-700 font-bold rounded-sm">PDF</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-gray-600 font-medium">
                      <div>{trail.join(' / ') || product.category || '未分类'}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`text-[10px] px-2 py-1 font-bold rounded-sm ${audit.className}`}>{audit.label}</span>
                        {product.categoryStatus !== 'structured' && product.category && (
                          <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-500 rounded-sm">旧值：{product.category}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-2 py-1 bg-bmw-lightgray border border-gray-200 text-[10px] font-bold text-bmw-black rounded-sm">
                        {product.model}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-xs text-gray-400">{new Date(product.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/zh/products/${product.id}`} className="p-2 text-bmw-silver hover:text-bmw-black transition-colors" title="查看前台详情">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link href={`/admin/products/${product.id}/edit`} className="p-2 text-bmw-silver hover:text-bmw-blue transition-colors" title="编辑产品">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton id={product.id} name={product.name} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
