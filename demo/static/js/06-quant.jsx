// ── 五大策略维度配置 ──────────────────────────────────
const ARCHETYPES_CONFIG = {
  intraday_premium: {
    id: 'intraday_premium', name: '日内溢价', icon: '⚡', holdDays: '~1天',
    alphaSource: '竞价溢价·散户情绪',
    cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    clsActive: 'bg-orange-500/25 text-orange-300 border-orange-400/50 shadow-orange-500/10',
    isEvent: true,
    themes: new Set(['auction_microstructure', 'emotion_cycle', 'chip_concentration', 'intraday_pattern', 'gap_factor']),
    regimeOn: ['量能放大、市场活跃期', '情绪升温阶段', '竞价异动频发周'],
    regimeOff: ['缩量横盘、情绪低迷', '系统性下跌趋势中', '流动性危机'],
    keySignals: [
      {name: '竞价量比', formula: '9:25竞价量 / 近5日均竞价量  > 3 异动，> 5 强异动'},
      {name: '尾盘资金强度', formula: '(14:50-15:00成交量) / 全天成交量  > 0.12 尾盘异动'},
      {name: '开盘跳空溢价', formula: '(open - prev_close) / prev_close  > 0.03 高开溢价'},
    ],
    topPitfall: '【致命】T+1 制度：当日买入无法当日卖出，回测必须用次日开盘价作为出场价',
    presets: [
      {label:'竞价博弈策略', topic:'利用开盘竞价跳空+日内走势组合模式，低开反包/高开确认策略'},
      {label:'涨停首板溢价', topic:'涨停板放量封板后，次日竞价溢价买入策略，利用A股涨停制度的溢价效应'},
      {label:'尾盘异动低吸', topic:'14:50-15:00成交量异动捕捉主力建仓信号，次日开盘溢价收益策略'},
    ],
  },
  consecutive_limit_up: {
    id: 'consecutive_limit_up', name: '连板妖股', icon: '🐉', holdDays: '1-5天',
    alphaSource: '连板效应·游资博弈',
    cls: 'bg-red-500/20 text-red-400 border-red-500/30',
    clsActive: 'bg-red-500/25 text-red-300 border-red-400/50 shadow-red-500/10',
    isEvent: true,
    themes: new Set(['limit_up_chain', 'money_flow', 'emotion_cycle', 'smart_money_divergence', 'mutation']),
    regimeOn: ['情绪活跃期、连板股≥5只/日', '跟风效应强烈期', '题材炒作高峰'],
    regimeOff: ['市场情绪退潮、连板数量骤降', '监管介入题材炒作', '全市场系统性下跌'],
    keySignals: [
      {name: '首板质量评分', formula: '封单量/流通股本>5%(3分)+换手率>8%(2分)+量比>3(2分)+尾盘封板(2分)  ≥7分强势首板'},
      {name: '炸板率指数', formula: '近3日断板次数/(断板+封板次数)  <0.25情绪稳定，>0.5情绪退潮信号'},
      {name: '连板热度', formula: '当日3连板以上股票数量  ≥3只情绪活跃，=0无效场景不参与'},
    ],
    topPitfall: '【致命】涨停价买入：回测以涨停价买入严重失真，实际成交率<20%，须假设次日竞价买入',
    presets: [
      {label:'首板强度选股', topic:'首板质量评分策略：封单量/流通股本+换手率+量比综合评分，score≥7参与连板'},
      {label:'连板情绪跟踪', topic:'实时跟踪3连板以上妖股数量判断市场情绪，情绪活跃期参与2-3板高度板标的'},
      {label:'断板低吸博弈', topic:'高度板股票断板后的情绪博弈，基于炸板率指数判断是否参与反包机会'},
    ],
  },
  short_term: {
    id: 'short_term', name: '短线趋势', icon: '🚀', holdDays: '3-15天',
    alphaSource: '技术趋势·板块动量',
    cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    clsActive: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-emerald-500/10',
    isEvent: false,
    themes: new Set(['breakout_quality', 'sector_rotation', 'volatility_contraction_breakout', 'reversal_signal', 'momentum', 'volume_price_div']),
    regimeOn: ['趋势型行情、板块分化明显', '成交量持续放大期', '政策驱动主题轮动'],
    regimeOff: ['剧烈震荡、无方向市', '全面缩量阴跌', '极端流动性危机'],
    keySignals: [
      {name: 'A股适配动量', formula: 'close.pct_change(20) - close.pct_change(5)  A股5日内反转，须用长减短'},
      {name: 'VCP突破质量', formula: 'ATR收窄趋势 + 放量突破(量比>2) + 形态完整性评分  综合判断有效突破'},
      {name: '板块相对强度', formula: '个股5日涨幅 - 同板块均涨幅  >0 且板块排名前20%'},
    ],
    topPitfall: '【严重】A股短期反转：不要照搬海外5日动量因子！A股5日内为反转效应，动量因子须用20日减5日',
    presets: [
      {label:'聪明钱超跌反弹', topic:'结合资金流向和超跌幅度，在主力资金流入+超跌15%时抄底反弹策略'},
      {label:'波动收缩突破(VCP)', topic:'振幅逐渐收窄后的放量突破策略，识别有效突破vs假突破，A股适配版本'},
      {label:'板块轮动低吸', topic:'利用板块轮动规律，龙头退潮后补涨股低吸策略，量化板块轮动强度'},
    ],
  },
  medium_term: {
    id: 'medium_term', name: '中线因子', icon: '📈', holdDays: '20-60天',
    alphaSource: '截面因子·多因子模型',
    cls: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
    clsActive: 'bg-brand-500/25 text-brand-300 border-brand-400/50 shadow-brand-500/10',
    isEvent: false,
    themes: new Set(['cross_sectional_rank', 'sector_rotation', 'momentum', 'reversal_signal', 'price_volume_sync', 'liquidity_shock']),
    regimeOn: ['牛市中段、系统性机会', '价值回归周期', '宏观政策明朗期'],
    regimeOff: ['系统性熊市初期', '流动性危机', '估值极度压缩期'],
    keySignals: [
      {name: '中期动量因子', formula: 'close.pct_change(60)  配合板块过滤，A股中期动量有效'},
      {name: '资金流向强度', formula: '大单净流入/成交额  近20日均值 > 0.05 主力持续介入'},
      {name: 'IC/IR截面检验', formula: '|IC_mean| > 0.002 且 IR > 0.3 才算有效截面因子'},
    ],
    topPitfall: '【重要】截面因子必须做IC分析，IC|Mean|<0.002 的因子不应进入策略，否则为纯噪声交易',
    presets: [
      {label:'缩量上涨筹码锁定', topic:'缩量稳步上涨等于筹码高度集中，量化筹码集中度因子，放量加速时买入'},
      {label:'中期资金面选股', topic:'大单净流入持续20日以上，配合中期动量和低估值因子的多因子策略'},
      {label:'行业轮动因子', topic:'行业相对强弱因子 + 板块资金流入量化行业配置，中线轮动策略'},
    ],
  },
  long_term: {
    id: 'long_term', name: '长线价值', icon: '💎', holdDays: '60-365天',
    alphaSource: '基本面·估值因子',
    cls: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    clsActive: 'bg-violet-500/25 text-violet-300 border-violet-400/50 shadow-violet-500/10',
    isEvent: false,
    themes: new Set(['cross_sectional_rank', 'momentum', 'mean_reversion', 'higher_moment', 'volume_distribution']),
    regimeOn: ['价值回归大趋势', '政策定调明确的长周期', '低估值修复行情'],
    regimeOff: ['散户主导时短期趋势主导', '量化策略拥挤', '退市风险爆发期'],
    keySignals: [
      {name: 'IC/IR双重检验', formula: '|IC_mean| > 0.003 且 IR > 0.5 才算稳健长线因子'},
      {name: '估值分位数', formula: 'PE / 近5年历史PE分位数  < 0.2 历史低估区间有效'},
      {name: '成长质量复合', formula: 'ROE增长率 × 毛利率稳定性 × 资产负债率  综合质量得分'},
    ],
    topPitfall: '【重要】A股价值陷阱：散户主导致价值因子经常跑不赢，需配合趋势过滤避开价值陷阱',
    presets: [
      {label:'价值+动量复合因子', topic:'低估值+中期动量双因子复合策略，规避A股价值陷阱，提升胜率'},
      {label:'ROE成长质量因子', topic:'ROE增长率+毛利率稳定性+资产负债率复合质量因子，长线选股'},
      {label:'股东回报价值因子', topic:'分红率+股票回购+股权激励综合股东回报因子，寻找高质量资产'},
    ],
  },
};

// ── 因子 ABCDE 综合评级 ──────────────────────────────
const FACTOR_GRADE = {
  A: {label:'A 精英', icon:'A', cls:'bg-yellow-500/25 text-yellow-300 border-yellow-500/40', desc:'Sharpe≥1.5 + IR≥0.5 或胜率≥55%'},
  B: {label:'B 优秀', icon:'B', cls:'bg-emerald-500/20 text-emerald-400 border-emerald-500/35', desc:'Sharpe≥1.0 + IR≥0.3 或胜率≥45%'},
  C: {label:'C 合格', icon:'C', cls:'bg-brand-500/15 text-brand-400 border-brand-500/30', desc:'Sharpe≥0.5 + 胜率≥38%'},
  D: {label:'D 边缘', icon:'D', cls:'bg-zinc-500/10 text-zinc-400 border-zinc-600/25', desc:'Sharpe≥0.3，可入库但需监控'},
  E: {label:'E 淘汰', icon:'E', cls:'bg-red-500/10 text-red-500/70 border-red-800/20', desc:'未激活 或 Sharpe<0.3'},
};

const getFactorGrade = (f) => {
  if (!f) return 'E';
  // 优先使用后端计算的 grade 字段
  if (f.grade && FACTOR_GRADE[f.grade]) return f.grade;
  // 前端降级计算
  if (f.status !== 'active') return 'E';
  const s = f.sharpe || 0, ir = f.ir || 0, wr = (f.win_rate || 0);
  if (s >= 1.5 && (ir >= 0.5 || wr >= 0.55)) return 'A';
  if (s >= 1.0 && (ir >= 0.3 || wr >= 0.45)) return 'B';
  if (s >= 0.5 && wr >= 0.38) return 'C';
  if (s >= 0.3) return 'D';
  return 'E';
};

// 兼容旧字段 (给部分地方仍用 getFactorTier 的地方)
const getFactorTier = (f) => {
  const g = getFactorGrade(f);
  return {A:'elite', B:'high', C:'standard', D:'marginal', E:'marginal'}[g] || 'marginal';
};

// ── IM 推送按钮 ──────────────────────────────────────
function PushToIMButton({endpoint, label = '推送 IM', topic}) {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null); // 'ok' | 'err'
  const toast = React.useContext(ToastContext);
  const handle = async () => {
    setLoading(true); setResult(null);
    try {
      const r = await apiPost(endpoint, topic ? {topic} : {});
      if (r && !r.error && r.ok) {
        toast('已推送到飞书 ✓', 'success');
        setResult('ok');
      } else {
        toast(r?.error || '推送失败', 'error');
        setResult('err');
      }
    } catch(e) { toast('网络错误', 'error'); setResult('err'); }
    setLoading(false);
    setTimeout(()=>setResult(null), 3000);
  };
  return (
    <button onClick={handle} disabled={loading}
      className={`btn px-3 py-1.5 rounded-lg text-[12px] border transition
        ${result==='ok' ? 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30' :
          result==='err' ? 'bg-red-600/15 text-red-400 border-red-500/30' :
          'bg-surface-2 hover:bg-surface-3 text-zinc-400 border-border'}`}>
      {loading ? <Spinner size={3}/> : result==='ok' ? '✓ 已发送' : result==='err' ? '✗ 失败' : `📨 ${label}`}
    </button>
  );
}

// ── Quant Sub-Components ─────────────────────────────

function MetricCard({label, value, unit, color, small}) {
  const v = typeof value === 'number' ? value.toFixed(2) : value;
  const c = color || (typeof value === 'number' ? (value >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-zinc-200');
  return (
    <div className={`bg-surface-3 rounded-xl border border-border px-3 ${small ? 'py-2' : 'py-3'} text-center`}>
      <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`${small ? 'text-[13px]' : 'text-[15px]'} font-bold ${c}`}>{v}{unit||''}</div>
    </div>
  );
}

function MetricsGrid({m, archetypeId}) {
  if (!m || typeof m !== 'object') return null;
  const isEvent = ARCHETYPES_CONFIG[archetypeId]?.isEvent;
  const sortino = m.sortino_ratio ?? m.sortino;
  const payoff = m.payoff_ratio;
  const highlights = isEvent ? [
    {k:'total_return', l:'总收益', u:'%', v:m.total_return ?? m.total_return_pct},
    {k:'sortino', l:'Sortino', v:sortino, color: sortino >= 1.5 ? 'text-emerald-400' : sortino >= 1 ? 'text-amber-400' : 'text-red-400'},
    {k:'payoff_ratio', l:'赔率', v:payoff, color: payoff >= 1.5 ? 'text-emerald-400' : payoff >= 1 ? 'text-amber-400' : 'text-red-400'},
    {k:'max_drawdown', l:'最大回撤', u:'%', v:m.max_drawdown ?? m.max_drawdown_pct},
    {k:'win_rate', l:'胜率', u:'%', v:m.win_rate ?? m.win_rate_pct},
    {k:'trades', l:'交易次数', v:m.trades ?? m.total_trades, color:'text-zinc-200'},
  ] : [
    {k:'total_return', l:'总收益', u:'%', v:m.total_return ?? m.total_return_pct},
    {k:'annualized_return', l:'年化收益', u:'%', v:m.annualized_return ?? m.annualized_return_pct},
    {k:'sharpe', l:'夏普比率', v:m.sharpe ?? m.sharpe_ratio, color: (m.sharpe??m.sharpe_ratio) >= 1 ? 'text-emerald-400' : (m.sharpe??m.sharpe_ratio) >= 0 ? 'text-amber-400' : 'text-red-400'},
    {k:'max_drawdown', l:'最大回撤', u:'%', v:m.max_drawdown ?? m.max_drawdown_pct},
    {k:'win_rate', l:'胜率', u:'%', v:m.win_rate ?? m.win_rate_pct},
    {k:'trades', l:'交易次数', v:m.trades ?? m.total_trades, color:'text-zinc-200'},
  ];
  const extras = [
    {l:'Sortino', v:m.sortino_ratio}, {l:'Calmar', v:m.calmar_ratio},
    {l:'年化波动', v:m.annualized_volatility ?? m.annualized_volatility_pct, u:'%'},
    {l:'股票数', v:m.stocks_traded, color:'text-zinc-200'},
    {l:'交易天数', v:m.num_days, color:'text-zinc-200'},
    {l:'选股池', v:m.universe_size, color:'text-zinc-200'},
  ].filter(x => x.v != null);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {highlights.filter(h => h.v != null).map(h => <MetricCard key={h.k} label={h.l} value={h.v} unit={h.u} color={h.color} />)}
      </div>
      {extras.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
          {extras.map((e,i) => <MetricCard key={i} label={e.l} value={e.v} unit={e.u} color={e.color} small />)}
        </div>
      )}
    </div>
  );
}

function TradeTable({trades, title, colorFn}) {
  if (!trades || trades.length === 0) return null;
  return (
    <div>
      <h4 className="text-[11px] font-medium text-zinc-400 mb-2">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-0 text-[10px] md:text-[11px]">
          <thead><tr className="bg-surface-3 text-zinc-500">
            <th className="px-2 py-1.5 text-left font-medium">股票</th>
            <th className="px-2 py-1.5 text-left font-medium">买入日</th>
            <th className="px-2 py-1.5 text-left font-medium">卖出日</th>
            <th className="px-2 py-1.5 text-right font-medium">买入价</th>
            <th className="px-2 py-1.5 text-right font-medium">卖出价</th>
            <th className="px-2 py-1.5 text-right font-medium">收益%</th>
            <th className="px-2 py-1.5 text-center font-medium">状态</th>
          </tr></thead>
          <tbody>{trades.map((t,i) => (
            <tr key={i} className="border-t border-border/50 hover:bg-surface-3/50 transition">
              <td className="px-2 py-1.5 font-mono text-zinc-300">{t.stock}</td>
              <td className="px-2 py-1.5 text-zinc-500">{t.entry_date}</td>
              <td className="px-2 py-1.5 text-zinc-500">{t.exit_date}</td>
              <td className="px-2 py-1.5 text-right text-zinc-400">{Number(t.entry_price).toFixed(2)}</td>
              <td className="px-2 py-1.5 text-right text-zinc-400">{t.exit_price > 0 ? Number(t.exit_price).toFixed(2) : '-'}</td>
              <td className={`px-2 py-1.5 text-right font-medium ${t.return_pct > 0 ? 'text-emerald-400' : t.return_pct < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                {t.return_pct > 0 ? '+' : ''}{Number(t.return_pct).toFixed(2)}%
              </td>
              <td className="px-2 py-1.5 text-center">
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${t.status === 'Closed' ? 'bg-zinc-700/50 text-zinc-400' : 'bg-amber-500/10 text-amber-400'}`}>{t.status === 'Closed' ? '已平' : '持仓'}</span>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function PnlDistribution({dist}) {
  if (!dist) return null;
  const total = dist.total_trades || 1;
  const posPct = ((dist.positive / total) * 100).toFixed(1);
  const negPct = ((dist.negative / total) * 100).toFixed(1);
  return (
    <Card>
      <h4 className="text-[12px] font-semibold text-zinc-300 mb-3">盈亏分布</h4>
      <div className="flex items-center gap-2 mb-3 h-3 rounded-full overflow-hidden bg-surface-3">
        <div className="h-full bg-emerald-500/70 rounded-l-full transition-all" style={{width: posPct + '%'}}></div>
        <div className="h-full bg-red-500/60 rounded-r-full transition-all" style={{width: negPct + '%'}}></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
        <div className="bg-surface-3 rounded-lg px-2.5 py-2"><span className="text-zinc-500">盈利</span> <span className="text-emerald-400 font-medium">{dist.positive}</span> <span className="text-zinc-600">({posPct}%)</span></div>
        <div className="bg-surface-3 rounded-lg px-2.5 py-2"><span className="text-zinc-500">亏损</span> <span className="text-red-400 font-medium">{dist.negative}</span> <span className="text-zinc-600">({negPct}%)</span></div>
        <div className="bg-surface-3 rounded-lg px-2.5 py-2"><span className="text-zinc-500">最佳</span> <span className="text-emerald-400 font-medium">+{Number(dist.best_return_pct).toFixed(1)}%</span></div>
        <div className="bg-surface-3 rounded-lg px-2.5 py-2"><span className="text-zinc-500">最差</span> <span className="text-red-400 font-medium">{Number(dist.worst_return_pct).toFixed(1)}%</span></div>
        <div className="bg-surface-3 rounded-lg px-2.5 py-2"><span className="text-zinc-500">均值</span> <span className={`font-medium ${dist.mean_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{Number(dist.mean_return_pct).toFixed(2)}%</span></div>
        <div className="bg-surface-3 rounded-lg px-2.5 py-2"><span className="text-zinc-500">中位数</span> <span className={`font-medium ${dist.median_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{Number(dist.median_return_pct).toFixed(2)}%</span></div>
        <div className="bg-surface-3 rounded-lg px-2.5 py-2"><span className="text-zinc-500">标准差</span> <span className="text-zinc-300 font-medium">{Number(dist.std_return_pct).toFixed(2)}%</span></div>
        <div className="bg-surface-3 rounded-lg px-2.5 py-2"><span className="text-zinc-500">总交易</span> <span className="text-zinc-300 font-medium">{dist.total_trades}</span></div>
      </div>
    </Card>
  );
}

function DailySummaryChart({daily}) {
  if (!daily || daily.length === 0) return null;
  const maxVal = Math.max(...daily.map(d => Math.max(d.entries, d.exits)), 1);
  const [hovIdx, setHovIdx] = useState(-1);
  return (
    <Card>
      <h4 className="text-[12px] font-semibold text-zinc-300 mb-3">每日交易活动 <span className="text-zinc-600 font-normal">({daily.length} 交易日)</span></h4>
      <div className="relative h-32 flex items-end gap-[1px] overflow-x-auto">
        {daily.map((d, i) => {
          const eH = (d.entries / maxVal) * 100;
          const xH = (d.exits / maxVal) * 100;
          return (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-[1px] relative group cursor-pointer"
              style={{width: Math.max(100 / daily.length, 3) + '%'}}
              onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(-1)}>
              <div className="w-full flex gap-[1px]" style={{height: '100%', alignItems: 'flex-end'}}>
                <div className="flex-1 bg-emerald-500/60 rounded-t-sm transition-all hover:bg-emerald-500/80" style={{height: eH + '%', minHeight: d.entries > 0 ? '2px' : 0}}></div>
                <div className="flex-1 bg-red-500/50 rounded-t-sm transition-all hover:bg-red-500/70" style={{height: xH + '%', minHeight: d.exits > 0 ? '2px' : 0}}></div>
              </div>
              {hovIdx === i && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 glass rounded-lg px-2 py-1.5 text-[9px] whitespace-nowrap z-10 border border-border shadow-lg">
                  <div className="text-zinc-300 font-medium">{d.date}</div>
                  <div className="text-emerald-400">买入 {d.entries}</div>
                  <div className="text-red-400">卖出 {d.exits}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-2 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/60"></span>买入</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/50"></span>卖出</span>
      </div>
    </Card>
  );
}

function ArchetypeBar({archetype, setArchetype}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
      {Object.values(ARCHETYPES_CONFIG).map(a => {
        const active = archetype === a.id;
        return (
          <button key={a.id} onClick={() => setArchetype(active ? null : a.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-medium transition
              ${active ? a.clsActive + ' shadow-lg' : 'bg-surface-2 border-border text-zinc-500 hover:border-border-light hover:text-zinc-300'}`}>
            <span>{a.icon}</span>
            <span>{a.name}</span>
            <span className="text-[10px] opacity-50">{a.holdDays}</span>
          </button>
        );
      })}
      {archetype && (
        <button onClick={() => setArchetype(null)} className="flex-shrink-0 px-2 py-1 text-zinc-600 hover:text-zinc-400 text-[11px] transition self-center">✕</button>
      )}
    </div>
  );
}

function DimensionContextPanel({archetypeId}) {
  const cfg = ARCHETYPES_CONFIG[archetypeId];
  if (!cfg) return null;
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${cfg.cls} bg-opacity-5`} style={{background: 'rgba(0,0,0,0.2)'}}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-base">{cfg.icon}</span>
        <span className="text-sm font-semibold text-white">{cfg.name}</span>
        <span className="text-[11px] text-zinc-500">{cfg.holdDays} 持仓 · {cfg.alphaSource}</span>
        {cfg.isEvent && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">事件驱动 — 用 Sortino + 赔率评估</span>}
        {!cfg.isEvent && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20">系统因子 — 用 IC + IR + Sharpe 评估</span>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-emerald-600/5 border border-emerald-500/15 rounded-lg p-2.5">
          <div className="text-[10px] text-emerald-500 mb-1.5 font-medium">✅ 适合行情</div>
          {cfg.regimeOn.map((r,i) => <div key={i} className="text-[11px] text-zinc-400 leading-relaxed">{r}</div>)}
        </div>
        <div className="bg-red-600/5 border border-red-500/15 rounded-lg p-2.5">
          <div className="text-[10px] text-red-500 mb-1.5 font-medium">❌ 回避行情</div>
          {cfg.regimeOff.map((r,i) => <div key={i} className="text-[11px] text-zinc-400 leading-relaxed">{r}</div>)}
        </div>
      </div>
      <div>
        <div className="text-[10px] text-zinc-500 mb-2 font-medium uppercase tracking-wider">核心信号</div>
        <div className="space-y-1.5">
          {cfg.keySignals.map((s,i) => (
            <div key={i} className="bg-surface-3/40 rounded-lg px-3 py-2 border border-border/30">
              <span className="text-[11px] font-medium text-zinc-300 mr-2">{s.name}</span>
              <code className="text-[10px] text-emerald-400/80 font-mono">{s.formula}</code>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-red-600/5 border border-red-500/15 rounded-lg px-3 py-2">
        <span className="text-[10px] text-red-400 font-medium mr-2">⚠️ 最高风险</span>
        <span className="text-[11px] text-zinc-400">{cfg.topPitfall}</span>
      </div>
    </div>
  );
}

function TopStocksTable({stocks}) {
  if (!stocks || stocks.length === 0) return null;
  return (
    <Card>
      <h4 className="text-[12px] font-semibold text-zinc-300 mb-2">高频交易股票 TOP {stocks.length}</h4>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-0 text-[10px] md:text-[11px]">
          <thead><tr className="bg-surface-3 text-zinc-500">
            <th className="px-2.5 py-1.5 text-left font-medium">股票代码</th>
            <th className="px-2.5 py-1.5 text-right font-medium">交易次数</th>
            <th className="px-2.5 py-1.5 text-right font-medium">平均收益%</th>
          </tr></thead>
          <tbody>{stocks.map((s,i) => (
            <tr key={i} className="border-t border-border/50 hover:bg-surface-3/50">
              <td className="px-2.5 py-1.5 font-mono text-zinc-300">{s.stock}</td>
              <td className="px-2.5 py-1.5 text-right text-zinc-400">{s.trades}</td>
              <td className={`px-2.5 py-1.5 text-right font-medium ${s.avg_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {s.avg_return_pct >= 0 ? '+' : ''}{Number(s.avg_return_pct).toFixed(2)}%
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
  );
}

function RecordFullDetail({rec, toast, onOptimize}) {
  const [detailTab, setDetailTab] = useState('overview');
  if (!rec) return null;
  const m = rec.metrics || {};
  const tl = m.trade_log || {};
  const tabs = [
    {id:'overview', label:'概览'},
    {id:'trades', label:`交易记录`, count: (tl.sample_winners?.length||0)+(tl.sample_losers?.length||0)},
    {id:'daily', label:'每日活动', count: tl.daily_summary?.length},
    {id:'stocks', label:'高频股票', count: tl.top_stocks?.length},
    {id:'code', label:'源码', show: !!rec.code},
    {id:'log', label:'过程日志', count: rec.process_log?.length},
  ].filter(t => t.show !== false && (t.count == null || t.count > 0));
  return (
    <div className="space-y-4 animate-fade-in">
      <Card className={rec.status === 'APPROVE' ? 'border-emerald-500/20' : 'border-red-500/15'}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{rec.status === 'APPROVE' ? '✅' : '❌'}</span>
              <h3 className="text-base font-bold text-white">{rec.title}</h3>
            </div>
            <div className="text-[11px] text-zinc-500 flex items-center gap-2 flex-wrap">
              <span>{rec.topic} · {rec.created_at} · {rec.attempts}轮迭代</span>
              {rec.mode && ARCHETYPES_CONFIG[rec.mode] && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${ARCHETYPES_CONFIG[rec.mode].cls}`}>
                  {ARCHETYPES_CONFIG[rec.mode].icon} {ARCHETYPES_CONFIG[rec.mode].name}
                </span>
              )}
            </div>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-lg font-medium ${rec.status === 'APPROVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {rec.status === 'APPROVE' ? '通过' : '废弃'}
          </span>
        </div>
        {rec.pm_summary && <div className="text-[12px] text-zinc-300 leading-relaxed whitespace-pre-wrap mb-4 bg-surface-3/50 rounded-xl p-3 border border-border/50">{rec.pm_summary}</div>}
        <MetricsGrid m={m} archetypeId={rec.mode} />
      </Card>

      <div className="flex gap-1 bg-surface-1 rounded-xl p-1 border border-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setDetailTab(t.id)}
            className={`btn flex-1 px-2 py-1.5 rounded-lg text-[12px] font-medium transition flex items-center justify-center gap-1
              ${detailTab === t.id ? 'bg-brand-600/15 text-brand-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {t.label}{t.count != null && <span className="text-[9px] bg-surface-3 px-1 py-0.5 rounded-full">{t.count}</span>}
          </button>
        ))}
      </div>

      {detailTab === 'overview' && (<>
        {tl.pnl_distribution && <PnlDistribution dist={tl.pnl_distribution} />}
        {tl.daily_summary && tl.daily_summary.length > 0 && <DailySummaryChart daily={tl.daily_summary} />}
        {rec.optimization_hint && <Card><h4 className="text-[12px] font-medium text-zinc-400 mb-2">优化建议</h4><pre className="text-[12px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{rec.optimization_hint}</pre></Card>}
        <Card>
          <h4 className="text-[12px] font-medium text-zinc-300 mb-3">在此基础上迭代</h4>
          <div className="flex gap-2">
            <input id="opt_input" placeholder="输入优化方向..." className="flex-1 bg-surface-3 border border-border rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-brand-500/40 transition" />
            <button onClick={() => { const v = document.getElementById('opt_input').value; if (v.trim()) onOptimize(v.trim(), rec); }}
              className="btn px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm text-white font-medium transition shadow-lg shadow-emerald-600/20">迭代优化</button>
          </div>
        </Card>
      </>)}

      {detailTab === 'trades' && (<>
        <TradeTable trades={tl.sample_winners} title={`盈利交易 TOP ${tl.sample_winners?.length || 0}`} />
        <TradeTable trades={tl.sample_losers} title={`亏损交易 TOP ${tl.sample_losers?.length || 0}`} />
      </>)}

      {detailTab === 'daily' && <DailySummaryChart daily={tl.daily_summary} />}
      {detailTab === 'stocks' && <TopStocksTable stocks={tl.top_stocks} />}

      {detailTab === 'code' && rec.code && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[12px] font-medium text-zinc-400">策略源码</h4>
            <button onClick={() => { navigator.clipboard.writeText(rec.code); toast('已复制', 'success'); }}
              className="btn text-[11px] text-brand-400 hover:text-brand-300 px-2 py-1 rounded-lg transition">复制代码</button>
          </div>
          <pre className="text-[11px] text-zinc-400 leading-[1.6] font-mono max-h-[500px] overflow-auto bg-surface-0/50 rounded-xl p-3 border border-border/50">{rec.code}</pre>
        </Card>
      )}

      {detailTab === 'log' && rec.process_log && (
        <Card>
          <h4 className="text-[12px] font-medium text-zinc-400 mb-3">研发过程日志</h4>
          <div className="space-y-2 max-h-[500px] overflow-auto">
            {rec.process_log.map((log, i) => (
              <div key={i} className="text-[11px] text-zinc-400 leading-relaxed border-l-2 border-brand-500/20 pl-3 py-1 whitespace-pre-wrap hover:bg-surface-3/30 rounded-r-lg transition">
                <span className="text-zinc-600 mr-2">#{i+1}</span>{log}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}


// ── ScreenerPresetsPanel ─────────────────────────────

function ScreenerPresetsPanel() {
  const [presets, setPresets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [running, setRunning] = React.useState(false);
  const [runResult, setRunResult] = React.useState(null);
  const toast = React.useContext(ToastContext);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/screener/presets');
      setPresets(Array.isArray(data) ? data : []);
    } catch(e) { toast('加载失败', 'error'); }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const runPreset = async (slug) => {
    setRunning(true); setRunResult(null);
    try {
      const r = await apiPost(`/api/screener/presets/${slug}/run`, {});
      setRunResult(r);
      if (r.error) toast(r.error, 'error');
      else toast(`筛选完成，${r.results?.length || 0} 只`, 'success');
    } catch(e) { toast('运行失败', 'error'); }
    setRunning(false);
  };

  const catColor = (cat) => ({
    momentum: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    reversal: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    value: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    growth: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  }[cat] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20');

  const sel = selected ? presets.find(p => p.slug === selected) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-200">选股预设策略</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">来自 ReachRich 量化引擎 · {presets.length} 个预设</p>
        </div>
        <button onClick={load} disabled={loading} className="btn px-3 py-1.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-[12px] text-zinc-400 border border-border hover:border-border-light transition disabled:opacity-40">
          {loading ? <Spinner /> : '刷新'}
        </button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4" style={{minHeight:'500px'}}>
        {/* Left: preset list */}
        <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-240px)]">
          {loading && [1,2,3,4].map(i => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
          {!loading && presets.length === 0 && (
            <div className="text-center py-12 text-zinc-600 text-sm">暂无预设策略</div>
          )}
          {presets.map(p => (
            <button key={p.slug} onClick={() => { setSelected(p.slug); setRunResult(null); }}
              className={`w-full text-left p-3 rounded-xl border transition card-hover ${selected === p.slug ? 'bg-zinc-800/60 border-zinc-600/40' : 'bg-surface-2 border-border hover:border-border-light'}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-medium text-zinc-200 leading-tight">{p.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${catColor(p.category)}`}>{p.category}</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(p.tags || []).slice(0, 4).map(t => (
                  <span key={t} className="text-[9px] px-1 py-0.5 rounded bg-surface-4 text-zinc-500">{t}</span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Right: detail */}
        <div>
          {!sel && (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-zinc-600">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-sm">选择左侧预设查看详情</div>
              </div>
            </Card>
          )}
          {sel && (
            <div className="space-y-3">
              {/* Header */}
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-100">{sel.name}</h3>
                    <p className="text-[12px] text-zinc-400 mt-1">{sel.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(sel.tags || []).map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded border bg-surface-3 border-border text-zinc-400">{t}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => runPreset(sel.slug)} disabled={running}
                    className="btn flex-shrink-0 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-[12px] rounded-xl transition disabled:opacity-40">
                    {running ? <><Spinner /> 运行中</> : '▶ 立即筛选'}
                  </button>
                </div>
              </Card>

              {/* Payload meta */}
              {sel.payload && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Scoring components */}
                  {sel.payload.scoring?.components && (
                    <Card>
                      <h4 className="text-[11px] font-semibold text-zinc-400 mb-2">评分维度</h4>
                      <div className="space-y-1.5">
                        {sel.payload.scoring.components.map(c => (
                          <div key={c.name} className="flex items-center gap-2">
                            <div className="flex-1 text-[11px] text-zinc-300">{c.label}</div>
                            <div className="text-[11px] text-zinc-500">{c.max}分</div>
                            <div className="w-20 bg-surface-4 rounded-full h-1.5">
                              <div className="bg-zinc-500 h-1.5 rounded-full" style={{width: `${(c.max / 115) * 100}%`}} />
                            </div>
                          </div>
                        ))}
                        <div className="pt-1 border-t border-border mt-1 flex justify-between text-[10px] text-zinc-600">
                          <span>总分</span>
                          <span>{sel.payload.scoring.components.reduce((s,c) => s+(c.max||0), 0)} 分</span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Research notes */}
                  {sel.payload.research_notes && (
                    <Card>
                      <h4 className="text-[11px] font-semibold text-zinc-400 mb-2">研究预期</h4>
                      <div className="space-y-1">
                        {[
                          ['胜率', sel.payload.research_notes.expected_winrate],
                          ['盈亏比', sel.payload.research_notes.expected_pnl_ratio],
                          ['单笔盈', sel.payload.research_notes.expected_profit_per_win],
                          ['单笔亏', sel.payload.research_notes.expected_loss_per_loss],
                          ['月信号', sel.payload.research_notes.expected_monthly_signals],
                        ].filter(([,v]) => v).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-[11px]">
                            <span className="text-zinc-500">{k}</span>
                            <span className="text-zinc-300 font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Parameters */}
                  {sel.payload.parameters && Object.keys(sel.payload.parameters).length > 0 && (
                    <Card className="col-span-2">
                      <h4 className="text-[11px] font-semibold text-zinc-400 mb-2">策略参数</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {Object.entries(sel.payload.parameters).map(([k, v]) => (
                          <div key={k} className="flex items-start gap-2">
                            <span className="text-[10px] font-mono text-zinc-500 min-w-[120px]">{k}</span>
                            <span className="text-[10px] text-zinc-300">= {v.default}{v.min != null ? ` [${v.min}~${v.max}]` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Exit rules */}
                  {sel.payload.exit_rules && (
                    <Card className="col-span-2">
                      <h4 className="text-[11px] font-semibold text-zinc-400 mb-2">止盈止损规则</h4>
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <div className="text-center"><div className="text-base font-bold text-red-400">{((sel.payload.exit_rules.hard_stop_loss_pct||0)*100).toFixed(0)}%</div><div className="text-[10px] text-zinc-600">硬止损</div></div>
                        <div className="text-center"><div className="text-base font-bold text-emerald-400">+{((sel.payload.exit_rules.hard_take_profit_pct||0)*100).toFixed(0)}%</div><div className="text-[10px] text-zinc-600">硬止盈</div></div>
                        <div className="text-center"><div className="text-base font-bold text-zinc-300">{(sel.payload.exit_rules.staged_take_profit||[]).length}</div><div className="text-[10px] text-zinc-600">分批减仓点</div></div>
                      </div>
                      {(sel.payload.exit_rules.staged_take_profit||[]).length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {sel.payload.exit_rules.staged_take_profit.map((s,i) => (
                            <span key={i} className="text-[10px] px-2 py-1 rounded bg-surface-3 border border-border text-zinc-400">{s.note}</span>
                          ))}
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              )}

              {/* Run results */}
              {runResult && !runResult.error && (
                <Card>
                  <h4 className="text-[11px] font-semibold text-zinc-400 mb-2">筛选结果 · {runResult.results?.length || 0} 只</h4>
                  {runResult.results?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-0 text-[11px]">
                        <thead><tr className="text-zinc-600 border-b border-border">
                          {Object.keys(runResult.results[0]).slice(0,8).map(k => (
                            <th key={k} className="py-1 pr-3 text-left font-normal">{k}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {runResult.results.slice(0,20).map((row, i) => (
                            <tr key={i} className="border-b border-border/30 hover:bg-surface-3/30">
                              {Object.values(row).slice(0,8).map((v, j) => (
                                <td key={j} className="py-1.5 pr-3 text-zinc-300">{typeof v === 'number' ? v.toFixed(2) : String(v)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-zinc-600 text-[12px]">今日无符合条件的股票</div>
                  )}
                </Card>
              )}
              {runResult?.error && (
                <div className="text-[12px] text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">{runResult.error}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── QuantView (Rewritten) ────────────────────────────

// F4 — narrative + neighbors components for the factor detail panel.

function FactorNarrativePanel({factor}) {
  const [text, setText] = React.useState(factor.narrative || '');
  const [loading, setLoading] = React.useState(false);
  const [cached, setCached] = React.useState(!!factor.narrative);
  const toast = React.useContext(ToastContext);

  React.useEffect(() => {
    setText(factor.narrative || '');
    setCached(!!factor.narrative);
  }, [factor.id]);

  const generate = async (force) => {
    setLoading(true);
    try {
      const r = await apiPost('/api/digger/factor/' + factor.id + '/narrate' + (force ? '?force=true' : ''), {});
      if (r && r.narrative) {
        setText(r.narrative);
        setCached(!!r.cached);
      } else if (r && r.detail) {
        toast(r.detail, 'error');
      }
    } catch (e) { toast('LLM 叙述失败', 'error'); }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="bg-surface-3/30 rounded-xl p-4 border border-border/20">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[13px] font-semibold text-zinc-200">💡 LLM 叙述</h4>
          <div className="flex items-center gap-1.5 text-[10px]">
            {cached && <span className="text-zinc-600">缓存</span>}
            <button onClick={() => generate(!!text)} disabled={loading}
              className="btn px-2 py-1 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 rounded border border-brand-500/30 disabled:opacity-40">
              {loading ? <Spinner size={3}/> : (text ? '🔄 重新生成' : '✨ 生成')}
            </button>
          </div>
        </div>
        {text ? (
          <div className="text-[13px] text-zinc-300 leading-[1.7] whitespace-pre-wrap">{text}</div>
        ) : (
          <div className="text-[12px] text-zinc-600 py-2">
            点击「生成」让 LLM 给出一段易读的因子解读 (~120 字)
          </div>
        )}
      </div>
    </div>
  );
}

function FactorNeighborsPanel({factor, onPickNeighbor}) {
  const [neighbors, setNeighbors] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    apiGet('/api/digger/factor/' + factor.id + '/neighbors?k=8')
      .then(r => { if (r && !r.error) setNeighbors(r.neighbors || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [factor.id]);

  if (loading) return <LoadingBlock text="寻找邻近因子..." />;
  if (neighbors.length === 0) return <div className="text-[12px] text-zinc-600 py-4 text-center">无邻近因子</div>;

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-zinc-500">
        按 (sharpe, ir, win_rate) 欧氏距离排序 · 距离越小越相似
      </div>
      {neighbors.map(n => (
        <button key={n.id} onClick={() => onPickNeighbor && onPickNeighbor(n.id)}
          className="w-full flex items-start gap-3 py-2 px-3 bg-surface-3/30 hover:bg-surface-3 rounded-lg border border-border/20 hover:border-border-light transition text-left">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-zinc-400 font-mono flex-shrink-0">
            d={n.distance}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-zinc-200 truncate">{n.sub_theme || n.theme || n.id}</div>
            <div className="text-[10px] text-zinc-600 mt-0.5">
              sharpe={n.sharpe?.toFixed(2)} · ir={n.ir?.toFixed(2)} · win={((n.win_rate||0)*100).toFixed(0)}%
              {n.grade && <span className="ml-2 px-1 rounded bg-surface-2 text-brand-400">{n.grade}</span>}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}


function QuantView() {
  const [tab, setTab] = useState('records');
  const [topic, setTopic] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [ledger, setLedger] = useState(null);   // {ok, total, items:[]}
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerStatus, setLedgerStatus] = useState('');
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [signalLedger, setSignalLedger] = useState(null);  // intraday signal records
  const [cache, setCache] = useState('');
  const [strategies, setStrategies] = useState([]);
  const [strategiesLoading, setStrategiesLoading] = useState(false);
  const [strategiesSourceCounts, setStrategiesSourceCounts] = useState({});
  const [strategyFilter, setStrategyFilter] = useState('');
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeTopic, setOptimizeTopic] = useState('');
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [diggerRunning, setDiggerRunning] = useState(false);
  const [diggerLogs, setDiggerLogs] = useState(() => {
    try { const s = localStorage.getItem('rragent_digger_logs'); return s ? JSON.parse(s) : []; } catch(e) { return []; }
  });
  const [diggerStatus, setDiggerStatus] = useState(null);
  const [diggerStatusLoading, setDiggerStatusLoading] = useState(false);
  const [diggerRounds, setDiggerRounds] = useState(5);
  const [diggerFactors, setDiggerFactors] = useState(5);
  const [factorList, setFactorList] = useState([]);
  const [factorStats, setFactorStats] = useState(null);
  const [factorListLoading, setFactorListLoading] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState(null);
  const [combineLoading, setCombineLoading] = useState(false);
  const [diggerSubTab, setDiggerSubTab] = useState('library');
  const [memData, setMemData] = useState(null);
  const [memLoading, setMemLoading] = useState(false);
  const loadMemDashboard = async () => {
    setMemLoading(true);
    try { const r = await apiGet('/api/memory/dashboard'); if (r && !r.error) setMemData(r); } catch(e) {}
    setMemLoading(false);
  };
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [stratResult, setStratResult] = useState(null);
  const [stratLoading, setStratLoading] = useState(false);
  const [exhaustiveResults, setExhaustiveResults] = useState([]);
  const [exhaustiveRunning, setExhaustiveRunning] = useState(false);
  const [exhaustiveProgress, setExhaustiveProgress] = useState(null);
  const [exhaustiveGroupSize, setExhaustiveGroupSize] = useState(2);
  const [exhaustiveMaxCombos, setExhaustiveMaxCombos] = useState(50);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [archetype, setArchetype] = useState(null);
  const toast = useContext(ToastContext);

  // 持久化挖掘日志到 localStorage，最多保留500条
  useEffect(() => {
    try {
      const trimmed = diggerLogs.slice(-500);
      localStorage.setItem('rragent_digger_logs', JSON.stringify(trimmed));
    } catch(e) {}
  }, [diggerLogs]);

  const defaultPresets = [
    {label:'涨停首板溢价',topic:'涨停板放量封板后，次日竞价溢价买入策略，利用A股涨停制度的溢价效应'},
    {label:'聪明钱超跌反弹',topic:'结合资金流向和超跌幅度，在主力资金流入+超跌15%时抄底反弹'},
    {label:'波动收缩突破(VCP)',topic:'振幅逐渐收窄后的放量突破策略，识别有效突破vs假突破'},
    {label:'板块轮动低吸',topic:'利用板块轮动规律，龙头退潮后补涨股低吸策略'},
    {label:'缩量上涨筹码锁定',topic:'缩量稳步上涨=筹码高度集中，放量加速时买入'},
    {label:'竞价博弈策略',topic:'利用开盘竞价跳空+日内走势组合模式，低开反包/高开确认'},
  ];
  const presets = (archetype && ARCHETYPES_CONFIG[archetype]?.presets) || defaultPresets;

  const stepIcons = {'1/5':'🔬','2/5':'💻','3/5':'⚙️','4/5':'🛡️','5/5':'📋'};
  const stepNames = {'1/5':'Alpha Researcher','2/5':'Quant Coder','3/5':'Backtest Engine','4/5':'Risk Analyst','5/5':'Portfolio Manager'};

  const runQuantStream = async (t, cmd, optimizePayload) => {
    const target = t || topic.trim();
    if (!target && cmd !== 'quant_optimize') return;
    setRunning(true); setResult(null); setSteps([]);
    setTab('research');
    toast('量化流水线已启动...', 'info');
    const body = cmd === 'quant_optimize' ? {cmd:'quant_optimize', topic:target, optimize_payload: optimizePayload} : {cmd:'quant', topic:target};
    try {
      const resp = await fetch('/api/quant/stream', {method:'POST', headers: authHeaders(), body:JSON.stringify(body)});
      if (resp.status === 401) { window.__onAuthExpired?.(); return; }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while(true) {
        const {done: rdone, value} = await reader.read();
        if (rdone) break;
        buffer += decoder.decode(value, {stream:true});
        const lines = buffer.split('\n'); buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === 'heartbeat' || evt.type === 'close') continue;
            if (evt.type === 'done') { setResult(evt.result || {summary: evt.content}); toast('量化研发完成', 'success'); }
            else if (evt.type === 'final') { setResult(prev => prev || {summary: evt.text}); }
            else if (evt.type === 'error') { setSteps(prev => [...prev, {step:'-', title:'错误', content:evt.content, status:'error', ts:Date.now()/1000}]); toast(evt.content, 'error'); }
            else { setSteps(prev => { const existing = prev.findIndex(s => s.step === evt.step && s.title === evt.title && s.status === 'running'); if (existing >= 0 && evt.status !== 'running') { const updated = [...prev]; updated[existing] = evt; return updated; } return [...prev, evt]; }); }
          } catch(e) {}
        }
      }
    } catch(e) { toast('流式连接失败: ' + e.message, 'error'); }
    setRunning(false); loadRecords();
  };

  const runQuant = (t) => runQuantStream(t, 'quant');

  const handleOptimizeFromRecord = (optTopic, rec) => {
    const payload = {topic: optTopic, base_title: rec.title || '', base_code: rec.code || '', base_metrics: rec.metrics || {}};
    runQuantStream(optTopic, 'quant_optimize', payload);
  };

  const loadRecords = async () => { setRecordsLoading(true); try { const r = await apiGet('/api/quant/records'); if (r && !r.error) setRecords(r.records || []); else setRecords([]); } catch(e) { setRecords([]); } setRecordsLoading(false); };
  const loadRecordDetail = async (id) => { setSelectedId(id); setDetailLoading(true); setSelectedDetail(null); try { const r = await apiGet('/api/quant/records/' + id); if (r && !r.error && r.id) { setSelectedDetail(r); } else { toast('加载失败', 'error'); } } catch(e) { toast('加载失败', 'error'); } setDetailLoading(false); };
  const loadLedger = async (page=ledgerPage, st=ledgerStatus) => {
    setLedgerLoading(true);
    try {
      const params = new URLSearchParams({page, limit: 30});
      if (st) params.set('status', st);
      const r = await fetch(`/api/quant/ledger?${params}`, {headers: authHeaders()});
      if (r.ok) { const d = await r.json(); setLedger(d); setLedgerPage(page); }
    } catch(e) {}
    setLedgerLoading(false);
  };
  const loadSignalLedger = async () => {
    try {
      const r = await fetch('/api/intraday/signal-ledger?limit=100', {headers: authHeaders()});
      if (r.ok) setSignalLedger(await r.json());
    } catch(e) {}
  };
  const loadCache = async () => { try { const r = await apiPost('/api/command', {cmd:'bt_cache'}); if (r && !r.error) setCache(r.result!=null ? String(r.result) : ''); else setCache(''); } catch(e) { setCache(''); } };
  const loadStrategies = async (src) => {
    setStrategiesLoading(true);
    try {
      const url = src ? `/api/strategies?source=${src}` : '/api/strategies';
      const r = await apiGet(url);
      if (r && !r.error && r.strategies) {
        setStrategies(r.strategies);
        // source_counts always reflects global totals (server computes before filtering)
        if (r.source_counts) setStrategiesSourceCounts(r.source_counts);
      } else setStrategies([]);
    } catch(e) { setStrategies([]); }
    setStrategiesLoading(false);
  };
  const handleBulkDelete = async (sources) => {
    const label = sources.join('/');
    if (!confirm(`确定删除全部 ${label} 来源的策略？此操作不可撤销。`)) return;
    setBulkDeleting(true);
    try {
      const r = await apiPost('/api/strategies/bulk-delete', { sources });
      if (r && r.ok) {
        toast(`已删除 ${r.deleted} 条策略`, 'success');
        loadStrategies(strategyFilter);
      } else toast(r?.error || '删除失败', 'error');
    } catch(e) { toast('请求失败', 'error'); }
    setBulkDeleting(false);
  };
  const loadStrategyDetail = async (id) => { setSelectedId(id); setDetailLoading(true); setSelectedDetail(null); try { const r = await apiGet('/api/strategies/' + id); if (r && !r.error) { setSelectedDetail({...r, _type:'strategy'}); setOptimizeTopic('优化 ' + (r.title || '')); } else { toast('加载失败', 'error'); } } catch(e) {} setDetailLoading(false); };

  const loadDiggerStatus = async () => {
    setDiggerStatusLoading(true);
    try {
      const r = await apiGet('/api/digger/status');
      if (r && r.text) setDiggerStatus(r.text);
    } catch(e) {}
    setDiggerStatusLoading(false);
  };
  const loadFactorList = async () => {
    setFactorListLoading(true);
    try {
      // Server-side default is now sort=latest (newest-first); the existing
      // client-side dropdown (<select> with "最新优先") further re-sorts
      // the already-delivered list if the user picks a different order.
      const r = await apiGet('/api/digger/factors?limit=300&sort=latest');  // 5/22 fix: 不传 limit 后端默认 100, 显式 300 + sort latest
      if (r && !r.error) { setFactorList(r.factors || []); setFactorStats(r.stats || null); }
    } catch(e) { toast('加载因子列表失败','error'); }
    setFactorListLoading(false);
  };
  const retireFactor = async (fid) => {
    if (!confirm('确定退休此因子？')) return;
    try {
      await apiPost('/api/digger/retire', {factor_id: fid});
      toast('因子已退休','success');
      loadFactorList();
      setSelectedFactor(null);
    } catch(e) { toast('操作失败','error'); }
  };
  const [purgePreview, setPurgePreview] = useState(null);
  const [purging, setPurging] = useState(false);
  const [dslScreenCode, setDslScreenCode] = useState('');
  const [dslScreenResult, setDslScreenResult] = useState(null);
  const [dslScreenLoading, setDslScreenLoading] = useState(false);
  const purgeFactors = async (dryRun) => {
    setPurging(true);
    try {
      const r = await apiPost('/api/digger/purge', {dry_run: dryRun});
      if (r.ok) {
        setPurgePreview(r);
        if (!dryRun) {
          toast(`已清理 ${r.retired} 个低质因子，保留 ${r.total_active - r.to_retire} 个`,'success');
          loadFactorList();
        }
      } else toast(r.error || '操作失败','error');
    } catch(e) { toast('操作失败','error'); }
    setPurging(false);
  };
  const runDslScreen = async () => {
    if (!dslScreenCode.trim()) { toast('请输入因子代码','error'); return; }
    setDslScreenLoading(true); setDslScreenResult(null);
    try {
      const r = await apiPost('/api/digger/screen-dsl', {factor_code: dslScreenCode, top_n: 50});
      setDslScreenResult(r);
      if (r.status === 'success') toast(`选股完成: ${r.count} 只`,'success');
      else toast(r.error || '选股失败','error');
    } catch(e) { toast('选股请求失败','error'); }
    setDslScreenLoading(false);
  };
  const [selectedForCombine, setSelectedForCombine] = useState([]);
  const [toStrategyLoading, setToStrategyLoading] = useState(false);
  const [screenResult, setScreenResult] = useState(null);
  const [screenLoading, setScreenLoading] = useState(false);
  const [factorSearch, setFactorSearch] = useState('');
  const [factorSort, setFactorSort] = useState('newest');
  const [factorFilter, setFactorFilter] = useState('grade_ABC'); // grade_ABC(default), grade_A/B/C/D/E, all, active, low_pool, retired...
  const [factorDetailTab, setFactorDetailTab] = useState('metrics');
  // Pagination — 50 per page, reset on filter/search/sort/list change.
  const FACTOR_PAGE_SIZE = 50;
  const [factorPage, setFactorPage] = useState(0);
  useEffect(() => { setFactorPage(0); }, [factorSearch, factorSort, factorFilter, factorList]);

  const toggleCombineSelect = (fid) => {
    setSelectedForCombine(prev => prev.includes(fid) ? prev.filter(id=>id!==fid) : [...prev, fid]);
  };

  const _ASTOCK_THEMES = new Set(['limit_up_chain','money_flow','sector_rotation','emotion_cycle','auction_microstructure','chip_concentration','breakout_quality','reversal_signal','smart_money_divergence','volatility_contraction_breakout']);
  const getFilteredFactors = () => {
    let list = [...factorList];
    if (factorFilter === 'grade_ABC') list = list.filter(f => { const g = getFactorGrade(f); return g === 'A' || g === 'B' || g === 'C'; });
    else if (factorFilter === 'grade_A') list = list.filter(f => getFactorGrade(f) === 'A');
    else if (factorFilter === 'grade_B') list = list.filter(f => getFactorGrade(f) === 'B');
    else if (factorFilter === 'grade_C') list = list.filter(f => getFactorGrade(f) === 'C');
    else if (factorFilter === 'grade_D') list = list.filter(f => getFactorGrade(f) === 'D');
    else if (factorFilter === 'grade_E') list = list.filter(f => getFactorGrade(f) === 'E');
    else if (factorFilter === 'quality') list = list.filter(f => f.status === 'active' && f.sharpe >= 0.5);
    else if (factorFilter === 'low_pool') list = list.filter(f => f.status === 'active' && f.sharpe < 0.5);
    else if (factorFilter === 'vectorized') list = list.filter(f => f.complexity === 'vectorized' && f.status === 'active');
    else if (factorFilter === 'active') list = list.filter(f => f.status === 'active');
    else if (factorFilter === 'retired') list = list.filter(f => f.status !== 'active');
    else if (factorFilter === 'combinable') list = list.filter(f => f.combinable && f.status === 'active');
    else if (factorFilter === 'astock') list = list.filter(f => _ASTOCK_THEMES.has(f.theme) || f.theme === 'mutation');
    else if (factorFilter === 'technical') list = list.filter(f => !_ASTOCK_THEMES.has(f.theme) && f.theme !== 'mutation');
    else if (factorFilter === 'yao') list = list.filter(f => (f.theme || '').startsWith('meme_') || (f.sub_theme || '').startsWith('meme:') || (f.daily_return_pct || 0) >= 4.0);
    else if (factorFilter.startsWith('dim_')) {
      const dimKey = factorFilter.slice(4);
      const dimThemes = ARCHETYPES_CONFIG[dimKey]?.themes;
      if (dimThemes) list = list.filter(f => dimThemes.has(f.theme));
    }
    if (factorSearch.trim()) {
      const q = factorSearch.toLowerCase();
      list = list.filter(f => (f.sub_theme||f.theme||'').toLowerCase().includes(q) || (f.id||'').includes(q) || (f.code||'').toLowerCase().includes(q));
    }
    const sortKey = factorSort;
    if (sortKey === 'sharpe') list.sort((a,b) => (b.sharpe||0) - (a.sharpe||0));
    else if (sortKey === 'ir') list.sort((a,b) => Math.abs(b.ir||0) - Math.abs(a.ir||0));
    else if (sortKey === 'ic') list.sort((a,b) => Math.abs(b.ic_mean||0) - Math.abs(a.ic_mean||0));
    else if (sortKey === 'trades') list.sort((a,b) => (b.trades||0) - (a.trades||0));
    else if (sortKey === 'newest') list.sort((a,b) => (b.created_at||0) - (a.created_at||0));
    else if (sortKey === 'daily_return') list.sort((a,b) => (b.daily_return_pct||0) - (a.daily_return_pct||0));
    return list;
  };
  const [combineHistory, setCombineHistory] = useState([]);
  const [combineHistoryLoading, setCombineHistoryLoading] = useState(false);
  const [selectedCombineRecord, setSelectedCombineRecord] = useState(null);
  const [combineDetailLoading, setCombineDetailLoading] = useState(false);

  const loadCombineHistory = async () => {
    setCombineHistoryLoading(true);
    try {
      const r = await apiGet('/api/digger/combine/history?limit=20');
      if (r && !r.error && r.records) setCombineHistory(r.records);
    } catch(e) { toast('加载融合记录失败','error'); }
    setCombineHistoryLoading(false);
  };
  const loadCombineDetail = async (rid) => {
    setCombineDetailLoading(true);
    try {
      const r = await apiGet('/api/digger/combine/' + rid);
      if (r && !r.error && r.id) setSelectedCombineRecord(r);
    } catch(e) { toast('加载详情失败','error'); }
    setCombineDetailLoading(false);
  };

  const triggerCombine = async () => {
    const ids = selectedForCombine.length >= 2 ? selectedForCombine : [];
    if (ids.length === 0 && factorList.filter(f=>f.status==='active').length < 2) {
      toast('至少需要 2 个活跃因子才能融合', 'error'); return;
    }
    setCombineLoading(true);
    try {
      const r = await apiPost('/api/digger/combine', {factor_ids: ids});
      if (r && r.ok) {
        const v = r.verdict;
        const msg = v === 'accept' ? `融合成功采纳 (${r.factors_used} 因子, Sharpe ${r.combined_metrics?.sharpe?.toFixed(3)||'?'})` :
                    v === 'marginal' ? `融合结果边缘 — 请在融合记录中查看详情` :
                    `融合已回退 — Sharpe 未超过最佳单因子`;
        toast(msg, v === 'accept' ? 'success' : v === 'reject' ? 'error' : 'warning');
        setSelectedForCombine([]);
        loadCombineHistory();
      } else {
        toast(r?.error || '融合失败', 'error');
      }
    } catch(e) { toast('融合请求失败','error'); }
    setCombineLoading(false);
  };
  const factorToStrategy = async (fid) => {
    setToStrategyLoading(true);
    toast('正在回测生成策略，请稍候...', 'info');
    try {
      const r = await apiPost('/api/digger/to-strategy', {factor_id: fid});
      if (r && !r.error && r.ok) {
        const sharpe = r.strategy_metrics?.sharpe_ratio || r.strategy_metrics?.sharpe || 0;
        toast(`策略化成功 Sharpe=${Number(sharpe).toFixed(2)} → 已存入策略库`, 'success');
        loadStrategies();
      } else {
        toast(typeof r?.error === 'string' ? r.error : (r?.result || '策略化失败'), 'error');
      }
    } catch(e) { toast('请求失败: ' + e.message,'error'); }
    setToStrategyLoading(false);
  };

  const runExhaustiveCombine = async () => {
    setExhaustiveRunning(true); setExhaustiveResults([]); setExhaustiveProgress(null);
    try {
      const resp = await fetch('/api/digger/combine/exhaustive', {
        method: 'POST', headers: {...authHeaders(), 'Content-Type': 'application/json'},
        body: JSON.stringify({group_size: exhaustiveGroupSize, max_combos: exhaustiveMaxCombos, skip_tested: true}),
      });
      if (resp.status === 401) { window.__onAuthExpired?.(); setExhaustiveRunning(false); return; }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        buf += decoder.decode(value, {stream: true});
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === 'start') setExhaustiveProgress({total: evt.total, current: 0, candidates: evt.candidates});
            else if (evt.type === 'progress') setExhaustiveProgress(p => ({...p, current: evt.idx, names: evt.names}));
            else if (evt.type === 'result') setExhaustiveResults(prev => [...prev, evt]);
            else if (evt.type === 'done') { setExhaustiveProgress(p => ({...p, done: true, accepted: evt.accepted, best: evt.best})); toast(`穷举完成: ${evt.tested} 组合, ${evt.accepted} 通过`, 'success'); }
          } catch(e) {}
        }
      }
    } catch(e) { toast('穷举融合失败: ' + e.message, 'error'); }
    setExhaustiveRunning(false);
  };

  const loadPipelineStatus = async () => {
    setPipelineLoading(true);
    try {
      const r = await apiGet('/api/auto/pipeline/status');
      if (r && !r.error) setPipelineStatus(r);
    } catch(e) { toast('加载管线状态失败','error'); }
    setPipelineLoading(false);
  };

  const triggerAutoMine = async (rounds=3) => {
    try {
      const r = await apiPost('/api/auto/trigger/mine', {rounds, factors_per_round: 5});
      toast(r?.message || '挖掘已触发', 'success');
    } catch(e) { toast('触发失败','error'); }
  };

  const triggerAutoCombineAll = async () => {
    try {
      const r = await apiPost('/api/auto/trigger/combine-all', {group_size: 2, max_combos: 50});
      toast(r?.message || '融合已触发', 'success');
    } catch(e) { toast('触发失败','error'); }
  };

  const tierColors = {t1_extreme_overfit:'text-red-400',t2_suspect_overfit:'text-amber-400',t3_normal:'text-emerald-400',t4_other:'text-zinc-400'};
  const tierNames = {t1_extreme_overfit:'🔴 极度过拟合',t2_suspect_overfit:'🟠 疑似过拟合',t3_normal:'🟢 正常因子',t4_other:'🟡 其它'};

  const runAnalysis = async () => {
    setAnalysisLoading(true);
    try { const r = await apiPost('/api/digger/analyze', {}); if (r && !r.error) setAnalysisData(r); }
    catch(e) { toast('分析失败','error'); }
    setAnalysisLoading(false);
  };

  const strategize = async (factorId) => {
    setStratLoading(true); setStratResult(null);
    toast('正在回测生成策略，请稍候...', 'info');
    try {
      const r = await apiPost('/api/digger/to-strategy', {factor_id: factorId});
      if (r && !r.error) {
        setStratResult(r);
        if (r.ok) toast(`策略化成功 Sharpe=${(r.strategy_metrics?.sharpe_ratio||0).toFixed(2)}`,'success');
        else toast(r.error || '策略化失败','error');
      } else {
        toast(typeof r?.error === 'string' ? r.error : (r?.result || '策略化失败'), 'error');
      }
    } catch(e) { toast('策略化失败: ' + e.message,'error'); }
    setStratLoading(false);
  };

  const startDigger = async () => {
    setDiggerRunning(true);
    setDiggerLogs([{ts: Date.now(), text: '⛏️ 因子挖掘启动中...', type: 'info'}]);
    try {
      const resp = await fetch('/api/digger/start', {method:'POST', headers: authHeaders(), body: JSON.stringify({rounds: diggerRounds, factors: diggerFactors, interval: 30})});
      if (resp.status === 401) { window.__onAuthExpired?.(); setDiggerRunning(false); return; }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const {done: rdone, value} = await reader.read();
        if (rdone) break;
        buffer += decoder.decode(value, {stream:true});
        const lines = buffer.split('\n'); buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === 'heartbeat' || evt.type === 'close') continue;
            if (evt.type === 'progress' || evt.type === 'done') {
              setDiggerLogs(prev => [...prev, {ts: Date.now(), text: evt.text, type: evt.type === 'done' ? 'success' : 'info'}]);
              if (evt.type === 'done') { toast('因子挖掘完成', 'success'); break; }
            } else if (evt.type === 'error') {
              setDiggerLogs(prev => [...prev, {ts: Date.now(), text: evt.text, type: 'error'}]);
              toast(evt.text, 'error');
            } else if (evt.type === 'started') {
              setDiggerLogs(prev => [...prev, {ts: Date.now(), text: `启动: ${evt.rounds}轮 × ${evt.factors}因子/轮`, type: 'info'}]);
            }
          } catch(e) {}
        }
      }
    } catch(e) { toast('连接失败: ' + e.message, 'error'); setDiggerLogs(prev => [...prev, {ts: Date.now(), text: '连接失败: ' + e.message, type: 'error'}]); }
    setDiggerRunning(false);
    loadDiggerStatus();
  };

  useEffect(()=>{loadRecords();loadStrategies();},[]);
  // 当选择策略维度时，同步因子库的过滤器
  useEffect(()=>{ if (archetype) setFactorFilter('dim_' + archetype); else setFactorFilter('grade_ABC'); },[archetype]);

  const statusIcon = (s) => ({APPROVE:'✅', REJECT:'❌', PENDING:'🟡'}[s] || '⚪');
  const categoryIcon = (c) => ({breakout:'🚀',momentum:'📈',value:'💎',pattern:'📐',sentiment:'🧠',trend:'📊',observation:'👀',four_dim:'🎯'}[c] || '📋');
  const categoryLabel = (c) => ({breakout:'突破',momentum:'动量',value:'价值',pattern:'形态',sentiment:'情绪',trend:'趋势',observation:'观察',four_dim:'四维共振'}[c] || c);
  const themeColor = (t) => ({
    limit_up_chain:'text-red-400', money_flow:'text-cyan-400', sector_rotation:'text-amber-400',
    emotion_cycle:'text-pink-400', auction_microstructure:'text-orange-400', chip_concentration:'text-teal-400',
    breakout_quality:'text-emerald-400', reversal_signal:'text-blue-400', smart_money_divergence:'text-violet-400',
    volatility_contraction_breakout:'text-indigo-400', momentum:'text-zinc-400', mean_reversion:'text-zinc-400',
    intraday_pattern:'text-zinc-400', gap_factor:'text-zinc-400', cross_sectional_rank:'text-zinc-400',
    volatility_regime:'text-zinc-500', range_compression:'text-zinc-500', volume_distribution:'text-zinc-500',
    higher_moment:'text-zinc-500', price_volume_sync:'text-zinc-500', liquidity_shock:'text-zinc-500',
    volume_price_div:'text-zinc-500', mutation:'text-purple-400',
  }[t] || 'text-zinc-500');
  const themeBg = (t) => ({
    limit_up_chain:'bg-red-500/10', money_flow:'bg-cyan-500/10', sector_rotation:'bg-amber-500/10',
    emotion_cycle:'bg-pink-500/10', auction_microstructure:'bg-orange-500/10', chip_concentration:'bg-teal-500/10',
    breakout_quality:'bg-emerald-500/10', reversal_signal:'bg-blue-500/10', smart_money_divergence:'bg-violet-500/10',
    volatility_contraction_breakout:'bg-indigo-500/10', mutation:'bg-purple-500/10',
  }[t] || 'bg-surface-3');
  const themeLabel = (t) => ({
    limit_up_chain:'涨停连板', money_flow:'资金流向', sector_rotation:'板块轮动',
    emotion_cycle:'情绪周期', auction_microstructure:'竞价博弈', chip_concentration:'筹码结构',
    breakout_quality:'突破质量', reversal_signal:'反转信号', smart_money_divergence:'聪明钱',
    volatility_contraction_breakout:'VCP突破', momentum:'动量', mean_reversion:'均值回归',
    intraday_pattern:'日内形态', gap_factor:'跳空缺口', cross_sectional_rank:'截面强弱',
    volatility_regime:'波动率', range_compression:'振幅压缩', volume_distribution:'量能分布',
    higher_moment:'高阶矩', price_volume_sync:'量价同步', liquidity_shock:'流动性',
    volume_price_div:'量价背离', mutation:'变异因子',
  }[t] || t);

  const approvedCount = records.filter(r => r.status === 'APPROVE').length;
  const tabItems = [
    {id:'records', label:'挖掘记录', icon:'📊', badge: records.length},
    {id:'research', label:'启动研发', icon:'🔬'},
    {id:'digger', label:'因子挖掘', icon:'⛏️'},
    {id:'library', label:'策略库', icon:'📚', badge: (strategiesSourceCounts['factor'] || 0) || strategies.length},
    {id:'presets', label:'选股预设', icon:'🎯'},
    {id:'ledger', label:'账本', icon:'📝'},
  ];

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">A股量化策略研发</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            涨停连板 · 资金流向 · 板块轮动 · 情绪周期 · 竞价博弈 ·
            <span className="text-emerald-400 ml-1">{approvedCount} 通过</span> /
            <span className="text-zinc-400 ml-1">{records.length} 记录</span> /
            <span className="text-brand-400 ml-1">{strategies.length} 策略</span>
          </p>
        </div>
        <button onClick={loadRecords} className="btn px-3 py-1.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-[12px] text-zinc-400 border border-border hover:border-border-light transition">
          {recordsLoading ? <Spinner /> : '刷新'}
        </button>
      </div>

      <ArchetypeBar archetype={archetype} setArchetype={setArchetype} />
      {archetype && <DimensionContextPanel archetypeId={archetype} />}

      <div className="flex gap-1 bg-surface-1 rounded-xl p-1 border border-border">
        {tabItems.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`btn flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition
              ${tab===t.id ? 'bg-brand-600/15 text-brand-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <span>{t.icon}</span><span>{t.label}</span>
            {t.badge > 0 && <span className="text-[10px] bg-surface-3 px-1.5 py-0.5 rounded-full text-zinc-500">{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === 'records' && (
        <div className="grid lg:grid-cols-[320px_1fr] gap-4" style={{minHeight:'600px'}}>
          <div className="space-y-2 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-220px)] pr-1">
            {recordsLoading && <LoadingBlock text="加载记录..." />}
            {!recordsLoading && records.length === 0 && <Card><div className="text-center py-8 text-zinc-600 text-sm"><div className="text-3xl mb-2">📊</div>暂无挖掘记录<br/><span className="text-zinc-700">去「启动研发」开始第一次量化挖掘</span></div></Card>}
            {records.filter(r => !archetype || r.mode === archetype || r.mode === (archetype === 'consecutive_limit_up' ? 'meme' : null)).map(r => (
              <div key={r.id} onClick={() => loadRecordDetail(r.id)}
                className={`rounded-xl border px-3.5 py-3 cursor-pointer transition-all group
                  ${selectedId === r.id ? 'border-brand-500/30 bg-brand-600/5' : 'border-border bg-surface-2 hover:border-border-light hover:bg-surface-3'}`}>
                <div className="flex items-start gap-2.5">
                  <span className="text-base mt-0.5">{statusIcon(r.status)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="text-[13px] font-medium text-white group-hover:text-brand-400 transition truncate">{r.title}</div>
                      {r.mode && ARCHETYPES_CONFIG[r.mode] && (
                        <span className={`flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded border ${ARCHETYPES_CONFIG[r.mode].cls}`}>
                          {ARCHETYPES_CONFIG[r.mode].icon}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">{r.created_at} · {r.attempts}轮</div>
                    {r.metrics && (
                      <div className="flex gap-2 mt-1.5 flex-wrap text-[10px]">
                        {r.metrics.total_return != null && <span className={`px-1.5 py-0.5 rounded ${Number(r.metrics.total_return) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>收益 {Number(r.metrics.total_return).toFixed(1)}%</span>}
                        {r.metrics.sharpe != null && <span className={`px-1.5 py-0.5 rounded ${Number(r.metrics.sharpe) >= 0 ? 'bg-surface-3 text-zinc-400' : 'bg-red-500/10 text-red-400'}`}>夏普 {Number(r.metrics.sharpe).toFixed(2)}</span>}
                        {r.metrics.win_rate != null && <span className="px-1.5 py-0.5 rounded bg-surface-3 text-zinc-400">胜率 {Number(r.metrics.win_rate).toFixed(0)}%</span>}
                        {r.metrics.max_drawdown != null && <span className="px-1.5 py-0.5 rounded bg-surface-3 text-zinc-500">回撤 {Number(r.metrics.max_drawdown).toFixed(1)}%</span>}
                      </div>
                    )}
                  </div>
                  {r.has_code && <span className="text-[8px] px-1 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20">码</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-y-auto overflow-x-hidden max-h-[calc(100vh-220px)] pr-1">
            {!selectedId && !detailLoading && <Card><div className="text-center py-16 text-zinc-600"><div className="text-4xl mb-3">👈</div><div className="text-sm">选择左侧记录查看完整挖掘数据</div><div className="text-[11px] text-zinc-700 mt-1">包含指标、交易记录、每日活动、盈亏分布等全量数据</div></div></Card>}
            {detailLoading && <Card><LoadingBlock text="加载完整数据..." /></Card>}
            {selectedDetail && !selectedDetail._type && !detailLoading && <RecordFullDetail rec={selectedDetail} toast={toast} onOptimize={handleOptimizeFromRecord} />}
          </div>
        </div>
      )}

      {tab === 'research' && (<>
        <Card className="glow-brand border-brand-500/10">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-zinc-300">🔬 启动研究</h3>
            {archetype && ARCHETYPES_CONFIG[archetype] && (
              <span className={`text-[11px] px-2 py-0.5 rounded border ${ARCHETYPES_CONFIG[archetype].cls}`}>
                {ARCHETYPES_CONFIG[archetype].icon} {ARCHETYPES_CONFIG[archetype].name} 维度
              </span>
            )}
          </div>
          <div className="flex gap-2 mb-3">
            <input value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runQuant()} placeholder="输入策略研究主题，例如: 涨停板块轮动短线策略" className="flex-1 bg-surface-3 border border-border rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-brand-500/40 transition" />
            <button onClick={()=>runQuant()} disabled={running || optimizing || !topic.trim()} className="btn px-5 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-sm text-white font-medium transition shadow-lg shadow-brand-600/20 disabled:opacity-40">{running ? <Spinner /> : '启动挖掘'}</button>
          </div>
          <div className="flex flex-wrap gap-2">{presets.map((p,i) => (<button key={i} onClick={()=>{setTopic(p.topic);runQuant(p.topic);}} disabled={running || optimizing} className="btn px-3 py-1.5 bg-surface-3 hover:bg-surface-4 border border-border hover:border-border-light rounded-lg text-[12px] text-zinc-400 hover:text-zinc-200 transition disabled:opacity-40">{p.label}</button>))}</div>
          {(running || optimizing) && (<div className="mt-4 flex items-center gap-3 text-sm text-brand-400 bg-brand-600/5 rounded-xl px-4 py-3 border border-brand-500/10"><Spinner /><span>{optimizing ? '策略优化中' : '量化流水线执行中'}... 请耐心等待</span></div>)}
        </Card>
        {steps.length > 0 && (<Card>
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">📋 研发过程 <span className="text-zinc-600 font-normal">({steps.length} 步)</span></h3>
          <div className="space-y-2">{steps.map((s, i) => (
            <div key={i} className={`rounded-xl border px-4 py-3 transition-all ${s.status === 'running' ? 'border-brand-500/30 bg-brand-600/5 animate-pulse' : s.status === 'error' ? 'border-red-500/20 bg-red-600/5' : s.status === 'done' ? 'border-emerald-500/15 bg-emerald-600/5' : 'border-border bg-surface-2'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{stepIcons[s.step] || '📌'}</span>
                <span className="text-[12px] font-medium text-zinc-300">{s.title || stepNames[s.step] || s.step}</span>
                <span className="text-[10px] text-zinc-600">{s.step}</span>
                {s.attempt > 1 && <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-md">第{s.attempt}轮</span>}
                {s.status === 'running' && <Spinner />}
                {s.status === 'done' && <span className="text-[10px] text-emerald-500">✓ 完成</span>}
                {s.status === 'error' && <span className="text-[10px] text-red-400">✗ 失败</span>}
              </div>
              {s.type === 'code' ? (<ExpandableCode code={s.detail || s.content} label={s.code_len ? `Coder 第${s.attempt||'?'}轮` : ''} />)
                : s.type === 'metrics' && s.metrics ? (<div className="flex flex-wrap gap-2 mt-1">{Object.entries(s.metrics).filter(([k]) => typeof s.metrics[k] === 'number').slice(0,8).map(([k,v]) => (<span key={k} className="text-[10px] bg-surface-3 rounded-lg px-2 py-1 text-zinc-400">{k}: <span className="text-zinc-200 font-medium">{typeof v === 'number' ? v.toFixed(3) : v}</span></span>))}</div>)
                : s.status === 'error' && s.detail ? (<ExpandableDetail text={s.detail} />)
                : (<div className="text-[11px] text-zinc-500 max-h-24 overflow-auto leading-relaxed">{s.content}</div>)
              }
              {s.decision && (<div className={`mt-2 text-[11px] font-medium ${s.decision==='APPROVE' ? 'text-emerald-400' : 'text-red-400'}`}>{s.decision === 'APPROVE' ? '✅ 通过' : '❌ 驳回'}{s.suggestions ? ` — ${s.suggestions}` : ''}</div>)}
            </div>
          ))}</div>
        </Card>)}
        {result && (<Card className={result.status === 'APPROVE' ? 'border-emerald-500/20' : 'border-red-500/15'}>
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">📊 研发结果</h3>
          <pre className="text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap mb-4">{result.summary || JSON.stringify(result, null, 2)}</pre>
          <MetricsGrid m={result.metrics} archetypeId={archetype} />
          {result.code && (<div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-zinc-500">策略源码</span>
              <button onClick={()=>{navigator.clipboard.writeText(result.code); toast('代码已复制','success');}} className="btn text-[10px] text-brand-400 hover:text-brand-300 px-2 py-1 rounded-lg transition">复制</button>
            </div>
            <pre className="text-[11px] text-zinc-400 font-mono max-h-48 overflow-auto bg-surface-0/50 rounded-xl p-3 border border-border/50 leading-relaxed">{result.code}</pre>
            <div className="mt-3 flex gap-2">
              <input value={optimizeTopic} onChange={e=>setOptimizeTopic(e.target.value)} placeholder="继续优化方向..." className="flex-1 bg-surface-3 border border-border rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-brand-500/40 transition" />
              <button onClick={()=>{ if(!optimizeTopic.trim()) return; handleOptimizeFromRecord(optimizeTopic.trim(), result); }} disabled={running || !optimizeTopic.trim()}
                className="btn px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm text-white font-medium transition shadow-lg shadow-emerald-600/20 disabled:opacity-40">迭代优化</button>
            </div>
          </div>)}
        </Card>)}
      </>)}

      {tab === 'library' && (
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-4">
          <div className="space-y-3">
            {/* 策略库头部 */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest">策略库</span>
              <div className="flex items-center gap-2">
                <button onClick={() => loadStrategies(strategyFilter)} className="btn text-[12px] text-brand-400 hover:text-brand-300 px-2 py-1 rounded-lg transition">{strategiesLoading ? <Spinner /> : '刷新'}</button>
              </div>
            </div>
            {/* 来源统计 + 筛选 */}
            <div className="bg-surface-2/60 rounded-xl border border-border/40 p-2.5 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {[['', '全部'], ['factor', '因子策略'], ['auto_promote', '自动推广'], ['optimize', '优化']].map(([src, label]) => {
                  const total = Object.values(strategiesSourceCounts).reduce((a,b)=>a+b,0);
                  const cnt = src === '' ? total : (strategiesSourceCounts[src] || 0);
                  return (
                    <button key={src} onClick={() => { setStrategyFilter(src); loadStrategies(src); }}
                      className={`text-[11px] px-2 py-0.5 rounded-md transition ${strategyFilter === src ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40' : 'bg-surface-3/50 text-zinc-500 hover:text-zinc-300'}`}>
                      {label} {cnt > 0 ? `(${cnt})` : ''}
                    </button>
                  );
                })}
              </div>
              {/* 批量清理按钮 */}
              <div className="flex gap-1.5 flex-wrap">
                <button disabled={bulkDeleting} onClick={() => handleBulkDelete(['optimize'])}
                  className="text-[10px] px-2 py-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 rounded-lg border border-rose-600/20 transition disabled:opacity-50">
                  {bulkDeleting ? <Spinner size={2}/> : '🗑️ 清除 optimize 策略'}
                </button>
                <button disabled={bulkDeleting} onClick={() => handleBulkDelete(['auto_promote'])}
                  className="text-[10px] px-2 py-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 rounded-lg border border-rose-600/20 transition disabled:opacity-50">
                  {bulkDeleting ? <Spinner size={2}/> : '🗑️ 清除 auto_promote 策略'}
                </button>
                <button disabled={bulkDeleting} onClick={() => handleBulkDelete(['optimize', 'auto_promote'])}
                  className="text-[10px] px-2 py-1 bg-rose-700/20 hover:bg-rose-700/30 text-rose-300 rounded-lg border border-rose-600/30 transition font-medium disabled:opacity-50">
                  ⚡ 一键全清
                </button>
              </div>
              <div className="text-[9px] text-zinc-600">后端只保留默认15个策略，本地库只管理因子策略</div>
            </div>
            {strategiesLoading && <LoadingBlock text="加载策略库..." />}
            {!strategiesLoading && strategies.length === 0 && <Card><div className="text-center py-6 text-zinc-600 text-sm"><div className="text-2xl mb-2">📚</div>暂无策略<br/><span className="text-[11px]">在因子库中点击 📈 将因子策略化</span></div></Card>}
            {strategies.map(s => (
              <Card key={s.id} onClick={() => loadStrategyDetail(s.id)} className={`group cursor-pointer ${selectedId === s.id ? 'border-brand-500/30 bg-brand-600/5' : ''}`}>
                <div className="flex items-start gap-2.5">
                  <span className="text-lg mt-0.5">{s.source === 'factor' ? '🧬' : s.source === 'auto_promote' ? '🤖' : s.source === 'optimize' ? '⚙️' : s.synced_deployed ? '🚀' : '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-white group-hover:text-brand-400 transition truncate">{s.title}</div>
                    <div className="text-[11px] text-zinc-600 mt-0.5 line-clamp-1">{s.description || ''}</div>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                        s.source==='factor' ? 'bg-violet-600/15 text-violet-400' :
                        s.source==='auto_promote' ? 'bg-amber-600/15 text-amber-400' :
                        s.source==='optimize' ? 'bg-zinc-600/20 text-zinc-500' :
                        'bg-blue-600/15 text-blue-400'
                      }`}>{s.source}</span>
                      {s.synced_deployed && <span className="text-[9px] px-1.5 py-0.5 bg-emerald-600/15 text-emerald-400 rounded-md">已部署</span>}
                      {s.status === 'draft' && <span className="text-[9px] px-1.5 py-0.5 bg-amber-600/15 text-amber-400 rounded-md">草稿</span>}
                      {s.metrics?.sharpe_ratio != null && <span className="text-[9px] text-zinc-500">Sharpe {Number(s.metrics.sharpe_ratio).toFixed(2)}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div>
            {!selectedId && <Card><div className="text-center py-12 text-zinc-600 text-sm"><div className="text-3xl mb-3">👈</div>选择左侧策略查看详情</div></Card>}
            {detailLoading && <Card><LoadingBlock text="加载详情..." /></Card>}
            {selectedDetail && selectedDetail._type === 'strategy' && !detailLoading && (
              <Card className="border-brand-500/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{selectedDetail.title}</h3>
                  <div className="flex items-center gap-1">
                    {selectedDetail.synced_deployed && <span className="text-[9px] px-1.5 py-0.5 bg-emerald-600/15 text-emerald-400 rounded-md">已部署</span>}
                    {selectedDetail.source === 'factor' && <span className="text-[9px] px-1.5 py-0.5 bg-violet-600/15 text-violet-400 rounded-md">因子: {selectedDetail.factor_id}</span>}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 mb-3">{selectedDetail.description}</p>
                {selectedDetail.metrics && Object.keys(selectedDetail.metrics).length > 0 && <MetricsGrid m={selectedDetail.metrics} />}
                {selectedDetail.code && <pre className="mt-3 text-[11px] text-zinc-400 font-mono max-h-64 overflow-auto bg-surface-0/50 rounded-xl p-3 border border-border/50">{selectedDetail.code}</pre>}
                {selectedDetail.params && <div className="mt-2 text-[10px] text-zinc-600">入场阈值: {selectedDetail.params.entry_pct} | 出场阈值: {selectedDetail.params.exit_pct}</div>}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {selectedDetail.source === 'factor' && !selectedDetail.synced_deployed && (
                    <button onClick={async () => {
                      try {
                        const r = await apiPost('/api/strategies/' + selectedDetail.id + '/sync', {});
                        if (r.ok) { toast('已同步到 ${RR_HOST_BACKEND}','success'); loadStrategyDetail(selectedDetail.id); loadStrategies(); }
                        else toast(r.error || '同步失败','error');
                      } catch(e) { toast('同步请求失败','error'); }
                    }} className="btn px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-[12px] text-white font-medium transition">
                      🚀 部署到 ReachRich
                    </button>
                  )}
                  {selectedDetail.synced_deployed && <span className="px-3 py-2 text-[11px] text-emerald-400 flex items-center gap-1">✅ {selectedDetail.remote_path || '已部署'}</span>}
                  {selectedDetail.source === 'factor' && (
                    <button onClick={async () => {
                      try {
                        toast('正在回测...','info');
                        const r = await apiPost('/api/strategies/' + selectedDetail.id + '/backtest', {});
                        if (r.ok) { toast(`回测完成 Sharpe=${(r.metrics?.sharpe_ratio||0).toFixed(2)}`,'success'); loadStrategyDetail(selectedDetail.id); }
                        else toast(r.error || '回测失败','error');
                      } catch(e) { toast('回测请求失败','error'); }
                    }} className="btn px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[12px] text-white font-medium transition">
                      📊 重新回测
                    </button>
                  )}
                  {selectedDetail.source === 'factor' && (
                    <button disabled={screenLoading} onClick={async () => {
                      setScreenLoading(true); setScreenResult(null);
                      toast('正在运行选股，请稍候...','info');
                      try {
                        const r = await apiPost('/api/strategies/' + selectedDetail.id + '/screen', {top_n: 50});
                        setScreenResult(r);
                        if (r.status === 'success') toast(`选股完成: ${r.count} 只股票 (信号日 ${r.signal_date||r.trade_date})`,'success');
                        else toast(r.error || '选股失败','error');
                      } catch(e) { toast('选股请求失败','error'); }
                      setScreenLoading(false);
                    }} className="btn px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-[12px] text-white font-medium transition disabled:opacity-50">
                      {screenLoading ? <span className="flex items-center gap-1"><Spinner size={3}/>选股中...</span> : '🎯 运行选股'}
                    </button>
                  )}
                  {selectedDetail.source === 'factor' && (
                    <button onClick={async () => {
                      if (!confirm('确定删除此策略？')) return;
                      try {
                        const r = await fetch('/api/strategies/' + selectedDetail.id, {method:'DELETE', headers: authHeaders()});
                        if (r.ok) { toast('已删除','success'); setSelectedDetail(null); setSelectedId(''); loadStrategies(); }
                        else toast('删除失败','error');
                      } catch(e) { toast('删除失败','error'); }
                    }} className="btn px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 rounded-xl text-[12px] text-rose-400 font-medium transition">
                      🗑️ 删除
                    </button>
                  )}
                </div>
                {/* Screen results panel */}
                {screenResult && screenResult.status === 'success' && screenResult.count > 0 && (
                  <div className="mt-3 bg-surface-3/50 rounded-xl border border-amber-500/20 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[12px] font-semibold text-amber-400">
                        🎯 选股结果 — {screenResult.signal_date || screenResult.trade_date} 信号
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">{screenResult.count}/{screenResult.total_selected} 只</span>
                        <button onClick={()=>{
                          const text = screenResult.stocks.map(s=>`${s.ts_code} ${s.name} ${s.close} ${s.pct_chg>0?'+':''}${s.pct_chg.toFixed(2)}%`).join('\n');
                          navigator.clipboard.writeText(text); toast('已复制股票列表','success');
                        }} className="text-[10px] text-zinc-400 hover:text-zinc-300 transition">📋 复制</button>
                        <button onClick={()=>setScreenResult(null)} className="text-[10px] text-zinc-500 hover:text-zinc-400">✕</button>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-border max-h-[300px] overflow-y-auto overflow-x-hidden">
                      <table className="w-full min-w-0 text-[10px] md:text-[11px]">
                        <thead className="sticky top-0"><tr className="bg-surface-3 text-zinc-500">
                          <th className="px-2 py-1.5 text-left font-medium">代码</th>
                          <th className="px-2 py-1.5 text-left font-medium">名称</th>
                          <th className="px-2 py-1.5 text-right font-medium">收盘价</th>
                          <th className="px-2 py-1.5 text-right font-medium">涨跌%</th>
                          {screenResult.stocks[0]?.factor_score != null && <th className="px-2 py-1.5 text-right font-medium">因子分</th>}
                        </tr></thead>
                        <tbody>{screenResult.stocks.map((s,i) => (
                          <tr key={i} className="border-t border-border/30 hover:bg-surface-3/50">
                            <td className="px-2 py-1 font-mono text-zinc-300">{s.ts_code}</td>
                            <td className="px-2 py-1 text-zinc-400">{s.name}</td>
                            <td className="px-2 py-1 text-right text-zinc-300">{Number(s.close).toFixed(2)}</td>
                            <td className={`px-2 py-1 text-right font-mono ${s.pct_chg>0?'text-red-400':s.pct_chg<0?'text-emerald-400':'text-zinc-500'}`}>{s.pct_chg>0?'+':''}{Number(s.pct_chg).toFixed(2)}%</td>
                            {s.factor_score != null && <td className="px-2 py-1 text-right font-mono text-brand-400">{Number(s.factor_score).toFixed(4)}</td>}
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                )}
                {screenResult && screenResult.status === 'success' && screenResult.count === 0 && (
                  <div className="mt-3 bg-surface-3/50 rounded-xl border border-zinc-600/20 p-3 text-center text-[11px] text-zinc-500">
                    {screenResult.message || '最近交易日无入场信号'}
                  </div>
                )}
                {screenResult && screenResult.status === 'error' && (
                  <div className="mt-3 bg-red-600/5 rounded-xl border border-red-500/20 p-3 text-[11px] text-red-400">
                    选股失败: {screenResult.error}
                  </div>
                )}
                {selectedDetail.source !== 'factor' && (
                  <div className="flex gap-2 mt-3">
                    <input value={optimizeTopic} onChange={e=>setOptimizeTopic(e.target.value)} placeholder="基于此策略优化..." className="flex-1 bg-surface-3 border border-border rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-brand-500/40 transition" />
                    <button onClick={() => { if (!optimizeTopic.trim()) return; handleOptimizeFromRecord(optimizeTopic.trim(), selectedDetail); }} disabled={running || !optimizeTopic.trim()}
                      className="btn px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm text-white font-medium transition disabled:opacity-40">优化</button>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === 'digger' && (
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="flex gap-1 bg-surface-2 p-1 rounded-xl">
            {[{id:'library',label:'因子库',icon:'📦'},{id:'screener',label:'DSL 选股',icon:'🎯'},{id:'analysis',label:'健康分析',icon:'🔬'},{id:'combine_history',label:'融合记录',icon:'🔮'},{id:'exhaustive',label:'穷举融合',icon:'🧪'},{id:'pipeline',label:'自动化 管线',icon:'🔗'},{id:'mine',label:'启动挖掘',icon:'⛏️'},{id:'logs',label:'挖掘日志',icon:'📋',badge:diggerLogs.length},{id:'memory',label:'记忆',icon:'🧠'}].map(t=>(
              <button key={t.id} onClick={()=>{setDiggerSubTab(t.id);if(t.id==='library'&&factorList.length===0)loadFactorList();if(t.id==='combine_history')loadCombineHistory();if(t.id==='memory')loadMemDashboard();}}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition ${diggerSubTab===t.id?'bg-surface-4 text-zinc-200 shadow':'text-zinc-500 hover:text-zinc-400'}`}>
                <span>{t.icon}</span><span>{t.label}</span>{t.badge?<span className="ml-1 px-1.5 py-0.5 bg-brand-600/20 text-brand-400 text-[10px] rounded-full">{t.badge}</span>:null}
              </button>
            ))}
          </div>

          {/* === 因子库 Sub-tab === */}
          {diggerSubTab === 'library' && (<>
            <Card className="glow-brand border-brand-500/10">
              {/* Header + Actions */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-zinc-300">📦 因子库</h3>
                {factorList.length > 0 && (() => {
                  const gradeCount = {A:0,B:0,C:0,D:0,E:0};
                  factorList.forEach(f => { const g = getFactorGrade(f); gradeCount[g] = (gradeCount[g]||0)+1; });
                  return (<>
                    {gradeCount.A>0&&<button onClick={()=>setFactorFilter('grade_A')} className="text-[10px] px-1.5 py-0.5 rounded border bg-yellow-500/25 text-yellow-300 border-yellow-500/40 hover:opacity-80 transition font-bold">A {gradeCount.A}</button>}
                    {gradeCount.B>0&&<button onClick={()=>setFactorFilter('grade_B')} className="text-[10px] px-1.5 py-0.5 rounded border bg-emerald-500/20 text-emerald-400 border-emerald-500/35 hover:opacity-80 transition font-bold">B {gradeCount.B}</button>}
                    {gradeCount.C>0&&<button onClick={()=>setFactorFilter('grade_C')} className="text-[10px] px-1.5 py-0.5 rounded border bg-brand-500/15 text-brand-400 border-brand-500/30 hover:opacity-80 transition font-bold">C {gradeCount.C}</button>}
                    {gradeCount.D>0&&<button onClick={()=>setFactorFilter('grade_D')} className="text-[10px] px-1.5 py-0.5 rounded border bg-zinc-500/10 text-zinc-400 border-zinc-600/25 hover:text-zinc-300 transition font-bold">D {gradeCount.D}</button>}
                    {gradeCount.E>0&&<button onClick={()=>setFactorFilter('grade_E')} className="text-[10px] px-1.5 py-0.5 rounded border bg-red-500/10 text-red-500/60 border-red-800/20 hover:opacity-80 transition font-bold">E {gradeCount.E}</button>}
                  </>);
                })()}
              </div>
                <div className="flex gap-2">
                  <button onClick={triggerCombine} disabled={combineLoading || factorList.filter(f=>f.status==='active').length < 2}
                    className="btn px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[12px] font-semibold rounded-lg transition shadow-lg shadow-amber-600/20 disabled:opacity-50">
                    {combineLoading ? <span className="flex items-center gap-1"><Spinner size={3}/>融合中...</span> : selectedForCombine.length >= 2 ? `🔮 融合 ${selectedForCombine.length} 个` : '🔮 全部融合'}
                  </button>
                  {selectedForCombine.length > 0 && (
                    <button onClick={()=>setSelectedForCombine([])} className="btn px-3 py-1.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-[12px] text-zinc-400 border border-border transition">清除选择</button>
                  )}
                  <button onClick={loadFactorList} disabled={factorListLoading}
                    className="btn px-3 py-1.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-[12px] text-zinc-400 border border-border transition">
                    {factorListLoading ? <Spinner size={3}/> : '刷新'}
                  </button>
                  <PushToIMButton endpoint="/api/digger/push-status" label="推送 IM" />
                </div>
              </div>

              {/* Stats row */}
              {factorStats && (
                <div className="space-y-2 mb-4">
                  {/* ABCDE 评级分布行 */}
                  {(factorStats.grade_dist || factorStats.tier_dist) && (() => {
                    const gd = factorStats.grade_dist || {};
                    return (
                      <div className="flex gap-1.5 flex-wrap items-center">
                        <span className="text-[10px] text-zinc-600 mr-0.5">评级:</span>
                        {['A','B','C','D','E'].map(g => {
                          const cnt = gd[g] || 0;
                          if (!cnt) return null;
                          return (
                            <button key={g} onClick={()=>setFactorFilter('grade_'+g)}
                              className={`text-[11px] px-2 py-0.5 rounded-lg border font-bold transition hover:opacity-80 ${FACTOR_GRADE[g].cls}`}>
                              {g} {cnt}
                            </button>
                          );
                        })}
                        <button onClick={()=>setFactorFilter('grade_ABC')}
                          className="text-[11px] px-2 py-0.5 rounded-lg border bg-surface-3 text-zinc-400 border-border hover:border-border-light transition ml-1">
                          A+B+C 合格线
                        </button>
                      </div>
                    );
                  })()}
                  {/* 统计指标行 */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      {label:'活跃因子',value:factorStats.active_count,color:'text-emerald-400'},
                      {label:'最佳 Sharpe',value:(factorStats.best_sharpe||0).toFixed(2),color:'text-brand-400'},
                      {label:'最佳 IR',value:(factorStats.best_ir||0).toFixed(2),color:'text-amber-400'},
                      {label:'⚡ 向量化',value:factorStats.complexity_dist?.vectorized||0,color:'text-cyan-400'},
                      {label:'🐌 嵌套循环',value:factorStats.complexity_dist?.nested||0,color:'text-red-400'},
                      {label:'可融合',value:(factorStats.complexity_dist?.vectorized||0)+(factorStats.complexity_dist?.apply||0),color:factorStats.ready_to_combine?'text-emerald-400':'text-zinc-500'},
                    ].map((m,i)=>(
                      <div key={i} className="bg-surface-3/50 rounded-lg px-3 py-2 border border-border/30">
                        <div className="text-[10px] text-zinc-500">{m.label}</div>
                        <div className={`text-sm font-semibold ${m.color}`}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Theme distribution tags */}
              {factorStats?.theme_distribution && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.entries(factorStats.theme_distribution).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([t,c])=>(
                    <button key={t} onClick={()=>{setFactorSearch(t);setFactorFilter('all');}} className={`text-[10px] px-2 py-0.5 rounded-lg border border-border/30 transition hover:border-border-light ${themeBg(t)} ${themeColor(t)}`}>
                      {themeLabel(t)} <span className="text-zinc-600 ml-0.5">{c}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Search + Filter + Sort toolbar */}
              <div className="flex flex-wrap gap-2 mb-3">
                <input type="text" value={factorSearch} onChange={e=>setFactorSearch(e.target.value)} placeholder="搜索因子（主题/ID/代码关键词）..."
                  className="flex-1 min-w-[200px] bg-surface-3 rounded-lg px-3 py-1.5 text-[12px] text-zinc-300 border border-border placeholder-zinc-600 focus:border-brand-500/50 focus:outline-none transition" />
                <select value={factorFilter} onChange={e=>setFactorFilter(e.target.value)}
                  className="bg-surface-3 rounded-lg px-3 py-1.5 text-[12px] text-zinc-300 border border-border focus:outline-none">
                  <optgroup label="── ABCDE 评级 ──">
                    <option value="grade_ABC">A+B+C 合格以上 (默认)</option>
                    <option value="grade_A">A 精英 (Sharpe≥1.5)</option>
                    <option value="grade_B">B 优秀 (Sharpe≥1.0)</option>
                    <option value="grade_C">C 合格 (Sharpe≥0.5)</option>
                    <option value="grade_D">D 边缘 (Sharpe≥0.3)</option>
                    <option value="grade_E">E 淘汰 (未激活)</option>
                  </optgroup>
                  <optgroup label="── 状态过滤 ──">
                    <option value="all">全部</option>
                    <option value="active">活跃</option>
                    <option value="yao">🐉 Meme因子</option>
                    <option value="low_pool">低效池 (Sharpe&lt;0.5)</option>
                    <option value="combinable">可融合 (⚡)</option>
                    <option value="vectorized">纯向量化</option>
                    <option value="astock">A股实战</option>
                    <option value="technical">传统技术</option>
                    <option value="retired">已退休</option>
                  </optgroup>
                  <optgroup label="── 按维度 ──">
                    {Object.values(ARCHETYPES_CONFIG).map(a => (
                      <option key={a.id} value={'dim_' + a.id}>{a.icon} {a.name}</option>
                    ))}
                  </optgroup>
                </select>
                <select value={factorSort} onChange={e=>setFactorSort(e.target.value)}
                  className="bg-surface-3 rounded-lg px-3 py-1.5 text-[12px] text-zinc-300 border border-border focus:outline-none"
                  title="排序方式 (默认最新入库优先)">
                  <option value="newest">最新优先 🕐</option>
                  <option value="sharpe">按 Sharpe ↓</option>
                  <option value="daily_return">按日均收益 ↓ 🔥</option>
                  <option value="ir">按 IR ↓</option>
                  <option value="ic">按 IC ↓</option>
                  <option value="trades">按交易量 ↓</option>
                </select>
              </div>
            </Card>

            {/* Factor list table */}
            {(() => {
              const filtered = getFilteredFactors();
              const totalPages = Math.max(1, Math.ceil(filtered.length / FACTOR_PAGE_SIZE));
              const currentPage = Math.min(factorPage, totalPages - 1);
              const pageStart = currentPage * FACTOR_PAGE_SIZE;
              const paged = filtered.slice(pageStart, pageStart + FACTOR_PAGE_SIZE);
              return filtered.length > 0 ? (
              <Card>
                <div className="flex items-center gap-3 mb-2 text-[11px] flex-wrap">
                  <span className="text-zinc-500">
                    显示 {pageStart+1}-{pageStart+paged.length} / {filtered.length} (共 {factorList.length} 个因子)
                  </span>
                  {factorFilter === 'grade_ABC' && (() => {
                    const de = factorList.filter(f=>{ const g=getFactorGrade(f); return g==='D'||g==='E'; }).length;
                    return de > 0 ? <button onClick={()=>setFactorFilter('grade_D')} className="text-zinc-600 hover:text-zinc-400 transition underline">另有 {de} 个 D/E 级因子已隐藏</button> : null;
                  })()}
                  {(factorFilter==='grade_D'||factorFilter==='grade_E'||factorFilter==='low_pool') && (
                    <button onClick={()=>setFactorFilter('grade_ABC')} className="text-brand-400 hover:text-brand-300 transition">← 返回合格池 (A+B+C)</button>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <button disabled={purging} onClick={()=>purgeFactors(true)}
                      className="px-2 py-1 rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 transition text-[10px] font-medium disabled:opacity-50">
                      {purging ? '检查中...' : '预览清理低质因子'}
                    </button>
                    {purgePreview && !purgePreview.dry_run === false && (
                      <button disabled={purging} onClick={()=>{ if(confirm(`确认清理 ${purgePreview.to_retire} 个低质因子？`)) purgeFactors(false); }}
                        className="px-2 py-1 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 transition text-[10px] font-medium disabled:opacity-50">
                        执行清理 ({purgePreview.to_retire} 个)
                      </button>
                    )}
                  </div>
                </div>
                {purgePreview && purgePreview.dry_run && (
                  <div className="mb-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-amber-400 font-medium">预览: {purgePreview.to_retire} / {purgePreview.total_active} 个因子不达标</span>
                      <div className="flex gap-2">
                        <button disabled={purging} onClick={()=>{ if(confirm(`确认清理 ${purgePreview.to_retire} 个低质因子？`)) purgeFactors(false); }}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-medium hover:bg-rose-500 transition disabled:opacity-50">
                          确认清理
                        </button>
                        <button onClick={()=>setPurgePreview(null)} className="text-[10px] text-zinc-500 hover:text-zinc-400">取消</button>
                      </div>
                    </div>
                    <div className="max-h-[150px] overflow-y-auto text-[10px] space-y-0.5">
                      {(purgePreview.preview||[]).map((p,i) => (
                        <div key={i} className="flex gap-2 text-zinc-400">
                          <span className="font-mono text-zinc-500 w-16 shrink-0">{(p.id||'').slice(-6)}</span>
                          <span className="text-zinc-300 truncate max-w-[200px]">{p.theme}</span>
                          <span className="ml-auto text-rose-400/80 shrink-0">{p.reasons.join(' / ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-0 text-[12px]">
                    <thead>
                      <tr className="text-zinc-500 border-b border-border/30">
                        <th className="py-2 px-1 w-6"><input type="checkbox" checked={selectedForCombine.length>0 && selectedForCombine.length===filtered.filter(f=>f.status==='active').length} onChange={e=>{ if(e.target.checked) setSelectedForCombine(filtered.filter(f=>f.status==='active').map(f=>f.id)); else setSelectedForCombine([]); }} className="accent-brand-500" /></th>
                        <th className="text-center py-2 px-1 font-medium w-6" title="ABCDE综合评级">级</th>
                        <th className="text-left py-2 px-2 font-medium">主题</th>
                        <th className="text-center py-2 px-1 font-medium w-8" title="计算复杂度">⚡</th>
                        <th className="text-right py-2 px-2 font-medium">Sharpe</th>
                        <th className="text-right py-2 px-2 font-medium">IR</th>
                        <th className="text-right py-2 px-2 font-medium">IC</th>
                        <th className="text-right py-2 px-2 font-medium">Win%</th>
                        <th className="text-right py-2 px-2 font-medium">Trades</th>
                        <th className="text-right py-2 px-2 font-medium" title="持仓日均收益%">日均收益</th>
                        <th className="text-right py-2 px-2 font-medium" title="平均持仓天数">持仓天</th>
                        <th className="text-center py-2 px-2 font-medium">状态</th>
                        <th className="text-center py-2 px-2 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((f,i) => (
                        <tr key={f.id||i} className={`border-b border-border/10 hover:bg-surface-3/30 cursor-pointer transition ${selectedFactor?.id===f.id?'bg-brand-600/5':''}${selectedForCombine.includes(f.id)?' bg-amber-600/5':''}${f.status!=='active'?' opacity-40':''}`}
                            onClick={()=>{setSelectedFactor(selectedFactor?.id===f.id?null:f);setFactorDetailTab('metrics');}}>
                          <td className="py-2 px-1" onClick={e=>e.stopPropagation()}>
                            {f.status==='active' && <input type="checkbox" checked={selectedForCombine.includes(f.id)} onChange={()=>toggleCombineSelect(f.id)} className="accent-amber-500" />}
                          </td>
                          <td className="py-2 px-1 text-center" title={FACTOR_GRADE[getFactorGrade(f)]?.desc}>
                            <span className={`text-[10px] w-5 h-5 inline-flex items-center justify-center rounded border font-bold ${FACTOR_GRADE[getFactorGrade(f)]?.cls}`}>
                              {getFactorGrade(f)}
                            </span>
                          </td>
                          <td className="py-2 px-2 max-w-[220px]">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${themeBg(f.theme)} ${themeColor(f.theme)} mr-1`}>{themeLabel(f.theme)}</span>
                            <span className="text-zinc-400 text-[11px] truncate">{f.sub_theme && f.sub_theme !== f.theme ? f.sub_theme.replace(/^[^:]+:\s*/, '') : ''}</span>
                            <span className="text-[9px] text-zinc-700 ml-1 font-mono">{(f.id||'').slice(-6)}</span>
                          </td>
                          <td className="py-2 px-1 text-center" title={f.complexity==='vectorized'?'向量化（快速）':f.complexity==='apply'?'含 apply（较慢）':'嵌套循环（慢，不可融合）'}>
                            <span className="text-[11px]">{f.complexity==='vectorized'?'⚡':f.complexity==='apply'?'⚠️':'🐌'}</span>
                          </td>
                          <td className={`py-2 px-2 text-right font-mono ${f.sharpe>=1?'text-emerald-400':f.sharpe>=0.5?'text-brand-400':'text-zinc-500'}`}
                              title={f.realistic_evaluated_at ? `realistic=${(f.sharpe||0).toFixed(2)} · legacy=${(f.legacy_sharpe||0).toFixed(2)} · Δ=${(f.realistic_delta_sharpe||0).toFixed(2)}` : 'legacy (未跑 realistic 回测)'}>
                            {(f.sharpe||0).toFixed(2)}
                            {f.realistic_evaluated_at ? <span className="ml-1 text-[8px] text-emerald-500/70">✓</span> : <span className="ml-1 text-[8px] text-amber-500/40">~</span>}
                          </td>
                          <td className={`py-2 px-2 text-right font-mono ${Math.abs(f.ir)>=1?'text-emerald-400':'text-zinc-400'}`}>{(f.ir||0).toFixed(2)}</td>
                          <td className="py-2 px-2 text-right font-mono text-zinc-400">{(f.ic_mean||0).toFixed(4)}</td>
                          <td className="py-2 px-2 text-right font-mono text-zinc-400">{((f.win_rate||0)*100).toFixed(1)}%</td>
                          <td className="py-2 px-2 text-right font-mono text-zinc-400">{f.trades||0}</td>
                          <td className={`py-2 px-2 text-right font-mono ${(f.daily_return_pct||0)>=7?'text-rose-400 font-bold':(f.daily_return_pct||0)>=4?'text-amber-400':'text-zinc-600'}`}>
                            {(f.daily_return_pct||0)>0 ? `${(f.daily_return_pct).toFixed(1)}%` : '—'}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-zinc-500">
                            {(f.avg_hold_days||0)>0 ? (f.avg_hold_days).toFixed(1) : '—'}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${f.status==='active'?'bg-emerald-600/20 text-emerald-400':f.status==='decayed'?'bg-amber-600/20 text-amber-400':'bg-zinc-600/20 text-zinc-500'}`}>{f.status}</span>
                          </td>
                          <td className="py-2 px-2 text-center" onClick={e=>e.stopPropagation()}>
                            <div className="flex items-center gap-1 justify-center">
                              {f.status==='active' && (<>
                                <button onClick={()=>factorToStrategy(f.id)} disabled={toStrategyLoading} title="转入策略库深入研发" className="text-[10px] text-brand-400/70 hover:text-brand-300 transition disabled:opacity-50">{toStrategyLoading ? '⏳' : '📈'}</button>
                                <button onClick={()=>retireFactor(f.id)} title="退休因子" className="text-[10px] text-red-500/50 hover:text-red-400 transition">🗑️</button>
                              </>)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-[11px]">
                    <button disabled={currentPage <= 0}
                      onClick={()=>setFactorPage(Math.max(0, currentPage - 1))}
                      className="btn px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 text-zinc-400 border border-border disabled:opacity-30">← 上一页</button>
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      {Array.from({length: Math.min(totalPages, 10)}, (_, i) => {
                        const p = totalPages <= 10
                          ? i
                          : Math.max(0, Math.min(currentPage - 4, totalPages - 10)) + i;
                        return (
                          <button key={p} onClick={()=>setFactorPage(p)}
                            className={`w-7 h-7 rounded border transition ${p === currentPage
                              ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                              : 'bg-surface-2 text-zinc-500 border-border hover:text-zinc-300'}`}>
                            {p + 1}
                          </button>
                        );
                      })}
                      <span className="ml-2 text-zinc-600">共 {totalPages} 页</span>
                    </div>
                    <button disabled={currentPage >= totalPages - 1}
                      onClick={()=>setFactorPage(Math.min(totalPages - 1, currentPage + 1))}
                      className="btn px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 text-zinc-400 border border-border disabled:opacity-30">下一页 →</button>
                  </div>
                )}
              </Card>
            ) : !factorListLoading ? (
              <Card><div className="text-center py-8 text-zinc-600 text-sm">{factorList.length > 0 ? '没有匹配的因子，试试调整搜索条件' : '暂无因子数据，点击上方「刷新」加载'}</div></Card>
            ) : null; })()}

            {/* Factor detail panel */}
            {selectedFactor && (
              <Card className="glow-brand border-brand-500/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-300">{selectedFactor.sub_theme || selectedFactor.theme}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-zinc-500 font-mono">{selectedFactor.id}</span>
                    {(() => { const t = FACTOR_TIER[getFactorTier(selectedFactor)]; return t ? <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${t.cls}`}>{t.icon} {t.label}</span> : null; })()}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedFactor.complexity==='vectorized'?'bg-cyan-600/20 text-cyan-400':selectedFactor.complexity==='apply'?'bg-amber-600/20 text-amber-400':'bg-red-600/20 text-red-400'}`}>
                      {selectedFactor.complexity==='vectorized'?'⚡ 向量化':selectedFactor.complexity==='apply'?'⚠️ apply':'🐌 嵌套循环'}
                    </span>
                    {selectedFactor.code_lines && <span className="text-[10px] text-zinc-600">{selectedFactor.code_lines} 行</span>}
                  </div>
                  <button onClick={()=>setSelectedFactor(null)} className="text-zinc-500 hover:text-zinc-300 text-lg transition">✕</button>
                </div>
                <div className="text-[10px] text-zinc-600 mb-3">
                  创建: {selectedFactor.created_at?new Date(selectedFactor.created_at*1000).toLocaleString():'N/A'}
                  {selectedFactor.theme && selectedFactor.theme !== selectedFactor.sub_theme && <span className="ml-2">分类: {selectedFactor.theme}</span>}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 bg-surface-2 rounded-lg p-1 overflow-x-auto">
                  {[
                    {id:'metrics',label:'📊 指标'},
                    {id:'code',label:'💻 代码'},
                    {id:'usage',label:'📖 使用方法'},
                    {id:'narrative',label:'💡 叙述'},   // F4
                    {id:'neighbors',label:'🔗 邻近因子'}, // F4
                  ].map(t=>(
                    <button key={t.id} onClick={()=>setFactorDetailTab(t.id)}
                      className={`flex-1 px-3 py-1.5 rounded-md text-[12px] font-medium transition whitespace-nowrap ${factorDetailTab===t.id?'bg-surface-4 text-zinc-200 shadow':'text-zinc-500 hover:text-zinc-400'}`}>{t.label}</button>
                  ))}
                </div>

                {/* Metrics tab */}
                {factorDetailTab === 'metrics' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {label:'Sharpe Ratio',value:(selectedFactor.sharpe||0).toFixed(3),desc:'风险调整收益，>1 优秀',good:selectedFactor.sharpe>=1},
                      {label:'IR (Sortino)',value:(selectedFactor.ir||0).toFixed(3),desc:'下行风险调整收益，>1 优秀',good:Math.abs(selectedFactor.ir)>=1},
                      {label:'Mean IC',value:(selectedFactor.ic_mean||0).toFixed(4),desc:'因子预测能力，|IC|>0.03 有效',good:Math.abs(selectedFactor.ic_mean)>=0.03},
                      {label:'Win Rate',value:((selectedFactor.win_rate||0)*100).toFixed(1)+'%',desc:'盈利交易占比，>50% 为佳',good:selectedFactor.win_rate>=0.5},
                      {label:'交易次数',value:selectedFactor.trades||0,desc:'回测期总交易数，>100 样本充足',good:selectedFactor.trades>=100},
                      {label:'最大回撤',value:((selectedFactor.max_drawdown||0)*100).toFixed(2)+'%',desc:'最大权益回撤，<20% 为佳',good:selectedFactor.max_drawdown<0.2},
                      {label:'换手率',value:(selectedFactor.turnover||0).toFixed(4),desc:'日均换手率',good:true},
                      {label:'单调性',value:(selectedFactor.monotonicity||0).toFixed(4),desc:'分组收益单调性，越接近1越好',good:selectedFactor.monotonicity>=0.5},
                    ].map((m,i)=>(
                      <div key={i} className="bg-surface-3/50 rounded-lg px-3 py-2.5 border border-border/30">
                        <div className="text-[10px] text-zinc-500 mb-0.5">{m.label}</div>
                        <div className={`text-[14px] font-mono font-semibold ${m.good?'text-emerald-400':'text-zinc-300'}`}>{m.value}</div>
                        <div className="text-[9px] text-zinc-600 mt-0.5">{m.desc}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Code tab */}
                {factorDetailTab === 'code' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] text-zinc-500">generate_factor 源码 ({selectedFactor.code_lines||'?'} 行)</div>
                      <div className="flex gap-2">
                        <button onClick={()=>{navigator.clipboard.writeText(selectedFactor.code||'');toast('代码已复制到剪贴板','success');}}
                          className="btn px-3 py-1 bg-surface-3 hover:bg-surface-4 text-zinc-300 text-[11px] rounded-lg border border-border transition">📋 复制</button>
                        <button onClick={()=>{
                          const usage = `# 因子: ${selectedFactor.sub_theme || selectedFactor.theme}\n# ID: ${selectedFactor.id}\n# Sharpe: ${(selectedFactor.sharpe||0).toFixed(3)} | IR: ${(selectedFactor.ir||0).toFixed(3)} | IC: ${(selectedFactor.ic_mean||0).toFixed(4)}\n#\n# 用法: factor = generate_factor(matrices)\n#   matrices = {'open': df, 'high': df, 'low': df, 'close': df, 'volume': df}\n#   返回: DataFrame (index=trade_date, columns=ts_code), 值越高越看多\n\n${selectedFactor.code||''}`;
                          navigator.clipboard.writeText(usage);toast('代码+使用说明已复制','success');
                        }}
                          className="btn px-3 py-1 bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 text-[11px] rounded-lg border border-brand-500/20 transition">📋 复制含说明</button>
                      </div>
                    </div>
                    <div className="bg-[#0d1117] rounded-xl border border-border/30 overflow-hidden">
                      <div className="overflow-x-auto max-h-[500px] overflow-y-auto overflow-x-hidden p-4">
                        <pre className="text-[12px] leading-relaxed font-mono whitespace-pre">{(selectedFactor.code||'(代码不可用)').split('\n').map((line,i)=>(
                          <div key={i} className="flex"><span className="select-none text-zinc-700 w-8 text-right mr-3 flex-shrink-0">{i+1}</span><span className={line.trim().startsWith('#')?'text-zinc-600':line.trim().startsWith('def ')?'text-amber-400':line.trim().startsWith('import ')?'text-cyan-400/70':line.trim().startsWith('return ')?'text-rose-400':'text-emerald-300/90'}>{line}</span></div>
                        ))}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Usage tab */}
                {factorDetailTab === 'usage' && (
                  <div className="space-y-4">
                    <div className="bg-surface-3/30 rounded-xl p-4 border border-border/20">
                      <h4 className="text-[13px] font-semibold text-zinc-200 mb-3">如何使用此因子</h4>
                      <div className="space-y-3 text-[12px] text-zinc-400 leading-relaxed">
                        <div className="flex gap-3">
                          <span className="text-brand-400 font-bold text-lg leading-none mt-0.5">1</span>
                          <div>
                            <div className="text-zinc-200 font-medium mb-1">直接回测</div>
                            <p>将 <code className="bg-surface-3 px-1.5 py-0.5 rounded text-emerald-400 text-[11px]">generate_factor(matrices)</code> 代码复制到回测系统。函数接收 OHLCV 矩阵字典，返回同 shape 的 DataFrame —— 值越高表示越看好该股票（做多信号越强）。</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-brand-400 font-bold text-lg leading-none mt-0.5">2</span>
                          <div>
                            <div className="text-zinc-200 font-medium mb-1">策略化研发</div>
                            <p>点击「转入策略研发」，系统会基于此因子自动生成完整交易策略（含入场/出场/仓位管理），并在量化研发模块中迭代优化。因子 → 策略的转化由 LLM 自动完成。</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-brand-400 font-bold text-lg leading-none mt-0.5">3</span>
                          <div>
                            <div className="text-zinc-200 font-medium mb-1">因子融合</div>
                            <p>勾选多个因子后点击「融合」，系统将多因子等权平均组合成复合因子，在 后端沙箱重新回测。融合通常能提升 Sharpe 和稳定性。<strong className="text-amber-400">注意：仅 ⚡ 向量化因子可参与融合</strong>（🐌 嵌套循环因子会导致沙箱超时）。</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface-3/30 rounded-xl p-4 border border-border/20">
                      <h4 className="text-[13px] font-semibold text-zinc-200 mb-3">指标速查</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {[
                          {metric:'Sharpe > 1',meaning:'优秀因子，风险调整后收益显著'},
                          {metric:'|IC| > 0.03',meaning:'因子对未来收益有预测能力'},
                          {metric:'IR > 1',meaning:'信息比率高，因子收益稳定'},
                          {metric:'Win Rate > 50%',meaning:'多数交易盈利'},
                          {metric:'Trades > 100',meaning:'回测样本充足，统计可靠'},
                          {metric:'Max DD < 20%',meaning:'风险可控，回撤较小'},
                        ].map((r,i)=>(
                          <div key={i} className="flex gap-2 items-start bg-surface-3/50 rounded-lg px-3 py-2 border border-border/20">
                            <code className="text-emerald-400 font-mono whitespace-nowrap">{r.metric}</code>
                            <span className="text-zinc-400">{r.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#0d1117] rounded-xl p-4 border border-border/30">
                      <div className="text-[11px] text-zinc-500 mb-2">调用示例 (Python)</div>
                      <pre className="text-[12px] leading-relaxed font-mono text-emerald-300/90 whitespace-pre">{`# 因子 ID: ${selectedFactor.id}
# ${selectedFactor.sub_theme || selectedFactor.theme}

import pandas as pd

# 准备数据：每个 key 是一个 DataFrame (index=日期, columns=股票代码)
matrices = {
    'open':   open_df,    # shape: (120天, 6300只)
    'high':   high_df,
    'low':    low_df,
    'close':  close_df,
    'volume': volume_df,
}

# 调用因子
factor = generate_factor(matrices)

# factor 是 DataFrame, 同 shape
# 每日每股一个因子值，值越高 = 越看好
top_stocks = factor.iloc[-1].nlargest(20)  # 今日 Top 20`}</pre>
                    </div>
                  </div>
                )}

                {/* F4 — narrative tab */}
                {factorDetailTab === 'narrative' && (
                  <FactorNarrativePanel factor={selectedFactor} />
                )}

                {/* F4 — neighbors tab */}
                {factorDetailTab === 'neighbors' && (
                  <FactorNeighborsPanel factor={selectedFactor}
                    onPickNeighbor={(fid) => {
                      const next = factorList.find(f => f.id === fid);
                      if (next) setSelectedFactor(next);
                    }} />
                )}

                {/* Action buttons */}
                <div className="mt-4 pt-3 border-t border-border/20 flex flex-wrap gap-2">
                  <button onClick={()=>{navigator.clipboard.writeText(selectedFactor.code||'');toast('已复制','success');}}
                    className="btn px-4 py-2 bg-surface-3 hover:bg-surface-4 text-zinc-300 text-[12px] rounded-lg border border-border transition">📋 复制代码</button>
                  <button onClick={()=>{navigator.clipboard.writeText(selectedFactor.id||'');toast('ID 已复制','success');}}
                    className="btn px-3 py-2 bg-surface-3 hover:bg-surface-4 text-zinc-400 text-[11px] rounded-lg border border-border transition font-mono">#ID</button>
                  {selectedFactor.status==='active' && (<>
                    <button onClick={()=>factorToStrategy(selectedFactor.id)} disabled={toStrategyLoading}
                      className="btn px-4 py-2 bg-gradient-to-r from-violet-600 to-brand-600 hover:from-violet-500 hover:to-brand-500 text-white text-[12px] font-medium rounded-lg transition shadow-lg shadow-brand-600/20 disabled:opacity-50">
                      {toStrategyLoading ? <span className="flex items-center gap-1"><Spinner size={3}/>回测中...</span> : '🚀 生成策略 → 策略库'}
                    </button>
                    <button onClick={()=>{toggleCombineSelect(selectedFactor.id);toast(selectedForCombine.includes(selectedFactor.id)?'已取消选择':'已加入融合列表','success');}}
                      className={`btn px-4 py-2 text-[12px] rounded-lg border transition ${selectedForCombine.includes(selectedFactor.id)?'bg-amber-600/20 text-amber-400 border-amber-500/30':'bg-surface-3 hover:bg-surface-4 text-zinc-400 border-border'}`}>
                      {selectedForCombine.includes(selectedFactor.id)?'✅ 已选中融合':'🔮 加入融合'}
                    </button>
                    <button onClick={()=>retireFactor(selectedFactor.id)}
                      className="btn px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-[12px] rounded-lg border border-red-600/20 transition">🗑️ 退休</button>
                  </>)}
                </div>
              </Card>
            )}
          </>)}

          {/* === 健康分析 Sub-tab === */}
          {diggerSubTab === 'screener' && (
            <Card>
              <h3 className="text-[13px] font-semibold text-zinc-200 mb-3">DSL 因子选股</h3>
              <p className="text-[10px] text-zinc-500 mb-3">输入 generate_factor 代码，直接调用后端 screener 运行选股。</p>
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-zinc-400">因子代码</span>
                  <span className="text-[10px] text-zinc-600">（或从因子库选择）</span>
                  {selectedFactor && (
                    <button onClick={()=>setDslScreenCode(selectedFactor.code||'')} className="text-[10px] text-brand-400 hover:text-brand-300 ml-auto">
                      填入当前因子: {(selectedFactor.sub_theme||selectedFactor.theme||'').slice(0,20)}
                    </button>
                  )}
                </div>
                <textarea value={dslScreenCode} onChange={e=>setDslScreenCode(e.target.value)}
                  rows={8} placeholder="import pandas as pd&#10;def generate_factor(matrices):&#10;    close = matrices['close']&#10;    ..."
                  className="w-full bg-surface-3 rounded-lg px-3 py-2 text-[11px] text-zinc-300 font-mono border border-border focus:border-brand-500/50 focus:outline-none transition resize-y" />
              </div>
              <div className="flex items-center gap-3">
                <button disabled={dslScreenLoading || !dslScreenCode.trim()} onClick={runDslScreen}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-[12px] font-medium hover:bg-amber-500 transition disabled:opacity-50">
                  {dslScreenLoading ? <span className="flex items-center gap-1"><Spinner size={3}/>运行中...</span> : '运行选股'}
                </button>
                {factorList.length > 0 && (
                  <select onChange={e=>{
                    const f = factorList.find(x=>x.id===e.target.value);
                    if(f && f.code) { setDslScreenCode(f.code); setSelectedFactor(f); }
                  }} value="" className="bg-surface-3 rounded-lg px-3 py-1.5 text-[11px] text-zinc-400 border border-border focus:outline-none max-w-[300px]">
                    <option value="">从因子库选择...</option>
                    {factorList.filter(f=>f.status==='active').sort((a,b)=>(b.sharpe||0)-(a.sharpe||0)).slice(0,30).map(f => (
                      <option key={f.id} value={f.id}>[{(f.sharpe||0).toFixed(1)}] {f.sub_theme || f.theme || f.id}</option>
                    ))}
                  </select>
                )}
              </div>
              {dslScreenResult && dslScreenResult.status === 'success' && (dslScreenResult.count||0) > 0 && (
                <div className="mt-4 bg-surface-3/50 rounded-xl border border-amber-500/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[12px] font-semibold text-amber-400">
                      选股结果 — {dslScreenResult.trade_date || dslScreenResult.signal_date || ''} | {dslScreenResult.count} 只
                    </h4>
                    <div className="flex gap-2">
                      <button onClick={()=>{
                        const stocks = dslScreenResult.stocks || dslScreenResult.results || [];
                        const text = stocks.map(s=>`${s.ts_code}\t${s.name||''}\t${s.close||''}\t${s.pct_chg>0?'+':''}${Number(s.pct_chg||0).toFixed(2)}%\t${s.industry||''}`).join('\n');
                        navigator.clipboard.writeText(text); toast('已复制','success');
                      }} className="text-[10px] text-zinc-400 hover:text-zinc-300">复制</button>
                      <button onClick={()=>setDslScreenResult(null)} className="text-[10px] text-zinc-500 hover:text-zinc-400">关闭</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-border max-h-[400px] overflow-y-auto">
                    <table className="w-full text-[11px]">
                      <thead className="sticky top-0"><tr className="bg-surface-3 text-zinc-500">
                        <th className="px-2 py-1.5 text-left font-medium">代码</th>
                        <th className="px-2 py-1.5 text-left font-medium">名称</th>
                        <th className="px-2 py-1.5 text-left font-medium">行业</th>
                        <th className="px-2 py-1.5 text-right font-medium">收盘</th>
                        <th className="px-2 py-1.5 text-right font-medium">涨跌%</th>
                        <th className="px-2 py-1.5 text-right font-medium">成交额</th>
                        <th className="px-2 py-1.5 text-right font-medium">因子分</th>
                      </tr></thead>
                      <tbody>{(dslScreenResult.stocks || dslScreenResult.results || []).map((s,i) => (
                        <tr key={i} className="border-t border-border/30 hover:bg-surface-3/50">
                          <td className="px-2 py-1.5 font-mono text-zinc-300">{s.ts_code}</td>
                          <td className="px-2 py-1.5 text-zinc-200 font-medium">{s.name || ''}</td>
                          <td className="px-2 py-1.5 text-zinc-500">{s.industry || ''}</td>
                          <td className="px-2 py-1.5 text-right text-zinc-300">{Number(s.close||0).toFixed(2)}</td>
                          <td className={`px-2 py-1.5 text-right font-mono ${Number(s.pct_chg||0)>0?'text-red-400':Number(s.pct_chg||0)<0?'text-emerald-400':'text-zinc-500'}`}>{Number(s.pct_chg||0)>0?'+':''}{Number(s.pct_chg||0).toFixed(2)}%</td>
                          <td className="px-2 py-1.5 text-right text-zinc-500">{s.amount ? (Number(s.amount)/10000).toFixed(0) + '万' : ''}</td>
                          <td className="px-2 py-1.5 text-right font-mono text-brand-400">{s.factor_score != null ? Number(s.factor_score).toFixed(4) : ''}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}
              {dslScreenResult && dslScreenResult.status !== 'success' && (
                <div className="mt-3 text-[11px] text-rose-400 bg-rose-500/10 rounded-lg px-3 py-2 border border-rose-500/20">
                  {dslScreenResult.error || '选股失败'}
                </div>
              )}
            </Card>
          )}

          {diggerSubTab === 'analysis' && (<>
              <Card className="glow-brand border-brand-500/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-300">🔬 因子库健康分析</h3>
                  <button onClick={runAnalysis} disabled={analysisLoading}
                    className="btn px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-semibold rounded-lg transition disabled:opacity-50">
                    {analysisLoading ? <span className="flex items-center gap-1"><Spinner size={3}/>分析中...</span> : '运行分析'}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 mb-3">检测过拟合因子、指标聚类降维、主题多样性分析。基于 Sharpe/WR/DD/Trades 综合判断。</p>

                {analysisData && (<>
                  {/* Tier summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {Object.entries(analysisData.tiers).map(([k,v])=>(
                      <div key={k} className="bg-surface-3/50 rounded-lg px-3 py-2.5 border border-border/30">
                        <div className="text-[10px] text-zinc-500">{tierNames[k]}</div>
                        <div className={`text-lg font-bold ${tierColors[k]}`}>{v.count}</div>
                        <div className="text-[9px] text-zinc-600">{v.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* Theme distribution */}
                  <div className="mb-4">
                    <h4 className="text-[12px] font-semibold text-zinc-300 mb-2">主题分布 (正常因子)</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(analysisData.theme_distribution).map(([t,c])=>(
                        <span key={t} className="bg-surface-3 rounded-lg px-2.5 py-1 text-[11px] text-zinc-400 border border-border/30">
                          {t} <span className="text-brand-400 font-medium">{c}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cluster representatives */}
                  <div className="mb-4">
                    <h4 className="text-[12px] font-semibold text-zinc-300 mb-2">
                      降维聚类 — {analysisData.clusters.combinable_factors} 可融合因子 → {analysisData.clusters.total} 独立聚类
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-0 text-[10px] md:text-[11px]">
                        <thead><tr className="text-zinc-500 border-b border-border/30">
                          <th className="py-1.5 px-2 text-left">#</th>
                          <th className="py-1.5 px-2 text-left">代表因子</th>
                          <th className="py-1.5 px-2 text-right">Sharpe</th>
                          <th className="py-1.5 px-2 text-right">IR</th>
                          <th className="py-1.5 px-2 text-right">IC</th>
                          <th className="py-1.5 px-2 text-center">聚类大小</th>
                          <th className="py-1.5 px-2 text-center">操作</th>
                        </tr></thead>
                        <tbody>
                          {analysisData.clusters.top_clusters.map((cl,i) => {const r=cl.representative; return (
                            <tr key={r.id} className="border-b border-border/10 hover:bg-surface-3/30 transition">
                              <td className="py-1.5 px-2 text-zinc-600">{i+1}</td>
                              <td className="py-1.5 px-2 text-zinc-300 max-w-[180px] truncate">
                                <span className={`mr-1 text-[10px] ${r.complexity==='vectorized'?'text-cyan-400':'text-amber-400'}`}>{r.complexity==='vectorized'?'⚡':'⚠️'}</span>
                                {r.sub_theme||r.theme} <span className="text-zinc-600 text-[10px] font-mono ml-1">{r.id.slice(-6)}</span>
                              </td>
                              <td className={`py-1.5 px-2 text-right font-mono ${r.sharpe>=1?'text-emerald-400':'text-zinc-400'}`}>{r.sharpe.toFixed(2)}</td>
                              <td className="py-1.5 px-2 text-right font-mono text-zinc-400">{r.ir.toFixed(2)}</td>
                              <td className="py-1.5 px-2 text-right font-mono text-zinc-400">{r.ic_mean.toFixed(4)}</td>
                              <td className="py-1.5 px-2 text-center"><span className="bg-surface-3 px-2 py-0.5 rounded text-[10px] text-zinc-400">{cl.size}</span></td>
                              <td className="py-1.5 px-2 text-center">
                                <button onClick={()=>strategize(r.id)} disabled={stratLoading}
                                  className="text-[10px] text-brand-400 hover:text-brand-300 transition disabled:opacity-50">
                                  {stratLoading ? '...' : '📈 策略化'}
                                </button>
                              </td>
                            </tr>
                          );})}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Strategy result */}
                  {stratResult && (
                    <div className={`rounded-xl p-4 border ${stratResult.ok?'bg-emerald-600/5 border-emerald-500/20':'bg-red-600/5 border-red-500/20'}`}>
                      <h4 className="text-[12px] font-semibold text-zinc-300 mb-2">
                        {stratResult.ok ? '✅ 策略化结果' : '❌ 策略化失败'} — {stratResult.factor_theme}
                      </h4>
                      {stratResult.ok && stratResult.strategy_metrics && (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                          {[
                            {l:'Sharpe',v:stratResult.strategy_metrics.sharpe_ratio},
                            {l:'年化收益',v:stratResult.strategy_metrics.annualized_return_pct,u:'%'},
                            {l:'最大回撤',v:stratResult.strategy_metrics.max_drawdown_pct,u:'%'},
                            {l:'胜率',v:stratResult.strategy_metrics.win_rate_pct,u:'%'},
                            {l:'交易数',v:stratResult.strategy_metrics.total_trades},
                            {l:'Calmar',v:stratResult.strategy_metrics.calmar_ratio},
                          ].filter(x=>x.v!=null).map((x,i)=>(
                            <div key={i} className="bg-surface-3/50 rounded-lg px-2 py-1.5 text-center border border-border/20">
                              <div className="text-[9px] text-zinc-500">{x.l}</div>
                              <div className="text-[12px] font-mono text-zinc-200">{typeof x.v==='number'?x.v.toFixed(2):x.v}{x.u||''}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {stratResult.ok && (
                        <div className="flex gap-2 flex-wrap">
                          {stratResult.strategy_id && (
                            <button onClick={()=>{setTab('library');loadStrategies();}} className="btn px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[11px] rounded-lg transition">📚 查看策略库</button>
                          )}
                          {stratResult.strategy_code && (
                            <button onClick={()=>{navigator.clipboard.writeText(stratResult.strategy_code);toast('策略代码已复制','success');}}
                              className="btn px-3 py-1.5 bg-surface-3 hover:bg-surface-4 text-zinc-300 text-[11px] rounded-lg border border-border transition">📋 复制代码</button>
                          )}
                        </div>
                      )}
                      {stratResult.error && <p className="text-[11px] text-red-400">{stratResult.error}</p>}
                    </div>
                  )}
                </>)}
                {!analysisData && !analysisLoading && <div className="text-center py-8 text-zinc-600 text-sm">点击「运行分析」检查因子库健康状况</div>}
              </Card>
            </>)}

          {/* === 穷举融合 Sub-tab === */}
          {diggerSubTab === 'exhaustive' && (<>
            <Card className="glow-brand border-brand-500/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-300">🧪 穷举因子组合</h3>
                <button onClick={runExhaustiveCombine} disabled={exhaustiveRunning}
                  className="btn px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-semibold rounded-lg transition disabled:opacity-50">
                  {exhaustiveRunning ? <span className="flex items-center gap-1"><Spinner size={3}/>运行中...</span> : '开始穷举'}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mb-3">对所有可融合因子做 C(n, k) 排列组合，逐个送入 后端沙箱回测。已测试过的组合自动跳过。</p>

              <div className="flex gap-3 mb-4">
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">组合大小 (k)</label>
                  <select value={exhaustiveGroupSize} onChange={e=>setExhaustiveGroupSize(Number(e.target.value))} disabled={exhaustiveRunning}
                    className="bg-surface-3 rounded-lg px-3 py-1.5 text-[12px] text-zinc-300 border border-border">
                    <option value={2}>2 因子</option>
                    <option value={3}>3 因子</option>
                    <option value={4}>4 因子</option>
                    <option value={5}>5 因子</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">最大组合数</label>
                  <select value={exhaustiveMaxCombos} onChange={e=>setExhaustiveMaxCombos(Number(e.target.value))} disabled={exhaustiveRunning}
                    className="bg-surface-3 rounded-lg px-3 py-1.5 text-[12px] text-zinc-300 border border-border">
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={500}>500</option>
                  </select>
                </div>
              </div>

              {exhaustiveProgress && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span>进度: {exhaustiveProgress.current || 0} / {exhaustiveProgress.total}</span>
                    <span>{exhaustiveProgress.candidates} 个候选因子</span>
                    {exhaustiveProgress.names && <span className="text-zinc-600 truncate max-w-[200px]">当前: {exhaustiveProgress.names.join(' + ')}</span>}
                  </div>
                  <div className="w-full bg-surface-3 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full transition-all" style={{width: `${((exhaustiveProgress.current||0)/(exhaustiveProgress.total||1))*100}%`}}></div>
                  </div>
                  {exhaustiveProgress.done && (
                    <div className="mt-2 text-[11px] text-emerald-400">
                      完成! 测试 {exhaustiveProgress.current} 组合, {exhaustiveProgress.accepted || 0} 个被采纳
                      {exhaustiveProgress.best && ` | 最佳 Sharpe: ${(exhaustiveProgress.best.metrics?.sharpe||0).toFixed(2)}`}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {exhaustiveResults.length > 0 && (
              <Card>
                <h4 className="text-[12px] font-semibold text-zinc-300 mb-2">组合结果 ({exhaustiveResults.length})</h4>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto overflow-x-hidden">
                  <table className="w-full min-w-0 text-[10px] md:text-[11px]">
                    <thead><tr className="text-zinc-500 border-b border-border/30 sticky top-0 bg-surface-1">
                      <th className="py-1.5 px-2 text-left">#</th>
                      <th className="py-1.5 px-2 text-left">因子组合</th>
                      <th className="py-1.5 px-2 text-right">Sharpe</th>
                      <th className="py-1.5 px-2 text-right">IR</th>
                      <th className="py-1.5 px-2 text-right">IC</th>
                      <th className="py-1.5 px-2 text-right">WR</th>
                      <th className="py-1.5 px-2 text-center">结论</th>
                    </tr></thead>
                    <tbody>
                      {exhaustiveResults.map((r,i) => (
                        <tr key={i} className={`border-b border-border/10 ${r.verdict==='accept'?'bg-emerald-600/5':r.verdict==='reject'?'':'bg-amber-600/5'}`}>
                          <td className="py-1.5 px-2 text-zinc-600">{r.idx}</td>
                          <td className="py-1.5 px-2 text-zinc-300 max-w-[250px] truncate">{r.names.join(' + ')}</td>
                          <td className={`py-1.5 px-2 text-right font-mono ${(r.metrics?.sharpe||0)>=1?'text-emerald-400':'text-zinc-400'}`}>{(r.metrics?.sharpe||0).toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-zinc-400">{(r.metrics?.ir||0).toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-zinc-400">{(r.metrics?.ic_mean||0).toFixed(4)}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-zinc-400">{((r.metrics?.win_rate||0)*100).toFixed(1)}%</td>
                          <td className="py-1.5 px-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${r.verdict==='accept'?'bg-emerald-600/20 text-emerald-400':r.verdict==='reject'?'bg-red-600/20 text-red-400':'bg-amber-600/20 text-amber-400'}`}>
                              {r.verdict==='accept'?'采纳':r.verdict==='reject'?'拒绝':'边缘'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>)}

          {/* === 自动化 管线 Sub-tab === */}
          {diggerSubTab === 'pipeline' && (<>
            <Card className="glow-brand border-brand-500/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-300">🔗 自动化 自动化管线</h3>
                <button onClick={loadPipelineStatus} disabled={pipelineLoading}
                  className="btn px-3 py-1.5 bg-surface-3 hover:bg-surface-4 text-zinc-400 text-[11px] rounded-lg border border-border transition">
                  {pipelineLoading ? <Spinner size={3}/> : '刷新状态'}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mb-4">通过 自动化 workflow 自动化因子管线: 定时挖掘 → 自动融合 → 策略化 → 推送通知。</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-surface-3/50 rounded-xl p-4 border border-border/30">
                  <div className="text-[11px] text-zinc-500 mb-2">⛏️ 触发挖掘</div>
                  <p className="text-[10px] text-zinc-600 mb-3">启动 N 轮因子挖掘 (LLM 生成 → 沙箱评估 → 因子库录入)</p>
                  <div className="flex gap-2">
                    <button onClick={()=>triggerAutoMine(3)} className="btn px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[11px] rounded-lg transition">3 轮</button>
                    <button onClick={()=>triggerAutoMine(5)} className="btn px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[11px] rounded-lg transition">5 轮</button>
                    <button onClick={()=>triggerAutoMine(10)} className="btn px-3 py-1.5 bg-brand-600/70 hover:bg-brand-500 text-white text-[11px] rounded-lg transition">10 轮</button>
                  </div>
                </div>
                <div className="bg-surface-3/50 rounded-xl p-4 border border-border/30">
                  <div className="text-[11px] text-zinc-500 mb-2">🔮 触发穷举融合</div>
                  <p className="text-[10px] text-zinc-600 mb-3">后台运行 2 因子穷举组合 (最多 50 组)</p>
                  <button onClick={triggerAutoCombineAll} className="btn px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[11px] rounded-lg transition">启动融合</button>
                </div>
                <div className="bg-surface-3/50 rounded-xl p-4 border border-border/30">
                  <div className="text-[11px] text-zinc-500 mb-2">📡 自动化 Webhook</div>
                  <p className="text-[10px] text-zinc-600 mb-2">在 自动化 中配置以下端点:</p>
                  <div className="space-y-1 text-[10px] font-mono">
                    <div className="bg-surface-2 rounded px-2 py-1 text-zinc-400">POST /api/auto/trigger/mine</div>
                    <div className="bg-surface-2 rounded px-2 py-1 text-zinc-400">POST /api/auto/trigger/combine-all</div>
                    <div className="bg-surface-2 rounded px-2 py-1 text-zinc-400">GET /api/auto/events</div>
                    <div className="bg-surface-2 rounded px-2 py-1 text-zinc-400">GET /api/auto/pipeline/status</div>
                  </div>
                </div>
              </div>

              {pipelineStatus && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-surface-3/50 rounded-lg px-3 py-2 border border-border/30">
                      <div className="text-[10px] text-zinc-500">活跃因子</div>
                      <div className="text-sm font-semibold text-emerald-400">{pipelineStatus.factor_stats?.active_count || 0}</div>
                    </div>
                    <div className="bg-surface-3/50 rounded-lg px-3 py-2 border border-border/30">
                      <div className="text-[10px] text-zinc-500">最佳 Sharpe</div>
                      <div className="text-sm font-semibold text-brand-400">{(pipelineStatus.factor_stats?.best_sharpe||0).toFixed(2)}</div>
                    </div>
                    <div className="bg-surface-3/50 rounded-lg px-3 py-2 border border-border/30">
                      <div className="text-[10px] text-zinc-500">挖掘状态</div>
                      <div className={`text-sm font-semibold ${pipelineStatus.digger_running?'text-amber-400':'text-zinc-500'}`}>{pipelineStatus.digger_running?'运行中':'空闲'}</div>
                    </div>
                    <div className="bg-surface-3/50 rounded-lg px-3 py-2 border border-border/30">
                      <div className="text-[10px] text-zinc-500">最近事件</div>
                      <div className="text-sm font-semibold text-zinc-400">{pipelineStatus.recent_events?.length || 0}</div>
                    </div>
                  </div>
                  {pipelineStatus.recent_events?.length > 0 && (
                    <div>
                      <h4 className="text-[11px] text-zinc-500 mb-1">最近管线事件</h4>
                      <div className="space-y-1">
                        {pipelineStatus.recent_events.map((evt,i) => (
                          <div key={i} className="bg-surface-3/30 rounded-lg px-3 py-1.5 text-[11px] flex items-center gap-2 border border-border/20">
                            <span className="text-zinc-600">{evt.timestamp ? new Date(evt.timestamp*1000).toLocaleTimeString() : ''}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${evt.type==='factor_mined'?'bg-emerald-600/20 text-emerald-400':evt.type==='mine_session_done'?'bg-brand-600/20 text-brand-400':'bg-amber-600/20 text-amber-400'}`}>{evt.type}</span>
                            {evt.factor_id && <span className="text-zinc-400 font-mono">{evt.factor_id.slice(-8)}</span>}
                            {evt.tested != null && <span className="text-zinc-400">测试 {evt.tested}, 通过 {evt.accepted}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!pipelineStatus && !pipelineLoading && <div className="text-center py-6 text-zinc-600 text-sm">点击「刷新状态」查看管线概况</div>}
            </Card>

            <Card>
              <h4 className="text-[12px] font-semibold text-zinc-300 mb-3">📋 自动化 推荐 Workflow 配置</h4>
              <div className="space-y-3 text-[11px] text-zinc-400">
                <div className="bg-surface-3/30 rounded-xl p-3 border border-border/20">
                  <div className="text-zinc-200 font-medium mb-1">Workflow 1: 定时挖掘</div>
                  <div className="text-[10px] text-zinc-500">Schedule Trigger (每日 10:00, 14:00) → HTTP POST /api/auto/trigger/mine → Wait 30min → GET /api/auto/pipeline/status → IF new_factors → 飞书/Telegram 通知</div>
                </div>
                <div className="bg-surface-3/30 rounded-xl p-3 border border-border/20">
                  <div className="text-zinc-200 font-medium mb-1">Workflow 2: 自动穷举融合</div>
                  <div className="text-[10px] text-zinc-500">Polling Trigger (GET /api/auto/events, 每 5min) → IF type=mine_session_done → POST /api/auto/trigger/combine-all → Wait → GET /api/auto/events → 通知融合结果</div>
                </div>
                <div className="bg-surface-3/30 rounded-xl p-3 border border-border/20">
                  <div className="text-zinc-200 font-medium mb-1">Workflow 3: 每周策略化</div>
                  <div className="text-[10px] text-zinc-500">Schedule Trigger (周五 16:00) → POST /api/digger/analyze → 取 top cluster 代表 → POST /api/digger/to-strategy → 推送策略结果</div>
                </div>
              </div>
            </Card>
          </>)}

          {/* === 融合记录 Sub-tab === */}
          {diggerSubTab === 'combine_history' && (<>
            <Card className="glow-brand border-brand-500/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-300">🔮 融合历史记录</h3>
                <button onClick={loadCombineHistory} disabled={combineHistoryLoading}
                  className="btn px-3 py-1.5 bg-surface-3 hover:bg-surface-4 text-zinc-400 text-[11px] rounded-lg border border-border transition">
                  {combineHistoryLoading ? <Spinner size={3}/> : '刷新'}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mb-4">每次融合操作都会生成完整记录，包含输入因子、融合结果、质量评估和最终裁决（采纳/回退）</p>
              {combineHistory.length === 0 && !combineHistoryLoading && (
                <div className="text-center py-8 text-zinc-500 text-[12px]">暂无融合记录 — 在因子库中选择因子后点击融合即可</div>
              )}
              {combineHistory.length > 0 && (
                <div className="space-y-2">
                  {combineHistory.map((rec, idx) => {
                    const v = rec.verdict || rec.status || 'unknown';
                    const vColor = v === 'accept' || v === 'accepted' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                   v === 'reject' || v === 'rejected' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                                   'text-amber-400 bg-amber-500/10 border-amber-500/20';
                    const vLabel = v === 'accept' || v === 'accepted' ? 'ACCEPT 采纳' :
                                   v === 'reject' || v === 'rejected' ? 'REJECT 回退' : 'MARGINAL 边缘';
                    const ts = rec.created_at ? new Date(rec.created_at * 1000).toLocaleString('zh-CN') : '';
                    const nFactors = rec.input_factors?.length || rec.input_factor_ids?.length || '?';
                    const cmb = rec.combined_metrics || {};
                    return (
                      <div key={rec.id || idx}
                        onClick={() => loadCombineDetail(rec.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition hover:bg-surface-3/50 ${selectedCombineRecord?.id === rec.id ? 'bg-surface-3/60 border-brand-500/30' : 'bg-surface-2/50 border-border/30'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${vColor}`}>{vLabel}</span>
                            <span className="text-[11px] text-zinc-400">{nFactors} 因子</span>
                          </div>
                          <span className="text-[10px] text-zinc-600">{ts}</span>
                        </div>
                        <div className="flex gap-3 text-[10px] text-zinc-500">
                          {cmb.sharpe != null && <span>Sharpe: <b className="text-zinc-300">{Number(cmb.sharpe).toFixed(3)}</b></span>}
                          {cmb.ir != null && <span>IR: <b className="text-zinc-300">{Number(cmb.ir).toFixed(3)}</b></span>}
                          {cmb.win_rate != null && <span>Win: <b className="text-zinc-300">{(Number(cmb.win_rate)*100).toFixed(1)}%</b></span>}
                          {cmb.max_drawdown != null && <span>DD: <b className="text-zinc-300">{(Number(cmb.max_drawdown)*100).toFixed(2)}%</b></span>}
                        </div>
                        {rec.evaluation?.improvements && (
                          <div className="mt-1 flex gap-3 text-[10px]">
                            {rec.evaluation.improvements.sharpe_vs_best != null && (
                              <span className={rec.evaluation.improvements.sharpe_vs_best > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                vs最佳: {rec.evaluation.improvements.sharpe_vs_best > 0 ? '+' : ''}{Number(rec.evaluation.improvements.sharpe_vs_best).toFixed(3)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* 融合详情面板 */}
            {combineDetailLoading && <div className="text-center py-4"><Spinner size={5}/></div>}
            {selectedCombineRecord && !combineDetailLoading && (() => {
              const rec = selectedCombineRecord;
              const v = rec.verdict || rec.status || 'unknown';
              const vColor = v === 'accept' || v === 'accepted' ? 'border-emerald-500/30' :
                             v === 'reject' || v === 'rejected' ? 'border-red-500/30' : 'border-amber-500/30';
              return (
                <Card className={`${vColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[13px] font-semibold text-zinc-300">融合详情 — {rec.id}</h4>
                    <button onClick={() => setSelectedCombineRecord(null)} className="text-zinc-500 hover:text-zinc-300 text-xs">关闭</button>
                  </div>

                  {/* 评估报告 */}
                  {rec.evaluation?.report && (
                    <div className="bg-surface-3/30 rounded-xl p-4 mb-4 border border-border/20">
                      <h5 className="text-[11px] font-semibold text-zinc-400 mb-2">质量评估报告</h5>
                      <pre className="text-[11px] leading-relaxed text-zinc-300 font-mono whitespace-pre-wrap">{rec.evaluation.report}</pre>
                    </div>
                  )}

                  {/* 指标改善对比 */}
                  {rec.evaluation?.improvements && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {[
                        {k:'combined_sharpe', label:'融合后 Sharpe'},
                        {k:'best_single_sharpe', label:'最佳单因子 Sharpe'},
                        {k:'avg_single_sharpe', label:'单因子平均 Sharpe'},
                        {k:'sharpe_vs_best', label:'Sharpe vs 最佳', delta:true},
                        {k:'sharpe_vs_avg', label:'Sharpe vs 平均', delta:true},
                        {k:'ir_vs_best', label:'IR vs 最佳', delta:true},
                      ].map(({k, label, delta}) => {
                        const val = rec.evaluation.improvements[k];
                        if (val == null) return null;
                        return (
                          <div key={k} className="bg-surface-2/50 rounded-lg p-2.5 border border-border/20">
                            <div className="text-[10px] text-zinc-500 mb-1">{label}</div>
                            <div className={`text-[13px] font-bold ${delta ? (val > 0 ? 'text-emerald-400' : val < 0 ? 'text-red-400' : 'text-zinc-400') : 'text-zinc-200'}`}>
                              {delta && val > 0 ? '+' : ''}{Number(val).toFixed(3)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 输入因子列表 */}
                  {rec.input_factors && rec.input_factors.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-[11px] font-semibold text-zinc-400 mb-2">输入因子 ({rec.input_factors.length})</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-0 text-[10px]">
                          <thead><tr className="text-zinc-500 border-b border-border/20">
                            <th className="text-left py-1 px-2">ID</th><th className="text-left py-1 px-2">主题</th>
                            <th className="text-right py-1 px-2">Sharpe</th><th className="text-right py-1 px-2">IR</th>
                            <th className="text-right py-1 px-2">Win%</th>
                          </tr></thead>
                          <tbody>
                            {rec.input_factors.map((f, i) => (
                              <tr key={f.id||i} className="border-b border-border/10 text-zinc-400">
                                <td className="py-1 px-2 font-mono text-[9px]">{(f.id||'').slice(-10)}</td>
                                <td className="py-1 px-2">{f.theme}</td>
                                <td className="py-1 px-2 text-right">{Number(f.sharpe||0).toFixed(3)}</td>
                                <td className="py-1 px-2 text-right">{Number(f.ir||0).toFixed(3)}</td>
                                <td className="py-1 px-2 text-right">{(Number(f.win_rate||0)*100).toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 融合后代码预览 */}
                  {rec.combined_code_preview && (
                    <div>
                      <h5 className="text-[11px] font-semibold text-zinc-400 mb-2">融合代码 (前2000字符)</h5>
                      <div className="bg-[#0d1117] rounded-xl p-3 border border-border/30 overflow-x-auto max-h-[300px] overflow-y-auto overflow-x-hidden">
                        <pre className="text-[11px] leading-relaxed text-emerald-300/80 font-mono whitespace-pre">{rec.combined_code_preview}</pre>
                      </div>
                    </div>
                  )}

                  {/* 原始返回 */}
                  {rec.result_raw && (
                    <details className="mt-3">
                      <summary className="text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-400">展开原始结果</summary>
                      <div className="bg-[#0d1117] rounded-xl p-3 mt-1 border border-border/30 overflow-x-auto max-h-[200px] overflow-y-auto overflow-x-hidden">
                        <pre className="text-[10px] text-zinc-500 font-mono whitespace-pre-wrap">{rec.result_raw}</pre>
                      </div>
                    </details>
                  )}
                </Card>
              );
            })()}
          </>)}

          {/* === 启动挖掘 Sub-tab === */}
          {diggerSubTab === 'mine' && (
            <Card className="glow-brand border-brand-500/10">
              <h3 className="text-sm font-semibold text-zinc-300 mb-1">⛏️ Alpha Digger — A股实战因子挖掘</h3>
              <p className="text-[11px] text-zinc-500 mb-2">围绕A股独特规律自主探索: 涨停连板/资金流向/板块轮动/情绪周期/竞价博弈/筹码结构/突破质量/聪明钱背离等</p>
              <p className="text-[11px] text-zinc-600 mb-4">LLM 生成因子代码 → 后端沙箱回测 → CSCV过拟合检验 → 质量评审入库</p>
              <div className="flex items-end gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1">挖掘轮数</label>
                  <input type="number" min="1" max="50" value={diggerRounds} onChange={e => setDiggerRounds(Number(e.target.value) || 5)}
                    className="w-20 bg-surface-3 border border-border rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-brand-500/40 transition text-center" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1">每轮因子数</label>
                  <input type="number" min="1" max="20" value={diggerFactors} onChange={e => setDiggerFactors(Number(e.target.value) || 5)}
                    className="w-20 bg-surface-3 border border-border rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-brand-500/40 transition text-center" />
                </div>
                <div className="flex-1"></div>
                <div className="text-[11px] text-zinc-600 text-right">
                  预计生成 <span className="text-zinc-400 font-medium">{diggerRounds * diggerFactors}</span> 个因子
                </div>
                <PushToIMButton endpoint="/api/digger/push-status" label="状态推 IM" />
                <button onClick={()=>{startDigger();setDiggerSubTab('logs');}} disabled={diggerRunning}
                  className="btn px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-brand-600/20 disabled:opacity-50">
                  {diggerRunning ? <span className="flex items-center gap-2"><Spinner size={4} /> 挖掘中...</span> : '启动挖掘'}
                </button>
              </div>
            </Card>
          )}

          {/* === 挖掘日志 Sub-tab === */}
          {diggerSubTab === 'logs' && (<>
            {diggerLogs.length > 0 ? (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-300">📋 挖掘日志 <span className="text-zinc-600 font-normal">({diggerLogs.length} 条)</span></h3>
                  {!diggerRunning && <button onClick={() => { setDiggerLogs([]); localStorage.removeItem('rragent_digger_logs'); }} className="btn text-[11px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded-lg transition">清空</button>}
                </div>
                <div className="space-y-1.5 max-h-[600px] overflow-y-auto overflow-x-hidden">
                  {diggerLogs.map((log, i) => (
                    <div key={i} className={`text-[12px] leading-relaxed px-3 py-2 rounded-lg border-l-2 transition-all
                      ${log.type === 'success' ? 'border-emerald-500/40 bg-emerald-600/5 text-emerald-300' :
                        log.type === 'error' ? 'border-red-500/40 bg-red-600/5 text-red-300' :
                        'border-brand-500/20 bg-surface-3/30 text-zinc-400'}`}>
                      <span className="text-zinc-600 text-[10px] mr-2">{new Date(log.ts).toLocaleTimeString()}</span>
                      <span className="whitespace-pre-wrap">{log.text}</span>
                    </div>
                  ))}
                  {diggerRunning && (
                    <div className="flex items-center gap-2 px-3 py-2 text-brand-400 text-[12px] animate-pulse">
                      <Spinner size={3} /><span>等待下一条消息...</span>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card><div className="text-center py-10 text-zinc-600">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-sm text-zinc-500">暂无日志。去「启动挖掘」tab 开始。</div>
              </div></Card>
            )}
          </>)}

          {diggerSubTab === 'memory' && (
            <div className="space-y-3">
              {memLoading && <Card><div className="text-center py-6 text-zinc-500"><Spinner size={3}/> 加载记忆系统...</div></Card>}
              {memData && (<>
                <Card>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3">🧠 LLM-wiki 记忆系统 <span className="text-zinc-600 font-normal">curated_knowledge {memData.curated?.total||0} chunk(向量+BM25 hybrid)</span></h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Object.entries(memData.curated?.by_kind||{}).map(([k,v])=>(
                      <span key={k} className="px-2 py-1 bg-surface-3/40 rounded-lg text-[11px] text-zinc-400">{k} <b className="text-brand-400">{v}</b></span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(memData.curated?.by_vault||{}).map(([k,v])=>(
                      <span key={k} className="px-2 py-1 bg-surface-2 rounded-lg text-[11px] text-zinc-500">{k}: {v}</span>
                    ))}
                  </div>
                </Card>
                {(memData.wiki?.founder||[]).map((f,i)=>(
                  <Card key={'f'+i}><h3 className="text-sm font-semibold text-zinc-300 mb-1">👤 {f.title} <span className="text-amber-400 text-[11px]">importance {f.importance} · v{f.version} · pinned</span></h3>
                    <div className="text-[12px] text-zinc-500 leading-relaxed">{f.excerpt}…</div></Card>
                ))}
                <Card><h3 className="text-sm font-semibold text-zinc-300 mb-2">💡 因子洞察 <span className="text-zinc-600 font-normal">(curator 自策展, aux-LLM)</span></h3>
                  <div className="space-y-1.5">{(memData.wiki?.insights||[]).map((p,i)=>(
                    <div key={'i'+i} className="flex items-center justify-between text-[12px] px-3 py-2 bg-surface-3/30 rounded-lg">
                      <span className="text-zinc-300 truncate">{p.title}</span>
                      <span className="text-zinc-600 ml-2 shrink-0">imp {p.importance} · v{p.version}{p.reviews&&p.reviews.length?` · 复审 ${p.reviews.join('/')}`:''}</span>
                    </div>))}{!(memData.wiki?.insights||[]).length && <div className="text-zinc-600 text-[12px]">暂无</div>}</div></Card>
                <Card><h3 className="text-sm font-semibold text-zinc-300 mb-2">🛠 可复用打法 <span className="text-zinc-600 font-normal">(procedural 第三层)</span></h3>
                  <div className="space-y-1.5">{(memData.wiki?.playbooks||[]).map((p,i)=>(
                    <div key={'p'+i} className="flex items-center justify-between text-[12px] px-3 py-2 bg-surface-3/30 rounded-lg">
                      <span className="text-zinc-300 truncate">{p.title}</span><span className="text-zinc-600 ml-2">v{p.version}</span>
                    </div>))}{!(memData.wiki?.playbooks||[]).length && <div className="text-zinc-600 text-[12px]">暂无</div>}</div>
                  <div className="text-zinc-600 text-[10px] mt-3 pt-2 border-t border-surface-3/40">归档(永不删): {memData.wiki?.archived||0} 篇 · 完整内容在 Obsidian RR-Agent-Wiki · 读接地见「挖掘日志」📚 行</div></Card>
              </>)}
              {!memData && !memLoading && <Card><div className="text-center py-10 text-zinc-600"><div className="text-3xl mb-2">🧠</div><div className="text-sm">加载记忆系统状态...</div></div></Card>}
            </div>
          )}
        </div>
      )}

      {tab === 'presets' && (
        <ScreenerPresetsPanel />
      )}

      {tab === 'ledger' && (<>
        {/* ── 盘中信号账本 ── */}
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <span>🎯</span> 盘中因子信号记录
              {signalLedger && <span className="text-[10px] text-zinc-600 font-normal">{signalLedger.count} 条</span>}
            </h3>
            <button onClick={loadSignalLedger} className="btn text-[12px] text-zinc-400 hover:text-white px-2 py-1 rounded-lg transition border border-border hover:border-border-light">
              🔄 刷新
            </button>
          </div>
          {!signalLedger && (
            <div className="text-center py-6 text-zinc-600 text-sm cursor-pointer hover:text-zinc-400 transition" onClick={loadSignalLedger}>
              点击刷新加载信号记录
            </div>
          )}
          {signalLedger && signalLedger.count === 0 && (
            <div className="text-center py-6 text-zinc-600 text-sm">
              暂无信号记录 — 开启盘中自动推送后，每次因子触发新买点时自动记录
            </div>
          )}
          {signalLedger && signalLedger.count > 0 && (
            <div className="space-y-2">
              {(() => {
                // Group records by push_time batch so signals pushed together appear as one card
                const grouped = {};
                for (const r of signalLedger.records) {
                  const key = r.push_time || (r.push_ts ? new Date(r.push_ts*1000).toLocaleString('zh-CN') : '?');
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(r);
                }
                // Further group within each batch by ts_code
                return Object.entries(grouped).map(([batchTime, recs]) => {
                  const byStock = {};
                  for (const r of recs) {
                    const k = r.ts_code;
                    if (!byStock[k]) byStock[k] = { name: r.ts_name || '', sigs: [] };
                    else if (!byStock[k].name && r.ts_name) byStock[k].name = r.ts_name;
                    byStock[k].sigs.push(r);
                  }
                  return (
                    <div key={batchTime} className="border border-border rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-surface-3 border-b border-border">
                        <span className="text-[10px] text-zinc-500">📡 推送批次</span>
                        <span className="text-[11px] text-brand-400 font-medium">{batchTime}</span>
                        <span className="text-[10px] text-zinc-600 ml-auto">{Object.keys(byStock).length} 只标的</span>
                      </div>
                      {Object.entries(byStock).map(([code, { name, sigs }]) => (
                        <div key={code} className="border-t border-border/40 px-3 py-2.5 hover:bg-surface-3/30 transition">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[13px] font-bold text-zinc-100">{name || code}</span>
                            {name && <span className="text-[10px] text-zinc-500 font-mono">{code}</span>}
                          </div>
                          <div className="space-y-1.5">
                            {sigs.sort((a,b) => (b.factor_sharpe||0)-(a.factor_sharpe||0)).map((s, si) => (
                              <div key={si} className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] pl-2 border-l-2 border-brand-500/30">
                                <span className="text-rose-400 font-medium">{s.factor_theme || s.factor_id}</span>
                                <span className="text-zinc-400">↗ 买点: <b className="text-zinc-200">{s.entry_date}</b></span>
                                {s.exit_date && <span className="text-zinc-400">↘ 预期卖: <b className="text-emerald-400">{s.exit_date}</b></span>}
                                {s.entry_price > 0 && <span className="text-zinc-500">买价≈{s.entry_price}</span>}
                                {s.exit_price > 0 && <span className="text-zinc-500">卖价≈{s.exit_price}</span>}
                                <span className="text-amber-400">Sharpe {s.factor_sharpe?.toFixed(2)}</span>
                                <span className="text-zinc-500">胜率 {s.factor_win_rate ? (s.factor_win_rate*100).toFixed(0)+'%' : '—'}</span>
                                <span className={s.pnl_pct > 0 ? 'text-red-400' : s.pnl_pct < 0 ? 'text-emerald-400' : 'text-zinc-600'}>
                                  {s.pnl_pct != null ? `历史${s.pnl_pct > 0 ? '+' : ''}${s.pnl_pct.toFixed(1)}%` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </Card>

        {/* ── 策略决策账本（Bridge） ── */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <span>📝</span> 策略决策账本
              {ledger && <span className="text-[10px] text-zinc-600 font-normal">共 {ledger.total} 条</span>}
            </h3>
            <div className="flex items-center gap-2">
              <select value={ledgerStatus} onChange={e => { setLedgerStatus(e.target.value); loadLedger(1, e.target.value); }}
                className="bg-surface-3 border border-border text-zinc-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none">
                <option value="">全部</option>
                <option value="APPROVE">通过</option>
                <option value="REJECT">拒绝</option>
                <option value="PENDING">待审</option>
              </select>
              <button onClick={() => loadLedger(1)} disabled={ledgerLoading} className="btn text-[12px] text-zinc-400 hover:text-white px-2 py-1 rounded-lg transition border border-border hover:border-border-light disabled:opacity-40">
                {ledgerLoading ? <Spinner size={3}/> : '🔄'}
              </button>
            </div>
          </div>
          {ledgerLoading && <LoadingBlock text="加载决策账本..." />}
          {!ledgerLoading && !ledger && (
            <div className="text-center py-6 text-zinc-600 text-sm cursor-pointer hover:text-zinc-400 transition" onClick={() => loadLedger(1)}>
              点击加载决策账本
            </div>
          )}
          {!ledgerLoading && ledger && (
            <>
              {ledger.items && ledger.items.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto overflow-x-hidden pr-1">
                  {ledger.items.map((item) => {
                    const stColor = item.status === 'APPROVE' ? 'bg-emerald-500/15 text-emerald-400' :
                                    item.status === 'REJECT'  ? 'bg-red-500/15 text-red-400' :
                                                                'bg-amber-500/15 text-amber-400';
                    const m = item.backtest_metrics || {};
                    return (
                      <div key={item.id} className="bg-surface-3/40 rounded-xl border border-border/30 px-3 py-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-medium text-zinc-200 truncate flex-1 mr-2">
                            #{item.id} {item.title || '未命名策略'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${stColor}`}>{item.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
                          {m.sharpe_ratio != null && <span>Sharpe <b className="text-zinc-300">{Number(m.sharpe_ratio).toFixed(2)}</b></span>}
                          {m.win_rate_pct != null && <span>胜率 <b className="text-zinc-300">{Number(m.win_rate_pct).toFixed(0)}%</b></span>}
                          {m.annualized_return_pct != null && <span>年化 <b className="text-zinc-300">{Number(m.annualized_return_pct).toFixed(1)}%</b></span>}
                          {item.model_used && <span className="text-zinc-600">{item.model_used}</span>}
                          <span className="text-zinc-600 ml-auto">{item.created_at?.slice(0,10)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-600 text-sm">暂无记录</div>
              )}
              {/* Pagination */}
              {ledger.total > 30 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-[11px] text-zinc-500">
                  <span>第 {ledgerPage} 页 / 共 {Math.ceil(ledger.total/30)} 页</span>
                  <div className="flex gap-2">
                    <button disabled={ledgerPage <= 1 || ledgerLoading} onClick={() => loadLedger(ledgerPage-1)}
                      className="px-2 py-1 rounded-lg bg-surface-3 border border-border hover:bg-surface-4 disabled:opacity-40">上一页</button>
                    <button disabled={ledgerPage >= Math.ceil(ledger.total/30) || ledgerLoading} onClick={() => loadLedger(ledgerPage+1)}
                      className="px-2 py-1 rounded-lg bg-surface-3 border border-border hover:bg-surface-4 disabled:opacity-40">下一页</button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </>)}
    </div>
  );
}

function LLMConfigPanel() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selProvider, setSelProvider] = useState('');
  const [selModel, setSelModel] = useState('');
  const toast = useContext(ToastContext);
  const loadConfig = async () => { setLoading(true); const data = await apiGet('/api/llm/config'); if (data && !data.error) { setConfig(data); if (data.current) { setSelProvider(data.current.provider || ''); setSelModel(data.current.model || ''); } } setLoading(false); };
  useEffect(() => { loadConfig(); }, []);
  const handleProviderChange = (p) => { setSelProvider(p); const models = config?.providers?.[p]?.models || []; setSelModel(models[0] || ''); };
  const handleSave = async () => { setSaving(true); const r = await apiPost('/api/llm/config', {provider: selProvider, model: selModel}); setSaving(false); if (r.ok) { toast(r.msg, 'success'); loadConfig(); } else toast(r.msg || '设置失败', 'error'); };
  const handleAuto = async () => { setSaving(true); const r = await apiPost('/api/llm/config', {provider: '', model: ''}); setSaving(false); setSelProvider(''); setSelModel(''); if (r.ok) { toast(r.msg, 'success'); loadConfig(); } };
  if (loading) return <Card><LoadingBlock text="加载模型配置..." /></Card>;
  if (!config) return null;
  const providers = config.providers || {};
  const meta = config.model_meta || {};
  const currentModels = selProvider ? (providers[selProvider]?.models || []) : [];
  const hasKey = selProvider ? providers[selProvider]?.has_key : false;
  const selMeta = selModel ? meta[selModel] : null;
  const fmtCtx = (n) => { if (!n) return ''; if (n >= 1000000) return (n/1000000).toFixed(0) + 'M'; return Math.round(n/1000) + 'K'; };
  const tagColor = (t) => {
    if (t === '推荐') return 'bg-brand-600/20 text-brand-400 border-brand-500/30';
    if (t === '图片理解') return 'bg-violet-500/15 text-violet-400 border-violet-500/25';
    if (t === '思考') return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25';
    if (t === '代码专精') return 'bg-green-500/15 text-green-400 border-green-500/25';
    if (t === '深度分析' || t === '深度推理') return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
    if (t === '高性价比') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
    return 'bg-surface-3 text-zinc-500 border-border';
  };
  return (
    <Card className="glow-brand border-brand-500/10">
      <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><span className="text-lg">🤖</span><h3 className="text-sm font-semibold text-white">LLM 模型配置</h3></div>{config.current && (<span className="text-[11px] px-2 py-1 bg-brand-600/20 text-brand-400 rounded-lg font-medium">当前: {config.current.provider}/{config.current.model}</span>)}{!config.current && (<span className="text-[11px] px-2 py-1 bg-surface-3 text-zinc-500 rounded-lg">自动路由</span>)}</div>
      <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
        <div><label className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1.5">Provider</label><select value={selProvider} onChange={e=>handleProviderChange(e.target.value)} className="w-full bg-surface-3 border border-border rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-brand-500/40 transition cursor-pointer"><option value="">自动路由</option>{Object.entries(providers).map(([name, info]) => (<option key={name} value={name} disabled={!info.has_key}>{name} {info.has_key ? '' : '(无 Key)'}</option>))}</select></div>
        <div><label className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1.5">Model</label><select value={selModel} onChange={e=>setSelModel(e.target.value)} disabled={!selProvider} className="w-full bg-surface-3 border border-border rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-brand-500/40 transition cursor-pointer disabled:opacity-40">{currentModels.map(m => { const mm = meta[m]; return <option key={m} value={m}>{mm?.label || m}</option>; })}{currentModels.length === 0 && <option value="">--</option>}</select></div>
        <button onClick={handleSave} disabled={saving || (!selProvider)} className="btn px-4 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-sm text-white font-medium transition shadow-lg shadow-brand-600/20 disabled:opacity-40">{saving ? <Spinner /> : '应用'}</button>
        <button onClick={handleAuto} disabled={saving} className="btn px-4 py-2.5 bg-surface-3 hover:bg-surface-4 rounded-xl text-sm text-zinc-300 border border-border hover:border-border-light transition disabled:opacity-40">自动</button>
      </div>
      {selMeta && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {selMeta.tags && selMeta.tags.map(t => (<span key={t} className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${tagColor(t)}`}>{t}</span>))}
          {selMeta.ctx && (<span className="text-[10px] text-zinc-500 ml-1">上下文 {fmtCtx(selMeta.ctx)}</span>)}
          {selMeta.out && (<span className="text-[10px] text-zinc-600">/ 输出 {fmtCtx(selMeta.out)}</span>)}
        </div>
      )}
      {selProvider && !hasKey && (<div className="mt-3 text-[12px] text-yellow-400/80 bg-yellow-500/10 rounded-lg px-3 py-2 border border-yellow-500/20">⚠️ {selProvider} 未配置 API Key</div>)}
      {selProvider && currentModels.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="text-[11px] text-zinc-600 mb-2">{selProvider} 可用模型:</div>
          <div className="grid gap-1.5">{currentModels.map(m => {
            const mm = meta[m];
            const isActive = m === selModel;
            return (
              <button key={m} onClick={() => setSelModel(m)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition text-[12px] border ${isActive ? 'bg-brand-600/15 border-brand-500/30 text-white' : 'bg-surface-2 border-border hover:border-border-light text-zinc-400 hover:text-zinc-200'}`}>
                <span className="font-medium min-w-[120px]">{mm?.label || m}</span>
                <span className="flex gap-1 flex-wrap flex-1">{(mm?.tags||[]).map(t => (<span key={t} className={`text-[9px] px-1 py-0 rounded border ${tagColor(t)}`}>{t}</span>))}</span>
                {mm?.ctx && <span className="text-[10px] text-zinc-600 whitespace-nowrap">{fmtCtx(mm.ctx)}</span>}
              </button>
            );
          })}</div>
        </div>
      )}
      {!selProvider && (
        <div className="mt-4 pt-3 border-t border-border/50"><div className="text-[11px] text-zinc-600 mb-2">可用 Providers:</div><div className="flex flex-wrap gap-1.5">{Object.entries(providers).map(([name, info]) => (<span key={name} className={`text-[11px] px-2 py-1 rounded-lg border ${info.has_key ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-surface-3 border-border text-zinc-600'}`}>{name} · {info.models.length} models {info.has_key ? '✓' : ''}</span>))}</div></div>
      )}
    </Card>
  );
}

function DailyLogView() {
  const [selectedDate, setSelectedDate] = useState('');
  const [dates, setDates] = useState([]);
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);
  // F7 — search + role filter over the selected day's chats
  const [searchQ, setSearchQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');  // all|user|assistant|command|result
  const toast = useContext(ToastContext);
  const loadDates = async () => { try { const r = await apiGet('/api/daily-log/dates'); if (r.dates) setDates(r.dates); } catch(e) {} };
  const loadLog = async (date) => { setLoading(true); setSelectedDate(date); try { const r = await apiGet('/api/daily-log?date=' + date); if (!r.error) setLog(r); else toast('加载失败', 'error'); } catch(e) { toast('网络错误', 'error'); } setLoading(false); };
  useEffect(() => { loadDates(); loadLog(new Date().toISOString().slice(0, 10)); }, []);
  const fmtTime = (ts) => { if (!ts) return ''; return new Date(ts * 1000).toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit', second:'2-digit'}); };
  const roleIcon = (role) => ({user:'👤', assistant:'🤖', command:'⌨️', result:'📋'}[role] || '💬');
  const roleColor = (role) => ({user:'text-blue-400', assistant:'text-green-400', command:'text-yellow-400', result:'text-zinc-400'}[role] || 'text-zinc-300');

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4"><h1 className="text-xl font-bold text-white">每日工作日志</h1><button onClick={loadDates} className="btn text-[12px] text-brand-400 hover:text-brand-300 px-3 py-1.5 rounded-lg transition">刷新日期</button></div>
      <div className="flex gap-2 mb-4 flex-wrap">{dates.length === 0 && <span className="text-[12px] text-zinc-500">暂无日志记录</span>}{dates.map(d => (<button key={d} onClick={() => loadLog(d)} className={`btn px-3 py-1.5 rounded-xl text-[12px] border transition ${d === selectedDate ? 'bg-brand-600/20 text-brand-400 border-brand-500/30' : 'bg-surface-2 text-zinc-400 border-border hover:border-border-light'}`}>{d}</button>))}</div>
      {loading && (<Card><div className="flex items-center gap-2 py-4 justify-center"><Spinner /> <span className="text-zinc-500 text-sm">加载中...</span></div></Card>)}
      {!loading && log && (<div className="space-y-4">
        <div className="grid grid-cols-2 gap-3"><Card><div className="text-center"><div className="text-2xl font-bold text-brand-400">{log.chat_count || 0}</div><div className="text-[11px] text-zinc-500 mt-1">对话记录</div></div></Card><Card><div className="text-center"><div className="text-2xl font-bold text-emerald-400">{log.task_count || 0}</div><div className="text-[11px] text-zinc-500 mt-1">任务执行</div></div></Card></div>
        {log.tasks && log.tasks.length > 0 && (<Card><h3 className="text-sm font-semibold text-zinc-300 mb-3">📋 当日任务</h3><div className="space-y-2">{log.tasks.map((t, i) => { const icon = {completed:'✅', running:'🔄', failed:'❌', pending:'⏳', cancelled:'🚫'}[t.status] || '❓'; return (<div key={i} className="flex items-center gap-2 text-[13px] py-1.5 border-b border-border/50 last:border-0"><span>{icon}</span><span className="text-zinc-300 font-medium">{t.name || t.id}</span><span className="text-zinc-600 ml-auto">{t.progress != null ? t.progress + '%' : ''}</span></div>); })}</div></Card>)}
        {log.chats && log.chats.length > 0 && (() => {
          // F7 — apply search + role filter
          const q = searchQ.trim().toLowerCase();
          const filtered = log.chats.filter(c => {
            if (roleFilter !== 'all' && c.role !== roleFilter) return false;
            if (q) {
              const hay = `${c.content || ''} ${c.target || ''} ${c.view || ''}`.toLowerCase();
              if (!hay.includes(q)) return false;
            }
            return true;
          });
          return (
          <Card>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <h3 className="text-sm font-semibold text-zinc-300">💬 对话与操作记录</h3>
              <span className="text-[11px] text-zinc-600">{filtered.length}/{log.chats.length}</span>
              <input type="text" value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                placeholder="搜索关键词..."
                className="ml-auto bg-surface-3 text-[12px] text-zinc-200 placeholder-zinc-600 rounded-lg px-3 py-1 border border-border focus:outline-none focus:border-brand-500/40 w-48"/>
              <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}
                className="bg-surface-3 text-[12px] text-zinc-200 rounded-lg px-2 py-1 border border-border focus:outline-none">
                <option value="all">全部角色</option>
                <option value="user">👤 我</option>
                <option value="assistant">🤖 助手</option>
                <option value="command">⌨️ 命令</option>
                <option value="result">📋 结果</option>
              </select>
            </div>
            <div className="space-y-1 max-h-[600px] overflow-y-auto overflow-x-hidden">
              {filtered.length === 0 ? (
                <div className="text-center py-4 text-[12px] text-zinc-600">没有匹配记录</div>
              ) : filtered.map((c, i) => (
                <div key={i} className="flex gap-2 py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-[13px] flex-shrink-0">{roleIcon(c.role)}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[12px] font-medium ${roleColor(c.role)}`}>{c.role}</span>
                    <span className="text-[11px] text-zinc-600 ml-2">{fmtTime(c.ts)}</span>
                    {c.view && c.view !== 'chat' && <span className="text-[10px] text-zinc-700 ml-1 px-1.5 py-0.5 bg-surface-3 rounded">{c.view}</span>}
                    {c.target && <span className="text-[10px] text-brand-500/60 ml-1 px-1.5 py-0.5 bg-brand-500/10 rounded">@{c.target}</span>}
                    <pre className="text-[12px] text-zinc-400 mt-0.5 whitespace-pre-wrap break-all leading-relaxed">{(c.content||'').slice(0, 500)}{(c.content||'').length > 500 ? '...' : ''}</pre>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          );
        })()}
        {(!log.chats || log.chats.length === 0) && (!log.tasks || log.tasks.length === 0) && (<Card><div className="text-center py-8 text-zinc-600 text-sm">当日无操作记录</div></Card>)}
      </div>)}
    </div>
  );
}
