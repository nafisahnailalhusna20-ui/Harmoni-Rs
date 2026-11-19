import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
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
        const { username, email, password, full_name, phone, poli_id } =
            await request.json();

        if (!username?.trim() || !email?.trim() ||
            !full_name?.trim() || !poli_id) {
            return NextResponse.json(
                { message: "Data wajib diisi." },
                { status: 400 }
            );
        }

        let result;

        if (password?.trim()) {
            if (password.length < 6) {
                return NextResponse.json(
                    { message: "Password minimal 6 karakter." },
                    { status: 400 }
                );
            }

            const passwordHash = await bcrypt.hash(password, 10);

            result = await pool.query(
                `UPDATE users
                 SET username=$1, email=$2, password_hash=$3,
                     full_name=$4, phone=$5, poli_id=$6
                 WHERE id=$7 AND role='dokter'
                 RETURNING id, username, email, full_name, phone, poli_id`,
                [username.trim(), email.trim(), passwordHash,
                full_name.trim(), phone?.trim() || null, poli_id, id]
            );
        } else {
            result = await pool.query(
                `UPDATE users
                 SET username=$1, email=$2, full_name=$3,
                     phone=$4, poli_id=$5
                 WHERE id=$6 AND role='dokter'
                 RETURNING id, username, email, full_name, phone, poli_id`,
                [username.trim(), email.trim(), full_name.trim(),
                phone?.trim() || null, poli_id, id]
            );
        }

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Dokter tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Data dokter berhasil diperbarui.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Edit dokter:", error);

        return NextResponse.json({
            message: error.code === "23505"
                ? "Username atau email sudah digunakan."
                : "Gagal memperbarui data dokter."
        }, {
            status: error.code === "23505" ? 409 : 500
        });
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
            "DELETE FROM users WHERE id=$1 AND role='dokter' RETURNING id",
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Dokter tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Dokter berhasil dihapus."
        });

    } catch (error) {
        console.error("Hapus dokter:", error);

        return NextResponse.json({
            message: "Dokter gagal dihapus. Periksa apakah dokter masih memiliki data terkait."
        }, { status: 500 });
    }
}