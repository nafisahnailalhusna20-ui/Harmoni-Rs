"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilPasienPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        username: "",
        email: "",
        full_name: "",
        phone: "",
        address: "",
        birth_date: ""
    });

    const [loading, setLoading] = useState(true);
    const [menyimpan, setMenyimpan] = useState(false);
    const [pesan, setPesan] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        async function ambilProfil() {
            try {
                const response = await fetch("/api/me");
                const data = await response.json();

                if (!response.ok || !data.success) {
                    router.push("/login");
                    return;
                }

                if (data.user.role !== "pasien") {
                    router.push("/login");
                    return;
                }

                setForm({
                    username: data.user.username || "",
                    email: data.user.email || "",
                    full_name: data.user.full_name || "",
                    phone: data.user.phone || "",
                    address: data.user.address || "",
                    birth_date: data.user.birth_date
                        ? String(data.user.birth_date).slice(0, 10)
                        : ""
                });

            } catch (error) {
                setPesan("Gagal mengambil data profil.");
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        ambilProfil();
    }, [router]);

    function handleChange(e) {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    }

    async function simpanProfil(e) {
        e.preventDefault();

        setMenyimpan(true);
        setPesan("");

        try {
            const response = await fetch("/api/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Profil gagal diperbarui.");
                setError(true);
                return;
            }

            setForm({
                ...form,
                ...data.user,
                birth_date: data.user.birth_date
                    ? String(data.user.birth_date).slice(0, 10)
                    : ""
            });

            setPesan("Profil berhasil diperbarui!");
            setError(false);

        } catch (error) {
            setPesan("Terjadi kesalahan saat menyimpan profil.");
            setError(true);
        } finally {
            setMenyimpan(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E8F0EC] text-[#397A63]">
                Memuat profil...
            </div>
        );
    }

    const inputClass = "w-full border border-[#D5E4DA] rounded-xl px-4 py-3 outline-none focus:border-[#397A63] focus:ring-2 focus:ring-[#397A63]/10";

    return (
        <main className="min-h-screen bg-[#E8F0EC] px-5 py-10 md:px-10">
            <div className="max-w-4xl mx-auto">

                <button
                    onClick={() => router.push("/pasien")}
                    className="text-[#397A63] hover:underline mb-8"
                >
                    ← Kembali ke Dashboard
                </button>

                <div className="mb-8">
                    <p className="text-sm font-semibold text-[#397A63]">
                        HARMONI HEALTHCARE
                    </p>

                    <h1 className="text-3xl font-bold text-[#263D34] mt-2">
                        Profil Saya
                    </h1>

                    <p className="text-[#64776D] mt-2">
                        Lihat dan perbarui informasi pribadi Anda.
                    </p>
                </div>

                <div className="bg-white/80 border border-white rounded-2xl p-6 md:p-8 shadow-sm">

                    <h2 className="text-xl font-semibold text-[#263D34] mb-6">
                        Informasi Pribadi
                    </h2>

                    {pesan && (
                        <div className={`p-4 rounded-xl mb-6 ${error
                                ? "bg-red-50 text-red-600"
                                : "bg-green-50 text-green-700"
                            }`}>
                            {pesan}
                        </div>
                    )}

                    <form onSubmit={simpanProfil} className="space-y-5">

                        <div>
                            <label className="block text-sm font-medium text-[#263D34] mb-2">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#263D34] mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#263D34] mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#263D34] mb-2">
                                Nomor Telepon
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Masukkan nomor telepon"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#263D34] mb-2">
                                Tanggal Lahir
                            </label>
                            <input
                                type="date"
                                name="birth_date"
                                value={form.birth_date}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#263D34] mb-2">
                                Alamat
                            </label>
                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                rows="3"
                                className={inputClass}
                                placeholder="Masukkan alamat lengkap"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">

                            <button
                                type="button"
                                onClick={() => router.push("/pasien")}
                                className="border border-[#D5E4DA] text-[#64776D] px-6 py-3 rounded-xl hover:bg-[#F3F7F4]"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={menyimpan}
                                className="bg-[#397A63] text-white px-6 py-3 rounded-xl hover:bg-[#2e6551] disabled:opacity-50"
                            >
                                {menyimpan ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>

                        </div>

                    </form>
                </div>
            </div>
        </main>
    );
}