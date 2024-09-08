import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_KEY_ID, R2_BUCKET_NAME } = process.env;

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_KEY_ID || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, contentType } = body;

    if (typeof filename !== 'string' || typeof contentType !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const signedUrl = await getSignedUrl(
      R2,
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: `${filename}.json`,
        ContentType: contentType,
      }),
      { expiresIn: 3600 }
    );

    return NextResponse.json(
      {
        url: signedUrl,
        method: 'PUT',
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}