import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button"; 

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      // Added classes to ensure the button and icon look great in both themes
      className="
        text-gray-500 dark:text-gray-300 
        hover:bg-gray-200 dark:hover:bg-gray-700/50
        hover:text-gray-800 dark:hover:text-white
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-offset-white dark:focus:ring-offset-gray-900 
        focus:ring-pink-500
      "
    >
      {/* 
        The icon now rotates on toggle for a smoother feel.
        We show the icon of the theme you will switch TO.
      */}
      <div className="relative w-6 h-6 flex items-center justify-center">
        <Sun 
          className={`
            absolute transition-all duration-300 ease-in-out
            ${theme === 'light' ? 'transform scale-100 opacity-100 rotate-0' : 'transform scale-0 opacity-0 rotate-90'}
          `} 
        />
        <Moon 
          className={`
            absolute transition-all duration-300 ease-in-out
            ${theme === 'dark' ? 'transform scale-100 opacity-100 rotate-0' : 'transform scale-0 opacity-0 -rotate-90'}
          `} 
        />
      </div>
    </Button>
  );
};