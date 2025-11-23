// js/app.js (Main Orchestrator)
import { router } from './router.js';
import { state } from './modules/state.js';
import * as api from './modules/api.js';
import * as ui from './modules/ui.js';
import * as handlers from './modules/eventHandlers.js';
import * as modals from './modules/modals.js';
import { checkAndAddSampleData } from './modules/sampleData.js';

// ==================== Initialization ====================

document.addEventListener('DOMContentLoaded', async () => {
    // Initial router call
    router();
    
    // Background data loading
    try {
        await checkAndAddSampleData();
        await handlers.loadAllData(); // Loads customers, products, bookings etc.
        
        // This function might need adaptation since UI is now rendered dynamically
        // But we can keep global state up to date
    } catch (e) {
        console.error("Initialization error:", e);
    }
});

// We need to expose some global helpers or attach events globally
// because the router re-renders HTML.
// However, in AbstractView.executeScript(), we re-attach listeners.

// Expose necessary functions for legacy support if needed
window.app = {
    updateDashboard: ui.updateDashboard,
    state: state
};

// ==================== Legacy Global Event Listeners ====================
// Some existing modules might expect global listeners.
// We should check if we can migrate them or if they are still needed.

// Most event listeners in the original app.js were attached to #formCustomer etc.
// These forms now exist only when their specific View is rendered.
// So the `initializeEventListeners` from original `app.js` is NOT called here.
// Instead, each View (like Customers.js) should attach its own listeners in `executeScript()`.

// However, modal logic in `js/modules/modals.js` and `ui.js` might need tweaks
// if they rely on elements being present at load time.

// Let's create a global listener for Modals which might be injected into the DOM
// by the Views. But wait, the Views inject the Modal HTML too?
// No, looking at index.html (original), modals were at the bottom.
// In the new Router, we should probably include Modals in the Layout or in specific Views.

// For now, let's assume Views include their own Modals or we add them to Layout.
// Looking at my View implementations (e.g. Customers.js), I did NOT include the Modal HTML.
// I need to fix that. The Modal HTML was removed from index.html but not added to Views.

// Strategy:
// 1. Move Modal HTMLs to components or include them in the respective Views.
// 2. Or create a "SharedModals" component and render it in the Layout.

// Let's check where the Modals are used.
// Customer Modal -> Customers View
// Product Modal -> Products View
// Booking Modal -> Bookings View
// Todo Modal -> Dashboard View

// I should update the Views to include their Modals.
