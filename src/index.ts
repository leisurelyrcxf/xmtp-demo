import { connectClient } from './client';

async function main() {
  try {
    console.log('=== XMTP PoC 项目示例 ===');
    console.log('');
    
    // 连接XMTP客户端
    const client = await connectClient();
    
    console.log('客户端地址:', client.address);
    console.log('');
    console.log('✅ XMTP客户端初始化成功!');
    console.log('');
    console.log('接下来您可以使用以下命令:');
    console.log('发送消息: npm run send <接收者地址> <消息内容>');
    console.log('接收消息: npm run receive <对话地址>');
    console.log('');
    console.log('示例:');
    console.log('npm run send 0x1234567890123456789012345678901234567890 "Hello XMTP!"');
    console.log('npm run receive 0x1234567890123456789012345678901234567890');
    
  } catch (error) {
    console.error('❌ 错误:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 