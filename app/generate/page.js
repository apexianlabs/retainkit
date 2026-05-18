'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const CANCEL_REASONS = ['Too expensive','Not using it enough','Missing features','Switching to competitor','Technical issues','No longer needed','Other']

export default function GeneratePage() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const [form, setForm]       = useState({ product_name:'', customer_name:'', cancel_reason:'Too expensive', tenure:'', plan:'', usage_stats:'' })

  useEffect(() => {
    try {
      const match = document.cookie.match(/ret_user=([^;]+)/)
      if (match) setUser(JSON.parse(decodeURIComponent(match[1])))
    } catch(e) {}
  }, [])

  const handleSubmit = async () => {
    if (!form.product_name || !form.customer_name) return setError('Product name and customer name are required.')
    setLoading(true); setError(''); setResult(null)
    try {
      const token = document.cookie.match(/ret_token=([^;]+)/)?.[1] || ''
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, userId: user?.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.result)
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const inputStyle = { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, color:'#0f172a', background:'#fff', outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' }
  const labelStyle = { fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5 }

  if (result) return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#be185d',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>R</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>RetainKit</span>
        </Link>
        <div style={{flex:1}}/>
      </nav>
      <div style={{maxWidth:720,margin:'0 auto',padding:'32px 24px',display:'flex',flexDirection:'column',gap:14}}>
        <div style={{background:'#fdf2f8',border:'1px solid #fbcfe8',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#be185d',textTransform:'uppercase',marginBottom:4}}>✅ Retention Response Ready</p>
          <p style={{fontSize:18,fontWeight:800,color:'#0f172a'}}>For: {form.customer_name}</p>
          <p style={{fontSize:13,color:'#64748b'}}>Reason: {form.cancel_reason}</p>
        </div>
        {(result.response || result.email || result.message) && (
          <div style={{background:'#fff',border:'2px solid #fbcfe8',borderRadius:12,padding:24}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase'}}>✉️ Retention Response</p>
              <button onClick={() => navigator.clipboard.writeText(result.response || result.email || result.message)}
                style={{fontSize:11,color:'#be185d',background:'#fdf2f8',border:'1px solid #fbcfe8',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:600}}>
                Copy
              </button>
            </div>
            <p style={{fontSize:13,color:'#374151',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{result.response || result.email || result.message}</p>
          </div>
        )}
        {result.offer && <div style={{background:'#fdf2f8',border:'1px solid #fbcfe8',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#be185d',textTransform:'uppercase',marginBottom:8}}>🎁 Suggested Offer</p>
          <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{typeof result.offer === 'string' ? result.offer : JSON.stringify(result.offer)}</p>
        </div>}
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={() => { setResult(null); setForm({product_name:'',customer_name:'',cancel_reason:'Too expensive',tenure:'',plan:'',usage_stats:''}) }}
            style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
            New response
          </button>
          {user ? <Link href="/dashboard" style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:'#be185d',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>Dashboard →</Link>
                : <Link href="/login" style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:'#be185d',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>Save responses →</Link>}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#be185d',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>R</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>RetainKit</span>
        </Link>
        <div style={{flex:1}}/>
        {user ? <Link href="/dashboard" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
               : <Link href="/login" style={{fontSize:13,color:'#be185d',fontWeight:600,textDecoration:'none'}}>Sign in</Link>}
      </nav>
      <div style={{maxWidth:620,margin:'0 auto',padding:'40px 24px'}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'#0f172a',marginBottom:6}}>Generate retention response</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:28}}>Enter the cancellation details and get a professional, empathetic response to win them back.</p>
        {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'12px 16px',fontSize:13,color:'#dc2626',marginBottom:20}}>{error}</div>}
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:28}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div><label style={labelStyle}>Your product name *</label><input value={form.product_name} onChange={e => setForm({...form,product_name:e.target.value})} placeholder="e.g. ProposalHQ" style={inputStyle}/></div>
            <div><label style={labelStyle}>Customer name *</label><input value={form.customer_name} onChange={e => setForm({...form,customer_name:e.target.value})} placeholder="e.g. Sarah" style={inputStyle}/></div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelStyle}>Cancellation reason</label>
            <select value={form.cancel_reason} onChange={e => setForm({...form,cancel_reason:e.target.value})} style={{...inputStyle,background:'#fff'}}>
              {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div><label style={labelStyle}>Customer tenure</label><input value={form.tenure} onChange={e => setForm({...form,tenure:e.target.value})} placeholder="e.g. 6 months" style={inputStyle}/></div>
            <div><label style={labelStyle}>Their plan</label><input value={form.plan} onChange={e => setForm({...form,plan:e.target.value})} placeholder="e.g. Pro $39/month" style={inputStyle}/></div>
          </div>
          <div style={{marginBottom:24}}>
            <label style={labelStyle}>Usage stats (optional)</label>
            <input value={form.usage_stats} onChange={e => setForm({...form,usage_stats:e.target.value})} placeholder="e.g. Generated 12 proposals, last active 2 weeks ago" style={inputStyle}/>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{width:'100%',padding:'13px',borderRadius:10,border:'none',background:loading?'#f9a8d4':'#be185d',color:'#fff',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
            {loading ? '✍️ Writing response...' : 'Generate retention response →'}
          </button>
        </div>
      </div>
    </div>
  )
}
