import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FOOD2_THEMES } from '@/data/themes';
import { playClickSound } from '@/utils/sound';
import { Card, ChefBrief, FinishCard, FoodShell, Hud, HintButton, ProTip, SubTabs, Tabs2, Toast, useLang, useRun, useSubDone, useToast, type Run } from '@/components/kit';
import { ChoiceTask, MatchTask, OrderTask, useDoneSet, type Bi2, type ChoiceQ, type MatchItem, type MatchZone, type OrderStep } from '@/components/tasks';

const T = FOOD2_THEMES.quality;
const bi = (en: string, hi: string): Bi2 => ({ en, hi });
const mz = (id: string, emoji: string, label: Bi2): MatchZone => ({ id, emoji, label });
const mi = (id: string, cat: string, emoji: string, label: Bi2, why: Bi2): MatchItem => ({ id, cat, emoji, label, why });

/* ---------------- Adulteration bench ---------------- */
interface Test { id: string; icon: string; name: Bi2; sample: Bi2; action: Bi2; pure: { c: string; t: Bi2 }; bad: { c: string; t: Bi2 }; why: Bi2 }
const TESTS: Test[] = [
  { id: 'starch', icon: '🥛', name: bi('Starch in milk', 'दूध में स्टार्च'), sample: bi('boiled, cooled milk', 'उबला, ठंडा दूध'), action: bi('Add 2 drops of iodine', 'आयोडीन की 2 बूँदें डालें'), pure: { c: '#fef3c7', t: bi('stays pale — no starch', 'फीका रहा — स्टार्च नहीं') }, bad: { c: '#1e3a8a', t: bi('turns blue-black — starch present', 'नीला-काला हुआ — स्टार्च मौजूद') }, why: bi('Iodine turns blue-black in the presence of starch.', 'स्टार्च की मौजूदगी में आयोडीन नीला-काला हो जाता है।') },
  { id: 'iron', icon: '🧲', name: bi('Iron filings in tea or sooji', 'चाय/सूजी में लोहे का बुरादा'), sample: bi('a spoon of the powder on paper', 'काग़ज़ पर एक चम्मच पाउडर'), action: bi('Move a magnet underneath', 'नीचे चुंबक घुमाएँ'), pure: { c: '#d6d3d1', t: bi('nothing sticks to the magnet', 'चुंबक पर कुछ नहीं चिपका') }, bad: { c: '#111827', t: bi('black filings cling to the magnet', 'काला बुरादा चुंबक से चिपका') }, why: bi('A magnet pulls out iron filings.', 'चुंबक लोहे का बुरादा खींच लेता है।') },
  { id: 'chalk', icon: '🍚', name: bi('Chalk powder in sugar', 'चीनी में चॉक पाउडर'), sample: bi('a spoon of sugar in a glass of water', 'पानी के गिलास में एक चम्मच चीनी'), action: bi('Stir and let it settle', 'चलाएँ और ठहरने दें'), pure: { c: '#e0f2fe', t: bi('dissolves into clear water', 'साफ़ पानी में घुल गई') }, bad: { c: '#f8fafc', t: bi('cloudy, white sediment settles at bottom', 'धुँधला, तली में सफ़ेद तलछट जमी') }, why: bi('Sugar dissolves; chalk does not and settles.', 'चीनी घुलती है; चॉक नहीं घुलती, तली में बैठती है।') },
  { id: 'water', icon: '💧', name: bi('Water in milk', 'दूध में पानी'), sample: bi('a drop of milk on slanted polished surface', 'तिरछी चिकनी सतह पर दूध की बूँद'), action: bi('Let the drop run down', 'बूँद को नीचे बहने दें'), pure: { c: '#ffffff', t: bi('flows slowly and leaves a white trail', 'धीरे बहा और सफ़ेद निशान छोड़ा') }, bad: { c: '#e2e8f0', t: bi('runs fast and leaves no trail', 'तेज़ बहा और निशान नहीं छोड़ा') }, why: bi('Pure milk is thicker and leaves a white trail; watered milk runs off clean.', 'शुद्ध दूध गाढ़ा होता है और सफ़ेद निशान छोड़ता है; पानी मिला दूध साफ़ बह जाता है।') },
];

function Bench({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [ti, setTi] = useState(0);
  const [adult] = useState(() => TESTS.map(() => (Math.random() < 0.5 ? 'A' : 'B')));
  const [ran, setRan] = useState<Record<string, boolean>>({});
  const [ok, setOk] = useState(TESTS.map(() => false));
  const { toast, say } = useToast();
  const t = TESTS[ti];
  useEffect(() => { if (ok.every(Boolean)) onDone(); /* eslint-disable-next-line */ }, [ok]);
  const res = (s: 'A' | 'B') => (adult[ti] === s ? t.bad : t.pure);
  const runTest = (s: 'A' | 'B') => {
    playClickSound('neutral');
    setRan((r) => ({ ...r, [`${ti}${s}`]: true }));
    say('info', L(`${t.action.en} on sample ${s}…`, `नमूना ${s} पर ${t.action.hi}…`));
  };
  const verdict = (s: 'A' | 'B') => {
    if (ok[ti]) return;
    if (!ran[`${ti}A`] || !ran[`${ti}B`]) { say('info', L('Run the test on both samples before you decide.', 'निर्णय से पहले दोनों नमूनों पर परीक्षण करें।')); return; }
    if (adult[ti] === s) {
      run.add(8); setOk((o) => o.map((v, i) => (i === ti ? true : v)));
      playClickSound('success');
      say('ok', L(`Correct — sample ${s} is adulterated. ${t.why.en}`, `सही — नमूना ${s} मिलावटी है। ${t.why.hi}`));
    } else {
      run.miss(); playClickSound('error');
      say('bad', L('Compare the two results again: the adulterated sample shows the warning sign.', 'दोनों परिणाम फिर मिलाएँ: मिलावटी नमूना चेतावनी-संकेत दिखाता है।'));
    }
  };
  const hint = () => { run.hint(); say('info', L(`Look for: ${t.bad.t.en}.`, `देखें: ${t.bad.t.hi}।`)); };
  return (
    <div className="space-y-3" data-testid="bench">
      <div className="flex gap-1.5 flex-wrap">{TESTS.map((x, i) => <button key={x.id} data-test={x.id} onClick={() => { setTi(i); say('info', null); }} className={`px-3 py-1.5 rounded-lg border text-xs ${ti === i ? 'font-bold border-2' : ''}`} style={ti === i ? { borderColor: T.accent } : undefined}>{x.icon} {L(x.name.en, x.name.hi)}{ok[i] ? ' ✓' : ''}</button>)}</div>
      <Card><p className="text-xs"><b>{L('Test', 'परीक्षण')}:</b> {L(t.sample.en, t.sample.hi)} → {L(t.action.en, t.action.hi)}.</p></Card>
      <div className="grid grid-cols-2 gap-2">
        {(['A', 'B'] as const).map((s) => { const shown = ran[`${ti}${s}`]; const r = res(s); return (
          <div key={s} className="rounded-xl border p-3 text-center space-y-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <b>{L('Sample', 'नमूना')} {s}</b>
            <motion.div animate={{ backgroundColor: shown ? r.c : '#f1f5f9' }} className="w-16 h-16 rounded-full mx-auto border-2 border-white shadow grid place-items-center text-2xl" data-testid={`sample-${s}`} data-result={shown ? (adult[ti] === s ? 'adulterated' : 'pure') : 'untested'}>{t.icon}</motion.div>
            <p className="text-[11px] min-h-[30px] font-medium">{shown ? L(r.t.en, r.t.hi) : L('not tested yet', 'अभी परखा नहीं')}</p>
            <button onClick={() => runTest(s)} disabled={ok[ti]} data-testid={`run-${s}`} className="w-full px-2 py-1.5 rounded-lg text-white text-xs font-bold disabled:opacity-40 shadow-sm" style={{ background: T.accent }}>🧪 {L('Run test', 'परीक्षण करें')}</button>
            <button onClick={() => verdict(s)} disabled={ok[ti]} data-testid={`bad-${s}`} className="w-full px-2 py-1.5 rounded-lg border border-red-300 text-red-700 text-xs font-bold disabled:opacity-40 hover:bg-red-50 dark:hover:bg-red-950/40">🚫 {L('This is adulterated', 'यह मिलावटी है')}</button>
          </div>); })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <HintButton onHint={hint} accent={T.accent} />
        {ok[ti] && ti < TESTS.length - 1 && (
          <button onClick={() => { setTi(ti + 1); say('info', null); }} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {L('Next adulteration test', 'अगला मिलावट परीक्षण')} →
          </button>
        )}
        {ok.every(Boolean) && (
          <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
            {L('Next: HACCP Safety Plan', 'अगला: HACCP सुरक्षा योजना')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

/* ---------------- HACCP ---------------- */
const P7: OrderStep[] = [
  { id: 'h1', emoji: '⚠️', label: bi('Conduct a hazard analysis', 'खतरा विश्लेषण करें'), why: bi('First find what could go wrong (biological, chemical, physical).', 'पहले देखें क्या गलत हो सकता है (जैविक, रासायनिक, भौतिक)।') },
  { id: 'h2', emoji: '📍', label: bi('Identify Critical Control Points (CCPs)', 'क्रिटिकल कंट्रोल पॉइंट (CCP) पहचानें'), why: bi('A CCP is a step where a hazard can be prevented or removed.', 'CCP वह चरण है जहाँ खतरा रोका या हटाया जा सकता है।') },
  { id: 'h3', emoji: '📏', label: bi('Set critical limits for each CCP', 'हर CCP हेतु क्रिटिकल सीमाएँ तय करें'), why: bi('Limits are measurable, e.g. 75 °C core.', 'सीमाएँ मापने योग्य होती हैं, जैसे केंद्र 75 °C।') },
  { id: 'h4', emoji: '🌡️', label: bi('Set up monitoring system', 'निगरानी व्यवस्था बनाएँ'), why: bi('Monitoring checks the limit is being met.', 'निगरानी जाँचती है कि सीमा पूरी हो रही है।') },
  { id: 'h5', emoji: '🛠️', label: bi('Decide corrective actions', 'सुधारात्मक कार्रवाई तय करें'), why: bi('Say in advance what to do if a limit is missed.', 'पहले से तय करें कि सीमा चूकने पर क्या करना है।') },
  { id: 'h6', emoji: '🔎', label: bi('Verify that the system works', 'सत्यापित करें कि प्रणाली काम करती है'), why: bi('Verification confirms the plan is effective.', 'सत्यापन पुष्टि करता है कि योजना प्रभावी है।') },
  { id: 'h7', emoji: '📝', label: bi('Keep records and documentation', 'अभिलेख व दस्तावेज़ रखें'), why: bi('Records prove the plan is followed.', 'अभिलेख साबित करते हैं कि योजना का पालन हुआ।') },
];
const CCP_Z = [mz('recv', '🚚', bi('Receiving chilled meat', 'ठंडा मांस प्राप्त करना')), mz('cook', '🔥', bi('Cooking chicken', 'चिकन पकाना')), mz('hold', '♨️', bi('Hot holding', 'गरम रखना')), mz('cold', '❄️', bi('Cold display', 'ठंडा प्रदर्शन'))];
const CCP_I = [
  mi('l1', 'recv', '🌡️', bi('Core 5 °C or below on arrival', 'आने पर केंद्र 5 °C या कम'), bi('Chilled food must arrive at 5 °C or below.', 'ठंडा भोजन 5 °C या कम पर आना चाहिए।')),
  mi('l2', 'cook', '🔥', bi('Core reaches 75 °C', 'केंद्र 75 °C तक पहुँचे'), bi('75 °C at the core kills harmful bacteria.', 'केंद्र का 75 °C हानिकारक जीवाणु मारता है।')),
  mi('l3', 'hold', '♨️', bi('Kept at 63 °C or above', '63 °C या ऊपर रखा'), bi('Hot-held food must stay at 63 °C or above.', 'गरम रखा भोजन 63 °C या ऊपर रहना चाहिए।')),
  mi('l4', 'cold', '🧊', bi('Kept at 5 °C or below', '5 °C या कम पर रखा'), bi('Cold display must stay at 5 °C or below.', 'ठंडा प्रदर्शन 5 °C या कम पर रहना चाहिए।')),
  mi('l5', 'cook', '⏱️', bi('Check with a probe thermometer', 'प्रोब थर्मामीटर से जाँचें'), bi('A probe confirms the true core temperature.', 'प्रोब असली केंद्र तापमान पक्का करता है।')),
];
const CORRECT: ChoiceQ[] = [
  { q: bi('The probe shows 68 °C in the centre of cooked chicken. What is the corrective action?', 'पके चिकन के केंद्र में प्रोब 68 °C दिखाता है। सुधारात्मक कार्रवाई क्या है?'), options: [bi('Serve it — it looks cooked', 'परोस दें — पका दिखता है'), bi('Keep cooking until the core reaches 75 °C, then re-check', 'केंद्र 75 °C होने तक पकाएँ, फिर दोबारा जाँचें'), bi('Rinse it in cold water', 'ठंडे पानी से धो लें')], correct: 1, why: bi('The critical limit is 75 °C at the core; continue cooking and re-check.', 'क्रिटिकल सीमा केंद्र पर 75 °C है; पकाते रहें और फिर जाँचें।'), scene: '🌡️' },
  { q: bi('The hot-hold soup was found at 52 °C and has been there for more than two hours. What do you do?', 'गरम-रखा सूप 52 °C मिला और दो घंटे से ज़्यादा से वहीं है। क्या करें?'), options: [bi('Discard it and record the action', 'फेंक दें और कार्रवाई दर्ज करें'), bi('Stir and keep serving', 'चलाकर परोसते रहें'), bi('Add more hot soup on top', 'ऊपर और गरम सूप डाल दें')], correct: 0, why: bi('Below 63 °C for too long means bacteria may have grown — discard and record.', 'लंबे समय 63 °C से कम = जीवाणु बढ़ सकते हैं — फेंकें और दर्ज करें।'), scene: '🍲' },
  { q: bi('A delivery of chilled chicken arrives at 11 °C. What is correct?', 'ठंडे चिकन की डिलीवरी 11 °C पर आती है। सही क्या है?'), options: [bi('Accept and refrigerate it', 'ले लें और फ्रिज में रखें'), bi('Reject it and record the failure', 'लौटा दें और विफलता दर्ज करें'), bi('Freeze it straight away and use it later', 'तुरंत जमाकर बाद में इस्तेमाल करें')], correct: 1, why: bi('The limit is 5 °C or below on arrival; reject the delivery.', 'आने पर सीमा 5 °C या कम है; डिलीवरी लौटाएँ।'), scene: '🚚' },
];

/* ---------------- FSSAI label inspector ---------------- */
interface Row { id: string; k: Bi2; v: Bi2 | null; bad?: boolean }
const LABELS: { id: string; name: Bi2; rows: Row[] }[] = [
  { id: 'a', name: bi('Label A — Masala biscuits', 'लेबल A — मसाला बिस्किट'), rows: [
    { id: 'name', k: bi('Product name', 'उत्पाद नाम'), v: bi('Masala Crunch Biscuits', 'मसाला क्रंच बिस्किट') }, { id: 'veg', k: bi('Veg / non-veg mark', 'शाकाहारी/मांसाहारी चिह्न'), v: bi('🟢 Vegetarian', '🟢 शाकाहारी') },
    { id: 'ing', k: bi('Ingredients', 'सामग्री'), v: bi('Wheat flour, edible oil, salt, spices', 'गेहूँ का आटा, खाद्य तेल, नमक, मसाले') }, { id: 'net', k: bi('Net quantity', 'शुद्ध मात्रा'), v: bi('200 g', '200 ग्राम') },
    { id: 'fssai', k: bi('FSSAI licence number', 'FSSAI लाइसेंस नंबर'), v: null, bad: true }, { id: 'exp', k: bi('Best before / expiry', 'सर्वोत्तम पूर्व / समाप्ति'), v: null, bad: true },
    { id: 'nut', k: bi('Nutrition information', 'पोषण जानकारी'), v: bi('Per 100 g: energy 480 kcal', 'प्रति 100 ग्राम: ऊर्जा 480 किलोकैलोरी') }, { id: 'mrp', k: bi('MRP', 'अधिकतम खुदरा मूल्य'), v: bi('₹30 (incl. taxes)', '₹30 (करों सहित)') }] },
  { id: 'b', name: bi('Label B — Paneer tikka sauce', 'लेबल B — पनीर टिक्का सॉस'), rows: [
    { id: 'name', k: bi('Product name', 'उत्पाद नाम'), v: bi('Tikka Sauce', 'टिक्का सॉस') }, { id: 'veg', k: bi('Veg / non-veg mark', 'शाकाहारी/मांसाहारी चिह्न'), v: null, bad: true },
    { id: 'ing', k: bi('Ingredients', 'सामग्री'), v: bi('Tomato, curd, spices, salt, oil', 'टमाटर, दही, मसाले, नमक, तेल') }, { id: 'net', k: bi('Net quantity', 'शुद्ध मात्रा'), v: null, bad: true },
    { id: 'fssai', k: bi('FSSAI licence number', 'FSSAI लाइसेंस नंबर'), v: bi('14-digit number printed', '14 अंकों का नंबर छपा') }, { id: 'exp', k: bi('Best before / expiry', 'सर्वोत्तम पूर्व / समाप्ति'), v: bi('6 months from manufacture', 'निर्माण से 6 माह') },
    { id: 'nut', k: bi('Nutrition information', 'पोषण जानकारी'), v: bi('Per 100 g: energy 90 kcal', 'प्रति 100 ग्राम: ऊर्जा 90 किलोकैलोरी') }, { id: 'mrp', k: bi('MRP', 'अधिकतम खुदरा मूल्य'), v: bi('₹55 (incl. taxes)', '₹55 (करों सहित)') }] },
];

function LabelLab({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const [li, setLi] = useState(0); const [flag, setFlag] = useState<Record<string, string[]>>({ a: [], b: [] }); const [ok, setOk] = useState([false, false]);
  const { toast, say } = useToast();
  const lb = LABELS[li]; const fl = flag[lb.id];
  useEffect(() => { if (ok.every(Boolean)) onDone(); /* eslint-disable-next-line */ }, [ok]);
  const toggle = (id: string) => {
    if (ok[li]) return;
    playClickSound('neutral');
    setFlag((f) => ({ ...f, [lb.id]: f[lb.id].includes(id) ? f[lb.id].filter((x) => x !== id) : [...f[lb.id], id] }));
  };
  const check = () => {
    if (ok[li]) return;
    const bad = lb.rows.filter((r) => r.bad).map((r) => r.id);
    const wrong = fl.filter((x) => !bad.includes(x)), missed = bad.filter((x) => !fl.includes(x));
    if (!wrong.length && !missed.length) {
      run.add(10); setOk((o) => o.map((v, i) => (i === li ? true : v)));
      playClickSound('success');
      say('ok', L('Label checked! Mandatory particulars such as FSSAI licence number, veg/non-veg mark, net quantity and date must always be present.', 'लेबल जाँचा! FSSAI लाइसेंस नंबर, शाकाहारी/मांसाहारी चिह्न, शुद्ध मात्रा व तिथि जैसे अनिवार्य विवरण हमेशा होने चाहिए।'));
    } else if (wrong.length) {
      run.miss(); playClickSound('error');
      const r = lb.rows.find((x) => x.id === wrong[0])!;
      say('bad', L(`"${r.k.en}" is present — it is not a violation.`, `"${r.k.hi}" मौजूद है — यह उल्लंघन नहीं है।`));
    } else {
      run.miss(); playClickSound('error');
      say('bad', L(`You missed ${missed.length} mandatory field(s). Look for fields that are blank.`, `आपने ${missed.length} अनिवार्य विवरण छोड़ दिया। खाली पंक्तियाँ खोजें।`));
    }
  };
  const hint = () => { run.hint(); say('info', L('Two mandatory details are missing — look for the blank rows.', 'दो अनिवार्य विवरण गायब हैं — खाली पंक्तियाँ खोजें।')); };
  return (
    <div className="space-y-2" data-testid="label-lab">
      <div className="flex gap-1.5">{LABELS.map((x, i) => <button key={x.id} data-label={x.id} onClick={() => { setLi(i); say('info', null); }} className={`px-3 py-1.5 rounded-lg border text-xs ${li === i ? 'font-bold border-2' : ''}`} style={li === i ? { borderColor: T.accent } : undefined}>{L(x.name.en, x.name.hi)}{ok[i] ? ' ✓' : ''}</button>)}</div>
      <p className="text-xs text-stone-600 dark:text-stone-300">{L('Tap every row where a mandatory detail is missing, then submit.', 'जिस पंक्ति में अनिवार्य विवरण गायब हो उसे छुएँ, फिर जमा करें।')}</p>
      <div className="rounded-xl border-2 border-dashed p-2 space-y-1 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
        {lb.rows.map((r) => <button key={r.id} data-row={r.id} onClick={() => toggle(r.id)} className={`w-full grid grid-cols-[130px_1fr] text-left text-[11px] gap-2 rounded-lg px-2 py-1.5 border transition-all ${fl.includes(r.id) ? 'bg-red-50 dark:bg-red-950/40 border-red-400 font-bold' : 'border-stone-200 dark:border-stone-800'}`}><b>{L(r.k.en, r.k.hi)}</b><span className={r.v ? '' : 'text-stone-400 font-bold'}>{r.v ? L(r.v.en, r.v.hi) : '— [MISSING / अनुपस्थित] —'}</span></button>)}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={check} disabled={ok[li] || fl.length === 0} data-testid="label-check" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>📋 {L('Submit inspection', 'निरीक्षण जमा करें')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        {ok[li] && li < LABELS.length - 1 && (
          <button onClick={() => { setLi(li + 1); say('info', null); }} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {L('Next label inspection', 'अगला लेबल निरीक्षण')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

const VISIT: OrderStep[] = [
  { id: 'v1', emoji: '✉️', label: bi('Get permission and agree visit date with plant', 'प्लांट से अनुमति लें और भ्रमण की तिथि तय करें'), why: bi('Always visit with prior official permission.', 'अनुमति लेकर ही जाएँ।') },
  { id: 'v2', emoji: '❓', label: bi('Prepare questions: CCPs, cleaning, storage, records', 'प्रश्न तैयार करें: CCP, सफ़ाई, भंडारण, अभिलेख'), why: bi('A question checklist focuses your observation.', 'प्रश्न-सूची अवलोकन को केंद्रित करती है।') },
  { id: 'v3', emoji: '🥼', label: bi('Wear complete PPE and follow plant hygiene rules', 'PPE पहनें और प्लांट के स्वच्छता नियम मानें'), why: bi('Hair cover, coat and shoe cover protect the food.', 'हेयर-कवर, कोट व शू-कवर भोजन की रक्षा करते हैं।') },
  { id: 'v4', emoji: '👀', label: bi('Observe and record flow, hygiene and temperatures', 'प्रवाह, स्वच्छता व तापमान देखें व लिखें'), why: bi('Take detailed notes — no unauthorized photos.', 'नोट्स लें — बिना अनुमति फ़ोटो नहीं।') },
  { id: 'v5', emoji: '🙏', label: bi('Thank the hosts and write the visit report', 'मेज़बानों को धन्यवाद दें और रिपोर्ट लिखें'), why: bi('The report records what you learnt, including CCPs seen.', 'रिपोर्ट में सीखा हुआ, देखे गए CCP सहित, दर्ज होता है।') },
  { id: 'v6', emoji: '🎤', label: bi('Present findings to the hospitality class', 'कक्षा में निष्कर्ष प्रस्तुत करें'), why: bi('Presenting completes the industrial visit study.', 'प्रस्तुति से अध्ययन पूरा होता है।') },
];

function Haccp({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const { d, mark } = useSubDone(['p', 'c', 'a'], onDone);
  const [sub, setSub] = useState<'p' | 'c' | 'a'>('p');
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setSub('p')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 'p' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 'p' ? { background: T.accent } : undefined}>
          {L('7 principles', '7 सिद्धांत')}{d.p ? ' ✓' : ''}
        </button>
        <button onClick={() => setSub('c')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 'c' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 'c' ? { background: T.accent } : undefined}>
          {L('CCP limits', 'CCP सीमाएँ')}{d.c ? ' ✓' : ''}
        </button>
        <button onClick={() => setSub('a')} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sub === 'a' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={sub === 'a' ? { background: T.accent } : undefined}>
          {L('Corrective action', 'सुधारात्मक कार्रवाई')}{d.a ? ' ✓' : ''}
        </button>
      </div>
      <div style={{ display: sub === 'p' ? 'block' : 'none' }}>
        <OrderTask steps={P7} run={run} accent={T.accent} points={3} onDone={mark('p')} />
        {d.p && !d.c && (
          <div className="flex justify-end mt-2">
            <button onClick={() => setSub('c')} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
              {L('Next: CCP limits', 'अगला: CCP सीमाएँ')} →
            </button>
          </div>
        )}
      </div>
      <div style={{ display: sub === 'c' ? 'block' : 'none' }}>
        <MatchTask items={CCP_I} zones={CCP_Z} run={run} accent={T.accent} points={2} cols={4} onDone={mark('c')} />
        {d.c && !d.a && (
          <div className="flex justify-end mt-2">
            <button onClick={() => setSub('a')} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
              {L('Next: Corrective action scenarios', 'अगला: सुधारात्मक कार्रवाई')} →
            </button>
          </div>
        )}
      </div>
      <div style={{ display: sub === 'a' ? 'block' : 'none' }}>
        <ChoiceTask qs={CORRECT} run={run} accent={T.accent} points={5} onDone={mark('a')} />
      </div>
    </div>
  );
}

export default function QualityLabSim() {
  const L = useLang();
  const run = useRun('m2QualityLab', 32 + 46 + 20 + 18);
  const [tab, setTab] = useState<'bench' | 'haccp' | 'label' | 'visit'>('bench');
  const ds = useDoneSet(4, run);
  const [key, setKey] = useState(0);
  const replay = () => { run.reset(); ds.reset(); setTab('bench'); setKey((k) => k + 1); };

  return (
    <FoodShell accent={T.accent} Icon={T.Icon} title={L('Food Quality & Standards Lab', 'खाद्य गुणवत्ता व मानक लैब')}
      subtitle={L('Test for adulteration, build a HACCP plan, inspect FSSAI labels and plan an industrial visit.', 'मिलावट परखें, HACCP योजना बनाएँ, FSSAI लेबल जाँचें और औद्योगिक भ्रमण की योजना बनाएँ।')}>
      {run.done ? <FinishCard run={run} accent={T.accent} onReplay={replay} summary={[L('Four rapid adulteration tests', 'चार त्वरित मिलावट परीक्षण'), L('HACCP principles, CCP limits and corrective actions', 'HACCP सिद्धांत, CCP सीमाएँ व सुधारात्मक कार्रवाई'), L('FSSAI label inspection and industrial-visit plan', 'FSSAI लेबल निरीक्षण व औद्योगिक भ्रमण योजना')]} /> : (
        <>
          <ChefBrief
            station={L('Food Quality & Safety Assurance Laboratory', 'खाद्य गुणवत्ता व सुरक्षा प्रयोगशाला')}
            role={L('Junior FSSAI & HACCP Quality Officer', 'कनिष्ठ FSSAI व HACCP गुणवत्ता अधिकारी')}
            task={L('Perform rapid chemical and physical adulteration tests on milk, tea, and sugar. Assemble the 7 classical HACCP principles in mandatory order, set Critical Control Point (CCP) limits, and audit FSSAI packaging labels.', 'दूध, चाय व चीनी पर त्वरित रासायनिक व भौतिक मिलावट परीक्षण करें। अनिवार्य क्रम में 7 शास्त्रीय HACCP सिद्धांत व्यवस्थित करें, महत्वपूर्ण नियंत्रण बिंदु (CCP) सीमाएँ तय करें, और FSSAI लेबल जाँचें।')}
            standard={L('Grade 10 CBSE Food Production · Block 13', 'कक्षा 10 फ़ूड प्रोडक्शन · ब्लॉक 13')}
          />
          <ProTip
            title={L('FSSAI & HACCP Critical Rules', 'FSSAI व HACCP महत्वपूर्ण नियम')}
            text={L('HACCP Principle 1 always begins with Hazard Analysis (Biological, Chemical, Physical). Every CCP must have measurable limits (such as core 75°C for chicken, or <= 5°C on delivery). FSSAI requires mandatory display of licence number, net weight, veg/non-veg green/brown logo, and date of expiry!', 'HACCP सिद्धांत 1 हमेशा खतरा विश्लेषण (जैविक, रासायनिक, भौतिक) से शुरू होता है। हर CCP की मापने योग्य सीमा होनी चाहिए (जैसे चिकन हेतु 75°C, या प्राप्ति पर <= 5°C)। FSSAI लाइसेंस नंबर, शुद्ध वज़न, शाकाहारी/मांसाहारी लोगो और समाप्ति तिथि अनिवार्य हैं!')}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs2 accent={T.accent} value={tab} onChange={setTab} tabs={[
              { id: 'bench', label: L('1. Adulteration Bench', '1. मिलावट बेंच'), done: ds.done.has('bench') },
              { id: 'haccp', label: L('2. HACCP Plan', '2. HACCP योजना'), done: ds.done.has('haccp') },
              { id: 'label', label: L('3. FSSAI Labels', '3. FSSAI लेबल'), done: ds.done.has('label') },
              { id: 'visit', label: L('4. Industrial Visit', '4. औद्योगिक भ्रमण'), done: ds.done.has('visit') }]} />
            <Hud run={run} accent={T.accent} />
          </div>
          <div key={key}>
            <div style={{ display: tab === 'bench' ? 'block' : 'none' }}>
              <Bench run={run} onDone={() => ds.mark('bench')} onNext={() => setTab('haccp')} />
            </div>
            <div style={{ display: tab === 'haccp' ? 'block' : 'none' }}>
              <Haccp run={run} onDone={() => ds.mark('haccp')} />
              {ds.done.has('haccp') && (
                <div className="flex justify-end mt-3">
                  <button onClick={() => setTab('label')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                    {L('Next: FSSAI Labels', 'अगला: FSSAI लेबल')} →
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: tab === 'label' ? 'block' : 'none' }}>
              <LabelLab run={run} onDone={() => ds.mark('label')} />
              {ds.done.has('label') && (
                <div className="flex justify-end mt-3">
                  <button onClick={() => setTab('visit')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                    {L('Next: Industrial Visit', 'अगला: औद्योगिक भ्रमण')} →
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: tab === 'visit' ? 'block' : 'none' }}>
              <OrderTask steps={VISIT} run={run} accent={T.accent} points={3} onDone={() => ds.mark('visit')} />
            </div>
          </div>
        </>
      )}
    </FoodShell>
  );
}
