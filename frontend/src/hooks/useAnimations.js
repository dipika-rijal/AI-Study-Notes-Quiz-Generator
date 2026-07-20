import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 SCROLL REVEAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useScrollReveal(ref, options = {}) {
  const {
    delay = 0,
    duration = 0.8,
    y = 50,
    opacity = 0,
    scale = 0.9,
    stagger = 0.08,
    triggerOnce = true,
    scrub = false,
    start = 'top 85%',
    end = 'top 45%',
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const elements = ref.current.children.length ? ref.current.children : [ref.current];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: start,
          end: end,
          scrub: scrub ? 1 : false,
          toggleActions: triggerOnce ? 'play none none none' : 'play none none reverse',
        },
        defaults: { ease: 'power3.out', duration: duration },
      });

      tl.fromTo(elements, { y, opacity, scale }, { y: 0, opacity: 1, scale: 1, stagger, delay });
    });

    return () => ctx.revert();
  }, [ref, delay, duration, y, opacity, scale, stagger, triggerOnce, scrub, start, end]);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌊 INTERACTIVE PARTICLES (Canvas)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useParticles(canvasRef, options = {}) {
  const {
    count = 150,
    speed = 0.5,
    size = 2.5,
    connectDistance = 150,
    opacity = 0.6,
    pulse = true,
  } = options;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = [];
    let animationFrame;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * size + 0.5;
        this.speedX = (Math.random() - 0.5) * speed * 0.3;
        this.speedY = (Math.random() - 0.5) * speed * 0.3;
        this.opacity = Math.random() * opacity * 0.5 + 0.2;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.02;
      }

      update(time) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 300;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 0.3;
          this.speedX += dx * force * 0.001;
          this.speedY += dy * force * 0.001;
        }

        this.speedX *= 0.999;
        this.speedY *= 0.999;
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        if (pulse) {
          this.pulsePhase += this.pulseSpeed;
          this.currentOpacity = this.opacity * (0.6 + 0.4 * Math.sin(this.pulsePhase));
        } else {
          this.currentOpacity = this.opacity;
        }
      }

      draw() {
        if (!ctx) return;
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 6
        );
        gradient.addColorStop(0, `rgba(139, 92, 246, ${this.currentOpacity})`);
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectDistance) {
            const alpha = (1 - distance / connectDistance) * 0.15;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update(time);
        p.draw();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [canvasRef, count, speed, size, connectDistance, opacity, pulse]);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌟 3D PARALLAX ON HOVER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useParallax(ref, options = {}) {
  const { intensity = 0.08, smoothness = 0.05, maxRotation = 5 } = options;

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      targetX = (e.clientX - centerX) / rect.width;
      targetY = (e.clientY - centerY) / rect.height;
    };

    el.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      x += (targetX - x) * smoothness;
      y += (targetY - y) * smoothness;

      const rotX = -y * intensity * maxRotation;
      const rotY = x * intensity * maxRotation;

      gsap.set(el, {
        rotationX: rotX,
        rotationY: rotY,
        transformPerspective: 1000,
        ease: 'none',
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, [ref, intensity, smoothness, maxRotation]);
}
