import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
  const [detailReturnScreen, setDetailReturnScreen] =
    useState<DetailReturnScreen>("expense-history");
  const activeScreen = navigation.screen;

  const navigateTo = (nextScreen: ScreenKey) => {
    setNavigation((currentNavigation) => {
      if (currentNavigation.screen === nextScreen) {
        return currentNavigation;
      }

      return {
        screen: nextScreen,
        direction: getNavigationDirection(currentNavigation.screen, nextScreen)
      };
    });
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
        isRefreshing={isSnapshotRefreshing}
        onOpenExpenseHistory={() => navigateTo("expense-history")}
        onOpenExpensePersonal={() => navigateTo("expense-personal")}
        onOpenExpenseDetail={(expenseId) => openExpenseDetail(expenseId, "home")}
        onTabChange={setActiveHomeTab}
        onRefresh={refreshSnapshot}
        onSendExpense={markExpenseSent}
        onReceiveExpense={markExpenseReceived}
      />
    ) : activeScreen === "expense-history" ? (
      <ExpenseHistoryScreen
        snapshot={expenseSnapshot}
        onBack={() => navigateTo("home")}
        onOpenExpenseAdd={() => navigateTo("expense-add")}
        onOpenExpenseDetail={(expenseId) =>
          openExpenseDetail(expenseId, "expense-history")
        }
      />
    ) : activeScreen === "expense-history-detail" ? (
      <ExpenseHistoryDetailScreen
        snapshot={expenseSnapshot}
        expenseId={selectedExpenseId}
        onBack={() => navigateTo(detailReturnScreen)}
        onDeleteExpense={deleteExpense}
      />
    ) : activeScreen === "expense-personal" ? (
      <ExpensePersonalScreen
        snapshot={expenseSnapshot}
        onBack={() => navigateTo("home")}
        onOpenExpenseDetail={(expenseId) =>
          openExpenseDetail(expenseId, "expense-personal")
        }
      />
    ) : (
      <ExpenseAddScreen
        snapshot={expenseSnapshot}
        onBack={() => navigateTo("expense-history")}
        onCreateExpense={createExpense}
      />
    );

  return (
    <main className="min-h-screen bg-[#f2f4f6] text-[#111827]">
      <div className="min-h-screen w-full overflow-hidden">
        {isInitialSnapshotLoading ? (
          <SplashScreen />
        ) : (
          <ScreenTransition screen={activeScreen} direction={navigation.direction}>
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
  children: ReactNode;
};

function ScreenTransition({ screen, direction, children }: ScreenTransitionProps) {
  return (
    <div className="app-screen-frame">
      <div
        className={`app-screen-transition app-screen-transition-${direction}`}
        key={screen}
      >
        {children}
      </div>
    </div>
  );
}

export default App;
