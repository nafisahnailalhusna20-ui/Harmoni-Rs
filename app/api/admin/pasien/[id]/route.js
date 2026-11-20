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
            full_name,
            username,
            email,
            phone,
            address,
            birth_date
        } = await request.json();

        if (!full_name?.trim() || !username?.trim() || !email?.trim()) {
            return NextResponse.json(
                { message: "Nama, username, dan email wajib diisi." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `UPDATE users
             SET full_name = $1,
                 username = $2,
                 email = $3,
                 phone = $4,
                 address = $5,
                 birth_date = $6
             WHERE id = $7 AND role = 'pasien'
             RETURNING id, full_name, username, email, phone, address, birth_date`,
            [
                full_name.trim(),
                username.trim(),
                email.trim(),
                phone?.trim() || null,
                address?.trim() || null,
                birth_date || null,
                id
            ]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Data pasien tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Data pasien berhasil diperbarui.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Gagal mengubah pasien:", error);

        return NextResponse.json(
            {
                message: error.code === "23505"
                    ? "Username atau email sudah digunakan."
                    : "Data pasien gagal diperbarui."
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
            `DELETE FROM users
             WHERE id = $1 AND role = 'pasien'
             RETURNING id`,
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Data pasien tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Data pasien berhasil dihapus."
        });

    } catch (error) {
        console.error("Gagal menghapus pasien:", error);

        return NextResponse.json(
            {
                message: error.code === "23503"
                    ? "Pasien tidak dapat dihapus karena masih memiliki data terkait."
                    : "Data pasien gagal dihapus."
            },
            { status: error.code === "23503" ? 409 : 500 }
        );
    }
}