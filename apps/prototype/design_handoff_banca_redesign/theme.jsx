// theme.jsx — 3 visual directions in blue / white / gray / purple (no green).
const THEMES = {
  azul: {
    label: 'A · Azul',
    vars: {
      '--bg':'#EDF1F8', '--surface':'#FFFFFF', '--surface-2':'#F2F5FB', '--surface-3':'#E4EAF5',
      '--text':'#0E1526', '--text-dim':'#4A546B', '--text-mute':'#8791A8',
      '--border':'#E0E6F1', '--border-strong':'#C8D1E2',
      '--primary':'#2563EB', '--primary-2':'#4F7BFF', '--on-primary':'#F0F5FF',
      '--accent':'#7C5CFF', '--on-accent':'#FFFFFF', '--ring':'#3B7BFF',
      '--positive':'#2563EB', '--positive-bg':'#DEEAFE', '--negative':'#E5484D',
      '--shadow':'18px 28px 60px -28px rgba(37,99,235,.32)',
    },
    cards: [
      { bg:'linear-gradient(145deg,#3B82F6,#1D4ED8)', chip:'rgba(255,255,255,.24)' },
      { bg:'linear-gradient(145deg,#8B6CFF,#5B34E0)', chip:'rgba(255,255,255,.24)' },
      { bg:'linear-gradient(145deg,#48566E,#1E293B)', chip:'rgba(255,255,255,.20)' },
    ],
  },
  morado: {
    label: 'B · Morado',
    vars: {
      '--bg':'#F1EDFA', '--surface':'#FFFFFF', '--surface-2':'#F5F1FD', '--surface-3':'#EAE3F8',
      '--text':'#1A1130', '--text-dim':'#574E70', '--text-mute':'#928AAC',
      '--border':'#E7E0F4', '--border-strong':'#D2C7EC',
      '--primary':'#7C3AED', '--primary-2':'#A855F7', '--on-primary':'#F7F3FF',
      '--accent':'#3B82F6', '--on-accent':'#FFFFFF', '--ring':'#8B47F2',
      '--positive':'#6D5CF6', '--positive-bg':'#E7E3FD', '--negative':'#E5484D',
      '--shadow':'18px 28px 60px -28px rgba(124,58,237,.36)',
    },
    cards: [
      { bg:'linear-gradient(145deg,#9B6CFF,#6D28D9)', chip:'rgba(255,255,255,.24)' },
      { bg:'linear-gradient(145deg,#C24DEE,#9333EA)', chip:'rgba(255,255,255,.24)' },
      { bg:'linear-gradient(145deg,#6E7BFF,#4338CA)', chip:'rgba(255,255,255,.22)' },
    ],
  },
  slate: {
    label: 'C · Slate',
    vars: {
      '--bg':'#EDF0F5', '--surface':'#FFFFFF', '--surface-2':'#F2F4F9', '--surface-3':'#E4E8F1',
      '--text':'#11182A', '--text-dim':'#4B5566', '--text-mute':'#869', /* placeholder fixed below */
      '--border':'#E1E5EE', '--border-strong':'#CAD1DE',
      '--primary':'#334155', '--primary-2':'#475569', '--on-primary':'#F1F5FB',
      '--accent':'#2D7BFF', '--on-accent':'#FFFFFF', '--ring':'#3B82F6',
      '--positive':'#2D7BFF', '--positive-bg':'#DEEAFE', '--negative':'#E5484D',
      '--shadow':'18px 28px 60px -28px rgba(30,41,59,.30)',
    },
    cards: [
      { bg:'linear-gradient(145deg,#475569,#1E293B)', chip:'rgba(255,255,255,.20)' },
      { bg:'linear-gradient(145deg,#3B82F6,#1D4ED8)', chip:'rgba(255,255,255,.24)' },
      { bg:'linear-gradient(145deg,#8B6CFF,#5B2EE5)', chip:'rgba(255,255,255,.22)' },
    ],
  },
};
// fix placeholder mute value
THEMES.slate.vars['--text-mute'] = '#828DA2';

function applyTheme(key) {
  const t = THEMES[key] || THEMES.azul;
  const root = document.documentElement;
  Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

Object.assign(window, { THEMES, applyTheme });
