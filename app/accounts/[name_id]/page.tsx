"use client";

import MainHeader from "@/app/components/main_header/MainHeader";
import { api } from "@/app/lib/axios";
import { AccountType } from "@/types/account";
import { use, useEffect, useState } from "react";
import SkeletonAccount from "./skeleton_account";
import { formatFullDate } from "@/app/lib/format_time";
import "./page.css";

type Props = {
  params: Promise<{
    name_id: string;
  }>;
};

export default function Page({ params }: Props) {
  const { name_id } = use(params);

  const [loading, setLoading] = useState<boolean>(true);
  const [account, setAccount] = useState<AccountType | null>(null);

  useEffect(() => {
    if (!name_id) return;
    
    setLoading(true);
    api.get('/accounts/' + name_id).then(res => {
      setAccount(res.data);
    }).catch(() => {
      setAccount(null);
    }).finally(() => {
      setLoading(false);
    });
  }, [name_id]);

  return (
    <>
      <MainHeader>
        {account ? (
          <div className="account-main-header">
            <div className="amh-icon-wrap" style={{
              borderColor: account.ring_color || '#fff0'
            }}>
              <div className="amh-status" style={{
                bottom: 0,
                right: 0,
                background: account.status_rb_color || '#fff0'
              }}></div>
              <img src={account.icon_url || "/ast-imgs/icon.png"} className="amh-icon" alt="アイコン" />
            </div>
            <div className="amh-nameplate">
              <div className="amh-name">
                {account.name}
              </div>
              <div className="amh-id">
                @{account.name_id}
              </div>
            </div>
            <div className="amh-right">
              <button className="iai-button" onClick={() => console.log("action")}>action</button>
            </div>
          </div>
        ) : (
          <div>Account</div>
        )}
      </MainHeader>

      {loading ? <SkeletonAccount /> :
        account ? (
          <div className="account-container">
            <div className="account-banner-container">
              <img
                className="account-banner-image"
                src={account.banner_url || "/ast-imgs/banner.png"}
                alt='バナー'
              />
            </div>

            <div className="account-plate">
              <div className="ap-icon-container" style={{
                borderColor: account.ring_color || '#fff0'
              }}>
                <div className="ap-icon-status" style={{
                  background: account.status_rb_color || '#fff0'
                }}></div>
                <img
                  className="ap-icon-image"
                  src={account.icon_url || "/ast-imgs/icon.png"}
                  alt='アイコン'
                />
              </div>

              <div className="ap-nameplate">
                <div className="ap-name">{account.name}</div>
                <div className="ap-id">@{account.name_id}</div>
              </div>

              <div className="ap-buttons">
                <button className="ap-button">🍭</button>
                <button className="ap-button">❤️</button>
                <button className="ap-button">🤞</button>
                <button className="ap-button">Follow</button>
              </div>

              {account.badges && account.badges.length > 0 && (
                <div className="ap-badges">
                  {account.badges.map((badge, index) => (
                    <div className="ap-badge" key={index}>
                      <div className="ap-badge-icon">
                        <img
                          className="ap-badge-icon-image"
                          src={badge.url}
                          alt={badge.name + " badge icon"}
                        />
                      </div>
                      <div className="ap-badge-name">
                        {badge.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="account-profile">
              <div className="account-profile-summary">{account.description}</div>
              <div className="account-profile-keyvalues">
                {/* 場所の情報は型定義にないため省略 */}
                {account.birthdate && (
                  <div className="apk-keyvalue">
                    <div className="apk-key">🎂誕生日</div>
                    <div className="apk-value">{formatFullDate(new Date(account.birthdate))}</div>
                  </div>
                )}
                {account.created_at && (
                  <div className="apk-keyvalue">
                    <div className="apk-key">🎫参加日</div>
                    <div className="apk-value">{formatFullDate(new Date(account.created_at))}</div>
                  </div>
                )}
              </div>
              <div className="account-profile-counters">
                <div className="apc-counter">
                  <div className="apc-figure">{account.followers_count ?? 0}</div>
                  <div className="apc-subscript">フォロワー</div>
                </div>
                <div className="apc-counter">
                  <div className="apc-figure">{account.following_count ?? 0}</div>
                  <div className="apc-subscript">フォロー</div>
                </div>
                <div className="apc-counter">
                  <div className="apc-figure">{account.posts_count ?? 0}</div>
                  <div className="apc-subscript">投稿数</div>
                </div>
              </div>
            </div>

            <div className="account-tab">
              <div className="account-tab-selector active">投稿</div>
              <div className="account-tab-selector">返信</div>
              <div className="account-tab-selector">メディア</div>
              <div className="account-tab-selector">リアクション</div>
            </div>

            <div className="account-content">
              {/* 投稿一覧はまだ実装しない */}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">アカウントが見つかりません</div>
        )
      }
    </>
  );
}
