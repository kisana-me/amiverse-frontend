"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
  useEffect,
  useCallback,
} from 'react';
import { usePathname } from 'next/navigation';

type initOverlayType = {
  is_loading: boolean;
  loading_message: string;
  loading_progress: number;
};

type OverlayContextType = {
  initOverlay: initOverlayType;
  setInitOverlay: Dispatch<SetStateAction<initOverlayType>>;

  isHeaderMenuOpen: boolean;
  setIsHeaderMenuOpen: Dispatch<SetStateAction<boolean>>;
  headerMenuTrigger: () => void;

  isAsideMenuOpen: boolean;
  setIsAsideMenuOpen: Dispatch<SetStateAction<boolean>>;
  asideMenuTrigger: () => void;

  doneInitLoading: () => void;
  menuOverlay: boolean;

  closeMenu: () => void;
};

const OverlayContext = createContext<OverlayContextType | null>(null);

export const OverlayProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [initOverlay, setInitOverlay] = useState<initOverlayType>({
    is_loading: true,
    loading_message: "ロード中",
    loading_progress: 0,
  });
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isAsideMenuOpen, setIsAsideMenuOpen] = useState(false);
  const headerMenuTrigger = () => setIsHeaderMenuOpen(prevState => !prevState);
  const asideMenuTrigger = () => setIsAsideMenuOpen(prevState => !prevState);

  const doneInitLoading = () => {
    setInitOverlay({
      is_loading: false,
      loading_message: "完了",
      loading_progress: 100,
    });
  };

  const closeMenu = useCallback(() => {
    setIsHeaderMenuOpen(false);
    setIsAsideMenuOpen(false);
  }, []);

  useEffect(() => {
    if (isHeaderMenuOpen || isAsideMenuOpen) {
      closeMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!isHeaderMenuOpen && !isAsideMenuOpen) return;

    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a')) {
        closeMenu();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isHeaderMenuOpen, isAsideMenuOpen, closeMenu]);

  const menuOverlay = useMemo(() => {
    return isHeaderMenuOpen || isAsideMenuOpen;
  }, [isHeaderMenuOpen, isAsideMenuOpen]);

  const value: OverlayContextType = {
    initOverlay,
    setInitOverlay,
    isHeaderMenuOpen,
    setIsHeaderMenuOpen,
    headerMenuTrigger,
    isAsideMenuOpen,
    setIsAsideMenuOpen,
    asideMenuTrigger,
    menuOverlay,
    doneInitLoading,
    closeMenu,
  };

  return (
    <OverlayContext.Provider value={value}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (!context) throw new Error("useOverlay must be used within an OverlayProvider");
  return context;
};
