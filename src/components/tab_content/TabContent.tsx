"use client";

import {
  useRef,
  useState,
  useEffect,
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

  // --- スクロール位置の保存・復元 ---
  const scrollPositionsRef = useRef<Record<string, number>>({});

  const handleTabChange = useCallback((key: K) => {
    scrollPositionsRef.current[currentTab as string] = window.scrollY;

    if (!isControlled) {
      const onBeforeChange = (props as TabContentUncontrolledProps<K>).onBeforeChange;
      if (onBeforeChange && !onBeforeChange(key, currentTab)) return;
      setInternalTab(key);
    }
    props.onTabChange?.(key);
  }, [isControlled, currentTab, props]);

  // --- スワイプ処理 ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeIndexRef = useRef(0);
  const tabKeysRef = useRef(keys);
  const onTabChangeRef = useRef(handleTabChange);
  const swipeOffsetRef = useRef(0);
  const isSwipingRef = useRef(false);
  const previousTabRef = useRef(currentTab);

  useEffect(() => {
    if (previousTabRef.current !== currentTab) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      previousTabRef.current = currentTab;
      
      // スクロール位置の復元
      setTimeout(() => {
        const savedPos = scrollPositionsRef.current[currentTab as string] || 0;
        window.scrollTo(0, savedPos);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [currentTab]);

  const activeIndex = keys.indexOf(currentTab);
  activeIndexRef.current = activeIndex;
  tabKeysRef.current = keys;
  onTabChangeRef.current = handleTabChange;

  const touchRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    directionDecided: false,
    isHorizontal: false,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        directionDecided: false,
        isHorizontal: false,
      };
      swipeOffsetRef.current = 0;
      isSwipingRef.current = true;
      setIsSwiping(true);
      setSwipeOffset(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipingRef.current) return;

      const touch = e.touches[0];
      const dx = touch.clientX - touchRef.current.startX;
      const dy = touch.clientY - touchRef.current.startY;

      // 最初の移動で方向を判定
      if (!touchRef.current.directionDecided) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          touchRef.current.directionDecided = true;
          touchRef.current.isHorizontal = Math.abs(dx) > Math.abs(dy);
          if (!touchRef.current.isHorizontal) {
            isSwipingRef.current = false;
            setIsSwiping(false);
          }
        }
        return;
      }

      if (!touchRef.current.isHorizontal) return;

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
      if (!touchRef.current.isHorizontal || !isSwipingRef.current) {
        isSwipingRef.current = false;
        setIsSwiping(false);
        return;
      }

      const containerWidth = container.offsetWidth;
      const elapsed = Math.max(Date.now() - touchRef.current.startTime, 1);
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

      swipeOffsetRef.current = 0;
      isSwipingRef.current = false;
      setSwipeOffset(0);
      setIsSwiping(false);
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
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
          const showFullHeight = isActive || isSwiping || isTransitioning;
          return (
            <div 
              key={key} 
              className={`tab-content-panel${!showFullHeight ? " tab-content-panel--inactive" : ""}`}
            >
              {children(key, isActive)}
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
