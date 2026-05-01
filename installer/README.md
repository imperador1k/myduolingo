<div align="center">
  <img src="./public/icon.png" width="120" alt="MyDuolingo Installer Logo" />
  <h1>🚀 MyDuolingo Web-Installer & Uninstaller</h1>
  <p><strong>A Premium, Feedback-Driven, Single-Binary Custom Setup Engine</strong></p>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=Tauri&logoColor=white)](#)
  [![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](#)
</div>

---

## 🌟 O que é isto?

A maioria das aplicações usa os instaladores padrão e cinzentos do Windows. Nós queríamos proporcionar uma experiência de **nível Elite** (estilo JetBrains / Adobe) desde o primeiro clique. 

Esta pasta contém um projeto Tauri/React **completamente independente** que serve como o motor de Instalação e Desinstalação da aplicação principal. 

## 🏗️ Arquitetura "Single-Binary" Avançada

Para poupar espaço e manter a elegância, este instalador adota uma arquitetura **Duas Caras (Single-Binary)**. Um único executável `.exe` (de cerca de 8MB) faz tudo, dependendo do nome com que é executado:

*   **Modo SETUP (`*setup.exe` ou `*installer.exe`):**
    *   Exibe um design Glassmorphism imersivo.
    *   Descarrega o binário mais recente silenciosamente do GitHub via stream.
    *   Executa o instalador NSIS invisivelmente em *background*.
    *   Executa um "Hijack" no Registo do Windows para substituir o desinstalador padrão por si próprio.
*   **Modo UNINSTALL (`*uninstall.exe`):**
    *   Exibe um Formulário de Feedback (Feedback-Driven Uninstallation).
    *   Limpa atalhos e as chaves de Registo do Windows.
    *   **Auto-Destruição Kamikaze:** Gera um script `.bat` na cache do Windows que mata a app, apaga todos os ficheiros locais e depois apaga-se a si próprio sem deixar rasto.

## 🎨 Design System
O frontend foi construído com **React** e **CSS Puro**, focado em performance extrema e beleza:
*   Múltiplos gradientes radiais.
*   *Backdrop filters* (Glassmorphism).
*   Micro-interações fluídas.
*   Barra de título customizada (`data-tauri-drag-region`).

## 🛠️ Como Compilar para Produção

Se pretendes contribuir ou gerar o instalador do zero, certifica-te de que o teu URL no `src-tauri/src/lib.rs` aponta para o teu release no GitHub.

```bash
# 1. Instalar dependências Node
npm install

# 2. Compilar o binário Windows (.exe)
npm run tauri build
```
O teu executável final com poderes mágicos estará em:
`src-tauri/target/release/myduolingo-installer.exe`

---
> Desenvolvido com 🥷 sabedoria para proporcionar a melhor UI/UX desde o primeiro contacto.
