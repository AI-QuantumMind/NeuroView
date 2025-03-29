from typing import Dict, Any

async def generate_report(analysis_result: Dict[str, Any]) -> str:
    """
    Generate a medical report based on the MRI analysis results.
    """
    report = []
    
    # Add patient information
    report.append("# Medical Report")
    report.append(f"## Analysis Date: {analysis_result.get('date', 'N/A')}")
    
    # Add findings
    report.append("## Findings")
    for finding in analysis_result.get('findings', []):
        report.append(f"- {finding}")
    
    # Add recommendations
    report.append("## Recommendations")
    for recommendation in analysis_result.get('recommendations', []):
        report.append(f"- {recommendation}")
    
    return "\n".join(report) 