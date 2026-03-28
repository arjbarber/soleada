import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface StoryResult {
  title: string;
  english: string;
  moral: string;
  panels: ComicPanel[];
}

interface ComicPanel {
  id: number;
  description: string; // used as image prompt
  caption: string;     // shown under the panel
  imageUrl: string;
}

// ─────────────────────────────────────────────
// CONFIG  — drop your keys here (or use .env)
// ─────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY ?? ""; // plug in when ready
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID ?? "EXAVITQu4vr4xnSDxMaL"; // default: "Bella"

// ─────────────────────────────────────────────
// GEMINI — story generation
// ─────────────────────────────────────────────
async function generateStoryWithGemini(spanishInput: string): Promise<{
  title: string;
  english: string;
  moral: string;
  panelDescriptions: { description: string; caption: string }[];
}> {
  const prompt = `You are a magical English storyteller for children (ages 6–12) learning English.

The child has written this idea in Spanish:
"${spanishInput}"

Your tasks:
1. Translate and expand it into a warm, imaginative English story (150–250 words). Use simple vocabulary. Include a clear beginning, middle, and end. Encourage kindness and creativity. Remove any unsafe content.
2. Divide the story into exactly 4 comic panels. For each panel write:
   - "description": a vivid image-generation prompt (describe the scene visually, include art style: "children's comic book art, bright colors, friendly cartoon style, no text")
   - "caption": 1–2 sentence story excerpt for that panel (simple English)

Respond ONLY with valid JSON in this exact shape, nothing else:
{
  "title": "Story title here",
  "english": "Full story text here...",
  "moral": "One short positive lesson.",
  "panels": [
    { "description": "...", "caption": "..." },
    { "description": "...", "caption": "..." },
    { "description": "...", "caption": "..." },
    { "description": "...", "caption": "..." }
  ]
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 1200 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // strip markdown fences if present
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ─────────────────────────────────────────────
// POLLINATIONS — free AI image generation (no key)
// ─────────────────────────────────────────────
function buildComicImageUrl(description: string, panelIndex: number): string {
  const safePrompt = encodeURIComponent(
    `${description}, children's comic book panel, bright cheerful colors, friendly cartoon illustration, safe for kids, no text, no words`
  );
  // seed per panel so each is unique but stable
  return `https://image.pollinations.ai/prompt/${safePrompt}?width=512&height=512&seed=${panelIndex * 137}&nologo=true`;
}

// ─────────────────────────────────────────────
// 11LABS — text to speech (stubbed, ready to activate)
// ─────────────────────────────────────────────
async function speakWithElevenLabs(text: string): Promise<void> {
  if (!ELEVENLABS_API_KEY) {
    // Fallback to browser TTS until key is set
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
    return;
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!res.ok) throw new Error("ElevenLabs TTS failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500;600&family=Nunito:wght@400;600;700;800&display=swap');

:root {
  --cream:   #EDEBE3;
  --dark:    #1C1C1C;
  --blue:    #2B4EAE;
  --yellow:  #F5C842;
  --gray:    #888880;
  --card:    #F0EFE9;
  --white:   #FAFAF5;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body { background: var(--cream); color: var(--dark); font-family: 'DM Sans', sans-serif; }

.kids-page { min-height: 100vh; display: flex; flex-direction: column; }

/* NAV */
.kids-nav {
  display: flex; align-items: center; gap: 0.85rem;
  padding: 1.5rem 2.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.07);
}
.kids-nav-logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem; font-weight: 500; color: var(--dark);
  cursor: pointer;
}
.kids-nav-tag {
  margin-left: auto;
  background: #FFF5C0; color: #7A6000;
  font-size: 0.62rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  padding: 0.3rem 0.85rem; border-radius: 99px;
}
.kids-back {
  background: var(--dark); color: #fff; border: none;
  border-radius: 99px; padding: 0.4rem 1rem;
  font-family: 'DM Sans', sans-serif; font-size: 0.78rem;
  font-weight: 500; cursor: pointer; transition: background 0.15s;
}
.kids-back:hover { background: var(--blue); }

/* BODY */
.kids-body {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; padding: 3rem 1.5rem 5rem;
}

/* HEADING */
.kids-heading {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 500; font-style: italic;
  text-align: center; color: var(--dark);
  margin-bottom: 0.5rem; line-height: 1.15;
}
.kids-sub {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem; color: var(--gray);
  text-align: center; max-width: 500px;
  line-height: 1.7; margin-bottom: 2.75rem;
}

/* INPUT CARD */
.story-input-card {
  background: var(--card); border-radius: 24px;
  padding: 2rem; width: 100%; max-width: 600px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(0,0,0,0.05);
}
.input-lbl {
  font-size: 0.62rem; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gray); display: block; margin-bottom: 0.75rem;
}
.story-textarea {
  width: 100%; min-height: 110px; resize: none;
  background: rgba(255,255,255,0.65);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 14px; padding: 1rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem; color: var(--dark);
  line-height: 1.65; outline: none;
  transition: border 0.15s;
}
.story-textarea::placeholder { color: #AAAAAA; font-style: italic; }
.story-textarea:focus { border-color: var(--blue); }
.create-btn {
  width: 100%; margin-top: 1rem;
  background: var(--dark); color: #fff;
  border: none; border-radius: 14px; padding: 0.95rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem; font-style: italic;
  cursor: pointer; transition: all 0.15s;
}
.create-btn:hover:not(:disabled) { background: var(--blue); }
.create-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* LOADING */
.loading-state {
  display: flex; flex-direction: column;
  align-items: center; gap: 1.25rem;
  padding: 3rem 0; width: 100%; max-width: 600px;
}
.loading-label {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem; font-style: italic; color: var(--gray);
}
.loading-steps { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; }
.loading-step {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 0.85rem; color: var(--gray);
  padding: 0.5rem 0.75rem; border-radius: 8px;
  transition: all 0.3s;
}
.loading-step.active { color: var(--dark); background: var(--card); }
.loading-step.done { color: #3A8A5A; }
.step-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: currentColor; flex-shrink: 0;
  animation: pulse-dot 1s infinite;
}
.loading-step.done .step-dot { animation: none; }
.loading-step:not(.active):not(.done) .step-dot { background: #CCC; animation: none; }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* STORY RESULT */
.story-result { width: 100%; max-width: 680px; display: flex; flex-direction: column; gap: 1.5rem; }

.story-header-card {
  background: var(--card); border-radius: 24px;
  padding: 2rem 2.25rem;
  border: 1px solid rgba(0,0,0,0.05);
}
.story-title-out {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem; font-weight: 500;
  color: var(--dark); margin-bottom: 1rem; line-height: 1.2;
}
.story-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.05rem; color: #444;
  line-height: 1.95; white-space: pre-wrap;
  margin-bottom: 1.25rem;
}
.moral-row {
  background: rgba(43,78,174,0.07);
  border-left: 2.5px solid var(--blue);
  border-radius: 0 10px 10px 0;
  padding: 0.75rem 1rem; margin-bottom: 1.5rem;
}
.moral-lbl {
  font-size: 0.6rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--blue); margin-bottom: 0.3rem; opacity: 0.8;
}
.moral-txt {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem; font-style: italic;
  color: var(--blue); line-height: 1.55;
}

/* TTS bar */
.tts-bar {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  background: var(--dark); border-radius: 12px;
  cursor: pointer; transition: background 0.15s;
  width: fit-content;
}
.tts-bar:hover { background: var(--blue); }
.tts-bar svg { flex-shrink: 0; }
.tts-bar span {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem; font-weight: 500;
  color: #fff; letter-spacing: 0.03em;
}
.tts-badge {
  font-size: 0.6rem; font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.7); border-radius: 4px; padding: 2px 6px;
}

/* COMIC */
.comic-section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem; font-weight: 500; font-style: italic;
  color: var(--dark); text-align: center;
}
.comic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
}
.comic-panel {
  background: var(--card); border-radius: 18px;
  overflow: hidden; border: 1px solid rgba(0,0,0,0.06);
  display: flex; flex-direction: column;
}
.comic-panel-img-wrap {
  position: relative; aspect-ratio: 1;
  background: #E8E6DE;
  overflow: hidden;
}
.comic-panel-img {
  width: 100%; height: 100%; object-fit: cover;
  display: block;
}
.comic-panel-num {
  position: absolute; top: 10px; left: 10px;
  background: var(--dark); color: #fff;
  font-family: 'Nunito', sans-serif;
  font-size: 0.72rem; font-weight: 800;
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.comic-panel-skeleton {
  width: 100%; height: 100%;
  background: linear-gradient(90deg, #E8E6DE 25%, #DDD9CE 50%, #E8E6DE 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.comic-caption {
  padding: 0.85rem 1rem;
  font-family: 'Nunito', sans-serif;
  font-size: 0.82rem; font-weight: 600;
  color: #555; line-height: 1.55;
}

/* PANEL SPEAK btn */
.panel-speak {
  display: flex; align-items: center; gap: 5px;
  margin: 0 1rem 0.75rem;
  background: none; border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px; padding: 0.35rem 0.7rem;
  font-family: 'DM Sans', sans-serif; font-size: 0.75rem;
  color: var(--gray); cursor: pointer; width: fit-content;
  transition: all 0.15s;
}
.panel-speak:hover { border-color: var(--dark); color: var(--dark); }

/* AGAIN btn */
.again-btn {
  width: 100%; background: transparent;
  border: 1px solid rgba(0,0,0,0.14); border-radius: 14px;
  padding: 0.85rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem; font-style: italic;
  color: var(--gray); cursor: pointer; transition: all 0.15s;
}
.again-btn:hover { border-color: var(--dark); color: var(--dark); }

/* error */
.error-msg {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem; font-style: italic;
  color: #B03030; text-align: center; margin-top: 1rem;
}
`;

// ─────────────────────────────────────────────
// SUBCOMPONENTS
// ─────────────────────────────────────────────
function SpeakIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

interface ComicPanelCardProps {
  panel: ComicPanel;
  onSpeak: (text: string) => void;
  speaking: boolean;
}

function ComicPanelCard({ panel, onSpeak, speaking }: ComicPanelCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="comic-panel">
      <div className="comic-panel-img-wrap">
        {!loaded && <div className="comic-panel-skeleton" />}
        <img
          className="comic-panel-img"
          src={panel.imageUrl}
          alt={`Panel ${panel.id}`}
          onLoad={() => setLoaded(true)}
          style={{ display: loaded ? "block" : "none" }}
        />
        <div className="comic-panel-num">{panel.id}</div>
      </div>
      <div className="comic-caption">{panel.caption}</div>
      <button className="panel-speak" onClick={() => onSpeak(panel.caption)} disabled={speaking}>
        <SpeakIcon size={13} />
        {speaking ? "Speaking..." : "Read aloud"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
type Step = "idle" | "generating" | "imaging" | "done";

export default function Kids() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [story, setStory] = useState<StoryResult | null>(null);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);

  async function handleCreate() {
    if (!input.trim()) return;
    setStep("generating");
    setError("");
    setStory(null);

    try {
      // 1. Gemini: generate story + panel prompts
      const geminiResult = await generateStoryWithGemini(input.trim());

      setStep("imaging");

      // 2. Build comic panels with Pollinations image URLs
      const panels: ComicPanel[] = geminiResult.panels.map((p, i) => ({
        id: i + 1,
        description: p.description,
        caption: p.caption,
        imageUrl: buildComicImageUrl(p.description, i + 1),
      }));

      setStory({
        title: geminiResult.title,
        english: geminiResult.english,
        moral: geminiResult.moral,
        panels,
      });
      setStep("done");
    } catch (err) {
      console.error(err);
      setError("Something went wrong — please check your Gemini API key and try again.");
      setStep("idle");
    }
  }

  async function handleSpeak(text: string) {
    if (speaking) return;
    setSpeaking(true);
    try {
      await speakWithElevenLabs(text);
    } catch (e) {
      console.error("TTS error:", e);
    } finally {
      setTimeout(() => setSpeaking(false), 1000);
    }
  }

  function reset() {
    setStory(null);
    setStep("idle");
    setInput("");
    setError("");
    window.speechSynthesis.cancel();
  }

  const loadingSteps = [
    { key: "generating", label: "Gemini is reading your idea..." },
    { key: "imaging",    label: "Creating your comic panels..." },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="kids-page">

        {/* NAV */}
        <nav className="kids-nav">
          <button className="kids-back" onClick={() => navigate("/")}>← Home</button>
          <span className="kids-nav-logo" onClick={() => navigate("/")}>soleada</span>
          <span className="kids-nav-tag">Kids</span>
        </nav>

        <div className="kids-body">

          {/* HEADING */}
          <h1 className="kids-heading">Your story, brought to life</h1>
          <p className="kids-sub">
            Write any idea in Spanish — a dragon, a princess, your dog, outer space.
            Gemini will turn it into a magical English story with a comic just for you!
          </p>

          {/* INPUT (hide when done) */}
          {step === "idle" && (
            <div className="story-input-card">
              <span className="input-lbl">Write your idea in Spanish</span>
              <textarea
                className="story-textarea"
                placeholder="Escribe tu idea aquí... por ejemplo: 'Un dragón que quiere hacer amigos con una princesa'"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button
                className="create-btn"
                onClick={handleCreate}
                disabled={!input.trim() || !GEMINI_API_KEY}
              >
                {!GEMINI_API_KEY ? "Add VITE_GEMINI_API_KEY to .env to start" : "Create my story ✦"}
              </button>
              {error && <p className="error-msg">{error}</p>}
            </div>
          )}

          {/* LOADING */}
          {(step === "generating" || step === "imaging") && (
            <div className="loading-state">
              <p className="loading-label">Making your story...</p>
              <div className="loading-steps">
                {loadingSteps.map(s => (
                  <div
                    key={s.key}
                    className={`loading-step ${
                      step === s.key ? "active" :
                      (s.key === "generating" && step === "imaging") ? "done" : ""
                    }`}
                  >
                    <div className="step-dot" />
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULT */}
          {step === "done" && story && (
            <div className="story-result">

              {/* Story card */}
              <div className="story-header-card">
                <div className="story-title-out">📖 {story.title}</div>
                <div className="story-text">{story.english}</div>

                <div className="moral-row">
                  <div className="moral-lbl">Today's Lesson</div>
                  <div className="moral-txt">{story.moral}</div>
                </div>

                {/* TTS — full story */}
                <button className="tts-bar" onClick={() => handleSpeak(story.english)} disabled={speaking}>
                  <SpeakIcon size={17} />
                  <span>{speaking ? "Reading aloud..." : "Read the story to me"}</span>
                  <span className="tts-badge">
                    {ELEVENLABS_API_KEY ? "11Labs" : "Browser TTS"}
                  </span>
                </button>
              </div>

              {/* Comic panels */}
              <div className="comic-section-title">✦ Your comic</div>
              <div className="comic-grid">
                {story.panels.map(panel => (
                  <ComicPanelCard
                    key={panel.id}
                    panel={panel}
                    onSpeak={handleSpeak}
                    speaking={speaking}
                  />
                ))}
              </div>

              <button className="again-btn" onClick={reset}>
                Write another story →
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}