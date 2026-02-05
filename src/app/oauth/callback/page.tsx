"use client";

import "./style.css";
import MainHeader from '@/components/main_header/MainHeader';
import { api } from "@/lib/axios";
import { useToast } from "@/app/providers/ToastProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentAccount } from "@/app/providers/CurrentAccountProvider";

export default function Page() {
  const { currentAccountStatus } = useCurrentAccount();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (currentAccountStatus === 'loading') return;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    api.post('/oauth/callback', { code, state }).then((response) => {
      const data = response.data as { status: string; message: string; signup_data?: any; };
      if (data.signup_data) {
        router.push(`/signup?name=${encodeURIComponent(data.signup_data.name)}&name_id=${encodeURIComponent(data.signup_data.name_id)}&description=${encodeURIComponent(data.signup_data.description)}`);
        addToast({
          title: 'アカウントを作成してください',
          message: data.message
        });
      } else {
        addToast({
          title: '反応あり',
          message: data.message
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    }).catch((error) => {
      router.push('/');
      addToast({
        title: 'エラー',
        message: error.message
      });
    });
  }, [currentAccountStatus]);

  return (
    <>
      <MainHeader>
        Callback
      </MainHeader>
      <div className="oauth-callback">
        ちょっとまってね...
      </div>
    </>
  );
}
