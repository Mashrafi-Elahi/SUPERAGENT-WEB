'use client'
import { useState, useEffect } from 'react'

export default function LiveClock() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString())
      setDate(now.toLocaleDateString('en-BD'))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null

  return (
    <div className="rounded-xl border border-bg-border bg-bg-card px-4 py-3 text-right">
      <div className="tabular text-text-primary font-mono text-sm">{time}</div>
      <div className="text-text-muted text-xs">{date}</div>
    </div>
  )
}