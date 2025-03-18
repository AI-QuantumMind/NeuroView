from pinecone import Pinecone
import os
from dotenv import load_dotenv
from langchain_community.embeddings import HuggingFaceEmbeddings

load_dotenv()  
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

pc = Pinecone(api_key=PINECONE_API_KEY)
index_name = "my-nomic-index"
index = pc.Index(index_name)

embedding_model = HuggingFaceEmbeddings(
    model_name="nomic-ai/nomic-embed-text-v1",
    model_kwargs={"trust_remote_code": True}
)

def search_pinecone(query_text):
    query_embedding = embedding_model.embed_query(query_text)
    results = index.query(
        vector=query_embedding, 
        top_k=5, 
        include_metadata=True
    )
    return [match["metadata"]["text"] for match in results["matches"]]
