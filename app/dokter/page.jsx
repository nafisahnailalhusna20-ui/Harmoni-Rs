"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DokterPage() {
    const router = useRouter();

    const [dokter, setDokter] = useState(null);
    const [dashboard, setDashboard] = useState({
        total_pending: 0,
        approved_hari_ini: 0,
        pasien_terbaru: [],
        jadwal_praktik: []
    });

    const [loading, setLoading] = useState(true);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [pesanError, setPesanError] = useState("");

    useEffect(() => {
        async function ambilData() {
            try {
                // Mengambil data dokter yang sedang login
                const responseMe = await fetch("/api/me");
                const dataMe = await responseMe.json();

                if (!responseMe.ok || !dataMe.success) {
                    router.push("/login");
                    return;
                }

                if (dataMe.user.role !== "dokter") {
                    router.push("/login");
                    return;
                }

                setDokter(dataMe.user);

                // Mengambil data dashboard dokter
                const responseDashboard = await fetch(
                    "/api/dokter/dashboard"
                );

                const dataDashboard = await responseDashboard.json();

                if (!responseDashboard.ok || !dataDashboard.success) {
                    setPesanError(
                        dataDashboard.message ||
                        "Data dashboard gagal dimuat."
                    );
                    return;
                }

                setDashboard(dataDashboard.data);

            } catch (error) {
                console.error("Gagal mengambil data dashboard:", error);
                setPesanError("Terjadi kesalahan saat memuat dashboard.");
            } finally {
                setLoading(false);
                setLoadingDashboard(false);
            }
        }

        ambilData();
    }, [router]);

    async function logout() {
        try {
            await fetch("/api/logout", {
                method: "POST"
            });
        } finally {
            router.push("/login");
        }
    }

    function formatTanggal(tanggal) {
        if (!tanggal) return "-";

        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    function formatJam(jam) {
        if (!jam) return "-";

        return String(jam).slice(0, 5);
    }

    function namaHari(hari) {
        const daftarHari = [
            "",
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
            "Sabtu",
            "Minggu"
        ];

        return daftarHari[Number(hari)] || "-";
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E8F0EC] text-[#397A63]">
                Memuat dashboard...
            </div>
        );
    }

    if (!dokter) return null;

    return (
        <main className="min-h-screen bg-[#E8F0EC] p-6 md:p-10">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#263D34]">
                            Dashboard Dokter
                        </h1>

                        <p className="text-[#64776D] mt-2">
                            Selamat datang, {dokter.username}.
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className="bg-red-100 text-red-600 px-5 py-2 rounded-xl hover:bg-red-200"
                    >
                        Logout
                    </button>
                </div>

                {/* Sambutan */}
                <div className="mt-8 bg-white/70 border border-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[#263D34]">
                        Halo, Dokter!
                    </h2>

                    <p className="text-[#64776D] mt-2">
                        Selamat bekerja. Kelola konsultasi dan rekam medis
                        pasien melalui dashboard ini.
                    </p>
                </div>

                {/* Pesan error */}
                {pesanError && (
                    <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-xl">
                        {pesanError}
                    </div>
                )}

                {/* Statistik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">

                    <div className="bg-white/70 border border-white rounded-2xl p-6 shadow-sm">
                        <p className="text-sm text-[#64776D]">
                            Janji Temu Menunggu
                        </p>

                        <h2 className="text-4xl font-bold text-[#397A63] mt-3">
                            {loadingDashboard
                                ? "..."
                                : dashboard.total_pending}
                        </h2>

                        <p className="text-sm text-[#64776D] mt-2">
                            Permintaan yang belum divalidasi
                        </p>
                    </div>

                    <div className="bg-white/70 border border-white rounded-2xl p-6 shadow-sm">
                        <p className="text-sm text-[#64776D]">
                            Janji Temu Hari Ini
                        </p>

                        <h2 className="text-4xl font-bold text-[#397A63] mt-3">
                            {loadingDashboard
                                ? "..."
                                : dashboard.approved_hari_ini}
                        </h2>

                        <p className="text-sm text-[#64776D] mt-2">
                            Janji temu yang sudah disetujui
                        </p>
                    </div>

                </div>

                {/* Menu utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                    <div className="bg-white/70 rounded-2xl p-6 shadow-sm border border-white">
                        <h3 className="text-lg font-semibold text-[#263D34]">
                            Janji Temu Pasien
                        </h3>

                        <p className="text-sm text-[#64776D] mt-2">
                            Lihat dan validasi janji temu pasien yang masuk.
                        </p>

                        <button
                            onClick={() => router.push("/dokter/janji-temu")}
                            className="mt-5 bg-[#397A63] text-white px-5 py-2 rounded-xl hover:bg-[#2e6551]"
                        >
                            Lihat Janji Temu
                        </button>
                    </div>

                    <div className="bg-white/70 rounded-2xl p-6 shadow-sm border border-white">
                        <h3 className="text-lg font-semibold text-[#263D34]">
                            Rekam Medis
                        </h3>

                        <p className="text-sm text-[#64776D] mt-2">
                            Catat hasil pemeriksaan, diagnosis, tindakan,
                            dan resep obat pasien.
                        </p>

                        <button
                            onClick={() => router.push("/dokter/rekam-medis")}
                            className="mt-5 bg-[#397A63] text-white px-5 py-2 rounded-xl hover:bg-[#2e6551]"
                        >
                            Buka Rekam Medis
                        </button>
                    </div>

                </div>

                {/* Jadwal Praktik */}
                <div className="mt-8 bg-white/70 border border-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[#263D34] mb-5">
                        Jadwal Praktik
                    </h2>

                    {loadingDashboard ? (
                        <p className="text-[#64776D]">
                            Memuat jadwal praktik...
                        </p>
                    ) : dashboard.jadwal_praktik.length === 0 ? (
                        <p className="text-[#64776D]">
                            Belum ada jadwal praktik.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[#397A63] border-b border-[#D5E4DA]">
                                        <th className="py-3 pr-4">Hari</th>
                                        <th className="py-3 pr-4">Jam</th>
                                        <th className="py-3 pr-4">Durasi</th>
                                        <th className="py-3">Poli</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dashboard.jadwal_praktik.map((jadwal) => (
                                        <tr
                                            key={jadwal.id}
                                            className="border-b border-[#E2EAE5] text-[#263D34]"
                                        >
                                            <td className="py-3 pr-4">
                                                {namaHari(jadwal.hari)}
                                            </td>

                                            <td className="py-3 pr-4">
                                                {formatJam(jadwal.jam_mulai)}
                                            </td>

                                            <td className="py-3 pr-4">
                                                {jadwal.durasi} menit
                                            </td>

                                            <td className="py-3">
                                                {jadwal.nama_poli || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pasien Terbaru */}
                <div className="mt-8 bg-white/70 border border-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[#263D34] mb-5">
                        Pasien Terakhir Diperiksa
                    </h2>
                    {loadingDashboard ? (
                        <p className="text-[#64776D]">
                            Memuat data pasien...
                        </p>
                    ) : dashboard.pasien_terbaru.length === 0 ? (
                        <p className="text-[#64776D]">
                            Belum ada pasien yang diperiksa.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[#397A63] border-b border-[#D5E4DA]">
                                        <th className="py-3 pr-4">Nama Pasien</th>
                                        <th className="py-3 pr-4">Tanggal Pemeriksaan</th>
                                        <th className="py-3">Diagnosis</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dashboard.pasien_terbaru.map((pasien) => (
                                        <tr
                                            key={pasien.medical_record_id}
                                            className="border-b border-[#E2EAE5] text-[#263D34]"
                                        >
                                            <td className="py-3 pr-4">
                                                {pasien.nama_pasien}
                                            </td>

                                            <td className="py-3 pr-4">
                                                {formatTanggal(
                                                    pasien.tanggal_pemeriksaan
                                                )}
                                            </td>

                                            <td className="py-3">
                                                {pasien.diagnosis}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}