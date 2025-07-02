import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CatfishGrowthExplorer = () => {
  const [selectedPhase, setSelectedPhase] = useState("nursing");
  const [selectedDay, setSelectedDay] = useState(30);
  const [xAxisInterval, setXAxisInterval] = useState(5);
  const [yAxisInterval, setYAxisInterval] = useState("auto");
  const [showGrid, setShowGrid] = useState(true);

  // All data converted to GRAMS and DAYS as requested
  const phaseData = {
    nursing: {
      title: "Figure 1: Nursing Phase (0-60 days)",
      maxDay: 60,
      data: [
        { day: 0, weight: 0.0, length: 0.3, phase: "Yolk-sac larvae" },
        { day: 5, weight: 0.002, length: 0.4, phase: "Yolk-sac larvae" },
        { day: 10, weight: 0.005, length: 0.5, phase: "Early larvae" },
        { day: 15, weight: 0.012, length: 0.7, phase: "Early larvae" },
        { day: 20, weight: 0.025, length: 0.9, phase: "Larvae" },
        { day: 25, weight: 0.05, length: 1.2, phase: "Larvae" },
        { day: 30, weight: 0.1, length: 1.5, phase: "Larvae" },
        { day: 35, weight: 0.18, length: 1.8, phase: "Late larvae" },
        { day: 40, weight: 0.32, length: 2.2, phase: "Late larvae" },
        { day: 45, weight: 0.52, length: 2.6, phase: "Late larvae" },
        { day: 50, weight: 0.75, length: 3.0, phase: "Juvenile" },
        { day: 55, weight: 0.95, length: 3.3, phase: "Juvenile" },
        { day: 60, weight: 1.2, length: 3.6, phase: "Juvenile" },
      ],
    },
    fingerling1: {
      title: "Figure 2: Small Fingerling Production (0-80 days)",
      maxDay: 80,
      data: [
        { day: 0, weight: 0, length: 0, phase: "Start" },
        { day: 10, weight: 0.8, length: 2.2, phase: "Small fingerling" },
        { day: 20, weight: 1.8, length: 2.8, phase: "Small fingerling" },
        { day: 30, weight: 3.2, length: 3.4, phase: "Small fingerling" },
        { day: 35, weight: 4.1, length: 3.7, phase: "Small fingerling" },
        { day: 40, weight: 5.2, length: 4.0, phase: "Small fingerling" },
        { day: 45, weight: 6.8, length: 4.4, phase: "Small fingerling" },
        { day: 50, weight: 8.5, length: 4.8, phase: "Small fingerling" },
        { day: 55, weight: 10.8, length: 5.2, phase: "Small fingerling" },
        { day: 60, weight: 13.5, length: 5.6, phase: "Small fingerling" },
        { day: 65, weight: 16.2, length: 6.0, phase: "Small fingerling" },
        { day: 70, weight: 19.5, length: 6.4, phase: "Small fingerling" },
        { day: 75, weight: 22.8, length: 6.8, phase: "Small fingerling" },
        { day: 80, weight: 26.0, length: 7.2, phase: "Small fingerling" },
      ],
    },
    fingerling2: {
      title: "Figure 3: Second Phase Fingerling (0-300 days)",
      maxDay: 300,
      data: [
        { day: 0, weight: 0, length: 0, phase: "Start" },
        { day: 25, weight: 15, length: 4.2, phase: "Fingerling" },
        { day: 50, weight: 45, length: 6.8, phase: "Fingerling" },
        { day: 75, weight: 95, length: 9.2, phase: "Fingerling" },
        { day: 100, weight: 175, length: 11.8, phase: "Large fingerling" },
        { day: 125, weight: 285, length: 14.5, phase: "Large fingerling" },
        { day: 150, weight: 425, length: 17.2, phase: "Table fish" },
        { day: 175, weight: 595, length: 19.8, phase: "Table fish" },
        { day: 200, weight: 795, length: 22.5, phase: "Table fish" },
        { day: 225, weight: 1025, length: 25.1, phase: "Table fish" },
        { day: 250, weight: 1285, length: 27.8, phase: "Table fish" },
        { day: 275, weight: 1575, length: 30.4, phase: "Adult" },
        { day: 300, weight: 1895, length: 33.0, phase: "Adult" },
      ],
    },
  };

  const currentPhaseData = phaseData[selectedPhase];

  // Interpolate data for smooth slider interaction
  const interpolatedData = useMemo(() => {
    const result = [];
    const data = currentPhaseData.data;

    for (let day = 0; day <= currentPhaseData.maxDay; day++) {
      const exactMatch = data.find((d) => d.day === day);
      if (exactMatch) {
        result.push(exactMatch);
      } else {
        // Linear interpolation
        const before = data.filter((d) => d.day < day).pop();
        const after = data.find((d) => d.day > day);

        if (before && after) {
          const ratio = (day - before.day) / (after.day - before.day);
          result.push({
            day,
            phase: before.phase,
            length: before.length + (after.length - before.length) * ratio,
            weight: before.weight + (after.weight - before.weight) * ratio,
          });
        } else if (before) {
          result.push({ ...before, day });
        }
      }
    }
    return result;
  }, [selectedPhase]);

  // Adjust selectedDay when switching phases
  const adjustedDay = Math.min(selectedDay, currentPhaseData.maxDay);
  const currentData =
    interpolatedData.find((d) => d.day === adjustedDay) || interpolatedData[0];

  const getPhaseColor = (phase) => {
    const colors = {
      "Yolk-sac larvae": "#ff6b6b",
      "Early larvae": "#feca57",
      Larvae: "#48dbfb",
      "Late larvae": "#0abde3",
      Juvenile: "#00d2d3",
      "Small fingerling": "#54a0ff",
      Fingerling: "#5f27cd",
      "Large fingerling": "#a55eea",
      "Table fish": "#26de81",
      Adult: "#2d3436",
      Start: "#95a5a6",
    };
    return colors[phase] || "#747d8c";
  };

  // Generate X-axis ticks based on user control
  const getXAxisTicks = () => {
    const max = currentPhaseData.maxDay;
    const ticks = [];
    for (let i = 0; i <= max; i += parseInt(xAxisInterval)) {
      ticks.push(i);
    }
    if (ticks[ticks.length - 1] !== max) {
      ticks.push(max);
    }
    return ticks;
  };

  // Generate Y-axis ticks based on user control
  const getYAxisTicks = () => {
    if (yAxisInterval === "auto") return undefined;

    const maxWeight = Math.max(...currentPhaseData.data.map((d) => d.weight));
    const interval = parseFloat(yAxisInterval);
    const ticks = [];

    for (let i = 0; i <= maxWeight; i += interval) {
      ticks.push(parseFloat(i.toFixed(3)));
    }

    return ticks;
  };

  const getYAxisIntervalOptions = () => {
    const maxWeight = Math.max(...currentPhaseData.data.map((d) => d.weight));

    if (maxWeight <= 2) {
      return [
        { value: "auto", label: "Auto" },
        { value: "0.1", label: "0.1g" },
        { value: "0.2", label: "0.2g" },
        { value: "0.5", label: "0.5g" },
      ];
    } else if (maxWeight <= 30) {
      return [
        { value: "auto", label: "Auto" },
        { value: "1", label: "1g" },
        { value: "2", label: "2g" },
        { value: "5", label: "5g" },
      ];
    } else {
      return [
        { value: "auto", label: "Auto" },
        { value: "50", label: "50g" },
        { value: "100", label: "100g" },
        { value: "200", label: "200g" },
        { value: "500", label: "500g" },
      ];
    }
  };

  return (
    <div style={{ padding: "16px", maxWidth: "1280px", margin: "0 auto", background: "linear-gradient(to bottom right, #dbeafe, #dcfce7)", minHeight: "100vh" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#1f2937", marginBottom: "12px" }}>
          African Catfish Growth Explorer
        </h1>
        <p style={{ fontSize: "20px", color: "#4b5563" }}>
          Weight in GRAMS • Length in CM • Time in DAYS
        </p>
      </div>

      {/* Phase Selection */}
      <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px", color: "#1f2937" }}>
          Select Growth Phase
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {Object.entries(phaseData).map(([key, phase]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedPhase(key);
                setSelectedDay(Math.min(selectedDay, phase.maxDay));
              }}
              style={{
                padding: "24px",
                borderRadius: "8px",
                border: selectedPhase === key ? "3px solid #3b82f6" : "3px solid #d1d5db",
                background: selectedPhase === key ? "#eff6ff" : "white",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "18px",
                boxShadow: selectedPhase === key ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "none"
              }}
            >
              <div style={{ fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
                {phase.title}
              </div>
              <div style={{ color: "#4b5563" }}>0-{phase.maxDay} days</div>
              <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                Weight in grams
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Axis Controls */}
      <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px", color: "#1f2937" }}>
          Graph Details Control
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
          <div>
            <label style={{ display: "block", fontSize: "18px", fontWeight: "500", color: "#374151", marginBottom: "12px" }}>
              Days Interval (X-axis)
            </label>
            <select
              value={xAxisInterval}
              onChange={(e) => setXAxisInterval(e.target.value)}
              style={{ width: "100%", padding: "12px", fontSize: "18px", border: "2px solid #d1d5db", borderRadius: "8px" }}
            >
              <option value="1">Every 1 day</option>
              <option value="2">Every 2 days</option>
              <option value="5">Every 5 days</option>
              <option value="10">Every 10 days</option>
              <option value="20">Every 20 days</option>
              <option value="25">Every 25 days</option>
              <option value="50">Every 50 days</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "18px", fontWeight: "500", color: "#374151", marginBottom: "12px" }}>
              Weight Interval (Y-axis)
            </label>
            <select
              value={yAxisInterval}
              onChange={(e) => setYAxisInterval(e.target.value)}
              style={{ width: "100%", padding: "12px", fontSize: "18px", border: "2px solid #d1d5db", borderRadius: "8px" }}
            >
              {getYAxisIntervalOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "18px", fontWeight: "500", color: "#374151", marginBottom: "12px" }}>
              Grid Lines
            </label>
            <button
              onClick={() => setShowGrid(!showGrid)}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "18px",
                borderRadius: "8px",
                border: "2px solid",
                borderColor: showGrid ? "#3b82f6" : "#d1d5db",
                background: showGrid ? "#3b82f6" : "white",
                color: showGrid ? "white" : "#374151",
                cursor: "pointer"
              }}
            >
              {showGrid ? "Grid ON" : "Grid OFF"}
            </button>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "18px", fontWeight: "500", color: "#374151", marginBottom: "12px" }}>
              Current View
            </label>
            <div style={{ padding: "12px", background: "#f3f4f6", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}>
                Max: {Math.max(...currentPhaseData.data.map((d) => d.weight)).toFixed(1)}g
              </div>
              <div style={{ fontSize: "14px", color: "#4b5563" }}>
                {currentPhaseData.maxDay} days total
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Slider */}
      <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", marginBottom: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "24px", fontWeight: "bold", color: "#374151", marginBottom: "16px" }}>
            Day: {adjustedDay} ({currentData.phase})
          </label>
          <input
            type="range"
            min="0"
            max={currentPhaseData.maxDay}
            value={adjustedDay}
            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            style={{ width: "100%", height: "16px", background: "#bfdbfe", borderRadius: "8px", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", color: "#4b5563", marginTop: "12px", fontWeight: "500" }}>
            <span>Day 0</span>
            <span>Day {currentPhaseData.maxDay}</span>
          </div>
        </div>
      </div>

      {/* Current Data Display */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div style={{ background: "white", borderRadius: "8px", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: "#3b82f6", marginBottom: "8px" }}>
            {adjustedDay}
          </div>
          <div style={{ fontSize: "18px", color: "#4b5563" }}>Days</div>
        </div>
        <div style={{ background: "white", borderRadius: "8px", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: "#10b981", marginBottom: "8px" }}>
            {currentData.weight.toFixed(3)}g
          </div>
          <div style={{ fontSize: "18px", color: "#4b5563" }}>Weight (grams)</div>
        </div>
        <div style={{ background: "white", borderRadius: "8px", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: "#8b5cf6", marginBottom: "8px" }}>
            {currentData.length.toFixed(1)}cm
          </div>
          <div style={{ fontSize: "18px", color: "#4b5563" }}>Length (cm)</div>
        </div>
        <div style={{ background: "white", borderRadius: "8px", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "8px",
              color: getPhaseColor(currentData.phase),
            }}
          >
            {currentData.phase}
          </div>
          <div style={{ fontSize: "18px", color: "#4b5563" }}>Stage</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "32px", marginBottom: "32px" }}>
        {/* Weight vs Time */}
        <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px", color: "#1f2937" }}>
            Weight Growth (grams)
          </h3>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={interpolatedData}>
              {showGrid && <CartesianGrid strokeDasharray="1 1" stroke="#d1d5db" />}
              <XAxis
                dataKey="day"
                ticks={getXAxisTicks()}
                tick={{ fontSize: 12, fontWeight: "bold" }}
                label={{
                  value: "Days",
                  position: "insideBottom",
                  offset: -10,
                  style: { fontSize: "16px", fontWeight: "bold" },
                }}
                interval={0}
              />
              <YAxis
                ticks={getYAxisTicks()}
                tick={{ fontSize: 12, fontWeight: "bold" }}
                label={{
                  value: "Weight (grams)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: "16px", fontWeight: "bold" },
                }}
                domain={["dataMin", "dataMax"]}
              />
              <Tooltip
                contentStyle={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  backgroundColor: "#f8fafc",
                }}
                formatter={(value) => [`${value.toFixed(3)}g`, "Weight"]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={getPhaseColor(currentData.phase)}
                strokeWidth={3}
                dot={false}
              />
              {/* Current day indicator */}
              <Line
                data={[currentData]}
                type="monotone"
                dataKey="weight"
                stroke="#ff6b6b"
                strokeWidth={0}
                dot={{
                  r: 10,
                  fill: "#ff6b6b",
                  strokeWidth: 3,
                  stroke: "#fff",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Length vs Time */}
        <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px", color: "#1f2937" }}>
            Length Growth (cm)
          </h3>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={interpolatedData}>
              {showGrid && <CartesianGrid strokeDasharray="1 1" stroke="#d1d5db" />}
              <XAxis
                dataKey="day"
                ticks={getXAxisTicks()}
                tick={{ fontSize: 12, fontWeight: "bold" }}
                label={{
                  value: "Days",
                  position: "insideBottom",
                  offset: -10,
                  style: { fontSize: "16px", fontWeight: "bold" },
                }}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12, fontWeight: "bold" }}
                label={{
                  value: "Length (cm)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: "16px", fontWeight: "bold" },
                }}
                domain={["dataMin", "dataMax"]}
              />
              <Tooltip
                contentStyle={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  backgroundColor: "#f8fafc",
                }}
                formatter={(value) => [`${value.toFixed(2)}cm`, "Length"]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Line
                type="monotone"
                dataKey="length"
                stroke={getPhaseColor(currentData.phase)}
                strokeWidth={3}
                dot={false}
              />
              {/* Current day indicator */}
              <Line
                data={[currentData]}
                type="monotone"
                dataKey="length"
                stroke="#ff6b6b"
                strokeWidth={0}
                dot={{
                  r: 10,
                  fill: "#ff6b6b",
                  strokeWidth: 3,
                  stroke: "#fff",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <CatfishGrowthExplorer />
    </div>
  );
}
