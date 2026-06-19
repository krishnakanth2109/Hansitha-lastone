import { useState } from "react";
import { Home, ShoppingBag, Heart, Search, User, Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigationItems = [
  { icon: Home, label: "Home", active: false },
  { icon: ShoppingBag, label: "Shop", active: false },
  { icon: Heart, label: "Wishlist", active: false },
  { icon: Search, label: "Search", active: false },
  { icon: User, label: "Account", active: true },
];

export function AccountNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {/* Mobile menu content */}
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.label}
                      variant={item.active ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">H</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Hansitha Creations
                </h1>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
        <div className="flex justify-around items-center py-2">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                item.active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
              {item.active && (
                <div className="w-4 h-0.5 bg-primary rounded-full" />
              )}
            </Button>
          ))}
        </div>
      </nav>
    </>
  );
}