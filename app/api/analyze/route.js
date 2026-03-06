import OpenAI from "openai"
import LRU from "lru-cache"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const rateLimit = new LRU({
  max: 500,
  ttl: 1000 * 60
})

export async function POST(req) {

  try {

    const ip = req.headers.get("x-forwarded-for") || "unknown"

    let count = rateLimit.get(ip) || 0

    if (count >= 2) {
      return Response.json(
        { error: "Free AI limit reached for this IP." },
        { status: 429 }
      )
    }

    rateLimit.set(ip, count + 1)

    const { resume, jobDescription } = await req.json()

    if (!resume || !jobDescription) {
      return Response.json(
        { error: "Resume and Job Description are required." },
        { status: 400 }
      )
    }

    if (resume.length > 2000) {
      return Response.json(
        { error: "Resume text too long (max 2000 characters)." },
        { status: 400 }
      )
    }

    if (jobDescription.length > 2000) {
      return Response.json(
        { error: "Job description too long (max 2000 characters)." },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      response_format: { type: "json_object" },

      messages: [
        {
          role: "system",
          content: "You are a resume analysis AI. Always return valid JSON."
        },
        {
          role: "user",
          content: `
Compare this resume with the job description.

Resume:
${resume}

Job Description:
${jobDescription}

Return JSON in this format:

{
 "score": number,
 "matchedSkills": [],
 "missingSkills": [],
 "suggestions": []
}
`
        }
      ]
    })

    const aiText = completion.choices[0].message.content

    let parsed

    try {
      parsed = JSON.parse(aiText)
    } catch (e) {
      return Response.json(
        { error: "AI returned invalid response" },
        { status: 500 }
      )
    }

    return Response.json(parsed)

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "AI analysis failed." },
      { status: 500 }
    )
  }
}