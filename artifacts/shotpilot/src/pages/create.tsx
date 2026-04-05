import { Navbar } from "@/components/navbar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useLocation } from "wouter";
import { useGenerateShotPlan } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap } from "lucide-react";

const formSchema = z.object({
  deviceType: z.enum(["Mobile", "DSLR", "Mirrorless"]),
  brandModel: z.string().min(2, { message: "Brand and model must be at least 2 characters." }),
  cameraType: z.string().min(2, { message: "Lens/Camera type must be specified." }),
  shootingSituation: z.enum(["Reel", "Travel", "Cinematic", "Night", "Indoor", "Other"]),
  purpose: z.enum(["Instagram", "YouTube", "TikTok", "Film", "Other"]),
  skillLevel: z.enum(["Beginner", "Intermediate", "Pro"]),
});

export default function Create() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const generateShotPlan = useGenerateShotPlan({
    mutation: {
      onSuccess: (data, variables) => {
        // Save form values to backup the context
        localStorage.setItem("shotpilot-last-plan", JSON.stringify({
          plan: data,
          context: variables.data
        }));
        
        setLocation("/results", { state: { plan: data, context: variables.data } });
      },
      onError: (error) => {
        toast({
          title: "Failed to generate plan",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceType: "Mobile",
      brandModel: "",
      cameraType: "",
      shootingSituation: "Cinematic",
      purpose: "YouTube",
      skillLevel: "Intermediate",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    generateShotPlan.mutate({ data: values });
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-3xl py-10 px-4 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Configure Your Shot</h1>
          <p className="text-muted-foreground">
            Provide details about your gear and goal to get an AI-generated professional shooting plan.
          </p>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Gear & Situation Details</CardTitle>
            <CardDescription>
              The more specific you are, the better the guidance will be.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="deviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select device type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Mobile">Mobile Phone</SelectItem>
                            <SelectItem value="DSLR">DSLR</SelectItem>
                            <SelectItem value="Mirrorless">Mirrorless</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skillLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select skill level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand & Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., iPhone 15 Pro Max, Sony A7IV" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cameraType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lens / Camera specifics</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 24-70mm f/2.8, Ultra-wide lens" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shootingSituation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shooting Situation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select situation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Reel">Short-form / Reel</SelectItem>
                            <SelectItem value="Travel">Travel / Vlog</SelectItem>
                            <SelectItem value="Cinematic">Cinematic / Narrative</SelectItem>
                            <SelectItem value="Night">Night / Low Light</SelectItem>
                            <SelectItem value="Indoor">Indoor / Studio</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Final Platform / Purpose</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="TikTok">TikTok</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="Film">Short Film / Cinema</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-4" 
                  size="lg"
                  disabled={generateShotPlan.isPending}
                >
                  {generateShotPlan.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Gear & Generating Plan...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Generate Professional Shot Plan
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
