import { NextResponse } from 'next/server'
export async function POST(request) {
  try {
    const body = await request.json()
    const { product_name, customer_name, cancel_reason, tenure, plan, usage_stats, userId } = body
    if (!product_name || !customer_name) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    const aiRes = await fetch(`${process.env.AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ task: 'generate_retention_response', inputs: { product_name, customer_name, cancel_reason: cancel_reason||'Not specified', tenure: tenure||'Unknown', plan: plan||'Unknown', usage_stats: usage_stats||'Not available' } })
    })
    const aiData = await aiRes.json()
    if (!aiRes.ok) throw new Error(aiData.error || 'AI failed')
    const result = aiData.data
    let itemId = null
    if (userId && process.env.DB_API_URL) {
      try {
        const dbRes = await fetch(`${process.env.DB_API_URL}/db/retainkit/responses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DB_API_KEY_RETAINKIT}` },
          body: JSON.stringify({ user_id: userId, title: `${customer_name} — ${cancel_reason}`, customer_name, cancel_reason, result_data: result, status: 'complete' })
        })
        const dbData = await dbRes.json()
        itemId = dbData.data?.id || null
      } catch(e) {}
    }
    return NextResponse.json({ itemId, result })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
