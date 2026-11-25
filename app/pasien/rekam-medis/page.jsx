"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RekamMedisPasienPage() {
    const router = useRouter();

    const [rekamMedis, setRekamMedis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    async function ambilRekamMedis(isRefresh = false) {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await fetch("/api/pasien/rekam-medis", {
                cache: "no-store",
            });

            const result = await response.json();

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok) {
                setPesan(
                    result.message || "Rekam medis gagal dimuat."
                );
                return;
            }

            // Urutan prioritas resep: siap diambil > menunggu diproses > sudah diambil.
            // Jika prioritas sama, tampilkan pemeriksaan terbaru lebih dulu.
            const dataTerurut = [...(result.data || [])].sort((a, b) => {
                const prioritasStatus = (status) => {
                    const value = (status || "").toLowerCase();
                    if (value.includes("menunggu")) return 0;
                    if (value.includes("siap")) return 1;
                    if (value.includes("diambil")) return 2;
                    return 3;
                };

                const selisihPrioritas = prioritasStatus(a.status_resep) - prioritasStatus(b.status_resep);
                if (selisihPrioritas !== 0) return selisihPrioritas;

                const tanggalA = new Date(a.tanggal_booking || a.created_at).getTime() || 0;
                const tanggalB = new Date(b.tanggal_booking || b.created_at).getTime() || 0;
                return tanggalB - tanggalA;
            });

            setRekamMedis(dataTerurut);
            setPesan("");
        } catch (error) {
            console.error("Gagal mengambil rekam medis:", error);
            setPesan("Terjadi kesalahan saat mengambil data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        ambilRekamMedis();
    }, []);

    function formatTanggal(tanggal) {
        if (!tanggal) return "-";

        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Makassar",
        });
    }

    function inisialDokter(nama) {
        if (!nama) return "DR";

        return nama
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((kata) => kata[0].toUpperCase())
            .join("");
    }

    function getStatusResep(status) {
        const value = (status || "").toLowerCase();

        if (value.includes("diambil")) {
            return "border-emerald-200/80 bg-emerald-50/60 text-emerald-700";
        }

        if (value.includes("siap")) {
            return "border-sky-200/80 bg-sky-50/60 text-sky-700";
        }

        return "border-amber-200/80 bg-amber-50/60 text-amber-700";
    }

    return (
        <main className="harmoni-scene relative min-h-screen overflow-hidden px-3 py-4 text-[#244968] sm:px-8 sm:py-8 lg:px-10">
            <style>{`
                @keyframes harmoniRise {
                    from { opacity: 0; transform: translate3d(0, 16px, 0); }
                    to { opacity: 1; transform: translate3d(0, 0, 0); }
                }
                .harmoni-enter { animation: harmoniRise .9s cubic-bezier(.16,.78,.25,1) both; }

                .harmoni-scene {
                    background:
                        radial-gradient(70% 50% at 8% 0%, #ffffff 0%, transparent 62%),
                        linear-gradient(165deg, #eaf4fc 0%, #d3e6f7 55%, #c2dbf1 100%);
                }
                .hs { position: absolute; border-radius: 9999px; pointer-events: none; }
                .hs-1 { width: 520px; height: 520px; left: -150px; top: 140px; background: linear-gradient(145deg, #ffffff 0%, #9fc8ec 100%); opacity: .9; }
                .hs-2 { width: 430px; height: 430px; right: -70px; top: -90px; background: linear-gradient(145deg, #e3f0fb 0%, #6aa3d4 100%); opacity: .85; }
                .hs-3 { width: 470px; height: 470px; right: 6%; bottom: -150px; background: linear-gradient(145deg, #bcdcf5 0%, #4a86b8 100%); opacity: .8; }
                .hs-4 { width: 720px; height: 720px; left: 28%; top: 26%; border: 1px solid rgba(255,255,255,.75); }
                .hs-5 { width: 240px; height: 240px; left: 16%; bottom: 6%; background: linear-gradient(145deg, #ffffff 0%, #7fb2de 100%); opacity: .85; }

                .harmoni-window {
                    position: relative; z-index: 1;
                    background: linear-gradient(145deg, rgba(255,255,255,.34), rgba(255,255,255,.12));
                    backdrop-filter: blur(40px) saturate(1.7);
                    -webkit-backdrop-filter: blur(40px) saturate(1.7);
                    border: 1px solid rgba(255,255,255,.7);
                    box-shadow: 0 40px 100px rgba(55,105,155,.2), inset 0 1.5px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(255,255,255,.3);
                }
                .harmoni-panel {
                    position: relative; overflow: hidden; isolation: isolate;
                    background:
                        radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,.5), transparent 55%),
                        linear-gradient(145deg, rgba(255,255,255,.36), rgba(255,255,255,.1));
                    backdrop-filter: blur(28px) saturate(1.6);
                    -webkit-backdrop-filter: blur(28px) saturate(1.6);
                    border: 1px solid rgba(255,255,255,.6);
                    box-shadow: 0 10px 30px rgba(55,105,155,.1), inset 0 1px 0 rgba(255,255,255,.95);
                }
                .harmoni-tile { transition: transform .45s cubic-bezier(.2,.7,.2,1), background .45s ease, box-shadow .45s ease; }
                .harmoni-tile:hover {
                    transform: translateY(-3px);
                    background:
                        radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,.75), transparent 58%),
                        linear-gradient(145deg, rgba(255,255,255,.5), rgba(255,255,255,.18));
                    box-shadow: 0 18px 44px rgba(55,105,155,.16), inset 0 1px 0 rgba(255,255,255,1);
                }
                .harmoni-chip {
                    background: rgba(255,255,255,.5);
                    border: 1px solid rgba(255,255,255,.85);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,.95);
                    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                }
                .harmoni-chip-on {
                    background: rgba(255,255,255,.92);
                    border: 1px solid #fff;
                    box-shadow: 0 6px 16px rgba(75,125,165,.18), inset 0 1px 0 #fff;
                }
                .harmoni-modal {
                    background:
                        radial-gradient(120% 70% at 0% 0%, rgba(255,255,255,.7), transparent 55%),
                        linear-gradient(145deg, rgba(255,255,255,.78), rgba(236,245,253,.66));
                    backdrop-filter: blur(40px) saturate(1.7);
                    -webkit-backdrop-filter: blur(40px) saturate(1.7);
                    border: 1px solid rgba(255,255,255,.85);
                    box-shadow: 0 40px 110px rgba(30,70,115,.35), inset 0 1.5px 0 #fff;
                }
                .harmoni-focus:focus-visible { outline: 2px solid #3f78a8; outline-offset: 3px; }
                .harmoni-title {
                    background: linear-gradient(100deg, #315f88 8%, #6798c5 50%, #3e78a8 92%);
                    -webkit-background-clip: text; background-clip: text; color: transparent;
                }
                @media (prefers-reduced-motion: reduce) {
                    .harmoni-enter { animation: none !important; }
                    .harmoni-tile { transition: none !important; }
                    .harmoni-tile:hover { transform: none !important; }
                }
                @keyframes harmoniOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .harmoni-sphere {
                    width: 190px; height: 190px; border-radius: 9999px;
                    background: radial-gradient(circle at 32% 26%, #ffffff 0, rgba(255,255,255,.75) 11%, #b9d9f3 42%, #5f98cb 100%);
                    box-shadow: inset -20px -26px 50px rgba(255,255,255,.35), inset 10px 10px 30px rgba(255,255,255,.5), 0 40px 80px rgba(60,110,160,.35);
                }
                .harmoni-ring {
                    position: absolute; inset: -30px; border-radius: 9999px;
                    border: 1px solid rgba(255,255,255,.85);
                    box-shadow: 0 0 30px rgba(255,255,255,.4);
                    animation: harmoniOrbit 40s linear infinite;
                }
                .harmoni-ring::after {
                    content: ""; position: absolute; top: 12%; left: 8%; width: 12px; height: 12px; border-radius: 9999px;
                    background: #fff; box-shadow: 0 0 16px 4px rgba(255,255,255,.9);
                }
                .harmoni-hairline { background: linear-gradient(90deg, transparent, rgba(255,255,255,.95), transparent); height: 1px; }
                @media (prefers-reduced-motion: reduce) { .harmoni-ring { animation: none !important; } }
            `}</style>

            <div className="hs hs-1" aria-hidden="true" />
            <div className="hs hs-2" aria-hidden="true" />
            <div className="hs hs-3" aria-hidden="true" />
            <div className="hs hs-4" aria-hidden="true" />
            <div className="hs hs-5" aria-hidden="true" />

            <div className="harmoni-window harmoni-enter mx-auto max-w-[1180px] rounded-[32px] p-4 sm:rounded-[44px] sm:p-7">
                {/* ================= HEADER ================= */}
                <header className="flex flex-wrap items-center justify-between gap-4 px-1">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-extrabold tracking-[0.3em] text-[#315f88] sm:text-2xl">
                            HARMONI
                        </h2>
                        <span className="hidden h-6 w-px bg-[#8fb6d8]/60 md:block" />
                        <p className="hidden text-xs tracking-[0.08em] text-[#6f93b6] md:block">
                            Hospital Information System
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/pasien")}
                        className="harmoni-chip harmoni-focus group flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                    >
                        <span className="transition group-hover:-translate-x-1">←</span>
                        Dashboard
                    </button>
                </header>

                {/* ================= HERO ================= */}
                <section
                    className="harmoni-panel harmoni-enter mt-7 rounded-[36px] p-7 sm:p-11"
                    style={{ animationDelay: "100ms" }}
                >
                    <div className="grid gap-10 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div>
                            <span className="harmoni-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#5f8fb8]">
                                <span className="h-2 w-2 rounded-full bg-[#7fcaae]" />
                                Arsip medis pribadi
                            </span>

                            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-6xl">
                                <span className="harmoni-title">Rekam medis,</span>
                                <br />
                                <span className="font-medium text-[#86b0d8]">tersimpan rapi.</span>
                            </h1>

                            <p className="mt-5 max-w-md text-sm leading-7 text-[#6f93b6] sm:text-base">
                                Hasil pemeriksaan, catatan dokter, hingga resep obat, semuanya ada di
                                satu tempat.
                            </p>

                            <button
                                onClick={() => ambilRekamMedis(true)}
                                disabled={loading || refreshing}
                                className="harmoni-chip harmoni-focus mt-7 inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80 disabled:opacity-50"
                            >
                                {refreshing && (
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#cfe3f4] border-t-[#477da9]" />
                                )}
                                {refreshing ? "Memuat..." : "Perbarui data"}
                            </button>
                        </div>

                        {/* Bola kaca: jumlah pemeriksaan */}
                        <div className="relative mx-auto flex h-[250px] w-[250px] items-center justify-center">
                            <div className="harmoni-ring" />
                            <div className="harmoni-sphere flex flex-col items-center justify-center text-white">
                                <span className="text-6xl font-semibold tracking-tight drop-shadow-[0_4px_14px_rgba(40,90,140,0.35)]">
                                    {loading ? "…" : rekamMedis.length}
                                </span>
                                <span className="mt-1 text-xs font-medium text-white/90">pemeriksaan</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= RIWAYAT ================= */}
                <section className="mt-8">
                    <h3 className="mb-6 px-1 text-2xl font-semibold tracking-tight text-[#254968]">
                        Riwayat pemeriksaan
                    </h3>

                    {loading && (
                        <div className="grid gap-5">
                            {[1, 2].map((n) => (
                                <div key={n} className="harmoni-panel h-64 animate-pulse rounded-[32px]" />
                            ))}
                        </div>
                    )}

                    {!loading && pesan && (
                        <div className="harmoni-panel flex min-h-[240px] flex-col items-center justify-center rounded-[32px] px-6 text-center">
                            <p className="text-sm text-rose-600">{pesan}</p>
                            <button
                                onClick={() => ambilRekamMedis()}
                                className="harmoni-focus mt-5 rounded-2xl bg-gradient-to-br from-[#5c96c4] to-[#407ba9] px-6 py-3 text-xs font-bold text-white shadow-[0_10px_26px_rgba(63,121,169,0.3)] transition hover:-translate-y-0.5"
                            >
                                Coba lagi
                            </button>
                        </div>
                    )}

                    {!loading && !pesan && rekamMedis.length === 0 && (
                        <div className="harmoni-panel flex min-h-[260px] flex-col items-center justify-center rounded-[32px] px-6 text-center">
                            <h3 className="text-xl font-semibold text-[#2b5a84]">Belum ada rekam medis</h3>
                            <p className="mt-2 max-w-md text-sm leading-6 text-[#6f93b6]">
                                Catatan pemeriksaan akan muncul di sini setelah dokter menyelesaikan
                                pemeriksaanmu.
                            </p>
                        </div>
                    )}

                    {!loading && !pesan && rekamMedis.length > 0 && (
                        <div className="space-y-5">
                            {rekamMedis.map((item, index) => {
                                const resep = Array.isArray(item.resep) ? item.resep : [];
                                const tgl = new Date(item.tanggal_booking || item.created_at);
                                const tglValid = !Number.isNaN(tgl.getTime());
                                const hariAngka = tglValid
                                    ? tgl.toLocaleDateString("id-ID", { day: "2-digit", timeZone: "Asia/Makassar" })
                                    : "-";
                                const bulanTahun = tglValid
                                    ? tgl.toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Makassar" })
                                    : "";
                                const terakhir = index === rekamMedis.length - 1;

                                return (
                                    <div
                                        key={item.id}
                                        style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
                                        className="harmoni-enter grid gap-x-5 sm:grid-cols-[110px_20px_1fr]"
                                    >
                                        {/* Tanggal (layar lebar) */}
                                        <div className="hidden pt-5 text-right sm:block">
                                            <p className="text-5xl font-light leading-none tracking-tight text-[#2b5a84]">
                                                {hariAngka}
                                            </p>
                                            <p className="mt-2 text-xs capitalize leading-5 text-[#7e9fc0]">
                                                {bulanTahun}
                                            </p>
                                        </div>

                                        {/* Garis waktu */}
                                        <div className="relative hidden sm:block" aria-hidden="true">
                                            <span className="absolute left-1/2 top-8 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#7fb2de] to-[#407ba9] ring-4 ring-white/70" />
                                            {!terakhir && (
                                                <span className="absolute -bottom-5 left-1/2 top-12 w-px -translate-x-1/2 bg-gradient-to-b from-white/90 to-white/20" />
                                            )}
                                        </div>

                                        {/* Kartu */}
                                        <article className="harmoni-panel rounded-[32px]">
                                            <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-0 sm:p-8 sm:pb-0">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-[3px] border-white/90 bg-gradient-to-br from-[#f7fcff] to-[#c4dff3] shadow-[0_10px_24px_rgba(60,110,160,0.22)]">
                                                        {item.foto_dokter ? (
                                                            <img
                                                                src={item.foto_dokter}
                                                                alt={`Foto ${item.nama_dokter || "dokter"}`}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-base font-semibold text-[#5c8db5]">
                                                                {inisialDokter(item.nama_dokter)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h4 className="break-words text-base font-semibold tracking-tight text-[#2b5a84]">
                                                            {item.nama_dokter || "Dokter"}
                                                        </h4>
                                                        <p className="mt-0.5 text-xs text-[#6f93b6]">
                                                            {item.nama_poli || "Poli tidak tersedia"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Tanggal (HP) */}
                                                <span className="harmoni-chip rounded-full px-4 py-2 text-xs font-semibold text-[#477aa5] sm:hidden">
                                                    {formatTanggal(item.tanggal_booking || item.created_at)}
                                                </span>
                                            </div>

                                            {/* Diagnosis sebagai sorotan */}
                                            <div className="px-6 pt-7 sm:px-8">
                                                <p className="text-xs font-semibold text-[#7e9fc0]">Diagnosis</p>
                                                <p className="mt-2 text-2xl font-semibold leading-snug tracking-tight text-[#254968] sm:text-3xl">
                                                    {item.diagnosis || "-"}
                                                </p>
                                            </div>

                                            <div className="mx-6 mt-7 harmoni-hairline sm:mx-8" />

                                            <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8">
                                                <div>
                                                    <p className="text-xs font-semibold text-[#7e9fc0]">Tindakan</p>
                                                    <p className="mt-2 text-sm leading-7 text-[#3f6c95]">
                                                        {item.tindakan || "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold text-[#7e9fc0]">Catatan dokter</p>
                                                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#5f86ab]">
                                                        {item.catatan || "Tidak ada catatan tambahan dari dokter."}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Resep */}
                                            <div className="border-t border-white/60 bg-white/20 px-6 py-6 sm:px-8">
                                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                                    <p className="text-sm font-semibold text-[#2b5a84]">Resep obat</p>

                                                    {item.status_resep && (
                                                        <span
                                                            className={`rounded-full border px-4 py-1.5 text-xs font-semibold backdrop-blur-md ${getStatusResep(
                                                                item.status_resep
                                                            )}`}
                                                        >
                                                            {item.status_resep}
                                                        </span>
                                                    )}
                                                </div>

                                                {resep.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {resep.map((obat, obatIndex) => (
                                                            <span
                                                                key={`${item.id}-${obatIndex}`}
                                                                className="harmoni-chip inline-flex items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5 text-sm font-medium text-[#2b5a84]"
                                                            >
                                                                {obat.nama_obat}
                                                                <span className="flex min-w-[28px] items-center justify-center rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#477aa5]">
                                                                    {obat.jumlah}
                                                                </span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-[#6f93b6]">
                                                        Tidak ada resep obat untuk pemeriksaan ini.
                                                    </p>
                                                )}
                                            </div>
                                        </article>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/50 px-1 pt-4 text-[10px] text-[#7e9fc0]">
                    <span className="font-bold tracking-[0.18em]">HARMONI HEALTHCARE</span>
                    <span>Rekam Medis</span>
                </footer>
            </div>
        </main>
    );
}
