import os
import sys
import pandas as pd

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from code_legalist_v3.service import retrieve_multi, BNS_IDX, BNSS_IDX, BSA_IDX

def run_evaluation():
    print("==================================================")
    print("CODELEGALIST V3 - RETRIEVAL EVALUATION")
    print("==================================================")

    # 1. Load datasets
    datasets_dir = os.path.join(backend_dir, "code_legalist_v3", "datasets")
    bns_df = pd.read_csv(os.path.join(datasets_dir, "bns.csv"))
    bnss_df = pd.read_csv(os.path.join(datasets_dir, "bnss.csv"))
    bsa_df = pd.read_csv(os.path.join(datasets_dir, "bsa.csv"))

    print(f"Loaded {len(bns_df)} BNS sections.")
    print(f"Loaded {len(bnss_df)} BNSS sections.")
    print(f"Loaded {len(bsa_df)} BSA sections.")
    total_test_cases = len(bns_df) + len(bnss_df) + len(bsa_df)
    print(f"Total test cases to run: {total_test_cases}")
    print("--------------------------------------------------")

    results = []

    # Helper function to evaluate a dataset
    def eval_df(df, law_name, section_col, title_col):
        correct_top_1 = 0
        correct_top_5 = 0
        failures = []

        for idx, row in df.iterrows():
            # Dynamically resolve columns
            sec_num = ""
            for col in [section_col, "Section", "section_no", "section"]:
                if col in row:
                    sec_num = str(row[col]).strip()
                    break
            
            title = ""
            for col in [title_col, "Section _name", "Section_name", "title"]:
                if col in row:
                    title = str(row[col]).strip()
                    break

            # Construct query from section title
            query = f"What is {title}?"
            
            # Execute retrieval locally
            retrieved = retrieve_multi(query, [law_name.lower()], k=5)
            
            retrieved_sections = [r["section"] for r in retrieved]
            
            is_top_1 = len(retrieved_sections) > 0 and retrieved_sections[0] == sec_num
            is_top_5 = sec_num in retrieved_sections

            if is_top_1:
                correct_top_1 += 1
            if is_top_5:
                correct_top_5 += 1
            else:
                failures.append({
                    "section": sec_num,
                    "title": title,
                    "retrieved": retrieved_sections[:3]
                })

        acc_1 = (correct_top_1 / len(df)) * 100
        rec_5 = (correct_top_5 / len(df)) * 100
        return acc_1, rec_5, failures

    # Evaluate each
    print("Evaluating BNS...")
    bns_acc_1, bns_rec_5, bns_fails = eval_df(bns_df, "BNS", "Section", "Section _name")
    print(f"BNS -> Accuracy@1: {bns_acc_1:.2f}%, Recall@5: {bns_rec_5:.2f}%")

    print("Evaluating BNSS...")
    bnss_acc_1, bnss_rec_5, bnss_fails = eval_df(bnss_df, "BNSS", "section_no", "title")
    print(f"BNSS -> Accuracy@1: {bnss_acc_1:.2f}%, Recall@5: {bnss_rec_5:.2f}%")

    print("Evaluating BSA...")
    bsa_acc_1, bsa_rec_5, bsa_fails = eval_df(bsa_df, "BSA", "section_no", "title")
    print(f"BSA -> Accuracy@1: {bsa_acc_1:.2f}%, Recall@5: {bsa_rec_5:.2f}%")
    print("--------------------------------------------------")

    # Overall metrics
    total_acc_1 = (bns_acc_1 * len(bns_df) + bnss_acc_1 * len(bnss_df) + bsa_acc_1 * len(bsa_df)) / total_test_cases
    total_rec_5 = (bns_rec_5 * len(bns_df) + bnss_rec_5 * len(bnss_df) + bsa_rec_5 * len(bsa_df)) / total_test_cases
    print(f"OVERALL METRICS:")
    print(f"Accuracy@1 (Top match correct): {total_acc_1:.2f}%")
    print(f"Recall@5 (Correct match in top 5): {total_rec_5:.2f}%")
    print("==================================================")

    # Log sample failures to text file
    with open(os.path.join(backend_dir, "scratch", "failures.txt"), "w") as f:
        f.write("SAMPLE RETRIEVAL FAILURES:\n\n")
        for fail in bns_fails[:10]:
            f.write(f"BNS Sec {fail['section']} - {fail['title']} (Retrieved: {fail['retrieved']})\n")
        for fail in bnss_fails[:10]:
            f.write(f"BNSS Sec {fail['section']} - {fail['title']} (Retrieved: {fail['retrieved']})\n")
        for fail in bsa_fails[:10]:
            f.write(f"BSA Sec {fail['section']} - {fail['title']} (Retrieved: {fail['retrieved']})\n")

if __name__ == "__main__":
    run_evaluation()
