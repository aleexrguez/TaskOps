interface StatCard {
  label: string;
  value: number;
  className: string;
}

interface ReportSummaryCardsProps {
  cards: StatCard[];
}

export function ReportSummaryCards({ cards }: ReportSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg border p-4 ${card.className}`}
        >
          <p className="text-2xl font-bold">{card.value}</p>
          <p className="text-xs font-medium">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
