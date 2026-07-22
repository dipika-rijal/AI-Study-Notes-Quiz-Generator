import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Cpu, Database, Network, Sparkles, CheckCircle2 } from "lucide-react";

const getStageData = (state) => {
  switch (state) {
    case "uploading":
      return {
        title: "Reading document",
        subtitle: "Analyzing structure and formatting",
        icon: Database,
        color: "#8fb9aa",
      };
    case "extracting":
      return {
        title: "Extracting concepts",
        subtitle: "18 important topics found",
        icon: BrainCircuit,
        color: "#a7c9bd",
      };
    case "thinking":
      return {
        title: "Organizing knowledge",
        subtitle: "Creating neural relationships",
        icon: Network,
        color: "#71a893",
      };
    case "saving":
    case "downloading":
      return {
        title: "Creating explanation",
        subtitle: "Synthesizing final output... Almost ready",
        icon: Cpu,
        color: "#5f9b83",
      };
    case "success":
      return {
        title: "Knowledge Added",
        subtitle: "Context successfully integrated",
        icon: CheckCircle2,
        color: "#10a37f", // success green
      };
    default:
      return {
        title: "Initializing AI Core",
        subtitle: "Waking up neural pathways...",
        icon: Sparkles,
        color: "#78ab98",
      };
  }
};

const NeuralConnections = ({ color }) => {
  // A sleek SVG animation representing neural connections
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
      <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M300 300 L200 150 M300 300 L400 150 M300 300 L150 300 M300 300 L450 300 M300 300 L200 450 M300 300 L400 450"
          stroke={`url(#gradient)`}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.circle cx="300" cy="300" r="8" fill={color} 
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 2, repeat: Infinity }} 
        />
        {[
          {x: 200, y: 150}, {x: 400, y: 150}, {x: 150, y: 300}, 
          {x: 450, y: 300}, {x: 200, y: 450}, {x: 400, y: 450}
        ].map((pt, i) => (
          <motion.circle key={i} cx={pt.x} cy={pt.y} r="4" fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: [1, 1.3, 1] }}
            transition={{ delay: i * 0.2, duration: 1.5, repeat: Infinity }}
          />
        ))}
        <defs>
          <linearGradient id="gradient" x1="150" y1="150" x2="450" y2="450" gradientUnits="userSpaceOnUse">
            <stop stopColor={color} stopOpacity="0" />
            <stop offset="0.5" stopColor={color} stopOpacity="0.8" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default function AINeuralCore({ loadingState, isSuccess = false }) {
  const [internalState, setInternalState] = useState(loadingState);

  useEffect(() => {
    if (isSuccess) {
      setInternalState("success");
    } else if (loadingState !== "none" && loadingState !== "generating") {
      setInternalState(loadingState);
    }
  }, [loadingState, isSuccess]);

  const activeData = getStageData(internalState);
  const Icon = activeData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0c]/85"
    >
      {/* Background ambient glow */}
      <motion.div 
        className="absolute h-[620px] w-[620px] rounded-full blur-[120px] opacity-10"
        animate={{ 
          backgroundColor: activeData.color,
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <NeuralConnections color={activeData.color} />

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md mx-auto">
        {/* Core Element */}
        <motion.div
          key={internalState}
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="relative mb-9 flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-black/40 shadow-2xl backdrop-blur-md"
          style={{ boxShadow: `0 0 40px ${activeData.color}40` }}
        >
          {/* Orbital rings */}
          <motion.div 
            className="absolute inset-0 rounded-full border border-white/5"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute -inset-4 rounded-full border border-white/5 border-t-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          
          <Icon size={48} color={activeData.color} strokeWidth={1.5} />
        </motion.div>

        {/* Dynamic Text Status */}
        <AnimatePresence mode="wait">
          <motion.div
            key={internalState}
            initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-3"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">
              {activeData.title}
              {internalState !== "success" && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ...
                </motion.span>
              )}
            </h2>
            <p className="text-sm text-white/60 font-medium tracking-wide">
              {activeData.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {internalState !== "success" && (
          <div className="mt-8 grid w-full max-w-xs gap-2 text-left text-sm text-white/55">
            {["Reading document", "Extracting concepts", "Organizing knowledge", "Creating explanation"].map((stage, index) => (
              <div key={stage} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${index <= ["uploading", "extracting", "thinking", "saving", "downloading"].indexOf(internalState) + 1 ? "bg-white/[0.04] text-white/80" : ""}`}>
                <CheckCircle2 size={15} className={index <= ["uploading", "extracting", "thinking", "saving", "downloading"].indexOf(internalState) + 1 ? "text-[#78ab98]" : "text-white/20"} />
                {stage}
              </div>
            ))}
          </div>
        )}

        {/* AI Memory Visualization Details (On Success) */}
        <AnimatePresence>
          {internalState === "success" && (
            <motion.div
              initial={{ opacity: 0, height: 0, mt: 0 }}
              animate={{ opacity: 1, height: "auto", mt: 32 }}
              className="w-full"
            >
              <div className="flex flex-wrap items-center justify-center gap-3">
                {["Neural Networks", "Backpropagation", "Activation Functions"].map((tag, idx) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (idx * 0.1), type: "spring", stiffness: 200 }}
                    className="px-4 py-2 rounded-full border border-[#10a37f]/30 bg-[#10a37f]/10 text-[#10a37f] text-sm font-semibold tracking-wide"
                  >
                    + {tag}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
