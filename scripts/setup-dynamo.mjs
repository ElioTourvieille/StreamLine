#!/usr/bin/env node
/**
 * StreamLine — DynamoDB table provisioning
 *
 * Creates the `streamline` table with GSI1, GSI2, and TTL.
 * Safe to re-run: skips creation if the table already exists.
 *
 * Usage:
 *   node scripts/setup-dynamo.mjs                             # uses apps/api/.env
 *   DYNAMODB_ENDPOINT=http://localhost:8000 node scripts/setup-dynamo.mjs  # DynamoDB Local
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  UpdateTimeToLiveCommand,
  DescribeTableCommand,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load env from apps/api/.env ─────────────────────────────────────────────

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../apps/api/.env')

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

const TABLE = process.env.DYNAMO_TABLE ?? 'streamline'
const REGION = process.env.AWS_REGION ?? 'eu-west-3'
const ENDPOINT = process.env.DYNAMODB_ENDPOINT // undefined → AWS

const client = new DynamoDBClient({
  region: REGION,
  ...(ENDPOINT ? { endpoint: ENDPOINT } : {}),
})

console.log(`\n📦 StreamLine — DynamoDB Setup`)
console.log(`   Table  : ${TABLE}`)
console.log(`   Region : ${REGION}`)
console.log(`   Target : ${ENDPOINT ?? 'AWS DynamoDB'}\n`)

// ── Table definition ─────────────────────────────────────────────────────────

const TABLE_DEF = {
  TableName: TABLE,
  BillingMode: 'PAY_PER_REQUEST',

  AttributeDefinitions: [
    { AttributeName: 'PK',     AttributeType: 'S' },
    { AttributeName: 'SK',     AttributeType: 'S' },
    { AttributeName: 'GSI1PK', AttributeType: 'S' },
    { AttributeName: 'GSI1SK', AttributeType: 'S' },
    { AttributeName: 'GSI2PK', AttributeType: 'S' },
    { AttributeName: 'GSI2SK', AttributeType: 'S' },
  ],

  KeySchema: [
    { AttributeName: 'PK', KeyType: 'HASH' },
    { AttributeName: 'SK', KeyType: 'RANGE' },
  ],

  GlobalSecondaryIndexes: [
    {
      // GSI1 — queries by email, slug, clientId, deliverable ID
      IndexName: 'GSI1',
      KeySchema: [
        { AttributeName: 'GSI1PK', KeyType: 'HASH' },
        { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
    {
      // GSI2 — queries by projectId, status
      IndexName: 'GSI2',
      KeySchema: [
        { AttributeName: 'GSI2PK', KeyType: 'HASH' },
        { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function tableExists() {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE }))
    return true
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') return false
    throw err
  }
}

async function createTable() {
  console.log('🔨 Creating table...')
  await client.send(new CreateTableCommand(TABLE_DEF))

  console.log('⏳ Waiting for table to become ACTIVE...')
  await waitUntilTableExists(
    { client, maxWaitTime: 60 },
    { TableName: TABLE },
  )
  console.log('✅ Table is ACTIVE')
}

async function enableTTL() {
  console.log('⏱  Enabling TTL on attribute `ttl`...')
  try {
    await client.send(
      new UpdateTimeToLiveCommand({
        TableName: TABLE,
        TimeToLiveSpecification: {
          AttributeName: 'ttl',
          Enabled: true,
        },
      }),
    )
    console.log('✅ TTL enabled')
  } catch (err) {
    // Already enabled — not an error
    if (err.name === 'ValidationException' && err.message.includes('already')) {
      console.log('ℹ  TTL was already enabled')
    } else {
      throw err
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const exists = await tableExists()

  if (exists) {
    console.log(`ℹ  Table "${TABLE}" already exists — skipping creation`)
  } else {
    await createTable()
  }

  await enableTTL()

  console.log(`\n✨ Done! Table "${TABLE}" is ready.\n`)
  console.log('   GSI1 — by email, slug, clientId, deliverableId')
  console.log('   GSI2 — by projectId, status')
  console.log('   TTL  — attribute `ttl` (Unix timestamp, seconds)\n')
}

main().catch(err => {
  console.error('\n❌ Setup failed:', err.message ?? err)
  process.exit(1)
})
