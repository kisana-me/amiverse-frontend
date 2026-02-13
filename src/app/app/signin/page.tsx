"use client";

import "./style.css";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import MainHeader from "@/components/main_header/MainHeader";
import { useCurrentAccount } from "@/app/providers/CurrentAccountProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { api } from "@/lib/axios";

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function appendAccessToken(redirectUri: string, accessToken: string) {
  const separator = redirectUri.includes("?") ? "&" : "?";
  return `${redirectUri}${separator}access_token=${encodeURIComponent(accessToken)}`;
}

export default function NativeAppSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentAccountStatus, currentAccount } = useCurrentAccount();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rawRedirectUri = searchParams.get("redirect_uri") ?? "";
  const redirectUri = useMemo(() => safeDecodeURIComponent(rawRedirectUri), [rawRedirectUri]);

  const redirectUriLabel = useMemo(() => {
    if (!redirectUri) return "";
    return redirectUri;
  }, [redirectUri]);

  const handleCancel = () => {
    if (!redirectUri) {
      router.push("/");
      return;
    }
    window.location.href = redirectUri;
  };

  const handleAllow = async () => {
    if (!redirectUri) {
      addToast({
        message: "エラー",
        detail: "redirect_uri が指定されていません",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/sessions/create");
      const accessToken = res.data?.access_token;
      if (!accessToken || typeof accessToken !== "string") {
        throw new Error("access_token の取得に失敗しました");
      }

      window.location.href = appendAccessToken(redirectUri, accessToken);
    } catch (error) {
      addToast({
        message: "エラー",
        detail: error instanceof Error ? error.message : String(error),
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MainHeader>アプリ連携</MainHeader>
      <div className="native-signin-page">
        <div className="native-signin-container">
          {!redirectUri && (
            <div className="native-signin-block">
              <p className="native-signin-title">無効なリクエスト</p>
              <p className="native-signin-text">redirect_uri が必要です。</p>
            </div>
          )}

          {redirectUri && currentAccountStatus === "loading" && (
            <div className="native-signin-block">
              <p className="native-signin-title">確認中</p>
              <p className="native-signin-text">サインイン状態を確認しています...</p>
            </div>
          )}

          {redirectUri && currentAccountStatus === "signed_out" && (
            <div className="native-signin-block">
              <p className="native-signin-title">サインインが必要です</p>
              <p className="native-signin-text">まずWebでサインインしてください。</p>
              <Link className="native-signin-link" href="/signin">
                サインインページへ
              </Link>
            </div>
          )}

          {redirectUri && currentAccountStatus === "signed_in" && (
            <div className="native-signin-block">
              <p className="native-signin-title">許可しますか？</p>
              <p className="native-signin-text">次のリダイレクト先へサインイン情報を渡します。</p>

              {currentAccount && (
                <div className="native-signin-account">
                  <div className="native-signin-account-icon">
                    <img
                      src={currentAccount.icon_url}
                      alt={currentAccount.name}
                      width={44}
                      height={44}
                    />
                  </div>
                  <div className="native-signin-account-meta">
                    <div className="native-signin-account-name">{currentAccount.name}</div>
                    <div className="native-signin-account-id">@{currentAccount.name_id}</div>
                  </div>
                </div>
              )}

              <div className="native-signin-uri">{redirectUriLabel}</div>

              <div className="native-signin-actions">
                <button
                  className="native-signin-button native-signin-button-primary"
                  onClick={handleAllow}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "発行中..." : "許可"}
                </button>
                <button
                  className="native-signin-button native-signin-button-secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
