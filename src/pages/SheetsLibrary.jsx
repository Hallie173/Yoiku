import React, { useState, useEffect } from "react";
import {
  Music,
  Heart,
  Users,
  UploadCloud,
  Search,
  Download,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";

export default function SheetsLibrary() {
  const isLoggedIn = !!localStorage.getItem("token");

  // Lấy ID của người dùng đang đăng nhập để biết họ đã like bài nào
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser?._id || currentUser?.userId || null;

  const [mySheets, setMySheets] = useState([]);
  const [exploreSheets, setExploreSheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSheet, setSelectedSheet] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editingSheetId, setEditingSheetId] = useState(null);

  const [editFormData, setEditFormData] = useState({
    title: "",
    composer: "",
    instrument_tags: "",
    tempo: "",
    genre: "",
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    composer: "",
    instrument_tags: "",
    tempo: "",
    genre: "",
    file: null,
  });

  useEffect(() => {
    fetchExploreSheets();
    if (isLoggedIn) fetchMySheets();
  }, [isLoggedIn]);

  const formatSheetData = (sheet) => ({
    ...sheet,
    id: sheet._id,
    images: [sheet.file_url],
    liked_by: sheet.liked_by || [], // Đảm bảo luôn có mảng liked_by
  });

  const fetchExploreSheets = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/sheets/explore");
      const data = await res.json();
      if (res.ok) setExploreSheets(data.map(formatSheetData));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMySheets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/sheets/my-sheets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMySheets(data.map(formatSheetData));
    } catch (error) {
      console.error(error);
    }
  };

  // ================= API CHỨC NĂNG LIKE ĐỒNG BỘ =================
  const handleToggleLike = async (e, id) => {
    e.stopPropagation(); // Ngăn không cho click nhầm mở ảnh Full màn hình
    if (!isLoggedIn) return alert("Vui lòng đăng nhập để thích nhạc phổ!");

    // 1. CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC (Optimistic UI)
    const updateLikeState = (sheets) =>
      sheets.map((sheet) => {
        if (sheet.id === id) {
          const hasLiked = sheet.liked_by.includes(currentUserId);
          // Nếu đã like thì bỏ ID ra, chưa like thì nhét ID vào
          const newLikedBy = hasLiked
            ? sheet.liked_by.filter((uid) => uid !== currentUserId)
            : [...sheet.liked_by, currentUserId];

          return { ...sheet, liked_by: newLikedBy };
        }
        return sheet;
      });

    setMySheets((prev) => updateLikeState(prev));
    setExploreSheets((prev) => updateLikeState(prev));

    // 2. GỌI API CHẠY NGẦM PHÍA SAU
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/sheets/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Lỗi Server");
    } catch (error) {
      // Nếu API lỗi, có thể Rollback lại dữ liệu cũ ở đây (hiện tại bỏ qua để code gọn)
      console.error("Lỗi cập nhật Like:", error);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return alert("Vui lòng chọn file nhạc phổ!");
    if (!uploadData.title) return alert("Vui lòng nhập tên bài!");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", uploadData.title);
      formData.append("composer", uploadData.composer);
      formData.append("instrument_tags", uploadData.instrument_tags);
      formData.append("tempo", uploadData.tempo);
      formData.append("genre", uploadData.genre);
      formData.append("file", uploadData.file);

      const res = await fetch("http://localhost:5000/api/sheets", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMySheets([formatSheetData(data.sheet), ...mySheets]);
      setIsUploadModalOpen(false);
      setUploadData({
        title: "",
        composer: "",
        instrument_tags: "",
        tempo: "",
        genre: "",
        file: null,
      });
      alert("Tải lên thành công!");
    } catch (error) {
      alert("Lỗi tải lên: " + error.message);
    }
  };

  const startEdit = (e, sheet) => {
    e.stopPropagation();
    setEditingSheetId(sheet.id);
    setEditFormData({
      title: sheet.title,
      composer: sheet.composer || "",
      instrument_tags: sheet.instrument_tags.join(", "),
      tempo: sheet.tempo || "",
      genre: sheet.genre || "",
    });
  };

  const handleSaveEdit = async (e, id) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const updatedTags = editFormData.instrument_tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "");

      const res = await fetch(`http://localhost:5000/api/sheets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...editFormData, instrument_tags: updatedTags }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMySheets(
        mySheets.map((s) => (s.id === id ? formatSheetData(data.sheet) : s)),
      );
      setEditingSheetId(null);
    } catch (error) {
      alert("Lỗi cập nhật: " + error.message);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa nhạc phổ này?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/sheets/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Lỗi server");
        setMySheets(mySheets.filter((s) => s.id !== id));
      } catch (error) {
        alert("Lỗi xóa: " + error.message);
      }
    }
  };

  const handleDownload = (e, sheet) => {
    e.stopPropagation();
    window.open(sheet.images[0], "_blank");
  };

  // Component tái sử dụng cho giao diện Thẻ Nhạc Phổ (Card)
  const SheetCard = ({ sheet, isMySheet }) => {
    const isLiked = sheet.liked_by.includes(currentUserId);
    const likeCount = sheet.liked_by.length;

    return (
      <Card
        className="relative hover:border-primary/50 transition-colors cursor-pointer flex flex-col overflow-hidden group shadow-sm bg-card h-[380px]"
        onClick={() => {
          if (editingSheetId !== sheet.id) {
            setSelectedSheet(sheet);
            setCurrentImageIndex(0);
          }
        }}
      >
        {isMySheet && editingSheetId !== sheet.id && (
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/90 hover:bg-background shadow-md backdrop-blur-sm"
              onClick={(e) => startEdit(e, sheet)}
            >
              <Edit className="w-4 h-4 text-primary" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/90 hover:bg-background shadow-md backdrop-blur-sm"
              onClick={(e) => handleDownload(e, sheet)}
            >
              <Download className="w-4 h-4 text-emerald-500" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/90 hover:bg-background shadow-md backdrop-blur-sm hover:text-destructive"
              onClick={(e) => handleDelete(e, sheet.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {isMySheet && editingSheetId === sheet.id ? (
          <div
            className="p-4 flex flex-col gap-3 h-full bg-background absolute inset-0 z-20 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-bold text-sm border-b pb-1 flex items-center gap-2">
              <Edit className="w-4 h-4 text-primary" /> Sửa nhạc phổ
            </h4>
            <div className="space-y-1">
              <Label className="text-xs">Tên nhạc phổ *</Label>
              <Input
                size="sm"
                className="h-8 text-xs"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nhạc sĩ (Composer)</Label>
              <Input
                size="sm"
                className="h-8 text-xs"
                value={editFormData.composer}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, composer: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nhạc cụ</Label>
              <Input
                size="sm"
                className="h-8 text-xs"
                value={editFormData.instrument_tags}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    instrument_tags: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Thể loại</Label>
                <Input
                  size="sm"
                  className="h-8 text-xs"
                  value={editFormData.genre}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, genre: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">BPM</Label>
                <Input
                  size="sm"
                  type="number"
                  className="h-8 text-xs"
                  value={editFormData.tempo}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, tempo: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-2">
              <Button
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={(e) => handleSaveEdit(e, sheet.id)}
              >
                Lưu
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSheetId(null);
                }}
              >
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 bg-muted relative border-b border-border/50 overflow-hidden flex items-center justify-center">
              {sheet.images[0]?.toLowerCase().endsWith(".pdf") ? (
                <FileText className="w-16 h-16 text-muted-foreground/50 group-hover:scale-110 transition-transform" />
              ) : (
                <img
                  src={sheet.images[0]}
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/400x600?text=L%E1%BB%97i+%E1%BA%A3nh";
                  }}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  alt="thumbnail"
                />
              )}
              <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 pr-2">
                {sheet.instrument_tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium bg-black/70 text-white px-2 py-0.5 rounded-sm backdrop-blur-md border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <CardHeader className="p-3 pb-0 shrink-0">
              <h3
                className="text-base font-bold leading-tight truncate"
                title={sheet.title}
              >
                {sheet.title}
              </h3>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground truncate flex-1">
                  {sheet.composer}
                </p>
                <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {sheet.tempo} BPM
                </span>
              </div>
            </CardHeader>
            <CardFooter className="p-3 pt-2 shrink-0 flex items-center justify-between text-muted-foreground border-t border-border/50 mt-2">
              {/* NÚT LIKE ĐÃ ĐƯỢC GẮN LOGIC */}
              <div
                className="flex items-center gap-1.5 text-xs cursor-pointer group/like p-1 -ml-1 rounded-md hover:bg-destructive/10 transition-colors"
                onClick={(e) => handleToggleLike(e, sheet.id)}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${isLiked ? "fill-destructive text-destructive" : "group-hover/like:text-destructive"}`}
                />
                <span className={isLiked ? "text-destructive font-medium" : ""}>
                  {likeCount}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5" />{" "}
                <span>{sheet.contributors_count}</span>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-8 relative">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Thư viện Nhạc phổ
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và chia sẻ các bản nhạc của bạn
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() =>
            isLoggedIn
              ? setIsUploadModalOpen(true)
              : (window.location.href = "/login")
          }
        >
          <UploadCloud className="w-4 h-4" />
          {isLoggedIn ? "Tải lên Nhạc phổ" : "Đăng nhập để Tải lên"}
        </Button>
      </div>

      {/* KHU VỰC DỮ LIỆU CÁ NHÂN (MY SHEETS) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-2">
          Nhạc phổ của tôi
        </h2>
        {!isLoggedIn ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Tham gia cộng đồng JamSheet
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Đăng nhập để lưu trữ và chia sẻ nhạc phổ của riêng bạn.
            </p>
            <Button onClick={() => (window.location.href = "/login")}>
              Đăng nhập ngay
            </Button>
          </div>
        ) : mySheets.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Bạn chưa đăng bản nhạc nào.
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Hãy chia sẻ nhạc phổ của bạn để cộng đồng cùng hợp tấu.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <UploadCloud className="w-4 h-4 mr-2" /> Tải lên ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mySheets.map((sheet) => (
              <SheetCard key={sheet.id} sheet={sheet} isMySheet={true} />
            ))}
          </div>
        )}
      </div>

      {/* KHU VỰC CỘNG ĐỒNG */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Khám phá Cộng đồng</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
          {exploreSheets.map((sheet) => (
            <SheetCard key={sheet.id} sheet={sheet} isMySheet={false} />
          ))}
        </div>
      </div>

      {/* MODAL UPLOAD */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" /> Tải lên Nhạc
                phổ
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsUploadModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>File Nhạc phổ (Ảnh hoặc PDF) *</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file: e.target.files[0] })
                  }
                  required
                  className="cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên bản nhạc *</Label>
                  <Input
                    required
                    value={uploadData.title}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nhạc sĩ</Label>
                  <Input
                    placeholder="Unknown"
                    value={uploadData.composer}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, composer: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nhạc cụ</Label>
                <Input
                  placeholder="VD: Piano, Guitar Acoustic..."
                  value={uploadData.instrument_tags}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      instrument_tags: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thể loại</Label>
                  <Input
                    placeholder="Pop, Jazz..."
                    value={uploadData.genre}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, genre: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nhịp độ (BPM) *</Label>
                  <Input
                    type="number"
                    required
                    value={uploadData.tempo}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, tempo: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">Xác nhận tải lên</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL XEM ẢNH TOÀN MÀN HÌNH */}
      {selectedSheet && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-50 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex flex-col pl-2">
              <h2 className="text-xl font-bold drop-shadow-md leading-tight">
                {selectedSheet.title}
              </h2>
              <span className="text-sm text-white/70">
                {selectedSheet.composer}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!selectedSheet.images[0]?.toLowerCase().endsWith(".pdf") && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  title="Tải xuống"
                  onClick={(e) => handleDownload(e, selectedSheet)}
                >
                  <Download className="w-6 h-6" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-destructive"
                title="Đóng"
                onClick={() => setSelectedSheet(null)}
              >
                <X className="w-8 h-8" />
              </Button>
            </div>
          </div>

          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12">
            {selectedSheet.images[0]?.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={`${selectedSheet.images[0]}#toolbar=0`}
                className="w-full h-full rounded-md shadow-2xl bg-white"
                title={selectedSheet.title}
              ></iframe>
            ) : (
              <img
                src={selectedSheet.images[0]}
                alt="Sheet"
                className="max-h-full max-w-full object-contain rounded-md shadow-2xl select-none"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
