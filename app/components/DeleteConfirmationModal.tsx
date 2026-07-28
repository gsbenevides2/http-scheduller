interface DeleteConfirmationModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirmar Exclusão</h3>
        <p className="py-4">
          Tem certeza que deseja excluir este item? Esta ação não pode
          ser desfeita.
        </p>
        {errorMessage ? (
          <div className="mb-4 text-red-400 text-sm">{errorMessage}</div>
        ) : null}
        <div className="modal-action">
          <button className="btn" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </button>
          <button
            className="btn btn-error"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onClick={() => !isDeleting && onCancel()}
      >
        <button type="button">close</button>
      </form>
    </dialog>
  );
}
