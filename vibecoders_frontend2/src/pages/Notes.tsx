import { useState } from "react";
import { Plus, Search, Trash2, Edit2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MainLayout } from "@/components/Layout/MainLayout";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Ghi chú mới",
      content: "",
      createdAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setIsEditing(true);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, ...updates });
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Ghi chú của tôi</h1>
          <p className="text-muted-foreground">Tổ chức và quản lý kiến thức của bạn</p>
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
              <Button onClick={createNewNote} size="icon" className="bg-gradient-primary">
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-smooth hover:shadow-soft ${
                    selectedNote?.id === note.id ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{note.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {note.content || "Ghi chú trống"}
                      </p>
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
              {filteredNotes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có ghi chú nào</p>
                </div>
              )}
            </div>
          </Card>

          {/* Note Editor */}
          <Card className="lg:col-span-2 p-6 shadow-soft">
            {selectedNote ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <Input
                      value={selectedNote.title}
                      onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                      className="text-2xl font-bold border-none p-0 h-auto"
                      placeholder="Tiêu đề ghi chú"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                  )}
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {isEditing ? "Xong" : "Chỉnh sửa"}
                  </Button>
                </div>

                {isEditing ? (
                  <Textarea
                    value={selectedNote.content}
                    onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                    placeholder="Viết ghi chú của bạn tại đây..."
                    className="min-h-[500px] resize-none"
                  />
                ) : (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">
                      {selectedNote.content || "Ghi chú trống. Nhấn 'Chỉnh sửa' để bắt đầu viết."}
                    </p>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  Tạo lúc: {selectedNote.createdAt.toLocaleString('vi-VN')}
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
