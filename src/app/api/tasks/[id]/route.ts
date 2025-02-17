import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";
import { jwtVerify } from "jose";

async function getUserIdFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromToken(request);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db();
  const taskId = params.id;

  if (!ObjectId.isValid(taskId)) return NextResponse.json({ message: "Invalid Task ID" }, { status: 400 });

  const task = await db.collection("tasks").findOne({ _id: new ObjectId(taskId), userId: new ObjectId(userId) });

  if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });

  return NextResponse.json(task);
}
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromToken(request);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { title, description, status, deadline } = await request.json();
  if (!title || !description || !status || !deadline) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const taskId = params.id;

  if (!ObjectId.isValid(taskId)) return NextResponse.json({ message: "Invalid Task ID" }, { status: 400 });

  // 🔥 Check if the task is expired
  const existingTask = await db.collection("tasks").findOne({ _id: new ObjectId(taskId), userId: new ObjectId(userId) });

  if (!existingTask) return NextResponse.json({ message: "Task not found" }, { status: 404 });

  if (existingTask.status === "EXPIRED") {
    return NextResponse.json({ message: "Cannot update an expired task" }, { status: 403 });
  }

  const result = await db.collection("tasks").updateOne(
    { _id: new ObjectId(taskId), userId: new ObjectId(userId) },
    { $set: { title, description, status, deadline: new Date(deadline) } }
  );

  return NextResponse.json({ message: "Task updated successfully" });
}