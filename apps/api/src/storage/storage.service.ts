import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

// Deliverables are studio<->client work product - keep the allowlist to
// formats a studio actually hands off, not arbitrary uploads (no .html,
// .svg with embedded scripts, .exe, etc).
const ALLOWED_CONTENT_TYPES = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
])

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024 // 200MB - sanity cap, not server-enforced (see note on getUploadUrl)
const UPLOAD_URL_TTL_SECONDS = 5 * 60
const DOWNLOAD_URL_TTL_SECONDS = 5 * 60

@Injectable()
export class StorageService {
  private readonly log = new Logger(StorageService.name)
  // Loaded lazily so the API starts without S3_BUCKET configured in dev -
  // same convention as NotificationsService's Resend client.
  private client: S3Client | null = null
  private readonly bucket = process.env.S3_BUCKET

  private getClient(): S3Client {
    if (!this.bucket) {
      throw new ServiceUnavailableException('File storage is not configured (S3_BUCKET missing)')
    }
    if (!this.client) {
      this.client = new S3Client({ region: process.env.AWS_REGION ?? 'eu-central-2' })
    }
    return this.client
  }

  /**
   * Presigned PUT URL for a direct browser -> S3 upload. The API never sees
   * the file bytes - it only issues the URL and records the resulting key.
   *
   * Note: a presigned PUT URL cannot enforce a byte-size limit (that needs a
   * presigned POST policy instead). MAX_FILE_SIZE_BYTES is a client-side /
   * display sanity cap only - a determined caller could still PUT a larger
   * object. Acceptable for now since only authenticated STUDIO users can
   * request an upload URL; revisit with a POST policy if that changes.
   */
  async getUploadUrl(params: {
    organizationId: string
    projectId: string
    fileName: string
    contentType: string
    fileSize?: number
  }) {
    const { organizationId, projectId, fileName, contentType, fileSize } = params

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      throw new BadRequestException(`File type "${contentType}" is not allowed`)
    }
    if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(`File exceeds the ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit`)
    }

    const safeName = sanitizeFileName(fileName)
    const fileKey = `org/${organizationId}/project/${projectId}/${uuidv4()}-${safeName}`

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(this.getClient(), command, { expiresIn: UPLOAD_URL_TTL_SECONDS })
    return { uploadUrl, fileKey }
  }

  /** Presigned GET URL, generated on demand - files are never public. */
  async getDownloadUrl(fileKey: string, downloadAsFileName?: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      ...(downloadAsFileName
        ? { ResponseContentDisposition: `attachment; filename="${sanitizeFileName(downloadAsFileName)}"` }
        : {}),
    })
    return getSignedUrl(this.getClient(), command, { expiresIn: DOWNLOAD_URL_TTL_SECONDS })
  }
}

// Combining Diacritical Marks block (U+0300-U+036F), built from char codes
// so no literal combining characters sit in the source.
const COMBINING_MARKS_RE = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  'g',
)

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(COMBINING_MARKS_RE, '') // strip combining accents (e.g. e-acute -> e)
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .slice(-150) // keep it bounded
}
