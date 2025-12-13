import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

// Check for reduced motion preference
export const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Minimal, professional easing
export const customEase = {
    smooth: 'power1.out',    // Faster, cleaner
    snappy: 'power2.out',
    spring: 'back.out(1.2)', // Less bounce
};

// Fast, minimal durations
export const duration = {
    fast: 0.15,     // Very quick
    normal: 0.25,   // Snappy
    slow: 0.4,      // Still quick
};

// Helper to create scroll-triggered animations
export const createScrollTrigger = (element, options = {}) => {
    if (prefersReducedMotion()) return null;

    return ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',  // Trigger earlier
        toggleActions: 'play none none none',
        once: true,
        ...options,
    });
};

// Minimal fade in - just opacity
export const fadeIn = (element, options = {}) => {
    if (prefersReducedMotion()) {
        gsap.set(element, { opacity: 1 });
        return;
    }

    return gsap.from(element, {
        opacity: 0,
        duration: duration.fast,
        ease: customEase.smooth,
        ...options,
    });
};

// Minimal stagger - just opacity
export const staggerIn = (elements, options = {}) => {
    if (prefersReducedMotion()) {
        gsap.set(elements, { opacity: 1 });
        return;
    }

    return gsap.from(elements, {
        opacity: 0,
        duration: duration.normal,
        stagger: 0.05,  // Faster stagger
        ease: customEase.smooth,
        ...options,
    });
};

// Minimal scale - very subtle
export const scaleIn = (element, options = {}) => {
    if (prefersReducedMotion()) {
        gsap.set(element, { scale: 1, opacity: 1 });
        return;
    }

    return gsap.from(element, {
        scale: 0.98,  // Barely noticeable
        opacity: 0,
        duration: duration.normal,
        ease: customEase.smooth,
        ...options,
    });
};

// Fast counter animation
export const animateCounter = (element, endValue, options = {}) => {
    if (prefersReducedMotion()) {
        element.textContent = endValue.toLocaleString();
        return;
    }

    const obj = { value: 0 };
    return gsap.to(obj, {
        value: endValue,
        duration: duration.slow,
        ease: customEase.smooth,
        onUpdate: () => {
            element.textContent = Math.round(obj.value).toLocaleString();
        },
        ...options,
    });
};

export { gsap, ScrollTrigger, useGSAP };
