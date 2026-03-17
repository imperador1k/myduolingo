<div align="center">
  
  # 🚀 MyDuolingo — Plataforma Gamificada de Aprendizagem de Idiomas
  
  *Uma aplicação de nível enterprise, aumentada por IA, construída para performance, retenção e escala.*

  ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
  ![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.31-C5F74F?logo=drizzle)
  ![Clerk Auth](https://img.shields.io/badge/Clerk_Auth-Seguro-6C47FF?logo=clerk)
  ![Google AI](https://img.shields.io/badge/Gemini_AI-Integrado-4285F4?logo=google)

</div>

<br/>

## 📖 O Pitch
**MyDuolingo** é um sistema de aprendizagem de idiomas altamente interativo e gamificado que combina mecânicas comprovadas de retenção (estilo Duolingo) com o poder dinâmico da Inteligência Artificial Generativa. Inclui um ginásio de vocabulário com *active recall*, lições adaptativas e geração de contexto em tempo real por IA — tudo embrulhado numa interface premium e *headless*, optimizada para desktop e mobile.

---

## 🔥 Funcionalidades-Chave

- **🧠 Contexto & Gramática com IA:** Utiliza a API REST do Gemini para fornecer dicas inteligentes e contextuais, explicando erros gramaticais de forma dinâmica — ao contrário das plataformas estáticas tradicionais.
- **⚡ Ginásio de *Active Recall* Gamificado:** Um motor dedicado de "Sprint de Vocabulário" com mecânicas de *Typing* e *Swipe*, construído com atualizações optimistas de UI e animações Lottie de recompensa.
- **🛡️ Lógica de Lição Adaptativa (Motor de Repetição):** Implementa princípios de psicologia da aprendizagem — perguntas respondidas incorretamente são dinamicamente adicionadas ao final da fila de lição, garantindo domínio antes da conclusão.
- **🛒 Sistema de Progressão & Economia:** Ciclo completo de gamificação incluindo Corações (Vidas), Ofensivas (*Streaks*), Pontos XP e uma Loja com *power-ups* (Escudos de Coração, Boosts de XP).
- **📱 UI Tátil & *Headless*:** Arquitectura de componentes altamente polida, *mobile-first*, usando Tailwind CSS, com layouts *split-screen*, zonas de *drag-and-drop* e feedback sonoro tipo háptico.

---

## 🏗️ Arquitectura do Sistema

O repositório segue convenções rigorosas de Next.js a nível enterprise, priorizando renderização no servidor, segurança de tipos e execução *edge-ready*.

- **Framework:** **Next.js 14 (App Router)** — Escolhido pelas capacidades avançadas de routing, React Server Components (RSC) e optimizações de SEO integradas.
- **Base de Dados & ORM:** **PostgreSQL via Neon** com **Drizzle ORM** — Queries SQL extremamente rápidas e estritamente tipadas, sem o peso de ORMs tradicionais.
- **Autenticação:** **Clerk** — Autenticação segura e *plug-and-play* com sincronização transparente por webhooks para a tabela interna de utilizadores.
- **Gestão de Estado:** **Zustand** — Estado global leve (ex.: filtros de vocabulário) combinado com `useTransition` nativo do React para atualizações optimistas de UI durante mutações na base de dados.

### Estrutura do Repositório
```
├── scripts/                # Seeders de BD, pipelines de automação Python e parsers JSON
├── src/
│   ├── app/                # Next.js App Router (Layouts, Páginas, Server Components)
│   ├── actions/            # Server Actions do Next.js (Mutações com validação auth rigorosa)
│   ├── components/         # Arquitectura React Organizada
│   │   ├── ui/             # Componentes primitivos reutilizáveis (Botões, Loaders)
│   │   ├── modals/         # Diálogos e Modais centralizados
│   │   └── shared/         # Componentes de domínio, orientados a composição
│   ├── db/                 # Definição do Schema Drizzle e singletons de queries
│   ├── hooks/              # Hooks React personalizados (ex.: useUISounds)
│   └── lib/                # Configurações de LLM, Utilitários, Constantes
```

---

## 🤖 Engenharia Aumentada por IA (Abordagem de Desenvolvimento)

Esta aplicação foi engenhada usando um **paradigma de Engenharia Aumentada por IA**. Embora a arquitectura central, o schema da base de dados, os fluxos de UX e a visão do produto tenham sido manualmente arquitectados com padrões rigorosos de engenharia, programadores-parceiros de IA (Gemini/OpenAI) foram fortemente utilizados para:

1. **Acelerar a Geração de Componentes:** Scaffolding rápido de componentes UI complexos e layouts Tailwind.
2. **Automação do Pipeline de Dados:** Scripts Python na pasta `scripts/` foram escritos para automaticamente processar, gerar e estruturar dados JSON de cursos via LLMs antes de os injectar na base de dados PostgreSQL.
3. **Tradução Dinâmica & Prompts:** A aplicação interage diretamente com LLMs para gerar "Dicas" em tempo real sem codificar milhares de regras gramaticais.

Esta abordagem demonstra a capacidade de agir como **Tech Lead/Arquitecto**, delegando detalhes de implementação tediosos à IA enquanto mantém controlo rigoroso sobre segurança do sistema, sincronização de estado e qualidade final do código.

---

## 🚀 Instalação Local

Para correr este projecto localmente, certifica-te que tens o Node.js 20+ instalado.

### 1. Clonar & Instalar
```bash
git clone https://github.com/your-username/myduolingo.git
cd myduolingo
npm install
```

### 2. Variáveis de Ambiente
Cria um ficheiro `.env` na raiz do projecto com base no seguinte modelo. Precisarás de chaves para o Clerk (Auth), Neon/PostgreSQL (BD) e Google AI (Gemini).

```env
# Base de Dados
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"

# Autenticação (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# APIs de IA
GEMINI_API_KEY="AIzaSy..."

# Notificações Push (Opcional)
NEXT_PUBLIC_ONESIGNAL_APP_ID="..."
```

### 3. Migração & Seeding da Base de Dados
Envia o schema Drizzle para a tua base de dados e executa o script de seeding.
```bash
npx drizzle-kit push
npx tsx scripts/seed.ts
```

### 4. Servidor de Desenvolvimento
```bash
npm run dev
```
Navega para `http://localhost:3000` para interagir com a plataforma.

---
<div align="center">
  <i>Arquitectado com paixão. Engenhado para performance.</i>
</div>
