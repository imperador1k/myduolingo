# Architecture Document: Knowledge Feed (TikTok-Style Learning)

**Status:** Implementation In Progress (Phases 1 & 2 completed/ongoing)
**Author:** Staff Data Engineer & Lead System Architect  
**Tech Stack:** Next.js, React, Tailwind CSS, Supabase (PostgreSQL), Groq API, Vercel Cron

---

## 1. Estratégia de Ingestão de Dados (The Source)

Para garantir um fluxo infinito de conteúdo interessante a custo zero, utilizaremos APIs públicas gratuitas que fornecem dados formatados.

### Fontes de Dados (Data Sources)

- **Reddit API (formato `.json` livre de autenticação agressiva):**
  - Endpoints: `https://www.reddit.com/r/todayilearned/top.json?limit=15&t=day` e `https://www.reddit.com/r/science/top.json?limit=15&t=day`.
  - _Porquê:_ Fornecem curiosidades validadas pela comunidade (high upvotes) perfeitas para micro-aprendizagem.
- **Wikipedia API ("On this day"):**
  - Endpoint: `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/{MM}/{DD}`
  - _Porquê:_ Factos históricos interessantes e curtos.

### Infraestrutura de Ingestão

- **Hospedagem do Cron Job:** **Vercel Cron Jobs**. Permite invocar um Endpoint de API (`/api/cron/ingest-feed`) de forma calendarizada, sem servidores dedicados.
- **Cadência:** 1 vez por dia, às **03:00 UTC** (Off-peak hours).
- **Volume:** Extração dos 30 melhores posts combinados (15 de TIL, 10 de Science, 5 da Wikipedia). Isto gera ~900 posts por mês por idioma, mais do que suficiente para o _swipe_ diário.

---

## 2. O Pipeline de Inteligência Artificial (Tradução e Formatação)

Os dados crus em inglês precisam de ser traduzidos e adaptados ao nível do utilizador (ex: A2/B1) e às línguas suportadas pela plataforma.

### Processador de IA

- **Fornecedor:** **Groq API** (Focada em LPU para inferência ultra-rápida e custo reduzido).
- **Modelo:** `llama-3.1-8b-instant`. Rápido, leve, excelente a seguir esquemas JSON rígidos.

### Gestão de Rate Limits (Groq TPM = 6000)

Para não esgotar os 6000 Tokens Per Minute no Free Tier:

1.  **Batching e Delays:** O Cron Job fará um processamento sequencial (ou em _batches_ de 3 posts de cada vez).
2.  **Throttle Loop:** Após processar cada batch (assumindo ~500 tokens por post, total de 1500 tokens por batch), o Vercel Edge Function ou a API Route implementará um `await new Promise(r => setTimeout(r, 15000))` (delay de 15s) antes do próximo batch.
3.  **Vercel Timeout Limits:** Visto que a versão _free_ do Vercel limita as API Routes a 10s (ou 60s no Pro), a ingestão poderá ser dividida por categorias ou disparada através de um sistema de filas (ex: _Upstash Redis / QStash_) para delegar as execuções e contornar os timeouts.

### O System Prompt

```text
You are an expert language teacher and translator.
Convert the provided English trivia fact into {TARGET_LANGUAGE} adapted for a {CEFR_LEVEL} learner.
Keep the language natural but accessible. Use common vocabulary.

You must reply with a STRICT JSON object containing exactly these fields:
{
  "title": "A short, engaging title (max 6 words).",
  "category": "One of: TECHNOLOGY, HISTORY, SCIENCE, CULTURE, RANDOM.",
  "body": "The translated fact, split into 2-3 short sentences. Max 350 characters total."
}

Do not include markdown blocks or any other text. Return ONLY the JSON object.
```

Do not include markdown blocks or any other text. Return ONLY the JSON object.

````

---

## 3. O Creator Economy (User Generated Content)

Para complementar a ingestão automática (APIs), permitimos que a própria comunidade crie conteúdo para o Feed, aumentando o engajamento e a retenção.

### O Fluxo de Submissão
*   **Interface:** Botão flutuante (+) no Feed abre um Modal Gamificado.
*   **Criação:** O utilizador escreve um facto/curiosidade (máx. 350 caracteres).
*   **Moderação por IA (Automática):** O facto é enviado para um Edge Function (Groq LLaMA 3.1) que verifica instantaneamente se o conteúdo é educativo, útil e livre de agressividade/nudez.
    *   Se aprovado: Extrai o Título, Categoria e Atribui Cores (bgClass), inserindo na tabela `knowledge_posts` com `status = 'APPROVED'` e o `author_id`.
    *   Se chumbado ou suspeito: O post é classificado como `REJECTED` ou `PENDING` (não aparecendo no feed global).

---

## 4. Arquitetura da Base de Dados (Supabase / PostgreSQL)

A base de dados tem de suportar queries de leitura hiper-eficientes para alimentar os utilizadores rapidamente à medida que fazem *swipe*.

### Schema (Implementado)

> [!NOTE]
> Os dados são estáticos e partilhados. Vários utilizadores aprendendo o mesmo idioma consumirão a mesma linha na tabela `knowledge_posts`.

**Tabelas Implementadas em `src/db/schema.ts`:**
*   `knowledge_posts`: A curiosidade em si (title, body, category, level, target_language, status, author_id).
*   `user_read_history`: Registo de posts já lidos pelo utilizador (usado pelo algoritmo de filtragem).
*   `knowledge_likes`: Registo de Likes (gamificação social).
*   `knowledge_saves`: Registo de posts guardados no "Cofre de Conhecimento".

### Estratégia de Indexação
Para o *Feed* do utilizador, a query típica vai procurar "Posts no idioma X e nível Y, que o utilizador Z ainda não leu".
```sql
CREATE INDEX idx_kp_lang_level ON knowledge_posts(target_language, cefr_level);
````

**A Query Principal e O Algoritmo TikTok (Concluído):**
O Feed é construído usando _Server Actions_ (`getFeedPosts`).

1.  **Filtro:** Vai buscar o ID de todos os posts na tabela `user_read_history` do utilizador logado.
2.  **Fetch:** Pede posts à tabela `knowledge_posts` que estejam `APPROVED` e _cujo ID não esteja_ no histórico lido (`notInArray`).
3.  **Shuffle:** Embaralha os resultados com SQL puro (`ORDER BY RANDOM()`) para um feeling de TikTok genuíno.
4.  **Tracking Invisible:** O frontend usa `IntersectionObserver` nas `divs` com `.snap-start`. Assim que o post está 60% visível, dispara o `markPostAsRead` via Server Action invisível (Fire and Forget).

---

## 5. A Camada de Apresentação (Frontend & UX) - Parcialmente Concluída

A UX foi desenhada para ser viciante, com Light/Dark mode nativo e scroll magnético puro (CSS Snap).

### Física do Swipe (CSS Scroll Snap Nativo)

Para replicar a sensação do TikTok de forma ultra-rápida em Desktop/Mobile:

- Container: `overflow-y-scroll snap-y snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]`.
- Suporte a drag físico no rato em PCs adicionado manualmente no `onMouseMove`.
- Modos claro e escuro separados dinamicamente.

### Camada Social e Viral (Concluída)

- **Likes:** Server Actions que incrementam Likes em Realtime (optimistic UI).
- **Saves:** O utilizador guarda para rever e treinar no "Cofre de Conhecimento" (`/feed/saved`).
- **Shares:** Integração direta com a tabela de conversas (`messages`) usando amizades mútuas (Share Bottom Sheet nativa).

### O Dicionário Fantasma (Tap-to-Translate)

Para garantir que o utilizador aprende palavras difíceis no imediato, sem chamadas caras à IA:

1.  **Frontend Splitting:** O `body` do texto será dividido em tokens/palavras. Ex: `{body.split(' ').map(word => <span onClick={() => handleTap(word)}>{word}</span>)}`.
2.  **Dicionário Leve:** Usaremos a API pública gratuita do **Google Translate/MyMemory API** ou um Edge Function que faz um mapeamento direto do dicionário num Worker. O resultado aparece como uma _Tooltip_ nativa, flutuante por cima do ecrã, quase instantaneamente, sem travar a navegação.

---

## 6. O Plano de Execução em Fases (Roadmap)

A arquitetura está a ser executada iterativamente.

### ✅ Fase 1: Frontend e Core UI (Mock Data) - CONCLUÍDO

- **Foco:** Aperfeiçoar o "feeling" do TikTok e o Scroll Magnético (CSS Native).
- Criar o Ecrã de _Feed_ com Snap e gamificação tipo Duolingo.
- Suporte a Light/Dark Mode total.
- Implementar a divisão de palavras para o "Dicionário Fantasma".

### ✅ Fase 2: Lógica Backend, BD e Creator Economy - CONCLUÍDO

- **Foco:** Armazenamento, Interação Social e Algoritmo de Tracking.
- (✅) Criar as tabelas `knowledge_posts`, `user_read_history`, `knowledge_likes`, `knowledge_saves`.
- (✅) Criar a lógica de partilha direta via Chat (Friends Modal).
- (✅) Implementar a mecânica Creator Economy (Utilizadores a criar, IA a aprovar, DB a guardar).
- (✅) Ligar Frontend à Base de Dados: Fetch Server Actions `getFeedPosts()` e Tracker via IntersectionObserver.
- (✅) Atualizar o Cofre de Conhecimento (`/feed/saved`) com dados reais.

### 🚧 Fase 3: O Dicionário Fantasma - PARCIALMENTE CONCLUÍDO

- (PENDENTE) Ligar a ação de clique nas palavras a uma API gratuita de tradução rápida (MyMemory API).

### ⏳ Fase 4: O Motor de IA Diário (Ingestion) - PENDENTE

- **Foco:** O Pipeline de Produção Diário.
- Escrever o script que liga ao Reddit (`.json`) e limpa HTML.
- Integrar a SDK do Groq com o `llama-3.1-8b-instant`, passando o _System Prompt_ rigoroso.
- Criar o sistema de _Throttling/Batching_ para respeitar o limite de 6000 TPM.
- Alojar o processo na Vercel ou QStash e agendar o _Cron_ diário.
