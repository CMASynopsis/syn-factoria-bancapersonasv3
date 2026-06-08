// app.jsx — router, shell, theme tweaks
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "azul",
  "radius": 20,
  "accountStyle": "gradient"
}/*EDITMODE-END*/;

const TITLES = {
  home:     ['Inicio', 'Resumen de tus cuentas y operaciones'],
  accounts: ['Mis cuentas', 'Saldos y detalle de productos'],
  movs:     ['Movimientos', 'Historial de operaciones'],
  'tx-own': ['Transferencias', 'Entre mis cuentas'],
  'tx-same':['Transferencias', 'Mismo banco'],
  'tx-cci': ['Transferencias', 'Otro banco (CCI)'],
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [logged, setLogged] = React.useState(false);
  const [justLoggedOut, setJustLoggedOut] = React.useState(false);
  const [screen, setScreen] = React.useState('home');
  const [txs, setTxs] = React.useState(INITIAL_TX);

  React.useEffect(()=>{ applyTheme(t.theme); }, [t.theme]);
  React.useEffect(()=>{ document.documentElement.style.setProperty('--radius', t.radius+'px'); }, [t.radius]);

  const go = (s) => { setScreen(s); const el=document.getElementById('scrollArea'); if(el) el.scrollTop=0; };
  const onComplete = (tx) => setTxs(prev=>[tx, ...prev]);
  const logout = () => { setLogged(false); setJustLoggedOut(true); setScreen('home'); };

  const panel = (
    <TweaksPanel>
      <TweakSection label="Dirección visual" />
      <TweakRadio label="Tema" value={t.theme}
        options={[{label:'A · Azul', value:'azul'},{label:'B · Morado', value:'morado'},{label:'C · Slate', value:'slate'}]}
        onChange={v=>setTweak('theme', v)} />
      <TweakSection label="Forma" />
      <TweakSlider label="Redondeo" value={t.radius} min={8} max={28} step={2} unit="px"
        onChange={v=>setTweak('radius', v)} />
    </TweaksPanel>
  );

  if (!logged) {
    return (
      <>
        <Login showLogout={justLoggedOut} onLogin={()=>{ setLogged(true); setJustLoggedOut(false); go('home'); }} />
        {panel}
      </>
    );
  }

  const [title, sub] = TITLES[screen] || TITLES.home;
  let body = null;
  if (screen==='home') body = <Dashboard go={go} txs={txs} theme={t.theme} />;
  else if (screen==='accounts') body = <Accounts theme={t.theme} go={go} />;
  else if (screen==='movs') body = <Movements txs={txs} />;
  else if (screen==='tx-own') body = <TransferFlow variant="own" go={go} onComplete={onComplete} />;
  else if (screen==='tx-same') body = <TransferFlow variant="same" go={go} onComplete={onComplete} />;
  else if (screen==='tx-cci') body = <TransferFlow variant="cci" go={go} onComplete={onComplete} />;

  return (
    <>
      <div className="app">
        <Sidebar screen={screen} go={go} onLogout={logout} />
        <div className="main">
          <Topbar title={title} subtitle={sub} />
          <div className="scroll" id="scrollArea">
            {body}
          </div>
          <BottomNav screen={screen} go={go} />
        </div>
      </div>
      {panel}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
