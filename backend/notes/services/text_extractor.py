import pdfplumber
from docx import Document
import os


def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return extract_pdf(file_path)

    elif ext == ".docx":
        return extract_docx(file_path)

    elif ext == ".txt":
        return extract_txt(file_path)

    else:
        raise ValueError("Format non supporté")


def extract_pdf(path):
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def extract_docx(path):
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)


def extract_txt(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()
