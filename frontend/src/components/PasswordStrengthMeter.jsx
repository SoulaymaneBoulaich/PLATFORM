import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const PasswordStrengthMeter = ({ password }) => {
    const [strength, setStrength] = useState({ score: 0, text: '', color: '' });
    const [requirements, setRequirements] = useState({
        length: false,
        number: false,
        special: false
    });

    useEffect(() => {
        if (!password) {
            setStrength({ score: 0, text: '', color: '' });
            setRequirements({ length: false, number: false, special: false });
            return;
        }

        // Check requirements
        const newRequirements = {
            length: password.length >= 8,
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        setRequirements(newRequirements);

        // Calculate strength score
        let score = 0;
        if (newRequirements.length) score++;
        if (newRequirements.number) score++;
        if (newRequirements.special) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;

        // Map score to strength level
        let strengthInfo;
        if (score <= 2) {
            strengthInfo = { score: 33, text: 'Weak', color: 'bg-red-500' };
        } else if (score <= 3) {
            strengthInfo = { score: 66, text: 'Medium', color: 'bg-yellow-500' };
        } else {
            strengthInfo = { score: 100, text: 'Strong', color: 'bg-green-500' };
        }
        setStrength(strengthInfo);
    }, [password]);

    if (!password) return null;

    return (
        <div className="mt-3 space-y-3">
            {/* Strength Bar */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Password Strength</span>
                    <span className={`text-xs font-semibold ${strength.text === 'Weak' ? 'text-red-600' :
                            strength.text === 'Medium' ? 'text-yellow-600' :
                                'text-green-600'
                        }`}>
                        {strength.text}
                    </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                    />
                </div>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-1.5">
                <RequirementItem met={requirements.length} text="At least 8 characters" />
                <RequirementItem met={requirements.number} text="Contains a number" />
                <RequirementItem met={requirements.special} text="Contains special character (!@#$%...)" />
            </div>
        </div>
    );
};

const RequirementItem = ({ met, text }) => (
    <div className="flex items-center gap-2">
        <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${met ? 'bg-green-500' : 'bg-gray-300'
            }`}>
            {met ? (
                <Check className="w-3 h-3 text-white" />
            ) : (
                <X className="w-3 h-3 text-gray-500" />
            )}
        </div>
        <span className={`text-xs ${met ? 'text-green-700' : 'text-gray-600'}`}>
            {text}
        </span>
    </div>
);

export default PasswordStrengthMeter;
