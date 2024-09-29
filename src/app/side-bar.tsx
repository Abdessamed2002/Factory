import Image from "next/image";
import { useTranslations } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { BookOpen, CheckCircle, LayoutDashboard, LogOut, Siren, Users } from "lucide-react";
import { Logout } from "./logout";

type Props = {
  className?: string;
};

export default function SideBar({ className }: Props) {
  const MENU_ITEMS = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/dashboard",
    },
    {
      name: "Tasks",
      icon: <CheckCircle className="w-5 h-5" />,
      path: "/tasks",
    },
    {
      name: "Users",
      icon: <Users className="w-5 h-5" />,
      path: "/users",
    }
  ];
  return (
    <aside
      className={`${className}`}
    >
      <div className="flex flex-col justify-between items-center p-4 w-full bg-gray-200">
        <div className="space-y-12">
          <div className="space-y-3 flex flex-col justify-center w-full items-center">
            <Image
              src="/mobilefactory.svg"
              className="mb-30 items-center"
              alt="factory"
              width={100}
              height={100}
            />
            <p className="font-bold text-xl text-center"></p>
          </div>

          <div className="space-y-5 ">
            {MENU_ITEMS.map((item, index) => (
              <Link
                key={index}
                href={`${item.path}`}
                className="space-x-2  rtl:space-x-reverse flex items-center hover:font-bold rounded-md"
              >
                {item.icon}
                <p className="">{item.name}</p>
              </Link>
            ))}
          </div>
        </div>
        <Logout/>
      </div>
    </aside>
  );

  
}
