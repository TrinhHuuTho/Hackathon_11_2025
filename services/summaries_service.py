import google.genai as genai


def Summaries_Knowledge(ocr_text: str, api_key: str):
    """
    Hàm tóm tắt kiến thức quan trọng từ đoạn OCR được Gemini trích xuất.

    - Tóm tắt lại các khái niệm chính
    - Trình bày lại dưới dạng gọn, có cấu trúc
    - Không thêm kiến thức mới ngoài nội dung đã cung cấp
    """

    client = genai.Client(api_key=api_key)

    # summary_prompt = f"""
    # Bạn là Gemini, một mô hình tối ưu cho việc tóm tắt kiến thức học thuật phục vụ học sinh – sinh viên.

    # ======================================
    # NHIỆM VỤ CHÍNH
    # ======================================
    # Dựa trên đoạn OCR sau, hãy tạo ra một bản **tóm tắt kiến thức quan trọng nhất**:
    # ---------------------
    # {ocr_text}
    # ---------------------

    # ======================================
    # QUY TẮC BẮT BUỘC
    # ======================================
    # 1. Chỉ tóm tắt những gì *có trong văn bản OCR*.
    # 2. KHÔNG thêm kiến thức mới.
    # 3. KHÔNG suy diễn ngoài nội dung.
    # 4. Trình bày rõ ràng, dễ nhớ, hướng tới người học.
    # 5. Nhấn mạnh:
    #    - khái niệm quan trọng
    #    - định nghĩa
    #    - công thức (nếu có)
    #    - dữ kiện chính
    #    - kết luận, ý chính
    # 6. Nếu có công thức trong OCR → phải giữ nguyên công thức đó trong bản tóm tắt.
    # 7. Nếu nội dung là bảng → chỉ rút ra các thông tin quan trọng, không mô tả lại toàn bộ bảng.

    # ======================================
    # ĐỊNH DẠNG KẾT QUẢ TRẢ VỀ
    # ======================================
    # Hãy trình bày tóm tắt theo cấu trúc sau:

    # **🔹 1. Ý chính / Chủ đề**
    # - ...

    # **🔹 2. Khái niệm quan trọng**
    # - ...

    # **🔹 3. Công thức / Số liệu trọng tâm**
    # - ...

    # **🔹 4. Ví dụ ngắn (nếu OCR có)** 
    # - ...

    # ======================================
    # BẮT ĐẦU TÓM TẮT
    # ======================================
    # """

    summary_prompt = f"""
    Bạn là Gemini, một mô hình chuyên tóm tắt tài liệu học thuật và kỹ thuật ở nhiều lĩnh vực khác nhau.

    ========================================
    NHIỆM VỤ CỦA BẠN
    ========================================
    Hãy tạo bản tóm tắt kiến thức từ nội dung OCR sau đây. Mục tiêu của tóm tắt:
    - Giúp người học hiểu nhanh những ý chính quan trọng.
    - Rút ra trọng tâm kiến thức mà tài liệu muốn truyền tải.
    - Phù hợp với lĩnh vực và ngữ cảnh của nội dung (kỹ thuật, kinh tế, y khoa, toán, vật lý, CNTT, sư phạm…).
    - Không áp dụng một cấu trúc cố định — hãy tự chọn cách trình bày phù hợp với chủ đề.

    Dưới đây là nội dung OCR:
    ------------------------------------
    {ocr_text}
    ------------------------------------

    ========================================
    QUY TẮC BẮT BUỘC
    ========================================
    1. Chỉ sử dụng thông tin có trong tài liệu OCR.
    2. KHÔNG thêm, mở rộng hay dự đoán kiến thức.
    3. KHÔNG diễn giải ngoài nội dung cho sẵn.
    4. Chỉ rút gọn, hệ thống hóa và làm rõ ý.
    5. Tùy vào nội dung mà chọn cấu trúc phù hợp:
    - Nếu tài liệu là lý thuyết → tóm các khái niệm chính.
    - Nếu tài liệu là kỹ thuật → tóm quy trình, nguyên lý, công thức.
    - Nếu có bảng → chỉ nêu insight hoặc ý chính, không cần mô tả từng ô.
    - Nếu có biểu đồ → mô tả xu hướng, kết luận chính.
    - Nếu là bài tập → tóm mục tiêu bài, cách tiếp cận, công thức cốt lõi.
    - Nếu là văn bản học thuật → rút ý chính theo luận điểm.
    6. Nếu tài liệu thuộc lĩnh vực chuyên ngành → ưu tiên giữ thuật ngữ đúng cách.
    7. Giữ nguyên công thức và ký hiệu cần thiết (không sửa đổi).

    ========================================
    CÁCH TỰ ĐIỀU CHỈNH CẤU TRÚC
    ========================================
    - Hãy tự chọn cấu trúc tóm tắt dựa trên loại nội dung:
    * Ví dụ:
        - Nếu OCR là bài giảng toán → tóm công thức + định lý + ví dụ chính.
        - Nếu là tài liệu kinh tế → tóm khái niệm + mô hình + insight.
        - Nếu là bài học lịch sử → tóm sự kiện + nguyên nhân + kết quả.
        - Nếu là tài liệu kỹ thuật phần mềm → tóm luồng xử lý + thành phần.
        - Nếu là nghiên cứu khoa học → tóm vấn đề + phương pháp + kết luận.
    - Không dùng format cố định. Tùy chỉnh theo nội dung.

    ========================================
    MỤC TIÊU CUỐI CÙNG
    ========================================
    Tạo một bản tóm tắt:
    - Ngắn gọn nhưng đầy đủ ý chính
    - Có trọng tâm, dễ nhớ
    - Phản ánh đúng lĩnh vực của tài liệu
    - Không thêm kiến thức mới
    - Và trả về kết quả dưới dạng json như sau:
    {{
        "title": "<dựa vào đoạn văn bản để xác định chủ đề cho bản tóm tắt, yêu cầu ngắn gọn và rõ ràng>",
        "summary": "<bản tóm tắt kiến thức quan trọng>"
    }}

    Bắt đầu tóm tắt dựa trên nội dung ở trên.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=summary_prompt
    )

    return response.text
