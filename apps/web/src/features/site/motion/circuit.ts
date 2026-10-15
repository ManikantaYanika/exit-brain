/**
 * Geometry for the hero "knowledge circuit", drawn from the Exit Brain mark: a lobed brain carrying
 * circuit traces with ring nodes (45° bends, as in the logo), a door, and speed lines leaving it.
 * Static data, so the prerendered SVG and the browser render are identical.
 */
type Pt = [number, number]

/** Brain silhouette as overlapping lobes (cx, cy, r). */
export const LOBES: [number, number, number][] = [
  [148, 150, 72],
  [222, 116, 66],
  [286, 160, 62],
  [104, 226, 70],
  [176, 258, 78],
  [256, 246, 70],
  [304, 212, 50],
]

const DOOR_X = 418

/** A trace: 45°-bent polyline inside the brain, then a smooth run into the door at `doorY`. */
function trace(points: Pt[], doorY: number) {
  const [first, ...rest] = points
  const last = points[points.length - 1]!
  const d = `M${first![0]} ${first![1]} ${rest.map(([x, y]) => `L${x} ${y}`).join(' ')} C ${last[0] + 48} ${last[1]}, ${DOOR_X - 52} ${doorY}, ${DOOR_X} ${doorY}`
  return { d, start: first! }
}

/** Signal traces: each ends inside the door. Order = top to bottom at the door. */
export const TRACES = [
  trace(
    [
      [96, 150],
      [150, 150],
      [176, 124],
      [262, 124],
      [290, 152],
      [330, 152],
    ],
    196,
  ),
  trace(
    [
      [78, 214],
      [138, 214],
      [162, 190],
      [314, 190],
    ],
    220,
  ),
  trace(
    [
      [200, 222],
      [240, 222],
      [262, 236],
      [338, 236],
    ],
    244,
  ),
  trace(
    [
      [118, 280],
      [194, 280],
      [220, 254],
      [318, 254],
    ],
    268,
  ),
  trace(
    [
      [156, 318],
      [246, 318],
      [272, 292],
      [312, 292],
    ],
    292,
  ),
]

/** Short decorative traces with vias, for texture inside the brain (no signal). */
export const VIAS: { d: string; end: Pt }[] = [
  { d: 'M214 72 L214 96 L236 96', end: [236, 96] },
  { d: 'M64 250 L88 250 L104 266', end: [104, 266] },
  { d: 'M300 110 L300 132 L276 132', end: [276, 132] },
  { d: 'M210 352 L210 334 L232 334', end: [232, 334] },
  { d: 'M126 104 L126 124 L104 124', end: [104, 124] },
]

/** Evidence chips: real artefact names tied to a trace start, placed outside the brain. */
export const CHIPS: { label: string; x: number; y: number; target: Pt }[] = [
  { label: 'billing-sync/cron', x: 6, y: 72, target: [96, 150] },
  { label: 'infra/backup.tf', x: 196, y: 20, target: [214, 72] },
  { label: 'webhooks #418', x: 6, y: 370, target: [156, 318] },
]

export const DOOR = { x: DOOR_X, top: 150, bottom: 310, depth: 58 }
