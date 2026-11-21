"use client";

import { useEffect, useMemo, useState } from "react";

export default function ManajemenPasienPage() {
    const [pasien, setPasien] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        username: "",
        email: "",
        full_name: "",
        phone: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    // Ambil data pasien
    async function loadPasien() {
        try {
            setLoading(true);

            const response = await fetch("/api/admin/pasien", {
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Gagal mengambil data pasien.");
            }

            const data =
                result.pasien ||
                result.dataPasien ||
                result.data ||
                result;

            setPasien(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Gagal mengambil pasien:", error);
            setMessage(error.message || "Gagal memuat data pasien.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPasien();
    }, []);

    // Pencarian pasien
    const filteredPasien = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) return pasien;

        return pasien.filter((item) => {
            const nama = item.full_name || item.nama || "";
            const username = item.username || "";
            const email = item.email || "";
            const telepon = item.phone || item.telepon || "";

            return (
                nama.toLowerCase().includes(keyword) ||
                username.toLowerCase().includes(keyword) ||
                email.toLowerCase().includes(keyword) ||
                String(telepon).includes(keyword)
            );
        });
    }, [pasien, search]);

    // Buka form tambah
    function openAddModal() {
        setEditing(null);

        setForm({
            username: "",
            email: "",
            full_name: "",
            phone: "",
            password: "",
        });

        setModalOpen(true);
    }

    // Buka form edit
    function openEditModal(item) {
        setEditing(item);

        setForm({
            username: item.username || "",
            email: item.email || "",
            full_name: item.full_name || item.nama || "",
            phone: item.phone || item.telepon || "",
            password: "",
        });

        setModalOpen(true);
    }

    // Simpan pasien
    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            const id = editing?.id || editing?.user_id;

            const url = editing
                ? `/api/admin/pasien/${id}`
                : "/api/admin/pasien";

            const response = await fetch(url, {
                method: editing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    result.error ||
                    "Gagal menyimpan data pasien."
                );
            }

            setModalOpen(false);
            await loadPasien();

            setMessage(
                editing
                    ? "Data pasien berhasil diperbarui."
                    : "Pasien berhasil ditambahkan."
            );
        } catch (error) {
            setMessage(error.message || "Terjadi kesalahan.");
        } finally {
            setSaving(false);
        }
    }

    // Hapus pasien
    async function handleDelete(item) {
        const nama = item.full_name || item.nama || "pasien";

        const confirmed = window.confirm(
            `Yakin ingin menghapus data ${nama}?`
        );

        if (!confirmed) return;

        try {
            const id = item.id || item.user_id;

            const response = await fetch(
                `/api/admin/pasien/${id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    result.error ||
                    "Gagal menghapus pasien."
                );
            }

            await loadPasien();
            setMessage("Data pasien berhasil dihapus.");
        } catch (error) {
            setMessage(error.message || "Gagal menghapus pasien.");
        }
    }

    return (
        <main className="pasien-page">
            <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          background: #eaf2fb !important;
        }

        .pasien-page {
          min-height: 100vh;
          padding: 42px clamp(18px, 4vw, 64px);
          color: #193653;
          background:
            radial-gradient(
              circle at 12% 8%,
              rgba(180, 211, 245, 0.38),
              transparent 32%
            ),
            radial-gradient(
              circle at 88% 75%,
              rgba(196, 220, 247, 0.3),
              transparent 35%
            ),
            #eaf2fb;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(24px) saturate(145%);
          -webkit-backdrop-filter: blur(24px) saturate(145%);
          border-radius: 28px;
        }

        .glass-soft {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.68);
          backdrop-filter: blur(18px) saturate(140%);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
        }

        .pasien-input {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.42);
          border-radius: 16px;
          padding: 13px 16px;
          color: #193653;
          outline: none;
          transition: border 0.2s, background 0.2s;
        }

        .pasien-input:focus {
          border-color: #8eb5df;
          background: rgba(255, 255, 255, 0.68);
        }

        .pasien-input::placeholder {
          color: #829bb8;
        }

        .pasien-table {
          width: 100%;
          border-collapse: collapse;
        }

        .pasien-table th {
          text-align: left;
          padding: 17px 24px;
          color: #7895b6;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.7);
        }

        .pasien-table td {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.52);
          color: #527395;
          font-size: 14px;
        }

        .pasien-table tbody tr {
          transition: background 0.2s;
        }

        .pasien-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.22);
        }

        .pasien-table tbody tr:last-child td {
          border-bottom: none;
        }

        .btn-glass {
          border: 1px solid rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.34);
          color: #315d88;
          border-radius: 999px;
          padding: 10px 17px;
          font-size: 13px;
          font-weight: 600;
          transition: background 0.2s;
        }

        .btn-glass:hover {
          background: rgba(255, 255, 255, 0.72);
        }

        .btn-primary {
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: #244f7b;
          color: white;
          border-radius: 999px;
          padding: 14px 23px;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #193e66;
        }

        .btn-delete {
          border: 1px solid rgba(225, 157, 176, 0.5);
          background: rgba(255, 238, 243, 0.45);
          color: #b75e7b;
          border-radius: 999px;
          padding: 9px 15px;
          font-size: 12px;
          font-weight: 600;
        }

        .btn-delete:hover {
          background: rgba(255, 238, 243, 0.85);
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(22, 43, 67, 0.22);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .modal-glass {
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          background: rgba(239, 247, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(32px) saturate(150%);
          -webkit-backdrop-filter: blur(32px) saturate(150%);
          border-radius: 28px;
        }

        @media (max-width: 760px) {
          .pasien-page {
            padding: 26px 16px;
          }

          .pasien-table th,
          .pasien-table td {
            padding: 15px 16px;
          }

          .table-wrapper {
            overflow-x: auto;
          }
        }
      `}</style>

            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-6 mb-9">
                <div className="flex items-center gap-4">
                    <div
                        className="glass-panel flex items-center justify-center"
                        style={{
                            width: 58,
                            height: 58,
                            borderRadius: 19,
                            color: "#315d88",
                            fontSize: 24,
                            fontWeight: 700,
                        }}
                    >
                        H
                    </div>

                    <div>
                        <p className="text-xs font-bold tracking-[0.2em] text-[#7195bd]">
                            HARMONI HEALTHCARE
                        </p>

                        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#193653]">
                            Manajemen Pasien
                        </h1>

                        <p className="mt-1 text-sm text-[#7895b6]">
                            Kelola informasi pasien dengan lebih mudah.
                        </p>
                    </div>
                </div>

                <button
                    onClick={openAddModal}
                    className="btn-primary"
                >
                    <span className="mr-2">＋</span>
                    Tambah Pasien
                </button>
            </header>

            {/* Statistik ringkas */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
                <div className="glass-panel p-6">
                    <p className="text-sm text-[#7895b6]">
                        Total Pasien
                    </p>

                    <div className="flex items-end justify-between mt-3">
                        <span className="text-3xl font-semibold text-[#193653]">
                            {pasien.length}
                        </span>

                        <span className="text-xs text-[#6e91b9]">
                            Terdaftar
                        </span>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <p className="text-sm text-[#7895b6]">
                        Hasil Pencarian
                    </p>

                    <div className="flex items-end justify-between mt-3">
                        <span className="text-3xl font-semibold text-[#193653]">
                            {filteredPasien.length}
                        </span>

                        <span className="text-xs text-[#6e91b9]">
                            Data ditemukan
                        </span>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <p className="text-sm text-[#7895b6]">
                        Pengelolaan Data
                    </p>

                    <div className="flex items-end justify-between mt-3">
                        <span className="text-2xl font-semibold text-[#193653]">
                            Pasien
                        </span>

                        <span className="text-xs text-[#6e91b9]">
                            Admin
                        </span>
                    </div>
                </div>
            </section>

            {/* Tabel pasien */}
            <section className="glass-panel overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-7">
                    <div>
                        <p className="text-xs font-bold tracking-[0.18em] text-[#7195bd]">
                            DATA RUMAH SAKIT
                        </p>

                        <h2 className="text-2xl font-semibold text-[#193653] mt-2">
                            Daftar Pasien
                        </h2>

                        <p className="text-sm text-[#7895b6] mt-2">
                            Informasi akun dan kontak pasien.
                        </p>
                    </div>

                    <div className="w-full md:max-w-sm">
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari nama, username, email..."
                            className="pasien-input"
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="pasien-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Pasien</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Telepon</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12">
                                        Memuat data pasien...
                                    </td>
                                </tr>
                            ) : filteredPasien.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12">
                                        Tidak ada data pasien yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredPasien.map((item, index) => {
                                    const nama =
                                        item.full_name || item.nama || "Pasien";

                                    return (
                                        <tr key={item.id || item.user_id || index}>
                                            <td>
                                                {String(index + 1).padStart(2, "0")}
                                            </td>

                                            <td>
                                                <div className="flex items-center gap-3 min-w-[190px]">
                                                    <div
                                                        className="glass-soft flex items-center justify-center shrink-0"
                                                        style={{
                                                            width: 42,
                                                            height: 42,
                                                            borderRadius: 14,
                                                            color: "#4777a8",
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {nama.charAt(0).toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-[#244766]">
                                                            {nama}
                                                        </p>

                                                        <p className="text-xs text-[#8aa3bf] mt-1">
                                                            Pasien HARMONI
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>{item.username || "-"}</td>
                                            <td>{item.email || "-"}</td>
                                            <td>{item.phone || item.telepon || "-"}</td>

                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="btn-glass"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="btn-delete"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap justify-between gap-3 px-7 py-5 border-t border-white/60 text-xs text-[#7895b6]">
                    <span>
                        Menampilkan {filteredPasien.length} dari {pasien.length} pasien
                    </span>

                    <span>HARMONI Healthcare</span>
                </div>
            </section>

            {/* Pesan */}
            {message && (
                <div className="glass-panel mt-5 px-5 py-4 text-sm text-[#315d88]">
                    {message}

                    <button
                        onClick={() => setMessage("")}
                        className="ml-4 font-semibold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Modal tambah / edit */}
            {modalOpen && (
                <div
                    className="modal-backdrop"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="modal-glass p-7"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-xs font-bold tracking-[0.18em] text-[#7195bd]">
                                    HARMONI HEALTHCARE
                                </p>

                                <h2 className="text-2xl font-semibold text-[#193653] mt-2">
                                    {editing ? "Edit Pasien" : "Tambah Pasien"}
                                </h2>

                                <p className="text-sm text-[#7895b6] mt-2">
                                    Lengkapi informasi pasien berikut.
                                </p>
                            </div>

                            <button
                                onClick={() => setModalOpen(false)}
                                className="btn-glass"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-[#527395] mb-2">
                                    Nama Lengkap
                                </label>

                                <input
                                    required
                                    type="text"
                                    value={form.full_name}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            full_name: event.target.value,
                                        })
                                    }
                                    className="pasien-input"
                                    placeholder="Nama lengkap pasien"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#527395] mb-2">
                                    Username
                                </label>

                                <input
                                    required
                                    type="text"
                                    value={form.username}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            username: event.target.value,
                                        })
                                    }
                                    className="pasien-input"
                                    placeholder="Username pasien"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#527395] mb-2">
                                    Email
                                </label>

                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            email: event.target.value,
                                        })
                                    }
                                    className="pasien-input"
                                    placeholder="email@gmail.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#527395] mb-2">
                                    Nomor Telepon
                                </label>

                                <input
                                    required
                                    type="tel"
                                    value={form.phone}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            phone: event.target.value,
                                        })
                                    }
                                    className="pasien-input"
                                    placeholder="Nomor telepon"
                                />
                            </div>

                            {!editing && (
                                <div>
                                    <label className="block text-sm text-[#527395] mb-2">
                                        Password
                                    </label>

                                    <input
                                        required
                                        minLength={6}
                                        type="password"
                                        value={form.password}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                password: event.target.value,
                                            })
                                        }
                                        className="pasien-input"
                                        placeholder="Minimal 6 karakter"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="btn-glass"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary"
                                >
                                    {saving
                                        ? "Menyimpan..."
                                        : editing
                                            ? "Simpan Perubahan"
                                            : "Tambah Pasien"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}