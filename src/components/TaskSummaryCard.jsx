// src/components/TaskSummaryCard.jsx
import React from "react";

function ProgressBar({ value, max }) {
  const percent = Math.min((value / max) * 100, 100);
  let color = "bg-green-500";
  if (value > max) color = "bg-red-500";
  else if (percent > 90) color = "bg-yellow-500";
  return (
    <div className="w-full bg-gray-200 rounded h-3 mb-2">
      <div
        className={`h-3 rounded ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function EffortSection({ title, dueHours, efforts = [] }) {
  const totalLogged = (efforts || []).reduce((sum, e) => sum + e.hoursLogged, 0);
  return (
    <div className="flex-1 p-4">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="text-sm text-gray-600 mb-1">Due: {dueHours} hrs</div>
      <ProgressBar value={totalLogged} max={dueHours} />
      <div className="text-xs text-gray-500 mb-2">
        {totalLogged} / {dueHours} hrs logged
      </div>
      <ul>
        {efforts.map((e) => (
          <li key={e.teammateName} className="flex justify-between py-1">
            <span>{e.teammateName}</span>
            <span className="font-mono">{e.hoursLogged} hrs</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TaskSummaryCard({ task }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col md:flex-row md:justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{task.taskName}</h2>
          <div className="text-sm text-gray-500">
            Dev Manager: {task.devManagerName} &nbsp;|&nbsp;
            Test Manager: {task.testManagerName}
          </div>
        </div>
        <div className="text-right text-sm text-gray-700 mt-2 md:mt-0">
          <span className="font-semibold">Total Hours:</span> {task.totalHours}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <EffortSection
          title="Development"
          dueHours={task.developmentDueHours}
          efforts={task.developerEffort || []}
        />
        <EffortSection
          title="Testing"
          dueHours={task.testingDueHours}
          efforts={task.testerEffort || []}
        />
      </div>
    </div>
  );
}
