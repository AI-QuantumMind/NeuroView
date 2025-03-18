import os
from dotenv import load_dotenv
from llama_index.llms.gemini import Gemini
from RAG.query import search_pinecone

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def chatbot_response(query):
    """
    Generates a structured medical response based on retrieved study materials.
    """
    # Initialize Gemini model
    llm = Gemini(model="models/gemini-2.0-flash")
    
    # Use Gemini to determine if the query is conversational
    conversation_check = llm.complete(
         f"""Determine if the following query is related to medical topics, including symptoms, diseases, treatments, or health-related concerns.
        Respond with 'Yes' if it is, otherwise respond with 'No'.
        
        Query: {query}
        """
    )
    
    if conversation_check.text.strip().lower() == "no":
        return "Hello! This assistant specializes in generating medical reports. Please ask a medical-related question."
    
    # Retrieve relevant medical information from Pinecone
    pinecone_text = search_pinecone(query)
    
    # If no relevant data is found, return an appropriate response
    if not pinecone_text:
        return "No relevant medical data found. Please refine your query with specific medical terms."
    
    response = llm.complete(
        f"""Restructure the following context with precision and detail.
        Your response must be relevant to **{query}** and formatted properly in **Markdown**.
        
        **---------**  
        
        **Context:**  
        {pinecone_text}
        
        **Disclaimer:**  
        This AI-generated medical report is for informational purposes only and should not replace professional medical advice.
        """
    )
    
    response_text = response.text
    start_delimiter = "```markdown"
    start_index = response_text.find(start_delimiter) + len(start_delimiter)
    
    if start_index != -1:
        return response_text[start_index:].strip()
    else:
        return "Delimiters not found in the response." + response_text

# Example usage
# summary = chatbot_response(query="What is brain tumor")
# print(summary)
