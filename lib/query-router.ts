export type QueryIntent = "data" | "strategy" | "hybrid";

const STRATEGY_SIGNALS: RegExp[] = [
  /\b(how can|how should|how do|how to)\b.*\b(improve|increase|grow|boost|reduce|optimize|maximize|minimize|cut|lower|raise|expand|scale|retain|attract|convert)\b/i,
  /\b(recommend|suggestion|advice|strategy|strategies|plan|approach|tactic)\b/i,
  /\b(should i|should we|what should)\b/i,
  /\b(why is|why are|why do)\b.*\b(low|high|declining|growing|dropping|falling|rising|stagnant)\b/i,
  /\b(opportunity|opportunities|threat|threats|risk|risks|strength|weakness)\b/i,
  /\b(next step|action item|priority|priorities|focus on|focus area)\b/i,
  /\b(forecast|predict|prediction|future|outlook|projection|trend forecast)\b/i,
  /\b(benchmark|best practice|competitor|competitive)\b/i,
  /\b(what can i do|what actions|what steps|ways to)\b/i,
  /\b(growth|retention|churn|acquisition|engagement)\s+(strategy|plan|idea|tip)/i,
  /\b(swot|pest|pestle|gap analysis)\b/i,
];

const DATA_SIGNALS: RegExp[] = [
  /\b(show|display|list|get|find|fetch|retrieve|count|sum|average|total|top|bottom|highest|lowest)\b/i,
  /\b(how many|how much)\b/i,
  /\b(chart|graph|plot|visualize|pie|bar|line|area|histogram|dashboard)\b/i,
  /\b(group by|order by|filter|where|between|compare|versus|vs)\b/i,
  /\b(distribution|breakdown|split|per|by each|across|over time)\b/i,
  /\b(what is the|what are the|what was)\b.*\b(value|amount|number|count|total|average|mean|median|max|min)\b/i,
  /\b(give me|tell me)\b.*\b(data|numbers|figures|stats|statistics)\b/i,
  /\b(table|column|row|record|entry|field)\b/i,
  /\b(last|first|recent|earliest|latest)\s+\d+/i,
];

export function classifyQuery(question: string): QueryIntent {
  let strategyScore = 0;
  let dataScore = 0;

  for (const pattern of STRATEGY_SIGNALS) {
    if (pattern.test(question)) strategyScore++;
  }

  for (const pattern of DATA_SIGNALS) {
    if (pattern.test(question)) dataScore++;
  }

  // Both signals present → hybrid
  if (strategyScore >= 1 && dataScore >= 1) return "hybrid";

  // Clear strategy intent
  if (strategyScore >= 1 && dataScore === 0) return "strategy";

  // Default to data (safe fallback — preserves existing behavior)
  return "data";
}
