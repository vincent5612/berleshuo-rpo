const API_KEY = 'sk-nIA39UY7wM69Cyds4b7641D45a5d4d34B7Ff907085421475';
const API_URL = 'https://api.v36.cm/v1/messages';

Page({
  data: { messages: [], inputVal: '', loading: false },

  onInput(e) { this.setData({ inputVal: e.detail.value }); },

  sendMsg() {
    const q = this.data.inputVal.trim();
    if (!q || this.data.loading) return;

    // Add user message
    const msgs = [...this.data.messages, { role: 'user', content: q }];
    this.setData({ messages: msgs, inputVal: '', loading: true });

    // Call API
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
        system: '你是一个招聘RPO业务专家，回答简洁直接。基于伯乐说SOP手册内容回答。',
        messages: [{ role: 'user', content: q }]
      },
      success: (res) => {
        let reply = '';
        try {
          const content = res.data.content;
          reply = content.map(c => c.text).join('') || '抱歉，无法回答。';
        } catch(e) {
          reply = '请求失败，请重试。';
        }
        // Strip markdown
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
