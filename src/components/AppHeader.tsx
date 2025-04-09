
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AppNavigation from './AppNavigation';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  backPath?: string;
}

const AppHeader = ({ title, showBackButton = false, backPath = '/' }: AppHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-app-blue text-white py-4 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton ? (
            <Link to={backPath} className="mr-2">
              <ArrowLeft size={24} />
            </Link>
          ) : null}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-app-light-blue">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-64">
            <AppNavigation />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default AppHeader;
