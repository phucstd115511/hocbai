import { useRef, useEffect } from 'react';

/**
 * Custom React hook for horizontal scroll containers:
 * - Converts vertical mouse wheel (deltaY) to smooth horizontal scroll
 * - Allows drag-to-scroll with mouse grab & kinetic momentum glide
 * - Prevents accidental button clicks while dragging
 * - Doesn't trap scroll: lets page scroll vertically when at boundaries or no overflow
 */
export default function useHorizontalScroll() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasDragged = false;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let momentumRaf = null;
    let wheelTarget = null;
    let wheelRaf = null;

    const stopAllMotion = () => {
      if (momentumRaf) {
        cancelAnimationFrame(momentumRaf);
        momentumRaf = null;
      }
      if (wheelRaf) {
        cancelAnimationFrame(wheelRaf);
        wheelRaf = null;
        wheelTarget = null;
      }
    };

    // 1. Mouse wheel horizontal scrolling
    const onWheel = (e) => {
      // Pick deltaY (standard vertical mouse wheel) or deltaX (horizontal wheel/trackpad)
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return; // No horizontal overflow, allow default page scroll

      const isScrollingLeft = delta < 0;
      const isScrollingRight = delta > 0;

      // If at boundaries, allow vertical page scroll so the user never gets stuck
      if ((isScrollingLeft && el.scrollLeft <= 0) || (isScrollingRight && el.scrollLeft >= maxScroll - 1)) {
        return;
      }

      e.preventDefault();
      stopAllMotion();

      if (wheelTarget === null) {
        wheelTarget = el.scrollLeft;
      }
      wheelTarget = Math.max(0, Math.min(maxScroll, wheelTarget + delta * 0.95));

      if (!wheelRaf) {
        const wheelStep = () => {
          const diff = wheelTarget - el.scrollLeft;
          if (Math.abs(diff) > 0.5) {
            el.scrollLeft += diff * 0.22;
            wheelRaf = requestAnimationFrame(wheelStep);
          } else {
            el.scrollLeft = wheelTarget;
            wheelRaf = null;
            wheelTarget = null;
          }
        };
        wheelRaf = requestAnimationFrame(wheelStep);
      }
    };

    // 2. Mouse drag-to-scroll & Kinetic momentum
    const onMouseDown = (e) => {
      if (e.button !== 0 && e.button !== 1) return;
      stopAllMotion();
      isDown = true;
      hasDragged = false;
      startX = e.pageX - el.offsetLeft;
      scrollStart = el.scrollLeft;
      lastX = e.pageX;
      lastTime = performance.now();
      velocity = 0;
      if (e.button === 1) e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = x - startX;
      if (Math.abs(walk) > 4) {
        hasDragged = true;
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';
      }
      el.scrollLeft = scrollStart - walk;

      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 10) {
        velocity = (e.pageX - lastX) / dt;
        lastX = e.pageX;
        lastTime = now;
      }
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = '';
      el.style.removeProperty('user-select');
      setTimeout(() => {
        hasDragged = false;
      }, 50);

      const now = performance.now();
      if (now - lastTime < 80 && Math.abs(velocity) > 0.15) {
        let currentVel = velocity * 16;
        const friction = 0.94;

        const momentumStep = () => {
          currentVel *= friction;
          el.scrollLeft -= currentVel;

          const maxScroll = el.scrollWidth - el.clientWidth;
          if (Math.abs(currentVel) > 0.25 && el.scrollLeft > 0 && el.scrollLeft < maxScroll) {
            momentumRaf = requestAnimationFrame(momentumStep);
          } else {
            momentumRaf = null;
          }
        };
        momentumRaf = requestAnimationFrame(momentumStep);
      }
    };

    const onWindowBlur = () => {
      if (isDown) {
        isDown = false;
        el.style.cursor = '';
        el.style.removeProperty('user-select');
        hasDragged = false;
      }
    };

    const onClickCapture = (e) => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const onAuxClick = (e) => {
      if (e.button === 1) e.preventDefault();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onWindowBlur);
    el.addEventListener('click', onClickCapture, { capture: true });
    el.addEventListener('auxclick', onAuxClick);

    return () => {
      stopAllMotion();
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onWindowBlur);
      el.removeEventListener('click', onClickCapture, { capture: true });
      el.removeEventListener('auxclick', onAuxClick);
    };
  }, []);

  return containerRef;
}
