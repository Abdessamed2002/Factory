"use client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function Logout() {
  const router = useRouter();

  const logout = () => {
    // Redirect to main page
    router.push("/");
  };
  return (
    <div className="">
      <Button
        onClick={() => {
            logout();
        }}
        variant="ghost"
        className=" space-x-2 rtl:space-x-reverse flex items-center p-2 hover:font-bold rounded-md flex-grow"
      >
        <LogOut
          className="w-9 h-9 bg-red rounded-full p-2"
          color="white"
        />
        <p>Logout</p>
      </Button>
    </div>
  );
}
