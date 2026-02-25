"use client";

import { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@/providers/CurrentAccountProvider";
import { useToast } from "@/providers/ToastProvider";
import { api } from "@/lib/axios";
import MainHeader from "@/components/main_header/MainHeader";
import "./style.css";

export default function AccountSettingsPage() {
  const { currentAccount, setCurrentAccount, currentAccountStatus } = useCurrentAccount();
  const { addToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    name_id: "",
    description: "",
    birthdate: "",
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // 日付をYYYY-MM-DD形式に変換
  const formatDateForInput = (dateStr: string | undefined): string => {
    if (!dateStr) return "";
    // すでにYYYY-MM-DD形式の場合
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // ISO形式やその他の形式の場合
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (currentAccountStatus === "signed_out") {
      addToast({
        message: "エラー",
        detail: "サインインしてください",
      });
      router.push("/");
    } else if (currentAccountStatus === "signed_in" && currentAccount) {
      setFormData({
        name: currentAccount.name || "",
        name_id: currentAccount.name_id || "",
        description: currentAccount.description || "",
        birthdate: formatDateForInput(currentAccount.birthdate),
      });
      setPreviewIcon(currentAccount.icon_url);
      setPreviewBanner(currentAccount.banner_url || null);
    }
  }, [currentAccountStatus, currentAccount, router, addToast]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setPreviewIcon(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setPreviewBanner(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    const submitData = new FormData();
    submitData.append("account[name]", formData.name);
    submitData.append("account[name_id]", formData.name_id);
    submitData.append("account[description]", formData.description);
    submitData.append("account[birthdate]", formData.birthdate);
    if (iconFile) {
      submitData.append("account[icon_file]", iconFile);
    }
    if (bannerFile) {
      submitData.append("account[banner_file]", bannerFile);
    }

    try {
      const res = await api.post("/settings/account", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200 && res.data.account) {
        // レスポンスから返ってきたアカウント情報でコンテキストを更新
        const updatedAccount = res.data.account;
        setCurrentAccount(updatedAccount);
        
        addToast({
          message: "成功",
          detail: "アカウント情報を更新しました",
        });
        
        // 更新後、アカウントページへ遷移
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.message) {
          setErrors([data.message]);
        } else {
          setErrors(["更新に失敗しました"]);
        }
        addToast({
          message: "エラー",
          detail: data.message || "更新に失敗しました",
        });
      } else {
        addToast({
          message: "エラー",
          detail: "予期せぬエラーが発生しました",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentAccountStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (currentAccountStatus === "signed_out") {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <MainHeader>
        <div>アカウント設定</div>
      </MainHeader>
      <div className="account-settings-container">
        <form onSubmit={handleSubmit} className="account-settings-form">
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((err, index) => (
                <p key={index} className="error-message">
                  {err}
                </p>
              ))}
            </div>
          )}

          {/* プロフィールプレビューカード */}
          <div className="settings-profile-preview">
            {/* バナー */}
            <div 
              className="settings-banner-wrapper"
              onClick={() => bannerInputRef.current?.click()}
            >
              {previewBanner ? (
                <img src={previewBanner} alt="Banner Preview" className="settings-banner-image" />
              ) : (
                <div className="settings-banner-placeholder" />
              )}
              <div className="settings-banner-overlay">
                <span className="settings-upload-icon">📷</span>
                <span>バナーを変更</span>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                id="banner_file"
                name="banner_file"
                accept="image/*"
                onChange={handleBannerChange}
                className="settings-file-input-hidden"
              />
            </div>

            {/* アイコン */}
            <div 
              className="settings-icon-wrapper"
              onClick={() => iconInputRef.current?.click()}
            >
              {previewIcon ? (
                <img src={previewIcon} alt="Icon Preview" className="settings-icon-image" />
              ) : (
                <div className="settings-icon-placeholder">
                  <span>👤</span>
                </div>
              )}
              <div className="settings-icon-overlay">
                <span className="settings-upload-icon">📷</span>
                <span>アイコンを変更</span>
              </div>
              <input
                ref={iconInputRef}
                type="file"
                id="icon_file"
                name="icon_file"
                accept="image/*"
                onChange={handleIconChange}
                className="settings-file-input-hidden"
              />
            </div>
          </div>

          {/* フォームフィールド */}
          <div className="settings-form-card">
            <div className="form-group">
              <label htmlFor="name">名前</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="表示名を入力"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name_id">ユーザーID</label>
              <div className="form-input-with-prefix">
                <span className="form-input-prefix">@</span>
                <input
                  type="text"
                  id="name_id"
                  name="name_id"
                  value={formData.name_id}
                  onChange={handleChange}
                  className="form-input form-input-no-border-left"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">自己紹介</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="自己紹介を入力..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthdate">誕生日</label>
              <input
                type="date"
                id="birthdate"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "変更を保存"}
          </button>
        </form>
      </div>
    </>
  );
}
