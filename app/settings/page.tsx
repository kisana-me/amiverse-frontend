"use client";

import "./style.css";
import MainHeader from '../components/main_header/MainHeader';
import { useUI } from "../providers/UIProvider";
import { useCurrentAccount } from "../providers/CurrentAccountProvider";
import { api } from "../lib/axios";
import { useToast } from "../providers/ToastProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Page() {
  const { userTheme, toggleTheme } = useUI();
  const { addToast } = useToast();
  const { currentAccountStatus, setCurrentAccount, setCurrentAccountStatus } = useCurrentAccount();
  const router = useRouter();

  const handleClick = () => {
    toggleTheme();
  }

  const handleSignout = () => {
    if (currentAccountStatus) {
      api.delete('/signout').then((res) => {
        const data = res.data as { status: string; message: string; };
        addToast({
          title: 'サインアウトしました',
          message: '2秒後に再読み込みします'
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }).catch((error) => {
          addToast({
            title: 'エラー',
            message: error.message
          });
      });
    }else{
      addToast({
        title: 'エラー',
        message: 'サインインしていません'
      });
    }
  }

  return (
    <>
      <MainHeader>
        Settings
      </MainHeader>
      <div className="settings">
        <div>current theme mode: {userTheme}</div>
        <button onClick={()=> handleClick()}>Change theme mode</button>
        <br />
        {currentAccountStatus === 'signed_in' ?
          <button onClick={()=>handleSignout()}>Sign out</button>
          :
          <Link href='/signin'>Sign in</Link>
        }
      </div>
    </>
  );
}
