import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "../globals.css";
import SideBar from "../side-bar";
import NavBar from "../nav-bar";

const inter = Inter({ subsets: ["latin"] });
const cairo = Cairo({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Factory",
  description: "In mission to build a community",
};

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <div className="flex">
      <SideBar className="border-e-2  md:w-48 hidden md:flex md:h-screen fixed   bg-blue " />
      <div className="flex flex-col md:ms-48 flex-grow h-screen ">
        <NavBar className=" fixed start-0 top-0 end-0 md:ms-48 flex flex-grow justify-between  p-2 items-center border-b-2 h-14  bg-blue " />
        <main className="mt-14 flex-auto">{children}</main>
      </div>
    </div>
  );
}
