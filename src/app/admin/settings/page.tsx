import React from 'react';
import { Save, Info } from 'lucide-react';
import { requireAdminSession } from '@/lib/admin-auth';
import { getSiteConfig } from '@/lib/site-config';
import { getSiteContentOverrides } from '@/lib/site-content-overrides';
import { updateSiteConfig } from './actions';

function TextareaField({
  label,
  name,
  defaultValue,
  rows = 3,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-bmw-black uppercase">{label}</label>
      <textarea name={name} rows={rows} defaultValue={defaultValue} className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
      {hint && <p className="text-xs text-gray-400 leading-relaxed">{hint}</p>}
    </div>
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession({ redirectToLogin: true });

  const translationReady = Boolean(process.env.OPENAI_API_KEY);
  const [params, config, overrides] = await Promise.all([
    searchParams ?? Promise.resolve({} as Record<string, string | string[] | undefined>),
    getSiteConfig(),
    getSiteContentOverrides(),
  ]);
  const status = typeof params.status === 'string' ? params.status : '';
  const translation = typeof params.translation === 'string' ? params.translation : '';
  const showSaved = status === 'saved';
  const qrPreviewSrc = config?.wechatQrUrl || '/wechat-qr-placeholder.svg';
  const heroSlide0 = overrides.home.heroSlides[0];
  const heroSlide1 = overrides.home.heroSlides[1];
  const heroSlide0TitleZh = heroSlide0.title.zh || config?.heroTitle || '';
  const heroSlide0SubtitleZh = heroSlide0.subtitle.zh || config?.heroSub || '';

  const feedbackMessage =
    translation === 'done'
      ? '配置已保存，并已自动同步生成其他优先语言版本。'
      : translation === 'fallback'
        ? '配置已保存。当前未完成自动翻译，其他语言继续回退到英文版本。'
        : translation === 'error'
          ? '配置已保存，但自动翻译失败。当前其他语言继续回退到英文版本。'
          : '配置已保存。';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-bmw-black tracking-tight">全站基础设置</h1>
        <p className="text-gray-500 mt-2 font-light">管理前台默认英文站与中文站共用的站点内容，并集中维护中英文公共文案。</p>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center text-bmw-blue bg-bmw-blue/5">
          <Info className="w-4 h-4 mr-2" />
          <span className="text-xs font-bold uppercase tracking-widest">
            中文与英文在同一处维护；保存时可选择自动同步到西语、法语、阿语、俄语、德语、印尼语、越南语。当前翻译服务状态：{translationReady ? '已配置' : '未配置，将继续回退英文'}。
          </span>
        </div>

        {showSaved && (
          <div className="mx-8 mt-8 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
            {feedbackMessage}
          </div>
        )}

        <form action={updateSiteConfig} className="p-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-bmw-silver uppercase tracking-[0.3em] border-b border-gray-100 pb-2">首页 Hero 与联系方式</h3>
              <TextareaField label="第一张 Banner 主标题（中文）" name="heroSlide0TitleZh" defaultValue={heroSlide0TitleZh} rows={2} hint="显示在中文首页第一张滚动 Banner 的大标题。" />
              <TextareaField label="第一张 Banner 主标题（英文）" name="heroSlide0TitleEn" defaultValue={heroSlide0.title.en} rows={2} hint="显示在英文首页第一张滚动 Banner 的大标题。" />
              <TextareaField label="第一张 Banner 副标题（中文）" name="heroSlide0SubtitleZh" defaultValue={heroSlide0SubtitleZh} rows={4} hint="显示在中文首页第一张滚动 Banner 的说明文字。" />
              <TextareaField label="第一张 Banner 副标题（英文）" name="heroSlide0SubtitleEn" defaultValue={heroSlide0.subtitle.en} rows={4} hint="显示在英文首页第一张滚动 Banner 的说明文字。" />
              <TextareaField label="第二张 Banner 主标题（中文）" name="heroSlide1TitleZh" defaultValue={heroSlide1.title.zh} rows={2} hint="显示在中文首页第二张滚动 Banner 的大标题。" />
              <TextareaField label="第二张 Banner 主标题（英文）" name="heroSlide1TitleEn" defaultValue={heroSlide1.title.en} rows={2} hint="显示在英文首页第二张滚动 Banner 的大标题。" />
              <TextareaField label="第二张 Banner 副标题（中文）" name="heroSlide1SubtitleZh" defaultValue={heroSlide1.subtitle.zh} rows={4} hint="显示在中文首页第二张滚动 Banner 的说明文字。" />
              <TextareaField label="第二张 Banner 副标题（英文）" name="heroSlide1SubtitleEn" defaultValue={heroSlide1.subtitle.en} rows={4} hint="显示在英文首页第二张滚动 Banner 的说明文字。" />

              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">客服邮箱</label>
                <input type="email" name="contactMail" defaultValue={config?.contactMail ?? ''} className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">联系电话</label>
                <input type="text" name="contactPhone" defaultValue={config?.contactPhone ?? ''} className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
              </div>
              <TextareaField
                label="联系地址（中文）"
                name="contactHqAddressZh"
                defaultValue={overrides.contact.hqAddress.zh}
                rows={3}
                hint="显示在前台“联系我们”页面左侧的联系地址信息。"
              />
              <TextareaField
                label="联系地址（英文）"
                name="contactHqAddressEn"
                defaultValue={overrides.contact.hqAddress.en}
                rows={3}
                hint="显示在英文 Contact 页面左侧的 Contact Address 信息。"
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">WhatsApp (国际版)</label>
                <input type="text" name="whatsappNumber" defaultValue={config?.whatsappNumber || ''} placeholder="+86 138..." className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">WeChat 二维码图片 URL</label>
                <input type="text" name="wechatQrUrl" defaultValue={config?.wechatQrUrl || ''} placeholder="https://your-image-url.com/qr.jpg" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">WeChat 二维码上传</label>
                <input type="file" name="wechatQrFile" accept=".jpg,.jpeg,.png,.webp,image/png,image/jpeg,image/webp" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all file:mr-4 file:border-0 file:bg-bmw-black file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-white" />
                <p className="text-xs text-gray-400">可直接上传二维码图片；若同时填写 URL，上传文件会优先使用。</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-bmw-black uppercase">当前 WeChat 二维码预览</label>
                <div className="w-40 h-40 border border-gray-200 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrPreviewSrc} alt="Current WeChat QR" className="w-full h-full object-contain" />
                </div>
                {!config?.wechatQrUrl && <p className="text-xs text-gray-400">当前还没有保存真实二维码，正在显示占位图。</p>}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-bmw-silver uppercase tracking-[0.3em] border-b border-gray-100 pb-2">扩展公共文案（中英主版本）</h3>
              <p className="text-xs text-gray-500 leading-relaxed">这些字段分别控制页脚、产品中心、产品详情页和联系我们页面的固定文案；每个输入框下方标明了前台显示位置。</p>
              <TextareaField label="页脚品牌说明（中文）" name="footerBrandDescriptionZh" defaultValue={overrides.footer.brandDescription.zh} rows={4} hint="显示在全站页脚左侧 SUCI 标识下方。" />
              <TextareaField label="页脚品牌说明（英文）" name="footerBrandDescriptionEn" defaultValue={overrides.footer.brandDescription.en} rows={4} hint="显示在英文站全站页脚左侧 SUCI 标识下方。" />
              <TextareaField label="产品页主标题（中文）" name="productsTitleZh" defaultValue={overrides.products.title.zh} rows={2} hint="显示在“产品中心”页面顶部黑色横幅的大标题。" />
              <TextareaField label="产品页主标题（英文）" name="productsTitleEn" defaultValue={overrides.products.title.en} rows={2} hint="显示在英文 Products 页面顶部黑色横幅的大标题。" />
              <TextareaField label="产品页说明（中文）" name="productsDescriptionZh" defaultValue={overrides.products.description.zh} rows={4} hint="显示在“产品中心”页面顶部主标题下方的说明文字。" />
              <TextareaField label="产品页说明（英文）" name="productsDescriptionEn" defaultValue={overrides.products.description.en} rows={4} hint="显示在英文 Products 页面顶部主标题下方的说明文字。" />
              <TextareaField label="产品页 CTA 标题（中文）" name="productsSupportTitleZh" defaultValue={overrides.products.supportTitle.zh} rows={3} hint="显示在“产品中心”页面底部黑色咨询区的标题。" />
              <TextareaField label="产品页 CTA 标题（英文）" name="productsSupportTitleEn" defaultValue={overrides.products.supportTitle.en} rows={3} hint="显示在英文 Products 页面底部黑色咨询区的标题。" />
              <TextareaField label="产品页 CTA 按钮（中文）" name="productsSupportCtaZh" defaultValue={overrides.products.supportCta.zh} rows={2} hint="显示在“产品中心”页面底部黑色咨询区的按钮文字。" />
              <TextareaField label="产品页 CTA 按钮（英文）" name="productsSupportCtaEn" defaultValue={overrides.products.supportCta.en} rows={2} hint="显示在英文 Products 页面底部黑色咨询区的按钮文字。" />
              <TextareaField label="产品详情报价按钮（中文）" name="productsDetailQuoteCtaZh" defaultValue={overrides.products.detailQuoteCta.zh} rows={2} hint="显示在单个产品详情页底部的询价按钮。" />
              <TextareaField label="产品详情报价按钮（英文）" name="productsDetailQuoteCtaEn" defaultValue={overrides.products.detailQuoteCta.en} rows={2} hint="显示在英文单个产品详情页底部的询价按钮。" />
              <TextareaField label="产品详情 PDF 按钮（中文）" name="productsDetailPdfCtaZh" defaultValue={overrides.products.detailPdfCta.zh} rows={2} hint="预留给产品详情页 PDF 下载按钮文案；当前前台详情页暂未显示这个按钮。" />
              <TextareaField label="产品详情 PDF 按钮（英文）" name="productsDetailPdfCtaEn" defaultValue={overrides.products.detailPdfCta.en} rows={2} hint="预留给英文产品详情页 PDF 下载按钮文案；当前前台详情页暂未显示这个按钮。" />
              <TextareaField label="联系页标题（中文）" name="contactTitleZh" defaultValue={overrides.contact.title.zh} rows={3} hint="显示在“联系我们”页面顶部的大标题。" />
              <TextareaField label="联系页标题（英文）" name="contactTitleEn" defaultValue={overrides.contact.title.en} rows={3} hint="显示在英文 Contact 页面顶部的大标题。" />
              <TextareaField label="联系页说明（中文）" name="contactDescriptionZh" defaultValue={overrides.contact.description.zh} rows={4} hint="显示在“联系我们”页面顶部标题下方的说明文字。" />
              <TextareaField label="联系页说明（英文）" name="contactDescriptionEn" defaultValue={overrides.contact.description.en} rows={4} hint="显示在英文 Contact 页面顶部标题下方的说明文字。" />
              <TextareaField label="联系页表单标题（中文）" name="contactFormTitleZh" defaultValue={overrides.contact.formTitle.zh} rows={2} hint="显示在“联系我们”页面右侧询盘表单上方。" />
              <TextareaField label="联系页表单标题（英文）" name="contactFormTitleEn" defaultValue={overrides.contact.formTitle.en} rows={2} hint="显示在英文 Contact 页面右侧询盘表单上方。" />
              <TextareaField label="WhatsApp 提示标题（中文）" name="contactWhatsappTitleZh" defaultValue={overrides.contact.whatsappTitle.zh} rows={2} hint="显示在“联系我们”页面左侧 WhatsApp 号码上方。" />
              <TextareaField label="WhatsApp 提示标题（英文）" name="contactWhatsappTitleEn" defaultValue={overrides.contact.whatsappTitle.en} rows={2} hint="显示在英文 Contact 页面左侧 WhatsApp 号码上方。" />
              <TextareaField label="表单详细需求占位文案（中文）" name="contactFormMessagePlaceholderZh" defaultValue={overrides.contact.formMessagePlaceholder.zh} rows={3} hint="显示在“联系我们”页面询盘表单的详细需求输入框内。" />
              <TextareaField label="表单详细需求占位文案（英文）" name="contactFormMessagePlaceholderEn" defaultValue={overrides.contact.formMessagePlaceholder.en} rows={3} hint="显示在英文 Contact 页面询盘表单的详细需求输入框内。" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-bmw-lightgray/50 p-6 space-y-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" name="autoTranslate" defaultChecked={translationReady} className="mt-1 h-4 w-4 accent-bmw-blue" />
              <span className="text-sm text-gray-700 leading-relaxed">
                保存时自动将中文源文案同步生成到 `en / es / fr / ar / ru / de / id / vi`。如果当前环境未配置 `OPENAI_API_KEY`，系统会保留你填写的中英文，并让其他语言继续回退到英文版本。
              </span>
            </label>
          </div>

          <div className="pt-8 border-t border-gray-100 flex justify-end">
            <button type="submit" className="group bg-bmw-black text-white px-10 py-4 font-bold text-xs tracking-widest uppercase flex items-center hover:bg-bmw-blue transition-all shadow-xl">
              <Save className="w-4 h-4 mr-3" />
              <span>保存当前配置</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
