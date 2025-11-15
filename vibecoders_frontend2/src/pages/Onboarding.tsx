import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, ChevronLeft, Edit2 } from "lucide-react";

import UserService from "@/util/user.api";
import { toast } from "sonner";

interface OnboardingData {
  year: string;
  major: string;
  favoriteTopics: string[];
  interestTopics: string[];
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    year: "",
    major: "",
    favoriteTopics: [],
    interestTopics: [],
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  // Step 1: University Year
  const yearOptions = [
    { id: "1", label: "Năm 1" },
    { id: "2", label: "Năm 2" },
    { id: "3", label: "Năm 3" },
    { id: "4", label: "Năm 4" },
    { id: "5+", label: "Năm 4+" },
  ];

  // Step 2: Major options
  const majorOptions = [
    "Khoa học máy tính",
    "Kỹ thuật phần mềm",
    "Kinh tế",
    "Quản trị kinh doanh",
    "Kế toán",
    "Marketing",
    "Luật",
    "Y khoa",
  ];

  // Step 3: Favorite Topics
  const favoriteTopicsOptions = [
    "Lập trình",
    "Thiết kế",
    "Marketing",
    "Kinh doanh",
    "Khoa học dữ liệu",
    "Trí tuệ nhân tạo",
    "An ninh mạng",
    "Phát triển web",
    "Phát triển ứng dụng",
    "Game development",
    "Blockchain",
    "Cloud computing",
  ];

  // Step 4: Interest Topics
  const interestTopicsOptions = [
    "Khởi nghiệp",
    "Đầu tư",
    "Công nghệ",
    "Nghệ thuật",
    "Âm nhạc",
    "Thể thao",
    "Du lịch",
    "Ẩm thực",
    "Sách",
    "Phim ảnh",
    "Photography",
    "Fitness",
    "Thiền",
    "Tài chính cá nhân",
    "Phát triển bản thân",
    "Ngôn ngữ",
  ];

  const handleYearSelect = (yearId: string) => {
    setData({ ...data, year: yearId });
  };

  const handleMajorChange = (value: string) => {
    setData({ ...data, major: value });
  };

  const handleMajorSelect = (major: string) => {
    setData({ ...data, major });
  };

  const toggleFavoriteTopic = (topic: string) => {
    setData((prev) => ({
      ...prev,
      favoriteTopics: prev.favoriteTopics.includes(topic)
        ? prev.favoriteTopics.filter((t) => t !== topic)
        : [...prev.favoriteTopics, topic],
    }));
  };

  const toggleInterestTopic = (topic: string) => {
    setData((prev) => ({
      ...prev,
      interestTopics: prev.interestTopics.includes(topic)
        ? prev.interestTopics.filter((t) => t !== topic)
        : [...prev.interestTopics, topic],
    }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    // call api to save data
    try {
      await UserService.onboardingUser({
        numberOfYears: parseInt(data.year),
        major: data.major,
        favoriteTopics: data.favoriteTopics,
        interestedTopics: data.interestTopics,
      });

      toast.success("Onboarding thành công!");
      localStorage.setItem("onboarding", "true");
      // Save data to localStorage or API
      localStorage.setItem("onboardingData", JSON.stringify(data));
      navigate("/");
    } catch (error) {
      toast.error("Onboarding thất bại!");
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.year !== "";
      case 2:
        return data.major !== "";
      case 3:
        return data.favoriteTopics.length > 0;
      case 4:
        return data.interestTopics.length > 0;
      default:
        return false;
    }
  };

  const editStep = (stepNumber: number) => {
    setStep(stepNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${(step - 1) * 25}%` }}
              />
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${25}%` }}
              />
              <div
                className="h-full bg-gray-200"
                style={{ width: `${(totalSteps - step) * 25}%` }}
              />
            </div>
          </div>
          <p className="text-center text-gray-500 mt-2 text-sm">
            Bước {step} / {totalSteps}
          </p>
        </div>

        {/* Step 1: University Year */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Đại học năm thứ mấy?
              </h2>
              <p className="text-gray-500">Chọn năm học hiện tại của bạn</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {yearOptions.slice(0, 3).map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleYearSelect(option.id)}
                  className={`p-6 rounded-lg border-2 text-lg font-semibold transition-all ${
                    data.year === option.id
                      ? "bg-cyan-500 text-white border-cyan-500"
                      : "bg-white text-gray-700 border-gray-200 hover:border-cyan-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {yearOptions.slice(3).map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleYearSelect(option.id)}
                  className={`p-6 rounded-lg border-2 text-lg font-semibold transition-all ${
                    data.year === option.id
                      ? "bg-cyan-500 text-white border-cyan-500"
                      : "bg-white text-gray-700 border-gray-200 hover:border-cyan-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Major */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Chuyên ngành nào?
              </h2>
              <p className="text-gray-500">
                Nhập hoặc chọn chuyên ngành của bạn
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chuyên ngành
                </label>
                <Input
                  type="text"
                  placeholder="Khoa học máy tính"
                  value={data.major}
                  onChange={(e) => handleMajorChange(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Hoặc chọn từ danh sách phổ biến:
                </p>
                <div className="flex flex-wrap gap-2">
                  {majorOptions.map((major) => (
                    <button
                      key={major}
                      onClick={() => handleMajorSelect(major)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        data.major === major
                          ? "bg-cyan-500 text-white"
                          : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                      }`}
                    >
                      {major}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Favorite Topics */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Các chủ đề yêu thích
              </h2>
              <p className="text-gray-500">Chọn ít nhất một chủ đề bạn thích</p>
            </div>

            <div className="max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Chọn các chủ đề (có thể chọn nhiều):
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {favoriteTopicsOptions.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleFavoriteTopic(topic)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                      data.favoriteTopics.includes(topic)
                        ? "bg-cyan-500 text-white"
                        : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                    }`}
                  >
                    {topic}
                    {data.favoriteTopics.includes(topic) && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>

              {data.favoriteTopics.length > 0 && (
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Đã chọn ({data.favoriteTopics.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.favoriteTopics.map((topic) => (
                      <span
                        key={topic}
                        className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Interest Topics */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Các chủ đề quan tâm
              </h2>
              <p className="text-gray-500">
                Chọn các chủ đề bạn muốn tìm hiểu thêm
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Chọn các chủ đề (có thể chọn nhiều):
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {interestTopicsOptions.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleInterestTopic(topic)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                      data.interestTopics.includes(topic)
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {topic}
                    {data.interestTopics.includes(topic) && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>

              {data.interestTopics.length > 0 && (
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Đã chọn ({data.interestTopics.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.interestTopics.map((topic) => (
                      <span
                        key={topic}
                        className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className="text-gray-600"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6"
            >
              Tiếp tục
            </Button>
          ) : (
            <Button
              onClick={() => setStep(5)}
              disabled={!canProceed()}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6"
            >
              Xem tổng quan
            </Button>
          )}
        </div>
      </Card>

      {/* Summary/Review Page */}
      {step === 5 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Hoàn thành!
              </h2>
              <p className="text-gray-500">
                Xem lại thông tin của bạn và điều chỉnh nếu cần
              </p>
            </div>

            <div className="space-y-4">
              {/* Year */}
              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">Năm học</h3>
                  <button
                    onClick={() => editStep(1)}
                    className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Sửa
                  </button>
                </div>
                <p className="text-gray-700">
                  Năm {data.year === "5+" ? "4+" : data.year}
                </p>
              </div>

              {/* Major */}
              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">Chuyên ngành</h3>
                  <button
                    onClick={() => editStep(2)}
                    className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Sửa
                  </button>
                </div>
                <p className="text-gray-700">{data.major}</p>
              </div>

              {/* Favorite Topics */}
              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Chủ đề yêu thích
                  </h3>
                  <button
                    onClick={() => editStep(3)}
                    className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Sửa
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.favoriteTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-cyan-500 text-white rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interest Topics */}
              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Chủ đề quan tâm
                  </h3>
                  <button
                    onClick={() => editStep(4)}
                    className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Sửa
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.interestTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white py-6 text-lg"
            >
              Xác nhận và hoàn thành
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
