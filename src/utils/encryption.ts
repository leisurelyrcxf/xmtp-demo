import { ethers } from 'ethers';
import crypto from 'crypto';

/**
 * 数据库加密密钥生成器
 * XMTP V3 需要32字节的加密密钥来保护本地数据库
 */
export class EncryptionKeyManager {
  
  /**
   * 方法1: 生成随机密钥（每次不同）
   * 优点：最安全
   * 缺点：每次启动都会创建新数据库
   */
  static generateRandomKey(): Uint8Array {
    return crypto.randomBytes(32);
  }
  
  /**
   * 方法2: 从私钥派生密钥（推荐）
   * 优点：同一私钥总是生成相同密钥，数据库持久化
   * 缺点：与私钥关联
   */
  static deriveFromPrivateKey(privateKey: string): Uint8Array {
    // 使用 PBKDF2 从私钥派生密钥
    const salt = 'xmtp-v3-database-encryption'; // 固定盐值
    const key = crypto.pbkdf2Sync(privateKey, salt, 100000, 32, 'sha256');
    return new Uint8Array(key);
  }
  
  /**
   * 方法3: 固定密钥（仅用于开发/测试）
   * 优点：简单一致
   * 缺点：不安全，所有用户使用相同密钥
   */
  static getFixedKey(): Uint8Array {
    return new Uint8Array([
      233, 120, 198, 96, 154, 65, 132, 17, 132, 96, 250, 40, 103, 35, 125, 64,
      166, 83, 208, 224, 254, 44, 205, 227, 175, 49, 234, 129, 74, 252, 135, 145,
    ]);
  }
  
  /**
   * 方法4: 用户自定义密码派生（最安全）
   * 用户可以设置自己的密码来保护数据库
   */
  static deriveFromPassword(password: string, userAddress: string): Uint8Array {
    const salt = `xmtp-v3-${userAddress}`;
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    return new Uint8Array(key);
  }
}

/**
 * 数据库加密的重要性说明
 */
export const WHY_ENCRYPTION_MATTERS = {
  security: [
    '🔒 保护私人消息内容',
    '🔒 保护对话元数据', 
    '🔒 保护加密密钥材料',
    '🔒 防止本地数据泄露'
  ],
  
  performance: [
    '⚡ 离线访问消息历史',
    '⚡ 快速加载对话列表',
    '⚡ 减少网络请求',
    '⚡ 改善用户体验'
  ],
  
  compliance: [
    '📋 满足数据保护法规',
    '📋 企业级安全要求',
    '📋 隐私最佳实践',
    '📋 端到端加密保证'
  ]
}; 