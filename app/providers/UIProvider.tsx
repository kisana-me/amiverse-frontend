"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type UserTheme = "light" | "dark" | "system";
type EffectiveTheme = "light" | "dark";
type FontSize = "small" | "medium" | "large";

type UIContextType = {
  userTheme: UserTheme;
  setUserTheme: (value: UserTheme) => void;

  effectiveTheme: EffectiveTheme;

  hue: number;
  setHue: (value: number) => void;

  fontSize: FontSize;
  setFontSize: (value: FontSize) => void;
};

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  // -------------------------
  // ユーザーの設定（永続化）
  // -------------------------
  const [userTheme, setUserTheme] = useState<UserTheme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("userTheme") as UserTheme) || "system";
  });

  const [hue, setHue] = useState<number>(() => {
    if (typeof window === "undefined") return 200;
    return Number(localStorage.getItem("themeHue")) || 200;
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    if (typeof window === "undefined") return "medium";
    return (localStorage.getItem("fontSize") as FontSize) || "medium";
  });

  // -------------------------
  // OS のテーマ（system 用）
  // -------------------------
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // system 設定が変わったら追従
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);

    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  // -------------------------
  // 最終的に使う effectiveTheme
  // -------------------------
  const effectiveTheme: EffectiveTheme =
    userTheme === "system"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : userTheme;

  // -------------------------
  // 永続化（localStorage）
  // -------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("userTheme", userTheme);
  }, [userTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("themeHue", String(hue));
  }, [hue]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  // -------------------------
  // CSS Variables を注入
  // -------------------------
  
  const lightThremeGlobalStyles = `
    :root {
      --background-color: #ffffff;
      --font-color: #000000;
      --link-color: #46be1b;
      --border-color: #acacac;
      --transparent-background-color: #0000003f;
      --content-color: #ffffff;
      --shadow-color: #808080;
      --blur-color: #ffffff88;
      --primary-color: #0000ff;
      --button-color: #000000;
      --button-font-color: #ffffff;
      --hover-color: #b5b5b588;
      --inconspicuous-font-color: #6b6b6b;
      --inconspicuous-background-color: #d8d8d8;
    }
  `

  const  darkThremeGlobalStyles = `
    :root {
      --background-color: #000000;
      --font-color: #ffffff;
      --link-color: #6ef744;
      --border-color: #7c7c7c;
      --transparent-background-color: #00000060;
      --content-color: #141414;
      --shadow-color: #808080;
      --blur-color: #00000088;
      --primary-color: #0000df;
      --button-color: #ffffff;
      --button-font-color: #000000;
      --hover-color: #ffffff88;
      --inconspicuous-font-color: #bcbcbc;
      --inconspicuous-background-color: #444444;
    }
  `

  const globalStyles = `
    :root {
      --primary-hue: ${hue};
      --font-size-base: ${
        fontSize === "small"
          ? "14px"
          : fontSize === "large"
          ? "18px"
          : "16px"
      };

      /* Light Theme */
      --background-light: #ffffff;
      --text-light: #000000;

      /* Dark Theme */
      --background-dark: #000000;
      --text-dark: #ffffff;
    }

    body {
      background-color: var(--background-${effectiveTheme});
      color: var(--text-${effectiveTheme});
      font-size: var(--font-size-base);
    }
  `;

  const value: UIContextType = {
    userTheme,
    setUserTheme,

    effectiveTheme,

    hue,
    setHue,

    fontSize,
    setFontSize,
  };

  return (
    <UIContext.Provider value={value}>
      <style>{globalStyles + (effectiveTheme === "light" ? lightThremeGlobalStyles : darkThremeGlobalStyles)}</style>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used inside UIProvider");
  return context;
};
