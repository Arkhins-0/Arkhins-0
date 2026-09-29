/** Tiny pixel-art renderer: each string is a row, each character a palette key ('.' is transparent). */

type Palette = Record<string, string>;

export const PAL: Palette = {
  P: '#ff3d8b', // hot pink
  p: '#b81f63', // pink shade
  G: '#ffcc33', // gold
  O: '#c98a12', // gold shade
  H: '#fff3b0', // highlight
  Y: '#a6f63c', // lime
  C: '#3de0ff', // cyan
  c: '#1c8fb3', // cyan shade
  W: '#ffffff',
  K: '#0b0620', // outline
  L: '#8f86b8', // hub grey
  R: '#ff4d4d', // heart red
  r: '#a3162b',
};

export function Pix({
  map,
  palette = PAL,
  className,
  label,
}: {
  map: string[];
  palette?: Palette;
  className?: string;
  label?: string;
}) {
  const h = map.length;
  const w = Math.max(...map.map((r) => r.length));
  const rects: JSX.Element[] = [];
  map.forEach((row, y) =>
    row.split('').forEach((ch, x) => {
      const fill = palette[ch];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={fill} />);
    })
  );
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {rects}
    </svg>
  );
}

export const CAR = [
  'KKKK........KK.........',
  'KPPK.......KGGK........',
  '.KPK......KGGCCK.......',
  '.KPKKKKKKKKKKKKKKKKK...',
  'KPPPPPPYYPPPPPPPPPPPKKK',
  'KPPPPPPYYPPPPPPPPPPPPPPK',
  'KKKKKKPPPPPPPPPPPKKKKKKK',
  '.KLLLK.KKKKKKKKK.KLLLK.',
  '.KLWLK...........KLWLK.',
  '.KLLLK...........KLLLK.',
  '..KKK.............KKK..',
];

export const HEART = ['.KK.KK.', 'KRRKRRK', 'KRWRRRK', 'KRRRRrK', '.KRRrK.', '..KrK..', '...K...'];
export const STAR = ['...K...', '..KGK..', 'KKKGKKK', 'KGGHGGK', '.KGGGK.', 'KGGKGGK', 'KKK.KKK'];
export const COIN = ['..KKK..', '.KGGGK.', 'KGHGGOK', 'KGHGGOK', 'KGHGGOK', '.KGOOK.', '..KKK..'];
export const GEM = ['.KKKKK.', 'KCWCCcK', 'KCCCCcK', '.KCCcK.', '..KcK..', '...K...'];
export const FLAG = ['KKKKKK', 'KYYYYK', 'KYKYYK', 'KYYYYK', 'KKKKKK', 'K.....', 'K.....', 'K.....'];
export const ICONS = [HEART, STAR, COIN, GEM];
