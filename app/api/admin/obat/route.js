import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return false;
    }

    const user = await verifyToken(token);

    return user?.role === "admin";
}

// Validasi tanggal kedaluwarsa
function validasiTanggalKadaluarsa(tanggal) {
    // Tanggal boleh dikosongkan
    if (
        tanggal === null ||
        tanggal === undefined ||
        tanggal === ""
    ) {
        return true;
    }

    // Pastikan format YYYY-MM-DD
    if (
        typeof tanggal !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)
    ) {
        return false;
    }

    const [tahun, bulan, hari] = tanggal
        .split("-")
        .map(Number);

    // Periksa apakah tanggal benar-benar valid
    const jumlahHari = new Date(
        Date.UTC(tahun, bulan, 0)
    ).getUTCDate();

    if (
        bulan < 1 ||
        bulan > 12 ||
        hari < 1 ||
        hari > jumlahHari
    ) {
        return false;
    }

    // Tanggal hari ini berdasarkan waktu lokal
    const sekarang = new Date();

    const hariIni = [
        sekarang.getFullYear(),
        String(sekarang.getMonth() + 1).padStart(2, "0"),
        String(sekarang.getDate()).padStart(2, "0"),
    ].join("-");

    // Batas maksimal 10 tahun ke depan
    const tanggalMaksimal = [
        sekarang.getFullYear() + 10,
        String(sekarang.getMonth() + 1).padStart(2, "0"),
        String(sekarang.getDate()).padStart(2, "0"),
    ].join("-");

    return tanggal >= hariIni && tanggal <= tanggalMaksimal;
}

export async function GET() {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Akses ditolak.",
                },
                { status: 401 }
            );
        }

        const result = await pool.query(
            "SELECT * FROM medicines ORDER BY id ASC"
        );

        return NextResponse.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("Gagal mengambil data obat:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Data obat gagal dimuat.",
            },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Akses ditolak.",
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        const nama = String(body.nama || "").trim();
        const deskripsi = String(body.deskripsi || "").trim();
        const tipe = body.tipe;
        const stok = body.stok;
        const gambar = String(body.gambar || "").trim();
        const tanggal_kadaluarsa = body.tanggal_kadaluarsa || null;

        // Validasi data wajib
        if (
            !nama ||
            !deskripsi ||
            !tipe ||
            stok === "" ||
            stok === undefined ||
            stok === null
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Semua data wajib diisi.",
                },
                { status: 400 }
            );
        }

        // Validasi jenis obat
        if (!["keras", "biasa"].includes(tipe)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Jenis obat tidak valid.",
                },
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
                    success: false,
                    message:
                        "Stok harus berupa bilangan bulat dan tidak boleh negatif.",
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
                    success: false,
                    message:
                        "Tanggal kedaluwarsa harus antara hari ini dan maksimal 10 tahun ke depan.",
                },
                { status: 400 }
            );
        }

        // Simpan data obat
        const result = await pool.query(
            `INSERT INTO medicines
                (nama, deskripsi, tipe, stok, gambar, tanggal_kadaluarsa)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                nama,
                deskripsi,
                tipe,
                jumlahStok,
                gambar || null,
                tanggal_kadaluarsa,
            ]
        );

        return NextResponse.json(
            {
                success: true,
                message: "Data obat berhasil ditambahkan.",
                data: result.rows[0],
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "Gagal menambahkan data obat:",
            error
        );

        // Tampilkan pesan error database agar penyebabnya diketahui
        return NextResponse.json(
            {
                success: false,
                message: "Data obat gagal ditambahkan.",
                detail: error.message,
            },
            { status: 500 }
        );
    }
}