"use client";

import { useEffect, useState } from "react";

export default function VerifikasiDokterPage() {
    const [dokter, setDokter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prosesId, setProsesId] = useState(null);
    const [pesan, setPesan] = useState("");

    async function muatData() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/verifikasi-dokter", { cache: "no-store" });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Data gagal dimuat.");
            setDokter(json.data || []);
            setPesan("");
        } catch (error) {
            setPesan(error.message || "Tidak dapat mengambil data verifikasi.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { muatData(); }, []);

    async function proses(id, keputusan) {
        const konfirmasi = keputusan === "terverifikasi"
            ? "Setujui dan aktifkan akun dokter ini?"
            : "Tolak pendaftaran dokter ini?";
        if (!window.confirm(konfirmasi)) return;
        setProsesId(id);
        setPesan("");
        try {
            const res = await fetch("/api/admin/verifikasi-dokter", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dokter_id: id, keputusan }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Verifikasi gagal.");
            setDokter((prev) => prev.filter((item) => item.id !== id));
            setPesan(json.message);
        } catch (error) {
            setPesan(error.message || "Verifikasi gagal.");
        } finally {
            setProsesId(null);
        }
    }

    return (
        <main className="min-h-screen bg-[#EAF3FC] px-5 py-8 text-[#24476D] md:px-10">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold tracking-[0.2em] text-[#7199C0]">HARMONI HEALTHCARE</p>
                        <h1 className="mt-2 text-3xl font-bold">Verifikasi Pendaftaran Dokter</h1>
                        <p className="mt-2 text-sm text-[#7591B0]">Periksa dokumen SK sebelum menyetujui akun dokter.</p>
                    </div>
                    <button onClick={muatData} className="rounded-xl border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-white">↻ Refresh</button>
                </div>

                {pesan && <div className="mb-5 rounded-xl border border-[#C7DDF2] bg-white/70 px-4 py-3 text-sm">{pesan}</div>}

                {loading ? (
                    <div className="rounded-2xl border border-white bg-white/60 p-10 text-center">Memuat pendaftaran dokter...</div>
                ) : dokter.length === 0 ? (
                    <div className="rounded-2xl border border-white bg-white/60 p-10 text-center">
                        <h2 className="font-semibold">Tidak ada pendaftaran yang menunggu verifikasi</h2>
                        <p className="mt-2 text-sm text-[#7591B0]">Pendaftaran dokter baru akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {dokter.map((item) => (
                            <article key={item.id} className="rounded-2xl border border-white/90 bg-white/65 p-6 shadow-[0_12px_35px_rgba(56,103,153,0.10)] backdrop-blur-xl">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-bold">{item.full_name}</h2>
                                        <p className="mt-1 text-sm text-[#7894B2]">@{item.username}</p>
                                    </div>
                                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Menunggu</span>
                                </div>
                                <div className="mt-4 space-y-2 text-sm">
                                    <p><span className="text-[#7894B2]">Email: </span>{item.email}</p>
                                    <p><span className="text-[#7894B2]">Telepon: </span>{item.phone}</p>
                                    <p><span className="text-[#7894B2]">Poli: </span>{item.nama_poli || "-"}</p>
                                </div>
                                {item.sk_dokter ? (
                                    <a href={item.sk_dokter} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-xl border border-[#C8DDF1] bg-[#EDF6FF] px-4 py-2 text-sm font-semibold text-[#376B9C] hover:bg-white">Lihat / Unduh SK ↗</a>
                                ) : <p className="mt-5 text-sm text-red-600">Dokumen SK tidak ditemukan.</p>}
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button disabled={prosesId === item.id} onClick={() => proses(item.id, "terverifikasi")} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{prosesId === item.id ? "Memproses..." : "Setujui Dokter"}</button>
                                    <button disabled={prosesId === item.id} onClick={() => proses(item.id, "ditolak")} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">Tolak Pendaftaran</button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
