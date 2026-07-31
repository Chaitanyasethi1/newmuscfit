import { useState, useEffect } from "react"
import { Warp } from "@paper-design/shaders-react"

// Target date: August 30, 2026 at 22:45:00 UTC (30 days from launch)
const TARGET_TIMESTAMP = new Date("2026-08-30T22:45:00Z").getTime();

export default function NewsLetter() {
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

  return (
    <main className="relative min-h-screen overflow-hidden">
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

      {/* Top Left Logo (Zoomed / Made Larger) */}
      <div className="absolute top-8 left-10 z-20">
        <img src="/logo.png" alt="Logo" className="h-10 md:h-14 w-auto object-contain transition-all duration-300 hover:scale-105" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-3">
            <span className="text-white/50 text-xs md:text-sm uppercase tracking-[0.25em] font-medium">Premium Activewear & Gym Gear</span>
            <h1 className="text-white text-5xl md:text-7xl font-sans font-black uppercase tracking-tight">Forge Your Peak</h1>
          </div>

          {/* 30 Days Live Countdown Timer */}
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto py-4">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-3 md:p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="text-white text-3xl md:text-5xl font-extralight tabular-nums leading-none">
                  {String(item.value).padStart(2, "0")}
                </span>
                <span className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest mt-2 font-light">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Email input with submit button */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email for early access"
                className="w-full px-6 py-4 pr-20 text-base md:text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all duration-300"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 group">
                <svg
                  className="w-5 h-5 text-black group-hover:translate-x-0.5 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Wear preferences for gym wear */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs md:text-sm text-white/60">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors duration-200">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 accent-white cursor-pointer" />
                <span>Notify me for Men's Wear</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors duration-200">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 accent-white cursor-pointer" />
                <span>Notify me for Women's Wear</span>
              </label>
            </div>
          </div>

          {/* Description text */}
          <p className="text-white/70 text-base md:text-lg font-sans font-light leading-relaxed max-w-lg mx-auto">
            The next generation of high-performance gym wear is dropping soon.
            Sign up now to get early access to the collection and launch day privileges.
          </p>
        </div>
      </div>

      {/* Footer text */}
      <div className="absolute bottom-6 left-0 right-0 z-20 text-center">
        <p className="text-white/30 text-xs uppercase tracking-[0.2em] font-light">
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
