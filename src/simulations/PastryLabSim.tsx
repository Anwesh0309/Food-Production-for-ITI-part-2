import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FOOD2_THEMES } from '@/data/themes';
import { playClickSound } from '@/utils/sound';
import { Card, ChefBrief, FinishCard, FoodShell, Hud, HintButton, ProTip, SubTabs, Tabs2, Toast, useLang, useRun, useSubDone, useToast, type Run } from '@/components/kit';
import { ChoiceTask, MatchTask, OrderTask, useDoneSet, type Bi2, type ChoiceQ, type MatchItem, type MatchZone, type OrderStep } from '@/components/tasks';

const Lamination3D = lazy(() => import('./Lamination3D'));
const T = FOOD2_THEMES.pastry;
const bi = (en: string, hi: string): Bi2 => ({ en, hi });
const mz = (id: string, emoji: string, label: Bi2): MatchZone => ({ id, emoji, label });
const mi = (id: string, cat: string, emoji: string, label: Bi2, why: Bi2): MatchItem => ({ id, cat, emoji, label, why });
const hasWebGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } };

/* ---------------- Leavening ---------------- */
function Rise({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [bp, setBp] = useState(1.5); const [baked, setBaked] = useState(false); const [done, setDone] = useState(false);
  const { toast, say } = useToast();
  const outcome = bp < 1 ? 'flat' : bp <= 2.5 ? 'good' : bp <= 3.5 ? 'high' : 'collapse';
  const h = outcome === 'flat' ? 20 : outcome === 'good' ? 54 : outcome === 'high' ? 70 : 28;
  const bake = () => {
    if (done) return; setBaked(true); playClickSound('neutral');
    setTimeout(() => {
      if (outcome === 'good') {
        run.add(10); setDone(true); onDone();
        playClickSound('success');
        say('ok', L('A soft, even dome! Baking powder releases carbon dioxide when wet and again when hot; the gas bubbles stretch the batter and the heat sets it.', 'नरम, बराबर गुंबद! बेकिंग पाउडर गीला होने पर और गर्म होने पर कार्बन डाइऑक्साइड छोड़ता है; गैस बुलबुले घोल को फुलाते हैं और गर्मी उसे जमा देती है।'));
      } else {
        run.miss(); playClickSound('error');
        say('bad', outcome === 'flat' ? L('Too flat and dense — not enough raising agent. Add more.', 'बहुत चपटा व सघन — उठाने वाला पदार्थ कम। और डालें।') : outcome === 'high' ? L('Rose too fast, coarse crumb and a soapy taste. Use a little less.', 'बहुत तेज़ उठा, खुरदुरी बनावट व साबुन-सा स्वाद। थोड़ा कम डालें।') : L('Too much! It rose, then collapsed and tastes bitter. Use far less.', 'बहुत ज़्यादा! उठकर बैठ गया और कड़वा है। बहुत कम डालें।'));
        setBaked(false);
      }
    }, 1200);
  };
  const hint = () => { run.hint(); say('info', L('Use about 1 to 2.5 teaspoons of baking powder for 250 g flour.', '250 ग्राम आटे में लगभग 1 से 2.5 चम्मच बेकिंग पाउडर लें।')); };
  return (
    <div className="space-y-2" data-testid="rise">
      <p className="text-xs text-stone-600 dark:text-stone-300">{L('Choose how much baking powder goes into 250 g flour, then bake and watch the oven.', '250 ग्राम आटे में कितना बेकिंग पाउडर डालें चुनें, फिर बेक करके ओवन देखें।')}</p>
      <div className="rounded-2xl bg-stone-100 dark:bg-slate-800 p-3">
        <svg viewBox="0 0 220 110" className="w-full max-w-sm mx-auto" data-testid="oven-svg" data-outcome={baked ? outcome : 'raw'}>
          <rect x="10" y="10" width="200" height="95" rx="8" fill="#1e293b" /><rect x="22" y="22" width="176" height="72" rx="4" fill={baked ? '#7c2d12' : '#334155'} opacity={baked ? 0.5 : 1} style={{ transition: 'fill .6s' }} />
          <rect x="45" y="80" width="130" height="5" fill="#94a3b8" />
          <motion.path d="M60 80 Q110 66 160 80 Z" initial={false} animate={{ d: baked ? `M60 80 Q110 ${80 - h * 1.6} 160 80 Z` : 'M60 80 Q110 66 160 80 Z' }} transition={{ duration: 1.2 }} fill={baked ? (outcome === 'collapse' ? '#a16207' : '#d97706') : '#fde68a'} stroke="#78350f" />
          {baked && outcome === 'collapse' && <path d="M95 74 Q110 82 125 74" stroke="#451a03" fill="none" />}
        </svg>
      </div>
      <label className="block text-xs font-semibold">{L('Baking powder', 'बेकिंग पाउडर')}: <span className="font-mono">{bp} {L('tsp', 'चम्मच')}</span><input type="range" min={0} max={5} step={0.5} value={bp} onChange={(e) => { setBp(+e.target.value); setBaked(false); }} data-slider="bp" disabled={done} className="w-full" style={{ accentColor: T.accent }} /></label>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={bake} disabled={done || baked} data-testid="bake" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>♨️ {L('Bake', 'बेक करें')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        {done && (
          <button onClick={onNext} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {L('Next: Raising agents', 'अगला: उठाने वाले पदार्थ')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

const LV_Z = [mz('chem', '🧪', bi('Chemical', 'रासायनिक')), mz('air', '💨', bi('Air (mechanical)', 'हवा (यांत्रिक)')), mz('steam', '♨️', bi('Steam', 'भाप'))];
const LV_I = [
  mi('v1', 'chem', '🧂', bi('Baking powder', 'बेकिंग पाउडर'), bi('Baking powder releases CO₂ gas when wet and hot.', 'बेकिंग पाउडर गीला व गर्म होने पर CO₂ छोड़ता है।')),
  mi('v2', 'chem', '🥛', bi('Baking soda + buttermilk (acid)', 'बेकिंग सोडा + छाछ (अम्ल)'), bi('Soda reacts with an acid to make gas.', 'सोडा अम्ल से क्रिया कर गैस बनाता है।')),
  mi('v3', 'air', '🥚', bi('Whisking whole eggs for a sponge', 'स्पंज हेतु पूरे अंडे फेंटना'), bi('Whisking traps air in the eggs.', 'फेंटने से अंडों में हवा फँसती है।')),
  mi('v4', 'air', '🧈', bi('Creaming butter and sugar', 'मक्खन-चीनी फेंटना (क्रीमिंग)'), bi('Creaming beats tiny air bubbles into the fat.', 'क्रीमिंग से वसा में छोटे हवा के बुलबुले जाते हैं।')),
  mi('v5', 'air', '🥣', bi('Sifting the flour', 'आटा छानना'), bi('Sifting adds a little air and removes lumps.', 'छानने से थोड़ी हवा मिलती है और गुठलियाँ हटती हैं।')),
  mi('v6', 'steam', '🥐', bi('Water in butter layers of puff pastry', 'पफ पेस्ट्री की मक्खन परतों में पानी'), bi('Water in the butter turns to steam and lifts the layers.', 'मक्खन का पानी भाप बनकर परतें उठाता है।')),
  mi('v7', 'steam', '🍥', bi('Choux paste puffing in a hot oven', 'गरम ओवन में चूपफ़ना (शू पेस्ट)'), bi('Choux rises almost entirely on steam.', 'शू लगभग पूरी तरह भाप से फूलता है।')),
];

/* ---------------- Lamination (3D) ---------------- */
function Lamination({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [turns, setTurns] = useState(0); const [warm, setWarm] = useState(false); const [baked, setBaked] = useState(false);
  const [fin, setFin] = useState(false);
  const gl = useMemo(hasWebGL, []);
  const { toast, say } = useToast();
  const layers = turns === 0 ? 3 : Math.pow(3, turns);
  const fold = () => {
    if (turns >= 6 || fin) return;
    if (warm) { run.miss(); playClickSound('error'); say('bad', L('The butter is warm and soft — it will smear into the dough and the layers merge. Chill the dough first!', 'मक्खन गरम व नरम है — आटे में घुलकर परतें मिल जाएँगी। पहले आटा ठंडा करें!')); return; }
    const t = turns + 1; setTurns(t); setWarm(true); run.add(2);
    playClickSound('neutral');
    say('ok', L(`Turn ${t}: 3 × more layers → ${Math.pow(3, t)} layers. Now chill and rest 30 minutes.`, `मोड़ ${t}: परतें 3 गुना → ${Math.pow(3, t)} परतें। अब 30 मिनट ठंडा करके आराम दें।`));
  };
  const chill = () => {
    if (!warm) { say('info', L('The dough is already cold. Fold again.', 'आटा पहले से ठंडा है। फिर मोड़ें।')); return; }
    playClickSound('neutral');
    setWarm(false); say('info', L('Chilled and rested — butter is firm again. Roll and fold.', 'ठंडा व आराम पूरा — मक्खन फिर कसा है। बेलें और मोड़ें।'));
  };
  const bake = () => {
    if (turns < 6) { run.miss(); playClickSound('error'); say('bad', L('Puff pastry needs 6 turns (729 layers) before baking. Keep folding.', 'पफ पेस्ट्री को बेक से पहले 6 मोड़ (729 परतें) चाहिए। मोड़ते रहें।')); return; }
    if (warm) { run.miss(); playClickSound('error'); say('bad', L('Chill the dough before it goes into the oven.', 'ओवन में डालने से पहले आटा ठंडा करें।')); return; }
    setBaked(true); setFin(true); run.add(8);
    playClickSound('success');
    say('ok', L('Puffed beautifully! Steam from the butter layers lifted 729 layers of dough.', 'शानदार फूली! मक्खन परतों की भाप ने आटे की 729 परतें उठा दीं।')); onDone();
  };
  const hint = () => { run.hint(); say('info', warm ? L('Press Chill & rest before the next fold.', 'अगले मोड़ से पहले ठंडा करें दबाएँ।') : turns < 6 ? L('Fold now; repeat fold → chill six times.', 'अब मोड़ें; मोड़ → ठंडा, छह बार दोहराएँ।') : L('Six turns done — bake it.', 'छह मोड़ पूरे — बेक करें।')); };
  return (
    <div className="space-y-2" data-testid="lamination">
      <p className="text-xs text-stone-600 dark:text-stone-300">{L('Fold the butter into the dough six times. Chill between turns so the butter stays in separate layers. Drag the 3D stack to turn it.', 'मक्खन को आटे में छह बार मोड़ें। मोड़ों के बीच ठंडा करें ताकि मक्खन अलग परतों में रहे। 3D स्टैक को घुमाने हेतु खींचें।')}</p>
      <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-sky-50 to-stone-100 dark:from-slate-800 dark:to-slate-900 relative" data-testid="lam-stage" data-gl={gl ? '1' : '0'}>
        {gl ? <Suspense fallback={<div className="h-[220px] grid place-items-center text-xs text-stone-500">{L('Loading 3D…', '3D लोड हो रहा है…')}</div>}><Lamination3D layers={layers} puffed={baked} /></Suspense> : (
          <svg viewBox="0 0 200 120" className="w-full h-[220px]">{Array.from({ length: Math.min(layers, 40) }, (_, i) => <rect key={i} x="40" y={100 - i * (80 / Math.min(layers, 40)) - 2} width="120" height={80 / Math.min(layers, 40) - 0.6} fill={i % 2 ? '#f7d65a' : '#f3e3c0'} />)}</svg>)}
        <div className="absolute top-2 left-2 bg-white/85 dark:bg-slate-900/85 rounded-lg px-2 py-1 text-xs font-mono font-bold" data-testid="layer-count">{L('Turns', 'मोड़')} {turns}/6 · {layers} {L('layers', 'परतें')}{baked ? ` · ${L('puffed', 'फूली')}` : ''}</div>
        <div className={`absolute top-2 right-2 rounded-lg px-2 py-1 text-xs font-bold ${warm ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'}`} data-testid="butter-state">{warm ? L('🔥 butter warm', '🔥 मक्खन गरम') : L('🧊 butter firm', '🧊 मक्खन कसा')}</div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={fold} disabled={fin || turns >= 6} data-testid="fold" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm" style={{ background: T.accent }}>📐 {L('Roll & fold', 'बेलें व मोड़ें')}</button>
        <button onClick={chill} disabled={fin} data-testid="chill" className="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-bold disabled:opacity-50 shadow-sm">🧊 {L('Chill & rest', 'ठंडा करें व आराम')}</button>
        <button onClick={bake} disabled={fin} data-testid="bake-lam" className="px-4 py-2 rounded-xl bg-amber-700 text-white text-sm font-bold disabled:opacity-50 shadow-sm">♨️ {L('Bake', 'बेक करें')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        {fin && (
          <button onClick={onNext} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {L('Next: Short-crust', 'अगला: शॉर्ट-क्रस्ट')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

/* ---------------- Short-crust fat ratio ---------------- */
function Shortcrust({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [fat, setFat] = useState(100); const [done, setDone] = useState(false);
  const { toast, say } = useToast();
  const st = fat < 70 ? 'tough' : fat <= 120 ? 'short' : 'greasy';
  const check = () => {
    if (done) return;
    if (st === 'short') {
      run.add(8); setDone(true); onDone();
      playClickSound('success');
      say('ok', L('Crisp and "short"! Fat to flour about 1 : 2 coats the flour so little gluten forms — that gives a crumbly tender crust.', 'करारी व "शॉर्ट"! वसा : आटा लगभग 1 : 2 आटे को ढककर कम ग्लूटेन बनाता है — इससे भुरभुरी कोमल परत बनती है।'));
    } else {
      run.miss(); playClickSound('error');
      say('bad', st === 'tough' ? L('Hard and tough — too little fat, so gluten develops. Add more fat.', 'कठोर व सख़्त — वसा कम, इसलिए ग्लूटेन बनता है। वसा बढ़ाएँ।') : L('Greasy and crumbles apart — too much fat. Reduce it.', 'चिकना व बिखरने वाला — वसा बहुत ज़्यादा। कम करें।'));
    }
  };
  const hint = () => { run.hint(); say('info', L('For 200 g flour use about 100 g fat (1 : 2 ratio).', '200 ग्राम आटे में लगभग 100 ग्राम वसा (1 : 2 अनुपात) लें।')); };
  return (
    <div className="space-y-2" data-testid="shortcrust">
      <p className="text-xs text-stone-600 dark:text-stone-300">{L('Rub fat into 200 g flour. How much fat gives a crisp short-crust?', '200 ग्राम आटे में वसा रगड़ें। कितनी वसा करारी शॉर्ट-क्रस्ट देगी?')}</p>
      <div className="rounded-2xl bg-amber-50 dark:bg-slate-800 p-3 flex items-center justify-around">
        <div className="text-center"><div className="w-24 h-24 rounded-full" style={{ background: `radial-gradient(circle at 40% 40%, ${st === 'tough' ? '#e5c07b' : st === 'short' ? '#f2d28b' : '#f6e3a3'}, ${st === 'greasy' ? '#d6b45a' : '#c9a15a'})`, boxShadow: st === 'greasy' ? '0 0 0 4px rgba(250,204,21,.4)' : undefined }} data-testid="crumb" data-state={st} /><p className="text-xs mt-1 font-semibold">{st === 'tough' ? L('tough', 'सख़्त') : st === 'short' ? L('short & crisp', 'शॉर्ट व करारी') : L('greasy', 'चिकनी')}</p></div>
        <div className="text-xs space-y-1"><p>{L('Flour', 'आटा')}: <b className="font-mono">200 g</b></p><p>{L('Fat', 'वसा')}: <b className="font-mono">{fat} g</b></p><p>{L('Ratio', 'अनुपात')} ≈ <b className="font-mono">1 : {(200 / fat).toFixed(1)}</b></p></div>
      </div>
      <label className="block text-xs font-semibold">{L('Fat', 'वसा')} <input type="range" min={20} max={160} step={10} value={fat} onChange={(e) => setFat(+e.target.value)} data-slider="fat" disabled={done} className="w-full" style={{ accentColor: T.accent }} /></label>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={check} disabled={done} data-testid="crust-bake" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>🥧 {L('Bake the crust', 'क्रस्ट बेक करें')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        {done && (
          <button onClick={onNext} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {L('Next: Pastry families', 'अगला: पेस्ट्री परिवार')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

const PA_Z = [mz('short', '🥧', bi('Short-crust', 'शॉर्ट-क्रस्ट')), mz('puff', '🥐', bi('Puff / flaky', 'पफ / फ़्लेकी')), mz('choux', '🍩', bi('Choux', 'शू'))];
const PA_I = [
  mi('p1', 'short', '🥧', bi('Fat rubbed into flour; crumbly base for tarts and quiche', 'आटे में वसा रगड़ी; टार्ट व क्विश हेतु भुरभुरा आधार'), bi('Short-crust: fat rubbed into flour.', 'शॉर्ट-क्रस्ट: आटे में वसा रगड़ी जाती है।')),
  mi('p2', 'short', '🍪', bi('Lemon tart base', 'लेमन टार्ट का आधार'), bi('Tart cases are usually short-crust.', 'टार्ट केस आमतौर पर शॉर्ट-क्रस्ट होते हैं।')),
  mi('p3', 'puff', '🥐', bi('Hundreds of butter layers; vol-au-vent', 'सैकड़ों मक्खन परतें; वोल-ओ-वों'), bi('Puff pastry is laminated with butter.', 'पफ पेस्ट्री मक्खन से परतदार बनती है।')),
  mi('p4', 'puff', '🧀', bi('Cheese straws and palmiers', 'चीज़ स्ट्रॉ व पामियर'), bi('Both are made from puff or flaky pastry.', 'दोनों पफ/फ़्लेकी पेस्ट्री से बनते हैं।')),
  mi('p5', 'choux', '🍩', bi('Cooked paste of water, butter and flour, then eggs', 'पानी, मक्खन, आटे का पका लेप, फिर अंडे'), bi('Choux paste is cooked first, then enriched with eggs.', 'शू पेस्ट पहले पकाया जाता है, फिर अंडे मिलाते हैं।')),
  mi('p6', 'choux', '🥖', bi('Éclairs and profiteroles', 'एक्लेयर व प्रॉफ़िटरोल'), bi('Éclairs and profiteroles are choux pastry.', 'एक्लेयर व प्रॉफ़िटरोल शू पेस्ट्री हैं।')),
];

/* ---------------- Cake & bake methods ---------------- */
const CREAM: OrderStep[] = [
  { id: 'k1', emoji: '🧈', label: bi('Cream softened butter and sugar until pale and fluffy', 'नरम मक्खन-चीनी को हल्का-फूला होने तक फेंटें'), why: bi('Creaming traps air that helps the cake rise.', 'क्रीमिंग में हवा फँसती है जो केक उठाती है।') },
  { id: 'k2', emoji: '🥚', label: bi('Beat in the eggs a little at a time', 'अंडे थोड़ा-थोड़ा करके फेंटें'), why: bi('Adding eggs slowly stops the mix from curdling.', 'अंडे धीरे डालने से मिश्रण फटता नहीं।') },
  { id: 'k3', emoji: '🌾', label: bi('Fold in sifted flour and baking powder gently', 'छना आटा व बेकिंग पाउडर धीरे मिलाएँ'), why: bi('Folding keeps the air in.', 'धीरे मिलाने से हवा बनी रहती है।') },
  { id: 'k4', emoji: '🥘', label: bi('Pour into a greased, lined tin', 'चिकनाई लगे, काग़ज़ बिछे टिन में डालें'), why: bi('A lined tin lets the cake turn out cleanly.', 'काग़ज़ बिछे टिन से केक साफ़ निकलता है।') },
  { id: 'k5', emoji: '♨️', label: bi('Bake, test with a skewer, cool on a wire rack', 'बेक करें, सींक से जाँचें, जाली पर ठंडा करें'), why: bi('A clean skewer means the cake is baked.', 'साफ़ सींक का मतलब केक पक गया।') },
];
const BLIND: OrderStep[] = [
  { id: 'b1', emoji: '🥧', label: bi('Roll the pastry and line the tart tin', 'पेस्ट्री बेलकर टार्ट टिन में लगाएँ'), why: bi('Press the pastry gently into the corners.', 'पेस्ट्री को कोनों में हल्के दबाएँ।') },
  { id: 'b2', emoji: '🍴', label: bi('Prick the base with a fork and chill', 'काँटे से तली में छेद करें और ठंडा करें'), why: bi('Pricking lets steam escape; chilling stops shrinking.', 'छेद से भाप निकलती है; ठंडा करने से सिकुड़ना रुकता है।') },
  { id: 'b3', emoji: '📄', label: bi('Cover with baking paper and fill with baking beans', 'बेकिंग पेपर रखकर बेकिंग बीन्स भरें'), why: bi('Weights stop the base puffing up.', 'वज़न तली को फूलने से रोकता है।') },
  { id: 'b4', emoji: '♨️', label: bi('Bake blind until the edges set', 'किनारे जमने तक खाली बेक करें'), why: bi('Baking blind means baking the case without filling.', 'ब्लाइंड बेक यानी बिना भरावन केस बेक करना।') },
  { id: 'b5', emoji: '🟤', label: bi('Remove the beans and bake until golden', 'बीन्स हटाकर सुनहरा होने तक बेक करें'), why: bi('A dry, golden base stays crisp under a wet filling.', 'सूखा सुनहरा आधार गीले भरावन में भी करारा रहता है।') },
  { id: 'b6', emoji: '🥣', label: bi('Fill and finish baking', 'भरावन डालें और बेक पूरा करें'), why: bi('Only now is the filling added.', 'अब जाकर भरावन डालते हैं।') },
];
const CK_Z = [mz('cream', '🧈', bi('Creaming', 'क्रीमिंग')), mz('rub', '🤲', bi('Rubbing-in', 'रबिंग-इन')), mz('whisk', '🥚', bi('Whisking', 'व्हिस्किंग'))];
const CK_I = [
  mi('m1', 'cream', '🎂', bi('Victoria sponge', 'विक्टोरिया स्पंज'), bi('Victoria sponge uses the creaming method.', 'विक्टोरिया स्पंज क्रीमिंग विधि से बनता है।')),
  mi('m2', 'cream', '🧁', bi('Butter cake / cupcakes', 'बटर केक / कपकेक'), bi('Butter cakes are creamed.', 'बटर केक क्रीमिंग से बनते हैं।')),
  mi('m3', 'rub', '🥯', bi('Scones', 'स्कोन'), bi('Scones: fat rubbed into flour with fingertips.', 'स्कोन: उँगलियों से आटे में वसा रगड़ी जाती है।')),
  mi('m4', 'rub', '🍪', bi('Rock cakes', 'रॉक केक'), bi('Rock cakes use rubbing-in.', 'रॉक केक रबिंग-इन से बनते हैं।')),
  mi('m5', 'whisk', '🍰', bi('Genoise sponge', 'जेनोआ स्पंज'), bi('Genoise relies on whisked whole eggs and sugar.', 'जेनोआ फेंटे अंडे-चीनी पर निर्भर है।')),
  mi('m6', 'whisk', '🌀', bi('Swiss roll', 'स्विस रोल'), bi('Swiss roll is a whisked fatless sponge.', 'स्विस रोल फेंटा हुआ बिना वसा का स्पंज है।')),
];
const SWISS: ChoiceQ[] = [
  { q: bi('When should a Swiss roll be rolled?', 'स्विस रोल कब लपेटना चाहिए?'), options: [bi('While still warm, using sugared paper', 'गरम रहते, चीनी लगे काग़ज़ में'), bi('After it has gone completely cold', 'पूरी तरह ठंडा होने के बाद'), bi('Never — it is served flat', 'कभी नहीं — सपाट परोसा जाता है')], correct: 0, why: bi('A warm sponge is flexible; cold sponge cracks when rolled.', 'गरम स्पंज लचीला होता है; ठंडा लपेटने पर टूटता है।'), scene: '🌀' },
  { q: bi('Why is a Swiss roll sponge baked quickly in a hot oven in a thin layer?', 'स्विस रोल स्पंज को पतली परत में गरम ओवन में जल्दी क्यों बेक करते हैं?'), options: [bi('So it stays moist and flexible', 'ताकि नम व लचीला रहे'), bi('So it becomes crisp like a biscuit', 'ताकि बिस्किट-सा करारा हो'), bi('So it rises very tall', 'ताकि बहुत ऊँचा उठे')], correct: 0, why: bi('A short bake keeps the thin sponge moist and bendable.', 'कम पकाई पतले स्पंज को नम व मुड़ने योग्य रखती है।'), scene: '⏱️' },
];

function Rise2({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const { d, mark } = useSubDone(['r', 'm'], onDone);
  const [sub, setSub] = useState<'r' | 'm'>('r');
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        <button onClick={() => setSub('r')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 'r' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 'r' ? { background: T.accent } : undefined}>
          {L('Oven rise', 'ओवन में उठना')}{d.r ? ' ✓' : ''}
        </button>
        <button onClick={() => setSub('m')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 'm' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 'm' ? { background: T.accent } : undefined}>
          {L('Raising agents', 'उठाने वाले पदार्थ')}{d.m ? ' ✓' : ''}
        </button>
      </div>
      <div style={{ display: sub === 'r' ? 'block' : 'none' }}>
        <Rise run={run} onDone={mark('r')} onNext={() => setSub('m')} />
      </div>
      <div style={{ display: sub === 'm' ? 'block' : 'none' }}>
        <MatchTask items={LV_I} zones={LV_Z} run={run} accent={T.accent} points={2} cols={3} onDone={mark('m')} />
      </div>
    </div>
  );
}

function Workshop({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const { d, mark } = useSubDone(['l', 's', 'p'], onDone);
  const [sub, setSub] = useState<'l' | 's' | 'p'>('l');
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setSub('l')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 'l' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 'l' ? { background: T.accent } : undefined}>
          {L('3D lamination', '3D लैमिनेशन')}{d.l ? ' ✓' : ''}
        </button>
        <button onClick={() => setSub('s')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 's' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 's' ? { background: T.accent } : undefined}>
          {L('Short-crust', 'शॉर्ट-क्रस्ट')}{d.s ? ' ✓' : ''}
        </button>
        <button onClick={() => setSub('p')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 'p' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 'p' ? { background: T.accent } : undefined}>
          {L('Pastry families', 'पेस्ट्री परिवार')}{d.p ? ' ✓' : ''}
        </button>
      </div>
      <div style={{ display: sub === 'l' ? 'block' : 'none' }}>
        <Lamination run={run} onDone={mark('l')} onNext={() => setSub('s')} />
      </div>
      <div style={{ display: sub === 's' ? 'block' : 'none' }}>
        <Shortcrust run={run} onDone={mark('s')} onNext={() => setSub('p')} />
      </div>
      <div style={{ display: sub === 'p' ? 'block' : 'none' }}>
        <MatchTask items={PA_I} zones={PA_Z} run={run} accent={T.accent} points={2} cols={3} onDone={mark('p')} />
      </div>
    </div>
  );
}

function Methods({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const { d, mark } = useSubDone(['c', 'm', 'b', 's'], onDone);
  const [sub, setSub] = useState<'c' | 'm' | 'b' | 's'>('c');
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setSub('c')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 'c' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 'c' ? { background: T.accent } : undefined}>
          {L('Creaming steps', 'क्रीमिंग चरण')}{d.c ? ' ✓' : ''}
        </button>
        <button onClick={() => setSub('m')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 'm' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 'm' ? { background: T.accent } : undefined}>
          {L('Cake methods', 'केक विधियाँ')}{d.m ? ' ✓' : ''}
        </button>
        <button onClick={() => setSub('b')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 'b' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 'b' ? { background: T.accent } : undefined}>
          {L('Blind baking', 'ब्लाइंड बेकिंग')}{d.b ? ' ✓' : ''}
        </button>
        <button onClick={() => setSub('s')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 's' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 's' ? { background: T.accent } : undefined}>
          {L('Swiss roll', 'स्विस रोल')}{d.s ? ' ✓' : ''}
        </button>
      </div>
      <div style={{ display: sub === 'c' ? 'block' : 'none' }}>
        <OrderTask steps={CREAM} run={run} accent={T.accent} points={3} onDone={mark('c')} />
        {d.c && !d.m && (
          <div className="flex justify-end mt-2">
            <button onClick={() => setSub('m')} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
              {L('Next: Cake methods', 'अगला: केक विधियाँ')} →
            </button>
          </div>
        )}
      </div>
      <div style={{ display: sub === 'm' ? 'block' : 'none' }}>
        <MatchTask items={CK_I} zones={CK_Z} run={run} accent={T.accent} points={2} cols={3} onDone={mark('m')} />
        {d.m && !d.b && (
          <div className="flex justify-end mt-2">
            <button onClick={() => setSub('b')} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
              {L('Next: Blind baking', 'अगला: ब्लाइंड बेकिंग')} →
            </button>
          </div>
        )}
      </div>
      <div style={{ display: sub === 'b' ? 'block' : 'none' }}>
        <OrderTask steps={BLIND} run={run} accent={T.accent} points={3} onDone={mark('b')} />
        {d.b && !d.s && (
          <div className="flex justify-end mt-2">
            <button onClick={() => setSub('s')} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
              {L('Next: Swiss roll questions', 'अगला: स्विस रोल प्रश्न')} →
            </button>
          </div>
        )}
      </div>
      <div style={{ display: sub === 's' ? 'block' : 'none' }}>
        <ChoiceTask qs={SWISS} run={run} accent={T.accent} points={5} onDone={mark('s')} />
      </div>
    </div>
  );
}

export default function PastryLabSim() {
  const L = useLang();
  const run = useRun('m2PastryLab', 24 + 40 + 55);
  const [tab, setTab] = useState<'rise' | 'work' | 'meth'>('rise');
  const ds = useDoneSet(3, run);
  const [key, setKey] = useState(0);
  const replay = () => { run.reset(); ds.reset(); setTab('rise'); setKey((k) => k + 1); };

  return (
    <FoodShell accent={T.accent} Icon={T.Icon} title={L('Pastry & Cake Bakery Lab', 'पेस्ट्री व केक बेकरी लैब')}
      subtitle={L('Raise a cake, fold 729 layers of puff pastry in real 3D, tune short-crust and master cake methods.', 'केक उठाएँ, असली 3D में पफ पेस्ट्री की 729 परतें मोड़ें, शॉर्ट-क्रस्ट साधें और केक विधियाँ सीखें।')}>
      {run.done ? <FinishCard run={run} accent={T.accent} onReplay={replay} summary={[L('Raising agents and oven rise', 'उठाने वाले पदार्थ व ओवन में उठना'), L('Puff pastry lamination: 6 turns = 729 layers', 'पफ पेस्ट्री लैमिनेशन: 6 मोड़ = 729 परतें'), L('Short-crust, creaming, blind baking, Swiss roll', 'शॉर्ट-क्रस्ट, क्रीमिंग, ब्लाइंड बेकिंग, स्विस रोल')]} /> : (
        <>
          <ChefBrief
            station={L('Pâtisserie & Viennoiserie Section (Pastry Cook)', 'पेस्ट्री व बेकरी सेक्शन (पेस्ट्री रसोइया)')}
            role={L('Apprentice Pastry Cook (Pâtissier)', 'प्रशिक्षु पेस्ट्री रसोइया (पातिसिए)')}
            task={L('Calibrate baking powder dosage for an even dome rise, execute 6 single folds in puff pastry to produce 729 micro-layers of dough and butter, master blind baking with ceramic weights, and roll warm Swiss sponge.', 'बराबर गुंबद उठाव हेतु बेकिंग पाउडर की मात्रा साधें, पफ पेस्ट्री में 6 मोड़ों से आटे व मक्खन की 729 सूक्ष्म परतें बनाएँ, सिरेमिक भार के साथ ब्लाइंड बेकिंग में महारत पाएँ, और गर्म स्विस स्पंज लपेटें।')}
            standard={L('Grade 10 CBSE Food Production · Block 12', 'कक्षा 10 फ़ूड प्रोडक्शन · ब्लॉक 12')}
          />
          <ProTip
            title={L('Lamination & Leavening Science', 'लैमिनेशन व खमीरीकरण विज्ञान')}
            text={L('Puff pastry rises on pure steam! In a hot 200°C oven, moisture inside the 729 butter sheets expands into steam, blowing the crisp dough leaves apart. Chill the dough between folds so the butter never melts into the dough!', 'पफ पेस्ट्री भाप से फूलती है! 200°C ओवन में 729 मक्खन परतों का पानी भाप बनकर फैलता है और करारी परतों को अलग करता है। मोड़ों के बीच में आटा ठंडा रखें ताकि मक्खन आटे में न पिघले!')}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs2 accent={T.accent} value={tab} onChange={setTab} tabs={[{ id: 'rise', label: L('1. Leavening Lab', '1. उठाव लैब'), done: ds.done.has('rise') }, { id: 'work', label: L('2. Pastry Workshop', '2. पेस्ट्री वर्कशॉप'), done: ds.done.has('work') }, { id: 'meth', label: L('3. Cake & Bake Methods', '3. केक व बेक विधियाँ'), done: ds.done.has('meth') }]} />
            <Hud run={run} accent={T.accent} />
          </div>
          <Card className="bg-red-50 border-red-200"><p className="text-[11px] text-red-800">🧤 {L('Safety: use oven gloves for hot trays; virtual oven only here.', 'सुरक्षा: गरम ट्रे हेतु ओवन दस्ताने इस्तेमाल करें; यहाँ केवल वर्चुअल ओवन है।')}</p></Card>
          <div key={key}>
            <div style={{ display: tab === 'rise' ? 'block' : 'none' }}>
              <Rise2 run={run} onDone={() => ds.mark('rise')} />
              {ds.done.has('rise') && (
                <div className="flex justify-end mt-3">
                  <button onClick={() => setTab('work')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                    {L('Next: Pastry Workshop', 'अगला: पेस्ट्री वर्कशॉप')} →
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: tab === 'work' ? 'block' : 'none' }}>
              <Workshop run={run} onDone={() => ds.mark('work')} />
              {ds.done.has('work') && (
                <div className="flex justify-end mt-3">
                  <button onClick={() => setTab('meth')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                    {L('Next: Cake & Bake Methods', 'अगला: केक व बेक विधियाँ')} →
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: tab === 'meth' ? 'block' : 'none' }}>
              <Methods run={run} onDone={() => ds.mark('meth')} />
            </div>
          </div>
        </>
      )}
    </FoodShell>
  );
}
