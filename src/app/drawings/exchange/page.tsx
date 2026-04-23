"use client";

import "./style.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import MainHeader from "@/components/main_header/MainHeader";
import DrawingEditor from "@/components/post/DrawingEditor";
import OneLine from "@/components/Account/OneLine";
import { Modal } from "@/components/modal/Modal";
import { api } from "@/lib/axios";
import { useToast } from "@/providers/ToastProvider";
import { useCurrentAccount } from "@/providers/CurrentAccountProvider";
import type { AccountType } from "@/types/account";

type DrawingExchangeItem = {
  aid: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
  account?: AccountType;
};

type DrawingExchangeResponse = {
  status: string;
  message: string;
  data?: {
    drawing?: DrawingExchangeItem;
    random_drawing?: DrawingExchangeItem;
  };
  errors?: string[];
};

type DraftDrawing = {
  previewUrl: string;
  packed: string;
  name: string;
  description: string;
};

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const maybe = error as {
      response?: {
        data?: {
          message?: string;
          errors?: string[];
        };
      };
      message?: string;
    };

    const serverErrors = maybe.response?.data?.errors;
    if (Array.isArray(serverErrors) && serverErrors.length > 0) {
      return serverErrors.join(", ");
    }

    const serverMessage = maybe.response?.data?.message;
    if (typeof serverMessage === "string" && serverMessage.length > 0) {
      return serverMessage;
    }

    if (typeof maybe.message === "string" && maybe.message.length > 0) {
      return maybe.message;
    }
  }

  return "送信に失敗しました";
}

function formatCreatedAt(raw: string): string {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "日時不明";
  }
  return date.toLocaleString("ja-JP");
}

export default function DrawingsExchangePage() {
  const { addToast } = useToast();
  const { currentAccountStatus } = useCurrentAccount();

  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [draftDrawing, setDraftDrawing] = useState<DraftDrawing | null>(null);
  const [result, setResult] = useState<{ drawing: DrawingExchangeItem; randomDrawing: DrawingExchangeItem } | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState("spam");
  const [reportDetail, setReportDetail] = useState("");
  const [isReportingSubmitting, setIsReportingSubmitting] = useState(false);
  const isCompleted = result !== null;

  useEffect(() => {
    return () => {
      if (draftDrawing?.previewUrl) {
        URL.revokeObjectURL(draftDrawing.previewUrl);
      }
    };
  }, [draftDrawing]);

  const handleDrawingSave = (_imageBlob: Blob, packedData: string, name: string, description: string) => {
    const previewUrl = URL.createObjectURL(_imageBlob);

    setDraftDrawing(prev => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return {
        previewUrl,
        packed: packedData,
        name,
        description,
      };
    });

    setIsDrawingOpen(false);
  };

  const handleSubmit = async () => {
    if (isCompleted) {
      return;
    }

    if (!draftDrawing) {
      addToast({ message: "エラー", detail: "先に絵を描いてください" });
      return;
    }

    if (!agreed) {
      addToast({ message: "同意が必要です", detail: "利用規約とプライバシーポリシーへの同意を確認してください" });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post<DrawingExchangeResponse>("/drawings/create", {
        drawing: {
          data: draftDrawing.packed,
          name: draftDrawing.name,
          description: draftDrawing.description,
        },
      });

      const drawing = res.data.data?.drawing;
      const randomDrawing = res.data.data?.random_drawing;

      if (!drawing || !randomDrawing) {
        throw new Error("レスポンス形式が不正です");
      }

      setResult({ drawing, randomDrawing });
      addToast({ message: "送信しました", detail: res.data.message || "交換に成功しました" });
    } catch (error) {
      addToast({ message: "送信エラー", detail: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeReport = async () => {
    if (!result?.randomDrawing || isReportingSubmitting) {
      return;
    }

    setIsReportingSubmitting(true);

    try {
      await api.post("/reports", {
        report: {
          target_type: "drawing",
          target_aid: result.randomDrawing.aid,
          category: reportCategory,
          description: reportDetail,
        },
      });

      addToast({ message: "通報しました" });
      setReportCategory("spam");
      setReportDetail("");
      setIsReportModalOpen(false);
    } catch (error) {
      addToast({ message: "通報に失敗しました", detail: getErrorMessage(error) });
    } finally {
      setIsReportingSubmitting(false);
    }
  };

  return (
    <>
      <MainHeader>お絵描き交換</MainHeader>

      <div className="drawing-exchange-page">
        <section className="drawing-exchange-card">
          <h1 className="drawing-exchange-title">お絵描き、交換！</h1>
          <p className="drawing-exchange-description">
            サインインせず利用可能！描いた絵を送信すると、ランダムに誰かの絵とあなたの絵を交換します！
          </p>

          <div className="drawing-exchange-actions">
            <button
              type="button"
              className="drawing-exchange-primary"
              onClick={() => setIsDrawingOpen(true)}
              disabled={isSubmitting || isCompleted}
            >
              {draftDrawing ? "絵を描き直す" : "絵を描く"}
            </button>
          </div>

          {draftDrawing && (
            <div className="drawing-exchange-preview">
              <img src={draftDrawing.previewUrl} alt="作成中の絵" className="drawing-exchange-image" />
              {(draftDrawing.name || draftDrawing.description) && (
                <div className="drawing-exchange-preview-meta">
                  <div className="drawing-exchange-meta-name">{draftDrawing.name || "タイトルなし"}</div>
                  {draftDrawing.description && <div className="drawing-exchange-meta-description">{draftDrawing.description}</div>}
                </div>
              )}
            </div>
          )}

          <label className="drawing-exchange-agree">
            <input
              type="checkbox"
              checked={agreed}
              onChange={event => setAgreed(event.target.checked)}
              disabled={isSubmitting}
            />
            <span>
              <Link href="/terms-of-service">利用規約</Link> と <Link href="/privacy-policy">プライバシーポリシー</Link> に同意する
            </span>
          </label>
          
            <button
              type="button"
              className="drawing-exchange-submit"
              onClick={handleSubmit}
              disabled={!draftDrawing || !agreed || isSubmitting || isCompleted}
            >
              {isCompleted ? "交換完了" : isSubmitting ? "送信中..." : "交換する"}
            </button>
        </section>

        {result && (
          <section className="drawing-exchange-result">
            <h2>交換結果</h2>
            <p>ページを移動すると消えてしまうので注意！スクショ推奨！</p>
            <p>「#Amiverseお絵描き交換」で共有！</p>
            <div className="drawing-exchange-grid">
              <article className="drawing-exchange-panel">
                <h3>あなたの絵</h3>
                <img src={result.drawing.image_url} alt={result.drawing.name || "あなたの絵"} className="drawing-exchange-image" />
                <div className="drawing-exchange-panel-meta">
                  <div className="drawing-exchange-meta-name">{result.drawing.name || "タイトルなし"}</div>
                  {result.drawing.description && (
                    <div className="drawing-exchange-meta-description">{result.drawing.description}</div>
                  )}
                  <div className="drawing-exchange-meta-time">{formatCreatedAt(result.drawing.created_at)}</div>
                </div>
              </article>

              <article className="drawing-exchange-panel">
                <h3>ランダムな絵</h3>
                <img
                  src={result.randomDrawing.image_url}
                  alt={result.randomDrawing.name || "ランダムな絵"}
                  className="drawing-exchange-image"
                />
                <div className="drawing-exchange-panel-meta">
                  <div className="drawing-exchange-meta-name">{result.randomDrawing.name || "タイトルなし"}</div>
                  {result.randomDrawing.description && (
                    <div className="drawing-exchange-meta-description">{result.randomDrawing.description}</div>
                  )}
                  <div className="drawing-exchange-meta-time">{formatCreatedAt(result.randomDrawing.created_at)}</div>
                </div>

                {result.randomDrawing.account && (
                  <div className="drawing-exchange-account-wrap">
                    <OneLine account={result.randomDrawing.account} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="drawing-exchange-report-button"
                  disabled={isReportingSubmitting}
                >
                  {isReportingSubmitting ? "送信中..." : "このお絵描きを通報"}
                </button>
              </article>
            </div>
          </section>
        )}

        {currentAccountStatus === "signed_out" && (
          <section className="drawing-exchange-signin">
            <h2>Amiverseに参加してみない？</h2>
            <p>Amiverseは投稿に320×120の白黒ドット絵を描けるSNSです！</p>
            <div className="drawing-exchange-signin-actions">
              <Link href="/signin" className="drawing-exchange-signin-primary">
                サインイン・サインアップ
              </Link>
            </div>
          </section>
        )}
      </div>

      {isDrawingOpen && (
        <DrawingEditor
          onClose={() => setIsDrawingOpen(false)}
          onSave={handleDrawingSave}
          initialData={draftDrawing?.packed}
          initialName={draftDrawing?.name}
          initialDescription={draftDrawing?.description}
        />
      )}

      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="お絵描きを通報"
      >
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">通報の理由</label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="p-2 border rounded-md"
              style={{
                backgroundColor: "var(--background-color)",
                color: "var(--font-color)",
                borderColor: "var(--border-color)",
              }}
            >
              <option value="spam">スパム・迷惑</option>
              <option value="hate">ヘイト・嫌がらせ・いじめ・差別</option>
              <option value="disinformation">偽情報・なりすまし</option>
              <option value="violence">暴力的・テロ・過激的思想</option>
              <option value="sensitive">センシティブ・性的・残酷</option>
              <option value="suicide">自殺・自傷</option>
              <option value="illegal">違法・規制対象・詐欺・不正</option>
              <option value="theft">盗用・著作権侵害</option>
              <option value="privacy">不同意・プライバシー侵害</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">詳細（任意）</label>
            <textarea
              value={reportDetail}
              onChange={(e) => setReportDetail(e.target.value)}
              className="p-2 border rounded-md min-h-[100px]"
              placeholder="詳細を入力してください"
              style={{
                backgroundColor: "var(--background-color)",
                color: "var(--font-color)",
                borderColor: "var(--border-color)",
              }}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsReportModalOpen(false)}
              disabled={isReportingSubmitting}
              className="px-4 py-2 rounded-md transition-colors cursor-pointer"
              style={{
                backgroundColor: "var(--inconspicuous-background-color)",
                color: "var(--font-color)",
              }}
            >
              キャンセル
            </button>
            <button
              onClick={executeReport}
              disabled={isReportingSubmitting}
              className="px-4 py-2 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
              style={{
                backgroundColor: "var(--accent-color)",
                opacity: isReportingSubmitting ? 0.7 : 1,
              }}
            >
              {isReportingSubmitting ? "送信中..." : "通報する"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
