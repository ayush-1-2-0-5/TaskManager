import cron from "node-cron"
import clientPromise from "./mongodb"
import { sendEmail } from "./sendEmail"

export function startTaskScheduler() {
  // Run every 30 seconds
  cron.schedule("*/30 * * * * *", async () => {
    console.log("Running task scheduler")
    const client = await clientPromise
    const db = client.db()
    const now = new Date()
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const tasksToNotify = await db
      .collection("tasks")
      .find({
        status: "ACTIVE",
        deadline: { $gt: now, $lte: twoHoursFromNow },
      })
      .toArray()

    // Send notifications for tasks about to expire
    for (const task of tasksToNotify) {
      const user = await db.collection("users").findOne({ _id: task.userId })
      if (user) {
        await sendEmail(
          user.email,
          "Task Reminder",
          `Your task "${task.title}" is due in less than 2 hours. Please complete it soon!`
        )
      }
    }

    // Update expired tasks
    await db
      .collection("tasks")
      .updateMany({ status: "ACTIVE", deadline: { $lte: now } }, { $set: { status: "EXPIRED" } })
  })
}
