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
        } = await request.json();

        // Validasi data wajib
        if (
            !full_name ||
            !username ||
            !email ||
            !password
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nama lengkap, username, email, dan password wajib diisi.",
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

        // Format email sederhana
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

        // Cek username atau email yang sudah digunakan
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

        // Hash password sebelum disimpan
        const passwordHash = await hash(password, 10);

        // Daftar sebagai pasien
        await pool.query(
            `INSERT INTO users (
                username,
                email,
                password_hash,
                role,
                full_name,
                phone
            )
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                usernameBersih,
                emailBersih,
                passwordHash,
                "pasien",
                full_name.trim(),
                phone?.trim() || null,
            ]
        );

        return NextResponse.json(
            {
                success: true,
                message: "Pendaftaran berhasil! Silakan login.",
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Register error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan pada server.",
            },
            { status: 500 }
        );
    }
}