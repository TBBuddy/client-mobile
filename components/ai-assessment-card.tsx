import { Sparkles, Stethoscope } from "lucide-react-native";

import type { AiAssessment, AiRiskLevel } from "../services/repository/types";
import { Text, View } from "./tw";

const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatShortDate(value: string): string {
  const d = new Date(value);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function riskLabel(level: AiRiskLevel): string {
  if (level === "LOW") return "Risiko Rendah";
  if (level === "MEDIUM") return "Risiko Sedang";
  return "Risiko Tinggi";
}

function riskColor(level: AiRiskLevel): string {
  if (level === "LOW") return "#34C07B";
  if (level === "MEDIUM") return "#FF9500";
  return "#FF3B30";
}

type Props = { assessment: AiAssessment };

export function AiAssessmentCard({ assessment }: Props) {
  const color = riskColor(assessment.risk_level);

  return (
    <View className="rounded-card border border-brand-border bg-brand-white p-4 gap-3">
      <View className="flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-aqua">
          <Sparkles color="#263238" size={15} strokeWidth={2} />
        </View>
        <Text className="flex-1 text-[13px] font-bold text-brand-ink" style={{ opacity: 0.5 }}>
          ANALISIS AI
        </Text>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: color + "22" }}
        >
          <Text className="text-[11px] font-bold" style={{ color }}>
            {riskLabel(assessment.risk_level)}
          </Text>
        </View>
      </View>

      <Text className="text-[11px] text-brand-ink" style={{ opacity: 0.45 }}>
        Periode {formatShortDate(assessment.period_start_date)} –{" "}
        {formatShortDate(assessment.period_end_date)} · {assessment.analyzed_days} hari
        dianalisis
      </Text>

      <Text className="text-[14px] leading-6 text-brand-ink" style={{ opacity: 0.8 }}>
        {assessment.summary}
      </Text>

      {assessment.recommendation ? (
        <View className="rounded-xl border border-brand-border bg-brand-mist p-3 gap-1">
          <Text className="text-[11px] font-bold text-brand-ink" style={{ opacity: 0.5 }}>
            REKOMENDASI
          </Text>
          <Text className="text-[13px] leading-5 text-brand-ink" style={{ opacity: 0.75 }}>
            {assessment.recommendation}
          </Text>
        </View>
      ) : null}

      {assessment.should_consult_doctor ? (
        <View
          className="flex-row items-center gap-2 rounded-xl p-3"
          style={{ backgroundColor: "#FF3B3015" }}
        >
          <Stethoscope color="#FF3B30" size={16} strokeWidth={2} />
          <Text className="flex-1 text-[13px] font-semibold" style={{ color: "#FF3B30" }}>
            Sebaiknya konsultasikan kondisimu dengan dokter.
          </Text>
        </View>
      ) : null}

      <Text className="text-[10px] text-brand-ink" style={{ opacity: 0.3 }}>
        Dihasilkan oleh {assessment.model_name} ·{" "}
        {formatShortDate(assessment.created_at)}
      </Text>
    </View>
  );
}
