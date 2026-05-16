"use client";
import { useState } from "react";
import styles from "./page.module.css";

const ITEMS = [
  { id: "uccaron", label: "উচ্চারণ",         icon: "🔊", color: "#f87171" },
  { id: "pod",     label: "পদ/শব্দশ্রেণি",    icon: "📝", color: "#34d399" },
  { id: "prokrti", label: "প্রকৃতি-প্রত্যয়", icon: "🔤", color: "#60a5fa" },
  { id: "somas",   label: "সমাস",              icon: "🔗", color: "#a78bfa" },
  { id: "karok",   label: "কারক ও বিভক্তি",   icon: "⚙️", color: "#fbbf24" },
  { id: "bakko",   label: "বাক্য বিশ্লেষণ",   icon: "📐", color: "#f472b6" },
  { id: "banan",   label: "বানান শুদ্ধি",      icon: "✅", color: "#2dd4bf" },
];

const EXAMPLES = ["নদীমাতৃক", "বিদ্যালয়", "আমি বাংলায় গান গাই", "আবৃত্তি", "সংশপ্তক"];

export default function Home() {
  const [text, setText]       = useState("");
  const [sel, setSel]         = useState(ITEMS.map(i => i.id));
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [last, setLast]       = useState("");
  const [screen, setScreen]   = useState("home");

  const toggle = (id) =>
    setSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const run = async () => {
    if (!text.trim() || sel.length === 0) return;
    setLoading(true); setErr(""); setResults(null); setScreen("result");
    const labels = ITEMS.filter(i => sel.includes(i.id)).map(i => i.label).join(", ");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: text.trim(), labels }),
      });
      const data = await res.json();
      if (data.error) { setErr(data.error); setLoading(false); return; }
      setResults(data.results);
      setLast(text.trim());
    } catch (e) {
      setErr("সমস্যা হয়েছে: " + e.message);
    }
    setLoading(false);
  };

  const goHome = () => { setScreen("home"); setResults(null); setErr(""); };

  return (
    <div className={styles.app}>
      {/* TOPBAR */}
      <div className={styles.topbar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>📚</div>
          <div>
            <div className={styles.logoText}>ব্যাকরণ বিশ্লেষক</div>
            <div className={styles.logoSub}>HSC বাংলা · Web-Powered</div>
          </div>
        </div>
        {screen !== "home" && !loading && (
          <button className={styles.backBtn} onClick={goHome}>← নতুন অনুসন্ধান</button>
        )}
      </div>

      {/* HOME */}
      {screen === "home" && (
        <div className={styles.home}>
          <div className={styles.hero}>
            <h1>যেকোনো শব্দ বা বাক্য দাও</h1>
            <p>Web search ব্যবহার করে নির্ভুল ব্যাকরণ উত্তর পাবে</p>
          </div>

          <div className={styles.searchBox}>
            <div className={styles.searchLabel}>শব্দ বা বাক্য লেখো</div>
            <textarea
              className={styles.searchInput}
              rows={2}
              placeholder="যেমন: নদীমাতৃক, আমি বাংলায় গান গাই..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(); } }}
            />
          </div>

          <div>
            <div className={styles.sectionTitle}><span>উদাহরণ</span></div>
            <div className={styles.examples}>
              {EXAMPLES.map(ex => (
                <button key={ex} className={styles.exBtn} onClick={() => setText(ex)}>{ex}</button>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.sectionTitle}>
              <span>বিষয় নির্বাচন করো</span>
              <button className={styles.selAll}
                onClick={() => setSel(sel.length === ITEMS.length ? [] : ITEMS.map(i => i.id))}>
                {sel.length === ITEMS.length ? "বাতিল সব" : "সব নির্বাচন"}
              </button>
            </div>
            <div className={styles.chips}>
              {ITEMS.map(item => (
                <button key={item.id}
                  className={`${styles.chip} ${sel.includes(item.id) ? styles.chipOn : ""}`}
                  style={sel.includes(item.id) ? { borderColor: item.color, color: item.color } : {}}
                  onClick={() => toggle(item.id)}>
                  <span>{item.icon}</span><span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button className={styles.runBtn} onClick={run}
            disabled={!text.trim() || sel.length === 0}>
            🔍 বিশ্লেষণ করো
          </button>
        </div>
      )}

      {/* LOADING */}
      {screen === "result" && loading && (
        <div className={styles.loadingScreen}>
          <div className={styles.loadingIcon}>🌐</div>
          <div className={styles.loadingText}>
            Web search করা হচ্ছে...<br />
            <span className={styles.loadingWord}>"{text}"</span>
          </div>
          <div className={styles.progressBar}><div className={styles.progressFill} /></div>
          <div className={styles.loadingSub}>বাংলা একাডেমি · NCTB · মুনীর চৌধুরী</div>
        </div>
      )}

      {/* ERROR */}
      {screen === "result" && !loading && err && (
        <div className={styles.errorScreen}>
          <div className={styles.errBox}>⚠️ {err}</div>
          <button className={styles.runBtn} onClick={run}>আবার চেষ্টা করো</button>
        </div>
      )}

      {/* RESULTS */}
      {screen === "result" && !loading && results && (
        <div className={styles.resultScreen}>
          <div className={styles.resultHeader}>
            <div className={styles.resultWord}>"{last}"</div>
            <div className={styles.resultMeta}>
              <span className={styles.webBadge}>🌐 Web Search</span>
              <span>{results.length}টি বিষয় বিশ্লেষণ</span>
            </div>
          </div>
          <div className={styles.resultsList}>
            {results.map((r, i) => {
              const info = ITEMS.find(g => r.item.includes(g.label) || g.label.includes(r.item)) || {};
              const col  = info.color || "#a78bfa";
              return (
                <div key={i} className={styles.rcard}
                  style={{ borderLeftColor: col, animationDelay: `${i * 0.08}s` }}>
                  <div className={styles.rcardHeader}>
                    <div className={styles.rcardLabel} style={{ color: col }}>
                      <span>{info.icon || "📌"}</span><span>{r.item}</span>
                    </div>
                    <div className={styles.rcardSrc}>{r.source || "NCTB / বাংলা একাডেমি"}</div>
                  </div>
                  <div className={styles.rcardAnswer}>{r.answer}</div>
                </div>
              );
            })}
            <div style={{ height: 30 }} />
          </div>
        </div>
      )}
    </div>
  );
}
