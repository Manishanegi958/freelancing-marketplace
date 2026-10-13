
/*
  SkillBridge - Freelancing Marketplace
  Handles project listings, search, filters, proposals and dashboard data.
*/

const STORAGE_KEYS = {
    projects: "skillBridgeProjects",
    proposals: "skillBridgeProposals"
};

// Sample projects shown when someone opens the website for the first time.
const sampleProjects = [
    {
        id: "sample-1",
        title: "Build a Modern Business Website",
        category: "Web Development",
        budget: 12000,
        description: "Create a clean, responsive website for a small business with a homepage, services section and contact form.",
        skills: ["HTML", "CSS", "JavaScript"],
        deadline: "2026-11-15",
        client: "Bright Ideas Studio",
        status: "Open"
    },
    {
        id: "sample-2",
        title: "Design a Creative Brand Identity",
        category: "Graphic Design",
        budget: 5000,
        description: "We need a memorable logo and a simple brand identity that works across social media and printed materials.",
        skills: ["Logo Design", "Illustrator", "Creativity"],
        deadline: "2026-11-05",
        client: "Pixel House",
        status: "Open"
    },
    {
        id: "sample-3",
        title: "Write Blog Posts for a Travel Website",
        category: "Content Writing",
        budget: 4000,
        description: "Write engaging travel articles with useful information, original ideas and basic SEO optimization.",
        skills: ["Writing", "SEO", "Research"],
        deadline: "2026-11-12",
        client: "Wander Notes",
        status: "Open"
    },
    {
        id: "sample-4",
        title: "Manage Social Media Campaigns",
        category: "Digital Marketing",
        budget: 9000,
        description: "Help our growing brand plan social media content, prepare weekly posts and track engagement.",
        skills: ["Instagram", "Marketing", "Analytics"],
        deadline: "2026-11-20",
        client: "Grow Digital",
        status: "Open"
    },
    {
        id: "sample-5",
        title: "Edit Videos for a YouTube Channel",
        category: "Video Editing",
        budget: 7000,
        description: "Edit short videos with smooth transitions, captions, background music and engaging opening scenes.",
        skills: ["Video Editing", "Premiere Pro", "Storytelling"],
        deadline: "2026-11-18",
        client: "Creator Corner",
        status: "Open"
    },
    {
        id: "sample-6",
        title: "Organize Data in a Spreadsheet",
        category: "Data Entry",
        budget: 2500,
        description: "Organize customer records into a spreadsheet, remove duplicate entries and check the information for accuracy.",
        skills: ["Excel", "Data Entry", "Attention to Detail"],
        deadline: "2026-11-08",
        client: "Office Assist Co.",
        status: "Open"
    }
];

const sampleFreelancers = [
    {
        name: "Aarav Sharma",
        role: "Web Developer",
        skills: ["HTML", "CSS", "JavaScript"],
        experience: "Expert",
        rating: 4.9,
        reviews: 28,
        bio: "I build responsive websites that are easy to use and maintain.",
        portfolio: "https://github.com/"
    },
    {
        name: "Priya Verma",
        role: "Graphic Designer",
        skills: ["Logo Design", "Illustrator", "Branding"],
        experience: "Expert",
        rating: 4.8,
        reviews: 22,
        bio: "I turn business ideas into thoughtful and memorable designs.",
        portfolio: "https://www.behance.net/"
    },
    {
        name: "Rohan Mehta",
        role: "Content Writer",
        skills: ["Writing", "SEO", "Research"],
        experience: "Intermediate",
        rating: 4.7,
        reviews: 16,
        bio: "I write clear, useful content for websites and blogs.",
        portfolio: "https://medium.com/"
    },
    {
        name: "Ananya Singh",
        role: "Digital Marketer",
        skills: ["Social Media", "SEO", "Analytics"],
        experience: "Intermediate",
        rating: 4.9,
        reviews: 19,
        bio: "I help brands reach the right audience with creative campaigns.",
        portfolio: "https://www.linkedin.com/"
    },
    {
        name: "Kabir Joshi",
        role: "Video Editor",
        skills: ["Video Editing", "Storytelling", "Reels"],
        experience: "Beginner",
        rating: 4.6,
        reviews: 8,
        bio: "I enjoy turning raw clips into engaging visual stories.",
        portfolio: "https://www.behance.net/"
    },
    {
        name: "Meera Kapoor",
        role: "Data Entry Specialist",
        skills: ["Excel", "Data Entry", "Research"],
        experience: "Intermediate",
        rating: 4.8,
        reviews: 14,
        bio: "I keep data accurate, organized and ready to use.",
        portfolio: "https://www.linkedin.com/"
    }
];

let projects = loadData(STORAGE_KEYS.projects, sampleProjects);
let proposals = loadData(STORAGE_KEYS.proposals, []);

const projectList = document.getElementById("projectList");
const freelancerList = document.getElementById("freelancerList");
const proposalModal = document.getElementById("proposalModal");
const toast = document.getElementById("toast");

let toastTimeout;

// Read saved data. If storage is unavailable or corrupted, use the fallback.
function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);

        if (saved !== null) {
            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.warn("Could not load saved data:", error);
    }

    return fallback.map(item => ({ ...item }));
}

// Save data in the current browser.
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Could not save data:", error);
        showToast("Browser storage is unavailable. Your changes may not be saved.");
        return false;
    }
}

// Escape user-entered text before inserting it into HTML.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function formatMoney(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}

function formatDate(dateString) {
    if (!dateString) return "Not specified";

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "Not specified";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Render project cards.
function renderProjects() {
    const searchTerm = document
        .getElementById("projectSearch")
        .value.trim().toLowerCase();

    const selectedCategory =
        document.getElementById("categoryFilter").value;

    const maxBudget = Number(
        document.getElementById("budgetFilter").value
    ) || Infinity;

    const filteredProjects = projects.filter(project => {
        const searchableText = [
            project.title,
            project.category,
            project.description,
            project.client,
            ...(project.skills || [])
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchTerm);
        const matchesCategory =
            !selectedCategory || project.category === selectedCategory;
        const matchesBudget = Number(project.budget) <= maxBudget;
        const isOpen = project.status === "Open";

        return matchesSearch && matchesCategory &&
            matchesBudget && isOpen;
    });

    document.getElementById("projectCount").textContent =
        `${filteredProjects.length} project(s) found`;

    if (filteredProjects.length === 0) {
        projectList.innerHTML = `
            <div class="empty-state">
                <h3>No projects found</h3>
                <p>Try another search term or change your filters.</p>
            </div>
        `;
        return;
    }

    projectList.innerHTML = filteredProjects.map(project => `
        <article class="project-card">
            <div class="project-top">
                <span class="category-tag">
                    ${escapeHTML(project.category)}
                </span>
                <span class="status-tag">${escapeHTML(project.status)}</span>
            </div>

            <h3>${escapeHTML(project.title)}</h3>

            <p class="project-description">
                ${escapeHTML(project.description)}
            </p>

            <div class="skills-list">
                ${(project.skills || []).map(skill => `
                    <span class="skill-tag">${escapeHTML(skill)}</span>
                `).join("")}
            </div>

            <div class="project-meta">
                <span>💰 Budget:
                    <strong class="project-budget">
                        ${formatMoney(project.budget)}
                    </strong>
                </span>
                <span>📅 Deadline:
                    <strong>${formatDate(project.deadline)}</strong>
                </span>
                <span>🏢 Client:
                    <strong>${escapeHTML(project.client)}</strong>
                </span>
            </div>

            <div class="project-footer">
                <small>Freelancers welcome</small>
                <button class="btn btn-primary apply-button"
                    data-project-id="${escapeHTML(project.id)}">
                    Submit Proposal
                </button>
            </div>
        </article>
    `).join("");
}

// Render freelancer cards.
function renderFreelancers() {
    const searchTerm = document
        .getElementById("freelancerSearch")
        .value.trim().toLowerCase();

    const selectedExperience =
        document.getElementById("experienceFilter").value;

    const filteredFreelancers = sampleFreelancers.filter(freelancer => {
        const searchableText = [
            freelancer.name,
            freelancer.role,
            freelancer.bio,
            ...freelancer.skills
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm) &&
            (!selectedExperience ||
                freelancer.experience === selectedExperience);
    });

    if (filteredFreelancers.length === 0) {
        freelancerList.innerHTML = `
            <div class="empty-state">
                <h3>No freelancers found</h3>
                <p>Try searching for another skill or experience level.</p>
            </div>
        `;
        return;
    }

    freelancerList.innerHTML = filteredFreelancers.map(freelancer => {
        const initials = freelancer.name
            .split(" ")
            .map(part => part[0])
            .join("")
            .slice(0, 2);

        return `
            <article class="freelancer-card">
                <div class="freelancer-avatar" aria-label="Freelancer initials">
                    ${escapeHTML(initials)}
                </div>

                <h3>${escapeHTML(freelancer.name)}</h3>
                <p class="freelancer-role">${escapeHTML(freelancer.role)}</p>

                <span class="experience-tag">
                    ${escapeHTML(freelancer.experience)}
                </span>

                <p class="freelancer-rating">
                    ★ ${escapeHTML(freelancer.rating)}
                    <span>(${escapeHTML(freelancer.reviews)} reviews)</span>
                </p>

                <p class="freelancer-bio">
                    ${escapeHTML(freelancer.bio)}
                </p>

                <div class="skills-list">
                    ${freelancer.skills.map(skill => `
                        <span class="skill-tag">${escapeHTML(skill)}</span>
                    `).join("")}
                </div>

                <a class="btn btn-outline" href="${escapeHTML(freelancer.portfolio)}"
                   target="_blank" rel="noopener noreferrer">
                    View Portfolio ↗
                </a>
            </article>
        `;
    }).join("");
}

// Update the dashboard using the current saved data.
function renderDashboard() {
    const myProjects = projects.filter(project => project.owner === "user");
    const myProposals = proposals;

    document.getElementById("postedCount").textContent = myProjects.length;
    document.getElementById("proposalCount").textContent = myProposals.length;

    document.getElementById("openCount").textContent =
        projects.filter(project => project.status === "Open").length;

    const dashboardProjects = document.getElementById("dashboardProjects");
    const dashboardProposals = document.getElementById("dashboardProposals");

    dashboardProjects.innerHTML = myProjects.length
        ? myProjects.map(project => `
            <article class="dashboard-item">
                <h4>${escapeHTML(project.title)}</h4>
                <p>${escapeHTML(project.category)} · ${formatMoney(project.budget)}</p>
                <small>Deadline: ${formatDate(project.deadline)}</small>
                <br>
                <span class="status-tag">${escapeHTML(project.status)}</span>
            </article>
        `).join("")
        : `<p class="empty-state">You haven't posted a project yet.</p>`;

    dashboardProposals.innerHTML = myProposals.length
        ? myProposals.map(proposal => `
            <article class="dashboard-item">
                <h4>${escapeHTML(proposal.projectTitle)}</h4>
                <p>By: ${escapeHTML(proposal.name)}</p>
                <p>Expected budget: ${formatMoney(proposal.budget)}</p>
                <small>Contact: ${escapeHTML(proposal.email)}</small>
                <br>
                <span class="status-tag">Submitted</span>
            </article>
        `).join("")
        : `<p class="empty-state">Your submitted proposals will appear here.</p>`;
}

// Open the proposal form for the selected project.
function openProposalForm(projectId) {
    const project = projects.find(item =>
        String(item.id) === String(projectId)
    );

    if (!project || project.status !== "Open") {
        showToast("This project is no longer available.");
        return;
    }

    document.getElementById("proposalProjectId").value = project.id;
    document.getElementById("proposalProjectName").textContent =
        "Project: " + project.title;

    document.getElementById("proposalMessage").textContent = "";
    document.getElementById("proposalMessage").className = "form-message";

    proposalModal.hidden = false;
    document.body.style.overflow = "hidden";

    document.getElementById("freelancerName").focus();
}

function closeProposalForm() {
    proposalModal.hidden = true;
    document.body.style.overflow = "";
}

// Post a new project.
document.getElementById("postProjectForm").addEventListener("submit", event => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    const budget = Number(document.getElementById("projectBudget").value);
    const deadline = document.getElementById("projectDeadline").value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!Number.isFinite(budget) || budget <= 0 || budget > 10000000) {
        showFormMessage("postMessage", "Enter a valid budget.", "error");
        return;
    }

    if (!deadline || new Date(deadline + "T00:00:00") < today) {
        showFormMessage("postMessage", "Choose today or a future deadline.", "error");
        return;
    }

    const newProject = {
        id: "project-" + Date.now() + "-" +
            Math.random().toString(36).slice(2, 7),
        title: document.getElementById("projectTitle").value.trim(),
        category: document.getElementById("projectCategory").value,
        budget,
        description: document.getElementById("projectDescription").value.trim(),
        skills: document.getElementById("projectSkills").value
            .split(",")
            .map(skill => skill.trim())
            .filter(Boolean)
            .slice(0, 15),
        deadline,
        client: document.getElementById("clientName").value.trim(),
        status: "Open",
        owner: "user"
    };

    if (!newProject.title || !newProject.client ||
        newProject.description.length < 15 ||
        newProject.skills.length === 0) {
        showFormMessage("postMessage", "Please complete all fields correctly.", "error");
        return;
    }

    projects.unshift(newProject);
    saveData(STORAGE_KEYS.projects, projects);

    form.reset();
    showFormMessage("postMessage", "Project published successfully!", "success");

    renderProjects();
    renderDashboard();
    showToast("Your project has been added.");

    document.getElementById("projects").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Submit a proposal.
document.getElementById("proposalForm").addEventListener("submit", event => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    const projectId = document.getElementById("proposalProjectId").value;
    const project = projects.find(item =>
        String(item.id) === String(projectId)
    );

    if (!project || project.status !== "Open") {
        showFormMessage("proposalMessage", "This project is no longer available.", "error");
        return;
    }

    const email = document.getElementById("freelancerEmail").value.trim();
    const budget = Number(document.getElementById("expectedBudget").value);
    const coverLetter = document.getElementById("proposalCover").value.trim();

    if (!Number.isFinite(budget) || budget <= 0 || budget > 10000000) {
        showFormMessage("proposalMessage", "Enter a valid expected budget.", "error");
        return;
    }

    if (coverLetter.length < 20) {
        showFormMessage("proposalMessage", "Please write at least 20 characters in your cover letter.", "error");
        return;
    }

    const newProposal = {
        id: "proposal-" + Date.now(),
        projectId: project.id,
        projectTitle: project.title,
        name: document.getElementById("freelancerName").value.trim(),
        email,
        coverLetter,
        budget,
        status: "Submitted",
        submittedAt: new Date().toISOString()
    };

    proposals.unshift(newProposal);
    saveData(STORAGE_KEYS.proposals, proposals);

    form.reset();
    closeProposalForm();

    renderDashboard();
    showToast("Your proposal has been submitted!");
});

// Show a message under a form.
function showFormMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = "form-message " + type;
}

// Search and filter event listeners.
document.getElementById("projectSearch")
    .addEventListener("input", renderProjects);

document.getElementById("categoryFilter")
    .addEventListener("change", renderProjects);

document.getElementById("budgetFilter")
    .addEventListener("change", renderProjects);

document.getElementById("freelancerSearch")
    .addEventListener("input", renderFreelancers);

document.getElementById("experienceFilter")
    .addEventListener("change", renderFreelancers);

// Category buttons also filter the project list.
document.querySelectorAll(".category-card").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById("categoryFilter").value =
            button.dataset.category;

        renderProjects();

        document.getElementById("projects").scrollIntoView({
            behavior: "smooth"
        });
    });
});

// Event delegation keeps the proposal buttons working after re-rendering.
projectList.addEventListener("click", event => {
    const button = event.target.closest(".apply-button");

    if (!button) return;

    openProposalForm(button.dataset.projectId);
});

// Close the proposal modal.
document.getElementById("closeModal")
    .addEventListener("click", closeProposalForm);

proposalModal.addEventListener("click", event => {
    if (event.target === proposalModal) {
        closeProposalForm();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !proposalModal.hidden) {
        closeProposalForm();
    }
});

// Mobile navigation.
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "×" : "☰";
});

navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});

// Initialize the page.
document.getElementById("currentYear").textContent =
    new Date().getFullYear();

document.getElementById("projectDeadline").min =
    new Date().toLocaleDateString("en-CA");

renderProjects();
renderFreelancers();
renderDashboard();
