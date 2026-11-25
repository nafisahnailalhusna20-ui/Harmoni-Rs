import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

// ========================================
// AMBIL USER YANG SEDANG LOGIN
// ========================================
async function ambilUserLogin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const user = await verifyToken(token);

    return user || null;
}

// ========================================
// SIMPAN FOTO
// ========================================
async function simpanFoto(foto) {
    if (!foto || foto.size === 0) {
        return null;
    }

    const formatFoto = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    };

    if (!formatFoto[foto.type]) {
        throw new Error(
            "Foto harus berformat JPG, PNG, atau WebP."
        );
    }

    if (foto.size > 2 * 1024 * 1024) {
        throw new Error(
            "Ukuran foto maksimal 2 MB."
        );
    }

    const namaFile = randomUUID() + formatFoto[foto.type];

    const folderFoto = path.join(
        process.cwd(),
        "public",
        "uploads"
    );

    await mkdir(folderFoto, { recursive: true });

    const bufferFoto = Buffer.from(
        await foto.arrayBuffer()
    );

    await writeFile(
        path.join(folderFoto, namaFile),
        bufferFoto
    );

    return "/uploads/" + namaFile;
}

// ========================================
// GET PROFIL
// ========================================
export async function GET() {
    try {
        const user = await ambilUserLogin();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Silakan login terlebih dahulu."
                },
                { status: 401 }
            );
        }

        const result = await pool.query(
            `SELECT
                id,
                username,
                email,
                full_name,
                phone,
                address,
                birth_date,
                photo,
                hero_photo,
                role
             FROM users
             WHERE id = $1`,
            [user.id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Data pengguna tidak ditemukan."
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Gagal mengambil profil:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Profil gagal dimuat."
            },
            { status: 500 }
        );
    }
}

// ========================================
// PUT UPDATE PROFIL
// ========================================
export async function PUT(request) {
    try {
        const user = await ambilUserLogin();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Silakan login terlebih dahulu."
                },
                { status: 401 }
            );
        }

        let data;
        let foto = null;
        let fotoHero = null;

        const contentType =
            request.headers.get("content-type") || "";

        // Request menggunakan FormData
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();

            data = {
                username: formData.get("username"),
                email: formData.get("email"),
                full_name: formData.get("full_name"),
                phone: formData.get("phone"),
                address: formData.get("address"),
                birth_date: formData.get("birth_date")
            };

            foto = formData.get("photo");
            fotoHero = formData.get("hero_photo");

        } else {
            data = await request.json();
        }

        const {
            username,
            email,
            full_name,
            phone,
            address,
            birth_date
        } = data;

        // Bersihkan data
        const usernameBersih =
            typeof username === "string"
                ? username.trim()
                : "";

        const emailBersih =
            typeof email === "string"
                ? email.trim()
                : "";

        const namaBersih =
            typeof full_name === "string"
                ? full_name.trim()
                : "";

        const teleponBersih =
            typeof phone === "string"
                ? phone.trim()
                : "";

        // ========================================
        // VALIDASI DATA WAJIB
        // ========================================
        if (
            !usernameBersih ||
            !emailBersih ||
            !namaBersih
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Username, email, dan nama lengkap wajib diisi."
                },
                { status: 400 }
            );
        }

        // ========================================
        // VALIDASI EMAIL GMAIL
        // Email harus berakhiran @gmail.com
        // ========================================
        const formatEmail =
            /^[A-Za-z0-9._%+-]+@gmail\.com$/i;

        if (!formatEmail.test(emailBersih)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Email harus menggunakan format lengkap @gmail.com."
                },
                { status: 400 }
            );
        }

        // ========================================
        // CEK EMAIL DUPLIKAT
        // Tidak boleh sama dengan email pasien
        // atau dokter lain.
        // Akun sendiri tidak dihitung duplikat.
        // ========================================
        const emailDuplikat = await pool.query(
            `SELECT id
             FROM users
             WHERE LOWER(email) = LOWER($1)
               AND id <> $2
               AND role IN ('pasien', 'dokter')
             LIMIT 1`,
            [emailBersih, user.id]
        );

        if (emailDuplikat.rowCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Email ini sudah digunakan pasien atau dokter lain. Gunakan email berbeda."
                },
                { status: 409 }
            );
        }

        // ========================================
        // VALIDASI TANGGAL LAHIR
        // Tahun minimal 1945
        // Tahun maksimal tahun sekarang
        // ========================================
        if (
            birth_date !== undefined &&
            birth_date !== null &&
            birth_date !== ""
        ) {
            if (
                typeof birth_date !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(birth_date)
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Tanggal lahir tidak valid."
                    },
                    { status: 400 }
                );
            }

            const [
                tahunLahir,
                bulanLahir,
                hariLahir
            ] = birth_date.split("-").map(Number);

            const tanggalLahir = new Date(
                Date.UTC(
                    tahunLahir,
                    bulanLahir - 1,
                    hariLahir
                )
            );

            // Memastikan tanggal benar-benar valid
            const tanggalValid =
                tanggalLahir.getUTCFullYear() === tahunLahir &&
                tanggalLahir.getUTCMonth() === bulanLahir - 1 &&
                tanggalLahir.getUTCDate() === hariLahir;

            const sekarang = new Date();

            const tahunSekarang = sekarang.getFullYear();

            const tanggalSekarang = [
                tahunSekarang,
                String(sekarang.getMonth() + 1).padStart(2, "0"),
                String(sekarang.getDate()).padStart(2, "0")
            ].join("-");

            if (
                !tanggalValid ||
                tahunLahir < 1945 ||
                tahunLahir > tahunSekarang ||
                birth_date > tanggalSekarang
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Tahun lahir harus antara 1945 sampai ${tahunSekarang} dan tanggal tidak boleh di masa depan.`
                    },
                    { status: 400 }
                );
            }
        }

        // ========================================
        // VALIDASI NOMOR TELEPON
        // ========================================
        if (
            phone !== undefined &&
            phone !== null &&
            typeof phone !== "string"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nomor telepon tidak valid."
                },
                { status: 400 }
            );
        }

        if (
            teleponBersih &&
            !/^[0-9]{10,15}$/.test(teleponBersih)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Nomor telepon harus terdiri dari 10–15 angka."
                },
                { status: 400 }
            );
        }

        // ========================================
        // CEK NOMOR TELEPON DUPLIKAT
        // Tidak boleh sama dengan pasien lain.
        // ========================================
        if (teleponBersih) {
            const teleponDuplikat = await pool.query(
                `SELECT id
                 FROM users
                 WHERE role = 'pasien'
                   AND id <> $1
                   AND regexp_replace(
                       COALESCE(phone, ''),
                       '[^0-9]',
                       '',
                       'g'
                   ) = regexp_replace(
                       $2,
                       '[^0-9]',
                       '',
                       'g'
                   )
                 LIMIT 1`,
                [user.id, teleponBersih]
            );

            if (teleponDuplikat.rowCount > 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Nomor telepon ini sudah digunakan pasien lain."
                    },
                    { status: 409 }
                );
            }
        }

        // ========================================
        // FOTO PROFIL DAN FOTO HERO
        // ========================================
        let fotoPath = null;
        let fotoHeroPath = null;

        // Pasien hanya bisa upload foto profil.
        // Dokter bisa upload foto profil dan hero.
        if (foto && foto.size > 0) {
            if (
                user.role === "dokter" ||
                user.role === "pasien"
            ) {
                fotoPath = await simpanFoto(foto);
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Unggah foto hanya tersedia untuk dokter dan pasien."
                    },
                    { status: 403 }
                );
            }
        }

        if (fotoHero && fotoHero.size > 0) {
            if (user.role !== "dokter") {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Unggah foto hero hanya tersedia untuk dokter."
                    },
                    { status: 403 }
                );
            }

            fotoHeroPath = await simpanFoto(fotoHero);
        }

        // ========================================
        // UPDATE PROFIL KE DATABASE
        // ========================================
        const result = await pool.query(
            `UPDATE users
             SET username = $1,
                 email = $2,
                 full_name = $3,
                 phone = $4,
                 address = $5,
                 birth_date = $6,

                 photo = CASE
                    WHEN $7::text IS NOT NULL THEN $7
                    ELSE photo
                 END,

                 hero_photo = CASE
                    WHEN $8::text IS NOT NULL THEN $8
                    ELSE hero_photo
                 END

             WHERE id = $9

             RETURNING
                id,
                username,
                email,
                full_name,
                phone,
                address,
                birth_date,
                photo,
                hero_photo,
                role`,
            [
                usernameBersih,
                emailBersih,
                namaBersih,
                teleponBersih || null,
                typeof address === "string"
                    ? address.trim() || null
                    : null,
                birth_date || null,
                fotoPath,
                fotoHeroPath,
                user.id
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Profil berhasil diperbarui.",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Gagal memperbarui profil:",
            error
        );

        // Error validasi foto
        if (
            error.message ===
            "Foto harus berformat JPG, PNG, atau WebP." ||
            error.message ===
            "Ukuran foto maksimal 2 MB."
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message
                },
                { status: 400 }
            );
        }

        // Username atau email duplikat
        if (error.code === "23505") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Username atau email sudah digunakan."
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Profil gagal diperbarui."
            },
            { status: 500 }
        );
    }
}

// ========================================
// PATCH GANTI PASSWORD
// ========================================
export async function PATCH(request) {
    try {
        const user = await ambilUserLogin();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Silakan login terlebih dahulu."
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        const {
            password_lama,
            password_baru
        } = body;

        if (
            !password_lama ||
            !password_baru
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password lama dan password baru wajib diisi."
                },
                { status: 400 }
            );
        }

        if (password_baru.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password baru minimal 6 karakter."
                },
                { status: 400 }
            );
        }

        // Ambil password_hash dari database
        const result = await pool.query(
            `SELECT password_hash
             FROM users
             WHERE id = $1`,
            [user.id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Pengguna tidak ditemukan."
                },
                { status: 404 }
            );
        }

        const passwordHash =
            result.rows[0].password_hash;

        // Verifikasi password lama
        const passwordCocok = await bcrypt.compare(
            password_lama,
            passwordHash
        );

        if (!passwordCocok) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password lama tidak sesuai."
                },
                { status: 400 }
            );
        }

        // Hash password baru
        const passwordBaruHash =
            await bcrypt.hash(password_baru, 10);

        // Simpan password baru
        await pool.query(
            `UPDATE users
             SET password_hash = $1
             WHERE id = $2`,
            [passwordBaruHash, user.id]
        );

        return NextResponse.json({
            success: true,
            message: "Password berhasil diperbarui."
        });

    } catch (error) {
        console.error(
            "Gagal mengganti password:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Gagal mengganti password. Silakan coba lagi."
            },
            { status: 500 }
        );
    }
}