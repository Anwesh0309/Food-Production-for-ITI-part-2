import type { Dict } from './en';

/** हिन्दी UI strings. */
export const hi: Dict = {
  appName: 'खाद्य उत्पादन',
  appSub: 'मॉड्यूल 2 · उन्नत स्किल लैब',
  nav: { home: 'सभी यूनिट', unit: 'यूनिट', progress: 'मेरी प्रगति', resetProgress: 'प्रगति रीसेट करें', language: 'भाषा', dark: 'डार्क मोड', light: 'लाइट मोड', soundOn: 'ध्वनि म्यूट करें', soundOff: 'ध्वनि चालू करें', openMenu: 'मेनू खोलें', closeMenu: 'मेनू बंद करें' },
  home: {
    title: 'उन्नत इंटरैक्टिव स्किल लैब',
    kicker: 'खाद्य उत्पादन · मॉड्यूल 2',
    subtitle: (n: number) => `${n} उन्नत यूनिट · व्यावहारिक रसोई सिमुलेशन · English & हिन्दी`,
    progress: 'प्रगति', xp: 'अर्जित XP', simsDone: 'पूरी की गई लैब', unitsDone: 'पूर्ण यूनिट',
    start: 'सीखना शुरू करें', resume: 'जारी रखें', stages: 'हर यूनिट में सात सीखने के चरण',
    done: 'पूर्ण', sim: 'उन्नत सिमुलेशन', simDone: 'पूरा', unitWord: 'यूनिट',
  },
  stages: {
    watch: { name: 'देखें', desc: 'एनिमेटेड चरण-दर-चरण अवलोकन' },
    read: { name: 'पढ़ें', desc: 'सिद्धांत, शब्दावली व सूत्र' },
    practice: { name: 'अभ्यास', desc: 'हर रसोई कार्य पर निशान लगाएँ' },
    simulate: { name: 'सिमुलेट', desc: 'उन्नत इंटरैक्टिव सिमुलेशन' },
    quiz: { name: 'क्विज़', desc: 'अपनी समझ जांचें' },
    apply: { name: 'लागू करें', desc: 'वास्तविक रसोई निर्णय व सुरक्षा' },
    review: { name: 'समीक्षा', desc: 'आपका प्रदर्शन व समापन' },
  },
  unit: {
    notFound: 'यूनिट नहीं मिली', back: 'सभी यूनिट पर वापस', module: 'मॉड्यूल 2', syllabus: 'पाठ्यक्रम', completed: 'पूर्ण',
    step: 'चरण', play: 'चलाएँ', pause: 'रोकें', objectives: 'सीखने के उद्देश्य', keyTopics: 'मुख्य विषय',
    terminology: 'महत्वपूर्ण शब्दावली', formulas: 'सूत्र व गणना',
    practiceHelp: 'हर कार्य को रसोई में या मानसिक रूप से करें, फिर उस पर निशान लगाएँ।',
    simHelp: 'नीचे दिए गए उन्नत सिमुलेशन को पूरा करें — हर क्रिया पर यह तुरंत प्रतिक्रिया देता है।',
    loadingSim: 'लोड हो रहा है…', simMissing: 'सिमुलेशन उपलब्ध नहीं',
    question: 'प्रश्न ', submit: 'उत्तर जमा करें', score: 'स्कोर: ', tryAgain: 'पुनः प्रयास',
    decisions: 'वास्तविक रसोई निर्णय', allDecisions: 'सभी निर्णय पूरे!', safety: 'सुरक्षा व स्वच्छता', applications: 'उद्योग अनुप्रयोग',
    summary: 'सारांश', performance: 'आपका प्रदर्शन', takeaways: 'मुख्य बिंदु',
    perfWatch: 'देखें (सभी चरण)', perfPractice: 'अभ्यास कार्य', perfSim: 'सिमुलेशन', best: 'सर्वश्रेष्ठ', perfQuiz: 'क्विज़ (≥ 60%)', perfApply: 'निर्णय परिदृश्य',
    completeUnit: 'यूनिट पूर्ण करें (+50 XP)', unitDone: 'यह यूनिट पूरी हो चुकी है!', nextUnit: 'अगली यूनिट', previous: 'पिछला', next: 'अगला',
  },
};
