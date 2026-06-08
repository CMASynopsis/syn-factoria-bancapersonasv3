// screens-auth.jsx — Login
function Login({ onLogin, showLogout }) {
  const [user, setUser] = React.useState('jgarcia');
  const [pwd, setPwd] = React.useState('clave1234');
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(onLogin, 700);
  };

  return (
    <div className="auth fade-in">
      <div className="auth-brand">
        <div className="brand" style={{padding:0, color:'inherit'}}>
          <div className="brand-mark" style={{background:'var(--accent)', color:'var(--on-accent)'}}>
            <Icon name="sparkle" size={22} sw={2} />
          </div>
          <div>
            <div className="brand-name">Banco Digital</div>
            <div className="brand-sub" style={{color:'rgba(255,255,255,.6)'}}>Banca en línea segura</div>
          </div>
        </div>
        <div style={{marginTop:'auto', maxWidth:430}}>
          <div className="eyebrow" style={{color:'var(--accent)'}}>Tu dinero, sin fricción</div>
          <h1 style={{fontSize:46, fontWeight:800, letterSpacing:'-.035em', lineHeight:1.02, margin:'14px 0 18px'}}>
            Mueve tu dinero<br/>en segundos.
          </h1>
          <p style={{fontSize:16, lineHeight:1.55, opacity:.82, margin:0, fontWeight:500}}>
            Transferencias inmediatas, control total de tus cuentas y la seguridad de siempre — con una experiencia hecha para hoy.
          </p>
          <div style={{display:'flex', gap:26, marginTop:34}}>
            {[['Inmediato','Mismo banco'],['24h','Interbancario'],['256-bit','Cifrado']].map(([a,b])=>(
              <div key={a}>
                <div className="num" style={{fontSize:24, fontWeight:800, letterSpacing:'-.02em'}}>{a}</div>
                <div style={{fontSize:12.5, opacity:.7, fontWeight:600, marginTop:2}}>{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginTop:'auto', display:'flex', alignItems:'center', gap:8, fontSize:12.5, opacity:.7, fontWeight:600}}>
          <Icon name="lock" size={15} /> Conexión segura SSL/TLS 256 bits
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div style={{display:'none'}} className="brand" />
          <h2 className="h1" style={{fontSize:27}}>Iniciar sesión</h2>
          <p className="muted" style={{margin:'8px 0 26px', fontSize:14.5}}>Ingresa con tus credenciales para continuar.</p>

          {showLogout && (
            <div className="note note-info" style={{marginBottom:20}}>
              <Icon name="check" size={18} style={{color:'var(--positive)'}} />
              <span>Has cerrado sesión exitosamente. ¡Hasta pronto!</span>
            </div>
          )}

          <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:18}}>
            <Field label="Usuario">
              <input className="control" value={user} onChange={e=>setUser(e.target.value)} placeholder="Tu usuario" autoComplete="username" />
            </Field>
            <Field label="Contraseña">
              <div className="pwd-wrap">
                <input className="control" type={show?'text':'password'} value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                <button type="button" className="pwd-toggle" onClick={()=>setShow(s=>!s)} aria-label="Mostrar contraseña">
                  <Icon name={show?'eyeoff':'eye'} size={19} />
                </button>
              </div>
            </Field>
            <div style={{display:'flex', justifyContent:'flex-end', marginTop:-4}}>
              <a className="link" href="#" onClick={e=>e.preventDefault()} style={{fontSize:13}}>¿Olvidaste tu clave?</a>
            </div>
            <Button type="submit" className="btn-block" disabled={loading} style={{marginTop:4}}>
              {loading ? 'Ingresando…' : 'Ingresar'} {!loading && <Icon name="arrowleft" size={18} style={{transform:'rotate(180deg)'}} />}
            </Button>
          </form>

          <div style={{textAlign:'center', marginTop:22, fontSize:13.5}} className="muted">
            ¿Problemas para ingresar? <a className="link" href="#" onClick={e=>e.preventDefault()} style={{color:'var(--text)'}}>Contáctanos</a>
          </div>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { Login });
