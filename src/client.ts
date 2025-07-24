import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export async function connectClient(): Promise<Client> {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('请在.env文件中设置PRIVATE_KEY环境变量');
  }

  // 从私钥创建钱包签名器
  const signer = new ethers.Wallet(privateKey);
  console.log('正在连接XMTP客户端，地址:', signer.address);

  // 创建XMTP客户端
  const client = await Client.create(signer, { 
    env: process.env.XMTP_ENV as any || 'dev' 
  });

  console.log('XMTP客户端连接成功!');
  return client;
} 