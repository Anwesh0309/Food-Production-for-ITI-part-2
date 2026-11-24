import { useEffect, useState } from 'react';
import { FOOD2_THEMES } from '@/data/themes';
import { Card, ChefBrief, FinishCard, FoodShell, Hud, HintButton, ProTip, SubTabs, Tabs2, Toast, useLang, useRun, useSubDone, useToast, type Run } from '@/components/kit';
import { ChoiceTask, MatchTask, OrderTask, useDoneSet, type Bi2, type ChoiceQ, type MatchItem, type MatchZone, type OrderStep } from '@/components/tasks';
import { playClickSound } from '@/utils/sound';

const T = FOOD2_THEMES.manage;
const bi = (en: string, hi: string): Bi2 => ({ en, hi });
const mz = (id: string, emoji: string, label: Bi2, note?: Bi2): MatchZone => ({ id, emoji, label, note });
const mi = (id: string, cat: string, emoji: string, label: Bi2, why: Bi2): MatchItem => ({ id, cat, emoji, label, why });

/* ---------------- Menu planner ---------------- */
interface Dish { id: string; course: 'starter' | 'main' | 'dessert'; e: string; n: Bi2; veg: boolean; rich: boolean; fried: boolean }
const DISHES: Dish[] = [
  { id: 's1', course: 'starter', e: '🍢', n: bi('Paneer tikka (grilled)', 'पनीर टिक्का (ग्रिल्ड)'), veg: true, rich: false, fried: false },
  { id: 's2', course: 'starter', e: '🍲', n: bi('Chicken soup', 'चिकन सूप'), veg: false, rich: false, fried: false },
  { id: 's3', course: 'starter', e: '🍅', n: bi('Cream of tomato soup', 'क्रीम ऑफ़ टोमैटो सूप'), veg: true, rich: true, fried: false },
  { id: 's4', course: 'starter', e: '🌯', n: bi('Veg spring rolls (fried)', 'वेज स्प्रिंग रोल (तले)'), veg: true, rich: false, fried: true },
  { id: 'm1', course: 'main', e: '🍛', n: bi('Dal makhani with butter & cream', 'मक्खन-क्रीम वाली दाल मखनी'), veg: true, rich: true, fried: false },
  { id: 'm2', course: 'main', e: '🍚', n: bi('Veg biryani with raita', 'रायते संग वेज बिरयानी'), veg: true, rich: false, fried: false },
  { id: 'm3', course: 'main', e: '🍗', n: bi('Butter chicken', 'बटर चिकन'), veg: false, rich: true, fried: false },
  { id: 'm4', course: 'main', e: '🥬', n: bi('Palak paneer with roti', 'रोटी संग पालक पनीर'), veg: true, rich: false, fried: false },
  { id: 'd1', course: 'dessert', e: '🍮', n: bi('Rasmalai (creamy)', 'रसमलाई (मलाईदार)'), veg: true, rich: true, fried: false },
  { id: 'd2', course: 'dessert', e: '🍉', n: bi('Fresh fruit salad', 'ताज़ा फ्रूट सलाद'), veg: true, rich: false, fried: false },
  { id: 'd3', course: 'dessert', e: '🍡', n: bi('Gulab jamun (fried)', 'गुलाब जामुन (तले)'), veg: true, rich: false, fried: true },
  { id: 'd4', course: 'dessert', e: '🥛', n: bi('Rich kheer with nuts', 'मेवे वाली गाढ़ी खीर'), veg: true, rich: true, fried: false },
];

function MenuPlan({ run, onDone, onProceed }: { run: Run; onDone: () => void; onProceed?: () => void }) {
  const L = useLang();
  const [sel, setSel] = useState<Record<string, string>>({});
  const [ok, setOk] = useState(false);
  const { toast, say } = useToast();

  const pick = (d: Dish) => {
    if (!ok) {
      playClickSound('click');
      setSel((s) => ({ ...s, [d.course]: d.id }));
    }
  };

  const check = () => {
    if (ok) return;
    const ds = (['starter', 'main', 'dessert'] as const).map((c) => DISHES.find((x) => x.id === sel[c]));
    if (ds.some((x) => !x)) {
      playClickSound('click');
      say('info', L('Choose one dish for each course.', 'हर कोर्स का एक व्यंजन चुनें।'));
      return;
    }
    const d = ds as Dish[];
    if (d.some((x) => !x.veg)) {
      playClickSound('error');
      run.miss();
      say('bad', L('The guests are vegetarian — remove the non-vegetarian dish.', 'अतिथि शाकाहारी हैं — मांसाहारी व्यंजन हटाएँ।'));
      return;
    }
    if (d.filter((x) => x.rich).length > 1) {
      playClickSound('error');
      run.miss();
      say('bad', L('Too many rich, creamy dishes. Balance with at least two lighter ones.', 'बहुत सारे भारी, मलाईदार व्यंजन। कम से कम दो हल्के रखें।'));
      return;
    }
    if (d.filter((x) => x.fried).length > 1) {
      playClickSound('error');
      run.miss();
      say('bad', L('Too many fried items — a menu needs variety of cooking methods.', 'बहुत सारे तले व्यंजन — मेन्यू में पकाने की विधियों में विविधता चाहिए।'));
      return;
    }
    playClickSound('success');
    run.add(10);
    setOk(true);
    onDone();
    say('ok', L('A balanced vegetarian menu — light and rich, varied cooking methods, one dish per course.', 'संतुलित शाकाहारी मेन्यू — हल्का व भारी, विविध पकाई, हर कोर्स में एक व्यंजन।'));
  };

  const hint = () => {
    playClickSound('click');
    run.hint();
    say('info', L('Rules: all vegetarian, at most one rich dish, at most one fried dish.', 'नियम: सब शाकाहारी, अधिकतम एक भारी व्यंजन, अधिकतम एक तला व्यंजन।'));
  };

  return (
    <div className="space-y-3" data-testid="menu-plan">
      <Card>
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium">
          {L('Plan a 3-course lunch for 40 vegetarian guests: one starter, one main, one dessert. Keep it balanced — not too rich, not too fried.', '40 शाकाहारी अतिथियों हेतु 3-कोर्स लंच बनाएँ: एक स्टार्टर, एक मेन, एक मिठाई। संतुलित रखें — बहुत भारी या तला नहीं।')}
        </p>
      </Card>
      {(['starter', 'main', 'dessert'] as const).map((c) => (
        <div key={c} className="space-y-1.5">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {c === 'starter' ? L('1. Starter (Cold / Hot / Soup)', '1. स्टार्टर (ठंडा / गरम / सूप)') : c === 'main' ? L('2. Main Course', '2. मुख्य कोर्स') : L('3. Dessert', '3. मिठाई')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DISHES.filter((d) => d.course === c).map((d) => (
              <button
                key={d.id}
                data-dish={d.id}
                onClick={() => pick(d)}
                className={`rounded-xl border p-2.5 text-center text-xs transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
                  sel[c] === d.id
                    ? 'border-2 bg-sky-50 dark:bg-sky-950/50 shadow-sm font-bold text-sky-900 dark:text-sky-100 ring-1 ring-sky-400'
                    : 'bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-sky-300 dark:hover:border-sky-700'
                }`}
                style={sel[c] === d.id ? { borderColor: T.accent } : undefined}
              >
                <div className="text-2xl">{d.e}</div>
                <span className="leading-tight">{L(d.n.en, d.n.hi)}</span>
                <div className="flex gap-1 text-[10px] mt-0.5 flex-wrap justify-center">
                  {d.veg ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">🟢 Veg</span> : <span className="text-red-500 font-semibold">🔴 Non-Veg</span>}
                  {d.rich && <span className="text-amber-600 dark:text-amber-400 font-semibold">🧈 Rich</span>}
                  {d.fried && <span className="text-orange-600 dark:text-orange-400 font-semibold">🔥 Fried</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2 items-center pt-1">
        <button
          onClick={check}
          disabled={ok}
          data-testid="menu-check"
          className="px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold disabled:opacity-50 transition active:scale-95 shadow-xs"
          style={{ background: T.accent }}
        >
          📋 {L('Approve menu', 'मेन्यू स्वीकृत करें')}
        </button>
        <HintButton onHint={hint} accent={T.accent} />
      </div>
      {ok && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 font-bold">
          <span>✓ {L('Menu approved! Balanced vegetarian selection complete.', 'मेन्यू स्वीकृत! संतुलित शाकाहारी चयन पूरा हुआ।')}</span>
          {onProceed && (
            <button
              onClick={() => { playClickSound('click'); onProceed(); }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
            >
              {L('Next: Indent & Costing →', 'अगला: इंडेंट व लागत →')}
            </button>
          )}
        </div>
      )}
      <Toast {...toast} />
    </div>
  );
}

/* ---------------- Numeric questions ---------------- */
interface NQ { q: Bi2; unit: string; answer: number; tol: number; why: Bi2; hint: Bi2 }
function NumQ({ qs, run, points, onDone, onProceed }: { qs: NQ[]; run: Run; points: number; onDone: () => void; onProceed?: () => void }) {
  const L = useLang();
  const [i, setI] = useState(0);
  const [v, setV] = useState('');
  const [ok, setOk] = useState<boolean[]>(qs.map(() => false));
  const { toast, say } = useToast();
  const q = qs[i];

  useEffect(() => {
    if (ok.every(Boolean)) onDone();
    /* eslint-disable-next-line */
  }, [ok]);

  const check = () => {
    if (v.trim() === '') return;
    const n = parseFloat(v);
    if (isNaN(n)) return;
    if (Math.abs(n - q.answer) <= q.tol) {
      playClickSound('success');
      run.add(points);
      setOk((o) => o.map((x, k) => (k === i ? true : x)));
      say('ok', L(q.why.en, q.why.hi));
    } else {
      playClickSound('error');
      run.miss();
      say('bad', L('Not right — check your multiplication or percentage and try again.', 'सही नहीं — गुणा या प्रतिशत जाँचकर फिर कोशिश करें।'));
    }
  };

  const hint = () => {
    playClickSound('click');
    run.hint();
    say('info', L(q.hint.en, q.hint.hi));
  };

  const next = () => {
    playClickSound('click');
    setI(i + 1);
    setV('');
    say('info', null);
  };

  return (
    <div className="space-y-3" data-testid="numq">
      <div className="flex gap-1.5 flex-wrap">
        {qs.map((_, k) => (
          <span
            key={k}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
              k === i
                ? 'font-bold bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-200 ring-1 ring-sky-400'
                : ok[k]
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold'
                : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
            }`}
          >
            {k + 1}{ok[k] ? ' ✓' : ''}
          </span>
        ))}
      </div>
      <Card>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{L(q.q.en, q.q.hi)}</p>
      </Card>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          step="any"
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && v.trim() !== '' && !ok[i]) {
              e.preventDefault();
              check();
            }
          }}
          disabled={ok[i]}
          placeholder="0"
          data-testid="num-input"
          className="w-32 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-slate-900 dark:text-slate-100 text-sm font-mono shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <span className="text-xs font-bold text-stone-500 dark:text-stone-400">{q.unit}</span>
        <button
          onClick={check}
          disabled={v.trim() === '' || ok[i]}
          data-testid="check-btn"
          className="px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50 transition active:scale-95 shadow-xs"
          style={{ background: T.accent }}
        >
          {L('Check', 'जाँचें')} ↵
        </button>
        <HintButton onHint={hint} accent={T.accent} />
        {ok[i] && i < qs.length - 1 && (
          <button
            onClick={next}
            data-testid="next-num"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            {L('Next question', 'अगला प्रश्न')} →
          </button>
        )}
        {ok.every(Boolean) && onProceed && (
          <button
            onClick={() => { playClickSound('click'); onProceed(); }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            {L('Proceed to next task', 'अगले कार्य पर बढ़ें')} →
          </button>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}

const COST: NQ[] = [
  { q: bi('Indent: each guest gets 75 g of raw rice. How many kg of rice do you indent for 40 guests?', 'इंडेंट: हर अतिथि को 75 ग्राम कच्चा चावल। 40 अतिथियों हेतु कितने किग्रा चावल का इंडेंट करेंगे?'), unit: 'kg', answer: 3, tol: 0.05, why: bi('75 g × 40 = 3000 g = 3 kg.', '75 ग्राम × 40 = 3000 ग्राम = 3 किग्रा।'), hint: bi('Multiply 75 by 40, then divide by 1000.', '75 को 40 से गुणा करें, फिर 1000 से भाग।') },
  { q: bi('Portion control: each guest gets 60 g of dal (raw). How many kg for 40 guests?', 'मात्रा-नियंत्रण: हर अतिथि को 60 ग्राम कच्ची दाल। 40 अतिथियों हेतु कितने किग्रा?'), unit: 'kg', answer: 2.4, tol: 0.05, why: bi('60 g × 40 = 2400 g = 2.4 kg.', '60 ग्राम × 40 = 2400 ग्राम = 2.4 किग्रा।'), hint: bi('60 × 40 = 2400 g.', '60 × 40 = 2400 ग्राम।') },
  { q: bi('A dish costs ₹60 to make and sells for ₹150. What is the food cost %?', 'एक व्यंजन बनाने में ₹60 लगते हैं और ₹150 में बिकता है। फ़ूड कॉस्ट % क्या है?'), unit: '%', answer: 40, tol: 0.5, why: bi('Food cost % = cost ÷ selling price × 100 = 60 ÷ 150 × 100 = 40%.', 'फ़ूड कॉस्ट % = लागत ÷ बिक्री मूल्य × 100 = 60 ÷ 150 × 100 = 40%।'), hint: bi('60 ÷ 150 × 100.', '60 ÷ 150 × 100।') },
  { q: bi('A dish costs ₹40 and you want a 40% food cost. What selling price must you set?', 'व्यंजन की लागत ₹40 है और 40% फ़ूड कॉस्ट चाहिए। बिक्री मूल्य क्या रखें?'), unit: '₹', answer: 100, tol: 1, why: bi('Selling price = cost ÷ food-cost % = 40 ÷ 0.40 = ₹100.', 'बिक्री मूल्य = लागत ÷ फ़ूड-कॉस्ट % = 40 ÷ 0.40 = ₹100।'), hint: bi('Divide 40 by 0.40.', '40 को 0.40 से भाग दें।') },
];

const SPEC: ChoiceQ[] = [
  { q: bi('Which purchase specification is best for ordering basmati rice?', 'बासमती चावल के ऑर्डर हेतु कौन-सी क्रय विनिर्देश सबसे अच्छी है?'), options: [bi('"Good rice, any kind, cheap"', '"अच्छा चावल, कोई भी, सस्ता"'), bi('"Aged basmati, extra-long grain, clean, few broken grains, 25 kg sealed bags"', '"पुराना बासमती, अतिरिक्त लंबा दाना, साफ़, कम टूटे दाने, 25 किग्रा सील बोरी"'), bi('"Whatever the supplier has"', '"जो भी सप्लायर के पास हो"')], correct: 1, why: bi('A purchase specification states quality, size, grade and packing so every delivery is the same.', 'क्रय विनिर्देश गुणवत्ता, आकार, ग्रेड व पैकिंग बताती है ताकि हर डिलीवरी एक-सी हो।'), scene: '🌾' },
  { q: bi('What is an indent?', 'इंडेंट क्या है?'), options: [bi('A written request from the kitchen for the items and quantities needed', 'रसोई से ज़रूरी सामान व मात्रा का लिखित अनुरोध'), bi('The bill from the supplier', 'सप्लायर का बिल'), bi('A list of kitchen staff', 'रसोई कर्मचारियों की सूची')], correct: 0, why: bi('An indent (requisition) lists what the kitchen needs and how much.', 'इंडेंट (माँगपत्र) बताता है कि रसोई को क्या और कितना चाहिए।'), scene: '📝' },
];

/* ---------------- Waste, first aid, evacuation ---------------- */
const BIN_Z = [mz('wet', '🟢', bi('Green: wet waste', 'हरा: गीला कचरा')), mz('dry', '🔵', bi('Blue: dry / recyclable', 'नीला: सूखा / पुनर्चक्रण')), mz('haz', '🔴', bi('Red: hazardous', 'लाल: खतरनाक'))];
const BIN_I = [
  mi('w1', 'wet', '🥔', bi('Vegetable peelings', 'सब्ज़ी के छिलके'), bi('Peelings are wet waste.', 'छिलके गीला कचरा हैं।')), mi('w2', 'wet', '🍚', bi('Leftover cooked rice (spoiled)', 'बचा बासी चावल'), bi('Food leftovers are wet waste.', 'बचा भोजन गीला कचरा है।')), mi('w3', 'wet', '🍵', bi('Used tea leaves', 'इस्तेमाल की चायपत्ती'), bi('Tea leaves are wet waste.', 'चायपत्ती गीला कचरा है।')),
  mi('d1', 'dry', '📦', bi('Cardboard box', 'गत्ते का डिब्बा'), bi('Clean cardboard is dry recyclable.', 'साफ़ गत्ता सूखा पुनर्चक्रण योग्य है।')), mi('d2', 'dry', '🧴', bi('Empty plastic bottle', 'खाली प्लास्टिक बोतल'), bi('Plastic bottles are dry recyclable.', 'प्लास्टिक बोतलें सूखा पुनर्चक्रण योग्य हैं।')), mi('d3', 'dry', '🥫', bi('Empty tin can', 'खाली टिन का डिब्बा'), bi('Cans are dry recyclable.', 'टिन के डिब्बे सूखा पुनर्चक्रण योग्य हैं।')),
  mi('h1', 'haz', '🩹', bi('Used bandage / dressing', 'इस्तेमाल की पट्टी / ड्रेसिंग'), bi('Soiled dressings are hazardous waste.', 'गंदी ड्रेसिंग खतरनाक कचरा है।')), mi('h2', 'haz', '🪟', bi('Broken glass (wrapped)', 'टूटा काँच (लपेटा हुआ)'), bi('Broken glass is a sharp hazard — wrap and bin it separately.', 'टूटा काँच नुकीला खतरा है — लपेटकर अलग डालें।')), mi('h3', 'haz', '🧪', bi('Empty chemical cleaner container', 'खाली रासायनिक क्लीनर डिब्बा'), bi('Chemical containers are hazardous waste.', 'रासायनिक डिब्बे खतरनाक कचरा हैं।')),
];
const KIT_Z = [mz('in', '🧰', bi('Put in the first-aid kit', 'फ़र्स्ट-एड किट में रखें')), mz('out', '🚫', bi('Keep out of the kit', 'किट में न रखें'))];
const KIT_I = [
  mi('k1', 'in', '🟦', bi('Blue waterproof plasters', 'नीले वाटरप्रूफ़ प्लास्टर'), bi('Blue plasters are easy to spot if one falls into food.', 'नीले प्लास्टर भोजन में गिरें तो आसानी से दिखते हैं।')), mi('k2', 'in', '🩹', bi('Sterile dressings and bandages', 'स्टेराइल ड्रेसिंग व पट्टियाँ'), bi('Dressings are essential.', 'ड्रेसिंग ज़रूरी हैं।')), mi('k3', 'in', '🧴', bi('Antiseptic wipes', 'एंटीसेप्टिक वाइप्स'), bi('Wipes clean wounds.', 'वाइप्स घाव साफ़ करते हैं।')),
  mi('k4', 'in', '🧊', bi('Burn gel / cooling dressing', 'बर्न जेल / ठंडक ड्रेसिंग'), bi('Kitchens need burn care.', 'रसोई में जलने की देखभाल ज़रूरी है।')), mi('k5', 'in', '🧤', bi('Disposable gloves', 'डिस्पोज़ेबल दस्ताने'), bi('Gloves protect helper and patient.', 'दस्ताने सहायक व रोगी दोनों की रक्षा करते हैं।')), mi('k6', 'in', '👁️', bi('Eye-wash pods', 'आई-वॉश पॉड'), bi('Eye wash rinses splashes.', 'आई-वॉश छींटे धोता है।')),
  mi('k7', 'out', '☁️', bi('Loose cotton wool', 'खुली रुई'), bi('Loose fibres can fall into food — avoid cotton wool.', 'खुले रेशे भोजन में गिर सकते हैं — रुई से बचें।')), mi('k8', 'out', '💊', bi('Tablets and medicines', 'गोलियाँ व दवाइयाँ'), bi('Workplace kits should not hold medicines.', 'कार्यस्थल किट में दवाइयाँ नहीं रखते।')), mi('k9', 'out', '📅', bi('Out-of-date dressings', 'एक्सपायर ड्रेसिंग'), bi('Expired supplies are no longer sterile — replace them.', 'एक्सपायर सामान स्टेराइल नहीं — बदलें।')),
];
const EVAC: OrderStep[] = [
  { id: 'e1', emoji: '🔔', label: bi('Raise the alarm and warn everyone', 'अलार्म बजाएँ और सबको चेताएँ'), why: bi('Alert everyone first.', 'पहले सबको सूचित करें।') },
  { id: 'e2', emoji: '🛑', label: bi('Switch off gas and electricity if it is safe to do so', 'सुरक्षित हो तो गैस व बिजली बंद करें'), why: bi('Cutting fuel stops a fire from growing.', 'ईंधन बंद करने से आग नहीं बढ़ती।') },
  { id: 'e3', emoji: '🚪', label: bi('Leave by the nearest safe exit — do not use lifts', 'निकटतम सुरक्षित निकास से निकलें — लिफ़्ट नहीं'), why: bi('Walk, do not run; never use a lift.', 'चलकर निकलें, दौड़ें नहीं; लिफ़्ट कभी नहीं।') },
  { id: 'e4', emoji: '🟩', label: bi('Go to the assembly point', 'सभा-स्थल पर जाएँ'), why: bi('Everyone gathers at the muster point.', 'सब सभा-स्थल पर इकट्ठा होते हैं।') },
  { id: 'e5', emoji: '📋', label: bi('Take the roll call and wait for the all-clear', 'हाज़िरी लें और सब-ठीक की सूचना का इंतज़ार करें'), why: bi('Roll call shows everyone is out; do not re-enter.', 'हाज़िरी से पता चलता है सब बाहर हैं; वापस न जाएँ।') },
];
const EXITQ: ChoiceQ[] = [
  { q: bi('Fire is burning near the main door. A green EXIT sign shows a side door that is clear. Which exit do you use?', 'मुख्य द्वार के पास आग है। हरा EXIT संकेत एक खाली साइड डोर दिखाता है। कौन-सा निकास लेंगे?'), options: [bi('The main door through the smoke', 'धुएँ से होकर मुख्य द्वार'), bi('The clear side door marked EXIT', 'EXIT लिखा खाली साइड डोर'), bi('Stay and fight the fire', 'रुककर आग से लड़ें')], correct: 1, why: bi('Always use the nearest exit that is clear of fire and smoke.', 'आग-धुएँ से मुक्त निकटतम निकास ही इस्तेमाल करें।'), scene: '🚪' },
  { q: bi('Why must fire exits never be blocked by boxes or stock?', 'फ़ायर एग्ज़िट पर डिब्बे या सामान क्यों नहीं रखने चाहिए?'), options: [bi('Blocked exits can trap people in an emergency', 'बंद निकास आपात में लोगों को फँसा सकते हैं'), bi('It looks untidy only', 'सिर्फ़ गंदा दिखता है'), bi('Boxes may get wet', 'डिब्बे गीले हो सकते हैं')], correct: 0, why: bi('A blocked exit can cost lives.', 'बंद निकास जान ले सकता है।'), scene: '📦' },
];

/* ---------------- Larder, rechauffé, stewarding ---------------- */
const RECH: ChoiceQ[] = [
  { q: bi('Leftover roast chicken is to be made into a hot curry the next day (a réchauffé dish). What is correct?', 'बचे रोस्ट चिकन से अगले दिन गरम करी (रेशॉफ़े व्यंजन) बनानी है। सही क्या है?'), options: [bi('Cool it fast, chill it, then reheat to 75 °C core — once only', 'जल्दी ठंडा करें, फ्रिज में रखें, फिर केंद्र 75 °C तक गरम करें — सिर्फ़ एक बार'), bi('Leave it out overnight, then warm gently', 'रात भर बाहर रखकर हल्का गरम करें'), bi('Reheat to 40 °C so it stays soft', 'नरम रखने हेतु 40 °C तक गरम करें')], correct: 0, why: bi('Réchauffé food must be cooled quickly, kept cold, and reheated once to a safe core temperature.', 'रेशॉफ़े भोजन जल्दी ठंडा, ठंडा रखा और एक बार सुरक्षित केंद्र तापमान तक गरम होना चाहिए।'), scene: '🍗' },
  { q: bi('Cooked rice has stood at room temperature for 4 hours. What do you do?', 'पका चावल 4 घंटे कमरे के तापमान पर रखा है। क्या करें?'), options: [bi('Reheat it and serve', 'गरम करके परोसें'), bi('Discard it', 'फेंक दें'), bi('Mix it into fresh rice', 'ताज़े चावल में मिला दें')], correct: 1, why: bi('Rice can carry spores that make toxin in the danger zone; reheating does not remove it.', 'चावल में बीजाणु डेंजर ज़ोन में विष बनाते हैं; दोबारा गरम करने से वह नहीं हटता।'), scene: '🍚' },
  { q: bi('Which is a good larder (cold-food section) practice?', 'लार्डर (ठंडे भोजन विभाग) की अच्छी आदत कौन-सी है?'), options: [bi('Raw and cooked foods on separate shelves, cooked on top, all labelled and dated', 'कच्चा व पका अलग शेल्फ़ पर, पका ऊपर, सब पर लेबल व तिथि'), bi('Mix everything for easy reach', 'आसानी हेतु सब मिलाकर रखें'), bi('Leave food uncovered to cool', 'ठंडा होने हेतु बिना ढके रखें')], correct: 0, why: bi('Separation, labels and dates prevent cross-contamination and waste.', 'अलगाव, लेबल व तिथि संदूषण व बर्बादी रोकते हैं।'), scene: '🧊' },
];
const LEDGER: NQ[] = [
  { q: bi('Stock book — Flour: opening 20 kg, received 10 kg, issued 14 kg. What is the closing stock?', 'स्टॉक बुक — आटा: शुरुआती 20 किग्रा, प्राप्त 10 किग्रा, जारी 14 किग्रा। अंतिम स्टॉक क्या है?'), unit: 'kg', answer: 16, tol: 0.1, why: bi('Closing = opening + received − issued = 20 + 10 − 14 = 16 kg.', 'अंतिम = शुरुआती + प्राप्त − जारी = 20 + 10 − 14 = 16 किग्रा।'), hint: bi('20 + 10 − 14.', '20 + 10 − 14।') },
  { q: bi('Cooking oil: opening 12 L, received 0 L, issued 5 L. Closing stock?', 'खाना पकाने का तेल: शुरुआती 12 ली, प्राप्त 0 ली, जारी 5 ली। अंतिम स्टॉक?'), unit: 'L', answer: 7, tol: 0.1, why: bi('12 + 0 − 5 = 7 L.', '12 + 0 − 5 = 7 ली।'), hint: bi('12 + 0 − 5.', '12 + 0 − 5।') },
  { q: bi('Rice: opening 25 kg, received 15 kg, issued 30 kg. Closing stock?', 'चावल: शुरुआती 25 किग्रा, प्राप्त 15 किग्रा, जारी 30 किग्रा। अंतिम स्टॉक?'), unit: 'kg', answer: 10, tol: 0.1, why: bi('25 + 15 − 30 = 10 kg.', '25 + 15 − 30 = 10 किग्रा।'), hint: bi('25 + 15 − 30.', '25 + 15 − 30।') },
];
const REORDER: ChoiceQ[] = [
  { q: bi('Minimum stock levels are: flour 10 kg, oil 5 L, rice 12 kg. Which item must be re-ordered now?', 'न्यूनतम स्टॉक स्तर: आटा 10 किग्रा, तेल 5 ली, चावल 12 किग्रा। अभी किसका पुनः ऑर्डर देना है?'), options: [bi('Flour (16 kg)', 'आटा (16 किग्रा)'), bi('Oil (7 L)', 'तेल (7 ली)'), bi('Rice (10 kg)', 'चावल (10 किग्रा)')], correct: 2, why: bi('Rice (10 kg) has fallen below its minimum of 12 kg — re-order it.', 'चावल (10 किग्रा) अपने न्यूनतम 12 किग्रा से नीचे है — पुनः ऑर्डर दें।'), scene: '📦' },
];
const WASH: OrderStep[] = [
  { id: 'a1', emoji: '🥄', label: bi('Scrape off food into the wet-waste bin', 'भोजन खुरचकर गीले कचरे में डालें'), why: bi('Remove food first so the water stays clean.', 'पहले भोजन हटाएँ ताकि पानी साफ़ रहे।') },
  { id: 'a2', emoji: '🚿', label: bi('Pre-rinse the trays and moulds', 'ट्रे व साँचे पहले धो लें'), why: bi('A pre-rinse removes loose residue.', 'प्री-रिंस ढीला अवशेष हटाता है।') },
  { id: 'a3', emoji: '🧼', label: bi('Wash in hot water with detergent', 'गरम पानी व डिटर्जेंट में धोएँ'), why: bi('Hot detergent water removes grease.', 'गरम डिटर्जेंट पानी चिकनाई हटाता है।') },
  { id: 'a4', emoji: '💧', label: bi('Rinse in clean hot water', 'साफ़ गरम पानी से खँगालें'), why: bi('Rinsing removes the detergent.', 'खँगालने से डिटर्जेंट हटता है।') },
  { id: 'a5', emoji: '♨️', label: bi('Sanitise or give a final hot rinse', 'सैनिटाइज़ करें या अंतिम गरम खँगाल दें'), why: bi('Sanitising kills remaining germs.', 'सैनिटाइज़ करने से बचे जीवाणु मरते हैं।') },
  { id: 'a6', emoji: '🗄️', label: bi('Air-dry on a rack and store clean', 'जाली पर हवा में सुखाएँ और साफ़ रखें'), why: bi('Air-drying avoids dirty cloths.', 'हवा में सुखाने से गंदे कपड़े से बचाव होता है।') },
];

function Menu({ run, onDone, onNextTab }: { run: Run; onDone: () => void; onNextTab?: () => void }) {
  const L = useLang();
  const [sub, setSub] = useState<'m' | 'c' | 's'>('m');
  const { d, mark } = useSubDone(['m', 'c', 's'], onDone);

  return (
    <div className="space-y-4">
      <SubTabs
        accent={T.accent}
        done={d}
        value={sub}
        onChange={(id) => setSub(id as 'm' | 'c' | 's')}
        tabs={[
          { id: 'm', label: L('Menu planning', 'मेन्यू योजना') },
          { id: 'c', label: L('Indent & costing', 'इंडेंट व लागत') },
          { id: 's', label: L('Purchase spec', 'क्रय विनिर्देश') },
        ]}
      >
        {{
          m: <MenuPlan run={run} onDone={mark('m')} onProceed={() => setSub('c')} />,
          c: <NumQ qs={COST} run={run} points={6} onDone={mark('c')} onProceed={() => setSub('s')} />,
          s: (
            <div className="space-y-3">
              <ChoiceTask qs={SPEC} run={run} accent={T.accent} points={5} onDone={mark('s')} />
              {d.s && onNextTab && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 font-bold">
                  <span>✓ {L('Menu & Costing completed! Advance to Safe Kitchen.', 'मेन्यू व लागत पूर्ण! सुरक्षित रसोई पर आगे बढ़ें।')}</span>
                  <button
                    onClick={() => { playClickSound('click'); onNextTab(); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs active:scale-95"
                  >
                    {L('Next: 2. Safe Kitchen →', 'अगला: 2. सुरक्षित रसोई →')}
                  </button>
                </div>
              )}
            </div>
          ),
        }}
      </SubTabs>
    </div>
  );
}

function Safe({ run, onDone, onNextTab }: { run: Run; onDone: () => void; onNextTab?: () => void }) {
  const L = useLang();
  const [sub, setSub] = useState<'b' | 'k' | 'e' | 'x'>('b');
  const { d, mark } = useSubDone(['b', 'k', 'e', 'x'], onDone);

  return (
    <div className="space-y-4">
      <SubTabs
        accent={T.accent}
        done={d}
        value={sub}
        onChange={(id) => setSub(id as 'b' | 'k' | 'e' | 'x')}
        tabs={[
          { id: 'b', label: L('Waste bins', 'कचरा डिब्बे') },
          { id: 'k', label: L('First-aid kit', 'फ़र्स्ट-एड किट') },
          { id: 'e', label: L('Evacuation', 'निकासी') },
          { id: 'x', label: L('Exits', 'निकास') },
        ]}
      >
        {{
          b: (
            <div className="space-y-3">
              <MatchTask items={BIN_I} zones={BIN_Z} run={run} accent={T.accent} points={2} cols={3} onDone={mark('b')} />
              {d.b && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => { playClickSound('click'); setSub('k'); }}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs"
                  >
                    {L('Next: First-aid Kit →', 'अगला: फ़र्स्ट-एड किट →')}
                  </button>
                </div>
              )}
            </div>
          ),
          k: (
            <div className="space-y-3">
              <MatchTask items={KIT_I} zones={KIT_Z} run={run} accent={T.accent} points={2} cols={2} onDone={mark('k')} />
              {d.k && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => { playClickSound('click'); setSub('e'); }}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs"
                  >
                    {L('Next: Evacuation Steps →', 'अगला: निकासी चरण →')}
                  </button>
                </div>
              )}
            </div>
          ),
          e: (
            <div className="space-y-3">
              <OrderTask steps={EVAC} run={run} accent={T.accent} points={3} onDone={mark('e')} />
              {d.e && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => { playClickSound('click'); setSub('x'); }}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs"
                  >
                    {L('Next: Emergency Exits →', 'अगला: आपात निकास →')}
                  </button>
                </div>
              )}
            </div>
          ),
          x: (
            <div className="space-y-3">
              <ChoiceTask qs={EXITQ} run={run} accent={T.accent} points={5} onDone={mark('x')} />
              {d.x && onNextTab && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 font-bold">
                  <span>✓ {L('Safe Kitchen protocol verified! Advance to Larder & Stewarding.', 'सुरक्षित रसोई प्रोटोकॉल सत्यापित! लार्डर व स्टीवर्डिंग पर बढ़ें।')}</span>
                  <button
                    onClick={() => { playClickSound('click'); onNextTab(); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs active:scale-95"
                  >
                    {L('Next: 3. Larder & Stewarding →', 'अगला: 3. लार्डर व स्टीवर्डिंग →')}
                  </button>
                </div>
              )}
            </div>
          ),
        }}
      </SubTabs>
    </div>
  );
}

function Larder({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const [sub, setSub] = useState<'r' | 'l' | 'o' | 'w'>('r');
  const { d, mark } = useSubDone(['r', 'l', 'o', 'w'], onDone);

  return (
    <div className="space-y-4">
      <SubTabs
        accent={T.accent}
        done={d}
        value={sub}
        onChange={(id) => setSub(id as 'r' | 'l' | 'o' | 'w')}
        tabs={[
          { id: 'r', label: L('Réchauffé & larder', 'रेशॉफ़े व लार्डर') },
          { id: 'l', label: L('Stock book', 'स्टॉक बुक') },
          { id: 'o', label: L('Re-order', 'पुनः ऑर्डर') },
          { id: 'w', label: L('Stewarding', 'स्टीवर्डिंग') },
        ]}
      >
        {{
          r: (
            <div className="space-y-3">
              <ChoiceTask qs={RECH} run={run} accent={T.accent} points={5} onDone={mark('r')} />
              {d.r && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => { playClickSound('click'); setSub('l'); }}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs"
                  >
                    {L('Next: Stock Book Ledger →', 'अगला: स्टॉक बुक लेजर →')}
                  </button>
                </div>
              )}
            </div>
          ),
          l: <NumQ qs={LEDGER} run={run} points={6} onDone={mark('l')} onProceed={() => setSub('o')} />,
          o: (
            <div className="space-y-3">
              <ChoiceTask qs={REORDER} run={run} accent={T.accent} points={6} onDone={mark('o')} />
              {d.o && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => { playClickSound('click'); setSub('w'); }}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs"
                  >
                    {L('Next: Stewarding & Wash-up →', 'अगला: स्टीवर्डिंग व धुलाई →')}
                  </button>
                </div>
              )}
            </div>
          ),
          w: (
            <div className="space-y-3">
              <OrderTask steps={WASH} run={run} accent={T.accent} points={3} onDone={mark('w')} />
              {d.w && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center justify-between text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 font-bold">
                  <span>🎉 {L('All kitchen management protocols mastered! Check your final scorecard.', 'सभी रसोई प्रबंधन प्रोटोकॉल में महारत हासिल! अपना स्कोरकार्ड देखें।')}</span>
                </div>
              )}
            </div>
          ),
        }}
      </SubTabs>
    </div>
  );
}

export default function KitchenManagerSim() {
  const L = useLang();
  const run = useRun('m2KitchenManager', 44 + 61 + 57);
  const [tab, setTab] = useState<'menu' | 'safe' | 'larder'>('menu');
  const ds = useDoneSet(3, run);
  const [key, setKey] = useState(0);

  const replay = () => {
    run.reset();
    ds.reset();
    setTab('menu');
    setKey((k) => k + 1);
  };

  return (
    <FoodShell
      accent={T.accent}
      Icon={T.Icon}
      title={L('Kitchen Management Simulator', 'किचन प्रबंधन सिम्युलेटर')}
      subtitle={L('Plan a menu, work out quantities and costs, keep the kitchen safe and control the larder and wash-up.', 'मेन्यू बनाएँ, मात्रा व लागत निकालें, रसोई सुरक्षित रखें और लार्डर व सफ़ाई सँभालें।')}
    >
      {run.done ? (
        <FinishCard
          run={run}
          accent={T.accent}
          onReplay={replay}
          summary={[
            L('Menu, indent, portion and food-cost calculations', 'मेन्यू, इंडेंट, मात्रा व फ़ूड-कॉस्ट गणना'),
            L('Waste bins, first-aid kit and evacuation', 'कचरा डिब्बे, फ़र्स्ट-एड किट व निकासी'),
            L('Réchauffé rules, stock control and stewarding', 'रेशॉफ़े नियम, स्टॉक नियंत्रण व स्टीवर्डिंग'),
          ]}
        />
      ) : (
        <>
          <ChefBrief
            station={L('Executive Chef Office & Kitchen Stewarding Control', 'कार्यकारी शेफ़ कार्यालय व किचन स्टीवर्डिंग नियंत्रण')}
            role={L('Assistant Kitchen Manager & Food Controller', 'सहायक रसोई प्रबंधक व खाद्य नियंत्रक')}
            task={L('Engineer a balanced 3-course banquet menu, calculate food cost percentages and indent quantities, enforce FIFO (First In, First Out) storage rules, and organize waste segregation.', 'संतुलित 3-कोर्स बैंक्वेट मेन्यू तैयार करें, खाद्य लागत प्रतिशत व मांग मात्रा निकालें, FIFO भंडारण नियम लागू करें, और कचरा पृथक्करण व्यवस्थित करें।')}
            standard={L('Grade 10 CBSE Food Production · Block 1 & 10', 'कक्षा 10 फ़ूड प्रोडक्शन · ब्लॉक 1 व 10')}
          />
          <ProTip
            title={L('F&B Cost Control & FIFO Rule', 'खाद्य लागत नियंत्रण व FIFO नियम')}
            text={L('Food Cost % = (Cost of Raw Ingredients ÷ Selling Price) × 100. Commercial hotels target between 28% and 35%. FIFO (First In, First Out) ensures older batches are moved to the front and used first so perishables never expire on the shelves.', 'खाद्य लागत % = (कच्ची सामग्री की लागत ÷ बिक्री मूल्य) × 100। होटल 28% से 35% का लक्ष्य रखते हैं। FIFO सुनिश्चित करता है कि पुराना स्टॉक आगे लाकर पहले इस्तेमाल हो ताकि सामग्री खराब न हो।')}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs2
              accent={T.accent}
              value={tab}
              onChange={setTab}
              tabs={[
                { id: 'menu', label: L('1. Menu & Costing', '1. मेन्यू व लागत'), done: ds.done.has('menu') },
                { id: 'safe', label: L('2. Safe Kitchen', '2. सुरक्षित रसोई'), done: ds.done.has('safe') },
                { id: 'larder', label: L('3. Larder & Stewarding', '3. लार्डर व स्टीवर्डिंग'), done: ds.done.has('larder') },
              ]}
            />
            <Hud run={run} accent={T.accent} />
          </div>
          <div key={key}>
            <div style={{ display: tab === 'menu' ? 'block' : 'none' }}>
              <Menu run={run} onDone={() => ds.mark('menu')} onNextTab={() => setTab('safe')} />
            </div>
            <div style={{ display: tab === 'safe' ? 'block' : 'none' }}>
              <Safe run={run} onDone={() => ds.mark('safe')} onNextTab={() => setTab('larder')} />
            </div>
            <div style={{ display: tab === 'larder' ? 'block' : 'none' }}>
              <Larder run={run} onDone={() => ds.mark('larder')} />
            </div>
          </div>
        </>
      )}
    </FoodShell>
  );
}
