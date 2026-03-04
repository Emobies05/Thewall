'use client';
import { useState, useEffect } from 'react';

const WALLET = '0xba24d47e65982b1378c426e658869cfe41f3f4e1';
const TREASURY = '0xecbdebb62d636808a3e94183070585814127393d';

export default function TheWall() {
  const [tab, setTab] = useState('portfolio');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPrices(); }, []);

  const fetchPrices = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,usd-coin,tether&vs_currencies=usd');
      const data = await res.json();
      setPrices({ ETH: data.ethereum?.usd || 2850, BNB: data.binancecoin?.usd || 420, USDC: data['usd-coin']?.usd || 1, USDT: data.tether?.usd || 1 });
    } catch { setPrices({ ETH: 2850, BNB: 420, USDC: 1, USDT: 1 }); }
    setLoading(false);
  };

  const GOAL = 6200000;
  const TOTAL = 1532822;
  const progress = Math.round((TOTAL / GOAL) * 100);

  return (
    <div style={{background:'#0a0a0a',minHeight:'100vh',color:'#fff',fontFamily:'monospace',maxWidth:'480px',margin:'0 auto',padding:'16px'}}>
      <div style={{textAlign:'center',marginBottom:'24px'}}>
        <h1 style={{fontSize:'2rem',fontWeight:900,color:'#FF5500',margin:0}}>⬡ THE WALL</h1>
        <p style={{color:'#666',fontSize:'11px',margin:'4px 0'}}>Web3 Portfolio Tracker</p>
        <div style={{background:'#111',border:'1px solid #222',borderRadius:'8px',padding:'8px',marginTop:'12px'}}>
          <p style={{color:'#666',fontSize:'9px',margin:'0 0 4px'}}>MAIN WALLET</p>
          <p style={{color:'#FF5500',fontSize:'10px',margin:0}}>{WALLET.slice(0,8)}...{WALLET.slice(-6)}</p>
        </div>
      </div>

      <div style={{background:'linear-gradient(135deg,#111 0%,#1a1a2e 100%)',border:'1px solid #FF5500',borderRadius:'16px',padding:'24px',textAlign:'center',marginBottom:'20px'}}>
        <p style={{color:'#666',fontSize:'11px',margin:'0 0 8px'}}>TOTAL PORTFOLIO</p>
        <h2 style={{fontSize:'2.5rem',fontWeight:900,color:'#FF5500',margin:'0 0 4px'}}>${TOTAL.toLocaleString()}</h2>
        <p style={{color:'#666',fontSize:'10px',margin:'0 0 16px'}}>GOAL: ${GOAL.toLocaleString()}</p>
        <div style={{background:'#222',borderRadius:'8px',height:'8px',overflow:'hidden'}}>
          <div style={{background:'linear-gradient(90deg,#FF5500,#FF8C00)',height:'100%',width:`${progress}%`,borderRadius:'8px'}}/>
        </div>
        <p style={{color:'#FF5500',fontSize:'11px',margin:'8px 0 0'}}>{progress}% of ₹52 Crore Goal</p>
      </div>

      <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
        {['portfolio','send','receive','prices'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'10px',borderRadius:'10px',border:'none',background:tab===t?'#FF5500':'#111',color:tab===t?'#fff':'#666',cursor:'pointer',fontSize:'10px',fontWeight:700,textTransform:'uppercase'}}>
            {t}
          </button>
        ))}
      </div>

      {tab==='portfolio'&&(
        <div>
          {[{symbol:'ETH',name:'Ethereum',color:'#627EEA'},{symbol:'USDC',name:'USD Coin',color:'#2775CA'},{symbol:'USDT',name:'Tether',color:'#26A17B'},{symbol:'BNB',name:'BNB',color:'#F3BA2F'}].map(token=>(
            <div key={token.symbol} style={{background:'#111',border:'1px solid #222',borderRadius:'12px',padding:'16px',marginBottom:'10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:token.color+'22',border:`2px solid ${token.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:token.color,fontSize:'12px'}}>{token.symbol.slice(0,2)}</div>
                <div>
                  <p style={{margin:0,fontWeight:700,fontSize:'14px'}}>{token.symbol}</p>
                  <p style={{margin:0,color:'#666',fontSize:'10px'}}>{token.name}</p>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{margin:0,fontWeight:700,color:token.color}}>${prices[token.symbol]?.toLocaleString()||'...'}</p>
                <p style={{margin:0,color:'#666',fontSize:'10px'}}>Live Price</p>
              </div>
            </div>
          ))}
          <div style={{background:'#111',border:'1px solid #FFD700',borderRadius:'12px',padding:'16px',marginTop:'8px'}}>
            <p style={{color:'#FFD700',fontSize:'10px',fontWeight:700,margin:'0 0 4px'}}>🏛️ TREASURY WALLET</p>
            <p style={{color:'#666',fontSize:'9px',margin:0}}>{TREASURY.slice(0,10)}...{TREASURY.slice(-6)}</p>
          </div>
        </div>
      )}

      {tab==='send'&&(
        <div style={{background:'#111',border:'1px solid #222',borderRadius:'12px',padding:'20px'}}>
          <h3 style={{color:'#FF5500',margin:'0 0 16px'}}>Send Crypto</h3>
          <input placeholder="Recipient address (0x...)" style={{width:'100%',background:'#0a0a0a',border:'1px solid #333',borderRadius:'8px',padding:'12px',color:'#fff',fontSize:'12px',marginBottom:'12px',boxSizing:'border-box'}}/>
          <input placeholder="Amount" style={{width:'100%',background:'#0a0a0a',border:'1px solid #333',borderRadius:'8px',padding:'12px',color:'#fff',fontSize:'12px',marginBottom:'12px',boxSizing:'border-box'}}/>
          <select style={{width:'100%',background:'#0a0a0a',border:'1px solid #333',borderRadius:'8px',padding:'12px',color:'#fff',fontSize:'12px',marginBottom:'16px',boxSizing:'border-box'}}>
            <option>ETH</option><option>USDC</option><option>USDT</option><option>BNB</option>
          </select>
          <button style={{width:'100%',background:'#FF5500',border:'none',borderRadius:'10px',padding:'14px',color:'#fff',fontWeight:900,fontSize:'14px',cursor:'pointer'}}>Connect Wallet to Send</button>
        </div>
      )}

      {tab==='receive'&&(
        <div style={{background:'#111',border:'1px solid #222',borderRadius:'12px',padding:'20px',textAlign:'center'}}>
          <h3 style={{color:'#FF5500',margin:'0 0 16px'}}>Receive Crypto</h3>
          <div style={{background:'#fff',padding:'20px',borderRadius:'12px',marginBottom:'16px',display:'inline-block'}}>
            <div style={{width:'120px',height:'120px',background:'#000',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'10px'}}>QR CODE</div>
          </div>
          <p style={{color:'#666',fontSize:'10px',marginBottom:'8px'}}>YOUR WALLET ADDRESS</p>
          <div style={{background:'#0a0a0a',border:'1px solid #333',borderRadius:'8px',padding:'12px',wordBreak:'break-all',fontSize:'11px',color:'#FF5500'}}>{WALLET}</div>
          <button onClick={()=>navigator.clipboard?.writeText(WALLET)} style={{marginTop:'12px',background:'#333',border:'none',borderRadius:'8px',padding:'10px 20px',color:'#fff',cursor:'pointer',fontSize:'12px'}}>📋 Copy Address</button>
        </div>
      )}

      {tab==='prices'&&(
        <div>
          <p style={{color:'#666',fontSize:'11px',marginBottom:'12px'}}>LIVE CRYPTO PRICES</p>
          {loading?<p style={{color:'#666',textAlign:'center'}}>Loading prices...</p>:
            Object.entries(prices).map(([symbol,price])=>(
              <div key={symbol} style={{background:'#111',border:'1px solid #222',borderRadius:'10px',padding:'14px',marginBottom:'8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontWeight:700}}>{symbol}</span>
                <span style={{color:'#00E676',fontWeight:700}}>${price.toLocaleString()}</span>
              </div>
            ))
          }
          <button onClick={fetchPrices} style={{width:'100%',background:'#111',border:'1px solid #FF5500',borderRadius:'10px',padding:'12px',color:'#FF5500',cursor:'pointer',fontWeight:700,marginTop:'8px'}}>🔄 Refresh Prices</button>
        </div>
      )}

      <div style={{textAlign:'center',marginTop:'24px',paddingTop:'16px',borderTop:'1px solid #222'}}>
        <p style={{color:'#333',fontSize:'9px'}}>THE WALL · KANNUR → DUBAI · DIVIN K.K.</p>
      </div>
    </div>
  );
}
