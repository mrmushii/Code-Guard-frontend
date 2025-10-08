import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import Peer from "simple-peer";
import { Button } from "@/components/ui/button";
import {
  Users,
  Bell,
  HeartPulse,
  Clock,
  ScreenShare,
  Video,
} from "lucide-react";
import StudentVideo from "@/components/StudentVideo";

interface PeerState {
  peerId: string;
  peer: Peer.Instance;
  stream?: MediaStream;
}

const MonitoringDashboardPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [peers, setPeers] = useState<PeerState[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<PeerState[]>([]);

  useEffect(() => {
    if (!roomId || typeof window === "undefined") return;

    const init = async () => {
      try {
        // --- Get local media stream ---
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // --- Connect to socket ---
        socketRef.current = io("code-guard-backend-production.up.railway.app");
        socketRef.current.emit("examiner-join-room", { roomId });

        // --- Handle new student joining ---
        const handleStudentJoined = (payload: { studentId: string }) => {
          console.log(`👩‍🎓 Student ${payload.studentId} joined.`);

          if (!window.RTCPeerConnection) {
            console.error("WebRTC not supported in this environment");
            return;
          }

          // --- Create Peer with STUN/TURN ---
          const peer = new Peer({
            initiator: true, // examiner is initiator
            trickle: false,
            stream: stream, // attach local media
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

          // --- Signal handling ---
          peer.on("signal", (signalData) => {
            console.log(`📡 Sending signal to ${payload.studentId}`);
            socketRef.current?.emit("send-signal", {
              to: payload.studentId,
              signal: signalData,
            });
          });

          // --- Receive remote stream ---
          peer.on("stream", (remoteStream) => {
            console.log(`📺 Received stream from ${payload.studentId}`);
            const peerState = peersRef.current.find(
              (p) => p.peerId === payload.studentId
            );
            if (peerState) {
              peerState.stream = remoteStream;
              setPeers([...peersRef.current]);
            }
          });

          peer.on("error", (err) => console.error("Peer error:", err));

          const newPeer: PeerState = { peerId: payload.studentId, peer };
          peersRef.current.push(newPeer);
          setPeers([...peersRef.current]);
        };

        socketRef.current.on("student-joined", handleStudentJoined);

        // --- Receive signals from students ---
        const handleReceiveSignal = (payload: { signal: Peer.SignalData; from: string }) => {
          const item = peersRef.current.find((p) => p.peerId === payload.from);
          if (item && item.peer) {
            console.log(`📩 Received signal from ${payload.from}`);
            item.peer.signal(payload.signal);
          }
        };
        socketRef.current.on("receive-signal", handleReceiveSignal);

        // --- Handle student leaving ---
        const handleStudentLeft = (studentId: string) => {
          console.log(`❌ Student ${studentId} left.`);
          const item = peersRef.current.find((p) => p.peerId === studentId);
          item?.peer.destroy();
          const newPeers = peersRef.current.filter((p) => p.peerId !== studentId);
          peersRef.current = newPeers;
          setPeers(newPeers);
        };
        socketRef.current.on("student-left", handleStudentLeft);

      } catch (err) {
        console.error("Error getting media:", err);
      }
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      peersRef.current.forEach((p) => p.peer.destroy());
    };
  }, [roomId]);

  const activeStudents = peers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">
            International Islamic University Chittagong
          </h1>
          <p className="text-sm text-gray-600">
            Real-Time Proctoring Dashboard - Computer Lab Examination
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>System Active
          </span>
          <Button className="bg-green-600 hover:bg-green-700">Start Exam Session</Button>
          <Button variant="destructive">End Session</Button>
          <div className="text-right">
            <p className="font-mono text-lg">{new Date().toLocaleTimeString("en-GB")}</p>
            <p className="text-xs text-gray-500">Session Time</p>
          </div>
        </div>
      </header>

      <main className="p-6">
        <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="text-blue-500" />}
            title="Active Students"
            value={activeStudents.toString()}
            footer="+2 from last exam"
          />
          <StatCard
            icon={<Bell className="text-red-500" />}
            title="Active Alerts"
            value="3"
            footer="Requires attention"
            requiresAttention
          />
          <StatCard
            icon={<HeartPulse className="text-green-500" />}
            title="System Health"
            value="98%"
            footer="All systems operational"
          />
          <StatCard
            icon={<Clock className="text-purple-500" />}
            title="Session Duration"
            value="2h 15m"
            footer="45 minutes remaining"
          />
        </div>

        {/* Live Student Monitoring */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Live Student Monitoring</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <ScreenShare className="w-4 h-4 mr-2" />
              Full Screen View
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Video className="w-4 h-4 mr-2" />
              Project to Main Screen
            </Button>
          </div>
        </div>

        {/* Student video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {peers.map((p) =>
            p.stream ? <StudentVideo key={p.peerId} peer={p.peer} stream={p.stream} /> : null
          )}
        </div>
      </main>
    </div>
  );
};

// --- Helper Components ---
const StatCard = ({
  icon,
  title,
  value,
  footer,
  requiresAttention = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  footer: string;
  requiresAttention?: boolean;
}) => (
  <div className="bg-white p-5 rounded-lg shadow flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className={`text-xs ${requiresAttention ? "text-red-500" : "text-gray-400"}`}>
        {footer}
      </p>
    </div>
    <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
  </div>
);

export default MonitoringDashboardPage;
