"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RekamMedisPage() {
    const router = useRouter();

    const [pasien, setPasien] = useState([]);
    const [daftarObat, setDaftarObat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pasienDipilih, setPasienDipilih] = useState(null);
    const [pesan, setPesan] = useState("");
    const [loadingSimpan, setLoadingSimpan] = useState(false);

    const [form, setForm] = useState({
        diagnosis: "",
        tindakan: "",
        catatan: ""
    });

    const [resep, setResep] = useState([
        { obat_id: "", jumlah: 1 }
    ]);

    async function ambilData() {
        try {
            const response = await fetch("/api/dokter/rekam-medis");
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    router.push("/login");
                    return;
                }

                setPesan(data.message || "Data gagal dimuat.");
                return;
            }

            setPasien(data.data || []);
            setDaftarObat(data.medicines || []);

        } catch (error) {
            setPesan("Terjadi kesalahan saat mengambil data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilData();
    }, []);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    function bukaForm(item) {
        setPasienDipilih(item);

        setForm({
            diagnosis: "",
            tindakan: "",
            catatan: ""
        });

        setResep([
            { obat_id: "", jumlah: 1 }
        ]);

        setPesan("");
    }

    function tutupForm() {
        setPasienDipilih(null);
        setPesan("");
    }

    function tambahObat() {
        setResep([
            ...resep,
            { obat_id: "", jumlah: 1 }
        ]);
    }

    function hapusObat(index) {
        setResep(resep.filter((item, i) => i !== index));
    }

    function ubahResep(index, field, value) {
        const dataBaru = [...resep];

        dataBaru[index] = {
            ...dataBaru[index],
            [field]: value
        };

        setResep(dataBaru);
    }

    async function simpanRekamMedis(e) {
        e.preventDefault();
        setPesan("");

        if (resep.length === 0 || resep.some(item => !item.obat_id)) {
            setPesan("Pilih minimal satu obat.");
            return;
        }

        if (resep.some(item => Number(item.jumlah) <= 0)) {
            setPesan("Jumlah obat harus lebih dari 0.");
            return;
        }

        const idObat = resep.map(item => item.obat_id);

        if (new Set(idObat).size !== idObat.length) {
            setPesan("Obat yang sama tidak boleh dipilih dua kali.");
            return;
        }

        setLoadingSimpan(true);

        try {
            const response = await fetch("/api/dokter/rekam-medis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    appointment_id: pasienDipilih.appointment_id,
                    ...form,
                    resep
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Rekam medis gagal disimpan.");
                return;
            }

            setPasienDipilih(null);

            setForm({
                diagnosis: "",
                tindakan: "",
                catatan: ""
            });

            setResep([
                { obat_id: "", jumlah: 1 }
            ]);

            setPesan("Rekam medis dan resep berhasil disimpan.");

            await ambilData();

        } catch (error) {
            setPesan("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setLoadingSimpan(false);
        }
    }

    function formatTanggal(tanggal) {
        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    const inputStyle =
        "w-full rounded-xl border border-[#D5E2DA] bg-white px-4 py-3 text-[#263D34] outline-none focus:border-[#397A63] focus:ring-2 focus:ring-[#397A63]/20";

    return (
        <main className="min-h-screen bg-[#E8F0EC] px-5 py-10 md:px-10">
            <div className="mx-auto max-w-6xl">

                <button
                    onClick={() => router.push("/dokter")}
                    className="mb-8 text-sm font-medium text-[#397A63] hover:text-[#263D34]"
                >
                    ← Kembali ke Dashboard
                </button>

                <p className="text-sm font-semibold tracking-wide text-[#397A63]">
                    HARMONI HEALTHCARE
                </p>

                <h1 className="mt-2 text-3xl font-bold text-[#263D34]">
                    Rekam Medis Pasien
                </h1>

                <p className="mt-2 text-[#64776D]">
                    Kelola hasil pemeriksaan dan resep obat pasien.
                </p>

                <section className="mt-9 rounded-2xl border border-white bg-white/80 p-6 shadow-sm md:p-8">

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-[#263D34]">
                                Daftar Pasien
                            </h2>

                            <p className="mt-1 text-sm text-[#64776D]">
                                Pasien dengan janji temu yang telah disetujui.
                            </p>
                        </div>

                        <button
                            onClick={ambilData}
                            className="rounded-xl bg-[#E4EFE9] px-5 py-3 text-sm font-medium text-[#397A63] hover:bg-[#D6E7DD]"
                        >
                            Refresh Data
                        </button>
                    </div>

                    {pesan && (
                        <div className="mt-5 rounded-xl bg-[#E4EFE9] p-4 text-sm text-[#397A63]">
                            {pesan}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-20 text-center text-[#64776D]">
                            Memuat data pasien...
                        </div>
                    ) : pasien.length === 0 ? (
                        <div className="py-20 text-center">
                            <h3 className="text-lg font-semibold text-[#263D34]">
                                Belum Ada Pasien
                            </h3>

                            <p className="mt-2 text-sm text-[#64776D]">
                                Belum ada janji temu yang disetujui dan menunggu pemeriksaan.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
                            {pasien.map((item) => (
                                <div
                                    key={item.appointment_id}
                                    className="rounded-xl border border-[#DCE8E0] bg-white p-5 transition hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#263D34]">
                                                {item.nama_pasien}
                                            </h3>

                                            <p className="mt-1 text-sm text-[#64776D]">
                                                {item.telepon_pasien || "Nomor telepon belum tersedia"}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-[#E4EFE9] px-3 py-1 text-xs font-medium text-[#397A63]">
                                            Disetujui
                                        </span>
                                    </div>

                                    <div className="mt-5 space-y-3 border-t border-[#E8F0EC] pt-4">
                                        <div>
                                            <p className="text-xs text-[#819188]">
                                                Tanggal Konsultasi
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-[#263D34]">
                                                {formatTanggal(item.tanggal_booking)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-[#819188]">
                                                Poli
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-[#263D34]">
                                                {item.nama_poli || "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-[#819188]">
                                                Keluhan
                                            </p>

                                            <p className="mt-1 text-sm text-[#263D34]">
                                                {item.keluhan || "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => bukaForm(item)}
                                        className="mt-5 w-full rounded-xl bg-[#397A63] px-4 py-3 text-sm font-medium text-white hover:bg-[#2E6551]"
                                    >
                                        Buat Rekam Medis
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {pasienDipilih && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17251F]/50 p-4">
                        <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl md:p-8">

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-[#263D34]">
                                        Form Rekam Medis
                                    </h2>

                                    <p className="mt-1 text-sm text-[#64776D]">
                                        Pasien: {pasienDipilih.nama_pasien}
                                    </p>
                                </div>

                                <button
                                    onClick={tutupForm}
                                    className="text-2xl text-[#64776D] hover:text-[#263D34]"
                                    aria-label="Tutup form"
                                >
                                    ×
                                </button>
                            </div>

                            <form
                                onSubmit={simpanRekamMedis}
                                className="mt-7 space-y-5"
                            >
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#263D34]">
                                        Diagnosis
                                    </label>

                                    <textarea
                                        name="diagnosis"
                                        value={form.diagnosis}
                                        onChange={handleChange}
                                        rows="3"
                                        required
                                        placeholder="Masukkan hasil diagnosis pasien"
                                        className={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#263D34]">
                                        Tindakan Medis
                                    </label>

                                    <textarea
                                        name="tindakan"
                                        value={form.tindakan}
                                        onChange={handleChange}
                                        rows="3"
                                        required
                                        placeholder="Masukkan tindakan medis yang dilakukan"
                                        className={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#263D34]">
                                        Catatan Tambahan
                                    </label>

                                    <textarea
                                        name="catatan"
                                        value={form.catatan}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Catatan tambahan jika diperlukan"
                                        className={inputStyle}
                                    />
                                </div>

                                <div className="border-t border-[#E8F0EC] pt-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-[#263D34]">
                                                Resep Obat
                                            </h3>

                                            <p className="mt-1 text-xs text-[#64776D]">
                                                Pilih obat dan masukkan jumlahnya.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={tambahObat}
                                            className="rounded-lg bg-[#E4EFE9] px-3 py-2 text-sm font-medium text-[#397A63] hover:bg-[#D6E7DD]"
                                        >
                                            + Tambah Obat
                                        </button>
                                    </div>

                                    <div className="mt-4 space-y-4">
                                        {resep.map((item, index) => (
                                            <div
                                                key={index}
                                                className="rounded-xl border border-[#DCE8E0] bg-[#F8FAF9] p-4"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-sm font-medium text-[#263D34]">
                                                        Obat {index + 1}
                                                    </p>

                                                    {resep.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => hapusObat(index)}
                                                            className="text-xs font-medium text-red-500 hover:text-red-700"
                                                        >
                                                            Hapus
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-[#64776D]">
                                                            Nama Obat
                                                        </label>

                                                        <select
                                                            value={item.obat_id}
                                                            onChange={(e) =>
                                                                ubahResep(index, "obat_id", e.target.value)
                                                            }
                                                            required
                                                            className={inputStyle}
                                                        >
                                                            <option value="">
                                                                Pilih obat
                                                            </option>

                                                            {daftarObat.map((obat) => (
                                                                <option
                                                                    key={obat.id}
                                                                    value={obat.id}
                                                                    disabled={
                                                                        obat.stok <= 0 ||
                                                                        resep.some((r, i) =>
                                                                            i !== index &&
                                                                            String(r.obat_id) === String(obat.id)
                                                                        )
                                                                    }
                                                                >
                                                                    {obat.nama} — Stok: {obat.stok}
                                                                    {obat.stok <= 0 ? " (Habis)" : ""}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-[#64776D]">
                                                            Jumlah
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            value={item.jumlah}
                                                            onChange={(e) =>
                                                                ubahResep(index, "jumlah", e.target.value)
                                                            }
                                                            required
                                                            className={inputStyle}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {pesan && (
                                    <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                                        {pesan}
                                    </div>
                                )}

                                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={tutupForm}
                                        className="rounded-xl border border-[#D5E2DA] px-5 py-3 text-sm font-medium text-[#64776D] hover:bg-[#F3F7F4]"
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={loadingSimpan}
                                        className="flex-1 rounded-xl bg-[#397A63] px-5 py-3 text-sm font-medium text-white hover:bg-[#2E6551] disabled:opacity-60"
                                    >
                                        {loadingSimpan
                                            ? "Menyimpan..."
                                            : "Simpan Rekam Medis & Resep"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}