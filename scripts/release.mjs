import { execSync } from 'child_process';
import fs from 'fs';

const type = process.argv[2];
if (!['patch', 'minor', 'major'].includes(type)) {
  console.log("\n❌ ERRO: Precisas de indicar o tipo de atualização.");
  console.log("Usa: npm run release -- patch | minor | major");
  console.log("  - patch (ex: 0.1.0 -> 0.1.1): Para correções de bugs");
  console.log("  - minor (ex: 0.1.0 -> 0.2.0): Para novas funcionalidades");
  console.log("  - major (ex: 0.1.0 -> 1.0.0): Para grandes lançamentos\n");
  process.exit(1);
}

console.log(`\n🚀 A iniciar o lançamento da tua App (Atualização tipo: ${type})...\n`);

try {
  // 1. Atualizar o package.json
  console.log(`[1/4] A calcular a nova versão...`);
  execSync(`npm version ${type} --no-git-tag-version`, { stdio: 'inherit' });

  // Ler a nova versão
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const newVersion = pkg.version;

  // 2. Sincronizar o tauri.conf.json com a nova versão
  console.log(`\n[2/4] A atualizar a versão do Tauri para v${newVersion}...`);
  const tauriConfPath = 'src-tauri/tauri.conf.json';
  const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
  tauriConf.version = newVersion;
  fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');

  // 3. Criar o commit e a tag no Git
  console.log(`\n[3/4] A preparar os ficheiros para o GitHub (v${newVersion})...`);
  execSync(`git add package.json package-lock.json ${tauriConfPath}`);
  execSync(`git commit --no-verify -m "chore: release v${newVersion}"`);
  execSync(`git tag v${newVersion}`);

  // 4. Enviar tudo para o GitHub
  console.log(`\n[4/4] A enviar a nova versão para os servidores do GitHub...`);
  execSync(`git push origin main`, { stdio: 'inherit' });
  execSync(`git push origin v${newVersion}`, { stdio: 'inherit' });

  console.log(`\n✅ SUCESSO ABSOLUTO! 🎉`);
  console.log(`O GitHub acabou de receber a tua versão v${newVersion}.`);
  console.log(`Neste exato momento, o GitHub Actions está a compilar o executável invisivelmente.`);
  console.log(`Daqui a 5 a 10 minutos, o lançamento estará completo na página de Releases!`);
  console.log(`Todos os utilizadores que abrirem o Faro vão receber a notificação de atualização!\n`);

} catch (error) {
  console.error(`\n❌ Ocorreu um erro durante o lançamento!`);
  console.error(`Verifica se tens ficheiros pendentes para fazer 'git commit' antes de correr este script.\n`);
  process.exit(1);
}
