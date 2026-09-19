import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

export interface AccessConfig {
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ADMIN_EMAILS?: string;
}

const keySets = new Map<string, JWTVerifyGetKey>();

/** Verify a signed application token before consulting the organiser allowlist. */
export async function verifyOrganiserToken(
  token: string | null,
  config: AccessConfig,
  testKeySet?: JWTVerifyGetKey,
): Promise<{ email: string } | null> {
  const issuer = config.ACCESS_TEAM_DOMAIN?.replace(/\/$/, "");
  const audience = config.ACCESS_AUD;
  const allowed = (config.ADMIN_EMAILS || "").toLowerCase().split(",")
    .map((email) => email.trim()).filter(Boolean);
  if (!token || !issuer || !audience || !allowed.length ||
      !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer)) return null;
  try {
    let keys = testKeySet || keySets.get(issuer);
    if (!keys) {
      keys = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
      keySets.set(issuer, keys);
    }
    const { payload } = await jwtVerify(token, keys, {
      issuer,
      audience,
      algorithms: ["RS256"],
      requiredClaims: ["exp", "iat", "sub", "email"],
    });
    if (typeof payload.email !== "string") return null;
    const email = payload.email.toLowerCase().trim();
    return allowed.includes(email) ? { email } : null;
  } catch {
    return null;
  }
}
