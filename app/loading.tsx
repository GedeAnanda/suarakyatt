// app/loading.tsx — penanda muat saat pindah halaman (pemilik: A)
// Garis biru tipis di bawah header menandai proses; kerangka abu-abu menahan tempat supaya tata letak tidak melompat.

export default function Memuat() {
  return (
    <div role="status" className="bingkai pt-6 pb-4 sm:pt-8">
      <span aria-hidden="true" className="muat-garis" />
      <span className="sr-only">Memuat halaman…</span>
      <div aria-hidden="true" className="grid gap-3">
        <div className="kerangka h-4 w-40" />
        <div className="kerangka h-10 w-2/3 max-w-xl" />
        <div className="kerangka h-5 w-full max-w-2xl" />
      </div>
      <div aria-hidden="true" className="mt-8 grid gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <div className="kerangka h-80" />
        <div className="kerangka h-[50svh]" />
      </div>
    </div>
  );
}
