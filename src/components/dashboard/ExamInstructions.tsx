// src/components/dashboard/ExamInstructions.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonitorPlay } from "lucide-react";
import io, { Socket } from "socket.io-client";
import Peer from "simple-peer";

interface ExamInstructionsProps {
  courseName: string;
  durationMinutes: number;
  roomId: string;
  username: string;
}

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export function ExamInstructions({
  courseName,
  durationMinutes,
  roomId,
}: ExamInstructionsProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [examStarted, setExamStarted] = useState(false);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!isSharing || timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [isSharing, timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Cleaning up connections...");
      peerRef.current?.destroy();
      socketRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startExam = async () => {
    if (!roomId) return;
    setIsSharing(true);

    try {
      // ✅ Get student's screen share
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // set true if mic audio is needed
      });
      streamRef.current = stream;

      console.log("🎥 Student got stream:", stream);
      stream.getTracks().forEach((track) =>
        console.log("   Track:", track.kind, "state:", track.readyState)
      );

      // Preview in student's own window
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }

      setExamStarted(true);

      // ✅ Connect to signaling server
      socketRef.current = io("code-guard-backend-production.up.railway.app");
      socketRef.current.emit("student-join-room", roomId);

      // ✅ Handle examiner signal
      socketRef.current.on(
        "receive-signal",
        (payload: { signal: Peer.SignalData; from: string }) => {
          console.log("📩 Student received signal from examiner:", payload);

          // Only create peer once
          if (!peerRef.current) {
            const peer = new Peer({
              initiator: false, // student is not initiator
              trickle: true,    // allow incremental ICE candidates
              stream: streamRef.current!, // attach local display stream
              config: {
                iceServers: [
                  { urls: "stun:stun.l.google.com:19302" },
                  { urls: "stun:stun1.l.google.com:19302" },
                  {
                    urls: "turn:relay1.expressturn.com:3478",
                    username: "efhH6ACzq2nlK4m7",
                    credential: "7iB1xZKibd9xJwEt",
                  },
                ],
              },
            });

            // Send back signal to examiner
            peer.on("signal", (signalData) => {
              console.log("📤 Student sending signal back:", signalData);
              socketRef.current?.emit("send-signal", {
                signal: signalData,
                to: payload.from,
              });
            });

            // Log ICE connection states for debugging
            peer.on("iceConnectionStateChange", () => {
              console.log(
                "ICE state on student side:",
                (peer as any)._pc.iceConnectionState
              );
            });

            peer.on("iceCandidate", (candidate) => {
              console.log("ICE candidate on student side:", candidate);
            });

            peer.on("error", (err) => {
              console.error("Peer error on student side:", err);
            });

            peerRef.current = peer;
          }

          // Always feed new signals to the peer
          peerRef.current.signal(payload.signal);
        }
      );
    } catch (err: any) {
      console.error("❌ Error accessing display media:", err);
      alert(
        "Screen sharing is required. Please allow and try again. " + err.message
      );
      setExamStarted(false);
    }
  };

  return (
    <Card className="w-full rounded-t-none shadow-xl">
      <CardHeader className="relative pt-10">
        <CardTitle className="text-center text-3xl font-bold text-gray-800">
          {courseName}
        </CardTitle>
        <div className="absolute top-4 right-6 text-right">
          <p className="text-sm font-medium text-gray-600">Time Remaining:</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatTime(timeLeft)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-10 pb-10">
        <div className="max-w-xl mx-auto space-y-8">
          <ol className="list-decimal list-inside space-y-3 text-lg text-gray-700">
            <li>Ensure your coding environment (eg. VS Code) is open.</li>
            <li>Click 'Start Exam' to begin sharing your entire screen.</li>
            <li>Do not close the browser window or navigate away.</li>
            <li>A countdown timer is visible on the examiner's screen.</li>
          </ol>
          <div className="flex justify-center items-center space-x-4 pt-4">
            {!examStarted && (
              <Button
                onClick={startExam}
                disabled={isSharing}
                className="bg-[#1a0f3d] hover:bg-[#2e1d5a] text-white px-8 py-6 text-lg"
              >
                Start Exam & Share Screen
              </Button>
            )}
            <Button
              variant="outline"
              disabled
              className={`px-8 py-6 text-lg ${
                isSharing
                  ? "border-green-600 text-green-700 bg-green-50"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              <MonitorPlay className="mr-2 h-5 w-5" />
              Monitoring {isSharing ? "Active" : "Inactive"}
            </Button>
          </div>
        </div>

        <video
          ref={userVideoRef}
          autoPlay
          muted
          playsInline
          style={{ display: "block", width: "100%", marginTop: "20px" }}
        />
      </CardContent>
    </Card>
  );
}
