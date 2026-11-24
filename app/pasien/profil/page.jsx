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
        birth_date: "",
    });

    const [foto, setFoto] = useState("");
    const [uploadingFoto, setUploadingFoto] = useState(false);
    const [loading, setLoading] = useState(true);
    const [menyimpan, setMenyimpan] = useState(false);
    const [pesan, setPesan] = useState("");
    const [error, setError] = useState(false);

    // State ganti password
    const [passwordForm, setPasswordForm] = useState({
        password_lama: "",
        password_baru: "",
        konfirmasi_password_baru: "",
    });
    const [mengubahPassword, setMengubahPassword] = useState(false);
    const [pesanPassword, setPesanPassword] = useState("");
    const [errorPassword, setErrorPassword] = useState(false);

    useEffect(() => {
        async function ambilProfil() {
            try {
                const response = await fetch("/api/me");
                const data = await response.json();

                if (!response.ok || !data.success) {
                    router.push("/login");
                    return;
                }

                if (data.user?.role !== "pasien") {
                    router.push("/login");
                    return;
                }

                const user = data.user;

                setForm({
                    username: user.username || "",
                    email: user.email || "",
                    full_name: user.full_name || "",
                    phone: user.phone || "",
                    address: user.address || "",
                    birth_date: user.birth_date
                        ? String(user.birth_date).slice(0, 10)
                        : "",
                });

                setFoto(user.photo || "");
            } catch (err) {
                console.error("Gagal mengambil profil:", err);
                setPesan("Profil gagal dimuat. Silakan coba lagi.");
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

    async function handleUploadFoto(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setPesan("Ukuran foto maksimal 2 MB.");
            setError(true);
            return;
        }

        const formData = new FormData();
        formData.append("photo", file);
        formData.append("username", form.username);
        formData.append("email", form.email);
        formData.append("full_name", form.full_name);
        formData.append("phone", form.phone);
        formData.append("address", form.address);
        formData.append("birth_date", form.birth_date);

        setUploadingFoto(true);
        setPesan("");
        setError(false);

        try {
            const res = await fetch("/api/me", {
                method: "PUT",
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setFoto(data.user.photo || "");
                setPesan("Foto profil berhasil diperbarui!");
                setError(false);
            } else {
                setPesan(data.message || "Gagal mengunggah foto.");
                setError(true);
            }
        } catch (err) {
            console.error("Gagal upload foto:", err);
            setPesan("Terjadi kesalahan saat mengunggah foto.");
            setError(true);
        } finally {
            setUploadingFoto(false);
        }
    }

    async function handleGantiPassword(e) {
        e.preventDefault();
        setPesanPassword("");
        setErrorPassword(false);

        if (passwordForm.password_baru.length < 6) {
            setPesanPassword("Password baru minimal 6 karakter.");
            setErrorPassword(true);
            return;
        }

        if (passwordForm.password_baru !== passwordForm.konfirmasi_password_baru) {
            setPesanPassword("Konfirmasi password baru tidak cocok.");
            setErrorPassword(true);
            return;
        }

        setMengubahPassword(true);
        try {
            const res = await fetch("/api/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password_lama: passwordForm.password_lama,
                    password_baru: passwordForm.password_baru,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setPesanPassword(data.message || "Password berhasil diubah!");
                setErrorPassword(false);
                setPasswordForm({
                    password_lama: "",
                    password_baru: "",
                    konfirmasi_password_baru: "",
                });
            } else {
                setPesanPassword(data.message || "Gagal mengganti password.");
                setErrorPassword(true);
            }
        } catch {
            setPesanPassword("Terjadi kesalahan saat mengganti password.");
            setErrorPassword(true);
        } finally {
            setMengubahPassword(false);
        }
    }

    async function simpanProfil(e) {
        e.preventDefault();

        setMenyimpan(true);
        setPesan("");
        setError(false);

        try {
            const response = await fetch("/api/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Profil gagal diperbarui.");
                setError(true);
                return;
            }

            const user = data.user;

            setForm({
                username: user.username || "",
                email: user.email || "",
                full_name: user.full_name || "",
                phone: user.phone || "",
                address: user.address || "",
                birth_date: user.birth_date
                    ? String(user.birth_date).slice(0, 10)
                    : "",
            });

            setFoto(user.photo || "");
            setPesan("Profil berhasil diperbarui!");
        } catch (err) {
            console.error("Gagal menyimpan profil:", err);
            setPesan("Terjadi kesalahan saat menyimpan profil.");
            setError(true);
        } finally {
            setMenyimpan(false);
        }
    }

    const namaPasien = form.full_name || "Pasien HARMONI";

    const inisial = namaPasien
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((kata) => kata[0])
        .join("")
        .toUpperCase();

    const inputClass =
        "w-full rounded-2xl border border-[#DCEAF6] bg-[#F8FCFF] px-4 py-3.5 text-sm text-[#31577F] outline-none transition placeholder:text-[#A6BCD0] focus:border-[#8BB9DF] focus:bg-white focus:ring-4 focus:ring-[#DCECF9]";

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#EDF6FD]">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-[#D6E8F6] border-t-[#6EA5D0]" />
                    <p className="text-sm text-[#7FA4C4]">
                        Menyiapkan profilmu...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#EDF6FD] px-4 py-7 sm:px-8 sm:py-10">

            <div className="pointer-events-none absolute -left-40 -top-32 h-[450px] w-[450px] rounded-full bg-[#D5EAF9]/80 blur-[110px]" />

            <div className="pointer-events-none absolute -right-40 top-[450px] h-[500px] w-[500px] rounded-full bg-[#C7E2F5]/60 blur-[120px]" />

            <div className="relative mx-auto max-w-6xl">
                <header className="mb-8 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-extrabold tracking-[0.25em] text-[#79A6CC]">
                            HARMONI HEALTHCARE
                        </p>

                        <p className="mt-2 text-xs text-[#9AB6CE]">
                            Your personal health space
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/pasien")}
                        className="group flex items-center gap-2 rounded-full border border-white/90 bg-white/70 px-4 py-3 text-xs font-semibold text-[#5D8DB5] shadow-sm backdrop-blur-xl transition hover:bg-white"
                    >
                        <span className="transition group-hover:-translate-x-1">
                            ←
                        </span>
                        Dashboard
                    </button>
                </header>
                <section className="relative mb-8 overflow-hidden rounded-[32px] border border-white/90 bg-gradient-to-br from-[#DCEFFA] via-[#F5FBFF] to-[#D5E8F8] p-6 shadow-[0_22px_60px_rgba(89,145,190,0.12)] sm:p-10">

                    <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full border-[38px] border-white/35" />

                    <div className="pointer-events-none absolute right-24 top-24 h-32 w-32 rounded-full bg-white/40 blur-3xl" />

                    <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-64 rounded-tl-[100px] bg-white/20" />

                    <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">

                        <div className="max-w-xl">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/65 px-4 py-2 text-[10px] font-bold tracking-[0.17em] text-[#6E9FC5] backdrop-blur-md">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#8DBDDF]" />
                                MY PERSONAL SPACE
                            </div>

                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#294D70] sm:text-5xl">
                                Your profile,
                                <br />
                                <span className="font-medium text-[#78A8D0]">
                                    your little space.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-md text-sm leading-7 text-[#7F9FBD]">
                                Hai, {namaPasien.split(" ")[0]}!
                                <br />
                                Yuk, pastikan informasi pribadimu
                                selalu lengkap dan terbaru.
                            </p>

                            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#7CA6C8]">
                                <span className="text-base">✦</span>
                                A little care starts with you.
                            </div>
                        </div>

                        <div className="relative mx-auto sm:mx-0">
                            <div className="absolute -inset-5 rounded-full border border-white/70" />

                            <div className="absolute -right-1 top-6 h-5 w-5 rounded-full border-4 border-[#E4F1FA] bg-[#A8D8C7]" />

                            <div className="group relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-[7px] border-white/90 bg-gradient-to-br from-[#D4E8F7] to-[#EEF8FE] text-3xl font-bold text-[#78A8D0] shadow-[0_18px_45px_rgba(87,145,191,0.2)] sm:h-44 sm:w-44">
                                {foto ? (
                                    <img
                                        src={foto}
                                        alt="Foto profil pasien"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    inisial
                                )}

                                <label
                                    htmlFor="foto-input"
                                    className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                    <span>📷</span>
                                    <span>{uploadingFoto ? "Mengunggah..." : "Ubah Foto"}</span>
                                </label>
                            </div>

                            <input
                                id="foto-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleUploadFoto}
                                disabled={uploadingFoto}
                                className="hidden"
                            />

                            <label
                                htmlFor="foto-input"
                                className="absolute -bottom-3 left-1/2 -translate-x-1/2 cursor-pointer whitespace-nowrap rounded-full border border-white/90 bg-white/90 px-4 py-1.5 text-[10px] font-bold tracking-wide text-[#527FA5] shadow-sm backdrop-blur-md transition hover:bg-white hover:text-[#31577F]"
                            >
                                {uploadingFoto ? "Mengunggah..." : "✎ Ganti Foto"}
                            </label>
                        </div>
                    </div>
                </section>
                {pesan && (
                    <div
                        className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${error
                            ? "border-rose-100 bg-rose-50 text-rose-600"
                            : "border-emerald-100 bg-emerald-50 text-emerald-700"
                            }`}
                    >
                        {error ? "!" : "✓"} &nbsp; {pesan}
                    </div>
                )}

                <form onSubmit={simpanProfil} className="space-y-6">
                    <section className="rounded-[30px] border border-white/90 bg-white/75 p-6 shadow-[0_16px_50px_rgba(89,145,190,0.08)] backdrop-blur-xl sm:p-9">

                        <div className="mb-8 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#8AB2D2]">
                                    01 / ABOUT YOU
                                </p>

                                <h2 className="mt-2 text-xl font-bold text-[#31577F]">
                                    Informasi Pribadi
                                </h2>

                                <p className="mt-2 text-sm text-[#91ADC6]">
                                    Informasi dasar tentang dirimu.
                                </p>
                            </div>

                            <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5FC] text-xl text-[#78A8D0] sm:flex">
                                ♡
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                            <div>
                                <label className="mb-2.5 block text-xs font-semibold text-[#5F85A8]">
                                    Nama Lengkap
                                </label>

                                <input
                                    type="text"
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Nama lengkapmu"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2.5 block text-xs font-semibold text-[#5F85A8]">
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
                                <label className="mb-2.5 block text-xs font-semibold text-[#5F85A8]">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Email aktif"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2.5 block text-xs font-semibold text-[#5F85A8]">
                                    Nomor Telepon
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Nomor telepon"
                                />
                            </div>

                            <div>
                                <label className="mb-2.5 block text-xs font-semibold text-[#5F85A8]">
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
                                <label className="mb-2.5 block text-xs font-semibold text-[#5F85A8]">
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
                    <section className="overflow-hidden rounded-[30px] border border-white/90 bg-white/75 shadow-[0_16px_50px_rgba(89,145,190,0.08)] backdrop-blur-xl">

                        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E1F0FA] to-[#D5E8F7] text-2xl text-[#75A6CE]">
                                ✧
                            </div>

                            <div className="flex-1">
                                <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#8AB2D2]">
                                    02 / YOUR ACCOUNT
                                </p>

                                <h2 className="mt-2 text-lg font-bold text-[#31577F]">
                                    Akun HARMONI
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-[#91ADC6]">
                                    Data akunmu digunakan untuk
                                    mengakses layanan HARMONI.
                                </p>
                            </div>

                            <div className="rounded-full bg-[#EAF5FC] px-4 py-2 text-[10px] font-bold tracking-wide text-[#76A5C9]">
                                ● ACCOUNT ACTIVE
                            </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-[#DCEAF6] to-transparent" />

                        <div className="px-6 py-5 sm:px-8">
                            <p className="text-xs leading-6 text-[#91ADC6]">
                                Pastikan email dan nomor telepon yang
                                terdaftar masih bisa kamu gunakan.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 03: GANTI PASSWORD */}
                    <section className="rounded-[30px] border border-white/90 bg-white/75 p-6 shadow-[0_16px_50px_rgba(89,145,190,0.08)] backdrop-blur-xl sm:p-9">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#8AB2D2]">
                                    03 / KEAMANAN
                                </p>
                                <h2 className="mt-2 text-xl font-bold text-[#31577F]">
                                    Ganti Password
                                </h2>
                                <p className="mt-2 text-sm text-[#91ADC6]">
                                    Perbarui password akunmu untuk menjaga keamanan data.
                                </p>
                            </div>
                            <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5FC] text-xl text-[#78A8D0] sm:flex">
                                🔒
                            </div>
                        </div>

                        {pesanPassword && (
                            <div
                                className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${errorPassword
                                    ? "border-rose-100 bg-rose-50 text-rose-600"
                                    : "border-emerald-100 bg-emerald-50 text-emerald-700"
                                }`}
                            >
                                {errorPassword ? "!" : "✓"} &nbsp; {pesanPassword}
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-3">
                            <div>
                                <label className="mb-2.5 block text-xs font-semibold text-[#5F85A8]">
                                    Password Saat Ini
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.password_lama}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, password_lama: e.target.value }))}
                                    className={inputClass}
                                    placeholder="Masukkan password lama"
                                />
                            </div>

                            <div>
                                <label className="mb-2.5 block text-xs font-semibold text-[#5F85A8]">
                                    Password Baru
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.password_baru}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, password_baru: e.target.value }))}
                                    className={inputClass}
                                    placeholder="Minimal 6 karakter"
                                />
                            </div>

                            <div>
                                <label className="mb-2.5 block text-xs font-semibold text-[#5F85A8]">
                                    Konfirmasi Password Baru
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.konfirmasi_password_baru}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, konfirmasi_password_baru: e.target.value }))}
                                    className={inputClass}
                                    placeholder="Ulangi password baru"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleGantiPassword}
                                disabled={mengubahPassword || !passwordForm.password_lama || !passwordForm.password_baru}
                                className="rounded-xl bg-gradient-to-r from-[#75ACD5] to-[#5B96C4] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(91,150,196,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {mengubahPassword ? "Memperbarui..." : "Perbarui Password"}
                            </button>
                        </div>
                    </section>
                    <div className="flex flex-col justify-between gap-4 rounded-[26px] border border-white/90 bg-white/75 p-5 shadow-[0_16px_45px_rgba(89,145,190,0.09)] backdrop-blur-xl sm:flex-row sm:items-center sm:px-7">

                        <div>
                            <p className="text-sm font-semibold text-[#527FA5]">
                                Everything looks good?
                            </p>

                            <p className="mt-1 text-xs text-[#91ADC6]">
                                Simpan perubahan informasimu.
                            </p>
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => router.push("/pasien")}
                                className="rounded-xl border border-[#DCEAF6] bg-white px-5 py-3 text-sm font-semibold text-[#7FA4C4] transition hover:bg-[#F5FAFE]"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={menyimpan}
                                className="rounded-xl bg-gradient-to-r from-[#75ACD5] to-[#5B96C4] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(91,150,196,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(91,150,196,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {menyimpan
                                    ? "Menyimpan..."
                                    : "Simpan Perubahan  →"}
                            </button>
                        </div>
                    </div>
                </form>

                <footer className="py-8 text-center">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-[#9BB9D2]">
                        MADE WITH CARE · HARMONI HEALTHCARE
                    </p>
                </footer>
            </div>
        </main>
    );
}