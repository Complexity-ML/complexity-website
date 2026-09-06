export type DemoAgentTool = "calculator" | "search_knowledge_base" | "date_time";

export const DIRECT_ANSWER_SYSTEM_PROMPT = "Answer directly. Do not repeat yourself.";

function numberCount(text: string): number {
  return text.match(/\d+(?:[.,]\d+)?/g)?.length ?? 0;
}

function isKnowledgeRequest(text: string): boolean {
  const syntheticProjectLookup = /\bProject-\d+-\d+-\d+\b/i;
  const domain = /\b(?:tr[- ]?hash|piqa|agentic|acc_norm|lm[- ]eval|mlx|100m|200m|checkpoint|refinement|raffinement|sft|moe)\b/i;
  const fact = /\b(?:parameter|parameters|param[eè]tre|param[eè]tres|expert|experts|layer|layers|couche|couches|tokenizer|tokeniseur|architecture|scorer|score|evaluation|eval|training|entra[iî]nement|precision|quantization|combien|how many|which|what|quel|quelle)\b/i;
  return syntheticProjectLookup.test(text) || (domain.test(text) && fact.test(text));
}

function isCurrentDateTimeRequest(text: string): boolean {
  const implicitNow = /\b(?:what time is it|what date is it|quelle heure est-il|quelle date sommes-nous|quel jour sommes-nous)\b/i;
  const dateOrTime = /\b(?:date|time|hour|heure|jour|day|today|aujourd['’]hui)\b/i;
  const currentOrZone = /\b(?:now|right now|current|currently|maintenant|actuellement|utc|gmt|paris|time ?zone|fuseau horaire)\b/i;
  return implicitNow.test(text) || (dateOrTime.test(text) && currentOrZone.test(text));
}

function isCalculatorRequest(text: string): boolean {
  const numbers = numberCount(text);
  if (numbers === 0) return false;
  const explicit = /\b(?:calculat(?:e|or|rice)?|compute|arithmetic|math|calcul(?:e|er|ez)?)\b/i;
  const symbolic = /\d(?:[\d\s().]*)(?:\*\*|[+\-*/%^×÷])(?:[\d\s().]*?)\d/;
  const wordOperation = /\b(?:times|multipl(?:y|ied)|plus|minus|subtract|remove[sd]?|boxes?|parts?|remain|fois|ajoute|retire|soustrait)\b/i;
  return explicit.test(text) || symbolic.test(text) || (numbers >= 2 && wordOperation.test(text));
}

function isKnowledgeCalculationRequest(text: string): boolean {
  const conversion = /\b(?:memory|storage|size|bytes?|bits?|kib|mib|gib|kb|mb|gb|fp16|fp32|int8|percentage|percent|ratio|difference|convert|conversion|m[eé]moire|stockage|octets?|taille|pourcentage|rapport|diff[eé]rence|convertir)\b/i;
  return isKnowledgeRequest(text) && conversion.test(text);
}

export function requestsExplicitReasoning(text: string): boolean {
  const problemLead = /^\s*(?:problem|probl[eè]me)\b/i;
  const reasoningCue = /\b(?:reasoning|reason step by step|think step by step|step-by-step|solve|prove|derive|why|raisonnement|raisonne|r[eé]sous|r[eé]soudre|d[eé]montre|d[eé]duis|pourquoi)\b/i;
  return problemLead.test(text) || reasoningCue.test(text);
}

/**
 * Pick one narrow tool from strong intent evidence. Ambiguous requests stay in
 * ordinary chat instead of exposing a possibly unrelated tool schema.
 */
export function routeDemoAgentTool(text: string): DemoAgentTool | null {
  return routeDemoAgentTools(text)[0] ?? null;
}

/**
 * Return a short ordered plan. Each step is still exposed to the model alone,
 * keeping the system prompt small while allowing one result to feed the next.
 */
export function routeDemoAgentTools(text: string): DemoAgentTool[] {
  const tools: DemoAgentTool[] = [];
  if (isKnowledgeRequest(text)) tools.push("search_knowledge_base");
  if (isCurrentDateTimeRequest(text)) tools.push("date_time");
  if (isCalculatorRequest(text) || isKnowledgeCalculationRequest(text)) tools.push("calculator");
  return tools.slice(0, 3);
}
