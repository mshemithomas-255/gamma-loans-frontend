// src/config/cloudinary.js

// Get configuration from Vite environment variables
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

// Validate required configuration
export const validateConfig = () => {
  const required = ["cloudName", "uploadPreset"];
  const missing = required.filter((key) => !CLOUDINARY_CONFIG[key]);

  if (missing.length > 0) {
    console.error(`Missing Cloudinary configuration: ${missing.join(", ")}`);
    console.error(
      "Please check your .env file and ensure variables start with VITE_",
    );
    return false;
  }
  return true;
};

// Get base Cloudinary upload URL
export const getUploadUrl = () => {
  if (!CLOUDINARY_CONFIG.cloudName) {
    throw new Error("Cloudinary cloud name is not configured");
  }
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
};

// Upload file to Cloudinary with progress tracking
export const uploadToCloudinary = async (file, folder, onProgress = null) => {
  return new Promise((resolve, reject) => {
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
      reject(new Error("Cloudinary configuration is missing"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", `gamma/${folder}`); // Organize files in folders

    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
            format: response.format,
            bytes: response.bytes,
          });
        } catch (error) {
          reject(new Error("Invalid response from Cloudinary"));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.error?.message || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error - please check your connection"));
    });

    xhr.addEventListener("timeout", () => {
      reject(new Error("Upload timeout - please try again"));
    });

    xhr.timeout = 30000; // 30 seconds timeout
    xhr.open("POST", getUploadUrl());
    xhr.send(formData);
  });
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  if (!CLOUDINARY_CONFIG.cloudName) return publicId;

  const { width, height, quality = "auto", format = "auto" } = options;
  let url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/`;

  const transformations = [];
  if (width || height) {
    transformations.push(`c_fill,w_${width || "auto"},h_${height || "auto"}`);
  }
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  if (transformations.length) {
    url += `${transformations.join(",")}/`;
  }

  url += publicId;
  return url;
};

export default CLOUDINARY_CONFIG;
