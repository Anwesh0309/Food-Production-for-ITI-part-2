import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Wind, Hand, ShoppingBasket } from 'lucide-react';
import { FOOD2_THEMES } from '@/data/themes';
import { withAlpha } from '@/components/color';
import { playClickSound } from '@/utils/sound';
import { Card, ChefBrief, DragChip, DropZone, FinishCard, FoodShell, Hud, HintButton, Levels, ProTip, Toast, useLang, useRun, useShuffled, useToast } from '@/components/kit';
import type { Bi2 } from '@/components/tasks';

const T = FOOD2_THEMES.market;
interface Item { id: string; emoji: string; en: string; hi: string; fr: string; look: Bi2; smell: Bi2; touch: Bi2; texture: Bi2; use: Bi2; tint: string }
const bi = (en: string, hi: string): Bi2 => ({ en, hi });

function BlackPepperIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="inline-block drop-shadow-sm select-none">
      <ellipse cx="24" cy="28" rx="20" ry="14" fill="#334155" opacity="0.15" />
      <ellipse cx="24" cy="30" rx="19" ry="9" fill="#1e293b" />
      <ellipse cx="24" cy="27" rx="17" ry="7" fill="#0f172a" />
      <g stroke="#090d16" strokeWidth="0.5">
        <circle cx="16" cy="25" r="4.2" fill="#262626" />
        <circle cx="15.2" cy="23.8" r="1.2" fill="#52525b" opacity="0.7" />
        <circle cx="23" cy="26" r="4.5" fill="#18181b" />
        <circle cx="22" cy="24.5" r="1.3" fill="#71717a" opacity="0.8" />
        <circle cx="31" cy="25" r="4" fill="#27272a" />
        <circle cx="30" cy="23.8" r="1" fill="#71717a" opacity="0.6" />
        <circle cx="19" cy="21" r="4.3" fill="#1c1917" />
        <circle cx="18" cy="19.5" r="1.3" fill="#57534e" opacity="0.8" />
        <circle cx="27" cy="21" r="4.6" fill="#18181b" />
        <circle cx="25.8" cy="19.2" r="1.4" fill="#71717a" opacity="0.8" />
        <circle cx="22" cy="16" r="4.5" fill="#262626" />
        <circle cx="20.8" cy="14.5" r="1.4" fill="#a1a1aa" opacity="0.9" />
        <circle cx="12" cy="27" r="3.2" fill="#27272a" />
        <circle cx="35" cy="26" r="3.4" fill="#1c1917" />
        <circle cx="26" cy="13" r="3.6" fill="#18181b" />
        <circle cx="25.2" cy="11.8" r="1" fill="#71717a" opacity="0.7" />
      </g>
    </svg>
  );
}

function TurmericIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="inline-block drop-shadow-sm select-none">
      <ellipse cx="24" cy="36" rx="18" ry="7" fill="#78350f" opacity="0.2" />
      <path d="M7 35 Q11 31 16 33 Q20 34 22 36 Q18 38 13 38 Q8 38 7 35 Z" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
      <path d="M10 33 Q12 36 14 34" stroke="#d97706" strokeWidth="0.7" fill="none" />
      <path d="M14 26 C14 36 34 36 34 26 Z" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
      <ellipse cx="24" cy="26" rx="10" ry="3" fill="#c2410c" />
      <path d="M15 26 Q19 16 24 14 Q29 16 33 26 Z" fill="#eab308" />
      <path d="M17 25 Q21 17 24 15 Q27 17 31 25 Z" fill="#facc15" />
      <ellipse cx="24" cy="19" rx="4" ry="2.5" fill="#fde047" opacity="0.8" />
      <circle cx="21" cy="21" r="0.7" fill="#ca8a04" />
      <circle cx="26" cy="22" r="0.8" fill="#ca8a04" />
      <circle cx="24" cy="17" r="0.6" fill="#fef08a" />
      <circle cx="23" cy="24" r="0.7" fill="#ca8a04" />
    </svg>
  );
}

function CinnamonIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="inline-block drop-shadow-sm select-none">
      <ellipse cx="24" cy="38" rx="16" ry="6" fill="#451a03" opacity="0.25" />
      <g transform="rotate(-25 24 24)">
        <rect x="18" y="10" width="8" height="28" rx="4" fill="#9a3412" stroke="#78350f" strokeWidth="0.8" />
        <line x1="20" y1="12" x2="20" y2="36" stroke="#b45309" strokeWidth="0.8" />
        <ellipse cx="22" cy="10" rx="4" ry="2" fill="#78350f" />
        <ellipse cx="22" cy="10" rx="2.5" ry="1.2" fill="#451a03" />
      </g>
      <g transform="rotate(20 24 24)">
        <rect x="20" y="8" width="9" height="30" rx="4.5" fill="#b45309" stroke="#78350f" strokeWidth="1" />
        <line x1="23" y1="10" x2="23" y2="36" stroke="#d97706" strokeWidth="1" />
        <line x1="26" y1="12" x2="26" y2="34" stroke="#78350f" strokeWidth="0.8" strokeDasharray="2 2" />
        <ellipse cx="24.5" cy="8" rx="4.5" ry="2.2" fill="#9a3412" />
        <ellipse cx="24.5" cy="8" rx="2.8" ry="1.4" fill="#451a03" />
        <circle cx="24.5" cy="8" r="1" fill="#291205" />
      </g>
      <path d="M16 28 Q20 30 24 28" stroke="#d97706" strokeWidth="0.9" fill="none" />
    </svg>
  );
}

function CardamomIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="inline-block drop-shadow-sm select-none">
      <ellipse cx="24" cy="38" rx="16" ry="6" fill="#14532d" opacity="0.2" />
      <g transform="rotate(-25 18 26)">
        <path d="M18 14 C13 20 13 28 18 34 C23 28 23 20 18 14 Z" fill="#65a30d" stroke="#3f6212" strokeWidth="1" />
        <path d="M18 14 Q15 24 18 34" stroke="#84cc16" strokeWidth="0.9" fill="none" />
        <path d="M18 14 Q21 24 18 34" stroke="#4d7c0f" strokeWidth="0.9" fill="none" />
        <path d="M18 14 L18 11" stroke="#3f6212" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M18 34 L18 36" stroke="#3f6212" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      <g transform="rotate(20 28 24)">
        <path d="M28 12 C22 19 22 29 28 36 C34 29 34 19 28 12 Z" fill="#84cc16" stroke="#3f6212" strokeWidth="1" />
        <path d="M28 12 Q25 24 28 36" stroke="#a3e635" strokeWidth="1.1" fill="none" />
        <path d="M28 12 Q31 24 28 36" stroke="#4d7c0f" strokeWidth="0.9" fill="none" />
        <path d="M28 12 L28 9" stroke="#3f6212" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M28 36 L28 38" stroke="#3f6212" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function ItemVisual({ item, size = 'sm' }: { item: Item; size?: 'sm' | 'lg' }) {
  const pixelSize = size === 'lg' ? 52 : 36;
  if (item.fr === 'Poivre noir') return <BlackPepperIcon size={pixelSize} />;
  if (item.fr === 'Curcuma') return <TurmericIcon size={pixelSize} />;
  if (item.fr === 'Cannelle') return <CinnamonIcon size={pixelSize} />;
  if (item.fr === 'Cardamome') return <CardamomIcon size={pixelSize} />;
  return <span className={size === 'lg' ? 'text-4xl' : 'text-3xl leading-none'}>{item.emoji}</span>;
}

const LEVELS: { title: Bi2; items: Item[]; wants: { id: string; clue: Bi2 }[] }[] = [
  { title: bi('Vegetable & Pulse Stall', 'सब्ज़ी व दाल स्टॉल'),
    items: [
      { id: 'onion', emoji: '🧅', en: 'Onion', hi: 'प्याज़', fr: 'Oignon', look: bi('Papery brown skin, round bulb', 'कागज़ी भूरा छिलका, गोल कंद'), smell: bi('Sharp, makes eyes water when cut', 'तेज़, काटने पर आँखों में पानी'), touch: bi('Firm and dry', 'कसा और सूखा'), texture: bi('Crisp', 'कुरकुरा'), use: bi('Base of curries, soups, mirepoix', 'करी, सूप, मिरपुआ का आधार'), tint: '#fde68a' },
      { id: 'carrot', emoji: '🥕', en: 'Carrot', hi: 'गाजर', fr: 'Carotte', look: bi('Orange tapered root', 'नारंगी नुकीली जड़'), smell: bi('Mild, sweet earthy', 'हल्की, मीठी मिट्टी-सी'), touch: bi('Hard and smooth', 'कठोर और चिकनी'), texture: bi('Crunchy', 'करारी'), use: bi('Salads, halwa, mirepoix', 'सलाद, हलवा, मिरपुआ'), tint: '#fed7aa' },
      { id: 'potato', emoji: '🥔', en: 'Potato', hi: 'आलू', fr: 'Pomme de terre', look: bi('Brown oval tuber', 'भूरा अंडाकार कंद'), smell: bi('Faint earthy', 'हल्की मिट्टी-सी'), touch: bi('Firm, dusty skin', 'कसा, धूल भरा छिलका'), texture: bi('Starchy', 'स्टार्चयुक्त'), use: bi('Boil, fry, bake, mash', 'उबालना, तलना, बेक, मैश'), tint: '#fef3c7' },
      { id: 'tomato', emoji: '🍅', en: 'Tomato', hi: 'टमाटर', fr: 'Tomate', look: bi('Glossy red round fruit', 'चमकीला लाल गोल फल'), smell: bi('Fresh, tangy green stalk', 'ताज़ा, खट्टी डंठल-सी'), touch: bi('Smooth, slightly soft', 'चिकना, थोड़ा नरम'), texture: bi('Juicy', 'रसीला'), use: bi('Sauces, gravies, salads', 'सॉस, ग्रेवी, सलाद'), tint: '#fecaca' },
      { id: 'garlic', emoji: '🧄', en: 'Garlic', hi: 'लहसुन', fr: 'Ail', look: bi('White bulb of small cloves', 'छोटी कलियों वाला सफ़ेद कंद'), smell: bi('Pungent and strong', 'तीखी व तेज़'), touch: bi('Papery outside, firm cloves', 'बाहर कागज़ी, कलियाँ कसी'), texture: bi('Firm', 'कसा'), use: bi('Tadka, marinades, sauces', 'तड़का, मैरिनेड, सॉस'), tint: '#f1f5f9' },
      { id: 'rajma', emoji: '🫘', en: 'Kidney beans (rajma)', hi: 'राजमा', fr: 'Haricots rouges', look: bi('Dark red dried seeds', 'गहरे लाल सूखे बीज'), smell: bi('Mild, nutty', 'हल्की, मेवे-सी'), touch: bi('Hard and smooth', 'कठोर और चिकने'), texture: bi('Floury when cooked', 'पकने पर भुरभुरे'), use: bi('Rajma curry; soak overnight', 'राजमा करी; रात भर भिगोएँ'), tint: '#fda4af' },
      { id: 'banana', emoji: '🍌', en: 'Banana', hi: 'केला', fr: 'Banane', look: bi('Yellow curved fruit', 'पीला मुड़ा फल'), smell: bi('Sweet and fruity', 'मीठी फलों-सी'), touch: bi('Soft peel, soft flesh', 'नरम छिलका, नरम गूदा'), texture: bi('Creamy', 'मलाईदार'), use: bi('Desserts, shakes, cakes', 'मिठाई, शेक, केक'), tint: '#fef08a' },
      { id: 'apple', emoji: '🍎', en: 'Apple', hi: 'सेब', fr: 'Pomme', look: bi('Round red-green fruit', 'गोल लाल-हरा फल'), smell: bi('Light, sweet-tart', 'हल्की, मीठी-खट्टी'), touch: bi('Hard and smooth', 'कठोर और चिकना'), texture: bi('Crisp and juicy', 'कुरकुरा व रसीला'), use: bi('Salads, pies, juice', 'सलाद, पाई, जूस'), tint: '#bbf7d0' },
    ],
    wants: [
      { id: 'onion', clue: bi('Papery-skinned bulb that makes your eyes water when cut', 'कागज़ी छिलके वाला कंद जो काटने पर आँखों में पानी लाता है') },
      { id: 'rajma', clue: bi('A dried pulse that must be soaked overnight for a curry', 'सूखी दाल/फली जिसे करी हेतु रात भर भिगोना पड़ता है') },
      { id: 'carrot', clue: bi('Orange, crunchy root vegetable used in mirepoix', 'नारंगी, करारी जड़ वाली सब्ज़ी जो मिरपुआ में काम आती है') },
    ] },
  { title: bi('Continental & Herb Stall', 'कॉन्टिनेंटल व जड़ी-बूटी स्टॉल'),
    items: [
      { id: 'broccoli', emoji: '🥦', en: 'Broccoli', hi: 'ब्रोकली', fr: 'Brocoli', look: bi('Tiny green trees (florets) on a stalk', 'डंठल पर छोटे हरे पेड़ (फूल)'), smell: bi('Mild, slightly cabbage-like', 'हल्की, थोड़ी गोभी-सी'), touch: bi('Firm head, tight buds', 'कसा सिर, कसी कलियाँ'), texture: bi('Tender-crisp', 'नरम-करारी'), use: bi('Soups, sautés, steaming', 'सूप, सॉते, भाप'), tint: '#bbf7d0' },
      { id: 'lettuce', emoji: '🥬', en: 'Lettuce', hi: 'लेट्यूस', fr: 'Laitue', look: bi('Loose crisp pale-green leaves', 'ढीले करारे हल्के हरे पत्ते'), smell: bi('Clean, watery', 'साफ़, पानी-सी'), touch: bi('Cool, crisp, brittle leaves', 'ठंडे, करारे, भंगुर पत्ते'), texture: bi('Crisp', 'कुरकुरा'), use: bi('Salad base and sandwiches', 'सलाद आधार व सैंडविच'), tint: '#d9f99d' },
      { id: 'pepper', emoji: '🫑', en: 'Bell pepper', hi: 'शिमला मिर्च', fr: 'Poivron', look: bi('Glossy, blocky and hollow', 'चमकीली, चौकोर व खोखली'), smell: bi('Fresh and mildly sweet', 'ताज़ी व हल्की मीठी'), touch: bi('Smooth and firm', 'चिकनी व कसी'), texture: bi('Crunchy', 'करारी'), use: bi('Stir-fry, grills, pizzas', 'स्टर-फ़्राई, ग्रिल, पिज़्ज़ा'), tint: '#86efac' },
      { id: 'mushroom', emoji: '🍄', en: 'Mushroom', hi: 'मशरूम', fr: 'Champignon', look: bi('White-cream cap on a stem', 'डंठल पर सफ़ेद-क्रीम टोपी'), smell: bi('Earthy, woody', 'मिट्टी-सी, लकड़ी-सी'), touch: bi('Soft, slightly damp', 'नरम, थोड़ी नम'), texture: bi('Meaty and spongy', 'मांसल व स्पंजी'), use: bi('Sauces, soups, sautés', 'सॉस, सूप, सॉते'), tint: '#e7e5e4' },
      { id: 'zucchini', emoji: '🥒', en: 'Zucchini', hi: 'ज़ुकिनी', fr: 'Courgette', look: bi('Long dark-green squash', 'लंबी गहरी हरी स्क्वैश'), smell: bi('Very mild', 'बहुत हल्की'), touch: bi('Smooth thin skin, firm', 'चिकना पतला छिलका, कसी'), texture: bi('Tender', 'मुलायम'), use: bi('Grills, ratatouille, soups', 'ग्रिल, रैटटूई, सूप'), tint: '#a7f3d0' },
      { id: 'parsley', emoji: '🌿', en: 'Parsley', hi: 'पार्सले', fr: 'Persil', look: bi('Bright green curly or flat leaves', 'चमकीले हरे घुँघराले या सपाट पत्ते'), smell: bi('Fresh, grassy and mild', 'ताज़ी, घास-सी व हल्की'), touch: bi('Soft leaves, thin stems', 'नरम पत्ते, पतले डंठल'), texture: bi('Light and leafy', 'हल्का, पत्तेदार'), use: bi('Garnish, maître d\'hôtel butter', 'गार्निश, मैत्र-द-ओतेल बटर'), tint: '#bbf7d0' },
      { id: 'basil', emoji: '🍃', en: 'Basil', hi: 'बेसिल (तुलसी जैसी)', fr: 'Basilic', look: bi('Broad glossy green leaves', 'चौड़े चमकीले हरे पत्ते'), smell: bi('Sweet, peppery, clove-like', 'मीठी, चटपटी, लौंग-सी'), touch: bi('Soft, tender leaves that bruise', 'नरम पत्ते जो दबने पर काले पड़ते हैं'), texture: bi('Tender', 'मुलायम'), use: bi('Pesto, tomato sauces, pizza', 'पेस्टो, टमाटर सॉस, पिज़्ज़ा'), tint: '#d1fae5' },
      { id: 'eggplant', emoji: '🍆', en: 'Aubergine (eggplant)', hi: 'बैंगन', fr: 'Aubergine', look: bi('Glossy purple oval', 'चमकीला बैंगनी अंडाकार'), smell: bi('Faint, slightly bitter', 'हल्की, थोड़ी कड़वी'), touch: bi('Smooth and heavy', 'चिकना व भारी'), texture: bi('Spongy when raw, silky when cooked', 'कच्चा स्पंजी, पकने पर रेशमी'), use: bi('Grills, moussaka, bharta', 'ग्रिल, मूसाका, भर्ता'), tint: '#e9d5ff' },
    ],
    wants: [
      { id: 'broccoli', clue: bi('Tiny green "trees" on a thick stalk, good for soups and sautés', 'मोटे डंठल पर छोटे हरे "पेड़", सूप व सॉते हेतु अच्छे') },
      { id: 'lettuce', clue: bi('Crisp pale leaves that make the base of a salad', 'करारे हल्के पत्ते जो सलाद का आधार बनते हैं') },
      { id: 'basil', clue: bi('Fresh herb with sweet, peppery smell used in pesto', 'मीठी-चटपटी गंध वाली ताज़ी जड़ी-बूटी, पेस्टो में उपयोगी') },
    ] },
  { title: bi('Spice & Meat Counter', 'मसाला व मांस काउंटर'),
    items: [
      { id: 'pepper', emoji: '⚫', en: 'Black pepper', hi: 'काली मिर्च', fr: 'Poivre noir', look: bi('Small wrinkled black berries', 'छोटे झुर्रीदार काले दाने'), smell: bi('Sharp, hot, woody', 'तेज़, तीखी, लकड़ी-सी'), touch: bi('Hard, dry and round', 'कठोर, सूखे व गोल'), texture: bi('Hard', 'कठोर'), use: bi('Seasoning, soups, marinades', 'मसाला, सूप, मैरिनेड'), tint: '#d6d3d1' },
      { id: 'turmeric', emoji: '🟡', en: 'Turmeric', hi: 'हल्दी', fr: 'Curcuma', look: bi('Bright yellow-orange powder', 'चमकीला पीला-नारंगी पाउडर'), smell: bi('Earthy, slightly bitter', 'मिट्टी-सी, थोड़ी कड़वी'), touch: bi('Fine, stains the fingers', 'महीन, उँगलियाँ रंग देता है'), texture: bi('Powdery', 'पाउडर-सा'), use: bi('Colours curries and dal', 'करी व दाल को रंग देता है'), tint: '#fef08a' },
      { id: 'cinnamon', emoji: '🟤', en: 'Cinnamon', hi: 'दालचीनी', fr: 'Cannelle', look: bi('Brown curled bark sticks', 'भूरी मुड़ी छाल की छड़ें'), smell: bi('Sweet, warm, woody', 'मीठी, गर्म, लकड़ी-सी'), touch: bi('Dry, brittle bark', 'सूखी, भंगुर छाल'), texture: bi('Brittle', 'भंगुर'), use: bi('Biryani, desserts, garam masala', 'बिरयानी, मिठाई, गरम मसाला'), tint: '#fed7aa' },
      { id: 'cardamom', emoji: '🟢', en: 'Green cardamom', hi: 'हरी इलायची', fr: 'Cardamome', look: bi('Small light-green pods', 'छोटी हल्की हरी फलियाँ'), smell: bi('Sweet, floral, cool', 'मीठी, फूलों-सी, ठंडी'), touch: bi('Papery pods with seeds', 'कागज़ी फलियाँ, भीतर बीज'), texture: bi('Light and papery', 'हल्की, कागज़ी'), use: bi('Tea, kheer, biryani', 'चाय, खीर, बिरयानी'), tint: '#bbf7d0' },
      { id: 'soy', emoji: '🍶', en: 'Soy sauce (condiment)', hi: 'सोया सॉस (मसाला-सामग्री)', fr: 'Sauce soja', look: bi('Dark brown thin liquid', 'गहरा भूरा पतला तरल'), smell: bi('Salty, savoury, fermented', 'नमकीन, चटपटी, किण्वित'), touch: bi('Liquid, bottled', 'तरल, बोतलबंद'), texture: bi('Thin liquid', 'पतला तरल'), use: bi('Chinese stir-fries and noodles', 'चाइनीज़ स्टर-फ़्राई व नूडल्स'), tint: '#d6d3d1' },
      { id: 'chicken', emoji: '🍗', en: 'Chicken', hi: 'चिकन', fr: 'Poulet', look: bi('Pale pink flesh, white fat', 'हल्का गुलाबी मांस, सफ़ेद चर्बी'), smell: bi('Neutral when fresh', 'ताज़ा हो तो तटस्थ'), touch: bi('Moist and springy', 'नम व लचीला'), texture: bi('Tender', 'मुलायम'), use: bi('Curries, grills, soups', 'करी, ग्रिल, सूप'), tint: '#fed7aa' },
      { id: 'mutton', emoji: '🍖', en: 'Mutton (goat)', hi: 'मटन (बकरा)', fr: 'Mouton', look: bi('Dark red meat with firm fat', 'गहरा लाल मांस, कसी चर्बी'), smell: bi('Strong, characteristic', 'तेज़, विशिष्ट'), touch: bi('Firm and fibrous', 'कसा व रेशेदार'), texture: bi('Chewy until slow-cooked', 'धीमी पकाई तक चबाने योग्य'), use: bi('Curries, stews, biryani', 'करी, स्ट्यू, बिरयानी'), tint: '#fecaca' },
      { id: 'sausage', emoji: '🌭', en: 'Sausage', hi: 'सॉसेज', fr: 'Saucisse', look: bi('Minced meat packed in a casing', 'खोल में भरा कीमा मांस'), smell: bi('Spiced and smoky', 'मसालेदार व धुएँदार'), touch: bi('Smooth, springy casing', 'चिकना, लचीला खोल'), texture: bi('Firm and juicy', 'कसा व रसीला'), use: bi('Grills, breakfast, sandwiches', 'ग्रिल, नाश्ता, सैंडविच'), tint: '#fdba74' },
    ],
    wants: [
      { id: 'turmeric', clue: bi('Yellow, earthy powder that colours dal and curry', 'पीला मिट्टी-सा पाउडर जो दाल-करी को रंग देता है') },
      { id: 'soy', clue: bi('Dark, salty liquid condiment for Chinese cooking', 'चाइनीज़ पकाई हेतु गहरा नमकीन तरल मसाला-सामग्री') },
      { id: 'sausage', clue: bi('Processed meat product — spiced mince packed in a casing', 'प्रसंस्कृत मांस उत्पाद — खोल में मसालेदार कीमा') },
    ] },
];

export default function MarketSim() {
  const L = useLang();
  const [level, setLevel] = useState(0);
  const [key, setKey] = useState(0);
  const run = useRun('m2Market', 3 * 3 * 10);
  const [basket, setBasket] = useState<Record<number, string[]>>({ 0: [], 1: [], 2: [] });
  const [seen, setSeen] = useState<string | null>(null);
  const { toast, say } = useToast();
  const lv = LEVELS[level];
  const items = useShuffled(lv.items, key * 3 + level);
  const got = basket[level];
  const levelDone = (i: number) => (basket[i] ?? []).length >= 3;
  const allDone = [0, 1, 2].every(levelDone);
  const item = lv.items.find((i) => i.id === seen) ?? null;
  useEffect(() => { if (allDone) run.finish(); /* eslint-disable-next-line */ }, [allDone]);

  const drop = (zone: string | null, id: string) => {
    if (zone !== 'basket') return;
    if (got.includes(id)) return;
    const it = lv.items.find((x) => x.id === id)!;
    if (lv.wants.some((w) => w.id === id)) {
      const nb = { ...basket, [level]: [...got, id] }; setBasket(nb); run.add(10);
      playClickSound('success');
      say('ok', L(`${it.en} (${it.fr}) is in the basket — ${it.use.en}.`, `${it.hi} (${it.fr}) टोकरी में — ${it.use.hi}।`));
    } else {
      run.miss();
      playClickSound('error');
      say('bad', L(`${it.en} is not on your list. Inspect it, then match it to a clue.`, `${it.hi} आपकी सूची में नहीं है। जाँचें, फिर संकेत से मिलाएँ।`));
    }
  };
  const hint = () => {
    run.hint();
    const w = lv.wants.find((x) => !got.includes(x.id)); if (!w) return;
    const it = lv.items.find((x) => x.id === w.id)!;
    setSeen(null); say('info', L(`Look for: ${it.look.en}.`, `खोजें: ${it.look.hi}।`));
  };
  const replay = () => { run.reset(); setBasket({ 0: [], 1: [], 2: [] }); setLevel(0); setSeen(null); setKey((k) => k + 1); say('info', null); };

  return (
    <FoodShell accent={T.accent} Icon={T.Icon} title={L('Virtual Market: Find the Items', 'वर्चुअल बाज़ार: सामग्री खोजें')}
      subtitle={L('Tap an item to inspect it by sight, smell and touch, then drag or tap to add the items that match your clues into the basket.', 'सामग्री को छूकर देखें, सूँघें और परखें, फिर संकेतों से मिलती सामग्री टोकरी में खींचें या जोड़ें।')}>
      {run.done ? (
        <FinishCard run={run} accent={T.accent} onReplay={replay} summary={[L('3 stalls completed', '3 स्टॉल पूरे'), L('9 items identified', '9 सामग्री पहचानी')]} />
      ) : (
        <>
          <ChefBrief
            station={L('Hotel Central Receiving & Pantry Dock', 'होटल मुख्य माल-प्राप्ति व पैंट्री डॉक')}
            role={L('Apprentice Commis Chef', 'प्रशिक्षु कॉमी शेफ़')}
            task={L('Chef de Cuisine handed you today\'s banquet requisition. Inspect incoming produce by appearance, aroma, texture, and French culinary terminology, then select the exact items needed for the menu.', 'शेफ़ द कुइज़ीन ने आपको आज की बैंक्वेट मांग-सूची सौंपी है। आने वाली उपज को रूप, गंध, बनावट और फ़्रांसीसी पाक शब्दावली से परखें, फिर मेन्यू हेतु सही सामग्री चुनें।')}
            standard={L('Grade 10 CBSE Food Production · Block 2', 'कक्षा 10 फ़ूड प्रोडक्शन · ब्लॉक 2')}
          />
          <ProTip
            title={level === 0 ? L('Pantry Inspection Rule', 'पैंट्री जाँच नियम') : level === 1 ? L('Herb & Continental Handling', 'जड़ी-बूटी व कॉन्टिनेंटल नियम') : L('Meat & Spice Quality Rule', 'मांस व मसाला गुणवत्ता नियम')}
            text={level === 0
              ? L('Look for firm bulbs with dry papery skin. Soft necks or green sprouts mean the onion is ageing and will spoil stocks.', 'सूखे कागज़ी छिलके वाले कसे कंद देखें। नरम गर्दन या हरी कोंपल का अर्थ है प्याज़ पुराना है और स्टॉक खराब करेगा।')
              : level === 1
              ? L('Delicate herbs like basil and parsley bruise easily if cut with dull knives. In the kitchen, inspect for bright green leaves without dark moisture spots.', 'बेसिल व पार्सले भोथरे चाकू से दबकर काले पड़ जाते हैं। रसोई में काले गीले धब्बों रहित चमकीले हरे पत्ते देखें।')
              : L('Spices release their volatile flavour oils in hot fat (160°C). Fresh raw poultry must be moist and pale pink, kept strictly under 4°C separate from vegetables!', 'मसाले 160°C गर्म वसा में सुगंधित तेल छोड़ते हैं। ताज़ा कच्चा चिकन नम, हल्का गुलाबी और सब्ज़ियों से अलग 4°C से कम पर रखा जाना चाहिए!')}
          />
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <Levels n={3} value={level} onChange={(i) => { setLevel(i); setSeen(null); say('info', null); }} accent={T.accent} labels={LEVELS.map((l, i) => `${i + 1}. ${levelDone(i) ? '✓ ' : ''}${L(l.title.en, l.title.hi).split(' ')[0]}`)} />
            <Hud run={run} accent={T.accent} />
          </div>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: withAlpha(T.accent, 0.3) }}>
            <div className="px-4 py-2 text-white text-sm font-bold flex items-center gap-2" style={{ background: `repeating-linear-gradient(90deg, ${T.accent} 0 24px, #fff 24px 48px)`, textShadow: '0 1px 3px rgba(0,0,0,.6)' }}>
              <span className="bg-black/40 px-2 rounded">{L(lv.title.en, lv.title.hi)}</span>
            </div>
            <div className="p-3" style={{ background: 'linear-gradient(#fffbeb, #fef3c7)' }}>
              <div className="rounded-xl bg-white/80 border border-amber-200 p-3 mb-3" data-testid="wants">
                <p className="text-xs font-bold mb-1.5" style={{ color: T.accent }}>{L('Shopping list — find these', 'खरीद सूची — ये खोजें')}</p>
                <ul className="space-y-1">
                  {lv.wants.map((w, i) => { const ok = got.includes(w.id); return (
                    <li key={w.id} className={`text-xs flex gap-2 ${ok ? 'text-green-700 font-bold line-through' : 'text-stone-700'}`}><span className="font-bold">{i + 1}.</span>{L(w.clue.en, w.clue.hi)}{ok && ' ✓'}</li>
                  ); })}
                </ul>
              </div>
              <div className="grid grid-cols-4 gap-2" data-testid="shelf">
                {items.map((it) => {
                  const inB = got.includes(it.id);
                  return (
                    <DragChip key={it.id} id={it.id} onDrop={drop} disabled={inB}>
                      <button onClick={() => setSeen(it.id)} data-item={it.id}
                        className={`w-full rounded-xl border-2 p-2 text-center transition-all ${seen === it.id ? 'scale-105 ring-2 ring-blue-500 shadow-sm' : ''}`}
                        style={{ background: it.tint, borderColor: seen === it.id ? T.accent : 'rgba(0,0,0,.08)', opacity: inB ? 0.35 : 1 }}>
                        <div className="h-10 flex items-center justify-center"><ItemVisual item={it} size="sm" /></div>
                        <div className="text-[10px] mt-1 font-semibold text-stone-700 truncate">{seen === it.id || inB ? L(it.en, it.hi) : L('Tap to inspect', 'जाँचने हेतु छुएँ')}</div>
                      </button>
                    </DragChip>
                  );
                })}
              </div>
              <div className="h-2 mt-2 rounded" style={{ background: 'linear-gradient(#a16207,#78350f)' }} />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {item && (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} data-testid="inspect">
                <Card className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <ItemVisual item={item} size="lg" />
                      </div>
                      <div>
                        <p className="font-bold text-sm sm:text-base">{L(item.en, item.hi)}</p>
                        <p className="text-xs text-stone-500">{L('French', 'फ़्रांसीसी')}: <b>{item.fr}</b> · {L('Texture', 'बनावट')}: <b>{L(item.texture.en, item.texture.hi)}</b></p>
                      </div>
                    </div>
                    <button
                      onClick={() => drop('basket', item.id)}
                      disabled={got.includes(item.id)}
                      className="px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-40"
                      style={{ background: T.accent }}
                    >
                      {got.includes(item.id) ? `✓ ${L('In Basket', 'टोकरी में है')}` : `🧺 ${L('Add to Basket', 'टोकरी में जोड़ें')}`}
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg bg-sky-50 p-2"><Eye size={13} className="inline mr-1 text-sky-600" /><b>{L('Look', 'देखें')}:</b> {L(item.look.en, item.look.hi)}</div>
                    <div className="rounded-lg bg-pink-50 p-2"><Wind size={13} className="inline mr-1 text-pink-600" /><b>{L('Smell', 'सूँघें')}:</b> {L(item.smell.en, item.smell.hi)}</div>
                    <div className="rounded-lg bg-amber-50 p-2"><Hand size={13} className="inline mr-1 text-amber-600" /><b>{L('Touch', 'छुएँ')}:</b> {L(item.touch.en, item.touch.hi)}</div>
                  </div>
                  <p className="text-xs text-stone-600"><b>{L('Use', 'उपयोग')}:</b> {L(item.use.en, item.use.hi)}</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          <DropZone id="basket" className="rounded-2xl border-2 border-dashed p-3 flex items-center gap-3 min-h-[64px]" style={{ borderColor: T.accent, background: withAlpha(T.accent, 0.07) }}>
            <ShoppingBasket style={{ color: T.accent }} />
            <div className="flex flex-wrap gap-1.5" data-testid="basket">
              {got.length === 0 && <span className="text-xs text-stone-500">{L('Drag or tap items to add to requisition basket', 'मांग-टोकरी में जोड़ने हेतु सामग्री खींचें या छुएँ')}</span>}
              {got.map((id) => { const it = lv.items.find((x) => x.id === id)!; return <span key={id} className="px-2.5 py-1 rounded-lg bg-green-100 text-green-800 text-xs font-semibold border border-green-300 shadow-xs">{it.emoji} {L(it.en, it.hi)} · {it.fr} ✓</span>; })}
            </div>
          </DropZone>
          {levelDone(level) && level < 2 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-3 bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-green-900 dark:text-green-200">🎉 {L('Stall Completed!', 'स्टॉल पूरा हुआ!')}</p>
                <p className="text-xs text-green-700 dark:text-green-300">{L('All required culinary requisitions procured safely.', 'सभी आवश्यक पाक सामग्री सुरक्षित रूप से प्राप्त हुई।')}</p>
              </div>
              <button
                onClick={() => { setLevel(level + 1); setSeen(null); say('info', null); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95"
                style={{ background: T.accent }}
              >
                {L('Next Stall', 'अगला स्टॉल')} →
              </button>
            </motion.div>
          )}
          <div className="flex items-center gap-2"><HintButton onHint={hint} accent={T.accent} /></div>
          <Toast {...toast} />
        </>
      )}
    </FoodShell>
  );
}
