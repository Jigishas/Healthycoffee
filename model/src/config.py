import yaml
import os

def load_yaml(path):
    with open(path, 'r') as f:
        return yaml.safe_load(f)

def get_classes():
    return load_yaml(os.path.join('config', 'classes.yaml'))

def get_region_context():
    return load_yaml(os.path.join('config', 'region_context.yaml'))