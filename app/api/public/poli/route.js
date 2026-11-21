import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
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