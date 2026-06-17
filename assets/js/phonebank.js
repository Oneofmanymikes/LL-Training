/* ==========================================================================
   Virtual Phone Bank — work the current list one call at a time.
   Shows who you're calling, a script, a survey question with response buttons,
   and call-result dispositions; "Save & Next Call" advances. Reads the same
   filtered list as My List (assets/js/currentlist.js). Database-side aware.
   All people are fictional — see assets/data/training-data.js.
   ========================================================================== */
(function () {
    "use strict";

    var SIDES = window.TRAINING_DB_SIDES || {};
    var SURVEY = window.TRAINING_SURVEY_QUESTIONS || {};
    var banner = document.getElementById("db-side-banner");
    var grid = document.getElementById("vpb-grid");
    var done = document.getElementById("vpb-done");
    if (!grid) return;

    var DISPOSITIONS = ["Canvassed", "Not Home", "Refused", "Call Back", "Wrong Number", "Disconnected", "Do Not Call"];

    var list = [], idx = 0, results = [], answeredThis = false;

    function side() { return window.LLTraining ? window.LLTraining.getSide() : "voterfile"; }
    function listFor(s) { return window.LLList ? window.LLList.getList(s) : (window.TRAINING_VOTERFILE || []); }
    function esc(v) {
        return (v === undefined || v === null ? "" : String(v))
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function firstName(name) { return ((name || "").split(",")[1] || "").trim() || "there"; }
    function fullName(name) {
        var parts = (name || "").split(","); return ((parts[1] || "").trim() + " " + (parts[0] || "").trim()).trim();
    }
    function profileHref(p, s) {
        var id = s === "shared" ? p.contactId : p.vanId;
        return "contactdetails.html?side=" + encodeURIComponent(s) + "&id=" + encodeURIComponent(id);
    }

    function defaultQuestion(s) {
        // Affiliation ID is the usual phone-bank question.
        if (SURVEY["2025 Affiliation: ID by Volunteer"]) return "2025 Affiliation: ID by Volunteer";
        return Object.keys(SURVEY)[0] || "";
    }

    function renderQuestionOptions() {
        var sel = document.getElementById("vpb-question");
        sel.innerHTML = Object.keys(SURVEY).map(function (q) {
            return '<option value="' + esc(q) + '">' + esc(q) + "</option>";
        }).join("");
        sel.value = defaultQuestion(side());
    }

    function renderResponses() {
        var q = document.getElementById("vpb-question").value;
        var box = document.getElementById("vpb-responses");
        var opts = SURVEY[q] || [];
        box.innerHTML = opts.map(function (r) {
            return '<button class="vpb-resp" data-resp="' + esc(r) + '">' + esc(r) + "</button>";
        }).join("");
    }

    function renderDispositions() {
        document.getElementById("vpb-dispositions").innerHTML = DISPOSITIONS.map(function (d) {
            return '<button class="vpb-disp" data-disp="' + esc(d) + '">' + esc(d) + "</button>";
        }).join("");
    }

    function renderTally() {
        var counts = {};
        results.forEach(function (r) { counts[r.disposition] = (counts[r.disposition] || 0) + 1; });
        var keys = Object.keys(counts);
        var el = document.getElementById("vpb-tally");
        el.innerHTML = keys.length
            ? keys.map(function (k) { return "<li><span>" + esc(k) + "</span><strong>" + counts[k] + "</strong></li>"; }).join("")
            : '<li class="muted-note">No calls completed yet.</li>';
    }

    function script(p, s) {
        var info = SIDES[s] || {};
        return "<p>“Hi, may I speak with <strong>" + esc(firstName(p.name)) + "</strong>?”</p>"
            + "<p>“Hi " + esc(firstName(p.name)) + ", my name is <em>[your name]</em> and I'm a volunteer with the "
            + "Ontario Liberal Party here in <strong>098 Sample District</strong>. We're reaching out to voters "
            + "ahead of the election — do you have a quick minute?”</p>"
            + "<p>“Can I ask — if the election were held today, how likely are you to support the Liberal candidate?”</p>"
            + '<p class="muted-note">Record their answer using the buttons on the right, then choose a result of call '
            + "and press <strong>Save &amp; Next Call</strong>.</p>";
    }

    function renderCall() {
        var s = side();
        var p = list[idx];
        if (!p) return;
        answeredThis = false;

        document.getElementById("vpb-name").textContent = fullName(p.name);
        document.getElementById("vpb-phone").innerHTML = p.phone ? esc(p.phone) : "No phone on file";
        document.getElementById("vpb-address").innerHTML = esc(p.address) + ", " + esc(p.city) + " " + esc(p.zip);
        document.getElementById("vpb-record-link").href = profileHref(p, s);
        document.getElementById("vpb-script").innerHTML = script(p, s);

        renderResponses();
        // clear any selected states
        grid.querySelectorAll(".vpb-resp.active, .vpb-disp.active").forEach(function (b) { b.classList.remove("active"); });

        var total = list.length;
        document.getElementById("vpb-progress").textContent = "Call " + (idx + 1) + " of " + total;
        document.getElementById("vpb-bar").style.width = Math.round((idx) / total * 100) + "%";
        renderTally();
    }

    function record(disposition) {
        var p = list[idx];
        var q = document.getElementById("vpb-question").value;
        var respBtn = grid.querySelector(".vpb-resp.active");
        results.push({
            id: side() === "shared" ? p.contactId : p.vanId,
            name: p.name, question: q,
            response: respBtn ? respBtn.getAttribute("data-resp") : null,
            disposition: disposition
        });
    }

    function next(disposition) {
        record(disposition);
        idx++;
        if (idx >= list.length) return finish();
        renderCall();
    }

    function finish() {
        grid.hidden = true;
        document.querySelector(".vpb-progress").hidden = true;
        document.getElementById("vpb-progress").hidden = true;
        document.getElementById("vpb-bar").style.width = "100%";
        var canvassed = results.filter(function (r) { return r.response; }).length;
        document.getElementById("vpb-done-text").textContent =
            "You worked through " + results.length + " calls and recorded "
            + canvassed + " survey responses. (Training mock — nothing was saved.)";
        done.hidden = false;
    }

    function renderBanner() {
        var s = side(), info = SIDES[s] || {};
        banner.className = "db-side-banner " + (s === "shared" ? "shared" : "voterfile");
        banner.innerHTML = "<strong>" + (info.name || "Voter File") + "</strong> &mdash; calling your current list of "
            + "<strong>" + list.length + "</strong> " + (list.length === 1 ? "person" : "people") + ".";
    }

    function start() {
        list = listFor(side());
        idx = 0; results = [];
        done.hidden = true;
        grid.hidden = false;
        document.querySelector(".vpb-progress").hidden = false;
        document.getElementById("vpb-progress").hidden = false;
        renderBanner();
        renderQuestionOptions();
        renderDispositions();
        if (!list.length) {
            grid.hidden = true;
            document.getElementById("vpb-done-text").textContent = "There is no one in the current list to call.";
            done.hidden = false;
            document.querySelector(".vpb-progress").hidden = true;
            return;
        }
        renderCall();
    }

    // events
    document.getElementById("vpb-question").addEventListener("change", renderResponses);
    grid.addEventListener("click", function (e) {
        var resp = e.target.closest(".vpb-resp");
        if (resp) {
            grid.querySelectorAll(".vpb-resp").forEach(function (b) { b.classList.toggle("active", b === resp); });
            answeredThis = true;
            return;
        }
        var disp = e.target.closest(".vpb-disp");
        if (disp) {
            // require a survey response only for a real conversation
            next(disp.getAttribute("data-disp"));
        }
    });
    document.getElementById("vpb-restart").addEventListener("click", start);
    if (window.LLTraining) window.LLTraining.onSideChange(start);

    start();
})();
