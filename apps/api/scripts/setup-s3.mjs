#!/usr/bin/env node
/**
 * StreamLine — S3 bucket provisioning for deliverable files
 *
 * Creates a private bucket (public access fully blocked — every read goes
 * through a short-lived presigned URL, never a public object URL) with CORS
 * open just enough for the browser to PUT/GET directly against it.
 *
 * Safe to re-run: skips creation if the bucket already exists.
 *
 * Usage:
 *   node scripts/setup-s3.mjs               # uses apps/api/.env
 *
 * This is a real, billable AWS resource — review the bucket name and CORS
 * origin below before running it against a real account.
 */

import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutPublicAccessBlockCommand,
  PutBucketCorsCommand,
  PutBucketEncryptionCommand,
} from '@aws-sdk/client-s3'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load env from apps/api/.env ─────────────────────────────────────────────

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env')

try {
  const raw = readFileSync(envPath, 'utf-8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch {
  // .env not found — rely on environment variables already set
}

// ── Config ───────────────────────────────────────────────────────────────────

const BUCKET = process.env.S3_BUCKET
const REGION = process.env.AWS_REGION ?? 'eu-central-2'
const WEB_ORIGIN = process.env.WEB_URL ?? 'http://localhost:3000'

if (!BUCKET) {
  console.error('\n❌ S3_BUCKET is not set in apps/api/.env — pick a globally-unique bucket name and add it, e.g.:')
  console.error('   S3_BUCKET=streamline-deliverables-origin-studio\n')
  process.exit(1)
}

const client = new S3Client({ region: REGION })

console.log(`\n📦 StreamLine — S3 Setup`)
console.log(`   Bucket : ${BUCKET}`)
console.log(`   Region : ${REGION}`)
console.log(`   CORS   : ${WEB_ORIGIN}\n`)

// ── Helpers ──────────────────────────────────────────────────────────────────

async function bucketExists() {
  try {
    await client.send(new HeadBucketCommand({ Bucket: BUCKET }))
    return true
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return false
    throw err
  }
}

async function createBucket() {
  console.log('🔨 Creating bucket...')
  await client.send(
    new CreateBucketCommand({
      Bucket: BUCKET,
      ...(REGION !== 'us-east-1'
        ? { CreateBucketConfiguration: { LocationConstraint: REGION } }
        : {}),
    }),
  )
  console.log('✅ Bucket created')
}

async function blockPublicAccess() {
  console.log('🔒 Blocking all public access (files are only reachable via presigned URLs)...')
  await client.send(
    new PutPublicAccessBlockCommand({
      Bucket: BUCKET,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        IgnorePublicAcls: true,
        BlockPublicPolicy: true,
        RestrictPublicBuckets: true,
      },
    }),
  )
  console.log('✅ Public access blocked')
}

async function enableEncryption() {
  console.log('🔐 Enabling default SSE-S3 encryption...')
  await client.send(
    new PutBucketEncryptionCommand({
      Bucket: BUCKET,
      ServerSideEncryptionConfiguration: {
        Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }],
      },
    }),
  )
  console.log('✅ Encryption enabled')
}

async function configureCors() {
  console.log('🌐 Configuring CORS for direct browser upload...')
  await client.send(
    new PutBucketCorsCommand({
      Bucket: BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedMethods: ['PUT', 'GET'],
            AllowedOrigins: [WEB_ORIGIN],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    }),
  )
  console.log('✅ CORS configured')
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const exists = await bucketExists()

  if (exists) {
    console.log(`ℹ  Bucket "${BUCKET}" already exists — updating its config only`)
  } else {
    await createBucket()
  }

  await blockPublicAccess()
  await enableEncryption()
  await configureCors()

  console.log(`\n✨ Done! Bucket "${BUCKET}" is ready for deliverable uploads.\n`)
  console.log('   Files are private — every download goes through a 5-minute presigned URL.')
  console.log(`   If you deploy the web app to a real domain, re-run this script (or update`)
  console.log(`   the CORS rule by hand) with WEB_URL set to that domain — the CORS origin`)
  console.log(`   above only allows uploads from ${WEB_ORIGIN}.\n`)
}

main().catch(err => {
  console.error('\n❌ Setup failed:', err.message ?? err)
  process.exit(1)
})
