export type Achievement = {
    title: string;
    description: string;
    icon: string;
    condition: (progress: any) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
    // ==========================================
    // 🧠 SÁBIO (Total XP Earned)
    // ==========================================
    { title: "Mente Curiosa", description: "Ganha 100 XP", icon: "🌱", condition: (p) => (p.totalXpEarned || p.points) >= 100 },
    { title: "Estudante Dedicado", description: "Ganha 500 XP", icon: "📝", condition: (p) => (p.totalXpEarned || p.points) >= 500 },
    { title: "Aspirante", description: "Ganha 1.000 XP", icon: "📗", condition: (p) => (p.totalXpEarned || p.points) >= 1000 },
    { title: "Aprendiz", description: "Ganha 2.500 XP", icon: "📘", condition: (p) => (p.totalXpEarned || p.points) >= 2500 },
    { title: "Erudito", description: "Ganha 5.000 XP", icon: "📙", condition: (p) => (p.totalXpEarned || p.points) >= 5000 },
    { title: "Mestre", description: "Ganha 10.000 XP", icon: "🎓", condition: (p) => (p.totalXpEarned || p.points) >= 10000 },
    { title: "Grão-Mestre", description: "Ganha 25.000 XP", icon: "🦉", condition: (p) => (p.totalXpEarned || p.points) >= 25000 },
    { title: "Sábio", description: "Ganha 50.000 XP", icon: "🧠", condition: (p) => (p.totalXpEarned || p.points) >= 50000 },
    { title: "Iluminado", description: "Ganha 100.000 XP", icon: "✨", condition: (p) => (p.totalXpEarned || p.points) >= 100000 },
    { title: "Lendário", description: "Ganha 250.000 XP", icon: "🏆", condition: (p) => (p.totalXpEarned || p.points) >= 250000 },
    { title: "Mítico", description: "Ganha 500.000 XP", icon: "🦄", condition: (p) => (p.totalXpEarned || p.points) >= 500000 },
    { title: "Divino", description: "Ganha 1.000.000 XP", icon: "⛈️", condition: (p) => (p.totalXpEarned || p.points) >= 1000000 }, // Tier Absurdo 1
    { title: "Omnisciente", description: "Ganha 5.000.000 XP", icon: "👁️", condition: (p) => (p.totalXpEarned || p.points) >= 5000000 }, // Tier Absurdo 2
    { title: "O Criador", description: "Ganha 10.000.000 XP", icon: "🌌", condition: (p) => (p.totalXpEarned || p.points) >= 10000000 }, // Tier Absurdo 3

    // ==========================================
    // 🔥 INCANSÁVEL (Streak)
    // ==========================================
    { title: "Aquecimento", description: "Streak de 3 dias", icon: "🕯️", condition: (p) => p.longestStreak >= 3 },
    { title: "Faísca", description: "Streak de 7 dias", icon: "🔥", condition: (p) => p.longestStreak >= 7 },
    { title: "Chama", description: "Streak de 14 dias", icon: "🥓", condition: (p) => p.longestStreak >= 14 },
    { title: "Incêndio", description: "Streak de 30 dias", icon: "🧨", condition: (p) => p.longestStreak >= 30 },
    { title: "Inferno", description: "Streak de 60 dias", icon: "🌋", condition: (p) => p.longestStreak >= 60 },
    { title: "Centenário", description: "Streak de 100 dias", icon: "💯", condition: (p) => p.longestStreak >= 100 },
    { title: "Obsessivo", description: "Streak de 150 dias", icon: "👺", condition: (p) => p.longestStreak >= 150 },
    { title: "Meio Ano", description: "Streak de 183 dias", icon: "🗓️", condition: (p) => p.longestStreak >= 183 },
    { title: "Imparável", description: "Streak de 250 dias", icon: "🚂", condition: (p) => p.longestStreak >= 250 },
    { title: "Volta ao Sol", description: "Streak de 365 dias", icon: "🌍", condition: (p) => p.longestStreak >= 365 },
    { title: "Marciano", description: "Streak de 687 dias", icon: "👽", condition: (p) => p.longestStreak >= 687 }, // Ano em Marte
    { title: "Milénio", description: "Streak de 1000 dias", icon: "🗿", condition: (p) => p.longestStreak >= 1000 },
    { title: "Eterno", description: "Streak de 2000 dias", icon: "♾️", condition: (p) => p.longestStreak >= 2000 }, // ~5 anos

    // ==========================================
    // 📚 LITERATO (Lessons completed - estimated via point / 10 for simplicity or existing field)
    // ==========================================
    // Assumindo que o utilizador ganha em média 10-15xp por lição, vamos usar `points` como proxy se não tivermos contador de lições,
    // MAS espera, temos 'actions/user-progress' que incrementa pontos. Não temos "lessonsCompleted" explícito no schema.
    // Vamos usar (points / 10) como aproximação grosseira ou criar achievements baseados em XP que "soam" a lições.
    // OU, melhor, vamos assumir que o sistema de XP é a métrica principal.
    // MAS, vamos checar o schema.ts... `points` é o que temos.
    // Vamos adicionar achievements baseados em "Corações" (hearts) ou "Shields" (heartShields).

    // ==========================================
    // 🛡️ GUARDIÃO (Escudos - Inventário Atual, não histórico, infelizmente)
    // PARA TERMOS HISTÓRICO PRECISÁVAMOS DE MAIS CAMPOS NA BD.
    // Vamos focar no que temos: XP e Streak são os mais fiáveis "históricos".
    // Mas podemos ter achievements por "Nível" (XP / 1000).

    // Vamos criar Tiers intermédios de Sábio com nomes criativos para encher.
    { title: "Alfabetizado", description: "Ganha 50 XP", icon: "🅰️", condition: (p) => (p.totalXpEarned || p.points) >= 50 },
    { title: "Tagarela", description: "Ganha 250 XP", icon: "💬", condition: (p) => (p.totalXpEarned || p.points) >= 250 },
    { title: "Poliglota Jr", description: "Ganha 750 XP", icon: "🐤", condition: (p) => (p.totalXpEarned || p.points) >= 750 },
    { title: "Tradutor", description: "Ganha 1.500 XP", icon: "🗣️", condition: (p) => (p.totalXpEarned || p.points) >= 1500 },
    { title: "Poeta", description: "Ganha 3.000 XP", icon: "✒️", condition: (p) => (p.totalXpEarned || p.points) >= 3000 },
    { title: "Novelista", description: "Ganha 7.500 XP", icon: "📖", condition: (p) => (p.totalXpEarned || p.points) >= 7500 },
    { title: "Enciclopédia", description: "Ganha 15.000 XP", icon: "📚", condition: (p) => (p.totalXpEarned || p.points) >= 15000 },
    { title: "Bibliotecário", description: "Ganha 35.000 XP", icon: "🏛️", condition: (p) => (p.totalXpEarned || p.points) >= 35000 },
    { title: "Oráculo", description: "Ganha 75.000 XP", icon: "🔮", condition: (p) => (p.totalXpEarned || p.points) >= 75000 },
    { title: "Profeta", description: "Ganha 150.000 XP", icon: "📜", condition: (p) => (p.totalXpEarned || p.points) >= 150000 },

    // ==========================================
    // ⚡ COLECIONADOR (Inventário atual - verificar se tem X items)
    // ==========================================
    { title: "Preparado", description: "Tem 1 Escudo", icon: "🛡️", condition: (p) => (p.heartShields || 0) >= 1 },
    { title: "Tanque", description: "Tem 3 Escudos", icon: "🏯", condition: (p) => (p.heartShields || 0) >= 3 },
    { title: "Intocável", description: "Tem 5 Escudos (Max?)", icon: "💎", condition: (p) => (p.heartShields || 0) >= 5 },

    { title: "Energizado", description: "Tem 1 Boost", icon: "🔋", condition: (p) => (p.xpBoostLessons || 0) >= 1 },
    { title: "Sobrecarga", description: "Tem 5 Boosts", icon: "⚡", condition: (p) => (p.xpBoostLessons || 0) >= 5 },
    { title: "Alta Tensão", description: "Tem 10 Boosts", icon: "🏭", condition: (p) => (p.xpBoostLessons || 0) >= 10 },

    { title: "Fresquinho", description: "Tem 1 Freeze", icon: "🍦", condition: (p) => (p.streakFreezes || 0) >= 1 },
    { title: "Congelado", description: "Tem 3 Freezes", icon: "🥶", condition: (p) => (p.streakFreezes || 0) >= 3 },
    { title: "Era do Gelo", description: "Tem 5 Freezes", icon: "🧊", condition: (p) => (p.streakFreezes || 0) >= 5 },

    // ==========================================
    // ❤️ VITALIDADE (Corações)
    // ==========================================
    { title: "Vivo", description: "Tem 1+ coração", icon: "💓", condition: (p) => p.hearts >= 1 },
    { title: "Saudável", description: "Tem 3+ corações", icon: "💖", condition: (p) => p.hearts >= 3 },
    { title: "Perfeito", description: "Tem 5 corações", icon: "💪", condition: (p) => p.hearts >= 5 },

    // ==========================================
    // 🔢 NÍVEIS "LÓGICOS" (XP Levels simulados)
    // ==========================================
    { title: "Nível 1", description: "Chega a 100 XP", icon: "1️⃣", condition: (p) => (p.totalXpEarned || p.points) >= 100 },
    { title: "Nível 5", description: "Chega a 500 XP", icon: "5️⃣", condition: (p) => (p.totalXpEarned || p.points) >= 500 },
    { title: "Nível 10", description: "Chega a 1.000 XP", icon: "🔟", condition: (p) => (p.totalXpEarned || p.points) >= 1000 },
    { title: "Nível 20", description: "Chega a 2.000 XP", icon: "😎", condition: (p) => (p.totalXpEarned || p.points) >= 2000 },
    { title: "Nível 30", description: "Chega a 3.000 XP", icon: "🦁", condition: (p) => (p.totalXpEarned || p.points) >= 3000 },
    { title: "Nível 40", description: "Chega a 4.000 XP", icon: "🐯", condition: (p) => (p.totalXpEarned || p.points) >= 4000 },
    { title: "Nível 50", description: "Chega a 5.000 XP", icon: "🦅", condition: (p) => (p.totalXpEarned || p.points) >= 5000 },
    { title: "Nível 60", description: "Chega a 6.000 XP", icon: "🦈", condition: (p) => (p.totalXpEarned || p.points) >= 6000 },
    { title: "Nível 70", description: "Chega a 7.000 XP", icon: "🦖", condition: (p) => (p.totalXpEarned || p.points) >= 7000 },
    { title: "Nível 80", description: "Chega a 8.000 XP", icon: "🐲", condition: (p) => (p.totalXpEarned || p.points) >= 8000 },
    { title: "Nível 90", description: "Chega a 9.000 XP", icon: "👹", condition: (p) => (p.totalXpEarned || p.points) >= 9000 },
    { title: "Nível 100", description: "Chega a 10.000 XP", icon: "💯", condition: (p) => (p.totalXpEarned || p.points) >= 10000 },

    // ==========================================
    // 🌌 EXPANSÃO CÓSMICA (XP Absurdo Extra)
    // ==========================================
    { title: "Via Láctea", description: "2.000.000 XP", icon: "🌌", condition: (p) => (p.totalXpEarned || p.points) >= 2000000 },
    { title: "Buraco Negro", description: "3.000.000 XP", icon: "⚫", condition: (p) => (p.totalXpEarned || p.points) >= 3000000 },
    { title: "Multiverso", description: "4.000.000 XP", icon: "💠", condition: (p) => (p.totalXpEarned || p.points) >= 4000000 },

    // ... total ~60 achievements here. Adding more purely creative ones based on weird numbers

    { title: "O Número da Besta", description: "666 XP", icon: "🤘", condition: (p) => (p.totalXpEarned || p.points) >= 666 },
    { title: "Sorte Grande", description: "777 XP", icon: "🎰", condition: (p) => (p.totalXpEarned || p.points) >= 777 },
    { title: "Ano Novo", description: "2024 XP", icon: "🎆", condition: (p) => (p.totalXpEarned || p.points) >= 2024 },
    { title: "Futurista", description: "2077 XP", icon: "🤖", condition: (p) => (p.totalXpEarned || p.points) >= 2077 },
    { title: "Over 9000!", description: "9001 XP", icon: "💥", condition: (p) => (p.totalXpEarned || p.points) > 9000 },

    // Streak Fun
    { title: "Fim de Semana", description: "Streak de 2 dias", icon: "✌️", condition: (p) => p.longestStreak >= 2 },
    { title: "Mão Cheia", description: "Streak de 5 dias", icon: "🖐️", condition: (p) => p.longestStreak >= 5 },
    { title: "Duas Mãos", description: "Streak de 10 dias", icon: "👐", condition: (p) => p.longestStreak >= 10 },
    { title: "Três Semanas", description: "Streak de 21 dias", icon: "🥚", condition: (p) => p.longestStreak >= 21 }, // Eclosão?
    { title: "Quaresma", description: "Streak de 40 dias", icon: "🕯️", condition: (p) => p.longestStreak >= 40 },

    // Shop Big Spender Simulations (requires tracking 'points' spent which we don't have, but we can assume High Total XP implies high spending potential)
    { title: "Rico", description: "Acumula 1.000 XP (Total)", icon: "💰", condition: (p) => (p.totalXpEarned || p.points) >= 1000 },
    { title: "Milionário", description: "Acumula 1.000.000 XP (Total)", icon: "🏦", condition: (p) => (p.totalXpEarned || p.points) >= 1000000 },

    // More Fillers to reach "Immense" feel
    { title: "Passo 1", description: "10 XP", icon: "🦶", condition: (p) => (p.totalXpEarned || p.points) >= 10 },
    { title: "Passo 2", description: "20 XP", icon: "🦶", condition: (p) => (p.totalXpEarned || p.points) >= 20 },
    { title: "Passo 3", description: "30 XP", icon: "🦶", condition: (p) => (p.totalXpEarned || p.points) >= 30 },
    { title: "Passo 4", description: "40 XP", icon: "🦶", condition: (p) => (p.totalXpEarned || p.points) >= 40 },
    { title: "Maratona", description: "42.000 XP", icon: "🏃", condition: (p) => (p.totalXpEarned || p.points) >= 42000 },
    { title: "Monte Everest", description: "8.848 XP", icon: "🏔️", condition: (p) => (p.totalXpEarned || p.points) >= 8848 },
    { title: "Profundezas", description: "11.000 XP", icon: "🌊", condition: (p) => (p.totalXpEarned || p.points) >= 11000 },

    // Elements
    { title: "Água", description: "Streak 4 dias", icon: "💧", condition: (p) => p.longestStreak >= 4 },
    { title: "Terra", description: "Streak 8 dias", icon: "🌱", condition: (p) => p.longestStreak >= 8 },
    { title: "Ar", description: "Streak 12 dias", icon: "💨", condition: (p) => p.longestStreak >= 12 },
    { title: "Fogo", description: "Streak 16 dias", icon: "🔥", condition: (p) => p.longestStreak >= 16 },
    { title: "Éter", description: "Streak 20 dias", icon: "✨", condition: (p) => p.longestStreak >= 20 },
];
