# SwiftRide Backend (MySQL)

小程序不能直接连�?MySQL。正确结构是�?
```text
微信小程�?-> Node/Express 后端 API -> MySQL 数据�?```

## 需要的软件

- MySQL Server 8.x �?MariaDB，用来存储用户、车辆、订单、问题反馈和管理员数据�?- MySQL Workbench �?DBeaver，可选，用来可视化查看数据库�?- Node.js，用来运行本项目已有�?Express 后端�?- 微信开发者工具，用来运行小程序�?
## 初始化数据库

先确�?`.env` 里的账号密码与你本机 MySQL 一致：

```text
PORT=8080
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=swiftride
```

然后执行�?
```bash
mysql -u root -p < sql/init_swiftride.sql
```

如果你的 MySQL 没有密码，使用：

```bash
mysql -u root < sql/init_swiftride.sql
```

## 启动后端

```bash
npm install
npm run start
```

后端地址：`http://127.0.0.1:8080/api`

测试接口�?
```bash
curl http://127.0.0.1:8080/api/health
```

返回 `{ "ok": true }` 就表�?MySQL 已连通�?
## 当前接口

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/recover`
- `GET /api/stores`
- `GET /api/scooters`
- `GET /api/scooters/:code`
- `PATCH /api/scooters/:code`
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/:code`
- `GET /api/issues`
- `POST /api/issues`
- `PATCH /api/issues/:code`
- `GET /api/admin/dashboard`

## 演示账号

- 用户：`student001 / 123456`
- 管理员：`admin / 123456`
- 英国用户：`ukuser / 123456`

## 手机真机说明

在微信开发者工具模拟器里，`127.0.0.1` 指向电脑本机，可以直接请求后端。真机扫码预览时，手机的 `127.0.0.1` 指向手机自己，所以需要把小程�?API 地址改为电脑局域网 IP，例如：

```text
http://192.168.1.23:8080/api
```

并保证电脑和手机在同一�?Wi-Fi，Windows 防火墙允�?Node.js 访问 `8080` 端口�?


