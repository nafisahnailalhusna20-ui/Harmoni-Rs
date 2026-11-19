"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PoliPage() {
    const router = useRouter();

    const [daftarPoli, setDaftarPoli] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tampilForm, setTampilForm] = useState(false);
    const [poliDipilih, setPoliDipilih] = useState(null);
    const [pesan, setPesan] = useState("");
    const [menyimpan, setMenyimpan] = useState(false);

    const [form, setForm] = useState({
        nama: "",
        deskripsi: "",
        ikon: "",
    });

    // Mengambil data poli
    async function ambilPoli() {
        try {
            const response = await fetch("/api/admin/poli");
            const hasil = await response.json();

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (hasil.success) {
                setDaftarPoli(hasil.data);
            }
        } catch (error) {
            setPesan("Data poli gagal dimuat.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        async function cekAdmin() {
            const response = await fetch("/api/me");
            const hasil = await response.json();

            if (!response.ok || hasil.user?.role !== "admin") {
                router.push("/login");
                return;
            }

            ambilPoli();
        }

        cekAdmin();
    }, [router]);

    // Membuka form tambah atau edit
    function bukaForm(poli = null) {
        setPoliDipilih(poli);

        if (poli) {
            setForm({
                nama: poli.nama,
                deskripsi: poli.deskripsi,
                ikon: poli.ikon || "",
            });
        } else {
            setForm({
                nama: "",
                deskripsi: "",
                ikon: "",
            });
        }

        setPesan("");
        setTampilForm(true);
    }

    // Menyimpan data poli
    async function simpanPoli(e) {
        e.preventDefault();

        if (menyimpan) return;

        setMenyimpan(true);
        setPesan("");

        try {
            const url = poliDipilih
                ? `/api/admin/poli/${poliDipilih.id}`
                : "/api/admin/poli";

            const response = await fetch(url, {
                method: poliDipilih ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const hasil = await response.json();

            if (!response.ok) {
                setPesan(hasil.message || "Data gagal disimpan.");
                return;
            }

            setTampilForm(false);
            setPoliDipilih(null);

            setForm({
                nama: "",
                deskripsi: "",
                ikon: "",
            });

            await ambilPoli();

        } catch (error) {
            setPesan("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setMenyimpan(false);
        }
    }

    // Menghapus data poli
    async function hapusPoli(id) {
        const yakin = window.confirm(
            "Yakin ingin menghapus data poli ini?"
        );

        if (!yakin) return;

        try {
            const response = await fetch(`/api/admin/poli/${id}`, {
                method: "DELETE",
            });

            const hasil = await response.json();

            if (!response.ok) {
                alert(hasil.message || "Data gagal dihapus.");
                return;
            }

            ambilPoli();
        } catch (error) {
            alert("Data poli gagal dihapus.");
        }
    }

    return (
        <main className="min-h-screen bg-[#f4f8f6]">

            <header className="bg-white border-b px-6 md:px-8 py-5 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#28765d]">
                        HARMONI
                    </h1>
                    <p className="text-sm text-gray-500">
                        Hospital Information System
                    </p>
                </div>

                <button
                    onClick={() => router.push("/admin")}
                    className="text-sm text-[#28765d] hover:underline"
                >
                    Kembali ke Dashboard
                </button>
            </header>

            <section className="p-6 md:p-8">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-sm text-[#28765d] font-medium">
                            Pengelolaan Data
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mt-1">
                            Data Poli
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Daftar poli yang tersedia di rumah sakit.
                        </p>
                    </div>

                    <button
                        onClick={() => bukaForm()}
                        className="bg-[#28765d] text-white px-5 py-3 rounded-lg hover:bg-[#21634e] transition"
                    >
                        + Tambah Poli
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 mt-7 overflow-hidden">

                    <div className="p-5 border-b">
                        <h3 className="font-semibold text-gray-800">
                            Daftar Poli
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            Total {daftarPoli.length} poli terdaftar
                        </p>
                    </div>

                    {loading ? (
                        <p className="p-8 text-center text-gray-500">
                            Memuat data poli...
                        </p>
                    ) : daftarPoli.length === 0 ? (
                        <p className="p-8 text-center text-gray-500">
                            Belum ada data poli.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8faf9] text-gray-600">
                                    <tr>
                                        <th className="px-5 py-4">No.</th>
                                        <th className="px-5 py-4">Nama Poli</th>
                                        <th className="px-5 py-4">Deskripsi</th>
                                        <th className="px-5 py-4 text-center">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {daftarPoli.map((poli, index) => (
                                        <tr
                                            key={poli.id}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4 text-gray-500">
                                                {index + 1}
                                            </td>

                                            <td className="px-5 py-4 font-medium text-gray-800">
                                                {poli.nama}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600 min-w-[250px]">
                                                {poli.deskripsi}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => bukaForm(poli)}
                                                        className="px-3 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => hapusPoli(poli.id)}
                                                        className="px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
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

            </section>

            {/* Form tambah dan edit poli */}
            {tampilForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6">

                        <h3 className="text-xl font-semibold text-gray-800">
                            {poliDipilih ? "Edit Poli" : "Tambah Poli"}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            Isi informasi poli di bawah ini.
                        </p>

                        <form
                            onSubmit={simpanPoli}
                            className="mt-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">
                                    Nama Poli
                                </label>

                                <input
                                    type="text"
                                    value={form.nama}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            nama: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Poli THT"
                                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#28765d]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-2">
                                    Deskripsi
                                </label>

                                <textarea
                                    value={form.deskripsi}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            deskripsi: e.target.value,
                                        })
                                    }
                                    placeholder="Masukkan deskripsi poli"
                                    rows="4"
                                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#28765d]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-2">
                                    Ikon (opsional)
                                </label>

                                <input
                                    type="text"
                                    value={form.ikon}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            ikon: e.target.value,
                                        })
                                    }
                                    placeholder="Nama ikon atau URL gambar"
                                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#28765d]"
                                />
                            </div>

                            {pesan && (
                                <p className="text-sm text-red-600">
                                    {pesan}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setTampilForm(false)}
                                    disabled={menyimpan}
                                    className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={menyimpan}
                                    className="px-5 py-2 rounded-lg bg-[#28765d] text-white hover:bg-[#21634e] disabled:opacity-50"
                                >
                                    {menyimpan ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </main>
    );
}