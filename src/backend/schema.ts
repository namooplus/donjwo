export type EntityId = number;

export type ISODate = `${number}-${number}-${number}`;

export type TableName = "Person" | "Expense" | "ExpenseDebtor";

export type SettlementStatus = "UNSETTLED" | "SETTLING" | "SETTLED";

export type Person = {
  id: EntityId;
  name: string;
};

export type Expense = {
  id: EntityId;
  created_at: string;
  name: string;
  index: number;
  date: ISODate;
  payer: EntityId;
  cost: number;
  exchange: number;
  draft: boolean;
};

export type ExpenseDebtor = {
  expense: EntityId;
  debtor: EntityId;
  settlementStatus: SettlementStatus;
};

export type HydratedExpense = Omit<Expense, "payer"> & {
  payer: Person;
  debtors: (Person & { settlementStatus: SettlementStatus })[];
};

export type PersonInsert = Omit<Person, "id"> & Partial<Pick<Person, "id">>;
export type ExpenseInsert = Pick<Expense, "cost" | "date" | "payer"> &
  Partial<Pick<Expense, "created_at" | "draft" | "exchange" | "id" | "index" | "name">>;
export type ExpenseDebtorInsert = Pick<ExpenseDebtor, "debtor" | "expense"> &
  Partial<Pick<ExpenseDebtor, "settlementStatus">>;

export type PersonUpdate = Partial<Person>;
export type ExpenseUpdate = Partial<Expense>;
export type ExpenseDebtorUpdate = Partial<ExpenseDebtor>;

export type SupabaseDatabase = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      Person: {
        Row: Person;
        Insert: PersonInsert;
        Update: PersonUpdate;
        Relationships: [];
      };
      Expense: {
        Row: Expense;
        Insert: ExpenseInsert;
        Update: ExpenseUpdate;
        Relationships: [
          {
            foreignKeyName: "Expense_payer_fkey";
            columns: ["payer"];
            isOneToOne: false;
            referencedRelation: "Person";
            referencedColumns: ["id"];
          }
        ];
      };
      ExpenseDebtor: {
        Row: ExpenseDebtor;
        Insert: ExpenseDebtorInsert;
        Update: ExpenseDebtorUpdate;
        Relationships: [
          {
            foreignKeyName: "ExpenseDebtor_expense_fkey";
            columns: ["expense"];
            isOneToOne: false;
            referencedRelation: "Expense";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ExpenseDebtor_debtor_fkey";
            columns: ["debtor"];
            isOneToOne: false;
            referencedRelation: "Person";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      SettlementStatus: SettlementStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
