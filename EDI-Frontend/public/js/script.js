// Function to toggle the sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  sidebar.classList.toggle('collapsed');
  main.classList.toggle('full');
}

// Function to load page content dynamically
function loadPage(pageUrl) {
  fetch(pageUrl)
    .then(response => {
      if (!response.ok) throw new Error(`Network response was not ok for ${pageUrl}`);
      return response.text();
    })
    .then(html => {
      document.getElementById('content-area').innerHTML = html;
      // After loading content, check if the dark mode toggle is on the page
      initializeDarkModeToggle();
      initializeMapControls();
      initializeLayerToggles();
    })
    .catch(error => {
      console.error('Error loading page:', error);
      document.getElementById('content-area').innerHTML = `<div class="section"><p>Error: Could not load page content.</p></div>`;
    });
}

// Function to set up the dark mode toggle functionality
function initializeDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        // Set the toggle's initial state based on the current theme
        darkModeToggle.checked = document.body.classList.contains('dark-mode');

        // Add a listener to toggle the theme
        darkModeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            // Save the user's preference in localStorage
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.removeItem('theme');
            }
        });
    }
}

// Function to make map controls interactive
function initializeMapControls() {
    const zoomInBtn = document.getElementById('zoomIn');
    // If the controls aren't on the page, do nothing
    if (!zoomInBtn) {
        return;
    }

    const zoomOutBtn = document.getElementById('zoomOut');
    const resetViewBtn = document.getElementById('resetView');
    const myLocationBtn = document.getElementById('myLocation');
    const mapIcon = document.getElementById('map-icon');

    // If map icon is not found, we can't proceed
    if (!mapIcon) {
        return;
    }

    let currentZoom = 1;
    const zoomStep = 0.2;

    const applyZoom = () => {
        mapIcon.style.transform = `scale(${currentZoom})`;
    };

    zoomInBtn.addEventListener('click', () => {
        currentZoom += zoomStep;
        applyZoom();
    });

    zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > zoomStep * 2) { // Prevent scaling down too much
            currentZoom -= zoomStep;
            applyZoom();
        }
    });

    resetViewBtn.addEventListener('click', () => {
        currentZoom = 1;
        applyZoom();
    });

    myLocationBtn.addEventListener('click', () => {
        mapIcon.classList.add('pulse');
        setTimeout(() => mapIcon.classList.remove('pulse'), 500);
    });
}

// Function to link layer toggles to map tags
function initializeLayerToggles() {
    const layerToggles = document.querySelectorAll('.layer .switch input[data-layer]');
    
    // If no toggles, do nothing
    if (layerToggles.length === 0) {
        return;
    }

    const syncTagVisibility = (toggle) => {
        const layerName = toggle.dataset.layer;
        const targetTag = document.querySelector(`.tags .tag[data-tag="${layerName}"]`);
        if (targetTag) {
            if (toggle.checked) {
                targetTag.classList.remove('hidden');
            } else {
                targetTag.classList.add('hidden');
            }
        }
    };

    // Listeners for individual layer toggles
    layerToggles.forEach(toggle => {
        // Sync tag on initial page load
        syncTagVisibility(toggle);
        // Add listener for subsequent changes
        toggle.addEventListener('change', () => syncTagVisibility(toggle));
    });
}

// Main script execution after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Apply the saved theme on page load
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // --- Event Listeners ---

    // Sidebar toggle button
    document.getElementById('toggle-btn').addEventListener('click', toggleSidebar);

    // Sidebar navigation links (using event delegation)
    document.getElementById('sidebar').addEventListener('click', (e) => {
        // Find the closest 'a' tag to the click target
        const link = e.target.closest('a');
        if (link && link.dataset.page) {
            e.preventDefault(); // Prevent default link behavior
            loadPage(link.dataset.page);
        }
    });

    // Load the default page
    loadPage('map.html');
});