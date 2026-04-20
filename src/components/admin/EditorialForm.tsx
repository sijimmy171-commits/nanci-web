import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import type { LocalizedEditorialRecord } from '@/lib/editorial';

type EditorialFormProps = {
  kind: 'case-study' | 'news-article';
  mode: 'create' | 'edit';
  action: (formData: FormData) => void | Promise<void>;
  backHref: string;
  initial?: LocalizedEditorialRecord | null;
};

function Field({
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
  type?: 'text' | 'number' | 'datetime-local';
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-bmw-black uppercase">{label}</label>
      <input
        required={required}
        type={type}
        name={name}
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
  rows = 4,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-bmw-black uppercase">{label}</label>
      <textarea
        required={required}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all resize-none"
      />
    </div>
  );
}

function formatDateTimeLocal(value: Date | null) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export default function EditorialForm({ kind, mode, action, backHref, initial }: EditorialFormProps) {
  const translationReady = Boolean(process.env.OPENAI_API_KEY);
  const isCaseStudy = kind === 'case-study';
  const title = isCaseStudy ? (mode === 'create' ? '新建案例' : '编辑案例') : mode === 'create' ? '新建新闻' : '编辑新闻';
  const description = isCaseStudy
    ? '维护案例列表页与详情页所需的中英文内容，可选自动翻译其他优先语言。'
    : '维护新闻列表页与详情页所需的中英文内容，可选自动翻译其他优先语言。';

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={backHref} className="p-2 bg-white border border-gray-200 hover:border-bmw-black transition-colors">
          <ArrowLeft className="w-4 h-4 text-bmw-black" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-bmw-black tracking-tight">{title}</h1>
          <p className="text-gray-500 mt-2 font-light">{description}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm">
        <form action={action} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-bmw-blue mb-2">
                <FileText className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">中文主版本</h3>
              </div>

              <Field label={isCaseStudy ? '案例标题 *' : '新闻标题 *'} name="titleZh" required defaultValue={initial?.title} />
              <Field label="分类 *" name="categoryZh" required defaultValue={initial?.category} />
              {isCaseStudy && <Field label="地区" name="regionZh" defaultValue={initial?.region} />}
              {isCaseStudy && <Field label="关联产品" name="productZh" defaultValue={initial?.product} />}
              <TextareaField label="摘要 *" name="summaryZh" rows={4} required defaultValue={initial?.summary} />
              <TextareaField label="正文内容 *" name="contentZh" rows={12} required defaultValue={initial?.content} />
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-bmw-blue mb-2">
                <FileText className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">英文主版本</h3>
              </div>

              <Field label={isCaseStudy ? 'Case Title' : 'News Title'} name="titleEn" defaultValue={initial?.translations.title.en} />
              <Field label="Category" name="categoryEn" defaultValue={initial?.translations.category.en} />
              {isCaseStudy && <Field label="Region" name="regionEn" defaultValue={initial?.translations.region.en} />}
              {isCaseStudy && <Field label="Related Product" name="productEn" defaultValue={initial?.translations.product.en} />}
              <TextareaField label="Summary" name="summaryEn" rows={4} defaultValue={initial?.translations.summary.en} />
              <TextareaField label="Content" name="contentEn" rows={12} defaultValue={initial?.translations.content.en} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Field label="Slug" name="slug" defaultValue={initial?.slug} />
            <Field label="封面图 URL" name="coverImageUrl" defaultValue={initial?.coverImageUrl} />
            <Field label="发布时间" name="publishedAt" type="datetime-local" defaultValue={formatDateTimeLocal(initial?.publishedAt ?? null)} />
            <Field label="排序值" name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} />
          </div>

          <TextareaField label="标签（英文逗号分隔）" name="tags" rows={3} defaultValue={initial?.tags.join(', ')} />

          <div className="rounded-2xl border border-gray-200 bg-bmw-lightgray/50 p-6 space-y-4">
            <label className="flex items-start gap-3">
              <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} className="mt-1 h-4 w-4 accent-bmw-blue" />
              <span className="text-sm text-gray-700 leading-relaxed">保存后立即作为前台已发布内容对外展示。</span>
            </label>

            <label className="flex items-start gap-3">
              <input type="checkbox" name="autoTranslate" defaultChecked={translationReady} className="mt-1 h-4 w-4 accent-bmw-blue" />
              <span className="text-sm text-gray-700 leading-relaxed">
                保存时自动将中英文内容同步生成到 `es / fr / ar / ru / de / id / vi`。如果当前环境未配置 `OPENAI_API_KEY`，其他语言将继续回退到英文版本。
              </span>
            </label>
          </div>

          <div className="pt-8 border-t border-gray-100 flex justify-end">
            <button type="submit" className="group bg-bmw-black text-white px-10 py-4 font-bold text-xs tracking-widest uppercase flex items-center hover:bg-bmw-blue transition-all shadow-xl">
              <Save className="w-4 h-4 mr-3" />
              <span>{mode === 'create' ? '保存并创建' : '保存修改'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
