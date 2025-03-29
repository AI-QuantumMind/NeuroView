from typing import Dict, Any
from .query import process_query
from .report_generation import generate_medical_report

async def get_chatbot_response(query: str) -> str:
    """
    Process a medical query and return a response using RAG.
    """
    # Process the query
    processed_query = await process_query(query)
    
    # Generate response
    response = await generate_medical_report({
        "query": processed_query,
        "type": "chat"
    })
    
    return response 