import {
  Form,
  Link,
  useActionData,
  useMatches,
  useParams,
  useNavigation,
} from "@remix-run/react";
import type { FC } from "react";

/**
 * Domain types
 */
interface Expense {
  readonly id: string;
  readonly title: string;
  readonly amount: number;
  readonly date: Date;
}

type ValidationErrors = Record<string, string> | undefined;

interface ExpenseFormDefaultValues {
  readonly title: string;
  readonly amount: string | number;
  readonly date: string;
}

const ExpenseForm: FC = () => {
  const today = new Date().toISOString().slice(0, 10);

  const validationErrors = useActionData<ValidationErrors>();
  const params = useParams<{ readonly id?: string }>();
  const navigation = useNavigation();
  const matches = useMatches();

  /**
   * Get expenses from parent route: routes/_app.expenses
   * Remix doesn't strongly type match.data, so we cast safely.
   */
  const expenses = matches.find((match) => match.id === "routes/_app.expenses")
    ?.data as readonly Expense[] | undefined;

  const expenseData = expenses?.find((expense) => expense.id === params.id);

  if (params.id && !expenseData) {
    return <p>Invalid expense id.</p>;
  }

  const defaultValues: ExpenseFormDefaultValues = expenseData
    ? {
      title: expenseData.title,
      amount: expenseData.amount,
      date: new Date(expenseData.date).toISOString(),
    } as const
    : {
      title: "",
      amount: "",
      date: "",
    } as const;

  const isSubmitting = navigation.state !== "idle";

  return (
    <Form
      method={expenseData ? "patch" : "post"}
      className="form"
      id="expense-form"
    >
      <p>
        <label htmlFor="title">Expense Title</label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxLength={30}
          defaultValue={defaultValues.title}
        />
      </p>

      <div className="form-row">
        <p>
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            min="0"
            step="0.01"
            required
            defaultValue={defaultValues.amount}
          />
        </p>
        <p>
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            max={today}
            required
            defaultValue={
              defaultValues.date ? defaultValues.date.slice(0, 10) : ""
            }
          />
        </p>
      </div>
      {validationErrors && (
        <ul>
          {Object.values(validationErrors).map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <div className="form-actions">
        <button
          disabled={isSubmitting}
          formMethod={expenseData ? "patch" : "post"}
        >
          {isSubmitting ? "Saving..." : "Save Expense"}
        </button>
        <Link to="..">Cancel</Link>
      </div>
    </Form>
  );
};

export default ExpenseForm;
