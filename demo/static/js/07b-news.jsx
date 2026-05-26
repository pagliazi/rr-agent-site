function NewsView() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sumLoading, setSumLoading] = useState(false);
  const toast = useContext(ToastContext);

  const loadNews = async (kw) => {
    setLoading(true);
    try {
      const q = kw ? '?keyword=' + encodeURIComponent(kw) : '';
      const r = await apiGet('/api/news' + q);
      if (r && !r.error) { setItems(r.items || []); if (r.raw && !r.items?.length) setSummary(r.raw); }
    } catch(e) { toast('加载新闻失败','error'); }
    setLoading(false);
  };
  const loadSummary = async () => {
    setSumLoading(true);
    try {
      const r = await apiGet('/api/news/summary');
      if (r && !r.error) setSummary(r.summary || '');
    } catch(e) { toast('生成摘要失败','error'); }
    setSumLoading(false);
  };

  useEffect(() => { loadNews(''); }, []);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">新闻资讯</h1>
        <div className="flex gap-2">
          <button onClick={loadSummary} disabled={sumLoading} className="btn px-3 py-1.5 bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 rounded-lg text-[12px] transition disabled:opacity-50">{sumLoading ? 'AI 分析中...' : 'AI 摘要'}</button>
          <button onClick={() => loadNews(keyword)} className="btn px-3 py-1.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-[12px] text-zinc-400 border border-border hover:border-border-light transition">刷新</button>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <input value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key==='Enter' && loadNews(keyword)} placeholder="搜索关键词..." className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-brand-500/40 transition placeholder-zinc-600" />
      </div>
      {summary && <Card><h3 className="text-sm font-semibold text-zinc-200 mb-2">AI 新闻摘要</h3><pre className="text-[13px] text-zinc-300 whitespace-pre-wrap leading-relaxed">{summary}</pre></Card>}
      {loading ? <Card><div className="flex items-center gap-2 py-8 justify-center"><Spinner /><span className="text-zinc-500 text-sm">加载中...</span></div></Card>
        : items.length > 0 ? (
          <div className="space-y-3">{items.map((item, i) => (
            <Card key={i}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-zinc-200 mb-1">{item.title || '无标题'}</h3>
                  <p className="text-[12px] text-zinc-400 line-clamp-2">{item.summary || item.content || ''}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-600">
                    {item.source && <span>{item.source}</span>}
                    {item.time && <span>{item.time}</span>}
                    {item.url && <a href={item.url} target="_blank" rel="noopener" className="text-brand-400 hover:text-brand-300 no-underline">查看原文</a>}
                  </div>
                </div>
              </div>
            </Card>
          ))}</div>
        ) : !summary && <Card><div className="text-center py-8 text-zinc-600 text-sm">暂无新闻数据，请尝试搜索或刷新</div></Card>
      }
    </div>
  );
}


// ── Tools View ──────────────────────────────────────

