// ===== src/utils/islamicHelpers.js =====
export const getIslamicGreeting = () => {
  const greetings = [
    'Assalamu Alaikum',
    'Barakallahu feek',
    'May Allah bless you'
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
};

export const getIslamicPhrase = (context) => {
  const phrases = {
    gratitude: ['Alhamdulillah', 'Barakallahu feek', 'Jazakallahu khair'],
    hope: ['Inshallah', 'Bi-idhnillah', 'Allah willing'],
    blessing: ['Barakallahu feek', 'May Allah bless you', 'Fi amanillah']
  };
  
  const contextPhrases = phrases[context] || phrases.gratitude;
  return contextPhrases[Math.floor(Math.random() * contextPhrases.length)];
};

export const formatIslamicDate = (date) => {
  // This would integrate with a proper Hijri calendar library
  // For demonstration purposes
  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhu al-Qada', 'Dhu al-Hijjah'
  ];
  
  // This is a simplified conversion - in production use a proper library
  const gregorianDate = new Date(date);
  const hijriYear = gregorianDate.getFullYear() - 579; // Rough approximation
  const monthIndex = gregorianDate.getMonth();
  
  return `${gregorianDate.getDate()} ${islamicMonths[monthIndex]} ${hijriYear}H`;
};