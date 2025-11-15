import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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
  LogOut
} from "lucide-react";

const navItems = [
  { to: "/", icon: BookOpen, label: "Ghi chú" },
  { to: "/summary", icon: FileText, label: "Tóm tắt" },
  { to: "/quiz", icon: Brain, label: "Kiểm tra" },
  { to: "/calendar", icon: Calendar, label: "Lịch học" },
  { to: "/chat", icon: MessageSquare, label: "Trợ lý AI" },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">LearnAI</h1>
            <p className="text-xs text-muted-foreground">Trợ lý học tập thông minh</p>
          </div>
        </div>
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
                  "transition-smooth"
                )}
                activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
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
              className="w-full justify-start"
              onClick={() => navigate("/profile")}
            >
              <User className="w-5 h-5 mr-3" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Đăng xuất
            </Button>
          </>
        )}
      </div>
    </aside>
  );
};
