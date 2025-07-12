import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './WeeklyPostD3Chart.css';

const dayLabels = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']; // Sunday–Saturday

export default function WeeklyPostD3Chart({ groupId }) {
  const chartRef = useRef();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:5000/api/posts/group/${groupId}/weekly-stats`);
        const raw = await res.json();

        const data = raw.map(d => ({
          day: dayLabels[(d.day - 1) % 7],
          count: d.count
        }));

        drawChart(data);
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    }

    function drawChart(data) {
      const svg = d3.select(chartRef.current);
      svg.selectAll("*").remove(); // clear old chart

      const svgW = 300;
      const svgH = 200;
      const margin = { top: 20, right: 20, bottom: 30, left: 80 };
      const width = svgW - margin.left - margin.right;
      const height = svgH - margin.top - margin.bottom;

      // בדיקה אם אין בכלל פוסטים
      const totalPosts = d3.sum(data, d => d.count);
      if (totalPosts === 0) {
        svg.append("text")
          .attr("x", svgW / 2)
          .attr("y", svgH / 2)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .text("אין פוסטים לשבוע זה");
        return;
      }

      const x = d3.scaleBand()
        .domain(data.map(d => d.day))
        .range([0, width])
        .padding(0.1);

      const maxCount = d3.max(data, d => d.count) || 0;
      const y = d3.scaleLinear()
        .domain([0, maxCount])
        .range([height, 0]);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      const yAxis = d3.axisLeft(y)
        .tickValues(d3.range(0, maxCount + 1, 1))
        .tickFormat(d3.format("d"))
        .tickPadding(20);

      g.append("g").call(yAxis);

      g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.day))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count));
    }

    fetchData();
  }, [groupId]);

  return (
    <div className="weekly-chart-container">
      <h4 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>פוסטים לפי ימים</h4>
      <svg ref={chartRef} width={300} height={200}></svg>
    </div>
  );
}
