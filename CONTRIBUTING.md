# Guia de Contribuição

Obrigado pelo vosso interesse em contribuir para o **MyDuolingo**! Este documento descreve as convenções e o fluxo de trabalho para manter o código limpo e consistente.

---

## Configuração Local

```bash
# 1. Clona o repositório
git clone https://github.com/your-username/myduolingo.git
cd myduolingo

# 2. Instala as dependências
npm install

# 3. Configura as variáveis de ambiente
cp .env.example .env
# Preenche os valores no ficheiro .env

# 4. Envia o schema para a base de dados
npx drizzle-kit push

# 5. (Opcional) Popula a BD com dados de teste
npx tsx scripts/seed.ts

# 6. Inicia o servidor de desenvolvimento
npm run dev
```

---

## Conventional Commits

Todos os commits devem seguir a convenção [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Alterações na documentação |
| `ui:` | Alterações visuais/estéticas sem lógica |
| `refactor:` | Refactoring de código sem alteração de comportamento |
| `chore:` | Tarefas de manutenção (deps, configs, scripts) |
| `test:` | Adição ou correção de testes |

**Exemplos:**
```
feat: adicionar sistema de streak freeze
fix: corrigir regeneração passiva de corações
ui: redesenhar cards de skill na página de avaliação
docs: atualizar ARCHITECTURE.md com secção de AI caching
```

---

## Branching

Usa o seguinte padrão para nomes de branches:

```
feature/nome-da-feature     → Nova funcionalidade
fix/descricao-do-bug         → Correção
ui/componente-ou-pagina      → Alterações visuais
docs/nome-do-documento       → Documentação
```

**Workflow:**
1. Cria uma branch a partir de `main`.
2. Faz os commits seguindo a convenção acima.
3. Abre um Pull Request descritivo.
4. Aguarda revisão (ou faz self-merge se fores o único contributor).

---

## Verificações Antes de Submeter

Antes de abrir um PR, confirma que:

```bash
# TypeScript compila sem erros
npx tsc --noEmit

# Linter passa
npm run lint
```

---

## Estrutura de Pastas

Consulta o [ARCHITECTURE.md](./ARCHITECTURE.md) para entender a organização do projecto e onde colocar novos ficheiros.
