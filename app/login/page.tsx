import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionAccountId } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in · PartnerLoop",
  description: "Sign in to track your referrals and commissions.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getSessionAccountId()) redirect("/dashboard");

  const { redirectTo } = await searchParams;
  const target = typeof redirectTo === "string" ? redirectTo : undefined;

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Welcome back</h1>
          <p className="text-sm text-zinc-600">
            Sign in to track your referrals and commissions.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-xl shadow-zinc-200/60">
          <LoginForm redirectTo={target} />
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-zinc-500">
          Don&apos;t have an account? Use the signup link the merchant shared with you.
        </p>
      </div>
    </main>
  );
}
