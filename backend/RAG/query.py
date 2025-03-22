from pinecone import Pinecone
import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()  
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GOOGLE_API_KEY=os.getenv("GEMINI_API_KEY")
pc = Pinecone(api_key=PINECONE_API_KEY)
index_name = "my-gemini-index"
index = pc.Index(index_name)

embedding_model = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", google_api_key=GOOGLE_API_KEY
)

def search_pinecone(query_text):
    query_embedding = embedding_model.embed_query(query_text)
    results = index.query(
        vector=query_embedding, 
        top_k=5, 
        include_metadata=True
    )
    return [match["metadata"]["text"] for match in results["matches"]]
