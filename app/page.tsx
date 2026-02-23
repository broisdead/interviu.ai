export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to <span className="text-blue-500">interviu.ai</span>
        </h1>

        <p className="text-lg text-gray-300 max-w-2xl mb-8">
          Your personal AI interview coach. Practice mock interviews,
          get instant feedback, and land your dream job.
        </p>

        <div className="flex gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold">
            Start Interview
          </button>

          <button className="border border-gray-500 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 px-10 pb-20">
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-3">🎤 AI Mock Interviews</h3>
          <p className="text-gray-400">
            Practice real interview questions tailored to your role.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-3">📊 Smart Feedback</h3>
          <p className="text-gray-400">
            Get instant scoring on clarity, confidence, and technical depth.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-3">📈 Progress Tracking</h3>
          <p className="text-gray-400">
            Track improvement over time with AI-powered insights.
          </p>
        </div>
      </section>

    </main>
  );
}
