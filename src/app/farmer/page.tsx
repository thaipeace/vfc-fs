"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Crop {
  id: string;
  name: string;
  imageUrl?: string;
}

export default function FarmerHomePage() {
  const [myCrops, setMyCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyCrops() {
      try {
        const res = await fetch("/api/farmer/crops");
        if (res.ok) {
          const data = await res.json();
          setMyCrops(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyCrops();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold">Xin chào, Nông dân! 👋</h2>
        <p className="mt-1 text-sm text-green-500">
          Cây của bạn hôm nay thế nào?
        </p>
        <Link
          href="/farmer/diagnose"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50 transition shadow-sm"
        >
          📷 Chuẩn đoán ngay
        </Link>
      </div>

      {/* My Crops Section */}
      <div className="card bg-[#0C4A3F] border border-white/10 text-white p-4 rounded-2xl shadow-md">
        <h3 className="text-lg font-bold">Các cây trồng của tôi</h3>
        <p className="text-xs text-white/70 mt-1 mb-4">
          Thêm các loại cây trồng để nhận biết thông tin liên quan mới nhất
        </p>

        {loading ? (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FFD680]"></div>
          </div>
        ) : myCrops.length > 0 ? (
          <div className="flex overflow-x-auto gap-3 pt-1 snap-x">
            <Link
              href="/farmer/crops/select"
              className="flex flex-col items-center gap-1.5 shrink-0 snap-start w-[54px] group"
            >
              <div className="w-[50px] h-[50px] rounded-full bg-white/5 border border-dashed border-white/30 flex items-center justify-center transition-colors group-hover:bg-white/10">
                <span className="text-lg text-white/50">+</span>
              </div>
              <div className="px-1 py-0.5 w-full">
                <span className="block text-[8px] font-bold text-center text-white/50 leading-tight">
                  Thêm
                </span>
              </div>
            </Link>
            {myCrops.map((crop) => (
              <div
                key={crop.id}
                className="flex flex-col items-center gap-1.5 shrink-0 snap-start w-[54px]"
              >
                <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden ring-1 ring-[#FFD680] bg-white/10 flex items-center justify-center">
                  <span className="text-xl">🌱</span>
                  {crop.imageUrl && (
                    <Image
                      src={crop.imageUrl}
                      alt={crop.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="bg-black/30 rounded px-1 py-0.5 w-full">
                  <span className="block text-[8px] font-bold text-center text-white leading-tight break-words">
                    {crop.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Link
            href="/farmer/crops/select"
            className="w-full py-4 bg-[#FFD680] text-[#0C4A3F] text-sm font-black rounded-lg text-center transition-all active:scale-[0.98] uppercase shadow-lg"
          >
            Thêm loại cây trồng
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/farmer/diagnose"
          className="card flex flex-col items-center gap-2 p-4 text-center hover:ring-2 hover:ring-green-400 transition-all bg-white border border-neutral-100 shadow-sm rounded-2xl"
        >
          <span className="text-3xl">📷</span>
          <div>
            <span className="font-bold text-sm block">Chuẩn đoán bệnh</span>
            <span className="text-[10px] text-neutral-500">
              AI phân tích tức thì
            </span>
          </div>
        </Link>
        <Link
          href="/farmer/orders"
          className="card flex flex-col items-center gap-2 p-4 text-center hover:ring-2 hover:ring-green-400 transition-all bg-white border border-neutral-100 shadow-sm rounded-2xl"
        >
          <span className="text-3xl">🛒</span>
          <div>
            <span className="font-bold text-sm block">Đơn hàng của tôi</span>
            <span className="text-[10px] text-neutral-500">
              Theo dõi tình trạng
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
