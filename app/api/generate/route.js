import { NextResponse } from 'next/server'

const AI_API_URL = process.env.AI_API_URL
const AI_API_KEY = process.env.AI_API_KEY
const DB_API_URL = process.env.DB_API_URL
const DB_API_KEY = process.env.DB_API_KEY_RETAINKIT

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, product_name, customer_name, cancel_reason, tenure, plan, usage_stats } = body

    // Call AI API
    const aiRes = await fetch(`${AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({ task: 'generate_retention_response', inputs: { product_name, customer_name, cancel_reason: cancel_reason||'Not specified', tenure: tenure||'Unknown', plan: plan||'Unknown', usage_stats: usage_stats||'Not available' } })
    })
    const aiData = await aiRes.json()
    if (!aiRes.ok) throw new Error(aiData.error || 'AI generation failed')

    const result = aiData.data

    // Save to DB
    let itemId = null
    if (userId && DB_API_URL) {
      try {
        const dbRes = await fetch(`${DB_API_URL}/db/retainkit/responses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DB_API_KEY}` },
          body: JSON.stringify({ user_id: userId, title: `${customer_name} — ${cancel_reason}`, customer_name, cancel_reason, result_data: result, status: 'complete' })
        })
        const dbData = await dbRes.json()
        itemId = dbData.data?.id || null
      } catch(e) { console.error('DB save failed:', e.message) }
    }

    return NextResponse.json({ itemId, result })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
