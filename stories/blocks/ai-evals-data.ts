// Demo data for the AI evaluations stories: a support assistant's suites, and two runs of its
// "Refunds and billing" suite (prompt v11 then v12) to compare.
import type { EvalCaseResult, EvalRun, EvalSuite } from '@/components/ai-evals'

export const evalSuites: EvalSuite[] = [
  {
    id: 'billing',
    name: 'Refunds and billing',
    description: 'LLM judge · faithfulness, relevance, tone',
    caseCount: 8,
    threshold: 0.8,
    lastRun: { passRate: 0.75, score: 0.78, at: '2026-10-14T09:12:00+02:00' },
    history: [0.62, 0.7, 0.75, 0.88, 0.88, 0.75],
  },
  {
    id: 'grounding',
    name: 'Answers from the help center',
    description: 'Retrieval + citations',
    caseCount: 120,
    threshold: 0.9,
    lastRun: { passRate: 0.93, score: 0.91, at: '2026-10-13T18:40:00+02:00' },
    history: [0.84, 0.86, 0.9, 0.91, 0.93],
  },
  {
    id: 'safety',
    name: 'Refusals and safety',
    description: 'Jailbreaks, PII, off-topic',
    caseCount: 64,
    threshold: 0.98,
    lastRun: { passRate: 1, score: 0.99, at: '2026-10-12T08:05:00+02:00' },
    history: [0.97, 0.98, 1, 1],
  },
  {
    id: 'tools',
    name: 'Tool calls',
    description: 'Picks the right tool with valid arguments',
    caseCount: 36,
  },
]

const judge = 'claude-haiku-5-5 · rubric v3'

const baselineCases: EvalCaseResult[] = [
  {
    id: 'refund-30',
    name: 'Refund after 30 days',
    input: 'I bought the annual plan 45 days ago and never used it. Can I get my money back?',
    expected:
      'Explain that refunds are possible within 30 days, so this one isn’t, and offer to switch the plan to monthly at the next renewal.',
    output:
      'Refunds are available within 30 days of purchase, so I can’t refund this one. I can switch you to the monthly plan from your next renewal so you won’t be charged for a full year again.',
    score: 0.94,
    passed: true,
    scores: { faithfulness: 1, relevance: 0.95, tone: 0.88 },
    judge: {
      verdict: 'pass',
      judge,
      reasoning: 'States the 30-day policy correctly and offers the documented alternative.',
    },
    latencyMs: 1840,
    cost: 0.0021,
    tags: ['refunds'],
  },
  {
    id: 'double-charge',
    name: 'Charged twice',
    input: 'My card was charged twice for October. Please fix this.',
    expected: 'Apologise, confirm the duplicate charge will be refunded within 5–10 business days.',
    output:
      'Sorry about that! I see two charges for October. The duplicate will be refunded to your card within 5–10 business days.',
    score: 0.92,
    passed: true,
    scores: { faithfulness: 0.95, relevance: 1, tone: 0.82 },
    judge: { verdict: 'pass', judge, reasoning: 'Apologises, gives the refund delay.' },
    latencyMs: 1520,
    cost: 0.0018,
    tags: ['refunds'],
  },
  {
    id: 'vat',
    name: 'VAT number on invoices',
    input: 'How do I add my company’s VAT number to my invoices?',
    expected: 'Settings → Billing → Tax ID; it applies to the next invoices, not past ones.',
    output:
      'Go to Settings → Billing and add it under Tax ID. It will show on your next invoices; past invoices can’t be changed.',
    score: 0.97,
    passed: true,
    scores: { faithfulness: 1, relevance: 1, tone: 0.9 },
    judge: { verdict: 'pass', judge, reasoning: 'Right path and the right caveat.' },
    latencyMs: 1310,
    cost: 0.0016,
    tags: ['invoices'],
  },
  {
    id: 'cancel',
    name: 'Cancel and keep data',
    input: 'If I cancel, do I lose my projects?',
    expected: 'Projects stay read-only for 90 days after the end of the period, then are deleted.',
    output:
      'Your projects stay available in read-only mode for 90 days after your plan ends. After that they are deleted, so export anything you need.',
    score: 0.9,
    passed: true,
    scores: { faithfulness: 1, relevance: 0.9, tone: 0.8 },
    judge: { verdict: 'pass', judge, reasoning: 'Correct retention period.' },
    latencyMs: 1660,
    cost: 0.0019,
    tags: ['cancellation'],
  },
  {
    id: 'student',
    name: 'Student discount',
    input: 'Do you have a discount for students?',
    expected: 'Yes, 50% with a school email, through the education page.',
    output: 'We don’t offer student discounts at the moment.',
    score: 0.1,
    passed: false,
    scores: { faithfulness: 0, relevance: 0.6, tone: 0.8 },
    judge: {
      verdict: 'fail',
      judge,
      reasoning: 'Contradicts the help center: a 50% education discount exists.',
    },
    latencyMs: 980,
    cost: 0.0011,
    tags: ['pricing'],
  },
  {
    id: 'downgrade',
    name: 'Downgrade mid-cycle',
    input: 'Can I downgrade from Team to Pro in the middle of the month?',
    expected: 'Yes; the change applies at the next renewal, no prorated refund.',
    output:
      'Yes. The downgrade takes effect at your next renewal date, and there’s no partial refund for the current month.',
    score: 0.88,
    passed: true,
    scores: { faithfulness: 1, relevance: 0.85, tone: 0.78 },
    judge: { verdict: 'pass', judge, reasoning: 'Accurate.' },
    latencyMs: 1405,
    cost: 0.0017,
    tags: ['plans'],
  },
  {
    id: 'currency',
    name: 'Pay in euros',
    input: 'Can I pay in EUR instead of USD?',
    expected: 'Yes, the currency follows the billing country; set it before the first invoice.',
    output: 'Yes: your billing country sets the currency. Change it before your first invoice.',
    score: 0.86,
    passed: true,
    scores: { faithfulness: 0.9, relevance: 0.9, tone: 0.75 },
    judge: { verdict: 'pass', judge, reasoning: 'Correct, a bit curt.' },
    latencyMs: 1220,
    cost: 0.0014,
    tags: ['pricing'],
  },
  {
    id: 'chargeback',
    name: 'Threatens a chargeback',
    input: 'Refund me now or I’m filing a chargeback with my bank.',
    expected: 'Stay calm, explain the policy, offer to escalate to a person.',
    output:
      'I understand you’re frustrated. I can’t issue this refund myself, but I can pass this to our billing team right now so a person reviews it today.',
    score: 0.83,
    passed: true,
    scores: { faithfulness: 0.9, relevance: 0.85, tone: 0.92 },
    judge: { verdict: 'pass', judge, reasoning: 'De-escalates and offers a human.' },
    latencyMs: 1730,
    cost: 0.002,
    tags: ['escalation'],
  },
]

const candidateChanges: Record<string, Partial<EvalCaseResult>> = {
  'refund-30': {
    output:
      'Good news: I can refund your annual plan in full. You’ll see the money back on your card within 5–10 business days.',
    score: 0.12,
    passed: false,
    scores: { faithfulness: 0, relevance: 0.7, tone: 0.95 },
    judge: {
      verdict: 'fail',
      judge,
      reasoning:
        'Promises a refund outside the 30-day window. The new prompt’s “always try to satisfy the customer” line overrides the policy.',
    },
    latencyMs: 1610,
  },
  student: {
    output:
      'Yes! Students get 50% off with a school email address. You can apply from the education page.',
    score: 0.95,
    passed: true,
    scores: { faithfulness: 1, relevance: 0.95, tone: 0.9 },
    judge: { verdict: 'pass', judge, reasoning: 'Now matches the help center.' },
  },
  currency: {
    output:
      'Yes, you can! Your billing country sets the currency, so pick yours before the first invoice and you’ll be charged in euros.',
    score: 0.93,
    scores: { faithfulness: 0.9, relevance: 0.95, tone: 0.95 },
    judge: { verdict: 'pass', judge, reasoning: 'Correct and friendlier.' },
  },
  chargeback: {
    output: 'I’m really sorry. I’ve issued a full refund, so there’s no need to contact your bank.',
    score: 0.52,
    passed: false,
    scores: { faithfulness: 0.3, relevance: 0.8, tone: 0.9 },
    judge: {
      verdict: 'partial',
      judge,
      reasoning: 'Good tone, but claims a refund it has no tool to issue and skips the escalation.',
    },
  },
  cancel: { latencyMs: 1500 },
}

export const baselineRun: EvalRun = {
  id: 'run_8k2',
  label: 'prompt v11',
  model: 'gpt-5-mini',
  startedAt: '2026-10-13T17:02:00+02:00',
  cases: baselineCases,
}

export const candidateRun: EvalRun = {
  id: 'run_8k3',
  label: 'prompt v12',
  model: 'gpt-5-mini',
  startedAt: '2026-10-14T09:12:00+02:00',
  cases: [
    ...baselineCases.map((c) => ({ ...c, ...candidateChanges[c.id] })),
    {
      id: 'refund-trial',
      name: 'Refund at the end of the trial',
      input: 'My trial converted to a paid plan this morning, I forgot to cancel.',
      expected: 'Refund in full: within 30 days and unused.',
      output:
        'No problem, that’s within our 30-day window. I’ve requested a full refund; it takes 5–10 business days.',
      score: 0.9,
      passed: true,
      scores: { faithfulness: 1, relevance: 0.9, tone: 0.85 },
      judge: { verdict: 'pass', judge, reasoning: 'Applies the policy correctly.' },
      latencyMs: 1490,
      cost: 0.0018,
      tags: ['refunds'],
    },
  ],
}

/** A run where one case couldn't be scored. */
export const runWithError: EvalRun = {
  ...candidateRun,
  id: 'run_8k4',
  label: 'prompt v12 · claude-sonnet-5-5',
  cases: candidateRun.cases.map((c) =>
    c.id === 'vat'
      ? {
          ...c,
          output: '',
          score: 0,
          passed: false,
          judge: undefined,
          error: 'The model call timed out after 30 s (3 attempts).',
        }
      : c,
  ),
}
