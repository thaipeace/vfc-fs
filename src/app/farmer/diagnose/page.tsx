"use client";

import { useEffect, useRef, useState } from "react";
import { useCropStore } from "@/store/useCropStore";

type DiagnosisResult = {
  id: string;
  status: "PROCESSING" | "DONE" | "FAILED";
  summary?: string;
  confidence?: number;
  rawAiResponse?: {
    disease?: string;
    severity?: string;
  };
  suggestions?: Array<{
    rank: number;
    reason: string;
    product?: { name: string; imageUrls: string[]; slug: string };
  }>;
};

export default function DiagnosePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [cropType, setCropType] = useState("");
  const { userCrops, fetchUserCrops } = useCropStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserCrops();
  }, [fetchUserCrops]);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    // Only take the first image
    const file = files[0];
    const url = URL.createObjectURL(file);
    setPreviews([url]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileRef.current?.files?.length) return;
    if (!cropType) {
      setError("Vui lòng chọn loại cây trồng trước khi phân tích");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const fd = new FormData();
    fd.append("images", fileRef.current.files[0]); // Only send 1 image
    fd.append("cropType", cropType);

    try {
      const res = await fetch("/api/diagnoses", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Poll for result
      setResult({ id: data.id, status: "PROCESSING" });
      await pollResult(data.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function pollResult(id: string) {
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const res = await fetch(`/api/diagnoses/${id}`);
      const data = await res.json();
      setResult(data);
      if (data.status !== "PROCESSING") return;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">📷 Chuẩn đoán bệnh cây</h1>
        <p className="mt-1 text-sm text-neutral-500">Chụp hoặc chọn ảnh cây để AI phân tích</p>
      </div>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Chọn cây trồng cần chuẩn đoán
          </label>
          <select
            value={cropType}
            onChange={(e) => {
              setCropType(e.target.value);
              setPreviews([]);
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="input-field"
          >
            <option value="">-- Chọn cây trồng --</option>
            {userCrops.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Image drop zone */}
        <div
          onClick={() => cropType && fileRef.current?.click()}
          className={`flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition ${
            !cropType 
              ? "border-neutral-200 bg-neutral-50 cursor-not-allowed opacity-60" 
              : "border-green-300 bg-green-50 cursor-pointer hover:bg-green-100"
          }`}
        >
          {previews.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-2">
              {previews.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={p} alt="" className="h-24 w-24 rounded-lg object-cover" />
              ))}
            </div>
          ) : (
            <>
              <span className="text-3xl">🌿</span>
              <span className={`text-sm font-medium ${!cropType ? "text-neutral-400" : "text-green-700"}`}>
                {cropType ? "Nhấn để chụp hoặc chọn ảnh" : "Vui lòng chọn cây trước"}
              </span>
              <span className="text-xs text-neutral-400">Chỉ chọn 1 ảnh</span>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading || !previews.length}>
          {loading ? "Đang phân tích..." : "🔍 Phân tích bệnh"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Kết quả</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                result.status === "DONE"
                  ? "bg-green-100 text-green-700"
                  : result.status === "FAILED"
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {result.status === "PROCESSING" ? "Đang xử lý..." : result.status === "DONE" ? "Hoàn tất" : "Thất bại"}
            </span>
          </div>

          {result.status === "PROCESSING" && (
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
              AI đang phân tích hình ảnh...
            </div>
          )}

          {result.status === "DONE" && result.summary && (
            <>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                {result.rawAiResponse?.disease && (
                  <p className="text-sm font-medium text-neutral-800">
                    Bệnh: <span className="font-normal">{result.rawAiResponse.disease}</span>
                  </p>
                )}
                {result.rawAiResponse?.severity && (
                  <p className="mb-2 text-xs text-neutral-500">
                    Mức độ: {result.rawAiResponse.severity}
                  </p>
                )}
                <p className="text-xs text-neutral-600 leading-relaxed">{result.summary}</p>
              </div>

              {result.suggestions && result.suggestions.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      ✨
                    </span>
                    <h3 className="text-lg font-bold text-green-800">Sản phẩm chuyên trị khuyên dùng</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {result.suggestions.map((s) => (
                      <div key={s.rank} className="relative flex flex-col sm:flex-row gap-4 rounded-2xl border-2 border-green-100 bg-gradient-to-br from-white to-green-50/50 p-4 shadow-sm transition hover:border-green-300 hover:shadow-md overflow-hidden">
                        {/* Cột trái: Hình ảnh */}
                        <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-white border border-neutral-100 p-1">
                          {s.product?.imageUrls?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.product.imageUrls[0]} alt={s.product.name} className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-50 text-2xl">🧪</div>
                          )}
                        </div>
                        
                        {/* Cột phải: Thông tin */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="font-bold text-base text-neutral-800 mb-1">{s.product?.name ?? "Sản phẩm"}</p>
                          <div className="inline-flex rounded-lg bg-green-100/50 p-2.5">
                            <p className="text-sm font-medium text-green-800 leading-relaxed">{s.reason}</p>
                          </div>
                        </div>

                        {/* Top Rank Badge */}
                        {s.rank === 1 && (
                          <div className="absolute top-0 right-0 rounded-bl-xl bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                            Phù hợp nhất
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
