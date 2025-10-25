from pathlib import Path
from typing import Iterable

# allowed image extensions for uploads
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "gif", "tif", "tiff", "webp"}

def allowed_file(filename: str) -> bool:
    """
    Return True if filename has an allowed extension.
    Safe to call with None or empty string.
    """
    if not filename or not isinstance(filename, str):
        return False
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS