import { redirect } from "next/navigation";

// The portal has no public landing page: creators arrive either through a
// merchant's /join/:programId link or by signing in. /dashboard bounces to
// /login when there's no session.
export default function Home() {
  redirect("/dashboard");
}
