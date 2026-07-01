/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const newKeys = {
  ar: {
    sign_in_title: "تسجيل الدخول",
    sign_in_subtitle: "قم بتسجيل الدخول لحفظ تقدمك",
  },
  de: {
    sign_in_title: "Anmelden",
    sign_in_subtitle: "Melde dich an, um deinen Fortschritt zu speichern",
  },
  en: {
    sign_in_title: "Sign In",
    sign_in_subtitle: "Sign in to save your progress",
  },
  es: {
    sign_in_title: "Entrar",
    sign_in_subtitle: "Inicia sesión para guardar tu progreso",
  },
  fr: {
    sign_in_title: "Se connecter",
    sign_in_subtitle: "Connectez-vous pour sauvegarder votre progression",
  },
  hi: {
    sign_in_title: "साइन इन करें",
    sign_in_subtitle: "अपनी प्रगति को सहेजने के लिए साइन इन करें",
  },
  it: {
    sign_in_title: "Accedi",
    sign_in_subtitle: "Accedi per salvare i tuoi progressi",
  },
  ja: {
    sign_in_title: "ログイン",
    sign_in_subtitle: "進行状況を保存するにはログインしてください",
  },
  pt: {
    sign_in_title: "Entrar",
    sign_in_subtitle: "Inicia sessão para salvar o teu progresso",
  },
  uk: {
    sign_in_title: "Увійти",
    sign_in_subtitle: "Увійдіть, щоб зберегти свій прогрес",
  },
};

const dirs = Object.keys(newKeys);

for (const lang of dirs) {
  const file = path.join(__dirname, "..", "messages", `${lang}.json`);
  let content = fs.readFileSync(file, "utf8");
  let json = JSON.parse(content);

  if (!json.Auth) json.Auth = {};
  json.Auth.sign_in_title = newKeys[lang].sign_in_title;
  json.Auth.sign_in_subtitle = newKeys[lang].sign_in_subtitle;

  fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
}
console.log("Keys added!");
