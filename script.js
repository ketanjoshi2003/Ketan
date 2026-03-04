/* ========================================
   Premium Particle Constellation Animation
   ======================================== */
(function () {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const homeSection = document.getElementById('home');

    // Configuration
    const CONFIG = {
        particleCount: 80,
        connectionDistance: 150,
        particleMinSize: 1.2,
        particleMaxSize: 3.5,
        speed: 0.4,
        mouseRadius: 180,
        mouseRepulse: 0.08,
        colors: {
            primary: { r: 0, g: 238, b: 255 },     // #0ef  — cyan
            secondary: { r: 100, g: 180, b: 255 },  // softer blue
            tertiary: { r: 180, g: 100, b: 255 },   // violet accent
        }
    };

    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let animationId = null;
    let width, height;

    // --- Resize ---
    function resize() {
        const rect = homeSection.getBoundingClientRect();
        // Extra height to cover the header/nav area above the home section
        const headerExtra = parseFloat(getComputedStyle(document.documentElement).fontSize) * 8; // 8rem
        width = rect.width;
        height = rect.height + headerExtra;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    // --- Particle class ---
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.baseSize = CONFIG.particleMinSize + Math.random() * (CONFIG.particleMaxSize - CONFIG.particleMinSize);
            this.size = this.baseSize;
            this.vx = (Math.random() - 0.5) * CONFIG.speed * 2;
            this.vy = (Math.random() - 0.5) * CONFIG.speed * 2;
            this.pulseSpeed = 0.02 + Math.random() * 0.03;
            this.pulseOffset = Math.random() * Math.PI * 2;
            this.opacity = 0.3 + Math.random() * 0.6;

            // Assign color type
            const r = Math.random();
            if (r < 0.55) this.color = CONFIG.colors.primary;
            else if (r < 0.8) this.color = CONFIG.colors.secondary;
            else this.color = CONFIG.colors.tertiary;
        }

        update(time) {
            // Float movement
            this.x += this.vx;
            this.y += this.vy;

            // Pulse size
            this.size = this.baseSize + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.8;

            // Bounce off edges softly
            if (this.x < 0) { this.x = 0; this.vx *= -1; }
            if (this.x > width) { this.x = width; this.vx *= -1; }
            if (this.y < 0) { this.y = 0; this.vy *= -1; }
            if (this.y > height) { this.y = height; this.vy *= -1; }

            // Mouse repulsion
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONFIG.mouseRadius && dist > 0) {
                const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
                this.vx += (dx / dist) * force * CONFIG.mouseRepulse;
                this.vy += (dy / dist) * force * CONFIG.mouseRepulse;
            }

            // Gentle friction
            this.vx *= 0.998;
            this.vy *= 0.998;
        }

        draw() {
            // Glow
            ctx.beginPath();
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
            grad.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.4})`);
            grad.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
            ctx.fillStyle = grad;
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // --- Draw connections ---
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.connectionDistance) {
                    const alpha = (1 - dist / CONFIG.connectionDistance) * 0.25;
                    const midR = (particles[i].color.r + particles[j].color.r) / 2;
                    const midG = (particles[i].color.g + particles[j].color.g) / 2;
                    const midB = (particles[i].color.b + particles[j].color.b) / 2;

                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${midR}, ${midG}, ${midB}, ${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    // --- Animate ---
    let time = 0;
    function animate() {
        time++;
        ctx.clearRect(0, 0, width, height);

        // Subtle gradient overlay at bottom for blending with next section
        const fadeGrad = ctx.createLinearGradient(0, height * 0.75, 0, height);
        fadeGrad.addColorStop(0, 'rgba(31, 36, 45, 0)');
        fadeGrad.addColorStop(1, 'rgba(31, 36, 45, 0.6)');
        ctx.fillStyle = fadeGrad;
        ctx.fillRect(0, height * 0.75, width, height * 0.25);

        drawConnections();

        for (const p of particles) {
            p.update(time);
            p.draw();
        }

        animationId = requestAnimationFrame(animate);
    }

    // --- Initialise ---
    function init() {
        resize();
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(new Particle());
        }
        if (animationId) cancelAnimationFrame(animationId);
        animate();
    }

    // --- Events ---
    window.addEventListener('resize', () => {
        resize();
        // Re-constrain particles to new bounds
        for (const p of particles) {
            if (p.x > width) p.x = width * Math.random();
            if (p.y > height) p.y = height * Math.random();
        }
    });

    homeSection.addEventListener('mousemove', (e) => {
        const rect = homeSection.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    homeSection.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    init();
})();


let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

if (menuIcon) {
    menuIcon.onclick = () => {
        menuIcon.classList.toggle('fa-xmark');
        navbar.classList.toggle('active');
    };
}

/* Scroll Section Active Link */
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                let activeLink = document.querySelector('header nav a[href*=' + id + ']');
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            });
        };
    });

    /* Sticky Navbar */
    let header = document.querySelector('header');
    header?.classList.toggle('sticky', window.scrollY > 100);

    /* Remove toggle icon and navbar when click navbar link (scroll) */
    if (menuIcon) menuIcon.classList.remove('fa-xmark');
    if (navbar) navbar.classList.remove('active');
};

/* Scroll Reveal */
ScrollReveal({
    reset: true,
    distance: '40px',
    duration: 600,
    delay: 100,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.services-box', { origin: 'bottom', interval: 100 });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

/* Typed JS */
if (document.querySelector('.multiple-text')) {
    const typed = new Typed('.multiple-text', {
        strings: ['Python Enthusiast', 'Full Stack Developer', 'Android Developer', '.NET MVC Developer'],
        typeSpeed: 50,
        backSpeed: 40,
        backDelay: 800,
        loop: true
    });
}

/* Contact Form Handler */
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const fullName = formData.get('fullName');
        const email = formData.get('email');
        const mobile = formData.get('mobile');
        const subject = formData.get('subject');
        const message = formData.get('message');

        const body = `Name: ${fullName}
Email: ${email}
Mobile: ${mobile}

Message:
${message}`;

        // Construct mailto link
        const mailtoLink = `mailto:ketanjoshi2003@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;
    });
}

/* Fetch and Display GitHub Projects */
const projectContainer = document.querySelector('.services-container');

async function fetchGitHubProjects() {
    if (!projectContainer) return;

    try {
        const response = await fetch('https://api.github.com/users/ketanjoshi2003/repos?sort=updated&per_page=6');
        if (!response.ok) throw new Error('Failed to fetch projects');

        const repos = await response.json();

        repos.forEach(repo => {
            const projectBox = document.createElement('div');
            projectBox.classList.add('services-box');

            // Determine icon based on language
            let iconClass = 'fa-brands fa-github';
            if (repo.language) {
                const lang = repo.language.toLowerCase();
                if (lang.includes('python')) iconClass = 'fa-brands fa-python';
                else if (lang.includes('java')) iconClass = 'fa-brands fa-java';
                else if (lang.includes('html')) iconClass = 'fa-brands fa-html5';
                else if (lang.includes('css')) iconClass = 'fa-brands fa-css3-alt';
                else if (lang.includes('js') || lang.includes('javascript')) iconClass = 'fa-brands fa-js';
            }

            // Format repo name to be cleaner (replace hyphens with spaces)
            const cleanName = repo.name.replace(/-/g, ' ');

            projectBox.innerHTML = `
                <i class="${iconClass}"></i>
                <h3>${cleanName}</h3>
                <p>${repo.description || 'No description available.'}</p>
                <a href="${repo.html_url}" target="_blank" class="btn">View Project</a>
            `;

            projectContainer.appendChild(projectBox);
        });

        // Explicitly reveal the new elements
        ScrollReveal().reveal('.services-box', { origin: 'bottom', interval: 100 });

    } catch (error) {
        console.error('Error loading GitHub projects:', error);
    }
}

fetchGitHubProjects();

/* Read More Toggle */
const readMoreBtn = document.querySelector('.about-content .btn');
const moreText = document.querySelector('.about-content .more-text');

if (readMoreBtn && moreText) {
    readMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        moreText.classList.toggle('active');

        if (moreText.classList.contains('active')) {
            readMoreBtn.textContent = 'Read Less';
        } else {
            readMoreBtn.textContent = 'Read More';
        }
    });
}
