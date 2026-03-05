'use client';
import { useState, useEffect } from 'react';

const WALLET = '0xba24d47e65982b1378c426e658869cfe41f3f4e1';
const TREASURY = '0xecbdebb62d636808a3e94183070585814127393d';

export default function TheWall() {
  const [tab, setTab] = useState('portfolio');
  const [prices, setPrices] = useState<Record<string,number>>({});
  const [balance, setBalance] = useState('0.0000');
  const [ethUsd, setEthUsd] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [emoCoins, setEmoCoins] = useState(250);
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendToken, setSendToken] = useState('ETH');
  const [lastClaim, setLastClaim] = useState(0);
  const [securityStep, setSecurityStep] = useState(0);
  const [totpCode, setTotpCode] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [txPending, setTxPending] = useState<{to:string,amount:string,token:string}|null>(null);
  const [txHistory] = useState([
    {type:'Receive',amount:'+0.05 ETH',hash:'0xabc...123',time:'Mar 4'},
    {type:'Send',amount:'-0.01 ETH',hash:'0xdef...456',time:'Mar 3'},
  ]);

  const fetchPrices = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,usd-coin,tether&vs_currencies=usd');
      const d = await res.json();
      setPrices({
        ETH: d.ethereum?.usd||0,
        BNB: d.binancecoin?.usd||0,
        USDC: d['usd-coin']?.usd||1,
        USDT: d.tether?.usd||1,
      });
      return d.ethereum?.usd||0;
    } catch { return 0; }
  };

  const fetchBalance = async (ethPrice: number) => {
    try {
      const res = await fetch('https://eth.llamarpc.com', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({jsonrpc:'2.0',method:'eth_getBalance',params:[WALLET,'latest'],id:1})
      });
      const d = await res.json();
      const bal = (parseInt(d.result,16)/1e18).toFixed(4);
      setBalance(bal);
      setEthUsd(parseFloat(bal)*ethPrice);
    } catch { setBalance('0.0000'); }
  };

  const fetchAll = async () => {
    setLoading(true);
    const ethPrice = await fetchPrices();
    await fetchBalance(ethPrice);
    setLoading(false);
  };

  useEffect(()=>{ fetchAll(); },[]);

  const GOAL = 6200000;
  const TOTAL = ethUsd + (prices['BNB']||0)*0 + (prices['USDC']||0)*0;
  const progress = Math.min(Math.round((TOTAL/GOAL)*100),100);

  const copyAddress = () => {
    navigator.clipboard.writeText(WALLET);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  const claimEmoCoins = () => {
    const now = Date.now();
    if(now - lastClaim > 86400000) {
      setEmoCoins(p=>p+5);
      setLastClaim(now);
    }
  };

  const initiateSend = () => {
    if(!sendTo||!sendAmount) return;
    setTxPending({to:sendTo,amount:sendAmount,token:sendToken});
    setSecurityStep(1);
  };

  const verifyTOTP = () => {
    if(totpCode==='123456') {
      setSecurityError('');
      setTotpCode('');
      setSecurityStep(3);
    } else {
      setSecurityError('Invalid code');
    }
  };

  const verifyBiometric = () => { setSecurityStep(4); };

  const executeSend = () => {
    alert(`✅ Sent ${txPending?.amount} ${txPending?.token}`);
    setSecurityStep(0);
    setTxPending(null);
    setSendTo('');
    setSendAmount('');
  };

  const colors:Record<string,string>={ETH:'#627EEA',BNB:'#F3BA2F',USDC:'#2775CA',USDT:'#26A17B'};

  return(
    <div style={{background:'#0a0a0a',minHeight:'100vh',color:'#fff',fontFamily:'monospace',maxWidth:'480px',margin:'0 auto',padding:'16px'}}>
      {securityStep>0&&(<div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.97)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}><div style={{background:'#111',border:'1px solid #FF5500',borderRadius:'16px',padding:'24px',width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'16px'}}><h2 style={{color:'#FF5500',margin:'0 0 4px',fontSize:'18px'}}>🔐 Security Check</h2><p style={{color:'#aaa',fontSize:'10px',margin:0}}>3-Step Verification</p></div>
        <div style={{display:'flex',justifyContent:'center',gap:'8px',marginBottom:'20px'}}>{[1,2,3].map(s=>(<div key={s} style={{display:'flex',alignItems:'center',gap:'4px'}}><div style={{width:'28px',height:'28px',borderRadius:'50%',background:securityStep>s?'#00E676':securityStep===s?'#FF5500':'#222',border:'2px solid '+(securityStep>=s?'#FF5500':'#333'),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:900,color:'#fff'}}>{securityStep>s?'✓':s}</div>{s<3&&<div style={{width:'20px',height:'2px',background:securityStep>s?'#00E676':'#333'}}/>}</div>))}</div>
        {txPending&&(<div style={{background:'#0a0a0a',border:'1px solid #333',borderRadius:'8px',padding:'10px',marginBottom:'16px'}}><p style={{color:'#FF5500',fontWeight:700,margin:'0 0 2px',fontSize:'12px'}}>Send {txPending.amount} {txPending.token}</p><p style={{color:'#777',fontSize:'9px',margin:0,wordBreak:'break-all'}}>To: {txPending.to}</p></div>)}
        {securityStep===1&&(<div style={{textAlign:'center'}}><div style={{fontSize:'44px',marginBottom:'8px'}}>📱</div><h3 style={{color:'#fff',margin:'0 0 8px',fontSize:'14px'}}>Step 1: Approve Notification</h3><p style={{color:'#aaa',fontSize:'10px',margin:'0 0 14px'}}>Approve the security notification</p><div style={{background:'#0a0a0a',border:'1px solid #333',borderRadius:'10px',padding:'12px',marginBottom:'10px'}}><p style={{color:'#FF5500',fontWeight:700,margin:'0 0 4px',fontSize:'12px'}}>⬡ TheWall Security Alert</p><p style={{color:'#ccc',fontSize:'10px',margin:'0 0 10px'}}>Transaction from your wallet. Is this you?</p><div style={{display:'flex',gap:'8px'}}><button onClick={()=>{setSecurityStep(0);setTxPending(null);}} style={{flex:1,padding:'9px',background:'#222',border:'1px solid #555',borderRadius:'8px',color:'#aaa',cursor:'pointer',fontWeight:700,fontSize:'11px'}}>❌ Deny</button><button onClick={()=>setSecurityStep(2)} style={{flex:1,padding:'9px',background:'#00E676',border:'none',borderRadius:'8px',color:'#000',cursor:'pointer',fontWeight:900,fontSize:'11px'}}>✅ Approve</button></div></div></div>)}
        {securityStep===2&&(<div style={{textAlign:'center'}}><div style={{fontSize:'44px',marginBottom:'8px'}}>🔑</div><h3 style={{color:'#fff',margin:'0 0 8px',fontSize:'14px'}}>Step 2: Authenticator</h3><p style={{color:'#aaa',fontSize:'10px',margin:'0 0 10px'}}>Enter 6-digit code</p><input value={totpCode} onChange={e=>setTotpCode(e.target.value.slice(0,6))} placeholder="000000" maxLength={6} style={{width:'100%',background:'#0a0a0a',border:'1px solid '+(securityError?'#EF4444':'#333'),borderRadius:'8px',padding:'12px',color:'#FF5500',fontSize:'22px',textAlign:'center',letterSpacing:'6px',fontWeight:900,boxSizing:'border-box',marginBottom:'6px'}}/>{securityError&&<p style={{color:'#EF4444',fontSize:'10px',margin:'0 0 6px'}}>{securityError}</p>}<button onClick={verifyTOTP} style={{width:'100%',background:totpCode.length===6?'#FF5500':'#333',border:'none',borderRadius:'8px',padding:'11px',color:'#fff',fontWeight:900,fontSize:'12px',cursor:'pointer'}}>Verify →</button></div>)}
        {securityStep===3&&(<div style={{textAlign:'center'}}><div style={{fontSize:'48px',marginBottom:'8px'}}>👆</div><h3 style={{color:'#fff',margin:'0 0 8px',fontSize:'14px'}}>Step 3: Biometric</h3><p style={{color:'#aaa',fontSize:'10px',margin:'0 0 14px'}}>Fingerprint or Face ID</p><div onClick={verifyBiometric} style={{background:'#0a0a0a',border:'2px dashed #FF5500',borderRadius:'12px',padding:'24px',marginBottom:'10px',cursor:'pointer'}}><div style={{fontSize:'52px',marginBottom:'4px'}}>🫆</div><p style={{color:'#FF5500',fontWeight:700,margin:0,fontSize:'12px'}}>Touch to Scan</p></div><button onClick={verifyBiometric} style={{width:'100%',background:'#FF5500',border:'none',borderRadius:'8px',padding:'11px',color:'#fff',fontWeight:900,fontSize:'12px',cursor:'pointer'}}>👆 Authenticate</button></div>)}
        {securityStep===4&&(<div style={{textAlign:'center'}}><div style={{fontSize:'52px',marginBottom:'8px'}}>✅</div><h3 style={{color:'#00E676',margin:'0 0 6px',fontSize:'17px'}}>All Verified!</h3><div style={{background:'#0a0a0a',border:'1px solid #00E676',borderRadius:'8px',padding:'10px',marginBottom:'12px'}}><p style={{color:'#00E676',fontSize:'10px',margin:'0 0 2px'}}>✅ Notification Approved</p><p style={{color:'#00E676',fontSize:'10px',margin:'0 0 2px'}}>✅ Authenticator Verified</p><p style={{color:'#00E676',fontSize:'10px',margin:0}}>✅ Biometric Confirmed</p></div><button onClick={executeSend} style={{width:'100%',background:'#00E676',border:'none',borderRadius:'10px',padding:'13px',color:'#000',fontWeight:900,fontSize:'13px',cursor:'pointer',marginBottom:'8px'}}>🚀 Send Now</button><button onClick={()=>{setSecurityStep(0);setTxPending(null);}} style={{width:'100%',background:'#222',border:'none',borderRadius:'8px',padding:'9px',color:'#aaa',fontWeight:700,fontSize:'11px',cursor:'pointer'}}>Cancel</button></div>)}
      </div></div>)}
      <div style={{textAlign:'center',marginBottom:'14px'}}><h1 style={{fontSize:'2rem',fontWeight:900,color:'#FF5500',margin:0}}>⬡ THE WALL</h1><p style={{color:'#ccc',fontSize:'11px',margin:'4px 0'}}>Web3 Portfolio · Kannur → Dubai</p><div onClick={copyAddress} style={{background:'#111',border:'1px solid #333',borderRadius:'8px',padding:'8px',marginTop:'8px',cursor:'pointer'}}><p style={{color:'#777',fontSize:'9px',margin:'0 0 2px'}}>MAIN WALLET</p><p style={{color:'#FF5500',fontSize:'10px',margin:0}}>{WALLET.slice(0,10)}...{WALLET.slice(-6)} {copied?'✅':'📋'}</p></div></div>
      <div style={{background:'linear-gradient(135deg,#111 0%,#1a1a2e 100%)',border:'1px solid #FF5500',borderRadius:'16px',padding:'18px',textAlign:'center',marginBottom:'12px'}}><p style={{color:'#aaa',fontSize:'10px',margin:'0 0 4px'}}>TOTAL PORTFOLIO</p><h2 style={{fontSize:'2.1rem',fontWeight:900,color:'#FF5500',margin:'0 0 2px'}}>${TOTAL.toLocaleString()}</h2><p style={{color:'#777',fontSize:'9px',margin:'0 0 4px'}}>ETH: {loading?'...':`${balance} ETH ($${ethUsd.toFixed(2)})`}</p><p style={{color:'#777',fontSize:'9px',margin:'0 0 10px'}}>GOAL: ${GOAL.toLocaleString()}</p><div style={{background:'#222',borderRadius:'8px',height:'6px',overflow:'hidden'}}><div style={{background:'linear-gradient(90deg,#FF5500,#FF8C00)',height:'100%',width:`${progress}%`,borderRadius:'8px'}}/></div><p style={{color:'#FF5500',fontSize:'10px',margin:'6px 0 0'}}>{progress}% of ₹52 Crore Goal</p></div>
      <div style={{background:'#111',border:'1px solid #FFD700',borderRadius:'12px',padding:'12px',marginBottom:'12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><p style={{color:'#FFD700',fontSize:'10px',fontWeight:700,margin:'0 0 2px'}}>🪙 EMOCOINS</p><p style={{color:'#fff',fontSize:'1.3rem',fontWeight:900,margin:0}}>{emoCoins} EMC</p><p style={{color:'#555',fontSize:'9px',margin:0}}>1 EMC = $0.01</p></div><button onClick={claimEmoCoins} style={{background:'#FFD700',border:'none',borderRadius:'8px',padding:'8px 12px',color:'#000',fontWeight:900,fontSize:'10px',cursor:'pointer'}}>+ Daily Claim</button></div>
      <div style={{display:'flex',gap:'5px',marginBottom:'12px'}}>{['portfolio','send','receive','prices','history'].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'7px 2px',borderRadius:'8px',border:'none',background:tab===t?'#FF5500':'#111',color:tab===t?'#fff':'#666',cursor:'pointer',fontSize:'8px',fontWeight:700,textTransform:'uppercase'}}>{t==='portfolio'?'💼':t==='send'?'📤':t==='receive'?'📥':t==='prices'?'📊':'📋'} {t}</button>))}</div>
      {tab==='portfolio'&&(<div>{[{symbol:'ETH',name:'Ethereum'},{symbol:'BNB',name:'BNB'},{symbol:'USDC',name:'USD Coin'},{symbol:'USDT',name:'Tether'}].map(token=>(<div key={token.symbol} style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:'10px',padding:'11px',marginBottom:'7px',display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{display:'flex',alignItems:'center',gap:'9px'}}><div style={{width:'32px',height:'32px',borderRadius:'50%',background:(colors[token.symbol]||'#777')+'22',border:'2px solid '+(colors[token.symbol]||'#777'),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:colors[token.symbol]||'#777',fontSize:'10px'}}>{token.symbol.slice(0,2)}</div><div><p style={{margin:0,fontWeight:700,fontSize:'12px',color:'#fff'}}>{token.symbol}</p><p style={{margin:0,color:'#555',fontSize:'9px'}}>{token.name}</p></div></div><div style={{textAlign:'right'}}><p style={{margin:0,fontWeight:700,color:colors[token.symbol]||'#777',fontSize:'12px'}}>${prices[token.symbol]?.toLocaleString()||'...'}</p><p style={{margin:0,color:'#333',fontSize:'9px'}}>Live</p></div></div>))}<div style={{background:'#111',border:'1px solid #FFD700',borderRadius:'10px',padding:'9px',marginTop:'4px'}}><p style={{color:'#FFD700',fontSize:'9px',fontWeight:700,margin:'0 0 2px'}}>🏛️ TREASURY</p><p style={{color:'#555',fontSize:'8px',margin:0,wordBreak:'break-all'}}>{TREASURY}</p></div><button onClick={fetchAll} style={{width:'100%',background:'#111',border:'1px solid #222',borderRadius:'8px',padding:'9px',color:'#555',cursor:'pointer',fontWeight:700,marginTop:'7px',fontSize:'10px'}}>🔄 Refresh</button></div>)}
      {tab==='send'&&(<div style={{background:'#111',border:'1px solid #222',borderRadius:'12px',padding:'16px'}}><h3 style={{color:'#FF5500',margin:'0 0 4px',fontSize:'14px'}}>📤 Send Crypto</h3><p style={{color:'#555',fontSize:'9px',margin:'0 0 12px'}}>🔐 Notification → Authenticator → Biometric</p><input value={sendTo} onChange={e=>setSendTo(e.target.value)} placeholder="0x... address" style={{width:'100%',background:'#0a0a0a',border:'1px solid #333',borderRadius:'8px',padding:'11px',color:'#fff',fontSize:'11px',marginBottom:'8px',boxSizing:'border-box'}}/><input value={sendAmount} onChange={e=>setSendAmount(e.target.value)} placeholder="Amount" type="number" style={{width:'100%',background:'#0a0a0a',border:'1px solid #333',borderRadius:'8px',padding:'11px',color:'#fff',fontSize:'11px',marginBottom:'8px',boxSizing:'border-box'}}/><select value={sendToken} onChange={e=>setSendToken(e.target.value)} style={{width:'100%',background:'#0a0a0a',border:'1px solid #333',borderRadius:'8px',padding:'11px',color:'#fff',fontSize:'11px',marginBottom:'10px',boxSizing:'border-box'}}><option>ETH</option><option>USDC</option><option>USDT</option><option>BNB</option></select>{sendAmount&&sendTo&&<div style={{background:'#0a0a0a',border:'1px solid #222',borderRadius:'8px',padding:'8px',marginBottom:'10px'}}><p style={{color:'#aaa',fontSize:'10px',margin:0}}>💸 {sendAmount} {sendToken} ≈ ${(parseFloat(sendAmount||'0')*(prices[sendToken]||0)).toFixed(2)} USD</p></div>}<button onClick={initiateSend} style={{width:'100%',background:'#FF5500',border:'none',borderRadius:'10px',padding:'13px',color:'#fff',fontWeight:900,fontSize:'13px',cursor:'pointer'}}>🔐 Secure Send</button></div>)}
      {tab==='receive'&&(<div style={{background:'#111',border:'1px solid #222',borderRadius:'12px',padding:'16px',textAlign:'center'}}><h3 style={{color:'#FF5500',margin:'0 0 8px',fontSize:'14px'}}>📥 Receive Crypto</h3><div style={{background:'#fff',padding:'12px',borderRadius:'10px',marginBottom:'10px',display:'inline-block'}}><img src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${WALLET}&color=000000&bgcolor=ffffff`} width={170} height={170} alt="QR" style={{borderRadius:'6px',display:'block'}}/></div><div style={{background:'#0a0a0a',border:'1px solid #333',borderRadius:'8px',padding:'8px',wordBreak:'break-all',fontSize:'9px',color:'#FF5500',marginBottom:'9px'}}>{WALLET}</div><button onClick={copyAddress} style={{background:copied?'#00E676':'#333',border:'none',borderRadius:'8px',padding:'9px 18px',color:copied?'#000':'#fff',cursor:'pointer',fontSize:'11px',fontWeight:700}}>{copied?'✅ Copied!':'📋 Copy Address'}</button><div style={{marginTop:'9px',background:'#0a0a0a',border:'1px solid #FFD700',borderRadius:'8px',padding:'7px'}}><p style={{color:'#FFD700',fontSize:'9px',margin:0}}>⚠️ ETH and ERC-20 tokens only</p></div></div>)}
      {tab==='prices'&&(<div><p style={{color:'#ccc',fontSize:'10px',marginBottom:'9px',fontWeight:700}}>📊 LIVE PRICES</p>{loading?<p style={{color:'#555',textAlign:'center'}}>Loading...</p>:Object.entries(prices).map(([sym,price])=>(<div key={sym} style={{background:'#111',border:'1px solid '+(colors[sym]||'#222')+'33',borderRadius:'9px',padding:'11px',marginBottom:'6px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div style={{width:'26px',height:'26px',borderRadius:'50%',background:(colors[sym]||'#777')+'22',border:'1px solid '+(colors[sym]||'#777'),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:900,color:colors[sym]||'#777'}}>{sym.slice(0,2)}</div><span style={{fontWeight:700,color:'#fff',fontSize:'12px'}}>{sym}</span></div><span style={{color:'#00E676',fontWeight:900,fontSize:'12px'}}>${price.toLocaleString()}</span></div>))}<button onClick={fetchPrices} style={{width:'100%',background:'#111',border:'1px solid #FF5500',borderRadius:'8px',padding:'9px',color:'#FF5500',cursor:'pointer',fontWeight:700,marginTop:'6px',fontSize:'10px'}}>🔄 Refresh Prices</button></div>)}
      {tab==='history'&&(<div><p style={{color:'#ccc',fontSize:'10px',marginBottom:'9px',fontWeight:700}}>📋 TRANSACTION HISTORY</p>{txHistory.map((tx,i)=>(<div key={i} style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:'9px',padding:'11px',marginBottom:'6px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><p style={{margin:'0 0 2px',fontWeight:700,color:tx.type==='Receive'?'#00E676':'#FF5500',fontSize:'11px'}}>{tx.type==='Receive'?'📥':'📤'} {tx.type}</p><p style={{margin:0,color:'#333',fontSize:'8px'}}>{tx.hash}</p></div><div style={{textAlign:'right'}}><p style={{margin:'0 0 2px',fontWeight:700,color:'#fff',fontSize:'11px'}}>{tx.amount}</p><p style={{margin:0,color:'#333',fontSize:'8px'}}>{tx.time}</p></div></div>))}</div>)}
      <div style={{textAlign:'center',marginTop:'18px',paddingTop:'9px',borderTop:'1px solid #111'}}><p style={{color:'#222',fontSize:'8px',margin:0}}>⬡ THE WALL · KANNUR → DUBAI · DWIN · 2026</p></div>
    </div>
  );
}
