import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarDays, Clock, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks, isWithinInterval, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

  const [searchDate, setSearchDate] = useState("");
  const [weekFilter, setWeekFilter] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date>();

  const colors = [
    "#8b5cf6", // Purple
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Orange
    "#ef4444", // Red
    "#ec4899", // Pink
  ];

  const loadEvents = async () => {
    try {
      const response = await getEventsApi();
      
      let eventData: Event[] = [];
      if (response && Array.isArray(response.content)) {
        eventData = response.content;
      } else {
        eventData = [];
      }
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
        title: "✨ Đã tạo lịch nhắc",
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
    } catch (error) {
      console.error("Lỗi xóa event:", error);
    }
  };

  const handleWeekSelect = (date: Date | undefined) => {
    if (!date) {
      setWeekFilter(null);
      setSelectedWeekDate(undefined);
      return;
    }
    
    const start = startOfWeek(date, { locale: vi, weekStartsOn: 1 });
    const end = endOfWeek(date, { locale: vi, weekStartsOn: 1 });
    setWeekFilter({ start, end });
    setSelectedWeekDate(date);
  };

  const handlePreviousWeek = () => {
    const currentDate = selectedWeekDate || new Date();
    const newDate = subWeeks(currentDate, 1);
    handleWeekSelect(newDate);
  };

  const handleNextWeek = () => {
    const currentDate = selectedWeekDate || new Date();
    const newDate = addWeeks(currentDate, 1);
    handleWeekSelect(newDate);
  };

  const handleThisWeek = () => {
    handleWeekSelect(new Date());
  };

  const clearWeekFilter = () => {
    setWeekFilter(null);
    setSelectedWeekDate(undefined);
    setSearchDate("");
  };

  const filteredEvents = events.filter(event => {
    // Ưu tiên lọc theo tuần nếu có
    if (weekFilter) {
      try {
        const eventDate = parseISO(event.date);
        return isWithinInterval(eventDate, { start: weekFilter.start, end: weekFilter.end });
      } catch {
        return false;
      }
    }
    
    // Nếu không có filter tuần, dùng filter ngày
    if (searchDate) {
      return event.date === searchDate;
    }
    
    return true;
  });

  const groupedEvents = filteredEvents.reduce((acc, event) => {
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
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header với gradient background */}
        <div className="mb-8 p-8 rounded-2xl bg-gradient-primary text-white shadow-hover animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8" />
                <h1 className="text-4xl font-bold">Lịch học tập</h1>
              </div>
              <p className="text-white/90 text-lg">Quản lý thời gian và nhắc nhở học tập một cách thông minh</p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90 border-0 shadow-soft">
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo lịch nhắc
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl">✨ Tạo lịch nhắc mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-semibold">Tiêu đề</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ví dụ: Ôn tập Toán"
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-semibold">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Thêm chi tiết về hoạt động học tập..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-base font-semibold">Ngày</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-base font-semibold">Giờ</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="h-12"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base" variant="default">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Tạo lịch
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6 p-6 shadow-soft hover:shadow-hover transition-all animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="space-y-4">
            {/* Week Filter */}
            <div>
              <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Tìm kiếm theo tuần
              </Label>
              <div className="flex flex-wrap items-center gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-11 justify-start text-left font-normal min-w-[240px]",
                        !selectedWeekDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {weekFilter ? (
                        <>
                          {format(weekFilter.start, "dd/MM/yyyy", { locale: vi })} - {format(weekFilter.end, "dd/MM/yyyy", { locale: vi })}
                        </>
                      ) : (
                        <span>Chọn một ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={selectedWeekDate}
                      onSelect={handleWeekSelect}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousWeek}
                    disabled={!weekFilter}
                    className="h-11 w-11"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleThisWeek}
                    className="h-11"
                  >
                    Tuần này
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextWeek}
                    disabled={!weekFilter}
                    className="h-11 w-11"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {(weekFilter || searchDate) && (
                  <Button 
                    variant="ghost" 
                    onClick={clearWeekFilter}
                    className="h-11"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
              {weekFilter && (
                <p className="text-sm text-muted-foreground mt-2">
                  Hiển thị sự kiện từ {format(weekFilter.start, "EEEE, dd/MM/yyyy", { locale: vi })} đến {format(weekFilter.end, "EEEE, dd/MM/yyyy", { locale: vi })}
                </p>
              )}
            </div>

            {/* Day Filter */}
            <div className="pt-4 border-t">
              <Label htmlFor="searchDate" className="text-base font-semibold mb-3 block flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Hoặc tìm theo ngày cụ thể
              </Label>
              <Input
                id="searchDate"
                type="date"
                value={searchDate}
                onChange={(e) => {
                  setSearchDate(e.target.value);
                  if (e.target.value) {
                    setWeekFilter(null);
                    setSelectedWeekDate(undefined);
                  }
                }}
                className="max-w-xs h-11"
                disabled={!!weekFilter}
              />
            </div>
          </div>
        </Card>

        {/* Events List */}
        <div className="space-y-8">
          {filteredEvents.length === 0 ? (
            <Card className="p-16 text-center shadow-soft animate-scale-in">
              <div className="text-muted-foreground">
                <CalendarDays className="w-20 h-20 mx-auto mb-4 opacity-30" />
                {weekFilter ? (
                  <>
                    <p className="text-xl font-semibold mb-2">Không tìm thấy lịch nhắc</p>
                    <p className="text-base">
                      Không có lịch hẹn nào trong tuần này.
                    </p>
                  </>
                ) : searchDate ? (
                  <>
                    <p className="text-xl font-semibold mb-2">Không tìm thấy lịch nhắc</p>
                    <p className="text-base">
                      Không có lịch hẹn nào cho ngày bạn đã chọn.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-semibold mb-2">Chưa có lịch nhắc nào</p>
                    <p className="text-base">Tạo lịch nhắc đầu tiên của bạn để bắt đầu!</p>
                  </>
                )}
              </div>
            </Card>
          ) : (
            Object.keys(groupedEvents)
              .sort()
              .map((date, dateIndex) => (
                <div key={date} className="animate-slide-up" style={{ animationDelay: `${0.1 * (dateIndex + 2)}s` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px bg-gradient-primary flex-1"></div>
                    <h2 className="text-2xl font-bold text-foreground px-4">
                      {new Date(date).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h2>
                    <div className="h-px bg-gradient-primary flex-1"></div>
                  </div>
                  <div className="grid gap-4">
                    {groupedEvents[date]
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((event, eventIndex) => (
                        <Card
                          key={event.id}
                          className="p-6 shadow-soft hover:shadow-hover transition-all group cursor-pointer animate-scale-in overflow-hidden relative"
                          style={{ 
                            animationDelay: `${0.05 * eventIndex}s`,
                            borderLeft: `4px solid ${event.color}`,
                          }}
                        >
                          <div 
                            className="absolute top-0 left-0 w-full h-1 opacity-50"
                            style={{ background: event.color }}
                          />
                          <div className="flex items-start gap-6">
                            <div 
                              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-soft group-hover:scale-110 transition-transform"
                              style={{ backgroundColor: event.color }}
                            >
                              <Clock className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
                                    {event.title}
                                  </h3>
                                  {event.description && (
                                    <p className="text-muted-foreground leading-relaxed mb-3">
                                      {event.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 text-sm font-medium">
                                    <Clock className="w-4 h-4" style={{ color: event.color }} />
                                    <span style={{ color: event.color }}>{event.time}</span>
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(event.id)}
                                  className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
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
