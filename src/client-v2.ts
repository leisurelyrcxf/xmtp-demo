// 注意：这需要安装 @xmtp/xmtp-js 而不是 @xmtp/node-sdk
// npm install @xmtp/xmtp-js

import { ethers } from 'ethers';
import dotenv from 'dotenv';

// 如果要使用V2，需要：
// import { Client } from '@xmtp/xmtp-js';

// 加载环境变量
dotenv.config();

export async function connectClientV2() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('请在.env文件中设置PRIVATE_KEY环境变量');
  }

  // V2 方式：直接使用 ethers.Wallet 作为 signer！
  const signer = new ethers.Wallet(privateKey);
  console.log('正在连接XMTP V2客户端，地址:', signer.address);

  // V2 的简单创建方式
  /*
  const client = await Client.create(signer, { 
    env: process.env.XMTP_ENV as any || 'dev' 
  });
  */

  console.log('✅ V2 方式：直接使用 ethers.Wallet！');
  console.log('🔧 V2 特点：');
  console.log('  - 直接传入 ethers.Wallet 实例');
  console.log('  - 不需要复杂的接口');
  console.log('  - signMessage() 返回 string');
  console.log('  - 只支持以太坊地址');
  
  return null; // 由于我们没有安装V2包，这里返回null
} 