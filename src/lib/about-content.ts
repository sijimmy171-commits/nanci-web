import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createEmptyLocalizedField, getFallbackLocale, type LocalizedField } from '@/lib/site-content-overrides';
import { type Locale } from '@/lib/i18n';

export type TimelineItem = {
  year: string;
  title: LocalizedField;
  description: LocalizedField;
};

export type ReportItem = {
  date: string;
  title: LocalizedField;
  issuer: LocalizedField;
  summary: LocalizedField;
  imageUrl: string;
  fileUrl: string;
};

export type AboutSection = {
  title: LocalizedField;
  body: LocalizedField;
};

export type AboutContent = {
  heroTitle: LocalizedField;
  heroDescription: LocalizedField;
  intro: AboutSection;
  capability: AboutSection;
  culture: AboutSection;
  timelineTitle: LocalizedField;
  timeline: TimelineItem[];
  reportsTitle: LocalizedField;
  reportsDescription: LocalizedField;
  reports: ReportItem[];
  partnersTitle: LocalizedField;
  partnersDescription: LocalizedField;
  partners: string[];
};

type AboutContentRow = {
  aboutContent: Prisma.JsonValue | null;
};

export type ResolvedAboutContent = {
  heroTitle: string;
  heroDescription: string;
  intro: {
    title: string;
    body: string;
  };
  capability: {
    title: string;
    body: string;
  };
  culture: {
    title: string;
    body: string;
  };
  timelineTitle: string;
  timeline: Array<{
    year: string;
    title: string;
    description: string;
  }>;
  reportsTitle: string;
  reportsDescription: string;
  reports: Array<{
    date: string;
    title: string;
    issuer: string;
    summary: string;
    imageUrl: string;
    fileUrl: string;
  }>;
  partnersTitle: string;
  partnersDescription: string;
  partners: string[];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeLocalizedField(value: unknown, fallback: LocalizedField): LocalizedField {
  if (!isObject(value)) return { ...fallback };

  return Object.keys(fallback).reduce((acc, localeKey) => {
    const locale = localeKey as Locale;
    acc[locale] = typeof value[locale] === 'string' ? (value[locale] as string) : fallback[locale];
    return acc;
  }, { ...fallback });
}

function normalizeTimeline(value: unknown, fallback: TimelineItem[]): TimelineItem[] {
  if (!Array.isArray(value)) return fallback;

  return value
    .filter((item) => isObject(item))
    .map((item) => ({
      year: typeof item.year === 'string' ? item.year : '',
      title: mergeLocalizedField(item.title, createEmptyLocalizedField()),
      description: mergeLocalizedField(item.description, createEmptyLocalizedField()),
    }))
    .filter((item) => item.year || item.title.zh || item.title.en || item.description.zh || item.description.en);
}

function normalizeReports(value: unknown, fallback: ReportItem[]): ReportItem[] {
  if (!Array.isArray(value)) return fallback;

  return value
    .filter((item) => isObject(item))
    .map((item) => ({
      date: typeof item.date === 'string' ? item.date : '',
      title: mergeLocalizedField(item.title, createEmptyLocalizedField()),
      issuer: mergeLocalizedField(item.issuer, createEmptyLocalizedField()),
      summary: mergeLocalizedField(item.summary, createEmptyLocalizedField()),
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
      fileUrl: typeof item.fileUrl === 'string' ? item.fileUrl : '',
    }))
    .filter(
      (item) =>
        item.date ||
        item.title.zh ||
        item.title.en ||
        item.issuer.zh ||
        item.issuer.en ||
        item.summary.zh ||
        item.summary.en ||
        item.imageUrl ||
        item.fileUrl
    );
}

function normalizePartners(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function createSection(titleZh: string, titleEn: string, bodyZh: string, bodyEn: string): AboutSection {
  return {
    title: { ...createEmptyLocalizedField(), zh: titleZh, en: titleEn },
    body: { ...createEmptyLocalizedField(), zh: bodyZh, en: bodyEn },
  };
}

function createTimelineItem(year: string, titleZh: string, titleEn: string, descZh: string, descEn: string): TimelineItem {
  return {
    year,
    title: { ...createEmptyLocalizedField(), zh: titleZh, en: titleEn },
    description: { ...createEmptyLocalizedField(), zh: descZh, en: descEn },
  };
}

function createReportItem(
  date: string,
  titleZh: string,
  titleEn: string,
  issuerZh: string,
  issuerEn: string,
  summaryZh: string,
  summaryEn: string,
  imageUrl = '',
  fileUrl = ''
): ReportItem {
  return {
    date,
    title: { ...createEmptyLocalizedField(), zh: titleZh, en: titleEn },
    issuer: { ...createEmptyLocalizedField(), zh: issuerZh, en: issuerEn },
    summary: { ...createEmptyLocalizedField(), zh: summaryZh, en: summaryEn },
    imageUrl,
    fileUrl,
  };
}

export const defaultAboutContent: AboutContent = {
  heroTitle: {
    ...createEmptyLocalizedField(),
    zh: '关于苏州南瓷',
    en: 'About Suzhou Nanci',
  },
  heroDescription: {
    ...createEmptyLocalizedField(),
    zh: '我们专注电力设备配套解决方案，以稳定制造体系、工程经验与全球交付能力服务国际客户。',
    en: 'We focus on power equipment solutions with reliable manufacturing, engineering experience, and global delivery capability.',
  },
  intro: createSection(
    '公司简介',
    'Company Profile',
    '苏州南瓷致力于高可靠电力设备及配套组件的研发、制造与全球销售，服务于输配电、新能源、轨道交通和工业基础设施场景。',
    'Suzhou Nanci develops, manufactures, and supplies reliable power equipment and supporting components for transmission, distribution, renewable energy, rail transit, and industrial infrastructure projects.'
  ),
  capability: createSection(
    '能力与优势',
    'Capabilities',
    '我们具备成熟的产品开发能力、稳定的制造流程、严格的质量检测体系，以及面向海外项目的打样、交付与售后协同经验。',
    'We bring product development capability, stable manufacturing workflows, strict quality control, and practical support for overseas sampling, delivery, and after-sales coordination.'
  ),
  culture: createSection(
    '企业文化',
    'Culture',
    '坚持长期主义、品质优先与合作共赢，通过专业响应和工程化思维，为客户持续创造可交付的商业价值。',
    'We value long-term thinking, quality-first execution, and practical collaboration, helping customers create durable business value through responsive engineering support.'
  ),
  timelineTitle: {
    ...createEmptyLocalizedField(),
    zh: '发展历程',
    en: 'Milestones',
  },
  timeline: [
    createTimelineItem('2012', '公司成立', 'Company Founded', '确立电力设备配套解决方案方向。', 'Established the core direction for power equipment support solutions.'),
    createTimelineItem('2017', '产线升级', 'Production Upgrade', '完善关键产品制造与质量控制流程。', 'Improved manufacturing workflows and quality control for core product lines.'),
    createTimelineItem('2021', '海外拓展', 'Global Expansion', '持续服务国际项目与多区域客户。', 'Expanded support for international projects and multi-region customers.'),
  ],
  reportsTitle: {
    ...createEmptyLocalizedField(),
    zh: '检测报告',
    en: 'Testing Reports',
  },
  reportsDescription: {
    ...createEmptyLocalizedField(),
    zh: '围绕绝缘性能、机械强度与环境适应性，我们持续以权威检测结果支撑项目交付与客户选型。',
    en: 'We support project delivery and product selection with authoritative testing results covering insulation performance, mechanical strength, and environmental durability.',
  },
  reports: [
    createReportItem(
      '2025-08',
      '国家级高压电器检测报告',
      'National High-Voltage Electrical Test Report',
      '国家绝缘子避雷器质量检验检测中心',
      'National Insulator & Surge Arrester Quality Testing Center',
      '完成复合绝缘子工频耐受、污闪与机械载荷测试，验证长期运行可靠性。',
      'Validated composite insulators across power-frequency withstand, pollution flashover, and mechanical load tests for long-term reliability.'
    ),
    createReportItem(
      '2025-05',
      '复合绝缘子环境老化报告',
      'Composite Insulator Aging Report',
      '第三方电工材料实验室',
      'Independent Electrical Materials Laboratory',
      '针对高温、高湿、盐雾工况进行加速老化评估，确认材料稳定性与户外适配性。',
      'Accelerated aging evaluation under heat, humidity, and salt-spray conditions confirmed material stability for outdoor deployment.'
    ),
    createReportItem(
      '2024-12',
      '避雷器通流能力检测报告',
      'Surge Arrester Current Discharge Report',
      '高压输配电产品检验中心',
      'High-Voltage Transmission Product Inspection Center',
      '完成冲击电流与残压测试，为输配电项目提供型式验证依据。',
      'Impulse current and residual voltage tests provided type-verification evidence for transmission and distribution projects.'
    ),
  ],
  partnersTitle: {
    ...createEmptyLocalizedField(),
    zh: '合作伙伴',
    en: 'Partners',
  },
  partnersDescription: {
    ...createEmptyLocalizedField(),
    zh: '我们长期服务于电网、新能源、工业与海外项目客户。',
    en: 'We support utilities, renewable energy projects, industrial customers, and overseas engineering partners.',
  },
  partners: ['State Grid', 'Southern Grid', 'GE', 'Siemens', 'ABB', 'Hitachi'],
};

async function ensureAboutContentColumn() {
  await prisma.$executeRawUnsafe('ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "aboutContent" JSONB');
}

export function normalizeAboutContent(value: unknown): AboutContent {
  const source = isObject(value) ? value : {};
  const intro = isObject(source.intro) ? source.intro : {};
  const capability = isObject(source.capability) ? source.capability : {};
  const culture = isObject(source.culture) ? source.culture : {};

  return {
    heroTitle: mergeLocalizedField(source.heroTitle, defaultAboutContent.heroTitle),
    heroDescription: mergeLocalizedField(source.heroDescription, defaultAboutContent.heroDescription),
    intro: {
      title: mergeLocalizedField(intro.title, defaultAboutContent.intro.title),
      body: mergeLocalizedField(intro.body, defaultAboutContent.intro.body),
    },
    capability: {
      title: mergeLocalizedField(capability.title, defaultAboutContent.capability.title),
      body: mergeLocalizedField(capability.body, defaultAboutContent.capability.body),
    },
    culture: {
      title: mergeLocalizedField(culture.title, defaultAboutContent.culture.title),
      body: mergeLocalizedField(culture.body, defaultAboutContent.culture.body),
    },
    timelineTitle: mergeLocalizedField(source.timelineTitle, defaultAboutContent.timelineTitle),
    timeline: normalizeTimeline(source.timeline, defaultAboutContent.timeline),
    reportsTitle: mergeLocalizedField(source.reportsTitle, defaultAboutContent.reportsTitle),
    reportsDescription: mergeLocalizedField(source.reportsDescription, defaultAboutContent.reportsDescription),
    reports: normalizeReports(source.reports, defaultAboutContent.reports),
    partnersTitle: mergeLocalizedField(source.partnersTitle, defaultAboutContent.partnersTitle),
    partnersDescription: mergeLocalizedField(source.partnersDescription, defaultAboutContent.partnersDescription),
    partners: normalizePartners(source.partners, defaultAboutContent.partners),
  };
}

export async function getAboutContent(): Promise<AboutContent> {
  await ensureAboutContentColumn();
  const rows = await prisma.$queryRawUnsafe<AboutContentRow[]>(
    'SELECT "aboutContent" FROM "SiteConfig" WHERE id = $1 LIMIT 1',
    'default'
  );

  return normalizeAboutContent(rows[0]?.aboutContent ?? null);
}

export async function saveAboutContent(content: AboutContent) {
  await ensureAboutContentColumn();
  await prisma.$executeRawUnsafe(
    'UPDATE "SiteConfig" SET "aboutContent" = $1::jsonb WHERE id = $2',
    JSON.stringify(content),
    'default'
  );
}

function resolveLocalizedField(field: LocalizedField, locale: Locale) {
  return field[locale] || field[getFallbackLocale(locale)] || field.zh || '';
}

export function resolveAboutContent(content: AboutContent, locale: Locale): ResolvedAboutContent {
  return {
    heroTitle: resolveLocalizedField(content.heroTitle, locale),
    heroDescription: resolveLocalizedField(content.heroDescription, locale),
    intro: {
      title: resolveLocalizedField(content.intro.title, locale),
      body: resolveLocalizedField(content.intro.body, locale),
    },
    capability: {
      title: resolveLocalizedField(content.capability.title, locale),
      body: resolveLocalizedField(content.capability.body, locale),
    },
    culture: {
      title: resolveLocalizedField(content.culture.title, locale),
      body: resolveLocalizedField(content.culture.body, locale),
    },
    timelineTitle: resolveLocalizedField(content.timelineTitle, locale),
    timeline: content.timeline.map((item) => ({
      year: item.year,
      title: resolveLocalizedField(item.title, locale),
      description: resolveLocalizedField(item.description, locale),
    })),
    reportsTitle: resolveLocalizedField(content.reportsTitle, locale),
    reportsDescription: resolveLocalizedField(content.reportsDescription, locale),
    reports: content.reports.map((item) => ({
      date: item.date,
      title: resolveLocalizedField(item.title, locale),
      issuer: resolveLocalizedField(item.issuer, locale),
      summary: resolveLocalizedField(item.summary, locale),
      imageUrl: item.imageUrl,
      fileUrl: item.fileUrl,
    })),
    partnersTitle: resolveLocalizedField(content.partnersTitle, locale),
    partnersDescription: resolveLocalizedField(content.partnersDescription, locale),
    partners: content.partners,
  };
}
