"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Pause, Play, Loader2 } from "lucide-react";

export default function AudioBriefingButton({
  text,
  label = "Listen to AI Briefing",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  const cleanTextForSpeech = (raw: string) => {
    return raw
      .replace(/\[#?\d+\]/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^[\-•]\s*/gm, "")
      .replace(/[\#\_]/g, "")
      .trim();
  };

  const handleToggleSpeech = () => {
    if (!isSupported) {
      alert("Speech synthesis is not supported on your browser.");
      return;
    }

    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    synth.cancel(); // Stop any existing utterances

    const speechText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Try to pick a smooth English natural voice if available
    const voices = synth.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha")) && v.lang.startsWith("en")
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synth.speak(utterance);
    setIsPlaying(true);
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleToggleSpeech}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
        isPlaying
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 animate-pulse"
          : "bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 hover:border-indigo-500/30"
      } ${className}`}
      title={isPlaying ? "Stop audio briefing" : "Listen to audio briefing"}
    >
      {isPlaying ? (
        <>
          <VolumeX className="h-3.5 w-3.5 text-white" />
          <span>Stop Briefing</span>
        </>
      ) : (
        <>
          <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
