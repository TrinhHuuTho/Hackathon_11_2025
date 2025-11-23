# Flashcard Generator

Hệ thống tự động tạo thẻ học (flashcard) từ nội dung văn bản tiếng Việt sử dụng Google Gemini API.

## Tính năng

- **Tự động tạo flashcard** từ nội dung văn bản tiếng Việt
- **Nhiều loại thẻ học**: definition (định nghĩa), question (câu hỏi), example (ví dụ)
- **Phân loại tự động** theo chủ đề (category)
- **JSON I/O thuần túy** - không lưu file, chỉ xử lý dữ liệu
- **Tích hợp Gemini API** với logic retry và fallback
- **Tối ưu hóa tiếng Việt** - prompt và xử lý đặc biệt cho tiếng Việt

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd Hackathon_11_2025
```

### 2. Cài đặt dependencies

```bash
cd flashcard_generator
pip install -r requirements.txt
```

### 3. Cấu hình API key

Tạo file `.env` trong thư mục gốc:

```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

## Sử dụng

### 1. Import và sử dụng trực tiếp

```python
from flashcard_generator.tasks import generate_flashcards

# Chuẩn bị dữ liệu input
request_data = {
    "sections": [
        {
            "title": "Python cơ bản",
            "content": "Python là ngôn ngữ lập trình cấp cao..."
        }
    ],
    "config": {
        "count": 5,
        "types": ["definition", "question", "example"]
    }
}

# Tạo flashcards
result_json = generate_flashcards(request_data)
print(result_json)
```

### 2. Sử dụng qua command line

```bash
# Tạo input.json
echo '{"sections": [...], "config": {...}}' > input.json

# Chạy generator
cd flashcard_generator
python -m flashcard_generator.main < ../input.json
```

### 3. Chạy demo

```python
from flashcard_generator.demo import run_all_demos
run_all_demos()
```

## Format dữ liệu

### Input Format

```json
{
  "sections": [
    {
      "title": "Tiêu đề phần",
      "content": "Nội dung văn bản cần tạo flashcard..."
    }
  ],
  "config": {
    "count": 10,
    "types": ["definition", "question", "example"]
  }
}
```

### Output Format

```json
{
  "flashcards": [
    {
      "id": "f1",
      "type": "definition",
      "front": "Python",
      "back": "Ngôn ngữ lập trình cấp cao với cú pháp đơn giản",
      "category": "programming"
    },
    {
      "id": "f2",
      "type": "question",
      "front": "Python sử dụng cú pháp như thế nào?",
      "back": "Cú pháp rõ ràng và dễ đọc như tiếng Anh",
      "category": "programming"
    }
  ],
  "metadata": {
    "total_count": 2,
    "requested_count": 10,
    "requested_types": ["definition", "question", "example"]
  }
}
```

## Loại thẻ học (Types)

- **definition**: Front là khái niệm/thuật ngữ, Back là định nghĩa/giải thích
- **question**: Front là câu hỏi, Back là câu trả lời chi tiết
- **example**: Front là ví dụ/tình huống, Back là giải thích/phân tích

## Cấu hình Environment

| Biến             | Mô tả                                | Mặc định         |
| ---------------- | ------------------------------------ | ---------------- |
| `GEMINI_API_KEY` | API key cho Google Gemini (bắt buộc) | -                |
| `GEMINI_MODEL`   | Model Gemini sử dụng                 | gemini-2.5-flash |
| `USE_CANNED_LLM` | Sử dụng response giả (test)          | 0                |

## Models Gemini hỗ trợ

1. `gemini-2.5-flash` (mặc định) - Nhanh, phù hợp đa số case
2. `gemini-2.5-pro` - Chất lượng cao hơn, chậm hơn
3. `gemini-2.0-flash` - Phiên bản cũ hơn

Hệ thống tự động fallback sang model khác nếu model chính thất bại.

## Ví dụ sử dụng

### Tạo flashcard từ nội dung lập trình

```python
programming_content = {
    "sections": [
        {
            "title": "Python cơ bản",
            "content": """
            Python là ngôn ngữ lập trình cấp cao, dễ học và dễ sử dụng.
            Biến trong Python không cần khai báo kiểu: x = 10, name = "Alice".
            Vòng lặp for: for item in range(5): print(item)
            """
        }
    ],
    "config": {
        "count": 6,
        "types": ["definition", "question", "example"]
    }
}

flashcards = generate_flashcards(programming_content)
```

### Tạo flashcard từ nội dung lịch sử

```python
history_content = {
    "sections": [
        {
            "title": "Lịch sử Việt Nam",
            "content": """
            Cách mạng tháng Tám 1945 là bước ngoặt quan trọng.
            Chủ tịch Hồ Chí Minh đọc Tuyên ngôn độc lập 2/9/1945.
            Chiến thắng Điện Biên Phủ 1954 kết thúc ách thống trị Pháp.
            """
        }
    ],
    "config": {
        "count": 5,
        "types": ["question", "definition"]
    }
}

flashcards = generate_flashcards(history_content)
```

## Architecture

```
flashcard_generator/
├── __init__.py          # Package exports
├── main.py              # CLI entry point
├── tasks.py             # Core flashcard generation logic
├── llm_adapter.py       # Gemini API adapter với retry logic
├── schemas.py           # Pydantic data models
├── demo.py              # Usage examples
├── requirements.txt     # Python dependencies
└── README.md           # Documentation
```

## Xử lý lỗi

- **API Key thiếu**: Kiểm tra GEMINI_API_KEY trong .env
- **Model 404**: Tự động thử models khác trong danh sách fallback
- **MAX_TOKENS**: Tự động tăng token limit và thử lại
- **JSON parse error**: Tự động clean markdown và retry
- **Network timeout**: Timeout 60s, có thể tăng nếu cần

## Testing

Để test offline không cần API key:

```bash
export USE_CANNED_LLM=1
python demo.py
```

## Dependencies

- **google-generativeai**: API client cho Gemini
- **pydantic**: Validation và serialization
- **python-dotenv**: Environment variable management
- **requests**: HTTP client
- **typing-extensions**: Type hints support

## License

MIT License - xem file LICENSE để biết thêm chi tiết.

## Đóng góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Mở Pull Request

## Liên hệ

Nếu có vấn đề hoặc đóng góp ý kiến, vui lòng tạo issue trên GitHub repository.
