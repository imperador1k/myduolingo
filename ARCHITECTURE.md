# Visão Geral da Arquitectura

Este documento descreve a arquitectura de alto nível, a camada de dados, a estratégia de integração com IA e o pipeline de conteúdo da plataforma MyDuolingo.

---

## 1. Visão Geral do Sistema

MyDuolingo é uma aplicação **Next.js 14 (App Router)** que corre na edge com uma separação clara entre **Server Components** (fetching de dados, SEO) e **Client Components** (interactividade, animações).

### Estratégia Server vs. Client Components

| Responsabilidade | Tipo de Componente | Porquê |
|---|---|---|
| Shells de página, layouts, fetching de dados | Server Component | Zero JS no cliente; os dados são obtidos no momento do pedido com `cache()` e transmitidos via React Suspense. |
| Lições interactivas, modais, sons | Client Component (`"use client"`) | Necessita de APIs do browser (`useSound`, `useState`, Lottie). Mantidos como nós-folha para minimizar o tamanho do bundle. |
| Mutações (XP, corações, ofensivas) | Server Action (`"use server"`) | Corre exclusivamente no servidor; valida autenticação via Clerk antes de tocar na BD. Revalida os caminhos afectados ao concluir. |

### Routing

```
app/
├── (main)/          # Layout autenticado com sidebar + navegação mobile
│   ├── learn/       # Mapa de lições (Server Component)
│   ├── courses/     # Grelha do catálogo de cursos
│   ├── practice/    # Módulos de prática com IA (escrita, fala, leitura, audição)
│   ├── shop/        # Loja da economia in-game
│   ├── leaderboard/ # Ranking de XP
│   ├── profile/     # Estatísticas do utilizador + conquistas
│   └── messages/    # Chat em tempo real
├── lesson/          # Execução de lição (Client Component — interactividade pesada)
└── page.tsx         # Página de aterragem pública (sem auth)
```

---

## 2. Camada de Dados

### ORM & Base de Dados

- **Base de Dados**: PostgreSQL alojado no **Supabase** (pooler compatível com Neon).
- **ORM**: **Drizzle ORM** — escolhido pela sua API zero-abstração, semelhante a SQL, que produz queries totalmente type-safe sem overhead em runtime.
- **Migrações**: Geridas via `drizzle-kit push` (abordagem schema-first, sem ficheiros SQL manuais).

### Visão Geral do Schema

```
courses ──< units ──< lessons ──< challenges ──< challenge_options
                                       │
                                       ├──< challenge_progress  (conclusão por utilizador)
                                       └──< challenge_mistakes   (fila da Clínica de Corações)

user_progress ──< user_vocabulary   (cofre pessoal de palavras)
              ──< follows           (grafo social)
              ──< notifications
              ──< messages
              ──< practice_sessions (exercícios gerados por IA)
              ──< placement_test_history
```

**Decisões de design chave:**
- `user_progress` armazena o estado de gamificação (corações, XP, ofensivas, power-ups) numa única linha por utilizador, evitando queries pesadas em JOINs a cada carregamento de página.
- `user_vocabulary` implementa um sistema de **Repetição Espaçada** com escala de força (1–4: Semente → Dominada) para o motor de Sprint de Vocabulário.
- `challenge_mistakes` alimenta a **Clínica de Corações** — um ciclo de remediação onde os utilizadores re-tentam desafios falhados para ganhar corações sem gastar XP.

### Regeneração Passiva de Corações

Os corações auto-restauram para 5 após 5 horas de inactividade. Esta verificação corre **preguiçosamente** dentro de `getUserProgress()` — sem cron jobs ou workers em background. A query compara `lastHeartChange` com `Date.now()` e escreve de volta se o limiar for excedido.

---

## 3. Integração com IA

### Provider

Todas as chamadas de IA generativa usam a **API Google Gemini** (`gemini-2.5-flash`) via o SDK `@google/generative-ai`.

### Estratégia de Cache (BD-First)

Para minimizar custos de API e latência, cada funcionalidade dependente de IA verifica a base de dados antes de invocar o modelo:

```
Utilizador clica numa palavra → getWordTranslation()
  ├── Passo 1: SELECT de user_vocabulary WHERE word = ? AND userId = ?
  │   └── HIT  → retorna tradução em cache instantaneamente (0 chamadas API)
  └── Passo 2 (cache miss): Chama Gemini com prompt contextual
      └── Retorna tradução gerada por IA (utilizador pode guardá-la no cofre)
```

Este padrão repete-se nos sistemas de vocabulário, prática e dicas.

### Sistema de Prompts Dinâmicos

Cada idioma tem uma **Persona de IA** definida em `src/lib/ai-config.ts`:

| Idioma | Persona | Personalidade |
|---|---|---|
| Inglês | System C3 | Professor rigoroso de Oxford |
| Espanhol | Maria | Guia amigável e paciente |
| Francês | Jean-Pierre | Crítico parisiense arrogante |
| Português | João | Amigo descontraído |

Estas personas são injectadas em cada prompt para assegurar respostas de IA culturalmente apropriadas e consistentes com o personagem, em correcções de escrita, feedback de fala e dicas de vocabulário.

### Linha de Vida IA (Dicas no Sprint)

Durante sessões de Sprint de Vocabulário, os utilizadores podem solicitar uma **Dica IA** — uma mnemónica criativa que os ajuda a recordar a tradução *sem revelar a resposta*. Trata-se de uma chamada Gemini separada com instruções explícitas para evitar a tradução directa.

---

## 4. Gestão de Estado & UI

### Estado no Cliente

- **Zustand** para estado global leve (ex.: filtros de vocabulário).
- **React `useTransition`** para atualizações optimistas de UI durante mutações de Server Actions (ex.: atualizar corações sem esperar pelo round-trip da BD).
- **React `cache()`** envolve todas as queries de leitura para desduplicar fetches idênticos dentro de um único ciclo de pedido.

### Framework de UI

- **Tailwind CSS 3.4** para toda a estilização — sem CSS de bibliotecas de componentes. Cada componente usa uma paleta curada de design tokens (não as cores padrão do Tailwind).
- **Radix UI** primitivas (Dialog, Slot) para componentes interactivos acessíveis e sem estilização pré-definida.
- **Lottie-React** para animações de recompensa (ecrãs de conclusão, interacções com o mascote).
- **use-sound** para feedback áudio tipo háptico (click, whoosh, SFX de recompensa).

### Design Sonoro

O hook `useUISounds` centraliza cinco sprites de áudio pré-carregados. Os componentes invocam `playReward()`, `playWhoosh()`, etc. sem gerir elementos `<audio>`, assegurando feedback de gamificação consistente em toda a app.

---

## 5. Pipeline de Conteúdo

O conteúdo dos cursos (unidades, lições, desafios, opções) é gerado via um pipeline semi-automatizado na pasta `scripts/`:

```
1. prompt_maker.py    → Gera prompts estruturados de IA para conteúdo de cursos
2. content_pipeline.py → Chama Gemini para produzir JSON de desafios a partir dos prompts
3. conteudo.json       → Dados brutos gerados por IA (formato intermédio)
4. json_to_sql.py      → Transforma JSON em instruções INSERT compatíveis com Drizzle
5. seed.ts / add-*.ts  → Seeders TypeScript que enviam dados para PostgreSQL
```

Este pipeline permite expansão rápida de cursos: define-se um idioma + tema, executa-se o pipeline, e uma unidade completa de desafios imersivos é gerada e injectada na base de dados. O papel humano é **curadoria e controlo de qualidade** — rever o output da IA antes de fazer commit para produção.

---

## 6. Autenticação & Segurança

- **Clerk** trata toda a autenticação (providers OAuth, gestão de sessões, JWTs).
- **Middleware** (`src/middleware.ts`) protege todas as rotas excepto a página de aterragem e assets estáticos.
- Cada Server Action valida `auth()` antes de qualquer operação na base de dados — não existe estado fiável no lado do cliente.
- Os metadados do utilizador Clerk (nome, avatar) são sincronizados para a tabela local `user_progress` no login via `onSyncUserInfo()`, para que as páginas de leaderboard e perfil nunca façam chamadas à API do Clerk em runtime.
