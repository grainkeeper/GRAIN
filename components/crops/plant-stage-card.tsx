'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { computeStage, daysAfter, prettyStage, RiceStage, StageBoundary } from '@/lib/services/crop-stage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { FarmHistoricalPerformance, UserFarmProfile } from '@/lib/types/database';

type Method = 'direct' | 'transplant';

type Props = {
  name: string;
  method: Method;
  sowingDate: string; // ISO
  transplantDate?: string; // ISO
  farmProfileId?: string; // Optional: if provided, will fetch real data
};

export default function PlantStageCard({ name, method, sowingDate, transplantDate, farmProfileId }: Props) {
  const [realData, setRealData] = useState<{
    performance: FarmHistoricalPerformance | null;
    profile: UserFarmProfile | null;
    loading: boolean;
    userChecked: boolean;
  }>({ performance: null, profile: null, loading: false, userChecked: false });
  const [editing, setEditing] = useState(false)
  const [boundaries, setBoundaries] = useState<StageBoundary[] | null>(null)
  const [timelineLoading, setTimelineLoading] = useState(false)

  const supabase = createClient();

  // Fetch real data for logged-in users
  useEffect(() => {
    const fetchRealData = async () => {
      setRealData(prev => ({ ...prev, loading: true }));
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRealData({ performance: null, profile: null, loading: false, userChecked: true });
          return;
        }

        let profile: UserFarmProfile | null = null;
        let performance: FarmHistoricalPerformance | null = null;

        if (farmProfileId) {
          // Use specific farm profile ID if provided
          const { data: profileData } = await supabase
            .from('user_farm_profiles')
            .select('*')
            .eq('id', farmProfileId)
            .eq('user_id', user.id)
            .maybeSingle();
          profile = profileData;

          if (profile) {
            const { data: performanceData } = await supabase
              .from('farm_historical_performance')
              .select('*')
              .eq('farm_profile_id', farmProfileId)
              .order('planting_date', { ascending: false })
              .limit(1)
              .maybeSingle();
            performance = performanceData;
          }
        } else {
          // Auto-fetch user's most recent active farm profile
          const { data: profileData } = await supabase
            .from('user_farm_profiles')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          profile = profileData;

          if (profile) {
            const { data: performanceData } = await supabase
              .from('farm_historical_performance')
              .select('*')
              .eq('farm_profile_id', profile.id)
              .order('planting_date', { ascending: false })
              .limit(1)
              .maybeSingle();
            performance = performanceData;
          }
        }

        setRealData({ performance, profile, loading: false, userChecked: true });

        // Fetch growth cycle boundaries if we have a profile (lazy loading)
        if (profile && !boundaries) {
          setTimelineLoading(true);
          try {
            const cycleRes = await fetch(`/api/growth-cycles?farm_profile_id=${profile.id}`, { cache: 'no-store' });
            const cycleJson = await cycleRes.json();
            if (cycleJson?.data?.overrides?.length) {
              setBoundaries(cycleJson.data.overrides);
            }
          } catch (error) {
            console.error('Error fetching growth cycle data:', error);
            // Continue with default boundaries if fetch fails
          } finally {
            setTimelineLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching farm data:', error);
        setRealData({ performance: null, profile: null, loading: false, userChecked: true });
      }
    };

    fetchRealData();
  }, [farmProfileId, supabase]);

  // Use real data if available, otherwise fall back to props
  const actualSowingDate = realData.performance?.planting_date || sowingDate;
  const actualMethod = realData.profile?.farming_method?.toLowerCase().includes('transplant') ? 'transplant' : method;
  const actualVariety = realData.profile?.preferred_rice_variety || 'Unknown variety';
  const actualFarmName = realData.profile?.farm_name || name;

  const anchorDate = useMemo(() => {
    return actualMethod === 'transplant' && transplantDate ? transplantDate : actualSowingDate;
  }, [actualMethod, actualSowingDate, transplantDate]);

  const [das, setDas] = useState(() => daysAfter(anchorDate));

  // Update DAS when real data loads or anchor date changes
  useEffect(() => {
    const startISO = boundaries?.[0]?.start_date ?? anchorDate
    const computeDas = () => daysAfter(startISO)
    setDas(computeDas())
  }, [anchorDate, boundaries, realData.performance]);

  // Set up timer for periodic updates
  useEffect(() => {
    const startISO = boundaries?.[0]?.start_date ?? anchorDate
    const computeDas = () => daysAfter(startISO)
    const timer = setInterval(() => setDas(computeDas()), 60_000)
    return () => clearInterval(timer)
  }, [anchorDate, boundaries]);

  const { stage, progress, nextInDays } = useMemo(() => computeStage(das, boundaries ?? undefined, anchorDate), [das, boundaries, anchorDate]);

  // Show skeleton loading while farm data is being fetched or user hasn't been checked yet
  if (realData.loading || !realData.userChecked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
            </div>
          </CardTitle>
          <CardDescription>Loading your farm data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
          </div>

          <div className="w-full h-2 bg-muted rounded animate-pulse"></div>
          <div className="mt-2 h-3 w-24 bg-muted animate-pulse rounded"></div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="w-30 h-30 bg-muted animate-pulse rounded mx-auto"></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show skeleton loading while timeline data is being fetched
  if (realData.profile && timelineLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{actualFarmName}</span>
            <div className="flex items-center gap-2">
              <button className="text-xs underline" onClick={() => setEditing(v => !v)} disabled={!realData.profile}> {editing ? 'Close' : 'Edit timeline'} </button>
              <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
            </div>
          </CardTitle>
          <CardDescription>Loading timeline data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
          </div>

          <div className="w-full h-2 bg-muted rounded animate-pulse"></div>
          <div className="mt-2 h-3 w-24 bg-muted animate-pulse rounded"></div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="w-30 h-30 bg-muted animate-pulse rounded mx-auto"></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{actualFarmName}</span>
          <div className="flex items-center gap-2">
            <button className="text-xs underline" onClick={() => setEditing(v => !v)} disabled={!realData.profile}> {editing ? 'Close' : 'Edit timeline'} </button>
          <span className="text-sm text-muted-foreground">{das} d</span>
          </div>
        </CardTitle>
        <CardDescription>
          {realData.loading ? 'Loading your farm data...' : 
           realData.profile ? 'Your farm profile' : 'Demo data'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-primary capitalize">{prettyStage(stage as RiceStage)}</span>
          <span className="text-sm text-muted-foreground">Next in {nextInDays} d</span>
        </div>

        <Progress value={progress} className="h-2" />
        <div className="mt-2 text-xs text-muted-foreground">
          Progress: {progress.toFixed(1)}%
          {realData.profile && !boundaries && !timelineLoading && (
            <span className="ml-2 text-xs text-amber-600">(Using default timeline)</span>
          )}
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <StageImage stage={stage} className="mx-auto" />
          <ul className="text-sm space-y-2">
            <li className="flex items-center justify-between"><span className="text-muted-foreground">Days after start</span><span className="font-medium">{das} d</span></li>
            <li className="flex items-center justify-between"><span className="text-muted-foreground">Next stage</span><span className="font-medium">{nextInDays} d</span></li>
            <li className="flex items-center justify-between"><span className="text-muted-foreground">ETA to harvest</span><span className="font-medium">{Math.max(0, 130 - das)} d</span></li>
            {realData.performance?.harvest_date && (
              <li className="flex items-center justify-between"><span className="text-muted-foreground">Expected harvest</span><span className="font-medium">{realData.performance.harvest_date}</span></li>
            )}
            {realData.performance?.actual_yield_tons_per_hectare && (
              <li className="flex items-center justify-between"><span className="text-muted-foreground">Last yield</span><span className="font-medium">{realData.performance.actual_yield_tons_per_hectare} t/ha</span></li>
            )}
          </ul>
        </div>

        {editing && (
          <TimelineEditor
            farmProfileId={farmProfileId}
            anchorDate={anchorDate}
            onChange={setBoundaries}
            onClose={() => setEditing(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}

function StageImage({ stage, className = '' }: { stage: RiceStage; className?: string }) {
  const pool = ['/Images/2.png','/Images/3.png','/Images/4.png']
  const order: RiceStage[] = ['nursery','vegetative','tillering','pi','booting','heading','flowering','grain_fill','maturity']
  const idx = Math.max(0, order.indexOf(stage))
  const src = pool[idx % pool.length]
  return (
    <div className={className}>
      <Image src={src} alt={`${prettyStage(stage)} stage`} width={120} height={120} className="rounded" />
    </div>
  )
}

function TimelineEditor({ farmProfileId, anchorDate, onChange, onClose }: { farmProfileId?: string; anchorDate: string; onChange: (b: StageBoundary[] | null) => void; onClose: () => void }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [local, setLocal] = useState<StageBoundary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState<RiceStage>('nursery')
  const [daysIntoStage, setDaysIntoStage] = useState<number>(0)
  const [editDas, setEditDas] = useState<number>(0)
  const [editNextIn, setEditNextIn] = useState<number>(0)

  const STAGES: RiceStage[] = ['nursery','vegetative','tillering','pi','booting','heading','flowering','grain_fill','maturity']

  useEffect(() => {
    const fetchData = async () => {
      if (!farmProfileId) return
      setLoading(true)
      try {
        const cycleRes = await fetch(`/api/growth-cycles?farm_profile_id=${farmProfileId}`, { cache: 'no-store' })
        const cycleJson = await cycleRes.json()
        if (cycleJson?.data?.overrides?.length) {
          setLocal(cycleJson.data.overrides)
          onChange(cycleJson.data.overrides)
          initFromLocal(cycleJson.data.overrides)
        } else {
          // build defaults: 130 days split
          const total = 130
          const ratios: [RiceStage, number][] = [
            ['nursery', 0.15],
            ['vegetative', 0.12],
            ['tillering', 0.15],
            ['pi', 0.08],
            ['booting', 0.08],
            ['heading', 0.08],
            ['flowering', 0.08],
            ['grain_fill', 0.16],
            ['maturity', 0.10]
          ]
          let cursor = new Date(anchorDate)
          const arr: StageBoundary[] = ratios.map(([stage, r], idx) => {
            const days = Math.max(1, Math.round(total * r))
            const start = new Date(cursor)
            const end = new Date(cursor)
            end.setDate(end.getDate() + days - 1)
            if (idx < ratios.length - 1) {
              cursor = new Date(end)
              cursor.setDate(cursor.getDate() + 1)
            }
            return { stage, start_date: start.toISOString().slice(0,10), end_date: end.toISOString().slice(0,10) }
          })
          setLocal(arr)
          onChange(arr)
          initFromLocal(arr)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [farmProfileId, anchorDate, onChange])

  const updateBoundary = (index: number, key: 'start_date'|'end_date', value: string) => {
    setLocal(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      // keep continuity: ensure end >= start; and next.start = end+1
      const s = new Date(next[index].start_date)
      const e = new Date(next[index].end_date)
      if (e < s) {
        const s2 = new Date(s)
        s2.setDate(s2.getDate())
        next[index].end_date = s2.toISOString().slice(0,10)
      }
      if (index < next.length - 1) {
        const curEnd = new Date(next[index].end_date)
        const nStart = new Date(curEnd)
        nStart.setDate(nStart.getDate() + 1)
        next[index + 1].start_date = nStart.toISOString().slice(0,10)
      }
      if (index > 0) {
        const prevEnd = new Date(next[index - 1].end_date)
        const curStart = new Date(next[index].start_date)
        if (curStart.getTime() !== prevEnd.getTime() + 86400000) {
          const prevNewEnd = new Date(curStart)
          prevNewEnd.setDate(prevNewEnd.getDate() - 1)
          next[index - 1].end_date = prevNewEnd.toISOString().slice(0,10)
        }
      }
      return next
    })
  }

  const validate = (arr: StageBoundary[]) => {
    for (let i = 0; i < arr.length; i++) {
      const s = new Date(arr[i].start_date)
      const e = new Date(arr[i].end_date)
      if (e < s) return `End date must be after start date for ${prettyStage(arr[i].stage)}`
      if (i > 0) {
        const prevEnd = new Date(arr[i-1].end_date)
        if (s.getTime() !== prevEnd.getTime() + 86400000) return `${prettyStage(arr[i].stage)} must start the day after ${prettyStage(arr[i-1].stage)}`
      }
    }
    return null
  }

  const makeDefaults = () => {
    const total = 130
    const ratios: [RiceStage, number][] = [
      ['nursery', 0.15],
      ['vegetative', 0.12],
      ['tillering', 0.15],
      ['pi', 0.08],
      ['booting', 0.08],
      ['heading', 0.08],
      ['flowering', 0.08],
      ['grain_fill', 0.16],
      ['maturity', 0.10]
    ]
    let cursor = new Date(anchorDate)
    const arr: StageBoundary[] = ratios.map(([stage, r], idx) => {
      const days = Math.max(1, Math.round(total * r))
      const start = new Date(cursor)
      const end = new Date(cursor)
      end.setDate(end.getDate() + days - 1)
      if (idx < ratios.length - 1) {
        cursor = new Date(end)
        cursor.setDate(cursor.getDate() + 1)
      }
      return { stage, start_date: start.toISOString().slice(0,10), end_date: end.toISOString().slice(0,10) }
    })
    return arr
  }

  const resetDefaults = () => {
    const arr = makeDefaults()
    setLocal(arr)
    setError(null)
    onChange(arr)
  }

  // Build boundaries from selected stage and days already elapsed in that stage, centered on today
  const applyStageOldness = () => {
    const durations = (() => {
      const total = 130
      const ratios: [RiceStage, number][] = [
        ['nursery', 0.15],
        ['vegetative', 0.12],
        ['tillering', 0.15],
        ['pi', 0.08],
        ['booting', 0.08],
        ['heading', 0.08],
        ['flowering', 0.08],
        ['grain_fill', 0.16],
        ['maturity', 0.10]
      ]
      const raw = ratios.map(([, r]) => Math.max(1, Math.round(total * r)))
      // Adjust rounding drift to exactly total days
      const sum = raw.reduce((a,b)=>a+b,0)
      if (sum !== total) raw[raw.length - 1] += (total - sum)
      return raw
    })()

    const idx = STAGES.indexOf(selectedStage)
    const today = new Date()
    // Start of selected stage is today minus daysIntoStage
    const startSelected = new Date(today)
    startSelected.setDate(startSelected.getDate() - Math.max(0, Math.floor(daysIntoStage)))

    const bounds: StageBoundary[] = []
    // Build previous stages backward
    let cursorStart = new Date(startSelected)
    for (let i = idx - 1; i >= 0; i--) {
      const d = durations[i]
      const start = new Date(cursorStart)
      start.setDate(start.getDate() - d)
      const end = new Date(cursorStart)
      end.setDate(end.getDate() - 1)
      bounds.unshift({ stage: STAGES[i], start_date: start.toISOString().slice(0,10), end_date: end.toISOString().slice(0,10) })
      cursorStart = new Date(start)
    }
    // Selected stage
    const selEnd = new Date(startSelected)
    selEnd.setDate(selEnd.getDate() + durations[idx] - 1)
    bounds.push({ stage: STAGES[idx], start_date: startSelected.toISOString().slice(0,10), end_date: selEnd.toISOString().slice(0,10) })

    // Next stages forward
    let cursor = new Date(selEnd)
    for (let i = idx + 1; i < STAGES.length; i++) {
      const start = new Date(cursor)
      start.setDate(start.getDate() + 1)
      const end = new Date(start)
      end.setDate(end.getDate() + durations[i] - 1)
      bounds.push({ stage: STAGES[i], start_date: start.toISOString().slice(0,10), end_date: end.toISOString().slice(0,10) })
      cursor = new Date(end)
    }

    setLocal(bounds)
    onChange(bounds)
  }

  const totalDays = (() => {
    if (!local.length) return 0
    const first = new Date(local[0].start_date)
    const last = new Date(local[local.length - 1].end_date)
    return Math.max(1, Math.floor((last.getTime() - first.getTime()) / 86400000) + 1)
  })()

  // Small helper to get per-stage durations array summing to 130
  const getDurations = () => {
    const ratios: [RiceStage, number][] = [
      ['nursery', 0.15], ['vegetative', 0.12], ['tillering', 0.15], ['pi', 0.08],
      ['booting', 0.08], ['heading', 0.08], ['flowering', 0.08], ['grain_fill', 0.16], ['maturity', 0.10]
    ]
    const raw = ratios.map(([, r]) => Math.max(1, Math.round(130 * r)))
    const diff = 130 - raw.reduce((a,b)=>a+b,0)
    raw[raw.length - 1] += diff
    return raw
  }

  // Initialize numeric fields once after data load
  const initFromLocal = (arr: StageBoundary[]) => {
    if (!arr.length) return
    const today = new Date()
    const first = new Date(arr[0].start_date)
    const dasVal = Math.max(0, Math.floor((today.getTime() - first.getTime()) / 86400000) + 1)
    setEditDas(dasVal)

    const cur = arr.find(b => {
      const s = new Date(b.start_date)
      const e = new Date(b.end_date)
      return today >= s && today <= e
    })
    if (cur) {
      const end = new Date(cur.end_date)
      const nextIn = Math.max(0, Math.floor((end.getTime() - today.getTime()) / 86400000) + 1)
      setEditNextIn(nextIn)
      setSelectedStage(cur.stage)
      const durations = getDurations()
      const idx = STAGES.indexOf(cur.stage)
      const into = Math.max(0, durations[idx] - nextIn)
      setDaysIntoStage(into)
    }
  }

  const save = async () => {
    if (!farmProfileId) return onClose()
    const err = validate(local)
    if (err) { setError(err); return }
    setLoading(true)
    try {
      // ensure a cycle exists using anchor as start
      const cycleCreate = await fetch('/api/growth-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farm_profile_id: farmProfileId, cycle_start_date: anchorDate })
      })
      if (!cycleCreate.ok) {
        const text = await cycleCreate.text().catch(() => '')
        let msg = 'Failed to create/find cycle'
        try { const j = JSON.parse(text); msg = j?.error || msg } catch {}
        throw new Error(msg)
      }
      const cycleJson = await cycleCreate.json()
      const cycleId = cycleJson?.data?.id
      if (!cycleId) {
        throw new Error('Failed to create/find cycle')
      }

      const res = await fetch(`/api/growth-cycles/${cycleId}/stages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stages: local })
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let msg = 'Failed to save stages'
        try { const j = JSON.parse(text); msg = j?.error || msg } catch {}
        throw new Error(msg)
      }
      onChange(local)
      onClose()
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Save failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!farmProfileId) {
    return <div className="mt-4 text-sm text-muted-foreground">Sign in to edit timeline.</div>
  }

  return (
    <div className="mt-4">
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current stage</span>
          <select className="border rounded px-2 py-1 text-sm capitalize" value={selectedStage} onChange={e => {
            const nextStage = e.target.value as RiceStage
            setSelectedStage(nextStage)
            const durations = getDurations()
            const idx = STAGES.indexOf(nextStage)
            const dur = durations[idx]
            const clampedInto = Math.max(0, Math.min(dur - 1, daysIntoStage))
            setDaysIntoStage(clampedInto)
            setEditNextIn(Math.max(0, Math.min(dur, dur - clampedInto)))
          }}>
            {STAGES.map(s => <option key={s} value={s}>{prettyStage(s)}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Days into stage</span>
          <input type="number" min={0} step={1} className="border rounded px-2 py-1 text-sm w-24" value={daysIntoStage}
            max={(() => { const d = getDurations(); return d[STAGES.indexOf(selectedStage)] - 1 })()}
            onChange={e => {
              const durations = getDurations()
              const idx = STAGES.indexOf(selectedStage)
              const dur = durations[idx]
              const raw = Number(e.target.value)
              const clamped = Math.max(0, Math.min(dur - 1, isNaN(raw) ? 0 : raw))
              setDaysIntoStage(clamped)
              setEditNextIn(Math.max(0, Math.min(dur, dur - clamped)))
              setTimeout(applyStageOldness, 0)
            }} />
        </div>
        <Button type="button" className="h-8 px-3" onClick={applyStageOldness}>Apply</Button>
        <div className="flex-1" />
        <Button type="button" variant="secondary" className="h-8 px-3" onClick={resetDefaults} disabled={loading}>Reset to defaults</Button>
      </div>

      {/* Direct numeric edits */}
      <div className="mb-2 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Days after start</span>
          <input type="number" min={0} step={1} className="border rounded px-2 py-1 text-sm w-24" value={editDas}
            onChange={e => {
              const val = Math.max(0, Number(e.target.value))
              setEditDas(val)
              // Map DAS to stage and offset then apply
              const durations = getDurations()
              let remaining = val
              let idx = 0
              while (idx < STAGES.length && remaining >= durations[idx]) {
                remaining -= durations[idx]
                idx++
              }
              const stageIdx = Math.min(STAGES.length - 1, idx)
              setSelectedStage(STAGES[stageIdx])
              setDaysIntoStage(Math.max(0, Math.min(durations[stageIdx]-1, remaining)))
              // Recompute boundaries
              setTimeout(() => {
                applyStageOldness()
              }, 0)
            }} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Next stage (days)</span>
          <input type="number" min={0} step={1} className="border rounded px-2 py-1 text-sm w-24" value={editNextIn}
            max={(() => { const d = getDurations(); return d[STAGES.indexOf(selectedStage)] })()}
            onChange={e => {
              const val = Math.max(0, Number(e.target.value))
              const durations = getDurations()
              const idx = STAGES.indexOf(selectedStage)
              const dur = durations[idx]
              const clampedVal = Math.max(0, Math.min(dur, isNaN(val) ? 0 : val))
              setEditNextIn(clampedVal)
              const into = Math.max(0, Math.min(dur - 1, dur - clampedVal))
              setDaysIntoStage(into)
              setTimeout(applyStageOldness, 0)
            }} />
        </label>
      </div>

      {/* Removed mini-timeline and advanced date editor as requested */}

      {error && <div className="text-sm text-red-600 mt-2">{error}</div>}

      {/* Footer actions */}
      <div className="flex gap-2 justify-end mt-3">
        <Button type="button" variant="outline" className="h-8 px-3" onClick={onClose}>Cancel</Button>
        <Button type="button" className="h-8 px-4" onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
      </div>
    </div>
  )
}


