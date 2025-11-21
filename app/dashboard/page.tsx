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
        Dashboard
      </MainHeader>
      <div className="dashboard">
        <div>current theme mode: {userTheme}</div>
        <button onClick={()=> handleClick()}>Change theme mode</button>
      </div>
    </>
  );
}
