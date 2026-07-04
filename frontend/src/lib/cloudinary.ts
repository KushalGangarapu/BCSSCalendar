const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadResult {
    secureUrl: string;
}

export const uploadToCloudinary = async (
    file: File | Blob
): Promise<CloudinaryUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
    const data = await res.json();

    if (!data.secure_url) {
        const message = data.error?.message || 'Unknown error';
        throw new Error(message);
    }

    return { secureUrl: data.secure_url };
};
