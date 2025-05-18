from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
from supabase import create_client, Client
from scholar_crawler import get_publications
import os

app = FastAPI()

SUPABASE_URL = os.getenv("https://ntsgzqxvjpwjocnksjgx.supabase.co")
SUPABASE_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50c2d6cXh2anB3am9jbmtzamd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NTY2ODAsImV4cCI6MjA2MzEzMjY4MH0.cWMY59C4EwY7QqOcMMxEFd3acHRjbFIBVR6AD6foekI")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class ScholarRequest(BaseModel):
    user_id: str
    scholar_id: str

@app.post("/sync-publications")
def sync_publications(data: ScholarRequest):
    try:
        publications = get_publications(data.scholar_id)
        for pub in publications:
            supabase.table("publications").insert({
                "user_id": data.user_id,
                "title": pub['title'],
                "journal": pub['journal'],
                "year": pub['year'],
                "citation_count": pub['citations'],
                "crawl_date": datetime.utcnow().isoformat()
            }).execute()
        return {"status": "success", "message": f"{len(publications)} publikasi disimpan."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-publications/{user_id}")
def get_user_publications(user_id: str):
    response = supabase.table("publications").select("*").eq("user_id", user_id).execute()
    return response.data
