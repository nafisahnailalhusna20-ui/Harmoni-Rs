"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilDokterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        username: "",
        email: "",
        full_name: "",
        phone: "",
        address: "",
        birth_date: ""
    });

    const [fotoBaru, setFotoBaru] = useState(null);
    const [fotoHeroBaru, setFotoHeroBaru] = useState(null);

    const [preview, setPreview] = useState("");
    const [previewHero, setPreviewHero] = useState("");

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

                if (data.user.role !== "dokter") {
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

                setPreview(data.user.photo || "");
                setPreviewHero(data.user.hero_photo || "");
            } catch (err) {
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

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    function validasiFoto(file, input) {
        if (!file) return false;

        const formatFoto = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!formatFoto.includes(file.type)) {
            setPesan("Gunakan foto JPG, PNG, atau WebP.");
            setError(true);
            input.value = "";
            return false;
        }

        if (file.size > 2 * 1024 * 1024) {
            setPesan("Ukuran foto maksimal 2 MB.");
            setError(true);
            input.value = "";
            return false;
        }

        setPesan("");
        setError(false);
        return true;
    }

    function handleFoto(e) {
        const file = e.target.files?.[0];

        if (!file || !validasiFoto(file, e.target)) return;

        setFotoBaru(file);
        setPreview(URL.createObjectURL(file));
    }

    function handleFotoHero(e) {
        const file = e.target.files?.[0];

        if (!file || !validasiFoto(file, e.target)) return;

        setFotoHeroBaru(file);
        setPreviewHero(URL.createObjectURL(file));
    }

    async function simpanProfil(e) {
        e.preventDefault();

        setMenyimpan(true);
        setPesan("");

        try {
            const formData = new FormData();

            formData.append("username", form.username);
            formData.append("email", form.email);
            formData.append("full_name", form.full_name);
            formData.append("phone", form.phone);
            formData.append("address", form.address);
            formData.append("birth_date", form.birth_date);

            if (fotoBaru) {
                formData.append("photo", fotoBaru);
            }

            if (fotoHeroBaru) {
                formData.append("hero_photo", fotoHeroBaru);
            }

            const response = await fetch("/api/me", {
                method: "PUT",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Profil gagal diperbarui.");
                setError(true);
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

            setPreview(data.user.photo || "");
            setPreviewHero(data.user.hero_photo || "");

            setFotoBaru(null);
            setFotoHeroBaru(null);

            setPesan("Profil berhasil diperbarui!");
            setError(false);
        } catch (err) {
            setPesan("Terjadi kesalahan saat menyimpan profil.");
            setError(true);
        } finally {
            setMenyimpan(false);
        }
    }

    const inputClass =
        "w-full rounded-2xl border border-[#dce8f3] bg-white/75 px-4 py-3.5 text-sm text-[#244968] outline-none transition placeholder:text-[#9bb2c8] focus:border-[#8bb9df] focus:bg-white focus:ring-4 focus:ring-[#c9e2f5]/40";

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#edf6fd]">
                <div className="rounded-3xl border border-white/80 bg-white/70 px-8 py-6 text-center shadow-xl shadow-blue-100/50 backdrop-blur-xl">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#d6e8f6] border-t-[#568fbd]" />
                    <p className="text-sm font-medium text-[#5682a7]">
                        Menyiapkan profil dokter...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#ffffff_0%,#edf6fd_38%,#dcecf9_75%,#eaf4fc_100%)] px-4 py-7 text-[#244968] sm:px-7 sm:py-10 lg:px-10">

            {/* BACKGROUND DECOR */}
            <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-white/70 blur-[110px]" />
            <div className="pointer-events-none absolute -right-32 top-[520px] h-[430px] w-[430px] rounded-full bg-[#b9d9f2]/45 blur-[120px]" />

            <div className="relative mx-auto max-w-6xl">

                {/* TOP NAVIGATION */}
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-extrabold tracking-[0.25em] text-[#78a4ca]">
                            HARMONI HEALTHCARE
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-sm text-[#8aa9c5]">
                            <button
                                type="button"
                                onClick={() => router.push("/dokter")}
                                className="transition hover:text-[#315f85]"
                            >
                                Dashboard
                            </button>

                            <span>/</span>

                            <span className="font-semibold text-[#315f85]">
                                Profil Saya
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/dokter")}
                        className="flex items-center gap-2 rounded-full border border-white/90 bg-white/55 px-5 py-3 text-sm font-semibold text-[#527fa5] shadow-[0_8px_25px_rgba(77,126,166,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white"
                    >
                        <span className="text-lg">←</span>
                        Kembali ke Dashboard
                    </button>
                </header>

                {/* PAGE INTRO */}
                <section className="mb-8 overflow-hidden rounded-[30px] border border-white/90 bg-white/45 p-6 shadow-[0_20px_60px_rgba(87,139,181,0.09)] backdrop-blur-2xl sm:p-8">
                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dcebf7] bg-white/70 px-3.5 py-2 text-[10px] font-bold tracking-[0.16em] text-[#79a2c6]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#83b9d8]" />
                                DOCTOR ACCOUNT
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-[#244968] sm:text-4xl">
                                Profil Saya
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-7 text-[#789bbd] sm:text-base">
                                Perbarui informasi pribadi dan atur tampilan
                                profil dokter di ruang kerja HARMONI.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl border border-white/90 bg-white/60 p-4 shadow-sm">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#e5f1fa] shadow-md">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Foto profil dokter"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xl text-[#7fa7c9]">
                                        ♡
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-bold tracking-[0.15em] text-[#91aec8]">
                                    PROFIL AKTIF
                                </p>
                                <p className="mt-1 max-w-[180px] truncate text-sm font-bold text-[#315f85]">
                                    {form.full_name || "Dokter HARMONI"}
                                </p>
                                <p className="mt-1 text-xs text-[#8aa9c5]">
                                    Dokter
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEEDBACK MESSAGE */}
                {pesan && (
                    <div
                        className={`mb-6 flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm ${error
                                ? "border-rose-100 bg-rose-50/90 text-rose-600"
                                : "border-emerald-100 bg-emerald-50/90 text-emerald-700"
                            }`}
                    >
                        <span className="text-lg">
                            {error ? "!" : "✓"}
                        </span>
                        <p>{pesan}</p>
                    </div>
                )}

                <form onSubmit={simpanProfil} className="space-y-6">

                    {/* PHOTO SETTINGS */}
                    <section className="rounded-[28px] border border-white/90 bg-white/60 p-5 shadow-[0_18px_50px_rgba(87,139,181,0.08)] backdrop-blur-2xl sm:p-8">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#8aaccb]">
                                    01 — APPEARANCE
                                </p>
                                <h2 className="mt-2 text-xl font-bold text-[#244968]">
                                    Foto & Tampilan
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-[#789bbd]">
                                    Atur foto yang muncul di bagian profil dan dashboard.
                                </p>
                            </div>

                            <span className="hidden rounded-full bg-[#e8f3fb] px-3 py-1.5 text-xs font-semibold text-[#6f9ec4] sm:inline-flex">
                                2 foto
                            </span>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">

                            {/* PROFILE PHOTO */}
                            <div className="rounded-3xl border border-[#e0edf7] bg-gradient-to-br from-white/90 to-[#f2f8fd]/90 p-5 sm:p-6">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e4f1fa] text-lg text-[#6c9fc7]">
                                        ◉
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#315f85]">
                                            Foto Profil
                                        </h3>
                                        <p className="mt-1 text-xs text-[#8aa9c5]">
                                            Avatar & identitas akun
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-5 rounded-2xl bg-white/70 p-5 sm:flex-row">
                                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-[5px] border-white bg-[#e5f1fa] shadow-[0_8px_25px_rgba(81,132,174,0.15)]">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Preview foto profil"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-2xl text-[#8aaccb]">
                                                ♡
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full min-w-0">
                                        <label className="mb-2 block text-xs font-semibold text-[#527fa5]">
                                            Pilih foto profil
                                        </label>

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleFoto}
                                            className="w-full text-xs text-[#789bbd] file:mr-3 file:rounded-xl file:border-0 file:bg-[#e5f1fa] file:px-4 file:py-2.5 file:font-semibold file:text-[#527fa5] transition hover:file:bg-[#d8eaf7]"
                                        />

                                        <p className="mt-3 text-[11px] leading-5 text-[#91aec8]">
                                            JPG, PNG, atau WebP · Maksimal 2 MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* HERO PHOTO */}
                            <div className="rounded-3xl border border-[#e0edf7] bg-gradient-to-br from-white/90 to-[#f2f8fd]/90 p-5 sm:p-6">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e4f1fa] text-lg text-[#6c9fc7]">
                                        ✦
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#315f85]">
                                            Foto Hero Dashboard
                                        </h3>
                                        <p className="mt-1 text-xs text-[#8aa9c5]">
                                            Gambar besar kartu sapaan
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-5 rounded-2xl bg-white/70 p-5 sm:flex-row">
                                    <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-2xl border-[5px] border-white bg-[#e5f1fa] shadow-[0_8px_25px_rgba(81,132,174,0.15)]">
                                        {previewHero ? (
                                            <img
                                                src={previewHero}
                                                alt="Preview foto hero dashboard"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-2xl text-[#8aaccb]">
                                                ✧
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full min-w-0">
                                        <label className="mb-2 block text-xs font-semibold text-[#527fa5]">
                                            Pilih foto hero
                                        </label>

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleFotoHero}
                                            className="w-full text-xs text-[#789bbd] file:mr-3 file:rounded-xl file:border-0 file:bg-[#e5f1fa] file:px-4 file:py-2.5 file:font-semibold file:text-[#527fa5] transition hover:file:bg-[#d8eaf7]"
                                        />

                                        <p className="mt-3 text-[11px] leading-5 text-[#91aec8]">
                                            Gunakan foto berbeda · Maksimal 2 MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PERSONAL INFORMATION */}
                    <section className="rounded-[28px] border border-white/90 bg-white/60 p-5 shadow-[0_18px_50px_rgba(87,139,181,0.08)] backdrop-blur-2xl sm:p-8">
                        <div className="mb-7">
                            <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#8aaccb]">
                                02 — PERSONAL DETAILS
                            </p>
                            <h2 className="mt-2 text-xl font-bold text-[#244968]">
                                Informasi Pribadi
                            </h2>
                            <p className="mt-2 text-sm text-[#789bbd]">
                                Pastikan data akun Anda tetap akurat.
                            </p>
                        </div>

                        <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-[#527fa5]">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Nama lengkap"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-[#527fa5]">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Username"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-[#527fa5]">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="nama@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-[#527fa5]">
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
                                <label className="mb-2 block text-xs font-semibold text-[#527fa5]">
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
                                <label className="mb-2 block text-xs font-semibold text-[#527fa5]">
                                    Alamat
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Alamat tempat tinggal"
                                />
                            </div>
                        </div>
                    </section>

                    {/* FORM ACTIONS */}
                    <div className="sticky bottom-4 z-10 flex flex-col justify-between gap-3 rounded-2xl border border-white/90 bg-white/75 p-4 shadow-[0_15px_45px_rgba(70,120,165,0.14)] backdrop-blur-2xl sm:flex-row sm:items-center sm:px-6">
                        <p className="text-xs leading-5 text-[#8aa9c5]">
                            Perubahan akan tersimpan pada akun dokter Anda.
                        </p>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => router.push("/dokter")}
                                className="rounded-xl border border-[#dce8f3] bg-white/70 px-5 py-3 text-sm font-semibold text-[#789bbd] transition hover:bg-white"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={menyimpan}
                                className="rounded-xl bg-gradient-to-r from-[#5b98c5] to-[#477eae] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(75,132,181,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(75,132,181,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {menyimpan
                                    ? "Menyimpan perubahan..."
                                    : "Simpan Perubahan  →"}
                            </button>
                        </div>
                    </div>

                </form>

                <footer className="py-8 text-center text-[10px] font-semibold tracking-[0.18em] text-[#9bb5cc]">
                    HARMONI HEALTHCARE · DOCTOR PROFILE
                </footer>
            </div>
        </main>
    );
}