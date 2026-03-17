import json
import os

INPUT_FILE = "conteudo.json"  # O ficheiro onde colas o JSON da AI
OUTPUT_FILE = "seed_generated.sql"
COURSE_ID = 1 # ID do teu curso C2

def clean_text(text):
    if not text: return ""
    # Substitui aspas simples por duas aspas simples (escape SQL)
    return str(text).replace("'", "''").strip()

def generate_sql_script():
    if not os.path.exists(INPUT_FILE):
        print(f"[ERRO] Cria o ficheiro {INPUT_FILE} e cola lá o JSON!")
        return

    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"[ERRO] JSON inválido: {e}")
        return

    print(f"Processando unidade: {data.get('unit_title')}...")

    u_title = clean_text(data.get('unit_title', 'Untitled Unit'))
    u_desc = clean_text(data.get('unit_description', ''))
    
    # SQL Transaction Block
    sql = f"""
-- --- INSERIR UNIDADE: {u_title} ---
DO $$
DECLARE
    vid_unit int;
    vid_lesson int;
    vid_chal int;
BEGIN
    -- 1. Insert Unit
    INSERT INTO public.units (title, description, "order", course_id)
    VALUES ('{u_title}', '{u_desc}', (SELECT count(*)+1 FROM public.units WHERE course_id={COURSE_ID}), {COURSE_ID})
    RETURNING id INTO vid_unit;
"""

    lessons = data.get('lessons', [])
    for idx_l, lesson in enumerate(lessons):
        l_title = clean_text(lesson.get('title', f'Lesson {idx_l+1}'))
        
        sql += f"""
    -- 2. Insert Lesson {idx_l+1}
    INSERT INTO public.lessons (title, "order", unit_id)
    VALUES ('{l_title}', {idx_l+1}, vid_unit)
    RETURNING id INTO vid_lesson;
"""
        
        challenges = lesson.get('challenges', [])
        for idx_c, chall in enumerate(challenges):
            q_text = clean_text(chall.get('question', ''))
            c_type = clean_text(chall.get('type', 'SELECT'))
            
            sql += f"""
    -- 3. Insert Challenge {idx_c+1}
    INSERT INTO public.challenges (question, type, "order", lesson_id, context, explanation)
    VALUES ('{q_text}', '{c_type}', {idx_c+1}, vid_lesson, '{clean_text(chall.get("context"))}', '{clean_text(chall.get("explanation"))}')
    RETURNING id INTO vid_chal;
"""
            
            options = chall.get('options', [])
            for opt in options:
                opt_text = clean_text(opt.get('text'))
                is_correct = 'true' if opt.get('correct') else 'false'
                
                sql += f"""
    INSERT INTO public.challenge_options (text, correct, challenge_id)
    VALUES ('{opt_text}', {is_correct}, vid_chal);
"""

    sql += """
END $$;
-- --- FIM DA UNIDADE ---
"""
    
    # Append mode ('a') para poderes acumular vários JSONs no mesmo ficheiro SQL
    with open(OUTPUT_FILE, 'a', encoding='utf-8') as f:
        f.write(sql + "\n")
    
    print(f"[SUCESSO] SQL adicionado a {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_sql_script()