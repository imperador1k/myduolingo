import os
import sys
import json
import time
import random
import argparse

from google import genai
from google.genai import types
import psycopg2

# Carregar variáveis de ambiente
from dotenv import load_dotenv
load_dotenv()

# Configurar Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("[ERRO] GEMINI_API_KEY não encontrada no .env.local")
    sys.exit(1)
client = genai.Client(api_key=GEMINI_API_KEY)

# Configurar DB
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("[ERRO] DATABASE_URL não encontrada no .env.local")
    sys.exit(1)


# --- CONSTANTES GLOBAIS ---
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

TEMAS = {
    1: {"nome": "Corporate Strategy & Hostile Takeovers", "foco": "Formal Business English, Mergers, negotiation idioms"},
    2: {"nome": "Startups & Venture Capital", "foco": "Pitching, equity, burn rate, agile terminology"},
    3: {"nome": "Office Politics & HR Conflicts", "foco": "Diplomacy, passive-aggressive phrasing, conflict resolution"},
    4: {"nome": "Global Supply Chain Logistics", "foco": "Process descriptions, causality, inventory terms"},
    5: {"nome": "Personal Finance, Taxation & Bureaucracy", "foco": "Credit scores, tax deductions, banking jargon, loans"},
    6: {"nome": "Criminal Law & Courtroom Drama", "foco": "Legal jargon, objection types, formal accusation"},
    7: {"nome": "International Diplomacy & Geopolitics", "foco": "Soft power, sanctions, treaties, formal address"},
    8: {"nome": "Social Inequality & Activism", "foco": "Sociological terms, protest vocabulary, rights"},
    9: {"nome": "Climate Change, Ecology & Green Tech", "foco": "Carbon footprint, sustainability, environmental disaster vocabulary"},
    10: {"nome": "Artificial Intelligence Ethics", "foco": "Speculation (future tenses), bias, algorithmic terms"},
    11: {"nome": "Neuroscience & The Human Mind", "foco": "Cognitive functions, biological metaphors, memory"},
    12: {"nome": "Space Exploration & Colonization", "foco": "Physics concepts, hypothetical conditionals, survival"},
    13: {"nome": "Cybersecurity & Hacking", "foco": "Digital threats, encryption, tech slang"},
    14: {"nome": "Real Estate & Home Renovation", "foco": "Mortgages, construction defects, architectural styles"},
    15: {"nome": "Advanced Culinary Arts", "foco": "Cooking techniques, flavor profiles, restaurant critique"},
    16: {"nome": "Travel: The Airport Nightmare", "foco": "Customs, delays, compensation claims, logistics"},
    17: {"nome": "Automotive Trouble, Traffic & Commuting", "foco": "Car parts, describing breakdowns, insurance claims"},
    18: {"nome": "Health: Symptoms & Hospitalization", "foco": "Describing pain accurately, medical procedures"},
    19: {"nome": "Romance: Breakups & Divorce", "foco": "Emotional nuance, regret structures, arguments"},
    20: {"nome": "Grief, Loss & Nostalgia", "foco": "Subtle emotions, memories, past habits (used to/would)"},
    21: {"nome": "Betrayal & Deception", "foco": "Lying nuances, uncovering truth, accusation"},
    22: {"nome": "Art History & Criticism", "foco": "Descriptive adjectives, abstract concepts, eras"},
    23: {"nome": "Literature & Storytelling", "foco": "Narrative tenses, metaphors, character archetypes"},
    24: {"nome": "Sports Dynamics, Competition & Fandom", "foco": "Sports idioms used in daily life, competition, aggressive rivalry"},
    25: {"nome": "Mass Media, Journalism & Misinformation", "foco": "Bias, sensationalism, fact-checking, objective reporting"},
    26: {"nome": "Philosophy & Existentialism", "foco": "Complex reasoning, abstract nouns, rhetorical questions"},
    27: {"nome": "Urban Slang & Street Talk (UK/US)", "foco": "Colloquialisms, phrasal verbs, rapid speech decoding"},
}

def clean_text(text):
    if not text: return ""
    return str(text).replace("'", "''").strip()

def get_base_prompt(topic_name, focus_area, target_lang, level, style, seed):
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
              "explanation": "String (Pedagogical explanation in PORTUGUESE. For B1+, explain WHY the context clue leads to the answer.)"
            }
          ]
        }
      ]
    }
    """

    base = f"""
Role: Senior Language Curriculum Designer.
Target Language: {target_lang.upper()}
Source Language: PORTUGUESE.
Topic: "{topic_name}" (Style: {style})
Focus Area: {focus_area}
Seed: {seed}

=== PEDAGOGICAL METHOD: HYBRID SLIDING SCALE ===
"""
    if level == "A1":
        base += "RATIO: 80% Direct Translation / 20% Simple Context.\nThis level tests basic building blocks. Keep sentences short.\n"
    elif level == "A2_B1":
        base += "RATIO: 50% Isolated Drill / 50% Contextual Inference.\nProvide 2-3 sentence scenarios for context challenges.\n"
    elif level == "B2":
        base += "RATIO: 20% Isolated Grammar / 80% Contextual Inference & Collocations.\nUse 3-5 sentence passages. Test natural combinations.\n"
    else: # C1_C2
        base += "RATIO: 0% Isolated. 100% Complex Context.\nFocus on tone, irony, idioms, inversions. Every distractor must be plausible.\n"

    base += f"""
=== GENERATION RULES ===
1. Generate exactly 1 Unit, 3 Lessons per Unit, and 4 to 5 Challenges per lesson.
2. The `type` must always be "SELECT".
3. NO Markdown markdown blocks. Output MUST be ONLY valid, pure JSON format matching exactly this structure:
{json_structure}
"""
    return base


def call_llm(prompt_text, level, retries=1):
    model_name = "gemini-2.5-flash"
    print(f"[SYSTEM] Using model: {model_name} (Dynamic Routing based on Level {level})")
    
    for attempt in range(retries + 1):
        try:
            print(f"[LLM] Generative API Request (Attempt {attempt+1})...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt_text,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    response_mime_type="application/json",
                ),
            )
            raw_json = response.text
            # Clean possible markdown artifacts if model ignored instruction
            raw_json = raw_json.replace("```json", "").replace("```", "").strip()
            
            # Validação
            data = json.loads(raw_json)
            print("[LLM] Sucesso! JSON válido gerado.")
            return data
            
        except json.JSONDecodeError as e:
            print(f"[ERRO] Falha no parse do JSON gerado: {e}")
            if attempt < retries:
                print(">>> Retrying...")
                prompt_text += f"\n\nERROR PREVIOUS ATTEMPT: Output was not valid JSON. Ensure you return ONLY valid JSON. Error: {e}"
                time.sleep(2)
            else:
                return None
        except Exception as e:
             print(f"[ERRO] Falha na API Gemini: {e}")
             return None

def interactive_course_selection(lang_code, target_lang):
    print(f"\nPASSO 1.5: ESCOLHE O CURSO DE DESTINO PARA {target_lang.upper()}:")
    print("-" * 60)
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        # conn.autocommit = True # Read-only and single insert
        with conn.cursor() as cur:
            cur.execute("SELECT id, title FROM public.courses WHERE language_code = %s ORDER BY id ASC", (lang_code,))
            courses = cur.fetchall()
            
            valid_ids = []
            if courses:
                print("Cursos existentes:")
                for c_id, c_title in courses:
                    print(f"[{c_id}] {c_title}")
                    valid_ids.append(c_id)
            else:
                print("Não existem cursos para esta língua ainda.")
                
            print("\nOu crie um novo:")
            print("[0] [+] Criar um novo Curso (Ex: Gramática, Negócios)")
            print("-" * 60)
            
            valid_ids.append(0)
            
            choice_id = -1
            while choice_id not in valid_ids:
                try:
                    choice_id = int(input("Digite o ID do Curso ou 0 para criar novo: ").strip())
                except ValueError:
                    pass
                    
            if choice_id == 0:
                new_title = ""
                while not new_title:
                    new_title = input(f"Digite o título do novo curso de {target_lang}: ").strip()
                
                print(f"> Criando novo course '{new_title}' para {target_lang}...")
                cur.execute("""
                    INSERT INTO public.courses (title, image_src, language_code, language)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                """, (new_title, f"/{lang_code}.svg", lang_code, target_lang))
                new_id = cur.fetchone()[0]
                conn.commit()
                return new_id
            else:
                return choice_id
                
    except Exception as e:
        print(f"[ERRO] Falha ao conectar à BD para buscar cursos: {e}")
        sys.exit(1)
    finally:
        if 'conn' in locals() and conn:
            conn.close()


def insert_into_db(data, course_id):
    print("\n[DB] A iniciar transação...")
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        
        with conn.cursor() as cur:
            
            u_title = clean_text(data.get('unit_title', 'Untitled Unit'))
            u_desc = clean_text(data.get('unit_description', ''))
            
            print(f"[DB] Inserindo Unidade: {u_title}")
            cur.execute("""
                INSERT INTO public.units (title, description, "order", course_id)
                VALUES (%s, %s, (SELECT COALESCE(count(*),0)+1 FROM public.units WHERE course_id=%s), %s)
                RETURNING id;
            """, (u_title, u_desc, course_id, course_id))
            
            vid_unit = cur.fetchone()[0]
            
            lessons = data.get('lessons', [])
            for idx_l, lesson in enumerate(lessons):
                l_title = clean_text(lesson.get('title', f'Lesson {idx_l+1}'))
                
                print(f"  -> Inserindo Lesson: {l_title}")
                cur.execute("""
                    INSERT INTO public.lessons (title, "order", unit_id)
                    VALUES (%s, %s, %s)
                    RETURNING id;
                """, (l_title, idx_l+1, vid_unit))
                
                vid_lesson = cur.fetchone()[0]
                
                challenges = lesson.get('challenges', [])
                for idx_c, chall in enumerate(challenges):
                    q_text = clean_text(chall.get('question', ''))
                    c_type = clean_text(chall.get('type', 'SELECT'))
                    c_ctx = clean_text(chall.get('context', ''))
                    c_exp = clean_text(chall.get('explanation', ''))
                    
                    cur.execute("""
                        INSERT INTO public.challenges (question, type, "order", lesson_id, context, explanation)
                        VALUES (%s, 'SELECT', %s, %s, %s, %s)
                        RETURNING id;
                    """, (q_text, idx_c+1, vid_lesson, c_ctx, c_exp))
                    
                    vid_chal = cur.fetchone()[0]
                    
                    options = chall.get('options', [])
                    for opt in options:
                        opt_text = clean_text(opt.get('text'))
                        is_correct = bool(opt.get('correct'))
                        
                        cur.execute("""
                            INSERT INTO public.challenge_options (text, correct, challenge_id)
                            VALUES (%s, %s, %s);
                        """, (opt_text, is_correct, vid_chal))

        conn.commit()
        print("\n[SUCESSO] Todos os dados foram inseridos com sucesso!")
        
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"\n[CRÍTICO] Erro na base de dados. Transação abortada (Rollback efectuado).")
        print(f"Erro: {e}")
        sys.exit(1)
    finally:
        if 'conn' in locals() and conn:
            conn.close()


def main():
    print("\n" + "█" * 60)
    print("  SYSTEM C5: MULTILINGUAL ARCHITECT — CONTENT PIPELINE")
    print("█" * 60 + "\n")

    print("PASSO 1: ESCOLHE A LÍNGUA ALVO:")
    print("-" * 60)
    for code, name in LANGUAGES.items():
        print(f"[{code}] {name}")
    print("-" * 60)
    
    lang_code = ""
    while lang_code not in LANGUAGES:
        lang_code = input("Digite o código da língua (ex: en, pt, ja): ").strip().lower()

    target_lang = LANGUAGES[lang_code]
    
    # PASSO 1.5 Interactive Course Selection
    course_id = interactive_course_selection(lang_code, target_lang)

    print("\nPASSO 2: ESCOLHE UM TEMA:")
    print("-" * 60)
    for t_id, t_data in TEMAS.items():
        print(f"[{t_id:02d}] {t_data['nome']}")
    print("-" * 60)
    
    theme_id = 0
    while theme_id not in TEMAS:
        try:
            theme_id = int(input("Digite o ID do Tema (1-27): ").strip())
        except ValueError:
            pass

    print("\nPASSO 3: ESCOLHE O NÍVEL CEFR:")
    print("-" * 60)
    levels_map = {1: "A1", 2: "A2_B1", 3: "B2", 4: "C1_C2"}
    print("[1] A1 | [2] A2_B1 | [3] B2 | [4] C1_C2")
    print("-" * 60)
    
    lvl_choice = 0
    while lvl_choice not in levels_map:
        try:
            lvl_choice = int(input("Escolha o nível (1-4): ").strip())
        except ValueError:
            pass
            
    level = levels_map[lvl_choice]
    
    tema = TEMAS[theme_id]
    styles = ["Humorous", "Academic", "Dramatic", "Casual", "Urgent", "Poetic", "Sarcastic", "Mystery"]
    random_style = random.choice(styles)
    random_seed = random.randint(1000, 9999)
    
    print("\n" + "=" * 60)
    print(f" CONTENT PIPELINE: {target_lang.upper()} | TEMA: {tema['nome']} | NÍVEL: {level}")
    print("=" * 60)
    
    # GERAR PROMPT
    prompt_text = get_base_prompt(tema['nome'], tema['foco'], target_lang, level, random_style, random_seed)
    
    # CHAMAR O LLM
    print("\n1. Solicitando conteúdo à Inteligência Artificial (Gemini)...")
    json_data = call_llm(prompt_text, level, retries=1)
    
    if not json_data:
        print("\n[FALHA] Não foi possível gerar JSON válido após os retentativas.")
        sys.exit(1)
        
    # INSERIR NO DB
    print("\n2. Abrindo conexão ao Supabase e inserindo dados...")
    insert_into_db(json_data, course_id)

if __name__ == "__main__":
    main()
