import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import { User, Lock, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email });
    toast({
      title: "Cập nhật thành công!",
      description: "Thông tin của bạn đã được cập nhật",
    });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới không khớp",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    const success = await updatePassword(oldPassword, newPassword);
    
    if (success) {
      toast({
        title: "Đổi mật khẩu thành công!",
        description: "Mật khẩu của bạn đã được cập nhật",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({
        title: "Đổi mật khẩu thất bại",
        description: "Mật khẩu cũ không đúng",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Thông tin cá nhân</h1>
          <p className="text-muted-foreground">Quản lý thông tin và bảo mật tài khoản</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="w-4 h-4 mr-2" />
              Mật khẩu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="p-6">
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
