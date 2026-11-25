import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FOOD2_THEMES } from '@/data/themes';
import { withAlpha } from '@/components/color';
import { playClickSound } from '@/utils/sound';
import { Card, ChefBrief, FinishCard, FoodShell, Hud, HintButton, ProTip, Tabs2, Toast, useLang, useRun, useToast, type Run } from '@/components/kit';
import { MatchTask, useDoneSet, type Bi2, type MatchItem, type MatchZone } from '@/components/tasks';

const T = FOOD2_THEMES.egg;
const bi = (en: string, hi: string): Bi2 => ({ en, hi });

/* ---------------- Egg anatomy: tap the part ---------------- */
const PARTS = [
  { id: 'shell', name: bi('Shell', 'छिलका'), clue: bi('the hard outer layer, made mostly of calcium carbonate', 'कठोर बाहरी परत, मुख्यतः कैल्शियम कार्बोनेट की'), fact: bi('The shell protects the egg but is porous — wash eggs only just before use.', 'छिलका रक्षा करता है पर छिद्रयुक्त है — अंडे उपयोग से ठीक पहले धोएँ।') },
  { id: 'air', name: bi('Air cell', 'वायु कोष'), clue: bi('the pocket at the broad end that gets bigger as the egg gets older', 'चौड़े सिरे की जेब जो अंडा पुराना होने पर बड़ी होती है'), fact: bi('A big air cell means an old egg — this is why old eggs float.', 'बड़ा वायु कोष = पुराना अंडा — इसीलिए पुराने अंडे तैरते हैं।') },
  { id: 'white', name: bi('Albumen (egg white)', 'एल्ब्यूमिन (सफ़ेदी)'), clue: bi('the clear thick liquid around the yolk, mostly water and protein', 'ज़र्दी के चारों ओर साफ़ गाढ़ा तरल, मुख्यतः पानी व प्रोटीन'), fact: bi('Albumen sets white at about 62–65 °C and whips into foam.', 'एल्ब्यूमिन लगभग 62–65 °C पर सफ़ेद जमता है और फेंटने पर झाग बनाता है।') },
  { id: 'yolk', name: bi('Yolk', 'ज़र्दी'), clue: bi('the yellow centre rich in fat, vitamins and the emulsifier lecithin', 'पीला केंद्र जिसमें वसा, विटामिन व इमल्सीफ़ायर लेसिथिन है'), fact: bi('Lecithin in the yolk is what makes mayonnaise hold together.', 'ज़र्दी का लेसिथिन ही मेयोनेज़ को जोड़े रखता है।') },
  { id: 'chalaza', name: bi('Chalaza', 'कैलाज़ा'), clue: bi('the twisted white cords that hold the yolk in the centre', 'ज़र्दी को बीच में थामने वाली मुड़ी सफ़ेद डोरियाँ'), fact: bi('Chalazae show the egg is fresh; they are harmless and can be strained out.', 'कैलाज़ा ताज़गी दर्शाते हैं; हानिरहित हैं और छाने जा सकते हैं।') },
];

function Anatomy({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [i, setI] = useState(0); const [found, setFound] = useState<string[]>([]);
  const { toast, say } = useToast();
  const p = PARTS[i];
  useEffect(() => { if (found.length === PARTS.length) onDone(); /* eslint-disable-next-line */ }, [found.length]);
  const tap = (id: string) => {
    if (found.length >= PARTS.length) return;
    if (id === p.id) {
      run.add(4); setFound((f) => [...f, id]);
      playClickSound('success');
      say('ok', L(`${p.name.en}! ${p.fact.en}`, `${p.name.hi}! ${p.fact.hi}`));
      if (i + 1 < PARTS.length) setI(i + 1);
    } else {
      run.miss(); playClickSound('error');
      const w = PARTS.find((x) => x.id === id)!;
      say('bad', L(`That is the ${w.name.en.toLowerCase()}. Look for ${p.clue.en}.`, `वह ${w.name.hi} है। खोजें: ${p.clue.hi}।`));
    }
  };
  const hint = () => { run.hint(); say('info', p.id === 'air' ? L('Look at the broad end, just under the shell.', 'चौड़े सिरे पर, छिलके के ठीक नीचे देखें।') : p.id === 'chalaza' ? L('They are thin strands on either side of the yolk.', 'ये ज़र्दी के दोनों ओर पतली डोरियाँ हैं।') : L(`It is ${p.clue.en}.`, `यह है: ${p.clue.hi}।`)); };
  const f = (id: string) => (found.includes(id) ? 0.95 : 0.55);
  return (
    <div className="space-y-3" data-testid="anatomy">
      <Card><p className="text-sm font-semibold" data-testid="anatomy-prompt">{found.length < PARTS.length ? L(`Identify: ${p.clue.en}`, `पहचानें: ${p.clue.hi}`) : L('All five anatomical parts found!', 'पाँचों भाग मिल गए!')}</p></Card>
      <div className="flex justify-center gap-1.5 flex-wrap">
        {PARTS.map((pt) => (
          <button key={pt.id} onClick={() => tap(pt.id)} disabled={found.includes(pt.id)} className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${found.includes(pt.id) ? 'bg-green-100 text-green-800 border-green-300' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'}`}>
            {L(pt.name.en, pt.name.hi)}{found.includes(pt.id) ? ' ✓' : ''}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 240 190" className="w-full max-w-xs mx-auto">
        <g onClick={() => tap('shell')} data-part="shell" style={{ cursor: 'pointer' }}><ellipse cx="120" cy="95" rx="78" ry="90" fill="#fde7c4" stroke="#b45309" strokeWidth="6" opacity={f('shell')} /></g>
        <ellipse cx="120" cy="95" rx="72" ry="84" fill="#fff7ed" stroke="#fcd9a8" strokeWidth="1.5" />
        <g onClick={() => tap('white')} data-part="white" style={{ cursor: 'pointer' }}><ellipse cx="120" cy="100" rx="64" ry="72" fill="#fffef5" stroke="#e5e7eb" opacity={f('white')} /></g>
        <g onClick={() => tap('air')} data-part="air" style={{ cursor: 'pointer' }}><path d="M78 36 Q120 -2 162 36 Q120 18 78 36Z" fill="#bae6fd" stroke="#38bdf8" opacity={f('air')} /></g>
        <g onClick={() => tap('chalaza')} data-part="chalaza" style={{ cursor: 'pointer' }}>
          <path d="M96 100 q-22 -6 -30 -22" stroke="#9ca3af" strokeWidth="3" fill="none" /><path d="M144 100 q22 6 30 22" stroke="#9ca3af" strokeWidth="3" fill="none" />
          <rect x="56" y="66" width="30" height="24" fill="transparent" /><rect x="154" y="108" width="30" height="24" fill="transparent" />
        </g>
        <g onClick={() => tap('yolk')} data-part="yolk" style={{ cursor: 'pointer' }}><circle cx="120" cy="100" r="28" fill="#fbbf24" stroke="#d97706" strokeWidth="2" opacity={f('yolk')} /></g>
        {found.map((id) => <text key={id} x="236" y={20 + PARTS.findIndex((p2) => p2.id === id) * 14} fontSize="9" textAnchor="end" fill="#15803d">✓ {L(PARTS.find((p2) => p2.id === id)!.name.en, PARTS.find((p2) => p2.id === id)!.name.hi)}</text>)}
      </svg>
      <div className="flex items-center justify-between">
        <HintButton onHint={hint} accent={T.accent} />
        {found.length === PARTS.length && (
          <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
            {L('Next: Boiling Lab', 'अगला: उबालना लैब')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

/* ---------------- Boiling timer ---------------- */
const GOALS = [
  { id: 'soft', t: bi('Soft-boiled: set white, runny yolk', 'सॉफ़्ट-बॉइल्ड: जमी सफ़ेदी, बहती ज़र्दी'), min: 3, max: 4, cool: false },
  { id: 'medium', t: bi('Medium: creamy, jammy yolk', 'मीडियम: मलाईदार, जैम-सी ज़र्दी'), min: 6, max: 7, cool: false },
  { id: 'hard', t: bi('Hard-boiled: firm yolk, no green ring', 'हार्ड-बॉइल्ड: ठोस ज़र्दी, हरा छल्ला नहीं'), min: 10, max: 12, cool: true },
];

function Boil({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [gi, setGi] = useState(0); const [m, setM] = useState(3.5); const [cold, setCold] = useState(false);
  const [ok, setOk] = useState([false, false, false]);
  const { toast, say } = useToast();
  const g = GOALS[gi];
  useEffect(() => { if (ok.every(Boolean)) onDone(); /* eslint-disable-next-line */ }, [ok]);
  const ring = m >= 13 && !cold;
  const yolk = m < 4 ? 'runny' : m < 8 ? 'jammy' : 'firm';
  const yolkFill = yolk === 'runny' ? '#f59e0b' : yolk === 'jammy' ? '#fbbf24' : '#fde68a';
  const whiteFill = m < 2 ? '#e2e8f0' : m < 3 ? '#f1f5f9' : '#fffef5';

  const serve = () => {
    if (ok[gi]) return;
    if (m < g.min) {
      run.miss(); playClickSound('error');
      say('bad', L(`Under-cooked for this style (${m} min). Boil a little longer.`, `इस प्रकार हेतु कच्चा (${m} मिनट)। थोड़ा और उबालें।`));
    } else if (m > g.max) {
      run.miss(); playClickSound('error');
      say('bad', L(`Over-cooked (${m} min)${ring ? ' — a green-grey ring has formed around the yolk' : ''}. Reduce time.`, `ज़्यादा पका (${m} मिनट)${ring ? ' — ज़र्दी के चारों ओर हरा-स्लेटी छल्ला बन गया' : ''}। समय घटाएँ।`));
    } else if (g.cool && !cold) {
      run.miss(); playClickSound('error');
      say('bad', L('Time is right, but plunge into cold water straight away to stop cooking and prevent the ring.', 'समय सही है, पर पकना व छल्ला रोकने हेतु अंडे को तुरंत ठंडे पानी में डालें।'));
    } else {
      run.add(8); setOk((o) => o.map((v, i) => (i === gi ? true : v)));
      playClickSound('success');
      say('ok', L(`Perfect ${g.t.en.split(':')[0].toLowerCase()} egg! Time and temperature control the yolk.`, `बढ़िया ${g.t.hi.split(':')[0]} अंडा! समय व तापमान ज़र्दी तय करते हैं।`));
    }
  };

  const hint = () => { run.hint(); say('info', L(`${g.t.en.split(':')[0]}: about ${g.min}–${g.max} minutes${g.cool ? ', then cold water' : ''}.`, `${g.t.hi.split(':')[0]}: लगभग ${g.min}–${g.max} मिनट${g.cool ? ', फिर ठंडा पानी' : ''}।`)); };

  return (
    <div className="space-y-2" data-testid="boil">
      <div className="flex gap-1.5 flex-wrap">{GOALS.map((x, i) => <button key={x.id} data-goal={x.id} onClick={() => { setGi(i); setM(i === 0 ? 3.5 : i === 1 ? 6.5 : 11); setCold(i === 2); say('info', null); }} className={`px-3 py-1.5 rounded-lg border text-xs ${gi === i ? 'font-bold border-2' : ''}`} style={gi === i ? { borderColor: T.accent } : undefined}>{L(x.t.en.split(':')[0], x.t.hi.split(':')[0])}{ok[i] ? ' ✓' : ''}</button>)}</div>
      <Card><p className="text-xs">{L(g.t.en, g.t.hi)}</p></Card>
      <svg viewBox="0 0 200 110" className="w-full max-w-xs mx-auto" data-testid="boil-egg" data-yolk={yolk} data-ring={ring ? '1' : '0'}>
        <ellipse cx="100" cy="55" rx="62" ry="46" fill={whiteFill} stroke="#d1d5db" strokeWidth="2" />
        {ring && <circle cx="100" cy="55" r="27" fill="none" stroke="#6b8e6b" strokeWidth="5" />}
        <motion.circle cx="100" cy="55" r="22" animate={{ fill: yolkFill }} stroke={yolk === 'firm' ? '#d6b34a' : '#d97706'} strokeWidth="1.5" strokeDasharray={yolk === 'runny' ? '3 2' : undefined} />
        {yolk === 'runny' && <path d="M90 55 q10 12 20 0" stroke="#fff" opacity=".5" fill="none" />}
        <text x="100" y="106" fontSize="9" textAnchor="middle" fill="#475569">{m} min · {yolk === 'runny' ? L('runny yolk', 'बहती ज़र्दी') : yolk === 'jammy' ? L('creamy yolk', 'मलाईदार ज़र्दी') : L('firm yolk', 'ठोस ज़र्दी')}{ring ? L(' · green ring!', ' · हरा छल्ला!') : ''}</text>
      </svg>
      <label className="block text-xs font-semibold">{L('Boiling time', 'उबालने का समय')}: <span className="font-mono">{m} {L('min', 'मिनट')}</span><input type="range" min={0} max={16} step={0.5} value={m} onChange={(e) => setM(+e.target.value)} data-slider="boil" disabled={ok[gi]} className="w-full" style={{ accentColor: T.accent }} /></label>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={cold} onChange={(e) => setCold(e.target.checked)} data-testid="cold-toggle" disabled={ok[gi]} /> 🧊 {L('Cool in cold water straight away', 'तुरंत ठंडे पानी में डालें')}</label>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={serve} disabled={ok[gi]} data-testid="boil-serve" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>🥚 {L('Serve', 'परोसें')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        {ok[gi] && gi < GOALS.length - 1 && (
          <button onClick={() => { setGi(gi + 1); setM(gi === 0 ? 6.5 : 11); setCold(gi === 1); say('info', null); }} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {L('Next style', 'अगला प्रकार')} →
          </button>
        )}
      </div>
      {ok.every(Boolean) && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-green-900 dark:text-green-200">✅ {L('All three egg boiling doneness levels mastered!', 'तीनों उबले अंडे के स्तर सिद्ध हुए!')}</p>
          </div>
          <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
            {L('Next: Freshness Float Test', 'अगला: ताज़गी फ्लोट टेस्ट')} →
          </button>
        </motion.div>
      )}
      <Toast {...toast} />
    </div>
  );
}

/* ---------------- Float test ---------------- */
const FLOATS = [
  { id: 'f1', behaviour: bi('sinks and lies flat on its side', 'डूबकर बगल से सपाट लेट जाता है'), y: 100, rot: 90, right: 0 },
  { id: 'f2', behaviour: bi('sinks but stands upright on its point', 'डूबता है पर नुकीले सिरे पर खड़ा रहता है'), y: 92, rot: 0, right: 1 },
  { id: 'f3', behaviour: bi('floats to the top', 'ऊपर तैरता है'), y: 30, rot: 0, right: 2 },
];
const DECISIONS = [bi('Very fresh — poach or fry', 'बहुत ताज़ा — पोच या फ़्राई'), bi('Older — best for hard-boiling', 'पुराना — हार्ड-बॉइल हेतु बेहतर'), bi('Stale — discard it', 'बासी — फेंक दें')];

function FloatTest({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [dropped, setDropped] = useState<string[]>([]); const [dec, setDec] = useState<Record<string, number>>({});
  const { toast, say } = useToast();
  useEffect(() => { if (Object.keys(dec).length === 3) onDone(); /* eslint-disable-next-line */ }, [dec]);
  const decide = (f: typeof FLOATS[number], k: number) => {
    if (dec[f.id] !== undefined) return;
    if (k === f.right) {
      run.add(3); setDec((d) => ({ ...d, [f.id]: k }));
      playClickSound('success');
      say('ok', L('Correct! The air cell grows with age, so older eggs stand up and the oldest float.', 'सही! उम्र बढ़ने से वायु कोष बड़ा होता है, इसलिए पुराने अंडे खड़े होते हैं और सबसे पुराने तैरते हैं।'));
    } else {
      run.miss(); playClickSound('error');
      say('bad', L('Think about the air cell: flat = freshest, upright = older, floating = stale.', 'वायु कोष सोचें: सपाट = सबसे ताज़ा, खड़ा = पुराना, तैरता = बासी।'));
    }
  };
  const hint = () => { run.hint(); say('info', L('Flat → very fresh. Upright → older. Floats → throw away.', 'सपाट → बहुत ताज़ा। खड़ा → पुराना। तैरता → फेंक दें।')); };
  return (
    <div className="space-y-3" data-testid="float">
      <p className="text-xs text-stone-600 dark:text-stone-300">{L('Drop each egg into water, observe its buoyancy, then decide how to use it.', 'हर अंडे को पानी में डालें, स्थिति देखें, फिर तय करें कैसे उपयोग करें।')}</p>
      <div className="grid sm:grid-cols-3 gap-2">
        {FLOATS.map((f, i) => {
          const d = dropped.includes(f.id);
          return (
            <Card key={f.id} className="space-y-2">
              <svg viewBox="0 0 100 130" className="w-full max-w-[110px] mx-auto"><rect x="15" y="25" width="70" height="100" rx="6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" /><rect x="17" y="45" width="66" height="78" fill="#bae6fd" opacity=".6" />
                <motion.g initial={{ y: -20 }} animate={{ y: d ? f.y - 40 : -20, rotate: d ? f.rot : 0 }} transition={{ type: 'spring', stiffness: 60, damping: 10 }} style={{ transformOrigin: '50px 60px' }}><ellipse cx="50" cy="60" rx="13" ry="17" fill="#fde7c4" stroke="#b45309" /></motion.g></svg>
              <button onClick={() => { playClickSound('neutral'); setDropped((x) => [...x, f.id]); }} disabled={d} data-egg={f.id} className="w-full px-2 py-1.5 rounded-lg text-white text-xs font-bold disabled:opacity-40 shadow-sm" style={{ background: T.accent }}>💧 {L(`Drop egg ${i + 1}`, `अंडा ${i + 1} डालें`)}</button>
              {d && <p className="text-[11px] text-stone-600 dark:text-stone-300 text-center font-medium">{L(f.behaviour.en, f.behaviour.hi)}</p>}
              {d && <div className="grid gap-1">{DECISIONS.map((x, k) => <button key={k} data-decide={`${f.id}-${k}`} disabled={dec[f.id] !== undefined} onClick={() => decide(f, k)} className={`text-[11px] px-2 py-1.5 rounded-md border font-medium ${dec[f.id] === k ? 'bg-green-100 text-green-900 border-green-400 font-bold' : 'bg-white dark:bg-slate-900'}`}>{L(x.en, x.hi)}</button>)}</div>}
            </Card>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <HintButton onHint={hint} accent={T.accent} />
        {Object.keys(dec).length === 3 && (
          <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
            {L('Next: Egg Styles', 'अगला: अंडा प्रकार')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

const EZ: MatchZone[] = ['boiled', 'poached', 'fried', 'scrambled', 'omelette'].map((id) => ({ id, emoji: { boiled: '🥚', poached: '🫕', fried: '🍳', scrambled: '🥄', omelette: '🌯' }[id], label: { boiled: bi('Boiled', 'उबला'), poached: bi('Poached', 'पोच्ड'), fried: bi('Fried', 'तला'), scrambled: bi('Scrambled', 'स्क्रैम्बल्ड'), omelette: bi('Omelette', 'ऑमलेट') }[id]! }));
const EI: MatchItem[] = [
  { id: 'e1', cat: 'boiled', emoji: '🥚', label: bi('Cooked in the shell in hot water', 'छिलके सहित गरम पानी में पकाया'), why: bi('Boiled eggs cook in the shell.', 'उबले अंडे छिलके में पकते हैं।') },
  { id: 'e2', cat: 'boiled', emoji: '😈', label: bi('Devilled eggs', 'डेविल्ड एग्स'), why: bi('Devilled eggs use hard-boiled eggs with a seasoned yolk filling.', 'डेविल्ड एग्स में उबले अंडे की मसालेदार ज़र्दी भरी जाती है।') },
  { id: 'e3', cat: 'poached', emoji: '🫕', label: bi('Cracked into barely simmering water', 'मुश्किल से उबलते पानी में तोड़कर'), why: bi('Poaching uses gently simmering water — no shell.', 'पोचिंग में धीमे उबलते पानी में बिना छिलके पकता है।') },
  { id: 'e4', cat: 'poached', emoji: '🧈', label: bi('Eggs Benedict (on muffin with hollandaise)', 'एग्स बेनेडिक्ट (मफ़िन पर हॉलैंडेज़ संग)'), why: bi('Eggs Benedict is a classic poached-egg dish.', 'एग्स बेनेडिक्ट क्लासिक पोच्ड-एग व्यंजन है।') },
  { id: 'e5', cat: 'fried', emoji: '☀️', label: bi('Sunny side up in a little hot fat', 'थोड़ी गरम चर्बी में सनी-साइड-अप'), why: bi('Fried eggs are cooked in shallow fat.', 'तले अंडे कम चर्बी में पकते हैं।') },
  { id: 'e6', cat: 'scrambled', emoji: '🥄', label: bi('Stirred gently in butter into soft curds', 'मक्खन में धीरे चलाकर नरम थक्के'), why: bi('Scrambled eggs are stirred as they set.', 'स्क्रैम्बल्ड अंडे जमते समय चलाए जाते हैं।') },
  { id: 'e7', cat: 'omelette', emoji: '🌯', label: bi('Beaten, cooked flat and folded', 'फेंटकर, चपटा पकाकर मोड़ा'), why: bi('An omelette is beaten eggs cooked flat and folded.', 'ऑमलेट फेंटे अंडे को चपटा पकाकर मोड़ना है।') },
];

function EggLab({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [sub, setSub] = useState<'anat' | 'boil' | 'float' | 'style'>('anat');
  const [d, setD] = useState<Record<string, boolean>>({});
  useEffect(() => { if (d.anat && d.boil && d.float && d.style) onDone(); /* eslint-disable-next-line */ }, [d]);
  const m = (k: string) => () => setD((x) => (x[k] ? x : { ...x, [k]: true }));
  const tabs: { id: typeof sub; label: string }[] = [{ id: 'anat', label: L('Anatomy', 'संरचना') }, { id: 'boil', label: L('Boiling', 'उबालना') }, { id: 'float', label: L('Freshness', 'ताज़गी') }, { id: 'style', label: L('Styles', 'प्रकार') }];
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">{tabs.map((t) => <button key={t.id} data-sub={t.id} onClick={() => setSub(t.id)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === t.id ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === t.id ? { background: T.accent, borderColor: T.accent } : undefined}>{t.label}{d[t.id] ? ' ✓' : ''}</button>)}</div>
      <div style={{ display: sub === 'anat' ? 'block' : 'none' }}><Anatomy run={run} onDone={m('anat')} onNext={() => setSub('boil')} /></div>
      <div style={{ display: sub === 'boil' ? 'block' : 'none' }}><Boil run={run} onDone={m('boil')} onNext={() => setSub('float')} /></div>
      <div style={{ display: sub === 'float' ? 'block' : 'none' }}><FloatTest run={run} onDone={m('float')} onNext={() => setSub('style')} /></div>
      <div style={{ display: sub === 'style' ? 'block' : 'none' }}>
        <MatchTask items={EI} zones={EZ} run={run} accent={T.accent} points={2} cols={3} onDone={m('style')} />
        {d.anat && d.boil && d.float && d.style && (
          <div className="flex justify-end mt-3">
            <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
              {L('Next: Emulsions & Salads', 'अगला: इमल्शन व सलाद')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Emulsions & salads ---------------- */
function Emulsion({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [dish, setDish] = useState<'vinaigrette' | 'mayo'>('vinaigrette');
  const [emul, setEmul] = useState<'none' | 'mustard' | 'yolk'>('none');
  const [oil, setOil] = useState(3);
  const [shaken, setShaken] = useState(false); const [rested, setRested] = useState(false);
  const [ok, setOk] = useState({ vinaigrette: false, mayo: false });
  const { toast, say } = useToast();
  useEffect(() => { if (ok.vinaigrette && ok.mayo) onDone(); /* eslint-disable-next-line */ }, [ok]);
  const stable = emul !== 'none';
  const reset = () => { setShaken(false); setRested(false); };
  const shake = () => { playClickSound('neutral'); setShaken(true); setRested(false); say('info', L('Shaken — oil breaks into tiny droplets. Now let it rest.', 'हिलाया — तेल छोटी बूँदों में टूटा। अब रखकर देखें।')); };
  const rest = () => {
    if (!shaken) { say('info', L('Shake the jar first.', 'पहले जार हिलाएँ।')); return; }
    setRested(true);
    if (dish === 'vinaigrette') {
      if (emul === 'none') { run.miss(); playClickSound('error'); say('bad', L('It split into two layers — oil and vinegar do not mix without an emulsifier. Add mustard.', 'दो परतें बन गईं — इमल्सीफ़ायर बिना तेल-सिरका नहीं मिलते। सरसों डालें।')); }
      else if (oil !== 3) { run.miss(); playClickSound('error'); say('bad', L(`It holds, but a classic vinaigrette is 3 parts oil : 1 part vinegar (you used ${oil}:1).`, `टिका है, पर क्लासिक विनेग्रेट 3 भाग तेल : 1 भाग सिरका होता है (आपने ${oil}:1 रखा)।`)); }
      else if (!ok.vinaigrette) { run.add(10); setOk((o) => ({ ...o, vinaigrette: true })); playClickSound('success'); say('ok', L('Vinaigrette 3:1 with mustard — a temporary emulsion that stays blended for a while; shake before serving.', 'सरसों संग विनेग्रेट 3:1 — अस्थायी इमल्शन जो कुछ देर टिकता है; परोसने से पहले हिलाएँ।')); }
    } else {
      if (emul !== 'yolk') { run.miss(); playClickSound('error'); say('bad', L('Mayonnaise needs egg yolk — its lecithin binds oil and acid into a thick, stable emulsion.', 'मेयोनेज़ को अंडे की ज़र्दी चाहिए — उसका लेसिथिन तेल व अम्ल को गाढ़े स्थिर इमल्शन में बाँधता है।')); }
      else if (!ok.mayo) { run.add(10); setOk((o) => ({ ...o, mayo: true })); playClickSound('success'); say('ok', L('Mayonnaise: yolk + oil added slowly + acid — a stable (permanent) emulsion.', 'मेयोनेज़: ज़र्दी + धीरे डाला तेल + अम्ल — स्थिर (स्थायी) इमल्शन।')); }
    }
  };
  const hint = () => { run.hint(); say('info', dish === 'vinaigrette' ? L('Use mustard as the emulsifier and set oil to 3 parts.', 'इमल्सीफ़ायर सरसों रखें और तेल 3 भाग करें।') : L('Choose egg yolk as the emulsifier.', 'इमल्सीफ़ायर अंडे की ज़र्दी चुनें।')); };
  const layers = rested && !stable;
  return (
    <div className="space-y-2" data-testid="emulsion">
      <div className="flex gap-1.5">{(['vinaigrette', 'mayo'] as const).map((k) => <button key={k} data-dish={k} onClick={() => { setDish(k); setEmul(k === 'mayo' ? 'yolk' : 'mustard'); setOil(k === 'mayo' ? 5 : 3); reset(); say('info', null); }} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${dish === k ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={dish === k ? { background: T.accent } : undefined}>{k === 'vinaigrette' ? L('Vinaigrette', 'विनेग्रेट') : L('Mayonnaise', 'मेयोनेज़')}{ok[k] ? ' ✓' : ''}</button>)}</div>
      <div className="grid sm:grid-cols-2 gap-3 items-center">
        <div className="mx-auto">
          <svg viewBox="0 0 120 150" className="w-28" data-testid="jar" data-split={layers ? '1' : '0'}>
            <rect x="25" y="20" width="70" height="120" rx="12" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" /><rect x="35" y="8" width="50" height="14" rx="3" fill="#94a3b8" />
            {layers ? (<><rect x="28" y="42" width="64" height={Math.max(14, oil * 14)} rx="3" fill="#facc15" opacity=".85" /><rect x="28" y={42 + Math.max(14, oil * 14)} width="64" height={Math.max(10, 96 - Math.max(14, oil * 14))} fill="#fecaca" opacity=".85" /></>) : (
              <rect x="28" y="42" width="64" height="96" rx="4" fill={stable ? (emul === 'yolk' ? '#fde68a' : '#fcd34d') : '#fde68a'} opacity={shaken ? 0.95 : 0.8} />)}
            {shaken && !layers && [0, 1, 2, 3, 4, 5].map((i) => <motion.circle key={i} cx={40 + i * 9} cy={70 + (i % 3) * 20} r="3" fill="#fff" opacity=".6" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6 + i * 0.1, repeat: Infinity }} />)}
          </svg>
          <p className="text-[11px] text-center text-stone-500 mt-1 font-semibold">{layers ? L('split into layers', 'परतों में बँटा') : shaken ? L('blended', 'मिला हुआ') : L('not shaken', 'हिलाया नहीं')}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold">{L('Emulsifier', 'इमल्सीफ़ायर')}</p>
          <div className="flex gap-1.5 flex-wrap">{(['none', 'mustard', 'yolk'] as const).map((k) => <button key={k} data-emul={k} onClick={() => { setEmul(k); reset(); }} className={`px-3 py-1.5 rounded-lg border text-xs ${emul === k ? 'font-bold border-2' : ''}`} style={emul === k ? { borderColor: T.accent } : undefined}>{k === 'none' ? L('None', 'कोई नहीं') : k === 'mustard' ? `🟡 ${L('Mustard', 'सरसों')}` : `🥚 ${L('Egg yolk', 'ज़र्दी')}`}</button>)}</div>
          <label className="block text-xs font-semibold">{L('Oil : vinegar', 'तेल : सिरका')} = <span className="font-mono">{oil} : 1</span><input type="range" min={1} max={8} value={oil} onChange={(e) => { setOil(+e.target.value); reset(); }} data-slider="oil" className="w-full" style={{ accentColor: T.accent }} /></label>
          <div className="flex gap-2 flex-wrap"><button onClick={shake} data-testid="shake" className="px-3 py-2 rounded-lg text-white text-xs font-bold shadow-sm" style={{ background: T.accent }}>🫙 {L('Shake', 'हिलाएँ')}</button><button onClick={rest} data-testid="rest" className="px-3 py-2 rounded-lg border text-xs font-bold bg-white dark:bg-slate-900 shadow-sm">⏱️ {L('Rest 10 min', '10 मिनट रखें')}</button><HintButton onHint={hint} accent={T.accent} /></div>
        </div>
      </div>
      {ok.vinaigrette && !ok.mayo && (
        <button onClick={() => { setDish('mayo'); setEmul('yolk'); setOil(5); reset(); }} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
          {L('Next: Mayonnaise Emulsion', 'अगला: मेयोनेज़ इमल्शन')} →
        </button>
      )}
      {ok.vinaigrette && ok.mayo && (
        <div className="flex justify-end">
          <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
            {L('Next: Compound Salads', 'अगला: कंपाउंड सलाद')} →
          </button>
        </div>
      )}
      <Toast {...toast} />
    </div>
  );
}

const SALADS = [
  { id: 'waldorf', name: bi('Waldorf salad', 'वाल्डोर्फ़ सलाद'), need: ['apple', 'celery', 'walnut', 'mayo'] },
  { id: 'greek', name: bi('Greek salad', 'ग्रीक सलाद'), need: ['tomato', 'cucumber', 'olive', 'feta', 'onion', 'oil'] },
  { id: 'caesar', name: bi('Caesar salad', 'सीज़र सलाद'), need: ['romaine', 'crouton', 'parmesan', 'caesar'] },
];
const ING: { id: string; e: string; n: Bi2 }[] = [
  { id: 'apple', e: '🍎', n: bi('Apple', 'सेब') }, { id: 'celery', e: '🥬', n: bi('Celery', 'अजवाइन-डंडी') }, { id: 'walnut', e: '🌰', n: bi('Walnuts', 'अखरोट') }, { id: 'mayo', e: '🥣', n: bi('Mayonnaise', 'मेयोनेज़') },
  { id: 'tomato', e: '🍅', n: bi('Tomato', 'टमाटर') }, { id: 'cucumber', e: '🥒', n: bi('Cucumber', 'खीरा') }, { id: 'olive', e: '🫒', n: bi('Olives', 'जैतून') }, { id: 'feta', e: '🧀', n: bi('Feta cheese', 'फ़ेटा चीज़') },
  { id: 'onion', e: '🧅', n: bi('Onion', 'प्याज़') }, { id: 'oil', e: '🫗', n: bi('Olive oil dressing', 'ऑलिव ऑयल ड्रेसिंग') }, { id: 'romaine', e: '🥗', n: bi('Romaine lettuce', 'रोमेन लेट्यूस') }, { id: 'crouton', e: '🍞', n: bi('Croutons', 'क्राउटन') },
  { id: 'parmesan', e: '🧀', n: bi('Parmesan', 'पार्मेज़ान') }, { id: 'caesar', e: '🥫', n: bi('Caesar dressing', 'सीज़र ड्रेसिंग') }, { id: 'prawn', e: '🦐', n: bi('Prawns', 'झींगा') }, { id: 'beet', e: '🥗', n: bi('Beetroot', 'चुकंदर') },
];

function Salad({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const [si, setSi] = useState(0); const [bowl, setBowl] = useState<string[]>([]); const [ok, setOk] = useState([false, false, false]);
  const { toast, say } = useToast();
  const s = SALADS[si];
  useEffect(() => { if (ok.every(Boolean)) onDone(); /* eslint-disable-next-line */ }, [ok]);
  const toss = () => {
    if (ok[si]) return;
    const missing = s.need.filter((x) => !bowl.includes(x)), extra = bowl.filter((x) => !s.need.includes(x));
    if (!missing.length && !extra.length) {
      run.add(8); setOk((o) => o.map((v, i) => (i === si ? true : v)));
      playClickSound('success');
      say('ok', L(`Authentic ${s.name.en}! A compound salad has base, body, dressing and garnish in balance.`, `असली ${s.name.hi}! कंपाउंड सलाद में आधार, मुख्य भाग, ड्रेसिंग व गार्निश संतुलित होते हैं।`));
    } else {
      run.miss(); playClickSound('error');
      const nm = (id: string) => L(ING.find((i) => i.id === id)!.n.en, ING.find((i) => i.id === id)!.n.hi);
      say('bad', L(`${missing.length ? 'Missing: ' + missing.map(nm).join(', ') + '. ' : ''}${extra.length ? 'Not in this salad: ' + extra.map(nm).join(', ') + '.' : ''}`, `${missing.length ? 'कम: ' + missing.map(nm).join(', ') + '। ' : ''}${extra.length ? 'इस सलाद में नहीं: ' + extra.map(nm).join(', ') + '।' : ''}`));
    }
  };
  const hint = () => { run.hint(); const m = s.need.find((x) => !bowl.includes(x)); if (m) { const i = ING.find((q) => q.id === m)!; say('info', L(`Still needed: ${i.n.en}.`, `अभी चाहिए: ${i.n.hi}।`)); } else say('info', L('Remove anything that does not belong, then toss.', 'जो न हो वह हटाएँ, फिर मिलाएँ।')); };
  return (
    <div className="space-y-2" data-testid="salad">
      <div className="flex gap-1.5 flex-wrap">{SALADS.map((x, i) => <button key={x.id} data-salad={x.id} onClick={() => { setSi(i); setBowl([]); say('info', null); }} className={`px-3 py-1.5 rounded-lg border text-xs ${si === i ? 'font-bold border-2' : ''}`} style={si === i ? { borderColor: T.accent } : undefined}>🥗 {L(x.name.en, x.name.hi)}{ok[i] ? ' ✓' : ''}</button>)}</div>
      <Card><p className="text-xs">{L(`Build a ${s.name.en} — tap ingredients to add or remove them.`, `${s.name.hi} बनाएँ — सामग्री छूकर जोड़ें या हटाएँ।`)}</p></Card>
      <div className="grid grid-cols-4 gap-1.5">{ING.map((i) => <button key={i.id} data-ing={i.id} disabled={ok[si]} onClick={() => { playClickSound('neutral'); setBowl((b) => (b.includes(i.id) ? b.filter((x) => x !== i.id) : [...b, i.id])); }} className={`rounded-lg border p-1.5 text-center text-[10px] ${bowl.includes(i.id) ? 'border-2 ring-1 ring-blue-500' : ''}`} style={bowl.includes(i.id) ? { borderColor: T.accent, background: withAlpha(T.accent, 0.12) } : undefined}><div className="text-xl">{i.e}</div>{L(i.n.en, i.n.hi)}</button>)}</div>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={toss} disabled={ok[si] || bowl.length === 0} data-testid="toss" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>🥣 {L('Toss & serve', 'मिलाकर परोसें')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        <span className="text-xs text-stone-500">{bowl.length} {L('in bowl', 'कटोरे में')}</span>
        {ok[si] && si < SALADS.length - 1 && (
          <button onClick={() => { setSi(si + 1); setBowl([]); say('info', null); }} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {L('Next salad', 'अगला सलाद')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

function ColdKitchen({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [sub, setSub] = useState<'emul' | 'salad'>('emul');
  const [d, setD] = useState<Record<string, boolean>>({});
  useEffect(() => { if (d.emul && d.salad) onDone(); /* eslint-disable-next-line */ }, [d]);
  const m = (k: string) => () => setD((x) => (x[k] ? x : { ...x, [k]: true }));
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">{(['emul', 'salad'] as const).map((k) => <button key={k} data-sub={k} onClick={() => setSub(k)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === k ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === k ? { background: T.accent } : undefined}>{k === 'emul' ? L('Dressings & emulsions', 'ड्रेसिंग व इमल्शन') : L('Compound salads', 'कंपाउंड सलाद')}{d[k] ? ' ✓' : ''}</button>)}</div>
      <div style={{ display: sub === 'emul' ? 'block' : 'none' }}><Emulsion run={run} onDone={m('emul')} onNext={() => setSub('salad')} /></div>
      <div style={{ display: sub === 'salad' ? 'block' : 'none' }}>
        <Salad run={run} onDone={m('salad')} />
        {d.emul && d.salad && (
          <div className="flex justify-end mt-3">
            <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
              {L('Next: Canapés & Sandwiches', 'अगला: केनापे व सैंडविच')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Canapés, sandwiches, hors d'oeuvre ---------------- */
const BASES = [{ id: 'toast', e: '🍞', n: bi('Toast round', 'टोस्ट गोला') }, { id: 'cucumber', e: '🥒', n: bi('Cucumber slice', 'खीरे की चकती') }, { id: 'soft', e: '☁️', n: bi('Soft bread crumb', 'नरम ब्रेड') }];
const SPREADS = [{ id: 'butter', e: '🧈', n: bi('Butter (moisture barrier)', 'मक्खन (नमी रोधक)') }, { id: 'cheese', e: '🧀', n: bi('Cream cheese', 'क्रीम चीज़') }, { id: 'none', e: '🚫', n: bi('No spread', 'कोई लेप नहीं') }];
const TOPS = [{ id: 'salmon', e: '🐟', n: bi('Smoked salmon', 'स्मोक्ड सैल्मन'), veg: false }, { id: 'chicken', e: '🍗', n: bi('Chicken tikka', 'चिकन टिक्का'), veg: false }, { id: 'tomato', e: '🍅', n: bi('Tomato & basil', 'टमाटर व बेसिल'), veg: true }, { id: 'paneer', e: '🧀', n: bi('Paneer cube', 'पनीर क्यूब'), veg: true }];
const GARN = [{ id: 'dill', e: '🌿', n: bi('Dill / herb sprig', 'सोवा/जड़ी-बूटी की टहनी') }, { id: 'olive', e: '🫒', n: bi('Olive slice', 'जैतून की फाँक') }, { id: 'none', e: '🚫', n: bi('No garnish', 'कोई गार्निश नहीं') }];
const CAN = [
  { id: 'veg', t: bi('Vegetarian canapé', 'शाकाहारी केनापे'), need: 'veg' as const },
  { id: 'nonveg', t: bi('Non-vegetarian canapé', 'मांसाहारी केनापे'), need: 'nonveg' as const },
];

function Canape({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [ci, setCi] = useState(0); const [b, setB] = useState('toast'); const [s, setS] = useState('butter'); const [t, setT] = useState('tomato'); const [g, setG] = useState('dill');
  const [ok, setOk] = useState([false, false]);
  const { toast, say } = useToast();
  const c = CAN[ci];
  useEffect(() => { if (ok.every(Boolean)) onDone(); /* eslint-disable-next-line */ }, [ok]);
  const reset = () => { setB('toast'); setS('butter'); setT(ci === 0 ? 'tomato' : 'salmon'); setG('dill'); };
  const check = () => {
    if (ok[ci]) return;
    const top = TOPS.find((x) => x.id === t);
    if (!b || !s || !t || !g) { say('info', L('A canapé has four layers: base, spread, topping, garnish. Choose one for each.', 'केनापे की चार परतें होती हैं: आधार, लेप, टॉपिंग, गार्निश। हर एक चुनें।')); return; }
    if (b === 'soft') { run.miss(); playClickSound('error'); say('bad', L('Soft crumb turns soggy. Use a firm base: toast or cucumber.', 'नरम ब्रेड गीली हो जाती है। ठोस आधार लें: टोस्ट या खीरा।')); return; }
    if (s === 'none') { run.miss(); playClickSound('error'); say('bad', L('A spread (butter or cream cheese) seals the base so it stays crisp and sticks the topping.', 'लेप (मक्खन/क्रीम चीज़) आधार को सील कर कुरकुरा रखता है और टॉपिंग चिपकाता है।')); return; }
    if (g === 'none') { run.miss(); playClickSound('error'); say('bad', L('Add a small, edible garnish for colour and finish.', 'रंग व सजावट हेतु छोटा खाने योग्य गार्निश जोड़ें।')); return; }
    if ((c.need === 'veg') !== !!top!.veg) { run.miss(); playClickSound('error'); say('bad', L(`The topping does not suit a ${c.t.en.toLowerCase()}.`, `यह टॉपिंग ${c.t.hi} के अनुकूल नहीं।`)); return; }
    run.add(10); setOk((o) => o.map((v, i) => (i === ci ? true : v)));
    playClickSound('success');
    say('ok', L('Neat, bite-sized and balanced — firm base, spread, topping, garnish.', 'साफ़, एक कौर का और संतुलित — ठोस आधार, लेप, टॉपिंग, गार्निश।'));
  };
  const hint = () => { run.hint(); say('info', L('Firm base + butter or cream cheese + suitable topping + a small garnish.', 'ठोस आधार + मक्खन/क्रीम चीज़ + आहार अनुकूल टॉपिंग + छोटा गार्निश।')); };
  const Row = ({ items, val, set, label }: { items: { id: string; e: string; n: Bi2 }[]; val: string; set: (v: string) => void; label: string }) => (
    <div><p className="text-[11px] font-bold text-stone-500 mb-1">{label}</p><div className="flex gap-1.5 flex-wrap">{items.map((i) => <button key={i.id} data-opt={`${label}-${i.id}`} disabled={ok[ci]} onClick={() => { playClickSound('neutral'); set(i.id); }} className={`px-2 py-1.5 rounded-lg border text-[11px] ${val === i.id ? 'border-2 font-bold ring-1 ring-blue-500' : ''}`} style={val === i.id ? { borderColor: T.accent } : undefined}>{i.e} {L(i.n.en, i.n.hi)}</button>)}</div></div>
  );
  const tl = TOPS.find((x) => x.id === t), gl = GARN.find((x) => x.id === g);
  return (
    <div className="space-y-2" data-testid="canape">
      <div className="flex gap-1.5">{CAN.map((x, i) => <button key={x.id} data-can={x.id} onClick={() => { setCi(i); reset(); say('info', null); }} className={`px-3 py-1.5 rounded-lg border text-xs ${ci === i ? 'font-bold border-2' : ''}`} style={ci === i ? { borderColor: T.accent } : undefined}>{L(x.t.en, x.t.hi)}{ok[i] ? ' ✓' : ''}</button>)}</div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2"><Row items={BASES} val={b} set={setB} label={L('Base', 'आधार')} /><Row items={SPREADS} val={s} set={setS} label={L('Spread', 'लेप')} /><Row items={TOPS} val={t} set={setT} label={L('Topping', 'टॉपिंग')} /><Row items={GARN} val={g} set={setG} label={L('Garnish', 'गार्निश')} /></div>
        <div className="rounded-2xl bg-amber-50 dark:bg-slate-800 p-3 grid place-items-center min-h-[140px]"><div className="flex flex-col items-center gap-0.5" data-testid="canape-stack">
          {gl && g !== 'none' && <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-lg">{gl.e}</motion.div>}
          {tl && <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-3xl">{tl.e}</motion.div>}
          {s && s !== 'none' && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="h-2 w-16 rounded bg-yellow-200" />}
          {b && <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl">{BASES.find((x) => x.id === b)!.e}</motion.div>}
          {!b && <span className="text-xs text-stone-400">{L('Your canapé appears here', 'आपका केनापे यहाँ दिखेगा')}</span>}
        </div></div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={check} disabled={ok[ci]} data-testid="canape-serve" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>🍽️ {L('Serve canapé', 'केनापे परोसें')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        {ok[ci] && ci < CAN.length - 1 && (
          <button onClick={() => { setCi(1); setT('salmon'); say('info', null); }} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {L('Next canapé', 'अगला केनापे')} →
          </button>
        )}
      </div>
      {ok.every(Boolean) && (
        <div className="flex justify-end mt-2">
          <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
            {L('Next: Sandwich Types', 'अगला: सैंडविच प्रकार')} →
          </button>
        </div>
      )}
      <Toast {...toast} />
    </div>
  );
}

const SWZ: MatchZone[] = ['club', 'open', 'grilled', 'pin', 'tea'].map((id) => ({ id, emoji: '🥪', label: { club: bi('Club', 'क्लब'), open: bi('Open', 'ओपन'), grilled: bi('Grilled / toasted', 'ग्रिल्ड/टोस्टेड'), pin: bi('Pinwheel', 'पिनव्हील'), tea: bi('Tea / finger', 'टी/फ़िंगर') }[id]! }));
const SWI: MatchItem[] = [
  { id: 'w1', cat: 'club', emoji: '🥪', label: bi('Three toasted slices, two layers of filling', 'तीन टोस्टेड स्लाइस, भरावन की दो परतें'), why: bi('A club sandwich has three slices and two fillings.', 'क्लब सैंडविच में तीन स्लाइस व दो भरावन होते हैं।') },
  { id: 'w2', cat: 'open', emoji: '🍞', label: bi('One slice with toppings and no top slice', 'एक स्लाइस पर टॉपिंग, ऊपर स्लाइस नहीं'), why: bi('An open sandwich has one slice and no lid.', 'ओपन सैंडविच में एक स्लाइस और ढक्कन नहीं।') },
  { id: 'w3', cat: 'grilled', emoji: '♨️', label: bi('Pressed on a hot grill until golden and melted', 'गरम ग्रिल पर दबाकर सुनहरा व पिघला'), why: bi('Grilled sandwiches are pressed and toasted with filling melted.', 'ग्रिल्ड सैंडविच दबाकर सेंका जाता है, भरावन पिघल जाता है।') },
  { id: 'w4', cat: 'pin', emoji: '🌀', label: bi('Crustless bread rolled with filling and sliced', 'किनारे कटी ब्रेड भरावन संग लपेटकर कटी'), why: bi('Pinwheels are rolled and sliced into spirals.', 'पिनव्हील लपेटकर सर्पिल टुकड़ों में कटे होते हैं।') },
  { id: 'w5', cat: 'tea', emoji: '🫖', label: bi('Small crustless fingers or triangles', 'छोटी बिना किनारे की पट्टियाँ/तिकोन'), why: bi('Tea sandwiches are small, delicate and crustless.', 'टी सैंडविच छोटे, नाज़ुक व बिना किनारे के होते हैं।') },
];
const HZ: MatchZone[] = [{ id: 'cold', emoji: '🧊', label: bi('Cold hors d’oeuvre', 'ठंडे ऑर्डव') }, { id: 'hot', emoji: '🔥', label: bi('Hot hors d’oeuvre', 'गरम ऑर्डव') }];
const HI: MatchItem[] = [
  { id: 'h1', cat: 'cold', emoji: '🐟', label: bi('Smoked salmon with lemon', 'नींबू संग स्मोक्ड सैल्मन') }, { id: 'h2', cat: 'cold', emoji: '🦐', label: bi('Prawn cocktail', 'प्रॉन कॉकटेल') },
  { id: 'h3', cat: 'cold', emoji: '🍈', label: bi('Melon cocktail', 'मेलन कॉकटेल') }, { id: 'h4', cat: 'cold', emoji: '🥫', label: bi('Pâté with toast', 'टोस्ट संग पाटे') },
  { id: 'h5', cat: 'hot', emoji: '🍄', label: bi('Stuffed baked mushrooms', 'भरे बेक्ड मशरूम') }, { id: 'h6', cat: 'hot', emoji: '🥐', label: bi('Vol-au-vent (hot filling)', 'वोल-ओ-वों (गरम भरावन)') }, { id: 'h7', cat: 'hot', emoji: '🧀', label: bi('Cheese straws, hot from the oven', 'ओवन से गरम चीज़ स्ट्रॉ') },
].map((x) => ({ ...x, why: bi(`Served ${x.cat === 'hot' ? 'hot' : 'cold'}.`, `${x.cat === 'hot' ? 'गरम' : 'ठंडा'} परोसा जाता है।`) }));

function Bites({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [sub, setSub] = useState<'can' | 'sw' | 'hd'>('can');
  const [d, setD] = useState<Record<string, boolean>>({});
  useEffect(() => { if (d.can && d.sw && d.hd) onDone(); /* eslint-disable-next-line */ }, [d]);
  const m = (k: string) => () => setD((x) => (x[k] ? x : { ...x, [k]: true }));
  const tabs: { id: typeof sub; l: string }[] = [{ id: 'can', l: L('Canapé builder', 'केनापे बिल्डर') }, { id: 'sw', l: L('Sandwich types', 'सैंडविच प्रकार') }, { id: 'hd', l: L('Hors d’oeuvre', 'ऑर्डव') }];
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">{tabs.map((t) => <button key={t.id} data-sub={t.id} onClick={() => setSub(t.id)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === t.id ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === t.id ? { background: T.accent } : undefined}>{t.l}{d[t.id] ? ' ✓' : ''}</button>)}</div>
      <div style={{ display: sub === 'can' ? 'block' : 'none' }}><Canape run={run} onDone={m('can')} onNext={() => setSub('sw')} /></div>
      <div style={{ display: sub === 'sw' ? 'block' : 'none' }}>
        <MatchTask items={SWI} zones={SWZ} run={run} accent={T.accent} points={2} cols={3} onDone={m('sw')} />
        {d.sw && !d.hd && (
          <div className="flex justify-end mt-2">
            <button onClick={() => setSub('hd')} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
              {L('Next: Hors d’oeuvre', 'अगला: ऑर्डव')} →
            </button>
          </div>
        )}
      </div>
      <div style={{ display: sub === 'hd' ? 'block' : 'none' }}>
        <MatchTask items={HI} zones={HZ} run={run} accent={T.accent} points={2} cols={2} onDone={m('hd')} />
        {d.can && d.sw && d.hd && (
          <div className="flex justify-end mt-3">
            <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
              {L('Next: Cheese & Pasta', 'अगला: चीज़ व पास्ता')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const CHZ: MatchZone[] = ['fresh', 'soft', 'hard', 'blue'].map((id) => ({ id, emoji: '🧀', label: { fresh: bi('Fresh', 'ताज़ा'), soft: bi('Soft-ripened', 'नरम-पका'), hard: bi('Hard', 'कठोर'), blue: bi('Blue-veined', 'नीली धारी') }[id]! }));
const CHI: MatchItem[] = [
  { id: 'c1', cat: 'fresh', emoji: '🧀', label: bi('Mozzarella', 'मोत्ज़ारेला') }, { id: 'c2', cat: 'fresh', emoji: '🥛', label: bi('Ricotta', 'रिकोटा') }, { id: 'c3', cat: 'soft', emoji: '🧀', label: bi('Brie', 'ब्री') }, { id: 'c4', cat: 'soft', emoji: '🧀', label: bi('Camembert', 'कैमम्बर्ट') },
  { id: 'c5', cat: 'hard', emoji: '🧀', label: bi('Cheddar', 'चेडर') }, { id: 'c6', cat: 'hard', emoji: '🧀', label: bi('Parmesan', 'पार्मेज़ान') }, { id: 'c7', cat: 'blue', emoji: '🧀', label: bi('Gorgonzola', 'गोरगोंज़ोला') }, { id: 'c8', cat: 'blue', emoji: '🧀', label: bi('Roquefort', 'रोकफ़ोर') },
].map((x) => ({ ...x, why: bi({ fresh: 'Fresh cheese is unripened, soft and moist.', soft: 'Soft-ripened cheese ripens from the rind inwards.', hard: 'Hard cheese is aged and dry — good for grating or slicing.', blue: 'Blue cheese is veined with edible mould.' }[x.cat]!, { fresh: 'ताज़ा चीज़ बिना पकाया, नरम व नम होता है।', soft: 'नरम-पका चीज़ छिलके से भीतर की ओर पकता है।', hard: 'कठोर चीज़ पुराना व सूखा — कद्दूकस करने या काटने हेतु अच्छा।', blue: 'नीला चीज़ खाने योग्य फफूँद की धारियों वाला है।' }[x.cat]!) }));

const PZ: MatchZone[] = ['long', 'short', 'stuffed', 'sheet'].map((id) => ({ id, emoji: '🍝', label: { long: bi('Long', 'लंबा'), short: bi('Short / tubes', 'छोटा / नली'), stuffed: bi('Stuffed', 'भरा हुआ'), sheet: bi('Sheets', 'चादर') }[id]! }));
const PI: MatchItem[] = [
  { id: 'p1', cat: 'long', emoji: '🍝', label: bi('Spaghetti', 'स्पैघेटी') }, { id: 'p2', cat: 'long', emoji: '🍝', label: bi('Fettuccine', 'फ़ेतुचीनी') }, { id: 'p3', cat: 'short', emoji: '🍝', label: bi('Penne', 'पेने') }, { id: 'p4', cat: 'short', emoji: '🌀', label: bi('Fusilli', 'फ़ुसिल्ली') },
  { id: 'p5', cat: 'stuffed', emoji: '🥟', label: bi('Ravioli', 'रैवियोली') }, { id: 'p6', cat: 'stuffed', emoji: '🥟', label: bi('Tortellini', 'तोर्तेलिनी') }, { id: 'p7', cat: 'sheet', emoji: '🍝', label: bi('Lasagne', 'लज़ानिया') }, { id: 'p8', cat: 'short', emoji: '🍝', label: bi('Macaroni', 'मैकरोनी') },
].map((x) => ({ ...x, why: bi({ long: 'Long strands suit light oil or tomato sauces.', short: 'Short shapes hold chunky sauces.', stuffed: 'Stuffed pasta has a filling inside.', sheet: 'Sheets are layered and baked.' }[x.cat]!, { long: 'लंबी लड़ियाँ हल्के तेल/टमाटर सॉस हेतु।', short: 'छोटे आकार गाढ़े सॉस पकड़ते हैं।', stuffed: 'भरे पास्ता में भीतर भरावन होता है।', sheet: 'चादरें परत लगाकर बेक की जाती हैं।' }[x.cat]!) }));

function CheesePasta({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const [d, setD] = useState<Record<string, boolean>>({});
  useEffect(() => { if (d.ch && d.pa) onDone(); /* eslint-disable-next-line */ }, [d]);
  const m = (k: string) => () => setD((x) => (x[k] ? x : { ...x, [k]: true }));
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-bold mb-2">🧀 {L('Classes of cheese', 'चीज़ के वर्ग')}{d.ch ? ' ✓' : ''}</p><MatchTask items={CHI} zones={CHZ} run={run} accent={T.accent} points={2} cols={4} onDone={m('ch')} /></div>
      <div><p className="text-sm font-bold mb-2">🍝 {L('Varieties of pasta', 'पास्ता की किस्में')}{d.pa ? ' ✓' : ''}</p><MatchTask items={PI} zones={PZ} run={run} accent={T.accent} points={2} cols={4} onDone={m('pa')} /></div>
    </div>
  );
}

export default function EggColdSim() {
  const L = useLang();
  const run = useRun('m2EggCold', 67 + 44 + 44 + 32);
  const [tab, setTab] = useState<'egg' | 'cold' | 'bites' | 'cheese'>('egg');
  const ds = useDoneSet(4, run);
  const [key, setKey] = useState(0);
  const replay = () => { run.reset(); ds.reset(); setTab('egg'); setKey((k) => k + 1); };

  return (
    <FoodShell accent={T.accent} Icon={T.Icon} title={L('Eggs & the Cold Kitchen', 'अंडे व कोल्ड किचन')}
      subtitle={L('Explore the egg, shake emulsions, build salads and canapés, and sort cheeses and pasta.', 'अंडे को जानें, इमल्शन हिलाएँ, सलाद व केनापे बनाएँ, और चीज़ व पास्ता छाँटें।')}>
      {run.done ? <FinishCard run={run} accent={T.accent} onReplay={replay} summary={[L('Egg anatomy, doneness, freshness and styles', 'अंडे की संरचना, पकाई, ताज़गी व प्रकार'), L('Emulsions and compound salads', 'इमल्शन व कंपाउंड सलाद'), L('Canapés, sandwiches, hors d’oeuvre, cheese, pasta', 'केनापे, सैंडविच, ऑर्डव, चीज़, पास्ता')]} /> : (
        <>
          <ChefBrief
            station={L('Garde Manger & Breakfast Egg Station', 'गार्द मांजरे व नाश्ता अंडा स्टेशन')}
            role={L('Cold Kitchen Specialist · Commis Chef', 'कोल्ड किचन विशेषज्ञ · कॉमी शेफ़')}
            task={L('Perform egg quality float tests, control boiling doneness with thermal shock to prevent ferrous sulfide green rings, build classical canapés with fat moisture barriers, and balance cold salads.', 'अंडे की गुणवत्ता परखें, हरा छल्ला रोकने हेतु ठंडे पानी से उबाल नियंत्रित करें, नमी-रोधक वसा लेप से शास्त्रीय केनापे बनाएँ, और ठंडे सलाद संतुलित करें।')}
            standard={L('Grade 10 CBSE Food Production · Block 7 & 8', 'कक्षा 10 फ़ूड प्रोडक्शन · ब्लॉक 7 व 8')}
          />
          <ProTip
            title={L('Egg Chemistry & Cold Shock Rule', 'अंडा रसायन व कोल्ड शॉक नियम')}
            text={L('The greenish-grey ring around hard-boiled yolks is iron sulfide (FeS). Plunge boiled eggs immediately into ice water! The sudden temperature drop draws sulfur gas outward before it can react with iron in the yolk. Also, yolk lecithin is the natural emulsifier that keeps mayonnaise stable!', 'उबली ज़र्दी के चारों ओर हरा-स्लेटी छल्ला आयरन सल्फाइड (FeS) होता है। उबले अंडे तुरंत बर्फ़ीले पानी में डालें! तापमान गिरने से सल्फर गैस ज़र्दी के लोहे से मिलने से पहले बाहर खिंच जाती है। साथ ही ज़र्दी का लेसिथिन मेयोनेज़ को स्थिर रखता है!')}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs2 accent={T.accent} value={tab} onChange={setTab} tabs={[
              { id: 'egg', label: L('1. Egg Lab', '1. अंडा लैब'), done: ds.done.has('egg') }, { id: 'cold', label: L('2. Emulsions & Salads', '2. इमल्शन व सलाद'), done: ds.done.has('cold') },
              { id: 'bites', label: L('3. Canapés & Sandwiches', '3. केनापे व सैंडविच'), done: ds.done.has('bites') }, { id: 'cheese', label: L('4. Cheese & Pasta', '4. चीज़ व पास्ता'), done: ds.done.has('cheese') }]} />
            <Hud run={run} accent={T.accent} />
          </div>
          <div key={key}>
            <div style={{ display: tab === 'egg' ? 'block' : 'none' }}>
              <EggLab run={run} onDone={() => ds.mark('egg')} onNext={() => setTab('cold')} />
            </div>
            <div style={{ display: tab === 'cold' ? 'block' : 'none' }}>
              <ColdKitchen run={run} onDone={() => ds.mark('cold')} onNext={() => setTab('bites')} />
            </div>
            <div style={{ display: tab === 'bites' ? 'block' : 'none' }}>
              <Bites run={run} onDone={() => ds.mark('bites')} onNext={() => setTab('cheese')} />
            </div>
            <div style={{ display: tab === 'cheese' ? 'block' : 'none' }}>
              <CheesePasta run={run} onDone={() => ds.mark('cheese')} />
            </div>
          </div>
        </>
      )}
    </FoodShell>
  );
}
