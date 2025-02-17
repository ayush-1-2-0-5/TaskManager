"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

interface TaskStats {
  date: string
  completed: number
  expired: number
}

interface MonthlyStats {
  month: string
  completed: number
  expired: number
}

export default function History() {
  const [dailyStats, setDailyStats] = useState<TaskStats[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/tasks/stats")
      if (response.ok) {
        const data = await response.json()
        setDailyStats(data.dailyStats)
        setMonthlyStats(data.monthlyStats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const dailyChartData = {
    labels: dailyStats.map((stat) => stat.date),
    datasets: [
      {
        label: "Completed Tasks",
        data: dailyStats.map((stat) => stat.completed),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Expired Tasks",
        data: dailyStats.map((stat) => stat.expired),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  }

  const monthlyChartData = {
    labels: monthlyStats.map((stat) => stat.month),
    datasets: [
      {
        label: "Completed Tasks",
        data: monthlyStats.map((stat) => stat.completed),
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
      {
        label: "Expired Tasks",
        data: monthlyStats.map((stat) => stat.expired),
        borderColor: "rgba(255, 99, 132, 1)",
        tension: 0.1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Task Completion History",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-purple-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">TaskMaster</h1>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto mt-8 p-4">
        <h2 className="text-3xl font-bold mb-6">Task History and Analytics</h2>

        {loading ? (
          <p>Loading statistics...</p>
        ) : (
          <div className="space-y-8">
            {/* Daily Stats Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Daily Task Completion</h3>
              <Bar data={dailyChartData} options={chartOptions} />
            </div>

            {/* Monthly Stats Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Monthly Task Completion Trends</h3>
              <Line data={monthlyChartData} options={chartOptions} />
            </div>

            {/* Summary Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Summary</h3>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Period</th>
                    <th className="p-2 text-left">Completed Tasks</th>
                    <th className="p-2 text-left">Expired Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">Last 7 Days</td>
                    <td className="p-2">{dailyStats.slice(-7).reduce((sum, stat) => sum + stat.completed, 0)}</td>
                    <td className="p-2">{dailyStats.slice(-7).reduce((sum, stat) => sum + stat.expired, 0)}</td>
                  </tr>
                  <tr>
                    <td className="p-2">Last 30 Days</td>
                    <td className="p-2">{dailyStats.slice(-30).reduce((sum, stat) => sum + stat.completed, 0)}</td>
                    <td className="p-2">{dailyStats.slice(-30).reduce((sum, stat) => sum + stat.expired, 0)}</td>
                  </tr>
                  <tr>
                    <td className="p-2">All Time</td>
                    <td className="p-2">{dailyStats.reduce((sum, stat) => sum + stat.completed, 0)}</td>
                    <td className="p-2">{dailyStats.reduce((sum, stat) => sum + stat.expired, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

