#!/usr/bin/env python3
"""Run model/test_model_metrics.py evaluation non-interactively."""
from model.test_model_metrics import ModelMetricsTester

def main():
    tester = ModelMetricsTester()
    results = tester.run_full_evaluation()
    print('\nSaved evaluation results.')

if __name__ == '__main__':
    main()
