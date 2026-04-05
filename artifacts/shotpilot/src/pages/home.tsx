import { Navbar } from "@/components/navbar";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Camera, Film, Crosshair, Zap, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
        
        <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8">
            <Zap className="mr-1 h-3 w-3" />
            <span>AI-Powered Cinematography</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            Turn Your Camera Into a <span className="text-primary">Pro Tool</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
            Get AI-powered video shooting guidance based on your device. Stop guessing settings and start capturing cinematic shots instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/create">
              <Button size="lg" className="text-lg px-8 h-14">
                <Camera className="mr-2 h-5 w-5" />
                Start Creating
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mt-12">
            <div className="flex flex-col items-center md:items-start p-6 rounded-2xl bg-card border border-border">
              <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4">
                <Film className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tailored Shot Lists</h3>
              <p className="text-muted-foreground">Detailed angle and movement plans designed specifically for your shooting situation.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-start p-6 rounded-2xl bg-card border border-border">
              <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4">
                <Settings className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Exact Settings</h3>
              <p className="text-muted-foreground">Stop guessing ISO, shutter speed, and aperture. Get precise recommendations.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-start p-6 rounded-2xl bg-card border border-border">
              <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4">
                <Crosshair className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pro Techniques</h3>
              <p className="text-muted-foreground">Expert movement tips and editing suggestions to elevate your final cut.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
