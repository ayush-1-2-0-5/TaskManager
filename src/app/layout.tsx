import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "TaskMaster - Efficient TODO Management",
  description: "Manage your tasks efficiently with TaskMaster",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white py-12">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">About TaskMaster</h2>
              <p className="text-purple-200">
                TaskMaster is your all-in-one task management solution to stay productive and organized.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">Quick Links</h2>
              <ul className="text-purple-200 space-y-2">
                <li><Link href="/" className="hover:text-white transition duration-300">Home</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition duration-300">Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition duration-300">Dashboard</Link></li>
                <li><Link href="/history" className="hover:text-white transition duration-300">History</Link></li>
                <li><Link href="/profile" className="hover:text-white transition duration-300">Profile</Link></li>
                <li><Link href="/profile/change-password" className="hover:text-white transition duration-300">Change Password</Link></li>
                <li><Link href="/tasks/create" className="hover:text-white transition duration-300">Create Task</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">Connect with Me</h2>
              <div className="flex flex-col space-y-3">
                <a
                  href="https://github.com/ayush-1-2-0-5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-purple-200 hover:text-white transition duration-300"
                  aria-label="GitHub"
                >
                  <Image src="https://img.icons8.com/fluency-systems-filled/50/github.png" alt="GitHub" width={24} height={24} className="mr-2" />
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/ayush-agarwal-b5b0b01a1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-purple-200 hover:text-white transition duration-300"
                  aria-label="LinkedIn"
                >
                  <Image src="https://img.icons8.com/fluency/48/linkedin.png" alt="LinkedIn" width={24} height={24} className="mr-2" />
                  LinkedIn
                </a>
                <a
                  href="https://portfoliosite-pi-nine.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-purple-200 hover:text-white transition duration-300"
                  aria-label="Portfolio"
                >
                  <Image src="https://img.icons8.com/ios-filled/50/web.png" alt="Portfolio" width={24} height={24} className="mr-2" />
                  Portfolio
                </a>
              </div>
            </div>
          </div>

          <div className="text-center text-purple-300 text-sm mt-8">
            © {new Date().getFullYear()} TaskMaster. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
