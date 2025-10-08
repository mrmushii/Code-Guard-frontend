import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExamInstructions } from './ExamInstructions';


interface StudentDashboardContentProps {
  username: string;
}

export function StudentDashboardContent({ username }: StudentDashboardContentProps) {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) {
      alert("Room ID cannot be empty.");
      return;
    }
    console.log("Attempting to join room with:", { roomId, password });
    // This sets the state to switch the view to the exam instructions
    setHasJoined(true);
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center flex justify-center items-center p-4"
         style={{ backgroundImage: `url('/src/assets/background.jpg')` }}>
      
        

      <div className="w-full max-w-4xl">
        {/* Top Navbar */}
        <div className="bg-[#1a0f3d] text-white p-4 flex items-center justify-between rounded-t-lg shadow-xl">
          <div className="flex items-center space-x-3">
            <img src="/src/assets/logo.png" alt="IIUC Logo" className="h-8 w-8" />
            <h1 className="text-xl font-semibold">CodeGuard - Student Dashboard</h1>
          </div>
          <span className="text-sm">Welcome, {username}</span>
        </div>

        {/* Conditional Rendering Section */}
        {hasJoined ? (
          // View AFTER joining the room
          <ExamInstructions 
            courseName="CSE-2321 Lab Final- Data Structure"
            durationMinutes={90}
            roomId={roomId}
            username={username}
          />
        ) : (
          // View BEFORE joining the room (the form)
          <Card className="w-full rounded-t-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-gray-800 pt-8">
                Join an Exam Room To Start Exam
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-10">
              <form onSubmit={handleJoinRoom} className="w-full max-w-sm mx-auto space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="room-id" className="text-gray-700">Room ID</Label>
                  <Input 
                    id="room-id" 
                    placeholder="Enter the Room ID" 
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter the room password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white text-lg py-6 mt-4">
                  Join Room
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}