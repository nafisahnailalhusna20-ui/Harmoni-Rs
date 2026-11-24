import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Tamu / guest tanpa login tetap boleh mencari obat
    if (!token) return { role: "guest" };

    const user = await verifyToken(token);
    if (!user) return { role: "guest" };

    // Admin memiliki menu khusus kelola obat di /admin/obat
    if (user.role === "admin") return null;

    return user;
}

export async function GET(request) {
    const user = await cekUser();

    if (!user) {
        return NextResponse.json(
            { success: false, message: "Akses tidak diizinkan untuk admin pada endpoint ini." },
            { status: 403 }
        );
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const pola = `%${q}%`;

    try {
        const result = await pool.query(
            `SELECT id, nama, deskripsi, tipe, stok, tanggal_kadaluarsa
             FROM medicines
             WHERE LOWER(nama) LIKE LOWER($1)
             ORDER BY nama ASC`,
            [pola]
        );

        return NextResponse.json(
            { success: true, data: result.rows },
            { status: 200 }
        );
    } catch (error) {
        console.error("Gagal mengambil data obat:", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
