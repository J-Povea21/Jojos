import { forwardRef, useImperativeHandle, useRef } from 'react'

const ConfirmModal = forwardRef(function ConfirmModal(_props, ref) {
  const dialogRef = useRef(null)
  const stateRef = useRef({ title: '', description: '', confirmLabel: 'Confirm', onConfirm: null })

  useImperativeHandle(ref, () => ({
    open(opts) {
      stateRef.current = {
        title: opts?.title || 'Are you sure?',
        description: opts?.description || '',
        confirmLabel: opts?.confirmLabel || 'Confirm',
        onConfirm: opts?.onConfirm || null,
      }
      // Force re-render with imperative DOM update — keep simple
      const dlg = dialogRef.current
      if (!dlg) return
      dlg.querySelector('[data-title]').textContent = stateRef.current.title
      dlg.querySelector('[data-desc]').textContent = stateRef.current.description
      dlg.querySelector('[data-confirm]').textContent = stateRef.current.confirmLabel
      dlg.showModal()
    },
    close() {
      dialogRef.current?.close()
    },
  }))

  function handleConfirm() {
    const cb = stateRef.current.onConfirm
    dialogRef.current?.close()
    if (cb) cb()
  }

  function handleCancel() {
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto h-fit rounded-xl border border-jojo-gray p-0 backdrop:bg-black/50 max-w-md w-[90vw] shadow-2xl"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div className="p-6 flex flex-col gap-3">
        <h2 id="confirm-title" data-title className="text-lg font-bold text-jojo-magenta">
          Are you sure?
        </h2>
        <p id="confirm-desc" data-desc className="text-sm text-gray-700">This action cannot be undone.</p>
        <div className="mt-4 flex gap-3 justify-end">
          {/*
            DARK PATTERN: The "Cancel" button is styled in the brand-pink
            primary color — the same styling normally reserved for the
            preferred/confirmation action. This visually nudges users toward
            cancelling the destructive action they originally intended,
            while the actual destructive button uses neutral/muted styling.
          */}
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2 rounded-lg bg-jojo-pink text-white font-bold hover:bg-jojo-magenta transition-colors shadow"
          >
            Cancel
          </button>
          <button
            type="button"
            data-confirm
            onClick={handleConfirm}
            className="px-3 py-2 rounded-lg bg-white text-gray-500 text-sm border border-jojo-gray hover:text-gray-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  )
})

export default ConfirmModal
