import sys
import time
import random

# --- CONSTANTES GLOBAIS ---
# Synchronized with src/lib/constants.ts SUPPORTED_LANGUAGES
LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "pt": "Portuguese",
    "de": "German",
    "it": "Italian",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Mandarin",
    "ru": "Russian",
    "ar": "Arabic",
    "nl": "Dutch",
}

# --- A MATRIZ DE TEMAS (Tópicos Curados) ---
TEMAS = {
    # --- BUSINESS, FINANCE & CAREER ---
    1: {"nome": "Corporate Strategy & Hostile Takeovers", "foco": "Formal Business English, Mergers, negotiation idioms"},
    2: {"nome": "Startups & Venture Capital", "foco": "Pitching, equity, burn rate, agile terminology"},
    3: {"nome": "Office Politics & HR Conflicts", "foco": "Diplomacy, passive-aggressive phrasing, conflict resolution"},
    4: {"nome": "Global Supply Chain Logistics", "foco": "Process descriptions, causality, inventory terms"},
    5: {"nome": "Personal Finance, Taxation & Bureaucracy", "foco": "Credit scores, tax deductions, banking jargon, loans"}, # NOVO
    
    # --- LAW, SOCIETY & GLOBAL ISSUES ---
    6: {"nome": "Criminal Law & Courtroom Drama", "foco": "Legal jargon, objection types, formal accusation"},
    7: {"nome": "International Diplomacy & Geopolitics", "foco": "Soft power, sanctions, treaties, formal address"},
    8: {"nome": "Social Inequality & Activism", "foco": "Sociological terms, protest vocabulary, rights"},
    9: {"nome": "Climate Change, Ecology & Green Tech", "foco": "Carbon footprint, sustainability, environmental disaster vocabulary"}, # NOVO
    
    # --- SCIENCE & TECH ---
    10: {"nome": "Artificial Intelligence Ethics", "foco": "Speculation (future tenses), bias, algorithmic terms"},
    11: {"nome": "Neuroscience & The Human Mind", "foco": "Cognitive functions, biological metaphors, memory"},
    12: {"nome": "Space Exploration & Colonization", "foco": "Physics concepts, hypothetical conditionals, survival"},
    13: {"nome": "Cybersecurity & Hacking", "foco": "Digital threats, encryption, tech slang"},

    # --- DAILY LIFE (ADVANCED) & SURVIVAL ---
    14: {"nome": "Real Estate & Home Renovation", "foco": "Mortgages, construction defects, architectural styles"},
    15: {"nome": "Advanced Culinary Arts", "foco": "Cooking techniques, flavor profiles, restaurant critique"},
    16: {"nome": "Travel: The Airport Nightmare", "foco": "Customs, delays, compensation claims, logistics"},
    17: {"nome": "Automotive Trouble, Traffic & Commuting", "foco": "Car parts, describing breakdowns, insurance claims"}, # NOVO
    18: {"nome": "Health: Symptoms & Hospitalization", "foco": "Describing pain accurately, medical procedures"},

    # --- EMOTION, RELATIONSHIPS & HUMANITY ---
    19: {"nome": "Romance: Breakups & Divorce", "foco": "Emotional nuance, regret structures, arguments"},
    20: {"nome": "Grief, Loss & Nostalgia", "foco": "Subtle emotions, memories, past habits (used to/would)"},
    21: {"nome": "Betrayal & Deception", "foco": "Lying nuances, uncovering truth, accusation"},
    
    # --- CULTURE, MEDIA & ARTS ---
    22: {"nome": "Art History & Criticism", "foco": "Descriptive adjectives, abstract concepts, eras"},
    23: {"nome": "Literature & Storytelling", "foco": "Narrative tenses, metaphors, character archetypes"},
    24: {"nome": "Sports Dynamics, Competition & Fandom", "foco": "Sports idioms used in daily life, competition, aggressive rivalry"}, # NOVO
    25: {"nome": "Mass Media, Journalism & Misinformation", "foco": "Bias, sensationalism, fact-checking, objective reporting"}, # NOVO
    
    # --- ABSTRACT & HARDCORE ---
    26: {"nome": "Philosophy & Existentialism", "foco": "Complex reasoning, abstract nouns, rhetorical questions"},
    27: {"nome": "Urban Slang & Street Talk (UK/US)", "foco": "Colloquialisms, phrasal verbs, rapid speech decoding"},
}


def print_header():
    print("\n" + "█" * 60)
    print("  SYSTEM C5: MULTILINGUAL ARCHITECT — HYBRID SLIDING SCALE")
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

    # RANDOMIZERS FOR DIVERSITY
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
              "context": "String (A short sentence, dialogue, or scenario setting the scene. MANDATORY above A1.)",
              "question": "String (The query based on the context)",
              "type": "SELECT",
              "options": [
                { "text": "Distractor 1", "correct": false },
                { "text": "Correct Answer", "correct": true },
                { "text": "Distractor 2", "correct": false }
              ],
              "explanation": "String (Pedagogical explanation in PORTUGUESE. For B1+, explain WHY the context clue leads to the answer, NOT just a dictionary definition.)"
            }
          ]
        }
      ]
    }
    """

    print(f"\n\n>>> TEMA: {topic_name.upper()} | LÍNGUA: {target_lang.upper()} | STYLE: {random_style.upper()}")
    print("="*60)

    # ===========================================================================
    # PROMPT 1: THE INITIATE (A1)
    # Sliding Scale Ratio: 80% Direct Translation / 20% Simple Context
    # ===========================================================================
    print(f"\n--- NÍVEL 1: THE INITIATE (A1 / Absolute Beginner) ---")
    print("="*40)
    print(f"""
*** PROMPT 1: THE INITIATE (A1) ***
Role: Bilingual Kindergarten Teacher.
Target Language: {target_lang.upper()}
Source Language: PORTUGUESE.
Topic: "{topic_name}" (Style: {random_style})
Seed: {random_seed}

=== PEDAGOGICAL METHOD: HYBRID SLIDING SCALE ===
RATIO: 80% Direct Translation / 20% Simple Context.

This level tests basic building blocks. The vast majority of challenges (80%) must be
ISOLATED VOCABULARY or SIMPLE DIRECT TRANSLATION sentences. Only 20% may introduce a
very short, simple context clue (1 sentence max).

GOAL: The 5 Pillars — Foundation.
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

4. **CHALLENGE DESIGN:**
   - ~10 of 12 challenges: Direct translation or vocabulary identification.
     Question in PORTUGUESE, answer options in {target_lang}.
   - ~2 of 12 challenges: Simple 1-sentence context in {target_lang} with a basic
     fill-in-the-blank. Context must be extremely simple (e.g., "The ___ is red.").
   - **Context field:** Optional for pure translation. For the 20% context challenges,
     provide 1 very simple sentence.

5. **EXPLANATION RULE:**
   - Explain the Morphology (why is it feminine?) or Syntax (word order) in PORTUGUESE.
   - Keep explanations short and beginner-friendly.

OUTPUT: Return ONLY raw JSON matching this EXACT schema:
{json_structure}
""")

    # ===========================================================================
    # PROMPT 2: THE APPRENTICE (A2-B1)
    # Sliding Scale Ratio: 50% Isolated / 50% Contextual Inference
    # ===========================================================================
    print(f"\n\n--- NÍVEL 2: THE APPRENTICE (A2-B1 / Elementary) ---")
    print("="*40)
    print(f"""
*** PROMPT 2: THE APPRENTICE (A2-B1) ***
Role: Patient Language Tutor.
Target Language: {target_lang.upper()}
Topic: "{topic_name}" (Style: {random_style})
Seed: {random_seed}

=== PEDAGOGICAL METHOD: HYBRID SLIDING SCALE ===
RATIO: 50% Isolated / 50% Contextual Inference.

This level bridges the gap between memorization and comprehension. Half the challenges
should be direct, testing vocabulary and conjugation in isolation. The other half must
introduce SHORT SCENARIO SENTENCES (2-3 sentences) where the student must read a context
clue to deduce the correct answer.

GOAL: The 5 Pillars — Structure.
1. Morphology: Verb conjugations (Past/Future) and Adjective agreement.
2. Syntax: Question formation and Negation.
3. Pragmatics: Basic politeness (Tu vs Vous, Tú vs Usted).

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

4. **CHALLENGE DESIGN:**
   - ~6 of 12 challenges (ISOLATED): Direct conjugation, vocabulary matching,
     or sentence translation. No context paragraph needed.
   - ~6 of 12 challenges (CONTEXTUAL): Provide a short scenario (2-3 sentences)
     in {target_lang}. The question asks the student to pick the word/phrase that
     logically fits the scenario. The context MUST contain a semantic clue.

5. **DISTRACTORS:** Wrong tenses, false friends, or preposition errors.

6. **EXPLANATION RULE (CRITICAL):**
   - For ISOLATED challenges: Explain the conjugation rule or vocabulary meaning.
   - For CONTEXTUAL challenges: Explain WHY the context clue points to the answer.
     Do NOT just define the word. Explain the LOGIC: "The sentence says 'yesterday',
     which signals the past tense, so we need 'went' not 'go'."
   - All explanations in PORTUGUESE.

OUTPUT: Return ONLY raw JSON matching this EXACT schema:
{json_structure}
""")

    # ===========================================================================
    # PROMPT 3: THE FOUNDATION (B2)
    # Sliding Scale Ratio: 20% Isolated / 80% Contextual Inference & Collocations
    # ===========================================================================
    print(f"\n\n--- NÍVEL 3: THE FOUNDATION (B2 / Upper Intermediate) ---")
    print("="*40)
    print(f"""
*** PROMPT 3: THE FOUNDATION (B2) ***
Role: Lead Linguist & Context Architect.
Target Language: {target_lang.upper()}
Topic: "{topic_name}" (Style: {random_style})
Focus Area: {focus_area}
Seed: {random_seed}

=== PEDAGOGICAL METHOD: HYBRID SLIDING SCALE ===
RATIO: 20% Isolated / 80% Contextual Inference & Collocations.

At this level, we STOP testing isolated words for 80% of challenges. The primary method
is CONTEXTUAL INFERENCE: provide a detailed scenario (3-5 sentences) in {target_lang}
with a blank (____). The surrounding sentences MUST contain semantic clues that guide
the student to the correct answer. Test NATURAL COLLOCATIONS (e.g., "lack of...",
"make a decision", "take into account") — words that naturally co-occur.

GOAL: The 5 Pillars — Complexity.
1. Syntax: Subordinate clauses, Relative clauses, Passive voice.
2. Semantics: Abstract concepts and technical jargon from "{topic_name}".
3. Pragmatics: Formal tone vs Informal tone.

INSTRUCTIONS:
1. Create 1 UNIT with 2 LESSONS.
2. Each Lesson: 15 Challenges.
3. **SYLLABUS (B2 Strict):**
   - **Grammar Focus:**
     - **Subjunctive:** Doubt/Desire.
     - **Connectors:** Therefore, However, Although, Nevertheless.
     - **Passive Voice:** Action focus.
   - **Collocations:** At least 5 challenges must test natural collocations
     specific to the topic "{topic_name}".

4. **CHALLENGE DESIGN:**
   - ~3 of 15 challenges (ISOLATED): Advanced grammar drills (subjunctive forms,
     passive voice transformations). These may use a single sentence.
   - ~12 of 15 challenges (CONTEXTUAL INFERENCE):
     - **Context:** A paragraph (3-5 sentences) — opinion piece, email, dialogue,
       or mini-article in {target_lang}. It MUST relate to "{topic_name}".
     - **Blank:** Place a ____ in the context where the answer goes.
     - **Clue Requirement:** The sentence BEFORE or AFTER the blank must contain
       a semantic clue that makes the correct answer deducible through logic.
     - **Question:** "What word or phrase best completes the blank?"
     - **Distractors:** Grammatically possible but contextually weak or wrong
       collocation. At least one distractor should be a near-synonym that fails
       in this specific context.

5. **EXPLANATION RULE (CRITICAL — THIS IS THE MOST IMPORTANT RULE):**
   - NEVER give a dictionary definition as the explanation.
   - The explanation MUST detail:
     a) What context clue in the passage points to the answer.
     b) Why the correct collocation is natural (e.g., "We say 'lack of evidence',
        not 'absence of evidence' in legal contexts because...").
     c) Why each distractor fails in THIS specific context.
   - All explanations in PORTUGUESE.

OUTPUT: Return ONLY raw JSON matching this EXACT schema:
{json_structure}
""")

    # ===========================================================================
    # PROMPT 4: THE GAUNTLET (C1-C2)
    # Sliding Scale Ratio: 100% Complex Context
    # ===========================================================================
    print(f"\n\n--- NÍVEL 4: THE GAUNTLET (C1-C2 / Mastery) ---")
    print("="*40)
    print(f"""
*** PROMPT 4: THE GAUNTLET (C1-C2) ***
Role: Strict Professor of Applied Linguistics.
Target Language: {target_lang.upper()}
Topic: "{topic_name}" (Style: {random_style})
Focus Area: {focus_area}
Seed: {random_seed}

=== PEDAGOGICAL METHOD: HYBRID SLIDING SCALE ===
RATIO: 100% Complex Context. ZERO isolated words.

At mastery level, every single challenge must be embedded in a rich, complex context.
Test TONE, IRONY, ADVANCED IDIOMS, and NUANCED VOCABULARY. Distractors must be
EXTREMELY PLAUSIBLE — they should be correct in other contexts but fail specifically
because of the tone, register, or precise nuance required by THIS passage.

GOAL: The 5 Pillars — Mastery.
1. Stylistics: Irony, Humor, Rhetorical devices, Register shifts.
2. Advanced Syntax: Inversions, Cleft sentences, Ellipsis.
3. Phonology/Orthography: Homophones, rhythm, stress patterns (text-based).

INSTRUCTIONS:
1. Create 1 UNIT with 2 LESSONS.
2. Each Lesson: 15 Challenges.
3. **SYLLABUS (C1/C2 Strict):**
   - **Context Types:** Literary excerpts, Satirical commentary, Legal clauses,
     Academic abstracts, Diplomatic correspondence — all related to "{topic_name}".
   - **Challenge Types:**
     a) **Nuance:** Distinguish between near-synonyms based on tone or register.
        (e.g., "persuade" vs "coerce" vs "convince" — which fits a diplomatic tone?)
     b) **Idioms & Cultural Expressions:** Test understanding of idiomatic meaning
        within a passage, not in isolation.
     c) **Inversion & Advanced Structures:** "Never have I ever...",
        "Had she known...", "Not only did he..., but also..."
     d) **Irony Detection:** Passages where the literal meaning contradicts the
        intended meaning. The student must identify the ironic element.

4. **DISTRACTOR DESIGN (CRITICAL):**
   - Every distractor must be a real, valid {target_lang} word/phrase.
   - At least one distractor must be a NEAR-SYNONYM that is correct in general
     but wrong for THIS specific tone/register/context.
   - At least one distractor must be grammatically perfect but semantically off.
   - NO obviously wrong answers. Every option must require thought.

5. **EXPLANATION RULE (CRITICAL — HIGHEST STANDARD):**
   - Explanations must be ANALYTICAL, not definitional.
   - Required structure for each explanation:
     a) Identify the TONE/REGISTER of the passage (formal, sarcastic, academic, etc.).
     b) Explain WHY the correct answer matches that tone while the distractors don't.
     c) If an idiom is tested, provide a brief cultural or etymological note.
     d) If a grammatical structure is tested, explain the rhetorical EFFECT
        (e.g., "Inversion here creates emphasis and a formal, dramatic tone").
   - All explanations in PORTUGUESE.

6. **NO HALLUCINATIONS:**
   - Use real, attested, high-level {target_lang} expressions.
   - If testing an idiom, it must be a genuine, commonly recognized expression.

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
    lang_code = input("\n>> Digita o código da língua (ex: en, fr, pt, ja): ").lower().strip()
    if lang_code not in LANGUAGES:
        print("Língua inválida. Usando 'en' como fallback.")
        lang_code = "en"

    # Gerar todos os níveis
    gerar_prompts(tema_id, lang_code)