import { Readable } from "node:stream";

import cloudinary from "../../config/cloudinary.js";

export function uploadProfileImage(
    buffer: Buffer,
): Promise<{
    secureUrl: string;
    publicId: string;
}> {
    return new Promise((resolve, reject) => {
        const uploadStream =
            cloudinary.uploader.upload_stream(
                {
                    folder: "uptrace/profile-images",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    if (!result) {
                        reject(
                            new Error(
                                "Cloudinary upload failed.",
                            ),
                        );
                        return;
                    }

                    resolve({
                        secureUrl: result.secure_url,
                        publicId: result.public_id,
                    });
                },
            );

        Readable.from(buffer).pipe(uploadStream);
    });
}