const { ethers } = require('ethers');

console.log('🔑 正在生成新的以太坊钱包...');
console.log('');

// 生成随机钱包
const wallet = ethers.Wallet.createRandom();

console.log('✅ 新钱包生成成功!');
console.log('');
console.log('📋 钱包信息：');
console.log('地址:', wallet.address);
console.log('私钥:', wallet.privateKey);
console.log('助记词:', wallet.mnemonic.phrase);
console.log('');
console.log('🔧 使用方法：');
console.log('1. 将以下内容复制到您的 .env 文件中：');
console.log('');
console.log(`PRIVATE_KEY=${wallet.privateKey.slice(2)}`);
console.log('XMTP_ENV=production');
console.log('');
console.log('⚠️  安全提醒：');
console.log('- 请妥善保管您的私钥和助记词');
console.log('- 不要与任何人分享');
console.log('- 这是测试钱包，不要存入真实资产');
console.log('- 如需真实使用，请向该地址转入少量ETH作为gas费'); 