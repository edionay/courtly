import { useEffect, useRef } from "react";
import { Button } from "../../shared/ui/Button";

export type CourtCreatedDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onGoToCourts: () => void;
};

export function CourtCreatedDialog({
  isOpen,
  onClose,
  onGoToCourts,
}: CourtCreatedDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="court-created-dialog-title"
      aria-describedby="court-created-dialog-desc"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto p-6 md:p-8 bg-surface rounded-card shadow-card max-w-[420px] w-[calc(100%-32px)] border-0 text-foreground backdrop:bg-[#0B2436]/55"
    >
      <div className="relative">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute -top-2 -right-2 p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg border-0 bg-transparent"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="w-[42px] h-[42px] rounded-full bg-[#E5F0F5] flex items-center justify-center text-primary mb-4">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m5 13 4 4L19 7"
            />
          </svg>
        </div>

        <h2
          id="court-created-dialog-title"
          className="text-xl md:text-2xl font-bold text-foreground m-0 pr-8"
        >
          Court created
        </h2>

        <p
          id="court-created-dialog-desc"
          className="mt-2 text-sm md:text-base text-muted-foreground m-0"
        >
          Your court is ready.
        </p>

        <div className="mt-8">
          <Button
            className="w-full rounded-full"
            variant="primary"
            onClick={onGoToCourts}
          >
            Go to courts
          </Button>
        </div>
      </div>
    </dialog>
  );
}
