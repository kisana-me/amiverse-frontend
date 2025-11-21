"use client";

import "./style.css";
import MainHeader from '../components/main_header/MainHeader';
import { useUI } from "../providers/UIProvider";

export default function Page() {
  const { userTheme, toggleTheme } = useUI();

  const handleClick = () => {
    toggleTheme();
  }

  return (
    <>
      <MainHeader>
        Settings
      </MainHeader>
      <div className="settings">
        <div>current theme mode: {userTheme}</div>
        <button onClick={()=> handleClick()}>Change theme mode</button>
      </div>
    </>
  );
}
