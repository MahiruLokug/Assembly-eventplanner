"use client";
import { useState, useEffect } from "react";
import { nextUpcomingEvent } from "@/lib/spotlight";
import {
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Ticket,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowDownToLine,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  seedEvents,
  initialNotices,
  categories,
  dateParts,
  dateLabel,
  timeLabel,
  SchoolEvent,
} from "@/lib/events";
export default function Assembly() {
  const [events, setEvents] = useState(seedEvents),
    [notices, setNotices] = useState(initialNotices),
    [view, setView] = useState("discover"),
    [category, setCategory] = useState("All events"),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<SchoolEvent | null>(null),
    [month, setMonth] = useState(new Date(2026, 8, 1)),
    [now, setNow] = useState<number | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    const refresh = () => fetch("/api/events")
      .then((r) => {
        if (!r.ok)
          throw Error(
            "The event service is temporarily unavailable. Please try again.",
          );
        return r.json() as Promise<{
          events: SchoolEvent[];
          notices: typeof initialNotices;
        }>;
      })
      .then((d) => {
        setEvents(d.events);
        setNotices(d.notices);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    refresh();
    const refreshTimer = setInterval(refresh, 60000);
    const onVisible = () => { if (document.visibilityState === "visible") { setNow(Date.now()); refresh(); } };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(t); clearInterval(refreshTimer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);
  const filtered = events.filter(
    (e) =>
      e.status !== "cancelled" &&
      (category === "All events" || e.category === category) &&
      `${e.title} ${e.venue} ${e.organizer}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const featured = now !== null && !loading && !error ? nextUpcomingEvent(events, now) : null;
  const spotlightPending = loading || now === null;
  const spotlightEmptyTitle = spotlightPending ? "Loading the next event…" : error ? "Events are temporarily unavailable" : "No upcoming events";
  const remaining =
    now && featured
      ? Math.max(0, new Date(featured.starts).getTime() - now)
      : 0;
  function open(e: SchoolEvent) {
    setSelected(e);
    history.replaceState(null, "", `?event=${e.id}`);
  }
  useEffect(() => {
    let id = new URLSearchParams(location.search).get("event");
    if (id) setSelected(events.find((e) => e.id === id) || null);
  }, [events]);
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">
            <GraduationCap size={25} />
          </span>
          assembly<span className="brand-period">.</span>
        </a>
        <span className="school-name">THE SCHOOL EVENTS HUB</span>
        <a className="organiser-link" href="/organiser">
          Organiser access <ArrowUpRight size={16} />
        </a>
      </header>
      <div className="school-strip" role="region" aria-label="School and creator information" tabIndex={0}>
        <span>
          <span className="tiny-square" />
          <span className="strip-school">NALANDA COLLEGE</span>
          <span className="strip-slash">/</span>
          <span className="strip-tagline">Countless events, one website</span>
        </span>
        <span>
          <span className="strip-location">Colombo, Sri Lanka</span>
          <span className="strip-slash">·</span>
          <span>Built by Mahiru Lokugamage</span>
        </span>
      </div>
      <main id="main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">A PLACE TO COME TOGETHER</p>
            <h1>School life. <em>All here.</em></h1>
            <p className="intro">
              Find your next event. Make room for what matters.
            </p>
          </div>
          <div className="term">
            <span>THE SCHOOL YEAR</span>
            <b>
              2026 <span>-</span> Term III
            </b>
          </div>
        </div>
        <Tabs value={view} onValueChange={setView}>
          <div className="nav-row">
            <TabsList className="main-tabs" variant="line">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarDays />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="tickets">
                <Ticket />
                My tickets
              </TabsTrigger>
            </TabsList>
            <span className="demo-label">Competition demo · sample events</span>
          </div>
          {error && (
            <div className="error" role="alert">
              {error}{" "}
              <Button variant="outline" onClick={() => location.reload()}>
                Retry
              </Button>
            </div>
          )}
          <TabsContent value="discover">
            <div className="overview-grid">
              <section className="feature">
                <div className="feature-top">
                  <span className="eyebrow">IN THE SPOTLIGHT</span>
                  {featured && <span className="feature-tag">{featured.category}</span>}
                </div>
                {featured ? <>
                  <div className="feature-main">
                    <div>
                      <p className="feature-pre">NEXT SCHOOL EVENT · {featured.organizer}</p>
                      <h2>{featured.title}</h2>
                      <p className="spotlight-description">{featured.description}</p>
                      <Button className="gold-button" onClick={() => open(featured)}>
                        Explore the event <ArrowUpRight />
                      </Button>
                    </div>
                    <div className="feature-date">
                      <span>{dateParts(featured.starts).month.toUpperCase()}</span>
                      <strong>{dateParts(featured.starts).day}</strong>
                      <span>{new Date(featured.starts).toLocaleDateString("en-GB", { weekday: "short", timeZone: "Asia/Colombo" }).toUpperCase()} · {timeLabel(featured.starts)}</span>
                    </div>
                  </div>
                  <div className="feature-bottom">
                    <span><MapPin size={16} />{featured.venue}</span>
                    <span>Free admission <span className="separator-dot">·</span> {featured.audience}</span>
                  </div>
                </> : <div className="feature-main"><div>
                  <h2>{spotlightEmptyTitle}</h2>
                  <p>{spotlightPending ? "Getting the latest school programme." : error ? "Please retry to load the current programme." : "New events will appear here when they are scheduled."}</p>
                </div></div>}
              </section>
              <aside className="next-up">
                <p className="eyebrow">{featured ? "STARTS IN" : "UP NEXT"}</p>
                <h3>{featured ? featured.title : spotlightEmptyTitle}</h3>
                {featured && <div className="countdown" aria-label={`Countdown to ${featured.title}`}>
                  {[
                    Math.floor(remaining / 86400000),
                    Math.floor(remaining / 3600000) % 24,
                    Math.floor(remaining / 60000) % 60,
                  ].map((n, i) => (
                    <div key={i}>
                      <b>{String(n).padStart(2, "0")}</b>
                      <span>{["DAYS", "HOURS", "MINS"][i]}</span>
                    </div>
                  ))}
                </div>}
                <div className="notice-teaser">
                  <Megaphone size={19} />
                  <div>
                    <b>From the noticeboard</b>
                    <p>{notices[0]?.title}</p>
                    <button onClick={() => setView("announcements")}>
                      Read announcements <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </aside>
            </div>
            <section className="events-section">
              <div className="section-heading">
                <h2>
                  On the calendar{" "}
                  <span>{filtered.length.toString().padStart(2, "0")}</span>
                </h2>
                <button
                  className="text-button"
                  onClick={() => setView("calendar")}
                >
                  Full calendar <ArrowUpRight size={17} />
                </button>
              </div>
              <div className="filter-row">
                <div className="categories">
                  {categories.map((c) => (
                    <button
                      key={c}
                      aria-pressed={category === c}
                      className={category === c ? "active" : ""}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="search">
                  <Search size={17} />
                  <Input
                    aria-label="Search events"
                    placeholder="Search events"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="event-list">
                {filtered.map((e) => (
                  <button
                    className="event-row"
                    key={e.id}
                    onClick={() => open(e)}
                  >
                    <span className="date-box">
                      <b>{dateParts(e.starts).day}</b>
                      <span>{dateParts(e.starts).month}</span>
                    </span>
                    <span className="event-info">
                      <span
                        className={`category-label cat-${e.category.split(" ")[0].toLowerCase()}`}
                      >
                        {e.category}
                      </span>
                      <strong>{e.title}</strong>
                      <span className="event-meta">
                        <span>
                          <Clock size={14} />
                          {timeLabel(e.starts)}
                        </span>
                        <span>
                          <MapPin size={14} />
                          {e.venue}
                        </span>
                      </span>
                    </span>
                    <span className="row-right">
                      <span className="availability">
                        {new Date(e.ends).getTime() < (now || 0)
                          ? "Event ended"
                          : (e.booked || 0) >= e.capacity
                            ? "Fully booked"
                            : "Registration open"}
                      </span>
                      <ArrowUpRight size={23} />
                    </span>
                  </button>
                ))}
                {!filtered.length && (
                  <div className="empty">
                    <h3>No matching events</h3>
                    <p>Try a different search or category.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearch("");
                        setCategory("All events");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </TabsContent>
          <TabsContent value="calendar">
            <CalendarView
              events={events}
              month={month}
              setMonth={setMonth}
              open={open}
            />
          </TabsContent>
          <TabsContent value="announcements">
            <div className="section-heading">
              <h2>The noticeboard</h2>
              <span className="muted">Latest from the school community</span>
            </div>
            <div className="notices">
              {notices.map((n) => (
                <article key={n.id}>
                  <span className="notice-icon">
                    <Megaphone />
                  </span>
                  <div>
                    <p className="eyebrow">{dateLabel(n.created)}</p>
                    <h3>{n.title}</h3>
                    <p>{n.body}</p>
                    {n.eventId && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          open(events.find((e) => e.id === n.eventId)!)
                        }
                      >
                        View event <ArrowUpRight />
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="tickets">
            <TicketLookup />
          </TabsContent>
        </Tabs>
        <footer>
          <a className="brand footer-brand" href="/">
            assembly.
          </a>
          <p>School events, dates and registrations.</p>
          <span>
            Built for BTUI ’26 <span className="strip-slash">/</span> Sample
            school programme
          </span>
        </footer>
      </main>
      <EventDialog
        event={selected}
        loading={loading}
        unavailable={!!error}
        close={() => {
          setSelected(null);
          history.replaceState(null, "", "/");
        }}
        onBooked={() => {
          fetch("/api/events")
            .then((r) => r.json() as Promise<{ events: SchoolEvent[] }>)
            .then((d) => setEvents(d.events))
            .catch(() => {});
        }}
      />
    </>
  );
}
function CalendarView({
  events,
  month,
  setMonth,
  open,
}: {
  events: SchoolEvent[];
  month: Date;
  setMonth: (d: Date) => void;
  open: (e: SchoolEvent) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const first =
      (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7,
    days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const monthEvents = events.filter((event) => event.starts.startsWith(monthKey))
    .sort((a, b) => a.starts.localeCompare(b.starts));
  const activeDate = selectedDate?.startsWith(monthKey) ? selectedDate : null;
  const visibleEvents = activeDate
    ? monthEvents.filter((event) => event.starts.slice(0, 10) === activeDate)
    : monthEvents;
  return (
    <section className="calendar-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">EVENT CALENDAR</p>
          <h2>
            {month.toLocaleString("en-GB", { month: "long", year: "numeric" })}
          </h2>
        </div>
        <div className="calendar-controls">
          <Button variant="outline" onClick={() => { setSelectedDate(null); setMonth(new Date()); }}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous month"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next month"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="mobile-month" aria-label="Monthly calendar">
        <div className="mobile-month-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span className="mobile-weekday" key={day}>{day}</span>
          ))}
          {Array.from({ length: Math.ceil((first + days) / 7) * 7 }, (_, index) => {
            const day = index - first + 1;
            if (day < 1 || day > days) return <span className="mobile-day-blank" key={index} />;
            const key = `${monthKey}-${String(day).padStart(2, "0")}`;
            const count = monthEvents.filter((event) => event.starts.slice(0, 10) === key).length;
            return <button
              key={key}
              className={`mobile-day ${count ? "has-events" : ""}`}
              aria-pressed={activeDate === key}
              aria-label={`${day} ${month.toLocaleString("en-GB", { month: "long", year: "numeric" })}, ${count} ${count === 1 ? "event" : "events"}`}
              onClick={() => setSelectedDate(activeDate === key ? null : key)}
            ><span>{day}</span><span className="day-marker" aria-hidden="true">{count > 1 ? count : count === 1 ? "•" : ""}</span></button>;
          })}
        </div>
        <p className="calendar-legend"><span aria-hidden="true" /> Event scheduled. Tap a date to see details.</p>
      </div>
      <div className="mobile-agenda" aria-label="Calendar events">
        <div className="agenda-heading" aria-live="polite">
          <h3>{activeDate ? dateLabel(`${activeDate}T12:00:00+05:30`) : "This month’s events"}</h3>
          {activeDate && <button onClick={() => setSelectedDate(null)}>Show all</button>}
        </div>
        {visibleEvents.length === 0 ? (
          <div className="agenda-empty"><h3>No events scheduled.</h3>
            <p>{activeDate ? "Choose another date or show all events this month." : "Use the month controls to explore the programme."}</p></div>
        ) : visibleEvents.map((event) => (
          <button className="agenda-event" key={event.id} onClick={() => open(event)}>
            <span className="agenda-date">
              <b>{Number(event.starts.slice(8, 10))}</b>
              <span>{new Date(event.starts).toLocaleDateString("en-GB", { weekday: "short", timeZone: "Asia/Colombo" })}</span>
            </span>
            <span className="agenda-info">
              <span className={`category-label cat-${event.category.split(" ")[0].toLowerCase()}`}>{event.category}</span>
              <strong>{event.title}</strong>
              <span>{timeLabel(event.starts)} · {event.venue}</span>
              {event.status === "cancelled" && <span>Cancelled</span>}
            </span>
            <ArrowUpRight size={18} />
          </button>
        ))}
      </div>
      <div className="calendar-grid">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div className="weekday" key={d}>
            {d}
          </div>
        ))}
        {Array.from({ length: Math.ceil((first + days) / 7) * 7 }, (_, i) => {
          const day = i - first + 1,
            key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          return (
            <div
              className={`calendar-cell ${day < 1 || day > days ? "outside" : ""}`}
              key={i}
            >
              {day > 0 && day <= days && (
                <>
                  <b>{day}</b>
                  {events
                    .filter((e) => e.starts.slice(0, 10) === key)
                    .map((e) => (
                      <button
                        key={e.id}
                        className={`calendar-event cat-${e.category.split(" ")[0].toLowerCase()}`}
                        onClick={() => open(e)}
                      >
                        <span>{timeLabel(e.starts)}</span>
                        {e.title}
                        {e.status === "cancelled" ? " · Cancelled" : ""}
                      </button>
                    ))}
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="muted calendar-note">
        All event times are in Sri Lanka Standard Time (GMT +5:30).
      </p>
    </section>
  );
}
function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function ics(e: SchoolEvent) {
  const esc = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const dt = (s: string) =>
    new Date(s)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  download(
    `${e.id}.ics`,
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Assembly//School Events//EN",
      "BEGIN:VEVENT",
      `UID:${e.id}@assembly.events`,
      `DTSTAMP:${dt(new Date().toISOString())}`,
      `DTSTART:${dt(e.starts)}`,
      `DTEND:${dt(e.ends)}`,
      `SUMMARY:${esc(e.title)}`,
      `LOCATION:${esc(e.venue)}`,
      `DESCRIPTION:${esc(e.description)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n"),
    "text/calendar",
  );
}
function EventDialog({
  event: e,
  close,
  onBooked,
  loading,
  unavailable,
}: {
  event: SchoolEvent | null;
  close: () => void;
  onBooked: () => void;
  loading: boolean;
  unavailable: boolean;
}) {
  const [step, setStep] = useState("details"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ticket, setTicket] = useState<any>(null);
  useEffect(() => {
    setStep("details");
    setError("");
    setTicket(null);
  }, [e?.id]);
  if (!e) return null;
  const ended = new Date(e.ends) < new Date(),
    full = (e.booked || 0) >= e.capacity;
  async function register(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(ev.currentTarget));
    try {
      const r = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, eventId: e!.id }),
      });
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      setTicket(d);
      setStep("success");
      onBooked();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration unavailable. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={!!e} onOpenChange={(v) => !v && close()}>
      <DialogContent className="event-dialog">
        <DialogTitle>
          {step === "success" ? "You're on the list." : e.title}
        </DialogTitle>
        <DialogDescription>{e.organizer} · Competition demo</DialogDescription>
        {step === "success" ? (
          <>
            <div className="success-ticket">
              <Ticket size={36} />
              <p>Registration confirmed for {ticket.name}</p>
              <b>{e.title}</b>
              <p>
                {dateLabel(e.starts)} · {timeLabel(e.starts)}
              </p>
              <code>{ticket.id}</code>
            </div>
            <p>
              Save your ticket now. You’ll need its reference and your email to
              retrieve or cancel it. No email is sent.
            </p>
            <Button
              onClick={() =>
                download(
                  "assembly-ticket.txt",
                  `ASSEMBLY - DEMO ADMISSION\n${e.title}\n${dateLabel(e.starts)} at ${timeLabel(e.starts)}\n${e.venue}\nName: ${ticket.name}\nTicket reference: ${ticket.id}\nRetrieve with your reference and email in My tickets.\nNot valid for an actual school event.`,
                  "text/plain",
                )
              }
            >
              Download ticket <ArrowDownToLine />
            </Button>
          </>
        ) : (
          <>
            <span
              className={`category-label cat-${e.category.split(" ")[0].toLowerCase()}`}
            >
              {e.category}
            </span>
            <div className="detail-meta">
              <span>
                <CalendarDays />
                {dateLabel(e.starts)}
              </span>
              <span>
                <Clock />
                {timeLabel(e.starts)} - {timeLabel(e.ends)}
              </span>
              <span>
                <MapPin />
                {e.venue}
              </span>
            </div>
            <p>{e.description}</p>
            <div className="detail-capacity">
              <span>Free admission</span>
              <b>
                {Math.max(0, e.capacity - (e.booked || 0))} places available
              </b>
            </div>
            {step === "details" ? (
              <>
                <p className="muted">For {e.audience.toLowerCase()}</p>
                <Button
                  disabled={
                    full ||
                    ended ||
                    e.status === "cancelled" ||
                    loading ||
                    unavailable
                  }
                  onClick={() => setStep("register")}
                >
                  {e.status === "cancelled"
                    ? "Event cancelled"
                    : ended
                      ? "Event ended"
                      : full
                        ? "Fully booked"
                        : loading
                          ? "Checking availability…"
                          : "Reserve my place"}
                  <ArrowRight />
                </Button>
                <Button variant="outline" onClick={() => ics(e)}>
                  Add to my calendar <CalendarDays />
                </Button>
              </>
            ) : (
              <form onSubmit={register} className="form-stack">
                <label>
                  Full name
                  <Input
                    name="name"
                    required
                    maxLength={100}
                    autoComplete="name"
                  />
                </label>
                <label>
                  Email address
                  <Input
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                  />
                </label>
                <label>
                  I’m attending as
                  <select name="role" required>
                    <option>Student</option>
                    <option>Teacher</option>
                    <option>Parent</option>
                    <option>Guest</option>
                  </select>
                </label>
                <p className="muted">
                  Your name and email are stored to manage this demo booking.
                  Avoid entering sensitive information.
                </p>
                <Button disabled={busy} type="submit">
                  {busy ? "Reserving…" : "Confirm free registration"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("details")}
                >
                  Back to event
                </Button>
              </form>
            )}
          </>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
function TicketLookup() {
  const [result, setResult] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [credentials, setCredentials] = useState<any>(null),
    [confirm, setConfirm] = useState(false);
  async function lookup(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    const data = Object.fromEntries(new FormData(ev.currentTarget));
    setCredentials(data);
    try {
      const r = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      setResult(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not retrieve ticket.");
    } finally {
      setBusy(false);
    }
  }
  async function cancel() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/tickets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      setResult({ ...result, status: "cancelled" });
      setConfirm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel ticket.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="ticket-area">
      <div>
        <p className="eyebrow">YOUR PLACE, RESERVED</p>
        <h2>Ready when you are.</h2>
        <p>
          Find your booking with the reference on your downloaded ticket and the
          email used to register.
        </p>
      </div>
      <div className="ticket-panel">
        <Ticket size={30} />
        <h3>Find my ticket</h3>
        <form className="form-stack" onSubmit={lookup}>
          <label>
            Ticket reference
            <Input
              name="id"
              required
              placeholder="Paste your ticket reference"
            />
          </label>
          <label>
            Email address
            <Input name="email" type="email" required />
          </label>
          <Button disabled={busy}>
            {busy ? "Please wait…" : "Find ticket"}
            <ArrowRight />
          </Button>
        </form>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {result && (
          <div className="found-ticket">
            <span className="eyebrow">{result.status}</span>
            <h3>{result.event.title}</h3>
            <p>
              {result.name} · {dateLabel(result.event.starts)}
            </p>
            <p>
              {timeLabel(result.event.starts)} · {result.event.venue}
            </p>
            {result.event.status === "cancelled" && (
              <p className="error">
                This event has been cancelled by its organiser.
              </p>
            )}
            {result.status === "confirmed" && (
              <>
                <Button variant="outline" onClick={() => ics(result.event)}>
                  Add to calendar
                </Button>
                {confirm ? (
                  <div>
                    <p>Cancel this booking and release your place?</p>
                    <Button
                      disabled={busy}
                      variant="destructive"
                      onClick={cancel}
                    >
                      Yes, cancel booking
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirm(false)}>
                      Keep ticket
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" onClick={() => setConfirm(true)}>
                    Cancel booking
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
