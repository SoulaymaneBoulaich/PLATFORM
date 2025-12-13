import { motion } from 'framer-motion';

const RoleCard = ({ icon, title, description, selected, onClick }) => {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
        relative w-full p-6 rounded-xl border-2 transition-all duration-200 text-left
        ${selected
                    ? 'border-primary-500 bg-primary-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                }
      `}
        >
            {/* Selection Indicator */}
            {selected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>
            )}

            {/* Icon */}
            <div className={`
        w-12 h-12 rounded-lg flex items-center justify-center mb-4
        ${selected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}
      `}>
                {icon}
            </div>

            {/* Content */}
            <h3 className={`text-lg font-semibold mb-2 ${selected ? 'text-primary-900' : 'text-gray-900'}`}>
                {title}
            </h3>
            <p className={`text-sm ${selected ? 'text-primary-700' : 'text-gray-600'}`}>
                {description}
            </p>
        </motion.button>
    );
};

export default RoleCard;
