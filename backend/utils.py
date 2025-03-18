import markdown
from weasyprint import HTML
def convert_md_to_pdf(md_file):
    """
    Converts a Markdown file to a PDF using pdfkit.
    """
    pdf_file = md_file.replace(".md", ".pdf")

    with open(md_file, "r") as file:
        md_content = file.read()
    html_content = markdown.markdown(md_content)

    HTML(string=html_content).write_pdf("output.pdf")

    return "output.pdf"


