"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DiwaliAudio, type Sfx } from "@/lib/diwaliAudio";

export function useDiwaliAudio() {
  const audioRef = useRef<DiwaliAudio | null>(null);
  const enabledRef = useRef(false);
  const mutedRef = useRef(false);
  const [enabled, setEnabled] = useState(false);

  const start = useCallback(() => {
    if (mutedRef.current) return;

    if (enabledRef.current) {
      audioRef.current?.play("chime");
      return;
    }

    enabledRef.current = true;
    setEnabled(true);

    if (!audioRef.current) audioRef.current = new DiwaliAudio();
    const audio = audioRef.current;
    void audio.enable().then(() => {
      audio.play("chime");
    });
  }, []);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    mutedRef.current = !next;
    enabledRef.current = next;
    setEnabled(next);

    if (next) {
      if (!audioRef.current) audioRef.current = new DiwaliAudio();
      const audio = audioRef.current;
      void audio.enable().then(() => {
        audio.play("chime");
      });
    } else {
      audioRef.current?.disable();
    }
  }, []);

  const play = useCallback((sfx: Sfx) => {
    if (enabledRef.current) {
      audioRef.current?.play(sfx);
    }
  }, []);

  useEffect(
    () => () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    },
    [],
  );

  return { enabled, toggle, start, play };
}
