import { connectClientV3 } from './client';

async function receiveMessages() {
  try {
    // 读取命令行参数
    const args = process.argv.slice(2);
    if (args.length < 1) {
      console.error('用法: npm run receive <对话地址或Inbox ID>');
      console.error('示例: npm run receive 0x1234567890123456789012345678901234567890');
      process.exit(1);
    }

    const [conversationAddress] = args;
    
    console.log('正在连接并监听消息...');
    console.log('对话地址/Inbox ID:', conversationAddress);
    console.log('按 Ctrl+C 退出监听');
    console.log('');

    // 连接XMTP V3客户端
    const client = await connectClientV3();

    try {
      // V3: 获取所有对话并查找匹配的对话
      console.log('正在获取对话列表...');
      const conversations = await client.conversations.list();
      
      let targetConversation: any = null;
      
      // 查找匹配的对话
      for (const conversation of conversations) {
        // 简化查找逻辑，使用any类型避免类型错误
        if ((conversation as any).members && (conversation as any).members.length === 2) {
          const otherMember = (conversation as any).members.find((member: any) => 
            member.inboxId !== client.inboxId
          );
          if (otherMember && (
            otherMember.inboxId === conversationAddress || 
            (otherMember.addresses && otherMember.addresses.includes(conversationAddress))
          )) {
            targetConversation = conversation;
            break;
          }
        }
      }

      if (!targetConversation) {
        console.warn('⚠️  未找到与该地址的对话');
        console.log('💡 提示：请先发送一条消息来创建对话');
        return;
      }

      console.log('✅ 找到对话，正在监听新消息...');
      console.log('');

      // V3: 监听新消息流
      for await (const message of await targetConversation.streamMessages()) {
        const timestamp = new Date((message as any).sentAtNs / 1000000).toLocaleString();
        const sender = (message as any).senderInboxId || 'Unknown';
        const content = (message as any).content || message;
        
        console.log(`[${timestamp}] ${sender}:`);
        console.log(`  ${content}`);
        console.log('');
      }

    } catch (apiError) {
      console.warn('⚠️  API调用失败:', apiError);
      console.log('');
      console.log('💡 提示：');
      console.log('- 确保对方已启用XMTP V3');
      console.log('- 尝试使用对方的Inbox ID而不是地址');
      console.log('- 检查地址格式是否正确');
    }

  } catch (error) {
    console.error('❌ 接收消息失败:', error instanceof Error ? error.message : error);
    console.log('');
    console.log('🔧 故障排除：');
    console.log('- 检查网络连接');
    console.log('- 确认PRIVATE_KEY环境变量设置正确');
    console.log('- 确认XMTP_ENV环境变量设置正确');
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