/* ==========================================================================
   Liberalist Training Mock — interactions
   Vanilla JS, no dependencies. Powers the chrome: sidebar, dropdowns,
   accordions, and the sidebar page search.
   ========================================================================== */
(function () {
    "use strict";

    var body = document.body;

    /* ---- Slide-out sidebar -------------------------------------------- */
    var toggleBtn = document.getElementById("sidebar-toggle-button");
    var overlay = document.getElementById("sidebarOverlay");

    function openSidebar()  { body.classList.add("sidebar-open"); }
    function closeSidebar() { body.classList.remove("sidebar-open"); }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", function () {
            body.classList.toggle("sidebar-open");
        });
    }
    if (overlay) overlay.addEventListener("click", closeSidebar);

    /* ---- Header dropdowns (notifications + user) ---------------------- */
    var toggles = document.querySelectorAll(".dropdown-toggle[data-toggle]");
    toggles.forEach(function (t) {
        t.addEventListener("click", function (e) {
            e.preventDefault();
            var menu = t.parentElement.querySelector(".dropdown-menu");
            var isOpen = menu.classList.contains("open");
            // close all first
            document.querySelectorAll(".dropdown-menu.open")
                .forEach(function (m) { m.classList.remove("open"); });
            if (!isOpen) menu.classList.add("open");
        });
    });
    // click outside closes any open header dropdown
    document.addEventListener("click", function (e) {
        if (!e.target.closest(".dropdown")) {
            document.querySelectorAll(".dropdown-menu.open")
                .forEach(function (m) { m.classList.remove("open"); });
        }
    });

    /* ---- Sidebar page-group collapse ---------------------------------- */
    document.querySelectorAll(".page-group-toggle").forEach(function (tog) {
        tog.addEventListener("click", function (e) {
            e.preventDefault();
            tog.parentElement.classList.toggle("collapsed");
        });
    });

    /* ---- Administrative Menu accordion -------------------------------- */
    document.querySelectorAll(".admin-accordion .acc-header").forEach(function (h) {
        h.addEventListener("click", function () {
            h.classList.toggle("open");
        });
    });

    /* ---- Sidebar page search (filter visible pages) ------------------- */
    var search = document.getElementById("sidebar-search-input");
    if (search) {
        search.addEventListener("input", function () {
            var q = search.value.trim().toLowerCase();
            document.querySelectorAll("#sidebarContent .page").forEach(function (page) {
                var name = page.textContent.toLowerCase();
                page.style.display = (!q || name.indexOf(q) !== -1) ? "" : "none";
            });
            // when searching, force all groups open so matches are visible
            document.querySelectorAll(".page-group").forEach(function (g) {
                if (q) g.classList.remove("collapsed");
            });
        });
    }
})();
