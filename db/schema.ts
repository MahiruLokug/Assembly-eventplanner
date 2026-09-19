import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  starts: text("starts").notNull(),
  ends: text("ends").notNull(),
  venue: text("venue").notNull(),
  organizer: text("organizer").notNull(),
  description: text("description").notNull(),
  capacity: integer("capacity").notNull(),
  status: text("status").notNull().default("published"),
  audience: text("audience").notNull(),
});
export const registrations = sqliteTable(
  "registrations",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull(),
    status: text("status").notNull().default("confirmed"),
    created: text("created").notNull(),
  },
  (t) => [
    uniqueIndex("idx_registration_event_email").on(t.eventId, t.email),
    index("idx_registration_event_status").on(t.eventId, t.status),
  ],
);
export const notices = sqliteTable("notices", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  created: text("created").notNull(),
  eventId: text("event_id").references(() => events.id),
});
