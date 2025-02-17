import { NextResponse } from "next/server"
import bcrypt from 'bcryptjs';
import { SignJWT } from "jose"
import clientPromise from "@/app/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ username })
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }
    const token = await new SignJWT({ userId: user._id.toString() })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d") 
      .sign(new TextEncoder().encode(process.env.JWT_SECRET))
    const response = NextResponse.json({ message: "Login successful" }, { status: 200 })
    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 604800, 
        path: "/",
      });

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

