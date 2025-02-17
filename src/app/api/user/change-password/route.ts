import { NextRequest, NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"
import { jwtVerify } from "jose"
import bcrypt from "bcryptjs"

async function getUserIdFromToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (!token) {
    throw new Error("No token found")
  }

  const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
  return payload.userId as string
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    const { currentPassword, newPassword } = await request.json()

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedNewPassword } }
    )

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}