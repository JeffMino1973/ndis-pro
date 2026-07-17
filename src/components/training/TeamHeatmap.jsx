import { useMemo } from "react";
import { Grid3x3 } from "lucide-react";

function getCellColor(pct, hasData) {
  if (!hasData) return { bg: "bg-slate-100", text: "text-slate-300", label: "—" };
  if (pct < 25) return { bg: "bg-red-500", text: "text-white", label: `${pct}%` };
  if (pct < 50) return { bg: "bg-amber-500", text: "text-white", label: `${pct}%` };
  if (pct < 75) return { bg: "bg-yellow-400", text: "text-slate-900", label: `${pct}%` };
  return { bg: "bg-green-500", text: "text-white", label: `${pct}%` };
}

export default function TeamHeatmap({ enrollments, staffMembers }) {
  // Match staff member role to enrollment by name (case-insensitive) or email
  const { teams, courses, matrix, teamOrder, courseOrder } = useMemo(() => {
    const staffByLowerName = new Map();
    const staffByLowerEmail = new Map();
    (staffMembers || []).forEach(s => {
      if (s.name) staffByLowerName.set(s.name.toLowerCase().trim(), s);
      if (s.email) staffByLowerEmail.set(s.email.toLowerCase().trim(), s);
    });

    const getRole = (enrollment) => {
      const name = (enrollment.student_name || "").toLowerCase().trim();
      const email = (enrollment.student_email || "").toLowerCase().trim();
      const staff = staffByLowerName.get(name) || staffByLowerEmail.get(email);
      return staff?.role?.trim() || "Unassigned Role";
    };

    // Collect unique teams and courses
    const teamSet = new Set();
    const courseSet = new Set();

    // Build matrix: { team: { course: { sum, count, completed } } }
    const data = {};
    enrollments.forEach(e => {
      const team = getRole(e);
      const course = e.course_title || "Untitled Course";
      teamSet.add(team);
      courseSet.add(course);
      if (!data[team]) data[team] = {};
      if (!data[team][course]) data[team][course] = { sum: 0, count: 0, completed: 0 };
      data[team][course].sum += e.progress_percent || 0;
      data[team][course].count += 1;
      if ((e.progress_percent || 0) >= 100 || e.status === "Completed") data[team][course].completed += 1;
    });

    const teams = Array.from(teamSet);
    const courses = Array.from(courseSet);

    // Compute avg per cell
    const matrix = {};
    teams.forEach(t => {
      matrix[t] = {};
      courses.forEach(c => {
        const cell = data[t]?.[c];
        matrix[t][c] = cell
          ? { avgPct: Math.round(cell.sum / cell.count), count: cell.count, completed: cell.completed, hasData: true }
          : { avgPct: 0, count: 0, completed: 0, hasData: false };
      });
    });

    // Sort teams by their overall avg (lowest first = biggest gap at top)
    const teamOrder = [...teams].sort((a, b) => {
      const avgA = courses.reduce((s, c) => s + (matrix[a][c].hasData ? matrix[a][c].avgPct : 0), 0);
      const avgB = courses.reduce((s, c) => s + (matrix[b][c].hasData ? matrix[b][c].avgPct : 0), 0);
      const countA = courses.filter(c => matrix[a][c].hasData).length || 1;
      const countB = courses.filter(c => matrix[b][c].hasData).length || 1;
      return avgA / countA - avgB / countB;
    });

    // Sort courses by overall avg (lowest first = biggest gap at left)
    const courseOrder = [...courses].sort((a, b) => {
      const avgA = teams.reduce((s, t) => s + (matrix[t][a].hasData ? matrix[t][a].avgPct : 0), 0);
      const avgB = teams.reduce((s, t) => s + (matrix[t][b].hasData ? matrix[t][b].avgPct : 0), 0);
      const countA = teams.filter(t => matrix[t][a].hasData).length || 1;
      const countB = teams.filter(t => matrix[t][b].hasData).length || 1;
      return avgA / countA - avgB / countB;
    });

    return { teams, courses, matrix, teamOrder, courseOrder };
  }, [enrollments, staffMembers]);

  if (teamOrder.length === 0 || courseOrder.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Grid3x3 size={18} className="text-primary" />
          <h2 className="font-black text-base">Team Training Heat-Map</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <Grid3x3 size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-bold">No team training data available</p>
          <p className="text-sm">Assign courses to staff with matching roles to see the heat-map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Grid3x3 size={18} className="text-primary" />
          <h2 className="font-black text-base">Team Training Heat-Map</h2>
        </div>
        <span className="text-xs text-muted-foreground font-semibold">
          Teams & courses sorted by lowest completion first · biggest gaps at top-left
        </span>
      </div>

      {/* Heat-map grid — horizontal scroll on small screens */}
      <div className="overflow-x-auto">
        <div className="min-w-fit">
          {/* Header row: course names */}
          <div className="flex gap-1 mb-1">
            <div className="w-40 shrink-0 sticky left-0 bg-card z-10" />
            {courseOrder.map(course => (
              <div
                key={course}
                className="w-28 shrink-0 text-[10px] font-black text-muted-foreground text-center px-1 py-2 leading-tight"
                title={course}
              >
                <div className="line-clamp-3 break-words">{course}</div>
              </div>
            ))}
          </div>

          {/* Data rows: one per team */}
          {teamOrder.map(team => (
            <div key={team} className="flex gap-1 mb-1 items-stretch">
              <div className="w-40 shrink-0 sticky left-0 bg-card z-10 flex items-center px-2">
                <div>
                  <p className="text-xs font-black text-foreground leading-tight">{team}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {courses.filter(c => matrix[team][c].hasData).length} course(s)
                  </p>
                </div>
              </div>
              {courseOrder.map(course => {
                const cell = matrix[team][course];
                const color = getCellColor(cell.avgPct, cell.hasData);
                return (
                  <div
                    key={course}
                    className={`w-28 shrink-0 h-14 rounded-lg ${color.bg} ${color.text} flex flex-col items-center justify-center transition-all hover:ring-2 hover:ring-primary/40 cursor-default`}
                    title={cell.hasData
                      ? `${team} — ${course}: ${cell.avgPct}% avg (${cell.completed}/${cell.count} completed)`
                      : `${team} — ${course}: No assignments`}
                  >
                    <span className="text-sm font-black">{color.label}</span>
                    {cell.hasData && (
                      <span className="text-[8px] opacity-80">{cell.completed}/{cell.count}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs font-semibold">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" />Under 25%</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500" />25–49%</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-400" />50–74%</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500" />75%+</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />No assignments</span>
      </div>
    </div>
  );
}