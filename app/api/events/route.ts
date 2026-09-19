import { database, seed, unavailable } from "@/lib/server";
export async function GET() {
  try {
    await seed();
    const db = database();
    const [events, notices] = await db.batch([
      db.prepare(
        "SELECT e.*, (SELECT COUNT(*) FROM registrations r WHERE r.event_id=e.id AND r.status IN ('confirmed','checked-in')) AS booked FROM events e ORDER BY starts",
      ),
      db.prepare(
        "SELECT id,title,body,created,event_id AS eventId FROM notices ORDER BY created DESC",
      ),
    ]);
    return Response.json(
      { events: events.results, notices: notices.results },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return unavailable(e);
  }
}
