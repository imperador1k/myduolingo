<div align="center">
  
  # 🚀 MyDuolingo — Plataforma Gamificada de Aprendizagem de Idiomas
  
  *Uma aplicação SaaS de nível enterprise, aumentada por IA e construída para performance, retenção e escala maciça.*

  ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
  ![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.31-C5F74F?logo=drizzle)
  ![Clerk Auth](https://img.shields.io/badge/Clerk_Auth-Seguro-6C47FF?logo=clerk)
  ![Google AI](https://img.shields.io/badge/Gemini_AI-Integrado-4285F4?logo=google)
  ![Supabase Realtime](https://img.shields.io/badge/Supabase_Realtime-WebSockets-3ECF8E?logo=supabase)
  ![Security](https://img.shields.io/badge/Supabase_RLS-Zero_Trust-red?logo=security)
  ![Zod](https://img.shields.io/badge/Zod-Validation-3068b7?logo=zod)

</div>

<br/>

## 📖 O Pitch
**MyDuolingo** não é apenas um clone académico; é um motor de retenção ed-tech *state-of-the-art*. Combina mecânicas comprovadas de gamificação com uma pipeline de **Inteligência Artificial Generativa** server-side, comunicação de alta fiabilidade em **Real-Time WebSockets**, e uma robusta fundação de **DevSecOps Zero-Trust**. Orientado por uma interface modular, tátil e polida, este sistema entrega uma experiência de escala-global logo a partir do *localhost*.

---

## 🔥 Funcionalidades-Chave Enterprise

- **🧠 Headless CMS & AI Pipeline:** Longe vão os dias de JSONs estáticos. Um painel `/admin` construído com hierarquias de permissão RBAC permite gerar currículos linguísticos infinitos com apenas alguns cliques, emparelhando *Server Actions* TypeScript com o SDK Gemini 2.5 e gestão de ficheiros media via Supabase Storage.
- **⚡ Motor Real-Time (WebSockets):** Interconectividade social imaculada com chat 1-a-1 usando a infraestrutura Realtime do Supabase. Canais otimizados transmitem atividade "*Presence*" (estados "Online" via green dot e indicadores "A escrever...") de forma efémera (`0` custos de escrita na BD), com updates na interface a orbitar lógicas de *Optimistic UI*.
- **🛡️ DevSecOps & Anti-Cheat Engine:** Confiabilidade em primeiro lugar. Um motor blindado valida rigidamente as interações da gamificação; payloads passam crivos estreitos em **Zod**, enquanto que as aprovações de pontos (XP e recompensas) decorrem atrás do perímetro opressivo do Servidor (`Server Actions` verificadas). Isto liga-se com Políticas Supabase *Row Level Security* (RLS) destrancadas temporariamente por um inquebrável JWT fabricado pelo Clerk.
- **🏆 Economia Híbrida e Sistema Leaderboard:** Retenção movida por dopamina gamificada. Um loop implacável processa XP semanal distribuindo títulos e posições no *Leaderboard* Top 50 global. Decorado ao lado de sistemas passivos de Vidas (regeneradas a cada 5 horas no servidor), Escudos, Congeladores de Ofensivas, e uma Loja In-Game com power-ups ativos.
- **📱 Dinâmicas UI/UX Premium:** Arquitetura CSS superlativa utilizando abstrações Bento-Grid da camada Tailwind CSS. O interface transborda animações micro-reativas, interações de arrastar-e-largar e sons hápticos de gratificação embutidos localmente à app via `use-sound`.

---

## 🏗️ Arquitetura do Sistema

O repousitório segue convenções de design puramente corporativas utilizando Next.js App Router para fragmentação extrema entre *Client Edge* e as execuções restritas de back-end.

- **Routing & React:** Renderização central de *Server Components (RSC)* balanceada com mutações assíncronas *Server Actions* - eliminando assim instâncias completas de Redux e Axios para obtenções de base de dados seguras contra vulnerabilidades.
- **Base de Dados & Mutação Typada:** Base relacional **PostgreSQL** manipulada sob supervisões estritas e de alto-foco emitidas pelo **Drizzle ORM**.
- **Identidade Fragmentada:** **Clerk** governa a Autenticação.

### Estrutura Modular
```text
├── src/
│   ├── app/                # Endpoints Next Router & Páginas Server
│   ├── actions/            # Engine de Mutações de Servidor (+ Lógicas Anti-Cheat)
│   ├── components/
│   │   ├── chat/           # Hooks de Subscrição Realtime Presence & Storage
│   │   ├── admin/          # Interfaces do CMS Gerador de Inteligência Artificial
│   │   └── ui/             # Entidades Radix UI Primitivas
│   ├── db/                 # Migrações Server Drizzle e DDL
│   └── lib/                # Configurações JWT, Webhooks e Wrappers AI Auth
```

---

## 🚀 Desdobramento Local (Installation Roadmap)

Arrancar a máquina num Node.js Environment superior à versão 20.x

### 1. Clonar & Bootstrap
```bash
git clone https://github.com/your-username/myduolingo.git
cd myduolingo
npm install
```

### 2. Ambientes de Variáveis (A Matriz)
Dota o teu `.env` e `.env.local` de capacidades omnipotentes preenchendo as seguintes integrações (PostgreSQL Edge, Chaves de Admin Clerk e Segredos do modelo de Inteligência da Google).

```env
# Relacionais
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"

# Autenticadores
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Modelos
GEMINI_API_KEY="AIzaSy..."

# Redes de Alta Frequência (Realtime DB)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### 3. Migração da Camada Física
Compila o teu schema contra a infraestrutura base.

```bash
npx drizzle-kit push
```

### 4. Ignição do Servidor de Desenvolvimento
```bash
npm run dev
```

E entra em `http://localhost:3000` para experimentares o futuro de como a engenharia de Front-end combina com os ecossistemas AI.

---
<div align="center">
  <i>Arquitetado com paixão. Blindado via SecOps. Engenhado para Escala Máxima.</i>
</div>
