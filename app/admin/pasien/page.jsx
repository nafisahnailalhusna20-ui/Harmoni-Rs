"use client";

import { useEffect, useState } from "react";

export default function PasienPage() {
    const [pasien, setPasien] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tampilForm, setTampilForm] = useState(false);
    const [pasienDipilih, setPasienDipilih] = useState(null);
    const [pesan, setPesan] = useState("");

    const formAwal = {
        username: "",
        email: "",
        password: "",
        full_name: "",
        phone: "",
        address: "",
        birth_date: ""
    };

    const [form, setForm] = useState(formAwal);

    async function ambilData() {
        try {
            const response = await fetch("/api/admin/pasien");
            const data = await response.json();

            if (data.success) {
                setPasien(data.data);
            } else {
                setPesan(data.message || "Gagal mengambil data pasien.");
            }
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            setPesan("Terjadi kesalahan saat mengambil data pasien.");
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
        const nomor = e.target.value
            .replace(/\D/g, "")
            .slice(0, 15);

        setForm({
            ...form,
            phone: nomor
        });
    }

    function bukaTambah() {
        setPasienDipilih(null);
        setForm(formAwal);
        setPesan("");
        setTampilForm(true);
    }

    function bukaEdit(item) {
        setPasienDipilih(item);

        setForm({
            username: item.username || "",
            email: item.email || "",
            password: "",
            full_name: item.full_name || "",
            phone: item.phone || "",
            address: item.address || "",
            birth_date: item.birth_date
                ? String(item.birth_date).slice(0, 10)
                : ""
        });

        setPesan("");
        setTampilForm(true);
    }

    async function simpanPasien(e) {
        e.preventDefault();
        setPesan("");

        const formatEmail =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!formatEmail.test(form.email.trim())) {
            setPesan("Format email tidak valid. Contoh: nama@gmail.com");
            return;
        }

        if (form.phone && !/^[0-9]{10,15}$/.test(form.phone)) {
            setPesan("Nomor telepon harus terdiri dari 10–15 digit angka.");
            return;
        }

        if (
            form.birth_date &&
            (
                form.birth_date < "1945-01-01" ||
                form.birth_date > "2026-12-31"
            )
        ) {
            setPesan("Tanggal lahir harus berada antara tahun 1945–2026.");
            return;
        }

        try {
            const url = pasienDipilih
                ? `/api/admin/pasien/${pasienDipilih.id}`
                : "/api/admin/pasien";

            const response = await fetch(url, {
                method: pasienDipilih ? "PUT" : "POST",
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
                setPesan(data.message || "Data gagal disimpan.");
                return;
            }

            setPesan(data.message);
            setTampilForm(false);
            setPasienDipilih(null);
            setForm(formAwal);

            await ambilData();

        } catch (error) {
            console.error("Gagal menyimpan pasien:", error);
            setPesan("Terjadi kesalahan saat menyimpan data.");
        }
    }

    async function hapusPasien(id) {
        const yakin = confirm("Yakin ingin menghapus data pasien ini?");

        if (!yakin) return;

        try {
            const response = await fetch(`/api/admin/pasien/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Pasien gagal dihapus.");
                return;
            }

            setPesan(data.message);
            setTampilForm(false);
            setPasienDipilih(null);
            setForm(formAwal);

            await ambilData();

        } catch (error) {
            console.error("Gagal menghapus pasien:", error);
            setPesan("Terjadi kesalahan saat menghapus data.");
        }
    }

    const inputStyle =
        "w-full p-3 rounded-xl border border-[#C8D8CF] bg-white/80 text-[#263D34] placeholder:text-[#84968C] focus:outline-none focus:ring-2 focus:ring-[#397A63]";

    return (
        <main className="min-h-screen bg-[#E8F0EC] p-8">
            <div className="max-w-6xl mx-auto">

                <h1 className="text-3xl font-bold text-[#263D34]">
                    Manajemen Pasien
                </h1>

                <p className="text-[#64776D] mt-2">
                    Kelola data pasien rumah sakit.
                </p>

                <div className="mt-8 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/70 p-6 shadow-lg">

                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold text-[#263D34]">
                            Daftar Pasien
                        </h2>

                        <button
                            onClick={bukaTambah}
                            className="bg-[#397A63] text-white px-4 py-2 rounded-xl hover:bg-[#2e6551]"
                        >
                            + Tambah Pasien
                        </button>
                    </div>

                    {pesan && (
                        <p className="mt-4 text-sm text-[#397A63]">
                            {pesan}
                        </p>
                    )}

                    {tampilForm && (
                        <form
                            onSubmit={simpanPasien}
                            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                        >

                            <input
                                name="full_name"
                                placeholder="Nama lengkap pasien"
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
                                placeholder="Contoh: nama@gmail.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
                                title="Masukkan email lengkap, contoh nama@gmail.com"
                                className={inputStyle}
                            />

                            <input
                                name="password"
                                type="password"
                                placeholder={
                                    pasienDipilih
                                        ? "Password baru (kosongkan jika tidak diubah)"
                                        : "Password (minimal 6 karakter)"
                                }
                                value={form.password}
                                onChange={handleChange}
                                required={!pasienDipilih}
                                minLength={6}
                                className={inputStyle}
                            />

                            <div>
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder="Nomor telepon (10–15 digit)"
                                    value={form.phone}
                                    onChange={handlePhoneChange}
                                    minLength={10}
                                    maxLength={15}
                                    pattern="[0-9]{10,15}"
                                    title="Nomor telepon harus terdiri dari 10–15 digit angka."
                                    className={inputStyle}
                                />

                                <p className="text-xs text-[#64776D] mt-1">
                                    Masukkan 10–15 digit angka.
                                </p>
                            </div>

                            <div>
                                <input
                                    name="birth_date"
                                    type="date"
                                    value={form.birth_date}
                                    onChange={handleChange}
                                    min="1945-01-01"
                                    max="2026-12-31"
                                    className={inputStyle}
                                />

                                <p className="text-xs text-[#64776D] mt-1">
                                    Tahun lahir 1945–2026.
                                </p>
                            </div>

                            <textarea
                                name="address"
                                placeholder="Alamat pasien"
                                value={form.address}
                                onChange={handleChange}
                                rows={3}
                                className={`${inputStyle} md:col-span-2`}
                            />

                            <div className="md:col-span-2 flex gap-3">

                                <button
                                    type="submit"
                                    className="flex-1 bg-[#397A63] text-white p-3 rounded-xl hover:bg-[#2e6551]"
                                >
                                    {pasienDipilih
                                        ? "Simpan Perubahan"
                                        : "Simpan Pasien"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setTampilForm(false);
                                        setPasienDipilih(null);
                                        setForm(formAwal);
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
                        <p className="mt-4 text-[#64776D]">
                            Memuat data...
                        </p>
                    ) : pasien.length === 0 ? (
                        <p className="mt-6 text-[#64776D]">
                            Belum ada pasien terdaftar.
                        </p>
                    ) : (
                        <div className="overflow-x-auto mt-6">
                            <table className="w-full text-left">

                                <thead>
                                    <tr className="border-b text-[#397A63]">
                                        <th className="p-3">No.</th>
                                        <th className="p-3">Nama Pasien</th>
                                        <th className="p-3">Username</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Telepon</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pasien.map((item, index) => (
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
                                                        onClick={() => hapusPasien(item.id)}
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