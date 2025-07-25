import { connectClientV3 } from './client';
import { Client, Identifier, IdentifierKind, Dm } from '@xmtp/node-sdk';

/**
 * 检查地址是否可以接收消息
 */
async function checkCanMessage(client: Client, identifier: Identifier): Promise<boolean> {
  try {
    console.log('🔍 检查目标地址是否可达...');
    
    // 构建标识符对象
    const identifiers = [identifier];
    
    // 检查是否可以发送消息
    const response = await client.canMessage(identifiers);
    
    // response 是一个 Map: identifier => boolean
    const canReach = response.get(identifier.identifier);
    
    if (canReach) {
      console.log('✅ 目标地址可达，可以发送消息');
    } else {
      console.log('❌ 目标地址不可达，可能未启用XMTP');
    }
    
    return !!canReach;    
  } catch (error) {
    console.warn('⚠️  检查地址可达性时出错:', error);
    return false;
  }
}


/**
 * 创建或查找 DM 对话
 */
async function createOrFindDm(client: Client, identifier: Identifier): Promise<Dm<any>> {
  try {
    console.log('📝 创建 DM 对话...');
    const dm = await client.conversations.newDmWithIdentifier(identifier);
    console.log('✅ DM 对话创建成功');
    return dm;
  } catch (error) {
    console.error('❌ 创建 DM 对话失败:', error);
    throw error;
  }
}

/**
 * 获取目标地址的 Inbox ID
 */
async function getInboxId(client: any, targetAddress: string): Promise<string | null> {
  try {
    // 如果输入的已经是 Inbox ID (64位十六进制)，直接返回
    if (targetAddress.length === 64 && /^[a-f0-9]+$/i.test(targetAddress)) {
      console.log('✅ 输入的是 Inbox ID，直接使用');
      return targetAddress;
    }
    
    // 如果是以太坊地址，需要转换为 Inbox ID
    if (targetAddress.startsWith('0x') && targetAddress.length === 42) {
      console.log('🔄 将以太坊地址转换为 Inbox ID...');
      
      // 这里可能需要额外的API调用来获取 Inbox ID
      // 暂时返回地址本身，让后续逻辑处理
      return targetAddress;
    }
    
    return targetAddress;
  } catch (error) {
    console.error('❌ 获取 Inbox ID 失败:', error);
    return null;
  }
}

async function sendMessage() {
  try {
    // 读取命令行参数
    const args = process.argv.slice(2);
    if (args.length < 2) {
      console.error('用法: npm run send <接收者地址或Inbox ID> <消息内容>');
      console.error('示例: npm run send 0x1234567890123456789012345678901234567890 "Hello XMTP!"');
      console.error('示例: npm run send 7aecfe94880e7d17ac7d1e4b98b5d8104799b21c960ffbc8c933c353ad454e63 "Hello!"');
      process.exit(1);
    }

    const [recipientAddress, messageContent] = args;
    
    console.log('=== XMTP DM 消息发送 ===');
    console.log('接收者:', recipientAddress);
    console.log('消息内容:', messageContent);
    console.log('');

    // 连接XMTP V3客户端
    const client = await connectClientV3();
    
    console.log('您的 Inbox ID:', client.inboxId);
    console.log('');

    const identifier = {
      identifier: recipientAddress,
      identifierKind: IdentifierKind.Ethereum
    };

    try {
      // 步骤1: 检查目标地址是否可达
      const canReach = await checkCanMessage(client, identifier);
      if (!canReach) {
        console.log('');
        console.log('💡 解决建议：');
        console.log('1. 确保接收者已经启用了XMTP V3');
        console.log('2. 检查地址格式是否正确');
        console.log('3. 接收者可能需要先发送一条消息来激活XMTP');
        return;
      }
      
      // 步骤3: 创建或查找 DM 对话
      const dm: Dm<any> = await createOrFindDm(client, identifier);
      
      // 步骤4: 发送消息
      console.log('📤 正在发送消息...');
      await dm.send(messageContent);
      
      console.log('✅ DM 消息发送成功!');
      console.log('发送时间:', new Date().toLocaleString());
      console.log('对话ID:', dm.id || 'Unknown');
      
    } catch (dmError) {
      console.error('❌ DM 发送失败:', dmError);
      console.log('');
      console.log('🔧 故障排除：');
      console.log('- 确保接收者已启用XMTP V3');
      console.log('- 检查接收者地址或Inbox ID是否正确');
      console.log('- 尝试让接收者先向您发送一条消息');
      console.log(`- 分享您的 Inbox ID: ${client.inboxId}`);
      
      // 备选方案：查找现有对话
      console.log('');
      console.log('🔄 尝试备选方案：查找现有对话...');
      
      try {
        const conversations = await client.conversations.list();
        console.log(`找到 ${conversations.length} 个现有对话`);
        
        let targetConversation: any = null;
        
        for (const conversation of conversations) {
          try {
            // 检查是否是 DM 对话
            if ((conversation as any).members && (conversation as any).members.length === 2) {
              const members = (conversation as any).members || [];
              const otherMember = members.find((member: any) => 
                member.inboxId !== client.inboxId
              );
              
              if (otherMember && (
                otherMember.inboxId === recipientAddress ||
                (otherMember.addresses && otherMember.addresses.includes(recipientAddress))
              )) {
                targetConversation = conversation;
                console.log(`✅ 找到匹配的对话: ${conversation.id}`);
                break;
              }
            }
          } catch (checkError) {
            continue;
          }
        }
        
        if (targetConversation) {
          console.log('📤 使用现有对话发送消息...');
          await targetConversation.send(messageContent);
          console.log('✅ 使用现有对话发送成功!');
        } else {
          console.log('❌ 未找到可用的对话');
        }
        
      } catch (fallbackError) {
        console.error('❌ 备选方案也失败了:', fallbackError);
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