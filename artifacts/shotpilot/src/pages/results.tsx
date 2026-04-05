import { Navbar } from "@/components/navbar";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSaveShotPlan, useGenerateShotPlan } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Video, 
  Settings, 
  Move3d, 
  Scissors, 
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import type { ShotPlan } from "@workspace/api-client-react";

export default function Results() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Try to get plan from wouter location state, fallback to localStorage
  const [planData, setPlanData] = useState<{plan: ShotPlan, context: any} | null>(null);
  
  useEffect(() => {
    // Need to handle history state in wouter which isn't directly exposed
    // but the instruction says "from wouter location state (passed during navigation)"
    // As a workaround, we'll rely on the localStorage backup we made in Create
    const saved = localStorage.getItem("shotpilot-last-plan");
    if (saved) {
      try {
        setPlanData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved plan");
      }
    } else {
      // If no plan is found, redirect to create
      toast({
        title: "No plan found",
        description: "Please generate a plan first.",
        variant: "destructive"
      });
      setLocation("/create");
    }
  }, [setLocation, toast]);

  const savePlan = useSaveShotPlan({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Plan Saved",
          description: "Your shot plan has been saved successfully.",
        });
        setLocation("/saved");
      },
      onError: (err) => {
        toast({
          title: "Failed to save plan",
          description: err.message || "An unknown error occurred",
          variant: "destructive"
        });
      }
    }
  });

  const handleSave = () => {
    if (!planData) return;
    
    savePlan.mutate({
      data: {
        name: `${planData.context.shootingSituation} for ${planData.context.purpose}`,
        deviceType: planData.context.deviceType,
        brandModel: planData.context.brandModel,
        shootingSituation: planData.context.shootingSituation,
        purpose: planData.context.purpose,
        skillLevel: planData.context.skillLevel,
        plan: planData.plan
      }
    });
  };

  if (!planData) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
            <p>Loading your plan...</p>
          </div>
        </main>
      </div>
    );
  }

  const { plan, context } = planData;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl py-8 px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Shot Plan</h1>
            <p className="text-muted-foreground mt-1">
              Optimized for {context.brandModel} • {context.shootingSituation}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setLocation("/create")}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
            <Button onClick={handleSave} disabled={savePlan.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {savePlan.isPending ? "Saving..." : "Save Plan"}
            </Button>
          </div>
        </div>

        {plan.summary && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-lg font-medium italic text-foreground/90">{plan.summary}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                Camera Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.cameraSettings.map((setting: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-3 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{setting}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Video className="mr-2 h-5 w-5 text-primary" />
                Shot List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.shotList.map((shot: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium mr-3 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span>{shot}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Camera className="mr-2 h-5 w-5 text-primary" />
                Camera Angles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.cameraAngles.map((angle: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-3 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{angle}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Move3d className="mr-2 h-5 w-5 text-primary" />
                Movement Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.movementTips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-3 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Scissors className="mr-2 h-5 w-5 text-primary" />
                Editing Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {plan.editingSuggestions.map((suggestion: string, i: number) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-3 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
