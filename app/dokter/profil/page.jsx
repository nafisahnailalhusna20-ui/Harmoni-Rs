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
        birth_date: "",
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
                        : "",
                });

                setPreview(data.user.photo || "");
                setPreviewHero(data.user.hero_photo || "");
            } catch {
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
            [name]: value,
        }));
    }

    function validasiFoto(file, input) {
        if (!file) return false;

        const formatFoto = [
            "image/jpeg",
            "image/png",
            "image/webp",
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
                body: formData,
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
                    : "",
            });

            setPreview(data.user.photo || "");
            setPreviewHero(data.user.hero_photo || "");
            setFotoBaru(null);
            setFotoHeroBaru(null);

            setPesan("Profil berhasil diperbarui!");
            setError(false);
        } catch {
            setPesan("Terjadi kesalahan saat menyimpan profil.");
            setError(true);
        } finally {
            setMenyimpan(false);
        }
    }

    const inputClass =
        "w-full rounded-2xl border border-white/80 bg-white/35 px-4 py-3.5 text-sm font-medium text-[#244968] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_5px_18px_rgba(91,143,190,0.05)] backdrop-blur-xl outline-none transition duration-300 placeholder:text-[#9bb2c8] focus:border-white focus:bg-white/60 focus:shadow-[0_0_0_4px_rgba(180,218,246,0.3),0_8px_25px_rgba(91,143,190,0.1)]";

    const inisial = form.full_name
        ? form.full_name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((kata) => kata[0])
              .join("")
              .toUpperCase()
        : "DR";

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#eaf4fc] px-4">
                <div className="rounded-3xl border border-white/80 bg-white/40 px-8 py-6 text-center shadow-[0_20px_60px_rgba(75,133,183,0.15)] backdrop-blur-3xl">
                    <p className="text-sm font-medium text-[#5682a7]">
                        Menyiapkan profil dokter...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_15%_10%,rgba(255,255,255,0.98)_0%,transparent_38%),radial-gradient(ellipse_at_90%_25%,rgba(163,211,248,0.55)_0%,transparent_42%),linear-gradient(135deg,#edf7ff_0%,#dceefa_45%,#c8e2f7_100%)] px-4 py-7 text-[#244968] sm:px-7 sm:py-10 lg:px-10">
            {/* Soft glass background */}
            <div className="pointer-events-none absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-white/60 blur-[130px]" />
            <div className="pointer-events-none absolute -right-40 top-[420px] h-[550px] w-[550px] rounded-full bg-[#9bcdf1]/45 blur-[140px]" />
            <div className="pointer-events-none absolute left-[35%] top-[65%] h-80 w-80 rounded-full bg-white/35 blur-[110px]" />

            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[38px] border border-white/80 bg-white/20 p-4 shadow-[0_30px_100px_rgba(70,126,176,0.16),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-3xl sm:p-7 lg:p-10">
                {/* Inner reflection */}
                <div className="pointer-events-none absolute inset-0 rounded-[38px] bg-gradient-to-br from-white/45 via-white/10 to-[#a9d4f4]/15" />
                <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border border-white/30 bg-white/15 blur-2xl" />

                <div className="relative">
                    {/* NAVIGATION */}
                    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/60 pb-6">
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
                            className="rounded-full border border-white/85 bg-white/35 px-5 py-3 text-sm font-semibold text-[#527fa5] shadow-[0_8px_25px_rgba(77,126,166,0.08),inset_0_1px_0_white] backdrop-blur-2xl transition hover:bg-white/65"
                        >
                            Kembali ke Dashboard
                        </button>
                    </header>

                    {/* INTRO */}
                    <section className="mb-8 rounded-[30px] border border-white/75 bg-white/25 p-6 shadow-[0_18px_55px_rgba(87,139,181,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-3xl sm:p-8">
                        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                            <div>
                                <div className="mb-4 inline-flex rounded-full border border-white/80 bg-white/40 px-3.5 py-2 text-[10px] font-bold tracking-[0.16em] text-[#79a2c6] shadow-[inset_0_1px_0_white]">
                                    DOCTOR ACCOUNT
                                </div>

                                <h1 className="text-3xl font-bold tracking-tight text-[#244968] sm:text-4xl">
                                    Profil saya
                                </h1>

                                <p className="mt-3 max-w-xl text-sm leading-7 text-[#789bbd] sm:text-base">
                                    Hai, {form.full_name || "Dokter"}.
                                    Pastikan informasi pribadimu selalu lengkap
                                    dan terbaru.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/35 p-4 shadow-[0_12px_35px_rgba(77,126,166,0.08),inset_0_1px_0_white] backdrop-blur-2xl">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-[3px] border-white/90 bg-white/40 shadow-[0_8px_25px_rgba(81,132,174,0.18)]">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Foto profil dokter"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-white/80 to-[#cde5f8]/80 text-sm font-bold text-[#7fa7c9]">
                                            {inisial}
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

                    {/* FEEDBACK */}
                    {pesan && (
                        <div
                            className={`mb-6 rounded-2xl border px-5 py-4 text-sm shadow-sm backdrop-blur-xl ${
                                error
                                    ? "border-rose-200/80 bg-rose-50/60 text-rose-600"
                                    : "border-emerald-200/80 bg-emerald-50/60 text-emerald-700"
                            }`}
                        >
                            {pesan}
                        </div>
                    )}

                    <form onSubmit={simpanProfil} className="space-y-6">
                        {/* FOTO */}
                        <section className="rounded-[30px] border border-white/80 bg-white/25 p-5 shadow-[0_22px_65px_rgba(87,139,181,0.10),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-3xl sm:p-8">
                            <div className="mb-6">
                                <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#8aaccb]">
                                    01 — APPEARANCE
                                </p>

                                <h2 className="mt-2 text-xl font-bold text-[#244968]">
                                    Foto & Tampilan
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-[#789bbd]">
                                    Atur foto yang muncul pada profil dan dashboard.
                                </p>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-2">
                                {/* FOTO PROFIL */}
                                <div className="rounded-3xl border border-white/85 bg-white/30 p-5 shadow-[0_12px_35px_rgba(87,139,181,0.07),inset_0_1px_0_white] backdrop-blur-2xl sm:p-6">
                                    <div className="mb-5">
                                        <h3 className="text-sm font-bold text-[#315f85]">
                                            Foto Profil
                                        </h3>

                                        <p className="mt-1 text-xs text-[#8aa9c5]">
                                            Foto yang tampil pada akun dokter
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/75 bg-white/25 p-5 shadow-[inset_0_1px_0_white] backdrop-blur-xl sm:flex-row">
                                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-[5px] border-white/90 bg-white/35 shadow-[0_12px_35px_rgba(81,132,174,0.18)]">
                                            {preview ? (
                                                <img
                                                    src={preview}
                                                    alt="Preview foto profil"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-white/80 to-[#d7eaf8]/80 text-lg font-bold text-[#8aaccb]">
                                                    {inisial}
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
                                                className="w-full text-xs text-[#789bbd] file:mr-3 file:rounded-xl file:border file:border-white/80 file:bg-white/45 file:px-4 file:py-2.5 file:font-semibold file:text-[#527fa5] file:shadow-sm file:backdrop-blur-xl transition hover:file:bg-white/75"
                                            />

                                            <p className="mt-3 text-[11px] leading-5 text-[#91aec8]">
                                                JPG, PNG, atau WebP · Maksimal 2 MB
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* FOTO HERO */}
                                <div className="rounded-3xl border border-white/85 bg-white/30 p-5 shadow-[0_12px_35px_rgba(87,139,181,0.07),inset_0_1px_0_white] backdrop-blur-2xl sm:p-6">
                                    <div className="mb-5">
                                        <h3 className="text-sm font-bold text-[#315f85]">
                                            Foto Hero Dashboard
                                        </h3>

                                        <p className="mt-1 text-xs text-[#8aa9c5]">
                                            Gambar besar pada kartu sapaan dashboard
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/75 bg-white/25 p-5 shadow-[inset_0_1px_0_white] backdrop-blur-xl sm:flex-row">
                                        <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-2xl border-[5px] border-white/90 bg-white/35 shadow-[0_12px_35px_rgba(81,132,174,0.18)]">
                                            {previewHero ? (
                                                <img
                                                    src={previewHero}
                                                    alt="Preview foto hero dashboard"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-white/80 to-[#d7eaf8]/80 px-3 text-center text-xs font-medium leading-5 text-[#8aaccb]">
                                                    Foto belum dipilih
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
                                                className="w-full text-xs text-[#789bbd] file:mr-3 file:rounded-xl file:border file:border-white/80 file:bg-white/45 file:px-4 file:py-2.5 file:font-semibold file:text-[#527fa5] file:shadow-sm file:backdrop-blur-xl transition hover:file:bg-white/75"
                                            />

                                            <p className="mt-3 text-[11px] leading-5 text-[#91aec8]">
                                                Gunakan foto berbeda · Maksimal 2 MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* INFORMASI PRIBADI */}
                        <section className="rounded-[30px] border border-white/80 bg-white/25 p-5 shadow-[0_22px_65px_rgba(87,139,181,0.10),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-3xl sm:p-8">
                            <div className="mb-7">
                                <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#8aaccb]">
                                    02 — PERSONAL DETAILS
                                </p>

                                <h2 className="mt-2 text-xl font-bold text-[#244968]">
                                    Informasi pribadi
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

                        {/* SIMPAN */}
                        <div className="sticky bottom-4 z-10 flex flex-col justify-between gap-3 rounded-2xl border border-white/85 bg-white/45 p-4 shadow-[0_18px_50px_rgba(70,120,165,0.16),inset_0_1px_0_white] backdrop-blur-3xl sm:flex-row sm:items-center sm:px-6">
                            <p className="text-xs leading-5 text-[#8aa9c5]">
                                Perubahan akan tersimpan pada akun dokter Anda.
                            </p>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => router.push("/dokter")}
                                    className="rounded-xl border border-white/85 bg-white/40 px-5 py-3 text-sm font-semibold text-[#789bbd] shadow-[inset_0_1px_0_white] backdrop-blur-xl transition hover:bg-white/70"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={menyimpan}
                                    className="rounded-xl border border-white/30 bg-gradient-to-r from-[#477eae] to-[#78acd2] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(75,132,181,0.28),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(75,132,181,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {menyimpan
                                        ? "Menyimpan perubahan..."
                                        : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </form>

                    <footer className="py-8 text-center text-[10px] font-semibold tracking-[0.18em] text-[#9bb5cc]">
                        HARMONI HEALTHCARE · DOCTOR PROFILE
                    </footer>
                </div>
            </div>
        </main>
    );
}