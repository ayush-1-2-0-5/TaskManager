import { NextRequest, NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"
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

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const { password, ...userProfile } = user
    return NextResponse.json(userProfile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
export async function PUT(request: NextRequest) {
    try {
      console.log("PUT request received")
      const userId = await getUserIdFromToken(request)
      console.log("User ID from token:", userId)
  
      const { firstName, lastName, email, username } = await request.json()
      console.log("Profile data to update:", { firstName, lastName, email, username })
  
      const client = await clientPromise
      const db = client.db()
  
      const objectIdUserId = new ObjectId(userId)
      console.log("Converted userId to ObjectId:", objectIdUserId)
  
      const user = await db.collection("users").findOne({ _id: objectIdUserId })
      if (!user) {
        console.log("User not found in DB")
        return NextResponse.json({ message: "User not found" }, { status: 404 })
      }
  
      console.log("Existing user found:", user)
  
      const existingUser = await db.collection("users").findOne({
        $or: [{ email }, { username }],
        _id: { $ne: objectIdUserId },
      })
  
      if (existingUser) {
        const errorMessage = existingUser.email === email ? "Email is already taken" : "Username is already taken"
        console.log("Error: ", errorMessage)
        return NextResponse.json({ message: errorMessage }, { status: 400 })
      }
  
      // Perform the update operation
      const result = await db.collection("users").updateOne(
        { _id: objectIdUserId },
        { $set: { firstName, lastName, email, username } }
      )
  
      if (result.modifiedCount === 0) {
        console.log("No changes detected. User profile is unchanged.")
        return NextResponse.json({ message: "No changes detected" }, { status: 200 })
      }
  
      // Fetch the updated user
      const updatedUser = await db.collection("users").findOne({ _id: objectIdUserId })
      if (!updatedUser) {
        console.log("Failed to fetch updated user")
        return NextResponse.json({ message: "Failed to fetch updated user" }, { status: 500 })
      }
  
      const { password, ...userProfile } = updatedUser
      console.log("Updated user profile:", userProfile)
  
      return NextResponse.json(userProfile)
    } catch (error) {
      console.error("Error updating user profile:", error)
      return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
  }