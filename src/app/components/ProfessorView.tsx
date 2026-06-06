import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Play, Pause, Zap, Users, TrendingUp, Star, Sparkles, Gift, Gem, Crown,
  ChevronLeft, Presentation, UserCircle, LogOut, Settings, User, Copy, Check,
} from "lucide-react";
import ClassList from "./ClassList";
import TrivioTitle from "../assets/trivio_title";
import trivioLogo from "../assets/trivio_logo.svg";
import { SLIDES, ICON_META } from "./lectureData";
import type { Challenge } from "./lectureData";
import { useProfessorBroadcast } from "../hooks/useLectureBroadcast";

const ICON_COMPONENTS = [Star, Sparkles, Gift, Gem, Crown];

interface Student {
  name: string;
  points: number;
  captures: number;
  lastActive: string;
}

const FIRST_NAMES = [
  "Alex", "Sarah", "Michael", "Emma", "James", "Olivia", "William", "Sophia", "Benjamin", "Isabella",
  "Lucas", "Mia", "Henry", "Charlotte", "Alexander", "Amelia", "Daniel", "Harper", "Matthew", "Evelyn",
  "Jackson", "Abigail", "Sebastian", "Emily", "Jack", "Elizabeth", "Aiden", "Sofia", "Owen", "Avery",
  "Samuel", "Ella", "Joseph", "Madison", "Carter", "Scarlett", "Wyatt", "Victoria", "John", "Aria",
  "Luke", "Grace", "Jayden", "Chloe", "Dylan", "Camila", "Grayson", "Penelope", "Levi", "Riley",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
];

const ACTIVE_TIMES = ["Just now", "1 min ago", "2 min ago", "3 min ago", "5 min ago", "10 min ago"];

function generateMockStudents(count: number): Student[] {
  const students: Student[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const captures = Math.floor(Math.random() * 25);
    students.push({
      name: `${firstName} ${lastName}`,
      points: captures * 10 + Math.floor(Math.random() * 50),
      captures,
      lastActive: ACTIVE_TIMES[Math.floor(Math.random() * ACTIVE_TIMES.length)],
    });
  }
  return students;
}

const MOCK_STUDENTS: Student[] = generateMockStudents(200);

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

export default function ProfessorView() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedClass, setSelectedClass] = useState<{
    id: string; name: string; code: string; joinCode: string;
  } | null>(null);
  const [isLectureActive, setIsLectureActive] = useState(false);
  const [totalTrinketsLaunched, setTotalTrinketsLaunched] = useState(0);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(SLIDES[0].challenges[0]);
  const [copied, setCopied] = useState(false);

  const { broadcast } = useProfessorBroadcast();

  useEffect(() => {
    setSelectedChallenge(SLIDES[currentSlide].challenges[0]);
  }, [currentSlide]);

  useEffect(() => {
    if (!isLectureActive) return;
    const interval = setInterval(() => {
      setStudents(prev => prev.map(student => ({
        ...student,
        points: student.points + (Math.random() > 0.7 ? 10 : 0),
        captures: student.captures + (Math.random() > 0.7 ? 1 : 0),
        lastActive: Math.random() > 0.5 ? "Just now" : student.lastActive,
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, [isLectureActive]);

  const handleLaunchTrinket = () => {
    broadcast({
      type: "pulse",
      challenge: selectedChallenge,
      slideTitle: SLIDES[currentSlide].title,
      id: `${Date.now()}-${Math.random()}`,
    });
    setTotalTrinketsLaunched(prev => prev + 1);
  };

  const handlePrevSlide = () => {
    const next = Math.max(0, currentSlide - 1);
    setCurrentSlide(next);
    if (isLectureActive) broadcast({ type: "slide", index: next });
  };

  const handleNextSlide = () => {
    const next = Math.min(SLIDES.length - 1, currentSlide + 1);
    setCurrentSlide(next);
    if (isLectureActive) broadcast({ type: "slide", index: next });
  };

  const toggleLecture = () => {
    if (isLectureActive) {
      broadcast({ type: "end" });
    }
    setIsLectureActive(prev => !prev);
  };

  const handleSelectClass = (classId: string, className: string, classCode: string, joinCode: string) => {
    setSelectedClass({ id: classId, name: className, code: classCode, joinCode });
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setSelectedClass(null);
    navigate("/");
  };

  const copyJoinCode = () => {
    if (!selectedClass) return;
    navigator.clipboard.writeText(selectedClass.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const averagePoints = Math.round(students.reduce((acc, s) => acc + s.points, 0) / students.length);
  const totalCaptures = students.reduce((acc, s) => acc + s.captures, 0);

  // ─── Login ────────────────────────────────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-sky-200 to-indigo-300">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4">
          <div className="flex justify-center mb-6">
            <img src={trivioLogo} alt="Trivio" className="h-[200px]" />
          </div>
          <h2 className="text-3xl mb-6 text-center">Professor Login</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (username.trim() && password.trim()) setIsLoggedIn(true);
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

  if (!selectedClass) {
    return (
      <ClassList
        onSelectClass={handleSelectClass}
        username={username}
        onSignOut={handleSignOut}
      />
    );
  }

  // ─── Class Dashboard ──────────────────────────────────────────────────────

  const slide = SLIDES[currentSlide];

  return (
    <div className="size-full bg-gradient-to-br from-sky-200 to-indigo-300 overflow-auto">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedClass(null)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <TrivioTitle />
            <div className="w-px h-6 bg-gray-200" />
            <div>
              <p className="text-lg leading-tight">{selectedClass.name}</p>
              <p className="text-sm text-gray-500">{selectedClass.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLecture}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors ${
                isLectureActive
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isLectureActive ? (
                <><Pause className="w-4 h-4" />End Lecture</>
              ) : (
                <><Play className="w-4 h-4" />Start Lecture</>
              )}
            </button>
            <ProfileMenu name={username} onSignOut={handleSignOut} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">Active Students</h3>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">Average Points</h3>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl">{averagePoints}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">Total Captures</h3>
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl">{totalCaptures}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Join code banner — Kahoot-style, always visible */}
            <div className="bg-indigo-900 text-white rounded-xl px-6 py-4 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-indigo-300 text-xs mb-1 uppercase tracking-wide">
                  Students join with this code
                </p>
                <p className="text-4xl font-mono tracking-[0.25em] text-white">
                  {selectedClass.joinCode}
                </p>
              </div>
              <button
                onClick={copyJoinCode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-indigo-700 hover:bg-indigo-600 text-indigo-100"
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Slides */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl flex items-center gap-2">
                  <Presentation className="w-6 h-6 text-indigo-600" />
                  Lecture Slides
                </h2>
                <br/>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlide === 0}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-gray-600">{currentSlide + 1} / {SLIDES.length}</span>
                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlide === SLIDES.length - 1}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next →
                  </button>
                </div>
              </div>
              <div
                className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white p-8"
                style={{ aspectRatio: "16/9" }}
              >
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <h3 className="text-3xl">{slide.title}</h3>
                  <div className="text-left space-y-2 max-w-2xl mx-auto text-lg">
                    {slide.content.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Launch pulse */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl mb-1">Launch a Pulse</h2>
              <p className="text-sm text-gray-500 mb-4">
                Select a challenge for <strong>{slide.title}</strong> and send it to students.
              </p>

              <div className="space-y-3 mb-5">
                {slide.challenges.map((challenge, idx) => {
                  const IconComp = ICON_COMPONENTS[challenge.icon % ICON_COMPONENTS.length];
                  const iconColor = ICON_META[challenge.icon % ICON_META.length].color;
                  const isSelected = selectedChallenge === challenge;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedChallenge(challenge)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                          <IconComp className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wide">
                            {challenge.type === "question" ? "Question" : "Keyword"}
                          </p>
                          <p className="text-sm text-gray-800 mb-1">{challenge.prompt}</p>
                          <p className="text-xs text-green-700">
                            <span className="text-gray-400">Answer: </span>{challenge.answer}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{challenge.why}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleLaunchTrinket}
                disabled={!isLectureActive}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Send Pulse to Students
              </button>
              {!isLectureActive && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Start the lecture first to send pulses
                </p>
              )}
              <div className="mt-3 px-4 py-2.5 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="text-gray-400">Pulses sent this session: </span>
                  <strong>{totalTrinketsLaunched}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl mb-4">Student Leaderboard ({students.length})</h2>
            <div className="space-y-2 max-h-[1100px] overflow-y-auto pr-2">
              {students
                .slice()
                .sort((a, b) => b.points - a.points)
                .map((student, idx) => (
                  <div
                    key={`${student.name}-${idx}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                        idx === 0 ? "bg-yellow-100 text-yellow-700" :
                        idx === 1 ? "bg-gray-200 text-gray-700" :
                        idx === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm truncate">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.captures} captures · {student.lastActive}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-indigo-600">{student.points}</p>
                      <p className="text-xs text-gray-400">pts</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
