
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Library, LogOut } from "lucide-react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkLoginStatus = () => {
      const role = localStorage.getItem("role");
      setIsLoggedIn(!!role);
    };

    checkLoginStatus();
    // Re-check whenever the location changes
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <Library className="h-6 w-6 text-white" />
          <span className="text-xl font-semibold text-white">Libiverse</span>
        </div>
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => navigate("/library")}
              >
                Library
              </Button>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
