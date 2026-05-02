import torch
from torchvision import models, transforms
from PIL import Image
import json
import numpy as np
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Optimized transforms for faster preprocessing
VAL_TRANSFORM =
