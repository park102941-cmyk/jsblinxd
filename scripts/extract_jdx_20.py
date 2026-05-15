
import pypdf

def extract_pdf_text(file_path):
    try:
        reader = pypdf.PdfReader(file_path)
        all_text = ""
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                all_text += f"\n--- Page {i+1} ---\n{text}\n"
        return all_text
    except Exception as e:
        return str(e)

file_path = "/Users/jdxblinds/Library/Mobile Documents/com~apple~CloudDocs/WORK/Work/jsblindcom/JDX CATALOG 20 FABRIC(1).pdf"
text = extract_pdf_text(file_path)

with open("jdx_catalog_20_content.txt", "w", encoding="utf-8") as f:
    f.write(text)

print("PDF extraction complete. Saved to jdx_catalog_20_content.txt")
