import { PenSquare } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useApp } from '@/context/AppContext';

export function FloatingActionButton() {
  const { setCurrentView } = useApp();

  return (
    <Button
      className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg md:hidden z-40"
      onClick={() => setCurrentView('post-creation')}
    >
      <PenSquare className="h-6 w-6" />
    </Button>
  );
}
