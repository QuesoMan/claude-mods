export type HelperPhase = 'working' | 'done' | 'failed'

export type StepKind = 'Command' | 'Connector' | 'File read' | 'File write' | 'Skill' | 'Web' | 'Subagent' | 'Tool'

export type Step = {
  kind: StepKind
  /** Short label for the step list: "Gmail · search threads", "pre-outline.md". */
  label: string
  /** Dim text after the label: a file's folder. Empty when there is none. */
  dim: string
  /** The same step in plain words for the live line: "Reading pre-outline.md". */
  live: string
}

export type Helper = {
  /** The id `agent.spawn` answered; tool calls and turns of its loop carry it. */
  id: string
  description: string
  /** The agent type: general-purpose, Explore, a plugin's agent. */
  type: string
  /** The Agent tool's `name` input, empty when none was given. */
  name: string
  /** The effort the Agent call asked for (low, medium, high, xhigh, max); medium when it named none. Sets the leg pace. */
  level: string
  /** Peers this helper sent a message to and heard from, newest last, at most 3 each. A peer is a helper id or "main". */
  sentTo: string[]
  heardFrom: string[]
  /** Display model ("Opus 5.5"), empty when not known yet. */
  model: string
  /** Effort the engine asked for on its last step, empty when not known. */
  effort: string
  phase: HelperPhase
  /** Clock time it started and, once over, when it ended. */
  startedAt: number
  endedAt: number
  /** How many tool calls it made in all. */
  count: number
  /** Its last 200 steps, oldest first; the last one is the live step. */
  steps: Step[]
  /** Tokens from finished turns, plus the live turn's steps so far. */
  tokens: number
  turnTokens: number
  /** True once the engine reported any usage for it. */
  hasUsage: boolean
  /** Position in the desk, in start order. */
  seat: number
  /** Which of the 8 body colours its pet wears; running helpers never share one while there are 8 or fewer. */
  hue: number
  /** Set for an agent a workflow script's `agent()` started: it draws as a row of its run, not as a card. */
  workflow?: HelperRun
}

/** Where a workflow agent sits: its run, its stage, and its place in the run. */
export type HelperRun = {
  /** The run's id, `wf_...`. */
  runId: string
  /** Its place among the run's `agent()` calls, from 1. */
  index: number
  /** The run's name from its script's `meta`, empty until read. */
  name: string
  /** The `phase` it ran under, empty until read or when it named none. */
  stage: string
}

export type JevPhase = 'asking' | 'answered' | 'skipped' | 'judging' | 'judged'

/** One Jev call as jev-lab writes it to ~/.claude/logs/jev-live/<sessionId>.json. */
export type JevCall = {
  id: string
  at: number
  description: string
  subagentType: string
  chosen: string
  chosenEffort: string
  phase: JevPhase
  skipReason?: 'restricted' | 'rubric-unreadable' | 'timeout' | 'error'
  tier?: 'haiku' | 'sonnet' | 'opus'
  effort?: string
  probs?: { haiku: number; sonnet: number; opus: number }
  judge?: { tier: string; effort: string; model: string; reason: string }
  /** Set by the mod: the call has been open past the cap, so it no longer reads as live. */
  stale?: boolean
}

/** One tool call in a transcript: what it did in plain words, and its output. */
export type TranscriptTool = {
  tool: string
  text: string
  result: string
  isError?: boolean
}

/** One row of a subagent's transcript: a message, a run of tool calls that folds into one line, or its report. */
export type TranscriptRow =
  | { who: 'Prompt' | 'You' | 'Claude'; text: string }
  /** What the subagent handed back to the main agent: its report, or its last reply. */
  | { who: 'Report'; text: string }
  | { who: 'Tools'; tools: TranscriptTool[] }

/** A transcript message as the reader lays it out: the engine's own rows, or one read back from the saved file. */
export type TranscriptMessage = {
  role: 'user' | 'assistant'
  text: string
  toolUses: { tool: string; input: Record<string, unknown>; text?: string; isError?: boolean }[]
}

/** The transcript open in the pane, if any. */
export type TranscriptView = {
  /** The helper whose transcript is open; null shows the cards. */
  id: string | null
  rows: TranscriptRow[]
  /** Why it could not be read, empty when it could. */
  error: string
  /** Messages left out at the top to keep the pane light. */
  skipped: number
  /** Unfolded tool runs ("r3") and tool outputs ("r3-1"); everything else stays folded. */
  open: string[]
}

export type PlanStatus = 'pending' | 'in_progress' | 'completed'

/** What the plan band draws: the chat's plan, and whether the band shows it now. */
export type BandPlan = {
  title: string
  steps: { text: string; status: PlanStatus }[]
  /** False once a finished plan has held at 100% for 20 s, or for an empty list. */
  shown: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'helper-desk': {
      helpers: Helper[]
      /** Tick count (spinner and pet frames) and the clock time of the last tick, for elapsed times. */
      clock: { tick: number; now: number }
      /** Which cards show their full step list, and which groups are folded. */
      view: { open: string[]; folded: string[] }
      /** The subagent transcript open in the pane. */
      transcript: TranscriptView
      /** The chat's /cost total in US dollars, null where the host keeps none. */
      cost: { usd: number | null }
      /** Jev input tokens billed in this chat, from jev-lab's live file. */
      jevTokens: number
      /** True while switches.json turns the mod off. */
      off: boolean
      /** True while switches.json hides the band and the pane ("helper-desk:hidden"). */
      hidden: boolean
      /** The plan the band draws; null before the first plan. */
      plan: BandPlan | null
      /** Shimmer tick for the step in progress; it counts only while one is in progress. */
      shimmer: number
      /** The Jev calls to draw, newest last; empty without a readable file. */
      jev: JevCall[]
      /** The helper card the pane just scrolled to, highlighted until `until` (clock ms). */
      focus: { id: string; until: number } | null
      /** False when /helpers motion off stops the pets; kept in $.store across sessions. */
      motion: boolean
    }
  }
}
