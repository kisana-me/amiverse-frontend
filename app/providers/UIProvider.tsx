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
  toggleTheme: () => void;

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
  const [userTheme, setUserTheme] = useState<UserTheme>("system");
  const [hue, setHue] = useState<number>(200);
  const [fontSize, setFontSize] = useState<FontSize>("medium");

  // -------------------------
  // OS のテーマ（system 用）
  // -------------------------
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(false);

  // クライアントサイドでの初期化
  useEffect(() => {
    try {
      // Defensive parsing for theme
      const storedTheme = localStorage.getItem("userTheme");
      if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
        setUserTheme(storedTheme as UserTheme);
      } else if (storedTheme) {
        console.error("[UIProvider] Invalid userTheme in localStorage:", storedTheme, "- clearing");
        localStorage.removeItem("userTheme");
      }

      // Defensive parsing for hue
      const storedHue = localStorage.getItem("themeHue");
      if (storedHue) {
        const hueNum = Number(storedHue);
        if (!isNaN(hueNum) && hueNum >= 0 && hueNum < 360) {
          setHue(hueNum);
        } else {
          console.error("[UIProvider] Invalid themeHue in localStorage:", storedHue, "- clearing");
          localStorage.removeItem("themeHue");
        }
      }

      // Defensive parsing for fontSize
      const storedFontSize = localStorage.getItem("fontSize");
      if (storedFontSize && ["small", "medium", "large"].includes(storedFontSize)) {
        setFontSize(storedFontSize as FontSize);
      } else if (storedFontSize) {
        console.error("[UIProvider] Invalid fontSize in localStorage:", storedFontSize, "- clearing");
        localStorage.removeItem("fontSize");
      }
    } catch (error) {
      console.error("[UIProvider] Error reading from localStorage:", error);
      // Safe fallback: clear all UI settings
      try {
        localStorage.removeItem("userTheme");
        localStorage.removeItem("themeHue");
        localStorage.removeItem("fontSize");
      } catch (clearError) {
        console.error("[UIProvider] Error clearing localStorage:", clearError);
      }
    }
  }, []);

  // system 設定が変わったら追従
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(mq.matches);

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
    try {
      localStorage.setItem("userTheme", userTheme);
    } catch (error) {
      console.error("[UIProvider] Error saving userTheme to localStorage:", error);
    }
  }, [userTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("themeHue", String(hue));
    } catch (error) {
      console.error("[UIProvider] Error saving themeHue to localStorage:", error);
    }
  }, [hue]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("fontSize", fontSize);
    } catch (error) {
      console.error("[UIProvider] Error saving fontSize to localStorage:", error);
    }
  }, [fontSize]);

  const toggleTheme = () => {
    setUserTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      if (prev === "system") return "light";
      return "dark";
    });
  };

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
      --accent-color: #f4212e;
      --active-background-color: #ffffff;
      --inactive-background-color: #eaeaea;
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
      --accent-color: #f4212e;
      --active-background-color: #373737;
      --inactive-background-color: #000000;
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
    toggleTheme,

    effectiveTheme,

    hue,
    setHue,

    fontSize,
    setFontSize,
  };

  return (
    <UIContext.Provider value={value}>
      <style suppressHydrationWarning>{globalStyles + (effectiveTheme === "light" ? lightThremeGlobalStyles : darkThremeGlobalStyles)}</style>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used inside UIProvider");
  return context;
};
