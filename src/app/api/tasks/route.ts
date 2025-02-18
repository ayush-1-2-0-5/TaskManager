import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { jwtVerify } from "jose";

async function getUserIdFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload.userId as string;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      
    const client = await clientPromise;
    const db = client.db();

    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    const statusFilter = url.searchParams.get("status") || "ALL";
    const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";
    
    let filter: any = { userId: new ObjectId(userId) };

    if (dateParam) {
      const date = new Date(dateParam);
    
      // console.log('date',date);

      // Ensure the date is in UTC (this will ignore the local time zone offset)
      const startOfDayUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
      const endOfDayUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
      // console.log('startOfDayUTC',startOfDayUTC);
      // console.log('endOfDayUTC',endOfDayUTC);

      filter.deadline = { $gte: startOfDayUTC, $lte: endOfDayUTC };
    }

    if (statusFilter === "ALL") {
      filter.status = { $nin: ["EXPIRED"] };
    } else {
      filter.status = statusFilter;
    }

    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const tasks = await db.collection("tasks").find(filter).sort({ deadline: 1 }).toArray();

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { title, description, deadline } = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const deadlineDate = new Date(deadline);
    const created= new Date();
    created.setHours(created.getHours() + 5);
    created.setMinutes(created.getMinutes()+30);

  
    // deadlineDate.setHours(deadlineDate.getHours() + 5);
    // deadlineDate.setMinutes(deadlineDate.getMinutes()+30);
    
    const newTask = {
      userId: new ObjectId(userId),
      title,
      description,
      status: "ACTIVE",
      deadline: deadlineDate,
      createdAt: created,
    };

    await db.collection("tasks").insertOne(newTask);
    return NextResponse.json({ message: "Task created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, title, description, status, deadline } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "Task ID is required" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const updatedTask = await db.collection("tasks").findOneAndUpdate(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: { title, description, status, deadline: new Date(deadline) } },
      { returnDocument: "after" }
    );

    if (!updatedTask || !updatedTask.value) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask.value);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id } = await request.json(); // ✅ Get ID from body
    if (!id) return NextResponse.json({ message: "Task ID is required" }, { status: 400 });
    const client = await clientPromise;
    const db = client.db();
    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });

    const currentDate = new Date();
    const taskDeadline = new Date(task.deadline);
    if (currentDate >= taskDeadline) {
      return NextResponse.json({ message: "Task deadline has passed and cannot be deleted." }, { status: 400 });
    }
    const result = await db.collection("tasks").deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (result.deletedCount === 0) return NextResponse.json({ message: "Task not found" }, { status: 404 });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
