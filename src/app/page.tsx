import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600">
      <nav className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-white text-2xl font-bold">TaskMaster</span>
            </div>
            <div className="flex">
              <Link href="/auth/login" className="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link href="/auth/register" className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium ml-4">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white sm:text-6xl md:text-7xl">
            Master Your Tasks, <br />Master Your Life
          </h1>
          <p className="mt-3 max-w-md mx-auto text-xl text-indigo-100 sm:text-2xl md:mt-5 md:max-w-3xl">
            TaskMaster helps you organize, prioritize, and accomplish your goals with ease.
          </p>
          <div className="mt-10 sm:flex sm:justify-center">
            <Link href="/auth/register" className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition duration-300">
              Get Started for Free
            </Link>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-extrabold text-white text-center">Why Choose TaskMaster?</h2>
          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Smart Scheduling", description: "AI-powered task prioritization to help you focus on what matters most." },
              { title: "Deadline Tracking", description: "Never miss a deadline with our intelligent reminder system." },
              { title: "Productivity Insights", description: "Gain valuable insights into your productivity patterns and improve your workflow." },
            ].map((feature) => (
              <div 
                key={feature.title}
                className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg px-6 py-8"
              >
                <h3 className="text-lg font-medium text-white">{feature.title}</h3>
                <p className="mt-2 text-base text-indigo-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
