"use client"

import { useState } from "react"

type AIResult = {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  suggestions: string[]
}

export default function Home() {

  const [resume, setResume] = useState("")
  const [job, setJob] = useState("")
  const [result, setResult] = useState<AIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const analyzeResume = async () => {

    setLoading(true)
    setError("")
    setResult(null)

    try {

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resume,
          jobDescription: job
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setResult(data)
      }

    } catch (err) {
      setError("Something went wrong")
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        AI Resume Analyzer
      </h1>

      <textarea
        placeholder="Paste Resume"
        className="border w-full p-3 mb-4 h-40"
        onChange={(e) => setResume(e.target.value)}
      />

      <textarea
        placeholder="Paste Job Description"
        className="border w-full p-3 mb-4 h-40"
        onChange={(e) => setJob(e.target.value)}
      />

      <button
        onClick={analyzeResume}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {error && (
        <div className="mt-4 text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 border p-4 rounded">

          <h2 className="text-xl font-bold">
            Match Score: {result.score}%
          </h2>

          <h3 className="mt-4 font-semibold">Matched Skills</h3>
          <ul>
            {result.matchedSkills.map((s, i) => (
              <li key={i}>✅ {s}</li>
            ))}
          </ul>

          <h3 className="mt-4 font-semibold">Missing Skills</h3>
          <ul>
            {result.missingSkills.map((s, i) => (
              <li key={i}>❌ {s}</li>
            ))}
          </ul>

          <h3 className="mt-4 font-semibold">Suggestions</h3>
          <ul>
            {result.suggestions.map((s, i) => (
              <li key={i}>💡 {s}</li>
            ))}
          </ul>

        </div>
      )}

    </div>
  )
}