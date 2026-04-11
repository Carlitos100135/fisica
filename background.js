export function initBackground(canvas) {
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // ================= CONFIG =================

    const G = 0.15;
    const DAMPING = 0.999;
    const ORBIT_RADIUS = 70;
    const GRAVITY_RADIUS = 150;
    const MAX_SPEED = 4;
    const PERSPECTIVE = 400;

    const ESCAPE_TIME = 100000;
    const ATTRACTOR_SPEED = 0.2;

    const CURSOR_FORCE = 0.03;
    const CURSOR_RADIUS = 200;

    // ================= CURSOR =================

    let mouse = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // ================= PARTICLE =================

    class Particle {
        constructor(type) {
            this.type = type;

            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;

            this.vx = (Math.random() - 0.5);
            this.vy = (Math.random() - 0.5);

            this.z = 0;
            this.orbitAngle = Math.random() * Math.PI * 2;
            this.orbitTimer = 0;

            if (type === "attractor") {
                this.mass = 80;
                this.radius = 14;
                this.color = "red";

                let angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * ATTRACTOR_SPEED;
                this.vy = Math.sin(angle) * ATTRACTOR_SPEED;

            } else {
                this.mass = 2;
                this.radius = 4;
                this.color = "cyan";
            }
        }

        limitSpeed() {
            if (this.type !== "orbiter") return;

            let speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if (speed > MAX_SPEED) {
                this.vx = (this.vx / speed) * MAX_SPEED;
                this.vy = (this.vy / speed) * MAX_SPEED;
            }
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.type === "orbiter") {
                this.vx *= DAMPING;
                this.vy *= DAMPING;
                this.limitSpeed();
            }

            if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width)
                this.vx *= -1;

            if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height)
                this.vy *= -1;
        }

        draw() {
            let scale = 1;
            let drawRadius = this.radius;

            if (this.type === "orbiter" && this.z !== 0) {
                scale = PERSPECTIVE / (PERSPECTIVE - this.z);
                drawRadius = this.radius * scale;
            }

            ctx.beginPath();
            ctx.arc(this.x, this.y, drawRadius, 0, Math.PI * 2);

            let gradient = ctx.createRadialGradient(
                this.x - drawRadius/3,
                this.y - drawRadius/3,
                drawRadius/5,
                this.x,
                this.y,
                drawRadius
            );

            gradient.addColorStop(0, "white");
            gradient.addColorStop(1, this.color);

            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    // ================= FUNÇÕES =================

    function applyOrbitGravity(attractor, orbiter) {
        let dx = attractor.x - orbiter.x;
        let dy = attractor.y - orbiter.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if (dist > GRAVITY_RADIUS) {
            orbiter.z = 0;
            orbiter.orbitTimer = 0;
            return;
        }

        let softening = 80;
        let force = (G * attractor.mass) / (dist*dist + softening);

        let nx = dx / dist;
        let ny = dy / dist;

        orbiter.vx += force * nx;
        orbiter.vy += force * ny;

        if (dist < ORBIT_RADIUS) {
            orbiter.orbitTimer++;

            let radialSpeed = orbiter.vx * nx + orbiter.vy * ny;

            orbiter.vx -= radialSpeed * nx * 0.5;
            orbiter.vy -= radialSpeed * ny * 0.5;

            orbiter.vx *= 1.01;
            orbiter.vy *= 1.01;

            orbiter.orbitAngle += 0.05;
            orbiter.z = Math.sin(orbiter.orbitAngle) * 40;

            if (orbiter.orbitTimer > ESCAPE_TIME) {
                orbiter.vx -= nx * 0.8;
                orbiter.vy -= ny * 0.8;
                orbiter.orbitTimer = 0;
                orbiter.z = 0;
            }

        } else {
            orbiter.orbitTimer = 0;
            orbiter.z = 0;
        }
    }

    function applyCursorGravity(orbiter) {
        let dx = mouse.x - orbiter.x;
        let dy = mouse.y - orbiter.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if (dist > CURSOR_RADIUS || dist === 0) return;

        let force = CURSOR_FORCE / (dist * 0.1 + 1);

        orbiter.vx += dx / dist * force;
        orbiter.vy += dy / dist * force;
    }

    function resolveOrbiterCollisions(orbiters) {
        for (let i = 0; i < orbiters.length; i++) {
            for (let j = i + 1; j < orbiters.length; j++) {
                let a = orbiters[i];
                let b = orbiters[j];

                let dx = b.x - a.x;
                let dy = b.y - a.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let minDist = a.radius + b.radius;

                if (dist < minDist && dist > 0) {
                    let nx = dx / dist;
                    let ny = dy / dist;
                    let overlap = minDist - dist;

                    a.x -= nx * overlap / 2;
                    a.y -= ny * overlap / 2;
                    b.x += nx * overlap / 2;
                    b.y += ny * overlap / 2;

                    let tempVx = a.vx;
                    let tempVy = a.vy;

                    a.vx = b.vx;
                    a.vy = b.vy;

                    b.vx = tempVx;
                    b.vy = tempVy;
                }
            }
        }
    }

    // ================= INICIALIZAÇÃO =================

    let particles = [];

    for (let i = 0; i < 4; i++) {
        particles.push(new Particle("attractor"));
    }

    for (let i = 0; i < 80; i++) {
        particles.push(new Particle("orbiter"));
    }

    // ================= LOOP =================

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let attractors = particles.filter(p => p.type === "attractor");
        let orbiters = particles.filter(p => p.type === "orbiter");

        for (let a of attractors) {
            for (let o of orbiters) {
                applyOrbitGravity(a, o);
            }
        }

        for (let o of orbiters) {
            applyCursorGravity(o);
        }

        resolveOrbiterCollisions(orbiters);

        particles.sort((a, b) => a.z - b.z);

        for (let p of particles) {
            p.update();
            p.draw();
        }

        requestAnimationFrame(animate);
    }

    animate();
}