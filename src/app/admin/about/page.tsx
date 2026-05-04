import React from 'react';
import { Info, Save } from 'lucide-react';
import { requireAdminSession } from '@/lib/admin-auth';
import { getAboutContent } from '@/lib/about-content';
import { updateAboutContent } from './actions';

function TextareaField({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-bmw-black uppercase">{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all resize-none"
      />
    </div>
  );
}

function InputField({
  label,
  name,
  defaultValue,
  type = 'text',
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-bmw-black uppercase">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all"
      />
    </div>
  );
}

export default async function AdminAboutPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession({ redirectToLogin: true });

  const params = await (searchParams ?? Promise.resolve({} as Record<string, string | string[] | undefined>));
  const about = await getAboutContent();
  const translationReady = Boolean(process.env.OPENAI_API_KEY);
  const timelineText = about.timeline
    .map((item) => [item.year, item.title.zh, item.title.en, item.description.zh, item.description.en].join(' | '))
    .join('\n');
  const editableReports = [...about.reports, { date: '', title: { zh: '', en: '' }, issuer: { zh: '', en: '' }, summary: { zh: '', en: '' }, imageUrl: '', fileUrl: '' }];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-bmw-black tracking-tight">关于我们</h1>
        <p className="text-gray-500 mt-2 font-light">维护公司介绍、发展历程、检测报告与合作伙伴内容。</p>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center text-bmw-blue bg-bmw-blue/5">
          <Info className="w-4 h-4 mr-2" />
          <span className="text-xs font-bold uppercase tracking-widest">
            时间线格式：年份 | 中文标题 | 英文标题 | 中文描述 | 英文描述
          </span>
        </div>

        {params.status === 'saved' && (
          <div className="mx-8 mt-8 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
            关于我们内容已保存。
          </div>
        )}

        <form action={updateAboutContent} className="p-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-bmw-silver uppercase tracking-[0.3em] border-b border-gray-100 pb-2">中文主版本</h3>
              <TextareaField label="Hero 标题" name="heroTitleZh" defaultValue={about.heroTitle.zh} rows={2} />
              <TextareaField label="Hero 描述" name="heroDescriptionZh" defaultValue={about.heroDescription.zh} rows={4} />
              <TextareaField label="公司简介标题" name="introTitleZh" defaultValue={about.intro.title.zh} rows={2} />
              <TextareaField label="公司简介正文" name="introBodyZh" defaultValue={about.intro.body.zh} rows={5} />
              <TextareaField label="能力优势标题" name="capabilityTitleZh" defaultValue={about.capability.title.zh} rows={2} />
              <TextareaField label="能力优势正文" name="capabilityBodyZh" defaultValue={about.capability.body.zh} rows={5} />
              <TextareaField label="企业文化标题" name="cultureTitleZh" defaultValue={about.culture.title.zh} rows={2} />
              <TextareaField label="企业文化正文" name="cultureBodyZh" defaultValue={about.culture.body.zh} rows={5} />
              <TextareaField label="发展历程标题" name="timelineTitleZh" defaultValue={about.timelineTitle.zh} rows={2} />
              <TextareaField label="检测报告标题" name="reportsTitleZh" defaultValue={about.reportsTitle.zh} rows={2} />
              <TextareaField label="检测报告说明" name="reportsDescriptionZh" defaultValue={about.reportsDescription.zh} rows={4} />
              <TextareaField label="合作伙伴标题" name="partnersTitleZh" defaultValue={about.partnersTitle.zh} rows={2} />
              <TextareaField label="合作伙伴描述" name="partnersDescriptionZh" defaultValue={about.partnersDescription.zh} rows={4} />
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-bmw-silver uppercase tracking-[0.3em] border-b border-gray-100 pb-2">英文主版本</h3>
              <TextareaField label="Hero Title" name="heroTitleEn" defaultValue={about.heroTitle.en} rows={2} />
              <TextareaField label="Hero Description" name="heroDescriptionEn" defaultValue={about.heroDescription.en} rows={4} />
              <TextareaField label="Intro Title" name="introTitleEn" defaultValue={about.intro.title.en} rows={2} />
              <TextareaField label="Intro Body" name="introBodyEn" defaultValue={about.intro.body.en} rows={5} />
              <TextareaField label="Capabilities Title" name="capabilityTitleEn" defaultValue={about.capability.title.en} rows={2} />
              <TextareaField label="Capabilities Body" name="capabilityBodyEn" defaultValue={about.capability.body.en} rows={5} />
              <TextareaField label="Culture Title" name="cultureTitleEn" defaultValue={about.culture.title.en} rows={2} />
              <TextareaField label="Culture Body" name="cultureBodyEn" defaultValue={about.culture.body.en} rows={5} />
              <TextareaField label="Timeline Title" name="timelineTitleEn" defaultValue={about.timelineTitle.en} rows={2} />
              <TextareaField label="Reports Title" name="reportsTitleEn" defaultValue={about.reportsTitle.en} rows={2} />
              <TextareaField label="Reports Description" name="reportsDescriptionEn" defaultValue={about.reportsDescription.en} rows={4} />
              <TextareaField label="Partners Title" name="partnersTitleEn" defaultValue={about.partnersTitle.en} rows={2} />
              <TextareaField label="Partners Description" name="partnersDescriptionEn" defaultValue={about.partnersDescription.en} rows={4} />
            </div>
          </div>

          <TextareaField label="发展历程 / Timeline" name="timelineText" defaultValue={timelineText} rows={8} />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-bmw-black">检测报告条目</h3>
                <p className="text-sm text-gray-500 mt-1">支持逐条编辑标题、机构、摘要、封面图和 PDF/外部链接。</p>
              </div>
            </div>

            <input type="hidden" name="reportsCount" value={editableReports.length} />

            <div className="space-y-6">
              {editableReports.map((report, index) => (
                <div key={`report-${index}`} className="border border-gray-200 rounded-2xl p-6 bg-bmw-lightgray/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-sm font-semibold text-bmw-black">报告 {String(index + 1).padStart(2, '0')}</div>
                    {index >= about.reports.length ? <span className="text-xs font-bold uppercase tracking-widest text-bmw-blue">新条目</span> : null}
                  </div>

                  <input type="hidden" name={`reports.${index}.existingImageUrl`} value={report.imageUrl} />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InputField label="日期" name={`reports.${index}.date`} defaultValue={report.date} />
                    <InputField label="PDF / 外部链接" name={`reports.${index}.fileUrl`} defaultValue={report.fileUrl} />
                    <InputField label="中文标题" name={`reports.${index}.titleZh`} defaultValue={report.title.zh} />
                    <InputField label="英文标题" name={`reports.${index}.titleEn`} defaultValue={report.title.en} />
                    <InputField label="中文机构" name={`reports.${index}.issuerZh`} defaultValue={report.issuer.zh} />
                    <InputField label="英文机构" name={`reports.${index}.issuerEn`} defaultValue={report.issuer.en} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mt-6">
                    <div className="space-y-6">
                      <TextareaField label="中文摘要" name={`reports.${index}.summaryZh`} defaultValue={report.summary.zh} rows={4} />
                      <TextareaField label="英文摘要" name={`reports.${index}.summaryEn`} defaultValue={report.summary.en} rows={4} />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-bmw-black uppercase">封面图片</label>
                      <div className="relative aspect-[4/5] border border-gray-200 bg-white overflow-hidden">
                        {report.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={report.imageUrl} alt={report.title.zh || report.title.en || `Report ${index + 1}`} className="h-full w-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs uppercase tracking-widest text-gray-400">No Image</div>
                        )}
                      </div>
                      <input type="file" name={`reports.${index}.image`} accept=".jpg,.jpeg,.png,.webp" className="block w-full text-sm text-gray-600 file:mr-4 file:border-0 file:bg-bmw-black file:px-4 file:py-3 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-white hover:file:bg-bmw-blue" />
                      <p className="text-xs text-gray-400 leading-6">不上传时保留当前图片。建议比例接近 A4 报告封面。</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <TextareaField label="合作伙伴（逗号分隔）" name="partnersText" defaultValue={about.partners.join(', ')} rows={3} />

          <div className="rounded-2xl border border-gray-200 bg-bmw-lightgray/50 p-6 space-y-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" name="autoTranslate" defaultChecked={translationReady} className="mt-1 h-4 w-4 accent-bmw-blue" />
              <span className="text-sm text-gray-700 leading-relaxed">
                保存时自动同步生成 `es / fr / ar / ru / de / id / vi` 版本。检测报告图片与链接不做翻译，其余多语言字段按现有逻辑同步。
              </span>
            </label>
          </div>

          <div className="pt-8 border-t border-gray-100 flex justify-end">
            <button type="submit" className="group bg-bmw-black text-white px-10 py-4 font-bold text-xs tracking-widest uppercase flex items-center hover:bg-bmw-blue transition-all shadow-xl">
              <Save className="w-4 h-4 mr-3" />
              <span>保存关于我们</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
