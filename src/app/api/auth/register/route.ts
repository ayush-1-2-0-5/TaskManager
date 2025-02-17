import { NextResponse } from "next/server"
import bcrypt from 'bcryptjs';
import clientPromise from "../../../lib/mongodb";
import type { User } from "../../../models/User";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, username, password } = await request.json()

    const client = await clientPromise
    const db = client.db()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser: User = {
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
    }

    await db.collection("users").insertOne(newUser)

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

