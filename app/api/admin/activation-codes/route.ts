import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://trixlearn-backend.net-trixsolutions.com/api/v1";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Admin session is missing. Please login again." } },
      { status: 401 }
    );
  }

  const body = await request.text();

  try {
    const response = await fetch(`${API_BASE_URL}/admin/activation-codes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body,
      cache: "no-store",
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BACKEND_UNREACHABLE",
          message: error instanceof Error ? error.message : "Activation-code backend request failed.",
        },
      },
      { status: 502 }
    );
  }
}
