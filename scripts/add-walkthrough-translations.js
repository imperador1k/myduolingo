/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const messagesDir = path.join(__dirname, "../messages");
const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith(".json"));

const translations = {
  pt: {
    done: "Let's Go!",
    next: "Próximo",
    prev: "Voltar",
    progress: "{{current}} / {{total}}",

    welcome_title: "Boas-vindas à MyDuolingo!",
    welcome_desc:
      "Prepara-te para a viagem! Prometo não te raptar a família se falhares uma lição... para já. 😈",

    learn_title: "O Teu Mapa",
    learn_desc:
      "Onde a magia acontece! Faz lições, ganha XP e alimenta o teu ego. Não percas a ofensiva!",

    practice_title: "Prática com IA",
    practice_desc:
      "Fala com os meus amigos robôs! Eles não julgam o teu sotaque (muito).",

    leaderboard_title: "Ligas",
    leaderboard_desc:
      "Aqui é onde as amizades acabam. Chega ao Top 3 ou chora a tentar! 🏆",

    quests_title: "Missões Diárias",
    quests_desc:
      "Tarefas fáceis para pessoas incríveis. Completa-as e rouba baús cheios de tesouros! 🎯",

    shop_title: "A Loja",
    shop_desc:
      "Gasta as moedas que ganhaste a suar. Compras vidas ou fatos giros para mim! 🛍️",

    ready_title: "Tudo Pronto!",
    ready_desc:
      "Sobreviveste ao tutorial! Agora vai lá aprender antes que eu perca a paciência. ✨",
  },
  en: {
    done: "Let's Go!",
    next: "Next",
    prev: "Back",
    progress: "{{current}} / {{total}}",

    welcome_title: "Welcome to MyDuolingo!",
    welcome_desc:
      "Get ready for the journey! I promise not to kidnap your family if you miss a lesson... for now. 😈",

    learn_title: "Your Map",
    learn_desc:
      "Where the magic happens! Do lessons, earn XP, and feed your ego. Don't lose that streak!",

    practice_title: "AI Practice",
    practice_desc:
      "Talk to my robot friends! They won't judge your accent (too much).",

    leaderboard_title: "Leagues",
    leaderboard_desc:
      "This is where friendships end. Reach the Top 3 or cry trying! 🏆",

    quests_title: "Daily Quests",
    quests_desc:
      "Easy tasks for awesome people. Complete them and steal treasure chests! 🎯",

    shop_title: "The Shop",
    shop_desc:
      "Spend your hard-earned coins. Buy lives or cute outfits for me! 🛍️",

    ready_title: "All Set!",
    ready_desc:
      "You survived the tutorial! Now go learn before I lose my patience. ✨",
  },
};

for (const file of files) {
  const lang = path.basename(file, ".json");
  const translation = translations[lang] || translations["en"];

  const filePath = path.join(messagesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!data.walkthrough) data.walkthrough = {};
  Object.assign(data.walkthrough, translation);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log(`Updated ${lang}`);
}
