

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function MobileNavDrawer({
  items = [],
  ctaPrimary,
  ctaSecondary,
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setOpen(false);
    }, 250); // matches animation duration
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
        {/* Trigger */}
        <SheetTrigger asChild>
          <Button id="OpenMenuButton" aria-label="OpenMenuButton" variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>

        {/* Drawer */}
        <SheetContent
          side="right"
          className={`w-[80%] sm:w-[350px] p-6 bg-white 
            ${open && !closing ? "slide-in" : ""}
            ${closing ? "slide-out" : ""}
          `}
        >

          <SheetTitle>Menu</SheetTitle>
          

          {/* Nav */}
          <nav className="flex flex-col space-y-4">
            {items.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={handleClose}
                className="text-lg font-medium text-foreground hover:text-primary transition"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="my-6 border-t border-border" />

          {/* Buttons */}
          <div className="flex flex-col space-y-3">
            {ctaSecondary && (
              <a href={ctaSecondary.href}>
                <Button variant="outline" className="w-full" onClick={handleClose}>
                  {ctaSecondary.label}
                </Button>
              </a>
            )}

            {ctaPrimary && (
              <a href={ctaPrimary.href}>
                <Button id="closeMenuButton" aria-label="CloseMenuButton" className="w-full bg-[#B1111C] text-white" onClick={handleClose}>
                  {ctaPrimary.label}
                </Button>
              </a>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
