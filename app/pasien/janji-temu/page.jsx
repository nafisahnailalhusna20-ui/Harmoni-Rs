"use client";

import { useEffect, useMemo, useState } from "react";

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

    return (
        <main className="min-h-screen overflow-hidden bg-gradient-to-br from-[#F5F9FF] via-[#EAF3FF] to-[#D6E9FF] text-[#315B86]">

            {/* HEADER */}

            <header className="mx-auto max-w-[1440px] px-6 pt-8 sm:px-10 lg:px-16">

                <div className="flex flex-col gap-5 border-b border-white/70 pb-7 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-xl font-bold tracking-[0.28em] text-[#315B86] sm:text-2xl">
                                HARMONI
                            </p>

                            <p className="mt-1 text-[10px] tracking-[0.22em] text-[#7CA5D5] sm:text-xs">
                                HOSPITAL INFORMATION SYSTEM
                            </p>
                        </div>

                        <div className="hidden h-8 w-px bg-[#B9D5F4] sm:block" />

                        <p className="hidden text-xs tracking-[0.12em] text-[#7CA5D5] sm:block">
                            Patient Portal
                        </p>
                    </div>

                    <a
                        href="/pasien"
                        className="inline-flex w-fit items-center gap-3 rounded-full border border-white/80 bg-white/45 px-6 py-3 text-sm text-[#4779AD] shadow-[0_8px_24px_rgba(83,132,185,0.08)] backdrop-blur-xl transition hover:bg-white/75"
                    >
                        <span className="text-lg">←</span>
                        Dashboard
                    </a>
                </div>

            </header>

            {/* HERO */}

            <section className="mx-auto max-w-[1440px] px-6 pb-12 pt-12 sm:px-10 sm:pt-16 lg:px-16">

                <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">

                    <div>
                        <div className="mb-7 flex items-center gap-4">
                            <span className="h-px w-10 bg-[#7CA5D5]" />

                            <p className="text-xs font-semibold tracking-[0.3em] text-[#7CA5D5]">
                                PATIENT / APPOINTMENT
                            </p>
                        </div>

                        <h1 className="max-w-3xl text-4xl font-medium leading-tight tracking-[-0.04em] text-[#315B86] sm:text-5xl lg:text-6xl">
                            Temukan dokter,
                            <br />

                            <span className="font-normal text-[#79A8DE]">
                                pilih waktu terbaik.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-[#7299C3] sm:text-lg">
                            Atur kunjungan kesehatan dengan lebih nyaman.
                            Temukan dokter, lihat jadwal praktik, lalu
                            tentukan tanggal konsultasi yang sesuai.
                        </p>
                    </div>

                    {/* HERO SIDE */}

                    <div className="relative hidden min-h-[190px] items-end justify-end lg:flex">

                        <div className="absolute right-0 top-0 text-[150px] font-semibold leading-none tracking-[-0.08em] text-[#C6DFF8]/60">
                            06
                        </div>

                        <div className="relative z-10 max-w-[260px] pb-3 text-right">
                            <p className="text-xs tracking-[0.28em] text-[#7CA5D5]">
                                DOCTOR DIRECTORY
                            </p>

                            <p className="mt-5 text-lg leading-8 text-[#6D9ACB]">
                                Perawatan dimulai
                                <br />
                                dari pilihan yang tepat.
                            </p>
                        </div>
                    </div>

                </div>

                {/* STATISTICS */}

                <div className="mt-12 grid gap-4 sm:grid-cols-3">

                    <div className="rounded-[24px] border border-white/80 bg-white/45 p-5 shadow-[0_12px_35px_rgba(91,139,190,0.08)] backdrop-blur-2xl sm:p-6">
                        <p className="text-xs tracking-[0.16em] text-[#8BAACD]">
                            DOKTER TERSEDIA
                        </p>

                        <div className="mt-3 flex items-end justify-between">
                            <p className="text-3xl font-semibold text-[#315B86]">
                                {loading ? "—" : daftarDokter.length}
                            </p>

                            <span className="text-xs text-[#8BAACD]">
                                dokter
                            </span>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-white/80 bg-white/45 p-5 shadow-[0_12px_35px_rgba(91,139,190,0.08)] backdrop-blur-2xl sm:p-6">
                        <p className="text-xs tracking-[0.16em] text-[#8BAACD]">
                            JADWAL PRAKTIK
                        </p>

                        <div className="mt-3 flex items-end justify-between">
                            <p className="text-3xl font-semibold text-[#315B86]">
                                {loading ? "—" : jumlahJadwal}
                            </p>

                            <span className="text-xs text-[#8BAACD]">
                                jadwal
                            </span>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-white/80 bg-white/45 p-5 shadow-[0_12px_35px_rgba(91,139,190,0.08)] backdrop-blur-2xl sm:p-6">
                        <p className="text-xs tracking-[0.16em] text-[#8BAACD]">
                            PILIHAN POLI
                        </p>

                        <div className="mt-3 flex items-end justify-between">
                            <p className="text-3xl font-semibold text-[#315B86]">
                                {loading ? "—" : daftarPoli.length - 1}
                            </p>

                            <span className="text-xs text-[#8BAACD]">
                                spesialisasi
                            </span>
                        </div>
                    </div>

                </div>

            </section>

            {/* DOCTOR DIRECTORY */}

            <section className="mx-auto max-w-[1440px] px-6 pb-16 sm:px-10 lg:px-16">

                <div className="overflow-hidden rounded-[30px] border border-white/80 bg-white/40 shadow-[0_25px_80px_rgba(78,127,180,0.12)] backdrop-blur-2xl">

                    {/* DIRECTORY HEADER */}

                    <div className="flex flex-col gap-6 border-b border-white/80 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">

                        <div>
                            <p className="text-[11px] tracking-[0.25em] text-[#8BAACD]">
                                06 — DIRECTORY
                            </p>

                            <h2 className="mt-3 text-2xl font-medium tracking-tight text-[#315B86] sm:text-3xl">
                                Daftar dokter
                            </h2>

                            <p className="mt-2 text-sm text-[#7B9FC5] sm:text-base">
                                Pilih dokter dan jadwal konsultasimu.
                            </p>
                        </div>

                        <div className="rounded-full border border-white/80 bg-white/55 px-5 py-3 text-sm text-[#5E8BBE]">
                            {loading
                                ? "Memuat direktori..."
                                : `${dokterTampil.length} dokter ditampilkan`}
                        </div>

                    </div>

                    {/* FILTERS */}

                    <div className="grid gap-4 border-b border-white/70 p-6 sm:p-8 md:grid-cols-[1fr_240px]">

                        <div className="relative">
                            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#8BAACD]">
                                /
                            </span>

                            <input
                                type="text"
                                value={pencarian}
                                onChange={(e) => setPencarian(e.target.value)}
                                placeholder="Cari nama dokter atau poli..."
                                className="w-full rounded-2xl border border-white/90 bg-white/60 py-4 pl-11 pr-5 text-sm text-[#315B86] outline-none transition placeholder:text-[#9AB5D3] focus:border-[#A9CBEF] focus:bg-white/80 focus:ring-4 focus:ring-[#C7DFF8]/40"
                            />
                        </div>

                        <select
                            value={poliDipilih}
                            onChange={(e) => setPoliDipilih(e.target.value)}
                            className="w-full rounded-2xl border border-white/90 bg-white/60 px-5 py-4 text-sm text-[#4779AD] outline-none transition focus:border-[#A9CBEF] focus:ring-4 focus:ring-[#C7DFF8]/40"
                        >
                            {daftarPoli.map((poli) => (
                                <option key={poli} value={poli}>
                                    {poli}
                                </option>
                            ))}
                        </select>

                    </div>

                    {/* DOCTOR CARDS */}

                    <div className="px-7 py-8 sm:px-10 sm:py-10">

                        {loading ? (
                            <div className="rounded-2xl border border-white/80 bg-white/50 px-6 py-16 text-center">
                                <p className="text-sm text-[#7B9FC5]">
                                    Memuat daftar dokter dan jadwal praktik...
                                </p>
                            </div>
                        ) : pesan && jadwal.length === 0 ? (
                            <div className="rounded-2xl border border-white/80 bg-white/50 px-6 py-16 text-center">
                                <p className="text-sm text-[#7B9FC5]">
                                    {pesan}
                                </p>

                                <button
                                    onClick={ambilJadwal}
                                    className="mt-5 rounded-full bg-[#477DB5] px-6 py-3 text-sm text-white transition hover:bg-[#315B86]"
                                >
                                    Coba lagi
                                </button>
                            </div>
                        ) : dokterTampil.length === 0 ? (
                            <div className="rounded-2xl border border-white/80 bg-white/50 px-6 py-16 text-center">
                                <p className="text-lg font-medium text-[#4779AD]">
                                    Dokter tidak ditemukan.
                                </p>

                                <p className="mt-2 text-sm text-[#8BAACD]">
                                    Coba gunakan nama atau poli yang berbeda.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                                {dokterTampil.map((dokter, index) => (
                                    <article
                                        key={dokter.id}
                                        className="group relative flex flex-col overflow-hidden rounded-[26px] border border-white/90 bg-gradient-to-br from-white/80 via-white/55 to-[#E4F1FF]/65 p-5 shadow-[0_14px_35px_rgba(91,139,190,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(91,139,190,0.16)] sm:p-6"
                                    >

                                        {/* CARD NUMBER */}

                                        <div className="pointer-events-none absolute right-5 top-4 text-5xl font-semibold tracking-[-0.08em] text-[#D5E7F9]/70">
                                            {String(index + 1).padStart(2, "0")}
                                        </div>

                                        {/* DOCTOR PROFILE */}

                                        <div className="relative flex items-center gap-4">

                                            <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-white/90 bg-gradient-to-br from-[#F8FBFF] to-[#DCEBFA] shadow-[0_8px_22px_rgba(91,139,190,0.12)]">

                                                {dokter.foto ? (
                                                    <img
                                                        src={dokter.foto}
                                                        alt={dokter.nama}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl font-medium text-[#6C9ACB]">
                                                        {dokter.nama
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "D"}
                                                    </span>
                                                )}

                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[10px] tracking-[0.18em] text-[#8BAACD]">
                                                    MEDICAL SPECIALIST
                                                </p>

                                                <h3 className="mt-1 break-words text-lg font-semibold leading-snug text-[#315B86]">
                                                    {dokter.nama}
                                                </h3>

                                                <p className="mt-1 text-sm text-[#7B9FC5]">
                                                    {dokter.poli || "Poli belum tersedia"}
                                                </p>
                                            </div>

                                        </div>

                                        {/* DIVIDER */}

                                        <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#C8DDF3] to-transparent" />

                                        {/* SCHEDULE */}

                                        <div className="flex-1">

                                            <div className="mb-4 flex items-center justify-between">
                                                <p className="text-xs font-semibold tracking-[0.16em] text-[#6D97C3]">
                                                    PRACTICE SCHEDULE
                                                </p>

                                                <span className="rounded-full bg-[#E3F0FC] px-3 py-1 text-[10px] text-[#6D97C3]">
                                                    {dokter.jadwal.length} jadwal
                                                </span>
                                            </div>

                                            <div className="space-y-3">

                                                {dokter.jadwal.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="rounded-[17px] border border-white/80 bg-white/55 p-4 transition group-hover:bg-white/75"
                                                    >

                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="font-medium text-[#315B86]">
                                                                {daftarHari[Number(item.hari)] || "-"}
                                                            </p>

                                                            <p className="text-sm font-semibold text-[#6D97C3]">
                                                                {formatJam(item.jam_mulai)}
                                                            </p>
                                                        </div>

                                                        <div className="mt-2 flex items-center justify-between text-xs text-[#91ADCA]">
                                                            <span>
                                                                Durasi konsultasi
                                                            </span>

                                                            <span>
                                                                {item.durasi || 30} menit
                                                            </span>
                                                        </div>

                                                    </div>
                                                ))}

                                            </div>

                                        </div>

                                        {/* BOOKING BUTTON */}

                                        <button
                                            onClick={() => bukaForm(dokter)}
                                            className="mt-6 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#315B86] to-[#6D9FD2] px-5 py-4 text-sm font-medium text-white shadow-[0_10px_25px_rgba(73,126,181,0.2)] transition hover:from-[#274D75] hover:to-[#5C91C8] focus:outline-none focus:ring-4 focus:ring-[#C7DFF8]"
                                        >
                                            <span>Pesan janji temu</span>

                                            <span className="text-lg transition group-hover:translate-x-1">
                                                →
                                            </span>
                                        </button>

                                    </article>
                                ))}

                            </div>
                        )}

                    </div>

                </div>

                {/* FOOTER */}

                <footer className="mt-10 flex flex-col gap-4 border-t border-white/70 py-6 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <p className="text-xs tracking-[0.2em] text-[#6D97C3]">
                            HARMONI
                        </p>

                        <p className="mt-1 text-[11px] text-[#9AB5D3]">
                            Hospital Information System
                        </p>
                    </div>

                    <p className="text-xs text-[#8BAACD]">
                        A healthier journey, one step at a time.
                    </p>

                </footer>

            </section>

            {/* BOOKING MODAL */}

            {dokterDipilih && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1D3D60]/35 p-4 backdrop-blur-md"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            tutupForm();
                        }
                    }}
                >

                    <div className="my-6 w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/90 bg-gradient-to-br from-[#F9FCFF] via-[#F1F7FF] to-[#E0EEFF] shadow-[0_35px_100px_rgba(36,76,119,0.3)] sm:my-8" style={{ maxHeight: "calc(100vh - 3rem)" }}>

                        {/* MODAL HEADER */}

                        <div className="relative border-b border-white/80 px-7 py-8 sm:px-10 sm:py-9">

                            <div className="absolute right-6 top-5 text-6xl font-semibold tracking-[-0.08em] text-[#D6E8FA]/70">
                                06
                            </div>

                            <div className="relative">
                                <p className="text-[10px] tracking-[0.25em] text-[#8BAACD]">
                                    APPOINTMENT REQUEST
                                </p>

                                <h2 className="mt-3 text-2xl font-medium text-[#315B86]">
                                    Pesan janji temu
                                </h2>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-[#7B9FC5]">
                                    Lengkapi detail kunjungan untuk
                                    melanjutkan pendaftaran.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={tutupForm}
                                disabled={menyimpan}
                                aria-label="Tutup formulir"
                                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/90 bg-white/60 text-lg text-[#6D97C3] transition hover:bg-white disabled:opacity-50"
                            >
                                ×
                            </button>

                        </div>

                        {/* MODAL BODY */}

                        <div className="px-7 py-8 sm:px-10 sm:py-10">

                            <div className="mb-8 flex items-center gap-5 rounded-2xl border border-white/90 bg-white/60 p-5 sm:p-6">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#DCEBFA]">
                                    {dokterDipilih.foto ? (
                                        <img
                                            src={dokterDipilih.foto}
                                            alt={dokterDipilih.nama}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="font-medium text-[#6D97C3]">
                                            {dokterDipilih.nama
                                                ?.charAt(0)
                                                ?.toUpperCase() || "D"}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <p className="font-semibold text-[#315B86]">
                                        {dokterDipilih.nama}
                                    </p>

                                    <p className="mt-1 text-sm text-[#7B9FC5]">
                                        {dokterDipilih.poli}
                                    </p>
                                </div>

                            </div>

                            {pesan && (
                                <div
                                    className={`mb-5 rounded-xl border px-4 py-3 text-sm ${berhasil
                                        ? "border-[#B9E4D3] bg-[#E7F8F0] text-[#347D65]"
                                        : "border-[#F2C7CE] bg-[#FFF0F2] text-[#B44E61]"
                                        }`}
                                >
                                    {pesan}
                                </div>
                            )}

                            {!berhasil && (
                                <form
                                    onSubmit={daftarJanjiTemu}
                                    className="space-y-7"
                                >

                                    {/* SCHEDULE */}

                                    <div>
                                        <label className="mb-3 block text-xs font-semibold tracking-[0.12em] text-[#527DA8]">
                                            JADWAL PRAKTIK
                                        </label>

                                        <select
                                            name="schedule_id"
                                            value={form.schedule_id}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-2xl border border-white/90 bg-white/75 px-5 py-5 text-base text-[#315B86] outline-none transition focus:border-[#A9CBEF] focus:ring-4 focus:ring-[#C7DFF8]/40"
                                        >
                                            {dokterDipilih.jadwal.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {daftarHari[Number(item.hari)] || "-"}{" "}
                                                    — {formatJam(item.jam_mulai)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* DATE */}

                                    <div>
                                        <label className="mb-3 block text-xs font-semibold tracking-[0.12em] text-[#527DA8]">
                                            TANGGAL KUNJUNGAN
                                        </label>

                                        <div className="relative">
                                            <button
                                                type="button"
                                                disabled={!jadwalTerpilih || tanggalTersedia.length === 0}
                                                onClick={() => setTanggalPickerTerbuka((terbuka) => !terbuka)}
                                                className={`flex w-full items-center justify-between rounded-2xl border px-5 py-5 text-left transition focus:outline-none focus:ring-4 focus:ring-[#C7DFF8]/45 disabled:cursor-not-allowed disabled:opacity-60 ${form.tanggal_booking
                                                    ? "border-[#A9CBEF] bg-white"
                                                    : "border-white/90 bg-white/70 hover:border-[#B9D5F4] hover:bg-white/90"
                                                    }`}
                                            >
                                                <span className={form.tanggal_booking ? "text-base font-medium text-[#315B86]" : "text-base text-[#8AAACD]"}>
                                                    {form.tanggal_booking
                                                        ? formatTanggal(form.tanggal_booking)
                                                        : jadwalTerpilih
                                                            ? "Pilih tanggal kunjungan"
                                                            : "Pilih jadwal praktik terlebih dahulu"}
                                                </span>
                                                <span className={`ml-3 text-[#6D97C3] transition-transform ${tanggalPickerTerbuka ? "rotate-180" : ""}`}>
                                                    ▾
                                                </span>
                                            </button>

                                            {tanggalPickerTerbuka && jadwalTerpilih && (
                                                <div className="mt-5 overflow-hidden rounded-[24px] border border-[#D7E7F7] bg-white/90 p-5 shadow-[0_12px_32px_rgba(63,112,165,0.10)] sm:p-6">
                                                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#315B86]">Tanggal tersedia</p>
                                                            <p className="mt-1 text-[11px] text-[#91ADCA]">Khusus hari praktik {daftarHari[Number(jadwalTerpilih.hari)]}</p>
                                                        </div>
                                                        <span className="rounded-full bg-[#EEF6FF] px-3 py-1 text-[10px] font-medium text-[#6D97C3]">{tanggalTersedia.length} tanggal</span>
                                                    </div>

                                                    <div className="grid max-h-72 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 sm:gap-4">
                                                        {tanggalTersedia.map((tanggal) => {
                                                            const bagianTanggal = tanggal.label.split(", ");
                                                            const aktif = form.tanggal_booking === tanggal.value;

                                                            return (
                                                                <button
                                                                    key={tanggal.value}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setForm((sebelumnya) => ({ ...sebelumnya, tanggal_booking: tanggal.value }));
                                                                        setTanggalPickerTerbuka(false);
                                                                        setPesan("");
                                                                        setBerhasil(false);
                                                                    }}
                                                                    className={`min-h-[96px] rounded-2xl border px-4 py-4 text-left transition sm:px-5 sm:py-5 ${aktif
                                                                        ? "border-[#5E98D2] bg-gradient-to-br from-[#477DB5] to-[#78A9D8] text-white shadow-[0_6px_15px_rgba(73,126,181,0.2)]"
                                                                        : "border-[#E4EEF9] bg-[#F7FAFE] text-[#4779AD] hover:border-[#B8D5F0] hover:bg-[#EDF6FF]"
                                                                        }`}
                                                                >
                                                                    <span className={`block text-[11px] uppercase tracking-[0.12em] ${aktif ? "text-white/80" : "text-[#8BAACD]"}`}>{bagianTanggal[0]}</span>
                                                                    <span className="mt-2 block text-sm font-semibold leading-6 sm:text-base">{bagianTanggal[1]}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <p className="mt-4 text-sm leading-6 text-[#8BAACD]">
                                            Tanggal yang tersedia mengikuti hari praktik dokter dan dapat dipilih untuk 90 hari ke depan.
                                        </p>
                                    </div>

                                    {/* COMPLAINT */}

                                    <div>
                                        <label className="mb-3 block text-xs font-semibold tracking-[0.12em] text-[#527DA8]">
                                            KELUHAN
                                        </label>

                                        <textarea
                                            name="keluhan"
                                            value={form.keluhan}
                                            onChange={handleChange}
                                            rows={5}
                                            required
                                            placeholder="Ceritakan keluhan yang sedang kamu rasakan..."
                                            className="w-full resize-none rounded-2xl border border-white/90 bg-white/75 px-5 py-5 text-base leading-7 text-[#315B86] outline-none transition placeholder:text-[#A0B9D3] focus:border-[#A9CBEF] focus:ring-4 focus:ring-[#C7DFF8]/40"
                                        />
                                    </div>

                                    {/* SUBMIT */}

                                    <button
                                        type="submit"
                                        disabled={menyimpan}
                                        className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#315B86] to-[#6D9FD2] px-6 py-5 text-base font-medium text-white shadow-[0_12px_28px_rgba(73,126,181,0.2)] transition hover:from-[#274D75] hover:to-[#5C91C8] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <span>
                                            {menyimpan
                                                ? "Mengirim pendaftaran..."
                                                : "Konfirmasi janji temu"}
                                        </span>

                                        <span className="text-lg">
                                            →
                                        </span>
                                    </button>

                                </form>
                            )}

                            {berhasil && (
                                <button
                                    type="button"
                                    onClick={tutupForm}
                                    className="w-full rounded-2xl bg-gradient-to-r from-[#315B86] to-[#6D9FD2] px-5 py-4 text-sm font-medium text-white shadow-[0_12px_28px_rgba(73,126,181,0.2)] transition hover:from-[#274D75] hover:to-[#5C91C8]"
                                >
                                    Kembali ke daftar dokter
                                </button>
                            )}

                        </div>

                    </div>

                </div>
            )}

        </main>
    );
}