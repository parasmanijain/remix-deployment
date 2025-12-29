import { Expense } from 'models';
import ExpenseListItem from './ExpenseListItem';

type ExpensesListProps = {
  expenses: Expense[];
};

function ExpensesList({ expenses }: ExpensesListProps) {
  return (
    <ol id='expenses-list'>
      {expenses.map((expense) => (
        <li key={expense.id}>
          <ExpenseListItem
            id={expense.id}
            title={expense.title}
            amount={expense.amount}
          />
        </li>
      ))}
    </ol>
  );
}

export default ExpensesList;
