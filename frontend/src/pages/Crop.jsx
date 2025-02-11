import React, { useState, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiImage, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import axios from '../api';

const Crop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        if (!user?.handle) return;
        const { data } = await axios.get(`/api/images/user/${user.handle}`);
        setImages(data);
      } catch (error) {
        setToast({
          show: true,
          message: error.response?.data?.message || 'Failed to fetch images',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [user?.handle]);

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleCropComplete = async (crop) => {
    if (!selectedImage || !crop.width || !crop.height) return;

    const img = document.querySelector('.crop-image');
    if (!img) return;

    const croppedBlob = await getCroppedImg(img, crop);
    const croppedUrl = URL.createObjectURL(croppedBlob);
    setCroppedImageUrl(croppedUrl);
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    });
    setCroppedImageUrl(null);
  };

  const handleSaveCrop = async () => {
    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob);

      await axios.put(`/api/images/${selectedImage.imageId}/crop`, formData);
      
      setImages(images.map(img => 
        img.imageId === selectedImage.imageId 
          ? { ...img, updatedAt: new Date().toISOString() } 
          : img
      ));
      
      setToast({
        show: true,
        message: 'Image cropped successfully',
        type: 'success'
      });
      
      setSelectedImage(null);
      setCroppedImageUrl(null);
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to crop image',
        type: 'error'
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#101113] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#101113] flex items-center justify-center">
      <div className="text-red-500">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#101113]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            {selectedImage && (
              <button
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 rounded-lg border border-white/5 
                        bg-surface-2/50 hover:bg-surface-2 
                        flex items-center justify-center transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-white/75" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <FiImage className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {selectedImage 
                    ? `Cropping i.exlt.tech/${selectedImage.imageId}`
                    : 'Crop Images'
                  }
                </h1>
                {selectedImage && (
                  <p className="text-gray-400 mt-1">Select an area to crop</p>
                )}
              </div>
            </div>
          </div>

          {selectedImage ? (
            <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={handleCropComplete}
              >
                <img
                  src={`https://i.exlt.tech/${selectedImage.imageId}`}
                  className="crop-image max-h-[70vh] w-auto mx-auto"
                  crossOrigin="anonymous"
                />
              </ReactCrop>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2 flex items-center gap-2 text-gray-400 hover:text-white 
                            hover:bg-white/5 rounded-md transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveCrop}
                  disabled={!croppedImageUrl}
                  className="px-4 py-2 flex items-center gap-2 bg-primary hover:bg-primary-hover 
                            text-white rounded-md transition-colors disabled:opacity-50"
                >
                  <FiCheck className="w-4 h-4" />
                  Save Crop
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5">
              {images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                  {images.map(image => (
                    <div
                      key={image.imageId}
                      onClick={() => handleImageSelect(image)}
                      className="aspect-video bg-surface-2/50 rounded-lg overflow-hidden border border-white/5 
                                cursor-pointer hover:border-red-500/50 transition-colors group"
                    >
                      <div className="relative h-full">
                        <img
                          src={`https://i.exlt.tech/${image.imageId}`}
                          alt="Gallery"
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 
                                    group-hover:opacity-100 transition-opacity p-4 text-center">
                          <span className="text-white font-medium mb-2">Click to crop</span>
                          <span className="text-red-500 text-lg font-medium break-all">
                            i.exlt.tech/{image.imageId}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <FiImage className="w-16 h-16 text-text-secondary mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Images Available</h3>
                  <p className="text-text-secondary text-center max-w-md">
                    Upload some images to exlt.tech to use the crop tool
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'error' })}
        />
      )}
    </div>
  );
};

export default Crop;