// 5/17 Phase B: minimal WebAuthn helpers (no dep, browser-native).
// base64url <-> ArrayBuffer round-trips
function _b64ToBuf(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const bin = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}
function _bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
async function _passkeyLogin(username) {
  const optsResp = await fetch('/api/webauthn/login-options', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username}),
  });
  if (!optsResp.ok) {
    const d = await optsResp.json().catch(() => ({}));
    throw new Error(d.msg || `获取 Passkey options 失败 (${optsResp.status})`);
  }
  const opts = await optsResp.json();
  opts.challenge = _b64ToBuf(opts.challenge);
  if (opts.allowCredentials) {
    opts.allowCredentials = opts.allowCredentials.map(c => ({...c, id: _b64ToBuf(c.id)}));
  }
  const cred = await navigator.credentials.get({publicKey: opts});
  const credJson = {
    id: cred.id,
    rawId: _bufToB64(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: _bufToB64(cred.response.clientDataJSON),
      authenticatorData: _bufToB64(cred.response.authenticatorData),
      signature: _bufToB64(cred.response.signature),
      userHandle: cred.response.userHandle ? _bufToB64(cred.response.userHandle) : null,
    },
    clientExtensionResults: cred.getClientExtensionResults ? cred.getClientExtensionResults() : {},
  };
  const v = await fetch('/api/webauthn/login-verify', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, credential: credJson}),
  });
  const data = await v.json();
  if (!v.ok || !data.ok) throw new Error(data.msg || `Passkey 验证失败 (${v.status})`);
  return data;
}

function LoginPage({onLogin}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Phase A: push-approve polling state
  const [pending, setPending] = useState(null);  // {request_id, expires_in_sec, poll_interval_sec}
  const [pollRemain, setPollRemain] = useState(0);

  const stopPolling = React.useRef(null);

  // Polling loop for push-approve flow
  useEffect(() => {
    if (!pending) return;
    let cancelled = false;
    const interval = (pending.poll_interval_sec || 3) * 1000;
    const start = Date.now();
    const expiresAt = start + (pending.expires_in_sec || 300) * 1000;

    const tick = async () => {
      if (cancelled) return;
      try {
        const r = await fetch(`/api/auth/login_approval/${pending.request_id}`);
        const d = await r.json();
        if (d.ok && d.status === 'approved' && d.token) {
          setPending(null);
          onLogin(d.token, d.user);
          return;
        }
        if (d.status === 'denied') {
          setPending(null);
          setError('已被拒绝。如非本人请改密码。');
          return;
        }
        if (d.status === 'expired' || d.status === 'consumed') {
          setPending(null);
          setError('审批已过期, 请重新登录');
          return;
        }
        // pending — update countdown + schedule next
        const remain = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        setPollRemain(remain);
        if (remain <= 0) {
          setPending(null);
          setError('审批超时');
          return;
        }
        stopPolling.current = setTimeout(tick, interval);
      } catch (e) {
        // transient — keep trying
        stopPolling.current = setTimeout(tick, interval);
      }
    };
    tick();
    return () => {
      cancelled = true;
      if (stopPolling.current) clearTimeout(stopPolling.current);
    };
  }, [pending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username: username.trim(), password})});
      const data = await r.json();
      if (r.status === 202 && data.status === 'approval_pending') {
        // Phase A: push approve flow kicked in
        setPending({
          request_id: data.request_id,
          poll_interval_sec: data.poll_interval_sec || 3,
          expires_in_sec: data.expires_in_sec || 300,
        });
        setPollRemain(data.expires_in_sec || 300);
        setLoading(false);
        return;
      }
      if (data.ok) { onLogin(data.token, data.user); }
      else { setError(data.msg || '登录失败'); }
    } catch(e) { setError('网络错误'); }
    setLoading(false);
  };

  const handlePasskey = async () => {
    if (!username.trim()) { setError('请先填用户名'); return; }
    if (!window.PublicKeyCredential) { setError('浏览器不支持 WebAuthn'); return; }
    // WebAuthn 硬约束: 必须 secure context (HTTPS 或 localhost). LAN HTTP 必败.
    if (!window.isSecureContext) {
      setError('Passkey 需 HTTPS 安全上下文');
      return;
    }
    setLoading(true); setError('');
    try {
      const data = await _passkeyLogin(username.trim());
      onLogin(data.token, data.user);
    } catch (e) {
      // 把常见 WebAuthn 错误翻译成人话
      let msg = e.message || String(e);
      if (msg.includes('NotAllowedError')) msg = '取消或超时. 重试或换密码登录';
      else if (msg.includes('SecurityError')) msg = '安全错误: 当前域名与注册时不同 (RP_ID mismatch)';
      else if (msg.includes('未注册')) msg = '当前用户未注册 Passkey, 先用密码登录到个人资料页注册';
      setError('Passkey: ' + msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-brand-600/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-500/3 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-brand-600/[.02] blur-3xl"></div>
      </div>
      <div className="relative w-full max-w-[400px] px-6 animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-600/15 border border-brand-500/20 flex items-center justify-center mb-5 shadow-lg shadow-brand-600/10 overflow-hidden">
            <img src="static/favicon.ico" alt="RRAgent" className="w-12 h-12 rounded-xl object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RRAgent</h1>
          <p className="text-sm text-zinc-500 mt-1.5">A股量化智能体</p>
        </div>
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4 shadow-2xl shadow-black/30 gradient-border">
          <div>
            <label className="block text-xs text-zinc-400 font-medium mb-1.5 pl-1">用户名</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                <Icon.User className="w-4 h-4" />
              </span>
              <input value={username} onChange={e=>setUsername(e.target.value)} autoFocus
                className="w-full bg-surface-2 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition placeholder:text-zinc-600" placeholder="请输入用户名" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 font-medium mb-1.5 pl-1">密码</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                <Icon.Lock className="w-4 h-4" />
              </span>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition placeholder:text-zinc-600" placeholder="请输入密码"
                onKeyDown={e => e.key === 'Enter' && handleSubmit(e)} />
            </div>
          </div>
          {error && <div className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">{error}</div>}

          {pending ? (
            <div className="space-y-3">
              <div className="text-sm text-brand-300 bg-brand-500/10 rounded-xl px-4 py-3 border border-brand-500/25 leading-relaxed">
                📱 已推送审批到 Telegram, 请打开机器人点 ✅ 批准本次登录.
                <div className="text-xs text-zinc-500 mt-1.5">request id: <code className="text-zinc-400">{pending.request_id.slice(0, 12)}...</code></div>
                <div className="text-xs text-zinc-500">剩余 <span className="text-brand-400 font-mono">{Math.floor(pollRemain / 60)}:{String(pollRemain % 60).padStart(2, '0')}</span> 自动失效</div>
              </div>
              <button type="button" onClick={() => { if (stopPolling.current) clearTimeout(stopPolling.current); setPending(null); setError(''); }}
                className="w-full py-2.5 bg-surface-3 hover:bg-surface-4 text-zinc-400 text-sm rounded-xl transition">
                取消
              </button>
            </div>
          ) : (
            <>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-600/25 disabled:opacity-50 active:scale-[.98] hover:shadow-brand-500/30">
                {loading ? <span className="flex items-center justify-center gap-2"><Spinner size={4} /> 登录中...</span> : '登 录'}
              </button>
              <div className="relative flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-[10px] text-zinc-600">或</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <button type="button" onClick={handlePasskey} disabled={loading || !username.trim()}
                className="w-full py-2.5 bg-surface-3 hover:bg-surface-4 border border-border hover:border-brand-500/30 text-zinc-300 hover:text-white text-sm font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M15 7a2 2 0 100-4 2 2 0 000 4zM5 13a8 8 0 1116 0v3a2 2 0 01-2 2h-3v-2a2 2 0 00-2-2H7a2 2 0 00-2-2v-1z"/></svg>
                用 Passkey 登录 (Touch/Face ID)
              </button>
            </>
          )}
        </form>
        <p className="text-center text-[11px] text-zinc-700 mt-6">RRAgent Multi-Agent System · v2.0</p>
      </div>
    </div>
  );
}


// ── User Menu (avatar dropdown in NavRail) ───────────

function UserMenu({user, onLogout, onViewChange}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        aria-label={`用户菜单: ${user.display_name || user.sub || '用户'}`}
        aria-expanded={open}
        className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-2 border border-border hover:border-border-light hover:bg-surface-3 transition-all duration-200 group">
        <span className="text-lg group-hover:scale-110 transition-transform">{user.avatar || '🦀'}</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-52 glass rounded-xl shadow-2xl shadow-black/40 animate-scale-in z-50 overflow-hidden gradient-border">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">{user.avatar || '🦀'}</span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{user.display_name || user.username}</div>
                <div className={`text-[10px] font-medium ${ROLE_COLORS[user.role] || 'text-zinc-400'}`}>{ROLE_LABELS[user.role] || user.role}</div>
              </div>
            </div>
          </div>
          <div className="py-1">
            <button onClick={() => { setOpen(false); onViewChange('profile'); }}
              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-surface-3 hover:text-white transition flex items-center gap-2.5">
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              个人资料
            </button>
            {user.role === 'admin' && (
              <>
                <button onClick={() => { setOpen(false); onViewChange('users'); }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-surface-3 hover:text-white transition flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  用户 & 频道绑定
                </button>
                <button onClick={() => { setOpen(false); onViewChange('admin'); }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-surface-3 hover:text-white transition flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"/></svg>
                  系统账户管理
                </button>
                <button onClick={() => { setOpen(false); onViewChange('trusted_devices'); }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-surface-3 hover:text-white transition flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M8 14h4"/></svg>
                  可信设备管理
                </button>
              </>
            )}
            {/* F11 — theme toggle; persisted in localStorage */}
            <div className="border-t border-border my-1"></div>
            <div className="px-4 py-2 text-[11px] text-zinc-500">主题</div>
            <div className="px-3 pb-2 flex gap-1">
              {[
                {id:'dark',  label:'暗', cls:''},
                {id:'light', label:'亮', cls:'theme-light'},
                {id:'hc',    label:'高对比', cls:'theme-hc'},
              ].map(t => (
                <button key={t.id} onClick={() => {
                    const html = document.documentElement;
                    html.classList.remove('theme-light','theme-hc');
                    if (t.cls) html.classList.add(t.cls);
                    try { localStorage.setItem('rragent_theme', t.id); } catch(e) {}
                  }}
                  className="flex-1 py-1 rounded text-[11px] bg-surface-3 hover:bg-surface-2 text-zinc-300 border border-border transition">
                  {t.label}
                </button>
              ))}
            </div>
            <div className="border-t border-border my-1"></div>
            <button onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition flex items-center gap-2.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Nav Rail (collapsible left sidebar with labels) ───

// F9 — Command palette (Cmd+K / Ctrl+K).
// Spotlight-style overlay: fuzzy-search views, agents, factors, and
// /slash commands. Opens on Cmd+K, closes on Esc / click-outside.
function CommandPalette({open, onClose, onNavigate, onRunSlash, agents}) {
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(0);
  const inputRef = React.useRef(null);

  // Static catalog of navigable commands. Extend freely; the fuzzy
  // matcher is dumb-simple (substring), no external dep.
  const VIEWS = React.useMemo(() => [
    {id:'dashboard', label:'概览 · Dashboard', icon:'🏠'},
    {id:'chat',      label:'对话 · Chat',      icon:'💬'},
    {id:'market',    label:'行情 · Market',    icon:'📊'},
    {id:'quant',     label:'量化 · Quant',     icon:'📐'},
    {id:'intraday',  label:'盘中 · Intraday',  icon:'⏱️'},
    {id:'trading',   label:'交易 · Trading',   icon:'💹'},
    {id:'news',      label:'新闻 · News',      icon:'📰'},
    {id:'tools',     label:'工具 · Tools',     icon:'🛠️'},
    {id:'apple',     label:'Apple 生态',       icon:'🍎'},
    {id:'system',    label:'系统 · System',    icon:'⚙️'},
    {id:'logs',      label:'日志 · Daily log', icon:'📋'},
    {id:'autoresearch', label:'Autoresearch', icon:'🔬'},
    {id:'evolution',    label:'自进化 · Evolution', icon:'🧬'},
    {id:'api_usage', label:'API 用量',         icon:'📈'},
    {id:'tasks',     label:'任务 · Tasks',     icon:'✅'},
    {id:'agent_skills', label:'Agent 技能',    icon:'🧠'},
    {id:'meme',      label:'Meme 因子',        icon:'🐉'},
  ], []);

  const SLASH = React.useMemo(() => [
    {cmd:'/evolve',   label:'触发自进化 (/evolve <args>)',  icon:'🧬'},
    {cmd:'/research', label:'启动 autoresearch (/research <args>)', icon:'🔬'},
  ], []);

  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [
      ...VIEWS.map(v => ({...v, kind:'view',  search: `${v.id} ${v.label}`.toLowerCase()})),
      ...Object.keys(agents || {}).map(n => {
        const meta = getAgentMeta(n);
        return {id:n, kind:'agent', label:`${meta.label} · ${meta.desc}`, icon: meta.icon,
                search: `${n} ${meta.label} ${meta.desc} agent`.toLowerCase()};
      }),
      ...SLASH.map(s => ({...s, kind:'slash', id: s.cmd, label: s.label, search: s.cmd.toLowerCase()})),
    ];
    if (!q) return all.slice(0, 30);
    return all.filter(it => it.search.includes(q)).slice(0, 30);
  }, [query, agents, VIEWS, SLASH]);

  React.useEffect(() => {
    if (open) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 40); }
  }, [open]);

  React.useEffect(() => { setSelected(0); }, [query]);

  const runItem = (it) => {
    if (!it) return;
    if (it.kind === 'view') onNavigate && onNavigate(it.id);
    else if (it.kind === 'agent') {
      // Jump to chat with this agent as the default target
      onNavigate && onNavigate('chat');
      if (window.__setChatTarget) window.__setChatTarget(it.id === 'orchestrator' ? 'manager' : it.id);
    }
    else if (it.kind === 'slash') onRunSlash && onRunSlash(it.cmd);
    onClose && onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose && onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter')     { e.preventDefault(); runItem(items[selected]); }
  };

  if (!open) return null;
  return (
    <div onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] animate-fade-in">
      <div onClick={e=>e.stopPropagation()}
        className="w-[92%] max-w-lg bg-surface-1 border border-border-light rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center px-4 py-3 border-b border-border">
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={onKeyDown}
            placeholder="搜索视图 / agent / slash 命令..."
            className="flex-1 ml-3 bg-transparent outline-none text-[14px] text-zinc-100 placeholder-zinc-600" />
          <span className="text-[10px] text-zinc-600 bg-surface-3 rounded px-1.5 py-0.5">ESC</span>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-1">
          {items.length === 0 && (
            <div className="text-[12px] text-zinc-600 py-4 text-center">无匹配项</div>
          )}
          {items.map((it, i) => (
            <button key={it.kind + ':' + it.id}
              onClick={() => runItem(it)}
              onMouseEnter={() => setSelected(i)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left text-[13px] transition
                ${i === selected ? 'bg-brand-600/15 text-brand-300' : 'text-zinc-300 hover:bg-surface-2'}`}>
              <span className="text-lg w-6 text-center">{it.icon}</span>
              <span className="flex-1 min-w-0 truncate">{it.label}</span>
              <span className="text-[10px] text-zinc-600 flex-shrink-0 uppercase">{it.kind}</span>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-border/40 text-[10px] text-zinc-600 flex items-center justify-between">
          <span>↑↓ 选择 · ⏎ 打开 · ESC 关闭</span>
          <span>⌘K 随时唤出</span>
        </div>
      </div>
    </div>
  );
}


// F5 — Notification center drawer.
// Pulls /api/notifications every 30s. The bell icon shows a red-dot
// badge when there's any critical/warn item. Clicking opens a drawer
// with the per-item cards; each has a link_to the relevant view.
function NotificationCenter({onNavigate}) {
  const [items, setItems] = React.useState([]);
  const [critical, setCritical] = React.useState(0);
  const [warn, setWarn] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef(null);

  const load = React.useCallback(async () => {
    try {
      const r = await apiGet('/api/notifications?limit=20');
      if (r && !r.error) {
        setItems(r.items || []);
        setCritical(r.critical || 0);
        setWarn(r.warn || 0);
      }
    } catch (e) { /* silent */ }
  }, []);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  React.useEffect(() => {
    const h = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const totalFlagged = critical + warn;
  const dotColor = critical > 0 ? 'bg-red-500' : (warn > 0 ? 'bg-amber-400' : '');

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen(!open)} aria-label="通知中心"
        className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-surface-2 hover:bg-surface-3 border border-border hover:border-border-light transition">
        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {totalFlagged > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full ${dotColor} text-[9px] text-white font-bold flex items-center justify-center`}>
            {totalFlagged > 9 ? '9+' : totalFlagged}
          </span>
        )}
      </button>
      {open && (
        // 通知中心在左侧 NavRail footer — popup 必须向右展开 (left-full + 偏移),
        // 否则 right-0 让 320px 宽 popup 飞到屏幕外。bottom-0 让其顶部对齐铃铛底部往上。
        // 用内联 style 强制纯色背景, 不依赖 tailwind class (某些主题 filter/glass 父级会让 bg-* 显得透明).
        <div
          className="absolute left-full bottom-0 ml-2 w-80 max-h-[480px] overflow-y-auto border border-border-light rounded-xl shadow-2xl z-[100] animate-scale-in"
          style={{ backgroundColor: '#16161d', boxShadow: '0 20px 50px -10px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.06)' }}
        >
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <span className="text-[12px] font-medium text-zinc-300">通知中心</span>
            <div className="flex items-center gap-2 text-[10px]">
              {critical > 0 && <span className="text-red-400">{critical} 紧急</span>}
              {warn > 0 && <span className="text-amber-400">{warn} 警告</span>}
              <button onClick={load} className="text-zinc-500 hover:text-zinc-300" title="刷新">↻</button>
            </div>
          </div>
          {items.length === 0 ? (
            <div className="px-3 py-6 text-center text-[12px] text-zinc-600">一切正常 ✓</div>
          ) : (
            <div className="divide-y divide-border/40">
              {items.map((it, i) => {
                const sevCls = it.severity === 'critical' ? 'border-l-red-500' :
                               it.severity === 'warn' ? 'border-l-amber-400' : 'border-l-brand-500/40';
                return (
                  <button key={i}
                    onClick={() => {
                      if (it.link_to && onNavigate) {
                        onNavigate(it.link_to);
                        setOpen(false);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 border-l-2 ${sevCls} hover:bg-surface-2 transition`}>
                    <div className="text-[12px] text-zinc-300 break-all">{it.text}</div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">
                      {it.ts ? new Date(it.ts * 1000).toLocaleTimeString('zh-CN') : ''}
                      {' · '}{it.kind}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function NavRail({currentView, onViewChange, agents, user, onLogout, splitView, onToggleSplit}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const activeCount = Object.values(agents).filter(a=>a.status==='online'||a.status==='slow').length;
  const totalCount = Object.keys(agents).filter(n=>agents[n].status!=='sleeping').length;

  const navItems = [
    {id:'dashboard',icon:<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="4" rx="2"/><rect x="14" y="11" width="7" height="10" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></svg>,label:'概览'},
    {id:'_sep1'},
    {id:'market',icon:<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,label:'行情'},
    {id:'quant',icon:<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-8"/></svg>,label:'量化'},
    {id:'intraday',icon:<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,label:'盘中'},
    {id:'news',icon:<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2z"/></svg>,label:'新闻'},
    {id:'tasks',icon:<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,label:'任务'},
  ];

  const collapseBtn = <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    {collapsed
      ? <path d="M9 18l6-6-6-6"/>
      : <path d="M15 18l-6-6 6-6"/>}
  </svg>;

  const moreNavGroups = [
    {
      label: '研究',
      items: [
        {id:'intraday',   label:'盘中',    emoji:'⏱️'},
        {id:'news',       label:'新闻',    emoji:'📰'},
        {id:'tasks',      label:'任务',    emoji:'✅'},
      ],
    },
  ];
  const moreItemIds = moreNavGroups.flatMap(g => g.items.map(i => i.id));
  const isMoreActive = moreItemIds.includes(currentView);

  const mobilePrimaryItems = [
    {id:'dashboard',label:'首页',icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="4" rx="2"/><rect x="14" y="11" width="7" height="10" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></svg>},
    {id:'news',    label:'新闻',icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2z"/></svg>},
    {id:'market',  label:'行情',icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>},
    {id:'quant',   label:'量化',icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-8"/></svg>},
  ];

  return (<>
    {/* Mobile bottom tab bar */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-0/95 backdrop-blur-xl border-t border-border" style={{height:'56px',paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
      <div className="flex items-center h-full">
        {mobilePrimaryItems.map(v => {
          const isActive = currentView === v.id;
          return (
            <button key={v.id} onClick={() => onViewChange(v.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all ${isActive ? 'text-brand-400' : 'text-zinc-500 active:text-zinc-300'}`}>
              <span className={`transition-transform ${isActive ? 'scale-110' : ''}`}>{v.icon}</span>
              <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-brand-400' : ''}`}>{v.label}</span>
              {isActive && <span className="absolute bottom-1 w-6 h-0.5 bg-brand-500 rounded-full"></span>}
            </button>
          );
        })}
        {/* 更多 button */}
        <button onClick={() => setMoreOpen(true)}
          className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all ${isMoreActive ? 'text-brand-400' : 'text-zinc-500 active:text-zinc-300'}`}>
          <svg className={`w-5 h-5 transition-transform ${isMoreActive ? 'scale-110' : ''}`} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
          </svg>
          <span className={`text-[10px] font-medium leading-none ${isMoreActive ? 'text-brand-400' : ''}`}>更多</span>
          {isMoreActive && <span className="absolute bottom-1 w-6 h-0.5 bg-brand-500 rounded-full"></span>}
        </button>
      </div>
    </div>

    {/* More sheet overlay */}
    {moreOpen && (
      <div className="md:hidden fixed inset-0 z-[200]">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
        <div className="absolute bottom-0 left-0 right-0 bg-surface-1 rounded-t-3xl shadow-2xl overflow-hidden" style={{maxHeight:'80vh',paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-zinc-600" />
          </div>
          {/* Title bar */}
          <div className="flex items-center justify-between px-5 py-2.5">
            <span className="text-base font-semibold text-white">更多功能</span>
            <button onClick={() => setMoreOpen(false)}
              className="w-7 h-7 rounded-full bg-surface-3 border border-border flex items-center justify-center text-zinc-400 hover:text-white active:scale-90 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          {/* Scrollable content */}
          <div className="overflow-y-auto px-5 pb-8" style={{maxHeight:'calc(80vh - 72px)'}}>
            {moreNavGroups.map((group, gi) => (
              <div key={group.label} className={gi > 0 ? 'mt-6' : 'mt-1'}>
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-0.5">{group.label}</div>
                <div className="grid grid-cols-4 gap-y-5 gap-x-2">
                  {group.items.map(item => {
                    const isAct = currentView === item.id;
                    return (
                      <button key={item.id}
                        onClick={() => { onViewChange(item.id); setMoreOpen(false); }}
                        className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] shadow-sm transition-all ${isAct ? 'bg-brand-600/25 ring-2 ring-brand-500/50' : 'bg-surface-3 border border-border'}`}>
                          {item.emoji}
                        </div>
                        <span className={`text-[11px] font-medium text-center leading-tight ${isAct ? 'text-brand-400' : 'text-zinc-400'}`}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* Desktop NavRail */}
    <div className={`hidden md:flex ${collapsed ? 'w-[52px]' : 'w-[160px]'} h-full bg-surface-0 border-r border-border flex-col py-3 flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]`}>
      <div className={`flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-3'} mb-3`}>
        <div className="w-8 h-8 rounded-xl bg-brand-600/20 flex items-center justify-center cursor-pointer hover:bg-brand-600/30 transition-all duration-200 flex-shrink-0 hover:shadow-[0_0_12px_rgba(99,102,241,.2)] overflow-hidden"
          onClick={()=>onViewChange('dashboard')}>
          <img src="static/favicon.ico" alt="RR" className="w-6 h-6 rounded-md object-cover" />
        </div>
        {!collapsed && <span className="text-xs font-bold text-brand-400 tracking-wide">RR-Agent</span>}
        <button onClick={()=>setCollapsed(!collapsed)}
          className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-all duration-200 rounded-lg hover:bg-surface-2 flex-shrink-0">
          {collapseBtn}
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 w-full px-1.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(v => {
          if (v.id.startsWith('_sep')) return (
            <div key={v.id} className={`${collapsed ? 'mx-2' : 'mx-1'} border-t border-border/40 my-1.5`}></div>
          );
          const isActive = currentView === v.id;
          const baseClass = `nav-item group flex items-center rounded-xl cursor-pointer
            ${isActive ? 'active bg-brand-600/15 text-brand-400 font-medium' : 'text-zinc-500 hover:text-zinc-200'}
            ${collapsed ? 'w-9 h-9 justify-center mx-auto' : 'h-9 px-2.5 gap-2.5'}`;
          const inner = (Tag, extra) => (
            <Tag key={v.id} {...extra} className={baseClass + (Tag === 'a' ? ' no-underline' : '')}>
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>{v.icon}</span>
              {!collapsed && <span className="text-[12px] truncate">{v.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2.5 py-1 bg-surface-4 text-zinc-200 text-[11px] font-medium rounded-lg shadow-xl border border-border-light opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                  {v.label}
                </span>
              )}
            </Tag>
          );
          if (v.href) return inner('a', {href:v.href, target:'_blank', rel:'noopener'});
          return inner('button', {onClick:()=>onViewChange(v.id)});
        })}
      </nav>

      <div className={`flex ${collapsed ? 'flex-col items-center gap-2' : 'flex-col gap-2 px-3'} mt-2 pt-2.5 border-t border-border/40`}>
        {onToggleSplit && (
          <button onClick={onToggleSplit} title={splitView ? '关闭分屏' : '开启分屏'}
            className={`flex items-center justify-center gap-1.5 ${collapsed ? 'w-8 h-8' : 'w-full py-1.5 px-2'} rounded-lg text-[10px] transition-all ${splitView ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'bg-surface-2 text-zinc-500 border border-border hover:border-border-light hover:text-zinc-300'}`}>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
            {!collapsed && <span>{splitView ? '分屏' : '分屏'}</span>}
          </button>
        )}
        {/* F5 — notification center (desktop rail footer) */}
        <div className={collapsed ? 'flex justify-center' : ''}>
          <NotificationCenter onNavigate={(path) => {
            // Trivial path-to-view mapping; handles /dashboard /quant /system...
            const view = path.split('?')[0].replace(/^\//, '') || 'dashboard';
            onViewChange(view);
          }} />
        </div>
        <div className={`flex ${collapsed ? 'flex-col items-center gap-2' : 'flex-row items-center justify-between'}`}>
          {collapsed ? (
            <>
              <div className="text-[9px] text-zinc-600 font-medium tabular-nums">{activeCount}/{totalCount}</div>
              <div className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.4)] pulse-ring text-emerald-400' : 'bg-zinc-600'}`}></div>
              {user && <UserMenu user={user} onLogout={onLogout} onViewChange={onViewChange} />}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-surface-2/50 rounded-lg px-2 py-1">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeCount > 0 ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,.5)]' : 'bg-zinc-600'}`}></div>
                <span className="text-[10px] text-zinc-500 tabular-nums font-medium">{activeCount}/{totalCount} 在线</span>
              </div>
              {user && <UserMenu user={user} onLogout={onLogout} onViewChange={onViewChange} />}
            </>
          )}
        </div>
      </div>
    </div>
  </>);
}
