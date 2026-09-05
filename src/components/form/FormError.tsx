/**
 * The form-level error summary.
 *
 * `role="alert"` is the point of this component. Without it a submission that
 * fails validation renders new text into a div, the page does not navigate,
 * and a screen-reader user gets no indication that anything happened — which
 * is exactly the state the verification portal is in today.
 */
export function FormError({ message }: { message?: string }) {
  return (
    <div role="alert" aria-live="assertive" className="empty:hidden">
      {message && (
        <p className="rounded-2xl border border-danger/25 bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
          {message}
        </p>
      )}
    </div>
  );
}
