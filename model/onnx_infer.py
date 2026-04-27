"""Simple ONNX Runtime inference helper.

Usage: python onnx_infer.py --onnx model.onnx --image img.jpg
"""
import onnxruntime as ort
from PIL import Image
import numpy as np
from src.inference import VAL_TRANSFORM
import argparse


def infer(onnx_path, image_path):
    sess = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])
    img = Image.open(image_path).convert('RGB')
    inp = VAL_TRANSFORM(img).unsqueeze(0).numpy()
    outputs = sess.run(None, {'input': inp})
    scores = outputs[0][0]
    probs = np.exp(scores - np.max(scores))
    probs = probs / probs.sum()
    pred = int(np.argmax(probs))
    return {'class_index': pred, 'confidence': float(probs[pred])}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--onnx', required=True)
    parser.add_argument('--image', required=True)
    args = parser.parse_args()
    print(infer(args.onnx, args.image))


if __name__ == '__main__':
    main()
