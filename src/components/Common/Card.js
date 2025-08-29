import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, ...props }) => {
    return (
        <motion.div
            className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${className}`}
            whileHover={hover ? { y: -2, shadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)" } : {}}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;