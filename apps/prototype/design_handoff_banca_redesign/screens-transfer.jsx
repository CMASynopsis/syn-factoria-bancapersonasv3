// screens-transfer.jsx — 3 transfer flows with form → review → success
const TX_CONFIG = {
  own:  { icon:'swap',  key:'own',  type:'Entre mis cuentas', title:'Transferencia entre mis cuentas', sub:'Mueve dinero entre tus propias cuentas, sin costo y al instante.' },
  same: { icon:'bank',  key:'same', type:'Mismo banco',       title:'Transferencia a mismo banco',      sub:'Envía a otra cuenta dentro de Banco Digital.' },
  cci:  { icon:'globe', key:'cci',  type:'Otro banco (CCI)',  title:'Transferencia a otro banco',        sub:'Interbancaria mediante CCI · Código de Cuenta Interbancario.' },
};

function acctLabel(a){ return `${a.type} ${a.cur} · ••${a.no.slice(-4)} — ${money(a.avail, a.sym)}`; }

function TransferSubnav({ variant, go }) {
  const tabs = [['own','Entre mis cuentas'],['same','Mismo banco'],['cci','Otro banco (CCI)']];
  return (
    <div style={{display:'flex', gap:8, marginBottom:24, flexWrap:'wrap'}}>
      {tabs.map(([k,l])=>(
        <button key={k} onClick={()=>go('tx-'+k)} className="badge" style={{
          height:40, padding:'0 18px', fontSize:13.5, cursor:'pointer',
          background: variant===k?'var(--primary)':'var(--surface)', color: variant===k?'var(--on-primary)':'var(--text-dim)',
          border:'1px solid var(--border)'
        }}>{l}</button>
      ))}
    </div>
  );
}

function TransferFlow({ variant, go, onComplete }) {
  const cfg = TX_CONFIG[variant];
  const [step, setStep] = React.useState('form');
  const [origin, setOrigin] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [glosa, setGlosa] = React.useState('');
  // own
  const [destAcct, setDestAcct] = React.useState('');
  // same
  const [destNo, setDestNo] = React.useState('');
  // cci
  const [bank, setBank] = React.useState('');
  const [cci, setCci] = React.useState('');
  const [holder, setHolder] = React.useState('');

  React.useEffect(()=>{ window.scrollTo?.(0,0); }, [step]);

  const originAcct = ACCOUNTS.find(a=>a.id===origin);
  const sym = originAcct ? originAcct.sym : 'S/';
  const amt = parseFloat(amount)||0;
  const overBalance = originAcct && amt > originAcct.avail;

  let destValid = false, destLabel = '', destSub = '';
  if (variant==='own'){ destValid = !!destAcct && destAcct!==origin; const d=ACCOUNTS.find(a=>a.id===destAcct); if(d){destLabel=`Cuenta ${d.type} · ${d.cur}`; destSub='•••• '+d.no.slice(-4);} }
  if (variant==='same'){ destValid = destNo.replace(/\D/g,'').length===13; destLabel='Cuenta Banco Digital'; destSub=destNo; }
  if (variant==='cci'){ destValid = !!bank && cci.replace(/\D/g,'').length===20 && holder.trim().length>2; destLabel=holder||'Titular destino'; destSub=(bank?bank+' · ':'')+'CCI '+cci.slice(-4); }

  const valid = !!origin && amt>0 && !overBalance && destValid;

  const confirm = () => {
    const tx = {
      id:'t'+Date.now(), date:'05 Jun 2026, 09:30', kind:cfg.key, type:cfg.type,
      dest: variant==='own' ? destLabel : (variant==='same' ? 'Cuenta '+destNo : holder),
      amount: -amt, cur: originAcct.cur, status:'Procesada',
    };
    onComplete(tx);
    setStep('success');
  };

  if (step==='success') {
    return <TransferSuccess cfg={cfg} amount={amt} sym={sym} destLabel={destLabel} destSub={destSub} go={go} />;
  }

  return (
    <div className="page fade-in">
      <button className="link" onClick={()=>go('home')} style={{marginBottom:16}}><Icon name="arrowleft" size={16} /> Volver al inicio</button>
      <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:6}}>
        <div className="qa-ic" style={{width:54, height:54, borderRadius:16, background:'var(--primary)', color:'var(--on-primary)', flex:'none'}}>
          <Icon name={cfg.icon} size={26} />
        </div>
        <div>
          <h1 className="h1">{cfg.title}</h1>
          <p className="muted" style={{margin:'6px 0 0', fontSize:15}}>{cfg.sub}</p>
        </div>
      </div>
      <div style={{height:22}} />
      <TransferSubnav variant={variant} go={go} />

      <div className="tform">
        <div className="card panel">
          {step==='form' ? (
            <>
              {variant==='cci' && <div className="grouped-title"><Icon name="card" size={15} /> Datos de origen</div>}
              <Field label="Cuenta origen">
                <select className="control" value={origin} onChange={e=>setOrigin(e.target.value)}>
                  <option value="">— Selecciona cuenta de origen —</option>
                  {ACCOUNTS.map(a=><option key={a.id} value={a.id}>{acctLabel(a)}</option>)}
                </select>
              </Field>

              {variant==='own' && (
                <Field label="Cuenta destino">
                  <select className="control" value={destAcct} onChange={e=>setDestAcct(e.target.value)}>
                    <option value="">— Selecciona cuenta de destino —</option>
                    {ACCOUNTS.filter(a=>a.id!==origin).map(a=><option key={a.id} value={a.id}>{acctLabel(a)}</option>)}
                  </select>
                </Field>
              )}

              {variant==='same' && (
                <Field label="Número de cuenta destino" hint="Ingresa los 13 dígitos de la cuenta destino en Banco Digital.">
                  <input className="control mono" value={destNo} onChange={e=>setDestNo(e.target.value.replace(/[^\d-]/g,'').slice(0,16))} placeholder="Ej. 123-456-789-0123" />
                </Field>
              )}

              {variant==='cci' && (
                <div className="grouped" style={{marginTop:20}}>
                  <div className="grouped-title"><Icon name="user" size={15} /> Datos del destinatario</div>
                  <Field label="Banco destino">
                    <select className="control" value={bank} onChange={e=>setBank(e.target.value)}>
                      <option value="">— Selecciona banco —</option>
                      {BANKS.map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                  </Field>
                  <Field label="CCI — Código de Cuenta Interbancario" hint="El CCI tiene 20 dígitos. Lo encuentras en tu cartilla de cuenta.">
                    <input className="control mono" value={cci} onChange={e=>setCci(e.target.value.replace(/\D/g,'').slice(0,20))} placeholder="20 dígitos del CCI" />
                  </Field>
                  <Field label="Nombre del titular">
                    <input className="control" value={holder} onChange={e=>setHolder(e.target.value)} placeholder="Nombre completo del titular" />
                  </Field>
                </div>
              )}

              <div className={variant==='cci' ? 'grouped' : ''} style={variant==='cci'?{marginTop:16}:{marginTop:20}}>
                {variant==='cci' && <div className="grouped-title"><Icon name="swap" size={15} /> Datos de la operación</div>}
                <Field label="Monto a transferir" hint={ variant==='cci' ? 'Límite: S/ 50,000.00 por operación.' : (originAcct ? `Disponible: ${money(originAcct.avail, sym)}` : 'Selecciona una cuenta de origen.') }>
                  <div className="amount-wrap">
                    <span className="cur">{sym}</span>
                    <input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value.replace(/[^\d.]/g,''))} placeholder="0.00" className="num" />
                  </div>
                </Field>
                {overBalance && <div className="hint" style={{color:'var(--negative)', fontWeight:600, marginTop:8}}>El monto supera el saldo disponible.</div>}
                <div style={{height:16}} />
                <Field label={<span>Glosa / Referencia <span style={{color:'var(--text-mute)', fontWeight:500}}>(opcional)</span></span>}>
                  <input className="control" value={glosa} onChange={e=>setGlosa(e.target.value)} placeholder="Motivo de la transferencia" />
                </Field>
              </div>

              <div className="note" style={{marginTop:20}} {...(variant==='cci' ? {className:'note note-warn'} : {className:'note note-info'})}>
                <Icon name={variant==='cci'?'clock':'check'} size={18} />
                <span>{ variant==='cci'
                  ? 'Las transferencias interbancarias se procesan en el próximo ciclo de liquidación. El plazo de acreditación es de hasta 24 horas hábiles. Verifica bien los datos antes de confirmar.'
                  : 'Las transferencias dentro de Banco Digital se procesan de forma inmediata y sin costo adicional.' }</span>
              </div>

              <div style={{display:'flex', gap:12, marginTop:26, justifyContent:'flex-end'}}>
                <Button variant="ghost" onClick={()=>go('home')}>Cancelar</Button>
                <Button disabled={!valid} onClick={()=>setStep('review')} iconRight="chevright">Continuar</Button>
              </div>
            </>
          ) : (
            <ReviewStep cfg={cfg} originAcct={originAcct} sym={sym} amt={amt} glosa={glosa}
              destLabel={destLabel} destSub={destSub} onBack={()=>setStep('form')} onConfirm={confirm} variant={variant} />
          )}
        </div>

        <div className="card panel summary">
          <div className="eyebrow" style={{marginBottom:14}}>Resumen</div>
          <SumRow k="Desde" v={originAcct ? `${originAcct.type} ${originAcct.cur}` : '—'} sub={originAcct?('•••• '+originAcct.no.slice(-4)):''} />
          <SumRow k="Hacia" v={destValid?destLabel:'—'} sub={destValid?destSub:''} />
          <SumRow k="Comisión" v={variant==='cci'?money(0,sym):'Sin costo'} />
          <div className="sum-row sum-total" style={{marginTop:6, paddingTop:14, borderTop:'1.5px solid var(--border)'}}>
            <span className="k">Total a debitar</span>
            <span className="v num">{money(amt, sym)}</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:9, marginTop:18, fontSize:12.5, color:'var(--text-mute)', fontWeight:600}}>
            <Icon name="shield" size={16} /> Operación protegida y cifrada
          </div>
        </div>
      </div>
    </div>
  );
}

function SumRow({ k, v, sub }) {
  return (
    <div className="sum-row">
      <span className="k">{k}</span>
      <span style={{textAlign:'right'}}>
        <span className="v" style={{display:'block'}}>{v}</span>
        {sub && <span className="mono" style={{fontSize:11.5, color:'var(--text-mute)'}}>{sub}</span>}
      </span>
    </div>
  );
}

function ReviewStep({ cfg, originAcct, sym, amt, glosa, destLabel, destSub, onBack, onConfirm, variant }) {
  return (
    <div className="fade-in">
      <div className="grouped-title" style={{marginBottom:18}}><Icon name="check" size={15} /> Confirma tu transferencia</div>
      <div style={{textAlign:'center', padding:'8px 0 22px', borderBottom:'1px dashed var(--border)'}}>
        <div className="muted" style={{fontSize:13, fontWeight:600}}>Vas a transferir</div>
        <div className="num" style={{fontSize:46, fontWeight:800, letterSpacing:'-.03em', margin:'6px 0 2px'}}>{money(amt, sym)}</div>
        <div className="muted" style={{fontSize:13}}>{cfg.type}</div>
      </div>
      <div style={{padding:'8px 0'}}>
        <SumRow k="Desde" v={`${originAcct.type} ${originAcct.cur}`} sub={'•••• '+originAcct.no.slice(-4)} />
        <SumRow k="Hacia" v={destLabel} sub={destSub} />
        {glosa && <SumRow k="Glosa" v={glosa} />}
        <SumRow k="Disponible después" v={money(originAcct.avail-amt, sym)} />
      </div>
      <div className="note note-info" style={{marginTop:8}}>
        <Icon name="shield" size={18} />
        <span>Revisa que los datos del destinatario sean correctos. Una vez confirmada, la operación no se puede revertir.</span>
      </div>
      <div style={{display:'flex', gap:12, marginTop:24, justifyContent:'flex-end'}}>
        <Button variant="ghost" onClick={onBack} icon="arrowleft">Editar</Button>
        <Button variant="accent" onClick={onConfirm} iconRight="check">Confirmar y transferir</Button>
      </div>
    </div>
  );
}

function TransferSuccess({ cfg, amount, sym, destLabel, destSub, go }) {
  return (
    <div className="page fade-in" style={{maxWidth:560, paddingTop:60}}>
      <div className="card panel" style={{textAlign:'center', padding:'44px 36px'}}>
        <div style={{width:84, height:84, borderRadius:'50%', margin:'0 auto 22px', display:'grid', placeItems:'center',
          background:'var(--positive-bg)', color:'var(--positive)'}}>
          <Icon name="check" size={44} sw={2.4} />
        </div>
        <div className="eyebrow" style={{color:'var(--positive)'}}>Transferencia exitosa</div>
        <div className="num" style={{fontSize:48, fontWeight:800, letterSpacing:'-.03em', margin:'10px 0 4px'}}>{money(amount, sym)}</div>
        <p className="muted" style={{margin:'0 0 24px', fontSize:15}}>
          {cfg.key==='cci' ? 'Se acreditará en hasta 24 horas hábiles.' : 'Acreditado de forma inmediata.'}
        </p>
        <div style={{textAlign:'left', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:16, padding:'6px 18px'}}>
          <SumRow k="Operación" v={cfg.type} />
          <SumRow k="Destino" v={destLabel} sub={destSub} />
          <SumRow k="N° de operación" v={<span className="mono">OP-{Math.floor(Math.random()*9e7+1e7)}</span>} />
          <SumRow k="Fecha" v="05 Jun 2026, 09:30" />
        </div>
        <div style={{display:'flex', gap:12, marginTop:24}}>
          <Button variant="ghost" className="btn-block" icon="download" onClick={()=>go('movs')}>Constancia</Button>
          <Button className="btn-block" onClick={()=>go('home')}>Ir al inicio</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TransferFlow });
