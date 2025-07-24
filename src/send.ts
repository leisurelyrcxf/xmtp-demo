import { connectClient } from './client';

async function sendMessage() {
  try {
    // 读取命令行参数
    const args = process.argv.slice(2);
    if (args.length < 2) {
      console.error('用法: npm run send <接收者地址> <消息内容>');
      console.error('示例: npm run send 0x1234567890123456789012345678901234567890 "Hello XMTP!"');
      process.exit(1);
    }

    const [recipientAddress, messageContent] = args;
    
    console.log('正在发送消息...');
    console.log('接收者:', recipientAddress);
    console.log('消息内容:', messageContent);
    console.log('');

    // 连接XMTP客户端
    const client = await connectClient();

    // 检查接收者是否在XMTP网络上
    const canMessage = await client.canMessage(recipientAddress);
    if (!canMessage) {
      console.warn('⚠️  接收者可能还没有启用XMTP，但仍会尝试发送消息');
    }

    // 创建新对话
    const conversation = await client.conversations.newConversation(recipientAddress);
    console.log('对话已创建，话题ID:', conversation.topic);

    // 发送消息
    await conversation.send(messageContent);
    
    console.log('✅ 消息发送成功!');
    console.log('发送时间:', new Date().toLocaleString());

  } catch (error) {
    console.error('❌ 发送消息失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  sendMessage();
} 