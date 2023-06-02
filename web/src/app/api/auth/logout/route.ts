import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  //redirecior para a home
  const redirectURL = new URL("/", request.url);

  //passar um token vazio e sem max-age para deslogar
  return NextResponse.redirect(redirectURL, {
    headers: {
      "Set-Cookie": `token=;  Path=/; max-age=0;`,
    },
  });
}
