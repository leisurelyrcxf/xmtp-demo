import { connectClientV3 } from './client-v3';

async function main() {
  try {
    console.log('=== XMTP V3 PoC 项目示例 ===');
    console.log('');
    
    // 连接XMTP V3客户端
    const client = await connectClientV3();
    
    console.log('Inbox ID:', client.inboxId);
    console.log('');
    console.log('✅ XMTP V3客户端初始化成功!');
    console.log('');
    console.log('📝 XMTP V3 主要变化:');
    console.log('- 使用 Inbox ID 而不是地址作为主要标识符');
    console.log('- 支持群组消息和直接消息');
    console.log('- 本地数据库自动管理');
    console.log('- 增强的安全性和性能');
    console.log('');
    console.log('接下来您可以使用以下命令:');
    console.log('发送消息: npm run send-v3 <接收者Inbox ID 或地址> <消息内容>');
    console.log('接收消息: npm run receive-v3 <对话Inbox ID>');
    console.log('');
    console.log('示例:');
    console.log(`npm run send-v3 ${client.inboxId} "Hello XMTP V3!"`);
    console.log(`npm run receive-v3 ${client.inboxId}`);
    
  } catch (error) {
    console.error('❌ 错误:', error instanceof Error ? error.message : error);
    console.log('');
    console.log('💡 提示:');
    console.log('- 确保您的私钥正确设置在 .env 文件中');
    console.log('- 检查网络连接');
    console.log('- XMTP V3 需要特定的环境配置');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 