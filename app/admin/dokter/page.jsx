"use client";

import { useEffect, useState } from "react";

export default function DokterPage() {
    const [dokter, setDokter] = useState([]);
    const [poli, setPoli] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tampilForm, setTampilForm] = useState(false);
    const [dokterDipilih, setDokterDipilih] = useState(null);
    const [pesan, setPesan] = useState("");

    const formAwal = {
        full_name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        poli_id: ""
    };

    const [form, setForm] = useState(formAwal);

    async function ambilData() {
        try {
            const [resDokter, resPoli] = await Promise.all([
                fetch("/api/admin/dokter"),
                fetch("/api/admin/poli")
            ]);

            const dataDokter = await resDokter.json();
            const dataPoli = await resPoli.json();

            if (dataDokter.success) {
                setDokter(dataDokter.data);
            } else {
                setPesan(dataDokter.message || "Gagal mengambil data dokter.");
            }

            if (dataPoli.success) {
                setPoli(dataPoli.data);
            }
        } catch (error) {
            console.error(error);
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

    function handlePhoneChange(e) {
        const nomor = e.target.value.replace(/\D/g, "").slice(0, 15);

        setForm({
            ...form,
            phone: nomor
        });
    }

    function bukaTambah() {
        setDokterDipilih(null);
        setForm(formAwal);
        setPesan("");
        setTampilForm(true);
    }

    function bukaEdit(item) {
        setDokterDipilih(item);

        setForm({
            full_name: item.full_name || "",
            username: item.username || "",
            email: item.email || "",
            password: "",
            phone: item.phone || "",
            poli_id: item.poli_id || ""
        });

        setPesan("");
        setTampilForm(true);
    }

    async function simpanDokter(e) {
        e.preventDefault();
        setPesan("");

        const formatEmail =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!formatEmail.test(form.email.trim())) {
            setPesan("Format email tidak valid.");
            return;
        }

        if (form.phone && !/^[0-9]{10,15}$/.test(form.phone)) {
            setPesan("Nomor telepon harus terdiri dari 10–15 digit.");
            return;
        }

        if (!dokterDipilih && form.password.length < 6) {
            setPesan("Password minimal 6 karakter.");
            return;
        }

        if (dokterDipilih && form.password && form.password.length < 6) {
            setPesan("Password minimal 6 karakter.");
            return;
        }

        try {
            const url = dokterDipilih
                ? `/api/admin/dokter/${dokterDipilih.id}`
                : "/api/admin/dokter";

            const response = await fetch(url, {
                method: dokterDipilih ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...form,
                    email: form.email.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Data dokter gagal disimpan.");
                return;
            }

            setPesan(data.message || "Data dokter berhasil disimpan.");
            setTampilForm(false);
            setDokterDipilih(null);
            setForm(formAwal);

            await ambilData();
        } catch (error) {
            console.error(error);
            setPesan("Terjadi kesalahan saat menyimpan data.");
        }
    }

    async function hapusDokter(id) {
        const yakin = confirm("Yakin ingin menghapus data dokter ini?");

        if (!yakin) return;

        try {
            const response = await fetch(`/api/admin/dokter/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Dokter gagal dihapus.");
                return;
            }

            setPesan(data.message || "Dokter berhasil dihapus.");
            await ambilData();
        } catch (error) {
            console.error(error);
            setPesan("Terjadi kesalahan saat menghapus data.");
        }
    }

    const inputStyle =
        "w-full p-3 rounded-xl border border-[#C8D8CF] bg-white text-[#263D34] focus:outline-none focus:ring-2 focus:ring-[#397A63]";

    return (
        <main className="min-h-screen bg-[#E8F0EC] p-6 md:p-8">
            <div className="max-w-6xl mx-auto">

                <h1 className="text-3xl font-bold text-[#263D34]">
                    Manajemen Dokter
                </h1>

                <p className="text-[#64776D] mt-2">
                    Kelola data dokter rumah sakit.
                </p>

                <div className="mt-8 rounded-2xl bg-white/70 border border-white p-6 shadow-lg">

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h2 className="text-xl font-semibold text-[#263D34]">
                            Daftar Dokter
                        </h2>

                        <button
                            onClick={bukaTambah}
                            className="bg-[#397A63] text-white px-4 py-3 rounded-xl hover:bg-[#2e6551]"
                        >
                            + Tambah Dokter
                        </button>
                    </div>

                    {pesan && (
                        <p className="mt-4 text-sm text-[#397A63]">
                            {pesan}
                        </p>
                    )}

                    {tampilForm && (
                        <form
                            onSubmit={simpanDokter}
                            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <input
                                name="full_name"
                                placeholder="Nama lengkap dokter"
                                value={form.full_name}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            />

                            <input
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            />

                            <input
                                name="email"
                                type="email"
                                placeholder="Email dokter"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            />

                            <input
                                name="password"
                                type="password"
                                placeholder={
                                    dokterDipilih
                                        ? "Password baru (kosongkan jika tidak diubah)"
                                        : "Password (minimal 6 karakter)"
                                }
                                value={form.password}
                                onChange={handleChange}
                                required={!dokterDipilih}
                                minLength={6}
                                className={inputStyle}
                            />

                            <input
                                name="phone"
                                type="tel"
                                placeholder="Nomor telepon"
                                value={form.phone}
                                onChange={handlePhoneChange}
                                className={inputStyle}
                            />

                            <select
                                name="poli_id"
                                value={form.poli_id}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            >
                                <option value="">Pilih Poli</option>

                                {poli.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama}
                                    </option>
                                ))}
                            </select>

                            <div className="md:col-span-2 flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#397A63] text-white p-3 rounded-xl hover:bg-[#2e6551]"
                                >
                                    {dokterDipilih
                                        ? "Simpan Perubahan"
                                        : "Simpan Dokter"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTampilForm(false)}
                                    className="px-5 bg-gray-200 text-gray-700 rounded-xl"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    )}

                    {loading ? (
                        <p className="mt-6 text-[#64776D]">
                            Memuat data dokter...
                        </p>
                    ) : dokter.length === 0 ? (
                        <p className="mt-6 text-[#64776D]">
                            Belum ada dokter terdaftar.
                        </p>
                    ) : (
                        <div className="overflow-x-auto mt-6">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-[#397A63]">
                                        <th className="p-3">No.</th>
                                        <th className="p-3">Nama Dokter</th>
                                        <th className="p-3">Username</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Poli</th>
                                        <th className="p-3">Telepon</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dokter.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-gray-200 text-[#263D34]"
                                        >
                                            <td className="p-3">
                                                {index + 1}
                                            </td>

                                            <td className="p-3">
                                                {item.full_name}
                                            </td>

                                            <td className="p-3">
                                                {item.username}
                                            </td>

                                            <td className="p-3">
                                                {item.email}
                                            </td>

                                            <td className="p-3">
                                                {item.nama_poli || "-"}
                                            </td>

                                            <td className="p-3">
                                                {item.phone || "-"}
                                            </td>

                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => bukaEdit(item)}
                                                        className="bg-[#DCEBE2] text-[#397A63] px-3 py-1 rounded-lg"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => hapusDokter(item.id)}
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