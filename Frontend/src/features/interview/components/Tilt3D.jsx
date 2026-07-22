import { useState, useRef } from 'react';

const Tilt3D = ({ children, className = "" }) => {
    const [style, setStyle] = useState({});
    const elementRef = useRef(null);

    const handleMouseMove = (e) => {
        const el = elementRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        
        // Max tilt is 8 degrees
        const angleX = ((yc - y) / yc) * 8;
        const angleY = ((x - xc) / xc) * 8;

        setStyle({
            transform: `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.015, 1.015, 1.015)`,
            transition: 'transform 0.1s ease-out',
            transformStyle: 'preserve-3d'
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.5s ease-out',
            transformStyle: 'preserve-3d'
        });
    };

    return (
        <div 
            ref={elementRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={style}
            className={`${className}`}
        >
            {children}
        </div>
    );
};

export default Tilt3D;
