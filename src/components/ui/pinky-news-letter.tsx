import { useState, useEffect } from "react"
import { Warp } from "@paper-design/shaders-react"
import { supabase } from "../../lib/supabaseClient"

// Target date: October 12, 2026 at 22:45:00 UTC (30 days from launch)
const TARGET_TIMESTAMP = new Date("2026-10-12T22:45:00Z").getTime();

export default function NewsLetter() {
  const [email, setEmail] = useState("");
  const [mensWear, setMensWear] = useState(false);
  const [womensWear, setWomensWear] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const getInitialTimeLeft = () => {
    const now = Date.now();
    const difference = TARGET_TIMESTAMP - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const difference = TARGET_TIMESTAMP - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true; // should clear interval
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
        return false;
      }
    };

    // Run once immediately on mount just in case
    const shouldClear = updateTimer();
    if (shouldClear) return;

    const interval = setInterval(() => {
      const shouldClear = updateTimer();
      if (shouldClear) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const { error } = await supabase
        .from("subscribers")
        .insert([
          {
            email,
            preferences: {
              mens_wear: mensWear,
              womens_wear: womensWear,
            },
          },
        ]);

      if (error) {
        if (error.code === "23505") { // Unique violation
          setStatus("success");
          setMessage("You're already subscribed! We will keep you updated.");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
        setMessage("Thank you! You've been subscribed successfully.");
        setEmail("");
        setMensWear(false);
        setWomensWear(false);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      {/* Background shader */}
      <div className="absolute inset-0">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={1}
          colors={["hsl(0, 0%, 2%)", "hsl(0, 0%, 8%)", "hsl(0, 0%, 18%)", "hsl(0, 0%, 85%)"]}
        />
      </div>

      {/* Top Left Logo (Centered on mobile, left-aligned on desktop) */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 z-20 w-auto flex justify-center">
        <img src="/logo.png" alt="Logo" className="h-10 md:h-14 w-auto object-contain transition-all duration-300 hover:scale-105" />
      </div>

      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center px-6 py-20 md:py-12">
        <div className="max-w-2xl w-full text-center space-y-6 md:space-y-8 my-auto">
          <div className="space-y-3">
            <span className="text-white/50 text-xs md:text-sm uppercase tracking-[0.25em] font-medium block">Premium Activewear & Gym Gear</span>
            <h1 className="text-white text-4xl md:text-7xl font-sans font-black uppercase tracking-tight">Forge Your Peak</h1>
          </div>

          {/* 30 Days Live Countdown Timer */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto py-2">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-2.5 sm:p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="text-white text-2xl sm:text-5xl font-extralight tabular-nums leading-none">
                  {String(item.value).padStart(2, "0")}
                </span>
                <span className="text-white/40 text-[9px] sm:text-xs uppercase tracking-widest mt-1.5 sm:mt-2 font-light">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Email input with submit button */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
            <div className="relative">
              <input
                type="email"
                required
                disabled={status === "loading"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={status === "loading" ? "Submitting..." : "Enter your email for early access"}
                className="w-full px-5 py-3.5 pr-16 text-sm md:text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all duration-300 disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={status === "loading"}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 group disabled:opacity-50"
              >
                {status === "loading" ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 text-black group-hover:translate-x-0.5 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>

            {/* Wear preferences for gym wear */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-y-2.5 sm:gap-y-0 sm:gap-x-6 text-xs text-white/60">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors duration-200">
                <input 
                  type="checkbox" 
                  disabled={status === "loading"}
                  checked={mensWear}
                  onChange={(e) => setMensWear(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-white cursor-pointer" 
                />
                <span>Notify me for Men's Wear</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors duration-200">
                <input 
                  type="checkbox" 
                  disabled={status === "loading"}
                  checked={womensWear}
                  onChange={(e) => setWomensWear(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-white cursor-pointer" 
                />
                <span>Notify me for Women's Wear</span>
              </label>
            </div>

            {/* Status Feedback Message */}
            {message && (
              <p className={`text-xs md:text-sm font-medium tracking-wide mt-2 animate-fade-in ${
                status === "success" ? "text-emerald-400" : "text-rose-400"
              }`}>
                {message}
              </p>
            )}
          </form>

          {/* Description text */}
          <p className="text-white/70 text-sm md:text-lg font-sans font-light leading-relaxed max-w-lg mx-auto">
            The next generation of high-performance gym wear is dropping soon.
            Sign up now to get early access to the collection and launch day privileges.
          </p>
        </div>
      </div>

      {/* Footer text */}
      <div className="absolute bottom-4 left-0 right-0 z-20 text-center px-4">
        <p className="text-white/30 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-light">
          Website by{" "}
          <a
            href="https://kenettechnologies.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white transition-colors duration-300 font-medium underline underline-offset-4"
          >
            kenettechnologies
          </a>
        </p>
      </div>
    </main>
  )
}
