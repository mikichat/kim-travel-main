import Sidebar from './components/Sidebar.js';
import Header from './components/Header.js';

import Dashboard from './views/Dashboard.js';
import Schedules from './views/Schedules.js';
import Upload from './views/Upload.js';
import Bookings from './views/Bookings.js';
import Customers from './views/Customers.js';
import Products from './views/Products.js';
import Quote from './views/Quote.js';
import Notifications from './views/Notifications.js';

// Helper to convert regex match results to params
const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

export const router = async () => {
    console.log("Router execution started");
    const routes = [
        { path: "/", view: Dashboard },
        { path: "/dashboard", view: Dashboard },
        { path: "/schedules", view: Schedules },
        { path: "/upload", view: Upload },
        { path: "/bookings", view: Bookings },
        { path: "/customers", view: Customers },
        { path: "/products", view: Products },
        { path: "/quote", view: Quote },
        { path: "/notifications", view: Notifications }
    ];

    // Simple hash-based router
    // If hash is empty, default to #/
    let hash = location.hash.replace(/^#/, '');
    if (hash === '') hash = '/';

    console.log("Current hash:", hash);

    // Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: hash.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match) {
        match = {
            route: routes[0],
            result: [hash]
        };
    }

    const view = new match.route.view(getParams(match));

    // Render Layout if not already rendered
    const app = document.getElementById("app");

    // Check if layout skeleton exists
    if (!document.querySelector('.sidebar')) {
        app.innerHTML = `
            ${Sidebar()}
            <main class="main-content">
                ${Header()}
                <div class="content-wrapper" id="content-view"></div>
            </main>
        `;

        // Initialize Sidebar Events
        initSidebarEvents();
    }

    // Render View
    const contentView = document.getElementById("content-view");
    contentView.innerHTML = await view.getHtml();

    // Update Title
    const title = match.route.path.replace('/', '');
    document.getElementById('pageTitle').innerText = title ? (title.charAt(0).toUpperCase() + title.slice(1)) : 'Dashboard';

    // Highlight sidebar
    updateSidebar(hash);

    // Execute View Script
    await view.executeScript();
};

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

window.addEventListener("popstate", router);
window.addEventListener("hashchange", router);

function updateSidebar(hash) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        // Simple matching
        const href = item.getAttribute('href').replace('#', '');
        if (hash === '/' && href === '/dashboard') {
             item.classList.add('active');
        } else if (hash.includes(href) && href !== '/') {
            item.classList.add('active');
        }
    });
}

function initSidebarEvents() {
    // Sidebar Toggle
    const btnToggle = document.getElementById('btnToggleSidebar');
    if(btnToggle) {
        btnToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
}
