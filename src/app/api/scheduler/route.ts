// app/api/scheduler/route.ts
import clientPromise from "../../lib/mongodb"
import { NextRequest } from 'next/server'  // Importing NextRequest for typing

export async function POST(req: NextRequest) {

  const client = await clientPromise
  const db = client.db()
  console.log("Connected to MongoDB")

  const now = new Date()
  now.setHours(now.getHours() + 5)
  now.setMinutes(now.getMinutes() + 30)
  console.log("Current time:", now.toISOString())
  console.log("Running task scheduler manually at:", now.toISOString)

  try {
    const result = await db
      .collection("tasks")
      .updateMany(
        { status: "ACTIVE", deadline: { $lte: now } },
        { $set: { status: "EXPIRED" } }
      )
    console.log(`Expired tasks updated: ${result.modifiedCount}`)

    if (result.modifiedCount === 0) {
      console.log("No tasks expired at this time.")
    } else {
      console.log(`${result.modifiedCount} tasks have been marked as expired.`)
    }
  } catch (error) {
    console.error("Error updating tasks:", error)
  }

  return new Response(
    JSON.stringify({ message: "Task scheduler executed successfully!" }),
    { status: 200 }
  )
}
