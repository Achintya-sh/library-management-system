import React from 'react';

export const StatsCard = ({ title, value, icon, color = '#6366f1' }) => {
  return (
    <div className="glass-panel metric-card animate-fade-in">
      <div className="metric-icon-box" style={{ color: color, borderColor: `${color}40` }}>
        {icon}
      </div>
      <div className="metric-content">
        <h4>{title}</h4>
        <div className="value">{value}</div>
      </div>
    </div>
  );
};
