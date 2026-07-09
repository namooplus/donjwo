export type EntityId = number;

export type ISODate = `${number}-${number}-${number}`;

export type TableName =
  | "Person"
  | "Exchange"
  | "Expense"
  | "ExpenseDebtor"
  | "ExpenseSender";

export interface Person {
  id: EntityId;
  name: string;
}

export interface Exchange {
  id: EntityId;
  name: string;
  value: number;
}

export interface Expense {
  id: EntityId;
  name: string;
  index: number;
  date: ISODate;
  payer: EntityId;
  cost: number;
  exchange: EntityId;
}

export interface ExpenseDebtor {
  expense: EntityId;
  debtor: EntityId;
}

export interface ExpenseSender {
  expense: EntityId;
  sender: EntityId;
  verified: boolean;
}

export interface HydratedExpense extends Omit<Expense, "payer" | "exchange"> {
  payer: Person;
  exchange: Exchange;
  debtor: Person[];
  sender: Person[];
  verifiedSender: Person[];
}

export type PersonInsert = Omit<Person, "id"> & Partial<Pick<Person, "id">>;
export type ExchangeInsert = Omit<Exchange, "id"> & Partial<Pick<Exchange, "id">>;
export type ExpenseInsert = Omit<Expense, "id"> & Partial<Pick<Expense, "id">>;
export type ExpenseDebtorInsert = ExpenseDebtor;
export type ExpenseSenderInsert = ExpenseSender;

export type PersonUpdate = Partial<Person>;
export type ExchangeUpdate = Partial<Exchange>;
export type ExpenseUpdate = Partial<Expense>;
export type ExpenseDebtorUpdate = Partial<ExpenseDebtor>;
export type ExpenseSenderUpdate = Partial<ExpenseSender>;

export interface SupabaseDatabase {
  public: {
    Tables: {
      Person: {
        Row: Person;
        Insert: PersonInsert;
        Update: PersonUpdate;
        Relationships: [];
      };
      Exchange: {
        Row: Exchange;
        Insert: ExchangeInsert;
        Update: ExchangeUpdate;
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
            referencedRelation: "Person";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Expense_exchange_fkey";
            columns: ["exchange"];
            referencedRelation: "Exchange";
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
            referencedRelation: "Expense";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ExpenseDebtor_debtor_fkey";
            columns: ["debtor"];
            referencedRelation: "Person";
            referencedColumns: ["id"];
          }
        ];
      };
      ExpenseSender: {
        Row: ExpenseSender;
        Insert: ExpenseSenderInsert;
        Update: ExpenseSenderUpdate;
        Relationships: [
          {
            foreignKeyName: "ExpenseSender_expense_fkey";
            columns: ["expense"];
            referencedRelation: "Expense";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ExpenseSender_sender_fkey";
            columns: ["sender"];
            referencedRelation: "Person";
            referencedColumns: ["id"];
          }
        ];
      };
    };
  };
}
