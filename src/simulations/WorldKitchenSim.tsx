import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FOOD2_THEMES } from '@/data/themes';
import { playClickSound } from '@/utils/sound';
import { Card, ChefBrief, FinishCard, FoodShell, Hud, HintButton, ProTip, SubTabs, Tabs2, Toast, useLang, useRun, useSubDone, useToast, type Run } from '@/components/kit';
import { MatchTask, OrderTask, useDoneSet, type Bi2, type MatchItem, type MatchZone, type OrderStep } from '@/components/tasks';

const T = FOOD2_THEMES.world;
const bi = (en: string, hi: string): Bi2 => ({ en, hi });
const mz = (id: string, emoji: string, label: Bi2): MatchZone => ({ id, emoji, label });
const mi = (id: string, cat: string, emoji: string, label: Bi2, why: Bi2): MatchItem => ({ id, cat, emoji, label, why });

const COURSE_Z = [mz('dal', '🍲', bi('Dal', 'दाल')), mz('sabzi', '🥘', bi('Vegetable dish', 'सब्ज़ी')), mz('side', '🥗', bi('Raita / chutney', 'रायता / चटनी')), mz('rice', '🍚', bi('Rice', 'चावल')), mz('bread', '🫓', bi('Bread', 'रोटी/नान'))];
const COURSE_I = [
  mi('d1', 'dal', '🍲', bi('Dal makhani', 'दाल मखनी'), bi('Dal makhani is slow-cooked black lentils with butter and cream.', 'दाल मखनी मक्खन-क्रीम वाली धीमी पकी काली दाल है।')),
  mi('d2', 'dal', '🥣', bi('Sambar', 'सांभर'), bi('Sambar is a tangy South Indian lentil-vegetable stew.', 'सांभर खट्टा दक्षिण भारतीय दाल-सब्ज़ी स्ट्यू है।')),
  mi('s1', 'sabzi', '🥔', bi('Aloo gobi', 'आलू गोभी'), bi('Aloo gobi is a dry potato-cauliflower vegetable.', 'आलू गोभी सूखी आलू-फूलगोभी सब्ज़ी है।')),
  mi('s2', 'sabzi', '🍆', bi('Baingan bharta', 'बैंगन भर्ता'), bi('Bharta is roasted, mashed aubergine cooked with spices.', 'भर्ता भुना, मसला बैंगन मसालों में पका है।')),
  mi('c1', 'side', '🌿', bi('Pudina chutney', 'पुदीना चटनी'), bi('A fresh mint chutney served as a relish.', 'ताज़ी पुदीना चटनी, साथ परोसी जाती है।')),
  mi('c2', 'side', '🥛', bi('Boondi raita', 'बूंदी रायता'), bi('Raita is cooling, seasoned curd.', 'रायता ठंडा, मसालेदार दही है।')),
  mi('r1', 'rice', '🍚', bi('Jeera rice', 'जीरा चावल'), bi('Basmati rice tempered with cumin.', 'जीरे के तड़के वाला बासमती चावल।')),
  mi('r2', 'rice', '🍛', bi('Vegetable pulao', 'वेज पुलाव'), bi('Pulao is rice cooked with vegetables and whole spices.', 'पुलाव सब्ज़ियों व साबुत मसालों संग पका चावल है।')),
  mi('b1', 'bread', '🫓', bi('Phulka roti', 'फुलका रोटी'), bi('A thin whole-wheat flat bread that puffs on the flame.', 'आँच पर फूलने वाली पतली गेहूँ की रोटी।')),
  mi('b2', 'bread', '🥖', bi('Butter naan', 'बटर नान'), bi('A leavened bread baked in the tandoor.', 'तंदूर में सिंकी खमीरी रोटी।')),
];
const REG_Z = [mz('pun', '🌾', bi('Punjab', 'पंजाब')), mz('guj', '🟨', bi('Gujarat', 'गुजरात')), mz('south', '🥥', bi('South India', 'दक्षिण भारत')), mz('ben', '🐟', bi('Bengal', 'बंगाल')), mz('fest', '🎉', bi('Festive & Royal', 'त्योहार व शाही'))];
const REG_I = [
  mi('p1', 'pun', '🥬', bi('Sarson da saag', 'सरसों का साग'), bi('A winter mustard-greens dish of Punjab.', 'पंजाब का सर्दियों का सरसों साग।')),
  mi('p2', 'pun', '🫓', bi('Makki di roti', 'मक्की की रोटी'), bi('Maize flat bread served with saag in Punjab.', 'पंजाब में साग संग परोसी मक्के की रोटी।')),
  mi('g1', 'guj', '🟨', bi('Dhokla', 'ढोकला'), bi('Steamed fermented gram-flour cake of Gujarat.', 'गुजरात का भाप में पका किण्वित बेसन केक।')),
  mi('g2', 'guj', '🫓', bi('Thepla', 'थेपला'), bi('Spiced fenugreek flat bread of Gujarat.', 'गुजरात की मेथी वाली मसालेदार रोटी।')),
  mi('s1', 'south', '⚪', bi('Idli with sambar', 'इडली सांभर'), bi('Steamed rice-lentil cakes of South India.', 'दक्षिण भारत के भाप में पके चावल-दाल केक।')),
  mi('s2', 'south', '🥞', bi('Masala dosa', 'मसाला डोसा'), bi('Crisp fermented crepe with potato filling.', 'आलू भरावन वाला कुरकुरा किण्वित क्रेप।')),
  mi('b1', 'ben', '🐟', bi('Machher jhol', 'माछेर झोल'), bi('Light Bengali fish curry.', 'हल्की बंगाली मछली करी।')),
  mi('b2', 'ben', '🍡', bi('Rasgulla', 'रसगुल्ला'), bi('Spongy chhena balls in syrup, a Bengal sweet.', 'शीरे में स्पंजी छेना गोले, बंगाल की मिठाई।')),
  mi('f1', 'fest', '🥟', bi('Modak (Ganesh Chaturthi)', 'मोदक (गणेश चतुर्थी)'), bi('Sweet coconut-filled dumplings for Ganesh Chaturthi.', 'गणेश चतुर्थी के नारियल भरे मीठे मोदक।')),
  mi('f2', 'fest', '👑', bi('Shahi paneer / Mughlai korma', 'शाही पनीर / मुग़लई कोरमा'), bi('Royal dishes are rich with cream, nuts and saffron.', 'शाही व्यंजन क्रीम, मेवे व केसर से समृद्ध होते हैं।')),
];

const TADKA: OrderStep[] = [
  { id: 't1', emoji: '🍲', label: bi('Cook the dal until soft', 'दाल को गलने तक पकाएँ'), why: bi('Tadka is added to cooked dal.', 'तड़का पकी दाल पर डालते हैं।') },
  { id: 't2', emoji: '🔥', label: bi('Heat ghee or oil in a small pan', 'छोटी कड़ाही में घी/तेल गरम करें'), why: bi('The fat must be hot to release flavour.', 'स्वाद निकलने हेतु घी/तेल गरम होना चाहिए।') },
  { id: 't3', emoji: '🌰', label: bi('Add cumin seeds and let them crackle', 'जीरा डालें और चटकने दें'), why: bi('Crackling cumin means the oil is ready.', 'जीरा चटकना बताता है कि तेल तैयार है।') },
  { id: 't4', emoji: '🌶️', label: bi('Add garlic, dried red chilli and hing for a few seconds', 'लहसुन, सूखी लाल मिर्च व हींग कुछ सेकंड डालें'), why: bi('Spices burn quickly — only a few seconds.', 'मसाले जल्दी जलते हैं — बस कुछ सेकंड।') },
  { id: 't5', emoji: '🥘', label: bi('Pour the sizzling tadka over the dal and cover', 'चटकता तड़का दाल पर डालकर ढकें'), why: bi('Covering traps the aroma in the dal.', 'ढकने से सुगंध दाल में रुकती है।') },
];
const WOK: OrderStep[] = [
  { id: 'w1', emoji: '🔥', label: bi('Heat the empty wok until very hot', 'खाली कड़ाही को बहुत गरम करें'), why: bi('A very hot wok gives the smoky wok-hei flavour.', 'बहुत गरम कड़ाही धुएँदार वॉक-हेई स्वाद देती है।') },
  { id: 'w2', emoji: '🫗', label: bi('Add oil and swirl it up the sides', 'तेल डालकर किनारों तक घुमाएँ'), why: bi('Oil is added to a hot wok so food does not stick.', 'गरम कड़ाही में तेल डालते हैं ताकि चिपके नहीं।') },
  { id: 'w3', emoji: '🧄', label: bi('Add garlic and ginger for seconds', 'लहसुन-अदरक कुछ सेकंड डालें'), why: bi('Aromatics go in first, briefly.', 'सुगंधित सामग्री पहले, थोड़ी देर।') },
  { id: 'w4', emoji: '🥕', label: bi('Add hard vegetables, then soft ones', 'पहले कड़ी, फिर नरम सब्ज़ियाँ डालें'), why: bi('Hard vegetables need longer than soft ones.', 'कड़ी सब्ज़ियों को नरम से ज़्यादा समय चाहिए।') },
  { id: 'w5', emoji: '🥢', label: bi('Add sauce and toss on high heat', 'सॉस डालकर तेज़ आँच पर उछालें'), why: bi('Constant tossing cooks evenly and keeps veg crisp.', 'लगातार उछालने से बराबर पकती है, सब्ज़ी करारी रहती है।') },
  { id: 'w6', emoji: '🍽️', label: bi('Serve immediately', 'तुरंत परोसें'), why: bi('Stir-fries lose crispness if held.', 'रुकने पर स्टर-फ़्राई की करारापन चला जाता है।') },
];

/* --------------- Tandoor timing game --------------- */
const TAN = [
  { id: 'naan', e: '🫓', n: bi('Naan', 'नान'), a: 2, b: 3.5, how: bi('slapped on the hot tandoor wall', 'गरम तंदूर की दीवार पर चिपकाया') },
  { id: 'roti', e: '🥙', n: bi('Tandoori roti', 'तंदूरी रोटी'), a: 1, b: 2.5, how: bi('stuck on the wall — cooks very fast', 'दीवार पर चिपकाई — बहुत जल्दी पकती है') },
  { id: 'tikka', e: '🍢', n: bi('Paneer tikka', 'पनीर टिक्का'), a: 5, b: 7, how: bi('on skewers lowered into the tandoor', 'सीख पर तंदूर में उतारा') },
];
const doneCol = (p: number, a: number, b: number) => (p < a * 0.6 ? '#f5deb3' : p < a ? '#e8c27a' : p <= b ? '#d9a441' : p < b + 1 ? '#6b3f12' : '#1c1008');

function Tandoor({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const [i, setI] = useState(0); const [t, setT] = useState(0); const [on, setOn] = useState(false);
  const [ok, setOk] = useState([false, false, false]);
  const { toast, say } = useToast();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const it = TAN[i];
  useEffect(() => { if (ok.every(Boolean)) onDone(); /* eslint-disable-next-line */ }, [ok]);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const stop = () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } setOn(false); };
  const start = () => {
    if (on || ok[i]) return; setT(0); setOn(true); playClickSound('neutral');
    say('info', L(`${it.n.en} ${it.how.en}. Watch the colour and pull it out in the green zone.`, `${it.n.hi} ${it.how.hi}। रंग देखें और हरे क्षेत्र में निकालें।`));
    timer.current = setInterval(() => setT((x) => { const nx = +(x + 0.05).toFixed(2); if (nx > it.b + 1.2) { stop(); } return nx; }), 100);
  };
  const pull = () => {
    if (!on) return; stop();
    if (t < it.a) {
      run.miss(); playClickSound('error');
      say('bad', L(`Too early (${t.toFixed(1)} min) — still raw inside. Try again.`, `बहुत जल्दी (${t.toFixed(1)} मिनट) — अंदर से कच्चा। फिर कोशिश करें।`));
    } else if (t <= it.b) {
      run.add(10); setOk((o) => o.map((v, k) => (k === i ? true : v)));
      playClickSound('success');
      say('ok', L(`Perfect ${it.n.en} at ${t.toFixed(1)} min — golden with light char!`, `${t.toFixed(1)} मिनट पर बढ़िया ${it.n.hi} — सुनहरा, हल्का भुना!`));
    } else {
      run.miss(); playClickSound('error');
      say('bad', L(`Too late (${t.toFixed(1)} min) — burnt. Pull it out sooner.`, `बहुत देर (${t.toFixed(1)} मिनट) — जल गया। जल्दी निकालें।`));
    }
  };
  const hint = () => { run.hint(); say('info', L(`${it.n.en} is ready between ${it.a} and ${it.b} minutes (the green zone).`, `${it.n.hi} ${it.a}–${it.b} मिनट के बीच तैयार (हरा क्षेत्र)।`)); };
  const max = it.b + 1.2;
  return (
    <div className="space-y-2" data-testid="tandoor">
      <Card className="bg-red-50 border-red-200"><p className="text-xs text-red-800">🔥 {L('Virtual demo only. A real tandoor is extremely hot (400 °C+) — never reach in; use long tongs and skewers and wear heat-proof gloves.', 'केवल वर्चुअल डेमो। असली तंदूर बहुत गरम (400 °C+) होता है — हाथ न डालें; लंबी चिमटी/सीख व गर्मी-रोधी दस्ताने इस्तेमाल करें।')}</p></Card>
      <div className="flex gap-1.5">{TAN.map((x, k) => <button key={x.id} data-tan={x.id} disabled={on} onClick={() => { setI(k); setT(0); say('info', null); }} className={`px-3 py-1.5 rounded-lg border text-xs ${i === k ? 'font-bold border-2' : ''}`} style={i === k ? { borderColor: T.accent } : undefined}>{x.e} {L(x.n.en, x.n.hi)}{ok[k] ? ' ✓' : ''}</button>)}</div>
      <div className="rounded-2xl p-4 grid place-items-center" style={{ background: 'linear-gradient(#7c2d12,#431407)' }}>
        <motion.div animate={{ scale: on ? [1, 1.04, 1] : 1 }} transition={{ repeat: Infinity, duration: 1 }} className="w-24 h-24 rounded-full grid place-items-center text-5xl border-4 border-orange-300" style={{ background: doneCol(t, it.a, it.b) }} data-testid="tan-item" data-colour={doneCol(t, it.a, it.b)}>{it.e}</motion.div>
        <p className="text-orange-100 text-xs mt-2 font-mono" data-testid="tan-time">{t.toFixed(1)} min</p>
      </div>
      <div className="relative h-4 rounded-full bg-stone-200 overflow-hidden"><div className="absolute top-0 bottom-0 bg-green-400/70" style={{ left: `${(it.a / max) * 100}%`, width: `${((it.b - it.a) / max) * 100}%` }} /><div className="absolute top-0 bottom-0 left-0 bg-orange-500/80" style={{ width: `${Math.min(100, (t / max) * 100)}%`, opacity: 0.7 }} /></div>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={start} disabled={on || ok[i]} data-testid="tan-start" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm" style={{ background: T.accent }}>▶ {L('Put in tandoor', 'तंदूर में डालें')}</button>
        <button onClick={pull} disabled={!on} data-testid="tan-pull" className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold disabled:opacity-50 shadow-sm">🥢 {L('Pull out!', 'निकालें!')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        {ok[i] && i < TAN.length - 1 && (
          <button onClick={() => { setI(i + 1); setT(0); say('info', null); }} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {L('Next item', 'अगली वस्तु')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

/* --------------- Pasta al dente --------------- */
const PAS = [{ id: 'spag', n: bi('Spaghetti', 'स्पैघेटी'), full: 12 }, { id: 'mac', n: bi('Macaroni', 'मैकरोनी'), full: 14 }];

function Pasta({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const [i, setI] = useState(0); const [m, setM] = useState(9); const [ok, setOk] = useState([false, false]);
  const { toast, say } = useToast();
  const p = PAS[i];
  useEffect(() => { if (ok.every(Boolean)) onDone(); /* eslint-disable-next-line */ }, [ok]);
  const core = Math.max(0, 40 * (1 - m / p.full));
  const state = core > 14 ? 'raw' : core >= 5 ? 'dente' : 'over';
  const bite = () => {
    if (ok[i]) return;
    if (state === 'dente') {
      run.add(10); setOk((o) => o.map((v, k) => (k === i ? true : v)));
      playClickSound('success');
      say('ok', L(`Al dente! A tiny firm core remains — pasta keeps cooking a little in the sauce.`, `अल डेंटे! छोटा कसा केंद्र बचा है — सॉस में पास्ता थोड़ा और पकता है।`));
    } else {
      run.miss(); playClickSound('error');
      say('bad', state === 'raw' ? L('Still a thick white raw core — it is hard and chalky. Boil longer.', 'अभी मोटा सफ़ेद कच्चा केंद्र है — कठोर व चॉकी। और उबालें।') : L('No core left — soft and mushy. Next time lift it earlier.', 'कोई केंद्र नहीं बचा — नरम व लिज़लिज़ा। अगली बार जल्दी निकालें।'));
    }
  };
  const hint = () => { run.hint(); say('info', L('Al dente = a very small white dot in the centre of the cut piece (around 8–10 minutes).', 'अल डेंटे = कटे टुकड़े के केंद्र में बहुत छोटा सफ़ेद बिंदु (लगभग 8-10 मिनट)।')); };
  return (
    <div className="space-y-2" data-testid="pasta">
      <div className="flex gap-1.5">{PAS.map((x, k) => <button key={x.id} data-pasta={x.id} onClick={() => { setI(k); setM(k === 0 ? 9 : 10); say('info', null); }} className={`px-3 py-1.5 rounded-lg border text-xs ${i === k ? 'font-bold border-2' : ''}`} style={i === k ? { borderColor: T.accent } : undefined}>🍝 {L(x.n.en, x.n.hi)}{ok[k] ? ' ✓' : ''}</button>)}</div>
      <div className="rounded-2xl bg-amber-50 dark:bg-slate-800 p-3 text-center">
        <svg viewBox="0 0 120 100" className="w-40 mx-auto" data-testid="pasta-svg" data-state={state}><circle cx="60" cy="50" r="40" fill="#fde68a" stroke="#d97706" strokeWidth="2" /><circle cx="60" cy="50" r={core} fill="#fffef5" /></svg>
        <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold">{L('Cut cross-section', 'कटी अनुप्रस्थ काट')} · {m} {L('min', 'मिनट')} · {state === 'raw' ? L('raw core', 'कच्चा केंद्र') : state === 'dente' ? L('tiny core (al dente)', 'छोटा केंद्र (अल डेंटे)') : L('no core (overcooked)', 'केंद्र नहीं (अतिपका)')}</p>
      </div>
      <label className="block text-xs font-semibold">{L('Boiling time', 'उबालने का समय')}: <span className="font-mono">{m} {L('min', 'मिनट')}</span><input type="range" min={0} max={16} step={0.5} value={m} onChange={(e) => setM(+e.target.value)} data-slider="pasta" disabled={ok[i]} className="w-full" style={{ accentColor: T.accent }} /></label>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={bite} disabled={ok[i]} data-testid="bite" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>😋 {L('Bite test', 'काटकर परखें')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        {ok[i] && i < PAS.length - 1 && (
          <button onClick={() => { setI(i + 1); setM(10); say('info', null); }} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {L('Next pasta', 'अगला पास्ता')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

const PD_Z = [mz('arr', '🌶️', bi('Arrabbiata', 'अराबियाटा')), mz('alf', '🧈', bi('Alfredo', 'अल्फ्रेडो')), mz('bol', '🥩', bi('Bolognese', 'बोलोनीज़')), mz('pes', '🌿', bi('Pesto', 'पेस्तो'))];
const PD_I = [
  mi('a1', 'arr', '🌶️', bi('Tomato, garlic and chilli flakes', 'टमाटर, लहसुन व मिर्च फ़्लेक्स'), bi('Arrabbiata means "angry" — a hot chilli tomato sauce.', 'अराबियाटा यानी "गुस्से वाला" — तीखा मिर्च-टमाटर सॉस।')),
  mi('a2', 'arr', '🍝', bi('Classic with penne', 'क्लासिक: पेने के साथ'), bi('Penne arrabbiata is the classic pairing.', 'पेने अराबियाटा क्लासिक जोड़ी है।')),
  mi('l1', 'alf', '🧀', bi('Butter, cream and Parmesan', 'मक्खन, क्रीम व पार्मेज़ान'), bi('Alfredo is a rich butter-cream-cheese sauce.', 'अल्फ्रेडो मक्खन-क्रीम-चीज़ वाला समृद्ध सॉस है।')),
  mi('l2', 'alf', '🍝', bi('Classic with fettuccine', 'क्लासिक: फ़ेतुचीनी के साथ'), bi('Fettuccine Alfredo is the classic pairing.', 'फ़ेतुचीनी अल्फ्रेडो क्लासिक जोड़ी है।')),
  mi('b1', 'bol', '🥩', bi('Minced meat slow-cooked in tomato', 'टमाटर में धीमे पका कीमा'), bi('Bolognese is a slow-cooked meat ragù.', 'बोलोनीज़ धीमे पका मांस रागू है।')),
  mi('b2', 'bol', '🍝', bi('Classic with spaghetti', 'क्लासिक: स्पैघेटी के साथ'), bi('Spaghetti Bolognese is the classic pairing.', 'स्पैघेटी बोलोनीज़ क्लासिक जोड़ी है।')),
  mi('p1', 'pes', '🌿', bi('Basil, pine nuts, olive oil, cheese', 'बेसिल, चिलगोज़ा, ऑलिव ऑयल, चीज़'), bi('Pesto blends fresh basil with nuts, oil and cheese.', 'पेस्तो में ताज़ी बेसिल, मेवे, तेल व चीज़ पीसते हैं।')),
  mi('p2', 'pes', '🥄', bi('Blended raw, tossed with hot pasta', 'कच्चा पीसकर गरम पास्ता में मिलाया'), bi('Pesto is not cooked — heat dulls the basil.', 'पेस्तो पकाया नहीं जाता — गर्मी से बेसिल फीकी पड़ती है।')),
];

/* --------------- Special diets --------------- */
interface Menu { id: string; e: string; n: Bi2; good: boolean; why: Bi2 }
const DIETS: { id: string; client: Bi2; rule: Bi2; menu: Menu[] }[] = [
  { id: 'diab', client: bi('Diabetic guest', 'मधुमेह अतिथि'), rule: bi('Choose foods low in sugar and high in fibre.', 'कम चीनी व अधिक रेशे वाले व्यंजन चुनें।'), menu: [
    { id: 'm1', e: '🥜', n: bi('Roasted chana', 'भुना चना'), good: true, why: bi('High fibre and protein.', 'रेशा व प्रोटीन अधिक।') }, { id: 'm2', e: '🍲', n: bi('Vegetable dal', 'सब्ज़ी दाल'), good: true, why: bi('Pulses release sugar slowly.', 'दालें शक्कर धीरे छोड़ती हैं।') },
    { id: 'm3', e: '🫓', n: bi('Whole-wheat roti', 'साबुत गेहूँ की रोटी'), good: true, why: bi('Whole grain is higher in fibre.', 'साबुत अनाज में रेशा अधिक।') }, { id: 'm4', e: '🥒', n: bi('Plain cucumber raita', 'सादा खीरा रायता'), good: true, why: bi('No added sugar.', 'अतिरिक्त चीनी नहीं।') },
    { id: 'm5', e: '🍡', n: bi('Gulab jamun', 'गुलाब जामुन'), good: false, why: bi('Fried and soaked in sugar syrup.', 'तला व चीनी शीरे में डूबा।') }, { id: 'm6', e: '🥤', n: bi('Sweetened lassi', 'मीठी लस्सी'), good: false, why: bi('Added sugar.', 'अतिरिक्त चीनी।') },
    { id: 'm7', e: '🧃', n: bi('Packed fruit juice', 'पैक्ड फल रस'), good: false, why: bi('Concentrated sugar, no fibre.', 'सांद्र चीनी, रेशा नहीं।') }, { id: 'm8', e: '🍞', n: bi('White bread with jam', 'सफ़ेद ब्रेड जैम संग'), good: false, why: bi('Refined flour and sugar.', 'मैदा व चीनी।') }] },
  { id: 'salt', client: bi('Low-salt (heart-care) guest', 'कम नमक (हृदय-सावधान) अतिथि'), rule: bi('Avoid salty and processed foods.', 'नमकीन व प्रसंस्कृत भोजन से बचें।'), menu: [
    { id: 'n1', e: '🥦', n: bi('Steamed vegetables with herbs', 'जड़ी-बूटी संग भाप सब्ज़ियाँ'), good: true, why: bi('Herbs add flavour without salt.', 'जड़ी-बूटी नमक बिना स्वाद देती हैं।') }, { id: 'n2', e: '🍎', n: bi('Fresh fruit', 'ताज़ा फल'), good: true, why: bi('Naturally low in sodium.', 'स्वाभाविक रूप से कम सोडियम।') },
    { id: 'n3', e: '🍗', n: bi('Grilled chicken, lemon & herbs', 'नींबू-जड़ी-बूटी ग्रिल्ड चिकन'), good: true, why: bi('Lemon replaces salt.', 'नींबू नमक की जगह लेता है।') }, { id: 'n4', e: '🌰', n: bi('Unsalted roasted nuts', 'बिना नमक भुने मेवे'), good: true, why: bi('No added salt.', 'नमक नहीं मिला।') },
    { id: 'n5', e: '🥒', n: bi('Pickle', 'अचार'), good: false, why: bi('Very high in salt.', 'नमक बहुत ज़्यादा।') }, { id: 'n6', e: '🫓', n: bi('Papad', 'पापड़'), good: false, why: bi('Salty and fried.', 'नमकीन व तला।') },
    { id: 'n7', e: '🍟', n: bi('Salted chips', 'नमकीन चिप्स'), good: false, why: bi('High sodium snack.', 'अधिक सोडियम वाला स्नैक।') }, { id: 'n8', e: '🧀', n: bi('Processed cheese slice', 'प्रोसेस्ड चीज़ स्लाइस'), good: false, why: bi('Processed cheese is high in salt.', 'प्रोसेस्ड चीज़ में नमक अधिक।') }] },
  { id: 'vegan', client: bi('Vegan guest', 'वीगन अतिथि'), rule: bi('No meat, fish, eggs, milk, curd, ghee or paneer.', 'मांस, मछली, अंडा, दूध, दही, घी, पनीर नहीं।'), menu: [
    { id: 'v1', e: '🫘', n: bi('Chana masala (oil)', 'छोले मसाला (तेल में)'), good: true, why: bi('Plant-based when made with oil.', 'तेल में बने तो पौधा-आधारित।') }, { id: 'v2', e: '🍚', n: bi('Vegetable pulao (oil)', 'वेज पुलाव (तेल में)'), good: true, why: bi('No dairy when oil replaces ghee.', 'घी की जगह तेल हो तो डेयरी नहीं।') },
    { id: 'v3', e: '🍉', n: bi('Fruit salad', 'फ्रूट सलाद'), good: true, why: bi('Only fruit.', 'सिर्फ़ फल।') }, { id: 'v4', e: '🥥', n: bi('Coconut-milk vegetable curry', 'नारियल-दूध सब्ज़ी करी'), good: true, why: bi('Coconut milk is a plant milk.', 'नारियल दूध पौधा-दूध है।') },
    { id: 'v5', e: '🧀', n: bi('Paneer tikka', 'पनीर टिक्क'), good: false, why: bi('Paneer is dairy.', 'पनीर डेयरी है।') }, { id: 'v6', e: '🍗', n: bi('Butter chicken', 'बटर चिकन'), good: false, why: bi('Meat and butter.', 'मांस व मक्खन।') },
    { id: 'v7', e: '🍯', n: bi('Ghee halwa', 'घी का हलवा'), good: false, why: bi('Ghee is dairy fat.', 'घी डेयरी वसा है।') }, { id: 'v8', e: '🍚', n: bi('Curd rice', 'दही चावल'), good: false, why: bi('Curd is dairy.', 'दही डेयरी है।') }] },
];

function Diets({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const [di, setDi] = useState(0); const [pick, setPick] = useState<Record<string, string[]>>({ diab: [], salt: [], vegan: [] }); const [ok, setOk] = useState([false, false, false]);
  const { toast, say } = useToast();
  const d = DIETS[di]; const sel = pick[d.id];
  useEffect(() => { if (ok.every(Boolean)) onDone(); /* eslint-disable-next-line */ }, [ok]);
  const toggle = (id: string) => {
    if (ok[di]) return;
    playClickSound('neutral');
    setPick((p) => ({ ...p, [d.id]: p[d.id].includes(id) ? p[d.id].filter((x) => x !== id) : [...p[d.id], id] }));
  };
  const check = () => {
    if (ok[di]) return;
    const wrong = d.menu.filter((m) => sel.includes(m.id) && !m.good), missed = d.menu.filter((m) => m.good && !sel.includes(m.id));
    if (!wrong.length && !missed.length) {
      run.add(10); setOk((o) => o.map((v, k) => (k === di ? true : v)));
      playClickSound('success');
      say('ok', L('Safe menu! Every dish suits this guest.', 'सुरक्षित मेन्यू! हर व्यंजन इस अतिथि के अनुकूल है।'));
    } else {
      run.miss(); playClickSound('error');
      say('bad', wrong.length ? L(`Remove ${L(wrong[0].n.en, wrong[0].n.hi)}: ${wrong[0].why.en}`, `हटाएँ ${wrong[0].n.hi}: ${wrong[0].why.hi}`) : L(`Add ${missed[0].n.en}: ${missed[0].why.en}`, `जोड़ें ${missed[0].n.hi}: ${missed[0].why.hi}`));
    }
  };
  const hint = () => { run.hint(); say('info', L(`Exactly four dishes suit this guest. Rule: ${d.rule.en}`, `ठीक चार व्यंजन इस अतिथि के अनुकूल हैं। नियम: ${d.rule.hi}`)); };
  return (
    <div className="space-y-2" data-testid="diets">
      <div className="flex gap-1.5 flex-wrap">{DIETS.map((x, k) => <button key={x.id} data-diet={x.id} onClick={() => { setDi(k); say('info', null); }} className={`px-3 py-1.5 rounded-lg border text-xs ${di === k ? 'font-bold border-2' : ''}`} style={di === k ? { borderColor: T.accent } : undefined}>{L(x.client.en, x.client.hi)}{ok[k] ? ' ✓' : ''}</button>)}</div>
      <Card><p className="text-xs"><b>{L(d.client.en, d.client.hi)}:</b> {L(d.rule.en, d.rule.hi)} {L('Tap the dishes that are suitable.', 'अनुकूल व्यंजन छुएँ।')}</p></Card>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">{d.menu.map((m) => <button key={m.id} data-dish={m.id} onClick={() => toggle(m.id)} className={`rounded-lg border p-2 text-center text-[11px] ${sel.includes(m.id) ? 'border-2 bg-green-50 dark:bg-green-950/40 border-green-500 font-bold' : 'bg-white dark:bg-slate-900'}`}><div className="text-2xl">{m.e}</div>{L(m.n.en, m.n.hi)}</button>)}</div>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={check} disabled={ok[di] || sel.length === 0} data-testid="diet-check" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>✅ {L('Approve menu', 'मेन्यू स्वीकृत करें')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        {ok[di] && di < DIETS.length - 1 && (
          <button onClick={() => { setDi(di + 1); say('info', null); }} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {L('Next dietary guest', 'अगला आहार अतिथि')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

function Thali({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const { d, mark } = useSubDone(['c', 'r'], onDone);
  return <SubTabs accent={T.accent} done={d} tabs={[{ id: 'c', label: L('Thali courses', 'थाली के अंग') }, { id: 'r', label: L('Regional & festive', 'क्षेत्रीय व त्योहारी') }]}>
    {{ c: <MatchTask items={COURSE_I} zones={COURSE_Z} run={run} accent={T.accent} points={2} cols={5} onDone={mark('c')} />, r: <MatchTask items={REG_I} zones={REG_Z} run={run} accent={T.accent} points={2} cols={5} onDone={mark('r')} /> }}
  </SubTabs>;
}
function TadkaTab({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const { d, mark } = useSubDone(['t', 'd'], onDone);
  return <SubTabs accent={T.accent} done={d} tabs={[{ id: 't', label: L('Tadka steps', 'तड़का चरण') }, { id: 'd', label: L('Tandoor timing', 'तंदूर समय') }]}>
    {{ t: <OrderTask steps={TADKA} run={run} accent={T.accent} points={3} onDone={mark('t')} />, d: <Tandoor run={run} onDone={mark('d')} /> }}
  </SubTabs>;
}
function WokTab({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const { d, mark } = useSubDone(['w', 'p', 'q'], onDone);
  return <SubTabs accent={T.accent} done={d} tabs={[{ id: 'w', label: L('Wok stir-fry', 'वॉक स्टर-फ़्राई') }, { id: 'p', label: L('Pasta al dente', 'पास्ता अल डेंटे') }, { id: 'q', label: L('Pasta sauces', 'पास्ता सॉस') }]}>
    {{ w: <OrderTask steps={WOK} run={run} accent={T.accent} points={3} onDone={mark('w')} />, p: <Pasta run={run} onDone={mark('p')} />, q: <MatchTask items={PD_I} zones={PD_Z} run={run} accent={T.accent} points={2} cols={4} onDone={mark('q')} /> }}
  </SubTabs>;
}

export default function WorldKitchenSim() {
  const L = useLang();
  const run = useRun('m2WorldKitchen', 40 + 45 + 54 + 30);
  const [tab, setTab] = useState<'thali' | 'tadka' | 'wok' | 'diet'>('thali');
  const ds = useDoneSet(4, run);
  const [key, setKey] = useState(0);
  const replay = () => { run.reset(); ds.reset(); setTab('thali'); setKey((k) => k + 1); };

  return (
    <FoodShell accent={T.accent} Icon={T.Icon} title={L('Indian, Festive & World Kitchen', 'भारतीय, त्योहार व विश्व रसोई')}
      subtitle={L('Build a thali, time the tandoor, stir-fry in a wok, cook pasta al dente and plan special diets.', 'थाली सजाएँ, तंदूर का समय साधें, वॉक में स्टर-फ़्राई करें, पास्ता अल डेंटे पकाएँ और विशेष आहार बनाएँ।')}>
      {run.done ? <FinishCard run={run} accent={T.accent} onReplay={replay} summary={[L('Thali courses and regional/festive dishes', 'थाली के अंग व क्षेत्रीय/त्योहारी व्यंजन'), L('Tadka, tandoor, wok and pasta techniques', 'तड़का, तंदूर, वॉक व पास्ता तकनीकें'), L('Three special-diet menus approved', 'तीन विशेष-आहार मेन्यू स्वीकृत')]} /> : (
        <>
          <ChefBrief
            station={L('Specialty Regional & Asian Wok Station', 'विशेष क्षेत्रीय व एशियाई वॉक स्टेशन')}
            role={L('Specialty Cuisine Commis Chef', 'विशिष्ट व्यंजन कॉमी शेफ़')}
            task={L('Assemble a nutritionally balanced 5-course Indian Thali, execute real-time tadka spice popping order, monitor high-heat tandoor wall blistering, and sequence Chinese wok-hei cooking.', 'पोषक रूप से संतुलित 5-कोर्स भारतीय थाली सजाएँ, सही क्रम में तड़का चटकाएँ, तेज़ आँच के तंदूर में नान का फूलना साधें, और चाइनीज़ वॉक-हेई पकाई का क्रम पूरा करें।')}
            standard={L('Grade 10 CBSE Food Production · Block 5, 9 & 14', 'कक्षा 10 फ़ूड प्रोडक्शन · ब्लॉक 5, 9 व 14')}
          />
          <ProTip
            title={L('Tadka & Wok Heat Rules', 'तड़का व वॉक ऊष्मा नियम')}
            text={L('In a live tadka, cumin and mustard seeds must crackle within 3–5 seconds before aromatics (garlic/chilli) are added, and the pan must be covered immediately to trap volatile essential oils. In a wok, always cook dense hard vegetables before soft leafy greens!', 'सजीव तड़के में जीरा व सरसों 3–5 सेकंड में चटकने चाहिए लहसुन/मिर्च डालने से पहले, और तुरंत ढकना चाहिए ताकि सुगंधित तेल रुके। वॉक में हमेशा कड़ी सब्ज़ियाँ नरम पत्तों से पहले पकाएँ!')}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs2 accent={T.accent} value={tab} onChange={setTab} tabs={[
              { id: 'thali', label: L('1. Thali & Regions', '1. थाली व क्षेत्र'), done: ds.done.has('thali') }, { id: 'tadka', label: L('2. Tadka & Tandoor', '2. तड़का व तंदूर'), done: ds.done.has('tadka') },
              { id: 'wok', label: L('3. Wok & Pasta', '3. वॉक व पास्ता'), done: ds.done.has('wok') }, { id: 'diet', label: L('4. Special Diets', '4. विशेष आहार'), done: ds.done.has('diet') }]} />
            <Hud run={run} accent={T.accent} />
          </div>
          <div key={key}>
            <div style={{ display: tab === 'thali' ? 'block' : 'none' }}>
              <Thali run={run} onDone={() => ds.mark('thali')} />
              {ds.done.has('thali') && (
                <div className="flex justify-end mt-3">
                  <button onClick={() => setTab('tadka')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                    {L('Next: Tadka & Tandoor', 'अगला: तड़का व तंदूर')} →
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: tab === 'tadka' ? 'block' : 'none' }}>
              <TadkaTab run={run} onDone={() => ds.mark('tadka')} />
              {ds.done.has('tadka') && (
                <div className="flex justify-end mt-3">
                  <button onClick={() => setTab('wok')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                    {L('Next: Wok & Pasta', 'अगला: वॉक व पास्ता')} →
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: tab === 'wok' ? 'block' : 'none' }}>
              <WokTab run={run} onDone={() => ds.mark('wok')} />
              {ds.done.has('wok') && (
                <div className="flex justify-end mt-3">
                  <button onClick={() => setTab('diet')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                    {L('Next: Special Diets', 'अगला: विशेष आहार')} →
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: tab === 'diet' ? 'block' : 'none' }}>
              <Diets run={run} onDone={() => ds.mark('diet')} />
            </div>
          </div>
        </>
      )}
    </FoodShell>
  );
}
