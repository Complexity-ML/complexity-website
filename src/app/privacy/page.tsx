import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Database, HardDrive, KeyRound, MessageSquare, Route, ShieldCheck, UserRound } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy notice | Complexity-ML",
  description: "How Complexity, the TR-Hash model lab, the research agent, the i64 completions gateway and LABO AI process account, workspace and provider-key data.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    icon: UserRound,
    title: "Account identity",
    body: "When you sign in with GitHub or Google, we receive the provider account identifier and the profile fields the provider returns, normally your name, email address and avatar. We do not receive your provider password.",
  },
  {
    icon: MessageSquare,
    title: "Model lab chat",
    body: "Prompts you send to a TR-Hash checkpoint in the model lab go directly from your browser to the Hugging Face Space that hosts that model — they do not transit Complexity's own servers. Signed-in exchanges are saved as a conversation (up to 10 per account) in our database so you can resume them; as a guest, nothing is kept server-side.",
  },
  {
    icon: Bot,
    title: "Research agent",
    body: "Turning on Research mode in the model lab sends your question to a retrieval agent we operate ourselves, over MCP, on a Hugging Face-hosted server. It searches a bounded internal demo catalog and returns matching records as context for the model. That step never leaves Complexity-operated infrastructure and is not forwarded to any third-party LLM.",
  },
  {
    icon: Route,
    title: "i64 completions gateway",
    body: "An i64 API key lets any client call our /v1/chat/completions proxy using a provider key you stored with us. We decrypt that key on the server only for the request you send, forward it to the provider you selected — OpenAI, Anthropic, Google or Mistral — and stream the response back without persisting the exchange.",
  },
  {
    icon: KeyRound,
    title: "Provider keys",
    body: "Keys you add for Ask LABO or the i64 gateway (OpenAI, Anthropic, Google, Mistral) are encrypted before database storage. The interface only ever receives a short prefix and status, each secret is decrypted server-side solely to perform the request you initiated, and none are included in your data export.",
  },
  {
    icon: HardDrive,
    title: "Private LABO workspaces",
    body: "Graphs, custom cards and presets are stored locally in your browser by default. They are not account cloud storage and are separate from model-lab conversation history. Deleting your account does not clear browser storage; use your browser controls to remove it from that device.",
  },
  {
    icon: Database,
    title: "Ask LABO agent requests",
    body: "When you invoke Ask LABO, your prompt and the graph context needed for the plan are sent through the Complexity server to your configured provider using your stored key. Do not include personal or confidential data that is unnecessary for the request.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#080a0e] text-white">
      <Navigation />
      <section className="site-shell pb-16 pt-28 sm:pb-20 sm:pt-36 lg:pt-40">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300/70">privacy.notice · updated 26 August 2026</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Your account should never be a black box.</h1>
          <p className="mt-6 text-base leading-8 text-white/48 sm:text-lg">This notice explains what the TR-Hash model lab, the research agent, the i64 completions gateway, LABO AI and your Complexity-ML account store, why it is needed, where it goes, and how you can export or delete it.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <article key={section.title} className="lab-surface rounded-2xl p-6">
              <section.icon className="size-5 text-emerald-300" />
              <h2 className="mt-5 text-lg font-medium">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/45">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-10 border-t border-white/[0.08] pt-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <ShieldCheck className="size-8 text-violet-300" />
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">Controller</p>
            <p className="mt-2 text-sm leading-6 text-white/62">Boris Peyriguere / Complexity-ML<br />Paris, France</p>
            <p className="mt-4 text-xs leading-6 text-white/35">For a private rights request not covered by the self-service controls, contact the maintainer through the Complexity-ML organization contact channel. Never post identity documents or API keys in a public issue.</p>
            <a href="https://github.com/Complexity-ML" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm text-emerald-300 hover:text-emerald-200">Complexity-ML contact →</a>
          </div>

          <div className="space-y-9 text-sm leading-7 text-white/48">
            <section>
              <h2 className="text-base font-medium text-white">Purposes and legal bases</h2>
              <p className="mt-2">Account data is processed to authenticate you, run the model lab, the research agent and the i64 gateway, provide the account and agent features you request, secure access and prevent abuse. Service delivery is based on performance of the requested service; security and service integrity rely on legitimate interests. We do not use account data for advertising.</p>
            </section>
            <section>
              <h2 className="text-base font-medium text-white">Recipients and processors</h2>
              <p className="mt-2">Data is handled by the service maintainer and by infrastructure providers needed to operate the service: Vercel for web hosting, the configured PostgreSQL/Neon infrastructure for account records, GitHub or Google for OAuth, Hugging Face for the TR-Hash model inference endpoints and the research agent's MCP server we operate, and OpenAI, Anthropic, Google or Mistral only when you invoke Ask LABO or the i64 gateway with a key for that provider. Those providers process data under their own terms and applicable transfer safeguards.</p>
            </section>
            <section>
              <h2 className="text-base font-medium text-white">Retention</h2>
              <p className="mt-2">Account records, encrypted provider keys and saved model-lab conversations (up to 10 per account) are retained while your account exists, then removed when you use Delete account, subject to short-lived infrastructure backups and security logs controlled by hosting providers. Browser-local LABO data remains on that device until you clear it. Provider keys and i64 keys can be removed independently at any time. Prompts sent directly to a Hugging Face inference endpoint are handled under Hugging Face's own retention practices, not ours.</p>
            </section>
            <section>
              <h2 className="text-base font-medium text-white">Your rights and controls</h2>
              <p className="mt-2">You can access a machine-readable copy of account data, remove a provider key, sign out, and permanently delete the account from Account settings. Depending on the applicable law, you may also request access, correction, restriction, objection or portability and lodge a complaint with the CNIL. Requests are handled without undue delay and normally within one month.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/dashboard/settings" className="rounded-lg bg-white px-4 py-2 text-xs font-medium text-black hover:bg-white/85">Open account controls</Link>
                <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/10 px-4 py-2 text-xs text-white/65 hover:bg-white/[0.05] hover:text-white">Contact the CNIL</a>
              </div>
            </section>
            <section>
              <h2 className="text-base font-medium text-white">Cookies and local storage</h2>
              <p className="mt-2">The service uses an authentication cookie required to keep you signed in. Authenticated LABO workspaces are stored in the account-scoped server database; guest workspaces are temporary and are not persisted in browser storage. No advertising cookies are set by Complexity. Third-party links and embedded services may apply their own policies.</p>
            </section>
            <section>
              <h2 className="text-base font-medium text-white">Changes</h2>
              <p className="mt-2">Material changes will be reflected on this page with a new update date. If a change requires a new choice from you, it will be presented before the affected processing begins.</p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
