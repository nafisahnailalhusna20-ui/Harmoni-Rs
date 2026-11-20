"use client";

import { useEffect, useState } from "react";

export default function PasienPage() {
    const [pasien, setPasien] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tampilForm, setTampilForm] = useState(false);
    const [pasienDipilih, setPasienDipilih] = useState(null);
    const [pesan, setPesan] = useState("");

    const formAwal = {
        full_name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        birth_date: ""
    };

    const [form, setForm] = useState(formAwal);

    const inputStyle = "w-full p-3 rounded-xl border border-[#C8D8CF] bg-white/80 text-[#263D34] focus:outline-none focus:ring-2 focus:ring-[#397A63]";

    const tanggalHariIni = new Date().toLocaleDateString("en-CA");

    async function ambilData() {
        try {
            const response = await fetch("/api/admin/pasien");
            const data = await response.json();

            if (data.success) {
                setPasien(data.data);
            } else {
                setPesan(data.message || "Data pasien gagal dimuat.");
            }
        } catch (error) {
            console.error("Gagal mengambil data pasien:", error);
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

    function bukaTambah() {
        setPasienDipilih(null);
        setForm(formAwal);
        setPesan("");
        setTampilForm(true);
    }

    function bukaEdit(item) {
        setPasienDipilih(item);

        setForm({
            full_name: item.full_name || "",
            username: item.username || "",
            email: item.email || "",
            password: "",
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

        if (form.birth_date) {
            if (
                form.birth_date < "1900-01-01" ||
                form.birth_date > tanggalHariIni
            ) {
                setPesan("Tanggal lahir harus antara tahun 1900 dan hari ini.");
                return;
            }
        }

        try {
            const url = pasienDipilih
                ? `/api/admin/pasien/${pasienDipilih.id}`
                : "/api/admin/pasien";

            const dataKirim = { ...form };

            if (pasienDipilih) {
                delete dataKirim.password;
            }

            const response = await fetch(url, {
                method: pasienDipilih ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataKirim)
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Data pasien gagal disimpan.");
                return;
            }

            setPesan(data.message);
            setTampilForm(false);
            setForm(formAwal);
            setPasienDipilih(null);

            await ambilData();

        } catch (error) {
            setPesan("Terjadi kesalahan saat menyimpan data pasien.");
        }
    }

    async function hapusPasien(id) {
        const yakin = confirm("Apakah kamu yakin ingin menghapus pasien ini?");

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
            await ambilData();

        } catch (error) {
            setPesan("Terjadi kesalahan saat menghapus pasien.");
        }
    }

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
                            <h3 className="md:col-span-2 text-lg font-semibold text-[#263D34]">
                                {pasienDipilih ? "Edit Data Pasien" : "Tambah Pasien Baru"}
                            </h3>

                            <input
                                type="text"
                                name="full_name"
                                placeholder="Nama lengkap pasien"
                                value={form.full_name}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            />

                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            />

                            {!pasienDipilih && (
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password (minimal 6 karakter)"
                                    value={form.password}
                                    onChange={handleChange}
                                    minLength="6"
                                    required
                                    className={inputStyle}
                                />
                            )}

                            <input
                                type="text"
                                name="phone"
                                placeholder="Nomor telepon"
                                value={form.phone}
                                onChange={handleChange}
                                className={inputStyle}
                            />

                            <div>
                                <label className="block text-sm text-[#263D34] mb-2">
                                    Tanggal Lahir
                                </label>

                                <input
                                    type="date"
                                    name="birth_date"
                                    value={form.birth_date}
                                    onChange={handleChange}
                                    min="1900-01-01"
                                    max={tanggalHariIni}
                                    className={inputStyle}
                                />

                                <p className="text-xs text-[#64776D] mt-2">
                                    Pilih tanggal antara tahun 1900 sampai hari ini.
                                </p>
                            </div>

                            <textarea
                                name="address"
                                placeholder="Alamat pasien"
                                value={form.address}
                                onChange={handleChange}
                                rows="3"
                                className={`${inputStyle} md:col-span-2`}
                            />

                            <button
                                type="submit"
                                className="bg-[#397A63] text-white p-3 rounded-xl hover:bg-[#2e6551]"
                            >
                                {pasienDipilih ? "Simpan Perubahan" : "Simpan Pasien"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setTampilForm(false);
                                    setPasienDipilih(null);
                                    setForm(formAwal);
                                }}
                                className="bg-gray-200 text-[#263D34] p-3 rounded-xl"
                            >Batal
                            </button>
                        </form>
                    )}

                    <div className="flex justify-between items-center mt-6">
                        <h3 className="font-semibold text-[#263D34]"> Data Pasien </h3>
                        <span className="bg-[#DCEBE2] text-[#397A63] px-4 py-2 rounded-xl">
                            Total: {pasien.length} pasien </span>
                    </div>
                    {loading ? (
                        <p className="mt-4 text-[#64776D]"> Memuat data... </p>
                    ) : pasien.length === 0 ? (
                        <p className="mt-4 text-[#64776D]"> Belum ada pasien terdaftar. </p>
                    ) : (
                        <div className="overflow-x-auto mt-4">
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
                                            className="border-b border-gray-200 text-[#263D34]">
                                            <td className="p-3">{index + 1}</td>
                                            <td className="p-3">{item.full_name || "-"}</td>
                                            <td className="p-3">{item.username}</td>
                                            <td className="p-3">{item.email}</td>
                                            <td className="p-3">{item.phone || "-"}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => bukaEdit(item)}
                                                        className="bg-[#DCEBE2] text-[#397A63] px-3 py-2 rounded-lg"
                                                    > Edit </button>
                                                    <button
                                                        onClick={() => hapusPasien(item.id)}
                                                        className="bg-red-100 text-red-600 px-3 py-2 rounded-lg"
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