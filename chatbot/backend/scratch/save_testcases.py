import os
import sys
import pandas as pd
import random

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

# Import generator from evaluate_nl_queries
from scratch.evaluate_nl_queries import generate_natural_language_query

def save_all_testcases():
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
    
    generated_testcases = []
    for idx, tc in enumerate(raw_cases):
        query = generate_natural_language_query(tc["title"], tc["sec"], tc["law"])
        generated_testcases.append({
            "Testcase_ID": idx + 1,
            "Natural_Language_Query": query,
            "Target_Law": tc["law"],
            "Target_Section": tc["sec"],
            "Section_Title": tc["title"]
        })

    df_out = pd.DataFrame(generated_testcases)
    out_path = os.path.join(backend_dir, "scratch", "all_1100_testcases.csv")
    df_out.to_csv(out_path, index=False)
    print(f"Successfully saved all 1,100 generated test cases to: {out_path}")

if __name__ == "__main__":
    save_all_testcases()
