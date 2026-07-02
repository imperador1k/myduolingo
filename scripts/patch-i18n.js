const fs = require("fs");
const path = require("path");

const translations = {
  ar: {
    intro: {
      step1: "مرحبًا! مرحبًا بك في مغامرة التعلم الجديدة الخاصة بك.",
      step2: "تم استلهام هذا التطبيق من Duolingo وتم تصميمه بحب كبير لنتعلم جميعًا معًا.",
      step3: "ستتمكن من التنافس في الدوريات وكسب نقاط الخبرة ولعب الألعاب المصغرة!",
      step4: "هل أنت مستعد؟ دعنا نبدأ!",
      skip: "تخطي",
      next: "متابعة"
    },
    Walkthrough: {
      welcome_title: "مرحبًا بك في MyDuolingo!",
      welcome_desc: "تجربة لعب غامرة. دعني أريك المكان!",
      learn_title: "خريطتك",
      learn_desc: "هنا يحدث السحر! أكمل الدروس، واكسب نقاط الخبرة وغذي غرورك. لا تفقد حماسك!",
      practice_title: "التدريب مع الذكاء الاصطناعي",
      practice_desc: "تدرب على الكتابة والتحدث والقراءة مع روبوتات أصلية في الوقت الفعلي. محاولات غير محدودة!",
      leaderboard_title: "الدوريات التنافسية",
      leaderboard_desc: "هل يمكنك الوصول إلى المراكز الثلاثة الأولى؟ أم ستبكي وأنت تحاول؟",
      quests_title: "المهام اليومية",
      quests_desc: "تحديات جديدة كل يوم لملء صندوق نقاط الخبرة الخاص بك.",
      shop_title: "المتجر",
      shop_desc: "استخدم عملاتك التي كسبتها بشق الأنفس لشراء المعززات والمجمدات والدروع.",
      ready_title: "كل شيء جاهز!",
      ready_desc: "أنت مجهز بالكامل. الآن اخرج وحطم الأرقام القياسية!"
    }
  },
  de: {
    intro: {
      step1: "Hallo! Willkommen zu deinem neuen Lernabenteuer.",
      step2: "Diese App wurde von Duolingo inspiriert und mit viel Liebe entwickelt, damit wir alle zusammen lernen können.",
      step3: "Du kannst in Ligen antreten, XP verdienen und Minispiele spielen!",
      step4: "Bist du bereit? Lass uns anfangen!",
      skip: "Überspringen",
      next: "Weiter"
    },
    Walkthrough: {
      welcome_title: "Willkommen bei MyDuolingo!",
      welcome_desc: "Ein immersives spielerisches Erlebnis. Lass mich dir die Gegend zeigen!",
      learn_title: "Deine Karte",
      learn_desc: "Hier passiert die Magie! Schließe Lektionen ab, verdiene XP und füttere dein Ego. Verliere nicht deine Strähne!",
      practice_title: "KI-Training",
      practice_desc: "Trainiere Schreiben, Sprechen und Lesen mit muttersprachlichen Bots in Echtzeit. Unbegrenzte Versuche!",
      leaderboard_title: "Wettkampfligen",
      leaderboard_desc: "Schaffst du es in die Top 3? Oder wirst du weinend aufgeben?",
      quests_title: "Tägliche Quests",
      quests_desc: "Jeden Tag neue Herausforderungen, um deine XP-Truhe zu füllen.",
      shop_title: "Der Shop",
      shop_desc: "Verwende deine hart verdienten Münzen, um Booster, Einfrierungen und Schilde zu kaufen.",
      ready_title: "Alles bereit!",
      ready_desc: "Du bist voll ausgestattet. Gehe jetzt raus und breche Rekorde!"
    }
  },
  es: {
    intro: {
      step1: "¡Hola! Bienvenido a tu nueva aventura de aprendizaje.",
      step2: "Esta app está inspirada en Duolingo y hecha con mucho amor para que aprendamos todos juntos.",
      step3: "¡Podrás competir en ligas, ganar XP y jugar minijuegos!",
      step4: "¿Estás listo? ¡Vamos a empezar!",
      skip: "Omitir",
      next: "Continuar"
    },
    Walkthrough: {
      welcome_title: "¡Bienvenido a MyDuolingo!",
      welcome_desc: "Una experiencia inmersiva gamificada. ¡Déjame enseñarte el lugar!",
      learn_title: "Tu Mapa",
      learn_desc: "¡Aquí ocurre la magia! Completa lecciones, gana XP y alimenta tu ego. ¡No pierdas la racha!",
      practice_title: "Práctica con IA",
      practice_desc: "Entrena escritura, habla y lectura con bots nativos en tiempo real. ¡Intentos ilimitados!",
      leaderboard_title: "Ligas Competitivas",
      leaderboard_desc: "¿Puedes llegar al Top 3? ¿O vas a llorar intentándolo?",
      quests_title: "Misiones Diarias",
      quests_desc: "Nuevos desafíos todos los días para llenar tu cofre de XP.",
      shop_title: "La Tienda",
      shop_desc: "Usa tus monedas ganadas con esfuerzo para comprar potenciadores, bloqueadores y escudos.",
      ready_title: "¡Todo Listo!",
      ready_desc: "Estás totalmente equipado. ¡Ahora sal ahí fuera y rompe récords!"
    }
  },
  fr: {
    intro: {
      step1: "Bonjour ! Bienvenue dans ta nouvelle aventure d'apprentissage.",
      step2: "Cette application est inspirée de Duolingo et a été créée avec beaucoup d'amour pour que nous puissions tous apprendre ensemble.",
      step3: "Tu pourras participer à des ligues, gagner de l'XP et jouer à des mini-jeux !",
      step4: "Es-tu prêt ? Commençons !",
      skip: "Passer",
      next: "Continuer"
    },
    Walkthrough: {
      welcome_title: "Bienvenue sur MyDuolingo !",
      welcome_desc: "Une expérience ludique immersive. Laisse-moi te faire visiter !",
      learn_title: "Ta Carte",
      learn_desc: "C'est ici que la magie opère ! Termine des leçons, gagne de l'XP et nourris ton ego. Ne perds pas ta série !",
      practice_title: "Entraînement avec IA",
      practice_desc: "Entraîne ton écriture, ton expression orale et ta lecture avec des bots natifs en temps réel. Essais illimités !",
      leaderboard_title: "Ligues Compétitives",
      leaderboard_desc: "Peux-tu atteindre le Top 3 ? Ou vas-tu pleurer en essayant ?",
      quests_title: "Quêtes Quotidiennes",
      quests_desc: "De nouveaux défis chaque jour pour remplir ton coffre d'XP.",
      shop_title: "La Boutique",
      shop_desc: "Utilise tes pièces durement gagnées pour acheter des boosters, des gels et des boucliers.",
      ready_title: "Tout est Prêt !",
      ready_desc: "Tu es entièrement équipé. Maintenant, sors et bats des records !"
    }
  },
  hi: {
    intro: {
      step1: "नमस्ते! आपके नए सीखने के रोमांच में आपका स्वागत है।",
      step2: "यह ऐप डुओलिंगो से प्रेरित है और इसे बहुत प्यार से बनाया गया है ताकि हम सब एक साथ सीख सकें।",
      step3: "आप लीग में प्रतिस्पर्धा कर सकेंगे, XP कमा सकेंगे और मिनीगेम खेल सकेंगे!",
      step4: "क्या आप तैयार हैं? चलिए शुरू करते हैं!",
      skip: "छोड़ें",
      next: "जारी रखें"
    },
    Walkthrough: {
      welcome_title: "MyDuolingo में आपका स्वागत है!",
      welcome_desc: "एक इमर्सिव गेमिफाइड अनुभव। चलिए मैं आपको यहाँ की सैर कराता हूँ!",
      learn_title: "आपका नक्शा",
      learn_desc: "यहीं पर जादू होता है! पाठ पूरे करें, XP कमाएँ और अपने अहंकार को पोषित करें। अपनी स्ट्रीक मत खोना!",
      practice_title: "AI के साथ अभ्यास",
      practice_desc: "वास्तविक समय में देशी बॉट्स के साथ लिखने, बोलने और पढ़ने का अभ्यास करें। असीमित प्रयास!",
      leaderboard_title: "प्रतिस्पर्धी लीग",
      leaderboard_desc: "क्या आप शीर्ष 3 में पहुँच सकते हैं? या आप कोशिश करते हुए रोएंगे?",
      quests_title: "दैनिक खोज",
      quests_desc: "आपके XP चेस्ट को भरने के लिए हर दिन नई चुनौतियाँ।",
      shop_title: "दुकान",
      shop_desc: "बूस्टर, फ्रीज और ढाल खरीदने के लिए अपने मेहनत से कमाए गए सिक्कों का उपयोग करें।",
      ready_title: "सब तैयार!",
      ready_desc: "आप पूरी तरह से सुसज्जित हैं। अब बाहर जाएँ और रिकॉर्ड तोड़ें!"
    }
  },
  it: {
    intro: {
      step1: "Ciao! Benvenuto nella tua nuova avventura di apprendimento.",
      step2: "Questa app è ispirata a Duolingo ed è stata creata con molto amore per farci imparare tutti insieme.",
      step3: "Potrai competere nelle leghe, guadagnare XP e giocare a minigiochi!",
      step4: "Sei pronto? Iniziamo!",
      skip: "Salta",
      next: "Continua"
    },
    Walkthrough: {
      welcome_title: "Benvenuto su MyDuolingo!",
      welcome_desc: "Un'esperienza ludica immersiva. Lascia che ti mostri in giro!",
      learn_title: "La Tua Mappa",
      learn_desc: "Qui avviene la magia! Completa le lezioni, guadagna XP e nutri il tuo ego. Non perdere la serie!",
      practice_title: "Pratica con IA",
      practice_desc: "Allena la scrittura, la pronuncia e la lettura con bot nativi in tempo reale. Tentativi illimitati!",
      leaderboard_title: "Leghe Competitive",
      leaderboard_desc: "Riuscirai ad arrivare in Top 3? O piangerai provandoci?",
      quests_title: "Missioni Giornaliere",
      quests_desc: "Nuove sfide ogni giorno per riempire il tuo forziere di XP.",
      shop_title: "Il Negozio",
      shop_desc: "Usa le tue monete duramente guadagnate per comprare potenziamenti, blocchi e scudi.",
      ready_title: "Tutto Pronto!",
      ready_desc: "Sei completamente equipaggiato. Ora esci e batti i record!"
    }
  },
  ja: {
    intro: {
      step1: "こんにちは！新しい学習の冒険へようこそ。",
      step2: "このアプリはDuolingoに触発され、みんなで一緒に学べるようにたくさんの愛を込めて作られました。",
      step3: "リーグで競争したり、XPを獲得したり、ミニゲームをプレイしたりできます！",
      step4: "準備はいいですか？始めましょう！",
      skip: "スキップ",
      next: "続行"
    },
    Walkthrough: {
      welcome_title: "MyDuolingoへようこそ！",
      welcome_desc: "没入型のゲーム化された体験。ご案内しましょう！",
      learn_title: "あなたのマップ",
      learn_desc: "ここで魔法が起こります！レッスンを完了し、XPを獲得してエゴを養いましょう。連続記録を失わないでください！",
      practice_title: "AIとの練習",
      practice_desc: "リアルタイムでネイティブボットとライティング、スピーキング、リーディングの練習をします。試行回数無制限！",
      leaderboard_title: "競争リーグ",
      leaderboard_desc: "トップ3に入れますか？それとも挑戦中に泣いてしまいますか？",
      quests_title: "デイリークエスト",
      quests_desc: "XPチェストを満たすための毎日の新しい課題。",
      shop_title: "ショップ",
      shop_desc: "苦労して稼いだコインを使って、ブースター、フリーズ、シールドを購入しましょう。",
      ready_title: "準備完了！",
      ready_desc: "完全な装備が整いました。さあ、外に出て記録を破りましょう！"
    }
  },
  uk: {
    intro: {
      step1: "Привіт! Ласкаво просимо до вашої нової навчальної пригоди.",
      step2: "Ця програма натхненна Duolingo і створена з великою любов'ю, щоб ми могли вчитися всі разом.",
      step3: "Ви зможете змагатися в лігах, заробляти XP та грати в міні-ігри!",
      step4: "Ви готові? Почнемо!",
      skip: "Пропустити",
      next: "Продовжити"
    },
    Walkthrough: {
      welcome_title: "Ласкаво просимо до MyDuolingo!",
      welcome_desc: "Захоплюючий ігровий досвід. Дозвольте мені показати вам все!",
      learn_title: "Ваша Карта",
      learn_desc: "Тут відбувається магія! Проходьте уроки, заробляйте XP і годуйте своє его. Не втрачайте свій стрік!",
      practice_title: "Практика з ШІ",
      practice_desc: "Тренуйте письмо, мовлення та читання з нативними ботами в реальному часі. Необмежена кількість спроб!",
      leaderboard_title: "Змагальні Ліги",
      leaderboard_desc: "Чи зможете ви потрапити до Топ-3? Або ви будете плакати, намагаючись?",
      quests_title: "Щоденні Квести",
      quests_desc: "Нові виклики щодня, щоб наповнити вашу скриню з XP.",
      shop_title: "Магазин",
      shop_desc: "Використовуйте свої важко зароблені монети, щоб купувати прискорювачі, заморозки та щити.",
      ready_title: "Все Готово!",
      ready_desc: "Ви повністю екіпіровані. Тепер йдіть і бийте рекорди!"
    }
  },
  en: {
    intro: {
      step1: "Hello! Welcome to your new learning adventure.",
      step2: "This app was inspired by Duolingo and built with a lot of love so we can all learn together.",
      step3: "You'll be able to compete in leagues, earn XP, and play minigames!",
      step4: "Are you ready? Let's get started!",
      skip: "Skip",
      next: "Continue"
    },
    Walkthrough: {
      welcome_title: "Welcome to MyDuolingo!",
      welcome_desc: "An immersive gamified experience. Let me show you around!",
      learn_title: "Your Map",
      learn_desc: "Here is where the magic happens! Complete lessons, earn XP, and feed your ego. Don't lose your streak!",
      practice_title: "AI Practice",
      practice_desc: "Train your writing, speaking, and reading with native bots in real-time. Unlimited tries!",
      leaderboard_title: "Competitive Leagues",
      leaderboard_desc: "Can you reach the Top 3? Or will you cry trying?",
      quests_title: "Daily Quests",
      quests_desc: "New challenges every day to fill your XP chest.",
      shop_title: "The Shop",
      shop_desc: "Use your hard-earned coins to buy boosters, freezes, and shields.",
      ready_title: "All Set!",
      ready_desc: "You're fully equipped. Now go out there and break records!"
    }
  }
};

const localesDir = path.join(process.cwd(), "messages");

Object.keys(translations).forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    
    // Inject the intro namespace if the original json has it capitalized or lowercase
    // Let's assume lowercase 'intro' based on original files, except Walkthrough might be Walkthrough or walkthrough.
    // The user mentioned 'intro' and 'walktrought'.
    
    data.intro = { ...data.intro, ...translations[lang].intro };
    data.walkthrough = { ...data.walkthrough, ...translations[lang].Walkthrough };
    
    // Sometimes they are capitalized
    if (data.Intro) data.Intro = { ...data.Intro, ...translations[lang].intro };
    if (data.Walkthrough) data.Walkthrough = { ...data.Walkthrough, ...translations[lang].Walkthrough };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}.json`);
  }
});
