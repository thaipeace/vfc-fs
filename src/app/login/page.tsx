"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gửi OTP thất bại");
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Xác thực OTP thất bại");

      const role: string = data.user?.role ?? "FARMER";
      if (role === "ADMIN") router.replace("/admin");
      else if (role === "SALE") router.replace("/sale");
      else router.replace("/farmer");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
      <div className="card w-full max-w-sm">
        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">🌿</div>
          <h1 className="text-xl font-bold text-neutral-800">VFC Farmer</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {step === "phone" ? "Nhập số điện thoại Zalo" : `Nhập OTP gửi đến ${phone}`}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <input
              type="tel"
              placeholder="0912 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              required
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Đang gửi..." : "Nhận OTP qua Zalo"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <input
              type="text"
              inputMode="numeric"
              placeholder="6 số OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="input-field text-center text-2xl tracking-widest"
              required
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Đang xác thực..." : "Đăng nhập"}
            </button>
            <button
              type="button"
              className="text-sm text-green-600 hover:underline"
              onClick={() => { setStep("phone"); setError(""); setOtp(""); }}
            >
              ← Đổi số điện thoại
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
