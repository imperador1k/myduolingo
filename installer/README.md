# MyDuolingo Premium Installer 🚀

Este diretório contém o código-fonte do instalador customizado para a aplicação MyDuolingo. Desenvolvido com **Tauri v2**, **React** e **Rust**, este instalador oferece uma experiência visual premium inspirada no *JetBrains Toolbox*.

## 🏗️ Arquitetura
O instalador funciona como um **Bootstrap Installer** (Web Installer):
1.  **UI:** Interface frameless e transparente com Glassmorphism.
2.  **Core (Rust):** Gere o download assíncrono do binário oficial via HTTPS.
3.  **Deployment:** Executa a instalação silenciosa (`/S`) do binário principal.

## 🚀 Como gerar uma nova versão
Para atualizar o instalador oficial, siga estes passos:

### 1. Build da App Principal
Na raiz do projeto:
```bash
npm run tauri build
```
O binário será gerado em `src-tauri/target/release/bundle/msi/`.

### 2. Upload para GitHub Releases
1.  Vá para [GitHub Releases](https://github.com/imperador1k/myduolingo/releases).
2.  Crie uma nova Release (ex: `v0.1.0`).
3.  Carregue o ficheiro `.msi` gerado no passo anterior.
4.  Copie o link direto do download (ex: `https://github.com/.../download/v0.1.0/MyDuolingo.msi`).

### 3. Atualizar o Instalador
No ficheiro `installer/src-tauri/src/lib.rs`, atualize a variável `url`:
```rust
let url = "O_TEU_LINK_COPIADO_AQUI";
```

### 4. Build do Instalador
Dentro da pasta `installer/`:
```bash
npm run tauri build
```
O executável final para os utilizadores estará em `installer/src-tauri/target/release/bundle/nsis/`.

## 🌐 Funcionalidades Profissionais
- **i18n:** Suporte nativo para Português e Inglês.
- **EULA:** Checkbox de aceitação de termos obrigatória.
- **Security:** Abertura de links externos via Shell segura do Tauri.
- **UX:** Feedback de progresso em tempo real do download.

---
Desenvolvido com ❤️ por Miguel Santos.
