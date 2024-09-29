"use client";

require('dotenv').config();
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// you must add NEXT_PUBLIC_SOMETHING to the env variables :)
const email = process.env.NEXT_PUBLIC_EMAIL;
const password = process.env.NEXT_PUBLIC_PASSWORD;

// Define the shape of the login form data
const LoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type content = {
  email: string;
  password: string;
  email_label: string;
  password_label: string;
  error_message_email: string;
  error_message_password: string;
  submit: string;
};

type Props = {
  params: {
    
    content: content;
  };
};

const LoginForm = ({ params: { content } }: Props) => {
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
  });

  const router = useRouter();
  const onSubmit = (formData: z.infer<typeof LoginFormSchema>) => {
    // Redirect to the dashboard page
    if (formData.email === email && formData.password === password) {
      console.log("Innnn");
      router.push("/dashboard");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 ">
        <FormField
          control={form.control}
          name="email"
          defaultValue={form.getValues("email")}
          render={({ field }) => (
            <FormItem className="md:w-full">
              <FormLabel>{content.email}</FormLabel>
              <FormControl>
                <Input
                  className="bg-white"
                  placeholder="Enter your email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          defaultValue={form.getValues("password")}
          render={({ field }) => (
            <FormItem className="md:w-full">
              <FormLabel>{content.password}</FormLabel>
              <FormControl>
                <Input
                  className="bg-white"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-center">
          <Button
            type="submit"
            className="bg-[#0F172A] w-full hover:bg-[#FFE7C2] hover:text-[#0F172A]  rounded-xl"
          >
            {content.submit}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
