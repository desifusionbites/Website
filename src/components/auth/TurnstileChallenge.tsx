'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef } from 'react';

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
      theme: 'auto';
    }
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileChallengeProps = {
  siteKey: string;
  onTokenChange: (token: string | null) => void;
  resetSignal: number;
};

export function TurnstileChallenge({
  siteKey,
  onTokenChange,
  resetSignal,
}: TurnstileChallengeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenChangeRef = useRef(onTokenChange);
  const previousResetSignalRef = useRef(resetSignal);

  useEffect(() => {
    tokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'auto',
      callback: (token) => tokenChangeRef.current(token),
      'expired-callback': () => tokenChangeRef.current(null),
      'error-callback': () => tokenChangeRef.current(null),
    });
  }, [siteKey]);

  useEffect(() => {
    renderWidget();

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [renderWidget]);

  useEffect(() => {
    if (previousResetSignalRef.current === resetSignal) {
      return;
    }

    previousResetSignalRef.current = resetSignal;
    tokenChangeRef.current(null);
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div
        ref={containerRef}
        className="min-h-[65px] flex justify-center"
        aria-label="Security verification"
      />
    </>
  );
}
