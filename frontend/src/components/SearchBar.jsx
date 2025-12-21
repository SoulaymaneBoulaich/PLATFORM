import { useState } from 'react';
import { useRoleTheme } from '../context/RoleThemeContext';

const SearchBar = ({ onSearch }) => {
    const theme = useRoleTheme();
    const [searchParams, setSearchParams] = useState({
        city: '',
        property_type: '',
        minPrice: '',
        maxPrice: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchParams);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                    type="text"
                    name="city"
                    value={searchParams.city}
                    onChange={handleChange}
                    placeholder="City or Location"
                    className="w-full px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 dark:bg-slate-700"
                />

                <select
                    name="property_type"
                    value={searchParams.property_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: '2.5rem' }}
                >
                    <option value="" className="text-gray-500 bg-white dark:bg-slate-800">Property Type</option>
                    <option value="House" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800">House</option>
                    <option value="Apartment" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800">Apartment</option>
                    <option value="Condo" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800">Condo</option>
                    <option value="Townhouse" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800">Townhouse</option>
                    <option value="Land" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800">Land</option>
                </select>

                <input
                    type="number"
                    name="minPrice"
                    value={searchParams.minPrice}
                    onChange={handleChange}
                    placeholder="Min Price"
                    className="w-full px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 dark:bg-slate-700"
                />

                <input
                    type="number"
                    name="maxPrice"
                    value={searchParams.maxPrice}
                    onChange={handleChange}
                    placeholder="Max Price"
                    className="w-full px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 dark:bg-slate-700"
                />
            </div>

            <button
                type="submit"
                className={`w-full mt-4 bg-gradient-to-r ${theme.gradient} hover:${theme.gradientHover} text-white font-semibold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0`}
            >
                🔍 Search Properties
            </button>
        </form>
    );
};

export default SearchBar;
