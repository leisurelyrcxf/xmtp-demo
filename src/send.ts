import { connectClientV3 } from './client'

async function sendMessage() {
  try {
    // 读取命令行参数
    const args = process.argv.slice(2);
    if (args.length < 2) {
      console.error('用法: npm run send <接收者地址或Inbox ID> <消息内容>');
      console.error('示例: npm run send 0x1234567890123456789012345678901234567890 "Hello XMTP!"');
      process.exit(1);
    }

    const [recipientAddress, messageContent] = args;
    
    console.log('正在发送消息...');
    console.log('接收者:', recipientAddress);
    console.log('消息内容:', messageContent);
    console.log('');

    // 连接XMTP V3客户端
    const client = await connectClientV3();

    try {
      // V3: 尝试创建群组对话（因为findOrCreateDm不存在）
      console.log('正在创建群组对话...');
      const conversation = await (client.conversations as any).createGroup([recipientAddress]);
      console.log('群组对话已创建，对话ID:', (conversation as any).id);

      // V3: 发送消息
      await conversation.send(messageContent);
      
      console.log('✅ 消息发送成功!');
      console.log('发送时间:', new Date().toLocaleString());

    } catch (groupError) {
      console.warn('⚠️  群组创建失败，尝试其他方法...');
      
      try {
        // 备选方案：查找现有对话
        console.log('正在查找现有对话...');
        const conversations = await client.conversations.list();
        
        let targetConversation: any = null;
        for (const conversation of conversations) {
          if ((conversation as any).members && (conversation as any).members.length === 2) {
            const otherMember = (conversation as any).members.find((member: any) => 
              member.inboxId !== client.inboxId
            );
            if (otherMember && (
              otherMember.inboxId === recipientAddress || 
              (otherMember.addresses && otherMember.addresses.includes(recipientAddress))
            )) {
              targetConversation = conversation;
              break;
            }
          }
        }
        
        if (targetConversation) {
          await targetConversation.send(messageContent);
          console.log('✅ 消息发送成功（使用现有对话）!');
        } else {
          console.error('❌ 未找到与该地址的对话');
          console.log('💡 提示：该地址可能还没有启用XMTP，或者需要先建立对话');
        }
        
      } catch (fallbackError) {
        console.error('❌ 所有发送方法都失败了:', fallbackError);
      }
    }

  } catch (error) {
    console.error('❌ 发送消息失败:', error instanceof Error ? error.message : error);
    console.log('');
    console.log('🔧 故障排除：');
    console.log('- 检查网络连接');
    console.log('- 确认PRIVATE_KEY环境变量设置正确');
    console.log('- 确认XMTP_ENV环境变量设置正确');
    console.log('- 确保接收者已启用XMTP V3');
    process.exit(1);
  }
}

if (require.main === module) {
  sendMessage();
} 