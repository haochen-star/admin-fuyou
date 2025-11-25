# Admin Fuyou - 后台管理系统

基于 Vue3 + Element Plus + Pinia 的后台管理系统。

## 技术栈

- Vue 3
- Element Plus（按需自动导入）
- Pinia
- Vue Router
- Axios
- Vite
- unplugin-vue-components（组件自动导入）
- unplugin-auto-import（API 自动导入）

## 功能特性

- 用户登录认证
- 产品管理（增删改查）
- 产品类型选择
- 产品搜索
- 分页功能

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

## 构建生产版本

```bash
npm run build
```

## 预览生产版本

```bash
npm run preview
```

## API 配置

项目默认连接 `http://localhost:3000` 的 API 服务。如需修改，请编辑 `src/utils/request.js` 中的 `baseURL`。

## Element Plus 按需导入

项目已配置 Element Plus 按需自动导入，无需手动导入组件即可使用。组件和 API（如 `ElMessage`、`ElMessageBox`）会自动导入。

类型声明文件：
- `src/components.d.ts` - 组件类型声明（自动生成）
- `auto-imports.d.ts` - API 类型声明（自动生成）

## 项目结构

```
admin-fuyou/
├── src/
│   ├── api/          # API 接口
│   ├── components/   # 组件
│   ├── layouts/      # 布局
│   ├── router/       # 路由
│   ├── stores/       # Pinia stores
│   ├── utils/        # 工具函数
│   └── views/        # 页面
├── index.html
├── package.json
└── vite.config.js
```

