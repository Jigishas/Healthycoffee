from evaluate_model import ModelEvaluator

# Compare original vs optimized models on the same dataset
print('Comparing Original vs Optimized Models on Test Dataset')
print('=' * 60)

# Evaluate both models
original_evaluator = ModelEvaluator('test_dataset', 'original')
optimized_evaluator = ModelEvaluator('test_dataset', 'optimized')

print('Evaluating Original Model...')
original_results = original_evaluator.run_evaluation()

print('\nEvaluating Optimized Model...')
optimized_results = optimized_evaluator.run_evaluation()

if original_results and optimized_results:
    print('\n' + '=' * 80)
    print('MODEL COMPARISON SUMMARY')
    print('=' * 80)

    for model_type in ['disease', 'deficiency']:
        if model_type in original_results and model_type in optimized_results:
            orig = original_results[model_type]
            opt = optimized_results[model_type]

            print(f'\n{model_type.upper()} MODEL COMPARISON:')
            print('-' * 40)
            print('Metric              Original      Optimized     Improvement')
            print('-' * 60)
            print(f'Accuracy           {orig["accuracy"]:.4f}        {opt["accuracy"]:.4f}        {opt["accuracy"]-orig["accuracy"]:+7.4f}')
            print(f'Precision          {orig["precision"]:.4f}        {opt["precision"]:.4f}        {opt["precision"]-orig["precision"]:+7.4f}')
            print(f'Recall            {orig["recall"]:.4f}        {opt["recall"]:.4f}        {opt["recall"]-orig["recall"]:+7.4f}')
            print(f'F1-Score          {orig["f1_score"]:.4f}        {opt["f1_score"]:.4f}        {opt["f1_score"]-orig["f1_score"]:+7.4f}')
            print(f'Avg Inference Time {orig["avg_inference_time"]:.4f}        {opt["avg_inference_time"]:.4f}        {opt["avg_inference_time"]-orig["avg_inference_time"]:+7.4f}')
            print(f'Avg Confidence    {orig["avg_confidence"]:.4f}        {opt["avg_confidence"]:.4f}        {opt["avg_confidence"]-orig["avg_confidence"]:+7.4f}')
else:
    print('Could not evaluate both models. Check test data and model files.')
