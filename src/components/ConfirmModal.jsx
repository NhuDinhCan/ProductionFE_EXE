export default function ConfirmModal({ open, onClose, onConfirm, message }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-2xl p-6 w-[350px] shadow-xl animate-fadeIn">

                <h2 className="text-lg font-bold mb-3">Xác nhận</h2>

                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Đồng Ý
                    </button>
                </div>

            </div>
        </div>
    );
}