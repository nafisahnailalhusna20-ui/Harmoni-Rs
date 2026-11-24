import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { compare } from "bcryptjs";
import { createToken } from "@/lib/auth";

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { message: "Username dan password wajib diisi." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        const user = result.rows[0];

        if (!user) {
            return NextResponse.json(
                { message: "Username atau password salah." },
                { status: 401 }
            );
        }

        const passwordValid = await compare(
            password,
            user.password_hash
        );

        if (!passwordValid) {
            return NextResponse.json(
                { message: "Username atau password salah." },
                { status: 401 }
            );
        }

        if (user.is_active === false) {
            return NextResponse.json(
                { message: "Akun Anda telah dinonaktifkan oleh administrator. Silakan hubungi admin." },
                { status: 403 }
            );
        }

        const token = await createToken(user);

        const response = NextResponse.json({
            success: true,
            message: "Login berhasil!",
            role: user.role,
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
