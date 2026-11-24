"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RekamMedisPage() {
    const router = useRouter();

    const [pasien, setPasien] = useState([]);
    const [daftarObat, setDaftarObat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pasienDipilih, setPasienDipilih] = useState(null);
    const [pesan, setPesan] = useState("");
    const [loadingSimpan, setLoadingSimpan] = useState(false);

    const [form, setForm] = useState({
        diagnosis: "",
        tindakan: "",
        catatan: ""
    });

    const [resep, setResep] = useState([
        { obat_id: "", jumlah: 1 }
    ]);

    async function ambilData() {
        try {
            const response = await fetch("/api/dokter/rekam-medis");
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    router.push("/login");
                    return;
                }

                setPesan(data.message || "Data gagal dimuat.");
                return;
            }

            setPasien(data.data || []);
            setDaftarObat(data.medicines || []);

        } catch (error) {
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

    function bukaForm(item) {
        setPasienDipilih(item);

        setForm({
            diagnosis: "",
            tindakan: "",
            catatan: ""
        });

        setResep([
            { obat_id: "", jumlah: 1 }
        ]);

        setPesan("");
    }

    function tutupForm() {
        setPasienDipilih(null);
        setPesan("");
    }

    function tambahObat() {
        setResep([
            ...resep,
            { obat_id: "", jumlah: 1 }
        ]);
    }

    function hapusObat(index) {
        setResep(resep.filter((item, i) => i !== index));
    }

    function ubahResep(index, field, value) {
        const dataBaru = [...resep];

        dataBaru[index] = {
            ...dataBaru[index],
            [field]: value
        };

        setResep(dataBaru);
    }

    async function simpanRekamMedis(e) {
        e.preventDefault();
        setPesan("");

        if (resep.length === 0 || resep.some(item => !item.obat_id)) {
            setPesan("Pilih minimal satu obat.");
            return;
        }

        if (resep.some(item => Number(item.jumlah) <= 0)) {
            setPesan("Jumlah obat harus lebih dari 0.");
            return;
        }

        const idObat = resep.map(item => item.obat_id);

        if (new Set(idObat).size !== idObat.length) {
            setPesan("Obat yang sama tidak boleh dipilih dua kali.");
            return;
        }

        setLoadingSimpan(true);

        try {
            const response = await fetch("/api/dokter/rekam-medis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    appointment_id: pasienDipilih.appointment_id,
                    ...form,
                    resep
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Rekam medis gagal disimpan.");
                return;
            }

            setPasienDipilih(null);

            setForm({
                diagnosis: "",
                tindakan: "",
                catatan: ""
            });

            setResep([
                { obat_id: "", jumlah: 1 }
            ]);

            setPesan("Rekam medis dan resep berhasil disimpan.");

            await ambilData();

        } catch (error) {
            setPesan("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setLoadingSimpan(false);
        }
    }

    function formatTanggal(tanggal) {
        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    const inputStyle =
        "w-full rounded-xl border border-white/75 bg-white/65 px-4 py-3 text-sm text-[#31577f] shadow-[inset_0_1px_0_rgba(255,255,255,.9)] outline-none transition placeholder:text-[#9bb2ca] focus:border-[#9bbbd9] focus:bg-white/85 focus:ring-2 focus:ring-[#9bbbd9]/25";

    return (
        <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_90%_8%,rgba(194,222,247,.72),transparent_34%),radial-gradient(ellipse_at_8%_76%,rgba(220,237,255,.72),transparent_36%),linear-gradient(125deg,#f4f9ff_0%,#e8f2fc_48%,#dcecff_100%)] px-5 pb-12 pt-8 text-[#31577f] sm:px-8 lg:px-[6.2%]">
            <div aria-hidden="true" className="pointer-events-none absolute -left-36 top-[360px] h-[380px] w-[380px] rounded-full bg-white/45 blur-[100px]" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-[650px] h-[420px] w-[420px] rounded-full bg-[#bfdcf6]/40 blur-[110px]" />
            <div className="relative mx-auto max-w-[1500px]">
                {/* Header — mengikuti header halaman master HARMONI */}
                <header className="flex items-center justify-between gap-5 border-b border-[#a8c5e1]/30 pb-5">
                    <button type="button" onClick={() => router.push("/dokter")} className="group text-left">
                        <span className="block text-[27px] font-bold tracking-[.16em] text-[#315f8c] sm:text-[32px]">HARMONI</span>
                        <span className="mt-1 block text-[9px] tracking-[.22em] text-[#779bc5] sm:text-[11px]">HOSPITAL INFORMATION SYSTEM</span>
                    </button>
                    <button type="button" onClick={() => router.push("/dokter")} className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/40 px-4 py-2.5 text-xs font-medium text-[#5685b7] shadow-[0_7px_22px_rgba(92,139,187,.07)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/75 sm:px-5 sm:text-sm">
                        <span>←</span> Dashboard
                    </button>
                </header>

                {/* Hero — editorial, tanpa kartu statistik generik */}
                <section className="relative mb-10 mt-12 overflow-hidden border-b border-[#a8c5e1]/25 pb-10 lg:mb-14 lg:mt-[68px] lg:pb-14">
                    <div aria-hidden="true" className="pointer-events-none absolute right-0 top-2 hidden h-[190px] w-[30%] border-l border-[#a8c5e1]/25 md:block">
                        <span className="absolute -left-[3px] top-0 h-1.5 w-1.5 rounded-full bg-[#9bbbd9]" />
                        <span className="absolute left-7 top-5 text-[10px] tracking-[.2em] text-[#9ab4d0]">H / 01</span>
                        <span className="absolute bottom-3 left-7 text-[10px] tracking-[.16em] text-[#9ab4d0]">PATIENT CARE</span>
                    </div>
                    <div className="relative max-w-[900px]">
                        <p className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-semibold tracking-[.22em] text-[#7199c5] sm:text-xs">
                            <span>DOCTOR WORKSPACE</span><span className="text-[#b0c6dc]">/</span><span>MEDICAL RECORDS</span>
                        </p>
                        <h1 className="max-w-[820px] text-[clamp(2.7rem,6.3vw,6rem)] font-light leading-[1.02] tracking-[-.055em] text-[#31577f]">
                            Catatan pasien<span className="text-[#8eafd0]">.</span>
                            <br />
                            <span className="font-medium text-[#7099c3]">Tersimpan terarah.</span>
                        </h1>
                        <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <p className="max-w-[540px] text-sm leading-7 text-[#7794b6] sm:text-base">
                                Hasil pemeriksaan dan resep untuk pasien dengan janji temu yang telah disetujui.
                            </p>
                            <div className="flex shrink-0 items-center gap-4 border-l border-[#a8c5e1]/45 pl-4 sm:mb-1">
                                <span className="text-[42px] font-light leading-none tracking-[-.05em] text-[#426b94] tabular-nums">{String(pasien.length).padStart(2, "0")}</span>
                                <span className="max-w-[115px] text-[10px] leading-[1.7] tracking-[.14em] text-[#91abc7]">PASIEN<br />MENUNGGU PEMERIKSAAN</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Directory */}
                <section className="overflow-hidden rounded-[26px] border border-white/75 bg-white/30 shadow-[0_22px_60px_rgba(76,118,163,.09),inset_0_1px_0_rgba(255,255,255,.85)] backdrop-blur-2xl">
                    <div className="flex flex-col justify-between gap-5 border-b border-white/65 px-5 py-6 sm:flex-row sm:items-end sm:px-8 sm:py-7">
                        <div>
                            <p className="text-[10px] font-semibold tracking-[.2em] text-[#83a5c8]">01 — DIRECTORY</p>
                            <h2 className="mt-2 text-2xl font-medium tracking-[-.025em] text-[#315574]">Daftar pasien</h2>
                            <p className="mt-2 text-sm text-[#7898b7]">Janji temu yang telah disetujui.</p>
                        </div>
                        <button type="button" onClick={ambilData} disabled={loading} className="inline-flex items-center gap-3 self-start rounded-full border border-white/80 bg-white/45 px-4 py-2.5 text-xs font-medium text-[#527da3] shadow-sm backdrop-blur-xl transition hover:bg-white/75 disabled:opacity-60 sm:self-auto">
                            <span className="text-base">↻</span> {loading ? "Memuat..." : "Perbarui data"}
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#b9d1e8]/25 bg-white/15 px-5 py-4 sm:px-8">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-light tabular-nums text-[#527da3]">{String(pasien.length).padStart(2, "0")}</span>
                            <span className="text-[10px] font-medium tracking-[.17em] text-[#8aa8c8]">PASIEN TERDAFTAR</span>
                        </div>
                        <span className="text-xs text-[#8aa3bf]">HARMONI · MEDICAL SERVICE</span>
                    </div>

                    {pesan && <div className="mx-5 mt-5 rounded-xl border border-[#c9dff2] bg-[#edf6fd]/80 px-4 py-3 text-sm text-[#527da3] sm:mx-8">{pesan}</div>}

                    {loading ? (
                        <div className="flex min-h-48 items-center justify-center text-sm text-[#7898b7]">Memuat data pasien...</div>
                    ) : pasien.length === 0 ? (
                        <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
                            <span className="mb-4 h-8 w-8 rounded-full border border-[#b9d4ec] bg-white/50 shadow-[0_0_0_7px_rgba(255,255,255,.22)]" />
                            <h3 className="text-base font-medium text-[#42698d]">Belum ada pasien</h3>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-[#7898b7]">Belum ada janji temu yang disetujui dan menunggu pemeriksaan.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto px-4 pb-4 pt-2 sm:px-7">
                            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
                                <thead>
                                    <tr className="text-[9px] font-semibold tracking-[.17em] text-[#91abc7]">
                                        <th className="px-4 py-3 font-semibold">NO.</th>
                                        <th className="px-4 py-3 font-semibold">PASIEN</th>
                                        <th className="px-4 py-3 font-semibold">TANGGAL KONSULTASI</th>
                                        <th className="px-4 py-3 font-semibold">POLI</th>
                                        <th className="px-4 py-3 font-semibold">STATUS</th>
                                        <th className="px-4 py-3 text-right font-semibold">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pasien.map((item, index) => (
                                        <tr key={item.appointment_id} className="group bg-white/40 text-sm shadow-[0_4px_16px_rgba(76,118,163,.035)] transition hover:bg-white/70">
                                            <td className="rounded-l-xl border-y border-l border-white/75 px-4 py-4 text-xs tabular-nums text-[#9ab2cc]">{String(index + 1).padStart(2, "0")}</td>
                                            <td className="border-y border-white/75 px-4 py-4">
                                                <p className="font-medium text-[#315574]">{item.nama_pasien}</p>
                                                <p className="mt-1 text-xs text-[#8aa3bf]">{item.telepon_pasien || "Telepon belum tersedia"}</p>
                                                <p className="mt-2 max-w-[260px] truncate text-xs text-[#7898b7]" title={item.keluhan || ""}>{item.keluhan || "Tidak ada keluhan"}</p>
                                            </td>
                                            <td className="border-y border-white/75 px-4 py-4 text-xs text-[#52799c]">{formatTanggal(item.tanggal_booking)}</td>
                                            <td className="border-y border-white/75 px-4 py-4 text-xs text-[#52799c]">{item.nama_poli || "—"}</td>
                                            <td className="border-y border-white/75 px-4 py-4"><span className="inline-flex items-center gap-2 rounded-full border border-[#c7ddef]/70 bg-[#eaf4fc]/70 px-3 py-1.5 text-[10px] text-[#6b96bd]"><span className="h-1.5 w-1.5 rounded-full bg-[#83b5dc]" /> Disetujui</span></td>
                                            <td className="rounded-r-xl border-y border-r border-white/75 px-4 py-4 text-right">
                                                <button type="button" onClick={() => bukaForm(item)} className="inline-flex items-center gap-2 rounded-full border border-[#c3d9ed]/70 bg-[#e8f3fc]/75 px-4 py-2 text-xs font-medium text-[#527da3] transition hover:border-[#9fc2e2] hover:bg-white/85">Buat rekam medis <span>↗</span></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && pasien.length > 0 && <div className="border-t border-white/60 px-5 py-4 text-[10px] tracking-wide text-[#91abc7] sm:px-8">MENAMPILKAN {pasien.length} PASIEN · HARMONI HEALTHCARE</div>}
                </section>

                <footer className="mt-8 flex flex-wrap justify-between gap-3 text-[9px] tracking-[.18em] text-[#8ca8c7]">
                    <span>HARMONI · 2026</span><span>CARE THROUGH CONNECTION</span>
                </footer>

                {pasienDipilih && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1d3c5c]/35 p-3 backdrop-blur-md sm:p-5">
                        <div className="my-auto w-full max-w-2xl rounded-[24px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,.96),rgba(235,245,253,.94))] p-5 shadow-[0_25px_80px_rgba(31,73,112,.22)] sm:p-8">
                            <div className="flex items-start justify-between gap-4 border-b border-[#dce9f5] pb-5">
                                <div>
                                    <p className="text-[10px] font-semibold tracking-[0.18em] text-[#83a5c8]">CONSULTATION NOTE</p>
                                    <h2 className="mt-2 text-xl font-semibold text-[#315574]">Form rekam medis</h2>
                                    <p className="mt-1 text-sm text-[#7898b7]">Pasien: {pasienDipilih.nama_pasien}</p>
                                </div>
                                <button onClick={tutupForm} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white bg-white/65 text-xl text-[#7898b7] transition hover:bg-white" aria-label="Tutup form">×</button>
                            </div>
                            <form onSubmit={simpanRekamMedis} className="mt-6 space-y-5">
                                <div><label className="mb-2 block text-sm font-medium text-[#42698d]">Diagnosis</label><textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} rows="3" required placeholder="Masukkan hasil diagnosis pasien" className={inputStyle} /></div>
                                <div><label className="mb-2 block text-sm font-medium text-[#42698d]">Tindakan medis</label><textarea name="tindakan" value={form.tindakan} onChange={handleChange} rows="3" required placeholder="Masukkan tindakan medis yang dilakukan" className={inputStyle} /></div>
                                <div><label className="mb-2 block text-sm font-medium text-[#42698d]">Catatan tambahan</label><textarea name="catatan" value={form.catatan} onChange={handleChange} rows="2" placeholder="Catatan tambahan jika diperlukan" className={inputStyle} /></div>
                                <div className="border-t border-[#dce9f5] pt-5">
                                    <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-[#315574]">Resep obat</h3><p className="mt-1 text-xs text-[#7898b7]">Pilih obat dan masukkan jumlahnya.</p></div><button type="button" onClick={tambahObat} className="rounded-lg border border-white bg-white/65 px-3 py-2 text-xs font-semibold text-[#527da3] shadow-sm transition hover:bg-white">＋ Tambah obat</button></div>
                                    <div className="mt-4 space-y-3">{resep.map((item, index) => (
                                        <div key={index} className="rounded-xl border border-white/90 bg-[#eaf4fc]/65 p-4 shadow-[inset_0_1px_0_white]">
                                            <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[#42698d]">Obat {index + 1}</p>{resep.length > 1 && <button type="button" onClick={() => hapusObat(index)} className="text-xs font-medium text-rose-500 hover:text-rose-700">Hapus</button>}</div>
                                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="mb-2 block text-xs font-medium text-[#7898b7]">Nama obat</label><select value={item.obat_id} onChange={(e) => ubahResep(index, "obat_id", e.target.value)} required className={inputStyle}><option value="">Pilih obat</option>{daftarObat.map((obat) => <option key={obat.id} value={obat.id} disabled={obat.stok <= 0 || resep.some((r, i) => i !== index && String(r.obat_id) === String(obat.id))}>{obat.nama} — Stok: {obat.stok}{obat.stok <= 0 ? " (Habis)" : ""}</option>)}</select></div><div><label className="mb-2 block text-xs font-medium text-[#7898b7]">Jumlah</label><input type="number" min="1" step="1" value={item.jumlah} onChange={(e) => ubahResep(index, "jumlah", e.target.value)} required className={inputStyle} /></div></div>
                                        </div>
                                    ))}</div>
                                </div>
                                {pesan && <div className="rounded-xl border border-rose-100 bg-rose-50/90 p-3 text-sm text-rose-600">{pesan}</div>}
                                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row"><button type="button" onClick={tutupForm} className="rounded-xl border border-[#d4e5f4] bg-white/60 px-5 py-3 text-sm font-medium text-[#7898b7] transition hover:bg-white">Batal</button><button type="submit" disabled={loadingSimpan} className="flex-1 rounded-xl bg-gradient-to-r from-[#477da9] to-[#659bc8] px-5 py-3 text-sm font-semibold text-white shadow-[0_7px_16px_rgba(71,125,169,.2)] transition hover:brightness-[1.04] disabled:opacity-60">{loadingSimpan ? "Menyimpan..." : "Simpan rekam medis & resep"}</button></div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
