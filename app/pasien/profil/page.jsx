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
        "w-full rounded-2xl border border-white/80 bg-white/45 px-4 py-3.5 text-sm text-[#2b5a84] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(75,125,165,0.06)] outline-none backdrop-blur-md transition placeholder:text-[#9db7d0] focus:border-white focus:bg-white/80 focus:ring-4 focus:ring-[#9cc9ee]/40";

    const labelClass = "mb-2 block text-xs font-semibold text-[#5f86ab]";

    const bannerClass = (isError) =>
        `mb-5 rounded-2xl border px-5 py-3.5 text-sm backdrop-blur-md ${isError
            ? "border-rose-200/80 bg-rose-50/70 text-rose-600"
            : "border-emerald-200/80 bg-emerald-50/70 text-emerald-700"
        }`;

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#eaf4fc]">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-[#cfe3f4] border-t-[#477da9]" />
                    <p className="text-sm text-[#7198bb]">Menyiapkan profilmu...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="harmoni-scene relative min-h-screen overflow-hidden px-3 py-4 text-[#244968] sm:px-8 sm:py-8 lg:px-10">
            <style>{`
                @keyframes harmoniRise {
                    from { opacity: 0; transform: translate3d(0, 16px, 0); }
                    to { opacity: 1; transform: translate3d(0, 0, 0); }
                }
                .harmoni-enter { animation: harmoniRise .9s cubic-bezier(.16,.78,.25,1) both; }

                .harmoni-scene {
                    background:
                        radial-gradient(70% 50% at 8% 0%, #ffffff 0%, transparent 62%),
                        linear-gradient(165deg, #eaf4fc 0%, #d3e6f7 55%, #c2dbf1 100%);
                }
                .hs { position: absolute; border-radius: 9999px; pointer-events: none; }
                .hs-1 { width: 520px; height: 520px; left: -150px; top: 140px; background: linear-gradient(145deg, #ffffff 0%, #9fc8ec 100%); opacity: .9; }
                .hs-2 { width: 430px; height: 430px; right: -70px; top: -90px; background: linear-gradient(145deg, #e3f0fb 0%, #6aa3d4 100%); opacity: .85; }
                .hs-3 { width: 470px; height: 470px; right: 6%; bottom: -150px; background: linear-gradient(145deg, #bcdcf5 0%, #4a86b8 100%); opacity: .8; }
                .hs-4 { width: 720px; height: 720px; left: 28%; top: 26%; border: 1px solid rgba(255,255,255,.75); }
                .hs-5 { width: 240px; height: 240px; left: 16%; bottom: 6%; background: linear-gradient(145deg, #ffffff 0%, #7fb2de 100%); opacity: .85; }

                .harmoni-window {
                    position: relative; z-index: 1;
                    background: linear-gradient(145deg, rgba(255,255,255,.34), rgba(255,255,255,.12));
                    backdrop-filter: blur(40px) saturate(1.7);
                    -webkit-backdrop-filter: blur(40px) saturate(1.7);
                    border: 1px solid rgba(255,255,255,.7);
                    box-shadow: 0 40px 100px rgba(55,105,155,.2), inset 0 1.5px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(255,255,255,.3);
                }
                .harmoni-panel {
                    position: relative; overflow: hidden; isolation: isolate;
                    background:
                        radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,.5), transparent 55%),
                        linear-gradient(145deg, rgba(255,255,255,.36), rgba(255,255,255,.1));
                    backdrop-filter: blur(28px) saturate(1.6);
                    -webkit-backdrop-filter: blur(28px) saturate(1.6);
                    border: 1px solid rgba(255,255,255,.6);
                    box-shadow: 0 10px 30px rgba(55,105,155,.1), inset 0 1px 0 rgba(255,255,255,.95);
                }
                .harmoni-chip {
                    background: rgba(255,255,255,.5);
                    border: 1px solid rgba(255,255,255,.85);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,.95);
                    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                }
                .harmoni-focus:focus-visible { outline: 2px solid #3f78a8; outline-offset: 3px; }
                .harmoni-title {
                    background: linear-gradient(100deg, #315f88 8%, #6798c5 50%, #3e78a8 92%);
                    -webkit-background-clip: text; background-clip: text; color: transparent;
                }
                @media (prefers-reduced-motion: reduce) {
                    .harmoni-enter { animation: none !important; }
                }
            `}</style>

            <div className="hs hs-1" aria-hidden="true" />
            <div className="hs hs-2" aria-hidden="true" />
            <div className="hs hs-3" aria-hidden="true" />
            <div className="hs hs-4" aria-hidden="true" />
            <div className="hs hs-5" aria-hidden="true" />

            <div className="harmoni-window harmoni-enter mx-auto max-w-[1180px] rounded-[32px] p-4 sm:rounded-[40px] sm:p-6">
                {/* ================= HEADER ================= */}
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-extrabold tracking-[0.3em] text-[#315f88] sm:text-2xl">
                            HARMONI
                        </h1>
                        <span className="hidden h-6 w-px bg-[#8fb6d8]/60 md:block" />
                        <p className="hidden text-xs tracking-[0.08em] text-[#6f93b6] md:block">
                            Hospital Information System
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/pasien")}
                        className="harmoni-chip harmoni-focus group flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                    >
                        <span className="transition group-hover:-translate-x-1">←</span>
                        Dashboard
                    </button>
                </header>

                {/* ================= JUDUL ================= */}
                <div className="mt-8 px-1">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        <span className="harmoni-title">Profil saya</span>
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-[#6f93b6]">
                        Hai, {namaPasien.split(" ")[0]}. Pastikan informasi pribadimu selalu
                        lengkap dan terbaru.
                    </p>
                </div>

                {pesan && (
                    <div className={`${bannerClass(error)} mt-6 mb-0`} role="status">
                        {pesan}
                    </div>
                )}

                {/* ================= BODY ================= */}
                <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
                    {/* ---- Kolom kiri: foto & akun ---- */}
                    <aside className="grid h-fit gap-5">
                        <section
                            className="harmoni-panel harmoni-enter flex flex-col items-center rounded-[30px] px-6 py-9 text-center"
                            style={{ animationDelay: "100ms" }}
                        >
                            <div className="relative">
                                <div className="absolute -inset-4 rounded-full border border-white/80" />

                                <div className="group relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-[6px] border-white/90 bg-gradient-to-br from-[#d4e8f7] to-[#eef8fe] text-4xl font-bold text-[#78a8d0] shadow-[0_22px_50px_rgba(60,110,160,0.28)]">
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
                                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-[#2b5a84]/45 text-xs font-semibold text-white opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100"
                                    >
                                        {uploadingFoto ? "Mengunggah..." : "Ubah foto"}
                                    </label>
                                </div>

                                <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-[3px] border-white bg-[#7fcaae]" />
                            </div>

                            <input
                                id="foto-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleUploadFoto}
                                disabled={uploadingFoto}
                                className="hidden"
                            />

                            <h3 className="mt-7 text-xl font-semibold tracking-tight text-[#2b5a84]">
                                {namaPasien}
                            </h3>
                            <p className="mt-1 max-w-full truncate text-xs text-[#7e9fc0]">
                                {form.email || "Email belum diisi"}
                            </p>

                            <span className="harmoni-chip mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#5f8fb8]">
                                <span className="h-2 w-2 rounded-full bg-[#7fcaae]" />
                                Akun aktif
                            </span>

                            <label
                                htmlFor="foto-input"
                                className="harmoni-chip harmoni-focus mt-6 cursor-pointer rounded-2xl px-5 py-3 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                            >
                                {uploadingFoto ? "Mengunggah..." : "Ganti foto"}
                            </label>
                            <p className="mt-3 text-[11px] text-[#8aa9c6]">
                                JPG, PNG, atau WebP · maksimal 2 MB
                            </p>
                        </section>

                        <section
                            className="harmoni-panel harmoni-enter rounded-[26px] p-6"
                            style={{ animationDelay: "180ms" }}
                        >
                            <h3 className="text-sm font-semibold text-[#2b5a84]">Akun HARMONI</h3>
                            <p className="mt-2 text-xs leading-6 text-[#6f93b6]">
                                Data akunmu dipakai untuk mengakses layanan HARMONI. Pastikan
                                email dan nomor telepon yang terdaftar masih bisa kamu gunakan.
                            </p>
                        </section>
                    </aside>

                    {/* ---- Kolom kanan: form ---- */}
                    <div className="grid gap-5">
                        <form
                            onSubmit={simpanProfil}
                            className="harmoni-panel harmoni-enter rounded-[30px] p-6 sm:p-8"
                            style={{ animationDelay: "140ms" }}
                        >
                            <h3 className="text-xl font-semibold tracking-tight text-[#2b5a84]">
                                Informasi pribadi
                            </h3>
                            <p className="mt-1.5 text-sm text-[#6f93b6]">
                                Informasi dasar tentang dirimu.
                            </p>

                            <div className="mb-2 block min-h-[44px] text-sm font-semibold">
                                <div>
                                    <label htmlFor="full_name" className={labelClass}>
                                        Nama Lengkap
                                    </label>
                                    <input
                                        id="full_name"
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
                                    <label htmlFor="username" className={labelClass}>
                                        Username
                                    </label>
                                    <input
                                        id="username"
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
                                    <label htmlFor="email" className={labelClass}>
                                        Email
                                    </label>
                                    <input
                                        id="email"
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
                                    <label htmlFor="phone" className={labelClass}>
                                        Nomor Telepon
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="Nomor telepon"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="birth_date" className={labelClass}>
                                        Tanggal Lahir
                                    </label>
                                    <input
                                        id="birth_date"
                                        type="date"
                                        name="birth_date"
                                        value={form.birth_date}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address" className={labelClass}>
                                        Alamat
                                    </label>
                                    <input
                                        id="address"
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="Alamat tempat tinggal"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-[#7e9fc0]">
                                    Simpan perubahan informasi pribadimu.
                                </p>

                                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => router.push("/pasien")}
                                        className="harmoni-chip harmoni-focus rounded-xl px-5 py-3 text-sm font-semibold text-[#5f86ab] transition hover:bg-white/80"
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={menyimpan}
                                        className="harmoni-focus rounded-xl bg-gradient-to-br from-[#5c96c4] to-[#407ba9] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_26px_rgba(63,121,169,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {menyimpan ? "Menyimpan..." : "Simpan perubahan"}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <form
                            onSubmit={handleGantiPassword}
                            className="harmoni-panel harmoni-enter rounded-[30px] p-6 sm:p-8"
                            style={{ animationDelay: "220ms" }}
                        >
                            <h3 className="text-xl font-semibold tracking-tight text-[#2b5a84]">
                                Ganti password
                            </h3>
                            <p className="mt-1.5 text-sm text-[#6f93b6]">
                                Perbarui password akunmu untuk menjaga keamanan data.
                            </p>

                            {pesanPassword && (
                                <div className={`${bannerClass(errorPassword)} mt-5 mb-0`} role="status">
                                    {pesanPassword}
                                </div>
                            )}

                      <div className="mt-7 grid gap-5 sm:grid-cols-3">
                                <div>
                                <label
                                
                                htmlFor="password_lama"
                                className="mb-2 flex h-12 items-end text-sm font-semibold">
                                    Password Saat Ini
                                    </label>
                                    
                                    <input
                                        id="password_lama"
                                        type="password"
                                        autoComplete="current-password"
                                        value={passwordForm.password_lama}
                                        onChange={(e) =>
                                            setPasswordForm((p) => ({ ...p, password_lama: e.target.value }))
                                        }
                                        className={inputClass}
                                        placeholder="Password lama"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password_baru" className="mb-2 flex h-12 items-end text-sm font-semibold">
                                        Password Baru
                                    </label>
                                    <input
                                        id="password_baru"
                                        type="password"
                                        autoComplete="new-password"
                                        value={passwordForm.password_baru}
                                        onChange={(e) =>
                                            setPasswordForm((p) => ({ ...p, password_baru: e.target.value }))
                                        }
                                        className={inputClass}
                                        placeholder="Minimal 6 karakter"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="konfirmasi_password_baru" className="mb-2 flex h-12 items-end text-sm font-semibold">
                                        Konfirmasi Password Baru
                                    </label>
                                    <input
                                        id="konfirmasi_password_baru"
                                        type="password"
                                        autoComplete="new-password"
                                        value={passwordForm.konfirmasi_password_baru}
                                        onChange={(e) =>
                                            setPasswordForm((p) => ({
                                                ...p,
                                                konfirmasi_password_baru: e.target.value,
                                            }))
                                        }
                                        className={inputClass}
                                        placeholder="Ulangi password baru"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end border-t border-white/60 pt-6">
                                <button
                                    type="submit"
                                    disabled={
                                        mengubahPassword ||
                                        !passwordForm.password_lama ||
                                        !passwordForm.password_baru
                                    }
                                    className="harmoni-focus rounded-xl bg-gradient-to-br from-[#5c96c4] to-[#407ba9] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_26px_rgba(63,121,169,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {mengubahPassword ? "Memperbarui..." : "Perbarui password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/50 px-1 pt-4 text-[10px] text-[#7e9fc0]">
                    <span className="font-bold tracking-[0.18em]">HARMONI HEALTHCARE</span>
                    <span>Profil Pasien</span>
                </footer>
            </div>
        </main>
    );
}
