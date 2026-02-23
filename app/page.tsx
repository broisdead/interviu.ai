import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6">
        <h1 className="text-xl font-semibold">interviu.ai</h1>
        <Link
          href="/dashboard"
          className="bg-white text-black px-5 py-2 rounded-xl font-medium hover:opacity-90 transition"
        >
          Launch App
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-6 mt-20">
        <h2 className="text-5xl font-bold max-w-4xl leading-tight">
          AI Hiring Engine That Reads JDs, Builds Tests, and Ranks Candidates Automatically
        </h2>

        <p className="text-zinc-400 mt-6 max-w-2xl text-lg">
          Paste a job description. Our AI generates a tailored assessment,
          evaluates candidate responses, and recommends who moves forward —
          without a single manual review.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/dashboard"
            className="bg-white text-black px-8 py-4 rounded-xl font-medium hover:opacity-90 transition"
          >
            Generate Assessment
          </Link>

          <a
            href="#how-it-works"
            className="border border-zinc-700 px-8 py-4 rounded-xl text-zinc-300 hover:bg-zinc-800 transition"
          >
            How It Works
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="mt-32 px-10 pb-20">
        <h3 className="text-3xl font-semibold text-center mb-16">
          How interviu.ai Works
        </h3>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <h4 className="font-semibold mb-3">1. Paste JD</h4>
            <p className="text-zinc-400 text-sm">
              AI extracts role, seniority, domain, and required skills.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <h4 className="font-semibold mb-3">2. Auto Generate Test</h4>
            <p className="text-zinc-400 text-sm">
              Tailored MCQs, short answers, and real-world case studies.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <h4 className="font-semibold mb-3">3. AI Scores Candidates</h4>
            <p className="text-zinc-400 text-sm">
              Objective scoring with reasoning and recommendation.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <h4 className="font-semibold mb-3">4. Ranked Leaderboard</h4>
            <p className="text-zinc-400 text-sm">
              Instantly see top candidates and hiring decisions.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 text-center py-8 text-zinc-500 text-sm">
        © {new Date().getFullYear()} interviu.ai — AI-Powered Hiring Intelligence
      </footer>
    </div>
  );
}
