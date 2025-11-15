# services/ocr_service.py
import google.genai as genai
from google.genai import types
from pdf2image import convert_from_bytes

def extract_information(file_bytes: bytes, mime_type: str, api_key: str):
    """
    Hàm OCR hỗ trợ:
    - Ảnh (image/png, image/jpeg, image/webp)
    - PDF nhiều trang (application/pdf)

    Logic:
    - Nếu là PDF → chuyển từng trang thành ảnh → OCR theo thứ tự từng trang
    - Nếu là ảnh → OCR trực tiếp
    """

    # ---- 1. Khởi tạo client ----
    client = genai.Client(api_key=api_key)

    # ---- 2. Chuẩn bị prompt ----

    # prompt = f"""
    # Bạn là Gemini, một mô hình được tối ưu cho Trích Xuất Tài Liệu Học Thuật từ hình ảnh.

    # Bạn sẽ nhận hình ảnh và phải đọc toàn bộ nội dung trong ảnh, bao gồm:
    # - văn bản
    # - bảng biểu
    # - công thức
    # - hình minh hoạ / sơ đồ
    # - ghi chú, tiêu đề, mục lục
    # - ví dụ, bài tập, lời giải
    # - mọi nội dung khác có trong ảnh

    # ===========================
    # NHIỆM VỤ
    # ===========================
    # Tạo ra *một đoạn văn mô tả liền mạch và đầy đủ*, giữ nguyên toàn bộ nội dung trong ảnh nhưng diễn đạt lại rõ ràng theo đúng thứ tự xuất hiện.

    # ===========================
    # QUY TẮC BẮT BUỘC
    # ===========================
    # 1. Không tóm tắt.
    # 2. Không được thêm bất kỳ thông tin mới nào.
    # 3. Không suy diễn hoặc tự diễn giải.
    # 4. Không bỏ sót nội dung.
    # 5. Mọi chữ, số, ký hiệu có trong ảnh phải được giữ nguyên.
    # 6. Các bảng phải được mô tả bằng lời, ghi chính xác từng giá trị.
    # 7. Công thức phải được giữ nguyên định dạng OCR nhận được.
    # 8. Nếu văn bản nhắc tới bảng/hình → đảm bảo mô tả thể hiện được sự liên kết đó.

    # ===========================
    # MỤC TIÊU CUỐI
    # ===========================
    # Xuất ra một đoạn mô tả chứa *100% nội dung trong ảnh*, theo cách liền mạch và dễ đọc, nhưng trung thực tuyệt đối với tài liệu gốc.
    # """

    # prompt = """
    # Bạn là Gemini, một mô hình chuyên dụng cho Trích Xuất Tài Liệu Học Thuật từ hình ảnh. 
    # Nhiệm vụ duy nhất của bạn là đọc và ghi lại **toàn bộ nội dung xuất hiện trong ảnh**, 
    # theo đúng thứ tự, không tóm tắt, không diễn giải, không bỏ sót.

    # ========================================
    # NỘI DUNG BẠN PHẢI TRÍCH XUẤT
    # ========================================
    # Bạn phải đọc đầy đủ mọi thành phần xuất hiện trong ảnh, bao gồm nhưng không giới hạn:
    # - Văn bản (mọi loại: tiêu đề, đoạn văn, chú thích, mục lục, ghi chú lề, trích dẫn…)
    # - Bảng biểu (mọi kiểu bảng)
    # - Công thức toán học / vật lý / hoá học (dạng inline hoặc block)
    # - Sơ đồ, biểu đồ, hình minh họa, đồ thị
    # - Ví dụ minh họa, bài tập, đề bài, lời giải
    # - Ký hiệu đặc biệt, ký tự toán, đơn vị đo, số liệu
    # - Hình vẽ hoặc biểu tượng có kèm chú thích
    # - Bất kỳ thông tin nào xuất hiện trong ảnh, kể cả nhỏ và rời rạc

    # ========================================
    # NHIỆM VỤ CHÍNH
    # ========================================
    # Tạo ra một **bản ghi chép chính xác tuyệt đối** toàn bộ nội dung có trong ảnh,
    # theo đúng thứ tự xuất hiện từ trên xuống dưới, từ trái sang phải.

    # Bạn KHÔNG cần viết lại cho mượt.  
    # Bạn KHÔNG cần diễn đạt thành văn mạch lạc.  
    # Bạn chỉ cần đảm bảo:
    # - THẬT — chính xác
    # - ĐỦ — không thiếu chi tiết
    # - ĐÚNG — không thêm chi tiết
    # - RÕ — dễ đọc

    # ========================================
    # CÁCH THỂ HIỆN ĐẦU RA
    # ========================================
    # 1. Không được tóm tắt.
    # 2. Không được thêm hay suy diễn nội dung.
    # 3. Không được bỏ sót bất kỳ chữ, số, ký hiệu, đơn vị, công thức hay chú thích nào.
    # 4. Bạn có thể xuống dòng bằng ký tự xuống dòng thật (“\n”).
    # 5. Nếu là **bảng**:
    # - Không tái dựng bảng.
    # - Mô tả bảng bằng lời, theo dạng:
    #     “Bảng gồm X hàng Y cột. Dòng 1: ..., Dòng 2: ..., ô (2,3) ghi: ..., ...”
    # - Ghi chính xác từng giá trị, từng ký hiệu.
    # 6. Nếu là **biểu đồ / đồ thị / hình minh hoạ**:
    # - Mô tả bằng lời những gì thấy được: trục, tiêu đề, nhãn, giá trị, đường biểu diễn…
    # - Nếu có văn bản liên quan → mô tả sự liên kết.
    # 7. Nếu là **công thức**:
    # - Giữ nguyên định dạng OCR đọc được, ví dụ:
    #     - “x^2 + y^2 = r^2”
    #     - “∫(0→1) f(x) dx”
    # 8. Nếu có nhiều thành phần trong cùng vị trí:
    # - Ưu tiên theo thứ tự trực quan: trái → phải, trên → dưới.
    # 9. Nếu hình bị mờ, khó đọc → ghi đúng những gì thấy được, **không đoán**.

    # ========================================
    # MỤC TIÊU CUỐI CÙNG
    # ========================================
    # Tạo ra một đoạn nội dung chứa **100% thông tin xuất hiện trong ảnh**, 
    # được sắp xếp rõ ràng, trung thực tuyệt đối với tài liệu gốc,
    # không thêm, không bớt, không suy luận, không tổng hợp.

    # Bây giờ hãy trích xuất nội dung từ hình ảnh được cung cấp.
    # """

    prompt = """
    Bạn là Gemini, một mô hình chuyên dụng cho Trích Xuất Tài Liệu Học Thuật từ hình ảnh.

    Nhiệm vụ duy nhất của bạn là đọc và ghi lại *chính xác 100% nội dung xuất hiện trong ảnh*,
    không thêm, không bớt, không suy diễn.

    ========================================
    NỘI DUNG BẠN PHẢI TRÍCH XUẤT
    ========================================
    Bạn phải OCR đầy đủ mọi thành phần trong ảnh, bao gồm:
    - Văn bản (mọi thể loại)
    - Bảng biểu
    - Công thức toán học / vật lý / hóa học
    - Hình minh họa, sơ đồ, biểu đồ, đồ thị
    - Chú thích, ghi chú, tiêu đề, mục lục
    - Ví dụ, bài tập, đề bài, lời giải
    - Ký hiệu đặc biệt, ký tự toán, số liệu
    - Mọi phần tử khác, dù nhỏ hoặc rời rạc

    ========================================
    QUY TẮC BẮT BUỘC
    ========================================
    1. KHÔNG tóm tắt.
    2. KHÔNG thêm bất kỳ thông tin mới nào.
    3. KHÔNG suy luận hoặc diễn giải.
    4. KHÔNG bỏ sót bất kỳ chữ, ký tự, dấu, đơn vị, số liệu nào.
    5. Không cần viết lại cho trôi chảy – chỉ cần chính xác.
    6. Thứ tự OCR: từ trên xuống dưới, trái sang phải.

    ========================================
    QUY TẮC XỬ LÝ CÁC THÀNH PHẦN ĐẶC BIỆT
    ========================================
    **A. Công thức toán học**
    - Ghi lại *y nguyên* đúng dạng mắt thường thấy trong ảnh.
    - KHÔNG chuyển sang LaTeX.
    - KHÔNG chuẩn hóa, không cải thiện cú pháp.
    - Ví dụ:
    - Nếu ảnh có:  x^2 + y² = r² → ghi chính xác x^2 + y² = r²
    - Nếu ảnh có:  ∫(0→1) f(x) dx → ghi đúng ∫(0→1) f(x) dx
    - Nếu mũ, phân số, căn bậc hai bị lệch → ghi đúng như OCR nhận được.

    **B. Bảng biểu**
    - Không dựng lại bảng.
    - Hãy mô tả theo dạng:
    “Bảng có X hàng Y cột.  
    Dòng 1: ô 1 = ..., ô 2 = ..., ô 3 = ...  
    Dòng 2: ...”
    - Ghi chính xác toàn bộ số liệu và ký hiệu.

    **C. Biểu đồ / đồ thị / hình minh họa**
    - Mô tả bằng lời tất cả những gì nhìn thấy: tiêu đề, trục, nhãn, số liệu, đường biểu diễn, chú thích…

    **D. Hình hoặc text có liên kết**
    - Nếu văn bản nhắc tới bảng/hình → mô tả sao cho thể hiện được mối liên kết đó.

    **E. Nếu mờ hoặc không đọc được**
    - Viết đúng những gì nhìn thấy (ví dụ: “(chữ mờ, không đọc được)”).
    - Không đoán.

    ========================================
    MỤC TIÊU CUỐI
    ========================================
    Tạo ra một bản OCR đầy đủ 100%,
    theo đúng thứ tự xuất hiện,
    trung thực tuyệt đối với ảnh gốc,
    không thêm – không bớt – không suy luận.

    Hãy bắt đầu OCR nội dung từ hình ảnh được cung cấp.
    """


    # ===================================================
    #  CASE 1: Nếu file là PDF → convert từng trang sang ảnh
    # ===================================================
    if mime_type == "application/pdf":
        pages = convert_from_bytes(file_bytes)

        ocr_results = []

        for idx, page_img in enumerate(pages, start=1):
            # Convert PIL Image → bytes
            img_bytes = page_img.tobytes("jpeg", "RGB")

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    f"Đây là trang số {idx} của PDF.\n" + prompt,
                    types.Part.from_bytes(
                        data=img_bytes,
                        mime_type="image/jpeg"
                    )
                ]
            )

            ocr_results.append(f"===== TRANG {idx} =====\n" + response.text)

        # Ghép tất cả trang lại
        return "\n\n".join(ocr_results)


    # ===================================================
    #  CASE 2: Nếu file là ảnh → xử lý như bình thường
    # ===================================================
    else:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type
                )
            ]
        )
        return response.text