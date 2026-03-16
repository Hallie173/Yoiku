import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import whiteLogo from "@/assets/white-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [message, setMessage] = React.useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!newPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập mật khẩu mới!" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu phải có ít nhất 6 ký tự!" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Đặt lại mật khẩu thất bại! Vui lòng thử lại!",
        );
      }

      setMessage({
        type: "success",
        text: "Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập lại!",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 flex flex-col items-center text-center">
          <img
            src={whiteLogo}
            alt="JamSheet Logo"
            className="w-12 h-12 rounded-full object-cover mb-2"
          />
          <CardTitle className="text-2xl font-bold">Tạo mật khẩu mới</CardTitle>
          <CardDescription>
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message.text && (
              <div
                className={`p-3 text-sm font-medium rounded-md border ${
                  message.type === "success"
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    : "text-destructive bg-destructive/10 border-destructive/20"
                }`}
              >
                {message.text}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <div className="relative w-full">
                <Input
                  className="pr-10"
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập ít nhất 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none flex items-center justify-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
              <div className="relative w-full">
                <Input
                  className="pr-10"
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none flex items-center justify-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đặt lại mật khẩu..." : "Đặt lại mật khẩu"}
            </Button>
            <div className="text-sm text-center">
              <a
                href="/login"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Quay lại Đăng nhập
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
