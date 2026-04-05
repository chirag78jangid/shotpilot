import { Link, useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { Moon, Sun, Camera, Video, Settings, History, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const navItems = [
    { href: "/create", label: "New Plan", icon: Camera },
    { href: "/saved", label: "Saved", icon: History },
    { href: "/chat", label: "Assistant", icon: MessageSquare },
  ];

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 mx-auto">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 text-primary">
            <Video className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              ShotPilot
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground/80 flex items-center gap-2 ${
                  location === item.href ? "text-foreground" : "text-foreground/60"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <nav className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </nav>
        </div>
      </div>
    </nav>
  );
}
