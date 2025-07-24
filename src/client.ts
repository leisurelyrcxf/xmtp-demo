import { Client } from '@xmtp/node-sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 生成数据库加密密钥
function generateEncryptionKey(): Uint8Array {
  return new Uint8Array([
    233, 120, 198, 96, 154, 65, 132, 17, 132, 96, 250, 40, 103, 35, 125, 64,
    166, 83, 208, 224, 254, 44, 205, 227, 175, 49, 234, 129, 74, 252, 135, 145,
  ]);
}

export async function connectClient(): Promise<Client> {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('请在.env文件中设置PRIVATE_KEY环境变量');
  }

  // 从私钥创建钱包
  const wallet = new ethers.Wallet(privateKey);
  console.log('正在连接XMTP V3客户端，地址:', wallet.address);

  // 创建符合XMTP V3要求的EOA Signer
  const signer = {
    type: "EOA" as const,
    getIdentifier: async () => wallet.address,
    signMessage: async (message: string) => {
      const signature = await wallet.signMessage(message);
      // 将十六进制字符串转换为Uint8Array
      return ethers.getBytes(signature);
    },
  };

  // 数据库加密密钥
  const dbEncryptionKey = generateEncryptionKey();

  // 创建XMTP V3客户端
  const client = await Client.create(signer, {
    env: process.env.XMTP_ENV as any || 'dev',
    dbEncryptionKey: dbEncryptionKey,
  });

  console.log('XMTP V3客户端连接成功!');
  console.log('Inbox ID:', client.inboxId);
  return client;
} 