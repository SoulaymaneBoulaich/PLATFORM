import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const useFloat = (delay = 0, amplitude = 10, duration = 3) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;

        // Create a random starting position for organic feel
        const randomStart = Math.random() * Math.PI * 2;

        const anim = gsap.to(ref.current, {
            y: amplitude,
            duration: duration,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: delay
        });

        return () => {
            anim.kill();
        };
    }, [delay, amplitude, duration]);

    return ref;
};

export default useFloat;
