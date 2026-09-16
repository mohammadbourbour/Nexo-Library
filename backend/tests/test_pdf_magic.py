from app.core.files import PDF_MAGIC


def test_pdf_magic_constant():
    assert PDF_MAGIC == b"%PDF"
    assert b"%PDF-1.7 more".startswith(PDF_MAGIC)
    assert not b"<html>".startswith(PDF_MAGIC)
