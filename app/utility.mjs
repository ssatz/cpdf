import Pusher from "pusher"
const s3Client = new S3Client({ region: process.env.AWS_S3_REGION });
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export const streamToString = (stream) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });


export const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    useTLS: process.env.PUSHER_TLS ?? false,
    host: process.env.PUSHER_HOST,
    port: process.env.PUSHER_PORT,
});

export const download = async (filename) =>
    await s3Client.send(new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: filename,
        ContentType: 'application/pdf'
    }));

export const upload = async (outputFilename, userId='guest', fileStream) => await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${userId}/${outputFilename}`,
    Body: fileStream
}));