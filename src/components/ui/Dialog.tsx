import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

type DialogSize = "sm" | "md" | "lg" | "xl";

function getSizeClasses(size: DialogSize): string {
  switch (size) {
    case "sm":
      return "max-w-[var(--dialog-sm)]";
    case "lg":
      return "max-w-[var(--dialog-lg)]";
    case "xl":
      return "max-w-[var(--dialog-xl)]";
    case "md":
    default:
      return "max-w-[var(--dialog-md)]";
  }
}

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogPortal({ children }: { children: ReactNode }) {
  return <RadixDialog.Portal>{children}</RadixDialog.Portal>;
}

export function DialogOverlay(props: ComponentPropsWithoutRef<typeof RadixDialog.Overlay>) {
  const { className = "", ...rest } = props;
  return (
    <RadixDialog.Overlay
      className={[
        "fixed inset-0 bg-black/40 backdrop-blur-[1px]",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}

export type DialogContentProps = ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
  size?: DialogSize;
};

export function DialogContent({ size = "md", className = "", children, ...props }: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <RadixDialog.Content
        className={[
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[95vw] rounded-lg bg-neutral-0 shadow-xl",
          getSizeClasses(size),
          "max-h-[85vh] overflow-auto",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
        <RadixDialog.Close
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
          </svg>
        </RadixDialog.Close>
      </RadixDialog.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={["px-6 pt-6", className].join(" ")} {...props} />;
}

export function DialogTitle({ className = "", ...props }: ComponentPropsWithoutRef<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title
      className={["text-lg font-semibold text-neutral-900", className].join(" ")}
      {...props}
    />
  );
}

export function DialogDescription({ className = "", ...props }: ComponentPropsWithoutRef<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      className={["mt-1 text-sm text-neutral-500", className].join(" ")}
      {...props}
    />
  );
}

export function DialogBody({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={["px-6 py-4", className].join(" ")} {...props} />;
}

export function DialogFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={["flex items-center justify-end gap-3 px-6 pb-6", className].join(" ")} {...props} />;
}


