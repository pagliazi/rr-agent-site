// ── Dashboard View ───────────────────────────────────

function DashboardView({agents, channels, runtimeInfo={}, onViewChange, onSend}) {
  // 嵌入式组件不计入外部 Agent 健康百分比
  const externalAgents = Object.values(agents).filter(a => !a.embedded);
  const nonSleepingAgents = externalAgents.filter(a => a.status !== 'sleeping');
  const onlineCount = nonSleepingAgents.filter(a => a.status === 'online').length;
  const totalCount = nonSleepingAgents.length;
  const pct = totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 100;

  // F6 — rolling history for sparklines, stored in a component-scoped
  // ref so we don't rebuild state on every prop change. Each entry is
  // a snapshot of the current poll cycle. Bounded at 30 ticks (~5 min
  // at a 10s poll cadence).
  const historyRef = React.useRef({online: [], factors: [], sessions: [], tools: []});
  React.useEffect(() => {
    const h = historyRef.current;
    const push = (arr, v) => { arr.push(v); while (arr.length > 30) arr.shift(); };
    push(h.online, onlineCount);
    push(h.factors, runtimeInfo.factor_count || 0);
    push(h.sessions, runtimeInfo.sessions || 0);
    push(h.tools, (runtimeInfo.tools && runtimeInfo.tools.tier1_indexed) || 0);
  }, [onlineCount, runtimeInfo]);

  const categorized = useMemo(() => {
    const groups = {};
    CATEGORIES.forEach(c => { groups[c.id] = []; });
    // 只将非嵌入式 Agent 放入卡片格
    Object.entries(agents).forEach(([name, info]) => {
      if (info.embedded) return;   // 嵌入式 → 不显示为独立卡片
      const meta = getAgentMeta(name);
      const cat = meta.cat || 'ops';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({name, ...meta, ...info});
    });
    return groups;
  }, [agents]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">RR-Agent A股量化智能体</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{pct}<span className="text-lg text-zinc-500 font-normal">%</span></div>
            <div className="flex items-center gap-1.5 justify-end">
              <Sparkline points={historyRef.current.online} color={pct > 80 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444'} width={60} height={14} />
              <div className="text-[11px] text-zinc-500">系统健康</div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#1e1e28" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke={pct>80?'#10b981':pct>50?'#f59e0b':'#ef4444'}
                  strokeWidth="3" strokeDasharray={`${pct * 0.94} 100`} strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {CATEGORIES.map(cat => {
        const items = categorized[cat.id] || [];
        if (items.length === 0) return null;
        return (
          <div key={cat.id} className="animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <span className={`${cat.id==='core' ? 'text-xl' : 'text-base'}`}>{cat.icon}</span>
              <h2 className={`font-semibold ${cat.id==='core' ? 'text-base text-white' : 'text-sm text-zinc-300'}`}>{cat.label}</h2>
              {cat.desc && <span className="text-[11px] text-zinc-600 hidden sm:inline">· {cat.desc}</span>}
              <span className="text-[11px] text-zinc-600 ml-auto">{items.filter(i=>i.status==='online').length}/{items.filter(i=>i.status!=='sleeping').length}{items.some(i=>i.status==='sleeping')?<span className="text-blue-500/50 ml-1">+{items.filter(i=>i.status==='sleeping').length}休眠</span>:null}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {items.map(agent => (
                <div key={agent.name}
                  onClick={() => { onViewChange('quant'); }}
                  className={`group cursor-pointer bg-surface-2 rounded-xl border p-4 transition-all duration-200 hover:bg-surface-3 hover:border-border-light active:scale-[.98]
                    ${agent.status==='online' ? 'border-border' : agent.status==='sleeping' ? 'border-border/40 opacity-70' : 'border-border opacity-50'}`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-xl">{agent.icon}</span>
                    <StatusDot status={agent.status} />
                  </div>
                  <div className="text-[13px] font-medium text-white group-hover:text-brand-400 transition">{agent.label}</div>
                  <div className="text-[11px] text-zinc-600 mt-0.5">{agent.desc}</div>
                  {agent.status==='online' && (
                    <div className="mt-1.5">
                      {agent.ts ? <FreshnessBadge ts={agent.ts} fresh={30} slow={120} /> : <span className="text-[10px] text-zinc-700">{agent.age}s ago</span>}
                    </div>
                  )}
                  {agent.status==='sleeping' && (
                    <div className="text-[10px] text-blue-500/60 mt-1.5">休眠 · 盘中启动</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* RRAgent Status + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-slide-up">
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🧠</span>
            <h3 className="text-sm font-semibold text-zinc-200">RR-Agent 内核</h3>
          </div>
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-zinc-500">ConversationRuntime</span>
              <StatusDot status={agents.orchestrator?.status === 'online' ? 'online' : 'offline'} />
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">ToolSearch</span>
              <StatusDot status="online" />
            </div>
            {runtimeInfo.llm && (
              <div className="flex justify-between">
                <span className="text-zinc-500">LLM 提供商</span>
                <span className="text-[10px] text-brand-400 font-mono truncate max-w-[100px]">{runtimeInfo.llm}</span>
              </div>
            )}
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">📊</span>
            <h3 className="text-sm font-semibold text-zinc-200">快速统计</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-lg font-bold text-white">{externalAgents.length}</div><div className="text-[10px] text-zinc-500">外部 Agent</div></div>
            <div><div className="text-lg font-bold text-white">{onlineCount}</div><div className="text-[10px] text-zinc-500">活跃 Agent</div></div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">📡</span>
            <h3 className="text-sm font-semibold text-zinc-200">通道概览</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-lg font-bold text-white">{Object.keys(channels).length}</div><div className="text-[10px] text-zinc-500">通道总数</div></div>
            <div><div className="text-lg font-bold text-white">{Object.values(channels).filter(c=>c.status==='online').length}</div><div className="text-[10px] text-zinc-500">在线通道</div></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">⚡ 快速操作</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK.slice(0,6).map(q => (
              <button key={q.cmd} onClick={()=>{ onViewChange(q.cmd==='news'?'news':'market'); }}
                className="btn flex items-center gap-2 px-3 py-2.5 bg-surface-3 hover:bg-surface-4 rounded-xl text-sm text-zinc-300 border border-transparent hover:border-border-light text-left">
                <span>{q.icon}</span><span>{q.label}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">📡 通道状态</h3>
          {Object.entries(channels).map(([name,info]) => (
            <div key={name} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2.5">
                <StatusDot status={info.status} />
                <span className="text-sm capitalize text-zinc-300">{name}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                {info.mode && <span className="px-1.5 py-0.5 bg-surface-3 rounded text-[10px]">{info.mode}</span>}
                <span>{info.status==='online'?`${info.age}s`:'—'}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
