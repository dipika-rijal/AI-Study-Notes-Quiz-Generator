export default function Process() {
  const steps = [
    { icon: "1", title: "Add", text: "Drop in your topic or study notes.", color: "from-[#fff0a8] to-[#ffe48a]" },
    { icon: "2", title: "Generate", text: "Let StudyGen organize the important parts.", color: "from-orange-400 to-amber-400" },
    { icon: "3", title: "Revise", text: "Read cleaner notes and practice quickly.", color: "from-emerald-500 to-emerald-400" },
  ];
  return <section id="process" className="mx-auto max-w-6xl px-5 py-20 text-center">
    <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-[#6757ff]">Simple process</p>
    <h2 className="text-4xl font-black tracking-[-0.05em] text-[#15132b] md:text-5xl">Done in three steps</h2>
    <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 items-start gap-8 md:grid-cols-3">{steps.map((step) => <div key={step.title} className="text-center"><div className={`mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br ${step.color} text-2xl font-black text-[#252a20] shadow-xl shadow-[#719164]/15`}>{step.icon}</div><h3 className="mb-2 text-lg font-black text-[#15132b]">{step.title}</h3><p className="mx-auto max-w-[220px] text-sm leading-6 text-[#77718f]">{step.text}</p></div>)}</div>
  </section>;
}
