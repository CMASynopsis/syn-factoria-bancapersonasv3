// data.jsx — mock data + formatters for Banco Digital
const USER = { name:'Juan Carlos García López', first:'Juan Carlos', initials:'JC', user:'jgarcia' };

const ACCOUNTS = [
  { id:'a1', type:'Ahorros',   cur:'PEN', sym:'S/', no:'123-456-789-0001', avail:14920.50, total:15420.50 },
  { id:'a2', type:'Ahorros',   cur:'USD', sym:'$',  no:'123-456-789-0003', avail:2500.00,  total:2500.00  },
  { id:'a3', type:'Corriente', cur:'PEN', sym:'S/', no:'123-456-789-0002', avail:8300.00,  total:8300.00  },
];

const BANKS = ['BCP','Interbank','BBVA','Scotiabank','BanBif','Banco Pichincha','Banco Falabella','Mibanco'];

const INITIAL_TX = [
  { id:'t1', date:'04 Jun 2026, 18:42', kind:'cci',  type:'Otro banco (CCI)', dest:'Pedro Flores Torres',        amount:-350, cur:'PEN', status:'Procesada' },
  { id:'t2', date:'04 Jun 2026, 18:42', kind:'same', type:'Mismo banco',      dest:'María Elena Ramírez Torres', amount:-200, cur:'PEN', status:'Procesada' },
  { id:'t3', date:'03 Jun 2026, 09:14', kind:'own',  type:'Entre mis cuentas',dest:'Cuenta Corriente · 0002',   amount:-1200,cur:'PEN', status:'Procesada' },
  { id:'t4', date:'02 Jun 2026, 14:05', kind:'in',   type:'Abono de haberes', dest:'EMPRESA TECH S.A.C.',        amount:4200, cur:'PEN', status:'Procesada' },
  { id:'t5', date:'01 Jun 2026, 11:30', kind:'same', type:'Mismo banco',      dest:'Carlos Quispe Mamani',       amount:-560, cur:'PEN', status:'Procesada' },
];

function money(n, sym='S/') {
  const v = Math.abs(n).toLocaleString('es-PE', { minimumFractionDigits:2, maximumFractionDigits:2 });
  return `${sym} ${v}`;
}
function signed(n, sym='S/') {
  return (n < 0 ? '−' : '+') + ' ' + money(n, sym);
}

Object.assign(window, { USER, ACCOUNTS, BANKS, INITIAL_TX, money, signed });
