import { Navbar } from "@/components/navbar";
import { useListSavedPlans, useDeleteSavedPlan, getListSavedPlansQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Camera, Trash2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";

export default function Saved() {
  const { data: plans, isLoading } = useListSavedPlans();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const deletePlan = useDeleteSavedPlan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Plan deleted" });
        queryClient.invalidateQueries({ queryKey: getListSavedPlansQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to delete plan", variant: "destructive" });
      }
    }
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this plan?")) {
      deletePlan.mutate({ id });
    }
  };

  const viewPlan = (plan: any) => {
    // Reconstruct the context shape expected by results page
    const context = {
      deviceType: plan.deviceType,
      brandModel: plan.brandModel,
      shootingSituation: plan.shootingSituation,
      purpose: plan.purpose,
      skillLevel: plan.skillLevel
    };
    
    localStorage.setItem("shotpilot-last-plan", JSON.stringify({
      plan: plan.plan,
      context
    }));
    
    setLocation("/results");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl py-10 px-4 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Saved Plans</h1>
            <p className="text-muted-foreground mt-1">Access your previous shooting guides</p>
          </div>
          <Link href="/create">
            <Button>
              <Camera className="mr-2 h-4 w-4" />
              New Plan
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-muted/50 rounded-t-lg" />
                <CardContent className="h-20" />
              </Card>
            ))}
          </div>
        ) : plans?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-card/50 border-dashed">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved plans yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first professional shooting plan tailored to your gear and situation.
            </p>
            <Link href="/create">
              <Button>Create a Plan</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <Card 
                key={plan.id} 
                className="flex flex-col cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => viewPlan(plan)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{plan.name}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive -mr-2 -mt-2"
                      onClick={(e) => handleDelete(e, plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(plan.createdAt), "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{plan.deviceType}</Badge>
                    <Badge variant="outline">{plan.purpose}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plan.brandModel}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between border-t mt-auto px-6 py-4 bg-muted/20">
                  <span className="text-xs font-medium text-muted-foreground">
                    {plan.plan.shotList.length} shots planned
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
