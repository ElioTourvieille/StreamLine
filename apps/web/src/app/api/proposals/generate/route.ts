import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ProposalBrief {
  clientName: string
  projectType: string
  budgetRange: string
  timeline: string
  description: string
  deliverables: string[]
  requirements: string
}

function buildPrompt(brief: ProposalBrief): string {
  return `You are an expert web agency consultant. Generate a professional project proposal in markdown for the following brief.

**Client:** ${brief.clientName}
**Project type:** ${brief.projectType}
**Budget range:** ${brief.budgetRange}
**Timeline:** ${brief.timeline}
**Description:** ${brief.description}
**Key deliverables:** ${brief.deliverables.join(', ')}
**Technical requirements / stack:** ${brief.requirements}

Write a complete, polished proposal in English. Structure it with these sections:

# Project Proposal — ${brief.clientName}

## Executive Summary
Brief paragraph presenting the project and our understanding of the need.

## Project Scope
Detailed scope covering what's included, with sub-sections per deliverable.

## Technical Approach
Technologies, architecture choices, and methodology.

## Project Timeline
Phase breakdown with milestones and estimated durations.

## Budget
Itemized cost breakdown matching the ${brief.budgetRange} range, then a total.

## Commercial Terms
Payment schedule, change-request policy, warranty, and support.

## Next Steps
Clear call to action: what happens after approval.

Use professional but warm English. Be specific and concrete. No filler text.`
}

export async function POST(req: NextRequest) {
  const brief: ProposalBrief = await req.json()

  if (!brief.clientName || !brief.projectType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 8192,
    thinking: { type: 'enabled', budget_tokens: 8000 },
    messages: [{ role: 'user', content: buildPrompt(brief) }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
