export type DocCategory = 
    | "Mecânicas Base" 
    | "Gamificação & Loja" 
    | "Competição & Social" 
    | "Modo Arcade" 
    | "Conta & Configurações";

export type DocArticle = {
    id: string;
    slug: string;
    title: string;
    category: DocCategory;
    summary: string;
    content: string;
    icon: string;
};

export const DOCS_ARTICLES: DocArticle[] = [
    // ── MECÂNICAS BASE ──
    {
        id: "base-1",
        slug: "o-que-e-xp",
        title: "O que são os Pontos de Experiência (XP)?",
        category: "Mecânicas Base",
        summary: "Descobre como ganhar XP e porque é que ele é o motor do teu sucesso.",
        icon: "Zap",
        content: `
            <p>Os <strong>Pontos de Experiência (XP)</strong> representam o teu nível global de conhecimento linguístico e o teu esforço na nossa plataforma.</p>
            <p>Sempre que completares exercícios práticos, lições ou desafios do Arcade com sucesso, vais ser recompensado com XP. A quantidade de XP ganha depende de vários fatores:</p>
            <ul>
                <li><strong>Lições Básicas:</strong> Rendem XP padrão baseado na duração da lição.</li>
                <li><strong>Revisões:</strong> Porque a repetição também tem mérito, fazer exercícios de correção também atribui uma quantidade baseada na performance.</li>
                <li><strong>Combos:</strong> Respostas perfeitas seguidas aumentam o multiplicador!</li>
            </ul>
            <p>O XP é essencial não só para medir o teu progresso pessoal, mas também é o número que dita a tua posição nas <a href="/docs/sistema-de-divisoes">Ligas Semanais</a>.</p>
        `
    },
    {
        id: "base-2",
        slug: "como-funcionam-os-coracoes",
        title: "Como funcionam os Corações (Vidas)?",
        category: "Mecânicas Base",
        summary: "Compreende o sistema de vidas e como ele molda o teu ritmo de aprendizagem.",
        icon: "Heart",
        content: `
            <p>A tua jornada educacional começa sempre com um stock limite de <strong>Corações (Vidas)</strong> - habitualmente 5.</p>
            <p>Sempre que cometeres um erro durante o percurso das lições convencionais, vais perder um coração. Isto obriga a um ritmo cauteloso e a uma leitura mais atenta das questões, para evitar jogar no "tentativa-erro".</p>
            <p>Se perderes todas as tuas vidas, as lições guiadas ficarão bloqueadas temporariamente, até recuperares forças ou encontrares formas de restaurar os teus Corações. Ninguém aprende bem sob exaustão!</p>
        `
    },
    {
        id: "base-3",
        slug: "recuperar-vidas",
        title: "Como recuperar Corações perdidos?",
        category: "Mecânicas Base",
        summary: "Ficaste a zeros? Vê como voltar à ação rapidamente.",
        icon: "Activity",
        content: `
            <p>Existem 3 formas principais de repor o teu stock de <strong>Corações</strong>:</p>
            <ul>
                <li><strong>O factor tempo:</strong> O teu perfil regenera corações passivamente com o tempo (espera algumas horas e voltarás com bateria cheia).</li>
                <li><strong>Revisão de Conteúdo:</strong> No ecrã principal podes optar pelo botão de "Praticar" (onde os teus corações falharam no passado). Por cada sessão de prática concluída, ganhas +1 Coração.</li>
                <li><strong>Usando Joias:</strong> Se o desespero de aprendizagem falar mais alto, poderás visitar a nossa Loja e gastar as tuas suadas Joias para efetuar a recarga completa!</li>
            </ul>
        `
    },

    // ── GAMIFICAÇÃO & LOJA ──
    {
        id: "gamificacao-1",
        slug: "a-ofensiva-streak",
        title: "A Chama da Ofensiva (Streak)",
        category: "Gamificação & Loja",
        summary: "O fogo interno do progresso. Nunca deixes a tua ofensiva morrer.",
        icon: "Flame",
        content: `
            <p>No canto superior do ecrã irás reparar num número acompanhado de uma chama: isso é a tua <strong>Ofensiva (Streak)</strong>.</p>
            <p>Ela conta o número de dias <strong>consecutivos</strong> em que concluíste pelo menos uma lição ou exercício. A nossa filosofia dita que 10 minutos de estudo intenso todos os dias são mais eficazes que 2 horas num só fim-de-semana.</p>
            <p>O <em>Marco</em>, a nossa mascote IA, fica extremamente deprimido quando os alunos deixam apagar a ofensiva. Se isso acontecer, o teu contador volta a... zero. Cruel? Talvez. Eficaz? Especialistas apontam que sim.</p>
        `
    },
    {
        id: "gamificacao-2",
        slug: "congelamentos-streak-freezes",
        title: "Usar Congelamentos de Ofensiva (Freezes)",
        category: "Gamificação & Loja",
        summary: "A tua apólice de seguro contra esquecimentos e dias caóticos.",
        icon: "Snowflake",
        content: `
            <p>Sabemos que imprevistos acontecem. Seja um exame apertado ou uma ida de urgência ao supermercado, às vezes esquecemo-nos de praticar.</p>
            <p>Para isso inventámos os <strong>Congelamentos de Ofensiva</strong>! Disponíveis na Loja, estes são escudos invisíveis que, quando ativos (ou comprados previamente), reparam o teu contador caso passes um dia inteiro sem aprender. O dia perdido fica "congelado" e a tua chama continua a crepitar no dia seguinte.</p>
            <p><strong>Nota importante:</strong> Tens um limite de transporte de 2 Freezes. Equipa-os sempre.</p>
        `
    },
    {
        id: "gamificacao-3",
        slug: "missoes-diarias-baus",
        title: "Missões Diárias e Baús de Tesouro",
        category: "Gamificação & Loja",
        summary: "Ganha recompensas extras ao cumprires objetivos surpresa.",
        icon: "Target",
        content: `
            <p>Através da aba "Desafios" poderás descobrir um ecrã dedicado a <strong>Missões Diárias</strong>.</p>
            <p>Tratam-se de 3 objetivos dinâmicos que mudam a cada 24 horas. (Ex: "Atinge 50 de XP", "Realiza 3 Lições Perfeitas", "Vence o modo Arcade").</p>
            <p>Quando atinjas a barra de progresso totalizada de todas as missões, um <strong>Baú Épico</strong> é desbloqueado no topo da página. Podes bater no baú com força para reclamar as tuas Joias bónus, XP extra ou, quem sabe, Freezes gratuitos!</p>
        `
    },
    {
        id: "gamificacao-4",
        slug: "myduolingo-pro-vs-gratis",
        title: "MyDuolingo PRO vs Plano Grátis",
        category: "Gamificação & Loja",
        summary: "Descobre as vantagens exclusivas do plano PRO e como ele acelera o teu progresso.",
        icon: "Crown",
        content: `
            <p>O <strong>MyDuolingo PRO</strong> é a experiência definitiva para quem leva a sério a fluência num novo idioma. Ao contrário do plano Standard (Grátis), o PRO remove as barreiras entre ti e o conhecimento.</p>
            
            <p><strong>Vantagens Principais do PRO:</strong></p>
            <ul>
                <li><strong>Corações Infinitos:</strong> Nunca mais pares uma lição a meio. Erra, aprende e continua a praticar sem limites ou esperas de regeneração.</li>
                <li><strong>Prática com IA Desbloqueada:</strong> Acesso total à Área de Prática AI, incluindo Conversação Fluída, exercícios de Escrita corrigidos por IA e treino de Escuta personalizado.</li>
                <li><strong>Estatuto Elite:</strong> O teu perfil exibe orgulhosamente o ícone de Infinito nas tabelas de classificação, mostrando o teu compromisso com a excelência.</li>
            </ul>

            <p>Para assinar, visita a nossa <strong>Loja</strong>. O processamento é feito de forma segura e o acesso às funcionalidades premium é imediato após a confirmação do pagamento.</p>
        `
    },

    // ── COMPETIÇÃO & SOCIAL ──
    {
        id: "social-1",
        slug: "sistema-de-divisoes",
        title: "O Sistema de Divisões (Ligas)",
        category: "Competição & Social",
        summary: "Onde o XP se traduz diretamente em glória mundial.",
        icon: "Trophy",
        content: `
            <p>Bem-vindo à frente de batalha educacional do MyDuolingo! O Sistema de Ligas junta um coorte de 30 estudantes globais escolhidos aleatoriamente (mas ao teu nível) todas as segundas-feiras.</p>
            <p>Durante a semana, tudo o que precisas de fazer é apanhar mais <strong>XP</strong> que os teus rivais.</p>
            <p>Existem diferentes escalões (Bronze, Prata, Ouro, Safira, Titânio, Rubi e Diamante). Chegar à liga Diamante significa que fazes parte dos 1% mais viciados do mundo no conhecimento.</p>
        `
    },
    {
        id: "social-2",
        slug: "promocoes-despromocoes",
        title: "Promoção e Zona de Risco",
        category: "Competição & Social",
        summary: "Zonas Verdes, Zonas Vermelhas e a Tensão Semanal.",
        icon: "ArrowUpRight",
        content: `
            <p>A grelha da Liga não existe apenas para mostrar pontos, o seu interior está dividido em três zonas ativas:</p>
            <ul>
                <li><strong>Zona Verde (Promoção):</strong> Geralmente o Top 5. Terminar na Zona Verde na noite de Domingo garante-te a passagem à próxima (e mais difícil) Liga.</li>
                <li><strong>Zona Amarela (Manutenção):</strong> O meio-termo. Seguras o teu lugar atual.</li>
                <li><strong>Zona Vermelha (Despromoção):</strong> Os últimos 5 alunos sofrem penalizações drásticas — caso a semana feche e caias aqui, vais ser rebaixado para a divisão inferior em prol de rivais mais sedentos. Cuidado!</li>
            </ul>
        `
    },
    {
        id: "social-3",
        slug: "high-fives-e-feed-social",
        title: "Interagir com Amigos e High-Fives",
        category: "Competição & Social",
        summary: "Aprender com amigos multiplica a tua força de vontade.",
        icon: "Users",
        content: `
            <p>A nova área "Feed" revolucionou o MyDuolingo. Podes procurar Amigos utilizando a sua "tag" de perfil.</p>
            <p>No teu feed social verás momentos brilhantes (Ex: "O João avançou para a Liga Diamante!" ou "A Maria concluiu uma Ofensiva Incrível de 30 Dias").</p>
            <p>Podes enviar <strong>High-Fives (Bater Mais Cinco 🙌)</strong> nestas notificações. Com a nossa física tátil, verás as mãos coloridas a estoirarem na interface dos teus amigos, garantindo-lhes buffs minúsculos e doses épicas de dopamina.</p>
        `
    },

    // ── MODO ARCADE ──
    {
        id: "arcade-1",
        slug: "sprint-vocabulario",
        title: "Modo: Sprint de Vocabulário",
        category: "Modo Arcade",
        summary: "Corrida contra o relógio. Quão bons são os teus reflexos mentais?",
        icon: "Timer",
        content: `
            <p>A tua sede de velocidade encontra a sua solução no ecrã superior: o <strong>Arcade Hub</strong>.</p>
            <p>O <em>Sprint de Vocabulário</em> é um desafio *intenso*. Tens exatamente 60 segundos para associar dezenas de pares de traduções.</p>
            <p>Mas atenção ao ritmo: ganhar é apenas a cereja no topo do bolo. Quanto mais rápido fazes combinações contínuas, consomes a 'Barra de Combo'. Respostas certas e ritmadas aumentam severamente os pontos XP recebidos no limite de tempo máximo. E as tuas mãos vão suar.</p>
        `
    },
    {
        id: "arcade-2",
        slug: "chuva-de-meteoros-swipe",
        title: "Chuva de Meteoros & Desafios Swipe",
        category: "Modo Arcade",
        summary: "Uma perspetiva diferente em que a gravidade decide a tua liga.",
        icon: "Rocket",
        content: `
            <p>Nos modos secundários de Arcade (lançados por temporadas temporárias), podes dar de caras com a Chuva de Meteoros.</p>
            <p>A premissa? A IA (Marco) lança blocos pesados do teto de uma galáxia virtual contendo sílabas ou traduções incompletas. Terás que recorrer à mecânica <strong>Tinder-Swipe</strong> (arrastar violentamente a tua carta para Certo ou Errado) antes que o asteroide embata contra o teu núcleo base e te danifique as Vidas na totalidade!</p>
            <p>Ganhas XP exclusivo da "Arcade Store". Entra... se tiveres coragem e dedos ágeis.</p>
        `
    },
    {
        id: "arcade-3",
        slug: "o-assistente-marco",
        title: "Conversando com o Marco (A Mascote)",
        category: "Modo Arcade",
        summary: "Não é apenas um robô bonito, é quem está no comando.",
        icon: "Bot",
        content: `
            <p>O <strong>Marco</strong> é mais do que a mascote verde flutuante da app. Desenvolvido com os mais sofisticados modelos de LLM integrados no motor educativo, ele funciona no Modo Chat do lado esquerdo do teu Hub de navegação.</p>
            <p>Ficaste bloqueado na gramática alemã ou esqueceste os prefixos portugueses? Foca a atenção no chat e pergunta à mente sintética do Marco. De forma amigável (se tiveres uma ofensiva ativa), ele esmiúça o teu quebra-cabeças.</p>
            <p>Aviso: O Marco usa um chapéu de aviador para a aerodinâmica das respostas.</p>
        `
    },

    // ── CONTA & CONFIGURAÇÕES ──
    {
        id: "conta-1",
        slug: "alterar-nome-avatar",
        title: "Como Alterar o teu Nome e Avatar",
        category: "Conta & Configurações",
        summary: "A identidade visual na tabela de Ligas é uma prioridade.",
        icon: "UserCog",
        content: `
            <p>A tua estética diz muito sobre ti, tanto para o Marco como para os teus inimigos nas Divisões.</p>
            <p>Dirige-te à aba <strong>Perfil</strong> e clica na engrenagem dourada (Configurações) no topo. Aí terás acesso livre para corrigir a tua "Username" e gerir o teu Avatar.</p>
            <p>Nos detalhes, graças à nossa integração Clerk, poderás descarregar uma nova foto de perfil em Alta Resolução. Atualizamos a foto do teu *leaderboard* instantaneamente de forma tátil!</p>
        `
    },
    {
        id: "conta-2",
        slug: "modo-escuro-e-temas",
        title: "Modo Escuro (Dark Mode) e Visão",
        category: "Conta & Configurações",
        summary: "Conhece a filosofia de cores da aplicação.",
        icon: "Moon",
        content: `
            <p>Uma dúvida comum levantada no nosso mural: <em>Onde ligo o brutal e misterioso Dark Mode?</em></p>
            <p>Por design arquitetónico, o MyDuolingo corre nativamente num ambiente brilhante, limpo (Estética de Stone-White) e incrivelmente vibrante em realce pastel de forma intencional, com o propósito de invocar retenção educacional de alta voltagem no cérebro. Estudos associam a nossa palheta nativa a maiores índices de produtividade.</p>
            <p>Não desanimes! A equipa de engenheiros continua em fase de laboratório, ponderando criar um interruptor ultra-premium "Modo Meia-Noite" para os que sofrem de fadiga ocular depois das 2 da manhã.</p>
        `
    },
    {
        id: "conta-3",
        slug: "deixar-feedback-mural",
        title: "Cravando a tua Assinatura no Wall of Love",
        category: "Conta & Configurações",
        summary: "Sentes-te apaixonado pelos teus resultados rápidos? Sela-o no Hall of Fame.",
        icon: "Star",
        content: `
            <p>As nossas dinâmicas nasceram das dezenas das vozes incríveis dos nossos alunos. Para eternizar essas opiniões fundámos o mural do <strong>Wall of Love (Hall of Fame)</strong>.</p>
            <p>Para ver o mural real, navega por 'Suporte > Mural da Comunidade'.</p>
            <p>Nesta área, poderás abrir o nosso deslumbrante <em>Modal Tátil</em>, empurrado por trás pelo entusiasmo da mascote Marco, em formato flutuante, deixando um comentário encorpado com 1 a 5 estrelas baseadas na tua experiência. Este componente injeta instantaneamente a tua imagem e opinião no ecrã glorioso principal para que o novo tráfego veja também.</p>
        `
    }
];
