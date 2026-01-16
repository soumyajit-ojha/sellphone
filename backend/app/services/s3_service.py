import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile, HTTPException
from app.core.config import settings
import uuid

s3_client = boto3.client(
    "s3",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)


async def upload_image_to_s3(file: UploadFile, folder: str = "products") -> str:
    """Uploads a file and returns the public URL."""
    # Create a unique filename to prevent overwriting
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{folder}/{uuid.uuid4()}.{file_extension}"

    try:
        s3_client.upload_fileobj(
            file.file,
            settings.AWS_S3_BUCKET_NAME,
            unique_filename,
            ExtraArgs={
                "ContentType": file.content_type
            },  # Standard for browser viewing
        )
        return f"https://{settings.AWS_S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_filename}"
    except ClientError as e:
        print(f"S3 Upload Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image to S3")


async def delete_image_from_s3(image_url: str):
    """Parses the S3 URL and deletes the object."""
    if not image_url:
        return

    # Extract the key from the URL
    # URL: https://bucket.s3.region.amazonaws.com/folder/filename.jpg
    # Key: folder/filename.jpg
    try:
        url_split = image_url.split(".amazonaws.com/")
        if len(url_split) < 2:
            return

        file_key = url_split[1]

        s3_client.delete_object(Bucket=settings.AWS_S3_BUCKET_NAME, Key=file_key)
    except ClientError as e:
        print(f"S3 Delete Error: {e}")
        # We don't necessarily want to crash the whole request if delete fails
