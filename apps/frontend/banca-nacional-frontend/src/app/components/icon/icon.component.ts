import { Component, Input } from '@angular/core';

const P: Record<string, string> = {
  home:      'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  swap:      'M7 4v13M7 4L4 7M7 4l3 3M17 20V7M17 20l3-3M17 20l-3-3',
  bank:      'M3 9l9-6 9 6M4 9v9M20 9v9M9 9v9M15 9v9M3 21h18',
  globe:     'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18',
  clock:     'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',
  card:      'M3 7h18v11H3zM3 11h18M7 15h3',
  user:      'M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0',
  bell:      'M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 01-3.4 0',
  eye:       'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  eyeoff:    'M9.9 5.2A9.7 9.7 0 0112 5c6.5 0 10 7 10 7a16 16 0 01-3 3.6M6.3 6.3A16 16 0 002 12s3.5 7 10 7a9.7 9.7 0 004.1-.9M3 3l18 18M9.9 9.9a3 3 0 004.2 4.2',
  check:     'M5 12l5 5L20 6',
  chevright: 'M9 6l6 6-6 6',
  chevleft:  'M15 6l-6 6 6 6',
  arrowleft: 'M19 12H5M11 18l-6-6 6-6',
  arrowright:'M5 12h14M13 6l6 6-6 6',
  plus:      'M12 5v14M5 12h14',
  logout:    'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  shield:    'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  lock:      'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',
  download:  'M12 3v12M7 11l5 5 5-5M5 21h14',
  search:    'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4-4',
  sparkle:   'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  arrowin:   'M12 5v12M6 11l6 6 6-6',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" [attr.stroke-width]="sw"
         stroke-linecap="round" stroke-linejoin="round"
         style="display:block;flex:none">
      @for (seg of segs; track $index) {
        <path [attr.d]="seg" />
      }
    </svg>
  `
})
export class IconComponent {
  @Input() name = '';
  @Input() size: number = 20;
  @Input() sw: number = 1.9;

  get segs(): string[] {
    const d = P[this.name] ?? '';
    return d ? d.split('M').filter(Boolean).map(s => 'M' + s) : [];
  }
}
