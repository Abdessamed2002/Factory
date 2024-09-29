import Image from "next/image";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import LoginForm from "./login/form";


type Props = {};

export default function Home({ }: Props) {
  return (
    <div className="flex flex-col md:flex-row max-sm:items-center md:h-screen md:w-screen max-sm:justify-center ">
      <div className=" md:w-1/2 md:bg-dark-blue flex items-center justify-center">
        <div className="mt-4 md:order-last md:w-auto ">
          <Image
            src="/mobilefactory.svg"
            className="max-md:hidden"
            alt="desktop"
            width={300}
            height={300}
          />
                    
        </div>
      </div>

      <div className="flex flex-col items-center justify-center md:order-first md:w-1/2 ">
        <Card className="border-none md:w-[60%] mt-[10%]">
          <CardHeader>
            <p className="text-3xl ">
              {"welcome"} <b className="md:hidden">{"back"}</b>
            </p>
            <CardTitle className="md:text-4xl max-sm:hidden ">
              {"back"}
            </CardTitle>
            <CardDescription className="md:hidden">
              {"enter-your-email-below-to-create-your-account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              params={{
                content: {
                  email: ("email"),
                  password: ("password"),
                  email_label: ("email_label"),
                  password_label: ("password"),
                  error_message_email: ("error_message_email"),
                  error_message_password: ("error_message_password"),
                  submit: ("submit"),
                },
              }}
            />
          </CardContent>
          
        </Card>
        
      </div>
    </div>
  );
}
