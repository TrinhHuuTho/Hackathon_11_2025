import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  Brain,
  Calendar,
  MessageSquare,
  Sparkles,
  User,
  LogOut,
  Library,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const navItems = [
  { to: "/", icon: Home, label: "Trang chủ" },
  { to: "/notes", icon: BookOpen, label: "Ghi chú" },
  { to: "/summary", icon: FileText, label: "Tóm tắt" },
  // { to: "/flashcards", icon: Library, label: "Flashcards" },
  // { to: "/quiz", icon: Brain, label: "Kiểm tra" },
  { to: "/history", icon: Clock, label: "Lịch sử" },
  { to: "/calendar", icon: Calendar, label: "Lịch học" },
  { to: "/chat", icon: MessageSquare, label: "Trợ lý AI" },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 border-b border-sidebar-border relative">
        <div
          className={cn(
            "flex items-center gap-2",
            isCollapsed && "justify-center"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">
                LearnAI
              </h1>
              <p className="text-xs text-muted-foreground">
                Trợ lý học tập thông minh
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "absolute -right-4 top-8 w-8 h-8 rounded-full bg-sidebar border-2 border-sidebar-border shadow-md hover:bg-sidebar-accent z-10",
            "transition-all duration-300"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg",
                  "text-sidebar-foreground hover:bg-sidebar-accent",
                  "transition-smooth",
                  isCollapsed && "justify-center"
                )}
                activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        {user && (
          <>
            <Button
              variant="ghost"
              className={cn(
                "w-full",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
              onClick={() => navigate("/profile")}
              title={isCollapsed ? user.userName : undefined}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={"https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"}
                  alt={user.userName}
                />
                <AvatarFallback>{user.userName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.userName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-destructive hover:text-destructive hover:bg-destructive/10",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
              onClick={handleLogout}
              title={isCollapsed ? "Đăng xuất" : undefined}
            >
              <LogOut className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && "Đăng xuất"}
            </Button>
          </>
        )}
      </div>
    </aside>
  );
};
