"use client";

import { useEffect } from "react";

import Chart, { ChartArea } from "chart.js/auto";

import { GetDailyPriceSummaryResponseParams } from "@/network/types";

type Props = {
  current: GetDailyPriceSummaryResponseParams;
  last: GetDailyPriceSummaryResponseParams;
};

const dates = Array.from({ length: 31 }).map((_, index) => index + 1);

export default function PriceChart(props: Props) {
  useEffect(() => {
    const ctx = document.getElementById("chart");
    if (ctx instanceof HTMLCanvasElement) {
      const borderWidth = 2;
      const tension = 0.2;

      const chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: dates,
          datasets: [
            {
              data: getChartData(props.current),
              tension,
              borderColor: "#E1FF5A",
              borderWidth,
            },
            {
              data: getChartData(props.last),
              tension,
              borderColor: "#4d4d56",
              borderWidth,
              fill: "start",
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;

                if (chartArea) {
                  return getGradient(ctx, chartArea, "#4d4d56");
                }
              },
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false,
            },
          },
          elements: {
            point: {
              pointStyle: (ctx) => {
                if (ctx.datasetIndex === 0) {
                  if (props.current.length - 1 === ctx.dataIndex) {
                    return "circle";
                  }
                }

                return false;
              },
              backgroundColor: "#E1FF5A",
              borderWidth: 3,
            },
          },
          scales: {
            x: {
              display: false,
            },
            y: {
              display: false,
            },
          },
        },
      });

      return () => {
        chart.destroy();
      };
    }
  }, [props]);

  return <canvas id="chart" />;
}

export function getChartData(data: GetDailyPriceSummaryResponseParams) {
  return dates
    .map((date) => {
      const target = data.find((item) => {
        const current = new Date(item.date).getDate();

        return date === current;
      });

      return {
        x: date,
        y: target?.price,
      };
    })
    .filter(({ y }) => y !== undefined);
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: ChartArea,
  color: string
) {
  let width: number = 0,
    height: number = 0,
    gradient: CanvasGradient | undefined = undefined;

  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (!gradient || width !== chartWidth || height !== chartHeight) {
    // Create the gradient because this is either the first render
    // or the size of the chart has changed
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    const rgb = hexToRgb(color);
    if (rgb) {
      const { r, g, b } = rgb;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
      // gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.3)`);
      // gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.7)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 1)`);
    }
  }

  return gradient;
}
