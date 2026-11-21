"use client";

import { useEffect, useState } from "react";

function formatTanggalLokal(tanggal) {
    const tahun = tanggal.getFullYear();
    const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
    const hari = String(tanggal.getDate()).padStart(2, "0");

    return `${tahun}-${bulan}-${hari}`;
}

export default function ObatPage() {
    const [obat, setObat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tampilForm, setTampilForm] = useState(false);
    const [obatDipilih, setObatDipilih] = useState(null);
    const [pesan, setPesan] = useState("");

    const [batasTanggal, setBatasTanggal] = useState({
        hariIni: "",
        tanggalMaksimal: "",
    });

    const formAwal = {
        nama: "",
        deskripsi: "",
        tipe: "",
        stok: "",
        gambar: "",
        tanggal_kadaluarsa: "",
    };

    const [form, setForm] = useState(formAwal);

    useEffect(() => {
        const sekarang = new Date();

        const hariIni = formatTanggalLokal(sekarang);

        const tanggalBatas = new Date(sekarang);
        tanggalBatas.setFullYear(
            tanggalBatas.getFullYear() + 10
        );

        setBatasTanggal({
            hariIni,
            tanggalMaksimal: formatTanggalLokal(tanggalBatas),
        });

        ambilData();
    }, []);

    async function ambilData() {
        try {
            const response = await fetch("/api/admin/obat");
            const data = await response.json();

            if (data.success) {
                setObat(data.data);
            } else {
                setPesan(data.message || "Data obat gagal dimuat.");
            }
        } catch (error) {
            console.error("Gagal mengambil data obat:", error);
            setPesan("Terjadi kesalahan saat mengambil data obat.");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    function bukaTambah() {
        setObatDipilih(null);
        setForm(formAwal);
        setPesan("");
        setTampilForm(true);
    }

    function bukaEdit(item) {
        setObatDipilih(item);

        setForm({
            nama: item.nama,
            deskripsi: item.deskripsi,
            tipe: item.tipe,
            stok: String(item.stok),
            gambar: item.gambar || "",
            tanggal_kadaluarsa: item.tanggal_kadaluarsa
                ? String(item.tanggal_kadaluarsa).slice(0, 10)
                : "",
        });

        setPesan("");
        setTampilForm(true);
    }

    async function simpanObat(e) {
        e.preventDefault();
        setPesan("");

        const tanggalKadaluarsa = form.tanggal_kadaluarsa;

        if (tanggalKadaluarsa) {
            if (
                !batasTanggal.hariIni ||
                !batasTanggal.tanggalMaksimal
            ) {
                setPesan("Batas tanggal sedang dimuat. Coba lagi.");
                return;
            }

            if (
                tanggalKadaluarsa < batasTanggal.hariIni ||
                tanggalKadaluarsa > batasTanggal.tanggalMaksimal
            ) {
                setPesan(
                    `Tanggal kedaluwarsa harus antara ${batasTanggal.hariIni} dan ${batasTanggal.tanggalMaksimal}.`
                );
                return;
            }
        }

        try {
            const url = obatDipilih
                ? `/api/admin/obat/${obatDipilih.id}`
                : "/api/admin/obat";

            const response = await fetch(url, {
                method: obatDipilih ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Data obat gagal disimpan.");
                return;
            }

            setPesan(data.message);
            setTampilForm(false);
            setObatDipilih(null);
            setForm(formAwal);

            await ambilData();
        } catch (error) {
            console.error("Gagal menyimpan obat:", error);
            setPesan("Terjadi kesalahan saat menyimpan obat.");
        }
    }

    async function hapusObat(id) {
        const yakin = confirm("Yakin ingin menghapus obat ini?");

        if (!yakin) return;

        try {
            const response = await fetch(`/api/admin/obat/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Obat gagal dihapus.");
                return;
            }

            setPesan(data.message);
            await ambilData();
        } catch (error) {
            console.error("Gagal menghapus obat:", error);
            setPesan("Terjadi kesalahan saat menghapus obat.");
        }
    }

    const inputStyle =
        "w-full p-3 rounded-xl border border-[#C8D8CF] bg-white/80 text-[#263D34] focus:outline-none focus:ring-2 focus:ring-[#397A63]";

    return (
        <main className="min-h-screen bg-[#E8F0EC] p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-[#263D34]">
                    Manajemen Obat
                </h1>

                <p className="text-[#64776D] mt-2">
                    Kelola data dan persediaan obat rumah sakit.
                </p>

                <div className="mt-8 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/70 p-6 shadow-lg">
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold text-[#263D34]">
                            Daftar Obat
                        </h2>

                        <button
                            onClick={bukaTambah}
                            className="bg-[#397A63] text-white px-4 py-2 rounded-xl hover:bg-[#2e6551]"
                        >
                            + Tambah Obat
                        </button>
                    </div>

                    {pesan && (
                        <p className="mt-4 text-sm text-[#397A63]">
                            {pesan}
                        </p>
                    )}

                    {tampilForm && (
                        <form
                            onSubmit={simpanObat}
                            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <input
                                type="text"
                                name="nama"
                                placeholder="Nama obat"
                                value={form.nama}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            />

                            <select
                                name="tipe"
                                value={form.tipe}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            >
                                <option value="">Pilih Jenis Obat</option>
                                <option value="keras">Obat Keras</option>
                                <option value="biasa">Obat Biasa</option>
                            </select>

                            <textarea
                                name="deskripsi"
                                placeholder="Deskripsi obat"
                                value={form.deskripsi}
                                onChange={handleChange}
                                required
                                rows="3"
                                className={`${inputStyle} md:col-span-2`}
                            />

                            <div>
                                <label className="block text-sm text-[#263D34] mb-2">
                                    Jumlah Stok
                                </label>

                                <input
                                    type="number"
                                    name="stok"
                                    min="0"
                                    step="1"
                                    placeholder="Jumlah stok"
                                    value={form.stok}
                                    onChange={handleChange}
                                    required
                                    className={inputStyle}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#263D34] mb-2">
                                    Tanggal Kedaluwarsa
                                </label>

                                <input
                                    type="date"
                                    name="tanggal_kadaluarsa"
                                    value={form.tanggal_kadaluarsa}
                                    onChange={handleChange}
                                    min={batasTanggal.hariIni}
                                    max={batasTanggal.tanggalMaksimal}
                                    className={inputStyle}
                                />

                                <p className="text-xs text-gray-500 mt-2">
                                    Tanggal harus antara hari ini dan
                                    maksimal 10 tahun ke depan.
                                </p>
                            </div>

                            <input
                                type="text"
                                name="gambar"
                                placeholder="Link gambar obat (opsional)"
                                value={form.gambar}
                                onChange={handleChange}
                                className={`${inputStyle} md:col-span-2`}
                            />

                            <div className="md:col-span-2 flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#397A63] text-white p-3 rounded-xl hover:bg-[#2e6551]"
                                >
                                    {obatDipilih
                                        ? "Simpan Perubahan"
                                        : "Simpan Obat"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setTampilForm(false);
                                        setObatDipilih(null);
                                        setPesan("");
                                    }}
                                    className="px-5 bg-gray-200 text-gray-700 rounded-xl"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    )}

                    {loading ? (
                        <p className="mt-6 text-[#64776D]">
                            Memuat data...
                        </p>
                    ) : obat.length === 0 ? (
                        <p className="mt-6 text-[#64776D]">
                            Belum ada obat terdaftar.
                        </p>
                    ) : (
                        <div className="overflow-x-auto mt-6">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-[#397A63]">
                                        <th className="p-3">No.</th>
                                        <th className="p-3">Nama Obat</th>
                                        <th className="p-3">Jenis</th>
                                        <th className="p-3">Stok</th>
                                        <th className="p-3">Kedaluwarsa</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {obat.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-gray-200 text-[#263D34]"
                                        >
                                            <td className="p-3">
                                                {index + 1}
                                            </td>

                                            <td className="p-3">
                                                {item.nama}
                                            </td>

                                            <td className="p-3">
                                                {item.tipe === "keras"
                                                    ? "Obat Keras"
                                                    : "Obat Biasa"}
                                            </td>

                                            <td className="p-3">
                                                {item.stok}
                                            </td>

                                            <td className="p-3">
                                                {item.tanggal_kadaluarsa
                                                    ? String(
                                                        item.tanggal_kadaluarsa
                                                    ).slice(0, 10)
                                                    : "-"}
                                            </td>

                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            bukaEdit(item)
                                                        }
                                                        className="bg-[#DCEBE2] text-[#397A63] px-3 py-1 rounded-lg"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            hapusObat(item.id)
                                                        }
                                                        className="bg-red-100 text-red-600 px-3 py-1 rounded-lg"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
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
