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
        const { nama, deskripsi, ikon } = await request.json();

        if (!nama?.trim() || !deskripsi?.trim()) {
            return NextResponse.json(
                { message: "Nama dan deskripsi wajib diisi." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `UPDATE poli
             SET nama = $1, deskripsi = $2, ikon = $3
             WHERE id = $4
             RETURNING *`,
            [nama.trim(), deskripsi.trim(), ikon?.trim() || null, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Data poli tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Data poli berhasil diperbarui.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Edit poli:", error);

        return NextResponse.json(
            {
                message: error.code === "23505"
                    ? "Nama poli sudah digunakan."
                    : "Gagal memperbarui data poli."
            },
            { status: error.code === "23505" ? 409 : 500 }
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
            "DELETE FROM poli WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Data poli tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Data poli berhasil dihapus."
        });

    } catch (error) {
        console.error("Hapus poli:", error);

        return NextResponse.json(
            { message: "Data poli gagal dihapus." },
            { status: 500 }
        );
    }
}