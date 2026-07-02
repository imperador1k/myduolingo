const fs = require('fs');
const path = require('path');

const seoData = {
  en: { title: "Faro — Learn Languages by Playing", description: "Learn new languages in a fun, interactive, and gamified way. Compete in weekly leagues, earn XP, and join your friends!", keywords: "learn languages, learn english, gamification, online languages, faro app, learn languages for free" },
  pt: { title: "Faro — Aprende Línguas a Jogar", description: "Aprende novos idiomas de forma divertida, interativa e gamificada. Compete em ligas semanais, ganha XP e junta-te aos teus amigos!", keywords: "aprender idiomas, aprender inglês, gamificação, línguas online, faro app, aprender línguas grátis" },
  es: { title: "Faro — Aprende Idiomas Jugando", description: "Aprende nuevos idiomas de forma divertida, interactiva y gamificada. ¡Compite en ligas semanales, gana XP y únete a tus amigos!", keywords: "aprender idiomas, aprender inglés, gamificación, idiomas online, faro app, aprender idiomas gratis" },
  fr: { title: "Faro — Apprenez des Langues en Jouant", description: "Apprenez de nouvelles langues de manière ludique, interactive et ludifiée. Affrontez des ligues hebdomadaires, gagnez de l'XP et rejoignez vos amis !", keywords: "apprendre des langues, apprendre l'anglais, gamification, langues en ligne, application faro, apprendre des langues gratuitement" },
  de: { title: "Faro — Sprachen lernen durch Spielen", description: "Lernen Sie neue Sprachen auf unterhaltsame, interaktive und spielerische Weise. Treten Sie in wöchentlichen Ligen an, sammeln Sie XP und schließen Sie sich Ihren Freunden an!", keywords: "Sprachen lernen, Englisch lernen, Gamification, Online-Sprachen, Faro App, Sprachen kostenlos lernen" },
  it: { title: "Faro — Impara le Lingue Giocando", description: "Impara nuove lingue in modo divertente, interattivo e gamificato. Competi nei campionati settimanali, guadagna XP e unisciti ai tuoi amici!", keywords: "imparare le lingue, imparare l'inglese, gamification, lingue online, app faro, imparare le lingue gratis" },
  ja: { title: "Faro — 遊びながら言語を学ぶ", description: "楽しく、インタラクティブで、ゲーム化された方法で新しい言語を学びます。毎週のリーグで競い合い、XPを獲得して、友達と合流しましょう！", keywords: "言語を学ぶ, 英語を学ぶ, ゲーミフィケーション, オンライン言語, Faroアプリ, 無料で言語を学ぶ" },
  ar: { title: "Faro — تعلم اللغات باللعب", description: "تعلم لغات جديدة بطريقة ممتعة وتفاعلية ومليئة بالألعاب. تنافس في الدوريات الأسبوعية، واكسب نقاط الخبرة، وانضم إلى أصدقائك!", keywords: "تعلم اللغات, تعلم الإنجليزية, التلعيب, اللغات عبر الإنترنت, تطبيق faro, تعلم اللغات مجانًا" },
  hi: { title: "Faro — खेलकर भाषाएँ सीखें", description: "मजेदार, इंटरैक्टिव और गेमिफाइड तरीके से नई भाषाएँ सीखें। साप्ताहिक लीग में प्रतिस्पर्धा करें, XP कमाएं और अपने दोस्तों से जुड़ें!", keywords: "भाषाएं सीखें, अंग्रेजी सीखें, गेमिफिकेशन, ऑनलाइन भाषाएं, फारो ऐप, मुफ्त में भाषाएं सीखें" },
  uk: { title: "Faro — Вивчайте мови, граючи", description: "Вивчайте нові мови у веселий, інтерактивний та гейміфікований спосіб. Змагайтеся в щотижневих лігах, заробляйте XP та приєднуйтесь до друзів!", keywords: "вивчення мов, вивчення англійської, гейміфікація, онлайн мови, додаток faro, безкоштовне вивчення мов" }
};

const messagesDir = path.join(__dirname, 'messages');

fs.readdirSync(messagesDir).forEach(file => {
  if (file.endsWith('.json')) {
    const lang = file.replace('.json', '');
    if (seoData[lang]) {
      const filePath = path.join(messagesDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      data.seo = seoData[lang];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Patched ${file}`);
    }
  }
});
