import markdown
from xhtml2pdf import pisa

def convert_md_to_pdf(md_file):
    pdf_file = md_file.replace(".md", ".pdf")
    with open(md_file, "r", encoding="utf-8") as file:
        md_content = file.read()
    html_content = markdown.markdown(md_content)
    with open(pdf_file, "w+b") as result_file:
        pisa_status = pisa.CreatePDF(html_content, dest=result_file)
    if pisa_status.err:
        return None
    return pdf_file 