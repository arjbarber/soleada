import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Message {
  id: number;
  from: "teen" | "carlos" | "system";
  original?: string;
  corrected?: string;
  text: string;
  time: string;
  wasCorreected?: boolean;
}

// ─────────────────────────────────────────────
// GUARDRAIL ENGINE
// purely frontend, rule-based for demo
// ─────────────────────────────────────────────
function applyGuardrails(raw: string): { corrected: string; changed: boolean } {
  let text = raw.trim();
  const original = text;

  // 1. Strip informal openers and replace with formal salutation
  text = text
    .replace(/^(hiii+|hiiii*|hi+|hey+|heyyy*|hello+|sup|yo)\b[,!\s]*/i, "Dear Mr. Solis, ")
    .replace(/^(omg|omgg+|lol|lmao|lmfao|wtf|ngl)\b[,!\s]*/i, "");

  // 2. Normalize repeated letters: "youuuu" → "you", "sooo" → "so"
  text = text.replace(/([a-z])\1{2,}/gi, "$1$1").replace(/([a-z])\1{1,}/gi, (m, c) =>
    m.length > 2 ? c : m
  );

  // 3. Remove hearts, emojis, excessive punctuation
  text = text.replace(/[<]3|♥|❤|💕|💓|😍|🥰|😘|🙏|✨|💯|🔥|👀|😭|💀|🫶|❣/g, "");
  text = text.replace(/!{2,}/g, ".").replace(/\?{2,}/g, "?").replace(/\.{4,}/g, "...");

  // 4. Expand common contractions to formal
  const contractions: [RegExp, string][] = [
    [/\bi'm\b/gi, "I am"],
    [/\bcan't\b/gi, "cannot"],
    [/\bwon't\b/gi, "will not"],
    [/\bdon't\b/gi, "do not"],
    [/\bdoesn't\b/gi, "does not"],
    [/\bdidn't\b/gi, "did not"],
    [/\bwasn't\b/gi, "was not"],
    [/\bi've\b/gi, "I have"],
    [/\bi'll\b/gi, "I will"],
    [/\bi'd\b/gi, "I would"],
    [/\byou're\b/gi, "you are"],
    [/\bthey're\b/gi, "they are"],
    [/\bwe're\b/gi, "we are"],
    [/\bit's\b/gi, "it is"],
    [/\bthat's\b/gi, "that is"],
  ];
  contractions.forEach(([re, rep]) => { text = text.replace(re, rep); });

  // 5. Replace slang
  const slang: [RegExp, string][] = [
    [/\bu\b/gi, "you"],
    [/\bur\b/gi, "your"],
    [/\br\b/gi, "are"],
    [/\bbtw\b/gi, "by the way"],
    [/\bidk\b/gi, "I do not know"],
    [/\bimo\b/gi, "in my opinion"],
    [/\bfyi\b/gi, "for your information"],
    [/\basap\b/gi, "as soon as possible"],
    [/\bthx\b/gi, "thank you"],
    [/\bthanks\b/gi, "thank you"],
    [/\bpls\b/gi, "please"],
    [/\bplz\b/gi, "please"],
    [/\bngl\b/gi, "to be honest"],
    [/\bfr\b/gi, "honestly"],
    [/\blmk\b/gi, "please let me know"],
    [/\bwdym\b/gi, "what do you mean"],
    [/\bomg\b/gi, ""],
    [/\bslay\b/gi, "well done"],
    [/\bno cap\b/gi, "honestly"],
    [/\bkinda\b/gi, "somewhat"],
    [/\bgonna\b/gi, "going to"],
    [/\bwanna\b/gi, "would like to"],
    [/\bgotta\b/gi, "have to"],
    [/\byeah\b/gi, "yes"],
    [/\bnope\b/gi, "no"],
    [/\bcool\b/gi, "great"],
    [/\bawesome\b/gi, "wonderful"],
  ];
  slang.forEach(([re, rep]) => { text = text.replace(re, rep); });

  // 6. Capitalise first letter
  text = text.trim();
  if (text.length > 0) text = text[0].toUpperCase() + text.slice(1);

  // 7. Ensure ends with period if no terminal punctuation
  if (text && !/[.!?]$/.test(text)) text += ".";

  // 8. Clean double spaces
  text = text.replace(/\s{2,}/g, " ").trim();

  // Fallback if text got wiped
  if (!text || text === "." || text.length < 3) text = "Dear Mr. Solis, " + original + ".";

  const changed = text !== original;
  return { corrected: text, changed };
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const CARLOS_REPLIES: string[] = [
  "Tuesday at 6:00 PM works well for me. I will send you a calendar invitation shortly.",
  "That time slot is available. I look forward to our session. Please prepare any questions you have in advance.",
  "Confirmed for Tuesday. We will be meeting via the Soleada platform. Please be punctual.",
  "I have noted your availability. Expect a confirmation email from the scheduling system.",
  "Excellent. I appreciate the advance notice. Is there a specific topic you would like to focus on?",
];

// Scripted demo conversation showing guardrail in action
const DEMO_MESSAGES: Message[] = [
  {
    id: 0,
    from: "system",
    text: "Conversation started — today",
    time: "09:14",
  },
  {
    id: 1,
    from: "carlos",
    text: "Good morning. I am available this week for mentorship sessions. Please let me know how I can assist you.",
    time: "09:14",
  },
  {
    id: 2,
    from: "teen",
    original: "hiiii r u available for 6 pm tues or smth",
    corrected: "Dear Mr. Solis, are you available for 6:00 PM on Tuesday or something similar?",
    text: "Dear Mr. Solis, are you available for 6:00 PM on Tuesday or something similar?",
    time: "09:15",
    wasCorreected: true,
  },
  {
    id: 3,
    from: "carlos",
    text: "Tuesday at 6:00 PM works well for me. I will send you a calendar invitation shortly.",
    time: "09:15",
  },
  {
    id: 4,
    from: "teen",
    original: "omg tysm!! idk what to prep tho lmk pls 🙏",
    corrected: "Thank you so much. I do not know what to prepare — please let me know.",
    text: "Thank you so much. I do not know what to prepare — please let me know.",
    time: "09:16",
    wasCorreected: true,
  },
  {
    id: 5,
    from: "carlos",
    text: "Please review the entrepreneurship module on the platform and bring one business idea you would like to explore. That will be sufficient.",
    time: "09:16",
  },
  {
    id: 6,
    from: "teen",
    original: "ok fr fr ill do that!! ur the best no cap 🔥",
    corrected: "I will do that. Honestly, you are the best.",
    text: "I will do that. Honestly, you are the best.",
    time: "09:17",
    wasCorreected: true,
  },
  {
    id: 7,
    from: "carlos",
    text: "I appreciate that. See you Tuesday. Please be on time.",
    time: "09:17",
  },
];

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --cream: #EDEBE3;
  --cream-dark: #E2DFD5;
  --ink: #1A1A18;
  --ink-mid: #4A4A44;
  --ink-light: #8A8A80;
  --blue: #2A4B8C;
  --blue-light: #E8EDF7;
  --blue-mid: #4A6BAC;
  --white: #FAFAF6;
  --border: #D8D5C8;
  --guard-bg: #FFF8E6;
  --guard-border: #E8C84A;
  --guard-text: #7A5C00;
  --bubble-teen: #1A1A18;
  --bubble-carlos: #FFFFFF;
  --bubble-teen-text: #FAFAF6;
  --bubble-carlos-text: #1A1A18;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body { background: var(--cream); font-family: 'DM Sans', sans-serif; color: var(--ink); }

.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* NAV */
.topnav {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 14px 40px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.back-btn {
  background: var(--ink);
  color: var(--white);
  border: none;
  border-radius: 99px;
  padding: 8px 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s;
  letter-spacing: .02em;
}
.back-btn:hover { background: #2A2A26; }
.logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: .02em;
}
.teens-pill {
  background: var(--blue-light);
  color: var(--blue);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: .12em;
  text-transform: uppercase;
  padding: 4px 14px;
  border-radius: 99px;
  border: 1px solid #C8D5EE;
}
.nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--ink-light);
  font-weight: 400;
}
.status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #4CAF7A;
  flex-shrink: 0;
}

/* LAYOUT */
.chat-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
  gap: 24px;
  align-items: start;
}

/* SIDEBAR */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sidebar-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink-light);
  padding: 0 4px;
}
.contact-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all .15s;
  position: relative;
}
.contact-card.active {
  border-color: var(--blue);
  background: var(--blue-light);
}
.contact-avatar {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.contact-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 2px;
}
.contact-role {
  font-size: 12px;
  color: var(--ink-light);
  font-weight: 400;
  margin-bottom: 10px;
  line-height: 1.5;
}
.contact-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  background: var(--cream);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 3px 10px;
  font-size: 11px;
  color: var(--ink-mid);
  font-weight: 400;
}
.contact-card.active .tag {
  background: var(--white);
}

/* GUARDRAIL INFO */
.guardrail-info {
  background: var(--guard-bg);
  border: 1px solid var(--guard-border);
  border-radius: 14px;
  padding: 16px;
}
.guardrail-info-title {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--guard-text);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.guardrail-info svg {
  width: 13px; height: 13px;
  flex-shrink: 0;
}
.guardrail-info-body {
  font-size: 12px;
  color: var(--guard-text);
  line-height: 1.65;
  font-weight: 400;
}

/* CHAT PANEL */
.chat-panel {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px);
  overflow: hidden;
}
.chat-header {
  padding: 20px 24px 18px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 14px;
}
.chat-header-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 17px;
  font-weight: 500;
  flex-shrink: 0;
}
.chat-header-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
}
.chat-header-sub {
  font-size: 12px;
  color: var(--ink-light);
  margin-top: 1px;
}
.chat-header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4CAF7A;
  font-weight: 500;
}

/* MESSAGES */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scroll-behavior: smooth;
}
.messages-area::-webkit-scrollbar { width: 4px; }
.messages-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.msg-row {
  display: flex;
  flex-direction: column;
}
.msg-row.teen { align-items: flex-end; }
.msg-row.carlos { align-items: flex-start; }
.msg-row.system { align-items: center; }

/* Guardrail correction notice */
.guardrail-notice {
  background: var(--guard-bg);
  border: 1px solid var(--guard-border);
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 11px;
  color: var(--guard-text);
  margin-bottom: 4px;
  max-width: 82%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.55;
}
.msg-row.teen .guardrail-notice { align-self: flex-end; }

.bubble {
  max-width: 72%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.6;
  font-weight: 400;
  position: relative;
}
.bubble.teen {
  background: var(--bubble-teen);
  color: var(--bubble-teen-text);
  border-bottom-right-radius: 4px;
}
.bubble.carlos {
  background: var(--cream);
  color: var(--bubble-carlos-text);
  border-bottom-left-radius: 4px;
  border: 1px solid var(--border);
}
.msg-time {
  font-size: 10px;
  color: var(--ink-light);
  margin-top: 4px;
  padding: 0 4px;
  font-weight: 400;
}

/* System message */
.system-msg {
  background: var(--cream-dark);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 5px 16px;
  font-size: 11px;
  color: var(--ink-light);
  letter-spacing: .04em;
  margin: 8px 0;
}

/* INPUT AREA */
.input-area {
  border-top: 1px solid var(--border);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.input-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.msg-input {
  flex: 1;
  background: var(--cream);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 12px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--ink);
  resize: none;
  outline: none;
  transition: border .15s;
  min-height: 46px;
  max-height: 120px;
  line-height: 1.5;
}
.msg-input:focus {
  border-color: var(--blue-mid);
  background: var(--white);
}
.msg-input::placeholder {
  color: var(--ink-light);
  font-style: italic;
}
.send-btn {
  background: var(--ink);
  color: var(--white);
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background .15s, transform .1s;
}
.send-btn:hover { background: #2A2A26; transform: scale(1.05); }
.send-btn:disabled { opacity: .35; cursor: not-allowed; transform: none; }
.send-btn svg { width: 18px; height: 18px; }

.input-hint {
  font-size: 11px;
  color: var(--ink-light);
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;
}
.input-hint svg {
  width: 12px; height: 12px;
  flex-shrink: 0;
  opacity: .6;
}
`;

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function TeensContact() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const raw = input.trim();
    if (!raw) return;
    setInput("");

    const t = now();
    const { corrected, changed } = applyGuardrails(raw);
    const id = Date.now();

    // Add teen's message (show corrected text in bubble, guardrail notice above if changed)
    setMessages(prev => [
      ...prev,
      {
        id,
        from: "teen",
        original: changed ? raw : undefined,
        corrected: changed ? corrected : undefined,
        text: corrected,
        time: t,
        wasCorreected: changed,
      },
    ]);

    // Carlos replies after short delay
    setTimeout(() => {
      const reply = CARLOS_REPLIES[Math.floor(Math.random() * CARLOS_REPLIES.length)];
      setMessages(prev => [
        ...prev,
        { id: Date.now(), from: "carlos", text: reply, time: now() },
      ]);
    }, 1400);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        {/* NAV */}
        <nav className="topnav">
          <button className="back-btn" onClick={() => navigate("/")}>← Home</button>
          <span className="logo">soleada</span>
          <span className="teens-pill">Teens</span>
          <div className="nav-right">
            <div className="status-dot" />
            Secure & monitored
          </div>
        </nav>

        <div className="chat-layout">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar-title">Contacts</div>

            <div className="contact-card active">
              <img src="/carlos.png" alt="Carlos Solis" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", display: "block", marginBottom: 12 }} />
              <div className="contact-name">Carlos Solis</div>
              <div className="contact-role"> Latino Businessman of the Year · Entrepreneur<br />Available for office hours</div>
              <div className="contact-tags">
                <span className="tag">Entrepreneurship</span>
                <span className="tag">Finance</span>
                <span className="tag">Strategy</span>
              </div>
            </div>

            <div className="guardrail-info">
              <div className="guardrail-info-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Guardrails active
              </div>
              <div className="guardrail-info-body">
                Your messages are automatically reviewed and rephrased to meet professional communication standards before delivery. This protects you and your mentor.
              </div>
            </div>
          </aside>

          {/* CHAT PANEL */}
          <div className="chat-panel">
            <div className="chat-header">
              <div className="chat-header-avatar" style={{ padding: 0, overflow: "hidden" }}>
                <img src="/carlos.png" alt="Carlos Solis" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div>
                <div className="chat-header-name">Carlos Solis</div>
                <div className="chat-header-sub">Business Mentor · Soleada Network</div>
              </div>
              <div className="chat-header-right">
                <div className="status-dot" />
                Online
              </div>
            </div>

            <div className="messages-area">
              {messages.map(msg => (
                <div key={msg.id} className={`msg-row ${msg.from}`}>
                  {msg.from === "system" && (
                    <div className="system-msg">{msg.text}</div>
                  )}

                  {msg.from === "teen" && (
                    <>
                      {msg.wasCorreected && (
                        <div className="guardrail-notice">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#B8900A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{ flexShrink: 0, marginTop: 1 }}>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                          <span>
                            <strong>Rephrased for professionalism:</strong> "{msg.original}" → sent as formal message
                          </span>
                        </div>
                      )}
                      <div className="bubble teen">{msg.text}</div>
                      <div className="msg-time">{msg.time}</div>
                    </>
                  )}

                  {msg.from === "carlos" && (
                    <>
                      <div className="bubble carlos">{msg.text}</div>
                      <div className="msg-time">{msg.time}</div>
                    </>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="input-area">
              <div className="input-row">
                <textarea
                  ref={inputRef}
                  className="msg-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Write your message... (try: 'hiii how are youuuu <3')"
                  rows={1}
                />
                <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
              <div className="input-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Messages are automatically rephrased to professional standards before sending
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}