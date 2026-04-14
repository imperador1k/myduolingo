# Design Spec: Input Atómico Estilo Discord (Marco Chat)

Este documento descreve a implementação premium do sistema de input para o Marco Chat, permitindo que comandos como `/docs` ou `/reviews` sejam tratados como unidades visuais e funcionais (tokens) em qualquer parte do texto.

## Proposta de Arquitetura: "Token-List Editor"

Para evitar os problemas clássicos de manipulação de cursor em `contentEditable`, vamos seguir uma abordagem baseada em "Segmentos de Estado". O input deixará de ser uma string única e passará a ser uma lista de objetos.

### 1. Modelo de Dados
```typescript
type InputSegment = 
  | { type: 'text'; content: string }
  | { type: 'command'; cmd: string; icon: string; color: string }
```

### 2. Fluxo de Interação
1. **Digitação**: O utilizador escreve num `span` ou `input` invisível que cresce dinamicamente.
2. **Transformação**: Ao selecionar um comando no menu `/`, o segmento de texto atual é "fechado", um segmento de `command` é inserido, e um novo segmento de texto é aberto.
3. **Eliminação (Backspace)**: Se o cursor estiver no início de um segmento de texto e o utilizador carregar em Backspace, o "Token" anterior é removido por inteiro (comportamento atómico).

---

## Design Visual e Componentes

### O Contentor (`MarcoRichInput`)
- Um `div` com `flex-wrap`, fundo `stone-100`, bordas arredondadas e o clássico `border-b-4`.
- Simula visualmente um input de uma única linha mas permite o "wrap" se o utilizador escrever muito.

### Os Tokens (`CommandChip`)
- **Estilo**: Fundo colorido (baseado na cor do comando), texto branco ou saturado, bordas arredondadas (estilo pílula).
- **Ícone**: Pequeno emoji/ícone à esquerda (ex: 📖 para `/docs`).
- **Animação**: Um pequeno *bounce* ao aparecer (zoom-in-95).

### Sincronização com AI
Antes de chamar o `askMarco`, o componente converterá a lista de segmentos numa string plana.
Exemplo: `[{type:'text', content:'Vê o '}, {type:'command', cmd:'/docs'}]` → `"Vê o /docs"`

---

## Alternativas Consideradas

| Abordagem | Prós | Contras |
| :--- | :--- | :--- |
| **Mirror Overlay** | Muito simples de implementar. | Não permite selecionar/apagar o token como uma unidade atómica real. |
| **ContentEditable** | Feeling de editor de texto nativo. | Extremamente difícil de manter a posição do cursor em React (muitos bugs). |
| **Token-List (Nossa)** | **Super robusto, fácil de estilizar e 100% atómico.** | Exige uma lógica de gestão de focos entre segmentos (que eu tratarei). |

---

## Verificação e Testes
- **Teste A**: Digitar `/docs` e clicar na opção -> Verificar se vira uma pílula.
- **Teste B**: Apagar com backspace -> Verificar se a pílula desaparece de uma vez.
- **Teste C**: Ver se o Marco responde corretamente ao comando embutido.

> [!IMPORTANT]
> Miguel, esta abordagem é a mais profissional para o efeito pretendido. Estás de acordo com esta estrutura de "Tokens" para avançarmos para a execução?
