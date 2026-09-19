import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { verifyOrganiserToken, type AccessConfig } from "./access";

export async function getOrganiser() {
  const requestHeaders = await headers();
  return verifyOrganiserToken(
    requestHeaders.get("cf-access-jwt-assertion"),
    env as unknown as AccessConfig,
  );
}
