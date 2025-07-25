import { connectClientV3 } from './client';

// 全局状态
let processedMessageTimes = new Map<string, number>();
let knownConversations = new Set<string>();
let lastCheckTime = 0;
let targetAddress: string | undefined;

/**
 * 主函数：接收消息
 */
async function receiveMessages() {
  try {
    // 读取命令行参数
    const args = process.argv.slice(2);
    targetAddress = args[0]; // 可选：指定要监听的地址
    
    console.log('正在连接并监听消息...');
    if (targetAddress) {
      console.log('目标地址/Inbox ID:', targetAddress);
      console.log('（只显示来自此地址的消息）');
    } else {
      console.log('监听所有传入消息');
    }
    console.log('按 Ctrl+C 退出监听');
    console.log('');

    // 连接XMTP V3客户端
    const client = await connectClientV3();
    
    console.log('您的 Inbox ID:', client.inboxId);
    console.log('');
    
    // 初始化时间戳
    lastCheckTime = Date.now();

    // 尝试方法1：实时流监听
    const streamSuccess = await tryStreamAllMessages(client);
    
    // 如果方法1失败，使用方法2：轮询模式
    if (!streamSuccess) {
      await pollForNewMessages(client);
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


/**
 * 方法1: 实时流监听
 */
async function tryStreamAllMessages(client: any): Promise<boolean> {
  try {
    console.log('✅ 开始监听所有消息...');
    console.log('等待新消息到达...');
    console.log('');

    const messageStream = await client.conversations.streamAllMessages();
    
    for await (const message of messageStream) {
      try {
        const conversationId = message.conversationId || 'Unknown';
        
        if (shouldProcessMessage(message, targetAddress)) {
          displayMessage(message, conversationId);
        }
        
      } catch (messageError) {
        console.log('处理消息时出错:', messageError);
      }
    }
    
    return true;
  } catch (streamError) {
    console.warn('⚠️  全局消息监听失败，尝试轮询模式...');
    console.log('错误详情:', streamError);
    return false;
  }
}

/**
 * 方法2: 轮询模式
 */
async function pollForNewMessages(client: any): Promise<void> {
  console.log('切换到轮询模式...');
  console.log(`🕐 开始时间戳: ${new Date(lastCheckTime).toLocaleString()}`);
  
  while (true) {
    try {
      const currentCheckTime = Date.now();
      
      // 获取所有对话
      const conversations = await client.conversations.list();
      
      // 计算查询起始时间（上次检查时间 - 5秒容错）
      const queryStartTime = lastCheckTime - 5000;
      
      console.log(`🔍 检查时间窗口: ${new Date(queryStartTime).toLocaleString()} - ${new Date().toLocaleString()}`);
      
      let totalNewMessages = 0;
      
      for (const conversation of conversations) {
        const conversationId = conversation.id;
        
        // 检查是否为新对话
        if (!knownConversations.has(conversationId)) {
          console.log(`🆕 发现新对话: ${conversationId}`);
          knownConversations.add(conversationId);
        }
        
        // 处理对话消息
        const newMessages = await processConversationMessages(conversation, queryStartTime);
        totalNewMessages += newMessages;
      }
      
      // 清理旧记录
      cleanupOldRecords();
      
      // 更新检查时间
      console.log(`⏰ 完成检查，处理了 ${totalNewMessages} 条新消息`);
      console.log(`📊 已处理消息记录数: ${processedMessageTimes.size}`);
      console.log(`🕐 下次检查: ${new Date(Date.now() + 5000).toLocaleString()}`);
      lastCheckTime = currentCheckTime;
      
      // 等待5秒后再次检查
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (pollError) {
      console.log('轮询时出错:', pollError);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

/**
 * 显示消息
 */
function displayMessage(message: any, conversationId: string) {
  const messageTime = message.sentAtNs / 1000000;
  const timestamp = new Date(messageTime).toLocaleString();
  const sender = message.senderInboxId || 'Unknown';
  const content = message.content || message;
  
  console.log(`📨 [${timestamp}] ${sender}:`);
  console.log(`   ${content}`);
  console.log(`   对话ID: ${conversationId}`);
  console.log(`   消息时间戳: ${messageTime}`);
  console.log('');
}

/**
 * 判断消息是否应该处理
 */
function shouldProcessMessage(message: any, targetAddress?: string): boolean {
  const messageTime = message.sentAtNs / 1000000;
  const messageId = message.id;
  const sender = message.senderInboxId || 'Unknown';
  
  // 检查是否已处理过
  const messageKey = `${messageId}_${messageTime}`;
  if (processedMessageTimes.has(messageKey)) {
    return false;
  }
  
  // 检查发送者过滤
  if (targetAddress && sender !== targetAddress) {
    return false;
  }
  
  // 标记为已处理
  processedMessageTimes.set(messageKey, messageTime);
  return true;
}

/**
 * 清理旧的消息记录
 */
function cleanupOldRecords() {
  const oneHourAgo = Date.now() - 3600000;
  for (const [key, time] of processedMessageTimes.entries()) {
    if (time < oneHourAgo) {
      processedMessageTimes.delete(key);
    }
  }
}

/**
 * 处理单个对话的消息
 */
async function processConversationMessages(conversation: any, queryStartTime: number): Promise<number> {
  const conversationId = conversation.id;
  let newMessageCount = 0;
  
  try {
    const messages = await conversation.messages({
      limit: 50,
      direction: 'DESCENDING',
      startTime: queryStartTime
    });
    
    if (messages.length > 0) {
      console.log(`对话 ${conversationId}: 获取到 ${messages.length} 条候选消息`);
    }
    
    for (const message of messages) {
      if (shouldProcessMessage(message, targetAddress)) {
        displayMessage(message, conversationId);
        newMessageCount++;
      }
    }
    
    if (newMessageCount > 0) {
      console.log(`✅ 对话 ${conversationId}: 处理了 ${newMessageCount} 条新消息`);
    }
    
  } catch (msgError) {
    console.log(`获取对话 ${conversationId} 消息时出错:`, msgError);
  }
  
  return newMessageCount;
}

// 处理优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 停止监听消息');
  process.exit(0);
});

if (require.main === module) {
  receiveMessages();
} 