import { Client } from '@xmtp/node-sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { EncryptionKeyManager, WHY_ENCRYPTION_MATTERS } from './utils/encryption';

// 加载环境变量
dotenv.config();

export async function connectClientV3(): Promise<Client> {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('请在.env文件中设置PRIVATE_KEY环境变量');
  }

  try {
    console.log('=== XMTP V3 本地数据库加密说明 ===');
    console.log('');
    console.log('🔐 为什么V3需要数据库加密密钥？');
    console.log('');
    console.log('📊 安全性：');
    WHY_ENCRYPTION_MATTERS.security.forEach(item => console.log('  ' + item));
    console.log('');
    console.log('⚡ 性能优势：');
    WHY_ENCRYPTION_MATTERS.performance.forEach(item => console.log('  ' + item));
    console.log('');
    
    console.log('正在尝试连接XMTP V3客户端...');
    
    // 从私钥创建钱包
    const wallet = new ethers.Wallet(privateKey);
    console.log('钱包地址:', wallet.address);

    // 使用更安全的密钥派生方法
    console.log('🔑 正在从私钥派生数据库加密密钥...');
    const dbEncryptionKey = EncryptionKeyManager.deriveFromPrivateKey(privateKey);
    console.log('✅ 数据库加密密钥已生成（32字节）');

    // 正确的signer配置，使用数字枚举值
    const signer: any = {
      type: "EOA",
      getIdentifier: async () => ({
        identifierKind: 0, // 0 表示 ETHEREUM 类型
        identifier: wallet.address,
      }),
      signMessage: async (message: string) => {
        const signature = await wallet.signMessage(message);
        return ethers.getBytes(signature);
      },
    };

    // 创建XMTP V3客户端（包含本地加密数据库）
    const client = await Client.create(signer, {
      env: process.env.XMTP_ENV as any || 'dev',
      dbEncryptionKey: dbEncryptionKey,  // 这个密钥用于加密本地数据库！
    });

    console.log('✅ XMTP V3客户端连接成功!');
    console.log('Inbox ID:', client.inboxId);
    console.log('🗄️  本地加密数据库已初始化');
    return client;
    
  } catch (error) {
    console.error('❌ XMTP V3连接失败:', error);
    throw error;
  }
} 