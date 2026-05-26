/* ============================================================
 * RR-Agent 公开 Demo — 客户端 Mock 层 (纯前端, 不连任何后端)
 * 所有数据均为演示样本 (illustrative), 非真实行情/账户/因子。
 * 拦截 apiGet/apiPost/... (经 __mockApi) + 裸 fetch + EventSource。
 * ============================================================ */
(function () {
  'use strict';
  var now = Math.floor(Date.now() / 1000);

  // ── 演示数据集 (全部虚构) ──────────────────────────────
  var SECTORS = ['半导体', '新能源', '消费电子', '通用设备', '医药生物', '软件服务', '化工材料', '高端制造'];

  function demoStock(i) {
    var s = SECTORS[i % SECTORS.length];
    return {
      ts_code: (600000 + i * 37 % 3000).toString() + '.SH',
      name: '演示标的' + String.fromCharCode(65 + (i % 26)),
      pct_chg: +(9.98 - (i % 5) * 0.3).toFixed(2),
      close: +(8 + (i * 1.7 % 40)).toFixed(2),
      industry: s, reason: s + ' · 演示', up_stat: (1 + i % 5) + '连板',
      rank: i + 1, first_time: '09:3' + (i % 6),
    };
  }
  var LIMITUP = Array.from({length: 18}, function (_, i) { return demoStock(i); });

  var FACTORS = [
    {t: '动量', id: 'F-A07', s: 1.42, ir: 0.91, wr: 0.56, dl: -0.20},
    {t: '反转', id: 'F-B12', s: 1.18, ir: 0.74, wr: 0.54, dl: -0.15},
    {t: '微结构', id: 'F-C03', s: 1.07, ir: 0.83, wr: 0.55, dl: -0.11},
    {t: '资金流', id: 'F-D21', s: 0.96, ir: 0.61, wr: 0.53, dl: -0.22},
    {t: '价量波动', id: 'F-E09', s: 0.88, ir: 0.58, wr: 0.52, dl: -0.18},
    {t: 'ML 合成', id: 'F-F15', s: 0.79, ir: 0.55, wr: 0.53, dl: -0.09},
    {t: '基本面', id: 'F-G02', s: 0.61, ir: 0.42, wr: 0.51, dl: -0.07},
    {t: '动量', id: 'F-H18', s: 0.34, ir: 0.21, wr: 0.49, dl: -0.05},
  ].map(function (f, i) {
    return {
      id: f.id, code: 'factor_' + f.id.toLowerCase().replace('-', '_'),
      name: f.t + '类因子 ' + f.id, sub_theme: f.t, theme: f.t,
      status: i < 7 ? 'active' : 'retired',
      sharpe: f.s, ir: f.ir, win_rate: f.wr, complexity: 'vectorized',
      combinable: true, legacy_sharpe: +(f.s - f.dl).toFixed(2),
      realistic_evaluated_at: '2026-05', realistic_delta_sharpe: f.dl,
      mdd: -(0.08 + i * 0.01), turnover: 0.3 + i * 0.02,
    };
  });

  var STRATEGIES = [
    {id: 'st_001', name: '多因子组合 · 行业中性 #1', source: 'factor', status: 'active', synced_deployed: true, sharpe: 1.31},
    {id: 'st_002', name: '动量趋势组合 #2', source: 'auto_promote', status: 'active', synced_deployed: true, sharpe: 1.12},
    {id: 'st_003', name: '反转择时组合 #3', source: 'factor', status: 'active', synced_deployed: false, sharpe: 0.97},
    {id: 'st_004', name: '微结构日内 #4', source: 'optimize', status: 'draft', synced_deployed: false, sharpe: 0.84},
    {id: 'st_005', name: '资金流跟踪 #5', source: 'auto_promote', status: 'active', synced_deployed: true, sharpe: 0.76},
  ];

  var NEWS = [
    {title: '演示：某主题板块盘中走强，成交显著放量', summary: '演示文本。仅用于界面展示，非真实资讯。', source: '演示来源', time: '今日 10:21'},
    {title: '演示：北向资金净流入，权重蓝筹活跃', summary: '演示文本。仅用于界面展示，非真实资讯。', source: '演示来源', time: '今日 10:05'},
    {title: '演示：行业政策预期升温，相关方向情绪回暖', summary: '演示文本。仅用于界面展示，非真实资讯。', source: '演示来源', time: '今日 09:48'},
    {title: '演示：新能源产业链订单数据公布', summary: '演示文本。仅用于界面展示，非真实资讯。', source: '演示来源', time: '昨日 16:30'},
    {title: '演示：半导体设备国产化进展', summary: '演示文本。仅用于界面展示，非真实资讯。', source: '演示来源', time: '昨日 15:12'},
  ];

  // ── 路由表 ──────────────────────────────────────────────
  function route(path) {
    var p = path.split('?')[0];

    if (p === '/api/overview') return {
      agents: {
        orchestrator: {status: 'online', age: 1, ts: now - 1, embedded: true},
        strategist: {status: 'online', age: 3, ts: now - 3},
        trading: {status: 'online', age: 5, ts: now - 5},
        market: {status: 'online', age: 2, ts: now - 2},
        analysis: {status: 'online', age: 4, ts: now - 4},
        intraday: {status: 'online', age: 6, ts: now - 6},
        news: {status: 'online', age: 8, ts: now - 8},
        backtest: {status: 'online', age: 12, ts: now - 12},
      },
      channels: {
        feishu: {status: 'online', age: 5, mode: 'push'},
        telegram: {status: 'online', age: 9, mode: 'push'},
        web: {status: 'online', age: 2, mode: 'live'},
      },
      runtime: {factor_count: FACTORS.length, sessions: 3, llm: 'multi-provider', tools: {tier1_indexed: 64}},
    };

    if (p === '/api/market/overview') return {
      time_context: {freshness_label: '演示数据', phase_cn: '盘后演示', timestamp: '— 演示环境 —'},
      stats: {zt_count: 42, lb_max_height: 6, top_industries: [['半导体', 8], ['新能源', 6], ['消费电子', 5]]},
      limitup: LIMITUP,
      limitstep: LIMITUP.slice(0, 6).map(function (s, i) { return {name: s.name, up_stat: (6 - i) + '连板', height: 6 - i, ts_code: s.ts_code}; }),
      concepts: SECTORS.map(function (n, i) { return {board_name: n, pct_chg: +(5 - i * 0.5).toFixed(2), up_count: 30 - i * 2, down_count: i}; }),
      hot: LIMITUP.slice(0, 8).map(function (s, i) { return {ts_name: s.name, ts_code: s.ts_code, rank: i + 1, pct_change: s.pct_chg}; }),
      indices: [
        {name: '上证演示', close: 3210.5, pct_chg: 0.62},
        {name: '深证演示', close: 10456.2, pct_chg: 0.85},
        {name: '创业演示', close: 2103.7, pct_chg: 1.21},
      ],
    };

    if (p === '/api/news') return {items: NEWS};
    if (p === '/api/news/summary') return {summary: '【演示摘要】今日演示市场情绪偏暖，半导体、新能源方向相对活跃；北向资金演示净流入。以上为界面演示文本，非真实资讯，不构成任何投资建议。'};

    if (p.indexOf('/api/digger/factors') === 0) return {factors: FACTORS, stats: {total: FACTORS.length, active: 7, retired: 1, avg_sharpe: 0.91, combinable: 7}};
    if (p.indexOf('/api/digger/status') === 0) return {running: false, round: 0, total: 0};
    if (p.indexOf('/api/digger/push-status') === 0) return {enabled: false};
    if (p.indexOf('/api/digger/combine/history') === 0) return {history: []};
    if (p.indexOf('/api/digger/factor/') === 0) return {factor: FACTORS[0], code: '# 演示环境不公开因子实现'};

    if (p.indexOf('/api/strategies') === 0) return {strategies: STRATEGIES, source_counts: {factor: 2, auto_promote: 2, optimize: 1}};
    if (p.indexOf('/api/quant/records') === 0) return {records: [
      {id: 'r1', topic: '演示：今日热点策略研发', created_at: '今日 10:00', status: 'done'},
      {id: 'r2', topic: '演示：多因子组合优化', created_at: '昨日 14:30', status: 'done'},
    ]};
    if (p.indexOf('/api/quant/ledger') === 0) return {ok: true, total: 0, items: []};
    if (p.indexOf('/api/intraday/signal-ledger') === 0) return {ok: true, total: 0, items: []};
    if (p === '/api/memory/dashboard') return {ok: true, total_memories: 0, by_type: {}, recent: []};
    if (p === '/api/llm/config') return {provider: 'multi-provider', models: ['(演示) 多模型可配置']};
    if (p.indexOf('/api/screener/presets') === 0) return {presets: []};
    if (p.indexOf('/api/daily-log') === 0) return p.indexOf('dates') >= 0 ? {dates: []} : {log: '', date: ''};
    if (p.indexOf('/api/auto/') === 0) return {ok: true, events: [], status: 'idle'};
    if (p === '/api/notifications') return {notifications: [], unread: 0};

    // intraday 监控类
    if (p === '/api/intraday/status') return {running: false, strategy: '', last_scan: null};
    if (p === '/api/intraday/latest-signals') return {signals: []};
    if (p.indexOf('/api/intraday/auto-push/config') === 0) return {enabled: false, interval: 0};
    if (p.indexOf('/api/intraday') === 0) return {ok: true, signals: [], result: '演示环境：盘中扫描不在 demo 中实际运行。'};

    if (p.indexOf('/api/tasks') === 0) return {tasks: [], ok: true};
    if (p === '/api/command') return {result: '演示环境：该操作不在 demo 中实际执行。', ok: true};

    // 默认: 多键兜底, 避免任何 view 解析报错
    return {ok: true, error: false, items: [], factors: [], strategies: [], records: [], stocks: [], data: {}, result: ''};
  }

  // ── __mockApi: apiGet/apiPost/apiPut/apiDelete 走这里 ────
  window.__mockApi = function (url, method, body) {
    return Promise.resolve(route(url));
  };

  // 脚本化演示对话 (若保留 chat)
  window.__mockChat = function (message, target) {
    return '【演示环境】这是脚本化的演示回复，未连接任何后端模型。\n\n真实 RR-Agent 中，该消息会路由到对应智能体（策略师 / 行情 / 分析师 / 回测 等），由可配置的多 provider 大模型驱动。\n\n本页所有数据均为演示样本，不构成投资建议。';
  };

  // ── 裸 fetch 覆盖 (intraday/* · quant/stream · ledger · digger · auth · webauthn) ──
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('/api/') === -1) {
      return realFetch ? realFetch(input, init) : Promise.reject(new Error('blocked'));
    }
    var p = url.split('?')[0];
    // 登录类: 演示环境直接放行成功 (实际 demo 已注入会话, 一般不会触发)
    if (p === '/api/auth/me') return mkResp({error: true}, 401);
    // SSE 流式: quant/stream — 回放几条演示步骤
    if (p === '/api/quant/stream') return mkStream([
      {step: 1, title: '演示：拉取数据', status: 'done'},
      {step: 2, title: '演示：因子计算', status: 'done'},
      {step: 3, title: '演示：组合优化', status: 'done'},
      {step: 4, title: '演示：风险校验', status: 'done'},
      {type: 'done'},
    ]);
    return mkResp(route(url), 200);
  };

  function mkResp(obj, status) {
    return Promise.resolve(new Response(JSON.stringify(obj), {
      status: status || 200,
      headers: {'Content-Type': 'application/json'},
    }));
  }
  function mkStream(events) {
    var body = events.map(function (e) { return 'data: ' + JSON.stringify(e) + '\n'; }).join('');
    return Promise.resolve(new Response(body, {status: 200, headers: {'Content-Type': 'text/event-stream'}}));
  }

  // ── EventSource 覆盖 (tasks 进度) — 演示直接完成 ──────────
  var RealES = window.EventSource;
  window.EventSource = function (url) {
    var self = this;
    self.url = url; self.readyState = 1;
    self.onmessage = null; self.onerror = null; self.onopen = null;
    setTimeout(function () {
      if (self.onmessage) self.onmessage({data: JSON.stringify({status: 'done', title: '演示完成', step: 1})});
      self.readyState = 2;
    }, 300);
    self.close = function () { self.readyState = 2; };
    self.addEventListener = function (t, cb) { if (t === 'message') self.onmessage = cb; };
    self.removeEventListener = function () {};
  };

  console.log('%c[RR-Agent Demo] Mock 层已加载 — 全部为演示数据，不连后端。', 'color:#10b981');
})();
