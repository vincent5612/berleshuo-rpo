const API_KEY = 'sk-nIA39UY7wM69Cyds4b7641D45a5d4d34B7Ff907085421475';
const API_URL = 'https://api.v36.cm/v1/messages';

const SYSTEM_PROMPT = `你是一个招聘RPO业务专家，回答简洁直接。

## 核心框架：系统大脑
招聘RPO核心能力链条：招聘管理、技能培训、数据管理、项目对接、AI工具赋能。同一套知识框架，同一底层逻辑，无论什么岗位行业，系统内核不变。

## 五步标准流程
1. 人才寻访 —— 多渠道主动寻访，建立人才库
2. 初步沟通 —— 标准化沟通流程，获取简历锁定面试
3. 面试跟进 —— 面试前后的信任建立和关系维护
4. Offer谈判 —— 薪资谈判、入职确认
5. 入职维护 —— 入职前跟进、在职关怀、转介绍

## 微信沟通六要素
1. 约面前意向沟通七步法：以岗位最大优势打招呼→了解对方情况→以工作经验为话题→工作内容简单化→深化沟通→锁定面试时间
2. 约面后信任沟通：约面成功后15~30分钟发邀约信息，要求回复确认（签字盖章效应）
3. 面试后关系梳理：面试当天发消息了解感受，预判意向
4. Offer沟通：正式Offer发出后立即电话沟通，确认入职时间
5. 入职前维护：Offer到入职日之间每隔2~3天互动，防流失
核心公式：数据→反推→改进→闭环。`;

Page({
  data: {
    messages: [
      { role: 'bot', content: '你好，我是伯乐说AI助手。有什么招聘问题尽管问，我基于14年RPO经验帮你解答。' }
    ],
    inputVal: '',
    loading: false
  },

  onInput(e) { this.setData({ inputVal: e.detail.value }); },

  sendMsg() {
    const q = this.data.inputVal.trim();
    if (!q || this.data.loading) return;

    // Build conversation history for API
    const history = this.data.messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    const msgs = [...this.data.messages, { role: 'user', content: q }];
    this.setData({ messages: msgs, inputVal: '', loading: true });

    wx.request({
      url: API_URL,
      method: 'POST',
      header: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      data: {
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [...history, { role: 'user', content: q }]
      },
      success: (res) => {
        let reply = '';
        try {
          const content = res.data.content;
          reply = content.map(c => c.text).join('') || '抱歉，无法回答。';
        } catch(e) {
          reply = '请求失败，请重试。';
        }
        reply = reply.replace(/^#+\s*/gm, '').replace(/\*\*/g, '').replace(/^-\s*/gm, '• ').replace(/\n{3,}/g, '\n\n').trim();
        this.setData({
          messages: [...this.data.messages, { role: 'bot', content: reply }],
          loading: false
        });
      },
      fail: () => {
        this.setData({
          messages: [...this.data.messages, { role: 'bot', content: '❌ 网络请求失败，请检查API配置。' }],
          loading: false
        });
      }
    });
  }
});
