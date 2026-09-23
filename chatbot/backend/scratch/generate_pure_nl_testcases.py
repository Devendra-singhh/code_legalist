import os
import sys
import pandas as pd
import random

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

def generate_pure_natural_language_query(title, law):
    title_clean = title.lower().strip().rstrip('.')
    
    # Pure templates without any section numbers or explicit law names
    bns_templates = [
        f"What is the legal definition of {title_clean}?",
        f"What is the punishment for {title_clean}?",
        f"Can you explain the offence of {title_clean}?",
        f"My friend was accused of {title_clean}. What are the consequences?",
        f"Is {title_clean} considered a crime?",
        f"What happens if someone commits {title_clean}?",
    ]
    
    bnss_templates = [
        f"What is the legal procedure for {title_clean}?",
        f"How is {title_clean} handled during a police investigation?",
        f"What are the guidelines regarding {title_clean}?",
        f"What is the process of {title_clean} in court?",
    ]
    
    bsa_templates = [
        f"Is {title_clean} admissible as evidence in court?",
        f"How do we prove {title_clean}?",
        f"What are the rules regarding {title_clean} in a trial?",
        f"Is {title_clean} considered valid proof?",
    ]

    # Conversational overrides for common offences
    if "theft" in title_clean:
        return random.choice([
            "Someone stole my phone from my bag. What offence is this?",
            "What is the punishment for stealing a laptop?",
            "A pickpocket took my wallet. Which section applies?"
        ])
    elif "murder" in title_clean and "attempt" not in title_clean:
        return random.choice([
            "What is the penalty for committing murder?",
            "A person killed someone intentionally. What is that crime?",
            "What is the definition and punishment for murder?"
        ])
    elif "attempt" in title_clean and "murder" in title_clean:
        return random.choice([
            "Someone tried to kill my brother but he survived. What is the crime?",
            "What is the punishment for attempting to murder someone?",
            "What is the legal section and punishment for attempting to kill someone?"
        ])
    elif "trespass" in title_clean:
        return random.choice([
            "My neighbor entered my plot without my permission.",
            "Someone broke into my house at night. What trespass section applies?",
            "Is entering someone's property without consent a crime?"
        ])
    elif "cheating" in title_clean:
        return random.choice([
            "I was scammed of 50000 rupees by a fake investment scheme online.",
            "What is the law for cheating and fraud?",
            "Someone duped me using fake documents."
        ])
    elif "homicide" in title_clean:
        return random.choice([
            "What is the definition of culpable homicide?",
            "What is the difference between murder and culpable homicide?",
            "What is the punishment for culpable homicide not amounting to murder?"
        ])
    elif "rape" in title_clean:
        return random.choice([
            "What is the punishment for committing rape?",
            "What is the definition of sexual assault and rape under the new laws?",
            "What does the law say about gang rape?"
        ])

    # Select template randomly based on law
    if law == "BNS":
        return random.choice(bns_templates)
    elif law == "BNSS":
        return random.choice(bnss_templates)
    else:
        return random.choice(bsa_templates)

def save_pure_testcases():
    datasets_dir = os.path.join(backend_dir, "code_legalist_v3", "datasets")
    bns_df = pd.read_csv(os.path.join(datasets_dir, "bns.csv"))
    bnss_df = pd.read_csv(os.path.join(datasets_dir, "bnss.csv"))
    bsa_df = pd.read_csv(os.path.join(datasets_dir, "bsa.csv"))

    raw_cases = []
    
    def get_row_data(row, sec_col, title_col):
        sec_num = ""
        for col in [sec_col, "Section", "section_no", "section"]:
            if col in row:
                sec_num = str(row[col]).strip()
                break
        title = ""
        for col in [title_col, "Section _name", "Section_name", "title"]:
            if col in row:
                title = str(row[col]).strip()
                break
        return sec_num, title

    # Collect BNS
    for _, row in bns_df.iterrows():
        sec, title = get_row_data(row, "Section", "Section _name")
        raw_cases.append({"sec": sec, "title": title, "law": "BNS"})
        if len(raw_cases) < 400:
            raw_cases.append({"sec": sec, "title": title, "law": "BNS", "alt": True})

    # Collect BNSS
    for _, row in bnss_df.iterrows():
        sec, title = get_row_data(row, "section_no", "title")
        raw_cases.append({"sec": sec, "title": title, "law": "BNSS"})

    # Collect BSA
    for _, row in bsa_df.iterrows():
        sec, title = get_row_data(row, "section_no", "title")
        raw_cases.append({"sec": sec, "title": title, "law": "BSA"})

    raw_cases = raw_cases[:1100]
    
    pure_testcases = []
    for idx, tc in enumerate(raw_cases):
        query = generate_pure_natural_language_query(tc["title"], tc["law"])
        pure_testcases.append({
            "Testcase_ID": idx + 1,
            "Pure_Natural_Language_Query": query,
            "Target_Law": tc["law"],
            "Target_Section": tc["sec"],
            "Section_Title": tc["title"]
        })

    df_out = pd.DataFrame(pure_testcases)
    out_path = os.path.join(backend_dir, "scratch", "pure_natural_language_testcases.csv")
    df_out.to_csv(out_path, index=False)
    print(f"Successfully saved 1,100 pure natural language test cases to: {out_path}")

if __name__ == "__main__":
    save_pure_testcases()
