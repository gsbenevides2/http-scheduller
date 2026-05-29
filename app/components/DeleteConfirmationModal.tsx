interface DeleteConfirmationModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirmar Exclusão</h3>
        <p className="py-4">
          Tem certeza que deseja excluir este agendamento? Esta ação não pode
          ser desfeita.
        </p>
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
