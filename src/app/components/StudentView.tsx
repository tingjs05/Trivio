import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Trophy, Star, Sparkles, Gift, Gem, Crown, Presentation, 
  UserCircle, ShoppingBag, BookOpen, Hash, LogOut, Settings, User, ChevronLeft,
} from "lucide-react";
import confetti from "canvas-confetti";
import TrivioTitle from "../assets/trivio_title";
import trivioLogo from "../assets/trivio_logo.svg";
import PulseChallenge from "./PulseChallenge";
import MicroRecap from "./MicroRecap";
import { useStudentReceiver } from "../hooks/useLectureBroadcast";
import type { LectureMessage } from "../hooks/useLectureBroadcast";
import { SLIDES, ICON_META } from "./lectureData";
import type { Challenge } from "./lectureData";

const ICON_COMPONENTS = [Star, Sparkles, Gift, Gem, Crown];

// Maps 8-digit join codes to class display names
const CLASS_NAME_BY_CODE: Record<string, string> = {
  "12345678": "Introduction to Computer Science",
  "87654321": "Data Structures & Algorithms",
  "11223344": "Web Development",
  "99887766": "Machine Learning",
  "55443322": "Design & Innovation",
};

interface MissedRecap {
  prompt: string;
  answer: string;
  why: string;
  timestamp: number;
}

const SHOP_ITEMS = [
  { id: 1, name: "Homework Pass", description: "Skip one homework assignment", cost: 100, icon: "📝" },
  { id: 2, name: "Extra Credit", description: "+5% on your next quiz", cost: 75, icon: "⭐" },
  { id: 3, name: "Custom Avatar", description: "Unlock a unique avatar", cost: 50, icon: "🎨" },
  { id: 4, name: "Points Boost", description: "2x points for 10 minutes", cost: 30, icon: "⚡" },
  { id: 5, name: "Seat Upgrade", description: "Choose your seat for a week", cost: 150, icon: "💺" },
  { id: 6, name: "Late Pass", description: "Be 10 minutes late once", cost: 80, icon: "⏰" },
];

const RECENT_CLASSES = [
  { id: "CS101", name: "Introduction to Computer Science", code: "12345678", lastJoined: "Today", pointsEarned: 40 },
  { id: "MATH202", name: "Data Structures & Algorithms", code: "87654321", lastJoined: "Yesterday", pointsEarned: 20 },
  { id: "ENG301", name: "Web Development", code: "11223344", lastJoined: "2 days ago", pointsEarned: 30 },
];

function ProfileMenu({ name, onSignOut }: { name: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-sky-100 transition-colors"
      >
        <UserCircle className="w-8 h-8 text-indigo-600" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-indigo-50">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="truncate text-indigo-700">{name}</p>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">Account Details</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">Settings</span>
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="text-red-500">Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function StudentView() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const [view, setView] = useState<"dashboard" | "shop" | "inClass" | "recap">("dashboard");
  const [classCode, setClassCode] = useState("");
  const [className, setClassName] = useState("");
  const [classCodeInput, setClassCodeInput] = useState("");
  const [classCodeError, setClassCodeError] = useState("");
  const [points, setPoints] = useState(120);
  const [activeTrinket, setActiveTrinket] = useState<Challenge | null>(null);
  const [capturedTrinkets, setCapturedTrinkets] = useState<number[]>([]);
  const [redeemedItems, setRedeemedItems] = useState<number[]>([]);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [sessionCaptures, setSessionCaptures] = useState(0);
  const [missedRecaps, setMissedRecaps] = useState<MissedRecap[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; });

  const activeTrinketRef = useRef<Challenge | null>(null);
  useEffect(() => { activeTrinketRef.current = activeTrinket; });

  const handleBroadcastMessage = useCallback((msg: LectureMessage) => {
    if (msg.type === "pulse") {
      if (viewRef.current !== "inClass") return;
      setActiveTrinket(prev => prev !== null ? prev : msg.challenge);
    } else if (msg.type === "slide") {
      setCurrentSlide(msg.index);
    } else if (msg.type === "end") {
      if (viewRef.current !== "inClass") return;
      // Treat any active pulse as missed when the lecture ends
      const current = activeTrinketRef.current;
      if (current) {
        setMissedRecaps(prev => [
          { prompt: current.prompt, answer: current.answer, why: current.why, timestamp: Date.now() },
          ...prev,
        ]);
        setActiveTrinket(null);
      }
      setView("recap");
    }
  }, []);

  useStudentReceiver(handleBroadcastMessage);

  const handleCapture = useCallback(() => {
    const current = activeTrinketRef.current;
    if (!current) return;
    const earned = 10;
    setPoints(p => p + earned);
    setSessionPoints(p => p + earned);
    setSessionCaptures(c => c + 1);
    setCapturedTrinkets(prev => [...prev, current.icon]);
    setActiveTrinket(null);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
  }, []);

  const handleExpire = useCallback(() => {
    const current = activeTrinketRef.current;
    if (!current) return;
    // Prepend so index 0 is always the most recent
    setMissedRecaps(prev => [
      { prompt: current.prompt, answer: current.answer, why: current.why, timestamp: Date.now() },
      ...prev,
    ]);
    setActiveTrinket(null);
  }, []);

  const dismissRecap = (idx: number) => {
    setMissedRecaps(prev => prev.filter((_, i) => i !== idx));
  };

  const enterClass = (code: string, name: string) => {
    setClassCode(code);
    setClassName(name);
    setSessionPoints(0);
    setSessionCaptures(0);
    setCapturedTrinkets([]);
    setMissedRecaps([]);
    setActiveTrinket(null);
    setCurrentSlide(0);
    setView("inClass");
  };

  const handleJoinClass = () => {
    if (!/^\d{8}$/.test(classCodeInput)) {
      setClassCodeError("Please enter a valid 8-digit numerical code.");
      return;
    }
    setClassCodeError("");
    const name = CLASS_NAME_BY_CODE[classCodeInput] ?? "Live Class";
    enterClass(classCodeInput, name);
    setClassCodeInput("");
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setStudentName("");
    setUsername("");
    setPassword("");
    setView("dashboard");
    setClassCode("");
    setClassCodeInput("");
    navigate("/");
  };

  // ─── Login ────────────────────────────────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-sky-200 to-indigo-300">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4">
          <div className="flex justify-center mb-6">
            <img src={trivioLogo} alt="Trivio" className="h-[200px]" />
          </div>
          <h2 className="text-3xl mb-6 text-center">Student Login</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (username.trim() && password.trim()) {
                setStudentName(username);
                setIsLoggedIn(true);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block mb-2 text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <button
              type="submit"
              disabled={!username.trim() || !password.trim()}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full text-gray-500 hover:text-gray-700 py-2 transition-colors text-sm"
            >
              ← Back to Home
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  if (view === "dashboard") {
    return (
      <div className="size-full bg-gradient-to-br from-sky-200 to-indigo-300 overflow-auto">
        <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <TrivioTitle />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("shop")}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop
              </button>
              <ProfileMenu name={studentName} onSignOut={handleSignOut} />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl text-indigo-700">Welcome back, {studentName}!</h1>
              <p className="text-gray-500 mt-1">Ready to earn more points today?</p>
            </div>
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-3xl text-yellow-600">{points}</p>
                <p className="text-sm text-gray-500">Total Points</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-indigo-500" />
              Join a Class
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                maxLength={8}
                value={classCodeInput}
                onChange={e => {
                  setClassCodeInput(e.target.value.replace(/\D/g, "").slice(0, 8));
                  setClassCodeError("");
                }}
                placeholder="Enter 8-digit class code"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 text-lg tracking-widest"
              />
              <button
                onClick={handleJoinClass}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                Join Class
              </button>
            </div>
            {classCodeError && (
              <p className="text-red-500 text-sm mt-2">{classCodeError}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Recent Classes
            </h2>
            <div className="space-y-3">
              {RECENT_CLASSES.map(cls => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-sky-50 transition-colors"
                >
                  <div>
                    <p className="text-gray-800">{cls.name}</p>
                    <p className="text-sm text-gray-500">Code: {cls.code} · {cls.lastJoined}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-600 text-sm">+{cls.pointsEarned} pts earned</p>
                    <button
                      onClick={() => enterClass(cls.code, cls.name)}
                      className="text-sm text-sky-600 hover:text-sky-800 transition-colors"
                    >
                      Rejoin →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Shop ─────────────────────────────────────────────────────────────────

  if (view === "shop") {
    return (
      <div className="size-full bg-gradient-to-br from-sky-200 to-indigo-300 overflow-auto">
        <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("dashboard")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <TrivioTitle />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-700 text-sm">{points} pts</span>
              </div>
              <ProfileMenu name={studentName} onSignOut={handleSignOut} />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-3xl text-indigo-800 mb-2">Rewards Shop</h1>
          <p className="text-gray-600 mb-8">Spend your hard-earned points on great rewards!</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SHOP_ITEMS.map(item => {
              const redeemed = redeemedItems.includes(item.id);
              const canAfford = points >= item.cost;
              return (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg flex flex-col gap-3">
                  <div className="text-4xl">{item.icon}</div>
                  <div>
                    <h3 className="text-lg text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="flex items-center gap-1 text-yellow-600 text-sm">
                      <Trophy className="w-4 h-4" />
                      {item.cost} pts
                    </span>
                    <button
                      disabled={!canAfford || redeemed}
                      onClick={() => {
                        setPoints(p => p - item.cost);
                        setRedeemedItems(prev => [...prev, item.id]);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        redeemed
                          ? "bg-green-100 text-green-600 cursor-default"
                          : canAfford
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {redeemed ? "Redeemed ✓" : canAfford ? "Redeem" : "Not enough pts"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── End-of-Lecture Recap Page ────────────────────────────────────────────

  if (view === "recap") {
    const totalPulses = sessionCaptures + missedRecaps.length;
    return (
      <div className="size-full bg-gradient-to-br from-sky-200 to-indigo-300 overflow-auto">
        <div className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
            <TrivioTitle />
            <button
              onClick={() => setView("dashboard")}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Back to Dashboard →
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
          {/* Heading */}
          <div>
            <h1 className="text-3xl text-indigo-800">Lecture Complete</h1>
            <p className="text-gray-500 mt-1">{className || "Live Class"}</p>
          </div>

          {/* Session stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-lg text-center">
              <p className="text-3xl text-indigo-700">{totalPulses}</p>
              <p className="text-sm text-gray-500 mt-1">Pulses received</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-lg text-center">
              <p className="text-3xl text-green-600">{sessionCaptures}</p>
              <p className="text-sm text-gray-500 mt-1">Captured</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-lg text-center">
              <p className="text-3xl text-amber-600">{missedRecaps.length}</p>
              <p className="text-sm text-gray-500 mt-1">Missed</p>
            </div>
          </div>

          {/* Missed questions or success message */}
          {missedRecaps.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-lg text-center space-y-2">
              <p className="text-2xl">🎉</p>
              <p className="text-lg text-indigo-700">You answered every pulse this session!</p>
              <p className="text-sm text-gray-500">Great focus — nothing to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl text-gray-800">Review — Missed Questions</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Go through these before the next class to fill in any gaps.
                </p>
              </div>
              <div className="space-y-3">
                {missedRecaps.map((r, idx) => (
                  <MicroRecap
                    key={r.timestamp}
                    prompt={r.prompt}
                    answer={r.answer}
                    why={r.why}
                    onDismiss={() => dismissRecap(idx)}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setView("dashboard")}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── In Class ─────────────────────────────────────────────────────────────

  const slide = SLIDES[currentSlide] ?? SLIDES[0];

  return (
    <div className="size-full bg-gradient-to-br from-sky-200 to-indigo-300">
      {/* Header — matches professor view structure */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TrivioTitle />
            <div className="w-px h-6 bg-gray-200" />
            <div>
              <p className="text-lg leading-tight">{className || "Live Class"}</p>
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <p className="text-sm text-gray-500 font-mono tracking-widest">{classCode}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-lg">{points} pts</span>
            </div>
            <button
              onClick={() => setView("dashboard")}
              className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Leave Class
            </button>
            <ProfileMenu name={studentName} onSignOut={handleSignOut} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-6">

        {/* Left: slide + stacked recaps */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-xl flex items-center gap-2">
              <Presentation className="w-6 h-6 text-indigo-600" />
              Lecture Slides
            </h2>
            <br/>
            <div
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white p-6"
              style={{ aspectRatio: "16/9" }}
            >
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <h3 className="text-2xl lg:text-3xl">{slide.title}</h3>
                <div className="text-left space-y-1.5 max-w-xl mx-auto text-sm lg:text-base">
                  {slide.content.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stacked missed recaps — most recent at top, scrollable */}
          {missedRecaps.length > 0 && (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {missedRecaps.map((r, idx) => (
                <MicroRecap
                  key={r.timestamp}
                  prompt={r.prompt}
                  answer={r.answer}
                  why={r.why}
                  onDismiss={() => dismissRecap(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: personal progress */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Your Session
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-cyan-500" />
                  <span className="text-gray-700 text-sm">Captures</span>
                </div>
                <span className="text-2xl text-indigo-700">{sessionCaptures}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-700 text-sm">Points earned</span>
                </div>
                <span className="text-2xl text-yellow-600">+{sessionPoints}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 text-sm">Total points</span>
                <span className="text-gray-700">{points}</span>
              </div>
            </div>
          </div>

          {capturedTrinkets.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h3 className="mb-3 text-gray-700 text-sm">Recent Captures</h3>
              <div className="flex gap-2 flex-wrap">
                {capturedTrinkets.slice(-6).reverse().map((iconIdx, i) => {
                  const IconComp = ICON_COMPONENTS[iconIdx % ICON_COMPONENTS.length];
                  const color = ICON_META[iconIdx % ICON_META.length].color;
                  return (
                    <div key={i} className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg">
                      <IconComp className={`w-4 h-4 ${color}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pulse challenge — fixed corner, never blocks the slide */}
      {activeTrinket && (
        <PulseChallenge
          challenge={activeTrinket}
          onCapture={handleCapture}
          onExpire={handleExpire}
        />
      )}
    </div>
  );
}
