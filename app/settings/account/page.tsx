"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "../../providers/CurrentAccountProvider";
import { useToast } from "../../providers/ToastProvider";
import { api } from "../../lib/axios";
import MainHeader from "../../components/main_header/MainHeader";
import "./style.css";

export default function AccountSettingsPage() {
  const { currentAccount, currentAccountStatus } = useCurrentAccount();
  const { addToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    name_id: "",
    description: "",
    birthdate: "",
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (currentAccountStatus === "signed_out") {
      addToast({
        title: "エラー",
        message: "サインインしてください",
      });
      router.push("/");
    } else if (currentAccountStatus === "signed_in" && currentAccount) {
      setFormData({
        name: currentAccount.name || "",
        name_id: currentAccount.name_id || "",
        description: currentAccount.description || "",
        birthdate: currentAccount.birthdate || "", // Assuming birthdate is in YYYY-MM-DD format or compatible
      });
      setPreviewIcon(currentAccount.icon_url);
    }
  }, [currentAccountStatus, currentAccount, router, addToast]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setPreviewIcon(URL.createObjectURL(file));
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

    try {
      const res = await api.post("/settings/account", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        addToast({
          title: "成功",
          message: "アカウント情報を更新しました",
        });
        // Optionally refresh current account data here if the API returned it,
        // or trigger a re-fetch in the provider.
        // For now, we can manually update the local state if needed, but a reload or re-fetch is safer.
        // Since the provider doesn't expose a re-fetch method directly (it uses useEffect),
        // we might rely on the user navigating or reloading, or we could try to update the context manually
        // if we knew the new data.
        // Given the prompt says it returns { status: 'success' }, we don't get the new account object back.
        // So we might want to reload the page or just leave it.
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
          title: "エラー",
          message: data.message || "更新に失敗しました",
        });
      } else {
        addToast({
          title: "エラー",
          message: "予期せぬエラーが発生しました",
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

          <div className="form-group">
            <label htmlFor="icon_file">アイコン</label>
            {previewIcon && (
              <img src={previewIcon} alt="Icon Preview" className="icon-preview" />
            )}
            <input
              type="file"
              id="icon_file"
              name="icon_file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">名前</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name_id">ユーザーID</label>
            <input
              type="text"
              id="name_id"
              name="name_id"
              value={formData.name_id}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">自己紹介</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
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

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </button>
        </form>
      </div>
    </>
  );
}
