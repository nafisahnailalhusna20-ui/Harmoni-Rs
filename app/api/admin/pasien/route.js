import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function cekAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return false;

    const user = await verifyToken(token);
    return user?.role === "admin";
}

// Mengambil semua data pasien
export async function GET() {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const result = await pool.query(
            `SELECT id, username, email, full_name, phone, address, birth_date
             FROM users
             WHERE role = 'pasien'
             ORDER BY id ASC`
        );

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil data pasien:", error);

        return NextResponse.json(
            { message: "Data pasien gagal dimuat." },
            { status: 500 }
        );
    }
}

// Menambahkan akun pasien
export async function POST(request) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const {
            username,
            email,
            password,
            full_name,
            phone,
            address,
            birth_date
        } = await request.json();

        if (
            !username?.trim() ||
            !email?.trim() ||
            !password ||
            !full_name?.trim()
        ) {
            return NextResponse.json(
                { message: "Nama, username, email, dan password wajib diisi." },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password minimal 6 karakter." },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users
            (username, email, password_hash, role, full_name, phone, address, birth_date)
            VALUES ($1, $2, $3, 'pasien', $4, $5, $6, $7)
            RETURNING id, username, email, full_name, role`,
            [
                username.trim(),
                email.trim(),
                passwordHash,
                full_name.trim(),
                phone?.trim() || null,
                address?.trim() || null,
                birth_date || null
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Akun pasien berhasil ditambahkan.",
            data: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error("Gagal menambahkan pasien:", error);

        if (error.code === "23505") {
            return NextResponse.json(
                { message: "Username atau email sudah digunakan." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Akun pasien gagal ditambahkan." },
            { status: 500 }
        );
    }
}