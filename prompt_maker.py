import sys
import time

# --- CONSTANTES GLOBAIS ---
LANGUAGES = {
    "en": "English",
    "fr": "French",
    "es": "Spanish",
    "pt": "Portuguese",
    "de": "German",
    "it": "Italian"
}

# --- A MATRIZ DE TEMAS (Tópicos Curados) ---
# Copiado do backup do user para garantir que nada se perde
TEMAS = {
    # --- BUSINESS & CAREER ---
    1: {"nome": "Corporate Strategy & Hostile Takeovers", "foco": "Formal Business English, Mergers, negotiation idioms"},
    2: {"nome": "Startups & Venture Capital", "foco": "Pitching, equity, burn rate, agile terminology"},
    3: {"nome": "Office Politics & HR Conflicts", "foco": "Diplomacy, passive-aggressive phrasing, conflict resolution"},
    4: {"nome": "Global Supply Chain Logistics", "foco": "Process descriptions, causality, inventory terms"},
    
    # --- LAW & SOCIETY ---
    5: {"nome": "Criminal Law & Courtroom Drama", "foco": "Legal jargon, objection types, formal accusation"},
    6: {"nome": "International Diplomacy & Geopolitics", "foco": "Soft power, sanctions, treaties, formal address"},
    7: {"nome": "Social Inequality & Activism", "foco": "Sociological terms, protest vocabulary, rights"},
    
    # --- SCIENCE & TECH ---
    8: {"nome": "Artificial Intelligence Ethics", "foco": "Speculation (future tenses), bias, algorithmic terms"},
    9: {"nome": "Neuroscience & The Human Mind", "foco": "Cognitive functions, biological metaphors, memory"},
    10: {"nome": "Space Exploration & Colonization", "foco": "Physics concepts, hypothetical conditionals, survival"},
    11: {"nome": "Cybersecurity & Hacking", "foco": "Digital threats, encryption, tech slang"},

    # --- DAILY LIFE (ADVANCED) ---
    12: {"nome": "Real Estate & Home Renovation", "foco": "Mortgages, construction defects, architectural styles"},
    13: {"nome": "Advanced Culinary Arts", "foco": "Cooking techniques, flavor profiles, restaurant critique"},
    14: {"nome": "Travel: The Airport Nightmare", "foco": "Customs, delays, compensation claims, logistics"},
    15: {"nome": "Health: Symptoms & Hospitalization", "foco": "Describing pain accurately, medical procedures"},

    # --- EMOTION & HUMANITY ---
    16: {"nome": "Romance: Breakups & Divorce", "foco": "Emotional nuance, regret structures, arguments"},
    17: {"nome": "Grief, Loss & Nostalgia", "foco": "Subtle emotions, memories, past habits (used to/would)"},
    18: {"nome": "Betrayal & Deception", "foco": "Lying nuances, uncovering truth, accusation"},
    
    # --- CULTURE & ARTS ---
    19: {"nome": "Art History & Criticism", "foco": "Descriptive adjectives, abstract concepts, eras"},
    20: {"nome": "Literature & Storytelling", "foco": "Narrative tenses, metaphors, character archetypes"},
    
    # --- ABSTRACT & HARDCORE ---
    21: {"nome": "Philosophy & Existentialism", "foco": "Complex reasoning, abstract nouns, rhetorical questions"},
    22: {"nome": "Urban Slang & Street Talk (UK/US)", "foco": "Colloquialisms, phrasal verbs, rapid speech decoding"},
    23: {"nome": "British Royal Protocol (Super Formal)", "foco": "Subjunctive, extreme politeness, archaic forms"}
}


def print_header():
    print("\n" + "█" * 60)
    print("      SYSTEM C5: MULTILINGUAL ARCHITECT - 4-LEVEL CORE")
    print("█" * 60 + "\n")

def mostrar_menu_temas():
    print("PASSO 1: ESCOLHE UM TEMA (Digite o ID):")
    print("-" * 60)
    for id_tema, dados in TEMAS.items():
        print(f"[{id_tema:02d}] {dados['nome']:<45} | Foco: {dados['foco']}")
    print("-" * 60)

def mostrar_menu_linguas():
    print("\nPASSO 2: ESCOLHE A LÍNGUA ALVO:")
    print("-" * 60)
    for code, name in LANGUAGES.items():
        print(f"[{code}] {name}")
    print("-" * 60)

def gerar_prompts(id_tema, lang_code):

    tema = TEMAS[id_tema]
    topic_name = tema['nome']
    focus_area = tema['foco']
    target_lang = LANGUAGES[lang_code]

    # RANDOMIZERS FOR DIVERSITY (Ensures 10x runs define unique content)
    import random
    styles = ["Humorous", "Academic", "Dramatic", "Casual", "Urgent", "Poetic", "Sarcastic", "Mystery"]
    random_style = random.choice(styles)
    random_seed = random.randint(1000, 9999)

    # JSON TEMPLATE (CEFR ENHANCED)
    json_structure = """
    {
      "unit_title": "String (In Target Language)",
      "unit_description": "String (In Target Language)",
      "lessons": [
        {
          "title": "String (In Target Language)",
          "challenges": [
            {
              "context": "String (A short sentence, dialogue, or scenario setting the scene. MANDATORY above A1)",
              "question": "String (The query based on the context)",
              "type": "SELECT",
              "options": [
                { "text": "Distractor 1", "correct": false },
                { "text": "Correct Answer", "correct": true },
                { "text": "Distractor 2", "correct": false }
              ],
              "explanation": "String (Brief pedagogical explanation in PORTUGUESE of why the answer is correct)"
            }
          ]
        }
      ]
    }
    """

    print(f"\n\n>>> TEMA: {topic_name.upper()} | LÍNGUA: {target_lang.upper()} | STYLE: {random_style.upper()}")
    print("="*60)
    
    # --- NIVEL 1: THE INITIATE (A1) ---
    # Foco: L1 (Português/Inglês) -> L2 (Target)
    print(f"\n--- NÍVEL 1: THE INITIATE (A1 / Absolute Beginner) ---")
    print("="*40)
    print(f"""
*** PROMPT 1: THE INITIATE (A1) ***
Role: Bilingual Kindergarten Teacher.
Target Language: {target_lang.upper()}
Source Language: PORTUGUESE.
Topic: "{topic_name}" (Style: {random_style})
Seed: {random_seed}

GOAL: The 5 Pillars - Foundation.
1. Morphology: Focus on singular/plural forms and genders (the boy vs the girl).
2. Syntax: SVO order (Subject-Verb-Object).
3. Semantics: Basic concrete meanings.

INSTRUCTIONS:
1. Create 1 UNIT with 2 LESSONS.
2. Each Lesson: 12 Challenges.
3. **SYLLABUS (A1 Strict):**
   - **Vocabulary (60%):** High-frequency nouns/verbs related to the topic.
   - **Grammar (40%):** 
     - **Present Tense:** Regular verbs only.
     - **Articles & Nouns:** Definite/Indefinite, Gender agreement.
     - **Pronouns:** I, You, He, She.
     - *Example:* "A mesa é vermelha" (Translate 'A mesa').

4. **FORMAT:**
   - **Questions in PORTUGUESE:** ask to translate or identify.
   - **Context:** Simple Situation related to {topic_name}.
   - **Explanation:** Explain the Morphology (why is it feminine?) or Syntax.

OUTPUT: Return ONLY raw JSON matching this EXACT schema:
{json_structure}
""")

    # --- NIVEL 2: THE APPRENTICE (A2-B1) ---
    # Foco: Frases Simples em L2, completar lacunas lógicas
    print(f"\n\n--- NÍVEL 2: THE APPRENTICE (A2-B1 / Elementary) ---")
    print("="*40)
    print(f"""
*** PROMPT 2: THE APPRENTICE (A2-B1) ***
Role: Patient Language Tutor.
Target Language: {target_lang.upper()}
Topic: "{topic_name}" (Style: {random_style})
Seed: {random_seed}

GOAL: The 5 Pillars - Structure.
1. Morphology: Verb conjugations (Past/Future) and Adjective agreement.
2. Syntax: Question formation and Negation.
3. Pragmatics: Basic politeness (Tu vs Vous).

INSTRUCTIONS:
1. Create 1 UNIT with 2 LESSONS.
2. Each Lesson: 12 Challenges.
3. **SYLLABUS (A2/B1 Strict):**
   - **Vocabulary (50%):** Daily routine, transactions, descriptions.
   - **Grammar (50%):** 
     - **Past Tense:** Preterite / Perfect.
     - **Future:** "Going to" or Simple Future.
     - **Prepositions:** In, On, At, To.
     - **Comparatives:** Better, Worse, Bigger.

   - **Context:** A simple dialogue or scenario in {target_lang}.
   - **Explanation:** Explain the Syntax (word order) or Morphology (conjugation).

4. DISTRACTORS:
   - Wrong tenses or false friends.

OUTPUT: Return ONLY raw JSON matching this EXACT schema:
{json_structure}
""")

    # --- NIVEL 3: THE FOUNDATION (B2) ---
    # Foco: Vocabulário Técnico e Gramática em Contexto
    print(f"\n\n--- NÍVEL 3: THE FOUNDATION (B2 / Upper Intermediate) ---")
    print("="*40)
    print(f"""
*** PROMPT 3: THE FOUNDATION (B2) ***
Role: Lead Linguist.
Target Language: {target_lang.upper()}
Topic: "{topic_name}" (Style: {random_style})
Seed: {random_seed}

GOAL: The 5 Pillars - Complexity.
1. Syntax: Subordinate clauses, Relative clauses, Passive voice.
2. Semantics: Abstract concepts and technical jargon.
3. Pragmatics: Formal tone vs Informal tone.

INSTRUCTIONS:
1. Create 1 UNIT with 2 LESSONS.
2. Each Lesson: 15 Challenges.
3. **SYLLABUS (B2 Strict):**
   - **Context:** A paragraph (Opinion piece, Technical email) in {target_lang}.
   - **Grammar Focus:** 
     - **Subjunctive:** Doubt/Desire.
     - **Connectors:** Therefore, However, Although.
     - **Passive Voice:** Action focus.

   - **Explanation:** Analyze the sentence structure and connector logic.

4. DISTRACTORS:
   - Grammatically possible but contextually weak.

OUTPUT: Return ONLY raw JSON matching this EXACT schema:
{json_structure}
""")

    # --- NIVEL 4: THE GAUNTLET (C1-C2) ---
    # Foco: Nuance, Idiomas, Estruturas Complexas
    print(f"\n\n--- NÍVEL 4: THE GAUNTLET (C1-C2 / Mastery) ---")
    print("="*40)
    print(f"""
*** PROMPT 4: THE GAUNTLET (C1-C2) ***
Role: Strict Professor.
Target Language: {target_lang.upper()}
Topic: "{topic_name}" (Style: {random_style})
Seed: {random_seed}

GOAL: The 5 Pillars - Mastery.
1. Stylistics: Irony, Humor, Rhetorical devices.
2. Advanced Syntax: Inversions, Cleft sentences.
3. Phy/Orth: Homophones, Rhythm, Stress patterns (text-based).

INSTRUCTIONS:
1. Create 1 UNIT with 2 LESSONS.
2. Each Lesson: 15 Challenges.
3. **SYLLABUS (C1/C2 Strict):**
   - **Context:** Literary text, Satire, Legal document.
   - **Challenges:** 
     - **Nuance:** Distinguish between synonyms based on tone.
     - **Idioms:** Cultural expressions.
     - **Inversion:** "Never have I ever..."

   - **Explanation:** Deep dive into the cultural history or stylistic effect.

4. **NO HALLUCINATIONS:**
   - Use real, high-level {target_lang}.
   
OUTPUT: Return ONLY raw JSON matching this EXACT schema:
{json_structure}
""")
    print("="*60 + "\n")

if __name__ == "__main__":
    print_header()
    
    # 1. Escolher Tema
    mostrar_menu_temas()
    try:
        tema_id = int(input("\n>> Digita o ID do tema: "))
        if tema_id not in TEMAS:
            print("ID de tema inválido.")
            sys.exit()
    except ValueError:
        print("Input inválido.")
        sys.exit()

    # 2. Escolher Língua
    mostrar_menu_linguas()
    lang_code = input("\n>> Digita o código da língua (ex: en, fr, pt): ").lower().strip()
    if lang_code not in LANGUAGES:
        print("Língua inválida. Usando 'en' como fallback.")
        lang_code = "en"

    # Gerar todos os níveis (sem pedir input de nível extra)
    gerar_prompts(tema_id, lang_code)