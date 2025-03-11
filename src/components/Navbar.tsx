
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Library } from "lucide-react";

const Navbar = () => {
  const [isLoggedIn] = useState(!!localStorage.getItem("role"));
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Library className="h-6 w-6 text-white" />
          <span className="text-xl font-semibold text-white">Libiverse</span>
        </div>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/20"
          onClick={() => navigate(isLoggedIn ? "/library" : "/login")}
        >
          {isLoggedIn ? "Go to Library" : "Login"}
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
