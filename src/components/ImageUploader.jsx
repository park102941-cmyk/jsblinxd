import React, { useState, useEffect } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CloudinaryImageUploader = ({ onUploadComplete, currentImageUrl = '', label = "Upload Image" }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(currentImageUrl);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentImageUrl);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Update preview and uploadedUrl when currentImageUrl changes (for edit mode)
  useEffect(() => {
    if (currentImageUrl) {
      setPreview(currentImageUrl);
      setUploadedUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB for Cloudinary free tier)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    // Check if Cloudinary is configured
    if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'your_cloud_name_here') {
      setError('Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME to .env file');
      return;
    }

    if (!CLOUDINARY_UPLOAD_PRESET) {
      setError('Cloudinary upload preset is not configured. Please add VITE_CLOUDINARY_UPLOAD_PRESET to .env file');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'products');

      // Upload to Cloudinary
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const imageUrl = response.secure_url;
          
          setUploadedUrl(imageUrl);
          setUploadProgress(100);
          
          if (onUploadComplete) {
            onUploadComplete(imageUrl);
          }
        } else {
          const errorResponse = JSON.parse(xhr.responseText);
          setError(`Upload failed: ${errorResponse.error?.message || 'Unknown error'}`);
        }
        setUploading(false);
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setError('Network error occurred during upload');
        setUploading(false);
      });

      xhr.open('POST', cloudinaryUrl);
      xhr.send(formData);

    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image: ' + err.message);
      setUploading(false);
    }
  };

  const clearImage = () => {
    setUploadedUrl('');
    setPreview('');
    setUploadProgress(0);
    if (onUploadComplete) {
      onUploadComplete('');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
        {label}
      </label>

      <div style={{
        border: '2px dashed #ddd',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        background: '#fafafa',
        position: 'relative'
      }}>
        {preview && (
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px', 
                borderRadius: '8px',
                objectFit: 'contain'
              }} 
            />
            {!uploading && (
              <button
                type="button"
                onClick={clearImage}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && uploadProgress > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ 
              fontSize: '0.85rem', 
              color: '#666', 
              marginTop: '5px' 
            }}>
              {uploadProgress}% uploaded
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
          id="cloudinary-image-upload-input"
        />

        <label
          htmlFor="cloudinary-image-upload-input"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: uploading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '6px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: uploading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Uploading...
            </>
          ) : uploadedUrl ? (
            <>
              <CheckCircle size={18} />
              Change Image
            </>
          ) : (
            <>
              <Upload size={18} />
              Choose Image
            </>
          )}
        </label>

        {error && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '6px',
            color: '#c00',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {uploadedUrl && !error && !uploading && (
          <div style={{
            marginTop: '10px',
            padding: '8px',
            background: '#efe',
            border: '1px solid #cfc',
            borderRadius: '6px',
            color: '#0a0',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <CheckCircle size={16} />
            Image uploaded successfully to Cloudinary
          </div>
        )}

        {/* Cloudinary Badge */}
        <div style={{
          marginTop: '10px',
          fontSize: '0.75rem',
          color: '#999',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px'
        }}>
          <span>Powered by</span>
          <a 
            href="https://cloudinary.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#3448C5', textDecoration: 'none', fontWeight: '600' }}
          >
            Cloudinary
          </a>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CloudinaryImageUploader;
