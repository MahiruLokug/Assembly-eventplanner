export type SchoolEvent = {
  id: string;
  title: string;
  category: string;
  starts: string;
  ends: string;
  venue: string;
  organizer: string;
  description: string;
  capacity: number;
  booked?: number;
  status: string;
  audience: string;
};
export const categories = [
  "All events",
  "Academic",
  "Sports",
  "Arts & culture",
  "Community",
];
export const seedEvents: SchoolEvent[] = [
  {
    id: "innovation-2026",
    title: "Innovation, in the making.",
    category: "Academic",
    starts: "2026-10-02T09:00:00+05:30",
    ends: "2026-10-02T16:00:00+05:30",
    venue: "Main Hall",
    organizer: "Science & Technology Society",
    description:
      "Step inside a day of student-built ideas. Explore robotics, sustainable design and interactive experiments, meet the teams behind them, and take part in hands-on demonstrations. Open to students, teachers and parents. Bring your ticket for entry; all activities are free.",
    capacity: 300,
    status: "published",
    audience: "Students, teachers & parents",
  },
  {
    id: "debate-final",
    title: "Inter-school debate finals",
    category: "Academic",
    starts: "2026-09-25T14:00:00+05:30",
    ends: "2026-09-25T17:00:00+05:30",
    venue: "College Auditorium",
    organizer: "Debating Society",
    description:
      "An afternoon of sharp arguments and fresh perspectives. Watch the finalists take the stage for the inter-school championship. Please arrive 15 minutes before the opening remarks.",
    capacity: 120,
    status: "published",
    audience: "Grades 6-13, teachers & parents",
  },
  {
    id: "athletics",
    title: "House athletics meet",
    category: "Sports",
    starts: "2026-09-28T08:00:00+05:30",
    ends: "2026-09-28T15:00:00+05:30",
    venue: "College Grounds",
    organizer: "Sports Council",
    description:
      "A full day of track and field, house spirit and friendly competition. This registration is for spectator admission. Bring a water bottle, sun protection and your house colours.",
    capacity: 500,
    status: "published",
    audience: "School community",
  },
  {
    id: "art-exhibition",
    title: "Perspectives: student art exhibition",
    category: "Arts & culture",
    starts: "2026-10-05T10:00:00+05:30",
    ends: "2026-10-05T16:00:00+05:30",
    venue: "Art Room & East Gallery",
    organizer: "Art Circle",
    description:
      "A collection of paintings, photography and sculpture exploring the places we call home. Meet student artists and join a guided gallery walk. All ages are welcome.",
    capacity: 180,
    status: "published",
    audience: "Students, teachers & parents",
  },
  {
    id: "community-day",
    title: "A greener school",
    category: "Community",
    starts: "2026-10-10T08:30:00+05:30",
    ends: "2026-10-10T11:30:00+05:30",
    venue: "East Garden",
    organizer: "Environmental Society",
    description:
      "Help plant native trees and prepare the school garden for the new term. Tools and gloves are provided. Wear closed shoes and bring a reusable water bottle.",
    capacity: 60,
    status: "published",
    audience: "Grades 6-13 & teachers",
  },
  {
    id: "music-evening",
    title: "An evening in harmony",
    category: "Arts & culture",
    starts: "2026-10-16T17:30:00+05:30",
    ends: "2026-10-16T20:00:00+05:30",
    venue: "College Auditorium",
    organizer: "Music Society",
    description:
      "The school orchestra, choir and student ensembles share one stage for an evening of music. Doors open at 5 pm. Seating is unreserved and admission is free with registration.",
    capacity: 200,
    status: "published",
    audience: "School community",
  },
];
export const initialNotices = [
  {
    id: "welcome",
    title: "Your school calendar, in one place",
    body: "Explore upcoming events, reserve a place and add dates to your own calendar. This competition demo uses sample events; registrations here are for demonstration only.",
    created: "2026-09-19T08:00:00+05:30",
    eventId: null,
  },
  {
    id: "debate-arrival",
    title: "Debate finals: arrive 15 minutes early",
    body: "Doors open at 1:45 pm. Please have your Assembly ticket ready at the auditorium entrance.",
    created: "2026-09-19T07:00:00+05:30",
    eventId: "debate-final",
  },
];
export const dateParts = (s: string) => ({
  day: new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    timeZone: "Asia/Colombo",
  }).format(new Date(s)),
  month: new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: "Asia/Colombo",
  }).format(new Date(s)),
});
export const dateLabel = (s: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Colombo",
  }).format(new Date(s));
export const timeLabel = (s: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Colombo",
  }).format(new Date(s));
