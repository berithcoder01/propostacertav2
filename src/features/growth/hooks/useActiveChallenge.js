import { useState, useEffect, useMemo, useCallback } from 'react'
import * as marketingApi from '../services/marketingApi'
import { calculateStreak } from '../utils/challengeUtils'

export function useActiveChallenge() {
  const [challenge, setChallenge] = useState(null)
  const [todayTask, setTodayTask] = useState(null)
  const [dayNumber, setDayNumber] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasProfile, setHasProfile] = useState(false)

  const fetchActiveChallenge = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await marketingApi.getActiveChallenge()
      if (response.success) {
        if (response.data) {
          setChallenge(response.data.challenge || null)
          setTodayTask(response.data.todayTask || null)
          setDayNumber(response.data.dayNumber || null)
          setHasProfile(response.data.hasProfile || false)
        } else {
          setChallenge(null)
          setTodayTask(null)
          setDayNumber(null)
          setHasProfile(false)
        }
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActiveChallenge()
  }, [fetchActiveChallenge])

  const streak = useMemo(() => calculateStreak(challenge?.tasks), [challenge])

  const markDone = async (taskId) => {
    try {
      const response = await marketingApi.markTaskAsDone(taskId)
      if (response.success) {
        fetchActiveChallenge()
        return true
      } else {
        setError(response.error)
        return false
      }
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const markSkipped = async (taskId) => {
    try {
      const response = await marketingApi.markTaskAsSkipped(taskId)
      if (response.success) {
        fetchActiveChallenge()
        return true
      } else {
        setError(response.error)
        return false
      }
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const startChallenge = async () => {
    try {
      const response = await marketingApi.startNewChallenge()
      if (response.success) {
        fetchActiveChallenge()
        return true
      } else {
        setError(response.error)
        return false
      }
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  return { challenge, todayTask, dayNumber, streak, loading, error, hasProfile, markDone, markSkipped, startChallenge, fetchActiveChallenge }
}
