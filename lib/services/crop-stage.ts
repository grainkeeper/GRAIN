export type RiceStage =
  | 'nursery'
  | 'vegetative'
  | 'tillering'
  | 'pi'
  | 'booting'
  | 'heading'
  | 'flowering'
  | 'grain_fill'
  | 'maturity';

const TOTAL_DAYS = 130;

const bands: Array<[RiceStage, number, number]> = [
  ['nursery', 0, 20],
  ['vegetative', 21, 35],
  ['tillering', 36, 55],
  ['pi', 56, 65],
  ['booting', 66, 75],
  ['heading', 76, 85],
  ['flowering', 86, 95],
  ['grain_fill', 96, 115],
  ['maturity', 116, 130]
];

export function daysAfter(dateISO: string) {
  const start = new Date(dateISO);
  const today = new Date();
  const diffMs = today.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / 86400000));
}

export type StageBoundary = { stage: RiceStage; start_date: string; end_date: string }

export function computeStage(
  das: number,
  boundaries?: StageBoundary[],
  anchorISO?: string
): { stage: RiceStage; progress: number; nextInDays: number } {
  // If custom boundaries provided, use them
  if (boundaries && boundaries.length > 0) {
    const today = new Date()
    let totalDays = 0
    let elapsed = 0
    let currentStage: RiceStage = 'nursery'
    let nextInDays = 0

    // Compute total span and find current stage
    const first = new Date(boundaries[0].start_date)
    const last = new Date(boundaries[boundaries.length - 1].end_date)
    totalDays = Math.max(1, Math.floor((last.getTime() - first.getTime()) / 86400000) + 1)
    elapsed = Math.max(0, Math.min(totalDays, Math.floor((today.getTime() - first.getTime()) / 86400000) + 1))

    for (const b of boundaries) {
      const s = new Date(b.start_date)
      const e = new Date(b.end_date)
      if (today >= s && today <= e) {
        currentStage = b.stage
        nextInDays = Math.max(0, Math.floor((e.getTime() - today.getTime()) / 86400000) + 1)
        break
      }
      if (today < s) {
        currentStage = b.stage
        nextInDays = Math.max(0, Math.floor((s.getTime() - today.getTime()) / 86400000))
        break
      }
    }

    // If past the last stage
    if (today > last) {
      return { stage: 'maturity', progress: 100, nextInDays: 0 }
    }

    const progress = Math.min(100, (elapsed / totalDays) * 100)
    return { stage: currentStage, progress, nextInDays }
  }

  // Fallback to DAS bands
  // Clamp values beyond known cycle to maturity
  if (das >= TOTAL_DAYS) {
    return { stage: 'maturity', progress: 100, nextInDays: 0 };
  }

  let stage: RiceStage = 'nursery';
  let nextInDays = 0;
  for (const [name, start, end] of bands) {
    if (das >= start && das <= end) {
      stage = name;
      nextInDays = Math.max(0, end - das + 1);
      break;
    }
  }
  const progress = Math.min(100, (das / TOTAL_DAYS) * 100);
  return { stage, progress, nextInDays };
}

export function prettyStage(stage: RiceStage) {
  switch (stage) {
    case 'pi':
      return 'Panicle Initiation';
    case 'grain_fill':
      return 'Grain Fill';
    default:
      return stage.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}


