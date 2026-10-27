// app/loading.tsx — penanda muat saat pindah halaman (pemilik: A)
// Garis tipis di atas layar menandai proses; kerangka abu-abu menahan tempat supaya tata letak tidak melompat.

export default function Memuat() {
  return (
    <div role="status" className="bingkai pt-12 pb-24 sm:pt-16">
      <span aria-hidden="true" className="muat-garis" />
      <span className="sr-only">Memuat halaman…</span>
      <div aria-hidden="true" className="grid gap-6 lg:grid-cols-12">
        <div className="kerangka h-14 w-3/4 lg:col-span-6" />
        <div className="grid gap-3 lg:col-span-6">
          <div className="kerangka h-5" />
          <div className="kerangka h-5 w-5/6" />
          <div className="kerangka h-5 w-2/3" />
        </div>
      </div>
      <div aria-hidden="true" className="kerangka mt-12 h-[50svh]" />
    </div>
  );
}
