export const NAV_LINKS = [
  { id: '/', label: '首页' },
  { id: '/about', label: '关于我们', sub: ['公司简介', '发展历程', '资质荣誉', '企业文化'] },
  { id: '/products', label: '产品中心', sub: ['绝缘子系列', '避雷器系列', '开关设备系列', '配套组件系列'] },
  { id: '/news', label: '新闻资讯' },
  { id: '/contact', label: '联系我们' }
];

export const PRODUCTS_DATA = [
  { id: 'p1', category: '绝缘子系列', name: '支柱复合绝缘子', model: 'FZSW-110/10', desc: '适用于高压输电线路，具有优异的耐污闪性能和极高的机械强度。', specs: ['110kV~500kV', '120kN', 'IP65'] },
  { id: 'p2', category: '绝缘子系列', name: '空心复合绝缘子', model: 'FXBW-220/120', desc: '采用优质硅橡胶外套，专为变电站高压设备提供绝缘支撑。', specs: ['220kV', '100kN', 'IP65'] },
  { id: 'p3', category: '绝缘子系列', name: '线路复合绝缘子', model: 'FXBW4-35/70', desc: '重量轻、防污闪能力强，适用于各种复杂气候条件下的架空线路。', specs: ['35kV', '70kN', 'IP54'] },
  { id: 'p4', category: '避雷器系列', name: '氧化锌避雷器', model: 'Y5W-12/30', desc: '提供卓越的过电压保护，响应速度快，通流容量大。', specs: ['12kV', '大通流', '免维护'] },
  { id: 'p5', category: '避雷器系列', name: '配电型避雷器', model: 'HY5WS-17/50', desc: '专为配电网络设计，有效防止雷电过电压对设备的损害。', specs: ['17kV', '50kA', '长寿命'] },
  { id: 'p6', category: '开关设备系列', name: '高压隔离开关', model: 'GW4-110DW', desc: '性能稳定，操作灵活，是变电站中隔离电源的关键设备。', specs: ['110kV', '电动/手动', '防冰冻'] },
  { id: 'p7', category: '开关设备系列', name: '环保型环网柜', model: 'HXGN-12', desc: '采用环保气体绝缘，体积小巧，适用于城市配电网络。', specs: ['12kV', 'SF6 Free', '智能化'] },
  { id: 'p8', category: '配套组件系列', name: '防雷金具', model: 'FL-01', desc: '高强度合金制造，配合绝缘子和避雷器使用，保障线路安全。', specs: ['高强度', '防腐蚀', '易安装'] },
];


export const NEWS_DATA = [
  { id: 'n1', title: '公司荣获2025年度国家科技进步奖', date: '2025-12-15', category: '公司动态', desc: '凭借在特高压绝缘材料领域的重大技术突破，我司主导的研发项目荣获国家科技进步二等奖。', tags: ['获奖', '研发'] },
  { id: 'n2', title: '新一代复合绝缘子产品通过国际认证', date: '2025-11-28', category: '行业新闻', desc: '我司最新研发的耐高寒复合绝缘子顺利通过KEMA国际权威测试认证，标志着技术水平达到国际领先。', tags: ['认证', '国际化'] },
  { id: 'n3', title: '公司参展第25届国际电力设备展览会', date: '2025-11-10', category: '公司动态', desc: '携全系列智能电力配套产品亮相EP China 2025，吸引了众多国内外客户的关注与洽谈。', tags: ['展会', '市场'] },
  { id: 'n4', title: '与某央企签署战略合作框架协议', date: '2025-10-22', category: '媒体报道', desc: '双方将在新能源输配电设备研发、重点工程建设等领域展开全面深度合作，共谋发展。', tags: ['合作', '签约'] }
];

export const PARTNERS = [
  '国家电网', '南方电网', '中国能建', '中国电建', 'GE', 'Siemens', 
  'ABB', 'Hitachi', '施耐德', '许继电气', '特变电工', '正泰电器'
];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
];
