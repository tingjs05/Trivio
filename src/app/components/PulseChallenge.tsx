import { useState, useEffect, useRef } from "react";
import { Star, Sparkles, Gift, Gem, Crown, Send } from "lucide-react";
import type { Challenge } from "./lectureData";
import { ICON_META } from "./lectureData";

const ICON_COMPONENTS = [Star, Sparkles, Gift, Gem, Crown];

interface Props {
  challenge: Challenge;
  duration?: number;
  onCapture: () => void;
  onExpire: () => void;
}

export default function PulseChallenge({ challenge, duration = 15000, onCapture, onExpire }: Props) {
  const [input, setInput] = useState("");
  const [progress, setProgress] = useState(100);
  const [showError, setShowError] = useState(false);
  const doneRef = useRef(false);
  const onCaptureRef = useRef(onCapture);
  const onExpireRef = useRef(onExpire);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep callback refs current without re-triggering the countdown effect
  useEffect(() => { onCaptureRef.current = onCapture; });
  useEffect(() => { onExpireRef.current = onExpire; });

  useEffect(() => {
    inputRef.current?.focus();
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 1 - elapsed / duration);
      setProgress(remaining * 100);
      if (remaining <= 0 && !doneRef.current) {
        doneRef.current = true;
        clearInterval(tick);
        onExpireRef.current();
      }
    }, 50);
    return () => clearInterval(tick);
  }, [duration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (doneRef.current) return;
    const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");
    // Allow "Answer" as a correct answer for this demo
    if (norm(input) === norm(challenge.answer) || norm(input) === norm("Answer")) {
      doneRef.current = true;
      onCaptureRef.current();
    } else {
      setShowError(true);
      setInput("");
      setTimeout(() => setShowError(false), 1500);
    }
  };

  const IconComp = ICON_COMPONENTS[challenge.icon % ICON_COMPONENTS.length];
  const iconColor = ICON_META[challenge.icon % ICON_META.length].color;

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden z-50">
      {/* Countdown bar — thin and unobtrusive at the top */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-indigo-400"
          style={{ width: `${progress}%`, transition: "width 0.05s linear" }}
        />
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <IconComp className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
          <p className="text-sm text-gray-800 leading-snug">{challenge.prompt}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your answer…"
            className={`flex-1 text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              showError
                ? "border-red-300 ring-2 ring-red-100 bg-red-50"
                : "border-gray-200 focus:ring-indigo-200"
            }`}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {showError && (
          <p className="text-xs text-red-500">Not quite — give it another try</p>
        )}
      </div>
    </div>
  );
}
