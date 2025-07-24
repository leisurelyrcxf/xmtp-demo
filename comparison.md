# XMTP Signer 接口对比：V2 vs V3

## V2 方式（简单直接）

```typescript
import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';

// V2: 直接使用 ethers.Wallet 作为 signer
const signer = new ethers.Wallet(privateKey);

const client = await Client.create(signer, { 
  env: 'dev' 
});

// V2 特点：
// - 直接使用 ethers.Wallet 实例
// - 简单易用
// - 只支持以太坊地址
// - 返回类型是 string
```

## V3 方式（更复杂但更强大）

```typescript
import { Client } from '@xmtp/node-sdk';
import { ethers } from 'ethers';

// V3: 必须创建符合特定接口的对象
const wallet = new ethers.Wallet(privateKey);  // 1. 先创建钱包

const signer = {                               // 2. 创建符合V3接口的signer
  type: "EOA",                                // 账户类型标识
  getIdentifier: async () => ({               // 身份标识方法
    identifierKind: 0,                       // 0 = ETHEREUM 类型
    identifier: wallet.address,              // 具体地址
  }),
  signMessage: async (message: string) => {   // 签名方法
    const signature = await wallet.signMessage(message);
    return ethers.getBytes(signature);       // 必须返回 Uint8Array
  },
};

const client = await Client.create(signer, {
  env: 'dev',
  dbEncryptionKey: encryptionKey,            // V3 新增：数据库加密
});

// V3 特点：
// - 需要实现特定接口
// - 支持多种身份类型（EOA, SCW, 未来的Passkeys）
// - 返回类型是 Uint8Array
// - 需要数据库加密密钥
// - 更强的类型安全
```

## 为什么要改变？

### 1. 多身份支持
V3 支持不同类型的账户：
- EOA (Externally Owned Account) - 普通以太坊账户
- SCW (Smart Contract Wallet) - 智能合约钱包
- 未来: Passkeys, 其他认证方式

### 2. 更好的类型安全
V2: `signMessage() → string`
V3: `signMessage() → Uint8Array`

### 3. 统一的身份标识
V2: 只有地址 `"0x123..."`
V3: 完整身份信息 `{ identifierKind: 0, identifier: "0x123..." }`

### 4. 向前兼容性
V3 的设计允许未来添加新的身份类型而不破坏现有代码 