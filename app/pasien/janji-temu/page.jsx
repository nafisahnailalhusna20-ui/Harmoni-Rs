"use client";

import { useEffect, useState } from "react";

const namaHari = [
    "Minggu", "Senin", "Selasa", "Rabu",
    "Kamis", "Jumat", "Sabtu"
];

const namaBulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

function buatTanggal(tanggal) {
    const [tahun, bulan, hari] = tanggal.split("-").map(Number);
    return new Date(tahun, bulan - 1, hari);
}

function formatTanggal(tanggal) {
    const date = buatTanggal(tanggal);
    return `${date.getDate()} ${[
        "Januari", "Februari", "Maret", "April",
        "Mei", "Juni", "Juli", "Agustus",
        "September", "Oktober", "November", "Desember"
    ][date.getMonth()]} ${date.getFullYear()}`;
}

function formatTanggalSingkat(tanggal) {
    const date = buatTanggal(tanggal);
    return `${namaHari[date.getDay()].slice(0, 3)}, ${date.getDate()} ${namaBulan[date.getMonth()]}`;
}

function formatJam(jam) {
    return String(jam).slice(0, 5);
}

function tambahMenit(jam, menit) {
    const [jamAngka, menitAngka] = jam.split(":").map(Number);
    const total = jamAngka * 60 + menitAngka + menit;

    const hasilJam = Math.floor(total / 60) % 24;
    const hasilMenit = total % 60;

    return `${String(hasilJam).padStart(2, "0")}:${String(hasilMenit).padStart(2, "0")}`;
}

export default function JanjiTemuPage() {
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [poliDipilih, setPoliDipilih] = useState("Semua Poli");

    const [dokterDipilih, setDokterDipilih] = useState(null);
    const [tanggalDipilih, setTanggalDipilih] = useState("");
    const [scheduleId, setScheduleId] = useState("");
    const [keluhan, setKeluhan] = useState("");

    const [tampilkanSemuaTanggal, setTampilkanSemuaTanggal] = useState(false);
    const [menyimpan, setMenyimpan] = useState(false);
    const [pesan, setPesan] = useState("");
    const [berhasil, setBerhasil] = useState(false);

    useEffect(() => {
        ambilJadwal();
    }, []);

    async function ambilJadwal() {
        try {
            const response = await fetch("/api/pasien/janji-temu");
            const data = await response.json();

            if (response.ok && data.success) {
                setJadwal(data.data);
            } else {
                setPesan(data.message || "Jadwal gagal dimuat.");
            }
        } catch (error) {
            setPesan("Terjadi kesalahan saat mengambil jadwal.");
        } finally {
            setLoading(false);
        }
    }

    const daftarPoli = [
        "Semua Poli",
        ...new Set(jadwal.map((item) => item.nama_poli).filter(Boolean))
    ];

    const jadwalFilter = jadwal.filter((item) =>
        poliDipilih === "Semua Poli" ||
        item.nama_poli === poliDipilih
    );

    const daftarDokter = Object.values(
        jadwalFilter.reduce((hasil, item) => {
            if (!hasil[item.dokter_id]) {
                hasil[item.dokter_id] = {
                    id: item.dokter_id,
                    nama: item.nama_dokter,
                    poli: item.nama_poli,
                    jadwal: []
                };
            }

            hasil[item.dokter_id].jadwal.push(item);

            return hasil;
        }, {})
    );

    function daftarTanggal(dokter) {
        const semuaTanggal = dokter.jadwal.flatMap((item) => {
            return item.tanggal_tersedia || [];
        });

        return [...new Set(semuaTanggal)].sort();
    }

    function bukaPemesanan(dokter) {
        const tanggal = daftarTanggal(dokter);

        setDokterDipilih(dokter);
        setTanggalDipilih(tanggal[0] || "");
        setScheduleId("");
        setKeluhan("");
        setPesan("");
        setBerhasil(false);
        setTampilkanSemuaTanggal(false);
    }

    const jadwalTersedia = dokterDipilih
        ? dokterDipilih.jadwal.filter((item) =>
            (item.tanggal_tersedia || []).includes(tanggalDipilih)
        )
        : [];

    const jadwalTerpilih = jadwalTersedia.find(
        (item) => String(item.id) === String(scheduleId)
    );

    function pilihTanggal(tanggal) {
        setTanggalDipilih(tanggal);
        setScheduleId("");
        setPesan("");
    }

    async function pesanJanjiTemu(e) {
        e.preventDefault();

        if (!tanggalDipilih || !scheduleId || !keluhan.trim()) {
            setPesan("Lengkapi tanggal, waktu, dan keluhan terlebih dahulu.");
            return;
        }

        setMenyimpan(true);
        setPesan("");

        try {
            const response = await fetch("/api/pasien/janji-temu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    schedule_id: Number(scheduleId),
                    tanggal_booking: tanggalDipilih,
                    keluhan: keluhan
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Pemesanan gagal.");
                return;
            }

            setBerhasil(true);
            setPesan("Janji temu berhasil didaftarkan.");

            await ambilJadwal();

        } catch (error) {
            setPesan("Terjadi kesalahan saat mendaftar.");
        } finally {
            setMenyimpan(false);
        }
    }

    const hariIni = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Makassar",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());

    return (
        <main className="min-h-screen bg-[#E8F0EC] px-5 py-10">
            <div className="mx-auto max-w-7xl">

                <div className="mb-8">
                    <p className="text-sm font-semibold text-[#397A63]">
                        HARMONI HEALTHCARE
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[#263D34]">
                        Cari Dokter
                    </h1>

                    <p className="mt-2 text-[#64776D]">
                        Temukan dokter dan pilih jadwal konsultasi yang sesuai.
                    </p>
                </div>

                <div className="mb-8 flex flex-wrap items-center gap-3">
                    <label className="font-medium text-[#263D34]">
                        Pilih Poli:
                    </label>

                    <select
                        value={poliDipilih}
                        onChange={(e) => setPoliDipilih(e.target.value)}
                        className="rounded-xl border border-[#C8D8CF] bg-white px-4 py-3 text-[#263D34] outline-none"
                    >
                        {daftarPoli.map((poli) => (
                            <option key={poli} value={poli}>
                                {poli}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="rounded-2xl bg-white p-10 text-center text-[#64776D]">
                        Memuat daftar dokter...
                    </div>
                ) : daftarDokter.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center text-[#64776D]">
                        Belum ada dokter dengan jadwal praktik tersedia.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {daftarDokter.map((dokter) => (
                            <div
                                key={dokter.id}
                                className="rounded-2xl border border-white bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DCEBE3] text-2xl font-bold text-[#397A63]">
                                        {dokter.nama?.charAt(0)?.toUpperCase()}
                                    </div>

                                    <div>
                                        <p className="text-sm text-[#81948A]">
                                            Dokter
                                        </p>

                                        <h2 className="text-lg font-bold text-[#263D34]">
                                            {dokter.nama}
                                        </h2>

                                        <p className="text-sm text-[#64776D]">
                                            {dokter.poli}
                                        </p>
                                    </div>
                                </div>

                                <div className="my-5 border-t border-[#DCE5DF]" />

                                <h3 className="mb-3 font-semibold text-[#263D34]">
                                    Jadwal Praktik
                                </h3>

                                <div className="space-y-2">
                                    {dokter.jadwal.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between rounded-lg bg-[#F0F6F2] px-3 py-2 text-sm"
                                        >
                                            <span className="text-[#64776D]">
                                                {namaHari[Number(item.hari)]}
                                            </span>

                                            <span className="font-medium text-[#397A63]">
                                                {formatJam(item.jam_mulai)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => bukaPemesanan(dokter)}
                                    className="mt-6 w-full rounded-xl bg-[#397A63] px-4 py-3 font-semibold text-white transition hover:bg-[#2E6551]"
                                >
                                    Lihat Jadwal & Pesan
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {dokterDipilih && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
                    <div className="my-6 w-full max-w-xl rounded-2xl bg-[#F7FAF8] p-6 shadow-2xl">

                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-[#263D34]">
                                    Jadwal & Buat Janji Temu
                                </h2>

                                <p className="mt-1 text-sm text-[#64776D]">
                                    {dokterDipilih.nama} - {dokterDipilih.poli}
                                </p>
                            </div>

                            <button
                                onClick={() => setDokterDipilih(null)}
                                className="text-2xl text-[#64776D]"
                            >
                                ×
                            </button>
                        </div>

                        {berhasil ? (
                            <div className="py-8 text-center">
                                <h3 className="text-xl font-bold text-[#397A63]">
                                    Janji Temu Berhasil
                                </h3>

                                <p className="mt-3 text-[#64776D]">
                                    {pesan}
                                </p>

                                <button
                                    onClick={() => setDokterDipilih(null)}
                                    className="mt-6 rounded-xl bg-[#397A63] px-8 py-3 font-semibold text-white"
                                >
                                    Selesai
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={pesanJanjiTemu}>

                                <div className="mb-6">
                                    <h3 className="mb-3 font-semibold text-[#263D34]">
                                        Pilih Tanggal
                                    </h3>

                                    <div className="flex flex-wrap gap-3">
                                        {daftarTanggal(dokterDipilih)
                                            .slice(
                                                0,
                                                tampilkanSemuaTanggal ? undefined : 6
                                            )
                                            .map((tanggal) => (
                                                <button
                                                    type="button"
                                                    key={tanggal}
                                                    onClick={() => pilihTanggal(tanggal)}
                                                    className={`rounded-full border px-4 py-2 text-sm transition ${tanggalDipilih === tanggal
                                                            ? "border-[#397A63] bg-[#397A63] text-white"
                                                            : "border-[#397A63] text-[#397A63] hover:bg-[#E1EEE7]"
                                                        }`}
                                                >
                                                    {tanggal === hariIni
                                                        ? "Hari Ini"
                                                        : formatTanggalSingkat(tanggal)}
                                                </button>
                                            ))}

                                        {daftarTanggal(dokterDipilih).length > 6 && (
                                            <button
                                                type="button"
                                                onClick={() => setTampilkanSemuaTanggal(!tampilkanSemuaTanggal)}
                                                className="rounded-full border border-[#263D8A] px-4 py-2 text-sm text-[#263D8A]"
                                            >
                                                {tampilkanSemuaTanggal ? "Tutup" : "Lainnya"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <label className="mb-2 block font-medium text-[#263D34]">
                                        Waktu
                                    </label>

                                    <select
                                        value={scheduleId}
                                        onChange={(e) => setScheduleId(e.target.value)}
                                        required
                                        disabled={!tanggalDipilih || jadwalTersedia.length === 0}
                                        className="w-full rounded-lg border border-[#C8D8CF] bg-white p-4 text-[#263D34] outline-none focus:border-[#397A63]"
                                    >
                                        <option value="">
                                            Pilih waktu konsultasi
                                        </option>

                                        {jadwalTersedia.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {formatJam(item.jam_mulai)} - {tambahMenit(formatJam(item.jam_mulai), Number(item.durasi || 30))}
                                            </option>
                                        ))}
                                    </select>

                                    <p className="mt-2 text-sm text-[#64776D]">
                                        Setiap sesi konsultasi berlangsung selama 30 menit.
                                    </p>
                                </div>

                                <div className="mb-5">
                                    <label className="mb-2 block font-medium text-[#263D34]">
                                        Keluhan
                                    </label>

                                    <textarea
                                        value={keluhan}
                                        onChange={(e) => setKeluhan(e.target.value)}
                                        rows="4"
                                        required
                                        placeholder="Ceritakan keluhan yang sedang Anda rasakan..."
                                        className="w-full rounded-lg border border-[#C8D8CF] bg-white p-4 text-[#263D34] outline-none focus:border-[#397A63]"
                                    />
                                </div>

                                {pesan && (
                                    <p className="mb-4 text-sm text-red-600">
                                        {pesan}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={menyimpan || !jadwalTerpilih}
                                    className="w-full rounded-xl bg-[#397A63] p-4 font-semibold text-white transition hover:bg-[#2E6551] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {menyimpan ? "Memproses..." : "Pesan Janji Temu"}
                                </button>

                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}