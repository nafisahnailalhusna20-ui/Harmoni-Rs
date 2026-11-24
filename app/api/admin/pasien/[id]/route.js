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

function validasiEmail(email) {
    const formatEmail =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    return formatEmail.test(email);
}

function validasiTelepon(phone) {
    if (!phone) return true;

    return /^[0-9]{10,15}$/.test(phone);
}

function validasiTanggalLahir(tanggal) {
    if (!tanggal) return true;

    if (typeof tanggal !== "string") return false;

    const formatTanggal = /^\d{4}-\d{2}-\d{2}$/;

    if (!formatTanggal.test(tanggal)) return false;

    if (
        tanggal < "1945-01-01" ||
        tanggal > "2026-12-31"
    ) {
        return false;
    }

    const date = new Date(`${tanggal}T00:00:00Z`);

    return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === tanggal;
}

export async function PUT() {
    return NextResponse.json(
        { message: "Fitur edit akun pasien telah dinonaktifkan. Admin hanya dapat mengaktifkan/menonaktifkan atau menghapus akun." },
        { status: 405 }
    );
}

export async function PATCH(request, { params }) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const isActive = Boolean(body.is_active);

        const result = await pool.query(
            "UPDATE users SET is_active = $1 WHERE id = $2 AND role = 'pasien' RETURNING id, is_active",
            [isActive, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "Pasien tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: isActive ? "Akun pasien berhasil diaktifkan." : "Akun pasien berhasil dinonaktifkan.",
            is_active: result.rows[0].is_active,
        });

    } catch (error) {
        console.error("Gagal mengubah status pasien:", error);

        return NextResponse.json(
            { message: "Gagal memperbarui status akun pasien." },
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
            `DELETE FROM users
             WHERE id=$1 AND role='pasien'
             RETURNING id`,
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Pasien tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Pasien berhasil dihapus."
        });

    } catch (error) {
        console.error("Hapus pasien:", error);

        return NextResponse.json({
            message: "Pasien gagal dihapus. Periksa apakah pasien masih memiliki data terkait."
        }, { status: 500 });
    }
}