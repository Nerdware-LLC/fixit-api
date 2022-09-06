import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "@server/env";
import type { Readable } from "stream";
import type { GetObjectCommandInput, PutObjectCommandInput } from "@aws-sdk/client-s3";

const _s3client = new S3Client({ region: ENV.AWS.REGION });

export const s3client = Object.freeze({
  getObject: async ({ Bucket, Key }: GetObjectCommandInput) => {
    const { Body: responseBodyStream } = await _s3client.send(
      new GetObjectCommand({
        Bucket,
        Key
      })
    );
    return responseBodyStream ? await streamToString(responseBodyStream as Readable) : null;
  },
  putObject: async ({ Bucket, Key, Body }: PutObjectCommandInput) => {
    return await _s3client.send(
      new PutObjectCommand({
        Bucket,
        Key,
        Body
      })
    );
  }
});

/**
 * Helper function to convert a ReadableStream to a string.
 */
const streamToString = (stream: Readable) => {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", reject);
  });
};
