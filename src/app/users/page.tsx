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

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`http://localhost:3001/users?key=${process.env.NEXT_PUBLIC_API_KEY}`, {
        method: "GET"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    }
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 p-2 h-full md:ml-0 bg-white">

      <div className="md:col-span-4">
        {data.map((user, index) => (
          <div className="flex items-center justify-between bg-gray-200 mb-2 p-3 rounded-xl">
            <div className="flex items-center">
              <img
                src={user.profilePhotos}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h2 className="font-bold text-lg">{`${user.firstName} ${user.lastName}`}</h2>
                <p className="text-sm text-gray-600">{user.username}</p>
                <p className="text-sm text-gray-600">{user.country}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{user.score} points</p>
              <p className="text-sm text-gray-600">{user.phoneNumber}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}