# main.py
# uvicorn main:app --reload
from fastapi import FastAPI, UploadFile, File, HTTPException
from services.ocr_service import extract_information
from services.summaries_service import Summaries_Knowledge
from services.recommend_study_event import RecommendStudyEvent
from models.recommend_study_model import RecommendRequest
import uvicorn
import os

from dotenv import load_dotenv

app = FastAPI()

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

@app.post("/image_ocr")
async def ocr_endpoint(file: UploadFile = File(...)):
    """
    Endpoint OCR tài liệu từ ảnh.
    Nhận: JPG/PNG
    Trả về: Chuỗi văn bản OCR
    """

    if file.content_type not in ["image/png", "image/jpeg"]:
        raise HTTPException(status_code=400, detail="File phải là PNG hoặc JPG")

    image_bytes = await file.read()

    try:
        text = extract_information(
            image_bytes=image_bytes,
            mime_type=file.content_type,
            api_key=API_KEY
        )
        return {"text": text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize")
async def summarize_endpoint(text: str):
    """
    Endpoint tóm tắt văn bản.
    Nhận: Chuỗi văn bản
    Trả về: Chuỗi văn bản tóm tắt
    """

    try:
        summary = Summaries_Knowledge(ocr_text=text, api_key=API_KEY)
        return {"summary": summary}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/notes/analyze")
async def recommend_study_event_endpoint(payload: RecommendRequest):
    """
    Endpoint gợi ý sự kiện học tập dựa trên tóm tắt văn bản.
    Nhận: Chuỗi văn bản tóm tắt
    Trả về: Danh sách sự kiện học tập được gợi ý
    """

    try:
        result = RecommendStudyEvent(
            userEmail=payload.userEmail,
            newNote=payload.newNote.dict(),
            allEventsInMonth=[event.dict() for event in payload.allEventsInMonth],
            api_key=API_KEY
        )

        return {"newEvent": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
