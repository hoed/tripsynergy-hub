import { useState } from "react";
import { Menu, MenuItem, MenuButton } from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Icons } from "@/components/ui/icons";

const HamburgerMenu = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Menu>
        <MenuButton className="flex items-center space-x-2">
          <Icons.hamburger className="h-6 w-6" />
        </MenuButton>
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20">
          <MenuItem onSelect={() => setIsOpen(!isOpen)}>
            <Icons.user className="mr-2 h-4 w-4" />
            Profile
          </MenuItem>
          <MenuItem onSelect={toggleTheme}>
            <Icons.theme className="mr-2 h-4 w-4" />
            {theme === "dark" ? "Light Theme" : "Dark Theme"}
          </MenuItem>
          <MenuItem onSelect={signOut}>
            <Icons.logout className="mr-2 h-4 w-4" />
            Logout
          </MenuItem>
        </div>
      </Menu>
    </div>
  );
};

export default HamburgerMenu;