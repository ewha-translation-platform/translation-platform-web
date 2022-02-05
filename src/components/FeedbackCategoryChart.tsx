import { colorScheme } from "@/utils";
import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

interface FeedbackCategoryChartProps {
  categories: FeedbackCategory[];
  data: Record<number, number>;
}
function FeedbackCategoryChart({
  categories,
  data,
}: FeedbackCategoryChartProps) {
  Chart.register(ArcElement, Legend, Tooltip);
  const chartData = {
    labels: categories
      .filter((c) => Object.keys(data).some((id) => +id === c.id))
      .map(({ name }) => name),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: categories.map((_, idx) => colorScheme(idx)),
      },
    ],
  };

  return (
    <section className="grid place-content-center">
      <Pie
        data={chartData}
        options={{
          font: {
            family: "'Noto Sans KR', 'sans-serif'",
          },
          aspectRatio: 2,
          plugins: { legend: { position: "right" } },
        }}
      ></Pie>
    </section>
  );
}

export default FeedbackCategoryChart;
