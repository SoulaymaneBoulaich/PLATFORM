import { useState } from 'react';
import api from '../services/api';

const AppointmentForm = ({ propertyId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        appointmentDate: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.appointmentDate) {
            setError('Please select a date and time');
            return;
        }

        try {
            setLoading(true);
            await api.post('/appointments', {
                property_id: propertyId,
                appointment_date: formData.appointmentDate,
                notes: formData.notes
            });

            // Reset form
            setFormData({ appointmentDate: '', notes: '' });

            // Call success callback
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to schedule appointment');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date & Time
                </label>
                <input
                    type="datetime-local"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="input-field w-full"
                    required
                />
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any specific requirements or questions..."
                    className="input-field w-full"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                >
                    {loading ? 'Scheduling...' : 'Schedule Appointment'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default AppointmentForm;
