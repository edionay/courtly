import { useEffect, useRef } from "react";
import { Button } from "../../shared/ui/Button";

export type BookingConfirmedDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onGoToBookings: () => void;
};

export type TimeUnavailableDialogProps = {
  isOpen: boolean;
  message?: string;
  onClose: () => void;
  onChooseAnotherTime: () => void;
};

export function BookingConfirmedDialog({
  isOpen,
  onClose,
  onGoToBookings,
}: BookingConfirmedDialogProps) {
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
      aria-labelledby="confirmed-dialog-title"
      aria-describedby="confirmed-dialog-desc"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto p-6 md:p-8 bg-surface rounded-card shadow-card max-w-[480px] w-[calc(100%-32px)] border-0 text-foreground backdrop:bg-[#0B2436]/55"
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
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2
          id="confirmed-dialog-title"
          className="text-xl md:text-2xl font-bold text-foreground m-0 pr-8"
        >
          Booking confirmed
        </h2>

        <p
          id="confirmed-dialog-desc"
          className="mt-3 text-sm md:text-base text-muted-foreground m-0"
        >
          Your booking has been confirmed.
        </p>

        <div className="mt-8">
          <Button
            className="w-full rounded-full"
            variant="primary"
            onClick={onGoToBookings}
          >
            Go to my bookings
          </Button>
        </div>
      </div>
    </dialog>
  );
}

export function TimeUnavailableDialog({
  isOpen,
  message = "This time slot is no longer available. Please choose another time.",
  onClose,
  onChooseAnotherTime,
}: TimeUnavailableDialogProps) {
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
      aria-labelledby="conflict-dialog-title"
      aria-describedby="conflict-dialog-desc"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto p-6 md:p-8 bg-surface rounded-card shadow-card max-w-[480px] w-[calc(100%-32px)] border-0 text-foreground backdrop:bg-[#0B2436]/55"
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
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2
          id="conflict-dialog-title"
          className="text-xl md:text-2xl font-bold text-foreground m-0 pr-8"
        >
          Time no longer available
        </h2>

        <p
          id="conflict-dialog-desc"
          className="mt-3 text-sm md:text-base text-muted-foreground m-0"
        >
          {message}
        </p>

        <div className="mt-8">
          <Button
            className="w-full rounded-full"
            variant="primary"
            onClick={onChooseAnotherTime}
          >
            Choose another time
          </Button>
        </div>
      </div>
    </dialog>
  );
}
