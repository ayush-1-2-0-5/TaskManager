"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Task {
  _id: string
  title: string
  description: string
  status: "ACTIVE" | "IN_PROGRESS" | "COMPLETE" | "EXPIRED"
  deadline: string
}

const toUTCDateString = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toISOString().split("T")[0]
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const date = new Date()
  date.setHours(date.getHours() + 5)
  date.setMinutes(date.getMinutes() + 30)
  const formattedDate = date.toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState(formattedDate)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchTasks()
  }, [filter, selectedDate, debouncedQuery]) // Removed unnecessary dependencies

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const fetchTasks = async () => {
    try {
      let url = `/api/tasks?status=${filter}`
      if (selectedDate) {
        url += `&date=${toUTCDateString(selectedDate)}`
      }
      if (debouncedQuery) {
        url += `&search=${debouncedQuery}`
      }

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        console.error("Failed to fetch tasks:", response.status)
        const errorText = await response.text()
        console.error("Error Response:", errorText)
        return
      }

      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/auth/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-blue-500"
      case "IN_PROGRESS":
        return "bg-yellow-500"
      case "COMPLETE":
        return "bg-green-500"
      case "EXPIRED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: taskId }),
      })

      if (response.ok) {
        setTasks(tasks.filter((task) => task._id !== taskId))
      } else {
        console.error("Failed to delete task:", response.status)
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const currentDate = new Date()
  const upcomingTasks = tasks.filter((task) => new Date(task.deadline) > currentDate)
  const historyTasks = tasks.filter((task) => new Date(task.deadline) <= currentDate)

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-purple-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">TaskMaster</h1>
          <div className="flex items-center space-x-4">
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
            <Link href="/history" className="hover:underline">
              History
            </Link>
            <button
              onClick={handleLogout}
              className="bg-purple-700 px-4 py-2 rounded hover:bg-purple-800 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto mt-8 p-4">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Your Tasks</h2>
            <Link
              href="/tasks/create"
              className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition duration-300"
            >
              Create New Task
            </Link>
          </div>

          <div className="mb-4 flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Tasks</option>
              <option value="ACTIVE">Active</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETE">Complete</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search tasks by title or description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
            />
          </div>
          {loading ? (
            <p className="text-center text-gray-600">Loading tasks...</p>
          ) : upcomingTasks.length > 0 ? (
            <div className="bg-gray-200 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Upcoming Tasks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTasks.map((task) => {
                  const cardBgColor =
                    task.status === "ACTIVE"
                      ? "bg-blue-100 border-blue-500"
                      : task.status === "IN_PROGRESS"
                        ? "bg-yellow-100 border-yellow-500"
                        : task.status === "COMPLETE"
                          ? "bg-green-100 border-green-500"
                          : "bg-red-100 border-red-500"

                  const taskDeadline = new Date(task.deadline)
                  const isDeletable = currentDate < taskDeadline

                  return (
                    <div
                      key={task._id}
                      className={`p-6 border-l-8 ${cardBgColor} rounded-lg shadow-md transition transform hover:scale-105`}
                    >
                      <h3 className="text-xl font-semibold mb-2 text-gray-800">{task.title}</h3>
                      <p className="text-gray-700 mb-4">{task.description}</p>
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          🕒 Deadline: {taskDeadline.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between mt-4">
                        <Link
                          href={`/tasks/${task._id}`}
                          className="inline-block text-purple-600 font-semibold hover:underline"
                        >
                          View Details →
                        </Link>
                        {isDeletable && (
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="text-red-500 font-semibold hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600">No upcoming tasks found!</p>
          )}

          {historyTasks.length > 0 && (
            <div className="bg-gray-200 p-6 rounded-lg shadow-md mt-8">
              <h3 className="text-2xl font-bold mb-4">History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyTasks.map((task) => {
                  const cardBgColor =
                    task.status === "ACTIVE"
                      ? "bg-blue-100 border-blue-500"
                      : task.status === "IN_PROGRESS"
                        ? "bg-yellow-100 border-yellow-500"
                        : task.status === "COMPLETE"
                          ? "bg-green-100 border-green-500"
                          : "bg-red-100 border-red-500"

                  return (
                    <div key={task._id} className={`p-6 border-l-8 ${cardBgColor} rounded-lg shadow-md`}>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800">{task.title}</h3>
                      <p className="text-gray-700 mb-4">{task.description}</p>
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          🕒 Deadline: {new Date(task.deadline).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between mt-4">
                        <Link
                          href={`/tasks/${task._id}`}
                          className="inline-block text-purple-600 font-semibold hover:underline"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

