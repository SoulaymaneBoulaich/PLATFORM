import { useState } from 'react';

const FilterSidebar = ({ onFilterChange, filters }) => {
    const [localFilters, setLocalFilters] = useState(filters || {
        city: '',
        property_type: '',
        listing_type: '',
        minPrice: '',
        maxPrice: '',
        minBedrooms: '',
        minBathrooms: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFilters = { ...localFilters, [name]: value };
        setLocalFilters(updatedFilters);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilterChange(localFilters);
    };

    const handleReset = () => {
        const emptyFilters = {
            city: '',
            property_type: '',
            listing_type: '',
            minPrice: '',
            maxPrice: '',
            minBedrooms: '',
            minBathrooms: '',
        };
        setLocalFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={localFilters.city}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter city"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Type
                    </label>
                    <select
                        name="property_type"
                        value={localFilters.property_type}
                        onChange={handleChange}
                        className="input-field"
                    >
                        <option value="">All Types</option>
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Condo">Condo</option>
                        <option value="Townhouse">Townhouse</option>
                        <option value="Land">Land</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Listing Type
                    </label>
                    <select
                        name="listing_type"
                        value={localFilters.listing_type}
                        onChange={handleChange}
                        className="input-field"
                    >
                        <option value="">All</option>
                        <option value="Sale">For Sale</option>
                        <option value="Rent">For Rent</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Price
                        </label>
                        <input
                            type="number"
                            name="minPrice"
                            value={localFilters.minPrice}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Min"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Price
                        </label>
                        <input
                            type="number"
                            name="maxPrice"
                            value={localFilters.maxPrice}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Max"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Beds
                        </label>
                        <input
                            type="number"
                            name="minBedrooms"
                            value={localFilters.minBedrooms}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Baths
                        </label>
                        <input
                            type="number"
                            name="minBathrooms"
                            value={localFilters.minBathrooms}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="flex space-x-2 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                        Apply Filters
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FilterSidebar;
