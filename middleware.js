import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(
    process.env.JWT_SECRET
);

export async function middleware(request) {
    const token = request.cookies.get("token")?.value;

    const pathname = request.nextUrl.pathname;

    const publicRoutes = ["/", "/login", "/register"];

    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }

    try {
        const { payload } = await jwtVerify(token, secretKey);

        const role = payload.role;
        if (
            pathname.startsWith("/admin") &&
            role !== "admin"
        ) {
            return NextResponse.redirect(
                new URL("/", request.url)
            );
        }

        if (
            pathname.startsWith("/dokter") &&
            role !== "dokter"
        ) {
            return NextResponse.redirect(
                new URL("/", request.url)
            );
        }

        if (
            pathname.startsWith("/pasien") &&
            role !== "pasien"
        ) {
            return NextResponse.redirect(
                new URL("/", request.url)
            );
        }

        return NextResponse.next();

    } catch (error) {
        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/dokter/:path*",
        "/pasien/:path*",
    ],
};
