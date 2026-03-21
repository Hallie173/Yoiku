import React, { useState, useEffect } from "react";
import {
  User,
  Heart,
  Mic2,
  UploadCloud,
  Save,
  Disc,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Các state cho form chỉnh sửa
  const [editData, setEditData] = useState({
    username: "",
    bio: "",
    avatar_url: "",
    instruments: "", // Để nhập chuỗi phân cách bằng dấu phẩy
  });

  // Fetch dữ liệu khi load trang
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return (window.location.href = "/login");

      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          console.error("❌ Token hỏng hoặc hết hạn, tự động đăng xuất.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }
        throw new Error(data.message || "Lỗi tải thông tin");
      }

      setProfile(data);
      setEditData({
        username: data.username,
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
        instruments: data.instruments ? data.instruments.join(", ") : "",
      });
    } catch (error) {
      console.error("Lỗi tải thông tin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessage({ type: "success", text: "Đang tải ảnh lên..." });
    const formData = new FormData();
    formData.append("avatar", file);

    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/users/upload-avatar", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`},
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Lỗi tải ảnh");

            setEditData({ ...editData, avatar_url: data.avatar_url });
            setMessage({ type: "success", text: "Tải ảnh lên thành công! Bấm Lưu thay đổi để hoàn tất." });

    } catch (err) {
        setMessage({ type: "error", text: err.message });
    }
    };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Chuyển chuỗi "Piano, Guitar" thành mảng ["Piano", "Guitar"]
      const instrumentsArray = editData.instruments
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i !== "");

      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editData,
          instruments: instrumentsArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      // Cập nhật thành công
      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
      setProfile(data.user);
      setIsEditing(false);

      // Cập nhật lại tên/avatar trong localStorage để Sidebar nhận diện ngay
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Đang tải thông tin hồ sơ...
      </div>
    );
  if (!profile)
    return (
      <div className="p-8 text-center text-destructive">
        Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!
      </div>
    );

  return (
    <div className="flex flex-col h-full space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit3 className="w-4 h-4" /> Chỉnh sửa hồ sơ
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THÔNG TIN CƠ BẢN & FORM */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
              <CardDescription>
                Quản lý tên hiển thị, tiểu sử và chuyên môn của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message.text && (
                <div
                  className={`mb-4 p-3 text-sm font-medium rounded-md border ${message.type === "success" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-destructive bg-destructive/10 border-destructive/20"}`}
                >
                  {message.text}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-3">
                    <Label>Ảnh đại diện</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16 border-2 border-border shadow-sm">
                        <AvatarImage src={editData.avatar_url || "https://github.com/shadcn.png"} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload}
                          className="cursor-pointer file:text-primary file:font-semibold file:bg-primary/10 file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 hover:file:bg-primary/20"
                        />
                        <p className="text-xs text-muted-foreground mt-2">Định dạng hỗ trợ: JPG, PNG, GIF. Kích thước tối đa 5MB.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tên hiển thị</Label>
                    <Input
                      required
                      value={editData.username}
                      onChange={(e) =>
                        setEditData({ ...editData, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nhạc cụ có thể chơi</Label>
                    <Input
                      placeholder="VD: Piano, Guitar Acoustic, Vocal..."
                      value={editData.instruments}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          instruments: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Ngăn cách mỗi nhạc cụ bằng dấu phẩy.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Tiểu sử (Bio)</Label>
                    <Textarea
                      placeholder="Giới thiệu đôi nét về phong cách âm nhạc của bạn..."
                      rows={4}
                      value={editData.bio}
                      onChange={(e) =>
                        setEditData({ ...editData, bio: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" /> Lưu thay đổi
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Hủy bỏ
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <Avatar className="w-24 h-24 border-2 border-border shadow-sm">
                    <AvatarImage
                      src={
                        profile.avatar_url || "https://github.com/shadcn.png"
                      }
                    />
                    <AvatarFallback className="text-2xl">
                      {profile.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-3 flex-1">
                    <div>
                      <h2 className="text-2xl font-bold">{profile.username}</h2>
                      <p className="text-muted-foreground text-sm">
                        {profile.email}
                      </p>
                    </div>
                    {profile.instruments?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {profile.instruments.map((inst) => (
                          <span
                            key={inst}
                            className="text-xs font-semibold bg-primary/15 text-primary px-2.5 py-1 rounded-md"
                          >
                            {inst}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm mt-2">
                      {profile.bio || "Người dùng này chưa cập nhật tiểu sử."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI: BẢNG THỐNG KÊ (Khớp với CSDL đã thiết kế) */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" />
                Thành tích
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Lượt tim nhận được
                </span>
                <span className="font-bold">
                  {profile.total_likes_received}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <Mic2 className="w-4 h-4" /> Bản thu đóng góp
                </span>
                <span className="font-bold">
                  {profile.total_tracks_contributed}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <Disc className="w-4 h-4" /> Dự án tham gia
                </span>
                <span className="font-bold">
                  {profile.total_projects_joined}
                </span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" /> Nhạc phổ tải lên
                </span>
                <span className="font-bold">
                  {profile.total_sheets_uploaded}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
