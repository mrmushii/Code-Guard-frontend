// src/components/dashboard/ExaminerDashboardContent.tsx
import  { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useNavigate } from 'react-router-dom';

interface ExaminerDashboardContentProps {
  username: string;
}

export function ExaminerDashboardContent({ username }: ExaminerDashboardContentProps) {
  const navigate = useNavigate();
  const [examName, setExamName] = useState('');
  const [examDuration, setExamDuration] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [roomId, setRoomId] = useState('IIUC-CSE2321'); 

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomPassword(result);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    
    alert(`Copied "${text}" to clipboard!`);
  };

  const handleCreateRoom = () => {
    console.log("Creating Room with details:", {
      examName,
      examDuration,
      roomPassword,
      roomId
    });
    
    alert("Room creation initiated! (Check console for details)");
    
  };

  const handleGoToMonitoringDashboard = () => {
    // Navigate to a new monitoring dashboard for this specific room
    console.log("Navigating to monitoring dashboard for room:", roomId);
    navigate(`/monitoring/${roomId}`); // Example route
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center flex justify-center items-center p-4"
         style={{ backgroundImage: `url('/src/assets/background.jpg')` }}> {/* Adjust path if needed */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Top Navbar */}
        <div className="bg-[#1a0f3d] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/src/assets/logo.png" alt="IIUC Logo" className="h-8 w-8" /> {/* Adjust path */}
            <h1 className="text-xl font-semibold">CodeGuard - Examiner Dashboard</h1>
          </div>
          <span className="text-sm">Welcome, {username}</span>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Create New Exam Session</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Exam Details Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Exam Details:</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="exam-name">Exam Name/Course Code</Label>
                  <Input 
                    id="exam-name" 
                    placeholder="e.g., CSE-301 Midterm Exam" 
                    value={examName}
                    onChange={(e) => {setExamName(e.target.value)
                      setRoomId(e.target.value)}
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="exam-duration">Exam Duration (minutes)</Label>
                  <Input 
                    id="exam-duration" 
                    type="number" 
                    placeholder="e.g., 90" 
                    value={examDuration}
                    onChange={(e) => setExamDuration(e.target.value)}
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-8 mb-4">Set Room Password</h3>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input 
                  type="password" 
                  placeholder="********" 
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                />
                <Button onClick={generateRandomPassword} variant="secondary">Generate Random</Button>
              </div>

              <Button onClick={handleCreateRoom} className="mt-8 w-full md:w-auto bg-green-700 hover:bg-green-800 text-white">
                Create Room
              </Button>
            </div>

            {/* Room Details Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Room Details:</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="room-id">Room ID</Label>
                  <div className="flex items-center space-x-2">
                    <Input id="room-id" value={roomId} readOnly />
                    <Button onClick={() => copyToClipboard(roomId)} variant="outline">Copy</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="room-password-display">Room Password</Label>
                  <div className="flex items-center space-x-2">
                    <Input id="room-password-display" type="password" value={roomPassword || '********'} readOnly />
                    <Button onClick={() => copyToClipboard(roomPassword)} variant="outline" disabled={!roomPassword}>Copy</Button>
                  </div>
                </div>
              </div>

              <Button onClick={handleGoToMonitoringDashboard} className="mt-8 w-full md:w-auto bg-[#1a0f3d] hover:bg-[#2e1d5a] text-white">
                Go To Monitoring Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}