"""Export PyTorch model to ONNX for ONNX Runtime inference.

Usage:
  python onnx_export.py --weights <weights.pth> --mapping <mapping.json> --example <image.jpg>
"""
from pathlib import Path
import torch
from src.inference import load_model_and_mapping, VAL_TRANSFORM
from PIL import Image
import argparse


def export_onnx(weights, mapping, example_image, out_path=None):
    model, mapping = load_model_and_mapping(weights, mapping)
    model.eval()
    img = Image.open(example_image).convert('RGB')
    inp = VAL_TRANSFORM(img).unsqueeze(0)
    if out_path is None:
        out_path = Path(weights).with_name(Path(weights).stem + '.onnx')

    torch.onnx.export(model, inp, str(out_path), opset_version=13, input_names=['input'], output_names=['output'], dynamic_axes={'input': {0: 'batch'}, 'output': {0: 'batch'}})
    print('Exported ONNX to', out_path)
    return out_path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--weights', required=True)
    parser.add_argument('--mapping', required=True)
    parser.add_argument('--example', required=True)
    args = parser.parse_args()
    export_onnx(args.weights, args.mapping, args.example)


if __name__ == '__main__':
    main()
