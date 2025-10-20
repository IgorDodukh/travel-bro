"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MailCheck } from "lucide-react";
import { sendContactEmail } from "@/lib/contactActions";
import ActionButton from "./ui/action-button";


const ContactFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    message: z.string().min(10, "Message must be at least 10 characters."),
});

export default function Contact() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);


    const form = useForm<z.infer<typeof ContactFormSchema>>({
        resolver: zodResolver(ContactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    async function onSubmit(data: z.infer<typeof ContactFormSchema>) {
        setIsSubmitting(true);
        try {
            const result = await sendContactEmail(data);
            if (result.success) {
                toast({
                    title: "Message Sent!",
                    description: "Thank you for contacting us. We'll get back to you shortly.",
                });
                setIsSubmitted(true);
                form.reset();
            } else {
                throw new Error(result.error || "An unknown error occurred.");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to Send Message",
                description: error instanceof Error ? error.message : "There was an issue sending your message. Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isSubmitted) {
        return (
            <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
                <div className="container mx-auto px-4 md:px-6">
                    <Card className="max-w-xl mx-auto shadow-lg text-center">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                                <MailCheck className="h-12 w-12 text-primary" />
                            </div>
                            <CardTitle className="text-3xl font-bold mt-4">Thank You!</CardTitle>
                            <CardDescription className="text-muted-foreground md:text-lg">
                                Your message has been sent successfully. We'll be in touch soon.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ActionButton title="Send Another Message" onClick={() => setIsSubmitted(false)} />
                            {/* <Button onClick={() => setIsSubmitted(false)}>Send Another Message</Button> */}
                        </CardContent>
                    </Card>
                </div>
            </section>
        )
    }

    return (
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <Card className="max-w-xl mx-auto shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold">Get In Touch</CardTitle>
                        <CardDescription className="text-muted-foreground md:text-lg">
                            Have a question or want to work together? Drop us a line.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="your@email.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Your message..." className="min-h-[100px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-center">
                                    <ActionButton title={isSubmitting ? "Sending..." : "Send Message"} isLoading={isSubmitting} type="submit" disabled={isSubmitting} />
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}