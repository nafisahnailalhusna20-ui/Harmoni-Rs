import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(request) {
    try {
        const {
            full_name,
            username,
            email,
            phone,
            password,
            confirm_password,
            poli_id,
        } = await request.json();

        // Validasi semua field wajib
        if (
            !full_name ||
            !username ||
            !email ||
            !phone ||
            !password ||
            !confirm_password ||
            !poli_id
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Semua field wajib diisi termasuk poliklinik.",
                },
                { status: 400 }
            );
        }

        // Validasi password cocok
        if (password !== confirm_password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Konfirmasi password tidak sama.",
                },
                { status: 400 }
            );
        }

        // Validasi panjang data
        if (full_name.trim().length > 120) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nama lengkap maksimal 120 karakter.",
                },
                { status: 400 }
            );
        }

        if (username.trim().length < 3 || username.trim().length > 30) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username harus terdiri dari 3–30 karakter.",
                },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password minimal 6 karakter.",
                },
                { status: 400 }
            );
        }

        // Validasi format email
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Format email tidak valid.",
                },
                { status: 400 }
            );
        }

        const usernameBersih = username.trim();
        const emailBersih = email.trim().toLowerCase();
        const phoneBersih = phone.trim();

        // Cek duplikasi username atau email
        const cekUser = await pool.query(
            `SELECT id
             FROM users
             WHERE LOWER(username) = LOWER($1)
                OR LOWER(email) = LOWER($2)`,
            [usernameBersih, emailBersih]
        );

        if (cekUser.rows.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username atau email sudah terdaftar.",
                },
                { status: 409 }
            );
        }

        // Cek duplikasi phone (UNIK)
        const cekPhone = await pool.query(
            `SELECT id FROM users WHERE phone = $1 AND phone IS NOT NULL`,
            [phoneBersih]
        );

        if (cekPhone.rows.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nomor telepon sudah terdaftar.",
                },
                { status: 409 }
            );
        }

        // Validasi poli_id ada di DB
        const cekPoli = await pool.query(
            `SELECT id FROM poli WHERE id = $1`,
            [poli_id]
        );

        if (cekPoli.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Poliklinik yang dipilih tidak valid.",
                },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await hash(password, 10);

        // Insert dokter baru dengan role='dokter' dan poli_id
        await pool.query(
            `INSERT INTO users (
                username,
                email,
                password_hash,
                role,
                full_name,
                phone,
                poli_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                usernameBersih,
                emailBersih,
                passwordHash,
                "dokter",
                full_name.trim(),
                phoneBersih,
                poli_id,
            ]
        );

        return NextResponse.json(
            {
                success: true,
                message: "Pendaftaran dokter berhasil! Silakan login.",
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Register dokter error:", error);

        // Handle unique constraint violation dari DB
        if (error.code === "23505") {
            if (error.constraint?.includes("phone")) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Nomor telepon sudah terdaftar.",
                    },
                    { status: 409 }
                );
            }
            return NextResponse.json(
                {
                    success: false,
                    message: "Username, email, atau nomor telepon sudah terdaftar.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan pada server.",
            },
            { status: 500 }
        );
    }
}
