/**
 * A utility function to extract the cropped region from an image using an HTML5 canvas.
 * Returns a Blob (File) that can be directly uploaded to Cloudinary.
 */

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

/**
 * Draws the image rotated onto a canvas and returns it as an object URL.
 * react-easy-crop reports crop coordinates in the rotated image's space,
 * so the crop must be applied after this rotation step.
 */
const getRotatedImage = async (imageSrc: string, rotation: number): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const orientationChanged = rotation === 90 || rotation === -90 || rotation === 270 || rotation === -270;
    if (orientationChanged) {
        canvas.width = image.height;
        canvas.height = image.width;
    } else {
        canvas.width = image.width;
        canvas.height = image.height;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(URL.createObjectURL(blob));
        }, 'image/png');
    });
};

export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation: number = 0,
    fileName: string = 'cropped.jpeg'
): Promise<File | null> {
    const rotatedSrc = rotation !== 0 ? await getRotatedImage(imageSrc, rotation) : imageSrc;
    try {
        const image = await createImage(rotatedSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        // Set canvas dimensions to the crop size
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // Draw the cropped image onto the canvas
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        // Default to a jpeg to keep size small
        const file = await new Promise<File>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Canvas is empty');
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(new File([blob], fileName, { type: 'image/jpeg' }));
            }, 'image/jpeg');
        });

        return file;
    } finally {
        if (rotatedSrc !== imageSrc) {
            URL.revokeObjectURL(rotatedSrc);
        }
    }
}
