import type { ReactNode, RefObject } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import {
  type CreateExpenseInput,
  createExpenseWithDebtors,
  deleteExpenseWithDebtors,
  getBackendSnapshot,
  updateExpenseDebtorSettlementStatus
} from "@/backend/queries";
import { hasSupabaseConfig } from "@/backend/supabase";
import { ExpenseAddScreen } from "@/components/screens/expense-add";
import { ExpenseHistoryScreen } from "@/components/screens/expense-history";
import { ExpenseHistoryDetailScreen } from "@/components/screens/expense-history-detail";
import { ExpensePersonalScreen } from "@/components/screens/expense-personal";
import { HomeScreen, type HomeTabKey } from "@/components/screens/home";
import { SplashScreen } from "@/components/screens/splash";

type ScreenKey =
  | "home"
  | "expense-history"
  | "expense-history-detail"
  | "expense-add"
  | "expense-personal";
type NavigationDirection = "forward" | "back";
type DetailReturnScreen = "home" | "expense-history" | "expense-personal";
type ScrollKey = Exclude<ScreenKey, "home"> | `home:${HomeTabKey}`;

const screenDepth: Record<ScreenKey, number> = {
  home: 0,
  "expense-history": 1,
  "expense-personal": 1,
  "expense-history-detail": 2,
  "expense-add": 2
};

function getNavigationDirection(
  currentScreen: ScreenKey,
  nextScreen: ScreenKey
): NavigationDirection {
  return screenDepth[nextScreen] >= screenDepth[currentScreen] ? "forward" : "back";
}

function getScrollKey(screen: ScreenKey, homeTab: HomeTabKey): ScrollKey {
  return screen === "home" ? `home:${homeTab}` : screen;
}

function App() {
  const [navigation, setNavigation] = useState<{
    screen: ScreenKey;
    direction: NavigationDirection;
  }>({
    screen: "home",
    direction: "forward"
  });
  const [expenseSnapshot, setExpenseSnapshot] = useState<BackendSnapshot | null>(null);
  const [isInitialSnapshotLoading, setIsInitialSnapshotLoading] = useState(
    hasSupabaseConfig()
  );
  const [isSnapshotRefreshing, setIsSnapshotRefreshing] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [activeHomeTab, setActiveHomeTab] = useState<HomeTabKey>("summary");
  const [selectedSenderId, setSelectedSenderId] = useState<number | null>(null);
  const [selectedReceiverId, setSelectedReceiverId] = useState<number | null>(null);
  const [selectedPersonalId, setSelectedPersonalId] = useState<number | null>(null);
  const [detailReturnScreen, setDetailReturnScreen] =
    useState<DetailReturnScreen>("expense-history");
  const scrollPositionsRef = useRef<Partial<Record<ScrollKey, number>>>({});
  const activeScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isRestoringScrollRef = useRef(false);
  const activeScreen = navigation.screen;
  const activeScrollKey = getScrollKey(activeScreen, activeHomeTab);

  const saveScrollPosition = (scrollKey: ScrollKey) => {
    if (isRestoringScrollRef.current) {
      return;
    }

    scrollPositionsRef.current[scrollKey] =
      activeScrollContainerRef.current?.scrollTop ?? 0;
  };

  const resetScrollPosition = (scrollKey: ScrollKey) => {
    delete scrollPositionsRef.current[scrollKey];

    if (scrollKey === activeScrollKey && activeScrollContainerRef.current) {
      activeScrollContainerRef.current.scrollTop = 0;
    }
  };

  const resetHomeTabState = (tab: HomeTabKey) => {
    resetScrollPosition(getScrollKey("home", tab));

    if (tab === "send") {
      setSelectedSenderId(null);
    }

    if (tab === "receive") {
      setSelectedReceiverId(null);
    }
  };

  const resetScreenState = (screen: ScreenKey, nextScreen: ScreenKey) => {
    if (nextScreen === "expense-history-detail") {
      return;
    }

    if (screen === "home") {
      resetHomeTabState(activeHomeTab);
      return;
    }

    if (screen === "expense-personal") {
      resetScrollPosition("expense-personal");
      setSelectedPersonalId(null);
    }
  };

  const navigateTo = (nextScreen: ScreenKey) => {
    setNavigation((currentNavigation) => {
      if (currentNavigation.screen === nextScreen) {
        return currentNavigation;
      }

      saveScrollPosition(activeScrollKey);
      resetScreenState(currentNavigation.screen, nextScreen);

      return {
        screen: nextScreen,
        direction: getNavigationDirection(currentNavigation.screen, nextScreen)
      };
    });
  };

  const saveActiveScrollPosition = () => {
    saveScrollPosition(activeScrollKey);
  };

  const changeHomeTab = (nextTab: HomeTabKey) => {
    if (nextTab === activeHomeTab) {
      return;
    }

    saveScrollPosition(activeScrollKey);
    resetHomeTabState(activeHomeTab);
    setActiveHomeTab(nextTab);
  };

  const changeSender = (personId: number) => {
    setSelectedSenderId(personId);
    resetScrollPosition("home:send");
  };

  const changeReceiver = (personId: number) => {
    setSelectedReceiverId(personId);
    resetScrollPosition("home:receive");
  };

  const changePersonalPerson = (personId: number) => {
    setSelectedPersonalId(personId);
    resetScrollPosition("expense-personal");
  };

  const closeExpenseHistory = () => {
    resetScrollPosition("expense-history");
    navigateTo("home");
  };

  const closeExpenseHistoryDetail = () => {
    resetScrollPosition("expense-history-detail");
    navigateTo(detailReturnScreen);
  };

  const closeExpenseAdd = () => {
    resetScrollPosition("expense-add");
    navigateTo("expense-history");
  };

  const refreshSnapshot = async () => {
    if (!hasSupabaseConfig()) {
      return;
    }

    setIsSnapshotRefreshing(true);

    try {
      setExpenseSnapshot(await getBackendSnapshot());
    } catch {
    } finally {
      setIsSnapshotRefreshing(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    if (!hasSupabaseConfig()) {
      setIsInitialSnapshotLoading(false);
      return;
    }

    getBackendSnapshot()
      .then((snapshot) => {
        if (isCurrent) {
          setExpenseSnapshot(snapshot);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isCurrent) {
          setIsInitialSnapshotLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useLayoutEffect(() => {
    let animationFrameId: number | null = null;
    let attemptCount = 0;
    const targetScrollTop = scrollPositionsRef.current[activeScrollKey] ?? 0;

    const restoreScrollPosition = () => {
      const scrollContainer = activeScrollContainerRef.current;

      if (!scrollContainer) {
        return;
      }

      isRestoringScrollRef.current = true;
      scrollContainer.scrollTop = targetScrollTop;
      attemptCount += 1;

      const canReachTarget =
        scrollContainer.scrollHeight - scrollContainer.clientHeight >= targetScrollTop;
      const hasReachedTarget =
        Math.abs(scrollContainer.scrollTop - targetScrollTop) <= 1;

      if (targetScrollTop > 0 && (!canReachTarget || !hasReachedTarget)) {
        if (attemptCount < 20) {
          animationFrameId = window.requestAnimationFrame(restoreScrollPosition);
          return;
        }
      }

      isRestoringScrollRef.current = false;
    };

    animationFrameId = window.requestAnimationFrame(restoreScrollPosition);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      isRestoringScrollRef.current = false;
    };
  }, [activeScrollKey]);

  const markExpenseSent = async (expenseId: number, debtorId: number) => {
    await updateExpenseDebtorSettlementStatus(expenseId, debtorId, "SETTLING");
    await refreshSnapshot();
  };

  const markExpenseReceived = async (expenseId: number, debtorId: number) => {
    await updateExpenseDebtorSettlementStatus(expenseId, debtorId, "SETTLED");
    await refreshSnapshot();
  };

  const createExpense = async (input: CreateExpenseInput) => {
    await createExpenseWithDebtors(input);
    await refreshSnapshot();
    navigateTo("expense-history");
  };

  const openExpenseDetail = (expenseId: number, returnScreen: DetailReturnScreen) => {
    setSelectedExpenseId(expenseId);
    setDetailReturnScreen(returnScreen);
    navigateTo("expense-history-detail");
  };

  const deleteExpense = async (expenseId: number) => {
    await deleteExpenseWithDebtors(expenseId);
    setSelectedExpenseId(null);
    await refreshSnapshot();
    navigateTo("expense-history");
  };

  const activeScreenElement =
    activeScreen === "home" ? (
      <HomeScreen
        snapshot={expenseSnapshot}
        activeTab={activeHomeTab}
        selectedSenderId={selectedSenderId}
        selectedReceiverId={selectedReceiverId}
        isRefreshing={isSnapshotRefreshing}
        onOpenExpenseHistory={() => navigateTo("expense-history")}
        onOpenExpensePersonal={() => navigateTo("expense-personal")}
        onOpenExpenseDetail={(expenseId) => openExpenseDetail(expenseId, "home")}
        onSenderChange={changeSender}
        onReceiverChange={changeReceiver}
        onTabChange={changeHomeTab}
        onRefresh={refreshSnapshot}
        onSendExpense={markExpenseSent}
        onReceiveExpense={markExpenseReceived}
      />
    ) : activeScreen === "expense-history" ? (
      <ExpenseHistoryScreen
        snapshot={expenseSnapshot}
        onBack={closeExpenseHistory}
        onOpenExpenseAdd={() => navigateTo("expense-add")}
        onOpenExpenseDetail={(expenseId) =>
          openExpenseDetail(expenseId, "expense-history")
        }
      />
    ) : activeScreen === "expense-history-detail" ? (
      <ExpenseHistoryDetailScreen
        snapshot={expenseSnapshot}
        expenseId={selectedExpenseId}
        onBack={closeExpenseHistoryDetail}
        onDeleteExpense={deleteExpense}
      />
    ) : activeScreen === "expense-personal" ? (
      <ExpensePersonalScreen
        snapshot={expenseSnapshot}
        selectedPersonId={selectedPersonalId}
        onBack={() => navigateTo("home")}
        onPersonChange={changePersonalPerson}
        onOpenExpenseDetail={(expenseId) =>
          openExpenseDetail(expenseId, "expense-personal")
        }
      />
    ) : (
      <ExpenseAddScreen
        snapshot={expenseSnapshot}
        onBack={closeExpenseAdd}
        onCreateExpense={createExpense}
      />
    );

  return (
    <main className="min-h-screen bg-[#f2f4f6] text-[#111827]">
      <div className="min-h-screen w-full overflow-hidden">
        {isInitialSnapshotLoading ? (
          <SplashScreen />
        ) : (
          <ScreenTransition
            screen={activeScreen}
            direction={navigation.direction}
            scrollContainerRef={activeScrollContainerRef}
            onScroll={saveActiveScrollPosition}
          >
            {activeScreenElement}
          </ScreenTransition>
        )}
      </div>
    </main>
  );
}

type ScreenTransitionProps = {
  screen: ScreenKey;
  direction: NavigationDirection;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  children: ReactNode;
};

function ScreenTransition({
  screen,
  direction,
  scrollContainerRef,
  onScroll,
  children
}: ScreenTransitionProps) {
  return (
    <div className="app-screen-frame">
      <div
        ref={scrollContainerRef}
        className={`app-screen-transition app-screen-transition-${direction}`}
        key={screen}
        onScroll={onScroll}
      >
        {children}
      </div>
    </div>
  );
}

export default App;
