// screens-home.jsx — Dashboard, Movements, Accounts
const QUICK = [
  { id:'tx-own',  icon:'swap',     title:'Entre mis cuentas', desc:'Sin costo, inmediato' },
  { id:'tx-same', icon:'bank',     title:'Mismo banco',       desc:'A otra cuenta Banco Digital' },
  { id:'tx-cci',  icon:'globe',    title:'Otro banco (CCI)',  desc:'Interbancario por CCI' },
  { id:'movs',    icon:'download', title:'Constancias',       desc:'Descarga tus comprobantes' },
];

function TxIcon({ kind }) {
  const map = { cci:'globe', same:'bank', own:'swap', in:'arrowin' };
  return <div className="tx-ic" style={ kind==='in' ? {background:'var(--positive-bg)', color:'var(--positive)'} : undefined}>
    <Icon name={map[kind]||'swap'} size={19} />
  </div>;
}

function TxRow({ t, compact }) {
  return (
    <div className="tx-row">
      <TxIcon kind={t.kind} />
      <div>
        <div className="tx-dest">{t.dest}</div>
        <div className="tx-type">{t.type}</div>
      </div>
      <div className="tx-date">{t.date}</div>
      <div className="tx-amt num" style={ t.amount>0 ? {color:'var(--positive)'} : undefined }>
        {signed(t.amount, t.cur==='USD'?'$':'S/')}
      </div>
      <div className="tx-badge-cell"><Badge variant="ok">{t.status}</Badge></div>
    </div>
  );
}

function Dashboard({ go, txs, theme }) {
  const totalPEN = ACCOUNTS.filter(a=>a.cur==='PEN').reduce((s,a)=>s+a.avail,0);
  return (
    <div className="page stagger">
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16, flexWrap:'wrap'}}>
        <div>
          <div className="eyebrow">Resumen general</div>
          <h1 className="h1" style={{marginTop:8}}>Hola, {USER.first} 👋</h1>
          <p className="muted" style={{margin:'8px 0 0', fontSize:15}}>
            Patrimonio disponible en soles: <strong className="num" style={{color:'var(--text)'}}>{money(totalPEN)}</strong>
          </p>
        </div>
        <Button icon="plus" onClick={()=>go('tx-own')}>Nueva transferencia</Button>
      </div>

      <div className="section-head">
        <h2 className="h2">Mis cuentas</h2>
        <button className="link" onClick={()=>go('accounts')}>Ver todas <Icon name="chevright" size={15} /></button>
      </div>
      <div className="accounts">
        {ACCOUNTS.map((a,i)=><AccountCard key={a.id} acct={a} idx={i} theme={theme} onClick={()=>go('accounts')} />)}
      </div>

      <div className="section-head">
        <h2 className="h2">Accesos rápidos</h2>
      </div>
      <div className="quick">
        {QUICK.map((q,i)=>{
          const tint = i===3 ? {bg:'var(--surface-3)', fg:'var(--text-dim)'} : {bg:'color-mix(in srgb,var(--accent) 18%, var(--surface))', fg:'var(--text)'};
          return (
            <button key={q.id} className="qa" onClick={()=>go(q.id)}>
              <div className="qa-ic" style={{background:tint.bg, color:tint.fg}}><Icon name={q.icon} size={22} /></div>
              <div>
                <h4>{q.title}</h4>
                <p>{q.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="section-head">
        <h2 className="h2">Últimas operaciones</h2>
        <button className="link" onClick={()=>go('movs')}>Ver historial <Icon name="chevright" size={15} /></button>
      </div>
      <div className="card tx">
        {txs.slice(0,4).map(t=><TxRow key={t.id} t={t} />)}
      </div>
    </div>
  );
}

function Movements({ txs }) {
  const [filter, setFilter] = React.useState('all');
  const filtered = filter==='all' ? txs : filter==='in' ? txs.filter(t=>t.amount>0) : txs.filter(t=>t.amount<0);
  const chips = [['all','Todas'],['out','Enviadas'],['in','Recibidas']];
  return (
    <div className="page fade-in">
      <div className="eyebrow">Historial</div>
      <h1 className="h1" style={{marginTop:8}}>Movimientos</h1>
      <p className="muted" style={{margin:'8px 0 22px', fontSize:15}}>Todas tus operaciones recientes en un solo lugar.</p>
      <div style={{display:'flex', gap:10, marginBottom:18, flexWrap:'wrap'}}>
        {chips.map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} className="badge" style={{
            height:38, padding:'0 18px', fontSize:13.5, cursor:'pointer',
            background: filter===k?'var(--primary)':'var(--surface)', color: filter===k?'var(--on-primary)':'var(--text-dim)',
            border:'1px solid var(--border)'
          }}>{l}</button>
        ))}
        <button className="btn btn-ghost" style={{marginLeft:'auto', height:38, fontSize:13.5}}><Icon name="download" size={17} /> Exportar</button>
      </div>
      <div className="card tx">
        {filtered.map(t=><TxRow key={t.id} t={t} />)}
      </div>
    </div>
  );
}

function Accounts({ theme, go }) {
  return (
    <div className="page fade-in">
      <div className="eyebrow">Tus productos</div>
      <h1 className="h1" style={{marginTop:8}}>Mis cuentas</h1>
      <p className="muted" style={{margin:'8px 0 22px', fontSize:15}}>Detalle de saldos disponibles y totales.</p>
      <div className="accounts">
        {ACCOUNTS.map((a,i)=><AccountCard key={a.id} acct={a} idx={i} theme={theme} onClick={()=>go('tx-own')} />)}
      </div>
      <div className="card" style={{marginTop:22, padding:'4px 0'}}>
        {ACCOUNTS.map((a,i)=>(
          <div key={a.id} className="tx-row" style={{gridTemplateColumns:'42px 1fr auto auto'}}>
            <div className="tx-ic"><Icon name="card" size={19} /></div>
            <div>
              <div className="tx-dest">Cuenta de {a.type} · {a.cur}</div>
              <div className="tx-type mono">{a.no}</div>
            </div>
            <div className="tx-amt num">{money(a.avail, a.sym)}</div>
            <button className="link" onClick={()=>go('tx-own')}>Transferir <Icon name="chevright" size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Movements, Accounts, TxRow });
