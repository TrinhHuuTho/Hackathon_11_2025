import { useEffect, useState, useRef } from "react";
import { Plus, Search, Trash2, Edit2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MainLayout } from "@/components/Layout/MainLayout";
import { addNoteApi, deleteNoteApi, getNotesApi } from "@/util/note.api";
import { Note } from "@/util/note.api";
import { Editor, Viewer } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isSelectedNew, setIsSelectedNew] = useState(false);

  // THAY ĐỔI: State cho checkbox addCalendar
  const [addCalendar, setAddCalendar] = useState(false);

  const editorRef = useRef<Editor | null>(null);

  const createNewNote = async () => {
    // THAY ĐỔI: Reset addCalendar khi tạo note mới
    setAddCalendar(false);

    const newNote: Note = {
      id: `temp-${Date.now()}`,
      title: "Ghi chú mới",
      content: "", // Bắt đầu với content rỗng
      createdAt: new Date().toISOString(),
      addCalendar: false, // Mặc định là false khi tạo mới (trước khi người dùng tick)
    };

    setNotes((prev) => [newNote, ...prev]);
    setSelectedNote(newNote);
    setIsEditing(true);
    setIsSelectedNew(true);
  };

  const deleteNote = async (id: string) => {
    try {
      if (id.startsWith("temp-")) {
        setNotes((prev) => prev.filter((note) => note.id !== id));
        if (selectedNote?.id === id) {
          setSelectedNote(null);
          setIsSelectedNew(false);
          setIsEditing(false);
        }
        return;
      }

      await deleteNoteApi(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setIsEditing(false);
      }
      toast({
        title: "Đã xóa ghi chú",
        description: "Ghi chú của bạn đã được xóa thành công.",
      });
    } catch (error) {
      console.error("Lỗi khi xóa note:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa ghi chú.",
        variant: "destructive",
      });
    }
  };

  const updateNoteOnApi = async (id: string, updates: Partial<Note>) => {
    try {
      const noteToUpdate = notes.find((n) => n.id === id);
      if (!noteToUpdate) return;

      const response = await addNoteApi({
        ...noteToUpdate,
        ...updates,
      });

      const updatedNoteFromApi = response.data;

      setNotes((prev) =>
        prev.map((note) => (note.id === id ? updatedNoteFromApi : note))
      );

      setSelectedNote(updatedNoteFromApi);
      toast({
        title: "Đã cập nhật ghi chú",
        description: "Ghi chú của bạn đã được lưu thành công.",
      });
    } catch (error) {
      console.error("Lỗi update note:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật ghi chú.",
        variant: "destructive",
      });
    }
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      if (!selectedNote) return;

      const content = editorRef.current?.getInstance().getMarkdown() || "";
      const title = selectedNote.title;

      try {
        if (isSelectedNew) {
          // THAY ĐỔI: Gửi addCalendar khi tạo note mới
          const newNoteToSave = {
            ...selectedNote,
            title,
            content,
            addCalendar: addCalendar, // GỬI GIÁ TRỊ CHECKBOX
          };
          console.log("Payload to addNoteApi:", newNoteToSave);
          await addNoteApi(newNoteToSave);
          setIsSelectedNew(false);
          await loadNotes(true); // Tải lại toàn bộ để hiển thị note mới
          setSelectedNote(null); // Bỏ chọn note
          toast({
            title: "Đã tạo ghi chú",
            description: addCalendar
              ? "Ghi chú đã được tạo và thêm vào lịch."
              : "Ghi chú đã được tạo.",
          });
        } else {
          // THAY ĐỔI: Gửi addCalendar khi cập nhật note (nếu có thay đổi)
          const updatedNoteData = {
            ...selectedNote,
            title,
            content,
            // KHÔNG GỬI addCalendar ở đây nếu đây không phải note mới được tạo
            // Vì addCalendar chỉ có ý nghĩa khi tạo note ban đầu
            // Nếu bạn muốn cho phép thêm vào lịch khi EDIT note đã có,
            // thì phải có một API riêng hoặc logic khác.
            // Hiện tại, addCalendar chỉ hoạt động khi tạo note mới.
          };
          setSelectedNote(updatedNoteData);
          setNotes((prev) =>
            prev.map((n) => (n.id === updatedNoteData.id ? updatedNoteData : n))
          );

          await updateNoteOnApi(selectedNote.id, { title, content }); // Chỉ update title và content
        }
      } catch (error) {
        console.error("Lỗi khi lưu note:", error);
        toast({
          title: "Lỗi",
          description: "Không thể lưu ghi chú.",
          variant: "destructive",
        });
      } finally {
        setIsEditing(false);
        // THAY ĐỔI: Reset addCalendar sau khi lưu hoặc hủy chỉnh sửa
        setAddCalendar(false);
      }
    } else {
      setIsEditing(true);
      setTimeout(() => {
        editorRef.current?.getInstance().focus();
      }, 0);
    }
  };

  const loadNotes = async (reset = false) => {
    try {
      const nextPage = reset ? 0 : page;
      const data = await getNotesApi(nextPage, size, searchQuery);
      console.log("Loaded notes:", data);

      if (reset) {
        // Lọc bỏ các ghi chú tạm thời trước khi tải lại toàn bộ
        const nonTempNotes = notes.filter((n) => !n.id.startsWith("temp-"));
        setNotes([...nonTempNotes, ...data.content]); // Giữ lại temp note nếu có
        setNotes(data.content);
        setPage(1);
      } else {
        setNotes((prev) => [...prev, ...data.content]);
        setPage((prev) => prev + 1);
      }

      setHasMore(!data.last);
    } catch (error) {
      console.error("Lỗi load notes:", error);
    }
  };

  useEffect(() => {
    loadNotes(true);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadNotes(true);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // THAY ĐỔI: Khi chọn note, reset các state liên quan đến việc tạo/chỉnh sửa
  const selectNoteHandler = (note: Note) => {
    if (isSelectedNew && selectedNote?.id.startsWith("temp-")) {
      // Xóa note temp đang edit dở nếu có
      setNotes((prev) => prev.filter((n) => n.id !== selectedNote.id));
    }
    setSelectedNote(note);
    setIsEditing(false); // Luôn về chế độ xem khi chọn note
    setIsSelectedNew(false); // Đảm bảo không còn là note mới
    setAddCalendar(false); // Reset checkbox khi chọn note khác
  };

  // THAY ĐỔI: Xử lý hiển thị checkbox chỉ khi đang tạo note mới
  const shouldShowAddCalendarCheckbox = isEditing && isSelectedNew;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Ghi chú của tôi
          </h1>
          <p className="text-muted-foreground">
            Tổ chức và quản lý kiến thức của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <Card className="lg:col-span-1 p-4 shadow-soft">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm ghi chú..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={createNewNote}
                size="icon"
                className="bg-gradient-primary"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            <div
              className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto"
              onScroll={(e) => {
                const bottom =
                  e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
                  e.currentTarget.clientHeight + 20;

                if (bottom && hasMore) {
                  loadNotes();
                }
              }}
            >
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => selectNoteHandler(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-smooth hover:shadow-soft ${
                    selectedNote?.id === note.id
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {note.title}
                      </h3>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có ghi chú nào</p>
                </div>
              )}
            </div>
          </Card>

          {/* Note Editor */}
          <Card className="lg:col-span-2 p-6 shadow-soft min-h-[600px]">
            {selectedNote ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <Input
                      value={selectedNote.title}
                      onChange={(e) =>
                        setSelectedNote((prev) =>
                          prev ? { ...prev, title: e.target.value } : prev
                        )
                      }
                      className="text-2xl font-bold border-none p-0 h-auto mr-5"
                      placeholder="Tiêu đề ghi chú"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold ml-2">
                      {selectedNote.title}
                    </h2>
                  )}
                  <div className="flex items-center space-x-2">
                    {/* {shouldShowAddCalendarCheckbox && (
                      <>
                        <Checkbox
                          id="addCalendar"
                          checked={addCalendar}
                          onCheckedChange={(checked) => {
                            const newCheckedState = checked === true;
                            setAddCalendar(newCheckedState);
                            console.log(
                              "Checkbox changed. New addCalendar state:",
                              newCheckedState
                            );
                          }}
                        />
                        <label
                          htmlFor="addCalendar"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Thêm vào lịch học
                        </label>
                      </>
                    )} */}
                    <Button
                      onClick={handleToggleEdit}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      {isEditing ? "Lưu" : "Chỉnh sửa"}
                    </Button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="tui-editor-wrapper">
                    <Editor
                      key={selectedNote.id}
                      ref={editorRef}
                      initialValue={selectedNote.content || ""}
                      initialEditType="wysiwyg"
                      previewStyle="vertical"
                      height="500px"
                      useCommandShortcut={true}
                    />
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <Viewer
                      key={selectedNote.id}
                      initialValue={
                        selectedNote.content ||
                        "Ghi chú trống. Nhấn 'Chỉnh sửa' để bắt đầu viết."
                      }
                    />
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  Tạo lúc:{" "}
                  {new Date(selectedNote.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Chọn một ghi chú hoặc tạo ghi chú mới</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Notes;
