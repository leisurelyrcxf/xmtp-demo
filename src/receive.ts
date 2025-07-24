import { connectClient } from './client';

async function receiveMessages() {
  try {
    // 读取命令行参数
    const args = process.argv.slice(2);
    if (args.length < 1) {
      console.error('用法: npm run receive <对话地址>');
      console.error('示例: npm run receive 0x1234567890123456789012345678901234567890');
      process.exit(1);
    }

    const [conversationAddress] = args;
    
    console.log('正在连接并监听消息...');
    console.log('对话地址:', conversationAddress);
    console.log('按 Ctrl+C 退出监听');
    console.log('');

    // 连接XMTP客户端
    const client = await connectClient();

    // 检查是否可以与该地址通信
    const canMessage = await client.canMessage(conversationAddress);
    if (!canMessage) {
      console.warn('⚠️  目标地址可能还没有启用XMTP');
      return;
    }

    // 打开与指定地址的对话
    const conversation = await client.conversations.newConversation(conversationAddress);
    console.log('✅ 对话已连接，话题ID:', conversation.topic);
    console.log('正在监听新消息...');
    console.log('');

    // 监听新消息流
    for await (const message of await conversation.streamMessages()) {
      const timestamp = new Date(message.sent).toLocaleString();
      const sender = message.senderAddress;
      const content = message.content;
      
      console.log(`[${timestamp}] ${sender}:`);
      console.log(`  ${content}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ 接收消息失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// 处理优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 停止监听消息');
  process.exit(0);
});

if (require.main === module) {
  receiveMessages();
} 