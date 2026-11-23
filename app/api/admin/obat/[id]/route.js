import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return false;

    const user = await verifyToken(token);

    return user?.role === "admin";
}

function validasiTanggalKadaluarsa(tanggal) {
    // Tanggal kedaluwarsa boleh kosong
    if (
        tanggal === null ||
        tanggal === undefined ||
        tanggal === ""
    ) {
        return true;
    }

    // Format harus YYYY-MM-DD
    if (
        typeof tanggal !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)
    ) {
        return false;
    }

    const [tahun, bulan, hari] = tanggal
        .split("-")
        .map(Number);

    // Validasi tanggal kalender
    if (bulan < 1 || bulan > 12 || hari < 1) {
        return false;
    }

    const jumlahHari = new Date(
        Date.UTC(tahun, bulan, 0)
    ).getUTCDate();

    if (hari > jumlahHari) {
        return false;
    }

    // Mengambil tanggal lokal
    const sekarang = new Date();

    const hariIni = [
        sekarang.getFullYear(),
        String(sekarang.getMonth() + 1).padStart(2, "0"),
        String(sekarang.getDate()).padStart(2, "0"),
    ].join("-");

    // Batas maksimal 10 tahun
    const batasTahun = sekarang.getFullYear() + 10;

    const tanggalMaksimal = [
        batasTahun,
        String(sekarang.getMonth() + 1).padStart(2, "0"),
        String(sekarang.getDate()).padStart(2, "0"),
    ].join("-");

    return tanggal >= hariIni && tanggal <= tanggalMaksimal;
}

export async function PUT(request, { params }) {
    try {
        // Cek hak akses admin
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        // Validasi ID obat
        const { id } = await params;
        const obatId = Number(id);

        if (
            !Number.isInteger(obatId) ||
            obatId <= 0
        ) {
            return NextResponse.json(
                { message: "ID obat tidak valid." },
                { status: 400 }
            );
        }

        // Mengambil data dari form
        const {
            nama,
            deskripsi,
            tipe,
            stok,
            tanggal_kadaluarsa,
        } = await request.json();

        // Validasi data wajib
        if (
            !nama?.trim() ||
            !deskripsi?.trim() ||
            !tipe ||
            stok === "" ||
            stok === undefined
        ) {
            return NextResponse.json(
                { message: "Semua data wajib diisi." },
                { status: 400 }
            );
        }

        // Validasi jenis obat
        if (!["keras", "biasa"].includes(tipe)) {
            return NextResponse.json(
                { message: "Jenis obat tidak valid." },
                { status: 400 }
            );
        }

        // Validasi stok
        const jumlahStok = Number(stok);

        if (
            !Number.isInteger(jumlahStok) ||
            jumlahStok < 0
        ) {
            return NextResponse.json(
                {
                    message:
                        "Stok harus berupa angka dan tidak boleh negatif.",
                },
                { status: 400 }
            );
        }

        // Validasi tanggal kedaluwarsa
        if (
            !validasiTanggalKadaluarsa(
                tanggal_kadaluarsa
            )
        ) {
            return NextResponse.json(
                {
                    message:
                        "Tanggal kedaluwarsa harus antara hari ini dan maksimal 10 tahun ke depan.",
                },
                { status: 400 }
            );
        }

        // Memperbarui data obat
        const result = await pool.query(
            `UPDATE medicines
             SET nama = $1,
                 deskripsi = $2,
                 tipe = $3,
                 stok = $4,
                 tanggal_kadaluarsa = $5
             WHERE id = $6
             RETURNING *`,
            [
                nama.trim(),
                deskripsi.trim(),
                tipe,
                jumlahStok,
                tanggal_kadaluarsa || null,
                obatId,
            ]
        );

        // Cek apakah obat ditemukan
        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Obat tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Data obat berhasil diperbarui.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Edit obat:", error);

        return NextResponse.json(
            { message: "Data obat gagal diperbarui." },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        // Cek hak akses admin
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        // Validasi ID obat
        const { id } = await params;
        const obatId = Number(id);

        if (
            !Number.isInteger(obatId) ||
            obatId <= 0
        ) {
            return NextResponse.json(
                { message: "ID obat tidak valid." },
                { status: 400 }
            );
        }

        // Menghapus data obat
        const result = await pool.query(
            "DELETE FROM medicines WHERE id = $1 RETURNING id",
            [obatId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Obat tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Data obat berhasil dihapus.",
        });
    } catch (error) {
        console.error("Hapus obat:", error);

        return NextResponse.json(
            {
                message:
                    "Data obat gagal dihapus. Periksa apakah obat masih memiliki data resep terkait.",
            },
            { status: 500 }
        );
    }
}