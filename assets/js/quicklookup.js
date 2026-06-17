/* ==========================================================================
   Quick Look Up — interactions (database-side aware)
   Searches whichever side of the database is active: the Voter File
   ("My Voters") or Shared Contacts. Columns and data switch with the tab.
   All people are fictional — see assets/data/training-data.js.
   ========================================================================== */
(function () {
    "use strict";

    var body = document.getElementById("qlu-body");
    var head = document.getElementById("qlu-head");
    var foot = document.getElementById("qlu-foot");
    var banner = document.getElementById("db-side-banner");
    if (!body || !head) return;

    var SIDES = window.TRAINING_DB_SIDES || {};

    // Column definitions per side: key = field on the record, label = header.
    var COLUMNS = {
        voterfile: [
            { key: "name", label: "Name", link: true },
            { key: "address", label: "Address" },
            { key: "city", label: "City" },
            { key: "zip", label: "Postal Code" },
            { key: "age", label: "Age" },
            { key: "phone", label: "Phone" },
            { key: "province", label: "Province" },
            { key: "email", label: "Email" },
            { key: "poll", label: "Old Polling Division" },
            { key: "seq", label: "Election Sequence ID" }
        ],
        shared: [
            { key: "name", label: "Name", link: true },
            { key: "address", label: "Address" },
            { key: "city", label: "City" },
            { key: "zip", label: "Postal Code" },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
            { key: "contactTypes", label: "Contact Types" },
            { key: "membership", label: "Membership" },
            { key: "lastDonation", label: "Last Donation" }
        ]
    };

    function dataFor(side) {
        return (side === "shared" ? window.TRAINING_SHARED : window.TRAINING_VOTERFILE) || [];
    }

    // Render a single cell value (handles arrays + the donation object).
    function cell(p, key) {
        var v = p[key];
        if (key === "contactTypes") return (v || []).join(", ");
        if (key === "lastDonation") return v ? (v.amount + " · " + v.date) : "";
        return (v === undefined || v === null) ? "" : v;
    }

    var sortKey = null, sortAsc = true;

    function val(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim().toLowerCase() : "";
    }
    function lastFirst(name) {
        var parts = (name || "").split(",");
        return { last: (parts[0] || "").trim().toLowerCase(),
                 first: (parts[1] || "").trim().toLowerCase() };
    }

    function matches(p) {
        var last = val("f-last"), first = val("f-first");
        var city = val("f-city"), zip = val("f-zip").replace(/\s+/g, "");
        var street = val("f-street"), email = val("f-email"), phone = val("f-phone").replace(/\D/g, "");
        var n = lastFirst(p.name);
        if (last && n.last.indexOf(last) !== 0) return false;
        if (first && n.first.indexOf(first) !== 0) return false;
        if (city && (p.city || "").toLowerCase().indexOf(city) === -1) return false;
        if (zip && (p.zip || "").toLowerCase().replace(/\s+/g, "").indexOf(zip) === -1) return false;
        if (street && (p.address || "").toLowerCase().indexOf(street) === -1) return false;
        if (email && (p.email || "").toLowerCase().indexOf(email) === -1) return false;
        if (phone && (p.phone || "").replace(/\D/g, "").indexOf(phone) === -1) return false;
        return true;
    }

    function renderHead(cols) {
        var tr = "<tr>";
        cols.forEach(function (c) { tr += '<th data-sort="' + c.key + '">' + c.label + "</th>"; });
        head.innerHTML = tr + "</tr>";
        head.querySelectorAll("th[data-sort]").forEach(function (th) {
            th.addEventListener("click", function () {
                var key = th.getAttribute("data-sort");
                if (sortKey === key) sortAsc = !sortAsc; else { sortKey = key; sortAsc = true; }
                run();
            });
        });
    }

    function renderRows(rows, cols) {
        body.innerHTML = "";
        if (!rows.length) {
            body.innerHTML = '<tr class="no-results-row"><td colspan="' + cols.length
                + '">No contacts match your search.</td></tr>';
            foot.textContent = "0 People";
            return;
        }
        rows.forEach(function (p) {
            var tr = document.createElement("tr");
            tr.innerHTML = cols.map(function (c) {
                var text = cell(p, c.key);
                if (c.link) return '<td><a href="#" onclick="return false">' + text + "</a></td>";
                return "<td>" + text + "</td>";
            }).join("");
            body.appendChild(tr);
        });
        foot.innerHTML = "<b>" + rows.length + (rows.length === 1 ? " Person" : " People") + " ·</b> 1 Page";
    }

    function run() {
        var side = window.LLTraining ? window.LLTraining.getSide() : "voterfile";
        var cols = COLUMNS[side] || COLUMNS.voterfile;
        var rows = dataFor(side).filter(matches);
        if (sortKey) {
            rows.sort(function (a, b) {
                var x = (cell(a, sortKey) + "").toLowerCase(), y = (cell(b, sortKey) + "").toLowerCase();
                if (sortKey === "age") { x = +a.age || 0; y = +b.age || 0; }
                return (x < y ? -1 : x > y ? 1 : 0) * (sortAsc ? 1 : -1);
            });
        }
        renderRows(rows, cols);
    }

    function renderBanner() {
        if (!banner) return;
        var side = window.LLTraining ? window.LLTraining.getSide() : "voterfile";
        var info = SIDES[side] || {};
        banner.className = "db-side-banner " + (side === "shared" ? "shared" : "voterfile");
        banner.innerHTML = "<strong>" + (info.name || "Voter File") + "</strong> &mdash; "
            + (info.description || "") + (info.editable ? "" : " <em>(read-only elector data)</em>");
    }

    function rebuild() {
        var side = window.LLTraining ? window.LLTraining.getSide() : "voterfile";
        renderHead(COLUMNS[side] || COLUMNS.voterfile);
        renderBanner();
        run();
    }

    // Buttons
    document.getElementById("qlu-search").addEventListener("click", run);
    document.getElementById("qlu-clear").addEventListener("click", function () {
        document.querySelectorAll(".panel-filter input[type=text]").forEach(function (i) { i.value = ""; });
        document.getElementById("f-addrtype").value = "0";
        sortKey = null;
        run();
    });
    document.getElementById("qlu-remember").addEventListener("click", function () {
        alert("Remember Filters\n\nIn Liberalist this saves your current search criteria so they're "
            + "pre-filled next time you open Quick Look Up. (Training mock — nothing is stored.)");
    });
    document.querySelectorAll(".panel-filter input").forEach(function (i) {
        i.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); run(); } });
    });

    // Re-render columns + data whenever the database side (tab) changes.
    if (window.LLTraining) window.LLTraining.onSideChange(function () { sortKey = null; rebuild(); });

    rebuild();
})();
