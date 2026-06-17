/* ==========================================================================
   My List — the result view after running a search / loading a list.
   Shows the current list with stats, an action toolbar, an expandable search
   description, an in-list filter, and a results grid. Database-side aware.
   All people are fictional — see assets/data/training-data.js.
   ========================================================================== */
(function () {
    "use strict";

    var head = document.getElementById("ml-head");
    var body = document.getElementById("ml-body");
    var foot = document.getElementById("ml-foot");
    var statBoard = document.getElementById("stat-board");
    var banner = document.getElementById("db-side-banner");
    if (!head || !body) return;

    var SIDES = window.TRAINING_DB_SIDES || {};

    var COLUMNS = {
        voterfile: [
            { key: "vanId", label: "Voter File VANID" },
            { key: "name", label: "Name", link: true },
            { key: "address", label: "Address" },
            { key: "zip", label: "Postal Code" },
            { key: "phone", label: "Phone" },
            { key: "poll", label: "Poll" }
        ],
        shared: [
            { key: "name", label: "Name", link: true },
            { key: "address", label: "Address" },
            { key: "city", label: "City" },
            { key: "zip", label: "Postal Code" },
            { key: "phone", label: "Phone" },
            { key: "contactTypes", label: "Contact Types" },
            { key: "membership", label: "Membership" }
        ]
    };

    function side() { return window.LLTraining ? window.LLTraining.getSide() : "voterfile"; }
    function dataFor(s) { return (s === "shared" ? window.TRAINING_SHARED : window.TRAINING_VOTERFILE) || []; }
    // The list this view shows = the saved search result (if one applies to this
    // side), otherwise the full file. Shared via assets/js/currentlist.js.
    function baseList(s) { return window.LLList ? window.LLList.getList(s) : dataFor(s); }
    function fmt(n) { return n.toLocaleString("en-CA"); }
    function profileHref(p, s) {
        var id = s === "shared" ? p.contactId : p.vanId;
        return "contactdetails.html?side=" + encodeURIComponent(s) + "&id=" + encodeURIComponent(id);
    }

    function cell(p, key) {
        var v = p[key];
        if (key === "contactTypes") return (v || []).join(", ");
        return (v === undefined || v === null) ? "" : v;
    }
    function lastFirst(name) {
        var parts = (name || "").split(",");
        return { last: (parts[0] || "").trim().toLowerCase(), first: (parts[1] || "").trim().toLowerCase() };
    }

    function filtered() {
        var last = (document.getElementById("ml-last").value || "").trim().toLowerCase();
        var first = (document.getElementById("ml-first").value || "").trim().toLowerCase();
        return baseList(side()).filter(function (p) {
            var n = lastFirst(p.name);
            if (last && n.last.indexOf(last) !== 0) return false;
            if (first && n.first.indexOf(first) !== 0) return false;
            return true;
        });
    }

    function renderStats(rows) {
        var withPhone = rows.filter(function (p) { return p.phone; }).length;
        var doors = new Set(rows.map(function (p) { return (p.address + "|" + p.zip).toLowerCase(); })).size;
        var stats = [
            { n: rows.length, label: rows.length === 1 ? "Person" : "People" },
            { n: withPhone, label: "Total Phones" },
            { n: withPhone, label: "Best Phones" },
            { n: doors, label: "Doors" },
            { n: rows.length, label: "Mailboxes" }
        ];
        statBoard.innerHTML = stats.map(function (s) {
            return '<li class="stat-item"><div class="stat-data">' + fmt(s.n)
                + '</div><div class="stat-title">' + s.label + "</div></li>";
        }).join("");
    }

    function renderHead(cols) {
        head.innerHTML = "<tr>" + cols.map(function (c) {
            return '<th>' + c.label + "</th>";
        }).join("") + "</tr>";
    }

    function renderRows(rows, cols) {
        if (!rows.length) {
            body.innerHTML = '<tr class="no-results-row"><td colspan="' + cols.length
                + '">No people in this list match your filter.</td></tr>';
            foot.textContent = "0 People";
            return;
        }
        var s = side();
        body.innerHTML = rows.map(function (p) {
            return "<tr>" + cols.map(function (c) {
                var text = cell(p, c.key);
                return c.link ? '<td><a href="' + profileHref(p, s) + '">' + text + "</a></td>"
                              : "<td>" + text + "</td>";
            }).join("") + "</tr>";
        }).join("");
        foot.innerHTML = "<b>" + fmt(rows.length) + (rows.length === 1 ? " Person" : " People") + " ·</b> 1 Page";
    }

    function renderBanner() {
        if (!banner) return;
        var info = SIDES[side()] || {};
        banner.className = "db-side-banner " + (side() === "shared" ? "shared" : "voterfile");
        banner.innerHTML = "<strong>" + (info.name || "Voter File") + "</strong> &mdash; this list is loaded from "
            + (side() === "shared" ? "the committee's editable contacts." : "the voter file.");
    }

    function renderDescription() {
        var body = document.getElementById("desc-body");
        if (!body) return;
        var lines = window.LLList ? window.LLList.describe(side()) : [];
        if (!lines.length) {
            body.innerHTML = "<strong>Step 1 — New Search</strong>"
                + '<dl class="indented"><dt>All records</dt>'
                + "<dd>No criteria applied — showing the full "
                + (side() === "shared" ? "Shared Contacts list." : "voter file.") + "</dd></dl>";
            return;
        }
        body.innerHTML = "<strong>Step 1 — New Search</strong>" + lines.map(function (l) {
            return '<dl class="indented"><dt>' + l.label + "</dt>"
                + '<dd><span class="rd-blue">' + l.label + '</span> = <span class="rd-red">'
                + l.value + "</span></dd></dl>";
        }).join("");
    }

    function rebuild() {
        var cols = COLUMNS[side()] || COLUMNS.voterfile;
        var rows = filtered();
        renderHead(cols);
        renderRows(rows, cols);
        renderStats(rows);
        renderBanner();
        renderDescription();
    }

    // Expandable description
    var descBar = document.getElementById("desc-bar");
    var descBody = document.getElementById("desc-body");
    if (descBar) descBar.addEventListener("click", function () {
        descBody.hidden = !descBody.hidden;
        descBar.querySelector(".ps-chevron").style.transform = descBody.hidden ? "" : "rotate(90deg)";
    });

    // Filter buttons
    document.getElementById("ml-refresh").addEventListener("click", rebuild);
    document.getElementById("ml-remember").addEventListener("click", function () {
        alert("Remember Filters\n\nSaves your in-list filter so it's pre-filled next time. "
            + "(Training mock — nothing is stored.)");
    });
    document.querySelectorAll(".mylist-desc, .panel-filter input").forEach(function (i) {
        if (i.tagName === "INPUT") i.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); rebuild(); }
        });
    });

    // Header buttons
    document.getElementById("edit-search").addEventListener("click", function () {
        location.href = "createalist.html";
    });
    document.getElementById("load-list").addEventListener("click", function () {
        alert("Load List\n\nOpens My Folders to load a different Saved List or Saved Search. "
            + "(Training mock.)");
    });
    document.getElementById("save-list-as").addEventListener("click", function () {
        alert("Save List As\n\nSaves the current list as a Saved List or Saved Search so you can reuse it. "
            + "(Training mock.)");
    });

    // Action toolbar — explain what each tool does
    var TOOL_HELP = {
        "Print": "Create a printed walk/call sheet or report from this list.",
        "Labels": "Generate mailing labels for everyone on this list.",
        "Calls": "Set up a phone-calling campaign (Virtual Phone Bank) from this list.",
        "Export": "Prepare an export file (CSV/Excel) of this list.",
        "MiniVAN": "Send this list to canvassers' phones via the MiniVAN app.",
        "Counts": "Open this list in Counts and Crosstabs for analysis.",
        "Reports": "Send this list to Report Manager.",
        "Cut Turf": "Split this list into geographic turfs for door-knocking.",
        "Split": "Split this list into several smaller lists.",
        "Grid": "Open this list in Grid View to edit records in a spreadsheet.",
        "Form": "Open this list in Form View for data entry.",
        "Copy": "Copy these people into your Shared Contacts (My Campaign).",
        "Map": "Create a printable map of the addresses on this list.",
        "Messages": "Send a text-message (SMS) campaign to this list."
    };
    // Tools that open a real built-out training page (operate on this list).
    var TOOL_PAGE = { "Counts": "counts.html", "Calls": "phonebank.html", "Cut Turf": "turf.html" };
    document.getElementById("mylist-toolbar").addEventListener("click", function (e) {
        var btn = e.target.closest(".tool-btn");
        if (!btn) return;
        var tool = btn.getAttribute("data-tool");
        if (TOOL_PAGE[tool]) { location.href = TOOL_PAGE[tool]; return; }
        alert(tool + "\n\n" + (TOOL_HELP[tool] || "") + "\n\n(Training mock — no data is changed.)");
    });

    // Re-render when the database side (tab) changes
    if (window.LLTraining) window.LLTraining.onSideChange(rebuild);

    rebuild();
})();
