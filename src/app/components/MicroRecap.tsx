import { BookOpen, X } from "lucide-react";

interface Props {
  prompt: string;
  answer: string;
  why: string;
  onDismiss: () => void;
}

export default function MicroRecap({ prompt, answer, why, onDismiss }: Props) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
      <BookOpen className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">
          Quick recap — you missed this one
        </p>
        <p className="text-sm text-gray-700">
          <span className="text-gray-400 text-xs mr-1.5">Q</span>
          {prompt}
        </p>
        <p className="text-sm text-gray-900">
          <span className="text-gray-400 text-xs mr-1.5">A</span>
          <strong>{answer}</strong>
        </p>
        <p className="text-xs text-amber-800 leading-relaxed pt-0.5 border-t border-amber-100">
          {why}
        </p>
      </div>

      <button
        onClick={onDismiss}
        className="text-amber-300 hover:text-amber-500 transition-colors self-start mt-0.5 flex-shrink-0"
        aria-label="Dismiss recap"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
