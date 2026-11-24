/** English UI strings (unit content itself is bilingual in src/data). */
export const en = {
  appName: 'Food Production',
  appSub: 'Module 2 · Advanced Skill Lab',
  nav: { home: 'All units', unit: 'Unit', progress: 'My progress', resetProgress: 'Reset progress', language: 'Language', dark: 'Dark mode', light: 'Light mode', soundOn: 'Mute sound', soundOff: 'Unmute sound', openMenu: 'Open menu', closeMenu: 'Close menu' },
  home: {
    title: 'Advanced Interactive Skill Lab',
    kicker: 'Food Production · Module 2',
    subtitle: (n: number) => `${n} advanced units · hands-on kitchen simulations · English & हिन्दी`,
    progress: 'Progress', xp: 'XP earned', simsDone: 'Labs completed', unitsDone: 'Units completed',
    start: 'Start learning', resume: 'Continue', stages: 'Seven learning stages in every unit',
    done: 'Done', sim: 'Advanced simulation', simDone: 'completed', unitWord: 'Unit',
  },
  stages: {
    watch: { name: 'Watch', desc: 'Animated step-by-step overview' },
    read: { name: 'Read', desc: 'Theory, terminology and formulas' },
    practice: { name: 'Practice', desc: 'Tick off each kitchen task' },
    simulate: { name: 'Simulate', desc: 'Advanced interactive simulation' },
    quiz: { name: 'Quiz', desc: 'Check your understanding' },
    apply: { name: 'Apply', desc: 'Real kitchen decisions & safety' },
    review: { name: 'Review', desc: 'Your performance and completion' },
  },
  unit: {
    notFound: 'Unit not found', back: 'Back to all units', module: 'Module 2', syllabus: 'Syllabus', completed: 'Completed',
    step: 'Step', play: 'Play', pause: 'Pause', objectives: 'Learning objectives', keyTopics: 'Key topics',
    terminology: 'Key terminology', formulas: 'Formulas & calculations',
    practiceHelp: 'Do each task in the kitchen or mentally, then tick it off.',
    simHelp: 'Complete the advanced simulation below — it gives instant feedback on every action.',
    loadingSim: 'Loading simulation…', simMissing: 'Simulation unavailable',
    question: 'Q', submit: 'Submit answers', score: 'Score: ', tryAgain: 'Try again',
    decisions: 'Real kitchen decisions', allDecisions: 'All decisions made!', safety: 'Safety & hygiene', applications: 'Industry applications',
    summary: 'Summary', performance: 'Your performance', takeaways: 'Key takeaways',
    perfWatch: 'Watch (all steps)', perfPractice: 'Practice tasks', perfSim: 'Simulation', best: 'best', perfQuiz: 'Quiz (≥ 60%)', perfApply: 'Decision scenarios',
    completeUnit: 'Complete unit (+50 XP)', unitDone: 'This unit is completed!', nextUnit: 'Next unit', previous: 'Previous', next: 'Next',
  },
};
export type Dict = typeof en;
