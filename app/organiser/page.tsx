import { isAdmin } from "@/lib/server";
import Organiser from "./workspace";
export const dynamic = "force-dynamic";

export default async function Page() {
  if (!(await isAdmin()))
    return (
      <main className="admin-shell">
        <a href="/" className="brand">assembly.</a>
        <h1>Organiser access is restricted.</h1>
        <p>Use the account approved by your site administrator to manage events,
          publish announcements and check in ticket holders.</p>
        <p style={{ marginTop: 24 }}>
          <a className="text-button" href="/cdn-cgi/access/logout">
            Sign out and switch account →
          </a>
        </p>
        <p style={{ marginTop: 20 }}><a href="/">Return to events →</a></p>
      </main>
    );
  return <Organiser />;
}
