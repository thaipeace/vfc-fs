export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="text-6xl">🚫</div>
      <h1 className="text-2xl font-bold text-neutral-800">Không có quyền truy cập</h1>
      <p className="text-neutral-500">Bạn không có quyền xem trang này.</p>
      <a href="/" className="btn-outline mt-2">Về trang chủ</a>
    </main>
  );
}
