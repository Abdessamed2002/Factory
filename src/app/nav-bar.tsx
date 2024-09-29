import Image from "next/image";
import { useTranslations } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { LayoutDashboard, LogOut, Siren } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  className?: string;
};

export default function NavBar({ className }: Props) {

  return (
    <nav className={`${className} bg-gray-200`}>
      <p>Factory</p>
    
      <Avatar >
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>DZ</AvatarFallback>
      </Avatar> 
    </nav>
  );
}
