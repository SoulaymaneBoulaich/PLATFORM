import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const variants = {
        initial: { opacity: 0, y: -50, x: '-50%' },
        animate: { opacity: 1, y: 0, x: '-50%' },
        exit: { opacity: 0, y: -20, x: '-50%' }
    };

    const styles = {
        success: 'bg-emerald-500 border-emerald-600',
        error: 'bg-red-500 border-red-600',
        info: 'bg-blue-500 border-blue-600',
        warning: 'bg-yellow-500 border-yellow-600'
    };

    const icons = {
        success: <FaCheckCircle className="text-xl" />,
        error: <FaExclamationCircle className="text-xl" />,
        info: <FaInfoCircle className="text-xl" />,
        warning: <FaExclamationCircle className="text-xl" />
    };

    return (
        <motion.div
            layout
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl text-white border ${styles[type] || styles.info} min-w-[320px] max-w-md backdrop-blur-sm bg-opacity-95`}
        >
            <div className="flex-shrink-0">
                {icons[type] || icons.info}
            </div>
            <p className="flex-1 text-sm font-medium">
                {message}
            </p>
            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close"
            >
                <FaTimes />
            </button>
        </motion.div>
    );
};

export default Toast;
