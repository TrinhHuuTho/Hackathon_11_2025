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
    Endpoint OCR tài liệu từ ảnh hoặc PDF.
    Nhận: PNG / JPG / PDF
    Trả về: Chuỗi văn bản OCR đầy đủ
    """

    # ---- 1. Kiểm tra loại file hợp lệ ----
    allowed_types = ["image/png", "image/jpeg", "application/pdf"]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="File chỉ hỗ trợ PNG, JPG hoặc PDF"
        )

    # ---- 2. Đọc bytes ----
    file_bytes = await file.read()

    try:
        # ---- 3. Gọi hàm OCR ----
        text = extract_information(
            file_bytes=file_bytes,
            mime_type=file.content_type,
            api_key=API_KEY
        )

        # ---- 4. Trả về kết quả ----
        return {
            "filename": file.filename,
            "mime_type": file.content_type,
            "text": text
        }

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
