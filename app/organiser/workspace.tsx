"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SchoolEvent, categories, dateLabel, timeLabel } from "@/lib/events";
export default function Organiser() {
  const [events, setEvents] = useState<SchoolEvent[]>([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [edit, setEdit] = useState<SchoolEvent | null>(null),
    [cancelId, setCancelId] = useState<string | null>(null),
    [tab, setTab] = useState("events");
  async function refresh() {
    try {
      const r = await fetch("/api/events");
      if (!r.ok) throw Error("Could not load events.");
      setEvents(((await r.json()) as { events: SchoolEvent[] }).events);
    } catch (e) {
      setMessage(String(e));
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  async function send(data: object) {
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/organiser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      setMessage(d.message);
      await refresh();
      return true;
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Could not save. Your entries have been preserved.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const data = Object.fromEntries(new FormData(f));
    if (await send({ ...data, action: "event", id: edit?.id })) {
      setEdit(null);
      f.reset();
      setTab("events");
    }
  }
  return (
    <main className="admin-shell">
      <a className="brand" href="/">
        assembly.
      </a>
      <p className="eyebrow" style={{ marginTop: 35 }}>
        ORGANISER WORKSPACE
      </p>
      <h1>Manage school events</h1>
      <p className="muted">
        Create events, post announcements and check in attendees.
      </p>
      <p className="muted" style={{ margin: "15px 0" }}>
        Competition demo · sample school programme
      </p>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="edit">
            {edit ? "Edit event" : "Create event"}
          </TabsTrigger>
          <TabsTrigger value="notice">Announcement</TabsTrigger>
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
        </TabsList>
        {message && (
          <p
            role="status"
            style={{ padding: 16, background: "#eef2f6", margin: "15px 0" }}
          >
            {message}
          </p>
        )}
        <TabsContent value="events">
          {events.map((e) => (
            <article key={e.id}>
              <span className="eyebrow">
                {e.status} · {e.booked || 0} / {e.capacity} registered
              </span>
              <h3>{e.title}</h3>
              <p className="muted">
                {dateLabel(e.starts)} · {timeLabel(e.starts)} · {e.venue}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setEdit(e);
                  setTab("edit");
                }}
              >
                Edit event
              </Button>
              {e.status !== "cancelled" &&
                (cancelId === e.id ? (
                  <>
                    <p>
                      Cancel this event? Existing tickets will show the
                      cancellation.
                    </p>
                    <Button
                      disabled={busy}
                      variant="destructive"
                      onClick={async () => {
                        if (await send({ action: "cancel", id: e.id }))
                          setCancelId(null);
                      }}
                    >
                      Confirm cancellation
                    </Button>
                    <Button variant="ghost" onClick={() => setCancelId(null)}>
                      Keep event
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" onClick={() => setCancelId(e.id)}>
                    Cancel event
                  </Button>
                ))}
            </article>
          ))}
        </TabsContent>
        <TabsContent value="edit">
          <form key={edit?.id || "new"} className="form-stack" onSubmit={save}>
            <label>
              Event title
              <Input
                name="title"
                defaultValue={edit?.title}
                maxLength={100}
                required
              />
            </label>
            <div className="admin-grid">
              <label>
                Category
                <select name="category" defaultValue={edit?.category}>
                  {categories.slice(1).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Capacity
                <Input
                  name="capacity"
                  type="number"
                  min="1"
                  max="10000"
                  required
                  defaultValue={edit?.capacity || 100}
                />
              </label>
              <label>
                Starts · Sri Lanka time
                <Input
                  name="starts"
                  type="datetime-local"
                  defaultValue={edit?.starts.slice(0, 16)}
                  required
                />
              </label>
              <label>
                Ends · Sri Lanka time
                <Input
                  name="ends"
                  type="datetime-local"
                  defaultValue={edit?.ends.slice(0, 16)}
                  required
                />
              </label>
              <label>
                Venue
                <Input
                  name="venue"
                  maxLength={100}
                  defaultValue={edit?.venue}
                  required
                />
              </label>
              <label>
                Organising society
                <Input
                  name="organizer"
                  maxLength={100}
                  defaultValue={edit?.organizer}
                  required
                />
              </label>
            </div>
            <label>
              Who can attend?
              <Input
                name="audience"
                maxLength={150}
                defaultValue={edit?.audience || "Students, teachers & parents"}
                required
              />
            </label>
            <label>
              What should attendees know?
              <textarea
                name="description"
                maxLength={4000}
                defaultValue={edit?.description}
                required
              />
            </label>
            <Button disabled={busy}>
              {busy ? "Saving…" : edit ? "Save event changes" : "Publish event"}
            </Button>
            {edit && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEdit(null)}
              >
                Create a new event instead
              </Button>
            )}
          </form>
        </TabsContent>
        <TabsContent value="notice">
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = e.currentTarget;
              if (
                await send({
                  ...Object.fromEntries(new FormData(f)),
                  action: "notice",
                })
              )
                f.reset();
            }}
          >
            <label>
              Announcement title
              <Input name="title" required maxLength={120} />
            </label>
            <label>
              Message
              <textarea name="body" required maxLength={3000} />
            </label>
            <label>
              Related event
              <select name="eventId">
                <option value="">General school announcement</option>
                {events.map((e) => (
                  <option value={e.id} key={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </label>
            <Button disabled={busy}>Publish announcement</Button>
          </form>
        </TabsContent>
        <TabsContent value="checkin">
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              await send({
                ...Object.fromEntries(new FormData(e.currentTarget)),
                action: "checkin",
              });
            }}
          >
            <h3>Welcome them in.</h3>
            <p>
              Enter the reference on the attendee’s ticket. A ticket can only be
              checked in once.
            </p>
            <label>
              Ticket reference
              <Input name="id" required />
            </label>
            <label>
              Event
              <select name="eventId" required>
                {events
                  .filter((e) => e.status === "published")
                  .map((e) => (
                    <option value={e.id} key={e.id}>
                      {e.title}
                    </option>
                  ))}
              </select>
            </label>
            <Button disabled={busy}>Validate & check in</Button>
          </form>
        </TabsContent>
      </Tabs>
      <p style={{ marginTop: 35 }}>
        <a href="/cdn-cgi/access/logout" target="_top">
          Sign out →
        </a>
      </p>
    </main>
  );
}
