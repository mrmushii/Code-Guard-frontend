import { useState } from "react";
import logo from "@/assets/logo.png";
import type { User, UserRole } from "@/types";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    // Create a strongly-typed userInfo object
    const userInfo: User = { username, role };

    if (role === "student") {
      navigate("/student-dashboard", { state: { user: userInfo } });
    } else if (role === "examiner") {
      navigate("/examiner-dashboard", { state: { user: userInfo } });
    }
  };

  return (
   <div className="flex justify-center items-center h-screen">
     <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <img src={logo} alt="IIUC Logo" className="w-20 h-20 mx-auto mb-4" />
        <CardTitle className="text-2xl">CodeGuard</CardTitle>
        <CardDescription>Secure Lab Exam</CardDescription>
        <p className="pt-4 font-semibold text-lg">Welcome</p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
         
           <div className="space-y-2">
            <Label htmlFor="username">Username/ID</Label>
            <Input
              id="username"
              placeholder="Enter your ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>I am a:</Label>
            <RadioGroup
              defaultValue="student"
              className="flex items-center space-x-4 pt-1"
              value={role}
              // Cast the value to UserRole for type safety
              onValueChange={(value) => setRole(value as UserRole)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="examiner" id="examiner" />
                <Label htmlFor="examiner">Examiner</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full">LOGIN</Button>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </CardFooter>
      </form>
    </Card>
   </div>
  );
}