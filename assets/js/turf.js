/* ==========================================================================
   Cut Turf — split the current list into walk packets (turfs) for canvassing.
   Reads the same filtered list as My List (assets/js/currentlist.js). Turf by
   Poll, City, or equal-size packets. Database-side aware.
   All people are fictional — see assets/data/training-data.js.
   ========================================================================== */
(function () {
    "use strict";

    var SIDES = window.TRAINING_DB_SIDES || {};
    var bySel = document.getElementById("turf-by");
    var sizeUnit = document.getElementById("turf-size-unit");
    var sizeInput = document.getElementById("turf-size");
    var gridEl = document.getElementById("turf-grid");
    var banner = document.getElementById("db-side-banner");
    var scope = document.getElementById("turf-scope");
    if (!bySel) return;

    function side() { return window.LLTraining ? window.LLTraining.getSide() : "voterfile"; }
    function listFor(s) { return window.LLList ? window.LLList.getList(s) : (window.TRAINING_VOTERFILE || []); }
    function esc(v) {
        return (v === undefined || v === null ? "" : String(v))
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function fullName(name) {
        var parts = (name || "").split(","); return ((parts[1] || "").trim() + " " + (parts[0] || "").trim()).trim();
    }

    // Build turfs: returns [{ name, people:[] }]
    function buildTurfs(people, mode) {
        if (mode === "size") {
            var n = Math.max(1, parseInt(sizeInput.value, 10) || 3);
            var turfs = [];
            for (var i = 0; i < people.length; i += n) {
                turfs.push({ name: "Packet " + (turfs.length + 1), people: people.slice(i, i + n) });
            }
            return turfs;
        }
        // group by a field (poll or city)
        var keyFn = mode === "poll"
            ? function (p) { return p.poll ? "Poll " + p.poll : "No Poll"; }
            : function (p) { return p.city || "Unknown City"; };
        var groups = {}, order = [];
        people.forEach(function (p) {
            var k = keyFn(p);
            if (!groups[k]) { groups[k] = []; order.push(k); }
            groups[k].push(p);
        });
        order.sort();
        return order.map(function (k) { return { name: k, people: groups[k] }; });
    }

    function doorsIn(turf) {
        // a "door" = a unique address
        var set = {};
        turf.people.forEach(function (p) { set[(p.address + "|" + p.zip).toLowerCase()] = 1; });
        return Object.keys(set).length;
    }

    function render() {
        var s = side();
        var people = listFor(s);
        var turfs = buildTurfs(people, bySel.value);

        if (!people.length) {
            gridEl.innerHTML = '<p class="muted-note">There is no one in the current list to cut into turf.</p>';
            return;
        }
        gridEl.innerHTML = turfs.map(function (t, i) {
            var hue = (i * 47) % 360;
            var sample = t.people.slice(0, 5).map(function (p) {
                return "<li><span>" + esc(fullName(p.name)) + '</span><span class="turf-addr">'
                    + esc(p.address) + "</span></li>";
            }).join("");
            var more = t.people.length > 5 ? '<li class="muted-note">+ ' + (t.people.length - 5) + " more…</li>" : "";
            return '<div class="turf-card">'
                + '<div class="turf-card-head" style="border-left-color:hsl(' + hue + ',55%,55%)">'
                + "<strong>" + esc(t.name) + "</strong>"
                + '<span class="turf-meta">' + t.people.length + " people · " + doorsIn(t) + " doors</span></div>"
                + '<ul class="turf-people">' + sample + more + "</ul>"
                + '<div class="turf-card-foot"><button class="btn btn-sm" data-turf="' + esc(t.name)
                + '">Assign / Print Packet</button></div></div>';
        }).join("");
    }

    function renderBannerAndScope() {
        var s = side(), info = SIDES[s] || {};
        banner.className = "db-side-banner " + (s === "shared" ? "shared" : "voterfile");
        banner.innerHTML = "<strong>" + (info.name || "Voter File") + "</strong> &mdash; cutting your current list into turf.";
        var n = listFor(s).length, filtered = window.LLList && window.LLList.isFiltered(s);
        scope.innerHTML = "Cutting <strong>" + n + "</strong> " + (n === 1 ? "person" : "people")
            + (filtered ? " from your saved search." : " (full list).") + " into walk packets.";
    }

    function syncSizeVisibility() { sizeUnit.style.display = bySel.value === "size" ? "" : "none"; }

    function rebuild() { syncSizeVisibility(); renderBannerAndScope(); render(); }

    bySel.addEventListener("change", rebuild);
    document.getElementById("turf-cut").addEventListener("click", render);
    sizeInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); render(); } });
    gridEl.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-turf]");
        if (!btn) return;
        alert(btn.getAttribute("data-turf") + "\n\nThis would assign the turf to a canvasser or print a walk "
            + "packet / send it to MiniVAN. (Training mock — no data is changed.)");
    });
    if (window.LLTraining) window.LLTraining.onSideChange(rebuild);

    rebuild();
})();
