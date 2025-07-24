import { connectClientV3 } from './client';

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
    
    console.log('您的 Inbox ID:', client.inboxId);
    console.log('');

    try {
      // V3: 首先尝试创建群组（1对1也是群组）
      console.log('正在创建1对1群组对话...');
      
      // 检查是否可以创建群组
      const group = await (client as any).conversations.createGroup([recipientAddress], {
        name: `Chat with ${recipientAddress.slice(0, 8)}...`,
        description: "Direct message conversation"
      });
      
      console.log('✅ 群组创建成功!');
      console.log('群组ID:', group.id);

      // 发送消息
      await group.send(messageContent);
      
      console.log('✅ 消息发送成功!');
      console.log('发送时间:', new Date().toLocaleString());
      
    } catch (groupError) {
      console.warn('⚠️  群组创建方式失败，尝试其他方法...');
      console.log('错误详情:', groupError);
      
      // 备选方案：查找与指定地址的现有对话
      try {
        console.log('正在查找与指定地址的现有对话...');
        
        // 获取现有对话
        const conversations = await client.conversations.list();
        console.log(`找到 ${conversations.length} 个现有对话`);
        
        let targetConversation: any = null;
        
        // 查找匹配的对话
        for (const conversation of conversations) {
          try {
            // 获取对话成员
            const members = (conversation as any).members || [];
            console.log(`检查对话 ${(conversation as any).id}，成员数: ${members.length}`);
            
            // 查找是否包含目标接收者
            for (const member of members) {
              const memberInboxId = member.inboxId;
              const memberAddresses = member.addresses || [];
              
              console.log(`检查成员: ${memberInboxId}`);
              console.log(`成员地址: ${memberAddresses.join(', ')}`);
              
              // 匹配 Inbox ID 或地址
              if (memberInboxId === recipientAddress || 
                  memberAddresses.includes(recipientAddress.toLowerCase()) ||
                  memberAddresses.includes(recipientAddress)) {
                
                // 确保不是自己
                if (memberInboxId !== client.inboxId) {
                  targetConversation = conversation;
                  console.log(`✅ 找到匹配的对话: ${(conversation as any).id}`);
                  break;
                }
              }
            }
            
            if (targetConversation) break;
            
          } catch (memberError) {
            console.log(`检查对话成员时出错: ${memberError}`);
            continue;
          }
        }
        
        if (targetConversation) {
          console.log('正在向找到的对话发送消息...');
          await targetConversation.send(messageContent);
          console.log('✅ 使用现有对话发送成功!');
        } else {
          console.log('❌ 未找到与该地址的对话');
          console.log('');
          console.log('💡 解决建议：');
          console.log('1. 请确保接收者已经启用了XMTP V3');
          console.log('2. 接收者需要先向您发送一条消息来建立对话');
          console.log('3. 检查接收者地址格式是否正确');
          console.log(`4. 分享您的 Inbox ID 给接收者: ${client.inboxId}`);
          console.log('5. 或者请接收者分享他们的 Inbox ID 给您');
        }
        
      } catch (fallbackError) {
        console.error('❌ 查找对话失败');
        console.log('');
        console.log('🔍 调试信息：');
        console.log('群组错误:', (groupError as any)?.message || groupError);
        console.log('查找错误:', (fallbackError as any)?.message || fallbackError);
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