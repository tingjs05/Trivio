export interface Challenge {
  type: "question" | "keyword";
  prompt: string;
  answer: string;
  why: string;
  icon: number;
}

export interface Slide {
  title: string;
  content: string[];
  challenges: Challenge[];
}

// Icon index → display color. The actual Icon components are imported from
// lucide-react wherever they're rendered to keep this file dependency-free.
export const ICON_META = [
  { color: "text-yellow-500" },
  { color: "text-purple-500" },
  { color: "text-red-500" },
  { color: "text-cyan-500" },
  { color: "text-amber-500" },
];

export const SLIDES: Slide[] = [
  {
    title: "Introduction to React Hooks",
    content: [
      "• useState — manage component state",
      "• useEffect — run side effects after render",
      "• useContext — access shared context values",
      "• useRef — reference DOM elements",
      "• useMemo — cache expensive calculations",
    ],
    challenges: [
      {
        type: "question",
        prompt: "Which hook is used to manage local component state?",
        answer: "usestate",
        why: "useState is the foundation of interactive React UIs — without it, components cannot respond to user actions or changing data.",
        icon: 0,
      },
      {
        type: "keyword",
        prompt: "Type the hook used to run side effects after render:",
        answer: "useeffect",
        why: "useEffect is how React connects to the world outside the render cycle — API calls, subscriptions, and DOM mutations all belong here.",
        icon: 1,
      },
    ],
  },
  {
    title: "Understanding useState",
    content: [
      "• Declares a state variable in a function component",
      "• Returns [currentState, setterFunction] as a pair",
      "• Can be initialized with any data type",
      "• Calling the setter triggers a re-render",
      "• Best for simple, local, component-scoped state",
    ],
    challenges: [
      {
        type: "question",
        prompt: "What two things does useState return?",
        answer: "state and setter",
        why: "The two-value return separates reading state from writing it — this pattern makes data flow predictable and easy to trace.",
        icon: 2,
      },
      {
        type: "question",
        prompt: "What happens when you call the setter function from useState?",
        answer: "re-render",
        why: "React's entire model relies on re-rendering when state changes — understanding this prevents both missed updates and unnecessary renders.",
        icon: 3,
      },
    ],
  },
  {
    title: "Working with useEffect",
    content: [
      "• Runs after the component renders",
      "• Dependency array controls when it re-runs",
      "• Empty array [ ] → runs once on mount only",
      "• No array → runs after every single render",
      "• Return a cleanup function for subscriptions",
    ],
    challenges: [
      {
        type: "question",
        prompt: "What controls how often useEffect re-runs?",
        answer: "dependency array",
        why: "A missing or incorrect dependency array is the most common source of bugs with useEffect — infinite loops, stale data, and missed updates all trace back to this.",
        icon: 4,
      },
      {
        type: "keyword",
        prompt: "What should useEffect return when it sets up a subscription or listener?",
        answer: "cleanup function",
        why: "Without a cleanup function, subscriptions and listeners accumulate across re-renders, causing memory leaks and duplicate event handlers.",
        icon: 0,
      },
    ],
  },
];
