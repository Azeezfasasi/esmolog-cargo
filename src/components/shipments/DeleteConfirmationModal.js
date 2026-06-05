import React from "react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, shipment }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md w-full max-w-md p-6 z-50">
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Confirm Deletion
        </h2>
        <p className="mb-6">
          Are you sure you want to delete shipment{" "}
          <span className="font-bold text-blue-600">
            #{shipment?.trackingNumber}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={async () => {
              console.log("Deleting ship", shipment._id);
              await onConfirm(shipment._id); // wait for deletion
              console.log("Deleting", shipment._id);
              onClose(); // only close if successful
            }}
          >
            Delete
          </button>

        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
