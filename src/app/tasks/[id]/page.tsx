"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "ACTIVE" | "IN_PROGRESS" | "COMPLETE" | "EXPIRED";
  deadline: string;
}

export default function TaskDetail({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (params.id) fetchTask();
  }, [params.id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch task");
      const data = await response.json();
      setTask(data);
    } catch (error) {
      setError("An error occurred while fetching task");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (task) {
      const { name, value } = e.target;

      // Prevent user from setting status to "EXPIRED"
      if (name === "status" && value === "EXPIRED") {
        alert("You cannot manually set a task to 'Expired'.");
        return;
      }

      setTask({ ...task, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    // Prevent updating an expired task
    if (task?.status === "EXPIRED") {
      alert("You cannot update an expired task.");
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task");
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error: any) {
      alert(error.message);
      setError(error.message);
    }
  };

  if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!task) return <div className="text-center text-gray-600">Task not found</div>;

  const isDeadlinePassed = task ? new Date(task.deadline).getTime() < new Date().getTime() + (5.5 * 60 * 60 * 1000) : false;


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Update Task</h2>
        {success && <p className="text-center text-green-600">Task updated successfully!</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={task.title}
              onChange={handleChange}
              disabled={isDeadlinePassed || undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDeadlinePassed ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={task.description}
              onChange={handleChange}
              disabled={isDeadlinePassed || undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDeadlinePassed ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={task.status}
              onChange={handleChange}
              disabled={isDeadlinePassed || undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDeadlinePassed ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            >
              <option value="ACTIVE">Active</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETE">Complete</option>
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="deadline" className="block text-gray-700 text-sm font-bold mb-2">
              Deadline
            </label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""}
              onChange={handleChange}
              disabled={isDeadlinePassed || undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDeadlinePassed ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition duration-300"
            disabled={isDeadlinePassed}
          >
            Update Task
          </button>
        </form>
      </div>
    </div>
  );
}
