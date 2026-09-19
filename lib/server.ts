import { env } from "cloudflare:workers";
import { seedEvents, initialNotices } from "./events";
import { getOrganiser } from "./auth";
export function database() {
  const db = (env as unknown as { DB: D1Database }).DB;
  if (!db) throw Error("Database unavailable");
  return db;
}
export async function seed() {
  const db = database();
  await db.batch([
    ...seedEvents.map((e) =>
      db
        .prepare(
          "INSERT OR IGNORE INTO events (id,title,category,starts,ends,venue,organizer,description,capacity,status,audience) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          e.id,
          e.title,
          e.category,
          e.starts,
          e.ends,
          e.venue,
          e.organizer,
          e.description,
          e.capacity,
          e.status,
          e.audience,
        ),
    ),
    ...initialNotices.map((n) =>
      db
        .prepare(
          "INSERT OR IGNORE INTO notices (id,title,body,created,event_id) VALUES (?,?,?,?,?)",
        )
        .bind(n.id, n.title, n.body, n.created, n.eventId),
    ),
  ]);
}
export async function isAdmin() {
  return !!(await getOrganiser());
}
export const fail = (error: string, status = 400) =>
  Response.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  return !origin || origin === new URL(req.url).origin;
}
export async function body(req: Request) {
  const raw = await req.text();
  if (raw.length > 12000) throw Error("Request too large");
  return JSON.parse(raw);
}
export function unavailable(e: unknown) {
  console.error(
    "Assembly request failed",
    e instanceof Error ? e.message : "unknown",
  );
  return fail("The service is temporarily unavailable. Please try again.", 503);
}
