import { BookOpen } from "lucide-react";

export default function Footer() {
  return <footer className="border-t border-[#e2eadc] bg-[#fbfdf9] px-5 py-10 text-[#15132b]"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 md:flex-row md:items-center"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl border border-[#dacb76] bg-[#fff0a8] text-[#252a20] shadow-sm"><BookOpen size={19} /></div><div><p className="text-lg font-black tracking-tight">StudyGen AI</p><p className="text-sm font-medium text-[#77718f]">Built for students.</p></div></div><div className="flex gap-7 text-sm font-semibold text-[#77718f]"><a href="#features" className="hover:text-[#6757ff]">Features</a><a href="#about" className="hover:text-[#6757ff]">About</a><a href="#contact" className="hover:text-[#6757ff]">Contact</a></div></div></footer>;
}
