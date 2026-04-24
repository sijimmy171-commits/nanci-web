# 外贸企业官网全栈开发方案

基于 Next.js App Router、React、Tailwind、Prisma、NextAuth 与多语言内容架构，建设一个面向全球销售的工业 / 电力设备企业官网，并提供可持续维护的后台系统。

## 当前状态
- 前台已完成 `en` 默认站点与 `zh` 可选站点
- 第一优先级语言已完成架构预留：`en`、`zh`、`es`、`fr`、`ar`、`ru`、`de`、`id`、`vi`
- 站点公共文案已接入统一多语言内容源，并支持后台集中维护
- 产品内容已接入多语言存储结构，支持中文、英文主版本与自动翻译扩展
- 关于我们、工程案例、新闻动态已完成前后台基础闭环，并支持详情页与后台编辑
- 微信二维码、产品图片与产品 PDF 已完成后台上传与前台联动
- 产品 PDF 已进一步拆分为独立资料库，并改为产品中心底部统一下载弹窗
- 首页已补齐 Hero 轮播、核心优势带、关于预览、检测报告与底部 CTA 区块
- 首页已按最新确认回调为更简洁的高级版结构，仅保留 Banner 自动轮播为动态首屏
- 首页 Banner 底部已移除滚动鼠标提示，仅保留轮播分页指示器，避免与轮播交互冲突
- 顶部导航已支持“关于我们 / 产品中心”二级菜单（桌面悬停下拉、移动端折叠展开）
- 产品中心已切换为专业三级分类数据结构：`绝缘子系列 / 套管系列 / 过电压保护设备`，并支持二级/三级细分录入与前台筛选
- 关于我们页已新增“检测报告”图片区块，并复用后台 `aboutContent` 统一维护
- 后台关于我们页已支持检测报告图片上传、预览与编辑
- 联系表单、询盘存储、后台列表与邮件通知已补齐 `phone` 字段链路
- 后台询盘中心已支持 `PENDING / READ / REPLIED` 状态流转、状态筛选与服务端更新动作
- 后台已补强 Next.js 16 `proxy.ts` 访问保护，并为后台 Server Action 增加管理员权限校验
- 已修复后台设置页保存联系方式时的生产错误：`SiteConfig.updatedAt` 在原生 upsert 中显式写入，并为联系方式 / JSON 扩展列补齐运行时自修复与瞬时数据库连接重试
- 已按 Next.js 16 `src/app` 项目约定将后台访问保护迁移到 `src/proxy.ts`，未登录访问后台数据页现返回登录页 307 跳转
- 后台产品列表已支持真实搜索、一级分类、具体分类与归档状态筛选，并标记旧分类兼容 / 需重新归类数据
- 已修复 Next.js 16 生产构建链路：`npm run build` 现使用 `next build --webpack` 并通过验证
- 前台多语言 CMS 页面与后台管理页已统一设为运行时动态渲染，避免 build 阶段并发访问数据库
- 上传资源已接入生产持久化策略：优先使用 Supabase Storage，未配置时回退本地 `public/uploads`
- 当前主要剩余工作集中在：SMTP 邮箱发送配置与上线后人工验收

## 用户与业务核心
> [!IMPORTANT]
> 面向全球销售场景，推荐使用 **Vercel (Global)** 托管前端与服务端渲染逻辑，数据库继续托管在 **Supabase (Singapore)**，兼顾海外访问速度、可维护性与部署便利性。

## 方案调整

### 数据库层 [Prisma 7 适配]
- 使用 `pg` + `PrismaPg` 适配器以适应当前运行环境
- Prisma client 当前未完全覆盖所有新增 JSON / 扩展字段时，采用原生 SQL 辅助读写，避免阻塞迭代

### 后台管理 [Phase 3]
- **认证系统**：已接入 NextAuth，后台登录与基础访问链路可用
- **权限保护**：后台路由已接入根目录 `proxy.ts` 登录与 `ADMIN` 角色检查，后台写操作已统一调用服务端管理员校验
- **配置中心**：已支持维护 Hero、联系方式、页脚与产品/联系页公共文案，并支持上传 WeChat 二维码
- **关于我们**：已支持品牌介绍、能力说明、发展历程、合作伙伴等内容维护
- **产品管理**：已支持产品 CRUD、多语言产品内容结构，以及图片上传
- **产品分类**：已补充一级分类导航入口、产品页按一级类筛选，以及后台按一级/二级/三级分类录入
- **产品资料库**：已支持独立维护产品中心汇总 PDF 文档，并在前台通过弹窗列表下载
- **工程案例**：已支持案例 CRUD、发布状态与详情页内容维护
- **新闻动态**：已支持新闻 CRUD、发布状态与详情页内容维护
- **询盘中心**：已完成列表展示、前台入库、邮件通知、状态流转与后台筛选

### 多语言内容中台 [Phase 3.5 / Phase 4 前置]
- **默认语言策略**：英文为默认站点语言，中文保留为第二个前台可选语言
- **语言范围**：第一优先级语言为 `en`、`zh`、`es`、`fr`、`ar`、`ru`、`de`、`id`、`vi`
- **统一内容源**：站点公共文案、关于我们、产品内容均已纳入统一多语言数据结构
- **后台维护方式**：后台集中维护中文与英文主版本，其余优先语言通过自动翻译补全
- **同步替换要求**：后续修改中文源文案后，可通过统一入口同步更新各语言版本，避免散落手改

### 自动翻译策略 [新增]
- **站点级文案**：已支持在后台保存时自动同步到优先语言
- **产品级文案**：已支持产品名称、描述、规格的自动翻译扩展
- **环境依赖**：配置 `OPENAI_API_KEY` 后可启用自动翻译；未配置时系统自动回退英文版本，不阻塞发布

### 部署与上线 [Phase 6]
- **托管平台**：Vercel
- **资源存储**：Supabase Storage，用于产品图片、微信二维码、检测报告图片与产品资料 PDF
- **域名接入**：已接入 `insulatorschina.com` 与 `www.insulatorschina.com`，Cloudflare DNS 与 SSL/TLS Full 已完成基础配置
- **生产配置**：数据库、认证与 Supabase Storage 已完成；SMTP 邮箱发送仍待配置，OpenAI 自动翻译可按需后续配置

### 上传资源策略 [新增]
- **生产环境**：配置 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`SUPABASE_STORAGE_BUCKET` 后，上传文件会写入 Supabase Storage，并返回公开访问 URL
- **可选 CDN / 自定义域名**：如使用自定义资源域名，可配置 `SUPABASE_STORAGE_PUBLIC_URL`
- **本地开发回退**：未配置 Supabase Storage 环境变量时，继续写入 `public/uploads/{folder}`，方便本地调试
- **上传范围**：当前统一覆盖产品图片、联系页微信二维码、关于我们检测报告图片与产品中心资料库 PDF
- **Next.js 配置**：已为 Server Actions 上传设置 `bodySizeLimit: '20mb'`，并按 Supabase Storage URL 自动生成 `next/image` 远程图片白名单

---

## 仍需完成的重点事项
- SMTP 邮箱发送环境变量配置与真实邮件送达验证
- 上线后后台人工验收：登录、保存、上传、询盘状态流转

## 下一步执行建议
1. 在 Vercel 配置 `SMTP_HOST`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASS`、`ADMIN_RECEIVE_EMAIL`，然后重新部署并提交一条测试询盘。
2. 将前台联系方式从演示值替换为正式邮箱、电话、WhatsApp 与地址。
3. 上线后在正式域名完成一次后台人工验收，覆盖保存、上传、前台同步和询盘状态流转。

## 验证计划

### 自动化验证
- [x] `npm run lint`
- [x] `npx tsc --noEmit`
- [x] `npm run build`
说明：Next.js 16 默认 Turbopack 构建在当前 Windows 环境中出现 `.next` 文件锁定 / rename 问题，已按本地 CLI 文档切换为 `next build --webpack`；同时将前台多语言 CMS 与后台管理路由设为动态渲染，最终构建已通过。本轮接入 Supabase Storage 上传适配后，以上三项验证仍全部通过。

### 手动验证
- [x] 访问 `/admin` 并完成后台登录
- [x] 提交联系表单并写入 `Inquiry`
- [x] 切换 `zh / en` 页面并检查首页、产品页、联系页文案输出
- [x] 在后台修改站点文案后验证前台同步
- [x] 访问 `/en/about`、`/en/cases`、`/en/news` 与对应后台管理页
- [x] 验证上传能力相关页面与产品/联系页资源链路已可访问
- [x] 访问 `/en`、`/en/about`、`/en/contact`、`/admin/about` 并确认返回 `200`
- [x] 访问 `/zh`、`/zh/products?primary=insulators`、`/admin/products`、`/admin/products/new` 并确认返回 `200`
- [x] 访问 `/admin/inquiries` 与 `?status=PENDING / READ / REPLIED` 并确认返回 `200`
- [x] 未登录访问 `/admin/products` 返回 `307` 并重定向到 `/admin/login?callbackUrl=...`
- [x] 访问 `/admin/login` 返回 `200`
- [x] 访问 `/admin/products?primary=insulators&status=legacy`，确认后台产品筛选页可渲染并展示分类校对信息
- [x] 2026-04-24 本地生产 smoke test：`/zh` 与 `/admin/login` 可访问，未登录访问后台数据页仅返回登录鉴权壳，不渲染后台业务内容
- [x] 2026-04-24 完整自动验证：`npx tsc --noEmit`、`npm run lint`、`npm run build` 全部通过
- [x] 2026-04-24 后台设置页生产错误定位：Vercel runtime logs 确认 `POST /admin/settings` 因 `SiteConfig.updatedAt` NOT NULL 且原生 SQL 未赋值触发 `23502`
- [x] 2026-04-24 本地生产浏览器验证：登录后台后在设置页不上传 WeChat 二维码、保留空 file input 并保存电话，成功跳转 `/admin/settings?status=saved&translation=manual`
- [x] 2026-04-24 后台 smoke test：未登录访问 `/admin/products` 返回 `307 -> /admin/login?callbackUrl=...`；已登录访问产品、案例、新闻、产品资料库、关于我们检测报告、询盘及询盘状态筛选页面均有内容渲染
- [ ] 配置 SMTP 后，验证真实询盘邮件送达
- [ ] 验证询盘状态更新按钮的完整人工操作流程
