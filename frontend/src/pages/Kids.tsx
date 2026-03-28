import { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface ComicPanel { id: number; description: string; caption: string; imageUrl: string; }
interface Story { id: string; title: string; english: string; moral: string; panels: ComicPanel[]; spanish: string; createdAt: string; author: string; likes: number; liked: boolean; }
type Tab = "home" | "write" | "settings" | "profile";
type WriteStep = "idle" | "generating" | "imaging" | "done";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY ?? "";
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID ?? "EXAVITQu4vr4xnSDxMaL";

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const MOCK_STORIES: Story[] = [
  { id: "1", title: "The Dragon Who Loved Stars", english: "Once upon a time, a small purple dragon named Luna lived at the top of a misty mountain. Every night, she would stretch her wings and gaze at the twinkling stars above. Luna dreamed of touching one.\n\nOne evening, a shooting star zoomed past and landed in the meadow below. Luna flew down and found a tiny glowing seed. She planted it beside a stream, watered it every day, and sang to it softly.\n\nWeeks later, a magnificent star-flower bloomed — its petals sparkled like the night sky. Luna realized she didn't need to touch a star. She had grown one herself.", moral: "You can create your own magic with patience and love.", panels: [], spanish: "Un dragón pequeño que quería tocar las estrellas", createdAt: "2025-03-20", author: "Sofia M.", likes: 142, liked: false },
  { id: "2", title: "Mia and the Rainbow Bridge", english: "Mia was a curious girl who lived in a village surrounded by clouds. One rainy morning, she spotted a rainbow stretching across the sky — but this one had a door at the end!\n\nShe climbed up carefully, step by colorful step. When she opened the door, she found a garden where every flower sang a different song.\n\n\"Only kind hearts can hear the flowers,\" a butterfly said. Mia listened and heard the most beautiful music she had ever known.", moral: "Kindness opens doors that others cannot see.", panels: [], spanish: "Una niña que encontró un arco iris con una puerta", createdAt: "2025-03-22", author: "Carlos R.", likes: 98, liked: false },
  { id: "3", title: "The Brave Little Submarine", english: "Deep in the ocean lived a little yellow submarine named Pip. While the big submarines explored far-off waters, Pip stayed close to the coral reef because the deep dark sea frightened her.\n\nOne day, a baby whale got tangled in some seaweed just beyond the reef. Pip took a deep breath and dove into the darkness.\n\n\"I am a little scared too,\" Pip said gently, \"but we can do this together.\" She freed the whale, and they swam back to the light side by side.", moral: "Bravery is acting despite being scared.", panels: [], spanish: "Un submarino pequeño que tenía miedo del océano profundo", createdAt: "2025-03-25", author: "Amara K.", likes: 76, liked: false },
];

// ─────────────────────────────────────────────
// API HELPERS
// ─────────────────────────────────────────────
async function generateStory(spanish: string) {
  const prompt = `You are a magical English storyteller for children (ages 6–12) learning English. The child wrote in Spanish: "${spanish}". Translate and expand into a warm imaginative English story (150–220 words). Simple vocabulary. Clear beginning, middle, end. Kind and creative. No unsafe content. Split into exactly 4 comic panels. For each: "description" (vivid image prompt, children's comic book art, bright colors, no text) and "caption" (1-2 sentence excerpt). Respond ONLY with valid JSON, no markdown: {"title":"...","english":"...","moral":"...","panels":[{"description":"...","caption":"..."},{"description":"...","caption":"..."},{"description":"...","caption":"..."},{"description":"...","caption":"..."}]}`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.85, maxOutputTokens: 1200 } }) });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  return JSON.parse((data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").replace(/```json|```/g, "").trim());
}

function comicUrl(desc: string, idx: number) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ", children's comic book panel, bright cheerful colors, friendly cartoon illustration, safe for kids, no text")}?width=512&height=512&seed=${idx * 137}&nologo=true`;
}

async function speakText(text: string) {
  if (!ELEVENLABS_API_KEY) { const u = new SpeechSynthesisUtterance(text); u.rate = 0.88; u.pitch = 1.1; window.speechSynthesis.speak(u); return; }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, { method: "POST", headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ text, model_id: "eleven_turbo_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }) });
  if (!res.ok) throw new Error("TTS failed");
  new Audio(URL.createObjectURL(await res.blob())).play();
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');

:root {
  --bg: #FDF6F0;
  --pink: #F2A7C3;
  --pink-light: #FDE8F2;
  --pink-mid: #F7C5D8;
  --lavender: #C9B8F0;
  --lav-light: #EDE8FC;
  --mint: #A8D8B9;
  --mint-light: #E4F5EB;
  --peach-light: #FEF0E4;
  --blue-light: #E8F2FE;
  --dark: #3A3347;
  --mid: #7A6E8A;
  --light: #B8B0C8;
  --white: #FFFFFF;
  --border: #EDE8F5;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body { background: var(--bg); color: var(--dark); font-family: 'Nunito', sans-serif; }
.shell { min-height: 100vh; display: flex; flex-direction: column; }

/* NAV */
.topnav {
  background: var(--white); border-bottom: 2px solid var(--border);
  padding: 12px 28px; display: flex; align-items: center; gap: 14px;
  position: sticky; top: 0; z-index: 50;
}
.back-btn {
  background: var(--dark); color: #fff; border: none;
  border-radius: 99px; padding: 8px 18px;
  font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 800;
  cursor: pointer; transition: background .15s;
}
.back-btn:hover { background: #5A4080; }
.logo { font-family: 'Fredoka One', cursive; font-size: 22px; color: var(--dark); }
.kids-pill {
  background: var(--pink-light); color: #9B3E6A;
  font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
  padding: 4px 12px; border-radius: 99px;
}
.nav-tabs { display: flex; gap: 2px; margin-left: auto; }
.k-tab {
  display: flex; align-items: center; gap: 7px;
  background: none; border: 2px solid transparent; border-radius: 14px;
  padding: 8px 18px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 800;
  color: var(--light); cursor: pointer; transition: all .15s;
}
.k-tab:hover { background: var(--lav-light); color: var(--dark); }
.k-tab.active { background: var(--dark); color: #fff; }
.k-tab svg { width: 15px; height: 15px; flex-shrink: 0; }

/* HERO BANNER — smooth blended ombre */
.hero-banner {
  width: 100%;
  background: linear-gradient(
    135deg,
    #FFE8D6 0%,
    #FDD5E8 20%,
    #EDD5F8 40%,
    #D5D8F8 60%,
    #D5EDF8 80%,
    #D5F5EC 100%
  );
  padding: 56px 24px 80px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero-banner::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 80px;
  background: linear-gradient(to bottom, transparent, var(--bg));
}
.hero-title {
  font-family: 'Fredoka One', cursive;
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: var(--dark);
  line-height: 1.15; margin-bottom: 1rem;
}
.hero-title .accent { color: #9B60D0; font-style: italic; }
.hero-sub {
  font-size: 15px; color: var(--mid); font-weight: 700;
  max-width: 480px; margin: 0 auto; line-height: 1.65;
}

/* CONTENT */
.content { flex: 1; padding: 36px 28px 56px; max-width: 920px; margin: 0 auto; width: 100%; }

/* SECTION */
.sec-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.sec-title { font-family: 'Fredoka One', cursive; font-size: 22px; color: var(--dark); }
.sec-sub { font-size: 13px; color: var(--light); font-weight: 700; margin-bottom: 20px; }
.write-cta {
  background: var(--pink); color: #fff; border: none;
  border-radius: 99px; padding: 10px 24px;
  font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 800;
  cursor: pointer; transition: all .15s; flex-shrink: 0;
}
.write-cta:hover { background: #e090b0; transform: scale(1.02); }

/* STORY CARDS */
.stories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 16px; }
.s-card {
  background: var(--white); border-radius: 22px;
  border: 2px solid var(--border); overflow: hidden; cursor: pointer;
  transition: transform .2s, box-shadow .2s; display: flex; flex-direction: column;
}
.s-card:hover { transform: translateY(-4px); box-shadow: 0 14px 32px rgba(100,80,140,.1); }
.s-card.c-pk { border-color: var(--pink-mid); }
.s-card.c-lv { border-color: #D8D0F8; }
.s-card.c-mn { border-color: #B8E8C8; }
.s-card.c-bl { border-color: #B8D8F8; }
.s-thumb {
  width: 100%; aspect-ratio: 16/9;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.s-thumb.bg-pk { background: linear-gradient(135deg, #FDE8F2, #F7C5D8); }
.s-thumb.bg-lv { background: linear-gradient(135deg, #EDE8FC, #D8D0F8); }
.s-thumb.bg-mn { background: linear-gradient(135deg, #E4F5EB, #B8E8C8); }
.s-thumb.bg-bl { background: linear-gradient(135deg, #E8F2FE, #B8D8F8); }
.s-thumb svg { width: 52px; height: 52px; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; fill: none; }
.s-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.s-body { padding: 14px 16px 16px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.s-title { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 15px; color: var(--dark); line-height: 1.3; }
.s-excerpt { font-size: 13px; color: var(--mid); font-weight: 600; line-height: 1.55; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.s-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
.s-author { font-size: 11px; color: var(--light); font-weight: 700; }
.like-btn {
  display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 800;
  color: #B86090; background: var(--pink-light); border: none; border-radius: 99px;
  padding: 4px 11px; cursor: pointer; transition: all .15s;
}
.like-btn:hover { background: var(--pink-mid); }
.like-btn.liked { background: var(--pink); color: #fff; }
.like-btn svg { width: 12px; height: 12px; }

/* STORY VIEWER */
.sv-wrap { display: flex; flex-direction: column; gap: 18px; }
.sv-back { background: none; border: none; cursor: pointer; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 800; color: var(--light); display: flex; align-items: center; gap: 6px; padding: 0; transition: color .15s; }
.sv-back:hover { color: var(--dark); }
.sv-back svg { width: 16px; height: 16px; }
.sv-card { background: var(--white); border-radius: 26px; padding: 28px; border: 2px solid var(--border); }
.sv-title { font-family: 'Fredoka One', cursive; font-size: 28px; color: var(--dark); margin-bottom: 4px; line-height: 1.2; }
.sv-meta { font-size: 12px; color: var(--light); font-weight: 700; margin-bottom: 20px; }
.sv-text { font-size: 17px; color: #5A5070; font-weight: 700; line-height: 2; white-space: pre-wrap; margin-bottom: 20px; }
.lesson { background: linear-gradient(135deg, var(--lav-light), #E8E0FC); border-radius: 18px; border: 2px solid #D0C8F0; padding: 16px 18px; margin-bottom: 20px; }
.lesson-lbl { font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #7A60C8; margin-bottom: 6px; }
.lesson-txt { font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 15px; color: #5A40A0; line-height: 1.55; }
.tts-btn { display: flex; align-items: center; gap: 8px; background: var(--dark); color: #fff; border: none; border-radius: 14px; padding: 12px 22px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer; transition: background .15s; width: fit-content; }
.tts-btn:hover { background: #5A4080; }
.tts-btn svg { width: 16px; height: 16px; flex-shrink: 0; }
.tts-badge { font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; background: rgba(255,255,255,.15); border-radius: 6px; padding: 3px 7px; }
.comic-label { font-family: 'Fredoka One', cursive; font-size: 20px; color: var(--dark); text-align: center; }
.comic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.panel { background: var(--white); border-radius: 20px; overflow: hidden; border: 2px solid var(--border); display: flex; flex-direction: column; }
.panel-img-wrap { position: relative; aspect-ratio: 1; background: var(--bg); overflow: hidden; }
.panel-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.panel-num { position: absolute; top: 10px; left: 10px; background: var(--dark); color: #fff; font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 900; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.panel-skel { width: 100%; height: 100%; background: var(--border); animation: sh 1.3s ease-in-out infinite; }
@keyframes sh { 0%,100%{opacity:.5} 50%{opacity:1} }
.panel-cap { padding: 12px 14px; font-size: 14px; font-weight: 700; color: var(--mid); line-height: 1.55; }
.panel-speak { display: flex; align-items: center; gap: 5px; margin: 0 14px 12px; background: none; border: 2px solid var(--border); border-radius: 9px; padding: 4px 10px; font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 800; color: var(--light); cursor: pointer; width: fit-content; transition: all .15s; }
.panel-speak:hover { border-color: var(--dark); color: var(--dark); }
.panel-speak svg { width: 11px; height: 11px; }

/* WRITE */
.write-wrap { max-width: 640px; margin: 0 auto; width: 100%; }

/* write hero */
.write-hero {
  background: linear-gradient(135deg, #FFE8D6 0%, #FDD5E8 25%, #EDD5F8 50%, #D5D8F8 75%, #D5F5EC 100%);
  border-radius: 28px; padding: 36px 28px 32px; text-align: center;
  margin-bottom: 24px; border: 2px solid rgba(255,255,255,.6); position: relative; overflow: hidden;
}
.write-hero::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(255,255,255,.4) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 50%, rgba(200,180,255,.2) 0%, transparent 60%);
}
.write-sparkles { display: flex; justify-content: center; gap: 14px; margin-bottom: 12px; position: relative; }
.write-sparkles svg { opacity: .75; }
.write-hero-title {
  font-family: 'Fredoka One', cursive; font-size: clamp(1.8rem, 4vw, 2.6rem);
  color: var(--dark); line-height: 1.15; margin-bottom: 10px; position: relative;
}
.write-hero-title .magic-word { color: #9B60D0; }
.write-hero-sub { font-size: 15px; color: var(--mid); font-weight: 700; line-height: 1.6; max-width: 440px; margin: 0 auto; position: relative; }

/* how it works steps */
.magic-steps { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.magic-step { background: var(--white); border-radius: 20px; padding: 16px 14px; text-align: center; border: 2px solid var(--border); }
.magic-step.ms-pk { border-color: var(--pink-mid); background: linear-gradient(135deg, #fff, var(--pink-light)); }
.magic-step.ms-lv { border-color: #D8D0F8; background: linear-gradient(135deg, #fff, var(--lav-light)); }
.magic-step.ms-mn { border-color: #B8E8C8; background: linear-gradient(135deg, #fff, var(--mint-light)); }
.ms-num {
  width: 32px; height: 32px; border-radius: 50%;
  font-family: 'Fredoka One', cursive; font-size: 16px;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;
}
.ms-pk .ms-num { background: var(--pink-mid); color: #7A2A50; }
.ms-lv .ms-num { background: #D8D0F8; color: #5A40A0; }
.ms-mn .ms-num { background: #B8E8C8; color: #2A6A40; }
.ms-icon { margin-bottom: 6px; }
.ms-icon svg { width: 24px; height: 24px; fill: none; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.ms-pk .ms-icon svg { stroke: #D070A0; }
.ms-lv .ms-icon svg { stroke: #8060C0; }
.ms-mn .ms-icon svg { stroke: #50A070; }
.ms-title { font-family: 'Fredoka One', cursive; font-size: 14px; color: var(--dark); margin-bottom: 3px; }
.ms-desc { font-size: 11px; color: var(--mid); font-weight: 700; line-height: 1.45; }

/* suggestion chips */
.suggestions-lbl { font-family: 'Fredoka One', cursive; font-size: 17px; color: var(--dark); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.suggestions-lbl svg { width: 18px; height: 18px; stroke: #9B60D0; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.chips { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
.chip {
  background: var(--white); border: 2px solid var(--border); border-radius: 99px;
  padding: 10px 18px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700;
  color: var(--mid); cursor: pointer; transition: all .15s;
  display: flex; align-items: center; gap: 8px;
}
.chip:hover { border-color: var(--lavender); background: var(--lav-light); color: var(--dark); transform: scale(1.03); }
.chip-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

/* write card */
.w-card { background: var(--white); border-radius: 28px; padding: 28px; border: 2px solid var(--border); margin-bottom: 20px; }
.w-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.w-card-icon {
  width: 46px; height: 46px; border-radius: 14px;
  background: linear-gradient(135deg, var(--lav-light), var(--pink-light));
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--pink-mid); flex-shrink: 0;
}
.w-card-icon svg { width: 22px; height: 22px; stroke: #9070C0; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.w-card-title { font-family: 'Fredoka One', cursive; font-size: 20px; color: var(--dark); }
.w-card-sub { font-size: 13px; color: var(--light); font-weight: 700; margin-top: 2px; }
.spanish-flag { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.flag-badge { width: 28px; height: 20px; border-radius: 5px; flex-shrink: 0; border: 1.5px solid rgba(0,0,0,.1); overflow: hidden; position: relative; }
.flag-badge::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, #c60b1e 33%, #ffc400 33%, #ffc400 66%, #c60b1e 66%); }
.flag-lbl { font-size: 13px; font-weight: 800; color: var(--mid); }
.big-textarea {
  width: 100%; min-height: 140px; resize: none;
  background: #FAF8FC; border: 2.5px solid var(--border);
  border-radius: 18px; padding: 18px;
  font-family: 'Nunito', sans-serif; font-size: 16px; color: var(--dark);
  line-height: 1.7; outline: none; transition: border .15s, box-shadow .15s;
}
.big-textarea:focus { border-color: var(--lavender); box-shadow: 0 0 0 4px rgba(201,184,240,.15); }
.big-textarea::placeholder { color: #CCC8D8; font-style: italic; font-size: 15px; }
.char-row { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
.char-hint { font-size: 12px; color: var(--light); font-weight: 700; }
.char-count { font-size: 12px; color: var(--light); font-weight: 700; }

/* big create button */
.create-btn {
  width: 100%;
  background: linear-gradient(135deg, #C9B8F0, #F2A7C3, #A8D8B9);
  background-size: 200% 200%;
  animation: gradshift 4s ease infinite;
  color: var(--dark); border: none; border-radius: 22px;
  padding: 22px 24px;
  font-family: 'Fredoka One', cursive; font-size: 24px;
  cursor: pointer; transition: transform .15s, box-shadow .15s;
  display: flex; align-items: center; justify-content: center; gap: 14px;
  box-shadow: 0 4px 24px rgba(160,120,200,.25);
}
.create-btn:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 8px 32px rgba(160,120,200,.35); }
.create-btn:disabled { opacity: .42; cursor: not-allowed; animation: none; background: var(--border); color: var(--light); }
.create-btn svg { width: 28px; height: 28px; stroke: var(--dark); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
.create-btn-sub { text-align: center; margin-top: 8px; font-size: 12px; font-weight: 700; color: var(--light); }
@keyframes gradshift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

/* loading portal */
.loading-portal {
  background: linear-gradient(135deg, #FDE8F2, #EDE8FC, #E4F5EB);
  border-radius: 28px; padding: 48px 28px; text-align: center;
  border: 2px solid var(--pink-mid);
}
.loading-orb {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, var(--lavender), var(--pink), var(--mint));
  background-size: 200% 200%; animation: gradshift 2s ease infinite;
  margin: 0 auto 20px;
  display: flex; align-items: center; justify-content: center;
}
.loading-orb svg { width: 40px; height: 40px; stroke: white; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.loading-title { font-family: 'Fredoka One', cursive; font-size: 26px; color: var(--dark); margin-bottom: 6px; }
.loading-sub { font-size: 14px; color: var(--mid); font-weight: 700; margin-bottom: 24px; line-height: 1.55; }
.p-steps { display: flex; flex-direction: column; gap: 8px; max-width: 300px; margin: 0 auto; }
.p-step { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 14px; font-size: 14px; font-weight: 700; color: var(--light); transition: all .3s; }
.p-step.active { background: var(--white); color: var(--dark); border: 2px solid var(--pink-mid); }
.p-step.done { color: var(--mint); }
.p-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; animation: pd 1s infinite; }
.p-step.done .p-dot, .p-step:not(.active):not(.done) .p-dot { animation: none; }
.p-step:not(.active):not(.done) .p-dot { background: #DDD; }
@keyframes pd { 0%,100%{opacity:1} 50%{opacity:.2} }

.save-btn { width: 100%; background: var(--mint); color: #fff; border: none; border-radius: 18px; padding: 18px; font-family: 'Fredoka One', cursive; font-size: 22px; cursor: pointer; transition: all .15s; }
.save-btn:hover { background: #7EC898; transform: scale(1.01); }
.again-btn { width: 100%; background: transparent; border: 2px solid var(--border); border-radius: 14px; padding: 13px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 800; color: var(--light); cursor: pointer; transition: all .15s; }
.again-btn:hover { border-color: var(--dark); color: var(--dark); }
.err { font-size: 13px; font-weight: 700; color: #C05070; text-align: center; margin-top: 12px; }

/* SETTINGS */
.page-title { font-family: 'Fredoka One', cursive; font-size: 30px; color: var(--dark); margin-bottom: 6px; }
.page-sub { font-size: 14px; color: var(--mid); font-weight: 700; margin-bottom: 24px; line-height: 1.6; }
.settings-wrap { max-width: 520px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 16px; }
.s-scard { background: var(--white); border-radius: 22px; padding: 22px; border: 2px solid var(--border); }
.s-scard-title { font-family: 'Fredoka One', cursive; font-size: 19px; color: var(--dark); margin-bottom: 18px; }
.s-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 2px solid #F5F0FC; }
.s-row:last-child { border-bottom: none; }
.s-lbl { font-size: 14px; font-weight: 800; color: var(--dark); }
.s-desc { font-size: 12px; color: var(--light); font-weight: 600; margin-top: 2px; }
.toggle { width: 46px; height: 26px; border-radius: 99px; border: none; cursor: pointer; position: relative; transition: background .2s; flex-shrink: 0; }
.toggle.on { background: var(--mint); } .toggle.off { background: #DDD; }
.tdot { position: absolute; top: 4px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: left .2s; }
.toggle.on .tdot { left: 24px; } .toggle.off .tdot { left: 4px; }
.api-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.api-ok { background: var(--mint); } .api-miss { background: var(--pink); }

/* PROFILE */
.profile-wrap { max-width: 540px; margin: 0 auto; width: 100%; }
.p-hero {
  background: linear-gradient(135deg, #EDE8FC 0%, #FDE8F2 50%, #E4F5EB 100%);
  border-radius: 28px; padding: 26px; border: 2px solid var(--pink-mid);
  display: flex; align-items: center; gap: 22px; margin-bottom: 18px;
}
.avatar { width: 78px; height: 78px; border-radius: 50%; background: var(--dark); color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Fredoka One', cursive; font-size: 30px; flex-shrink: 0; border: 3px solid rgba(255,255,255,.8); }
.p-name { font-family: 'Fredoka One', cursive; font-size: 23px; color: var(--dark); margin-bottom: 4px; }
.p-sub { font-size: 13px; color: var(--mid); font-weight: 700; }
.level-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.75); color: #7A50A0; font-size: 12px; font-weight: 800; padding: 5px 14px; border-radius: 99px; margin-top: 8px; border: 2px solid #D8D0F8; }
.level-badge svg { width: 13px; height: 13px; stroke: #A080D0; fill: none; stroke-width: 2; }
.stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 18px; }
.stat-card { background: var(--white); border-radius: 20px; padding: 18px; text-align: center; border: 2px solid var(--border); }
.stat-card.s-pk { border-color: var(--pink-mid); background: linear-gradient(135deg, #fff, var(--pink-light)); }
.stat-card.s-pk .stat-num { color: #C06080; }
.stat-card.s-mn { border-color: #B8E8C8; background: linear-gradient(135deg, #fff, var(--mint-light)); }
.stat-card.s-mn .stat-num { color: #40906A; }
.stat-card.s-lv { border-color: #D8D0F8; background: linear-gradient(135deg, #fff, var(--lav-light)); }
.stat-card.s-lv .stat-num { color: #7050C0; }
.stat-num { font-family: 'Fredoka One', cursive; font-size: 34px; color: var(--dark); }
.stat-lbl { font-size: 11px; font-weight: 800; color: var(--light); margin-top: 3px; letter-spacing: .04em; text-transform: uppercase; }
.ach-card { background: var(--white); border-radius: 22px; padding: 22px; border: 2px solid var(--border); }
.ach-title { font-family: 'Fredoka One', cursive; font-size: 19px; color: var(--dark); margin-bottom: 18px; }
.badge-row { display: flex; gap: 12px; flex-wrap: wrap; }
.badge { display: flex; flex-direction: column; align-items: center; gap: 7px; background: linear-gradient(135deg, var(--lav-light), #EEE8FC); border-radius: 18px; padding: 16px 18px; border: 2px solid #D8D0F8; min-width: 76px; }
.badge-icon { width: 36px; height: 36px; border-radius: 50%; background: var(--white); border: 2px solid #D8D0F8; display: flex; align-items: center; justify-content: center; }
.badge-icon svg { width: 17px; height: 17px; stroke: #9070D0; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.badge-name { font-size: 11px; font-weight: 800; color: #7050A0; text-align: center; }
`;

// ─────────────────────────────────────────────
// SVG ICONS
// ─────────────────────────────────────────────
const HomeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const WriteIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const SettingsIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const ProfileIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const SpeakIcon = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
const HeartIcon = ({ filled = false }: { filled?: boolean }) => <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const StarIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const BackIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const BookIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;

// Hero illustration SVGs — cute minimal line art
const DragonIllo = () => (
  <svg viewBox="0 0 40 40" stroke="#C070A8" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="20" cy="24" rx="11" ry="7"/>
    <circle cx="20" cy="14" r="6"/>
    <circle cx="17" cy="13" r="1.2" fill="#C070A8"/>
    <circle cx="23" cy="13" r="1.2" fill="#C070A8"/>
    <path d="M17 17 Q20 19 23 17"/>
    <path d="M14 10 L11 5 M26 10 L29 5"/>
    <path d="M9 24 L5 20 M31 24 L35 20"/>
  </svg>
);
const WandIllo = () => (
  <svg viewBox="0 0 40 40" stroke="#8060C0" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="32" x2="28" y2="12"/>
    <polygon points="28,12 32,8 34,14 28,12" fill="#C9B8F0" stroke="#8060C0"/>
    <circle cx="14" cy="10" r="1.5" fill="#C9B8F0"/>
    <circle cx="26" cy="26" r="1.5" fill="#C9B8F0"/>
    <circle cx="8" cy="18" r="1" fill="#C9B8F0"/>
    <circle cx="32" cy="22" r="1" fill="#C9B8F0"/>
    <circle cx="20" cy="6" r="1" fill="#C9B8F0"/>
  </svg>
);
const BoatIllo = () => (
  <svg viewBox="0 0 40 40" stroke="#60A0C8" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 24 L20 28 L32 24"/>
    <rect x="13" y="14" width="14" height="10" rx="2"/>
    <circle cx="16" cy="19" r="1.5" fill="#B8D8F8"/>
    <circle cx="24" cy="19" r="1.5" fill="#B8D8F8"/>
    <path d="M16 22 Q20 24 24 22"/>
    <path d="M20 14 L20 8 M17 10 L23 10"/>
  </svg>
);
const FlowerIllo = () => (
  <svg viewBox="0 0 40 40" stroke="#60A880" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="20" y1="32" x2="20" y2="20"/>
    <path d="M16 28 Q14 24 18 22"/>
    <circle cx="20" cy="18" r="4" fill="#E4F5EB" stroke="#60A880"/>
    <circle cx="13" cy="14" r="3" fill="#E4F5EB" stroke="#60A880"/>
    <circle cx="27" cy="14" r="3" fill="#E4F5EB" stroke="#60A880"/>
    <circle cx="13" cy="22" r="3" fill="#E4F5EB" stroke="#60A880"/>
    <circle cx="27" cy="22" r="3" fill="#E4F5EB" stroke="#60A880"/>
    <circle cx="20" cy="18" r="2.5" fill="#A8D8B9"/>
  </svg>
);
const MoonIllo = () => (
  <svg viewBox="0 0 40 40" stroke="#9070C0" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M28 20 A10 10 0 1 1 20 12 A7 7 0 0 0 28 20Z" fill="#EDE8FC" stroke="#9070C0"/>
    <circle cx="26" cy="10" r="1.2" fill="#C9B8F0"/>
    <circle cx="32" cy="16" r="1" fill="#C9B8F0"/>
    <circle cx="30" cy="26" r="1.2" fill="#C9B8F0"/>
    <circle cx="10" cy="28" r="1" fill="#C9B8F0"/>
  </svg>
);

const heroIllos = [
  { bg: "rgba(253,232,242,.8)", illo: <DragonIllo /> },
  { bg: "rgba(237,232,252,.8)", illo: <WandIllo /> },
  { bg: "rgba(232,242,254,.8)", illo: <BoatIllo /> },
  { bg: "rgba(228,245,235,.8)", illo: <FlowerIllo /> },
  { bg: "rgba(237,232,252,.8)", illo: <MoonIllo /> },
];

const themes = [
  { card: "c-pk", thumb: "bg-pk", stroke: "#D070A0" },
  { card: "c-lv", thumb: "bg-lv", stroke: "#8060C0" },
  { card: "c-mn", thumb: "bg-mn", stroke: "#50A070" },
  { card: "c-bl", thumb: "bg-bl", stroke: "#5080C0" },
];

// ─────────────────────────────────────────────
// COMIC PANEL
// ─────────────────────────────────────────────
function PanelCard({ panel, onSpeak }: { panel: ComicPanel; onSpeak: (t: string) => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="panel">
      <div className="panel-img-wrap">
        {!loaded && <div className="panel-skel" />}
        <img className="panel-img" src={panel.imageUrl} alt={`Panel ${panel.id}`}
          onLoad={() => setLoaded(true)} style={{ display: loaded ? "block" : "none" }} />
        <div className="panel-num">{panel.id}</div>
      </div>
      <div className="panel-cap">{panel.caption}</div>
      <button className="panel-speak" onClick={() => onSpeak(panel.caption)}>
        <SpeakIcon size={11} /> Read aloud
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// HOME TAB
// ─────────────────────────────────────────────
function HomeTab({ stories, onView, onLike, onWrite }: { stories: Story[]; onView: (s: Story) => void; onLike: (id: string) => void; onWrite: () => void }) {
  const sorted = [...stories].sort((a, b) => b.likes - a.likes);
  return (
    <div>
      {/* Hero */}
      <div className="hero-banner">
        <h1 className="hero-title">Where <span className="accent">stories</span> come alive</h1>
        <p className="hero-sub">Read magical stories, create your own adventures, and share them with the world.</p>
      </div>

      <div className="content">
        <div className="sec-hdr">
          <div className="sec-title">Top stories</div>
          <button className="write-cta" onClick={onWrite}>Write yours</button>
        </div>
        <p className="sec-sub">The most loved stories from our community</p>
        <div className="stories-grid">
          {sorted.map((s, i) => {
            const t = themes[i % themes.length];
            return (
              <div className={`s-card ${t.card}`} key={s.id} onClick={() => onView(s)}>
                <div className={`s-thumb ${t.thumb}`}>
                  {s.panels.length > 0
                    ? <img src={s.panels[0].imageUrl} alt={s.title} />
                    : <svg viewBox="0 0 56 56" stroke={t.stroke} fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 10 C10 14 6 24 10 34 C14 44 26 50 38 46 C50 42 54 30 50 20 C46 10 34 6 24 10"/>
                        <circle cx="22" cy="26" r="3"/>
                        <circle cx="36" cy="26" r="3"/>
                        <path d="M22 36 Q29 42 36 36"/>
                      </svg>
                  }
                </div>
                <div className="s-body">
                  <div className="s-title">{s.title}</div>
                  <div className="s-excerpt">{s.english}</div>
                  <div className="s-footer">
                    <span className="s-author">by {s.author}</span>
                    <button className={`like-btn${s.liked ? " liked" : ""}`} onClick={e => { e.stopPropagation(); onLike(s.id); }}>
                      <HeartIcon filled={s.liked} /> {s.likes}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STORY VIEWER
// ─────────────────────────────────────────────
function StoryViewer({ story, onBack }: { story: Story; onBack: () => void }) {
  return (
    <div className="sv-wrap">
      <button className="sv-back" onClick={onBack}><BackIcon /> Back to stories</button>
      <div className="sv-card">
        <div className="sv-title">{story.title}</div>
        <div className="sv-meta">by {story.author} · {story.createdAt}</div>
        <div className="sv-text">{story.english}</div>
        <div className="lesson">
          <div className="lesson-lbl">Today's lesson</div>
          <div className="lesson-txt">{story.moral}</div>
        </div>
        <button className="tts-btn" onClick={() => speakText(story.english).catch(console.error)}>
          <SpeakIcon size={15} />
          <span>Read story aloud</span>
          <span className="tts-badge">{ELEVENLABS_API_KEY ? "11Labs" : "Browser"}</span>
        </button>
      </div>
      {story.panels.length > 0 && (
        <>
          <div className="comic-label">Your comic</div>
          <div className="comic-grid">
            {story.panels.map(p => <PanelCard key={p.id} panel={p} onSpeak={t => speakText(t).catch(console.error)} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// WRITE TAB
// ─────────────────────────────────────────────
const IDEA_CHIPS = [
  { label: "A dragon who wants to cook", idea: "Un dragón que quiere ser chef y cocinar para todos sus amigos", color: "#F7C5D8" },
  { label: "A princess underwater", idea: "Una princesa que descubre un reino secreto bajo el mar", color: "#D8D0F8" },
  { label: "A kitten in space", idea: "Un gatito astronauta que viaja a la luna y hace amigos con las estrellas", color: "#B8E8C8" },
  { label: "A friendly robot", idea: "Un robot amigable que aprende a hacer amigos en la escuela", color: "#FFD8B0" },
  { label: "A tiny wizard", idea: "Un pequeño mago que pierde su varita y tiene que encontrarla antes del gran espectáculo", color: "#D8D0F8" },
  { label: "A whale who sings", idea: "Una ballena que tiene una voz hermosa y quiere cantar en el gran concierto del océano", color: "#B8D8F8" },
];

function WriteTab({ onSave }: { onSave: (s: Story) => void }) {
  const [input, setInput] = useState("");
  const [step, setStep] = useState<WriteStep>("idle");
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!input.trim()) return;
    setStep("generating"); setError(""); setStory(null);
    try {
      const result = await generateStory(input.trim());
      setStep("imaging");
      const panels: ComicPanel[] = result.panels.map((p: { description: string; caption: string }, i: number) => ({
        id: i + 1, description: p.description, caption: p.caption, imageUrl: comicUrl(p.description, i + 1),
      }));
      setStory({ id: Date.now().toString(), title: result.title, english: result.english, moral: result.moral, panels, spanish: input.trim(), createdAt: new Date().toISOString().split("T")[0], author: "You", likes: 0, liked: false });
      setStep("done");
    } catch (err) {
      console.error(err);
      setError("Something went wrong — please check your Gemini API key and try again.");
      setStep("idle");
    }
  }

  const loadingSteps = [
    { key: "generating", label: "Reading your idea in Spanish..." },
    { key: "imaging", label: "Writing your English story..." },
    { key: "done", label: "Painting your comic panels..." },
  ];

  if (step === "generating" || step === "imaging") {
    return (
      <div className="write-wrap">
        <div className="loading-portal">
          <div className="loading-orb">
            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div className="loading-title">The magic is happening!</div>
          <div className="loading-sub">Your story is being written and your comic is being painted just for you...</div>
          <div className="p-steps">
            {loadingSteps.map((s) => {
              const isDone = s.key === "generating" && step === "imaging";
              const isActive = s.key === step;
              return (
                <div key={s.key} className={`p-step ${isActive ? "active" : isDone ? "done" : ""}`}>
                  <div className="p-dot" /> {s.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (step === "done" && story) {
    return (
      <div className="write-wrap">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="sv-card">
            <div className="sv-title">{story.title}</div>
            <div className="sv-text">{story.english}</div>
            <div className="lesson">
              <div className="lesson-lbl">Today's lesson</div>
              <div className="lesson-txt">{story.moral}</div>
            </div>
            <button className="tts-btn" onClick={() => speakText(story.english).catch(console.error)}>
              <SpeakIcon size={15} />
              <span>Read my story aloud</span>
              <span className="tts-badge">{ELEVENLABS_API_KEY ? "11Labs" : "Browser"}</span>
            </button>
          </div>
          {story.panels.length > 0 && (
            <>
              <div className="comic-label">Your comic</div>
              <div className="comic-grid">
                {story.panels.map(p => <PanelCard key={p.id} panel={p} onSpeak={t => speakText(t).catch(console.error)} />)}
              </div>
            </>
          )}
          <button className="save-btn" onClick={() => { if (story) { onSave(story); setStory(null); setStep("idle"); setInput(""); } }}>
            Save to top stories
          </button>
          <button className="again-btn" onClick={() => { setStory(null); setStep("idle"); setInput(""); }}>
            Write another story
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="write-wrap">

      {/* Hero */}
      <div className="write-hero">
        <div className="write-sparkles">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9B8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFE066" stroke="#F0C000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A8D8B9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <h1 className="write-hero-title">Create a <span className="magic-word">magical</span> story!</h1>
        <p className="write-hero-sub">Write your idea in Spanish and watch it transform into an English story with its very own comic strip!</p>
      </div>

      {/* How it works */}
      <div className="magic-steps">
        <div className="magic-step ms-pk">
          <div className="ms-num">1</div>
          <div className="ms-icon"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
          <div className="ms-title">Write your idea</div>
          <div className="ms-desc">In Spanish — anything you can imagine!</div>
        </div>
        <div className="magic-step ms-lv">
          <div className="ms-num">2</div>
          <div className="ms-icon"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
          <div className="ms-title">AI creates it</div>
          <div className="ms-desc">A full English story just for you!</div>
        </div>
        <div className="magic-step ms-mn">
          <div className="ms-num">3</div>
          <div className="ms-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></div>
          <div className="ms-title">Get your comic</div>
          <div className="ms-desc">4 pictures bring your story to life!</div>
        </div>
      </div>

      {/* Idea chips */}
      <div className="suggestions-lbl">
        <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Need ideas? Pick one!
      </div>
      <div className="chips">
        {IDEA_CHIPS.map(c => (
          <button key={c.label} className="chip" onClick={() => setInput(c.idea)}>
            <div className="chip-dot" style={{ background: c.color }} />
            {c.label}
          </button>
        ))}
      </div>

      {/* Write card */}
      <div className="w-card">
        <div className="w-card-header">
          <div className="w-card-icon">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <div>
            <div className="w-card-title">Your story idea</div>
            <div className="w-card-sub">Write in Spanish — any length, any idea!</div>
          </div>
        </div>
        <div className="spanish-flag">
          <div className="flag-badge" />
          <span className="flag-lbl">Write in Spanish</span>
        </div>
        <textarea
          className="big-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu idea aquí... por ejemplo: 'Había una vez un dragón morado llamado Luna que vivía en lo alto de una montaña mágica...'"
        />
        <div className="char-row">
          <span className="char-hint">Any idea works — short or long!</span>
          <span className="char-count">{input.length} characters</span>
        </div>
        {error && <p className="err">{error}</p>}
      </div>

      {/* Create button */}
      <button className="create-btn" onClick={handleCreate} disabled={!input.trim() || !GEMINI_API_KEY}>
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        {!GEMINI_API_KEY ? "Add VITE_GEMINI_API_KEY to .env first" : "Create my magical story!"}
      </button>
      <div className="create-btn-sub">Your story and comic will appear here</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS TAB
// ─────────────────────────────────────────────
function SettingsTab() {
  const [tts, setTts] = useState(true);
  const [comics, setComics] = useState(true);
  const [notifs, setNotifs] = useState(false);
  const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
    <button className={`toggle ${on ? "on" : "off"}`} onClick={toggle}><div className="tdot" /></button>
  );
  return (
    <div className="settings-wrap">
      <div className="page-title">Settings</div>
      <div className="page-sub">Customize your experience</div>
      <div className="s-scard">
        <div className="s-scard-title">Features</div>
        <div className="s-row"><div><div className="s-lbl">Read stories aloud</div><div className="s-desc">Hear stories in a friendly voice</div></div><Toggle on={tts} toggle={() => setTts(v => !v)} /></div>
        <div className="s-row"><div><div className="s-lbl">Comic panels</div><div className="s-desc">Generate illustrations for your story</div></div><Toggle on={comics} toggle={() => setComics(v => !v)} /></div>
        <div className="s-row"><div><div className="s-lbl">Notifications</div><div className="s-desc">Get notified about new stories</div></div><Toggle on={notifs} toggle={() => setNotifs(v => !v)} /></div>
      </div>
      <div className="s-scard">
        <div className="s-scard-title">API status</div>
        <div className="s-row"><div className="s-lbl">Gemini AI</div><div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#AAA" }}><div className={`api-dot ${GEMINI_API_KEY ? "api-ok" : "api-miss"}`} />{GEMINI_API_KEY ? "Connected" : "Add your key"}</div></div>
        <div className="s-row"><div className="s-lbl">ElevenLabs voice</div><div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#AAA" }}><div className={`api-dot ${ELEVENLABS_API_KEY ? "api-ok" : "api-miss"}`} />{ELEVENLABS_API_KEY ? "Connected" : "Coming soon"}</div></div>
        <div className="s-row"><div className="s-lbl">Comic generator</div><div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#50906A" }}><div className="api-dot api-ok" />Always ready</div></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PROFILE TAB
// ─────────────────────────────────────────────
function ProfileTab({ stories }: { stories: Story[] }) {
  const mine = stories.filter(s => s.author === "You");
  const likes = mine.reduce((a, s) => a + s.likes, 0);
  return (
    <div className="profile-wrap">
      <div className="page-title">My profile</div>
      <div className="p-hero">
        <div className="avatar">S</div>
        <div>
          <div className="p-name">Young Storyteller</div>
          <div className="p-sub">Soleada Kids member</div>
          <div className="level-badge"><StarIcon /> Level 3 — Story Explorer</div>
        </div>
      </div>
      <div className="stats-row">
        <div className="stat-card s-pk"><div className="stat-num">{mine.length}</div><div className="stat-lbl">Stories written</div></div>
        <div className="stat-card s-mn"><div className="stat-num">{likes}</div><div className="stat-lbl">Likes earned</div></div>
        <div className="stat-card s-lv"><div className="stat-num">{stories.length}</div><div className="stat-lbl">Stories read</div></div>
      </div>
      <div className="ach-card">
        <div className="ach-title">My badges</div>
        <div className="badge-row">
          {[
            { name: "First Story", icon: <WriteIcon /> },
            { name: "Liked", icon: <HeartIcon /> },
            { name: "Bookworm", icon: <BookIcon /> },
            { name: "Rising Star", icon: <StarIcon /> },
          ].map(b => (
            <div className="badge" key={b.name}>
              <div className="badge-icon">{b.icon}</div>
              <div className="badge-name">{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function Kids() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("home");
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [viewing, setViewing] = useState<Story | null>(null);

  function switchTab(t: Tab) { setTab(t); setViewing(null); }

  const tabs: { key: Tab; label: string; Icon: () => JSX.Element }[] = [
    { key: "home", label: "Home", Icon: HomeIcon },
    { key: "write", label: "Write", Icon: WriteIcon },
    { key: "settings", label: "Settings", Icon: SettingsIcon },
    { key: "profile", label: "Profile", Icon: ProfileIcon },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <nav className="topnav">
          <button className="back-btn" onClick={() => navigate("/")}>← Home</button>
          <span className="logo">soleada</span>
          <span className="kids-pill">Kids</span>
          <div className="nav-tabs">
            {tabs.map(({ key, label, Icon }) => (
              <button key={key} className={`k-tab${tab === key ? " active" : ""}`} onClick={() => switchTab(key)}>
                <Icon /> {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Home renders its own hero + content wrapper */}
        {tab === "home" && !viewing && (
          <HomeTab stories={stories}
            onView={setViewing}
            onLike={id => setStories(prev => prev.map(s => s.id === id ? { ...s, liked: !s.liked, likes: s.liked ? s.likes - 1 : s.likes + 1 } : s))}
            onWrite={() => switchTab("write")}
          />
        )}

        {/* All other tabs use the standard content wrapper */}
        {(tab !== "home" || viewing) && (
          <div className="content">
            {tab === "home" && viewing && <StoryViewer story={viewing} onBack={() => setViewing(null)} />}
            {tab === "write" && <WriteTab onSave={s => { setStories(p => [s, ...p]); switchTab("home"); }} />}
            {tab === "settings" && <SettingsTab />}
            {tab === "profile" && <ProfileTab stories={stories} />}
          </div>
        )}
      </div>
    </>
  );
}