"use client";

import { useState, useEffect } from "react";

interface UserPosition {
  name: string;
  zaloId: string;
  lat: number;
  lng: number;
}

export function ZaloFloatingButton() {
  const [zaloLink, setZaloLink] = useState("https://zalo.me/your_oa_id");
  const [closestUser, setClosestUser] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Current user location:", { latitude, longitude });

      try {
        const res = await fetch("/api/staff");
        if (!res.ok) return;

        const data = await res.json();
        const staffs: any[] = data.users || [];

        let minDistance = Infinity;
        let nearest: any = null;

        staffs.forEach((u) => {
          const uLat = u.lat;
          const uLng = u.lng;
          const uHasZalo = u.hasZalo;

          if (!uLat || !uLng || !uHasZalo) return;
          const d = getDistance(
            latitude,
            longitude,
            Number(uLat),
            Number(uLng),
          );
          if (d < minDistance) {
            minDistance = d;
            nearest = u;
          }
        });

        console.log("Nearest staff candidate:", nearest);

        if (nearest) {
          // Lấy số Zalo cụ thể cho người này
          const zaloRes = await fetch(
            `/api/staff?action=getZaloAction&userHasZalo=${nearest.username}`,
          );
          if (zaloRes.ok) {
            const zaloData = await zaloRes.json();
            if (zaloData.success && zaloData.message) {
              const zaloNumber = zaloData.message;
              console.log("Fetched Zalo number:", zaloNumber);
              setZaloLink(`https://zalo.me/${zaloNumber}`);
              setClosestUser(nearest.name || "Nhân viên hỗ trợ");
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch nearest user:", err);
      }
    });
  }, []);

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 sm:bottom-8 sm:right-8 flex items-center justify-center group">
      <style>{`
        @keyframes broadcast {
          0% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .broadcast-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background: #3b82f6;
          animation: broadcast 4s infinite;
          z-index: -1;
        }
      `}</style>

      {/* Tooltip */}
      {closestUser && (
        <div className="absolute bottom-full mb-2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
          <span className="font-medium opacity-70">Gần bạn:</span> {closestUser}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
        </div>
      )}
      
      <a
        href={zaloLink}
        target="_blank"
        rel="noreferrer"
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <div className="broadcast-ring"></div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-base">💬</span>
        </div>
      </a>
    </div>
  );
}
