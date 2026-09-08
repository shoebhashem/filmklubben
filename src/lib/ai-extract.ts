import Anthropic from '@anthropic-ai/sdk'
import { MovieMetadata } from '@/types'

const client = new Anthropic()

export async function extractMovieFromUrl(url: string): Promise<MovieMetadata> {
  const htmlRes = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Filmklubben/1.0)' },
  })
  const html = await htmlRes.text()
  const trimmed = html.slice(0, 15000)

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Extract movie metadata from this webpage HTML and return ONLY a JSON object with these fields:
- title (string)
- cover_image (string URL or null)
- synopsis (string or null)
- genres (array of strings)
- director (string or null)
- cast_members (array of up to 6 actor names)
- release_year (number or null)
- runtime (number in minutes or null)
- tmdb_id (null)

Return only valid JSON, no markdown.

HTML:
${trimmed}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = JSON.parse(text) as MovieMetadata
  return parsed
}
