/**
 * AI_TOPICS — Translated from the Python TEMAS dictionary.
 * Each topic provides a thematic context and focus area for the AI content generator.
 */
export const AI_TOPICS = [
    { id: 1, name: "Corporate Strategy & Hostile Takeovers", focus: "Formal Business English, Mergers, negotiation idioms" },
    { id: 2, name: "Startups & Venture Capital", focus: "Pitching, equity, burn rate, agile terminology" },
    { id: 3, name: "Office Politics & HR Conflicts", focus: "Diplomacy, passive-aggressive phrasing, conflict resolution" },
    { id: 4, name: "Global Supply Chain Logistics", focus: "Process descriptions, causality, inventory terms" },
    { id: 5, name: "Personal Finance, Taxation & Bureaucracy", focus: "Credit scores, tax deductions, banking jargon, loans" },
    { id: 6, name: "Criminal Law & Courtroom Drama", focus: "Legal jargon, objection types, formal accusation" },
    { id: 7, name: "International Diplomacy & Geopolitics", focus: "Soft power, sanctions, treaties, formal address" },
    { id: 8, name: "Social Inequality & Activism", focus: "Sociological terms, protest vocabulary, rights" },
    { id: 9, name: "Climate Change, Ecology & Green Tech", focus: "Carbon footprint, sustainability, environmental disaster vocabulary" },
    { id: 10, name: "Artificial Intelligence Ethics", focus: "Speculation (future tenses), bias, algorithmic terms" },
    { id: 11, name: "Neuroscience & The Human Mind", focus: "Cognitive functions, biological metaphors, memory" },
    { id: 12, name: "Space Exploration & Colonization", focus: "Physics concepts, hypothetical conditionals, survival" },
    { id: 13, name: "Cybersecurity & Hacking", focus: "Digital threats, encryption, tech slang" },
    { id: 14, name: "Real Estate & Home Renovation", focus: "Mortgages, construction defects, architectural styles" },
    { id: 15, name: "Advanced Culinary Arts", focus: "Cooking techniques, flavor profiles, restaurant critique" },
    { id: 16, name: "Travel: The Airport Nightmare", focus: "Customs, delays, compensation claims, logistics" },
    { id: 17, name: "Automotive Trouble, Traffic & Commuting", focus: "Car parts, describing breakdowns, insurance claims" },
    { id: 18, name: "Health: Symptoms & Hospitalization", focus: "Describing pain accurately, medical procedures" },
    { id: 19, name: "Romance: Breakups & Divorce", focus: "Emotional nuance, regret structures, arguments" },
    { id: 20, name: "Grief, Loss & Nostalgia", focus: "Subtle emotions, memories, past habits (used to/would)" },
    { id: 21, name: "Betrayal & Deception", focus: "Lying nuances, uncovering truth, accusation" },
    { id: 22, name: "Art History & Criticism", focus: "Descriptive adjectives, abstract concepts, eras" },
    { id: 23, name: "Literature & Storytelling", focus: "Narrative tenses, metaphors, character archetypes" },
    { id: 24, name: "Sports Dynamics, Competition & Fandom", focus: "Sports idioms used in daily life, competition, aggressive rivalry" },
    { id: 25, name: "Mass Media, Journalism & Misinformation", focus: "Bias, sensationalism, fact-checking, objective reporting" },
    { id: 26, name: "Philosophy & Existentialism", focus: "Complex reasoning, abstract nouns, rhetorical questions" },
    { id: 27, name: "Urban Slang & Street Talk (UK/US)", focus: "Colloquialisms, phrasal verbs, rapid speech decoding" },
] as const;

export const CEFR_LEVELS = [
    { value: "A1", label: "A1 — Iniciante" },
    { value: "A2_B1", label: "A2/B1 — Elementar/Intermédio" },
    { value: "B2", label: "B2 — Intermédio Superior" },
    { value: "C1_C2", label: "C1/C2 — Avançado/Proficiente" },
] as const;

export const GENERATION_STYLES = [
    "Humorous", "Academic", "Dramatic", "Casual",
    "Urgent", "Poetic", "Sarcastic", "Mystery",
] as const;
