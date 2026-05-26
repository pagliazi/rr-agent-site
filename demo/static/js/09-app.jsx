// ── App ──────────────────────────────────────────────

function App() {
  const [authUser, setAuthUser] = useState({username:'demo', display_name:'演示访客', role:'viewer'});
  const [authChecked, setAuthChecked] = useState(true);
  const [agents, setAgents] = useState({});
  const [channels, setChannels] = useState({});
  const [runtimeInfo, setRuntimeInfo] = useState({});
  const [currentView, setCurrentView] = useState('dashboard');
  const [chatTarget, setChatTarget] = useState('manager');
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [splitPanel, setSplitPanel] = useState('system');
  const [tokenSession, setTokenSession] = useState(() => createTokenSession());
  const [activeToolCalls, setActiveToolCalls] = useState([]);
  const [thinkingText, setThinkingText] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pendingSend = useRef(null);

  // F9 — expose a tiny hook so CommandPalette can switch chatTarget.
  useEffect(() => {
    window.__setChatTarget = (t) => setChatTarget(t);
    return () => { window.__setChatTarget = null; };
  }, []);

  // F9 — global Cmd+K / Ctrl+K to open the command palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen(p => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // F11 — restore persisted theme on boot.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rragent_theme') || 'dark';
      const html = document.documentElement;
      html.classList.remove('theme-light', 'theme-hc');
      if (saved === 'light') html.classList.add('theme-light');
      else if (saved === 'hc') html.classList.add('theme-hc');
    } catch (e) { /* noop */ }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthChecked(true); return; }
    fetch('/api/auth/me', {headers:{'Authorization':'Bearer '+token}})
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && data.username) setAuthUser(data); else setToken(''); })
      .catch(() => setToken(''))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    window.__onAuthExpired = () => { setToken(''); setAuthUser(null); };
    return () => { window.__onAuthExpired = null; };
  }, []);

  const handleLogin = useCallback((token, user) => {
    setToken(token);
    setAuthUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentView('dashboard');
  }, []);

  const handleUpdateUser = useCallback((updated) => {
    setAuthUser(prev => ({...prev, ...updated}));
  }, []);

  const [conversations, setConversations] = useState(() => {
    try { const s = localStorage.getItem('rragent_convs_v2'); return s ? JSON.parse(s) : []; } catch(e) { return []; }
  });
  const [activeConvId, setActiveConvId] = useState(() => {
    try { return localStorage.getItem('rragent_active_conv') || ''; } catch(e) { return ''; }
  });

  useEffect(() => {
    try { localStorage.setItem('rragent_convs_v2', JSON.stringify(conversations)); } catch(e) {}
  }, [conversations]);

  useEffect(() => {
    try { localStorage.setItem('rragent_active_conv', activeConvId); } catch(e) {}
  }, [activeConvId]);

  const activeMessages = useMemo(() => {
    const conv = conversations.find(c => c.id === activeConvId);
    return conv?.messages || [];
  }, [conversations, activeConvId]);

  const createConversation = useCallback((target) => {
    const id = genId();
    const conv = {id, title:'', target: target || chatTarget, messages:[], createdAt:Date.now(), updatedAt:Date.now()};
    setConversations(prev => [conv, ...prev]);
    setActiveConvId(id);
    return id;
  }, [chatTarget]);

  const handleNewConv = useCallback(() => {
    createConversation(chatTarget);
  }, [createConversation, chatTarget]);

  const handleSelectConv = useCallback((id) => {
    setActiveConvId(id);
    const conv = conversations.find(c => c.id === id);
    if (conv?.target) setChatTarget(conv.target);
  }, [conversations]);

  const handleDeleteConv = useCallback((id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConvId(remaining[0]?.id || '');
    }
  }, [activeConvId, conversations]);

  const refreshOverview = useCallback(async () => {
    try {
      const data = await apiGet('/api/overview');
      if (data && !data.error) {
        setAgents(data.agents||{});
        setChannels(data.channels||{});
        if (data.runtime) setRuntimeInfo(data.runtime);
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    refreshOverview();
    const i = setInterval(refreshOverview, 15000);
    return () => clearInterval(i);
  }, [refreshOverview]);

  const handleSend = useCallback(async (text) => {
    if (currentView !== 'chat') {
      pendingSend.current = text;
      setCurrentView('chat');
      return;
    }

    let convId = activeConvId;
    if (!convId || !conversations.find(c => c.id === convId)) {
      convId = createConversation(chatTarget);
    }

    let target = chatTarget;
    let actualText = text;
    const mentionMatch = text.match(/^@(\w+)\s+([\s\S]*)/);
    if (mentionMatch && CHAT_TARGETS[mentionMatch[1]]) {
      target = mentionMatch[1];
      actualText = mentionMatch[2];
    }

    const userMsg = {role:'user', content: text, ts:Date.now(), target: target};
    setConversations(prev => prev.map(c => c.id === convId ? {
      ...c,
      messages: [...c.messages, userMsg],
      title: c.title || text.slice(0, 30),
      updatedAt: Date.now(),
    } : c));
    setIsThinking(true);
    setActiveToolCalls([]);
    setThinkingText('');

    let fullContent = '';
    let source = target;
    const toolTimers = {};
    try {
      await streamChat(actualText, target, function(event) {
        if (event.type === 'chunk') fullContent += event.content;
        else if (event.type === 'thinking') {
          setThinkingText(prev => prev + (event.content || ''));
        }
        else if (event.type === 'tool_start') {
          toolTimers[event.name] = Date.now();
          setActiveToolCalls(prev => [...prev, {name: event.name, status: 'running', startTime: Date.now(), content: null, duration: null, progress: []}]);
        }
        else if (event.type === 'tool_progress') {
          // F2 — live heartbeats from long-running tools. Append to the
          // most recent running card for this name.
          setActiveToolCalls(prev => {
            // find last running card with this name
            for (let i = prev.length - 1; i >= 0; i--) {
              if (prev[i].name === event.name && prev[i].status === 'running') {
                const updated = [...prev];
                updated[i] = {...prev[i], progress: [...(prev[i].progress || []), {text: event.text || '', ts: Date.now()}]};
                return updated;
              }
            }
            return prev;
          });
        }
        else if (event.type === 'tool_result') {
          const elapsed = toolTimers[event.name] ? Date.now() - toolTimers[event.name] : null;
          setActiveToolCalls(prev => prev.map(tc =>
            tc.name === event.name && tc.status === 'running'
              ? {...tc, status: event.is_error ? 'error' : 'done', content: event.content || '', duration: elapsed}
              : tc
          ));
        }
        else if (event.type === 'usage') {
          setTokenSession(prev => updateTokenSession(prev, event));
        }
        else if (event.type === 'error') fullContent = event.content;
        if (event.source) source = event.source;
      });
    } catch (e) { fullContent = '网络错误: ' + e.message; }

    if (!fullContent) fullContent = '未收到回复，请检查 Agent 状态';
    const assistantMsg = {role:'assistant', content: fullContent, ts:Date.now(), source: source};
    setConversations(prev => prev.map(c => c.id === convId ? {
      ...c,
      messages: [...c.messages, assistantMsg],
      updatedAt: Date.now(),
    } : c));
    setIsThinking(false);
    setActiveToolCalls([]);
    setThinkingText('');
  }, [currentView, chatTarget, activeConvId, conversations, createConversation]);

  useEffect(() => {
    if (currentView === 'chat' && pendingSend.current) {
      const t = pendingSend.current;
      pendingSend.current = null;
      setTimeout(() => handleSend(t), 50);
    }
  }, [currentView, handleSend]);

  if (!authChecked) {
    return <div className="h-screen bg-surface-0 flex items-center justify-center"><Spinner size={8} /></div>;
  }

  if (!authUser) {
    return <ToastProvider><LoginPage onLogin={handleLogin} /></ToastProvider>;
  }

  const canWrite = authUser.role !== 'viewer';

  return (
    <ToastProvider>
      <AuthContext.Provider value={authUser}>
        {/* F12 — skip-to-content link for keyboard/screen-reader users */}
        <a href="#rragent-main" className="sr-only sr-only-focusable">跳转到主内容</a>
        {/* F9 — global command palette */}
        <CommandPalette open={paletteOpen} onClose={()=>setPaletteOpen(false)}
          agents={agents}
          onNavigate={(v)=>{ setCurrentView(v); if (v !== 'chat' && v !== 'dashboard') setSplitPanel(v); }}
          onRunSlash={(cmd)=>{ setCurrentView('chat'); pendingSend.current = cmd + ' '; }} />
        <div className="flex flex-col md:flex-row h-screen bg-surface-0 overflow-x-hidden max-w-[100vw]">
          <NavRail currentView={currentView} onViewChange={(v) => { setCurrentView(v); if (v !== 'chat' && v !== 'dashboard') setSplitPanel(v); }} agents={agents} user={authUser} onLogout={handleLogout} splitView={splitView} onToggleSplit={() => setSplitView(!splitView)} />
          <div className="flex-1 flex h-full min-w-0 pb-14 md:pb-0" key={currentView}>
            <>
              {currentView === 'dashboard' && <DashboardView agents={agents} channels={channels} runtimeInfo={runtimeInfo} onViewChange={setCurrentView} onSend={()=>{}} />}
              {currentView === 'market' && <MarketView />}
              {currentView === 'tasks' && <TasksView />}
              {currentView === 'quant' && <QuantView />}
              {currentView === 'intraday' && <IntradayView />}
              {currentView === 'news' && <NewsView />}
            </>
          </div>
        </div>
      </AuthContext.Provider>
    </ToastProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
