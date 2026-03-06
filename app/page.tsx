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
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">

    <div className="bg-white shadow-lg rounded-lg max-w-2xl w-full p-8">

      <h1 className="text-3xl font-bold text-center mb-6">
        AI Resume Analyzer
      </h1>

      <textarea
        placeholder="Paste Resume"
        className="border border-gray-300 rounded-md w-full p-4 mb-4 h-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setResume(e.target.value)}
      />

      <textarea
        placeholder="Paste Job Description"
        className="border border-gray-300 rounded-md w-full p-4 mb-4 h-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setJob(e.target.value)}
      />

      <button
        onClick={analyzeResume}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition"
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {error && (
        <div className="mt-4 text-red-600 text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 border rounded-lg p-6 bg-gray-50">

          <h2 className="text-xl font-bold mb-4">
            Match Score: {result.score}%
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div>
              <h3 className="font-semibold mb-2">Matched Skills</h3>
              <ul>
                {result.matchedSkills.map((s, i) => (
                  <li key={i} className="text-green-600">✔ {s}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Missing Skills</h3>
              <ul>
                {result.missingSkills.map((s, i) => (
                  <li key={i} className="text-red-500">✖ {s}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Suggestions</h3>
              <ul>
                {result.suggestions.map((s, i) => (
                  <li key={i}>💡 {s}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>

  </div>
)
}