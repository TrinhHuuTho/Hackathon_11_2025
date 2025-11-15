# services/ocr_service.py
import google.genai as genai
from google.genai import types
from pdf2image import convert_from_bytes
from PIL import Image
import io

def extract_information(files_bytes_list, mime_types, api_key):
    """
    Hàm OCR hỗ trợ:
    - Ảnh (image/png, image/jpeg, image/webp)
    - PDF nhiều trang (application/pdf)

    Cách hoạt động:
    - Nếu là PDF → convert tất cả trang → gom list ảnh
    - Nếu là ảnh → gom thành list 1 ảnh
    - Sau đó gửi toàn bộ list ảnh vào 1 request duy nhất
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

    Bạn sẽ nhận vào **một hoặc nhiều ảnh**.  
    Các ảnh có thể:
    - là các trang liên tiếp của một tài liệu,
    - là các phần có liên quan cùng chủ đề,
    - hoặc hoàn toàn không liên quan.

    ========================================
    NHIỆM VỤ CHÍNH
    ========================================
    Bạn phải OCR và ghi lại **100% nội dung** xuất hiện trong ảnh, theo đúng thứ tự ảnh được cung cấp.

    Quan trọng:
    - Nếu các ảnh **có nội dung liên quan hoặc nối tiếp nhau**, hãy trích xuất thành **một đoạn liền mạch**, không chèn dấu hiệu ngăn cách.
    - Nếu các ảnh **không liên quan**, bạn phải phân tách nội dung bằng format:

    === ẢNH SỐ X ===  
    <nội dung OCR của ảnh X>

    Tuyệt đối không được tự suy đoán mối liên hệ giữa các ảnh nếu trong nội dung không có bằng chứng.

    ========================================
    CÁCH XÁC ĐỊNH ẢNH CÓ LIÊN QUAN HAY KHÔNG
    ========================================
    Chỉ coi ảnh là **liên quan / nối tiếp** nếu trong nội dung có bằng chứng rõ ràng:
    - số trang tăng dần (ví dụ: Trang 12 → Trang 13)
    - đề mục liên tục (ví dụ: 2.1 → 2.2 → 2.3)
    - đoạn văn bị ngắt và tiếp tục ở ảnh sau
    - bảng, công thức hoặc sơ đồ bị chia đôi
    - văn bản tham chiếu (“tiếp theo”, “xem hình 3.2”, “phần dưới đây”)
    - có thể coi 2 ảnh là liên quan nếu cùng nói về một chủ đề (ví dụ: cùng nói về Định luật Newton, cùng phân tích Biểu đồ Cân bằng Thị trường…)

    Nếu KHÔNG có bằng chứng rõ ràng → coi như hai ảnh **không liên quan** và PHẢI phân tách bằng format “=== ẢNH SỐ X ===”.

    ========================================
    NỘI DUNG CẦN TRÍCH XUẤT
    ========================================
    Trong mỗi ảnh, phải ghi chính xác:
    - Văn bản (tiêu đề, đoạn văn, chú thích, mục lục, ghi chú lề…)
    - Bảng biểu (mô tả bằng lời, không dựng lại bảng)
    - Công thức toán / lý / hoá (giữ nguyên hình thức)
    - Sơ đồ, biểu đồ, đồ thị (mô tả đầy đủ)
    - Ví dụ, bài tập, đề bài, lời giải
    - Ký hiệu đặc biệt, số liệu, đơn vị
    - Bất kỳ nội dung nhỏ hoặc rời rạc nào khác

    ========================================
    QUY TẮC BẮT BUỘC
    ========================================
    1. KHÔNG tóm tắt.
    2. KHÔNG thêm nội dung mới.
    3. KHÔNG suy luận hoặc dự đoán nội dung bị thiếu.
    4. KHÔNG bỏ sót bất kỳ chữ, ký hiệu hoặc đơn vị nào.
    5. Trong từng ảnh: đọc từ trên xuống dưới, trái sang phải.
    6. Nếu chữ mờ hoặc không đọc được → ghi đúng những gì thấy (ví dụ: “(mờ, không đọc được)”).
    7. Chỉ phân tách ảnh bằng “=== ẢNH SỐ X ===” nếu và chỉ nếu nội dung không liên quan.

    ========================================
    MỤC TIÊU CUỐI
    ========================================
    Tạo ra một bản OCR:
    - chính xác tuyệt đối,
    - đầy đủ 100%,
    - liền mạch khi ảnh liên quan,
    - được phân tách rõ ràng khi ảnh không liên quan,
    - trung thực với nội dung gốc, không thêm – không bớt – không suy luận.

    Hãy bắt đầu trích xuất ngay bây giờ.
    """


    # ─────────────────────────────────────────────
    # 1) Gom toàn bộ ảnh từ tất cả đầu vào
    # ─────────────────────────────────────────────
    images = []   # danh sách kiểu bytes

    for file_bytes, mime in zip(files_bytes_list, mime_types):

        # Nếu là PDF → convert từng trang → thêm vào images
        if mime == "application/pdf":
            pages = convert_from_bytes(file_bytes)
            for page in pages:
                buffer = io.BytesIO()
                page.save(buffer, format="JPEG")
                images.append(buffer.getvalue())

        # Nếu là ảnh → thêm trực tiếp
        else:
            images.append(file_bytes)

    # ─────────────────────────────────────────────
    # 3) Build contents
    # ─────────────────────────────────────────────
    contents = [prompt]

    for idx, img_bytes in enumerate(images, start=1):
        contents.append(f"=== ẢNH SỐ {idx} ===")
        contents.append(
            types.Part.from_bytes(
                data=img_bytes,
                mime_type="image/jpeg"
            )
        )

    # ─────────────────────────────────────────────
    # 4) Gửi request 1 lần duy nhất
    # ─────────────────────────────────────────────
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
    )

    return response.text