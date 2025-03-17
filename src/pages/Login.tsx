
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const { toast } = useToast();

  const validUsers = {
    user: { username: "user123", password: "vit1" },
    admin: { username: "user789", password: "vit2" }
  };

  const handleLogin = () => {
    if (username.trim() === validUsers[role as keyof typeof validUsers].username && 
        password.trim() === validUsers[role as keyof typeof validUsers].password) {
      localStorage.setItem("role", role);
      toast({
        title: "Login Successful",
        description: `Welcome ${role === 'admin' ? 'Administrator' : 'User'}!`,
      });
      navigate("/library");
    } else {
      toast({
        variant: "destructive",
        title: "Invalid credentials",
        description: "Please check your username and password"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Login to Libiverse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select defaultValue={role} onValueChange={setRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={handleLogin}
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
