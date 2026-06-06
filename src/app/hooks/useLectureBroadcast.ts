import { useEffect, useRef, useCallback } from "react";
import type { Challenge } from "../components/lectureData";

export interface PulseMessage {
  type: "pulse";
  challenge: Challenge;
  slideTitle: string;
  id: string;
}

export interface SlideMessage {
  type: "slide";
  index: number;
}

export interface EndMessage {
  type: "end";
}

export type LectureMessage = PulseMessage | SlideMessage | EndMessage;

export function useProfessorBroadcast() {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("trivio_lecture");
    return () => channelRef.current?.close();
  }, []);

  const broadcast = useCallback((msg: LectureMessage) => {
    channelRef.current?.postMessage(msg);
  }, []);

  return { broadcast };
}

export function useStudentReceiver(onMessage: (msg: LectureMessage) => void) {
  // Keep a ref so the effect closure never goes stale
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; });

  useEffect(() => {
    const channel = new BroadcastChannel("trivio_lecture");
    channel.onmessage = (e: MessageEvent) => {
      const msg = e.data as LectureMessage;
      if (msg?.type === "pulse" || msg?.type === "slide" || msg?.type === "end") {
        onMessageRef.current(msg);
      }
    };
    return () => channel.close();
  }, []);
}
