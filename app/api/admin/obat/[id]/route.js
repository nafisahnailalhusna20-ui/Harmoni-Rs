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

export async function PUT(request, { params }) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;

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
            `UPDATE medicines
             SET nama = $1,
                 deskripsi = $2,
                 tipe = $3,
                 stok = $4,
                 gambar = $5,
                 tanggal_kadaluarsa = $6
             WHERE id = $7
             RETURNING *`,
            [
                nama.trim(),
                deskripsi.trim(),
                tipe,
                jumlahStok,
                gambar?.trim() || null,
                tanggal_kadaluarsa || null,
                id
            ]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Obat tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Data obat berhasil diperbarui.",
            data: result.rows[0]
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
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;

        const result = await pool.query(
            "DELETE FROM medicines WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Obat tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Data obat berhasil dihapus."
        });

    } catch (error) {
        console.error("Hapus obat:", error);

        return NextResponse.json(
            {
                message: "Data obat gagal dihapus."
            },
            { status: 500 }
        );
    }
}