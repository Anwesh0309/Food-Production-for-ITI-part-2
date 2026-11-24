import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { FOOD2_THEMES } from '@/data/themes';
import { withAlpha } from '@/components/color';
import { playClickSound } from '@/utils/sound';
import { Card, ChefBrief, FinishCard, FoodShell, Hud, HintButton, ProTip, Tabs2, Toast, useLang, useRun, useToast } from '@/components/kit';
import { useDoneSet, type Bi2 } from '@/components/tasks';

const T = FOOD2_THEMES.precision;
const bi = (en: string, hi: string): Bi2 => ({ en, hi });

interface Sl { id: string; label: Bi2; min: number; max: number; step: number; unit: string; target: number; tol: number; init: number }
interface Cut { id: string; name: Bi2; emoji: string; veg: Bi2; spec: Bi2; kind: 'tile' | 'strip' | 'disc' | 'ratio'; sliders: Sl[]; why: Bi2 }

const CUTS: Cut[] = [
  { id: 'paysanne', name: bi('Paysanne', 'पेसान'), emoji: '🥕', veg: bi('carrot', 'गाजर'), kind: 'tile',
    spec: bi('Thin flat squares: about 12 mm × 12 mm × 3 mm', 'पतले चपटे चौकोर: लगभग 12 मिमी × 12 मिमी × 3 मिमी'),
    sliders: [
      { id: 'side', label: bi('Side of the square', 'चौकोर की भुजा'), min: 2, max: 30, step: 1, unit: 'mm', target: 12, tol: 1, init: 24 },
      { id: 'thick', label: bi('Thickness', 'मोटाई'), min: 1, max: 12, step: 1, unit: 'mm', target: 3, tol: 1, init: 8 }],
    why: bi('Paysanne pieces are thin and flat so they cook fast and evenly in soups.', 'पेसान टुकड़े पतले-चपटे होते हैं ताकि सूप में जल्दी और बराबर पकें।') },
  { id: 'shred', name: bi('Shredding', 'शेड्डिंग (बारीक पट्टी)'), emoji: '🥬', veg: bi('cabbage', 'पत्तागोभी'), kind: 'strip',
    spec: bi('Fine long strips: about 3 mm wide and 50 mm long', 'महीन लंबी पट्टियाँ: लगभग 3 मिमी चौड़ी, 50 मिमी लंबी'),
    sliders: [
      { id: 'w', label: bi('Strip width', 'पट्टी की चौड़ाई'), min: 1, max: 15, step: 1, unit: 'mm', target: 3, tol: 1, init: 9 },
      { id: 'l', label: bi('Strip length', 'पट्टी की लंबाई'), min: 10, max: 90, step: 5, unit: 'mm', target: 50, tol: 5, init: 20 }],
    why: bi('Thin shreds wilt evenly and mix well in coleslaw and stir-fries.', 'पतली पट्टियाँ बराबर मुरझाती हैं और कोलस्लॉ व स्टर-फ़्राई में अच्छी मिलती हैं।') },
  { id: 'rondelle', name: bi('Rondelle (round slices)', 'रोंडेल (गोल चकती)'), emoji: '🥒', veg: bi('cucumber', 'खीरा'), kind: 'disc',
    spec: bi('Round discs about 4 mm thick; diameter stays as the vegetable', 'लगभग 4 मिमी मोटी गोल चकतियाँ; व्यास सब्ज़ी जितना'),
    sliders: [{ id: 'thick', label: bi('Slice thickness', 'चकती की मोटाई'), min: 1, max: 15, step: 1, unit: 'mm', target: 4, tol: 1, init: 11 }],
    why: bi('Equal-thickness rondelles cook or chill evenly and look neat on a plate.', 'बराबर मोटाई की रोंडेल बराबर पकती/ठंडी होती हैं और प्लेट में सुंदर लगती हैं।') },
  { id: 'mirepoix', name: bi('Mirepoix ratio', 'मिरपुआ अनुपात'), emoji: '🧅', veg: bi('onion, carrot, celery', 'प्याज़, गाजर, अजवाइन-डंडी'), kind: 'ratio',
    spec: bi('Rough-cut aromatic base 2 : 1 : 1 — in 400 g: onion 200 g, carrot 100 g, celery 100 g', 'मोटा कटा सुगंधित आधार 2 : 1 : 1 — 400 ग्राम में: प्याज़ 200, गाजर 100, अजवाइन-डंडी 100 ग्राम'),
    sliders: [
      { id: 'on', label: bi('Onion', 'प्याज़'), min: 0, max: 400, step: 10, unit: 'g', target: 200, tol: 10, init: 100 },
      { id: 'ca', label: bi('Carrot', 'गाजर'), min: 0, max: 400, step: 10, unit: 'g', target: 100, tol: 10, init: 150 },
      { id: 'ce', label: bi('Celery', 'अजवाइन-डंडी'), min: 0, max: 400, step: 10, unit: 'g', target: 100, tol: 10, init: 150 }],
    why: bi('Mirepoix = 2 parts onion : 1 part carrot : 1 part celery; it flavours stocks and sauces.', 'मिरपुआ = 2 भाग प्याज़ : 1 भाग गाजर : 1 भाग अजवाइन-डंडी; यह स्टॉक व सॉस को स्वाद देता है।') },
];

interface Yd { id: string; emoji: string; name: Bi2; ap: number; ep: number; mode: 'yield' | 'buy'; need?: number }
const YIELDS: Yd[] = [
  { id: 'carrot', emoji: '🥕', name: bi('Carrot', 'गाजर'), ap: 2000, ep: 1700, mode: 'yield' },
  { id: 'potato', emoji: '🥔', name: bi('Potato', 'आलू'), ap: 1500, ep: 1200, mode: 'yield' },
  { id: 'cabbage', emoji: '🥬', name: bi('Cabbage', 'पत्तागोभी'), ap: 2400, ep: 1800, mode: 'yield' },
  { id: 'buy', emoji: '🧾', name: bi('Purchase planning', 'खरीद योजना'), ap: 1500, ep: 1200, mode: 'buy', need: 3000 },
];

function Preview({ cut, vals }: { cut: Cut; vals: Record<string, number> }) {
  const v = (id: string) => vals[id];
  if (cut.kind === 'tile') {
    const s = v('side') * 4, t = v('thick') * 4;
    return (<svg viewBox="0 0 240 150" className="w-full max-w-sm mx-auto" data-testid="preview">
      <text x="8" y="14" fontSize="10" fill="#64748b">{'Top / ऊपर'}</text>
      <rect x="20" y="20" width={s} height={s} fill="#fb923c" stroke="#9a3412" rx="2" />
      <text x="140" y="14" fontSize="10" fill="#64748b">{'Side / किनारा'}</text>
      <rect x="140" y={130 - t} width={s} height={t} fill="#fdba74" stroke="#9a3412" />
      <text x="140" y="146" fontSize="9" fill="#475569">{v('side')} × {v('thick')} mm</text>
    </svg>);
  }
  if (cut.kind === 'strip') {
    const w = v('w') * 4, l = Math.min(v('l') * 2.2, 220);
    return (<svg viewBox="0 0 240 90" className="w-full max-w-sm mx-auto" data-testid="preview">
      {[0, 1, 2].map((i) => <rect key={i} x="14" y={14 + i * (w + 6)} width={l} height={w} fill="#a3e635" stroke="#4d7c0f" rx="1.5" />)}
      <text x="14" y="86" fontSize="9" fill="#475569">{v('w')} mm × {v('l')} mm</text>
    </svg>);
  }
  if (cut.kind === 'disc') {
    const t = v('thick') * 3;
    return (<svg viewBox="0 0 240 110" className="w-full max-w-sm mx-auto" data-testid="preview">
      {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={60 + i * (t + 6)} cy="52" rx={t / 2 + 1} ry="34" fill="#bef264" stroke="#4d7c0f" />)}
      <text x="14" y="104" fontSize="9" fill="#475569">{L2(v('thick'))}</text>
    </svg>);
  }
  const tot = v('on') + v('ca') + v('ce') || 1;
  const bar = (n: number, c: string, name: string, x: number) => (
    <g key={name}><rect x={x} y={100 - (n / 400) * 90} width="46" height={(n / 400) * 90} fill={c} rx="3" /><text x={x + 23} y={112} fontSize="9" textAnchor="middle" fill="#475569">{name}</text><text x={x + 23} y={96 - (n / 400) * 90} fontSize="9" textAnchor="middle" fill="#334155">{n} g</text></g>);
  return (<svg viewBox="0 0 240 120" className="w-full max-w-sm mx-auto" data-testid="preview">
    {bar(v('on'), '#fcd34d', 'Onion', 20)}{bar(v('ca'), '#fb923c', 'Carrot', 90)}{bar(v('ce'), '#86efac', 'Celery', 160)}
    <text x="232" y="14" fontSize="9" textAnchor="end" fill="#64748b">{tot} g</text>
  </svg>);
}
const L2 = (n: number) => `${n} mm`;

type Run2 = ReturnType<typeof useRun>;

function CutLab({ run, onDone, onNext }: { run: Run2; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [idx, setIdx] = useState(0);
  const cut = CUTS[idx];
  const init = (c: Cut) => Object.fromEntries(c.sliders.map((s) => [s.id, s.init]));
  const [vals, setVals] = useState<Record<string, number>>(init(CUTS[0]));
  const [passed, setPassed] = useState<boolean[]>(CUTS.map(() => false));
  const [cutting, setCutting] = useState(false);
  const { toast, say } = useToast();
  useEffect(() => { if (passed.every(Boolean)) onDone(); /* eslint-disable-next-line */ }, [passed]);
  const go = (i: number) => { setIdx(i); setVals(init(CUTS[i])); say('info', null); };
  const doCut = () => {
    if (cutting || passed[idx]) return;
    setCutting(true);
    playClickSound('neutral');
    setTimeout(() => {
      setCutting(false);
      const bad = cut.sliders.filter((s) => Math.abs(vals[s.id] - s.target) > s.tol);
      if (bad.length === 0) {
        run.add(10); setPassed((p) => p.map((x, i) => (i === idx ? true : x)));
        playClickSound('success');
        say('ok', L(`Perfect ${cut.name.en}! ${cut.why.en}`, `बढ़िया ${cut.name.hi}! ${cut.why.hi}`));
      } else {
        run.miss();
        playClickSound('error');
        const s = bad[0], big = vals[s.id] > s.target;
        say('bad', L(`${s.label.en} is ${big ? 'too large' : 'too small'} (${vals[s.id]} ${s.unit}). Adjust the slider and cut again.`, `${s.label.hi} ${big ? 'ज़्यादा' : 'कम'} है (${vals[s.id]} ${s.unit})। स्लाइडर बदलकर फिर काटें।`));
      }
    }, 650);
  };
  const hint = () => { run.hint(); say('info', L(`Target — ${cut.spec.en}`, `लक्ष्य — ${cut.spec.hi}`)); };
  return (
    <div className="space-y-3" data-testid="cut-lab">
      <ChefBrief
        station={L('Classical Vegetable Prep Station (Garde Manger)', 'शास्त्रीय सब्ज़ी तैयारी स्टेशन (गार्द मांजरे)')}
        role={L('Prep Commis Cook', 'प्रिप कॉमी रसोइया')}
        task={L('Sous Chef ordered standard vegetable cuts for the evening soups and salads. Calibrate your knife cuts to exact culinary millimeters so every piece cooks evenly at the exact same rate.', 'सूस शेफ़ ने शाम के सूप व सलाद हेतु मानक कट मँगाए हैं। अपने चाकू के कट को सटीक मिलीमीटर पर सेट करें ताकि हर टुकड़ा एक समान दर से पके।')}
        standard={L('Grade 10 CBSE Food Production · Practicals 22–25', 'कक्षा 10 फ़ूड प्रोडक्शन · प्रैक्टिकल 22–25')}
      />
      <ProTip
        title={L('Professional Cutting Technique', 'व्यावसायिक कटिंग तकनीक')}
        text={L('Always square off round vegetables by slicing 4 thin flat edges first. This creates a stable base so the vegetable will not slip under your chef\'s knife!', 'गोल सब्ज़ियों के 4 पतले किनारे काटकर पहले चौकोर आधार बनाएँ। इससे सब्ज़ी स्थिर होती है और चाकू के नीचे फिसलती नहीं!')}
      />
      <div className="flex flex-wrap gap-1.5">
        {CUTS.map((c, i) => (
          <button key={c.id} onClick={() => go(i)} data-cut={c.id} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${i === idx ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700'}`} style={i === idx ? { background: T.accent, borderColor: T.accent } : undefined}>
            {c.emoji} {L(c.name.en, c.name.hi)}{passed[i] ? ' ✓' : ''}
          </button>
        ))}
      </div>
      <Card className="space-y-1"><p className="text-sm font-bold">{cut.emoji} {L(cut.name.en, cut.name.hi)} — {L(cut.veg.en, cut.veg.hi)}</p><p className="text-xs text-stone-600 dark:text-stone-300">{L(cut.spec.en, cut.spec.hi)}</p></Card>
      <div className="relative rounded-2xl border p-3" style={{ background: 'linear-gradient(#fef3c7,#fde68a)', borderColor: withAlpha(T.accent, 0.3) }}>
        <Preview cut={cut} vals={vals} />
        <motion.div className="absolute right-6 top-2 text-4xl pointer-events-none" animate={cutting ? { y: [0, 70, 0], rotate: [0, -12, 0] } : { y: 0 }} transition={{ duration: 0.6 }}>🔪</motion.div>
        {passed[idx] && <div className="absolute inset-0 grid place-items-center bg-green-500/15 rounded-2xl text-5xl">✅</div>}
      </div>
      <div className="grid gap-2">
        {cut.sliders.map((s) => (
          <label key={s.id} className="text-xs text-stone-700 dark:text-stone-300 flex items-center gap-3">
            <span className="w-32 font-semibold">{L(s.label.en, s.label.hi)}</span>
            <input type="range" min={s.min} max={s.max} step={s.step} value={vals[s.id]} disabled={passed[idx]} data-slider={s.id}
              onChange={(e) => setVals((v) => ({ ...v, [s.id]: +e.target.value }))} className="flex-1" style={{ accentColor: T.accent }} />
            <span className="w-16 text-right font-mono font-bold">{vals[s.id]} {s.unit}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={doCut} disabled={cutting || passed[idx]} data-testid="cut-btn" className="px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>🔪 {L('Cut!', 'काटें!')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        {passed[idx] && idx < CUTS.length - 1 && <button onClick={() => go(idx + 1)} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm" data-testid="next-cut">{L('Next cut', 'अगला कट')} →</button>}
      </div>
      {passed.every(Boolean) && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-green-900 dark:text-green-200">✅ {L('All knife cuts calibrated to specification!', 'सभी चाकू कट मानक अनुसार कैलिब्रेट!')}</p>
            <p className="text-xs text-green-700 dark:text-green-300">{L('Ready to calculate food production yields.', 'खाद्य उत्पादन उपज गणना हेतु तैयार।')}</p>
          </div>
          <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
            {L('Proceed to Yield Lab', 'उपज लैब पर जाएँ')} →
          </button>
        </motion.div>
      )}
      <Toast {...toast} />
    </div>
  );
}

function YieldLab({ run, onDone }: { run: Run2; onDone: () => void }) {
  const L = useLang();
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState<0 | 1>(0); // 0 weigh AP, 1 trimmed
  const [a, setA] = useState(''); const [b, setB] = useState('');
  const [step, setStep] = useState<0 | 1>(0); // for 'yield': 0 yield%, 1 wastage%
  const [passed, setPassed] = useState<boolean[]>(YIELDS.map(() => false));
  const { toast, say } = useToast();
  const y = YIELDS[idx];
  const yieldPct = Math.round((y.ep / y.ap) * 100);
  useEffect(() => { if (passed.every(Boolean)) onDone(); /* eslint-disable-next-line */ }, [passed]);
  const mark = () => setPassed((p) => p.map((x, i) => (i === idx ? true : x)));
  const trim = () => { playClickSound('neutral'); setStage(1); say('info', L(`Trimmed! Edible portion (EP) = ${y.ep} g from ${y.ap} g as purchased (AP).`, `छँटाई पूरी! खाने योग्य भाग (EP) = ${y.ep} ग्राम, खरीदा वज़न (AP) ${y.ap} ग्राम।`)); };
  const check = () => {
    const n = parseFloat(a);
    if (isNaN(n)) return;
    if (y.mode === 'yield') {
      if (step === 0) {
        if (Math.abs(n - yieldPct) <= 1) {
          run.add(8); setStep(1); setA('');
          playClickSound('success');
          say('ok', L(`Yield % = EP ÷ AP × 100 = ${y.ep} ÷ ${y.ap} × 100 = ${yieldPct}%. Now find the wastage %.`, `उपज % = EP ÷ AP × 100 = ${y.ep} ÷ ${y.ap} × 100 = ${yieldPct}%। अब बर्बादी % निकालें।`));
        } else {
          run.miss(); playClickSound('error');
          say('bad', L('Not right. Divide the edible portion by the as-purchased weight, then × 100.', 'सही नहीं। खाने योग्य भाग को खरीदे वज़न से भाग दें, फिर × 100।'));
        }
      } else {
        if (Math.abs(n - (100 - yieldPct)) <= 1) {
          run.add(4); mark();
          playClickSound('success');
          say('ok', L(`Wastage = 100 − ${yieldPct} = ${100 - yieldPct}% (${y.ap - y.ep} g of peel and trim).`, `बर्बादी = 100 − ${yieldPct} = ${100 - yieldPct}% (${y.ap - y.ep} ग्राम छिलका/छँटाई)।`));
        } else {
          run.miss(); playClickSound('error');
          say('bad', L('Wastage % = 100 − yield %.', 'बर्बादी % = 100 − उपज %।'));
        }
      }
    } else {
      const need = y.need!; const ap = Math.round(need / (y.ep / y.ap));
      if (Math.abs(n - ap) <= 50) {
        run.add(10); mark();
        playClickSound('success');
        say('ok', L(`AP needed = EP ÷ yield = ${need} ÷ 0.80 = ${ap} g (≈ ${ap / 1000} kg).`, `ज़रूरी AP = EP ÷ उपज = ${need} ÷ 0.80 = ${ap} ग्राम (≈ ${ap / 1000} किग्रा)।`));
      } else {
        run.miss(); playClickSound('error');
        say('bad', L('You need MORE than 3 kg: divide the 3000 g EP by the yield (0.80).', '3 किग्रा से ज़्यादा चाहिए: 3000 ग्राम EP को उपज (0.80) से भाग दें।'));
      }
    }
    void b; void setB;
  };
  const go = (i: number) => { setIdx(i); setStage(YIELDS[i].mode === 'buy' ? 1 : 0); setStep(0); setA(''); say('info', null); };
  const hint = () => { run.hint(); say('info', y.mode === 'buy' ? L('AP = EP ÷ (yield % ÷ 100). Potato yield is 80%.', 'AP = EP ÷ (उपज % ÷ 100)। आलू की उपज 80% है।') : step === 0 ? L(`Yield % = ${y.ep} ÷ ${y.ap} × 100`, `उपज % = ${y.ep} ÷ ${y.ap} × 100`) : L('Wastage % = 100 − yield %', 'बर्बादी % = 100 − उपज %')); };
  const waste = y.ap - y.ep;
  const prompt = y.mode === 'buy' ? L('Potatoes give 80% yield. To serve 3000 g of cooked-ready peeled potato (EP), how many grams must you buy (AP)?', 'आलू की उपज 80% है। 3000 ग्राम छिले आलू (EP) चाहिए तो कितने ग्राम खरीदें (AP)?') : step === 0 ? L('Enter the yield % (EP ÷ AP × 100):', 'उपज % लिखें (EP ÷ AP × 100):') : L('Enter the wastage %:', 'बर्बादी % लिखें:');
  return (
    <div className="space-y-3" data-testid="yield-lab">
      <ChefBrief
        station={L('Receiving & Food Cost Control Dock', 'माल-प्राप्ति व खाद्य लागत नियंत्रण डॉक')}
        role={L('Food Cost & Prep Assistant', 'खाद्य लागत व तैयारी सहायक')}
        task={L('Weigh As-Purchased (AP) raw produce, trim off non-edible peel and stems, and compute Edible Portion (EP) yield percentage. Accurate yield logs prevent food shortages during a 100-guest banquet!', 'खरीदी गई कच्ची सामग्री (AP) तौलें, छिलके व डंठल छाँटें, और खाने योग्य भाग (EP) की उपज % निकालें। सटीक उपज रिकॉर्ड 100-अतिथि बैंक्वेट में कमी से बचाते हैं!')}
        standard={L('Grade 10 CBSE Food Production · Yield & Wastage Control', 'कक्षा 10 फ़ूड प्रोडक्शन · उपज व बर्बादी नियंत्रण')}
      />
      <ProTip
        title={L('Wastage Reduction Rule', 'बर्बादी घटाने का नियम')}
        text={L('Formula: Yield % = (EP ÷ AP) × 100. Never throw away clean carrot and celery trims! In commercial kitchens, washed peels are simmered in stockpots to extract flavor at zero extra cost.', 'सूत्र: उपज % = (EP ÷ AP) × 100। गाजर व सेलरी के साफ़ छिलके कभी न फेंकें! व्यावसायिक रसोई में इन्हें स्टॉक पॉट में उबालकर बिना किसी अतिरिक्त लागत के स्वाद निकाला जाता है।')}
      />
      <div className="flex flex-wrap gap-1.5">
        {YIELDS.map((q, i) => (
          <button key={q.id} onClick={() => go(i)} data-yield={q.id} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${i === idx ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700'}`} style={i === idx ? { background: T.accent, borderColor: T.accent } : undefined}>
            {q.emoji} {L(q.name.en, q.name.hi)}{passed[i] ? ' ✓' : ''}
          </button>
        ))}
      </div>
      {y.mode === 'yield' && (
        <div className="rounded-2xl border p-4 bg-gradient-to-b from-stone-50 to-stone-100 dark:from-slate-900 dark:to-slate-800 space-y-3">
          <div className="flex items-center justify-around">
            <div className="text-center"><Scale className="mx-auto text-stone-500" size={20} /><motion.div key={stage} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-5xl">{stage === 0 ? y.emoji : '🍽️'}</motion.div>
              <p className="font-mono font-bold text-lg" data-testid="weight">{stage === 0 ? y.ap : y.ep} g</p><p className="text-[11px] text-stone-500">{stage === 0 ? L('As purchased (AP)', 'खरीदा वज़न (AP)') : L('Edible portion (EP)', 'खाने योग्य (EP)')}</p></div>
            <div className="text-center"><div className="text-3xl" style={{ opacity: stage === 1 ? 1 : 0.2 }}>🗑️</div><motion.div className="font-mono font-bold" animate={{ opacity: stage === 1 ? 1 : 0.2 }}>{stage === 1 ? waste : '—'} g</motion.div><p className="text-[11px] text-stone-500">{L('Peel & trim waste', 'छिलका व कचरा')}</p></div>
          </div>
          {stage === 0 && <button onClick={trim} data-testid="trim-btn" className="mx-auto block px-4 py-2 rounded-lg text-white text-xs font-bold shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>🔪 {L('Peel & trim', 'छीलें व छाँटें')}</button>}
        </div>
      )}
      {(stage === 1 || y.mode === 'buy') && !passed[idx] && (
        <Card className="space-y-2">
          <p className="text-sm font-semibold">{prompt}</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={a}
              onChange={(e) => setA(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && a !== '') check(); }}
              data-testid="num-input"
              className="w-32 px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 text-sm font-mono"
              placeholder={y.mode === 'buy' ? 'g' : '%'}
            />
            <button onClick={check} disabled={a === ''} data-testid="check-btn" className="px-4 py-2 rounded-lg text-white text-xs font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>{L('Check', 'जाँचें')}</button>
            <HintButton onHint={hint} accent={T.accent} />
          </div>
        </Card>
      )}
      {passed[idx] && idx < YIELDS.length - 1 && <button onClick={() => go(idx + 1)} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm" data-testid="next-yield">{L('Next item', 'अगली सामग्री')} →</button>}
      {passed.every(Boolean) && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 text-center">
          <p className="font-bold text-sm text-green-900 dark:text-green-200">🎉 {L('All yield and purchase planning calculations mastered!', 'सभी उपज व खरीद योजना गणनाओं में महारत हासिल की!')}</p>
        </motion.div>
      )}
      <Toast {...toast} />
    </div>
  );
}

export default function PrecisionSim() {
  const L = useLang();
  const run = useRun('m2Precision', 86);
  const [tab, setTab] = useState<'cut' | 'yield'>('cut');
  const ds = useDoneSet(2, run);
  const [key, setKey] = useState(0);
  const replay = () => { run.reset(); ds.reset(); setTab('cut'); setKey((k) => k + 1); };
  return (
    <FoodShell accent={T.accent} Icon={T.Icon} title={L('Precision Cuts & Yield Lab', 'सटीक कट व उपज लैब')}
      subtitle={L('Set the knife size with sliders, then weigh, trim and calculate how much is really edible.', 'स्लाइडर से टुकड़े का आकार तय करें, फिर तोलें, छाँटें और खाने योग्य मात्रा निकालें।')}>
      {run.done ? <FinishCard run={run} accent={T.accent} onReplay={replay} summary={[L('4 cuts matched to specification', '4 कट मानक के अनुसार'), L('Yield, wastage and purchase quantity calculated', 'उपज, बर्बादी व खरीद मात्रा निकाली')]} /> : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs2 accent={T.accent} value={tab} onChange={setTab} tabs={[{ id: 'cut', label: L('1. Cut Lab', '1. कट लैब'), done: ds.done.has('cut') }, { id: 'yield', label: L('2. Yield Lab', '2. उपज लैब'), done: ds.done.has('yield') }]} />
            <Hud run={run} accent={T.accent} />
          </div>
          <div key={key}>
            <div style={{ display: tab === 'cut' ? 'block' : 'none' }}>
              <CutLab run={run} onDone={() => ds.mark('cut')} onNext={() => setTab('yield')} />
            </div>
            <div style={{ display: tab === 'yield' ? 'block' : 'none' }}>
              <YieldLab run={run} onDone={() => ds.mark('yield')} />
            </div>
          </div>
        </>
      )}
    </FoodShell>
  );
}
