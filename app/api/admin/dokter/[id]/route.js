import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function emailGmailValid(email) {
    return /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email);
}

async function cekAdmin(request) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return null;
    }

    const user = await verifyToken(token);

    if (!user || user.role !== "admin") {
        return null;
    }

    return user;
}

export async function PUT() {
    return NextResponse.json(
        { success: false, message: "Fitur edit akun dokter telah dinonaktifkan. Admin hanya dapat mengaktifkan/menonaktifkan atau menghapus akun." },
        { status: 405 }
    );
}

export async function PATCH(request, { params }) {
    try {
        const user = await cekAdmin(request);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Akses hanya untuk admin." },
                { status: 401 }
            );
        }

        const { id } = await params;
        const dokterId = Number(id);

        if (!Number.isInteger(dokterId) || dokterId <= 0) {
            return NextResponse.json(
                { success: false, message: "ID dokter tidak valid." },
                { status: 400 }
            );
        }

        const body = await request.json();
        const isActive = Boolean(body.is_active);

        const result = await pool.query(
            "UPDATE users SET is_active = $1 WHERE id = $2 AND role = 'dokter' RETURNING id, is_active",
            [isActive, dokterId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Dokter tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: isActive ? "Akun dokter berhasil diaktifkan." : "Akun dokter berhasil dinonaktifkan.",
            is_active: result.rows[0].is_active,
        });

    } catch (error) {
        console.error("Gagal mengubah status dokter:", error);

        return NextResponse.json(
            { success: false, message: "Gagal memperbarui status akun dokter." },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const user = await cekAdmin(request);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Akses hanya untuk admin." },
                { status: 401 }
            );
        }

        const { id } = await params;
        const dokterId = Number(id);

        if (!Number.isInteger(dokterId) || dokterId <= 0) {
            return NextResponse.json(
                { success: false, message: "ID dokter tidak valid." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 AND role = 'dokter' RETURNING id",
            [dokterId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Dokter tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Dokter berhasil dihapus."
        });

    } catch (error) {
        console.error("Gagal menghapus dokter:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Dokter gagal dihapus. Periksa apakah dokter masih memiliki data terkait."
            },
            { status: 500 }
        );
    }
}