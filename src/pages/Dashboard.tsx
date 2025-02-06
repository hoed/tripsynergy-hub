import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Logo } from "@/components/ui/logo";
import { AdditionalServiceForm } from "@/components/AdditionalServiceForm";
import { BookingSummary } from "@/components/BookingSummary";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Dashboard() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth");
    }
  }, [session, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" className="w-auto h-8 md:h-10" />
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <ProfileAvatar />
              
              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/accommodations")}>
                        Accommodations
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/transportation")}>
                        Transportation
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/attractions")}>
                        Attractions
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/meals")}>
                        Meals
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/additional_services")}>
                        Additional Items
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Desktop Navigation */}
          <div className="hidden md:block space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/accommodations")}>
              Accommodations
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/transportation")}>
              Transportation
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/attractions")}>
              Attractions
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/meals")}>
              Meals
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/additional_services")}>
              Additional Items
            </Button>
          </div>

          {/* Summary and Additional Services */}
          <div className="space-y-8">
            <BookingSummary />
            <AdditionalServiceForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-sm text-gray-600 dark:text-gray-400">
        © 2025. Hoed's Project. All Rights Reserved
      </footer>
    </div>
  );
}