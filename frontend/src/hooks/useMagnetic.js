import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function useMagnetic(childrenRef) {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current || !childrenRef?.current) return; // Need both interaction zone and protected element

        const xTo = gsap.quickTo(childrenRef.current, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yTo = gsap.quickTo(childrenRef.current, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

        const mouseMove = (e) => {
            const { clientX, clientY } = e;
            const { height, width, left, top } = ref.current.getBoundingClientRect();
            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);
            xTo(x * 0.35); // Adjustable magnetic strength
            yTo(y * 0.35);
        };

        const mouseLeave = () => {
            xTo(0);
            yTo(0);
        };

        ref.current.addEventListener("mousemove", mouseMove);
        ref.current.addEventListener("mouseleave", mouseLeave);

        return () => {
            if (ref.current) {
                ref.current.removeEventListener("mousemove", mouseMove);
                ref.current.removeEventListener("mouseleave", mouseLeave);
            }
        };
    }, [childrenRef]);

    return ref;
}
