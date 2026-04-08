import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Doctor-only routes
    if (
      pathname.startsWith("/doctor/dashboard") ||
      pathname.startsWith("/doctor/consultation")
    ) {
      if (token?.role !== "doctor") {
        return NextResponse.redirect(new URL("/doctor/login", req.url));
      }
    }

    // ASHA-only routes
    if (
      pathname.startsWith("/asha/dashboard") ||
      pathname.startsWith("/asha/log-visit") ||
      pathname.startsWith("/asha/sos")
    ) {
      if (token?.role !== "ashaworker") {
        return NextResponse.redirect(new URL("/asha/login", req.url));
      }
    }

    // Pharmacist-only routes
    if (pathname.startsWith("/pharmacist/dashboard")) {
      if (token?.role !== "pharmacist") {
        return NextResponse.redirect(new URL("/pharmacist/login", req.url));
      }
    }

    // Patient-only routes
    const patientRoutes = ["/home", "/symptoms", "/records", "/report", "/triage", "/confirm"];
    if (patientRoutes.some((r) => pathname.startsWith(r))) {
      if (token?.role !== "patient") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const publicPaths = [
          "/login",
          "/doctor/login",
          "/pharmacist/login",
          "/asha/login",
          "/api/auth",
          "/_next",
          "/favicon",
          "/",
        ];
        if (publicPaths.some((p) => pathname.startsWith(p))) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/home/:path*",
    "/symptoms/:path*",
    "/records/:path*",
    "/report/:path*",
    "/triage/:path*",
    "/confirm/:path*",
    "/doctor/dashboard/:path*",
    "/doctor/consultation/:path*",
    "/asha/dashboard/:path*",
    "/asha/log-visit/:path*",
    "/asha/sos",
    "/asha/sos/:path*",
    "/pharmacist/dashboard/:path*",
  ],
};
