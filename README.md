# XMTP PoC 项目

这是一个基于 Node.js 和 TypeScript 的 XMTP (Extensible Message Transport Protocol) 概念验证项目。该项目演示了如何使用 XMTP 协议在以太坊地址之间发送和接收去中心化消息。

## 功能特性

- ✅ XMTP 客户端初始化
- ✅ 发送消息到指定以太坊地址
- ✅ 实时监听和接收消息
- ✅ TypeScript 严格模式支持
- ✅ 环境变量配置管理

## 项目结构

```
xmtp/
├── src/
│   ├── index.ts      # 主入口文件
│   ├── client.ts     # XMTP客户端初始化
│   ├── send.ts       # 发送消息示例
│   └── receive.ts    # 接收消息示例
├── package.json      # 项目配置
├── tsconfig.json     # TypeScript配置
├── .env.example      # 环境变量示例
└── README.md         # 项目说明
```

## 前置条件

1. **Node.js** (版本 16 或更高)
2. **npm** 或 **yarn** 包管理器
3. **以太坊私钥** (用于签名和身份验证)

## 安装步骤

### 1. 克隆项目并安装依赖

```bash
# 安装依赖
npm install
```

### 2. 配置环境变量

复制环境变量示例文件并编辑：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入您的配置：

```env
# 您的以太坊私钥 (不包含0x前缀)
PRIVATE_KEY=your_ethereum_private_key_here

# XMTP网络环境 (local, dev, production)
XMTP_ENV=local
```

⚠️ **安全提醒**: 
- 请确保您的私钥安全，不要将包含真实私钥的 `.env` 文件提交到版本控制系统
- 建议使用测试网络的私钥进行开发

### 3. 编译项目 (可选)

```bash
npm run build
```

## 使用方法

### 运行主程序

```bash
npm start
```

这将初始化 XMTP 客户端并显示可用的命令。

### 发送消息

向指定以太坊地址发送消息：

```bash
npm run send <接收者地址> <消息内容>
```

**示例：**
```bash
npm run send 0x1234567890123456789012345678901234567890 "Hello XMTP!"
npm run send 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 "测试消息"
```

### 监听消息

监听来自指定地址的消息：

```bash
npm run receive <对话地址>
```

**示例：**
```bash
npm run receive 0x1234567890123456789012345678901234567890
```

按 `Ctrl+C` 可以停止监听。

## 项目脚本说明

| 脚本 | 描述 |
|------|------|
| `npm start` | 运行主程序，初始化客户端 |
| `npm run build` | 编译 TypeScript 代码到 dist/ 目录 |
| `npm run send` | 发送消息到指定地址 |
| `npm run receive` | 监听指定地址的消息 |

## 技术栈

- **Node.js** - JavaScript 运行时环境
- **TypeScript** - 类型安全的 JavaScript 超集
- **@xmtp/xmtp-js** - XMTP JavaScript SDK
- **ethers** - 以太坊 JavaScript 库
- **dotenv** - 环境变量管理

## 常见问题

### Q: 我收到"请在.env文件中设置PRIVATE_KEY环境变量"错误
A: 请确保您已正确创建 `.env` 文件并设置了 `PRIVATE_KEY` 变量。

### Q: 消息发送失败
A: 请检查：
1. 接收者地址格式是否正确
2. 您的私钥是否有效
3. 网络连接是否正常

### Q: 接收者显示"可能还没有启用XMTP"
A: 这是正常的，接收者需要先初始化 XMTP 客户端才能接收消息。

## 开发注意事项

1. **网络环境**: 项目默认使用 `local` 环境，您可以在 `.env` 文件中修改 `XMTP_ENV` 为 `dev` 或 `production`
2. **私钥安全**: 永远不要在代码中硬编码私钥，始终使用环境变量
3. **错误处理**: 所有脚本都包含适当的错误处理和用户友好的提示消息

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

ISC

---

**免责声明**: 这是一个概念验证项目，仅用于学习和开发目的。在生产环境中使用前请进行充分的安全审查。 