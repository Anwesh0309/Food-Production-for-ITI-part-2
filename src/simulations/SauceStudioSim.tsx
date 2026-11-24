import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FOOD2_THEMES } from '@/data/themes';
import { playClickSound } from '@/utils/sound';
import { Card, ChefBrief, FinishCard, FoodShell, Hud, HintButton, ProTip, Tabs2, Toast, useLang, useRun, useToast, type Run } from '@/components/kit';
import { MatchTask, OrderTask, useDoneSet, type Bi2, type MatchItem, type MatchZone, type OrderStep } from '@/components/tasks';

const T = FOOD2_THEMES.sauce;
const bi = (en: string, hi: string): Bi2 => ({ en, hi });

const rouxColor = (m: number) => (m < 2 ? '#fdf6dc' : m < 4 ? '#f6e3a3' : m < 6 ? '#e2b857' : m < 8 ? '#b9772a' : '#7a4a1b');
const rouxName = (m: number): 'white' | 'blonde' | 'brown' | 'raw' => (m < 1 ? 'raw' : m <= 3 ? 'white' : m <= 6 ? 'blonde' : m >= 8 ? 'brown' : 'blonde');
const TARGETS = [
  { id: 'bechamel', sauce: bi('Béchamel (white sauce with milk)', 'बेशमेल (दूध वाला सफ़ेद सॉस)'), need: 'white' as const, range: bi('white roux: 1–3 min, no colour', 'सफ़ेद रू: 1–3 मिनट, बिना रंग'), thick: bi('Strongest thickening power', 'सबसे ज़्यादा गाढ़ा करने की क्षमता') },
  { id: 'veloute', sauce: bi('Velouté (white-stock sauce)', 'वेलूते (सफ़ेद स्टॉक वाला सॉस)'), need: 'blonde' as const, range: bi('blonde roux: 4–6 min, pale gold', 'ब्लॉन्ड रू: 4–6 मिनट, हल्का सुनहरा'), thick: bi('Good thickening, light nutty flavour', 'अच्छा गाढ़ापन, हल्का मेवे-सा स्वाद') },
  { id: 'espagnole', sauce: bi('Espagnole (brown sauce)', 'एस्पान्योल (भूरा सॉस)'), need: 'brown' as const, range: bi('brown roux: 8+ min, nutty brown', 'भूरा रू: 8+ मिनट, मेवे-सा भूरा'), thick: bi('Weakest thickening, richest flavour', 'सबसे कम गाढ़ा, सबसे गहरा स्वाद') },
];
const LUMPS = Array.from({ length: 24 }, (_, i) => ({ x: 40 + ((i * 53) % 120), y: 58 + ((i * 29) % 34), r: 3 + (i % 3) }));

function RouxStudio({ run, onDone, onNext }: { run: Run; onDone: () => void; onNext?: () => void }) {
  const L = useLang();
  const [ti, setTi] = useState(0);
  const [mins, setMins] = useState(2);
  const [stage, setStage] = useState<'roux' | 'pour'>('roux');
  const [passed, setPassed] = useState([false, false, false]);
  const [pour, setPour] = useState(3);
  const [whisk, setWhisk] = useState(5);
  const [smooth, setSmooth] = useState(false);
  const { toast, say } = useToast();
  const tg = TARGETS[ti];
  const lumps = Math.max(0, Math.min(24, (pour - whisk - 1) * 4));
  useEffect(() => { if (passed.every(Boolean) && smooth) onDone(); /* eslint-disable-next-line */ }, [passed, smooth]);

  const checkRoux = () => {
    const n = rouxName(mins);
    if (n === tg.need) {
      run.add(8); setPassed((p) => p.map((v, i) => (i === ti ? true : v)));
      playClickSound('success');
      say('ok', L(`Right! ${tg.range.en}. ${tg.thick.en}.`, `सही! ${tg.range.hi}। ${tg.thick.hi}।`));
    } else {
      run.miss();
      playClickSound('error');
      say('bad', n === 'raw' ? L('The flour is still raw — cook the fat and flour together a little first.', 'आटा अभी कच्चा है — पहले घी/मक्खन व आटा थोड़ा भूनें।') : L(`This is a ${n} roux, but ${tg.sauce.en.split(' (')[0]} needs a ${tg.need} roux (${tg.range.en}).`, `यह ${n} रू है, पर ${tg.sauce.hi.split(' (')[0]} को ${tg.need} रू चाहिए (${tg.range.hi})।`));
    }
  };

  const taste = () => {
    if (smooth) return;
    if (lumps === 0 && whisk >= 3) {
      run.add(12); setSmooth(true);
      playClickSound('success');
      say('ok', L('Silky smooth! Add liquid slowly and whisk constantly — the roux grains separate and swell evenly.', 'बिल्कुल मुलायम! तरल धीरे-धीरे डालें और लगातार फेंटें — रू के कण अलग होकर बराबर फूलते हैं।'));
    } else if (lumps > 0) {
      run.miss(); playClickSound('error');
      say('bad', L(`Lumpy (${lumps} lumps)! You poured faster than you whisked. Pour slowly and whisk faster.`, `गुठलियाँ (${lumps})! आपने फेंटने से तेज़ डाला। धीरे डालें और तेज़ फेंटें।`));
    } else {
      run.miss(); playClickSound('error');
      say('bad', L('Whisk faster — a slow whisk lets the sauce stick and scorch.', 'तेज़ फेंटें — धीमे फेंटने से सॉस चिपककर जल जाता है।'));
    }
  };

  const hint = () => { run.hint(); say('info', stage === 'roux' ? L(`Aim for: ${tg.range.en}.`, `लक्ष्य: ${tg.range.hi}।`) : L('Keep pouring speed at 3 or lower and whisk speed at 4 or higher.', 'उड़ेलने की गति 3 या कम और फेंटने की गति 4 या अधिक रखें।')); };
  const allRoux = passed.every(Boolean);

  return (
    <div className="space-y-3" data-testid="roux-studio">
      <ChefBrief
        station={L('Classical Saucier Station (Sauce Cook)', 'शास्त्रीय सॉसियर स्टेशन (सॉस रसोइया)')}
        role={L('Demi Chef de Partie', 'डेमी शेफ़ द पार्टी')}
        task={L('Prepare the 3 classical hot roux bases (White for Béchamel, Blond for Velouté, Brown for Espagnole), then whisk in liquid at the proper rate to achieve a mirror-smooth nappe consistency with zero flour lumps.', '3 शास्त्रीय गर्म रू आधार तैयार करें (बेशमेल हेतु सफ़ेद, वेलूते हेतु ब्लॉन्ड, एस्पान्योल हेतु भूरा), फिर बिना गुठली के बिल्कुल मुलायम नैप गाढ़ापन पाने के लिए सही गति से तरल मिलाएँ।')}
        standard={L('Grade 10 CBSE Food Production · Mother Sauces & Derivatives', 'कक्षा 10 फ़ूड प्रोडक्शन · मुख्य सॉस व व्युत्पन्न')}
      />
      <ProTip
        title={L('Roux & Lumping Prevention Rule', 'रू व गुठली रोकथाम नियम')}
        text={L('Equal fat and flour by weight (1:1). White roux (1–3 min) has the highest starch thickening power. When adding liquid, pour slowly and whisk at speed 4 or higher so starch granules disperse evenly rather than clumping into lumps!', 'वज़न में बराबर वसा व आटा (1:1)। सफ़ेद रू (1–3 मिनट) में सबसे अधिक गाढ़ा करने की शक्ति होती है। तरल मिलाते समय धीरे डालें और गति 4 या अधिक पर फेंटें ताकि स्टार्च कण गुठली बनने के बजाय बराबर फैलें!')}
      />
      <div className="flex gap-1.5">
        <button onClick={() => setStage('roux')} data-stage="roux" className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${stage === 'roux' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={stage === 'roux' ? { background: T.accent } : undefined}>🥄 {L('Cook the roux', 'रू पकाएँ')}{allRoux ? ' ✓' : ''}</button>
        <button onClick={() => allRoux && setStage('pour')} disabled={!allRoux} data-stage="pour" className={`px-3 py-1.5 rounded-lg text-xs font-semibold border disabled:opacity-40 ${stage === 'pour' ? 'text-white' : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-stone-300'}`} style={stage === 'pour' ? { background: T.accent } : undefined}>🥛 {L('Add the liquid', 'तरल मिलाएँ')}{smooth ? ' ✓' : ''}</button>
      </div>
      {stage === 'roux' ? (
        <>
          <div className="flex gap-1.5 flex-wrap">{TARGETS.map((x, i) => <button key={x.id} data-target={x.id} onClick={() => { setTi(i); setMins(i === 0 ? 2 : i === 1 ? 5 : 9); say('info', null); }} className={`px-3 py-1.5 rounded-lg border text-xs ${ti === i ? 'font-bold border-2' : ''}`} style={ti === i ? { borderColor: T.accent } : undefined}>{L(x.sauce.en.split(' (')[0], x.sauce.hi.split(' (')[0])}{passed[i] ? ' ✓' : ''}</button>)}</div>
          <Card><p className="text-xs"><b>{L('Task', 'कार्य')}:</b> {L(`Cook a roux (equal fat and flour) for ${tg.sauce.en}.`, `${tg.sauce.hi} के लिए रू (बराबर घी/मक्खन व आटा) पकाएँ।`)}</p></Card>
          <div className="rounded-2xl p-3 bg-stone-100 dark:bg-slate-800 text-center">
            <svg viewBox="0 0 200 110" className="w-full max-w-xs mx-auto" data-testid="roux-pan">
              <ellipse cx="100" cy="70" rx="85" ry="28" fill="#475569" /><ellipse cx="100" cy="66" rx="76" ry="22" fill={rouxColor(mins)} data-colour={rouxColor(mins)} style={{ transition: 'fill .4s' }} />
              {mins > 0 && [0, 1, 2, 3, 4].map((i) => <motion.circle key={i} cx={60 + i * 22} cy={66} r="3" fill="#fff" initial={{ y: 0, opacity: 0.6 }} animate={{ y: [0, -6, 0], opacity: [0.6, 0.1, 0.6] }} transition={{ duration: 0.8 + i * 0.1, repeat: Infinity }} />)}
              <rect x="170" y="62" width="28" height="8" rx="4" fill="#334155" />
            </svg>
            <p className="text-xs font-mono mt-1 font-semibold" data-testid="roux-state">{mins} min · {L(rouxName(mins) === 'raw' ? 'raw flour' : `${rouxName(mins)} roux`, rouxName(mins) === 'raw' ? 'कच्चा आटा' : `${rouxName(mins)} रू`)}</p>
          </div>
          <label className="block text-xs font-semibold">{L('Cooking time', 'पकाने का समय')}: <span className="font-mono">{mins} {L('min', 'मिनट')}</span>
            <input type="range" min={0} max={12} step={0.5} value={mins} onChange={(e) => setMins(+e.target.value)} data-slider="roux" className="w-full" style={{ accentColor: T.accent }} /></label>
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={checkRoux} disabled={passed[ti]} data-testid="roux-check" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>{L('Use this roux', 'यह रू इस्तेमाल करें')}</button>
            <HintButton onHint={hint} accent={T.accent} />
            {passed[ti] && ti < TARGETS.length - 1 && (
              <button onClick={() => { setTi(ti + 1); setMins(ti === 0 ? 5 : 9); say('info', null); }} className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
                {L('Next roux', 'अगला रू')} →
              </button>
            )}
          </div>
          {allRoux && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-green-900 dark:text-green-200">✅ {L('All three classical roux types cooked perfectly!', 'तीनों शास्त्रीय रू प्रकार सही पके!')}</p>
              </div>
              <button onClick={() => setStage('pour')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                {L('Proceed to Whisk Liquid', 'तरल मिलाकर फेंटें')} →
              </button>
            </motion.div>
          )}
        </>
      ) : (
        <>
          <Card><p className="text-xs">{L('Add cold milk to the hot roux for béchamel. Choose how fast to pour and how fast to whisk — then taste.', 'बेशमेल हेतु गरम रू में ठंडा दूध डालें। कितना तेज़ उड़ेलें और कितना तेज़ फेंटें तय करें — फिर चखें।')}</p></Card>
          <div className="rounded-2xl p-3 bg-stone-100 dark:bg-slate-800 text-center">
            <svg viewBox="0 0 200 110" className="w-full max-w-xs mx-auto" data-testid="sauce-pan">
              <ellipse cx="100" cy="70" rx="85" ry="28" fill="#475569" /><ellipse cx="100" cy="66" rx="76" ry="22" fill="#fffbeb" />
              {LUMPS.slice(0, lumps).map((l, i) => <circle key={i} cx={l.x + 10} cy={l.y - 6} r={l.r} fill="#e5d3a1" stroke="#c2a766" />)}
              <motion.text x="100" y="26" fontSize="26" textAnchor="middle" animate={{ rotate: [0, 18, -18, 0] }} transition={{ duration: Math.max(0.2, 1.6 - whisk * 0.15), repeat: Infinity }} style={{ transformOrigin: '100px 20px' }}>🥄</motion.text>
              <rect x="94" y="0" width={2 + pour * 0.6} height="36" fill="#f8fafc" opacity="0.9" />
            </svg>
            <p className="text-xs font-mono font-semibold" data-testid="lump-count">{lumps === 0 ? `✨ ${L('smooth & velvety', 'मुलायम व मखमली')}` : `⚠️ ${lumps} ${L('lumps formed', 'गुठलियाँ बनीं')}`}</p>
          </div>
          <label className="block text-xs font-semibold">{L('Pouring speed', 'उड़ेलने की गति')}: <span className="font-mono">{pour}</span><input type="range" min={1} max={10} value={pour} onChange={(e) => setPour(+e.target.value)} data-slider="pour" disabled={smooth} className="w-full" style={{ accentColor: T.accent }} /></label>
          <label className="block text-xs font-semibold">{L('Whisking speed', 'फेंटने की गति')}: <span className="font-mono">{whisk}</span><input type="range" min={1} max={10} value={whisk} onChange={(e) => setWhisk(+e.target.value)} data-slider="whisk" disabled={smooth} className="w-full" style={{ accentColor: T.accent }} /></label>
          <div className="flex gap-2 items-center"><button onClick={taste} disabled={smooth} data-testid="taste-btn" className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 shadow-sm transition-all active:scale-95" style={{ background: T.accent }}>👅 {L('Taste the sauce', 'सॉस चखें')}</button><HintButton onHint={hint} accent={T.accent} /></div>
          {smooth && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-green-900 dark:text-green-200">🎉 {L('Velvety lump-free sauce mastered!', 'मुलायम गुठली-रहित सॉस में महारत!')}</p>
              </div>
              <button onClick={onNext} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                {L('Next: Mother Sauces', 'अगला: मदर सॉस')} →
              </button>
            </motion.div>
          )}
        </>
      )}
      <Toast {...toast} />
    </div>
  );
}

const MZ: MatchZone[] = [
  { id: 'bech', emoji: '🥛', label: bi('Béchamel', 'बेशमेल'), note: bi('milk + white roux', 'दूध + सफ़ेद रू') },
  { id: 'vel', emoji: '🍗', label: bi('Velouté', 'वेलूते'), note: bi('white stock + blonde roux', 'सफ़ेद स्टॉक + ब्लॉन्ड रू') },
  { id: 'esp', emoji: '🥩', label: bi('Espagnole', 'एस्पान्योल'), note: bi('brown stock + brown roux', 'भूरा स्टॉक + भूरा रू') },
  { id: 'tom', emoji: '🍅', label: bi('Tomato', 'टमाटर'), note: bi('tomatoes + stock', 'टमाटर + स्टॉक') },
  { id: 'hol', emoji: '🧈', label: bi('Hollandaise', 'हॉलैंडेज़'), note: bi('egg yolk + butter emulsion', 'अंडे की ज़र्दी + मक्खन इमल्शन') },
];
const MI: MatchItem[] = [
  { id: 'mornay', cat: 'bech', emoji: '🧀', label: bi('Mornay (add cheese)', 'मोर्ने (चीज़ मिलाएँ)'), why: bi('Mornay = béchamel + grated cheese.', 'मोर्ने = बेशमेल + किसा चीज़।') },
  { id: 'soubise', cat: 'bech', emoji: '🧅', label: bi('Soubise (add onion)', 'सूबीज़ (प्याज़ मिलाएँ)'), why: bi('Soubise = béchamel with cooked onion.', 'सूबीज़ = पके प्याज़ वाला बेशमेल।') },
  { id: 'allemande', cat: 'vel', emoji: '🥚', label: bi('Allemande (yolk + cream)', 'आलमांद (ज़र्दी + क्रीम)'), why: bi('Allemande = velouté finished with egg yolk and cream.', 'आलमांद = वेलूते में अंडे की ज़र्दी व क्रीम।') },
  { id: 'supreme', cat: 'vel', emoji: '🥣', label: bi('Suprême (add cream)', 'सुप्रीम (क्रीम मिलाएँ)'), why: bi('Suprême = chicken velouté with cream.', 'सुप्रीम = क्रीम वाला चिकन वेलूते।') },
  { id: 'demi', cat: 'esp', emoji: '🍖', label: bi('Demi-glace', 'डेमी-ग्लास'), why: bi('Demi-glace = espagnole reduced with brown stock.', 'डेमी-ग्लास = भूरे स्टॉक संग गाढ़ा किया एस्पान्योल।') },
  { id: 'madeira', cat: 'esp', emoji: '🍷', label: bi('Madeira (add wine)', 'मदीरा (वाइन मिलाएँ)'), why: bi('Madeira sauce = demi-glace with Madeira wine.', 'मदीरा सॉस = मदीरा वाइन वाला डेमी-ग्लास।') },
  { id: 'prov', cat: 'tom', emoji: '🧄', label: bi('Provençale (garlic, herbs)', 'प्रोवेंसाल (लहसुन, जड़ी-बूटी)'), why: bi('Provençale is a tomato sauce with garlic and herbs.', 'प्रोवेंसाल लहसुन व जड़ी-बूटी वाला टमाटर सॉस है।') },
  { id: 'bearnaise', cat: 'hol', emoji: '🌿', label: bi('Béarnaise (tarragon)', 'बेयरनेज़ (टैरागन)'), why: bi('Béarnaise = hollandaise with tarragon and shallot.', 'बेयरनेज़ = टैरागन व प्याज़ वाला हॉलैंडेज़।') },
  { id: 'maltaise', cat: 'hol', emoji: '🍊', label: bi('Maltaise (orange)', 'माल्टेज़ (संतरा)'), why: bi('Maltaise = hollandaise with orange juice.', 'माल्टेज़ = संतरे के रस वाला हॉलैंडेज़।') },
  { id: 'mousseline', cat: 'hol', emoji: '☁️', label: bi('Mousseline (whipped cream)', 'मूसलीन (फेंटी क्रीम)'), why: bi('Mousseline = hollandaise lightened with whipped cream.', 'मूसलीन = फेंटी क्रीम से हल्का हॉलैंडेज़।') },
];

const STOCK: OrderStep[] = [
  { id: 's1', emoji: '🦴', label: bi('Roast the bones until deep brown', 'हड्डियों को गहरा भूरा होने तक भूनें'), why: bi('Browning gives a brown stock its colour and flavour.', 'भूनने से भूरे स्टॉक को रंग व स्वाद मिलता है।') },
  { id: 's2', emoji: '🧅', label: bi('Add mirepoix (2:1:1) and tomato purée', 'मिरपुआ (2:1:1) व टमाटर प्यूरी डालें'), why: bi('Mirepoix 2 onion : 1 carrot : 1 celery.', 'मिरपुआ 2 प्याज़ : 1 गाजर : 1 अजवाइन-डंडी।') },
  { id: 's3', emoji: '🚰', label: bi('Cover with cold water', 'ठंडे पानी से ढकें'), why: bi('Starting cold draws flavour out of the bones.', 'ठंडे पानी से शुरू करने पर हड्डियों से स्वाद निकलता है।') },
  { id: 's4', emoji: '🫧', label: bi('Bring slowly to a simmer and skim the scum', 'धीरे उबाल तक लाएँ व झाग छानें'), why: bi('Skimming keeps the stock clear.', 'झाग हटाने से स्टॉक साफ़ रहता है।') },
  { id: 's5', emoji: '⏳', label: bi('Simmer gently for hours — never boil hard', 'घंटों धीमी आँच पर उबालें — तेज़ न उबालें'), why: bi('A hard boil makes stock cloudy.', 'तेज़ उबाल से स्टॉक धुँधला होता है।') },
  { id: 's6', emoji: '🧊', label: bi('Strain and cool quickly through the danger zone', 'छानें व डेंजर ज़ोन से जल्दी ठंडा करें'), why: bi('Cool fast so bacteria do not grow between 5 and 63 °C.', '5–63 °C में जीवाणु न बढ़ें इसलिए जल्दी ठंडा करें।') },
];
const BUT: { z: MatchZone[]; i: MatchItem[] } = {
  z: [
    { id: 'mait', emoji: '🧈', label: bi("Maître d'hôtel butter", 'मैत्र-द-ओतेल बटर') },
    { id: 'garl', emoji: '🧄', label: bi('Garlic butter', 'गार्लिक बटर') },
    { id: 'anch', emoji: '🐟', label: bi('Anchovy butter', 'एंकोवी बटर') },
  ],
  i: [
    { id: 'b1', cat: 'mait', emoji: '🌿', label: bi('Chopped parsley', 'कटी पार्सले'), why: bi("Maître d'hôtel butter = butter + parsley + lemon juice.", 'मैत्र-द-ओतेल बटर = मक्खन + पार्सले + नींबू रस।') },
    { id: 'b2', cat: 'mait', emoji: '🍋', label: bi('Lemon juice', 'नींबू रस'), why: bi('Lemon juice brightens the parsley butter.', 'नींबू रस पार्सले बटर को ताज़गी देता है।') },
    { id: 'b3', cat: 'garl', emoji: '🧄', label: bi('Crushed garlic + parsley', 'कुचला लहसुन + पार्सले'), why: bi('Garlic butter = butter + garlic + parsley.', 'गार्लिक बटर = मक्खन + लहसुन + पार्सले।') },
    { id: 'b4', cat: 'garl', emoji: '🥖', label: bi('Spread on bread for garlic bread', 'गार्लिक ब्रेड हेतु ब्रेड पर लगाएँ'), why: bi('Garlic butter is the classic garlic bread spread.', 'गार्लिक बटर गार्लिक ब्रेड का क्लासिक लेप है।') },
    { id: 'b5', cat: 'anch', emoji: '🐟', label: bi('Anchovy paste', 'एंकोवी पेस्ट'), why: bi('Anchovy butter = butter + anchovy paste.', 'एंकोवी बटर = मक्खन + एंकोवी पेस्ट।') },
    { id: 'b6', cat: 'anch', emoji: '🥩', label: bi('Served on grilled fish or steak', 'ग्रिल्ड मछली या स्टेक पर परोसें'), why: bi('Anchovy butter melts over grilled fish or steak.', 'एंकोवी बटर ग्रिल्ड मछली/स्टेक पर पिघलकर चढ़ता है।') },
  ],
};
const SOUPZ: MatchZone[] = [
  { id: 'clear', emoji: '🥣', label: bi('Clear soup', 'साफ़ सूप') }, { id: 'puree', emoji: '🥕', label: bi('Purée soup', 'प्यूरी सूप') },
  { id: 'cream', emoji: '🥛', label: bi('Cream soup', 'क्रीम सूप') }, { id: 'cold', emoji: '🧊', label: bi('Cold soup', 'ठंडा सूप') },
];
const SOUPI: MatchItem[] = [
  { id: 'consomme', cat: 'clear', emoji: '🥣', label: bi('Consommé', 'कॉन्सोमे'), why: bi('Consommé is a clarified, crystal-clear soup.', 'कॉन्सोमे छना हुआ, पारदर्शी सूप है।') },
  { id: 'chickclear', cat: 'clear', emoji: '🍗', label: bi('Clear chicken broth', 'साफ़ चिकन शोरबा'), why: bi('A thin, clear broth with no thickener.', 'बिना गाढ़ेपन का पतला साफ़ शोरबा।') },
  { id: 'lentil', cat: 'puree', emoji: '🫘', label: bi('Lentil soup (puréed)', 'दाल सूप (प्यूरी)'), why: bi('Purée soups are thickened by the blended vegetable or pulse itself.', 'प्यूरी सूप में सब्ज़ी/दाल को पीसकर गाढ़ापन आता है।') },
  { id: 'carrotp', cat: 'puree', emoji: '🥕', label: bi('Carrot purée soup', 'गाजर प्यूरी सूप'), why: bi('Cooked carrot is blended to thicken it.', 'पकी गाजर पीसकर गाढ़ा किया जाता है।') },
  { id: 'cmush', cat: 'cream', emoji: '🍄', label: bi('Cream of mushroom', 'क्रीम ऑफ़ मशरूम'), why: bi('Cream soups are finished with cream or béchamel.', 'क्रीम सूप में क्रीम या बेशमेल मिलाते हैं।') },
  { id: 'cspin', cat: 'cream', emoji: '🥬', label: bi('Cream of spinach', 'क्रीम ऑफ़ पालक'), why: bi('Spinach soup enriched with cream.', 'क्रीम से समृद्ध पालक सूप।') },
  { id: 'gazp', cat: 'cold', emoji: '🍅', label: bi('Gazpacho', 'गास्पाचो'), why: bi('Gazpacho is a Spanish cold tomato soup.', 'गास्पाचो स्पेन का ठंडा टमाटर सूप है।') },
  { id: 'vichy', cat: 'cold', emoji: '🥔', label: bi('Vichyssoise', 'विशीस्वा'), why: bi('Vichyssoise is a cold potato-and-leek cream soup.', 'विशीस्वा आलू-लीक का ठंडा क्रीम सूप है।') },
];
const NATZ: MatchZone[] = ['india', 'italy', 'russia', 'france'].map((id) => ({ id, emoji: { india: '🇮🇳', italy: '🇮🇹', russia: '🇷🇺', france: '🇫🇷' }[id], label: { india: bi('India', 'भारत'), italy: bi('Italy', 'इटली'), russia: bi('Russia', 'रूस'), france: bi('France', 'फ़्रांस') }[id]! }));
const NATI: MatchItem[] = [
  { id: 'mull', cat: 'india', emoji: '🍛', label: bi('Mulligatawny', 'मुलिगटॉनी'), why: bi('Mulligatawny is a spiced Indian-origin lentil soup.', 'मुलिगटॉनी भारतीय मूल का मसालेदार दाल सूप है।') },
  { id: 'mine', cat: 'italy', emoji: '🥬', label: bi('Minestrone', 'मिनेस्त्रोन'), why: bi('Minestrone is Italy’s thick vegetable-and-pasta soup.', 'मिनेस्त्रोन इटली का सब्ज़ी-पास्ता वाला गाढ़ा सूप है।') },
  { id: 'bor', cat: 'russia', emoji: '🟣', label: bi('Borscht (beetroot)', 'बोर्श्च (चुकंदर)'), why: bi('Borscht is a beetroot soup from Russia/Eastern Europe.', 'बोर्श्च रूस/पूर्वी यूरोप का चुकंदर सूप है।') },
  { id: 'fos', cat: 'france', emoji: '🧅', label: bi('French onion soup', 'फ़्रेंच ऑनियन सूप'), why: bi('French onion soup is topped with bread and melted cheese.', 'फ़्रेंच ऑनियन सूप पर ब्रेड व पिघला चीज़ होता है।') },
];

function Pair({ a, b }: { a: React.ReactNode; b: React.ReactNode }) { return <div className="space-y-6">{a}{b}</div>; }

export default function SauceStudioSim() {
  const L = useLang();
  const run = useRun('m2SauceStudio', 36 + 20 + 18 + 12 + 16 + 8);
  const [tab, setTab] = useState<'roux' | 'mother' | 'stock' | 'soup'>('roux');
  const ds = useDoneSet(4, run);
  const [sub, setSub] = useState<Record<string, boolean>>({});
  const [key, setKey] = useState(0);
  const mk = (k: string) => () => setSub((s) => (s[k] ? s : { ...s, [k]: true }));
  useEffect(() => { if (sub.st && sub.bu) ds.mark('stock'); if (sub.so && sub.na) ds.mark('soup'); /* eslint-disable-next-line */ }, [sub]);
  const replay = () => { run.reset(); ds.reset(); setSub({}); setTab('roux'); setKey((k) => k + 1); };

  return (
    <FoodShell accent={T.accent} Icon={T.Icon} title={L('Stocks, Sauces & Soups Studio', 'स्टॉक, सॉस व सूप स्टूडियो')}
      subtitle={L('Cook roux to the right colour, whisk a smooth sauce, build a stock and sort sauces, butters and soups.', 'रू को सही रंग तक पकाएँ, मुलायम सॉस फेंटें, स्टॉक बनाएँ और सॉस, बटर व सूप छाँटें।')}>
      {run.done ? <FinishCard run={run} accent={T.accent} onReplay={replay} summary={[L('Roux colours matched to sauces; lump-free sauce made', 'रू के रंग सॉस से मिलाए; गुठली-रहित सॉस बनी'), L('5 mother sauces and derivatives', '5 मदर सॉस व उनके व्युत्पन्न'), L('Stock, compound butters and soups', 'स्टॉक, कंपाउंड बटर व सूप')]} /> : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs2 accent={T.accent} value={tab} onChange={setTab} tabs={[
              { id: 'roux', label: L('1. Roux Studio', '1. रू स्टूडियो'), done: ds.done.has('roux') }, { id: 'mother', label: L('2. Mother Sauces', '2. मदर सॉस'), done: ds.done.has('mother') },
              { id: 'stock', label: L('3. Stock & Butter', '3. स्टॉक व बटर'), done: ds.done.has('stock') }, { id: 'soup', label: L('4. Soup Kitchen', '4. सूप किचन'), done: ds.done.has('soup') }]} />
            <Hud run={run} accent={T.accent} />
          </div>
          <div key={key}>
            <div style={{ display: tab === 'roux' ? 'block' : 'none' }}>
              <RouxStudio run={run} onDone={() => ds.mark('roux')} onNext={() => setTab('mother')} />
            </div>
            <div style={{ display: tab === 'mother' ? 'block' : 'none' }}>
              <div className="space-y-3">
                <MatchTask items={MI} zones={MZ} run={run} accent={T.accent} points={2} cols={3} onDone={() => ds.mark('mother')} />
                {ds.done.has('mother') && (
                  <div className="flex justify-end">
                    <button onClick={() => setTab('stock')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                      {L('Next: Stock & Butter', 'अगला: स्टॉक व बटर')} →
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: tab === 'stock' ? 'block' : 'none' }}>
              <div className="space-y-3">
                <Pair a={<div><p className="text-sm font-bold mb-2">🍲 {L('Brown stock — build it in order', 'भूरा स्टॉक — क्रम से बनाएँ')}</p><OrderTask steps={STOCK} run={run} accent={T.accent} points={3} onDone={mk('st')} /></div>}
                  b={<div><p className="text-sm font-bold mb-2">🧈 {L('Compound butters — match flavourings', 'कंपाउंड बटर — स्वाद सामग्री मिलाएँ')}</p><MatchTask items={BUT.i} zones={BUT.z} run={run} accent={T.accent} points={2} onDone={mk('bu')} /></div>} />
                {sub.st && sub.bu && (
                  <div className="flex justify-end">
                    <button onClick={() => setTab('soup')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                      {L('Next: Soup Kitchen', 'अगला: सूप किचन')} →
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: tab === 'soup' ? 'block' : 'none' }}>
              <Pair a={<div><p className="text-sm font-bold mb-2">🥣 {L('Classify the soups', 'सूपों को वर्गीकृत करें')}</p><MatchTask items={SOUPI} zones={SOUPZ} run={run} accent={T.accent} points={2} cols={4} onDone={mk('so')} /></div>}
                b={<div><p className="text-sm font-bold mb-2">🌍 {L('National soups — which country?', 'राष्ट्रीय सूप — कौन-सा देश?')}</p><MatchTask items={NATI} zones={NATZ} run={run} accent={T.accent} points={2} cols={4} onDone={mk('na')} /></div>} />
            </div>
          </div>
        </>
      )}
    </FoodShell>
  );
}
