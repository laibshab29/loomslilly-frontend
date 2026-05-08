import React, { createContext, useContext, useId } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { cn } from "./utils";

const ChartContext = createContext(null);

function useChart() {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within ChartContainer");
  }
  return context;
}

export function ChartContainer({ id, className, children, config, ...props }) {
  const uniqueId = useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer>
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }) {
  const entries = Object.entries(config || {});

  if (!entries.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart=${id}] {
${entries
  .map(([key, val]) =>
    val.color ? `--color-${key}: ${val.color};` : ""
  )
  .join("\n")}
}
`,
      }}
    />
  );
}

export function ChartTooltip(props) {
  return <Tooltip {...props} />;
}

export function ChartLegend(props) {
  return <Legend {...props} />;
}