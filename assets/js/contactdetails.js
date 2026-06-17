/* ==========================================================================
   Contact Record (ContactsDetails) — the individual profile page.
   Reads one person from the training dataset (by ?id= and ?side=, defaulting
   to the active database side and the first record) and renders the contact
   summary header plus the collapsible page sections. Database-side aware.
   All people are fictional — see assets/data/training-data.js.
   ========================================================================== */
(function () {
    "use strict";

    var SIDES = window.TRAINING_DB_SIDES || {};

    /* ---- which side + which record ------------------------------------- */
    function qs(name) {
        var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
        return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
    }
    function side() {
        var s = qs("side");
        if (s === "voterfile" || s === "shared") return s;
        return window.LLTraining ? window.LLTraining.getSide() : "voterfile";
    }
    function dataFor(s) {
        return (s === "shared" ? window.TRAINING_SHARED : window.TRAINING_VOTERFILE) || [];
    }
    function idOf(p, s) { return s === "shared" ? p.contactId : p.vanId; }

    function currentList() { return dataFor(side()); }
    function currentIndex() {
        var list = currentList();
        var id = qs("id");
        if (id) {
            for (var i = 0; i < list.length; i++) {
                if (idOf(list[i], side()) === id) return i;
            }
        }
        return 0;
    }

    /* ---- small helpers ------------------------------------------------- */
    function esc(v) {
        return (v === undefined || v === null ? "" : String(v))
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function firstLast(name) {
        var parts = (name || "").split(",");
        var last = (parts[0] || "").trim(), first = (parts[1] || "").trim();
        return { first: first, last: last, display: (first + " " + last).trim() };
    }
    function initials(name) {
        var n = firstLast(name);
        return ((n.first[0] || "") + (n.last[0] || "")).toUpperCase() || "?";
    }
    function row(label, value) {
        return '<tr><td class="van-label">' + esc(label) + "</td><td>"
            + (value || '<span class="muted-note">—</span>') + "</td></tr>";
    }
    function emptyNote(text) { return '<p class="muted-note">' + esc(text) + "</p>"; }

    /* ====================================================================
       Renderers — each fills one section/box from the record `p`.
       ==================================================================== */

    function renderSummary(p, s) {
        var n = firstLast(p.name);
        document.getElementById("cs-avatar").textContent = initials(p.name);
        document.getElementById("cs-name").textContent = n.display;
        document.getElementById("cs-phone").innerHTML = p.phone ? esc(p.phone) : "No phone on file";
        document.getElementById("cs-address").innerHTML =
            esc(p.address) + ", " + esc(p.city) + " " + esc(p.zip);

        var tag = document.getElementById("cs-tag");
        var label = "";
        if (s === "shared") {
            label = (p.contactTypes && p.contactTypes.length) ? p.contactTypes.join(" · ") : "Shared Contact";
        } else {
            // a simple "tier" cue based on whether we have an affiliation ID
            var aff = p.survey && (p.survey["2025 Affiliation: ID by Volunteer"]
                || p.survey["2029 Affiliation: ID by Volunteer"]);
            label = aff ? ("ID: " + aff) : "Not yet ID'd";
        }
        tag.textContent = label;
        tag.hidden = false;

        var sideBox = document.getElementById("cs-side");
        var info = SIDES[s] || {};
        sideBox.textContent = info.name || (s === "shared" ? "Shared Contacts" : "Voter File");
        sideBox.className = "cs-side " + (s === "shared" ? "shared" : "voterfile");
    }

    function renderBanner(s) {
        var banner = document.getElementById("db-side-banner");
        var info = SIDES[s] || {};
        banner.className = "db-side-banner " + (s === "shared" ? "shared" : "voterfile");
        banner.innerHTML = "<strong>" + esc(info.name || "Voter File") + "</strong> &mdash; "
            + esc(info.description || "")
            + (info.editable ? "" : " <em>(core elector data is read-only)</em>");
    }

    function renderSurvey(p) {
        var box = document.getElementById("survey-body");
        var survey = p.survey || {};
        var keys = Object.keys(survey);
        if (!keys.length) { box.innerHTML = emptyNote("No survey responses recorded for this contact."); return; }

        var html = "";
        keys.forEach(function (q) {
            var val = survey[q];
            if (Array.isArray(val)) {
                // dated history (e.g. Sign Request)
                if (!val.length) {
                    html += '<div class="survey-q"><div class="survey-q-name">' + esc(q) + "</div>"
                        + emptyNote("No responses yet.") + "</div>";
                    return;
                }
                var rows = val.map(function (h) {
                    return "<tr><td>" + esc(h.date) + '</td><td><span class="rd-blue">'
                        + esc(h.response) + "</span></td></tr>";
                }).join("");
                html += '<div class="survey-q"><div class="survey-q-name">' + esc(q)
                    + ' <span class="survey-q-count">(' + val.length + " responses)</span></div>"
                    + '<table class="mini-table"><thead><tr><th>Date</th><th>Response</th></tr></thead>'
                    + "<tbody>" + rows + "</tbody></table></div>";
            } else {
                // single response
                html += '<div class="survey-q"><div class="survey-q-name">' + esc(q) + "</div>"
                    + '<div class="survey-q-resp"><span class="rd-red">' + esc(val) + "</span></div></div>";
            }
        });
        box.innerHTML = html;
    }

    function renderActivist(p, s) {
        var box = document.getElementById("activist-body");
        var codes = [];
        if (s === "shared") {
            (p.contactTypes || []).forEach(function (t) { codes.push({ name: t, scope: "098 Sample District" }); });
            if (p.membership) codes.push({ name: p.membership, scope: "098 Sample District" });
        }
        if (!codes.length) {
            box.innerHTML = emptyNote(s === "shared"
                ? "No activist codes applied to this contact."
                : "Activist codes are applied on the Shared Contacts side of the database.");
            return;
        }
        box.innerHTML = '<ul class="chip-list">' + codes.map(function (c) {
            return '<li class="chip">' + esc(c.name) + ' <span class="chip-scope">' + esc(c.scope) + "</span></li>";
        }).join("") + "</ul>";
    }

    function renderAddress(p) {
        document.getElementById("address-body").innerHTML =
            '<table class="cal-table"><tbody>'
            + row("Voting Address", esc(p.address) + "<br>" + esc(p.city) + ", ON " + esc(p.zip))
            + row("Mailing Address", '<span class="muted-note">Same as voting address</span>')
            + "</tbody></table>";
    }

    function renderPhones(p) {
        var box = document.getElementById("phones-body");
        if (!p.phone) { box.innerHTML = emptyNote("No phone numbers on file."); return; }
        box.innerHTML = '<table class="cal-table"><tbody>'
            + row("Phone", esc(p.phone) + ' <span class="muted-note">(Main)</span>')
            + "</tbody></table>";
    }

    function renderEmail(p) {
        var box = document.getElementById("email-body");
        if (!p.email) { box.innerHTML = emptyNote("No email address on file."); return; }
        box.innerHTML = '<table class="cal-table"><tbody>'
            + row("Email", '<a href="#" onclick="return false">' + esc(p.email) + "</a>")
            + "</tbody></table>";
    }

    function renderVoting(p, s) {
        var box = document.getElementById("voting-body");
        if (s === "shared") {
            box.innerHTML = emptyNote("Voting history lives on the Voter File side of the database.");
            return;
        }
        // a small, fictional voting history for training
        var hist = [
            { year: "2025 Provincial General", voted: "Voted" },
            { year: "2022 Provincial General", voted: (p.age && p.age >= 21) ? "Voted" : "Did Not Vote" },
            { year: "2021 Federal General", voted: "Voted" }
        ];
        box.innerHTML = '<table class="mini-table"><thead><tr><th>Election</th><th>Participation</th></tr></thead><tbody>'
            + hist.map(function (h) {
                var cls = h.voted === "Voted" ? "rd-blue" : "muted-note";
                return "<tr><td>" + esc(h.year) + '</td><td><span class="' + cls + '">' + esc(h.voted) + "</span></td></tr>";
            }).join("") + "</tbody></table>"
            + '<p class="muted-note">Participation only — the marked ballot is secret.</p>';
    }

    function renderVitals(p, s) {
        var box = document.getElementById("vitals-body");
        var html = '<table class="cal-table"><tbody>';
        if (s !== "shared") html += row("Age", p.age ? esc(p.age) : "");
        if (s === "shared") {
            html += row("Volunteer Status", esc(p.volunteerStatus));
            html += row("Membership", esc(p.membership));
            html += row("Last Donation", p.lastDonation
                ? esc(p.lastDonation.amount + " · " + p.lastDonation.date) : "");
        }
        html += row("Do Not Call", '<span class="muted-note">No</span>');
        html += row("Do Not Email", '<span class="muted-note">No</span>');
        html += "</tbody></table>";
        box.innerHTML = html;
    }

    function renderDistricts(p) {
        document.getElementById("districts-body").innerHTML =
            '<table class="cal-table"><tbody>'
            + row("Provincial Riding", "098 Sample District")
            + row("Federal Riding", "Sample Centre")
            + row("Municipal Ward", "Ward 12")
            + row("Poll", p.poll ? esc(p.poll) : '<span class="muted-note">—</span>')
            + "</tbody></table>";
    }

    function renderIds(p, s) {
        var head = document.querySelector("#ids-box .side-box-head");
        var box = document.getElementById("ids-body");
        if (s === "shared") {
            head.textContent = "Contact ID";
            box.innerHTML = '<table class="cal-table"><tbody>'
                + row("Contact ID", esc(p.contactId))
                + "</tbody></table>";
            return;
        }
        head.textContent = "Voter File VANID";
        box.innerHTML = '<table class="cal-table"><tbody>'
            + row("Voter File VANID", esc(p.vanId))
            + row("Elections Ontario ID", esc((p.poll || "000") + "-" + (p.seq || "0000")))
            + row("Old Polling Division", p.poll ? esc(p.poll) : "")
            + row("Election Sequence ID", p.seq ? esc(p.seq) : "")
            + "</tbody></table>";
    }

    /* ====================================================================
       Page wiring
       ==================================================================== */

    function render() {
        var s = side();
        var list = currentList();
        var idx = currentIndex();
        var p = list[idx];

        if (!p) {
            document.getElementById("cs-name").textContent = "Record not found";
            return;
        }

        renderSummary(p, s);
        renderBanner(s);
        renderSurvey(p);
        renderActivist(p, s);
        renderAddress(p);
        renderPhones(p);
        renderEmail(p);
        renderVoting(p, s);
        renderVitals(p, s);
        renderDistricts(p);
        renderIds(p, s);

        // record navigation labels
        document.getElementById("rn-pos").textContent = idx + 1;
        document.getElementById("rn-total").textContent = list.length;
        document.getElementById("rn-id-label").textContent =
            s === "shared" ? "Contact ID" : "Voter File VANID";

        // remember which record we're on for Next/jump
        render._idx = idx;
        render._side = s;
    }

    function goTo(idx) {
        var s = render._side || side();
        var list = dataFor(s);
        if (idx < 0) idx = list.length - 1;
        if (idx >= list.length) idx = 0;
        var p = list[idx];
        // update the URL (so refresh/back works) without reloading
        var url = "contactdetails.html?side=" + encodeURIComponent(s)
            + "&id=" + encodeURIComponent(idOf(p, s));
        history.replaceState(null, "", url);
        render();
    }

    /* ---- collapsible sections + favorite stars ------------------------- */
    var grid = document.querySelector(".profile-main");
    if (grid) {
        grid.addEventListener("click", function (e) {
            if (e.target.closest(".ps-star")) return;        // star handled below
            var heading = e.target.closest(".ps-heading");
            if (!heading) return;
            heading.parentElement.classList.toggle("collapsed");
        });
        grid.querySelectorAll(".ps-star").forEach(function (star) {
            star.addEventListener("click", function (e) {
                e.stopPropagation();
                star.classList.toggle("active");
                updateFavorites();
            });
        });
    }

    function updateFavorites() {
        var fav = document.getElementById("favorites-body");
        var stars = grid ? grid.querySelectorAll(".ps-star.active") : [];
        if (!stars.length) {
            fav.innerHTML = emptyNote("Star a section to pin it here for quick access.");
            return;
        }
        var items = Array.prototype.map.call(stars, function (st) {
            var sec = st.closest(".page-section");
            var title = sec.querySelector(".ps-title").textContent;
            return '<li><a href="#' + sec.id + '">' + esc(title) + "</a></li>";
        }).join("");
        fav.innerHTML = '<ul class="fav-list">' + items + "</ul>";
    }

    /* ---- in-page tabs (Page Sections / Bio / Financial Household) ------- */
    var tabs = document.getElementById("profile-tabs");
    if (tabs) tabs.addEventListener("click", function (e) {
        var li = e.target.closest("li[data-tab]");
        if (!li) return;
        tabs.querySelectorAll("li").forEach(function (x) { x.classList.toggle("active", x === li); });
        if (li.getAttribute("data-tab") !== "sections") {
            alert(li.textContent.trim() + "\n\nThis view groups the record's fields differently. "
                + "Only \"Page Sections\" is built out in this training mock.");
            tabs.querySelector('li[data-tab="sections"]').classList.add("active");
            li.classList.remove("active");
        }
    });

    /* ---- record navigation buttons ------------------------------------- */
    function trainingAlert(title, body) { alert(title + "\n\n" + body + "\n\n(Training mock — no data is changed.)"); }

    document.getElementById("rn-next").addEventListener("click", function () { goTo((render._idx || 0) + 1); });
    document.getElementById("rn-go").addEventListener("click", function () {
        var q = (document.getElementById("rn-id-input").value || "").trim().toLowerCase();
        if (!q) return;
        var list = dataFor(render._side || side());
        for (var i = 0; i < list.length; i++) {
            if (idOf(list[i], render._side).toLowerCase() === q) { goTo(i); return; }
        }
        alert("No record in this list has that ID. (Training mock — try one of the IDs shown on the record.)");
    });
    document.getElementById("rn-id-input").addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); document.getElementById("rn-go").click(); }
    });
    document.getElementById("rn-save").addEventListener("click", function () {
        trainingAlert("Save", "Saves any changes you made to this record (notes, responses, etc.).");
    });
    document.getElementById("rn-clear").addEventListener("click", function () {
        trainingAlert("Clear", "Clears your unsaved edits on this record.");
    });
    document.getElementById("rn-print").addEventListener("click", function () {
        trainingAlert("Print", "Prints this contact record.");
    });
    document.getElementById("pf-save").addEventListener("click", function () {
        trainingAlert("Save All", "Saves every change made across all sections of this record.");
    });
    document.querySelectorAll(".rn-view").forEach(function (b) {
        b.addEventListener("click", function () {
            document.querySelectorAll(".rn-view").forEach(function (x) { x.classList.remove("active"); });
            b.classList.add("active");
            if (b.getAttribute("data-view") !== "standard") {
                trainingAlert(b.textContent.trim() + " view",
                    "Switches how this record's fields are laid out for data entry.");
            }
        });
    });

    // Re-render if the user switches the database tab.
    if (window.LLTraining) window.LLTraining.onSideChange(function () {
        // jump to the first record of the newly-selected side
        var s = window.LLTraining.getSide();
        var list = dataFor(s);
        if (list.length) {
            var p = list[0];
            history.replaceState(null, "",
                "contactdetails.html?side=" + encodeURIComponent(s)
                + "&id=" + encodeURIComponent(idOf(p, s)));
        }
        render();
    });

    render();
    updateFavorites();
})();
