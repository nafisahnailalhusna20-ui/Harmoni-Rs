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

// Mengedit jadwal dokter
export async function PUT(request, { params }) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;
        const { dokter_id, hari, jam_mulai } = await request.json();

        if (!dokter_id || !hari || !jam_mulai) {
            return NextResponse.json(
                { message: "Semua data wajib diisi." },
                { status: 400 }
            );
        }

        const nomorHari = Number(hari);

        if (!Number.isInteger(nomorHari) || nomorHari < 1 || nomorHari > 7) {
            return NextResponse.json(
                { message: "Hari tidak valid." },
                { status: 400 }
            );
        }

        const cekDokter = await pool.query(
            "SELECT id FROM users WHERE id = $1 AND role = 'dokter'",
            [dokter_id]
        );

        if (cekDokter.rowCount === 0) {
            return NextResponse.json(
                { message: "Dokter tidak ditemukan." },
                { status: 404 }
            );
        }

        const jam = await pool.query(
            `SELECT $1::time AS mulai,
                    ($1::time + INTERVAL '30 minutes')::time AS selesai`,
            [jam_mulai]
        );

        const jamSelesai = jam.rows[0].selesai;

        const cekBentrok = await pool.query(
            `SELECT id FROM schedules
             WHERE dokter_id = $1
             AND hari = $2
             AND id <> $3
             AND jam_mulai < $4
             AND (jam_mulai + durasi * INTERVAL '1 minute') > $5`,
            [dokter_id, nomorHari, id, jamSelesai, jam_mulai]
        );

        if (cekBentrok.rowCount > 0) {
            return NextResponse.json(
                { message: "Jadwal dokter bertabrakan dengan jadwal lain." },
                { status: 409 }
            );
        }

        const result = await pool.query(
            `UPDATE schedules
             SET dokter_id = $1, hari = $2, jam_mulai = $3, durasi = 30
             WHERE id = $4
             RETURNING *`,
            [dokter_id, nomorHari, jam_mulai, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Jadwal tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Jadwal berhasil diperbarui.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Edit jadwal:", error);

        return NextResponse.json(
            { message: "Jadwal gagal diperbarui." },
            { status: 500 }
        );
    }
}

// Menghapus jadwal dokter
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
            "DELETE FROM schedules WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Jadwal tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Jadwal berhasil dihapus."
        });

    } catch (error) {
        console.error("Hapus jadwal:", error);

        return NextResponse.json(
            { message: "Jadwal gagal dihapus." },
            { status: 500 }
        );
    }
}