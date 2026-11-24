"use client";

import { useCallback, useEffect, useState } from "react";

const HARI = [
  { id: 1, nama: "Senin" },
  { id: 2, nama: "Selasa" },
  { id: 3, nama: "Rabu" },
  { id: 4, nama: "Kamis" },
  { id: 5, nama: "Jumat" },
  { id: 6, nama: "Sabtu" },
  { id: 7, nama: "Minggu" },
];

const FORM_AWAL = {
  dokter_id: "",
  hari: "1",
  jam_mulai: "07:30",
  jam_selesai: "15:00",
  is_active: true,
};

const inputClass =
  "w-full rounded-2xl border border-white/80 bg-white/65 px-4 py-3.5 text-sm text-[#29496f] shadow-[inset_0_1px_3px_rgba(255,255,255,.9),0_8px_24px_rgba(83,125,170,.06)] outline-none transition placeholder:text-[#8da8c9] focus:border-[#8bb9e8] focus:bg-white/90 focus:ring-4 focus:ring-[#b8d9f5]/35";
const labelClass = "mb-2 block text-sm font-medium text-[#526d91]";

function namaHari(value) {
  const number = Number(value);
  return HARI.find((hari) => hari.id === number)?.nama || "-";
}

function jamKeMenit(jam) {
  if (!jam || !String(jam).includes(":")) return NaN;
  const [hour, minute] = String(jam).slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
}

function menitKeJam(total) {
  const normalized = ((total % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function jamSelesai(item) {
  const start = jamKeMenit(item.jam_mulai);
  const duration = Number(item.durasi);
  if (!Number.isFinite(start) || !Number.isFinite(duration) || duration <= 0) {
    return "-";
  }
  return menitKeJam(start + duration);
}

async function bacaJSON(response, label) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `${label} tidak mengembalikan JSON (HTTP ${response.status}). Periksa route API.`
    );
  }
}

export default function JadwalPage() {
  const [jadwal, setJadwal] = useState([]);
  const [dokter, setDokter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterHari, setFilterHari] = useState("Semua");
  const [form, setForm] = useState({ ...FORM_AWAL });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [jadwalRes, dokterRes] = await Promise.all([
        fetch("/api/admin/jadwal"),
        fetch("/api/admin/dokter"),
      ]);

      const jadwalData = await bacaJSON(jadwalRes, "API jadwal");
      const dokterData = await bacaJSON(dokterRes, "API dokter");

      if (!jadwalRes.ok || !jadwalData.success) {
        throw new Error(jadwalData.message || "Jadwal gagal dimuat.");
      }
      if (!dokterRes.ok || !dokterData.success) {
        throw new Error(dokterData.message || "Data dokter gagal dimuat.");
      }

      setJadwal(Array.isArray(jadwalData.data) ? jadwalData.data : []);
      setDokter(Array.isArray(dokterData.data) ? dokterData.data : []);
    } catch (error) {
      console.error("Gagal memuat jadwal:", error);
      alert(error.message || "Gagal memuat data jadwal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function bukaTambah() {
    setEditId(null);
    setForm({ ...FORM_AWAL });
    setModalOpen(true);
  }

  function bukaEdit(item) {
    const start = item.jam_mulai?.slice(0, 5) || "08:00";
    setEditId(item.id);
    setForm({
      dokter_id: String(item.dokter_id ?? ""),
      hari: String(item.hari ?? "1"),
      jam_mulai: start,
      jam_selesai: jamSelesai(item) === "-" ? "08:30" : jamSelesai(item),
      is_active: item.is_active ?? true,
    });
    setModalOpen(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function simpanJadwal(event) {
    event.preventDefault();

    if (!form.dokter_id) {
      alert("Silakan pilih dokter terlebih dahulu.");
      return;
    }

    const startMinutes = jamKeMenit(form.jam_mulai);
    const endMinutes = jamKeMenit(form.jam_selesai);
    const durasi = endMinutes - startMinutes;

    if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) {
      alert("Jam mulai dan jam selesai harus diisi.");
      return;
    }
    if (durasi <= 0) {
      alert("Jam selesai harus lebih besar daripada jam mulai.");
      return;
    }

    const dokterId = Number(form.dokter_id);
    const hariId = Number(form.hari);
    const jadwalGanda = jadwal.find(
      (item) =>
        Number(item.dokter_id) === dokterId &&
        Number(item.hari) === hariId &&
        Number(item.id) !== Number(editId)
    );

    if (jadwalGanda) {
      alert(
        `${jadwalGanda.nama_dokter || "Dokter"} sudah memiliki jadwal pada ${namaHari(hariId)}.`
      );
      return;
    }

    try {
      setMenyimpan(true);
      const url = editId
        ? `/api/admin/jadwal/${editId}`
        : "/api/admin/jadwal";
      const response = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dokter_id: dokterId,
          hari: hariId,
          jam_mulai: form.jam_mulai,
          // Kolom durasi di database dipakai untuk menyimpan rentang praktik (menit).
          durasi,
          is_active: form.is_active,
        }),
      });

      const result = await bacaJSON(response, "API simpan jadwal");
      if (!response.ok) {
        alert(result.message || "Jadwal gagal disimpan.");
        return;
      }

      setModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Simpan jadwal:", error);
      alert(error.message || "Terjadi kesalahan saat menyimpan jadwal.");
    } finally {
      setMenyimpan(false);
    }
  }

  async function ubahStatus(item) {
    try {
      const response = await fetch(`/api/admin/jadwal/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      const result = await bacaJSON(response, "API ubah status");
      if (!response.ok) {
        alert(result.message || "Gagal mengubah status jadwal.");
        return;
      }
      await loadData();
    } catch (error) {
      console.error(error);
      alert(error.message || "Gagal mengubah status jadwal.");
    }
  }

  async function hapusJadwal(item) {
    const namaDokter = item.nama_dokter || item.dokter_nama || "dokter";
    if (!confirm(`Hapus jadwal ${namaDokter} pada ${namaHari(item.hari)}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/jadwal/${item.id}`, {
        method: "DELETE",
      });
      const result = await bacaJSON(response, "API hapus jadwal");
      if (!response.ok) {
        alert(result.message || "Jadwal gagal dihapus.");
        return;
      }
      await loadData();
    } catch (error) {
      console.error(error);
      alert(error.message || "Gagal menghapus jadwal.");
    }
  }

  const jadwalFiltered = jadwal.filter((item) => {
    const namaDokter = (
      item.nama_dokter || item.dokter_nama || ""
    ).toLowerCase();
    const namaPoli = (item.nama_poli || item.poli_nama || "").toLowerCase();
    const keyword = search.toLowerCase();
    const cocokSearch =
      namaDokter.includes(keyword) || namaPoli.includes(keyword);
    const cocokHari =
      filterHari === "Semua" || Number(item.hari) === Number(filterHari);
    return cocokSearch && cocokHari;
  });

  const totalAktif = jadwal.filter((item) => item.is_active).length;
  const totalNonaktif = jadwal.length - totalAktif;

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#eaf3fc] text-[#29496f]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-36 -top-40 h-[480px] w-[480px] rounded-full bg-white/75 blur-[90px]" />
        <div className="absolute -right-32 top-20 h-[520px] w-[520px] rounded-full bg-[#a9cfee]/45 blur-[100px]" />
        <div className="absolute bottom-[-230px] left-[28%] h-[520px] w-[680px] rounded-full bg-[#d4e7f8]/80 blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-[#9fc4e8]/20" />
      </div>
      <header className="relative z-10 border-b border-white/70 bg-white/45 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <a href="/admin" className="group leading-tight">
            <span className="block text-[25px] font-semibold tracking-[0.19em] text-[#345b86] transition group-hover:text-[#5b8fc1]">
              HARMONI
            </span>
            <span className="mt-1 block text-[10px] tracking-[0.22em] text-[#7898bd] sm:text-xs">
              HOSPITAL INFORMATION SYSTEM
            </span>
          </a>
          <a
            href="/admin"
            className="rounded-full border border-white/80 bg-white/45 px-4 py-2.5 text-xs font-medium text-[#52769e] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80 sm:px-5 sm:text-sm"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-[1420px] min-w-0 px-5 pb-10 pt-7 sm:px-8 sm:pt-9 lg:px-10">
        <div className="mb-8 grid w-full min-w-0 gap-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-center lg:mb-10 lg:gap-12">
          <div className="min-w-0 max-w-[790px]">
            <p className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.22em] text-[#7a9fc7] sm:text-xs">
              <span className="h-px w-8 shrink-0 bg-[#8eb6dc]" />
              Administrasi / Master data
            </p>
            <h1 className="break-words text-[clamp(2.7rem,5vw,5rem)] font-light leading-[0.98] tracking-[-0.055em] text-[#31577f]">
              Jadwal praktik dokter
            </h1>
            <p className="mt-5 max-w-[650px] text-sm leading-7 text-[#7794b6] sm:text-base sm:leading-8">
              Atur hari dan jam pelayanan dokter dalam satu daftar yang mudah dibaca.
            </p>
          </div>
          <div className="relative flex min-w-0 flex-col items-end justify-center py-5 text-right md:py-0">
            <span aria-hidden="true" className="pointer-events-none absolute right-0 top-[-42px] select-none text-[126px] font-light leading-none tracking-[-0.08em] text-[#6d9fce]/15 sm:text-[150px]">02</span>
            <div className="relative z-10 w-full max-w-[280px]">
              <p className="text-[10px] tracking-[0.2em] text-[#7e9fc3] sm:text-xs">DOCTOR SCHEDULE</p>
              <p className="mt-3 text-sm leading-6 text-[#52779f] sm:text-base sm:leading-7">
                Jam layanan dokter, tersusun dalam satu ruang kerja.
              </p>
              <button
                type="button"
                onClick={bukaTambah}
                className="mt-5 inline-flex h-[68px] w-full items-center justify-between gap-4 rounded-[22px] border border-white/35 bg-gradient-to-r from-[#315981] to-[#6a9dc8] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(61,105,151,.22)] transition duration-200 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 sm:px-6"
              >
                <span className="text-lg">+</span><span>Tambah jadwal</span><span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>

        <section className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_20px_55px_rgba(83,125,170,.10)] backdrop-blur-xl sm:p-7 lg:p-8">
          <div className="flex flex-col justify-between gap-5 border-b border-[#c9dced]/70 pb-5 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-[#8aa8c9]"><span className="text-[#527da8]">01</span><span className="h-px w-5 bg-[#c4d9ec]" /> SCHEDULE DIRECTORY</p>
              <h2 className="mt-2 text-xl font-medium tracking-tight text-[#345b84] sm:text-2xl">Daftar jadwal dokter</h2>
              <p className="mt-1.5 text-xs text-[#829fbe] sm:text-sm">Atur jadwal layanan dan status praktik dokter.</p>
            </div>
          </div>

          <div className="my-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/80 bg-[#edf5fc]/70 px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-3"><span className="text-2xl font-light tracking-tight text-[#527da8]">{String(jadwal.length).padStart(2, "0")}</span><div><p className="text-[10px] font-semibold tracking-[0.17em] text-[#7798bc]">TOTAL JADWAL</p><p className="mt-1 text-xs text-[#91a9c5]">Data praktik dokter</p></div></div>
              <span className="h-8 w-px bg-[#d5e5f4] hidden sm:block" />
              <div><p className="text-[10px] font-semibold tracking-[0.17em] text-[#7798bc]">AKTIF <span className="ml-1 text-[#527da8]">{totalAktif}</span></p><p className="mt-1 text-xs text-[#91a9c5]">Jadwal berjalan</p></div>
              <div><p className="text-[10px] font-semibold tracking-[0.17em] text-[#7798bc]">NONAKTIF <span className="ml-1 text-[#527da8]">{totalNonaktif}</span></p><p className="mt-1 text-xs text-[#91a9c5]">Jadwal dinonaktifkan</p></div>
            </div>
            <span className="rounded-full border border-[#d5e5f4] bg-white/55 px-3 py-1.5 text-xs text-[#86a3c2]">HARMONI · 2026</span>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama dokter atau poli..."
              className={`${inputClass} flex-1`}
            />
            <select
              value={filterHari}
              onChange={(event) => setFilterHari(event.target.value)}
              className={`${inputClass} sm:w-48`}
            >
              <option value="Semua">Semua hari</option>
              {HARI.map((hari) => (
                <option key={hari.id} value={hari.id}>
                  {hari.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-hidden rounded-[22px] border border-white/80 bg-white/55 shadow-[0_10px_35px_rgba(83,122,164,.07)]">
            {loading ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-[#7794b6]">
                Memuat data jadwal...
              </div>
            ) : jadwalFiltered.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center">
                <p className="font-medium text-slate-700">
                  Belum ada jadwal yang sesuai
                </p>
                <p className="mt-1 text-sm text-[#7794b6]">
                  Ubah pencarian atau tambahkan jadwal baru.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead className="bg-[#eaf3fb]/75">
                    <tr className="border-b border-[#dce8f4]/80 text-[10px] font-semibold tracking-[0.16em] text-[#7898bb]">
                      <th className="px-4 py-4 text-center">No.</th>
                      <th className="px-4 py-4">Dokter</th>
                      <th className="px-4 py-4">Poli</th>
                      <th className="px-4 py-4">Hari</th>
                      <th className="px-4 py-4">Jam praktik</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jadwalFiltered.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-t border-[#dce8f4]/80 transition hover:bg-white/65"
                      >
                        <td className="px-4 py-4 text-center text-sm text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-[#29496f]">
                          {item.nama_dokter || item.dokter_nama || "Dokter"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {item.nama_poli || item.poli_nama || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {namaHari(item.hari)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-lg bg-[#edf5fc] px-3 py-2 text-sm font-semibold tabular-nums text-[#527da8]">
                            {item.jam_mulai?.slice(0, 5)} – {jamSelesai(item)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${item.is_active
                              ? "border border-[#d5e5f4] bg-[#edf5fc] text-[#527da8]"
                              : "border border-[#e0e7ef] bg-[#f3f6fa] text-[#879bb2]"
                              }`}
                          >
                            {item.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => bukaEdit(item)}
                              className="rounded-xl border border-[#d5e6f5] bg-[#edf5fc] px-3.5 py-2 text-xs font-medium text-[#5d86b1] transition hover:border-[#a9cce9] hover:bg-white"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => ubahStatus(item)}
                              className="rounded-xl border border-[#d5e6f5] bg-[#edf5fc] px-3.5 py-2 text-xs font-medium text-[#5d86b1] transition hover:border-[#a9cce9] hover:bg-white"
                            >
                              {item.is_active ? "Nonaktifkan" : "Aktifkan"}
                            </button>
                            <button
                              type="button"
                              onClick={() => hapusJadwal(item)}
                              className="rounded-xl border border-[#f0dce1] bg-[#fff5f6]/80 px-3.5 py-2 text-xs font-medium text-[#b77d8b] transition hover:bg-[#ffeaee]"
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

          <p className="mt-4 text-xs text-slate-400">
            Menampilkan {jadwalFiltered.length} dari {jadwal.length} jadwal.
          </p>
        </section>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#28496c]/25 px-4 py-8 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <div className="my-auto w-full max-w-xl rounded-[30px] border border-white/80 bg-[#f5f9fe]/90 p-6 shadow-[0_30px_100px_rgba(39,75,116,.25)] backdrop-blur-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#315de8]">
                  Pengaturan jadwal
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#29496f]">
                  {editId ? "Edit jadwal dokter" : "Tambah jadwal dokter"}
                </h2>
                <p className="mt-1 text-sm text-[#7794b6]">
                  Tentukan rentang waktu praktik, bukan durasi per kunjungan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <form onSubmit={simpanJadwal} className="mt-6 space-y-4">
              <div>
                <label className={labelClass}>Dokter</label>
                <select
                  required
                  name="dokter_id"
                  value={form.dokter_id}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Pilih dokter</option>
                  {dokter.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama_dokter || item.full_name || item.nama || item.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Hari praktik</label>
                <select
                  required
                  name="hari"
                  value={form.hari}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {HARI.map((hari) => (
                    <option key={hari.id} value={hari.id}>
                      {hari.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Mulai praktik</label>
                  <input
                    required
                    type="time"
                    name="jam_mulai"
                    value={form.jam_mulai}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Selesai praktik</label>
                  <input
                    required
                    type="time"
                    name="jam_selesai"
                    value={form.jam_selesai}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/80 bg-[#edf5fc]/80 px-4 py-3 text-sm text-[#527da8]">
                Rentang praktik:{" "}
                <strong>
                  {form.jam_mulai || "--:--"} – {form.jam_selesai || "--:--"}
                </strong>
                {Number.isFinite(jamKeMenit(form.jam_mulai)) &&
                  Number.isFinite(jamKeMenit(form.jam_selesai)) &&
                  jamKeMenit(form.jam_selesai) > jamKeMenit(form.jam_mulai) && (
                    <span className="ml-2 text-[#315de8]">
                      ({Math.floor(
                        (jamKeMenit(form.jam_selesai) -
                          jamKeMenit(form.jam_mulai)) /
                        60
                      )}{" "}
                      jam{" "}
                      {(jamKeMenit(form.jam_selesai) -
                        jamKeMenit(form.jam_mulai)) %
                        60}{" "}
                      menit)
                    </span>
                  )}
              </div>

              <div>
                <label className={labelClass}>Status jadwal</label>
                <select
                  value={String(form.is_active)}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      is_active: event.target.value === "true",
                    }))
                  }
                  className={inputClass}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#edf3fa] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#dce8f5] px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={menyimpan}
                  className="rounded-2xl bg-gradient-to-r from-[#315981] to-[#6598c4] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_25px_rgba(61,105,151,.2)] transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {menyimpan
                    ? "Menyimpan..."
                    : editId
                      ? "Simpan perubahan"
                      : "Simpan jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
