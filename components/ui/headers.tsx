'use client';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex items-center justify-end w-full px-4 py-2">
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
