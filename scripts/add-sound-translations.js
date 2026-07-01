/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const messagesDir = path.join(__dirname, "../messages");
const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith(".json"));

const translations = {
  pt: {
    sound_title: "Sons e Efeitos",
    sound_description: "Ativa ou desativa os efeitos sonoros da app.",
    sound_on: "Ligado",
    sound_off: "Desligado",
  },
  en: {
    sound_title: "Sounds & Effects",
    sound_description: "Enable or disable app sound effects.",
    sound_on: "On",
    sound_off: "Off",
  },
  es: {
    sound_title: "Sonidos y Efectos",
    sound_description: "Activa o desactiva los efectos de sonido.",
    sound_on: "Encendido",
    sound_off: "Apagado",
  },
  fr: {
    sound_title: "Sons et Effets",
    sound_description: "Activez ou désactivez les effets sonores.",
    sound_on: "Activé",
    sound_off: "Désactivé",
  },
  de: {
    sound_title: "Töne und Effekte",
    sound_description: "Aktivieren oder deaktivieren Sie Soundeffekte.",
    sound_on: "Ein",
    sound_off: "Aus",
  },
  it: {
    sound_title: "Suoni ed Effetti",
    sound_description: "Attiva o disattiva gli effetti sonori dell'app.",
    sound_on: "Acceso",
    sound_off: "Spento",
  },
  ja: {
    sound_title: "サウンドと効果",
    sound_description: "アプリのサウンドエフェクトを有効または無効にします。",
    sound_on: "オン",
    sound_off: "オフ",
  },
  ar: {
    sound_title: "الأصوات والتأثيرات",
    sound_description: "تفعيل أو تعطيل تأثيرات الصوت في التطبيق.",
    sound_on: "تشغيل",
    sound_off: "إيقاف",
  },
  uk: {
    sound_title: "Звуки та Ефекти",
    sound_description: "Увімкніть або вимкніть звукові ефекти додатка.",
    sound_on: "Увімк.",
    sound_off: "Вимк.",
  },
  hi: {
    sound_title: "ध्वनियाँ और प्रभाव",
    sound_description: "ऐप ध्वनि प्रभाव सक्षम या अक्षम करें।",
    sound_on: "चालू",
    sound_off: "बंद",
  },
};

for (const file of files) {
  const lang = path.basename(file, ".json");
  if (!translations[lang]) continue;

  const filePath = path.join(messagesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!data.settings_components) data.settings_components = {};
  Object.assign(data.settings_components, translations[lang]);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log(`Updated ${lang}`);
}
