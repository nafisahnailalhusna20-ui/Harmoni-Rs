"use client";

import { useEffect, useState } from "react";

export default function PasienPage() {
    const [pasien, setPasien] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        nama: "",
        username: "",
        email: "",
        telepon: "",
    });

    // =========================
    // AMBIL DATA PASIEN
    // =========================
    async function ambilPasien() {
        try {
            setLoading(true);

            const response = await fetch("/api/admin/pasien", {
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("Gagal mengambil data pasien:", result);
                return;
            }

            // API HARMONI mengembalikan data dalam result.data
            const dataPasien = Array.isArray(result)
                ? result
                : Array.isArray(result.data)
                    ? result.data
                    : Array.isArray(result.pasien)
                        ? result.pasien
                        : [];

            // Samakan field database dengan field yang dipakai desain
            const dataNormal = dataPasien.map((item) => ({
                ...item,
                nama: item.full_name ?? item.nama ?? "",
                telepon: item.phone ?? item.telepon ?? "",
            }));

            setPasien(dataNormal);
        } catch (error) {
            console.error("Gagal mengambil data pasien:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilPasien();
    }, []);

    // =========================
    // PENCARIAN PASIEN
    // =========================
    const pasienFiltered = pasien.filter((item) => {
        const keyword = search.toLowerCase();

        const nama = String(item.nama || "").toLowerCase();
        const username = String(item.username || "").toLowerCase();
        const email = String(item.email || "").toLowerCase();
        const telepon = String(item.telepon || "").toLowerCase();

        return (
            nama.includes(keyword) ||
            username.includes(keyword) ||
            email.includes(keyword) ||
            telepon.includes(keyword)
        );
    });

    // =========================
    // TAMBAH PASIEN
    // =========================
    function bukaTambah() {
        setEditId(null);

        setForm({
            nama: "",
            username: "",
            email: "",
            telepon: "",
        });

        setModalOpen(true);
    }

    // =========================
    // EDIT PASIEN
    // =========================
    function bukaEdit(item) {
        setEditId(item.id);

        setForm({
            nama: item.full_name ?? item.nama ?? "",
            username: item.username || "",
            email: item.email || "",
            telepon: item.phone ?? item.telepon ?? "",
        });

        setModalOpen(true);
    }

    // =========================
    // SIMPAN PASIEN
    // =========================
    async function simpanPasien(e) {
        e.preventDefault();

        const url = editId
            ? `/api/admin/pasien/${editId}`
            : "/api/admin/pasien";

        const method = editId ? "PUT" : "POST";

        // Field disesuaikan dengan nama kolom API/database
        const payload = {
            full_name: form.nama,
            username: form.username,
            email: form.email,
            phone: form.telepon,
        };

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Gagal menyimpan data pasien.");
                return;
            }

            setModalOpen(false);

            await ambilPasien();
        } catch (error) {
            console.error("Gagal menyimpan pasien:", error);
            alert("Terjadi kesalahan saat menyimpan data.");
        }
    }

    // =========================
    // HAPUS PASIEN
    // =========================
    async function hapusPasien(id) {
        const yakin = confirm("Yakin ingin menghapus pasien ini?");

        if (!yakin) return;

        try {
            const response = await fetch(`/api/admin/pasien/${id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (response.ok) {
                await ambilPasien();
            } else {
                alert(result.message || "Gagal menghapus pasien.");
            }
        } catch (error) {
            console.error("Gagal menghapus pasien:", error);
            alert("Terjadi kesalahan saat menghapus data.");
        }
    }

    return (
        <main className="pasien-page">
            <style jsx>{`
        .pasien-page {
          min-height: 100vh;
          padding: 34px 5%;
          color: #315a82;
          background:
            radial-gradient(
              circle at 85% 15%,
              rgba(150, 198, 238, 0.38),
              transparent 35%
            ),
            radial-gradient(
              circle at 10% 80%,
              rgba(220, 237, 251, 0.8),
              transparent 40%
            ),
            linear-gradient(135deg, #f8fbff 0%, #e8f2fc 55%, #d8eafb 100%);
        }

        .pasien-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          margin-bottom: 56px;
        }

        .brand {
          font-size: 30px;
          font-weight: 600;
          letter-spacing: 9px;
          color: #315a82;
        }

        .brand-subtitle {
          margin-top: 8px;
          font-size: 13px;
          letter-spacing: 4px;
          color: #7c9fc7;
        }

        .back-button {
          padding: 13px 24px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 40px;
          background: rgba(255, 255, 255, 0.48);
          color: #547da8;
          text-decoration: none;
          font-size: 15px;
          box-shadow: 0 4px 12px rgba(65, 100, 135, 0.08);
          transition: 0.2s;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.8);
          transform: translateY(-2px);
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr 300px;
          align-items: center;
          gap: 50px;
          margin-bottom: 58px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #7a9fc8;
        }

        .eyebrow::before {
          content: "";
          width: 42px;
          height: 1px;
          background: #8db5df;
        }

        .hero-title {
          margin: 0;
          font-size: clamp(42px, 5.5vw, 76px);
          line-height: 1.08;
          font-weight: 400;
          letter-spacing: -3px;
          color: #315a82;
        }

        .hero-title span {
          color: #76a2d0;
        }

        .hero-description {
          max-width: 680px;
          margin-top: 22px;
          font-size: 17px;
          line-height: 1.8;
          color: #789bc2;
        }

        .hero-side {
          position: relative;
          padding: 24px 0;
          text-align: right;
        }

        .page-number {
          position: absolute;
          top: -35px;
          right: 0;
          z-index: 0;
          font-size: 150px;
          line-height: 1;
          font-weight: 300;
          color: rgba(113, 163, 211, 0.16);
          pointer-events: none;
        }

        .hero-side-content {
          position: relative;
          z-index: 1;
        }

        .side-label {
          font-size: 12px;
          letter-spacing: 3px;
          color: #7b9fc6;
        }

        .side-description {
          margin: 16px 0 24px;
          font-size: 15px;
          line-height: 1.7;
          color: #547da8;
        }

        .add-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 15px 23px;
          border: none;
          border-radius: 18px;
          background: linear-gradient(110deg, #315b83, #679bc8);
          color: white;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(55, 100, 145, 0.18);
          transition: 0.2s;
        }

        .add-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(55, 100, 145, 0.25);
        }

        .glass-card {
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 34px;
          background: rgba(255, 255, 255, 0.34);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          box-shadow: 0 20px 55px rgba(74, 115, 153, 0.06);
          overflow: hidden;
        }

        .card-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          padding: 36px 38px 28px;
        }

        .section-label {
          margin-bottom: 12px;
          font-size: 11px;
          letter-spacing: 2.5px;
          color: #7d9fc5;
        }

        .card-title {
          margin: 0;
          font-size: 30px;
          font-weight: 400;
          letter-spacing: -0.8px;
          color: #315a82;
        }

        .card-description {
          margin-top: 10px;
          font-size: 15px;
          color: #7b9fc6;
        }

        .search-input {
          width: 330px;
          max-width: 100%;
          padding: 15px 20px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 17px;
          outline: none;
          background: rgba(255, 255, 255, 0.55);
          color: #315a82;
          font-size: 14px;
          transition: 0.2s;
        }

        .search-input:focus {
          border-color: #9dc3e8;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 0 3px rgba(132, 179, 222, 0.12);
        }

        .table-wrap {
          padding: 0 38px 32px;
          overflow-x: auto;
        }

        .pasien-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 750px;
        }

        .pasien-table th {
          padding: 20px 14px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.8);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: #789bc2;
        }

        .pasien-table td {
          padding: 22px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.65);
          font-size: 14px;
          color: #426b95;
        }

        .pasien-table tbody tr {
          transition: background 0.2s;
        }

        .pasien-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .patient-name {
          color: #315a82;
          font-weight: 500;
        }

        .patient-subtitle {
          margin-top: 5px;
          font-size: 12px;
          color: #8aa9cb;
        }

        .initial {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          margin-right: 12px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.35);
          color: #5e8ab6;
          vertical-align: middle;
        }

        .action-button {
          padding: 9px 15px;
          margin-right: 7px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.38);
          color: #416b96;
          font-size: 13px;
          cursor: pointer;
          transition: 0.2s;
        }

        .action-button:hover {
          background: rgba(255, 255, 255, 0.8);
        }

        .delete-button {
          color: #bd718a;
          border-color: rgba(231, 168, 188, 0.45);
        }

        .empty-state {
          padding: 45px 20px;
          text-align: center;
          color: #86a6c9;
          font-size: 14px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(42, 70, 101, 0.35);
          backdrop-filter: blur(12px);
        }

        .modal {
          width: 100%;
          max-width: 620px;
          padding: 36px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 30px;
          background: rgba(239, 246, 253, 0.94);
          box-shadow: 0 25px 70px rgba(39, 76, 113, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
        }

        .modal-title {
          margin: 0;
          font-size: 29px;
          font-weight: 400;
          color: #315a82;
        }

        .close-button {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.75);
          color: #7196bd;
          font-size: 20px;
          cursor: pointer;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 9px;
          font-size: 14px;
          color: #547da8;
        }

        .form-control {
          width: 100%;
          padding: 15px 17px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          outline: none;
          background: rgba(255, 255, 255, 0.65);
          color: #315a82;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-control:focus {
          border-color: #9dc3e8;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
        }

        .cancel-button {
          padding: 13px 20px;
          border: 1px solid #d3e3f3;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.55);
          color: #6e91b8;
          cursor: pointer;
        }

        @media (max-width: 850px) {
          .hero {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .hero-side {
            text-align: left;
          }

          .page-number {
            right: auto;
            left: 0;
          }

          .card-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .search-input {
            width: 100%;
          }

          .table-wrap {
            padding: 0 20px 25px;
          }

          .card-heading {
            padding: 28px 24px;
          }

          .pasien-header {
            margin-bottom: 38px;
          }
        }
      `}</style>

            {/* Header */}
            <header className="pasien-header">
                <div>
                    <div className="brand">HARMONI</div>
                    <div className="brand-subtitle">HOSPITAL INFORMATION SYSTEM</div>
                </div>

                <a href="/admin" className="back-button">
                    ← Kembali ke dashboard
                </a>
            </header>

            {/* Hero */}
            <section className="hero">
                <div>
                    <div className="eyebrow">ADMINISTRATION / MASTER DATA</div>

                    <h1 className="hero-title">
                        Data pasien,
                        <br />
                        <span>lebih terorganisir.</span>
                    </h1>

                    <p className="hero-description">
                        Kelola informasi akun dan kontak pasien dalam satu ruang kerja
                        yang terintegrasi.
                    </p>
                </div>

                <div className="hero-side">
                    <div className="page-number">05</div>

                    <div className="hero-side-content">
                        <div className="side-label">PATIENT DIRECTORY</div>

                        <p className="side-description">
                            Informasi pasien tersusun
                            <br />
                            dengan lebih rapi.
                        </p>

                        <button className="add-button" onClick={bukaTambah}>
                            <span>＋</span>
                            Tambah pasien
                            <span>↗</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Data pasien */}
            <section className="glass-card">
                <div className="card-heading">
                    <div>
                        <div className="section-label">05 — DIRECTORY</div>
                        <h2 className="card-title">Daftar pasien</h2>
                        <p className="card-description">
                            Informasi akun dan kontak pasien HARMONI.
                        </p>
                    </div>

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Cari nama, username, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="table-wrap">
                    <table className="pasien-table">
                        <thead>
                            <tr>
                                <th>NO.</th>
                                <th>PASIEN</th>
                                <th>USERNAME</th>
                                <th>EMAIL</th>
                                <th>TELEPON</th>
                                <th>AKSI</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        Memuat data pasien...
                                    </td>
                                </tr>
                            ) : pasienFiltered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        Belum ada data pasien yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                pasienFiltered.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{String(index + 1).padStart(2, "0")}</td>

                                        <td>
                                            <span className="initial">
                                                {item.nama?.charAt(0)?.toUpperCase() || "P"}
                                            </span>

                                            <span className="patient-name">{item.nama}</span>

                                            <div className="patient-subtitle">
                                                Pasien HARMONI
                                            </div>
                                        </td>

                                        <td>{item.username || "-"}</td>
                                        <td>{item.email || "-"}</td>
                                        <td>{item.telepon || "-"}</td>

                                        <td>
                                            <button
                                                className="action-button"
                                                onClick={() => bukaEdit(item)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="action-button delete-button"
                                                onClick={() => hapusPasien(item.id)}
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal tambah / edit */}
            {modalOpen && (
                <div
                    className="modal-overlay"
                    onClick={() => setModalOpen(false)}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <div className="section-label">MASTER DATA / PASIEN</div>

                                <h2 className="modal-title">
                                    {editId ? "Edit pasien" : "Pasien baru"}
                                </h2>

                                <p className="card-description">
                                    Lengkapi informasi akun pasien.
                                </p>
                            </div>

                            <button
                                className="close-button"
                                onClick={() => setModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={simpanPasien}>
                            <div className="form-group">
                                <label>Nama pasien</label>
                                <input
                                    className="form-control"
                                    value={form.nama}
                                    onChange={(e) =>
                                        setForm({ ...form, nama: e.target.value })
                                    }
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    className="form-control"
                                    value={form.username}
                                    onChange={(e) =>
                                        setForm({ ...form, username: e.target.value })
                                    }
                                    placeholder="Masukkan username"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    placeholder="nama@email.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Nomor telepon</label>
                                <input
                                    className="form-control"
                                    value={form.telepon}
                                    onChange={(e) =>
                                        setForm({ ...form, telepon: e.target.value })
                                    }
                                    placeholder="Masukkan nomor telepon"
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Batal
                                </button>

                                <button type="submit" className="add-button">
                                    {editId ? "Simpan perubahan" : "Tambah pasien"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}