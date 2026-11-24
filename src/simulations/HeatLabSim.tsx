import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FOOD2_THEMES } from '@/data/themes';
import { withAlpha } from '@/components/color';
import { playClickSound } from '@/utils/sound';
import { Card, ChefBrief, FinishCard, FoodShell, Hud, HintButton, Levels, ProTip, Tabs2, Toast, useLang, useRun, useToast, type Run } from '@/components/kit';
import { MatchTask, OrderTask, useDoneSet, type Bi2, type MatchItem, type MatchZone, type OrderStep } from '@/components/tasks';

const T = FOOD2_THEMES.heatlab;
const bi = (en: string, hi: string): Bi2 => ({ en, hi });

/* ---- teachable heat model ---- */
const surfaceT = (pan: number, t: number) => pan - (pan - 20) * Math.exp(-t / 1.5);
const coreT = (pan: number, t: number) => {
  const target = Math.min(pan, 100); // water inside the food limits the core to ~100 °C
  const tau = 1800 / Math.max(20, pan - 20);
  return target - (target - 20) * Math.exp(-t / tau);
};
const surfColor = (s: number) => (s < 100 ? '#f3d9b1' : s < 140 ? '#e8c07a' : s < 180 ? '#c9822b' : s < 200 ? '#8a4b14' : '#2b1b0e');
const coreColor = (c: number) => (c < 45 ? '#f2a0a0' : c < 60 ? '#f4b6b0' : c < 75 ? '#f6d3c4' : '#f7e6c8');
const sugarColor = (s: number) => (s < 160 ? '#fef9c3' : s < 170 ? '#fcd34d' : s < 180 ? '#d97706' : s < 190 ? '#92400e' : '#1c1008');

function HeatLab({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [lv, setLv] = useState(0);
  const [pan, setPan] = useState(170);
  const [time, setTime] = useState(15);
  const [passed, setPassed] = useState([false, false]);
  const { toast, say } = useToast();
  useEffect(() => { if (passed.every(Boolean)) onDone(); /* eslint-disable-next-line */ }, [passed]);
  const sugar = lv === 1;
  const s = surfaceT(pan, time), c = coreT(pan, time);
  const reading = sugar ? s : c;
  const state = sugar
    ? (s < 160 ? L('Clear syrup — sugar has not caramelised yet', 'साफ़ शीरा — अभी कैरेमल नहीं बना') : s < 170 ? L('Light amber caramel', 'हल्का एम्बर कैरेमल') : s < 180 ? L('Golden caramel ✔', 'सुनहरा कैरेमल ✔') : s < 190 ? L('Dark and bitter — nearly burnt', 'गहरा व कड़वा — लगभग जल गया') : L('Burnt!', 'जल गया!'))
    : (s >= 200 ? L('Surface burnt!', 'ऊपर से जल गया!') : s >= 140 ? L('Golden-brown crust (browning reaction)', 'सुनहरी परत (ब्राउनिंग)') : L('Pale surface', 'फीकी सतह'));
  const serve = () => {
    if (passed[lv]) return;
    if (!sugar) {
      if (c < 75) {
        run.miss(); playClickSound('error');
        say('bad', L(`Core is only ${c.toFixed(0)} °C — chicken must reach 75 °C in the centre to be safe. Cook longer or raise the heat a little.`, `केंद्र का तापमान सिर्फ़ ${c.toFixed(0)} °C — चिकन का केंद्र सुरक्षित रूप से 75 °C होना चाहिए। देर तक पकाएँ या आँच थोड़ी बढ़ाएँ।`)); return;
      }
      if (s >= 200) {
        run.miss(); playClickSound('error');
        say('bad', L('Cooked inside, but the surface burnt. Lower the pan temperature and cook a little longer.', 'अंदर पका, पर ऊपर जल गया। पैन का तापमान कम करें और थोड़ा देर पकाएँ।')); return;
      }
      if (s < 140) {
        run.miss(); playClickSound('error');
        say('bad', L('Safe inside but no golden crust. Raise the pan temperature above about 140 °C for browning.', 'अंदर सुरक्षित पर सुनहरी परत नहीं। ब्राउनिंग हेतु पैन का तापमान लगभग 140 °C से ऊपर करें।')); return;
      }
      run.add(15); setPassed([true, passed[1]]);
      playClickSound('success');
      say('ok', L(`Safe and golden! Core ${c.toFixed(0)} °C ≥ 75 °C, surface ${s.toFixed(0)} °C. Heat travels inwards by conduction — thick food needs time, not just high heat.`, `सुरक्षित व सुनहरा! केंद्र ${c.toFixed(0)} °C ≥ 75 °C, सतह ${s.toFixed(0)} °C। गर्मी चालन से भीतर जाती है — मोटे भोजन को समय चाहिए, सिर्फ़ तेज़ आँच नहीं।`));
    } else {
      if (s >= 160 && s < 180) {
        run.add(15); setPassed([passed[0], true]);
        playClickSound('success');
        say('ok', L(`Golden caramel at ${s.toFixed(0)} °C! Sugar caramelises at about 160 °C and burns past ~185 °C.`, `${s.toFixed(0)} °C पर सुनहरा कैरेमल! चीनी लगभग 160 °C पर कैरेमल बनती है और ~185 °C के बाद जलती है।`));
      } else {
        run.miss(); playClickSound('error');
        say('bad', s < 160 ? L('Not hot enough — sugar needs about 160 °C to caramelise.', 'पर्याप्त गर्म नहीं — कैरेमल हेतु चीनी को लगभग 160 °C चाहिए।') : L('Too dark — it is burning. Reduce the heat or time.', 'बहुत गहरा — जल रहा है। आँच या समय घटाएँ।'));
      }
    }
  };
  const hint = () => { run.hint(); say('info', sugar ? L('Aim for a sugar temperature between 160 and 180 °C: pan about 175 °C for 4–5 minutes.', 'चीनी का तापमान 160–180 °C रखें: पैन लगभग 175 °C पर 4–5 मिनट।') : L('Try a pan near 170 °C for about 15–16 minutes: the surface browns and the core reaches 75 °C.', 'पैन लगभग 170 °C पर 15–16 मिनट आज़माएँ: सतह भूरी होगी और केंद्र 75 °C पहुँचेगा।')); };
  const setLevel = (i: number) => { setLv(i); setPan(i === 1 ? 175 : 170); setTime(i === 1 ? 4.5 : 15); say('info', null); };
  const gauge = Math.max(0, Math.min(1, (reading - 20) / (sugar ? 180 : 80)));
  return (
    <div className="space-y-3" data-testid="heat-lab">
      <ChefBrief
        station={L('Commercial Hot Range & Roast Station (Rotisseur)', 'हॉट रेंज व रोस्ट स्टेशन (रोटिस्योर)')}
        role={L('Line Cook · Chef de Partie', 'लाइन रसोइया · शेफ़ द पार्टी')}
        task={L('Safely cook chicken to reach an internal core temperature of at least 75°C without incinerating the crust. Then melt dessert sugar to a flawless golden caramel (160°C–180°C) without letting it turn bitter.', 'चिकन को आंतरिक रूप से कम से कम 75°C तक सुरक्षित पकाएँ बिना परत को जलाए। फिर मिठाई हेतु चीनी को सुनहरे कैरेमल (160°C–180°C) तक पिघलाएँ बिना कड़वा किए।')}
        standard={L('Grade 10 CBSE Food Production · Heat Science & Safety', 'कक्षा 10 फ़ूड प्रोडक्शन · ऊष्मा विज्ञान व सुरक्षा')}
      />
      <ProTip
        title={sugar ? L('Caramel Pyrolysis Warning', 'कैरेमल पायरोलिसिस चेतावनी') : L('Conduction & Core Safety Rule', 'चालन व आंतरिक सुरक्षा नियम')}
        text={sugar
          ? L('Sugar melts around 160°C and caramelises into rich aromatic amber compounds up to 180°C. Past 185°C, sugar burns into bitter black carbon! Remove it from heat the moment it turns golden.', 'चीनी लगभग 160°C पर पिघलती है और 180°C तक सुनहरे सुगंधित यौगिक बनाती है। 185°C के बाद चीनी जलकर कड़वा काला कार्बन बन जाती है! सुनहरा होते ही आँच से हटाएँ।')
          : L('Heat travels into meat strictly by conduction — high heat alone will char the outside while the inside stays dangerously raw (under 75°C). Keep the pan around 165°C–175°C for 15 minutes to allow heat to penetrate the center.', 'मांस में गर्मी चालन द्वारा भीतर जाती है — बहुत तेज़ आँच बाहर से जला देगी जबकि अंदर 75°C से कम कच्चा रह जाएगा। पैन 165°C–175°C पर 15 मिनट रखें ताकि गर्मी केंद्र तक पहुँचे।')}
      />
      <Levels n={2} value={lv} onChange={setLevel} accent={T.accent} labels={[L('1. Chicken (core 75 °C)', '1. चिकन (केंद्र 75 °C)'), L('2. Sugar (caramel)', '2. चीनी (कैरेमल)')]} />
      <Card><p className="text-xs text-stone-600 dark:text-stone-300">{sugar ? L('Goal: melt sugar to a golden caramel (160–180 °C) without burning it.', 'लक्ष्य: चीनी को जले बिना सुनहरे कैरेमल (160–180 °C) तक पिघलाएँ।') : L('Goal: a chicken breast that is golden outside AND at least 75 °C in the centre — not burnt.', 'लक्ष्य: चिकन ब्रेस्ट बाहर से सुनहरा और केंद्र में कम से कम 75 °C — जला नहीं।')}</p></Card>
      <div className="grid sm:grid-cols-2 gap-3 items-center">
        <div className="rounded-2xl p-3 bg-gradient-to-b from-stone-100 to-stone-200 dark:from-slate-800 dark:to-slate-900 relative">
          <svg viewBox="0 0 200 150" className="w-full" data-testid="heat-svg">
            <rect x="10" y="108" width="180" height="14" rx="7" fill="#334155" />
            <rect x="10" y="122" width="180" height="6" fill={pan > 140 ? '#ef4444' : pan > 100 ? '#f97316' : '#64748b'} opacity={0.4 + Math.min(0.6, (pan - 80) / 200)} />
            {sugar ? (
              <ellipse cx="100" cy="100" rx={30 + Math.min(40, time * 5)} ry="8" fill={sugarColor(s)} stroke="#78350f" />
            ) : (
              <>
                <defs><radialGradient id="hl-g"><stop offset="0%" stopColor={coreColor(c)} /><stop offset="70%" stopColor={coreColor((c + s) / 2.6)} /><stop offset="100%" stopColor={surfColor(s)} /></radialGradient></defs>
                <ellipse cx="100" cy="86" rx="62" ry="22" fill="url(#hl-g)" stroke="#78350f" strokeWidth="1.5" />
                <text x="100" y="90" fontSize="8" textAnchor="middle" fill="#7c2d12">{L('cross-section', 'अनुप्रस्थ काट')}</text>
              </>
            )}
            {pan > 100 && [0, 1, 2].map((i) => (
              <motion.path key={i} d={`M${80 + i * 20} 70 q6 -8 0 -16 q-6 -8 0 -16`} stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round"
                animate={{ opacity: [0, 0.8, 0], y: [0, -10, -20] }} transition={{ duration: 1.8 - Math.min(1, (pan - 100) / 200), repeat: Infinity, delay: i * 0.4 }} />
            ))}
          </svg>
          <div className="flex items-end gap-3 justify-center mt-1">
            <div className="relative w-6 h-24 rounded-full bg-stone-300 dark:bg-stone-700 overflow-hidden" data-testid="gauge">
              <motion.div className="absolute bottom-0 left-0 right-0" animate={{ height: `${gauge * 100}%` }} style={{ background: 'linear-gradient(#ef4444,#f97316)' }} />
              {!sugar && <div className="absolute left-0 right-0 border-t-2 border-green-700" style={{ bottom: `${((75 - 20) / 80) * 100}%` }} />}
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-mono font-bold text-lg" data-testid="reading">{reading.toFixed(0)} °C</p>
              <p className="text-stone-500">{sugar ? L('sugar', 'चीनी') : L('core', 'केंद्र')}</p>
              {!sugar && <p className="text-stone-500">{L('surface', 'सतह')} {s.toFixed(0)} °C</p>}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-xs font-semibold">{L('Pan temperature', 'पैन का तापमान')}: <span className="font-mono">{pan} °C</span>
            <input type="range" min={80} max={240} step={5} value={pan} data-slider="pan" disabled={passed[lv]} onChange={(e) => setPan(+e.target.value)} className="w-full" style={{ accentColor: T.accent }} /></label>
          <label className="block text-xs font-semibold">{L('Cooking time', 'पकाने का समय')}: <span className="font-mono">{time} {L('min', 'मिनट')}</span>
            <input type="range" min={0} max={sugar ? 10 : 30} step={sugar ? 0.5 : 1} value={time} data-slider="time" disabled={passed[lv]} onChange={(e) => setTime(+e.target.value)} className="w-full" style={{ accentColor: T.accent }} /></label>
          <p className="text-xs rounded-lg px-3 py-2 font-medium" style={{ background: withAlpha(T.accent, 0.1), color: T.accent }} data-testid="state">{state}</p>
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={serve} disabled={passed[lv]} data-testid="serve-btn" className="px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>🍽️ {L('Serve it', 'परोसें')}</button>
            <HintButton onHint={hint} accent={T.accent} />
            {passed[lv] && lv === 0 && <button onClick={() => setLevel(1)} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm" data-testid="next-heat">{L('Next: Caramel', 'अगला: कैरेमल')} →</button>}
          </div>
          {passed.every(Boolean) && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-green-900 dark:text-green-200">✅ {L('Thermal conduction and caramelisation mastered!', 'ऊष्मा चालन व कैरेमल निर्माण में महारत!')}</p>
                <p className="text-xs text-green-700 dark:text-green-300">{L('Ready to sequence classical cooking methods.', 'शास्त्रीय पकाई विधियों के क्रम हेतु तैयार।')}</p>
              </div>
              <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                {L('Next: Methods', 'अगला: विधियाँ')} →
              </button>
            </motion.div>
          )}
        </div>
      </div>
      <Toast {...toast} />
    </div>
  );
}

const BLANCH: OrderStep[] = [
  { id: 'b1', emoji: '💧', label: bi('Bring a large pan of salted water to a rolling boil (100 °C)', 'बड़े पैन में नमकीन पानी को उबाल (100 °C) तक लाएँ'), why: bi('A large volume of boiling water keeps the temperature up when veg goes in.', 'ज़्यादा उबलता पानी सब्ज़ी डालने पर तापमान बनाए रखता है।') },
  { id: 'b2', emoji: '🥦', label: bi('Add the vegetables for a short time (1–2 minutes)', 'सब्ज़ी को थोड़ी देर (1–2 मिनट) डालें'), why: bi('Brief cooking sets colour and loosens skins without making veg soft.', 'थोड़ी देर पकाने से रंग पक्का होता है और छिलका ढीला पड़ता है, सब्ज़ी गलती नहीं।') },
  { id: 'b3', emoji: '🥄', label: bi('Lift out with a slotted spoon', 'छेद वाली कलछी से निकालें'), why: bi('Lift at once so the vegetables do not overcook.', 'तुरंत निकालें ताकि ज़्यादा न पकें।') },
  { id: 'b4', emoji: '🧊', label: bi('Refresh in iced water immediately', 'तुरंत बर्फ़ीले पानी में डालें'), why: bi('Iced water stops the cooking and keeps the bright colour (refreshing).', 'बर्फ़ीला पानी पकना रोकता है और चमकीला रंग बचाता है।') },
  { id: 'b5', emoji: '🥗', label: bi('Drain well and store or finish the dish', 'अच्छी तरह निथारें और रखें या पकवान पूरा करें'), why: bi('Drained, blanched veg is ready for freezing, salads or quick sautés.', 'निथरी ब्लांच सब्ज़ी फ़्रीज़िंग, सलाद या जल्दी सॉते हेतु तैयार है।') },
];
const BRAISE: OrderStep[] = [
  { id: 'r1', emoji: '🍖', label: bi('Sear the meat in hot fat until browned on all sides', 'गरम चर्बी में मांस को चारों ओर भूरा होने तक सेकें'), why: bi('Searing builds flavour and colour on the surface.', 'सेकने से सतह पर स्वाद व रंग बनता है।') },
  { id: 'r2', emoji: '🧅', label: bi('Add aromatics (onion, carrot, celery) and tomato', 'सुगंधित सब्ज़ियाँ (प्याज़, गाजर, अजवाइन-डंडी) व टमाटर डालें'), why: bi('Mirepoix and tomato give the braising liquid depth.', 'मिरपुआ व टमाटर पकाने वाले तरल को गहराई देते हैं।') },
  { id: 'r3', emoji: '🍷', label: bi('Add stock until it comes halfway up the meat', 'स्टॉक डालें जब तक मांस के आधे तक न पहुँचे'), why: bi('Braising uses a little liquid — halfway, not covered.', 'ब्रेज़िंग में थोड़ा तरल — आधा, पूरा डुबोना नहीं।') },
  { id: 'r4', emoji: '🍲', label: bi('Cover and cook gently at low heat for a long time', 'ढककर धीमी आँच पर देर तक पकाएँ'), why: bi('Slow moist heat turns tough connective tissue tender.', 'धीमी नम गर्मी कठोर संयोजी ऊतक को मुलायम करती है।') },
  { id: 'r5', emoji: '🍴', label: bi('Test with a fork, then serve with the reduced liquid as sauce', 'काँटे से जाँचें, फिर गाढ़े तरल को सॉस बनाकर परोसें'), why: bi('Meat is done when a fork slides in easily.', 'काँटा आसानी से घुसे तो मांस तैयार है।') },
];

function Methods({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [which, setWhich] = useState<'blanch' | 'braise'>('blanch');
  const [d, setD] = useState({ blanch: false, braise: false });
  useEffect(() => { if (d.blanch && d.braise) onDone(); /* eslint-disable-next-line */ }, [d]);
  return (
    <div className="space-y-3" data-testid="methods">
      <div className="flex gap-1.5">
        {(['blanch', 'braise'] as const).map((k) => (
          <button key={k} onClick={() => setWhich(k)} data-method={k} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${which === k ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700'}`} style={which === k ? { background: T.accent, borderColor: T.accent } : undefined}>
            {k === 'blanch' ? `🥦 ${L('Blanching', 'ब्लांचिंग')}` : `🍲 ${L('Braising', 'ब्रेज़िंग')}`}{d[k] ? ' ✓' : ''}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-600 dark:text-stone-300">{which === 'blanch' ? L('Put the blanching steps in the right order.', 'ब्लांचिंग के चरण सही क्रम में लगाएँ।') : L('Put the braising steps in the right order.', 'ब्रेज़िंग के चरण सही क्रम में लगाएँ।')}</p>
      <OrderTask key={which} steps={which === 'blanch' ? BLANCH : BRAISE} run={run} accent={T.accent} points={3} onDone={() => setD((x) => ({ ...x, [which]: true }))} />
      {d.blanch && which === 'blanch' && !d.braise && (
        <button onClick={() => setWhich('braise')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm" style={{ background: T.accent }}>
          {L('Next: Braising Sequence', 'अगला: ब्रेज़िंग क्रम')} →
        </button>
      )}
      {d.blanch && d.braise && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-green-900 dark:text-green-200">✅ {L('Both moist-heat methods mastered!', 'दोनों नम-ऊष्मा विधियों में महारत!')}</p>
          </div>
          <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
            {L('Next: Modern Techniques', 'अगला: आधुनिक तकनीकें')} →
          </button>
        </motion.div>
      )}
    </div>
  );
}

const MZ: MatchZone[] = [
  { id: 'micro', emoji: '📡', label: bi('Microwave', 'माइक्रोवेव') },
  { id: 'solar', emoji: '☀️', label: bi('Solar cooking', 'सौर पकाई') },
  { id: 'fast', emoji: '🍔', label: bi('Fast-food operation', 'फ़ास्ट-फ़ूड संचालन') },
  { id: 'spice', emoji: '🌶️', label: bi('Spice broiling & grinding', 'मसाला भूनना व पीसना') },
];
const MI: MatchItem[] = [
  { id: 'm1', cat: 'micro', emoji: '🚫', label: bi('Never use metal foil or metal dishes', 'धातु की पन्नी/बर्तन कभी नहीं'), why: bi('Metal reflects microwaves and can spark.', 'धातु माइक्रोवेव को परावर्तित करती है और चिंगारी दे सकती है।') },
  { id: 'm2', cat: 'micro', emoji: '🔄', label: bi('Stir halfway; allow standing time', 'बीच में चलाएँ; ठहरने का समय दें'), why: bi('Cold spots even out while the food stands.', 'ठहरने पर ठंडे स्थान बराबर हो जाते हैं।') },
  { id: 'm3', cat: 'micro', emoji: '💨', label: bi('Cover with a vented lid', 'हवादार ढक्कन से ढकें'), why: bi('Steam must escape or pressure builds.', 'भाप निकलनी चाहिए नहीं तो दबाव बनता है।') },
  { id: 's1', cat: 'solar', emoji: '🔆', label: bi('Needs bright direct sunlight and a reflector', 'तेज़ सीधी धूप व परावर्तक चाहिए'), why: bi('Reflectors focus sunlight onto the box.', 'परावर्तक धूप को बॉक्स पर केंद्रित करते हैं।') },
  { id: 's2', cat: 'solar', emoji: '⚫', label: bi('Black pot under a glass lid', 'काँच के ढक्कन के नीचे काला बर्तन'), why: bi('Black absorbs heat; glass traps it.', 'काला रंग गर्मी सोखता है; काँच उसे रोकता है।') },
  { id: 's3', cat: 'solar', emoji: '🐢', label: bi('Slow cooking with no fuel cost', 'धीमी पकाई, ईंधन खर्च शून्य'), why: bi('Solar cooking saves fuel but takes longer.', 'सौर पकाई ईंधन बचाती है पर समय ज़्यादा लगता है।') },
  { id: 'f1', cat: 'fast', emoji: '🧩', label: bi('Pre-prepared components assembled to order', 'पहले से तैयार हिस्से, ऑर्डर पर जोड़ना'), why: bi('Prepared components give speed and consistency.', 'तैयार हिस्से गति व एकरूपता देते हैं।') },
  { id: 'f2', cat: 'fast', emoji: '⏲️', label: bi('Fixed portions and timers for every item', 'हर वस्तु के लिए तय मात्रा व टाइमर'), why: bi('Standard portions and timers keep quality the same.', 'मानक मात्रा व टाइमर गुणवत्ता समान रखते हैं।') },
  { id: 'f3', cat: 'fast', emoji: '🌡️', label: bi('Hot-holding bin at 63 °C or above', 'गर्म-रखरखाव बिन 63 °C या ऊपर'), why: bi('Hot food must be held at 63 °C or above.', 'गर्म भोजन 63 °C या ऊपर रखना ज़रूरी है।') },
  { id: 'p1', cat: 'spice', emoji: '🔥', label: bi('Dry-roast whole spices, then grind', 'साबुत मसाले सूखे भूनकर फिर पीसें'), why: bi('Roasting releases oils and deepens aroma.', 'भूनने से तेल निकलते हैं और सुगंध गहरी होती है।') },
  { id: 'p2', cat: 'spice', emoji: '🌀', label: bi('Grind just before use to keep aroma', 'सुगंध बचाने हेतु उपयोग से ठीक पहले पीसें'), why: bi('Ground spices lose aroma quickly.', 'पिसे मसाले सुगंध जल्दी खोते हैं।') },
  { id: 'p3', cat: 'spice', emoji: '⚠️', label: bi('Do not over-roast — it turns bitter', 'ज़्यादा न भूनें — कड़वा हो जाता है'), why: bi('Over-roasted spices burn and taste bitter.', 'ज़्यादा भुने मसाले जलकर कड़वे हो जाते हैं।') },
];

const VEG = [
  { id: 'cab', emoji: '🥬', name: bi('Red cabbage', 'लाल पत्तागोभी'), base: '#7e22ce', pigment: bi('anthocyanin', 'एंथोसायनिन') },
  { id: 'spi', emoji: '🥬', name: bi('Spinach', 'पालक'), base: '#15803d', pigment: bi('chlorophyll', 'क्लोरोफ़िल') },
  { id: 'cau', emoji: '🥦', name: bi('Cauliflower', 'फूलगोभी'), base: '#f5f5f4', pigment: bi('flavone (white)', 'फ़्लेवोन (सफ़ेद)') },
];
const ADD = [
  { id: 'none', emoji: '💧', name: bi('Plain water', 'सादा पानी') },
  { id: 'acid', emoji: '🍋', name: bi('Acid (lemon / vinegar)', 'अम्ल (नींबू/सिरका)') },
  { id: 'alk', emoji: '🧂', name: bi('Alkali (baking soda)', 'क्षार (खाने का सोडा)') },
];
const OUT: Record<string, { c: string; t: Bi2 }> = {
  'cab-none': { c: '#7e22ce', t: bi('Stays purple.', 'बैंगनी रहती है।') },
  'cab-acid': { c: '#e11d48', t: bi('Turns bright red-pink — acid keeps red cabbage red.', 'चमकीली लाल-गुलाबी — अम्ल लाल पत्तागोभी को लाल रखता है।') },
  'cab-alk': { c: '#2563eb', t: bi('Turns blue-green — alkali shifts anthocyanin colour.', 'नीला-हरा — क्षार एंथोसायनिन का रंग बदलता है।') },
  'spi-none': { c: '#15803d', t: bi('Stays green if cooked briefly.', 'थोड़ा पकाने पर हरा रहता है।') },
  'spi-acid': { c: '#84763a', t: bi('Turns dull olive-brown — acid damages chlorophyll.', 'फीका जैतूनी-भूरा — अम्ल क्लोरोफ़िल बिगाड़ता है।') },
  'spi-alk': { c: '#16a34a', t: bi('Looks bright green but turns soft and mushy — not recommended.', 'चमकीला हरा पर गलकर लिज़लिज़ा — सलाह नहीं।') },
  'cau-none': { c: '#f5f5f4', t: bi('Cream-white.', 'क्रीम-सफ़ेद।') },
  'cau-acid': { c: '#ffffff', t: bi('Stays bright white — a little lemon in the water keeps cauliflower white.', 'चमकीली सफ़ेद — पानी में थोड़ा नींबू फूलगोभी को सफ़ेद रखता है।') },
  'cau-alk': { c: '#facc15', t: bi('Turns yellowish.', 'पीली पड़ जाती है।') },
};
const GOALS = [
  { id: 'cab-acid', t: bi('Keep red cabbage red', 'लाल पत्तागोभी को लाल रखें') },
  { id: 'spi-acid', t: bi('See what acid does to green spinach', 'हरे पालक पर अम्ल का असर देखें') },
  { id: 'cau-acid', t: bi('Keep cauliflower white', 'फूलगोभी को सफ़ेद रखें') },
];

function ColourLab({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const [veg, setVeg] = useState('cab'); const [add, setAdd] = useState('none');
  const [hit, setHit] = useState<string[]>([]);
  const { toast, say } = useToast();
  const k = `${veg}-${add}`; const o = OUT[k]; const v = VEG.find((x) => x.id === veg)!;
  useEffect(() => { if (hit.length === GOALS.length) onDone(); /* eslint-disable-next-line */ }, [hit.length]);
  const cook = () => {
    playClickSound('neutral');
    say('info', L(o.t.en, o.t.hi));
    if (GOALS.some((g) => g.id === k) && !hit.includes(k)) {
      setHit((h) => [...h, k]); run.add(8);
      playClickSound('success');
      say('ok', L(`Goal achieved! ${o.t.en}`, `लक्ष्य पूरा! ${o.t.hi}`));
    }
  };
  const hint = () => { run.hint(); const g = GOALS.find((x) => !hit.includes(x.id)); if (g) say('info', L(`Try: ${g.t.en} — which additive protects the colour?`, `आज़माएँ: ${g.t.hi} — कौन-सा योजक रंग बचाता है?`)); };
  return (
    <div className="space-y-3" data-testid="colour-lab">
      <Card><p className="text-xs font-bold mb-1" style={{ color: T.accent }}>{L('Goals', 'लक्ष्य')}</p>
        <ul className="text-xs space-y-0.5">{GOALS.map((g) => <li key={g.id} className={hit.includes(g.id) ? 'text-green-700 font-bold line-through' : ''}>{hit.includes(g.id) ? '✓' : '○'} {L(g.t.en, g.t.hi)}</li>)}</ul></Card>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold">{L('1. Choose a vegetable', '1. सब्ज़ी चुनें')}</p>
          <div className="flex gap-1.5 flex-wrap">{VEG.map((x) => <button key={x.id} data-veg={x.id} onClick={() => setVeg(x.id)} className={`px-3 py-2 rounded-lg border text-xs ${veg === x.id ? 'font-bold border-2' : ''}`} style={veg === x.id ? { borderColor: T.accent } : undefined}>{x.emoji} {L(x.name.en, x.name.hi)}</button>)}</div>
          <p className="text-xs font-semibold">{L('2. Choose what goes in the water', '2. पानी में क्या डालें')}</p>
          <div className="flex gap-1.5 flex-wrap">{ADD.map((x) => <button key={x.id} data-add={x.id} onClick={() => setAdd(x.id)} className={`px-3 py-2 rounded-lg border text-xs ${add === x.id ? 'font-bold border-2' : ''}`} style={add === x.id ? { borderColor: T.accent } : undefined}>{x.emoji} {L(x.name.en, x.name.hi)}</button>)}</div>
          <div className="flex gap-2"><button onClick={cook} data-testid="cook-btn" className="px-4 py-2 rounded-lg text-white text-xs font-bold shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>🍲 {L('Cook 2 minutes', '2 मिनट पकाएँ')}</button><HintButton onHint={hint} accent={T.accent} /></div>
        </div>
        <div className="rounded-2xl p-4 text-center border" style={{ background: withAlpha(o.c, 0.12) }}>
          <motion.div animate={{ backgroundColor: o.c }} transition={{ duration: 0.6 }} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-md grid place-items-center text-4xl" data-testid="swatch" data-colour={o.c}>{v.emoji}</motion.div>
          <p className="text-xs mt-2 text-stone-600 dark:text-stone-300">{L('Pigment', 'रंजक')}: <b>{L(v.pigment.en, v.pigment.hi)}</b></p>
          <p className="text-xs mt-1 font-semibold" data-testid="outcome">{L(o.t.en, o.t.hi)}</p>
        </div>
      </div>
      {hit.length === GOALS.length && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 text-center">
          <p className="font-bold text-sm text-green-900 dark:text-green-200">🎉 {L('All pH pigment reactions tested successfully!', 'सभी pH रंजक प्रभाव सफलतापूर्वक परखे गए!')}</p>
        </motion.div>
      )}
      <Toast {...toast} />
    </div>
  );
}

export default function HeatLabSim() {
  const L = useLang();
  const run = useRun('m2HeatLab', 15 + 15 + 30 + 24 + 24);
  const [tab, setTab] = useState<'heat' | 'method' | 'tech' | 'colour'>('heat');
  const ds = useDoneSet(4, run);
  const [key, setKey] = useState(0);
  const replay = () => { run.reset(); ds.reset(); setTab('heat'); setKey((k) => k + 1); };
  return (
    <FoodShell accent={T.accent} Icon={T.Icon} title={L('Heat Science & Advanced Cooking Lab', 'ऊष्मा विज्ञान व उन्नत पकाई लैब')}
      subtitle={L('Control the pan, build the methods, sort modern techniques and test how pH changes vegetable colour.', 'पैन नियंत्रित करें, विधियाँ बनाएँ, आधुनिक तकनीकें छाँटें और pH से सब्ज़ी का रंग बदलना परखें।')}>
      {run.done ? <FinishCard run={run} accent={T.accent} onReplay={replay} summary={[L('Safe core temperature and browning balanced', 'सुरक्षित केंद्र तापमान व ब्राउनिंग का संतुलन'), L('Blanching & braising sequences built', 'ब्लांचिंग व ब्रेज़िंग क्रम बनाए'), L('Microwave, solar, fast-food, spice techniques sorted', 'माइक्रोवेव, सौर, फ़ास्ट-फ़ूड, मसाला तकनीकें छाँटीं'), L('pH colour effects tested', 'pH से रंग प्रभाव परखे')]} /> : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs2 accent={T.accent} value={tab} onChange={setTab} tabs={[
              { id: 'heat', label: L('1. Heat Lab', '1. ऊष्मा लैब'), done: ds.done.has('heat') }, { id: 'method', label: L('2. Methods', '2. विधियाँ'), done: ds.done.has('method') },
              { id: 'tech', label: L('3. Techniques', '3. तकनीकें'), done: ds.done.has('tech') }, { id: 'colour', label: L('4. Colour & pH', '4. रंग व pH'), done: ds.done.has('colour') }]} />
            <Hud run={run} accent={T.accent} />
          </div>
          <div key={key}>
            <div style={{ display: tab === 'heat' ? 'block' : 'none' }}>
              <HeatLab run={run} onDone={() => ds.mark('heat')} onNext={() => setTab('method')} />
            </div>
            <div style={{ display: tab === 'method' ? 'block' : 'none' }}>
              <Methods run={run} onDone={() => ds.mark('method')} onNext={() => setTab('tech')} />
            </div>
            <div style={{ display: tab === 'tech' ? 'block' : 'none' }}>
              <div className="space-y-3">
                <MatchTask items={MI} zones={MZ} run={run} accent={T.accent} points={2} cols={2} onDone={() => ds.mark('tech')} />
                {ds.done.has('tech') && (
                  <div className="flex justify-end">
                    <button onClick={() => setTab('colour')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                      {L('Next: Colour & pH Lab', 'अगला: रंग व pH लैब')} →
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: tab === 'colour' ? 'block' : 'none' }}>
              <ColourLab run={run} onDone={() => ds.mark('colour')} />
            </div>
          </div>
        </>
      )}
    </FoodShell>
  );
}
