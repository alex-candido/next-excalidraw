import type { IconType } from "react-icons"
import {
  FcAdvertising,
  FcBarChart,
  FcBriefcase,
  FcBusinessContact,
  FcCalendar,
  FcCollaboration,
  FcConferenceCall,
  FcCustomerSupport,
  FcDecision,
  FcEngineering,
  FcFlowChart,
  FcGenealogy,
  FcGraduationCap,
  FcIdea,
  FcMindMap,
  FcPlanner,
  FcProcess,
  FcSalesPerformance,
  FcShipped,
  FcStatistics,
  FcSurvey,
  FcTimeline,
  FcWorkflow,
} from "react-icons/fc"

// Código semântico (guardado em presentation_entry.icon) -> componente de
// ícone (Flat Color Icons, já vem colorido, ~300 opções). Presentation_entry
// nunca guarda o componente em si, só a chave — troca de lib de ícone no
// futuro só muda esse mapa, não o dado do seed.
const ICON_MAP: Record<string, IconType> = {
  chart: FcBarChart,
  idea: FcIdea,
  sales: FcSalesPerformance,
  briefcase: FcBriefcase,
  graduation: FcGraduationCap,
  shipped: FcShipped,
  advertising: FcAdvertising,
  planner: FcPlanner,
  process: FcProcess,
  collaboration: FcCollaboration,
  workflow: FcWorkflow,
  conference: FcConferenceCall,
  statistics: FcStatistics,
  recruitment: FcBusinessContact,
  calendar: FcCalendar,
  survey: FcSurvey,
  flowchart: FcFlowChart,
  mindmap: FcMindMap,
  timeline: FcTimeline,
  orgchart: FcGenealogy,
  journey: FcCustomerSupport,
  decision: FcDecision,
  architecture: FcEngineering,
}

const FALLBACK_ICON = FcIdea

export function iconUtils() {
  function resolve(code: string | null): IconType {
    if (!code) return FALLBACK_ICON
    return ICON_MAP[code] ?? FALLBACK_ICON
  }

  return { resolve }
}
