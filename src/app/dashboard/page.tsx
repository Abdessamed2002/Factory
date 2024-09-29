"use client"
import React, { useEffect, useState }  from "react";
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
  const [tasksNumber, setTasksNumber] = useState([]);
  const [usersNumber, setUsersNumber] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  

  const cards = [
    {
      icon: UsersIcon,
      value: usersNumber.total,
      title: "عدد التلاميذ",
    },
    {
      icon: CheckCircle,
      value: tasksNumber.total,
      title: "عدد المهام",
    },
  ];
  const topTeams = [
    { icon: AwardIcon, name: "team 1", rank: 1, points: 3000 },
    { icon: AwardIcon, name: "team 2", rank: 2, points: 2109 },
    { icon: AwardIcon, name: "team 3", rank: 3, points: 409 },
    { icon: AwardIcon, name: "team 4", rank: 4, points: 200 },
    { icon: AwardIcon, name: "team 5", rank: 5, points: 100 },
    { icon: AwardIcon, name: "team 6", rank: 6, points: 99 },
    { icon: AwardIcon, name: "team 7", rank: 7, points: 99 },
  ];
  const topStudents = topUsers
    .sort((a, b) => b.score - a.score) // Sort by score in descending order
    .map((student, index) => ({
      icon: CrownIcon,
      name: student.firstName,
      username: student.username,
      rank: index + 1, // Assign rank based on index
      points: student.score
    }));

  useEffect(() => {
    async function fetchData() {
      console.log(process.env.NEXT_PUBLIC_API_KEY);
      const response = await fetch(`http://localhost:3001/tasks?key=${process.env.NEXT_PUBLIC_API_KEY}`, {
        method: "GET"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    }
    fetchData();

    async function fetchNumberTasks() {
      const response = await fetch(`http://localhost:3001/total_number_tasks?key=${process.env.NEXT_PUBLIC_API_KEY}`, {
        method: "GET"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setTasksNumber(result);
    }
    fetchNumberTasks();

    async function fetchNumberUsers() {
      const response = await fetch(`http://localhost:3001/total_number_users?key=${process.env.NEXT_PUBLIC_API_KEY}`, {
        method: "GET"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setUsersNumber(result);
    }
    fetchNumberUsers();

    async function fetchTopUsers() {
      const response = await fetch(`http://localhost:3001/top_10_users?key=${process.env.NEXT_PUBLIC_API_KEY}`, {
        method: "GET"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setTopUsers(result);
    }
    fetchTopUsers();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-2 pt-5 pl-5 pr-2 h-full md:ml-0 bg-white">
      {cards.map((card, index) => (
        <div key={index} className="md:col-span-1 h-1">
          <Card className="bg-gray-200 text-dark-blue">
            <CardContent className="flex flex-col justify-center items-start p-4">
              <div>
                <card.icon />
              </div>
              <div className="font-bold text-5xl"> {card.value}</div>
              <div> {card.title}</div>
            </CardContent>
          </Card>
        </div>
      ))}      

      <div className="md:col-span-4 mr-4">
        <Card className="bg-gray-200 flex-grow overflow-y-auto scrollbar-thin  scrollbar-thumb-dark-blue scrollbar-track-gray-200">
          <h2 className="p-4 pl-9 pr-12 font-bold ">TOP Members <span className="float-right">Score</span></h2>
          <CardContent className="md:max-h-full ">
            <div className="">
              {topStudents.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-costum-cream mb-2 p-3 rounded-xl"
                >
                  <span className="font-bold text-lg flex items-center">
                    <span>
                      {student.rank <= 3 ? (
                        <student.icon />
                      ) : (
                        `#${student.rank}`
                      )}
                    </span>
                    <span className="mx-2 font-normal">{student.username}</span>
                  </span>
                  <span className="font-bold">
                    {student.points} points
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}