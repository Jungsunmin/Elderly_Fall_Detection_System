import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

type GoogleUserInfo = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  picture?: string;
};

function buildGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("GOOGLE_CLIENT_ID 또는 GOOGLE_REDIRECT_URI가 없습니다.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function createAuthRouter(): Router {
  const router = Router();

  // 1) 프론트 -> 이 엔드포인트 호출
  router.get("/authorization/google", (req, res) => {
    try {
      const redirectUriFromFrontend = String(req.query.redirect_uri ?? "");
      const state = Buffer.from(
        JSON.stringify({
          t: Date.now(),
          redirectUri: redirectUriFromFrontend,
        }),
      ).toString("base64url");

      const url = buildGoogleAuthUrl(state);
      return res.redirect(url);
    } catch (error) {
      console.error("GET /oauth2/authorization/google error:", error);
      return res.status(500).json({ error: "구글 로그인 시작 실패" });
    }
  });

  // 2) 구글 -> 이 콜백으로 code 전달
  router.get("/callback/google", async (req, res) => {
    try {
      const code = String(req.query.code ?? "");
      const stateRaw = String(req.query.state ?? "");

      if (!code) {
        return res.status(400).json({ error: "code가 없습니다." });
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;
      const jwtSecret = process.env.JWT_SECRET;
      const frontendUrl = process.env.FRONTEND_URL;

      if (
        !clientId ||
        !clientSecret ||
        !redirectUri ||
        !jwtSecret ||
        !frontendUrl
      ) {
        return res.status(500).json({ error: "서버 OAuth/JWT 환경변수 누락" });
      }

      // code -> access_token 교환
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }).toString(),
      });

      if (!tokenRes.ok) {
        const text = await tokenRes.text();
        console.error("Google token exchange failed:", text);
        return res.status(400).json({ error: "구글 토큰 교환 실패" });
      }

      const tokenJson = (await tokenRes.json()) as GoogleTokenResponse;

      // access_token으로 사용자 정보 조회
      const userInfoRes = await fetch(
        "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
        {
          headers: {
            Authorization: `Bearer ${tokenJson.access_token}`,
          },
        },
      );

      if (!userInfoRes.ok) {
        const text = await userInfoRes.text();
        console.error("Google userinfo failed:", text);
        return res.status(400).json({ error: "구글 사용자 정보 조회 실패" });
      }

      const googleUser = (await userInfoRes.json()) as GoogleUserInfo;

      // DB upsert (providerId 기준)
      const user = await prisma.user.upsert({
        where: { providerId: googleUser.id },
        update: {
          email: googleUser.email,
          name: googleUser.name,
        },
        create: {
          providerId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
        },
      });

      // 서비스 JWT 발급
      const appToken = jwt.sign(
        {
          sub: user.id,
          email: user.email,
          providerId: user.providerId,
        },
        jwtSecret,
        { expiresIn: "7d" },
      );

      // 프론트 redirect_uri 우선 사용, 없으면 기본 경로
      let callbackPath = "/login/oauth2/code/google";
      if (stateRaw) {
        try {
          const parsed = JSON.parse(
            Buffer.from(stateRaw, "base64url").toString("utf-8"),
          ) as {
            redirectUri?: string;
          };
          if (parsed.redirectUri) {
            const url = new URL(parsed.redirectUri);
            callbackPath = `${url.pathname}${url.search}`;
          }
        } catch {
          // state 파싱 실패 시 기본값 사용
        }
      }

      const finalUrl = new URL(callbackPath, frontendUrl);
      finalUrl.searchParams.set("accessToken", appToken);

      return res.redirect(finalUrl.toString());
    } catch (error) {
      console.error("GET /oauth2/callback/google error:", error);
      return res.status(500).json({ error: "구글 로그인 콜백 처리 실패" });
    }
  });

  return router;
}
