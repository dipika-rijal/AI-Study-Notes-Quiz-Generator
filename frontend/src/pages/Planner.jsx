import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Brain,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  RotateCcw,
  TrendingUp,
  Layers,
  Lightbulb,
  FlaskConical
} from "lucide-react";
import { generatePlan, getPlans, getPlanById, updatePlanProgress, deletePlan } from "../api/planApi";

/* ─── tiny helpers ─────────────────────────────────────── */
const TASK_ICONS = {
  study: <BookOpen size={13} />,
  revision: <RotateCcw size={13} />,
  practice: <FlaskConical size={13} />,
  recall: <Brain size={13} />,
  break: <Zap size={13} />
};

const TASK_COLORS = {
  study:    "bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)]",
  revision: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)]",
  practice: "bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border-[var(--color-primary-100)]",
  recall:   "bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)]",
  break:    "bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-muted)] border-[var(--theme-glass-border)]"
};

function ProgressRing({ percent, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--theme-glass-border)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--color-primary-600)" strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

/* ─── Input form ─────────────────────────────────────────── */
function PlannerForm({ onGenerate, loading }) {
  const [form, setForm] = useState({
    goal: "",
    subjects: "",
    examDate: "",
    availableHours: 2,
    currentLevel: "beginner",
    weakTopics: ""
  });

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.goal.trim() || !form.examDate) return;
    onGenerate({
      goal: form.goal.trim(),
      subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
      examDate: form.examDate,
      availableHours: Number(form.availableHours),
      currentLevel: form.currentLevel,
      weakTopics: form.weakTopics.split(",").map((s) => s.trim()).filter(Boolean)
    });
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit}
      className="surface-card p-6 md:p-8 space-y-6"
    >
      {/* Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-tertiary)] text-[var(--color-primary-600)]">
          <Brain size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--theme-text-primary)]">
            Create Your Study Plan
          </h2>
          <p className="text-xs text-[var(--theme-text-muted)]">
            AI builds a personalised schedule using spaced repetition & active recall
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goal */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
            Study Goal *
          </label>
          <input
            id="planner-goal"
            type="text"
            required
            placeholder="e.g. Ace my Physics exam with 85%+"
            value={form.goal}
            onChange={(e) => set("goal", e.target.value)}
            className="input-glass text-sm"
          />
        </div>

        {/* Subjects */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
            Subjects
          </label>
          <input
            id="planner-subjects"
            type="text"
            placeholder="Physics, Maths, Chemistry"
            value={form.subjects}
            onChange={(e) => set("subjects", e.target.value)}
            className="input-glass text-sm"
          />
          <p className="text-[10px] text-[var(--theme-text-muted)]">Comma-separated</p>
        </div>

        {/* Exam Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
            Exam / Target Date *
          </label>
          <input
            id="planner-exam-date"
            type="date"
            required
            min={minDateStr}
            value={form.examDate}
            onChange={(e) => set("examDate", e.target.value)}
            className="input-glass text-sm"
          />
        </div>

        {/* Available Hours */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
            Available Hours / Day
          </label>
          <div className="flex items-center gap-3">
            <input
              id="planner-hours"
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={form.availableHours}
              onChange={(e) => set("availableHours", e.target.value)}
              className="flex-1 accent-[var(--color-primary-600)]"
            />
            <span className="w-14 text-center rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-tertiary)] px-2 py-1 text-sm font-semibold text-[var(--theme-text-primary)]">
              {form.availableHours}h
            </span>
          </div>
        </div>

        {/* Current Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
            Current Knowledge Level
          </label>
          <select
            id="planner-level"
            value={form.currentLevel}
            onChange={(e) => set("currentLevel", e.target.value)}
            className="input-glass text-sm appearance-none cursor-pointer"
          >
            <option value="beginner">🌱 Beginner</option>
            <option value="intermediate">🔥 Intermediate</option>
            <option value="advanced">🚀 Advanced</option>
          </select>
        </div>

        {/* Weak Topics */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
            Weak Topics
          </label>
          <input
            id="planner-weak-topics"
            type="text"
            placeholder="Thermodynamics, Integration, Organic Chemistry"
            value={form.weakTopics}
            onChange={(e) => set("weakTopics", e.target.value)}
            className="input-glass text-sm"
          />
          <p className="text-[10px] text-[var(--theme-text-muted)]">
            Comma-separated – AI prioritises these with spaced revision
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        id="planner-generate-btn"
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Building your personalised plan…
          </>
        ) : (
          <>
            <Zap size={16} />
            Generate AI Study Plan
          </>
        )}
      </button>
    </motion.form>
  );
}

/* ─── Task Card ──────────────────────────────────────────── */
function TaskCard({ task, onToggle, isUpdating }) {
  const color = TASK_COLORS[task.type] || TASK_COLORS.study;
  return (
    <motion.div
      layout
      className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-300 ${
        task.completed ? "opacity-60" : ""
      } ${color}`}
    >
      <button
        onClick={onToggle}
        disabled={isUpdating}
        className="mt-0.5 shrink-0 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed ? (
          <CheckCircle2 size={18} className="text-[var(--color-success-text)]" />
        ) : (
          <Circle size={18} className="opacity-50" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium leading-snug ${task.completed ? "line-through" : ""}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-xs opacity-75 leading-relaxed">{task.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">
            {TASK_ICONS[task.type]}
            {task.type}
          </span>
          {task.duration > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] opacity-70">
              <Clock size={10} />
              {task.duration} min
            </span>
          )}
          {task.subject && (
            <span className="text-[10px] opacity-70">{task.subject}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Day Panel ──────────────────────────────────────────── */
function DayPanel({ day, dayIndex, planId, onProgressUpdate }) {
  const [expanded, setExpanded] = useState(dayIndex === 0);
  const [updating, setUpdating] = useState(null); // "blockIdx-taskIdx"

  const allTasks = (day.timeBlocks || []).flatMap((b) => b.tasks || []);
  const completedCount = allTasks.filter((t) => t.completed).length;
  const totalCount = allTasks.length;

  async function handleToggle(blockIndex, taskIndex, currentCompleted) {
    const key = `${blockIndex}-${taskIndex}`;
    setUpdating(key);
    try {
      const result = await updatePlanProgress(planId, {
        dayIndex,
        blockIndex,
        taskIndex,
        completed: !currentCompleted
      });
      onProgressUpdate(result, dayIndex, blockIndex, taskIndex, !currentCompleted);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <motion.div
      layout
      className="surface-card overflow-hidden"
    >
      {/* Day header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between p-4 md:p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-tertiary)] text-xs font-bold text-[var(--color-primary-600)]">
            {day.day}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--theme-text-primary)]">
              {day.label || `Day ${day.day}`}
            </p>
            {day.theme && (
              <p className="text-xs text-[var(--theme-text-muted)]">{day.theme}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold text-[var(--color-success-text)]">
              {completedCount}/{totalCount} tasks
            </p>
            {day.totalMinutes > 0 && (
              <p className="text-[10px] text-[var(--theme-text-muted)]">
                {day.totalMinutes} min
              </p>
            )}
          </div>
          {/* Mini progress bar */}
          <div className="hidden sm:flex h-1.5 w-20 rounded-full bg-[var(--theme-bg-tertiary)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-primary-600)] transition-all duration-500"
              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%" }}
            />
          </div>
          {expanded ? <ChevronUp size={16} className="text-[var(--theme-text-muted)]" /> : <ChevronDown size={16} className="text-[var(--theme-text-muted)]" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 md:px-5 space-y-4 border-t border-[var(--theme-glass-border)] pt-4">
              {(day.timeBlocks || []).map((block, blockIndex) => (
                <div key={blockIndex} className="space-y-2">
                  {/* Time block header */}
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-[var(--theme-text-muted)]" />
                    <span className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">
                      {block.startTime} – {block.endTime}
                    </span>
                  </div>
                  <div className="space-y-2 pl-1">
                    {(block.tasks || []).map((task, taskIndex) => (
                      <TaskCard
                        key={taskIndex}
                        task={task}
                        isUpdating={updating === `${blockIndex}-${taskIndex}`}
                        onToggle={() => handleToggle(blockIndex, taskIndex, task.completed)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Spaced revision topics */}
              {day.revision && day.revision.length > 0 && (
                <div className="rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-3">
                  <p className="mb-2 text-xs font-semibold text-[var(--color-warning-text)] flex items-center gap-1.5">
                    <RotateCcw size={12} />
                    Spaced Revision
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {day.revision.map((topic, i) => (
                      <span key={i} className="text-[11px] rounded-md bg-[var(--color-warning-border)]/30 px-2 py-0.5 text-[var(--color-warning-text)]">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Weekly overview ────────────────────────────────────── */
function WeeklyOverview({ weeklyTasks }) {
  if (!weeklyTasks || weeklyTasks.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[var(--theme-text-secondary)] flex items-center gap-2">
        <Layers size={15} />
        Weekly Milestones
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {weeklyTasks.map((week, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="surface-card-inner p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary-600)]">
                Week {week.week}
              </span>
              {week.completed && (
                <CheckCircle2 size={13} className="text-[var(--color-success-text)]" />
              )}
            </div>
            <p className="text-sm font-semibold text-[var(--theme-text-primary)] leading-snug">
              {week.milestone}
            </p>
            {week.goals && week.goals.length > 0 && (
              <ul className="space-y-0.5">
                {week.goals.map((g, gi) => (
                  <li key={gi} className="flex items-start gap-1.5 text-xs text-[var(--theme-text-secondary)]">
                    <Target size={10} className="mt-0.5 shrink-0 text-[var(--color-primary-600)]" />
                    {g}
                  </li>
                ))}
              </ul>
            )}
            {week.focusAreas && week.focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {week.focusAreas.map((area, ai) => (
                  <span key={ai} className="rounded-md bg-[var(--color-primary-50)] px-1.5 py-0.5 text-[10px] text-[var(--color-primary-600)]">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Plan Detail View ───────────────────────────────────── */
function PlanDetail({ plan: initialPlan, onDelete, onBack }) {
  const [plan, setPlan] = useState(initialPlan);
  const [activeTab, setActiveTab] = useState("daily");
  const [deleting, setDeleting] = useState(false);

  function handleProgressUpdate(result, dayIndex, blockIndex, taskIndex, completed) {
    setPlan((p) => {
      const newDailyTasks = [...(p.dailyTasks || [])];
      if (dayIndex !== undefined && newDailyTasks[dayIndex]) {
        const newDay = { ...newDailyTasks[dayIndex] };
        const newBlocks = [...(newDay.timeBlocks || [])];
        if (newBlocks[blockIndex]) {
          const newBlock = { ...newBlocks[blockIndex] };
          const newTasks = [...(newBlock.tasks || [])];
          if (newTasks[taskIndex]) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], completed };
            newBlock.tasks = newTasks;
            newBlocks[blockIndex] = newBlock;
            newDay.timeBlocks = newBlocks;
            newDailyTasks[dayIndex] = newDay;
          }
        }
      }
      return {
        ...p,
        progress: result.progress,
        completedTasks: result.completedTasks,
        totalTasks: result.totalTasks,
        dailyTasks: newDailyTasks
      };
    });
  }

  // Update local task state after toggle (refetch full plan)
  async function handleTaskToggle(dayIndex, blockIndex, taskIndex, completed) {
    try {
      await updatePlanProgress(plan._id, { dayIndex, blockIndex, taskIndex, completed });
      const fresh = await getPlanById(plan._id);
      setPlan(fresh.plan);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this plan? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deletePlan(plan._id);
      onDelete();
    } catch {
      setDeleting(false);
    }
  }

  const daysUntilExam = plan.examDate
    ? Math.max(0, Math.ceil((new Date(plan.examDate) - Date.now()) / 86400000))
    : null;

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
          >
            ← All Plans
          </button>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--theme-text-primary)] leading-snug">
            {plan.title}
          </h2>
          {plan.summary && (
            <p className="mt-1 text-sm text-[var(--theme-text-secondary)] max-w-2xl">
              {plan.summary}
            </p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--theme-text-muted)] border border-[var(--theme-glass-border)] hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
        >
          <Trash2 size={13} />
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overall Progress", value: `${plan.progress || 0}%`, icon: <TrendingUp size={15} />, accent: true },
          { label: "Tasks Done", value: `${plan.completedTasks || 0}/${plan.totalTasks || 0}`, icon: <CheckCircle2 size={15} /> },
          { label: "Days Left", value: daysUntilExam !== null ? `${daysUntilExam}d` : "—", icon: <CalendarDays size={15} /> },
          { label: "Daily Hours", value: `${plan.availableHours}h`, icon: <Clock size={15} /> }
        ].map(({ label, value, icon, accent }) => (
          <div key={label} className={`surface-card-inner p-4 flex items-center gap-3 ${accent ? "border-[var(--color-primary-600)]/30" : ""}`}>
            <div className="shrink-0 text-[var(--color-primary-600)]">{icon}</div>
            <div>
              <p className="text-lg font-bold text-[var(--theme-text-primary)]">{value}</p>
              <p className="text-[10px] text-[var(--theme-text-muted)]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[var(--theme-text-muted)]">
          <span>Plan completion</span>
          <span>{plan.progress || 0}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--theme-bg-tertiary)] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)]"
            initial={{ width: 0 }}
            animate={{ width: `${plan.progress || 0}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {(plan.subjects || []).map((s) => (
          <span key={s} className="rounded-full border border-[var(--color-info-border)] bg-[var(--color-info-bg)] px-3 py-1 text-xs text-[var(--color-info-text)]">
            {s}
          </span>
        ))}
        {(plan.weakTopics || []).length > 0 && (
          <span className="rounded-full border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-3 py-1 text-xs text-[var(--color-warning-text)] flex items-center gap-1">
            <Lightbulb size={10} /> Weak areas tracked
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--theme-glass-border)] pb-0">
        {[["daily", "Daily Plan"], ["weekly", "Weekly Overview"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === id
                ? "border-[var(--color-primary-600)] text-[var(--theme-text-primary)]"
                : "border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text-secondary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "daily" && (
        <div className="space-y-3">
          {(plan.dailyTasks || []).map((day, dayIndex) => (
            <DayPanel
              key={dayIndex}
              day={day}
              dayIndex={dayIndex}
              planId={plan._id}
              onProgressUpdate={handleProgressUpdate}
            />
          ))}
        </div>
      )}

      {activeTab === "weekly" && (
        <WeeklyOverview weeklyTasks={plan.weeklyTasks} />
      )}
    </motion.div>
  );
}

/* ─── Plans List ─────────────────────────────────────────── */
function PlansList({ plans, onSelect, onNew }) {
  if (plans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center space-y-4"
      >
        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] text-3xl">
          🗓️
        </div>
        <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">
          No study plans yet
        </h3>
        <p className="text-sm text-[var(--theme-text-secondary)] max-w-sm">
          Generate your first AI-powered schedule and start studying smarter today.
        </p>
        <button onClick={onNew} className="btn-primary flex items-center gap-2 mt-2">
          <Plus size={15} />
          Create First Plan
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan, i) => {
        const daysLeft = plan.examDate
          ? Math.max(0, Math.ceil((new Date(plan.examDate) - Date.now()) / 86400000))
          : null;
        return (
          <motion.button
            key={plan._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(plan._id)}
            className="surface-card w-full text-left p-4 md:p-5 flex items-center gap-4 hover:border-[var(--color-primary-600)]/40 transition-all group"
          >
            <div className="flex-shrink-0">
              <ProgressRing percent={plan.progress || 0} size={52} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[var(--theme-text-primary)] truncate group-hover:text-[var(--color-primary-600)] transition-colors">
                {plan.title || plan.goal}
              </p>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                {(plan.subjects || []).join(", ") || "General"}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-[10px] text-[var(--color-success-text)] font-semibold">
                  {plan.progress || 0}% done
                </span>
                {daysLeft !== null && (
                  <span className={`text-[10px] font-medium ${daysLeft <= 3 ? "text-[var(--color-error-text)]" : "text-[var(--theme-text-muted)]"}`}>
                    {daysLeft === 0 ? "Exam today!" : `${daysLeft}d until exam`}
                  </span>
                )}
                <span className="text-[10px] text-[var(--theme-text-muted)] capitalize">
                  {plan.currentLevel}
                </span>
              </div>
            </div>
            <ChevronDown size={15} className="shrink-0 -rotate-90 text-[var(--theme-text-muted)] group-hover:text-[var(--color-primary-600)] transition-colors" />
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Main Planner Page ──────────────────────────────────── */
export default function Planner() {
  const [view, setView] = useState("list"); // "list" | "new" | "detail"
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPlan, setFetchingPlan] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");

  // Load plans list on mount
  const loadPlans = useCallback(async () => {
    setListLoading(true);
    try {
      const result = await getPlans();
      setPlans(result.plans || []);
    } catch (err) {
      setError("Could not load plans. Make sure backend is running.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  async function handleGenerate(payload) {
    setError("");
    setLoading(true);
    try {
      const result = await generatePlan(payload);
      const newPlan = result.plan;
      setActivePlan(newPlan);
      setView("detail");
      loadPlans();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectPlan(planId) {
    setFetchingPlan(true);
    setError("");
    try {
      const result = await getPlanById(planId);
      setActivePlan(result.plan);
      setView("detail");
    } catch {
      setError("Could not load plan details.");
    } finally {
      setFetchingPlan(false);
    }
  }

  function handleDeletePlan() {
    setActivePlan(null);
    setView("list");
    loadPlans();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-14 pt-4 px-4 sm:px-0">
      {/* Page Header */}
      <header className="space-y-1">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--theme-text-primary)]">
              AI Study Planner
            </h1>
            <p className="mt-1 text-[var(--theme-text-secondary)]">
              Personalised schedules using spaced repetition & active recall
            </p>
          </div>

          {view !== "new" && (
            <button
              id="planner-new-btn"
              onClick={() => setView("new")}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={15} />
              New Plan
            </button>
          )}
        </div>

        {/* Science pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            ["🔁", "Spaced Repetition"],
            ["🧠", "Active Recall"],
            ["🔄", "Revision Cycles"],
            ["⚡", "Time Blocks"]
          ].map(([icon, label]) => (
            <span key={label} className="inline-flex items-center gap-1 rounded-full border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3 py-1 text-[11px] text-[var(--theme-text-muted)]">
              {icon} {label}
            </span>
          ))}
        </div>
      </header>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-text)] flex items-center justify-between gap-3"
          >
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <AnimatePresence mode="wait">
        {view === "new" && (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <button
              onClick={() => setView("list")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
            >
              ← Back to Plans
            </button>
            <PlannerForm onGenerate={handleGenerate} loading={loading} />
          </motion.div>
        )}

        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {listLoading || fetchingPlan ? (
              <div className="flex justify-center py-16">
                <span className="h-6 w-6 rounded-full border-2 border-[var(--color-primary-600)]/30 border-t-[var(--color-primary-600)] animate-spin" />
              </div>
            ) : (
              <PlansList
                plans={plans}
                onSelect={handleSelectPlan}
                onNew={() => setView("new")}
              />
            )}
          </motion.div>
        )}

        {view === "detail" && activePlan && (
          <PlanDetail
            key={activePlan._id}
            plan={activePlan}
            onDelete={handleDeletePlan}
            onBack={() => setView("list")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
