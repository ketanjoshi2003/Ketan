/* Toggle Icon Navbar */
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
    distance: '80px',
    duration: 1000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .services-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

/* Typed JS */
if (document.querySelector('.multiple-text')) {
    const typed = new Typed('.multiple-text', {
        strings: ['Python Enthusiast', 'Full Stack Developer', 'Android Developer', '.NET MVC Developer'],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1000,
        loop: true
    });
}

/* Custom Cursor */
const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

window.addEventListener("mousemove", function (e) {
    const posX = e.clientX;
    const posY = e.clientY;

    if (cursorDot) {
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
    }

    // specific animation for outline to follow with delay
    if (cursorOutline) {
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    }
});

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
        ScrollReveal().reveal('.services-box', { origin: 'bottom', interval: 200 });

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
