import os
from dotenv import load_dotenv
from llama_index.llms.gemini import Gemini

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

llm = Gemini(
    model="models/gemini-2.0-flash",
)

def report_generation(data_json):
    """
    Generates a medical report in Markdown format using the provided JSON data.
    """
    with open("template.txt", "r") as file:
        template = file.read()
    
    response = llm.complete(
        f"""
        Follow the following steps to generate a report in markdown format: {template} 
        
        Here's the data required in JSON format: {data_json}
        """
    )
    
    response_text = response.text
    start_delimiter = "```markdown"
    end_delimiter = "```"
    start_index = response_text.find(start_delimiter) + len(start_delimiter)
    end_index = response_text.rfind(end_delimiter)
    if start_index != -1:
        return response_text[start_index:end_index].strip()

# Example usage (assuming data_json comes from an API call)
# report = report_generation(data_json)
# print(report)
