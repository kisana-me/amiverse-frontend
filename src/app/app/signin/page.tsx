import "./style.css";

import { Suspense } from "react";
import MainHeader from "@/components/main_header/MainHeader";
import NativeAppSignInClient from "./signin_client";

export default function NativeAppSignInPage() {
  return (
    <>
      <MainHeader>アプリ連携</MainHeader>
      <Suspense
        fallback={
          <div className="native-signin-page">
            <div className="native-signin-container">
              <div className="native-signin-block">
                <p className="native-signin-title">確認中</p>
                <p className="native-signin-text">読み込み中...</p>
              </div>
            </div>
          </div>
        }
      >
        <NativeAppSignInClient />
      </Suspense>
    </>
  );
}
