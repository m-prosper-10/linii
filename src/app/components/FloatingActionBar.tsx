"use client";

import { Button } from '@/app/components/ui/button';
import { PenSquare } from 'lucide-react';
import Link from 'next/link';

export function FloatingActionButton() {
  return (
    <Button
      className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg md:hidden z-40"
      asChild
    >
      <Link href="/post/create">
        <PenSquare className="h-6 w-6" />
      </Link>
    </Button>
  );
}
