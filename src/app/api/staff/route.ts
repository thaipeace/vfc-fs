import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "getUsers";
  const userHasZalo = searchParams.get("userHasZalo");

  const scriptUrl =
    process.env.NEXT_PUBLIC_GAS_LOGIN_API_URL || process.env.GAS_LOGIN_API_URL;

  if (!scriptUrl) {
    return NextResponse.json(
      { error: "Apps Script URL not configured" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify({
        action: action,
        userHasZalo: userHasZalo,
        requester: "admin",
      }),
    });

    if (!response.ok) {
      throw new Error(`GAS returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from Apps Script:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
