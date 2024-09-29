"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  ShapesIcon,
  UsersIcon,
  CrownIcon,
  AwardIcon,
} from "lucide-react";
import { Link } from "@/config/navigation";

export default function Home() {
  const [data, setData] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    point: 1,
    startDate: "",
    endDate: "",
    type: "text",
    repeat: false,
    captionText: "",
  });

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `http://localhost:3001/tasks?key=${process.env.NEXT_PUBLIC_API_KEY}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    }
    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      let response;
      if (selectedTask) {
        formData.id = selectedTask.id; // Append task ID for update
        response = await fetch(`http://localhost:3001/tasks?key=${process.env.NEXT_PUBLIC_API_KEY}&id=${selectedTask.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`http://localhost:3001/tasks?key=${process.env.NEXT_PUBLIC_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      
      const newData = await response.json();
      if (Array.isArray(newData)) {
        setData(newData);
      } else {
        console.error("Received non-array data from API:", newData);
        // Handle this case appropriately, perhaps by displaying an error message or resetting data state
      }
      setSelectedTask(null); // Clear selected task after update
      setFormData({
        name: "",
        point: 1,
        startDate: "",
        endDate: "",
        type: "text",
        repeat: false,
        captionText: "",
      }); // Clear form data
    } catch (error) {
      // Handle error
      console.error("Error submitting form:", error);
      alert(`Error submitting form: ${error.message}`);
    }
  };

  const handleUpdate = (task) => {
    setSelectedTask(task); // Set selected task to fill form with its data
    setFormData({
      name: task.name,
      point: task.point,
      startDate: task.startDate,
      endDate: task.endDate,
      type: task.type,
      repeat: task.repeat,
      captionText: task.captionText,
    });

    // Scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scrolling
    });
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/tasks?key=${process.env.NEXT_PUBLIC_API_KEY}&id=${taskId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorResponse.error}`
        );
      }
      // Update state after successful deletion
      const updatedData = data.filter((task) => task.id !== taskId);
      setData(updatedData);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(`Error deleting task: ${error.message}`);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "point" ? Number(value) : value,
    }));
  };

  const handleRadioChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value === "true",
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white">
      <div className="bg-blue shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="name" className="font-medium text-gray-700">Task Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="point" className="font-medium text-gray-700">Task Point</label>
            <input
              type="number"
              id="point"
              name="point"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={formData.point}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="startDate" className="font-medium text-gray-700">Start Date (EX: 2024-04-09 12:15)</label>
            <input
              type="text"
              id="startDate"
              name="startDate"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="endDate" className="font-medium text-gray-700">End Date (EX: 2024-04-10 12:20)</label>
            <input
              type="text"
              id="endDate"
              name="endDate"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">Task Type</span>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="type"
                value="text"
                required
                checked={formData.type === "text"}
                onChange={handleChange}
                className="focus:ring-2 focus:ring-blue-500"
              />
              <span>Text</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="type"
                value="image"
                required
                checked={formData.type === "image"}
                onChange={handleChange}
                className="focus:ring-2 focus:ring-blue-500"
              />
              <span>Image</span>
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">Repeated Task?</span>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="repeat"
                value="true"
                required
                checked={formData.repeat === true}
                onChange={handleRadioChange}
                className="focus:ring-2 focus:ring-blue-500"
              />
              <span>True</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="repeat"
                value="false"
                required
                checked={formData.repeat === false}
                onChange={handleRadioChange}
                className="focus:ring-2 focus:ring-blue-500"
              />
              <span>False</span>
            </label>
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="captionText" className="font-medium text-gray-700">Task Caption</label>
            <input
              type="text"
              id="captionText"
              name="captionText"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.captionText}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-center">
            <button type="submit" className="px-4 py-2 bg-white w-full text-gray-700 rounded hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              Submit
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4 ">
        {data.map((task, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row justify-between items-center bg-blue shadow rounded-lg p-4 space-y-2 md:space-y-0"
          >
            {task.type === "image" && (
              <img
                src={task.name}
                alt={task.captionText}
                className="w-20 h-20 object-cover rounded-full mr-4"
              />
            )}
            <div className="flex-1">
              <h2 className="font-bold text-lg text-gray-800">{task.type === "image" ? task.captionText : task.name}</h2>
              <p className="text-sm text-gray-600">Points: {task.point}</p>
              <p className="text-sm text-gray-600">Start: {new Date(task.startDate).toLocaleString()}</p>
              <p className="text-sm text-gray-600">End: {new Date(task.endDate).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Repeated: {task.repeat ? "Yes" : "No"}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleUpdate(task)}
                className="p-2 bg-yellow text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="p-2 bg-red text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
