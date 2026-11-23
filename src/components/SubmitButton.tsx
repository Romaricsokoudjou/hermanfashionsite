"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

export function SubmitButton({
  children,
  className,
  pendingText = "Veuillez patienter…",
  name,
  value,
  confirm,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  name?: string;
  value?: string;
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={clsx("btn", className ?? "btn-primary")}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
