import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
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

export async function PUT(request, { params }) {
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

        const username = String(body.username || "").trim();
        const email = String(body.email || "").trim();
        const password = String(body.password || "");
        const full_name = String(body.full_name || "").trim();
        const phone = String(body.phone || "").trim();
        const poli_id = Number(body.poli_id);

        if (!username || !email || !full_name || !poli_id) {
            return NextResponse.json(
                { success: false, message: "Data wajib diisi." },
                { status: 400 }
            );
        }

        if (username.length < 3 || username.length > 30) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username harus terdiri dari 3–30 karakter."
                },
                { status: 400 }
            );
        }

        if (!emailGmailValid(email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email wajib menggunakan @gmail.com."
                },
                { status: 400 }
            );
        }

        if (password && password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password minimal 6 karakter."
                },
                { status: 400 }
            );
        }

        if (phone && !/^[0-9]{10,15}$/.test(phone)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nomor telepon harus terdiri dari 10–15 digit."
                },
                { status: 400 }
            );
        }

        const dokter = await pool.query(
            "SELECT id FROM users WHERE id = $1 AND role = 'dokter'",
            [dokterId]
        );

        if (dokter.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Dokter tidak ditemukan." },
                { status: 404 }
            );
        }

        const poli = await pool.query(
            "SELECT id FROM poli WHERE id = $1",
            [poli_id]
        );

        if (poli.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Poli tidak ditemukan." },
                { status: 400 }
            );
        }

        let password_hash = null;

        if (password) {
            password_hash = await bcrypt.hash(password, 10);
        }

        await pool.query(
            `UPDATE users
             SET username = $1,
                 email = $2,
                 full_name = $3,
                 phone = $4,
                 poli_id = $5,
                 password_hash = COALESCE($6, password_hash)
             WHERE id = $7 AND role = 'dokter'`,
            [
                username,
                email,
                full_name,
                phone || null,
                poli_id,
                password_hash,
                dokterId
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Data dokter berhasil diperbarui."
        });

    } catch (error) {
        if (error.code === "23505") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username atau email sudah digunakan."
                },
                { status: 409 }
            );
        }

        console.error("Gagal mengedit dokter:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Data dokter gagal diperbarui."
            },
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