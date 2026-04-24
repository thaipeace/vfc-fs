"use client";

import { useRef, useState } from "react";

type DiagnosisResult = {
  id: string;
  status: "PROCESSING" | "DONE" | "FAILED";
  summary?: string;
  confidence?: number;
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState("");

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileRef.current?.files?.length) return;
    setError("");
    setLoading(true);
    setResult(null);

    const fd = new FormData();
    Array.from(fileRef.current.files).forEach((f) => fd.append("images", f));
    if (cropType) fd.append("cropType", cropType);

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
        {/* Image drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-green-300 bg-green-50 transition hover:bg-green-100"
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
              <span className="text-sm text-green-700 font-medium">Nhấn để chọn ảnh</span>
              <span className="text-xs text-neutral-400">Tối đa 5 ảnh</span>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <select
          value={cropType}
          onChange={(e) => setCropType(e.target.value)}
          className="input-field"
        >
          <option value="">-- Chọn loại cây (tùy chọn) --</option>
          {["Lúa", "Cà phê", "Tiêu", "Cao su", "Bắp", "Rau", "Xoài", "Sầu riêng"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

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
              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm text-neutral-700">{result.summary}</p>
                {result.confidence !== undefined && (
                  <p className="mt-2 text-xs text-neutral-400">
                    Độ chính xác: {Math.round(result.confidence * 100)}%
                  </p>
                )}
              </div>

              {result.suggestions && result.suggestions.length > 0 && (
                <div>
                  <p className="mb-2 font-semibold text-sm">🛒 Sản phẩm gợi ý</p>
                  <div className="flex flex-col gap-2">
                    {result.suggestions.map((s) => (
                      <div key={s.rank} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-green-100 text-center text-2xl leading-[3rem]">🧪</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{s.product?.name ?? "Sản phẩm"}</p>
                          <p className="text-xs text-neutral-400 truncate">{s.reason}</p>
                        </div>
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
