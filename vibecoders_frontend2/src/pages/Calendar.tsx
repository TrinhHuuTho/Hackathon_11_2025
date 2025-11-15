import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Event, getEventsApi, addEventApi, deleteEventApi } from "@/util/event.api";

const Calendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
  });

  // State mới để tìm kiếm theo ngày
  const [searchDate, setSearchDate] = useState("");

  const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

  const loadEvents = async () => {
    try {
      const response = await getEventsApi();
      
      let eventData: Event[] = [];
      if (response && Array.isArray(response.content)) {
        eventData = response.content;
      } else {
        eventData = [];
      }
      console.log("Loaded events:", response);
      setEvents(eventData);

    } catch (error) {
      console.error("Lỗi load events:", error);

      setEvents([]);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isoDateTime = `${formData.date}T${formData.time}:00`;
      const newEvent: Event = {
        id: Date.now().toString(),
        ...formData,
        color: colors[Math.floor(Math.random() * colors.length)],
        eventDateTime: isoDateTime,
      };

      const response = await addEventApi(newEvent);
      const savedEvent = response; 
      setEvents([...events, savedEvent]);
      setFormData({ title: "", description: "", date: "", time: "" });
      setIsOpen(false);
      toast({
        title: "Đã tạo lịch nhắc",
        description: "Sự kiện mới đã được thêm vào lịch",
      });
    } catch (error) {
      console.error("Lỗi tạo event:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEventApi(id);
      setEvents(events.filter(event => event.id !== id));
      toast({
        title: "Đã xóa",
        description: "Sự kiện đã được xóa khỏi lịch",
      });
    } catch (error)
 {
      console.error("Lỗi xóa event:", error);
    }
  };


  const filteredEvents = events.filter(event => {
    if (!searchDate) return true; 
    return event.date === searchDate;
  });

  // 2. Group events ĐÃ LỌC
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    // Đảm bảo event và event.date hợp lệ
    if (!event || !event.date) {
      console.warn("Event không hợp lệ hoặc thiếu ngày:", event);
      return acc;
    }
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Lịch học tập</h1>
            <p className="text-muted-foreground">Quản lý thời gian và nhắc nhở học tập</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Tạo lịch nhắc
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo lịch nhắc mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ví dụ: Ôn tập Toán"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Thêm chi tiết..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Ngày</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Giờ</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary">
                  Tạo lịch
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Input tìm kiếm theo ngày */}
        <div className="mb-6">
          <Label htmlFor="searchDate" className="font-semibold">Tìm theo ngày</Label>
          <Input
            id="searchDate"
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="max-w-xs mt-2"
          />
        </div>

        <div className="space-y-6">
          {/* Kiểm tra mảng đã lọc */}
          {filteredEvents.length === 0 ? (
            <Card className="p-12 text-center shadow-soft">
              <div className="text-muted-foreground">
                <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-50" />
                {/* Hiển thị thông báo động */}
                {searchDate ? (
                  <>
                    <p className="text-lg">Không tìm thấy lịch nhắc</p>
                    <p className="text-sm mt-2">
                      Không có lịch hẹn nào cho ngày bạn đã chọn.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg">Chưa có lịch nhắc nào</p>
                    <p className="text-sm mt-2">Tạo lịch nhắc đầu tiên của bạn</p>
                  </>
                )}
              </div>
            </Card>
          ) : (
            Object.keys(groupedEvents)
              .sort()
              .map((date) => (
                <div key={date}>
                  <h2 className="text-xl font-semibold mb-3">
                    {/* Thêm kiểm tra date hợp lệ trước khi format */}
                    {new Date(date).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  <div className="grid gap-3">
                    {groupedEvents[date]
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((event) => (
                        <Card
                          key={event.id}
                          className="p-4 shadow-soft hover:shadow-hover transition-smooth"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="w-1 h-12 rounded-full" // Cho chiều cao cố định
                              style={{ backgroundColor: event.color }}
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">{event.title}</h3>
                                  {event.description && (
                                    <p className="text-muted-foreground mt-1">
                                      {event.description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(event.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="text-sm text-muted-foreground mt-2">
                                {event.time}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Calendar;