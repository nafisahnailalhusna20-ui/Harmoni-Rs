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
export async function GET() {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const result = await pool.query(
            "SELECT * FROM medicines ORDER BY id ASC"
        );

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil data obat:", error);

        return NextResponse.json(
            { message: "Data obat gagal dimuat." },
            { status: 500 }
        );
    }
}

// Menambahkan data obat
export async function POST(request) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const {
            nama,
            deskripsi,
            tipe,
            stok,
            gambar,
            tanggal_kadaluarsa
        } = await request.json();

        if (!nama?.trim() || !deskripsi?.trim() || !tipe || stok === "" || stok === undefined) {
            return NextResponse.json(
                { message: "Semua data wajib diisi." },
                { status: 400 }
            );
        }

        if (!["keras", "biasa"].includes(tipe)) {
            return NextResponse.json(
                { message: "Jenis obat tidak valid." },
                { status: 400 }
            );
        }

        const jumlahStok = Number(stok);

        if (!Number.isInteger(jumlahStok) || jumlahStok < 0) {
            return NextResponse.json(
                { message: "Stok harus berupa angka dan tidak boleh negatif." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `INSERT INTO medicines
            (nama, deskripsi, tipe, stok, gambar, tanggal_kadaluarsa)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                nama.trim(),
                deskripsi.trim(),
                tipe,
                jumlahStok,
                gambar?.trim() || null,
                tanggal_kadaluarsa || null
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Data obat berhasil ditambahkan.",
            data: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error("Gagal menambahkan obat:", error);

        return NextResponse.json(
            { message: "Data obat gagal ditambahkan." },
            { status: 500 }
        );
    }
}