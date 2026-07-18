# 产品中心六分类简化设计

## 目标

将现有“三级产品分类 + 产品详情页”简化为六个扁平分类。每个分类可由后台维护多个产品型号，前台卡片仅展示产品图片、分类、产品名称、型号和一行规格，不再进入产品详情页。

固定分类及顺序如下：

1. 悬式绝缘子 / Suspension Insulators
2. 支柱绝缘子 / Post Insulators
3. 玻璃绝缘子 / Glass Insulators
4. 穿墙套管 / Wall Bushings
5. 变压器套管 / Transformer Bushings
6. 环氧树脂绝缘子 / Epoxy Resin Insulators

## 数据模型

应用层统一使用 `productCategory` 概念，数据库继续用现有 `secondaryCategory` 保存六个稳定分类键。六项正好对应现有六个二级分类键，因此本地预览无需提前修改远程数据库结构；`primaryCategory` 仅为旧数据兼容同步更新，`tertiaryCategory` 在迁移后清空。

旧数据映射：

- `suspension-disc-insulators` -> `suspension-insulators`
- `post-insulators` -> `post-insulators`
- `glass-insulators` -> `glass-insulators`
- `wall-bushings` 及其所有三级分类 -> `wall-bushings`
- `transformer-bushings` -> `transformer-bushings`
- `epoxy-resin-insulators` -> `epoxy-resin-insulators`
- `surge-arresters` 或 `surge-protection` -> 删除产品记录

迁移脚本默认以 dry-run 运行，输出各映射数量、待删除避雷器数量和未映射记录。显式传入 `--apply` 后才在事务中更新和删除。

## 前台

产品中心保留“全部”并增加六个分类标签，移除二级分类下拉框。搜索继续匹配产品名称和型号。

产品卡片采用响应式三列/两列/一列网格，只显示：

- 产品图片
- 分类标签
- 产品名称
- 型号
- 一行简要规格

卡片本身不可点击，不显示描述、查看详情、箭头或详情按钮。产品资料下载区和底部询盘 CTA 保持不变。

顶部导航栏“产品中心”下拉菜单固定显示六个分类，最后保留“产品资料下载”。六个分类链接打开产品中心并激活对应筛选，“产品资料下载”链接到 `#documents`。

首页推荐产品卡片不再链接产品详情；首页仍可通过产品中心 CTA 进入产品列表。

## 详情 URL 与 SEO

不再从任何界面生成产品详情链接，sitemap 也不再包含产品详情 URL。已有 `/{locale}/products/{id}` 路径使用 Next.js `permanentRedirect` 返回 308 并跳转到对应语言的产品中心，避免旧外链直接变为 404。

## 后台

新建和编辑产品表单改为单一六选一分类。字段简化为：

- 中文产品名称
- 英文产品名称
- 型号
- 中文简要规格
- 英文简要规格
- 产品图片
- 自动翻译开关

详细描述不再显示或编辑。旧描述数据保留，新产品写入空字符串以兼容当前非空数据库列。新建产品要求上传图片，编辑产品未重新上传时保留原图。现有 Supabase 浏览器直传流程保持不变。

后台产品列表使用六分类筛选，并将“查看前台详情”改为“查看所属分类”。联系表单中的产品类型也同步为六分类。

## 验证标准

- 中英文导航下拉均按固定顺序显示六类和产品资料下载。
- 产品中心可以按六类筛选和按名称/型号搜索。
- 卡片无详情链接，只显示确认过的五项信息。
- 后台可以新建、编辑、上传图片，并保存六分类。
- 避雷器数据删除后不出现在数据库产品列表和前台。
- 旧详情 URL 返回 308 并跳转产品中心。
- sitemap 不再包含产品详情 URL。
- 桌面、平板、手机布局均无溢出或重叠。
