import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type DialogProps = {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
};

const Dialog: React.FC<DialogProps> = ({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Accept",
  cancelText = "Cancel",
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
            <div className="mb-4">{children}</div>
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
              >
                {cancelText}
              </button>
              {onConfirm && (
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
                >
                  {confirmText}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Dialog;
