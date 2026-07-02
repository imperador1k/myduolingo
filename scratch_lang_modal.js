const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'messages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

const translations = {
  en: { cancel: "Cancel", confirm: "Confirm" },
  pt: { cancel: "Cancelar", confirm: "Confirmar" },
  es: { cancel: "Cancelar", confirm: "Confirmar" },
  fr: { cancel: "Annuler", confirm: "Confirmer" },
  de: { cancel: "Abbrechen", confirm: "Bestätigen" },
  it: { cancel: "Annulla", confirm: "Conferma" },
  ja: { cancel: "キャンセル", confirm: "確認" },
  ar: { cancel: "إلغاء", confirm: "تأكيد" },
  hi: { cancel: "रद्द करें", confirm: "पुष्टि करें" },
  uk: { cancel: "Скасувати", confirm: "Підтвердити" }
};

for (const file of files) {
  const lang = file.replace('.json', '');
  if (!translations[lang]) continue;

  const filepath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

  if (!data.settings_components) data.settings_components = {};
  
  data.settings_components.cancel = translations[lang].cancel;
  data.settings_components.confirm = translations[lang].confirm;

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n');
  console.log(`Updated ${file}`);
}
