import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export default function TopBar({ title, showBack = false, rightElement }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-light-grey h-14 flex items-center px-4 shadow-sm">
      <div className="flex-1 flex items-center">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 hover:bg-off-white rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-text-primary" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-text-primary truncate">{title}</h1>
      </div>
      
      {rightElement && (
        <div className="flex-shrink-0">{rightElement}</div>
      )}
    </header>
  );
}
