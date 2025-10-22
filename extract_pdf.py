#!/usr/bin/env python3
"""
PDF Text Extraction Script
Attempts to extract text from PDF without OCR using multiple methods
"""

import sys
import os

def extract_with_pypdf2():
    """Try extraction with PyPDF2"""
    try:
        import PyPDF2
        
        pdf_path = "downloads/00_CPE_generalites.pdf"
        text = ""
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            print(f"Number of pages: {len(pdf_reader.pages)}")
            
            for page_num, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                if page_text.strip():
                    text += f"\n--- PAGE {page_num + 1} ---\n"
                    text += page_text + "\n"
        
        return text
    except ImportError:
        print("PyPDF2 not available")
        return None
    except Exception as e:
        print(f"PyPDF2 error: {e}")
        return None

def extract_with_pdfplumber():
    """Try extraction with pdfplumber"""
    try:
        import pdfplumber
        
        pdf_path = "downloads/00_CPE_generalites.pdf"
        text = ""
        
        with pdfplumber.open(pdf_path) as pdf:
            print(f"Number of pages: {len(pdf.pages)}")
            
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text += f"\n--- PAGE {page_num + 1} ---\n"
                    text += page_text + "\n"
        
        return text
    except ImportError:
        print("pdfplumber not available")
        return None
    except Exception as e:
        print(f"pdfplumber error: {e}")
        return None

def extract_with_pymupdf():
    """Try extraction with PyMuPDF (fitz)"""
    try:
        import fitz  # PyMuPDF
        
        pdf_path = "downloads/00_CPE_generalites.pdf"
        text = ""
        
        doc = fitz.open(pdf_path)
        print(f"Number of pages: {doc.page_count}")
        
        for page_num in range(doc.page_count):
            page = doc[page_num]
            page_text = page.get_text()
            if page_text.strip():
                text += f"\n--- PAGE {page_num + 1} ---\n"
                text += page_text + "\n"
        
        doc.close()
        return text
    except ImportError:
        print("PyMuPDF not available")
        return None
    except Exception as e:
        print(f"PyMuPDF error: {e}")
        return None

def main():
    """Main extraction function"""
    print("Attempting to extract PDF text...")
    
    # Try different extraction methods
    methods = [
        ("PyPDF2", extract_with_pypdf2),
        ("pdfplumber", extract_with_pdfplumber),
        ("PyMuPDF", extract_with_pymupdf)
    ]
    
    extracted_text = None
    
    for method_name, method_func in methods:
        print(f"\nTrying {method_name}...")
        extracted_text = method_func()
        if extracted_text and extracted_text.strip():
            print(f"Success with {method_name}!")
            break
        print(f"{method_name} failed or returned empty text")
    
    if extracted_text and extracted_text.strip():
        print(f"\nExtracted text ({len(extracted_text)} characters):")
        print("="*50)
        print(extracted_text)
        print("="*50)
        
        # Save to file
        with open("pdf_extracted_text.txt", "w", encoding="utf-8") as f:
            f.write(extracted_text)
        print("\nText saved to pdf_extracted_text.txt")
    else:
        print("\nFailed to extract text with all methods")
        
        # Show PDF info if possible
        pdf_path = "downloads/00_CPE_generalites.pdf"
        if os.path.exists(pdf_path):
            size = os.path.getsize(pdf_path)
            print(f"PDF file size: {size} bytes")

if __name__ == "__main__":
    main()