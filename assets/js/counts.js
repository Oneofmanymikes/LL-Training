/* ==========================================================================
   Counts and Crosstabs — pivot the current list by one or two dimensions.
   Reads the same filtered list as My List (assets/js/currentlist.js), so the
   counts reflect whatever search is loaded. Database-side aware.
   All people are fictional — see assets/data/training-data.js.
   ========================================================================== */
(function () {
    "use strict";

    var SIDES = window.TRAINING_DB_SIDES || {};
    var rowSel = document.getElementById("cx-row");
    var colSel = document.getElementById("cx-col");
    var head = document.getElementById("cx-head");
    var body = document.getElementById("cx-body");
    var banner = document.getElementById("db-side-banner");
    var scope = document.getElementById("cx-scope");
    if (!rowSel) return;

    function side() { return window.LLTraining ? window.LLTraining.getSide() : "voterfile"; }
    function listFor(s) { return window.LLList ? window.LLList.getList(s) : (window.TRAINING_VOTERFILE || []); }
    function fmt(n) { return n.toLocaleString("en-CA"); }

    function ageBucket(a) {
        if (!a) return "Unknown";
        if (a < 30) return "18–29"; if (a < 45) return "30–44";
        if (a < 65) return "45–64"; return "65+";
    }
    function latestSign(p) {
        var h = p.survey && p.survey["2026 Action: BE - Sign Request"];
        return (Array.isArray(h) && h.length) ? h[h.length - 1].response : "(No sign activity)";
    }

    // Dimensions per side. valueOf returns a string, or an array for multi-value
    // fields (e.g. a contact can hold several Contact Types).
    var DIMS = {
        voterfile: [
            { key: "aff", label: "Affiliation (2025)", val: function (p) { return (p.survey || {})["2025 Affiliation: ID by Volunteer"] || "(No response)"; } },
            { key: "vol", label: "Volunteer Status", val: function (p) { return (p.survey || {})["2029 Volunteer: Volunteer Status"] || "(No response)"; } },
            { key: "sign", label: "Latest Sign Status", val: latestSign },
            { key: "city", label: "City", val: function (p) { return p.city || "(Unknown)"; } },
            { key: "age", label: "Age Range", val: function (p) { return ageBucket(p.age); } },
            { key: "poll", label: "Poll", val: function (p) { return p.poll || "(None)"; } }
        ],
        shared: [
            { key: "type", label: "Contact Type", val: function (p) { return (p.contactTypes && p.contactTypes.length) ? p.contactTypes : ["(None)"]; } },
            { key: "vol", label: "Volunteer Status", val: function (p) { return p.volunteerStatus || "(None)"; } },
            { key: "mem", label: "Membership", val: function (p) { return p.membership || "(None)"; } },
            { key: "city", label: "City", val: function (p) { return p.city || "(Unknown)"; } },
            { key: "donor", label: "Donor", val: function (p) { return p.lastDonation ? "Donor" : "Non-donor"; } }
        ]
    };

    function dimsFor(s) { return DIMS[s] || DIMS.voterfile; }
    function findDim(s, key) {
        return dimsFor(s).filter(function (d) { return d.key === key; })[0] || null;
    }
    function asArray(v) { return Array.isArray(v) ? v : [v]; }

    function fillSelects() {
        var dims = dimsFor(side());
        rowSel.innerHTML = dims.map(function (d) { return '<option value="' + d.key + '">' + d.label + "</option>"; }).join("");
        colSel.innerHTML = '<option value="">— None (simple count) —</option>'
            + dims.map(function (d) { return '<option value="' + d.key + '">' + d.label + "</option>"; }).join("");
        rowSel.selectedIndex = 0;
    }

    function run() {
        var s = side();
        var people = listFor(s);
        var rowDim = findDim(s, rowSel.value) || dimsFor(s)[0];
        var colDim = colSel.value ? findDim(s, colSel.value) : null;

        // collect row + column keys and the count matrix
        var rowKeys = [], colKeys = [], matrix = {}, rowTot = {}, colTot = {}, grand = 0;
        function addCol(c) { if (colKeys.indexOf(c) === -1) colKeys.push(c); }

        people.forEach(function (p) {
            var rVals = asArray(rowDim.val(p));
            var cVals = colDim ? asArray(colDim.val(p)) : ["Count"];
            rVals.forEach(function (r) {
                if (rowKeys.indexOf(r) === -1) { rowKeys.push(r); matrix[r] = {}; rowTot[r] = 0; }
                cVals.forEach(function (c) {
                    addCol(c);
                    matrix[r][c] = (matrix[r][c] || 0) + 1;
                    rowTot[r]++; colTot[c] = (colTot[c] || 0) + 1; grand++;
                });
            });
        });

        rowKeys.sort(); colKeys.sort();

        // header
        head.innerHTML = "<tr><th>" + rowDim.label + "</th>"
            + colKeys.map(function (c) { return "<th>" + c + "</th>"; }).join("")
            + '<th class="cx-total">Total</th></tr>';

        if (!rowKeys.length) {
            body.innerHTML = '<tr class="no-results-row"><td colspan="' + (colKeys.length + 2)
                + '">No people in the current list.</td></tr>';
            return;
        }

        body.innerHTML = rowKeys.map(function (r) {
            return "<tr><td><strong>" + r + "</strong></td>"
                + colKeys.map(function (c) {
                    var n = (matrix[r] && matrix[r][c]) || 0;
                    return "<td>" + (n ? fmt(n) : '<span class="muted-note">0</span>') + "</td>";
                }).join("")
                + '<td class="cx-total">' + fmt(rowTot[r]) + "</td></tr>";
        }).join("")
            + '<tr class="cx-total-row"><td><strong>Total</strong></td>'
            + colKeys.map(function (c) { return "<td>" + fmt(colTot[c] || 0) + "</td>"; }).join("")
            + '<td class="cx-total">' + fmt(grand) + "</td></tr>";
    }

    function renderBannerAndScope() {
        var s = side(), info = SIDES[s] || {};
        banner.className = "db-side-banner " + (s === "shared" ? "shared" : "voterfile");
        banner.innerHTML = "<strong>" + (info.name || "Voter File") + "</strong> &mdash; analyzing your current list.";
        var n = listFor(s).length;
        var filtered = window.LLList && window.LLList.isFiltered(s);
        scope.innerHTML = "Analyzing <strong>" + fmt(n) + "</strong> "
            + (n === 1 ? "person" : "people") + (filtered ? " from your saved search." : " (full list).");
    }

    function rebuild() { fillSelects(); renderBannerAndScope(); run(); }

    document.getElementById("cx-run").addEventListener("click", run);
    rowSel.addEventListener("change", run);
    colSel.addEventListener("change", run);
    if (window.LLTraining) window.LLTraining.onSideChange(rebuild);

    rebuild();
})();
