"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { ProtectedRoute } from "@/components/protected-route"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

const TOTAL_HOURS_TARGET = 1246
const TOTAL_WORKING_DAYS = 248
const DAILY_TARGET = TOTAL_HOURS_TARGET / TOTAL_WORKING_DAYS
const WEEKLY_TARGET = DAILY_TARGET * 5

// Período oficial: 1 sep 2026 - 31 ago 2027
const PERIOD_START = new Date(2026, 8, 1) // 1 septiembre 2026
const PERIOD_END = new Date(2027, 7, 31)  // 31 agosto 2027

const LOCAL_HOLIDAYS = [
  "2026-09-08",  // Festivo local
  "2027-03-17",  // Festivo local
]

const ANDALUCIA_HOLIDAYS_2026 = [
  "2026-10-12",  // Fiesta Nacional (lunes)
  "2026-11-02",  // Todos los Santos (movido de domingo 1 nov a lunes 2 nov)
  "2026-12-07",  // Constitución (movido de domingo 6 dic a lunes 7 dic)
  "2026-12-08",  // Inmaculada (martes)
  "2026-12-24",  // Nochebuena (jueves) - NUEVO
  "2026-12-25",  // Navidad (viernes)
  "2026-12-31",  // Nochevieja (jueves) - NUEVO
]

const ANDALUCIA_HOLIDAYS_2027 = [
  "2027-01-01",  // Año Nuevo (viernes)
  "2027-01-06",  // Reyes (miércoles)
  "2027-03-01",  // Día de Andalucía (movido de domingo 28 feb a lunes 1 mar)
  "2027-03-25",  // Jueves Santo - NUEVO
  "2027-03-26",  // Viernes Santo - NUEVO
  "2027-05-01",  // Trabajo (sábado)
  "2027-08-15",  // Asunción (domingo)
]

const ALL_HOLIDAYS = [...LOCAL_HOLIDAYS, ...ANDALUCIA_HOLIDAYS_2026, ...ANDALUCIA_HOLIDAYS_2027]

interface DiaryEntry {
  date: string
  hours: number
  content: string
  userName: string
}

interface DayEntry {
  date: Date
  dateKey: string
  entries: DiaryEntry[]
  totalHours: number
  isWorkingDay: boolean
  isHoliday: boolean
  isWeekend: boolean
  isToday: boolean
}

function formatDateKey(date: Date): string {
  // Usar componentes locales para evitar problemas de zona horaria con toISOString()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isHoliday(date: Date): boolean {
  const key = formatDateKey(date)
  return ALL_HOLIDAYS.includes(key)
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

function isWorkingDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date)
}

function getWeekNumber(date: Date): number {
  const start = new Date(2026, 8, 1) // 1 septiembre 2026
  const diff = date.getTime() - start.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return Math.floor(days / 7) + 1
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(date)
  start.setDate(date.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 4)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

function formatHours(hours: number): string {
  const h = Math.floor(Math.abs(hours))
  const m = Math.round((Math.abs(hours) - h) * 60)
  const sign = hours < 0 ? "-" : ""
  if (h === 0) return `${sign}${m} min`
  if (m === 0) return `${sign}${h} h`
  return `${sign}${h} h ${m} min`
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })
}

function formatDayName(date: Date): string {
  return date.toLocaleDateString("es-ES", { weekday: "short" })
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" }).toUpperCase()
}

export default function ProgresoPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date()
    // Si estamos antes del período, empezar en el inicio del período
    if (now < PERIOD_START) {
      return new Date(PERIOD_START)
    }
    // Si estamos después del período, empezar en la última semana del período
    if (now > PERIOD_END) {
      const lastWeekStart = new Date(PERIOD_END)
      const day = lastWeekStart.getDay()
      const diffToMonday = day === 0 ? -6 : 1 - day
      lastWeekStart.setDate(lastWeekStart.getDate() + diffToMonday)
      lastWeekStart.setHours(0, 0, 0, 0)
      return lastWeekStart
    }
    // Estamos dentro del período, usar la semana actual
    const day = now.getDay()
    const diffToMonday = day === 0 ? -6 : 1 - day
    const start = new Date(now)
    start.setDate(now.getDate() + diffToMonday)
    start.setHours(0, 0, 0, 0)
    return start
  })

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/diary-entries", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch (error) {
      console.error("Error fetching diary entries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const navigateWeek = (direction: number) => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(currentWeekStart.getDate() + direction * 7)
    // Clamp to period boundaries
    if (newWeekStart < PERIOD_START) newWeekStart.setTime(PERIOD_START.getTime())
    if (newWeekStart > PERIOD_END) newWeekStart.setTime(PERIOD_END.getTime())
    setCurrentWeekStart(newWeekStart)
  }

  const goToCurrentWeek = () => {
    const now = new Date()
    const day = now.getDay()
    const diffToMonday = day === 0 ? -6 : 1 - day
    const start = new Date(now)
    start.setDate(now.getDate() + diffToMonday)
    start.setHours(0, 0, 0, 0)
    // Clamp to period
    if (start < PERIOD_START) start.setTime(PERIOD_START.getTime())
    if (start > PERIOD_END) start.setTime(PERIOD_END.getTime())
    setCurrentWeekStart(start)
  }

  const { start: weekStart, end: weekEnd } = useMemo(() => getWeekRange(currentWeekStart), [currentWeekStart])

  const weekDays = useMemo((): DayEntry[] => {
    const entriesByDate = new Map(entries.map(e => [e.date, e]))
    
    // Group entries by date (multiple entries per day possible)
    const entriesByDateMap = new Map<string, DiaryEntry[]>()
    entries.forEach(entry => {
      if (!entriesByDateMap.has(entry.date)) {
        entriesByDateMap.set(entry.date, [])
      }
      entriesByDateMap.get(entry.date)!.push(entry)
    })

    const days: DayEntry[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 5; i++) { // Monday to Friday
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateKey = formatDateKey(date)
      const dayEntries = entriesByDateMap.get(dateKey) || []
      const totalHours = dayEntries.reduce((sum, e) => sum + e.hours, 0)

      days.push({
        date,
        dateKey,
        entries: dayEntries,
        totalHours,
        isWorkingDay: isWorkingDay(date),
        isHoliday: isHoliday(date),
        isWeekend: isWeekend(date),
        isToday: date.getTime() === today.getTime(),
      })
    }

    return days
  }, [entries, weekStart])

  const weekStats = useMemo(() => {
    const workingDays = weekDays.filter(d => d.isWorkingDay).length
    const totalHours = weekDays.reduce((sum, d) => sum + d.totalHours, 0)
    const target = workingDays * DAILY_TARGET
    const difference = totalHours - target
    const percentage = target > 0 ? (totalHours / target) * 100 : 0
    const status: "POR ENCIMA" | "POR DEBAJO" | "EN OBJETIVO" = 
      difference > 0.5 ? "POR ENCIMA" : difference < -0.5 ? "POR DEBAJO" : "EN OBJETIVO"

    // Accumulated stats
    const allEntriesBeforeWeekEnd = entries.filter(e => {
      const entryDate = new Date(e.date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate <= weekEnd
    })
    const accumulatedHours = allEntriesBeforeWeekEnd.reduce((sum, e) => sum + e.hours, 0)
    
    // Calculate accumulated target up to end of this week (from period start)
    let accumulatedTarget = 0
    for (let d = new Date(PERIOD_START); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      if (isWorkingDay(d)) accumulatedTarget += DAILY_TARGET
    }
    
    const accumulatedDifference = accumulatedHours - accumulatedTarget
    const accumulatedPercentage = accumulatedTarget > 0 ? (accumulatedHours / accumulatedTarget) * 100 : 0

    return {
      workingDays,
      totalHours,
      target,
      difference,
      percentage,
      status,
      accumulatedHours,
      accumulatedTarget,
      accumulatedDifference,
      accumulatedPercentage,
      weekNumber: getWeekNumber(weekStart),
    }
  }, [weekDays, entries, weekEnd])

  const totalStats = useMemo(() => {
    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0)
    const difference = totalHours - TOTAL_HOURS_TARGET
    const percentage = (totalHours / TOTAL_HOURS_TARGET) * 100
    const status = difference >= 0 ? "POR ENCIMA" : "POR DEBAJO"
    
    return { totalHours, totalTarget: TOTAL_HOURS_TARGET, difference, percentage, status }
  }, [entries])

  const isCurrentWeek = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    if (now < PERIOD_START || now > PERIOD_END) return false
    const day = now.getDay()
    const diffToMonday = day === 0 ? -6 : 1 - day
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() + diffToMonday)
    thisWeekStart.setHours(0, 0, 0, 0)
    return currentWeekStart.getTime() === thisWeekStart.getTime()
  }, [currentWeekStart])

  return (
    <ProtectedRoute>
      <AppShell title="Progreso">
        <div className="space-y-6">
          {/* Resumen General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Resumen General del Objetivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatHours(totalStats.totalHours)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Horas Realizadas</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatHours(totalStats.totalTarget)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Objetivo Total</p>
                </div>
                <div className={cn("p-4 rounded-lg text-center", totalStats.difference >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-orange-50 dark:bg-orange-900/20")}>
                  <p className={cn("text-3xl font-bold", totalStats.difference >= 0 ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400")}>
                    {totalStats.difference >= 0 ? "+" : ""}{formatHours(totalStats.difference)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Diferencia Total</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalStats.percentage.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">% Objetivo Alcanzado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vista Semanal - Principal */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)} aria-label="Semana anterior">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-center min-w-[200px]">
                    <p className="text-lg font-semibold text-foreground">
                      Semana {weekStats.weekNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateDisplay(weekStart)} - {formatDateDisplay(weekEnd)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getMonthName(weekStart)}
                    </p>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => navigateWeek(1)} aria-label="Semana siguiente">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {!isCurrentWeek && (
                    <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
                      <Calendar className="h-4 w-4 mr-1" />
                      Esta semana
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress bars for the week */}
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso semanal</span>
                    <span className="font-medium">{formatHours(weekStats.totalHours)} / {formatHours(weekStats.target)} ({(weekStats.percentage).toFixed(1)}%)</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", weekStats.status === "POR ENCIMA" ? "bg-green-500" : "bg-blue-500")}
                      style={{ width: `${Math.min(100, weekStats.percentage)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso acumulado</span>
                    <span className="font-medium">{formatHours(weekStats.accumulatedHours)} / {formatHours(weekStats.accumulatedTarget)} ({(weekStats.accumulatedPercentage).toFixed(1)}%)</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", weekStats.accumulatedDifference >= 0 ? "bg-green-500" : "bg-blue-500")}
                      style={{ width: `${Math.min(100, weekStats.accumulatedPercentage)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {weekStats.accumulatedDifference >= 0 ? (
                      <> <CheckCircle className="inline h-3 w-3 text-green-500" /> Vas por delante del objetivo acumulado </>
                    ) : (
                      <> <AlertTriangle className="inline h-3 w-3 text-orange-500" /> Vas por detrás del objetivo acumulado </>
                    )}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Weekly Calendar Grid */}
              <div className="grid grid-cols-5 gap-2">
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative p-3 rounded-lg border min-h-[180px] flex flex-col",
                      day.isHoliday && "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
                      day.isWeekend && "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
                      day.isToday && "ring-2 ring-primary border-primary",
                      !day.isWorkingDay && !day.isHoliday && !day.isWeekend && "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800",
                      day.isWorkingDay && !day.isHoliday && !day.isWeekend && "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    )}
                  >
                    {/* Day header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium capitalize text-sm", day.isToday && "text-primary")}>
                          {formatDayName(day.date)}
                        </span>
                        {day.isToday && <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Hoy</span>}
                        {day.isHoliday && <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">Festivo</span>}
                      </div>
                      <span className="text-sm text-muted-foreground font-mono">{formatDateDisplay(day.date)}</span>
                    </div>

                    {/* Progress bar for the day */}
                    {day.isWorkingDay && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{formatHours(day.totalHours)} / {formatHours(DAILY_TARGET)}</span>
                          <span className={cn("font-medium", day.totalHours >= DAILY_TARGET ? "text-green-600" : "text-orange-600")}>
                            {day.totalHours >= DAILY_TARGET ? "✓" : `${((day.totalHours / DAILY_TARGET) * 100).toFixed(0)}%`}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-300", day.totalHours >= DAILY_TARGET ? "bg-green-500" : "bg-blue-500")}
                            style={{ width: `${Math.min(100, (day.totalHours / DAILY_TARGET) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Entries for the day */}
                    <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                      {day.entries.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-4">
                          {day.isHoliday ? "Día festivo" : day.isWeekend ? "Fin de semana" : "Sin atenciones"}
                        </p>
                      ) : (
                        day.entries.map((entry, entryIndex) => (
                          <Tooltip key={entryIndex} delayDuration={200}>
                            <TooltipTrigger asChild>
                              <div className={cn(
                                "p-2 rounded bg-gray-50 dark:bg-gray-800/50 cursor-help transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50",
                                entry.hours >= DAILY_TARGET && "border-l-2 border-l-green-500"
                              )}>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium truncate pr-2">{entry.userName}</span>
                                  <span className={cn("text-xs font-mono font-bold", entry.hours >= DAILY_TARGET ? "text-green-600" : "text-blue-600")}>
                                    {formatHours(entry.hours)}
                                  </span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="max-w-xs p-3">
                              <p className="font-medium text-sm">{entry.userName}</p>
                              <p className="text-xs text-muted-foreground mb-1">{formatDateDisplay(day.date)} - {formatHours(entry.hours)}</p>
                              <p className="text-sm whitespace-pre-wrap">{entry.content || "Sin observaciones"}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))
                      )}
                    </div>

                    {/* Add entry button for working days */}
                    {day.isWorkingDay && !day.isHoliday && (
                      <div className="mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumen Semanal Acumulado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Resumen Semanal (Semana {weekStats.weekNumber})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Días laborables</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{weekStats.workingDays}/5</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Objetivo semana</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatHours(weekStats.target)}</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Realizado</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatHours(weekStats.totalHours)}</p>
                </div>
                <div className={cn("p-4 rounded-lg", weekStats.difference >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-orange-50 dark:bg-orange-900/20")}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Diferencia</p>
                  <p className={cn("text-2xl font-bold", weekStats.difference >= 0 ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400")}>
                    {weekStats.difference >= 0 ? "+" : ""}{formatHours(weekStats.difference)}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded text-sm">
                <div className="flex justify-between mb-1">
                  <span>Acumulado hasta esta semana</span>
                  <span className="font-medium">{formatHours(weekStats.accumulatedHours)} / {formatHours(weekStats.accumulatedTarget)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Saldo acumulado</span>
                  <span className={cn("font-medium", weekStats.accumulatedDifference >= 0 ? "text-green-600" : "text-red-600")}>
                    {weekStats.accumulatedDifference >= 0 ? "+" : ""}{formatHours(weekStats.accumulatedDifference)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leyenda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Leyenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">Códigos de color día:</h5>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded border border-amber-300 bg-amber-50 dark:bg-amber-900/30"></span>
                      Festivo (Andalucía / Local)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded border border-gray-300 bg-gray-50 dark:bg-gray-800/50"></span>
                      Fin de semana
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded border border-green-300 bg-green-50 dark:bg-green-900/10"></span>
                      Día laborable (hoy)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded border border-gray-200 bg-white dark:bg-gray-900"></span>
                      Día laborable
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Indicadores:</h5>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">✓</span>
                      Objetivo diario alcanzado
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-2 bg-blue-500 rounded"></div>
                      Progreso parcial
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-2 bg-green-500 rounded"></div>
                      Objetivo superado
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 border-l-2 border-l-green-500 pl-2 h-5">
                        <span className="text-xs">Borde verde</span>
                      </span>
                      Entrada completa (≥5,02h)
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Festivos configurados:</h5>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-xs">
                    <li>Locales: 08/09/2026, 17/03/2027</li>
                    <li>Andalucía 2026: 12/10, 02/11*, 07/12*, 08/12, 24/12, 25/12, 31/12</li>
                    <li>Andalucía 2027: 01/01, 06/01, 01/03*, 25/03, 26/03, 01/05, 15/08</li>
                    <li className="text-amber-600 dark:text-amber-400">* = movido por caer en domingo</li>
                  </ul>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Período: 01/09/2026 - 31/08/2027. Día objetivo: 5,02h. Semana (5 días): ~25,12h.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  )
}