import { Mail, Send } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const form = event.target;
    const data = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mrenvnrb", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="contact" className="relative z-10 mt-12 scroll-mt-24 bg-[#f8e9ef] px-5 py-20" style={{ backgroundImage: "none" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-9 text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#6757ff]">Contact us</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#3d2530] md:text-5xl">We would love to hear from you</h2>
          <p className="mx-auto mt-3 max-w-xl text-[#765867]">Questions, feedback, or feature ideas — leave us a message below.</p>
        </div>
        <div className="grid overflow-hidden rounded-[36px] border border-white/10 bg-white shadow-2xl shadow-black/30 md:grid-cols-[.85fr_1.15fr]">
          <div className="bg-[#674356] p-8 md:p-12" style={{ backgroundImage: "none" }}>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f5cddd] text-[#553445] shadow-lg shadow-black/15"><Mail size={22} /></div>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.24em] text-[#f5cddd]">Send a message</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-white">Have a question or an idea?</h2>
            <p className="mt-4 max-w-sm leading-7 text-[#b7bbc3]">Fill in the form and your message will be sent directly to us. We'll get back to you as soon as possible.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#37334b]">Name<input required name="name" placeholder="Your name" className="mt-2 w-full rounded-xl border border-[#e2eadc] bg-[#fcfdfb] px-4 py-3 text-[#15132b] outline-none transition placeholder:text-[#aaa4bd] focus:border-[#9ab58e] focus:ring-4 focus:ring-[#e4f1db]" /></label>
              <label className="text-sm font-bold text-[#37334b]">Email<input required type="email" name="email" placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-[#e2eadc] bg-[#fcfdfb] px-4 py-3 text-[#15132b] outline-none transition placeholder:text-[#aaa4bd] focus:border-[#9ab58e] focus:ring-4 focus:ring-[#e4f1db]" /></label>
            </div>
            <label className="mt-5 block text-sm font-bold text-[#37334b]">Message<textarea required name="message" rows="4" placeholder="How can we help?" className="mt-2 w-full resize-y rounded-xl border border-[#e2eadc] bg-[#fcfdfb] px-4 py-3 text-[#15132b] outline-none transition placeholder:text-[#aaa4bd] focus:border-[#9ab58e] focus:ring-4 focus:ring-[#e4f1db]" /></label>

            {submitted && (
              <p className="mt-4 rounded-xl bg-[#edfff6] px-4 py-3 text-sm font-semibold text-emerald-700">
                ✅ Message sent! We'll get back to you soon.
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || submitted}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#171a14] px-5 py-3 font-black text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#30362a] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send size={17} />
              {isLoading ? "Sending..." : submitted ? "Sent!" : "Send message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

