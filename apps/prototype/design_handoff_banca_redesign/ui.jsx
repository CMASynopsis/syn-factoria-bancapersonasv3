// ui.jsx — icon set + shared UI components
const ICONS = {
  home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  transfer:'M7 7h11l-3-3M17 17H6l3 3M4 7h0M20 17h0',
  swap:'M7 4v13M7 4L4 7M7 4l3 3M17 20V7M17 20l3-3M17 20l-3-3',
  bank:'M3 9l9-6 9 6M4 9v9M20 9v9M9 9v9M15 9v9M3 21h18',
  globe:'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18',
  clock:'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',
  card:'M3 7h18v11H3zM3 11h18M7 15h3',
  user:'M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0',
  bell:'M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 01-3.4 0',
  eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  eyeoff:'M9.9 5.2A9.7 9.7 0 0112 5c6.5 0 10 7 10 7a16 16 0 01-3 3.6M6.3 6.3A16 16 0 002 12s3.5 7 10 7a9.7 9.7 0 004.1-.9M3 3l18 18M9.9 9.9a3 3 0 004.2 4.2',
  check:'M5 12l5 5L20 6',
  chevright:'M9 6l6 6-6 6',
  chevleft:'M15 6l-6 6 6 6',
  arrowleft:'M19 12H5M11 18l-6-6 6-6',
  plus:'M12 5v14M5 12h14',
  logout:'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  lock:'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',
  download:'M12 3v12M7 11l5 5 5-5M5 21h14',
  search:'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4-4',
  sparkle:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  arrowin:'M12 5v12M6 11l6 6 6-6',
  arrowup:'M12 19V7M6 13l6-6 6 6',
};
function Icon({ name, size=20, sw=1.9, className='', style }) {
  const d = ICONS[name] || '';
  return (
    <svg className={'ic '+className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split('M').filter(Boolean).map((seg,i)=><path key={i} d={'M'+seg} />)}
    </svg>
  );
}

function Button({ variant='primary', icon, iconRight, children, className='', ...rest }) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function Badge({ children, variant='ok', dot=true }) {
  return <span className={`badge badge-${variant} ${dot?'badge-dot':''}`}>{children}</span>;
}

// ---- Account card ----
function AccountCard({ acct, idx, theme, onClick }) {
  const c = (THEMES[theme]||THEMES.azul).cards[idx % 3];
  return (
    <div className="acct" style={{ background:c.bg }} onClick={onClick}>
      <div className="acct-top">
        <span className="acct-type">{acct.type}</span>
        <span className="acct-chip" style={{ background:c.chip }}>{acct.cur}</span>
      </div>
      <div className="acct-no">•••• {acct.no.slice(-4)}</div>
      <div className="acct-bal">
        <div className="lbl">Saldo disponible</div>
        <div className="amt num">{money(acct.avail, acct.sym)}</div>
        <div className="tot num">Saldo total: {money(acct.total, acct.sym)}</div>
      </div>
    </div>
  );
}

// ---- Sidebar (desktop) ----
const NAV = [
  { id:'home',     label:'Inicio',         icon:'home' },
  { id:'accounts', label:'Mis cuentas',    icon:'card' },
  { id:'tx-own',   label:'Transferencias', icon:'swap' },
  { id:'movs',     label:'Movimientos',    icon:'clock' },
];
function Sidebar({ screen, go, onLogout }) {
  const isTx = ['tx-own','tx-same','tx-cci'].includes(screen);
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Icon name="sparkle" size={22} sw={2} /></div>
        <div>
          <div className="brand-name">Banco Digital</div>
          <div className="brand-sub">Banca en línea</div>
        </div>
      </div>
      <div className="nav-label">Menú</div>
      {NAV.map(n=>{
        const active = n.id===screen || (n.id==='tx-own' && isTx) || (n.id==='accounts' && screen==='accounts');
        return (
          <button key={n.id} className={`nav-item ${active?'active':''}`} onClick={()=>go(n.id)}>
            <Icon name={n.icon} size={19} /> {n.label}
          </button>
        );
      })}
      <div className="nav-spacer" />
      <div className="side-card">
        <h4>¿Necesitas ayuda?</h4>
        <p>Atención 24/7 por chat seguro y teléfono.</p>
        <Button variant="accent" className="btn-block" style={{height:42,fontSize:13.5}}>Contactar</Button>
      </div>
      <button className="nav-item" onClick={onLogout} style={{marginTop:6}}>
        <Icon name="logout" size={19} /> Cerrar sesión
      </button>
    </aside>
  );
}

// ---- Topbar ----
function Topbar({ title, subtitle }) {
  return (
    <header className="topbar">
      <div>
        <div className="greet-h">{title}</div>
        <div className="greet-s">{subtitle}</div>
      </div>
      <div className="top-actions">
        <button className="icon-btn"><Icon name="search" size={19} /></button>
        <button className="icon-btn"><Icon name="bell" size={19} /><span className="dot" /></button>
        <div className="userchip">
          <div className="avatar">{USER.initials}</div>
          <div>
            <div className="nm">{USER.first}</div>
            <div className="rl">Cuenta personal</div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ---- Mobile bottom nav ----
function BottomNav({ screen, go }) {
  const isTx = ['tx-own','tx-same','tx-cci'].includes(screen);
  const items = [
    { id:'home', label:'Inicio', icon:'home' },
    { id:'accounts', label:'Cuentas', icon:'card' },
    { id:'tx-own', label:'Transferir', icon:'swap' },
    { id:'movs', label:'Movimientos', icon:'clock' },
  ];
  return (
    <nav className="botnav">
      {items.map(n=>{
        const active = n.id===screen || (n.id==='tx-own'&&isTx);
        return (
          <button key={n.id} className={active?'active':''} onClick={()=>go(n.id)}>
            <Icon name={n.icon} size={21} /> {n.label}
          </button>
        );
      })}
    </nav>
  );
}

Object.assign(window, { Icon, Button, Field, Badge, AccountCard, Sidebar, Topbar, BottomNav, NAV });
