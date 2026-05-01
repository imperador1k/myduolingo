<div align="center">
  <h1>🦀 MyDuolingo Core Backend (Tauri / Rust)</h1>
  <p><strong>A Alma Silenciosa e Poderosa da App Desktop</strong></p>

  [![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](#)
  [![Tauri v2](https://img.shields.io/badge/Tauri_v2-FFC131?style=for-the-badge&logo=Tauri&logoColor=white)](#)
</div>

---

## ⚙️ Visão Geral

Esta pasta (`src-tauri`) é o coração da versão Desktop da plataforma MyDuolingo. Enquanto o frontend vive no React, é aqui que toda a magia do sistema operativo acontece. 

Construído puramente em **Rust** utilizando o ecossistema **Tauri v2**, este backend substitui o antigo Electron, oferecendo uma pegada de memória *absurdamente* menor (cerca de 10x menos pesada) e uma segurança inabalável.

## 🔌 Responsabilidades Principais (The Native Bridge)

Este não é um simples empacotador de webviews. O nosso código Rust gere funções que um website comum nunca conseguiria fazer:

1.  **Manipulação de Janelas Nativas:** Lógica para remover os limites do Windows (frameless), desenhar barras de navegação customizadas em React, e injetar Glassmorphism a nível do SO (Vibrancy).
2.  **Gestão de Processos:** Controlo de execução, minimização inteligente para o System Tray (Área de Notificação), e interceção do fecho da app.
3.  **Local Storage Segura:** Comunicação I/O extremamente rápida e segura entre o browser da app (WebView2 no Windows) e o disco duro do utilizador.
4.  **Permissões e Isolamento:** Cada comunicação do React para o Rust passa por uma ponte rigorosamente validada (`tauri.conf.json`), garantindo um ambiente *Zero Trust*.

## 📂 Estrutura Relevante

*   `src/main.rs`: O ponto de entrada. Regista os plugins, handlers (comandos) e inicia a aplicação.
*   `Cargo.toml`: O gestor de pacotes nativos do Rust (o "package.json" de esteróides).
*   `tauri.conf.json`: O coração da configuração do Tauri. É aqui que definimos as permissões avançadas, nome do binário final (`myduolingo.exe`), identificadores globais e configurações do compilador.
*   `build.rs`: O script pré-compilação que prepara ícones e assets de sistema.

## 🚀 Como Compilar a App Principal (Produção)

Este comando deve ser executado **na raiz do projeto principal** (não dentro desta pasta):

```bash
# Prepara a build de produção de toda a App e gera o binário .exe / .msi
npm run tauri build
```

---
> 🧠 **Nota de Arquitetura:**
> Se precisares de alterar a forma como o Windows instala a app, não mexas aqui. O MyDuolingo possui o seu próprio sistema customizado de Setup. Dirige-te à pasta `/installer` na raiz do projeto.
