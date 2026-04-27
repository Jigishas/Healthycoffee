#!/usr/bin/env python3
"""Export models to TorchScript and create a dynamic-quantized CPU-friendly model.

Produces two files under `models/` next to the source weights:
- `<name>_scripted.pt` — scripted (or traced) TorchScript model
- `<name>_quantized.pt` — dynamically quantized model for CPU (if applicable)
"""

from pathlib import Path
import torch
from src.inference import load_model_and_mapping, VAL_TRANSFORM
from PIL import Image
import argparse


def load_and_script(weights_path, mapping_path, out_path_script, example_image=None):
    model, mapping = load_model_and_mapping(weights_path, mapping_path)
    model.eval()

    # Try scripting; fall back to tracing with an example input
    try:
        scripted = torch.jit.script(model)
    except Exception:
        if example_image is None:
            raise
        inp_img = Image.open(example_image).convert('RGB')
        inp = VAL_TRANSFORM(inp_img).unsqueeze(0)
        scripted = torch.jit.trace(model, inp)

    scripted.save(out_path_script)
    return model


def export_quantized(cpu_model, out_path_quantized):
    # Apply dynamic quantization where supported (Linear/LSTM/GRU)
    try:
        quantized = torch.quantization.quantize_dynamic(cpu_model, {torch.nn.Linear}, dtype=torch.qint8)
        torch.jit.save(torch.jit.script(quantized), out_path_quantized)
        return True
    except Exception as e:
        print('Quantization failed:', e)
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--weights', required=True)
    parser.add_argument('--mapping', required=True)
    parser.add_argument('--example', required=False, help='Path to example image for tracing fallback')
    args = parser.parse_args()

    weights = Path(args.weights)
    mapping = Path(args.mapping)

    out_script = weights.with_name(weights.stem + '_scripted.pt')
    out_quant = weights.with_name(weights.stem + '_quantized.pt')

    model = load_and_script(str(weights), str(mapping), str(out_script), example_image=args.example)

    # Move model to CPU for quantization
    model_cpu = model.to('cpu')
    ok = export_quantized(model_cpu, str(out_quant))
    if ok:
        print('Exported scripted and quantized models:', out_script, out_quant)
    else:
        print('Scripted model saved at', out_script)


if __name__ == '__main__':
    main()
