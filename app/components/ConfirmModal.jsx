"use client";

import { useEffect, useRef } from "react";

export default function ConfirmModal({
    open,
    title = "Hapus data?",
    description,
    onCancel,
    onConfirm,
    loading = false,
    error = "",
    confirmText = "Ya, Hapus",
    variant = "danger",
}) {
    const dialogRef = useRef(null);
    const danger = variant === "danger";

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            aria-label={title}
            onCancel={(e) => {
                e.preventDefault();

                if (!loading) onCancel();
            }}
            className="fixed inset-0 m-auto max-h-[90vh] w-[90%] max-w-md overflow-y-auto rounded-[30px] border border-white/90 bg-white p-8 text-[#29496b] shadow-[0_25px_80px_rgba(80,125,170,0.25)] backdrop:bg-[#29496b]/30 backdrop:backdrop-blur-sm"
        >
            <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-full border ${
                    danger
                        ? "border-[#F0D5D8] bg-[#FCF2F5] text-[#CE7B84]"
                        : "border-[#C8DFF2] bg-[#EAF3FC] text-[#527DA8]"
                }`}
            >
                <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    {danger ? (
                        <>
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 10v6" />
                            <path d="M14 10v6" />
                        </>
                    ) : (
                        <>
                            <path d="M12 2v10" />
                            <path d="M6.4 5.4a9 9 0 1 0 11.2 0" />
                        </>
                    )}
                </svg>
            </div>

            <p className="mb-3 text-[10px] tracking-[0.18em] text-[#83a5c7]">
                HARMONI · KONFIRMASI
            </p>

            <h2 className="text-2xl font-semibold text-[#315779]">
                {title}
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#7196bb]">
                {description}
            </p>

            {error && (
                <div
                    role="alert"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
                >
                    {error}
                </div>
            )}

            <div className="mt-8 flex gap-3">

                <button
                    type="button"
                    autoFocus
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 rounded-full border border-[#b8d1e9]/60 bg-[#eaf3fc] px-5 py-3 text-sm font-medium text-[#52799f] transition hover:bg-[#d5e9fb] disabled:opacity-50"
                >
                    Batal
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className={`flex-1 rounded-full px-5 py-3 text-sm font-medium text-white transition disabled:opacity-50 ${
                        danger
                            ? "bg-[#CE7B84] hover:bg-[#b96770]"
                            : "bg-[#527DA8] hover:bg-[#315779]"
                    }`}
                >
                    {loading ? "Memproses..." : confirmText}
                </button>

            </div>
        </dialog>
    );
}