"use client";

import { useEffect, useMemo, useState } from "react";

// Memecah "YYYY-MM-DD" menjadi bagian-bagian untuk tampilan.
function pecahTanggal(value) {
    const [y, m, d] = String(value).split("-").map(Number);
    const dt = new Date(y, m - 1, d);

    return {
        hari: String(d).padStart(2, "0"),
        bulan: dt.toLocaleDateString("id-ID", { month: "short" }),
        bulanPanjang: dt.toLocaleDateString("id-ID", { month: "long" }),
        tahun: y,
        namaHari: dt.toLocaleDateString("id-ID", { weekday: "long" }),
    };
}

export default function JanjiTemuPage() {
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);

    const [poliDipilih, setPoliDipilih] = useState("Semua Poli");
    const [pencarian, setPencarian] = useState("");

    const [dokterDipilih, setDokterDipilih] = useState(null);
    const [menyimpan, setMenyimpan] = useState(false);
    const [tanggalPickerTerbuka, setTanggalPickerTerbuka] = useState(false);

    const [pesan, setPesan] = useState("");
    const [berhasil, setBerhasil] = useState(false);

    const [form, setForm] = useState({
        schedule_id: "",
        tanggal_booking: "",
        keluhan: "",
    });

    const daftarHari = [
        "-",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu",
    ];

    useEffect(() => {
        ambilJadwal();
    }, []);

    async function ambilJadwal() {
        try {
            setLoading(true);

            const response = await fetch("/api/pasien/janji-temu");
            const data = await response.json();

            if (response.ok && data.success) {
                setJadwal(Array.isArray(data.data) ? data.data : []);
                setPesan("");
            } else {
                setPesan(data.message || "Jadwal dokter gagal dimuat.");
            }
        } catch (error) {
            console.error("Gagal mengambil jadwal:", error);
            setPesan("Terjadi kesalahan saat mengambil jadwal.");
        } finally {
            setLoading(false);
        }
    }

    const daftarPoli = useMemo(() => {
        return [
            "Semua Poli",
            ...new Set(
                jadwal
                    .map((item) => item.nama_poli)
                    .filter(Boolean)
            ),
        ];
    }, [jadwal]);

    const jadwalFilter = useMemo(() => {
        return jadwal.filter((item) => {
            const sesuaiPoli =
                poliDipilih === "Semua Poli" ||
                item.nama_poli === poliDipilih;

            return sesuaiPoli;
        });
    }, [jadwal, poliDipilih]);

    const daftarDokter = useMemo(() => {
        const hasil = jadwalFilter.reduce((dataDokter, item) => {
            const idDokter = item.dokter_id;

            if (!dataDokter[idDokter]) {
                dataDokter[idDokter] = {
                    id: idDokter,
                    nama: item.nama_dokter,
                    foto: item.foto_dokter,
                    poli: item.nama_poli,
                    jadwal: [],
                };
            }

            dataDokter[idDokter].jadwal.push(item);

            return dataDokter;
        }, {});

        return Object.values(hasil);
    }, [jadwalFilter]);

    const dokterTampil = useMemo(() => {
        const kataKunci = pencarian.toLowerCase().trim();

        return daftarDokter.filter((dokter) => {
            const cocokNama = dokter.nama
                ?.toLowerCase()
                .includes(kataKunci);

            const cocokPoli = dokter.poli
                ?.toLowerCase()
                .includes(kataKunci);

            return cocokNama || cocokPoli;
        });
    }, [daftarDokter, pencarian]);

    function formatTanggal(tanggal) {
        if (!tanggal) return "-";

        const [tahun, bulan, hari] = tanggal.split("-");

        const namaBulan = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
        ];

        return `${Number(hari)} ${namaBulan[Number(bulan) - 1]} ${tahun}`;
    }

    function formatJam(jam) {
        if (!jam) return "-";

        return String(jam).slice(0, 5);
    }

    function bukaForm(dokter) {
        setDokterDipilih(dokter);

        setForm({
            schedule_id: String(dokter.jadwal[0]?.id || ""),
            tanggal_booking: "",
            keluhan: "",
        });

        setPesan("");
        setBerhasil(false);
        setTanggalPickerTerbuka(false);
    }

    function tutupForm() {
        if (menyimpan) return;

        setDokterDipilih(null);
        setPesan("");
        setBerhasil(false);
        setTanggalPickerTerbuka(false);
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((formSebelumnya) => ({
            ...formSebelumnya,
            [name]: value,
            ...(name === "schedule_id"
                ? { tanggal_booking: "" }
                : {}),
        }));

        setPesan("");
        setBerhasil(false);
        if (name === "schedule_id") setTanggalPickerTerbuka(false);
    }

    const jadwalTerpilih = dokterDipilih?.jadwal.find(
        (item) => String(item.id) === form.schedule_id
    );

    // Buat pilihan tanggal hanya pada hari praktik dokter yang dipilih.
    const tanggalTersedia = useMemo(() => {
        if (!jadwalTerpilih) return [];

        const hariPraktik = Number(jadwalTerpilih.hari); // Senin=1 ... Minggu=7
        const hasil = [];
        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);

        // Tampilkan tanggal praktik untuk 90 hari ke depan.
        for (let tambahHari = 1; tambahHari <= 90; tambahHari++) {
            const tanggal = new Date(hariIni);
            tanggal.setDate(hariIni.getDate() + tambahHari);

            const hariTanggal = tanggal.getDay() === 0 ? 7 : tanggal.getDay();
            if (hariTanggal !== hariPraktik) continue;

            const tahun = tanggal.getFullYear();
            const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
            const hari = String(tanggal.getDate()).padStart(2, "0");
            const value = `${tahun}-${bulan}-${hari}`;

            hasil.push({
                value,
                label: tanggal.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                }),
            });
        }

        return hasil;
    }, [jadwalTerpilih]);

    async function daftarJanjiTemu(e) {
        e.preventDefault();

        setPesan("");
        setBerhasil(false);
        setMenyimpan(true);

        try {
            const response = await fetch("/api/pasien/janji-temu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Pendaftaran janji temu gagal.");
                return;
            }

            setPesan("Janji temu berhasil didaftarkan.");
            setBerhasil(true);

            await ambilJadwal();

            setForm({
                schedule_id: "",
                tanggal_booking: "",
                keluhan: "",
            });
        } catch (error) {
            console.error("Gagal mendaftar janji temu:", error);
            setPesan("Terjadi kesalahan saat mendaftar janji temu.");
        } finally {
            setMenyimpan(false);
        }
    }

    const jumlahJadwal = jadwal.length;

    const [hariIniAngka, setHariIniAngka] = useState(null);

    const inputKaca =
        "w-full rounded-2xl border border-white/80 bg-white/55 px-4 py-3.5 text-sm text-[#2b5a84] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none backdrop-blur-md transition placeholder:text-[#9db7d0] focus:border-white focus:bg-white/85 focus:ring-4 focus:ring-[#9cc9ee]/40";

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
                        <p className="text-xl font-extrabold tracking-[0.3em] text-[#315f88] sm:text-2xl">
                            HARMONI
                        </p>
                        <span className="hidden h-6 w-px bg-[#8fb6d8]/60 md:block" />
                        <p className="hidden text-xs tracking-[0.08em] text-[#6f93b6] md:block">
                            Hospital Information System
                        </p>
                    </div>

                    <a
                        href="/pasien"
                        className="harmoni-chip harmoni-focus group flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                    >
                        <span className="transition group-hover:-translate-x-1">←</span>
                        Dashboard
                    </a>
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
                                Janji temu
                            </span>

                            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-6xl">
                                <span className="harmoni-title">Temukan dokter,</span>
                                <br />
                                <span className="font-medium text-[#86b0d8]">pilih waktu terbaik.</span>
                            </h1>

                            <p className="mt-5 max-w-md text-sm leading-7 text-[#6f93b6] sm:text-base">
                                Atur kunjungan kesehatan dengan lebih nyaman. Lihat jadwal praktik,
                                lalu tentukan tanggal konsultasi yang sesuai.
                            </p>

                            <p className="mt-7 text-sm text-[#7e9fc0]">
                                <span className="font-semibold text-[#2b5a84]">{loading ? "…" : jumlahJadwal}</span>{" "}
                                jadwal praktik di{" "}
                                <span className="font-semibold text-[#2b5a84]">{loading ? "…" : daftarPoli.length - 1}</span>{" "}
                                poli
                            </p>
                        </div>

                        {/* Bola kaca: jumlah dokter */}
                        <div className="relative mx-auto flex h-[250px] w-[250px] items-center justify-center">
                            <div className="harmoni-ring" />
                            <div className="harmoni-sphere flex flex-col items-center justify-center text-white">
                                <span className="text-6xl font-semibold tracking-tight drop-shadow-[0_4px_14px_rgba(40,90,140,0.35)]">
                                    {loading ? "…" : daftarDokter.length}
                                </span>
                                <span className="mt-1 text-xs font-medium text-white/90">dokter tersedia</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= PENCARIAN + POLI ================= */}
                <section className="harmoni-panel mt-5 flex flex-col gap-3 rounded-[30px] p-3 lg:flex-row lg:items-center">
                    <label className="flex items-center gap-3 rounded-full bg-white/55 px-5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] lg:w-[300px] lg:shrink-0">
                        <span className="text-sm text-[#7e9fc0]" aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={pencarian}
                            onChange={(e) => setPencarian(e.target.value)}
                            placeholder="Cari dokter atau poli"
                            aria-label="Cari nama dokter atau poli"
                            className="w-full bg-transparent text-sm text-[#2b5a84] placeholder:text-[#8aa9c6] focus:outline-none"
                        />
                    </label>

                    <div
                        className="flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0"
                        role="group"
                        aria-label="Filter poli"
                    >
                        {daftarPoli.map((poli) => (
                            <button
                                key={poli}
                                type="button"
                                onClick={() => setPoliDipilih(poli)}
                                aria-pressed={poliDipilih === poli}
                                className={`harmoni-focus shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition ${poliDipilih === poli
                                    ? "harmoni-chip-on text-[#2b5a84]"
                                    : "text-[#6388a9] hover:bg-white/60"
                                    }`}
                            >
                                {poli}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ================= DAFTAR DOKTER ================= */}
                <section className="mt-8">
                    <div className="mb-6 flex items-end justify-between px-1">
                        <h2 className="text-2xl font-semibold tracking-tight text-[#254968]">
                            Daftar dokter
                        </h2>
                        <p className="text-xs text-[#7e9fc0]">
                            {loading ? "Memuat..." : `${dokterTampil.length} dokter ditampilkan`}
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {[1, 2].map((n) => (
                                <div key={n} className="harmoni-panel h-80 animate-pulse rounded-[32px]" />
                            ))}
                        </div>
                    ) : pesan && jadwal.length === 0 ? (
                        <div className="harmoni-panel flex min-h-[240px] flex-col items-center justify-center rounded-[32px] px-6 text-center">
                            <p className="text-sm text-[#6f93b6]">{pesan}</p>
                            <button
                                onClick={ambilJadwal}
                                className="harmoni-focus mt-5 rounded-2xl bg-gradient-to-br from-[#5c96c4] to-[#407ba9] px-6 py-3 text-xs font-bold text-white shadow-[0_10px_26px_rgba(63,121,169,0.3)] transition hover:-translate-y-0.5"
                            >
                                Coba lagi
                            </button>
                        </div>
                    ) : dokterTampil.length === 0 ? (
                        <div className="harmoni-panel flex min-h-[240px] flex-col items-center justify-center rounded-[32px] px-6 text-center">
                            <p className="text-lg font-semibold text-[#2b5a84]">Dokter tidak ditemukan.</p>
                            <p className="mt-2 text-sm text-[#6f93b6]">
                                Coba gunakan nama atau poli yang berbeda.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {dokterTampil.map((dokter, i) => (
                                <article
                                    key={dokter.id}
                                    style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
                                    className="harmoni-panel harmoni-tile harmoni-enter flex flex-col rounded-[32px] p-6 sm:p-8"
                                >
                                    {/* Identitas dokter */}
                                    <div className="flex items-center gap-5">
                                        <div className="relative shrink-0">
                                            <div className="absolute -inset-2 rounded-full border border-white/80" />
                                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-[4px] border-white/90 bg-gradient-to-br from-[#f7fcff] to-[#c4dff3] shadow-[0_16px_36px_rgba(60,110,160,0.25)]">
                                                {dokter.foto ? (
                                                    <img
                                                        src={dokter.foto}
                                                        alt={dokter.nama}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-3xl font-semibold text-[#5c8db5]">
                                                        {dokter.nama?.charAt(0)?.toUpperCase() || "D"}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-white bg-[#7fcaae]" />
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="break-words text-xl font-semibold leading-snug tracking-tight text-[#254968] sm:text-2xl">
                                                {dokter.nama}
                                            </h3>
                                            <span className="harmoni-chip mt-2 inline-block rounded-full px-4 py-1.5 text-xs font-medium text-[#5f8fb8]">
                                                {dokter.poli || "Poli belum tersedia"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="harmoni-hairline my-6" />

                                    {/* Jadwal praktik */}
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center justify-between">
                                            <p className="text-xs font-semibold text-[#7e9fc0]">Jadwal praktik</p>
                                            <p className="text-xs text-[#8aa9c6]">{dokter.jadwal.length} jadwal</p>
                                        </div>

                                        <ul>
                                            {dokter.jadwal.map((item) => {
                                                const hariIni = Number(item.hari) === hariIniAngka;

                                                return (
                                                    <li
                                                        key={item.id}
                                                        className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-white/60 py-3.5 last:border-0"
                                                    >
                                                        <span className="flex items-center gap-2.5">
                                                            <span className="text-base font-semibold text-[#2b5a84]">
                                                                {daftarHari[Number(item.hari)] || "-"}
                                                            </span>
                                                            {hariIni && (
                                                                <span className="rounded-full border border-emerald-200/80 bg-emerald-50/60 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                                    Hari ini
                                                                </span>
                                                            )}
                                                        </span>

                                                        <span className="text-base font-semibold text-[#477aa5]">
                                                            {formatJam(item.jam_mulai)}
                                                        </span>

                                                        <span className="w-16 text-right text-xs text-[#8aa9c6]">
                                                            {item.durasi || 30} menit
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => bukaForm(dokter)}
                                        className="harmoni-focus group mt-6 flex w-full items-center justify-between rounded-2xl bg-gradient-to-br from-[#5c96c4] to-[#407ba9] px-6 py-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(63,121,169,0.3)] transition hover:-translate-y-0.5"
                                    >
                                        <span>Pesan janji temu</span>
                                        <span className="transition group-hover:translate-x-1">→</span>
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/50 px-1 pt-4 text-[10px] text-[#7e9fc0]">
                    <span className="font-bold tracking-[0.18em]">HARMONI HEALTHCARE</span>
                    <span>Janji Temu</span>
                </footer>
            </div>

            {/* ================= MODAL PESAN JANJI ================= */}
            {dokterDipilih && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1d3d60]/30 p-4 backdrop-blur-md"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            tutupForm();
                        }
                    }}
                >
                    <div
                        className="harmoni-modal relative my-6 w-full max-w-3xl overflow-hidden rounded-[36px] sm:my-8"
                        style={{ maxHeight: "calc(100vh - 3rem)" }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Pesan janji temu"
                    >
                        <button
                            type="button"
                            onClick={tutupForm}
                            disabled={menyimpan}
                            aria-label="Tutup formulir"
                            className="harmoni-chip harmoni-focus absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full text-lg text-[#5f8fb8] transition hover:bg-white disabled:opacity-50"
                        >
                            ×
                        </button>

                        <div className="grid max-h-[calc(100vh-3rem)] overflow-y-auto md:grid-cols-[260px_1fr]">
                            {/* Ringkasan */}
                            <aside className="relative overflow-hidden bg-gradient-to-b from-[#5c96c4]/90 to-[#3f78a8]/90 p-7 text-white sm:p-8">
                                <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border border-white/30" />
                                <div className="pointer-events-none absolute -bottom-20 -left-14 h-56 w-56 rounded-full bg-white/10" />

                                <div className="relative flex h-full flex-col">
                                    <div className="flex flex-col items-center text-center md:items-start md:text-left">
                                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/80 bg-white/25 shadow-[0_14px_30px_rgba(20,60,100,0.3)]">
                                            {dokterDipilih.foto ? (
                                                <img
                                                    src={dokterDipilih.foto}
                                                    alt={dokterDipilih.nama}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-2xl font-semibold">
                                                    {dokterDipilih.nama?.charAt(0)?.toUpperCase() || "D"}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-5 text-lg font-semibold leading-snug">{dokterDipilih.nama}</p>
                                        <p className="mt-1 text-sm text-white/80">{dokterDipilih.poli}</p>
                                    </div>

                                    <div className="mt-7 hidden border-t border-white/25 pt-6 md:block">
                                        <p className="text-[11px] text-white/70">Jadwal praktik</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {jadwalTerpilih
                                                ? `${daftarHari[Number(jadwalTerpilih.hari)] || "-"}, ${formatJam(jadwalTerpilih.jam_mulai)}`
                                                : "-"}
                                        </p>

                                        <p className="mt-6 text-[11px] text-white/70">Tanggal kunjungan</p>
                                        {form.tanggal_booking ? (
                                            (() => {
                                                const p = pecahTanggal(form.tanggal_booking);
                                                return (
                                                    <div className="mt-2">
                                                        <p className="text-6xl font-light leading-none tracking-tight">{p.hari}</p>
                                                        <p className="mt-2 text-sm capitalize text-white/85">
                                                            {p.namaHari}, {p.bulanPanjang} {p.tahun}
                                                        </p>
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <p className="mt-1 text-sm font-semibold">Belum dipilih</p>
                                        )}
                                    </div>
                                </div>
                            </aside>

                            {/* Form */}
                            <div className="p-7 sm:p-9">
                                <h2 className="pr-10 text-2xl font-semibold tracking-tight text-[#2b5a84]">
                                    Pesan janji temu
                                </h2>
                                <p className="mt-1.5 text-sm leading-6 text-[#6f93b6]">
                                    Lengkapi detail kunjungan untuk melanjutkan pendaftaran.
                                </p>

                                {pesan && (
                                    <div
                                        role="status"
                                        className={`mt-5 rounded-2xl border px-4 py-3 text-sm backdrop-blur-md ${berhasil
                                            ? "border-emerald-200/80 bg-emerald-50/70 text-emerald-700"
                                            : "border-rose-200/80 bg-rose-50/70 text-rose-600"
                                            }`}
                                    >
                                        {pesan}
                                    </div>
                                )}

                                {!berhasil && (
                                    <form onSubmit={daftarJanjiTemu} className="mt-6 space-y-5">
                                        <div>
                                            <label htmlFor="schedule_id" className="mb-2 block text-xs font-semibold text-[#5f86ab]">
                                                Jadwal praktik
                                            </label>

                                            <select
                                                id="schedule_id"
                                                name="schedule_id"
                                                value={form.schedule_id}
                                                onChange={handleChange}
                                                required
                                                className={inputKaca}
                                            >
                                                {dokterDipilih.jadwal.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {daftarHari[Number(item.hari)] || "-"} — {formatJam(item.jam_mulai)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-xs font-semibold text-[#5f86ab]">
                                                Tanggal kunjungan
                                            </p>

                                            <button
                                                type="button"
                                                disabled={!jadwalTerpilih || tanggalTersedia.length === 0}
                                                onClick={() => setTanggalPickerTerbuka((terbuka) => !terbuka)}
                                                aria-expanded={tanggalPickerTerbuka}
                                                className={`${inputKaca} harmoni-focus flex items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-60`}
                                            >
                                                <span className={form.tanggal_booking ? "font-medium text-[#2b5a84]" : "text-[#8aa9c6]"}>
                                                    {form.tanggal_booking
                                                        ? formatTanggal(form.tanggal_booking)
                                                        : jadwalTerpilih
                                                            ? "Pilih tanggal kunjungan"
                                                            : "Pilih jadwal praktik terlebih dahulu"}
                                                </span>
                                                <span className={`ml-3 text-[#5f8fb8] transition-transform ${tanggalPickerTerbuka ? "rotate-180" : ""}`}>
                                                    ▾
                                                </span>
                                            </button>

                                            {tanggalPickerTerbuka && jadwalTerpilih && (
                                                <div className="mt-3 rounded-[24px] border border-white/80 bg-white/55 p-4">
                                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                        <p className="text-xs text-[#6f93b6]">
                                                            Hari praktik {daftarHari[Number(jadwalTerpilih.hari)]}
                                                        </p>
                                                        <span className="harmoni-chip rounded-full px-3 py-1 text-[11px] font-medium text-[#5f8fb8]">
                                                            {tanggalTersedia.length} tanggal
                                                        </span>
                                                    </div>

                                                    <div className="grid max-h-60 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                                                        {tanggalTersedia.map((tanggal) => {
                                                            const p = pecahTanggal(tanggal.value);
                                                            const aktif = form.tanggal_booking === tanggal.value;

                                                            return (
                                                                <button
                                                                    key={tanggal.value}
                                                                    type="button"
                                                                    aria-label={tanggal.label}
                                                                    onClick={() => {
                                                                        setForm((sebelumnya) => ({ ...sebelumnya, tanggal_booking: tanggal.value }));
                                                                        setTanggalPickerTerbuka(false);
                                                                        setPesan("");
                                                                        setBerhasil(false);
                                                                    }}
                                                                    className={`harmoni-focus flex flex-col items-center rounded-2xl border px-2 py-3 text-center transition ${aktif
                                                                        ? "border-transparent bg-gradient-to-br from-[#5c96c4] to-[#407ba9] text-white shadow-[0_8px_20px_rgba(63,121,169,0.3)]"
                                                                        : "border-white/80 bg-white/60 text-[#477aa5] hover:bg-white/90"
                                                                        }`}
                                                                >
                                                                    <span className={`text-3xl font-light leading-none tracking-tight ${aktif ? "text-white" : "text-[#2b5a84]"}`}>
                                                                        {p.hari}
                                                                    </span>
                                                                    <span className={`mt-1.5 text-[11px] font-medium capitalize ${aktif ? "text-white/90" : "text-[#6f93b6]"}`}>
                                                                        {p.bulan} {p.tahun}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <p className="mt-2.5 text-xs leading-5 text-[#7e9fc0]">
                                                Tanggal mengikuti hari praktik dokter, bisa dipilih untuk 90 hari ke depan.
                                            </p>
                                        </div>

                                        <div>
                                            <label htmlFor="keluhan" className="mb-2 block text-xs font-semibold text-[#5f86ab]">
                                                Keluhan
                                            </label>

                                            <textarea
                                                id="keluhan"
                                                name="keluhan"
                                                value={form.keluhan}
                                                onChange={handleChange}
                                                rows={4}
                                                required
                                                placeholder="Ceritakan keluhan yang sedang kamu rasakan..."
                                                className={`${inputKaca} resize-none leading-7`}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={menyimpan}
                                            className="harmoni-focus group flex w-full items-center justify-between rounded-2xl bg-gradient-to-br from-[#5c96c4] to-[#407ba9] px-6 py-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(63,121,169,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <span>{menyimpan ? "Mengirim pendaftaran..." : "Konfirmasi janji temu"}</span>
                                            <span className="transition group-hover:translate-x-1">→</span>
                                        </button>
                                    </form>
                                )}

                                {berhasil && (
                                    <button
                                        type="button"
                                        onClick={tutupForm}
                                        className="harmoni-focus mt-6 w-full rounded-2xl bg-gradient-to-br from-[#5c96c4] to-[#407ba9] px-5 py-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(63,121,169,0.3)] transition hover:-translate-y-0.5"
                                    >
                                        Kembali ke daftar dokter
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
