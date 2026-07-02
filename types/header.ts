export interface HeaderContentProps {
  roomKey: string;
  name: string;
  description: string;
  amount: string;
  total: number;
  loading: boolean;
  expenseCount: number;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onAddExpense: () => void;
}
