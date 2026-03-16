import React from "react";
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
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!email) {
      setMessage({ type: "error", text: "Vui lòng nhập email đã đăng ký!" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gửi yêu cầu thất bại! Vui lòng thử lại!",
        );
      }

      setMessage({
        type: "success",
        text: "Liên kết khôi phục đã được gửi đến email của bạn! Vui lòng kiểm tra hộp thư!",
      });
      setEmail("");
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
          <CardTitle className="text-2xl font-bold">
            Khôi phục mật khẩu
          </CardTitle>
          <CardDescription>
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
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
              <Label htmlFor="email">Email đã đăng ký</Label>
              <Input
                id="email"
                type="email"
                placeholder="nhacsi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang gửi email..." : "Gửi liên kết khôi phục"}
            </Button>
            <div className="text-sm text-center">
              <a
                href="/login"
                className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại Đăng nhập
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
