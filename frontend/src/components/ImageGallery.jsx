import { useState } from 'react';

const ImageGallery = ({ images, imageUrl }) => {
    const [selectedImage, setSelectedImage] = useState(0);

    // Convert single image_url to images array format for consistency
    let displayImages = images || [];
    if (!displayImages.length && imageUrl) {
        displayImages = [{ image_url: imageUrl, image_id: 1 }];
    }

    if (!displayImages || displayImages.length === 0) {
        return (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <img
                    src="https://via.placeholder.com/800x600?text=No+Image+Available"
                    alt="No image"
                    className="w-full h-full object-cover rounded-lg"
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <img
                    src={displayImages[selectedImage].image_url}
                    alt={`Property image ${selectedImage + 1}`}
                    className="w-full h-96 object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                    }}
                />

                {displayImages.length > 1 && (
                    <>
                        <button
                            onClick={() => setSelectedImage((selectedImage - 1 + displayImages.length) % displayImages.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setSelectedImage((selectedImage + 1) % displayImages.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedImage + 1} / {displayImages.length}
                </div>
            </div>

            {displayImages.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {displayImages.map((image, index) => (
                        <button
                            key={image.image_id || index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative h-20 rounded-lg overflow-hidden ${index === selectedImage ? 'ring-4 ring-primary-600' : 'opacity-70 hover:opacity-100'
                                } transition-all`}
                        >
                            <img
                                src={image.image_url}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
