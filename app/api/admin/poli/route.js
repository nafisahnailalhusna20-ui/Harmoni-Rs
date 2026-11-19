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

// Mengambil data poli
export async function GET() {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const result = await pool.query(
            "SELECT * FROM poli ORDER BY id ASC"
        );

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Data poli gagal dimuat." },
            { status: 500 }
        );
    }
}

// Menambahkan data poli
export async function POST(request) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { nama, deskripsi, ikon } = await request.json();

        if (!nama?.trim() || !deskripsi?.trim()) {
            return NextResponse.json(
                { message: "Nama dan deskripsi wajib diisi." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `INSERT INTO poli (nama, deskripsi, ikon)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                nama.trim(),
                deskripsi.trim(),
                ikon?.trim() || null
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Data poli berhasil ditambahkan.",
            data: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: error.code === "23505"
                    ? "Nama poli sudah digunakan."
                    : "Data poli gagal ditambahkan."
            },
            { status: error.code === "23505" ? 409 : 500 }
        );
    }
}