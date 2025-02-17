import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/app/lib/mongodb"
import { ObjectId } from "mongodb"
import { jwtVerify } from "jose"

async function getUserIdFromToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (!token) {
    throw new Error("No token found")
  }

  const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
  return payload.userId as string
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    const client = await clientPromise
    const db = client.db()

    const tasks = await db
      .collection("tasks")
      .find({ userId: new ObjectId(userId), status: { $in: ["COMPLETE", "EXPIRED"] } })
      .toArray()

    const dailyStats = calculateDailyStats(tasks)
    const monthlyStats = calculateMonthlyStats(tasks)

    return NextResponse.json({ dailyStats, monthlyStats })
  } catch (error) {
    console.error("Error fetching task stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function calculateDailyStats(tasks: any[]) {
  const stats: { [key: string]: { completed: number; expired: number } } = {}

  tasks.forEach((task) => {
    const date = new Date(task.deadline).toISOString().split("T")[0]
    if (!stats[date]) {
      stats[date] = { completed: 0, expired: 0 }
    }
    if (task.status === "COMPLETE") {
      stats[date].completed++
    } else if (task.status === "EXPIRED") {
      stats[date].expired++
    }
  })

  return Object.entries(stats)
    .map(([date, { completed, expired }]) => ({ date, completed, expired }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function calculateMonthlyStats(tasks: any[]) {
  const stats: { [key: string]: { completed: number; expired: number } } = {}

  tasks.forEach((task) => {
    const date = new Date(task.deadline)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    if (!stats[month]) {
      stats[month] = { completed: 0, expired: 0 }
    }
    if (task.status === "COMPLETE") {
      stats[month].completed++
    } else if (task.status === "EXPIRED") {
      stats[month].expired++
    }
  })

  return Object.entries(stats)
    .map(([month, { completed, expired }]) => ({ month, completed, expired }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

