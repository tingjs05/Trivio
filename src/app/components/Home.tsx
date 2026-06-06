import { useNavigate } from "react-router";
import { GraduationCap, User } from "lucide-react";
import trivioLogo from "../assets/trivio_logo.svg";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-sky-200 to-indigo-300">
      <div className="max-w-2xl w-full px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img src={trivioLogo} alt="Trivio" className="h-[300px] flex items-center justify-center text-center"/>
          </div>
          <p className="text-xl text-gray-600">
            Stay engaged in class and earn rewards by catching pulses!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate("/student")}
            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl">Student</h2>
              <p className="text-gray-600 text-center">
                Join the class and start catching pulses to earn points
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/professor")}
            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <GraduationCap className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-2xl">Professor</h2>
              <p className="text-gray-600 text-center">
                Launch pulses and track student engagement
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
