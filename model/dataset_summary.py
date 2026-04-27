#!/usr/bin/env python3
"""Dataset summary and label-mismatch reporter

Scans `test_dataset/` and model class mappings under `models/`.
Produces `model/dataset_summary.json` with per-class counts, missing mappings,
and example files to inspect.
"""

from pathlib import Path
import json
from collections import defaultdict
import sys


def load_class_mappings(models_dir: Path):
    mappings = {}
    for sub in models_dir.iterdir():
        if not sub.is_dir():
            continue
        # look for class_mapping_*.json
        for mf in sub.glob('class_mapping*.json'):
            try:
                data = json.loads(mf.read_text(encoding='utf-8'))
                # normalize names to lowercase
                names = {k: v.get('name', str(v)).strip().lower() for k, v in data.items()}
                mappings[sub.name] = {
                    'file': str(mf),
                    'mapping': data,
                    'names': set(names.values())
                }
            except Exception as e:
                mappings[sub.name] = {'file': str(mf), 'error': str(e)}
    return mappings


def scan_test_dataset(test_dir: Path):
    results = {}
    for split in ['diseases', 'deficiencies']:
        split_path = test_dir / split
        class_counts = defaultdict(int)
        samples = defaultdict(list)
        if split_path.exists():
            for class_dir in split_path.iterdir():
                if not class_dir.is_dir():
                    continue
                for ext in ('*.jpg', '*.jpeg', '*.png'):
                    for p in class_dir.glob(ext):
                        class_counts[class_dir.name.strip().lower()] += 1
                        if len(samples[class_dir.name.strip().lower()]) < 5:
                            samples[class_dir.name.strip().lower()].append(str(p))
        results[split] = {
            'total_classes': len(class_counts),
            'total_images': sum(class_counts.values()),
            'per_class_counts': dict(class_counts),
            'example_files': dict(samples)
        }
    return results


def compare(mappings, test_scan):
    report = {}
    # For each mapping (models subdir) guess whether it's diseases or deficiencies
    for model_name, info in mappings.items():
        model_names = info.get('names', set())
        # choose which test split to compare by simple heuristic
        if 'diseas' in model_name.lower() or 'disease' in model_name.lower():
            split = 'diseases'
        elif 'defici' in model_name.lower() or 'deficiency' in model_name.lower():
            split = 'deficiencies'
        else:
            # fallback: compare to both
            split = None

        if split:
            test_names = set(test_scan.get(split, {}).get('per_class_counts', {}).keys())
            missing_in_mapping = sorted(list(test_names - model_names))
            missing_in_test = sorted(list(model_names - test_names))
            report[model_name] = {
                'compared_split': split,
                'mapping_file': info.get('file'),
                'mapping_class_count': len(model_names),
                'test_class_count': len(test_names),
                'missing_in_mapping': missing_in_mapping,
                'missing_in_test': missing_in_test
            }
        else:
            report[model_name] = {'mapping_file': info.get('file'), 'note': 'unknown split, manual review needed'}

    return report


def main():
    repo_root = Path(__file__).resolve().parent
    test_dir = repo_root / 'test_dataset'
    models_dir = repo_root / 'models'

    if not test_dir.exists():
        print(f"Test dataset directory not found: {test_dir}")
        sys.exit(1)

    mappings = load_class_mappings(models_dir)
    test_scan = scan_test_dataset(test_dir)
    comparison = compare(mappings, test_scan)

    summary = {
        'models_scanned': list(mappings.keys()),
        'test_scan': test_scan,
        'comparison': comparison
    }

    out_file = repo_root / 'dataset_summary.json'
    out_file.write_text(json.dumps(summary, indent=2), encoding='utf-8')

    print("Dataset summary saved to:", out_file)
    # Print quick human summary
    for split, info in test_scan.items():
        print(f"{split}: {info['total_classes']} classes, {info['total_images']} images")

    for model_name, comp in comparison.items():
        print(f"Model: {model_name} compared to {comp.get('compared_split', 'N/A')}")
        if 'missing_in_mapping' in comp and comp['missing_in_mapping']:
            print(f"  - Missing in mapping (present in tests): {comp['missing_in_mapping'][:5]}")
        if 'missing_in_test' in comp and comp['missing_in_test']:
            print(f"  - Missing in tests (present in mapping): {comp['missing_in_test'][:5]}")


if __name__ == '__main__':
    main()
