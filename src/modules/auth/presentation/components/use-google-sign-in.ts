"use client";

import { useState, useTransition } from "react";
import { signInWithGoogleAction } from "../actions";
import type { GoogleButtonStatus } from "./google-button";

/** State tombol Google + pesan pembatalan. Dipakai layar Masuk (mobile & desktop). */
export function useGoogleSignIn() {
  const [status, setStatus] = useState<GoogleButtonStatus>("idle");
  const [message, setMessage] = useState("");
  const [, startTransition] = useTransition();

  function start() {
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    startTransition(async () => {
      const result = await signInWithGoogleAction();
      if (result === "cancelled") {
        setStatus("idle");
        setMessage("Masuk dengan Google dibatalkan. Kamu bisa coba lagi kapan saja.");
      } else {
        setStatus(result);
      }
    });
  }

  return { status, message, start };
}
