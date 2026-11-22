"use client";

import { useEffect, useState } from "react";

export default function JadwalPage() {
    const [jadwal, setJadwal] = useState([]);
    const [dokter, setDokter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const [filterHari, setFilterHari] = useState("Semua");

    const [form, setForm] = useState({
        dokter_id: "",
        hari: "Senin",
        jam_mulai: "08:00",
        durasi: 30,
        is_active: true,
    });

    const hariList = [
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu",
    ];

    async function loadData() {
        try {
            setLoading(true);

            const [jadwalRes, dokterRes] = await Promise.all([
                fetch("/api/admin/jadwal"),
                fetch("/api/admin/dokter"),
            ]);

            const jadwalData = await jadwalRes.json();
            const dokterData = await dokterRes.json();

            setJadwal(
                Array.isArray(jadwalData)
                    ? jadwalData
                    : jadwalData.data || jadwalData.jadwal || []
            );

            setDokter(
                Array.isArray(dokterData)
                    ? dokterData
                    : dokterData.data || dokterData.dokter || []
            );
        } catch (error) {
            console.error("Gagal memuat jadwal:", error);
            alert("Gagal memuat data jadwal.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function bukaTambah() {
        setEditId(null);
        setForm({
            dokter_id: "",
            hari: "Senin",
            jam_mulai: "08:00",
            durasi: 30,
            is_active: true,
        });
        setModalOpen(true);
    }

    function bukaEdit(item) {
        setEditId(item.id);

        setForm({
            dokter_id: item.dokter_id || "",
            hari: item.hari || "Senin",
            jam_mulai: item.jam_mulai?.slice(0, 5) || "08:00",
            durasi: item.durasi || 30,
            is_active: item.is_active ?? true,
        });

        setModalOpen(true);
    }

    async function simpanJadwal(e) {
        e.preventDefault();

        if (!form.dokter_id) {
            alert("Pilih dokter terlebih dahulu.");
            return;
        }

        try {
            const url = editId
                ? `/api/admin/jadwal/${editId}`
                : "/api/admin/jadwal";

            const method = editId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dokter_id: Number(form.dokter_id),
                    hari: form.hari,
                    jam_mulai: form.jam_mulai,
                    durasi: Number(form.durasi),
                    is_active: form.is_active,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || result.error || "Gagal menyimpan jadwal.");
                return;
            }

            setModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan saat menyimpan jadwal.");
        }
    }

    async function ubahStatus(item) {
        const statusBaru = !item.is_active;

        try {
            const response = await fetch(`/api/admin/jadwal/${item.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    is_active: statusBaru,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Gagal mengubah status jadwal.");
                return;
            }

            loadData();
        } catch (error) {
            console.error(error);
            alert("Gagal mengubah status jadwal.");
        }
    }

    async function hapusJadwal(item) {
        const namaDokter =
            item.nama_dokter || item.dokter_nama || "dokter";

        const yakin = confirm(
            `Hapus jadwal ${namaDokter} pada hari ${item.hari}?`
        );

        if (!yakin) return;

        try {
            const response = await fetch(`/api/admin/jadwal/${item.id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Gagal menghapus jadwal.");
                return;
            }

            loadData();
        } catch (error) {
            console.error(error);
            alert("Gagal menghapus jadwal.");
        }
    }

    const jadwalFiltered = jadwal.filter((item) => {
        const namaDokter = (
            item.nama_dokter ||
            item.dokter_nama ||
            ""
        ).toLowerCase();

        const namaPoli = (item.nama_poli || item.poli_nama || "").toLowerCase();

        const cocokSearch =
            namaDokter.includes(search.toLowerCase()) ||
            namaPoli.includes(search.toLowerCase());

        const cocokHari =
            filterHari === "Semua" || item.hari === filterHari;

        return cocokSearch && cocokHari;
    });

    const totalAktif = jadwal.filter((item) => item.is_active).length;
    const totalNonaktif = jadwal.length - totalAktif;

    return (
        <main className="schedule-page">
            <style jsx>{`
        .schedule-page {
          min-height: 100vh;
          color: #31577f;
          background:
            radial-gradient(
              circle at 90% 12%,
              rgba(180, 215, 247, 0.48),
              transparent 32%
            ),
            linear-gradient(135deg, #f8fbff 0%, #eaf3fc 55%, #dcecfb 100%);
          font-family: Arial, Helvetica, sans-serif;
        }

        .topbar {
          padding: 30px 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.85);
          background: rgba(255, 255, 255, 0.35);
        }

        .brand {
          font-size: 30px;
          font-weight: 700;
          letter-spacing: 8px;
          color: #31577f;
        }

        .brand-subtitle {
          margin-top: 8px;
          font-size: 13px;
          letter-spacing: 3px;
          color: #7b9fc9;
        }

        .back-button {
          text-decoration: none;
          color: #527ba7;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid #e2edf8;
          border-radius: 40px;
          padding: 13px 23px;
          font-size: 15px;
          transition: 0.2s ease;
        }

        .back-button:hover {
          background: white;
          transform: translateY(-2px);
        }

        .content {
          padding: 45px 5% 70px;
          max-width: 1600px;
          margin: auto;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 22px;
          color: #7b9fc9;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .eyebrow::before {
          content: "";
          width: 35px;
          height: 1px;
          background: #8bb4e0;
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 40px;
          align-items: center;
          margin-bottom: 45px;
        }

        .hero-title {
          margin: 0;
          font-size: clamp(38px, 4.5vw, 64px);
          line-height: 1.08;
          letter-spacing: -2.5px;
          font-weight: 500;
          color: #31577f;
        }

        .hero-title span {
          display: block;
          color: #78a4d3;
        }

        .hero-description {
          max-width: 650px;
          margin-top: 20px;
          color: #7398c2;
          font-size: 17px;
          line-height: 1.8;
        }

        .hero-side {
          text-align: right;
          padding: 25px 0;
        }

        .hero-number {
          position: relative;
          font-size: 100px;
          font-weight: 300;
          line-height: 0.9;
          color: rgba(125, 174, 220, 0.2);
        }

        .hero-label {
          margin-top: -45px;
          position: relative;
          font-size: 12px;
          letter-spacing: 3px;
          color: #7298c2;
        }

        .hero-side p {
          margin: 17px 0 22px;
          font-size: 15px;
          line-height: 1.7;
          color: #527ba7;
        }

        .primary-button {
          border: none;
          cursor: pointer;
          color: white;
          background: linear-gradient(110deg, #315b84, #6a9ecb);
          border-radius: 17px;
          padding: 15px 23px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 12px 28px rgba(75, 121, 166, 0.17);
          transition: 0.2s ease;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 32px rgba(75, 121, 166, 0.24);
        }

        .directory {
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 35px;
          padding: 35px 38px;
          background: rgba(255, 255, 255, 0.48);
          box-shadow: 0 20px 60px rgba(103, 145, 187, 0.08);
          backdrop-filter: blur(14px);
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #7b9fc9;
          font-size: 11px;
          letter-spacing: 2px;
          margin-bottom: 12px;
        }

        .section-label strong {
          color: #527ba7;
          font-weight: 600;
        }

        .directory-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding-bottom: 25px;
          border-bottom: 1px solid #d7e6f5;
        }

        .directory-heading h2 {
          margin: 0;
          font-size: 27px;
          font-weight: 500;
          letter-spacing: -0.5px;
          color: #31577f;
        }

        .directory-heading p {
          margin: 9px 0 0;
          color: #7b9fc9;
          font-size: 14px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin: 25px 0;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 17px 20px;
          border: 1px solid #e1edf8;
          border-radius: 18px;
          background: rgba(239, 247, 255, 0.7);
        }

        .stat-number {
          font-size: 29px;
          font-weight: 400;
          color: #527fae;
        }

        .stat-title {
          font-size: 11px;
          letter-spacing: 1.5px;
          color: #7398c2;
        }

        .stat-caption {
          margin-top: 5px;
          font-size: 12px;
          color: #8ba9ca;
        }

        .filters {
          display: flex;
          gap: 12px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }

        .search-input,
        .filter-select {
          height: 43px;
          border: 1px solid #d9e7f5;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.78);
          color: #426b96;
          padding: 0 15px;
          font-size: 14px;
          outline: none;
        }

        .search-input {
          flex: 1;
          min-width: 220px;
        }

        .search-input:focus,
        .filter-select:focus {
          border-color: #8db7e0;
          box-shadow: 0 0 0 3px rgba(141, 183, 224, 0.15);
        }

        .table-wrap {
          overflow-x: auto;
          border: 1px solid #e0ebf6;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.48);
        }

        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
        }

        .schedule-table th {
          padding: 17px 18px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #648bb5;
          background: rgba(239, 247, 255, 0.8);
          border-bottom: 1px solid #dce9f5;
          white-space: nowrap;
        }

        .schedule-table td {
          padding: 17px 18px;
          font-size: 13px;
          color: #496f98;
          border-bottom: 1px solid #e5eef7;
          white-space: nowrap;
        }

        .schedule-table tr:last-child td {
          border-bottom: none;
        }

        .schedule-table tbody tr {
          transition: background 0.15s ease;
        }

        .schedule-table tbody tr:hover {
          background: rgba(224, 239, 253, 0.55);
        }

        .doctor-name {
          font-weight: 600;
          color: #31577f;
        }

        .time-badge {
          display: inline-block;
          padding: 7px 12px;
          border-radius: 10px;
          background: #e7f2fc;
          color: #4776a5;
          font-size: 12px;
          font-weight: 600;
        }

        .status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 600;
        }

        .status.active {
          color: #4d8a78;
          background: #e3f3ec;
        }

        .status.inactive {
          color: #a77d69;
          background: #f7eae4;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .action-button {
          border: none;
          cursor: pointer;
          padding: 8px 11px;
          border-radius: 9px;
          font-size: 12px;
          transition: 0.15s ease;
        }

        .action-button:hover {
          transform: translateY(-1px);
          filter: brightness(0.97);
        }

        .edit-button {
          color: #527ba7;
          background: #e6f0fa;
        }

        .toggle-button {
          color: #8a7951;
          background: #f8f0df;
        }

        .delete-button {
          color: #b16e78;
          background: #f9e8eb;
        }

        .empty-state {
          padding: 45px 20px;
          text-align: center;
          color: #82a2c6;
          font-size: 14px;
        }

        .footer-note {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .footer-pill {
          border: 1px solid #d9e8f7;
          border-radius: 30px;
          padding: 9px 15px;
          color: #8aa9cb;
          background: rgba(255, 255, 255, 0.55);
          font-size: 12px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(43, 72, 101, 0.42);
          backdrop-filter: blur(9px);
        }

        .modal {
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 27px;
          padding: 30px;
          background: linear-gradient(145deg, #f7fbff, #e7f0fa);
          box-shadow: 0 25px 80px rgba(35, 67, 101, 0.25);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
        }

        .modal-eyebrow {
          color: #7b9fc9;
          font-size: 11px;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 26px;
          font-weight: 500;
          color: #31577f;
        }

        .modal-header p {
          margin: 8px 0 0;
          color: #7b9fc9;
          font-size: 13px;
        }

        .close-button {
          width: 37px;
          height: 37px;
          border: none;
          border-radius: 50%;
          background: white;
          color: #7298c2;
          cursor: pointer;
          font-size: 19px;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 9px;
          color: #527ba7;
          font-size: 13px;
        }

        .form-control {
          width: 100%;
          box-sizing: border-box;
          min-height: 46px;
          border: 1px solid #dce8f4;
          border-radius: 13px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.8);
          color: #426b96;
          font-size: 14px;
          outline: none;
        }

        .form-control:focus {
          border-color: #8db7e0;
          box-shadow: 0 0 0 3px rgba(141, 183, 224, 0.15);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 27px;
        }

        .cancel-button {
          border: 1px solid #d8e6f4;
          border-radius: 12px;
          padding: 12px 19px;
          color: #7298c2;
          background: white;
          cursor: pointer;
          font-size: 13px;
        }

        .save-button {
          border: none;
          border-radius: 12px;
          padding: 12px 20px;
          color: white;
          background: linear-gradient(110deg, #315b84, #6a9ecb);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        @media (max-width: 850px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .hero-side {
            display: none;
          }

          .directory {
            padding: 25px 20px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .directory-heading {
            flex-direction: column;
          }

          .topbar {
            padding: 22px 5%;
          }

          .brand {
            font-size: 23px;
            letter-spacing: 5px;
          }

          .brand-subtitle {
            font-size: 10px;
            letter-spacing: 2px;
          }

          .back-button {
            font-size: 12px;
            padding: 11px 14px;
          }
        }
      `}</style>

            <header className="topbar">
                <div>
                    <div className="brand">HARMONI</div>
                    <div className="brand-subtitle">
                        HOSPITAL INFORMATION SYSTEM
                    </div>
                </div>

                <a href="/admin" className="back-button">
                    ← Kembali ke dashboard
                </a>
            </header>

            <section className="content">
                <div className="eyebrow">
                    Administration / Schedule Management
                </div>

                <div className="hero">
                    <div>
                        <h1 className="hero-title">
                            Waktu praktik,
                            <span>tersusun dengan rapi.</span>
                        </h1>

                        <p className="hero-description">
                            Atur jadwal dokter dan waktu pelayanan agar setiap
                            kunjungan berjalan lebih terorganisir.
                        </p>
                    </div>

                    <div className="hero-side">
                        <div className="hero-number">04</div>
                        <div className="hero-label">DOCTOR SCHEDULE</div>

                        <p>
                            Jadwal praktik dokter
                            <br />
                            dalam satu ruang kerja.
                        </p>

                        <button className="primary-button" onClick={bukaTambah}>
                            + &nbsp; Tambah jadwal
                        </button>
                    </div>
                </div>

                <section className="directory">
                    <div className="section-label">
                        <strong>01</strong>
                        <span>—</span>
                        SCHEDULE DIRECTORY
                    </div>

                    <div className="directory-heading">
                        <div>
                            <h2>Daftar jadwal dokter</h2>
                            <p>
                                Informasi waktu praktik dan status jadwal dokter.
                            </p>
                        </div>

                        <button className="primary-button" onClick={bukaTambah}>
                            + Tambah jadwal
                        </button>
                    </div>

                    <div className="stats">
                        <div className="stat-card">
                            <div className="stat-number">{jadwal.length}</div>
                            <div>
                                <div className="stat-title">TOTAL JADWAL</div>
                                <div className="stat-caption">Data praktik dokter</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-number">{totalAktif}</div>
                            <div>
                                <div className="stat-title">JADWAL AKTIF</div>
                                <div className="stat-caption">Siap digunakan</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-number">{totalNonaktif}</div>
                            <div>
                                <div className="stat-title">NONAKTIF</div>
                                <div className="stat-caption">Tidak tersedia</div>
                            </div>
                        </div>
                    </div>

                    <div className="filters">
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Cari nama dokter atau poli..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            className="filter-select"
                            value={filterHari}
                            onChange={(e) => setFilterHari(e.target.value)}
                        >
                            <option value="Semua">Semua hari</option>
                            {hariList.map((hari) => (
                                <option key={hari} value={hari}>
                                    {hari}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="table-wrap">
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Nama dokter</th>
                                    <th>Poli</th>
                                    <th>Hari</th>
                                    <th>Jam praktik</th>
                                    <th>Durasi</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="empty-state">
                                            Memuat data jadwal...
                                        </td>
                                    </tr>
                                ) : jadwalFiltered.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="empty-state">
                                            Belum ada jadwal yang sesuai.
                                        </td>
                                    </tr>
                                ) : (
                                    jadwalFiltered.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>

                                            <td className="doctor-name">
                                                {item.nama_dokter ||
                                                    item.dokter_nama ||
                                                    "Dokter"}
                                            </td>

                                            <td>
                                                {item.nama_poli ||
                                                    item.poli_nama ||
                                                    "-"}
                                            </td>

                                            <td>{item.hari}</td>

                                            <td>
                                                <span className="time-badge">
                                                    {item.jam_mulai?.slice(0, 5)}
                                                </span>
                                            </td>

                                            <td>{item.durasi || 30} menit</td>

                                            <td>
                                                <span
                                                    className={`status ${item.is_active ? "active" : "inactive"
                                                        }`}
                                                >
                                                    {item.is_active ? "Aktif" : "Nonaktif"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="actions">
                                                    <button
                                                        className="action-button edit-button"
                                                        onClick={() => bukaEdit(item)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="action-button toggle-button"
                                                        onClick={() => ubahStatus(item)}
                                                    >
                                                        {item.is_active
                                                            ? "Nonaktifkan"
                                                            : "Aktifkan"}
                                                    </button>

                                                    <button
                                                        className="action-button delete-button"
                                                        onClick={() => hapusJadwal(item)}
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="footer-note">
                        <span className="footer-pill">HARMONI · 2026</span>
                    </div>
                </section>
            </section>

            {modalOpen && (
                <div
                    className="modal-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setModalOpen(false);
                        }
                    }}
                >
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <div className="modal-eyebrow">
                                    SCHEDULE MANAGEMENT
                                </div>

                                <h2>
                                    {editId ? "Edit jadwal" : "Jadwal baru"}
                                </h2>

                                <p>Lengkapi informasi waktu praktik dokter.</p>
                            </div>

                            <button
                                className="close-button"
                                onClick={() => setModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={simpanJadwal}>
                            <div className="form-group">
                                <label>Nama dokter</label>

                                <select
                                    className="form-control"
                                    value={form.dokter_id}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            dokter_id: e.target.value,
                                        })
                                    }
                                    required
                                >
                                    <option value="">Pilih dokter</option>

                                    {dokter.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama || item.nama_dokter}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Hari praktik</label>

                                <select
                                    className="form-control"
                                    value={form.hari}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            hari: e.target.value,
                                        })
                                    }
                                    required
                                >
                                    {hariList.map((hari) => (
                                        <option key={hari} value={hari}>
                                            {hari}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Jam mulai</label>

                                <input
                                    className="form-control"
                                    type="time"
                                    value={form.jam_mulai}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            jam_mulai: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Durasi praktik</label>

                                <select
                                    className="form-control"
                                    value={form.durasi}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            durasi: e.target.value,
                                        })
                                    }
                                >
                                    <option value={15}>15 menit</option>
                                    <option value={30}>30 menit</option>
                                    <option value={45}>45 menit</option>
                                    <option value={60}>60 menit</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Status jadwal</label>

                                <select
                                    className="form-control"
                                    value={String(form.is_active)}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            is_active: e.target.value === "true",
                                        })
                                    }
                                >
                                    <option value="true">Aktif</option>
                                    <option value="false">Nonaktif</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Batal
                                </button>

                                <button type="submit" className="save-button">
                                    {editId ? "Simpan perubahan" : "Tambah jadwal"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}