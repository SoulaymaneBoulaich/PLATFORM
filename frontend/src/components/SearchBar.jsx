import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
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
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                    type="text"
                    name="city"
                    value={searchParams.city}
                    onChange={handleChange}
                    placeholder="City or Location"
                    className="input-field"
                />

                <select
                    name="property_type"
                    value={searchParams.property_type}
                    onChange={handleChange}
                    className="input-field"
                >
                    <option value="">Property Type</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Land">Land</option>
                </select>

                <input
                    type="number"
                    name="minPrice"
                    value={searchParams.minPrice}
                    onChange={handleChange}
                    placeholder="Min Price"
                    className="input-field"
                />

                <input
                    type="number"
                    name="maxPrice"
                    value={searchParams.maxPrice}
                    onChange={handleChange}
                    placeholder="Max Price"
                    className="input-field"
                />
            </div>

            <button type="submit" className="btn-primary w-full mt-4">
                Search Properties
            </button>
        </form>
    );
};

export default SearchBar;
