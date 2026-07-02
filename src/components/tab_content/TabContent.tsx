"use client";

import {
  memo,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from "react";
import TabBar from "@/components/tab_bar/TabBar";
import "./style.css";

type TabDef<K extends string = string> = {
  key: K;
  label: ReactNode;
};

type TabContentBaseProps<K extends string = string> = {
  /** 各タブのコンテンツを返す render function */
  children: (tabKey: K, isActive: boolean) => ReactNode;
  /** コンテナに追加するクラス名 */
  className?: string;
  /**
   * ヘッダー + TabBar の配置を指定するスロット。
   * 引数の tabBar をヘッダー内の好きな場所に配置できる。
   * 指定すると自動で flex column ラッパーが追加される。
   */
  renderHeader?: (tabBar: ReactNode) => ReactNode;
  /**
   * まだ表示していない（保存スクロール位置が無い）タブに切り替えたときの
   * 基準スクロール位置（document 座標）を返す関数。未指定なら 0（最上部）。
   * タブバーがページ途中にある画面で、切替時にページ最上部まで戻らず
   * タブバーが画面上端に来る位置を基準にしたい場合に使う。
   */
  defaultScrollTop?: () => number;
};

/**
 * 制御モード: 呼び出し側が activeTab と onTabChange で状態を管理する。
 * ホーム画面のように外部状態（FeedsProvider, URL）との同期が必要な場合に使用。
 */
type TabContentControlledProps<K extends string = string> = TabContentBaseProps<K> & {
  /** タブのキー配列（tabs がない場合に使用） */
  tabKeys?: K[];
  /** タブ定義（renderHeader 使用時に必要） */
  tabs?: TabDef<K>[];
  /** 現在のアクティブタブ */
  activeTab: K;
  /** タブ変更コールバック */
  onTabChange: (key: K) => void;
  defaultTab?: undefined;
  onBeforeChange?: undefined;
};

/**
 * 非制御モード: コンポーネント内部で状態を管理する。
 * リアクション画面など、外部同期が不要なシンプルなケースに使用。
 */
type TabContentUncontrolledProps<K extends string = string> = TabContentBaseProps<K> & {
  /** タブ定義（必須） */
  tabs: TabDef<K>[];
  /** 初期タブ */
  defaultTab?: K;
  /** タブ変更前のガード。false を返すと切替を阻止 */
  onBeforeChange?: (nextTab: K, currentTab: K) => boolean;
  /** タブ変更時の通知コールバック（状態管理は内部で行う） */
  onTabChange?: (key: K) => void;
  tabKeys?: undefined;
  activeTab?: undefined;
};

type TabContentProps<K extends string = string> = TabContentControlledProps<K> | TabContentUncontrolledProps<K>;

// スワイプ中は swipeOffset の更新で TabContent 自体が毎フレーム再レンダーされるため、
// タブ本文を memo 化してリスト全体（Feed など）の再レンダーを防ぐ
const TabPanelBody = memo(function TabPanelBody({
  tabKey,
  isActive,
  render,
}: {
  tabKey: string;
  isActive: boolean;
  render: (tabKey: string, isActive: boolean) => ReactNode;
}) {
  return <>{render(tabKey, isActive)}</>;
});

/**
 * スワイプ対応タブコンテンツコンポーネント
 *
 * 2つのモードで使用可能:
 *
 * ### 非制御モード（簡易）
 * tabs + defaultTab を渡すだけで、状態管理・TabBar・スワイプがすべて込み。
 *
 * ```tsx
 * <TabContent
 *   tabs={[{ key: 'a', label: 'Tab A' }, { key: 'b', label: 'Tab B' }]}
 *   defaultTab="a"
 *   renderHeader={(tabBar) => (
 *     <>
 *       <MainHeader>タイトル</MainHeader>
 *       {tabBar}
 *     </>
 *   )}
 * >
 *   {(tabKey) => <div>Content for {tabKey}</div>}
 * </TabContent>
 * ```
 *
 * ### 制御モード（高度）
 * activeTab + onTabChange で外部から状態を制御。URL同期などが必要な場合に。
 *
 * ```tsx
 * const { tabs, activeTab, changeTab } = useTabs({ ... });
 * <TabContent tabs={tabs} activeTab={activeTab} onTabChange={changeTab}>
 *   {(tabKey) => <div>Content for {tabKey}</div>}
 * </TabContent>
 * ```
 */
export default function TabContent<K extends string = string>(props: TabContentProps<K>) {
  const {
    children,
    className,
    renderHeader,
  } = props;

  // --- 制御 / 非制御モードの判定と状態管理 ---
  const isControlled = props.activeTab !== undefined;

  const tabDefs: TabDef<K>[] | undefined = props.tabs;
  const keys = props.tabKeys ?? tabDefs?.map(t => t.key) ?? [];

  // 非制御モードの内部状態
  const [internalTab, setInternalTab] = useState<K>(
    () => (props as TabContentUncontrolledProps<K>).defaultTab ?? keys[0] ?? ('' as unknown as K)
  );

  const currentTab = isControlled ? props.activeTab! : internalTab;

  const handleTabChange = useCallback((key: K) => {
    if (!isControlled) {
      const onBeforeChange = (props as TabContentUncontrolledProps<K>).onBeforeChange;
      if (onBeforeChange && !onBeforeChange(key, currentTab)) return;
      setInternalTab(key);
    }
    props.onTabChange?.(key);
  }, [isControlled, currentTab, props]);

  // --- スクロール位置の保存・復元 ---
  // タブごとの window スクロール位置
  const scrollPositionsRef = useRef<Record<string, number>>({});
  // 非アクティブパネルの translateY 補正量。
  // window は常にアクティブタブの保存位置にスクロールしているため、表示中の他パネルは
  // 「window のスクロール位置 - そのタブの保存位置」だけずらすと自分の位置に見える。
  const [panelOffsets, setPanelOffsets] = useState<Record<string, number>>({});
  // 切替アニメーション中に退場していくタブ。アニメーションが終わるまで全高を維持する
  const [leavingTab, setLeavingTab] = useState<K | null>(null);

  // --- スワイプ処理 ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const activeIndex = keys.indexOf(currentTab);

  const activeIndexRef = useRef(activeIndex);
  const tabKeysRef = useRef(keys);
  const onTabChangeRef = useRef(handleTabChange);
  const swipeOffsetRef = useRef(0);
  const isSwipingRef = useRef(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const defaultScrollTopRef = useRef(props.defaultScrollTop);

  // タッチイベントハンドラと後続の layout effect から最新値を参照するための同期
  useLayoutEffect(() => {
    activeIndexRef.current = activeIndex;
    tabKeysRef.current = keys;
    onTabChangeRef.current = handleTabChange;
    defaultScrollTopRef.current = props.defaultScrollTop;
  });

  // まだ表示していないタブの基準スクロール位置。未指定なら最上部(0)。
  const getDefaultScroll = useCallback(() => defaultScrollTopRef.current?.() ?? 0, []);

  // 「スクロールの保存・復元まで処理し終えたタブ」。currentTab が変わってから
  // 下の layout effect が走るまでの1コミットだけ currentTab とずれる。
  const [displayedTab, setDisplayedTab] = useState(currentTab);

  // タブ切替時のスクロール位置の保存・復元。
  // useLayoutEffect でペイント前に同期実行することで、
  // ずれた位置が一瞬見えてからジャンプするちらつきを防ぐ。
  useLayoutEffect(() => {
    const oldTab = displayedTab;
    if (oldTab === currentTab) return;

    // このコミットでは旧パネルがまだ全高のまま残っている（showFullHeight 参照）ため、
    // ドキュメントが縮んで scrollY がクランプされる前に正確な位置を保存できる
    scrollPositionsRef.current[oldTab] = window.scrollY;
    const targetY = scrollPositionsRef.current[currentTab] ?? getDefaultScroll();

    const newOffsets: Record<string, number> = {};
    tabKeysRef.current.forEach(k => {
      newOffsets[k] = k === currentTab ? 0 : targetY - (scrollPositionsRef.current[k] ?? getDefaultScroll());
    });
    setPanelOffsets(newOffsets);
    setLeavingTab(oldTab);
    setDisplayedTab(currentTab);

    window.scrollTo(0, targetY);

    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => setLeavingTab(null), 300);
  }, [currentTab, displayedTab, getDefaultScroll]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const touch = {
      startX: 0,
      startY: 0,
      startTime: 0,
      directionDecided: false,
      isHorizontal: false,
      ignored: false,
    };

    // 横方向のジェスチャーが確定した時点で初めてスワイプ状態に入る。
    // touchstart 時点で入れると、縦スクロールやタップのたびに全パネルが
    // 全高になりドキュメント高さが暴れる。
    const beginSwipe = () => {
      const tabKeys = tabKeysRef.current;
      const activeKey = tabKeys[activeIndexRef.current];
      const currentY = window.scrollY;
      scrollPositionsRef.current[activeKey] = currentY;

      const newOffsets: Record<string, number> = {};
      tabKeys.forEach(k => {
        newOffsets[k] = k === activeKey ? 0 : currentY - (scrollPositionsRef.current[k] ?? (defaultScrollTopRef.current?.() ?? 0));
      });
      setPanelOffsets(newOffsets);

      swipeOffsetRef.current = 0;
      isSwipingRef.current = true;
      setIsSwiping(true);
      setSwipeOffset(0);
    };

    const endSwipe = () => {
      if (!isSwipingRef.current) return;
      swipeOffsetRef.current = 0;
      isSwipingRef.current = false;
      setSwipeOffset(0);
      setIsSwiping(false);
    };

    const handleTouchStart = (e: TouchEvent) => {
      // モーダル(<dialog>)はインラインでレンダリングされるためタッチイベントが
      // ここまでバブリングしてくる。モーダル内で始まったジェスチャーは無視する。
      touch.ignored = !!(e.target as Element | null)?.closest?.("dialog[open]");
      if (touch.ignored) return;

      const t = e.touches[0];
      touch.startX = t.clientX;
      touch.startY = t.clientY;
      touch.startTime = Date.now();
      touch.directionDecided = false;
      touch.isHorizontal = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touch.ignored) return;

      const t = e.touches[0];
      const dx = t.clientX - touch.startX;
      const dy = t.clientY - touch.startY;

      // 最初の移動で方向を判定
      if (!touch.directionDecided) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          touch.directionDecided = true;
          touch.isHorizontal = Math.abs(dx) > Math.abs(dy);
          if (touch.isHorizontal) beginSwipe();
        }
        return;
      }

      if (!touch.isHorizontal || !isSwipingRef.current) return;

      e.preventDefault();

      const idx = activeIndexRef.current;
      const len = tabKeysRef.current.length;

      // 端でのラバーバンド効果
      let offset = dx;
      if ((idx === 0 && dx > 0) || (idx === len - 1 && dx < 0)) {
        offset = dx * 0.3;
      }

      swipeOffsetRef.current = offset;
      setSwipeOffset(offset);
    };

    const handleTouchEnd = () => {
      if (touch.ignored) return;
      if (!touch.isHorizontal || !isSwipingRef.current) return;

      const containerWidth = container.offsetWidth;
      const elapsed = Math.max(Date.now() - touch.startTime, 1);
      const offset = swipeOffsetRef.current;
      const velocity = Math.abs(offset) / elapsed; // px/ms

      const distanceThreshold = containerWidth * 0.25;
      const velocityThreshold = 0.3; // px/ms

      const idx = activeIndexRef.current;
      const tabKeysCurrent = tabKeysRef.current;

      if (Math.abs(offset) > distanceThreshold || velocity > velocityThreshold) {
        if (offset > 0 && idx > 0) {
          onTabChangeRef.current(tabKeysCurrent[idx - 1]);
        } else if (offset < 0 && idx < tabKeysCurrent.length - 1) {
          onTabChangeRef.current(tabKeysCurrent[idx + 1]);
        }
      }

      endSwipe();
    };

    const handleTouchCancel = () => {
      endSwipe();
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, []);

  const translateValue = isSwiping
    ? `calc(${-activeIndex * 100}% + ${swipeOffset}px)`
    : `${-activeIndex * 100}%`;

  // --- TabBar 要素の生成 ---
  const tabBarElement = tabDefs ? (
    <TabBar
      tabs={tabDefs}
      activeTab={currentTab}
      onTabChange={handleTabChange}
    />
  ) : null;

  const renderPanel = children as (tabKey: string, isActive: boolean) => ReactNode;

  // --- レンダリング ---
  const swipeableContent = (
    <div
      ref={containerRef}
      className={`tab-content-container${className ? ` ${className}` : ""}`}
    >
      <div
        className={`tab-content-slider${!isSwiping ? " tab-content-slider--animating" : ""}`}
        style={{ transform: `translateX(${translateValue})` }}
      >
        {keys.map((key) => {
          const isActive = key === currentTab;
          // displayedTab はタブ切替直後の1コミットだけ旧タブを指す。その間も旧パネルの
          // 全高を維持しないと、ドキュメントが縮んで scrollY がクランプされ保存位置が狂う。
          const showFullHeight =
            isActive || isSwiping || key === leavingTab || key === displayedTab;

          const offset = showFullHeight && !isActive ? (panelOffsets[key] ?? 0) : 0;

          return (
            <div
              key={key}
              className={`tab-content-panel${!showFullHeight ? " tab-content-panel--inactive" : ""}`}
              style={offset !== 0 ? { transform: `translateY(${offset}px)` } : undefined}
            >
              <TabPanelBody tabKey={key} isActive={isActive} render={renderPanel} />
            </div>
          );
        })}
      </div>
    </div>
  );

  // renderHeader が指定されている場合は flex column ラッパーで囲む
  if (renderHeader) {
    return (
      <div className="tab-content-wrapper">
        {renderHeader(tabBarElement)}
        {swipeableContent}
      </div>
    );
  }

  return swipeableContent;
}
