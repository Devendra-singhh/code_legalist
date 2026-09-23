# download_datasets.py
import os
import pandas as pd
from datasets import load_dataset

def main():
    target_dir = "./code_legalist_v3/datasets"
    os.makedirs(target_dir, exist_ok=True)
    
    datasets_to_download = {
        "bns": "dev2703/bns-2023-dataset",
        "bnss": "dev2703/bnss-2023-dataset",
        "bsa": "dev2703/bsa-2023-dataset"
    }
    
    for name, repo in datasets_to_download.items():
        print(f"Downloading {repo} from Hugging Face...")
        try:
            ds = load_dataset(repo, split="train")
            df = ds.to_pandas()
            csv_path = os.path.join(target_dir, f"{name}.csv")
            df.to_csv(csv_path, index=False)
            print(f"✅ Saved {name}.csv with {len(df)} rows to {csv_path}")
        except Exception as e:
            print(f"❌ Failed to download {repo}: {e}")

if __name__ == "__main__":
    main()
