from typing import Dict, Any
import os

async def generate_medical_report(data: Dict[str, Any]) -> str:
    """
    Generate a medical report based on the provided data.
    """
    # Load report template
    template_path = os.path.join(os.path.dirname(__file__), "templates", "report_template.txt")
    with open(template_path, "r") as f:
        template = f.read()
    
    # Process the data and generate report
    report = template.format(
        query=data.get("query", ""),
        findings=data.get("findings", []),
        recommendations=data.get("recommendations", [])
    )
    
    return report 