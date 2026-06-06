import { useState, useEffect, useRef } from "react";
import { Users, Calendar, BookOpen, UserCircle, User, Settings, LogOut } from "lucide-react";
import TrivioTitle from "../assets/trivio_title";

interface ClassData {
  id: string;
  name: string;
  code: string;
  joinCode: string;
  studentCount: number;
  schedule: string;
  color: string;
}

const MOCK_CLASSES: ClassData[] = [
  {
    id: "1",
    name: "Introduction to Computer Science",
    code: "CS 101",
    joinCode: "12345678",
    studentCount: 245,
    schedule: "MWF 10:00-11:00 AM",
    color: "bg-blue-500"
  },
  {
    id: "2",
    name: "Data Structures & Algorithms",
    code: "CS 201",
    joinCode: "87654321",
    studentCount: 180,
    schedule: "TTh 2:00-3:30 PM",
    color: "bg-green-500"
  },
  {
    id: "3",
    name: "Web Development",
    code: "CS 305",
    joinCode: "11223344",
    studentCount: 156,
    schedule: "MWF 1:00-2:00 PM",
    color: "bg-purple-500"
  },
  {
    id: "4",
    name: "Machine Learning",
    code: "CS 450",
    joinCode: "99887766",
    studentCount: 98,
    schedule: "TTh 10:00-11:30 AM",
    color: "bg-orange-500"
  },
  {
    id: "5",
    name: "Design & Innovation",
    code: "UDE 2222",
    joinCode: "55443322",
    studentCount: 42,
    schedule: "TTh 02:00-05:00 PM",
    color: "bg-pink-500"
  },
];

interface ClassListProps {
  onSelectClass: (classId: string, className: string, classCode: string, joinCode: string) => void;
  username: string;
  onSignOut: () => void;
}

function ProfileMenu({
  name,
  onSignOut,
}: {
  name: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

export default function ClassList({
  onSelectClass,
  username,
  onSignOut,
}: ClassListProps) {
  return (
    <div className="size-full bg-gradient-to-br from-sky-200 to-indigo-300 overflow-auto">

      <div className="size-full bg-gradient-to-br from-sky-200 to-indigo-300">
        <div className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TrivioTitle/>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-3xl">My Classes</div>
              <ProfileMenu name={username} onSignOut={onSignOut} />
            </div>
          </div>
      </div>


        <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-6">
          {MOCK_CLASSES.map((classData) => (
            <button
              key={classData.id}
              onClick={() => onSelectClass(classData.id, classData.name, classData.code, classData.joinCode)}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-16 h-16 rounded-lg ${classData.color} flex items-center justify-center flex-shrink-0`}
                >
                  <BookOpen className="w-8 h-8 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl mb-1 truncate">
                    {classData.name}
                  </h2>

                  <p className="text-gray-500 mb-3">
                    {classData.code}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{classData.studentCount} students</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{classData.schedule}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
