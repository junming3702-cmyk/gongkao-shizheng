"use client";

import { useMemo, useState } from "react";

type Source = "全部来源" | "学习强国" | "求是" | "半月谈" | "公考机构" | "B站笔记";
type View = "latest" | "focus" | "review";
const months = ["08月", "07月", "06月", "05月", "04月", "03月"];
const entries = [
  { date: "08.16", source: "求是", tag: "理论学习", title: "把全面深化改革推向纵深：进一步全面深化改革的时代要求", summary: "围绕中国式现代化这一主题，梳理改革发展稳定的新要求，适合积累申论文章的时代背景与政策表述。", topics: ["全面深化改革", "中国式现代化"], focus: true, review: false },
  { date: "08.15", source: "学习强国", tag: "政策动向", title: "培育和发展新质生产力，推动高质量发展取得新成效", summary: "从科技创新、产业升级和人才支撑三个层面理解新质生产力，关注常识判断与申论热点表达。", topics: ["新质生产力", "高质量发展"], focus: true, review: true },
  { date: "08.14", source: "半月谈", tag: "社会治理", title: "基层治理如何把‘民生小事’办成‘暖心实事’", summary: "以基层服务案例切入，提炼为民服务、调查研究和治理效能的答题素材。", topics: ["基层治理", "为民服务"], focus: true, review: false },
  { date: "08.12", source: "公考机构", tag: "考点提炼", title: "八月时政高频考点速记：从关键词到命题角度", summary: "公考资料占位条目：后续接入机构资料后，将自动拆分关键词、重要会议与易错点。", topics: ["月度盘点", "常识判断"], focus: false, review: true },
  { date: "08.10", source: "B站笔记", tag: "学习笔记", title: "公考时政学习笔记：如何建立自己的热点素材库", summary: "用户笔记占位条目：保留视频链接与UP主信息，提炼学习方法，不替代权威原文。", topics: ["复习方法", "素材积累"], focus: false, review: false },
];
const sourceColors: Record<string, string> = { 求是: "green", 学习强国: "blue", 半月谈: "orange", 公考机构: "purple", B站笔记: "pink" };

export default function Home() {
  const [source, setSource] = useState<Source>("全部来源");
  const [query, setQuery] = useState("");
  const [activeMonth, setActiveMonth] = useState("08月");
  const [view, setView] = useState<View>("latest");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestStatus, setSuggestStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const filteredEntries = useMemo(() => entries.filter((entry) => {
    const matchesSource = source === "全部来源" || entry.source === source;
    const matchesView = view === "latest" || (view === "focus" ? entry.focus : entry.review);
    return matchesSource && matchesView && `${entry.title} ${entry.summary} ${entry.topics.join(" ")}`.toLowerCase().includes(query.toLowerCase());
  }), [query, source, view]);

  async function submitSuggestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuggestStatus("");
    const form = event.currentTarget;
    const fields = new FormData(form);

    // GitHub Pages is the public fallback when chatgpt.site is unavailable.
    // It has no server runtime, so suggestions become pre-filled GitHub issues.
    if (window.location.hostname.endsWith("github.io")) {
      const type = String(fields.get("type") || "建议");
      const title = String(fields.get("title") || "");
      const content = String(fields.get("content") || "");
      const sourceUrl = String(fields.get("sourceUrl") || "");
      const contact = String(fields.get("contact") || "");
      const body = [
        `提交类型：${type}`,
        "",
        "具体内容：",
        content,
        sourceUrl ? `\n资料来源：${sourceUrl}` : "",
        contact ? `\n联系方式：${contact}` : "",
      ].filter(Boolean).join("\n");
      const issueUrl = new URL("https://github.com/junming3702-cmyk/gongkao-shizheng/issues/new");
      issueUrl.searchParams.set("title", `[${type}] ${title}`);
      issueUrl.searchParams.set("body", body);
      window.open(issueUrl.toString(), "_blank", "noopener,noreferrer");
      setSuggestStatus("已打开 GitHub 建议页面，确认后即可提交。");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fields.entries())),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "提交失败，请稍后重试。");
      form.reset();
      setSuggestStatus("感谢补充！内容已收到，我们会核验后整理入库。");
    } catch (error) {
      setSuggestStatus(error instanceof Error ? error.message : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="site-shell">
    <header className="topbar"><div className="brand-lockup"><span className="brand-mark">政</span><span>时政<span className="brand-muted"> · 公考资料库</span></span></div><nav className="topnav" aria-label="主导航"><a className="active" href="#monthly">月度汇总</a><a href="#topics">专题考点</a><a href="#sources">来源管理</a></nav><button className="top-action" onClick={() => { setSuggestStatus(""); setSuggestOpen(true); }}>＋ 补充资料 / 建议</button></header>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">CURRENT AFFAIRS · 2026</p><h1>把每天的时政，<br /><em>变成可复习的知识。</em></h1><p className="hero-sub">按月收集、整理与提炼公考时政信息。<br />从权威原文，到可以直接带进考场的答题素材。</p></div><div className="hero-note"><span className="note-label">本月收录</span><strong>24</strong><span>条信息</span><div className="note-line" /><small>持续更新中 · 最后更新 08.16</small></div></section>
    <div className="content-grid">
      <aside className="month-nav" aria-label="月份导航"><div className="section-kicker">按月浏览</div><div className="year-label">2026 年</div>{months.map((month, i) => <button key={month} onClick={() => setActiveMonth(month)} className={`month-item ${activeMonth === month ? "selected" : ""}`}><span>{month}</span><span className="month-count">{[24,31,28,35,22,26][i]}</span></button>)}<button className="all-months">查看全部月份 <span>↗</span></button><div className="side-divider" /><div className="section-kicker">资料组成</div><div className="mini-stat"><span>官方权威来源</span><b>62%</b></div><div className="mini-stat"><span>考点提炼</span><b>25%</b></div><div className="mini-stat"><span>学习笔记</span><b>13%</b></div></aside>
      <section className="feed" id="monthly"><div className="feed-heading"><div><div className="section-kicker">MONTHLY DIGEST</div><h2>{activeMonth}时政汇总</h2></div><div className="feed-tools"><label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索标题、关键词..." aria-label="搜索标题和关键词" /></label><select value={source} onChange={(e) => setSource(e.target.value as Source)} aria-label="按来源筛选"><option>全部来源</option><option>学习强国</option><option>求是</option><option>半月谈</option><option>公考机构</option><option>B站笔记</option></select></div></div><div className="filter-row"><span>{filteredEntries.length} 条资料</span><button onClick={() => setView("latest")} className={`filter-pill ${view === "latest" ? "active" : ""}`}>最新收录</button><button onClick={() => setView("focus")} className={`filter-pill ${view === "focus" ? "active" : ""}`}>重点考点</button><button onClick={() => setView("review")} className={`filter-pill ${view === "review" ? "active" : ""}`}>待复习</button></div><div className="entry-list">{filteredEntries.map((entry) => <article className="entry-card" key={entry.title}><div className="entry-date">{entry.date}<span>2026</span></div><div className="entry-main"><div className="entry-meta"><span className={`source-dot ${sourceColors[entry.source]}`} />{entry.source}<span className="meta-sep">/</span><span>{entry.tag}</span></div><h3>{entry.title}</h3><p>{entry.summary}</p><div className="topic-row">{entry.topics.map((topic) => <span key={topic}># {topic}</span>)}</div></div><button className="entry-arrow" aria-label={`查看${entry.title}`}>↗</button></article>)}{filteredEntries.length === 0 && <div className="empty-state">没有找到匹配资料，试试更换关键词或来源。</div>}</div></section>
      <aside className="right-rail" id="topics"><div className="rail-card focus-card"><div className="section-kicker">本月重点</div><h2>三个值得<br /><em>反复咀嚼</em>的考点</h2><div className="focus-item"><span>01</span><div><b>新质生产力</b><p>高质量发展 · 科技创新</p></div></div><div className="focus-item"><span>02</span><div><b>基层治理现代化</b><p>为民服务 · 治理效能</p></div></div><div className="focus-item"><span>03</span><div><b>进一步全面深化改革</b><p>中国式现代化 · 制度优势</p></div></div><button className="text-link">进入专题复习 <span>→</span></button></div><div className="rail-card source-card" id="sources"><div className="section-kicker">来源池</div><h3>可信，也好用。</h3><p>官方原文与学习资料分层管理，建立清晰的复习依据。</p><div className="source-line"><i className="source-dot green" />求是 <span>已接入</span></div><div className="source-line"><i className="source-dot blue" />学习强国 <span>已接入</span></div><div className="source-line"><i className="source-dot orange" />半月谈 <span>待补充</span></div><div className="source-line"><i className="source-dot pink" />B站笔记 <span>待核验</span></div></div></aside>
    </div><footer className="footer"><span>时政 · 公考资料库</span><button className="footer-suggest" onClick={() => { setSuggestStatus(""); setSuggestOpen(true); }}>提交资料或建议</button><span>© 2026</span></footer>
    {suggestOpen && <div className="suggest-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSuggestOpen(false); }}>
      <section className="suggest-dialog" role="dialog" aria-modal="true" aria-labelledby="suggest-title">
        <button className="suggest-close" onClick={() => setSuggestOpen(false)} aria-label="关闭建议窗口">×</button>
        <p className="section-kicker">CONTRIBUTE</p>
        <h2 id="suggest-title">一起完善这份时政资料库</h2>
        <p className="suggest-intro">欢迎补充权威资料链接、指出内容错误，或告诉我们你希望增加的功能。</p>
        <form className="suggest-form" onSubmit={submitSuggestion}>
          <label>提交类型<select name="type" required defaultValue="资料补充"><option>资料补充</option><option>内容纠错</option><option>功能建议</option><option>其他要求</option></select></label>
          <label>标题<input name="title" required minLength={2} maxLength={120} placeholder="用一句话概括你的建议" /></label>
          <label className="full-field">具体内容<textarea name="content" required minLength={5} maxLength={3000} rows={6} placeholder="请说明资料内容、需要修改之处或希望实现的功能" /></label>
          <label>资料来源链接（选填）<input name="sourceUrl" type="url" maxLength={500} placeholder="https://" /></label>
          <label>联系方式（选填）<input name="contact" maxLength={200} placeholder="邮箱或其他联系方式" /></label>
          <label className="website-trap" aria-hidden="true">网站<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <div className="suggest-actions"><span className={`suggest-status ${suggestStatus.startsWith("感谢") ? "success" : ""}`} aria-live="polite">{suggestStatus}</span><button type="submit" disabled={submitting}>{submitting ? "提交中…" : "提交建议"}</button></div>
        </form>
      </section>
    </div>}
  </main>;
}
