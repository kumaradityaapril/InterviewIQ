import { useEffect, useRef } from 'react';

const Tech3DBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Coordinates & Configuration
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const particles = [];
        const maxParticles = 60;
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        // Initialize particles in a 3D coordinate space
        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: (Math.random() - 0.5) * 800,
                y: (Math.random() - 0.5) * 800,
                z: (Math.random() - 0.5) * 800,
                baseZ: 0
            });
        }

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e) => {
            targetX = (e.clientX - window.innerWidth / 2) * 0.05;
            targetY = (e.clientY - window.innerHeight / 2) * 0.05;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        const fov = 400; // Field of View (distance parameter)

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Interpolate mouse coordinates smoothly
            mouseX += (targetX - mouseX) * 0.08;
            mouseY += (targetY - mouseY) * 0.08;

            // Compute sin/cos of rotation angles from mouse offsets
            const angleX = mouseY * 0.005;
            const angleY = mouseX * 0.005;

            const cosX = Math.cos(angleX);
            const sinX = Math.sin(angleX);
            const cosY = Math.cos(angleY);
            const sinY = Math.sin(angleY);

            // Map and project points
            const projected = [];

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Orbit motion along Z axis
                p.z += 0.5;
                if (p.z > 400) p.z = -400;

                // 3D Rotations
                // Rotate Y-axis
                let x1 = p.x * cosY - p.z * sinY;
                let z1 = p.z * cosY + p.x * sinY;

                // Rotate X-axis
                let y2 = p.y * cosX - z1 * sinX;
                let z2 = z1 * cosX + p.y * sinX;

                // 3D Perspective Projection formula
                const scale = fov / (fov + z2);
                const screenX = x1 * scale + width / 2;
                const screenY = y2 * scale + height / 2;

                projected.push({
                    x: screenX,
                    y: screenY,
                    scale: scale,
                    z: z2
                });
            }

            // Draw connecting lines between close particles
            ctx.lineWidth = 0.5;
            for (let i = 0; i < projected.length; i++) {
                const p1 = projected[i];
                if (p1.z > fov - 50) continue; // Skip if too close to camera

                for (let j = i + 1; j < projected.length; j++) {
                    const p2 = projected[j];
                    const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

                    if (dist < 130) {
                        const alpha = (1 - dist / 130) * 0.15;
                        ctx.strokeStyle = `rgba(173, 198, 255, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            for (let i = 0; i < projected.length; i++) {
                const p = projected[i];
                if (p.z > fov - 50) continue;

                const size = Math.max(0.5, p.scale * 2.5);
                const alpha = Math.min(1, Math.max(0, p.scale * 0.7));

                ctx.fillStyle = `rgba(0, 219, 233, ${alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 w-full h-full pointer-events-none z-0" 
            style={{ mixBlendMode: 'screen', opacity: 0.6 }}
        />
    );
};

export default Tech3DBackground;
