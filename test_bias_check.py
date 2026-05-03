from src.inference import TorchClassifier
c = TorchClassifier('model/fine_tuned_last_layer.pth','model/leaf_diseases/class_mapping_diseases.json')
print('applied_bias=', getattr(c,'applied_bias',False))
