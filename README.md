# QueryQuill

**Conversational AI for Instant Business Intelligence Dashboards**

QueryQuill turns plain English questions into fully interactive, real-time data dashboards — powered by Google Gemini AI. Upload any CSV file, ask a question in natural language, and get back a cohesive dashboard with the right chart types, insights, and follow-up chat support. No SQL knowledge required.

---

## Features

- **Natural Language to Dashboard** — Type a question like *"Show me total views by category sorted by highest"* and get a rendered dashboard instantly
- **Smart Chart Selection** — Gemini automatically picks the best visualization: line charts for trends, bar for comparisons, pie for proportions, area for volume
- **Any CSV, Any Size** — Upload your own CSV file (up to 200MB). Data is parsed and queried entirely in the browser — nothing leaves your device
- **In-Browser SQL Engine** — A lightweight SQL engine executes Gemini-generated queries directly on your data client-side, with no server or database required
- **Follow-Up Chat** — Refine your dashboard conversationally: *"Now filter to only the East region"* or *"Show Q4 only"*
- **Descriptive Questions** — Ask meta questions like *"What is this dataset about?"* and get a plain-English summary
- **Hallucination Guard** — Gemini is strictly instructed to only reference columns that exist in your schema and to report when a question can't be answered
- **Generated SQL Viewer** — Inspect the SQL query Gemini generated for full transparency
- **Sample Dataset Included** — A 5,000-row YouTube Content Creation dataset is bundled for instant demos

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| AI / LLM | Google Gemini 2.5 Flash API |
| Charts | Recharts |
| CSV Parsing | Papa Parse |
| SQL Engine | Custom in-browser SQL engine |
| Icons | Lucide React |
| Font | Geist (via next/font) |

---

## How It Works

```
User uploads CSV
      │
      ▼
Papa Parse → schema extracted + rows stored in React state (browser only)
      │
      ▼
User types a natural language question
      │
      ▼
POST /api/query  ←  { question + schema + 5 sample rows }
      │
      ▼
Gemini 2.5 Flash returns JSON:
  { sql, charts: [{ type, title, x_key, y_key, color }], insight, error }
      │
      ▼
Custom SQL engine executes query against CSV rows in browser
      │
      ▼
Recharts renders the dashboard  +  AI insight displayed below
```

All data processing happens **client-side**. The only server call is the Gemini API request, which receives only the schema and a 5-row sample — never your full dataset.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/QueryQuill.git
cd QueryQuill

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Usage

1. **Open the dashboard** — Click *Go to Dashboard* from the landing page
2. **Load data** — Drag and drop a CSV file, or click *Use Sample Dataset* to load the built-in YouTube dataset
3. **Ask a question** — Type any natural language question about your data in the chat input
4. **Explore the dashboard** — View the generated charts, read the AI insight, and optionally inspect the generated SQL
5. **Ask follow-ups** — Refine or extend the dashboard with follow-up questions

### Example Questions

```
"Show me total views by content category, sorted highest to lowest"
"What is the average sentiment score by region?"
"Compare average likes and comments across the top 5 categories"
"Which languages produce the most content? Show as a pie chart"
"Show the distribution of ads enabled vs disabled"
"What is this dataset about?"
```

---

## Project Structure

```
QueryQuill/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout + metadata
│   ├── globals.css               # Global styles + animations
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard page
│   └── api/
│       └── query/
│           └── route.ts          # API route → Gemini integration
├── components/
│   ├── ChatInput.tsx             # Conversational input bar
│   ├── ChartRenderer.tsx         # Dynamic chart rendering (bar/line/pie/area)
│   └── FileUpload.tsx            # CSV drag-and-drop + sample loader
├── lib/
│   ├── gemini.ts                 # Gemini API client + system prompt
│   └── csv-engine.ts            # CSV parser + in-browser SQL engine
├── public/
│   └── sample-dataset.csv        # Bundled YouTube Content Creation sample
└── sample-test-dataset/          # Original full dataset (1M rows)
```

---

## Sample Dataset

The bundled sample dataset is a YouTube Content Creation dataset with the following columns:

| Column | Type | Description |
|---|---|---|
| `timestamp` | DATE | Upload timestamp |
| `video_id` | TEXT | Unique video identifier |
| `category` | TEXT | Content category (Vlogs, Tech Reviews, etc.) |
| `language` | TEXT | Video language |
| `region` | TEXT | Uploader region code |
| `duration_sec` | INTEGER | Video duration in seconds |
| `views` | INTEGER | Total view count |
| `likes` | INTEGER | Total likes |
| `comments` | INTEGER | Total comment count |
| `shares` | INTEGER | Total shares |
| `sentiment_score` | REAL | Sentiment score (-1 to 1) |
| `ads_enabled` | BOOLEAN | Whether ads are enabled |

---

## Deployment

The easiest way to deploy is with [Vercel](https://vercel.com):

1. Push your repository to GitHub
2. Import the project on Vercel
3. Add `GEMINI_API_KEY` as an environment variable in Vercel project settings
4. Deploy

The app is fully compatible with Vercel's free tier — no persistent server or database required.

---

## License

MIT
