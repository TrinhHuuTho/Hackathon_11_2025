# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from services.ocr_service import extract_information
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

    print("Received file:", file.filename)
    print(API_KEY)

    try:
        text = extract_information(
            image_bytes=image_bytes,
            mime_type=file.content_type,
            api_key=API_KEY
        )
        return {"text": text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
