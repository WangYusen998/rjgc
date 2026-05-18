# SwiftRide

SwiftRide 是一个校园共享电动滑板车项目，包含用户端、运营管理端和后端 API。
用户端网页
https://goswiftride.xyz
管理端网页
https://admin.goswiftride.xyz

## 目录结构

```text
backend/               Express + MySQL API
customer-miniprogram/  用户端，支持 H5/PWA 和微信小程序构建
management-web/        运营管理后台 Web
docs/                  项目说明和设计记录
```

已清理掉的内容包括：`node_modules`、构建产物、服务器部署副本、临时 zip 包、运行日志、调试截图和本机私有配置。

## 本地运行

### 1. 后端

```bash
cd backend
npm install
npm run start
```

默认 API 地址：

```text
http://127.0.0.1:8081/api
```

数据库初始化 SQL 位于：

```text
backend/sql/init_swiftride.sql
```

### 2. 用户端 H5

```bash
cd customer-miniprogram
npm install
npm run dev:h5
```

生产构建：

```bash
npm run build:h5
```

构建结果：

```text
customer-miniprogram/dist/build/h5
```

### 3. 微信小程序

```bash
cd customer-miniprogram
npm install
npm run build:mp-weixin
```

然后用微信开发者工具打开：

```text
customer-miniprogram/dist/build/mp-weixin
```

### 4. 管理后台

```bash
cd management-web
npm install
npm run dev
```

生产构建：

```bash
npm run build -- --base=/admin/
```

## 高德地图配置

用户端 H5 会读取服务器根目录下的：

```text
/amap-config.json
```

示例：

```json
{
  "key": "你的高德 Web端 JS API Key",
  "securityJsCode": "你的高德安全密钥"
}
```

没有配置 Key 时，地图页会回退到项目内置的校园示意图。

## 部署提示

用户端 H5 部署到服务器 Web 根目录；管理后台构建时使用 `/admin/` base 并部署到 Web 根目录的 `admin/` 子目录。


