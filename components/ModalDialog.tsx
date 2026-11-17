"use client";
import { useEffect, useRef } from "react";

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  ariaLabel?: string;
  className?: string;
  backdropDark?: boolean;
  children: React.ReactNode;
}

/**
 * Native <dialog> modal wrapper dengan showModal(), Esc handling bawaan,
 * light-dismiss (termasuk fallback koordinat untuk Safari), dan overscroll containment.
 */
export default function ModalDialog({
  open,
  onClose,
  labelledBy,
  ariaLabel,
  className = "",
  backdropDark = false,
  children,
}: ModalDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const isPointerOutside = (e: React.PointerEvent<HTMLDialogElement>, dialog: HTMLDialogElement) => {
    const rect = dialog.getBoundingClientRect();
    return (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    );
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-label={!labelledBy ? ariaLabel : undefined}
      onClose={onClose}
      onPointerDown={(e) => {
        const dialog = ref.current;
        if (!dialog) return;
        pressedOutsideRef.current = isPointerOutside(e, dialog);
      }}
      onPointerUp={(e) => {
        const dialog = ref.current;
        if (!dialog) return;
        if (pressedOutsideRef.current && isPointerOutside(e, dialog)) {
          onClose();
        }
        pressedOutsideRef.current = false;
      }}
      className={`psb-dialog ${backdropDark ? "psb-dialog-dark" : ""} ${className}`}
    >
      {open ? children : null}
    </dialog>
  );
}
