const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'messages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

const enData = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf-8'));

function fillMissing(source, target) {
  let changed = false;
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
        changed = true;
      }
      if (fillMissing(source[key], target[key])) {
        changed = true;
      }
    } else {
      if (target[key] === undefined) {
        target[key] = source[key]; // fallback to English
        changed = true;
      }
    }
  }
  return changed;
}

for (const file of files) {
  if (file === 'en.json') continue;
  const filePath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  const changed = fillMissing(enData, data);
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Filled missing keys in ${file}`);
  }
}
