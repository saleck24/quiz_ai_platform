from .text_extractor import extract_text
from .chunker import chunk_text


def process_file(file_path):
    text = extract_text(file_path)

    cleaned_text = " ".join(text.split())  # nettoyage simple
    chunks = chunk_text(cleaned_text)

    return {
        "text": cleaned_text,
        "chunks": chunks
    }
