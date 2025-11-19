"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
} from 'react';

type OverlayContextType = {
  initOverlay: boolean;
  setInitOverlay: Dispatch<SetStateAction<boolean>>;

  isHeaderMenuOpen: boolean;
  setIsHeaderMenuOpen: Dispatch<SetStateAction<boolean>>;
  headerMenuTrigger: () => void;

  isAsideMenuOpen: boolean;
  setIsAsideMenuOpen: Dispatch<SetStateAction<boolean>>;
  asideMenuTrigger: () => void;

  menuOverlay: boolean;

  closeMenu: () => void;
};

const OverlayContext = createContext<OverlayContextType | null>(null);

export const OverlayProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [initOverlay, setInitOverlay] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isAsideMenuOpen, setIsAsideMenuOpen] = useState(false);
  const headerMenuTrigger = () => setIsHeaderMenuOpen(prevState => !prevState);
  const asideMenuTrigger = () => setIsAsideMenuOpen(prevState => !prevState);

  const closeMenu = () => {
    setIsHeaderMenuOpen(false);
    setIsAsideMenuOpen(false);
  }

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
  if (!context) {
    throw new Error(
      "useOverlay must be used within an OverlayProvider"
    );
  }
  return context;
};
