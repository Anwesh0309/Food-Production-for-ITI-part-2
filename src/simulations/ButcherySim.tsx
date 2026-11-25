import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FOOD2_THEMES } from '@/data/themes';
import { playClickSound } from '@/utils/sound';
import { Card, ChefBrief, DragChip, FinishCard, FoodShell, Hud, HintButton, ProTip, SubTabs, Tabs2, Toast, useLang, useRun, useShuffled, useSubDone, useToast, type Run } from '@/components/kit';
import { MatchTask, useDoneSet, type Bi2, type MatchItem, type MatchZone } from '@/components/tasks';

const T = FOOD2_THEMES.butchery;
const bi = (en: string, hi: string): Bi2 => ({ en, hi });
const mz = (id: string, emoji: string, label: Bi2): MatchZone => ({ id, emoji, label });
const mi = (id: string, cat: string, emoji: string, label: Bi2, why: Bi2): MatchItem => ({ id, cat, emoji, label, why });

/* ---------------- Lamb carcass ---------------- */
const CUTS = [
  { id: 'neck', n: bi('Neck', 'गर्दन'), x: 52, y: 40, w: 38, h: 46, c: '#fca5a5', info: bi('Bony, tough — best stewed or minced.', 'हड्डीदार, सख़्त — स्ट्यू/कीमा हेतु बेहतर।') },
  { id: 'shoulder', n: bi('Shoulder', 'कंधा'), x: 90, y: 40, w: 52, h: 66, c: '#fdba74', info: bi('Well-exercised and flavourful — braise or slow-roast.', 'ख़ूब चलने वाली मांसपेशी, स्वादिष्ट — ब्रेज़ या धीमा रोस्ट।') },
  { id: 'rack', n: bi('Rack (ribs)', 'रैक (पसलियाँ)'), x: 142, y: 40, w: 50, h: 34, c: '#fde047', info: bi('Tender ribs — roast as a rack or cut into chops.', 'कोमल पसलियाँ — रैक रोस्ट या चॉप।') },
  { id: 'breast', n: bi('Breast', 'छाती'), x: 142, y: 74, w: 50, h: 32, c: '#bef264', info: bi('Fatty and layered — slow braise or roll and roast.', 'चर्बीदार परतदार — धीमा ब्रेज़ या लपेटकर रोस्ट।') },
  { id: 'loin', n: bi('Loin', 'कमर'), x: 192, y: 40, w: 42, h: 46, c: '#86efac', info: bi('Very tender — grill or pan-fry as chops.', 'बहुत कोमल — चॉप के रूप में ग्रिल/पैन-फ़्राई।') },
  { id: 'leg', n: bi('Leg', 'टाँग (रान)'), x: 234, y: 40, w: 54, h: 76, c: '#7dd3fc', info: bi('Large lean cut — roast whole or cut into steaks.', 'बड़ा दुबला हिस्सा — पूरा रोस्ट या स्टेक।') },
];

function Carcass({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const [placed, setPlaced] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const { toast, say } = useToast();
  const tray = useShuffled(CUTS, 5).filter((c) => !placed.includes(c.id));
  useEffect(() => { if (placed.length === CUTS.length) onDone(); /* eslint-disable-next-line */ }, [placed.length]);

  const drop = (zone: string | null, id: string) => {
    setSelected(null);
    if (!zone || !zone.startsWith('cut-')) return;
    const target = zone.slice(4); const c = CUTS.find((x) => x.id === id)!;
    if (target === id) {
      setPlaced((p) => [...p, id]); run.add(4);
      playClickSound('success');
      say('ok', L(`${c.n.en}: ${c.info.en}`, `${c.n.hi}: ${c.info.hi}`));
    } else {
      run.miss(); playClickSound('error');
      const t = CUTS.find((x) => x.id === target)!;
      say('bad', L(`That region is the ${t.n.en.toLowerCase()}, not the ${c.n.en.toLowerCase()}.`, `वह भाग ${t.n.hi} है, ${c.n.hi} नहीं।`));
    }
  };

  const handleZoneClick = (cutId: string) => {
    if (selected) {
      drop(`cut-${cutId}`, selected);
    }
  };

  const hint = () => { run.hint(); const c = tray[0]; if (c) say('info', L(`${c.n.en}: ${c.info.en.split(' — ')[0]}. Find its position along the body.`, `${c.n.hi}: शरीर में इसकी स्थिति खोजें।`)); };
  return (
    <div className="space-y-2" data-testid="carcass">
      <p className="text-xs text-stone-600 dark:text-stone-300">{L('Drag or tap each cut onto the right part of the lamb carcass (head on the left).', 'हर कट को खींचें या छूकर मेमने के शव के सही भाग पर लगाएँ (सिर बाईं ओर)।')}</p>
      <div className="rounded-2xl bg-stone-50 dark:bg-slate-800 p-2">
        <svg viewBox="0 0 330 150" className="w-full" data-testid="carcass-svg">
          <path d="M20 60 Q30 36 52 40 L288 40 Q300 80 288 116 L258 150 L240 118 L196 108 L160 108 L130 150 L108 108 L52 86 Q24 84 20 60Z" fill="#fee2e2" stroke="#b91c1c" strokeWidth="1.5" />
          {CUTS.map((c) => {
            const done = placed.includes(c.id);
            return (
              <g key={c.id} onClick={() => handleZoneClick(c.id)} className={selected ? 'cursor-pointer' : ''}>
                <rect data-zone={`cut-${c.id}`} x={c.x} y={c.y} width={c.w} height={c.h} rx="6" fill={done ? c.c : selected ? 'rgba(59,130,246,.25)' : 'rgba(255,255,255,.35)'} stroke={done ? '#334155' : selected ? '#3b82f6' : '#94a3b8'} strokeDasharray={done ? undefined : '4 3'} strokeWidth={selected ? 2 : 1} />
                {done && <text x={c.x + c.w / 2} y={c.y + c.h / 2 + 3} fontSize="8" textAnchor="middle" fill="#1e293b" style={{ pointerEvents: 'none' }}>{L(c.n.en, c.n.hi)}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-2 rounded-xl bg-stone-50 dark:bg-slate-800 p-2 min-h-[48px] items-center" data-testid="tray">
        {tray.map((c) => (
          <div key={c.id} onClick={() => { playClickSound('neutral'); setSelected((prev) => prev === c.id ? null : c.id); }} className="cursor-pointer">
            <DragChip id={c.id} onDrop={drop} className={`px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 shadow-sm text-xs font-semibold ${selected === c.id ? 'ring-2 ring-blue-500 scale-105 border-blue-500' : 'border-stone-300 dark:border-stone-700'}`}>
              🔪 {L(c.n.en, c.n.hi)}
            </DragChip>
          </div>
        ))}
        {tray.length === 0 && <span className="text-xs text-green-600 dark:text-green-400 font-bold">🎉 {L('All carcass primal cuts correctly identified!', 'सभी मुख्य कट सही पहचाने गए!')}</span>}
      </div>
      <div className="flex items-center justify-between">
        <HintButton onHint={hint} accent={T.accent} />
        <span className="text-xs text-stone-500 dark:text-stone-400">
          {selected ? L('Tap target carcass zone above', 'ऊपर शव पर लक्ष्य क्षेत्र छुएँ') : L('Tap or drag cut to place', 'लगाने हेतु कट छुएँ या खींचें')}
        </span>
      </div>
      <Toast {...toast} />
    </div>
  );
}

const LAMB_Z = [mz('roast', '🔥', bi('Roast / grill', 'रोस्ट / ग्रिल')), mz('fry', '🍳', bi('Chops: pan-fry', 'चॉप: पैन-फ़्राई')), mz('slow', '🍲', bi('Slow-cook (braise / stew)', 'धीमी पकाई (ब्रेज़/स्ट्यू)'))];
const LAMB_I = [
  mi('l1', 'roast', '🍖', bi('Leg', 'टाँग (रान)'), bi('Lean, large — suits roasting whole.', 'दुबली, बड़ी — पूरी रोस्ट करने योग्य।')),
  mi('l2', 'roast', '🦴', bi('Rack of lamb', 'रैक ऑफ़ लैम्ब'), bi('Tender ribs roast quickly and stay pink.', 'कोमल पसलियाँ जल्दी रोस्ट होती हैं।')),
  mi('l3', 'fry', '🥩', bi('Loin chops', 'लॉइन चॉप'), bi('Tender loin cooks fast on high heat.', 'कोमल लॉइन तेज़ आँच पर जल्दी पकती है।')),
  mi('l4', 'slow', '🍲', bi('Shoulder', 'कंधा'), bi('Tough muscle becomes tender with long moist cooking.', 'सख़्त मांसपेशी लंबी नम पकाई से कोमल होती है।')),
  mi('l5', 'slow', '🍛', bi('Neck (curry pieces)', 'गर्दन (करी टुकड़े)'), bi('Bony neck gives rich flavour in stews and curries.', 'हड्डीदार गर्दन स्ट्यू/करी को गहरा स्वाद देती है।')),
  mi('l6', 'slow', '🥘', bi('Breast', 'छाती'), bi('Fatty breast needs slow braising.', 'चर्बीदार छाती को धीमा ब्रेज़ चाहिए।')),
];
const CH_Z = [mz('breast', '🍗', bi('Breast', 'ब्रेस्ट')), mz('thigh', '🍗', bi('Thigh', 'जाँघ')), mz('drum', '🍗', bi('Drumstick', 'ड्रमस्टिक')), mz('wing', '🪽', bi('Wing', 'विंग'))];
const CH_I = [
  mi('c1', 'breast', '🥩', bi('Lean white meat; dries out if overcooked', 'दुबला सफ़ेद मांस; ज़्यादा पकने पर सूखता है'), bi('Breast is lean and cooks fast.', 'ब्रेस्ट दुबला है और जल्दी पकता है।')),
  mi('c2', 'breast', '⚡', bi('Cooks fast — grill or sauté', 'जल्दी पकता है — ग्रिल/सॉते'), bi('Breast suits quick dry-heat cooking.', 'ब्रेस्ट तेज़ शुष्क-ताप पकाई हेतु उपयुक्त।')),
  mi('c3', 'thigh', '🍗', bi('Darker, juicier, forgiving in curries', 'गहरा, रसीला, करी में सुरक्षित'), bi('Thigh has more fat and stays juicy.', 'जाँघ में वसा अधिक, रसीली रहती है।')),
  mi('c4', 'thigh', '🍛', bi('Boneless pieces for tikka', 'टिक्का हेतु बोनलेस टुकड़े'), bi('Boneless thigh is popular for tikka.', 'बोनलेस जाँघ टिक्का हेतु लोकप्रिय है।')),
  mi('c5', 'drum', '🦴', bi('Lower leg with a bone handle', 'हड्डी की मूठ वाली निचली टाँग'), bi('The drumstick is the lower leg.', 'ड्रमस्टिक निचली टाँग है।')),
  mi('c6', 'drum', '🔥', bi('Tandoori or fried with the bone in', 'हड्डी सहित तंदूरी या तला'), bi('Drumsticks are great tandoori or fried.', 'ड्रमस्टिक तंदूरी/तली अच्छी बनती है।')),
  mi('c7', 'wing', '🪽', bi('Small, bony, fatty skin', 'छोटा, हड्डीदार, चर्बीदार त्वचा'), bi('Wings are small, bony and skin-rich.', 'विंग छोटे, हड्डीदार, त्वचा-प्रधान होते हैं।')),
  mi('c8', 'wing', '🌶️', bi('Hot wings, fried or baked', 'हॉट विंग, तले या बेक्ड'), bi('Wings are fried or baked as hot wings.', 'विंग हॉट विंग के रूप में तले/बेक किए जाते हैं।')),
];
const BIRD_Z = [mz('poultry', '🏡', bi('Poultry (farm-reared)', 'पोल्ट्री (पाले हुए)')), mz('game', '🌲', bi('Game birds', 'शिकारी पक्षी (गेम बर्ड)'))];
const BIRD_I = [
  mi('b1', 'poultry', '🐔', bi('Chicken', 'मुर्गा'), bi('Chicken is the most common poultry.', 'चिकन सबसे आम पोल्ट्री है।')), mi('b2', 'poultry', '🦆', bi('Duck', 'बतख'), bi('Domestic duck is poultry.', 'पालतू बतख पोल्ट्री है।')),
  mi('b3', 'poultry', '🦃', bi('Turkey', 'टर्की'), bi('Turkey is farm-reared poultry.', 'टर्की पाला हुआ पोल्ट्री है।')), mi('b4', 'poultry', '🪿', bi('Goose', 'हंस (गूज़)'), bi('Domestic goose is poultry.', 'पालतू गूज़ पोल्ट्री है।')),
  mi('b5', 'game', '🐦', bi('Quail', 'बटेर'), bi('Quail is a small game bird.', 'बटेर छोटी गेम बर्ड है।')), mi('b6', 'game', '🦚', bi('Pheasant', 'तीतर-मोर जाति (फ़ीज़ेंट)'), bi('Pheasant is a classic game bird.', 'फ़ीज़ेंट क्लासिक गेम बर्ड है।')),
  mi('b7', 'game', '🐤', bi('Partridge', 'तीतर'), bi('Partridge is a game bird with lean meat.', 'तीतर दुबले मांस वाली गेम बर्ड है।')), mi('b8', 'game', '🦅', bi('Grouse', 'ग्राउस'), bi('Grouse is a game bird with a strong flavour.', 'ग्राउस तेज़ स्वाद वाली गेम बर्ड है।')),
];
const FZ = [mz('round', '🐟', bi('Round fish', 'गोल मछली')), mz('flat', '🐠', bi('Flat fish', 'चपटी मछली')), mz('crust', '🦐', bi('Crustaceans', 'क्रस्टेशियन')), mz('mollusc', '🦪', bi('Molluscs', 'मोलस्क'))];
const FI = [
  mi('f1', 'round', '🐟', bi('Rohu', 'रोहू'), bi('Rohu is a round, freshwater fish.', 'रोहू गोल मीठे पानी की मछली है।')), mi('f2', 'round', '🍣', bi('Salmon', 'सैल्मन'), bi('Salmon is a round fish.', 'सैल्मन गोल मछली है।')),
  mi('f3', 'flat', '🐠', bi('Sole', 'सोल'), bi('Sole is a flat fish with both eyes on one side.', 'सोल चपटी मछली है जिसकी दोनों आँखें एक तरफ़ होती हैं।')), mi('f4', 'flat', '🐠', bi('Halibut', 'हैलिबट'), bi('Halibut is a large flat fish.', 'हैलिबट बड़ी चपटी मछली है।')),
  mi('f5', 'crust', '🦐', bi('Prawn', 'झींगा'), bi('Prawns have a jointed shell — crustaceans.', 'झींगे का जोड़दार कवच होता है — क्रस्टेशियन।')), mi('f6', 'crust', '🦀', bi('Crab', 'केकड़ा'), bi('Crab is a crustacean.', 'केकड़ा क्रस्टेशियन है।')),
  mi('f7', 'mollusc', '🦪', bi('Oyster', 'ऑयस्टर (सीप)'), bi('Oysters are molluscs with a hinged shell.', 'ऑयस्टर कब्ज़ेदार कवच वाले मोलस्क हैं।')), mi('f8', 'mollusc', '🦑', bi('Squid', 'स्क्विड'), bi('Squid is a soft-bodied mollusc.', 'स्क्विड नरम शरीर वाला मोलस्क है।')),
];
const FCZ = [mz('fillet', '🐟', bi('Fillet', 'फ़िले')), mz('darne', '🥩', bi('Darne (steak)', 'डार्न (स्टेक)')), mz('goujon', '🍢', bi('Goujons', 'गूज़ों')), mz('paup', '🌀', bi('Paupiette', 'पोपिएत'))];
const FCI = [
  mi('x1', 'fillet', '🐟', bi('Boneless side cut lengthwise off the backbone', 'रीढ़ से लंबाई में कटा बिना हड्डी का हिस्सा'), bi('A fillet is a boneless side of fish.', 'फ़िले मछली का बिना हड्डी का हिस्सा है।')),
  mi('x2', 'fillet', '🐠', bi('Sole cut into 2 or 4 pieces off the bone', 'सोल को हड्डी से 2 या 4 टुकड़ों में काटा'), bi('Flat fish give 2 or 4 fillets.', 'चपटी मछली से 2 या 4 फ़िले मिलते हैं।')),
  mi('x3', 'darne', '🥩', bi('Slice cut across a round fish, bone in', 'गोल मछली को आड़ा काटा, हड्डी सहित'), bi('A darne is a steak cut across the fish through the bone.', 'डार्न हड्डी समेत आड़ा कटा स्टेक है।')),
  mi('x4', 'darne', '🍣', bi('Salmon cutlet', 'सैल्मन कटलेट'), bi('Salmon is often cut as darnes.', 'सैल्मन अक्सर डार्न में कटती है।')),
  mi('x5', 'goujon', '🍢', bi('Thin finger-length strips, crumbed and fried', 'पतली उँगली जैसी पट्टियाँ, क्रंब लगाकर तली'), bi('Goujons are strips of fillet, breaded and fried.', 'गूज़ों फ़िले की पट्टियाँ हैं, ब्रेडक्रंब लगाकर तली।')),
  mi('x6', 'goujon', '🔪', bi('Cut on the slant from a fillet', 'फ़िले से तिरछा काटा'), bi('Goujons are cut on the slant from fillets.', 'गूज़ों फ़िले से तिरछे काटे जाते हैं।')),
  mi('x7', 'paup', '🌀', bi('Fillet spread with stuffing and rolled', 'फ़िले पर भरावन लगाकर लपेटा'), bi('A paupiette is a stuffed rolled fillet.', 'पोपिएत भरावन सहित लपेटा हुआ फ़िले है।')),
  mi('x8', 'paup', '♨️', bi('Rolled, then poached or steamed', 'लपेटकर पोच या भाप में पकाया'), bi('Paupiettes are poached or steamed.', 'पोपिएत पोच या भाप में पकते हैं।')),
];

/* ---------------- Fish freshness inspector ---------------- */
const CHECKS = [
  { id: 'eyes', e: '👁️', n: bi('Eyes', 'आँखें'), a: bi('Bright, clear and bulging', 'चमकीली, साफ़, उभरी'), b: bi('Sunken and cloudy', 'धँसी व धुँधली') },
  { id: 'gills', e: '🩸', n: bi('Gills', 'गलफड़े'), a: bi('Bright red, no slime', 'चमकीले लाल, चिपचिपाहट नहीं'), b: bi('Grey-brown and slimy', 'स्लेटी-भूरे व चिपचिपे') },
  { id: 'flesh', e: '👆', n: bi('Flesh (press it)', 'मांस (दबाकर देखें)'), a: bi('Firm — springs back', 'कसा — दबाने पर लौटता है'), b: bi('Soft — finger mark stays', 'नरम — उँगली का निशान रहता है') },
  { id: 'smell', e: '👃', n: bi('Smell', 'गंध'), a: bi('Mild, fresh sea smell', 'हल्की, ताज़ी समुद्री गंध'), b: bi('Strong, sour or ammonia smell', 'तेज़, खट्टी या अमोनिया-सी गंध') },
  { id: 'scales', e: '✨', n: bi('Scales & skin', 'शल्क व त्वचा'), a: bi('Shiny and tight', 'चमकीले व कसे'), b: bi('Dull and loose', 'फीके व ढीले') },
];

function Freshness({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const [seen, setSeen] = useState<string[]>([]); const [bought, setBought] = useState(false);
  const { toast, say } = useToast();
  const flip = useShuffled([0, 1], 3)[0] === 0;
  const freshIsA = flip;
  const buy = (choice: 'A' | 'B') => {
    if (bought) return;
    if (seen.length < 3) { say('info', L(`Inspect at least three signs first (${seen.length}/3 checked).`, `खरीदने से पहले कम से कम तीन संकेत जाँचें (${seen.length}/3 जाँचे)।`)); return; }
    if ((choice === 'A') === freshIsA) {
      setBought(true); run.add(10);
      playClickSound('success');
      say('ok', L('Good buy! Bright eyes, red gills, firm flesh and a mild smell mark a fresh fish.', 'बढ़िया खरीद! चमकीली आँखें, लाल गलफड़े, कसा मांस व हल्की गंध ताज़ी मछली की पहचान हैं।'));
      onDone();
    } else {
      run.miss(); playClickSound('error');
      say('bad', L('That fish shows signs of age. Compare the signs again.', 'उस मछली में पुराने होने के संकेत हैं। संकेत फिर मिलाएँ।'));
    }
  };
  const hint = () => { run.hint(); const m = CHECKS.find((c) => !seen.includes(c.id)); say('info', m ? L(`Check the ${m.n.en.toLowerCase()} next.`, `अगला जाँचें: ${m.n.hi}।`) : L('Choose the fish with bright eyes and red gills.', 'चमकीली आँखों व लाल गलफड़ों वाली मछली चुनें।')); };
  return (
    <div className="space-y-3" data-testid="freshness">
      <p className="text-xs text-stone-600 dark:text-stone-300">{L('Two fish are on the ice. Tap each sensory sign to compare them, then buy the fresher one.', 'बर्फ़ पर दो मछलियाँ हैं। संकेत छूकर तुलना करें, फिर ताज़ी वाली खरीदें।')}</p>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 p-3 border border-sky-200 dark:border-sky-800"><div className="text-5xl">🐟</div><b className="text-sm">Sample A</b></div>
        <div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 p-3 border border-sky-200 dark:border-sky-800"><div className="text-5xl" style={{ transform: 'scaleX(-1)' }}>🐟</div><b className="text-sm">Sample B</b></div>
      </div>
      <div className="space-y-1">{CHECKS.map((c) => { const s = seen.includes(c.id); const A = freshIsA ? c.a : c.b, B = freshIsA ? c.b : c.a; return (
        <div key={c.id} className="grid grid-cols-[120px_1fr_1fr] gap-1 items-stretch text-[11px]">
          <button onClick={() => { playClickSound('neutral'); setSeen((x) => (x.includes(c.id) ? x : [...x, c.id])); }} data-check={c.id} className={`rounded-lg border px-2 py-1.5 font-semibold text-left transition-all ${s ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>{c.e} {L(c.n.en, c.n.hi)}{s ? ' ✓' : ''}</button>
          <div className={`rounded-lg px-2 py-1.5 ${s ? 'bg-stone-100 dark:bg-slate-800 font-medium' : 'bg-stone-50 dark:bg-slate-800/40 text-stone-400'}`}>{s ? L(A.en, A.hi) : '?'}</div>
          <div className={`rounded-lg px-2 py-1.5 ${s ? 'bg-stone-100 dark:bg-slate-800 font-medium' : 'bg-stone-50 dark:bg-slate-800/40 text-stone-400'}`}>{s ? L(B.en, B.hi) : '?'}</div>
        </div>); })}</div>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={() => buy('A')} disabled={bought} data-testid="buy-A" className={`px-4 py-2 rounded-xl text-white text-sm font-bold shadow-sm transition-all active:scale-95 ${seen.length >= 3 ? 'bg-blue-600' : 'bg-slate-400 opacity-60'}`}>{L('Buy A', 'A खरीदें')}</button>
        <button onClick={() => buy('B')} disabled={bought} data-testid="buy-B" className={`px-4 py-2 rounded-xl text-white text-sm font-bold shadow-sm transition-all active:scale-95 ${seen.length >= 3 ? 'bg-blue-600' : 'bg-slate-400 opacity-60'}`}>{L('Buy B', 'B खरीदें')}</button>
        <HintButton onHint={hint} accent={T.accent} />
        <span className="text-xs text-stone-500 font-medium">({seen.length}/3 {L('signs checked', 'संकेत जाँचे')})</span>
      </div>
      <Toast {...toast} />
    </div>
  );
}

function LambTab({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const { d, mark } = useSubDone(['c', 'm'], onDone);
  return <SubTabs accent={T.accent} done={d} tabs={[{ id: 'c', label: L('Name the cuts', 'कट पहचानें') }, { id: 'm', label: L('Cut → cooking method', 'कट → पकाने की विधि') }]}>
    {{ c: <Carcass run={run} onDone={mark('c')} />, m: <MatchTask items={LAMB_I} zones={LAMB_Z} run={run} accent={T.accent} points={2} cols={3} onDone={mark('m')} /> }}
  </SubTabs>;
}
function BirdTab({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const { d, mark } = useSubDone(['c', 'b'], onDone);
  return <SubTabs accent={T.accent} done={d} tabs={[{ id: 'c', label: L('Chicken cuts', 'चिकन कट') }, { id: 'b', label: L('Poultry vs game', 'पोल्ट्री बनाम गेम') }]}>
    {{ c: <MatchTask items={CH_I} zones={CH_Z} run={run} accent={T.accent} points={2} cols={4} onDone={mark('c')} />, b: <MatchTask items={BIRD_I} zones={BIRD_Z} run={run} accent={T.accent} points={2} cols={2} onDone={mark('b')} /> }}
  </SubTabs>;
}
function FishTab({ run, onDone }: { run: Run; onDone: () => void }) {
  const L = useLang();
  const { d, mark } = useSubDone(['k', 'c', 'f'], onDone);
  return <SubTabs accent={T.accent} done={d} tabs={[{ id: 'k', label: L('Fish categories', 'मछली के वर्ग') }, { id: 'c', label: L('Fish cuts', 'मछली के कट') }, { id: 'f', label: L('Freshness check', 'ताज़गी जाँच') }]}>
    {{ k: <MatchTask items={FI} zones={FZ} run={run} accent={T.accent} points={2} cols={4} onDone={mark('k')} />, c: <MatchTask items={FCI} zones={FCZ} run={run} accent={T.accent} points={2} cols={4} onDone={mark('c')} />, f: <Freshness run={run} onDone={mark('f')} /> }}
  </SubTabs>;
}

export default function ButcherySim() {
  const L = useLang();
  const run = useRun('m2Butchery', 24 + 12 + 16 + 16 + 16 + 16 + 10);
  const [tab, setTab] = useState<'lamb' | 'bird' | 'fish'>('lamb');
  const ds = useDoneSet(3, run);
  const [key, setKey] = useState(0);
  const replay = () => { run.reset(); ds.reset(); setTab('lamb'); setKey((k) => k + 1); };

  return (
    <FoodShell accent={T.accent} Icon={T.Icon} title={L('Butchery, Poultry & Fish Studio', 'कसाईख़ाना, पोल्ट्री व मछली स्टूडियो')}
      subtitle={L('Locate cuts on a lamb carcass, sort poultry and game, fabricate fish cuts and inspect fresh fish on ice.', 'मेमने के शव पर कट पहचानें, पोल्ट्री व गेम छाँटें, मछली के शास्त्रीय कट बनाएँ और ताज़गी जाँचें।')}>
      {run.done ? <FinishCard run={run} accent={T.accent} onReplay={replay} summary={[L('Lamb carcass cuts mapped to cooking methods', 'मेमने के कट पकाने की विधियों से जोड़े'), L('Chicken retail cuts and poultry vs game birds', 'चिकन कट व पोल्ट्री बनाम गेम बर्ड्स'), L('Fish categories, classical fish fabrication and sensory freshness inspection', 'मछली वर्ग, शास्त्रीय कट व ताज़गी निरीक्षण')]} /> : (
        <>
          <ChefBrief
            station={L('Hotel Meat & Fish Fabrication Dock (Boucherie)', 'मांस व मछली तैयारी डॉक (बुशरी)')}
            role={L('Apprentice Butcher & Commis Cook', 'प्रशिक्षु कसाई व कॉमी रसोइया')}
            task={L('Fabricate lamb carcass primal cuts according to culinary muscle toughness, classify poultry and game birds, and conduct sensory quality audits on round and flat fish.', 'मांसपेशी की सख़्ती अनुसार मेमने के कट अलग करें, पोल्ट्री व गेम बर्ड्स छाँटें, और गोल व चपटी मछली की संवेदी गुणवत्ता जाँचें।')}
            standard={L('Grade 10 CBSE Food Production · Block 10, 11 & 12', 'कक्षा 10 फ़ूड प्रोडक्शन · ब्लॉक 10, 11 व 12')}
          />
          <ProTip
            title={L('Muscle Exercise & Cooking Method Rule', 'मांसपेशी व्यायाम व पकाई विधि नियम')}
            text={L('Exercised muscles (neck, shoulder, shank) contain dense collagen connective tissue and must be braised or slow-cooked in moist heat. Non-exercised tender cuts (loin, rack) cook quickly by dry roasting or grilling. For fish, bright red gills and bulging clear eyes indicate same-day freshness!', 'अधिक चलने वाली मांसपेशियाँ (गर्दन, कंधा, नली) कोलेजन संयोजी ऊतक से भरी होती हैं और इन्हें नम गर्मी में धीमी आँच पर पकाना चाहिए। कम चलने वाले कोमल हिस्से (कमर, रैक) सीधे ग्रिल या रोस्ट होते हैं। मछली में लाल गलफड़े व उभरी आँखें ताज़गी दर्शाते हैं!')}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs2 accent={T.accent} value={tab} onChange={setTab} tabs={[
              { id: 'lamb', label: L('1. Lamb & Meat', '1. मेमना व मांस'), done: ds.done.has('lamb') },
              { id: 'bird', label: L('2. Poultry & Game', '2. पोल्ट्री व गेम'), done: ds.done.has('bird') },
              { id: 'fish', label: L('3. Fish & Seafood', '3. मछली व समुद्री भोजन'), done: ds.done.has('fish') }]} />
            <Hud run={run} accent={T.accent} />
          </div>
          <div key={key}>
            <div style={{ display: tab === 'lamb' ? 'block' : 'none' }}>
              <LambTab run={run} onDone={() => ds.mark('lamb')} />
              {ds.done.has('lamb') && (
                <div className="flex justify-end mt-3">
                  <button onClick={() => setTab('bird')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                    {L('Next: Poultry & Game', 'अगला: पोल्ट्री व गेम')} →
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: tab === 'bird' ? 'block' : 'none' }}>
              <BirdTab run={run} onDone={() => ds.mark('bird')} />
              {ds.done.has('bird') && (
                <div className="flex justify-end mt-3">
                  <button onClick={() => setTab('fish')} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95" style={{ background: T.accent }}>
                    {L('Next: Fish & Seafood', 'अगला: मछली व समुद्री भोजन')} →
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: tab === 'fish' ? 'block' : 'none' }}>
              <FishTab run={run} onDone={() => ds.mark('fish')} />
            </div>
          </div>
        </>
      )}
    </FoodShell>
  );
}
