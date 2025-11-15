"""
Flashcard Generator Demo
========================

This module demonstrates how to use the flashcard_generator package
to create flashcards from Vietnamese text content.
"""

import json
from tasks import generate_flashcards


def demo_programming_content():
    """Demo: Generate flashcards from programming content."""

    request_data = {
        "sections": [
            {
                "id": "python_basics",
                "summary": "Python là ngôn ngữ lập trình cấp cao với cú pháp đơn giản. Biến không cần khai báo kiểu (x=10, name='Alice'). Vòng lặp for có cú pháp for item in sequence. Hàm định nghĩa bằng def. Hỗ trợ OOP với class/object. Có cấu trúc dữ liệu list [1,2,3,4] và dictionary {'tên': 'Nam', 'tuổi': 25}.",
            }
        ],
        "config": {"n_flashcards": 8, "types": ["definition", "question", "example"]},
    }

    print("=== Demo: Programming Content ===")
    print("Input:")
    print(json.dumps(request_data, ensure_ascii=False, indent=2))
    print("\nOutput:")

    result = generate_flashcards(request_data)
    formatted_result = json.loads(result)
    print(json.dumps(formatted_result, ensure_ascii=False, indent=2))

    return result


def demo_history_content():
    """Demo: Generate flashcards from history content."""

    request_data = {
        "sections": [
            {
                "id": "vietnam_modern_history",
                "summary": "Cách mạng tháng Tám 1945 - sự kiện quan trọng. Hồ Chí Minh đọc Tuyên ngôn độc lập 2/9/1945 tại Ba Đình. Chiến tranh chống Pháp 1946-1954, kết thúc bằng Điện Biên Phủ. Hiệp định Geneva 1954 chia đôi đất nước. Chiến tranh Việt Nam 1955-1975 với sự can thiệp của Mỹ. 30/4/1975 giải phóng Sài Gòn, thống nhất. 1976 thành lập CHXHCN Việt Nam.",
            }
        ],
        "config": {"n_flashcards": 6, "types": ["question", "definition"]},
    }

    print("\n=== Demo: History Content ===")
    print("Input:")
    print(json.dumps(request_data, ensure_ascii=False, indent=2))
    print("\nOutput:")

    result = generate_flashcards(request_data)
    formatted_result = json.loads(result)
    print(json.dumps(formatted_result, ensure_ascii=False, indent=2))

    return result


def demo_simple_definitions():
    """Demo: Generate simple definition flashcards."""

    request_data = {
        "sections": [
            {
                "id": "tech_concepts",
                "summary": "Các khái niệm công nghệ: AI (Trí tuệ nhân tạo) - khả năng máy tính mô phỏng trí thông minh con người. Machine Learning - nhánh AI cho phép máy học từ dữ liệu. Big Data - tập dữ liệu cực lớn phức tạp. Cloud Computing - mô hình cung cấp dịch vụ máy tính qua internet.",
            }
        ],
        "config": {"n_flashcards": 4, "types": ["definition"]},
    }

    print("\n=== Demo: Simple Definitions ===")
    print("Input:")
    print(json.dumps(request_data, ensure_ascii=False, indent=2))
    print("\nOutput:")

    result = generate_flashcards(request_data)
    formatted_result = json.loads(result)
    print(json.dumps(formatted_result, ensure_ascii=False, indent=2))

    return result


def run_all_demos():
    """Run all available demos."""
    print("Flashcard Generator - All Demos")
    print("=" * 50)

    try:
        demo_programming_content()
        demo_history_content()
        demo_simple_definitions()

        print("\n" + "=" * 50)
        print("All demos completed successfully!")

    except Exception as e:
        print(f"\nDemo failed with error: {e}")
        raise


if __name__ == "__main__":
    run_all_demos()
