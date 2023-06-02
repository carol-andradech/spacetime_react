import { api } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  //redirecior para a home
  const { searchParams } = new URL(request.url);
  // console.log(searchParams); URLSearchParams { 'code' => '70bc9ba003ded34c6801' }
  const code = searchParams.get("code");

  const registerResponse = await api.post("/register", {
    code,
  });

  const { token } = registerResponse.data;

  const redirectURL = new URL("/", request.url);

  const cookieExpiresInSeconds = 60 * 60 * 24 * 30;

  //salvando nos cookies o tolken
  return NextResponse.redirect(redirectURL, {
    headers: {
      "Set-Cookie": `token=${token};  Path=/; max-age=${cookieExpiresInSeconds}`, //max-age quando o cookie expira
    },
  });
}
