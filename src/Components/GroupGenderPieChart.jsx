import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function GroupGenderPieChart({ members = [] }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!members.length) return;

    const genderLabels = {
      male: 'זכר',
      female: 'נקבה',
      unknown: 'לא ידוע'
    };

    const data = d3.rollups(
      members,
      v => v.length,
      m => (m.gender || 'unknown')
    ).map(([gender, count]) => ({ gender, count }));

    const total = d3.sum(data, d => d.count);

    const width = 220;
    const height = 220;
    const radius = Math.min(width, height) / 2 - 10;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3
      .scaleOrdinal()
      .domain(data.map(d => d.gender))
      .range(['#4e79a7', '#f28e2b', '#e15759']); // male, female, unknown

    const pie = d3.pie().value(d => d.count);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    g.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.gender))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    g.selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(d => {
        const label = genderLabels[d.data.gender] || 'לא ידוע';
        const percent = ((d.data.count / total) * 100).toFixed(0);
        return `${label}: ${d.data.count} (${percent}%)`;
      });
  }, [members]);

  if (!members.length) return null;

  return (
    <div>
      <h3>פילוח מגדרי של חברי הקבוצה</h3>
      <div className="chart-container">
        <svg ref={svgRef} />
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        סה"כ חברים: {members.length}
      </div>
    </div>
  );
}
