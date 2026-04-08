export type QuestType = 'xp' | 'lessons';

export type Quest = {
    id: string;
    title: string;
    type: QuestType;
    target: number;
    iconType: string;
    bgColor: string;
    borderColor: string;
}

export const QUESTS_POOL: Quest[] = [
    { id: 'xp_15', title: 'Ganha 15 XP', type: 'xp', target: 15, iconType: 'zap', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
    { id: 'xp_30', title: 'Ganha 30 XP', type: 'xp', target: 30, iconType: 'flame', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
    { id: 'xp_50', title: 'Ganha 50 XP', type: 'xp', target: 50, iconType: 'star', bgColor: 'bg-purple-100', borderColor: 'border-purple-200' },
    { id: 'xp_100', title: 'Desafio: 100 XP', type: 'xp', target: 100, iconType: 'crown', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
    { id: 'lessons_1', title: 'Completa 1 lição', type: 'lessons', target: 1, iconType: 'book', bgColor: 'bg-sky-100', borderColor: 'border-sky-200' },
    { id: 'lessons_2', title: 'Faz 2 lições', type: 'lessons', target: 2, iconType: 'book', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
    { id: 'lessons_3', title: 'O Atleta: 3 Lições', type: 'lessons', target: 3, iconType: 'target', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-200' },
    { id: 'lessons_5', title: 'Lendário: 5 Lições', type: 'lessons', target: 5, iconType: 'shield', bgColor: 'bg-rose-100', borderColor: 'border-rose-200' },
    { id: 'xp_20', title: 'Aquecimento: 20 XP', type: 'xp', target: 20, iconType: 'zap', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
    { id: 'lessons_4', title: 'Consistência: 4 lições', type: 'lessons', target: 4, iconType: 'target', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-200' },
];

export function getDailyQuests(userId: string, dateStr: string): Quest[] {
    // Generate a simple deterministic hash from userId + date
    const seedString = `${userId}-${dateStr}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        const char = seedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit int
    }
    
    // Seeded random function (pseudo-random linear congruential generator)
    let seed = Math.abs(hash);
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    // Pick 3 random quests without duplicates
    const quests = [...QUESTS_POOL];
    const selected: Quest[] = [];
    
    while(selected.length < 3 && quests.length > 0) {
        const index = Math.floor(random() * quests.length);
        selected.push(quests.splice(index, 1)[0]);
    }

    return selected;
}

export function getQuestProgress(questType: QuestType, todayStats: any) {
    if (!todayStats) return 0;
    
    switch (questType) {
        case 'xp':
            return todayStats.xpGained || 0;
        case 'lessons':
            return todayStats.lessonsCompleted || 0;
        default:
            return 0;
    }
}
