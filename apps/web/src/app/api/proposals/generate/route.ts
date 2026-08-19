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
  return `Tu es un consultant expert en agence web. Génère une proposition de projet professionnelle en markdown à partir du brief suivant.

**Client :** ${brief.clientName}
**Type de projet :** ${brief.projectType}
**Budget :** ${brief.budgetRange}
**Délai :** ${brief.timeline}
**Description :** ${brief.description}
**Livrables clés :** ${brief.deliverables.join(', ')}
**Exigences techniques / stack :** ${brief.requirements}

Rédige une proposition complète et soignée en français. Structure-la avec ces sections :

# Proposition de projet — ${brief.clientName}

## Résumé exécutif
Paragraphe bref présentant le projet et notre compréhension du besoin.

## Périmètre du projet
Périmètre détaillé couvrant ce qui est inclus, avec une sous-section par livrable.

## Approche technique
Technologies, choix d'architecture et méthodologie.

## Calendrier du projet
Découpage en phases avec jalons et durées estimées.

## Budget
Détail des coûts correspondant à la fourchette ${brief.budgetRange}, puis un total.

## Conditions commerciales
Échéancier de paiement, politique de demande de modification, garantie et support.

## Prochaines étapes
Appel à l'action clair : ce qui se passe après validation.

Utilise un français professionnel mais chaleureux. Sois précis et concret. Pas de remplissage inutile.`
}

export async function POST(req: NextRequest) {
  const brief: ProposalBrief = await req.json()

  if (!brief.clientName || !brief.projectType) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 8192,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thinking: { type: 'adaptive' } as any,
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
