import 'server-only';
import { defaultLocale, type Locale } from './i18n';
import { getSiteContentOverrides, resolveTranslatedField, type SiteContentOverrides } from './site-content-overrides';

type NavLink = {
  id: string;
  label: string;
  children?: NavLink[];
};

type SiteConfigLike = {
  heroTitle?: string | null;
  heroSub?: string | null;
};

export type SiteDictionary = {
  metadata: {
    title: string;
    description: string;
  };
  brand: {
    localName: string;
  };
  header: {
    languageShort: string;
    links: NavLink[];
  };
  footer: {
    brandDescription: string;
    coreSeriesTitle: string;
    coreSeries: string[];
    quickLinksTitle: string;
    contactTitle: string;
    privacy: string;
    legal: string;
    copyright: string;
  };
  home: {
    heroTitle: string;
    heroSub: string;
    primaryCta: string;
    secondaryCta: string;
    heroSlides: Array<{
      eyebrow: string;
      title: string;
      subtitle: string;
      primaryCta: string;
      secondaryCta: string;
      primaryHref: string;
      secondaryHref: string;
    }>;
    advantageEyebrow: string;
    advantageTitle: string;
    advantageDescription: string;
    advantageBand: { label: string; value: string }[];
    valueTitle: string;
    valueTitleEmphasis: string;
    valueDescription: string;
    valueCards: { n: string; title: string; desc: string }[];
    aboutPreviewEyebrow: string;
    aboutPreviewTitle: string;
    aboutPreviewDescription: string;
    aboutPreviewPrimaryCta: string;
    aboutPreviewSecondaryCta: string;
    reportsEyebrow: string;
    reportsTitle: string;
    reportsDescription: string;
    reportsCta: string;
    featuredEyebrow: string;
    featuredTitle: string;
    bottomCtaEyebrow: string;
    bottomCtaTitle: string;
    bottomCtaDescription: string;
    bottomCtaPrimary: string;
    bottomCtaSecondary: string;
  };
  about: {
    eyebrow: string;
    title: string;
    description: string;
    introLabel: string;
    capabilityLabel: string;
    cultureLabel: string;
    timelineLabel: string;
    reportsLabel: string;
    partnersLabel: string;
  };
  news: {
    eyebrow: string;
    title: string;
    description: string;
    emptyState: string;
    readMore: string;
    back: string;
  };
  products: {
    eyebrow: string;
    title: string;
    description: string;
    supportEyebrow: string;
    supportTitle: string;
    supportCta: string;
    tabs: {
      all: string;
      categories: Record<string, string>;
    };
    searchPlaceholder: string;
    emptyState: string;
    viewDetails: string;
    documents: {
      eyebrow: string;
      title: string;
      description: string;
      button: string;
      modalTitle: string;
      modalDescription: string;
      download: string;
      empty: string;
    };
    detail: {
      back: string;
      modelLabel: string;
      featureLabels: {
        certified: string;
        highPower: string;
        global: string;
      };
      specsTitle: string;
      fallbackDescription: string;
      fallbackSpecs: string;
      quoteCta: string;
      pdfCta: string;
    };
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    phone: string;
    email: string;
    hq: string;
    wechat: string;
    formTitle: string;
    whatsappTitle: string;
    hqAddress: string;
    wechatAlt: string;
    form: {
      successTitle: string;
      successDescription: string;
      successReset: string;
      fullName: string;
      email: string;
      company: string;
      phone: string;
      product: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
      selectPlaceholder: string;
      errorFallback: string;
    };
  };
};

const zh: SiteDictionary = {
  metadata: {
    title: '苏州南瓷 | 卓越电力配套解决方案',
    description: '面向全球销售的电力设备企业官网。',
  },
  brand: {
    localName: '苏州南瓷',
  },
  header: {
    languageShort: 'ZH',
    links: [
      { id: '/', label: '首页' },
      {
        id: '/about',
        label: '关于我们',
        children: [
          { id: '/about#company-profile', label: '公司简介' },
          { id: '/about#timeline', label: '发展历程' },
          { id: '/about#test-reports', label: '检测报告' },
          { id: '/about#culture', label: '企业文化' },
        ],
      },
      { id: '/news', label: '新闻动态' },
      {
        id: '/products',
        label: '产品中心',
        children: [
          { id: '/products#product-categories', label: '产品分类' },
          { id: '/products#documents', label: '产品资料下载' },
        ],
      },
      { id: '/contact', label: '联系我们' },
    ],
  },
  footer: {
    brandDescription: '致力成为优质的电力配套设备及解决方案提供商，专注高品质绝缘子、避雷器研发制造。',
    coreSeriesTitle: '核心系列',
    coreSeries: ['支柱复合绝缘子', '空心复合绝缘子', '氧化锌避雷器', '高压隔离开关'],
    quickLinksTitle: '快捷导航',
    contactTitle: '联系方式',
    privacy: '隐私政策',
    legal: '法律声明',
    copyright: '苏州南瓷电瓷电器有限公司 保留所有权利。',
  },
  home: {
    heroTitle: '极致性能\n驱动工业未来',
    heroSub: '基于工业美学与严谨制造体系，苏州南瓷为您打造高可靠的电力配套设备解决方案。',
    primaryCta: '探索全系产品',
    secondaryCta: '联系我们',
    heroSlides: [
      {
        eyebrow: 'SUCI / POWER',
        title: '极致性能\n驱动工业未来',
        subtitle: '基于工业美学与严谨制造体系，苏州南瓷为您打造高可靠的电力配套设备解决方案。',
        primaryCta: '探索全系产品',
        secondaryCta: '联系我们',
        primaryHref: '/products',
        secondaryHref: '/contact',
      },
      {
        eyebrow: 'TESTING / RELIABILITY',
        title: '权威检测\n验证长期可靠',
        subtitle: '通过高压、机械强度与环境适应性测试结果，帮助客户更快完成技术评估与采购决策。',
        primaryCta: '查看检测报告',
        secondaryCta: '下载产品资料',
        primaryHref: '/about#test-reports',
        secondaryHref: '/products#documents',
      },
    ],
    advantageEyebrow: 'Core Advantage',
    advantageTitle: '企业核心能力带',
    advantageDescription: '以研发、制造、检测与交付四个维度构建项目支撑能力，服务全球工业与电力客户。',
    advantageBand: [
      { label: '研发协同', value: '按项目快速选型' },
      { label: '制造体系', value: '稳定批量交付' },
      { label: '检测验证', value: '报告支撑投标' },
      { label: '全球响应', value: '支持多区域客户' },
    ],
    valueTitle: '毫不妥协的',
    valueTitleEmphasis: '制造标准',
    valueDescription: '所有复合绝缘子与避雷器产品，均经过严苛环境下的模拟测试，在高温、严寒和重污秽场景中依然保持稳定性能。',
    valueCards: [
      { n: '01', title: '精密工程', desc: '采用数字化控制生产线，确保部件配合精度与出厂一致性。' },
      { n: '02', title: '严苛品控', desc: '从原材料到成品出厂，执行多项高压绝缘与结构强度检测。' },
      { n: '03', title: '坚固耐用', desc: '采用特种硅橡胶与高强度芯棒，提升复杂环境下的使用寿命。' },
      { n: '04', title: '全球服务', desc: '为海外项目提供选型、打样、交付与售后支持。' },
    ],
    aboutPreviewEyebrow: 'About Preview',
    aboutPreviewTitle: '面向全球项目的制造与交付协同',
    aboutPreviewDescription: '从公司能力、工程经验到检测体系，首页先快速呈现苏州南瓷的业务基础与交付可信度。',
    aboutPreviewPrimaryCta: '进入关于我们',
    aboutPreviewSecondaryCta: '查看发展历程',
    reportsEyebrow: 'Testing Reports',
    reportsTitle: '权威检测报告',
    reportsDescription: '聚焦检测报告，不展示资质荣誉，通过真实测试结果强化产品可信度与项目支撑能力。',
    reportsCta: '查看全部检测报告',
    featuredEyebrow: '产品矩阵',
    featuredTitle: '核心电力产品矩阵',
    bottomCtaEyebrow: 'Next Step',
    bottomCtaTitle: '需要选型建议、资料支持或批量报价？',
    bottomCtaDescription: '告诉我们目标市场、技术参数和项目周期，我们会结合产品资料与检测结果尽快回复。',
    bottomCtaPrimary: '提交询盘',
    bottomCtaSecondary: '查看产品中心',
  },
  about: {
    eyebrow: '关于我们',
    title: '构建面向全球的电力配套能力',
    description: '从产品研发、制造交付到项目协同，苏州南瓷持续为全球客户提供稳定、专业、可落地的电力设备支持。',
    introLabel: '公司简介',
    capabilityLabel: '能力优势',
    cultureLabel: '企业文化',
    timelineLabel: '发展历程',
    reportsLabel: '检测报告',
    partnersLabel: '合作伙伴',
  },
  news: {
    eyebrow: '新闻动态',
    title: '最新资讯与企业动态',
    description: '关注产品发布、项目进展、展会活动与企业资讯，了解苏州南瓷的最新动态。',
    emptyState: '新闻内容正在更新中，敬请期待。',
    readMore: '阅读全文',
    back: '返回新闻列表',
  },
  products: {
    eyebrow: '产品目录',
    title: '核心电力产品矩阵',
    description: '面向输配电与工业配套场景的高可靠解决方案，以稳定性能和制造标准服务全球客户。',
    supportEyebrow: '需要支持',
    supportTitle: '需要定制选型或批量报价？',
    supportCta: '联系我们',
    tabs: {
      all: '全部',
      categories: {
        '复合绝缘子系列': '复合绝缘子系列',
        '避雷器系列': '避雷器系列',
        '开关设备系列': '开关设备系列',
        '配套组件系列': '配套组件系列',
      },
    },
    searchPlaceholder: '搜索型号或产品名...',
    emptyState: '没有找到匹配的产品。',
    viewDetails: '查看详情',
    documents: {
      eyebrow: '产品资料',
      title: '下载产品资料文档',
      description: '这里汇总了产品中心相关的 PDF 资料文档。点击按钮后可查看文档列表，并根据简介按需下载。',
      button: '下载产品 PDF',
      modalTitle: '产品资料文档列表',
      modalDescription: '请选择需要的 PDF 文档进行下载。后续新增资料会在这里持续更新。',
      download: '下载文档',
      empty: '暂无可下载的产品资料文档。',
    },
    detail: {
      back: '返回产品目录',
      modelLabel: '型号',
      featureLabels: {
        certified: '认证保障',
        highPower: '高可靠',
        global: '全球交付',
      },
      specsTitle: '技术核心参数',
      fallbackDescription: '为满足全球复杂工况下的稳定运行需求，SUCI 电力组件兼顾性能、可靠性与工业制造标准。',
      fallbackSpecs: '正在同步最新测试数据...',
      quoteCta: '立即获取报价',
      pdfCta: '',
    },
  },
  contact: {
    eyebrow: '联系我们',
    title: '连接全球电力合作需求',
    description: '我们为全球客户提供产品选型、技术沟通与批量采购支持。填写需求后，我们会尽快与您联系。',
    phone: '商务热线 / Phone',
    email: '全球业务 / Email',
    hq: '联系地址',
    wechat: 'WeChat 微信扫码',
    formTitle: '在线提交需求（Inquiry Form）',
    whatsappTitle: 'WhatsApp 快速沟通',
    hqAddress: '中国 · 苏州高新区 68 号',
    wechatAlt: '微信二维码',
    form: {
      successTitle: '询盘提交成功',
      successDescription: '感谢您的信任。我们的商务经理会在 24 小时内与您取得联系。',
      successReset: '再次发送咨询',
      fullName: '姓名 Full Name *',
      email: '邮箱 Email Address *',
      company: '公司 Company Name',
      phone: '电话 Phone',
      product: '目标产品 Target Product',
      message: '详细需求 Detailed Inquiry *',
      messagePlaceholder: '请填写您的需求、规格、数量或项目背景，我们会尽快与您联系。',
      submit: '立即发送 Send',
      selectPlaceholder: '请选择 / Please Select',
      errorFallback: '提交失败，请稍后重试。',
    },
  },
};

const en: SiteDictionary = {
  metadata: {
    title: 'SUCI | Advanced Power Equipment Solutions',
    description: 'A global sales website for power equipment and grid components.',
  },
  brand: {
    localName: 'Suzhou Nanci',
  },
  header: {
    languageShort: 'EN',
    links: [
      { id: '/', label: 'Home' },
      {
        id: '/about',
        label: 'About',
        children: [
          { id: '/about#company-profile', label: 'Company Profile' },
          { id: '/about#timeline', label: 'Milestones' },
          { id: '/about#test-reports', label: 'Testing Reports' },
          { id: '/about#culture', label: 'Culture' },
        ],
      },
      { id: '/news', label: 'News' },
      {
        id: '/products',
        label: 'Products',
        children: [
          { id: '/products#product-categories', label: 'Categories' },
          { id: '/products#documents', label: 'Document Library' },
        ],
      },
      { id: '/contact', label: 'Contact' },
    ],
  },
  footer: {
    brandDescription: 'We provide reliable power equipment and supporting solutions, with a strong focus on insulators, surge arresters, and engineered grid components.',
    coreSeriesTitle: 'Core Lines',
    coreSeries: ['Post Composite Insulator', 'Hollow Composite Insulator', 'Metal Oxide Surge Arrester', 'High Voltage Disconnect Switch'],
    quickLinksTitle: 'Quick Links',
    contactTitle: 'Contact',
    privacy: 'Privacy Policy',
    legal: 'Legal Notice',
    copyright: 'Suzhou Nanci Electric Porcelain Appliance Co., Ltd. All rights reserved.',
  },
  home: {
    heroTitle: 'Ultimate Performance\nPowering Industry Forward',
    heroSub: 'Built on industrial-grade engineering and disciplined manufacturing, SUCI delivers dependable power equipment solutions for global projects.',
    primaryCta: 'Explore Products',
    secondaryCta: 'Contact Us',
    heroSlides: [
      {
        eyebrow: 'SUCI / POWER',
        title: 'Ultimate Performance\nPowering Industry Forward',
        subtitle: 'Built on industrial-grade engineering and disciplined manufacturing, SUCI delivers dependable power equipment solutions for global projects.',
        primaryCta: 'Explore Products',
        secondaryCta: 'Contact Us',
        primaryHref: '/products',
        secondaryHref: '/contact',
      },
      {
        eyebrow: 'TESTING / RELIABILITY',
        title: 'Verified Testing\nBuilt for Confidence',
        subtitle: 'Authoritative test results help customers accelerate technical review, vendor qualification, and procurement decisions.',
        primaryCta: 'See Testing Reports',
        secondaryCta: 'Open Document Library',
        primaryHref: '/about#test-reports',
        secondaryHref: '/products#documents',
      },
    ],
    advantageEyebrow: 'Core Advantage',
    advantageTitle: 'Enterprise Capability Band',
    advantageDescription: 'Our support model is built around engineering, manufacturing, testing, and delivery, helping global industrial and power customers move faster.',
    advantageBand: [
      { label: 'Engineering', value: 'Fast project-based selection' },
      { label: 'Manufacturing', value: 'Stable batch delivery' },
      { label: 'Testing', value: 'Reports for qualification' },
      { label: 'Response', value: 'Multi-region support' },
    ],
    valueTitle: 'Manufacturing Without',
    valueTitleEmphasis: 'Compromise',
    valueDescription: 'Every insulator and surge arrester is validated under demanding conditions so performance remains stable in heat, cold, pollution, and long operating cycles.',
    valueCards: [
      { n: '01', title: 'Precision Engineering', desc: 'Digitally controlled production lines keep component fit, consistency, and output quality stable.' },
      { n: '02', title: 'Strict Quality Control', desc: 'From raw material to shipment, products go through multiple high-voltage insulation and structural tests.' },
      { n: '03', title: 'Durable by Design', desc: 'Special silicone rubber and high-strength cores improve service life under complex environments.' },
      { n: '04', title: 'Global Service', desc: 'We support overseas projects with selection, sampling, delivery, and after-sales coordination.' },
    ],
    aboutPreviewEyebrow: 'About Preview',
    aboutPreviewTitle: 'Manufacturing and Delivery Capability for Global Programs',
    aboutPreviewDescription: 'Use the homepage to quickly understand Suzhou Nanci’s manufacturing base, engineering approach, and delivery credibility before going deeper.',
    aboutPreviewPrimaryCta: 'Open About Page',
    aboutPreviewSecondaryCta: 'View Milestones',
    reportsEyebrow: 'Testing Reports',
    reportsTitle: 'Authoritative Testing Reports',
    reportsDescription: 'This section focuses only on testing reports, not honors or certificates, so the message stays practical and project-oriented.',
    reportsCta: 'View All Reports',
    featuredEyebrow: 'Product Lineup',
    featuredTitle: 'Core Power Product Matrix',
    bottomCtaEyebrow: 'Next Step',
    bottomCtaTitle: 'Need product selection, technical documents, or a bulk quotation?',
    bottomCtaDescription: 'Share your market, key parameters, and schedule. We will follow up with suitable products, document links, and testing support.',
    bottomCtaPrimary: 'Send Inquiry',
    bottomCtaSecondary: 'Browse Products',
  },
  about: {
    eyebrow: 'About',
    title: 'Power Equipment Capability Built for Global Projects',
    description: 'From product development and manufacturing to project coordination, Suzhou Nanci supports global customers with stable, practical, and delivery-focused power equipment solutions.',
    introLabel: 'Company Profile',
    capabilityLabel: 'Capabilities',
    cultureLabel: 'Culture',
    timelineLabel: 'Milestones',
    reportsLabel: 'Testing Reports',
    partnersLabel: 'Partners',
  },
  news: {
    eyebrow: 'News',
    title: 'Latest Updates and Company News',
    description: 'Follow product launches, project updates, exhibitions, and company developments from Suzhou Nanci.',
    emptyState: 'News content is being updated. Please check back soon.',
    readMore: 'Read Article',
    back: 'Back to News',
  },
  products: {
    eyebrow: 'Product Catalog',
    title: 'Core Power Product Matrix',
    description: 'High-reliability solutions for transmission, distribution, and industrial support scenarios, built for stable performance and global delivery.',
    supportEyebrow: 'Need Support',
    supportTitle: 'Need custom selection or bulk quotation?',
    supportCta: 'Contact Us',
    tabs: {
      all: 'All',
      categories: {
        '复合绝缘子系列': 'Composite Insulators',
        '避雷器系列': 'Surge Arresters',
        '开关设备系列': 'Switchgear',
        '配套组件系列': 'Supporting Components',
      },
    },
    searchPlaceholder: 'Search by model or product...',
    emptyState: 'No matching products found.',
    viewDetails: 'View Details',
    documents: {
      eyebrow: 'Product Documents',
      title: 'Download Product Documents',
      description: 'This library contains brochure PDFs collected for the entire product center. Open the list and download the files you need based on the short descriptions.',
      button: 'Download Product PDFs',
      modalTitle: 'Product Document Library',
      modalDescription: 'Choose the PDF files you need from the list below. New brochures and technical packs will continue to be added here.',
      download: 'Download PDF',
      empty: 'No product documents are available yet.',
    },
    detail: {
      back: 'Back to Catalog',
      modelLabel: 'Model',
      featureLabels: {
        certified: 'Certified',
        highPower: 'High Power',
        global: 'Global',
      },
      specsTitle: 'Technical Specifications',
      fallbackDescription: 'Designed for reliable operation in demanding grid conditions, SUCI components combine electrical performance with industrial-grade manufacturing discipline.',
      fallbackSpecs: 'Latest test data is being synchronized...',
      quoteCta: 'Request a Quote',
      pdfCta: '',
    },
  },
  contact: {
    eyebrow: 'Contact Us',
    title: 'Connect With Global Power Buyers',
    description: 'We support product selection, technical alignment, and bulk procurement for international customers. Send us your requirements and our team will respond shortly.',
    phone: 'Business Hotline / Phone',
    email: 'Global Sales / Email',
    hq: 'Contact Address',
    wechat: 'WeChat QR',
    formTitle: 'Submit Your Inquiry',
    whatsappTitle: 'Instant WhatsApp',
    hqAddress: 'China · Suzhou High-tech Industrial Park, No. 68',
    wechatAlt: 'WeChat QR Code',
    form: {
      successTitle: 'Inquiry Submitted',
      successDescription: 'Thank you for your interest. Our sales team will get back to you within 24 hours.',
      successReset: 'Send Another Inquiry',
      fullName: 'Full Name *',
      email: 'Email Address *',
      company: 'Company Name',
      phone: 'Phone',
      product: 'Target Product',
      message: 'Detailed Inquiry *',
      messagePlaceholder: 'Please describe your requirements, specifications, quantity, or project background here.',
      submit: 'Send Inquiry',
      selectPlaceholder: 'Please Select',
      errorFallback: 'Submission failed. Please try again later.',
    },
  },
};

const dictionaries: Record<string, SiteDictionary> = {
  en,
  zh,
  es: en,
  fr: en,
  ar: en,
  ru: en,
  de: en,
  id: en,
  vi: en,
};

export function getDictionary(locale: string) {
  return structuredClone(dictionaries[locale] ?? dictionaries[defaultLocale]);
}

function applyOverride(dictionary: SiteDictionary, locale: Locale, overrides: SiteContentOverrides) {
  const firstHeroSlideTitle = resolveTranslatedField(overrides.home.heroSlides[0].title, locale);
  const firstHeroSlideSubtitle = resolveTranslatedField(overrides.home.heroSlides[0].subtitle, locale);

  if (firstHeroSlideTitle) {
    dictionary.home.heroTitle = firstHeroSlideTitle;
    dictionary.home.heroSlides[0].title = firstHeroSlideTitle;
  }

  if (firstHeroSlideSubtitle) {
    dictionary.home.heroSub = firstHeroSlideSubtitle;
    dictionary.home.heroSlides[0].subtitle = firstHeroSlideSubtitle;
  }

  const secondHeroSlideTitle = resolveTranslatedField(overrides.home.heroSlides[1].title, locale);
  const secondHeroSlideSubtitle = resolveTranslatedField(overrides.home.heroSlides[1].subtitle, locale);

  if (secondHeroSlideTitle) {
    dictionary.home.heroSlides[1].title = secondHeroSlideTitle;
  }

  if (secondHeroSlideSubtitle) {
    dictionary.home.heroSlides[1].subtitle = secondHeroSlideSubtitle;
  }

  dictionary.footer.brandDescription = resolveTranslatedField(overrides.footer.brandDescription, locale) || dictionary.footer.brandDescription;
  dictionary.products.title = resolveTranslatedField(overrides.products.title, locale) || dictionary.products.title;
  dictionary.products.description = resolveTranslatedField(overrides.products.description, locale) || dictionary.products.description;
  dictionary.products.supportTitle = resolveTranslatedField(overrides.products.supportTitle, locale) || dictionary.products.supportTitle;
  dictionary.products.supportCta = resolveTranslatedField(overrides.products.supportCta, locale) || dictionary.products.supportCta;
  dictionary.products.detail.quoteCta = resolveTranslatedField(overrides.products.detailQuoteCta, locale) || dictionary.products.detail.quoteCta;
  dictionary.contact.title = resolveTranslatedField(overrides.contact.title, locale) || dictionary.contact.title;
  dictionary.contact.description = resolveTranslatedField(overrides.contact.description, locale) || dictionary.contact.description;
  dictionary.contact.formTitle = resolveTranslatedField(overrides.contact.formTitle, locale) || dictionary.contact.formTitle;
  dictionary.contact.whatsappTitle = resolveTranslatedField(overrides.contact.whatsappTitle, locale) || dictionary.contact.whatsappTitle;
  dictionary.contact.hqAddress = resolveTranslatedField(overrides.contact.hqAddress, locale) || dictionary.contact.hqAddress;
  dictionary.contact.form.messagePlaceholder = resolveTranslatedField(overrides.contact.formMessagePlaceholder, locale) || dictionary.contact.form.messagePlaceholder;
}

export function resolveDictionary(locale: Locale, config?: SiteConfigLike | null, overrides?: SiteContentOverrides) {
  const dictionary = getDictionary(locale);

  if (config?.heroTitle) {
    dictionary.home.heroTitle = config.heroTitle;
    dictionary.home.heroSlides[0].title = config.heroTitle;
  }

  if (config?.heroSub) {
    dictionary.home.heroSub = config.heroSub;
    dictionary.home.heroSlides[0].subtitle = config.heroSub;
  }

  if (overrides) {
    applyOverride(dictionary, locale, overrides);
  }

  return dictionary;
}

export async function getResolvedDictionary(locale: Locale, config?: SiteConfigLike | null) {
  const overrides = await getSiteContentOverrides();
  return resolveDictionary(locale, config, overrides);
}
