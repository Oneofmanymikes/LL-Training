/* ==========================================================================
   Create A List ("Create A New Search") — interactions
   Mimics the real page's behaviour: collapsible criteria sections, favorite
   stars, a "this section has values" highlight, and Preview / Run counts.
   ========================================================================== */
(function () {
    "use strict";

    var sections = document.getElementById("cal-sections");
    if (!sections) return;

    /* ---- Collapse / expand a criteria section -------------------------- */
    sections.addEventListener("click", function (e) {
        // ignore clicks on the star / drag handle
        if (e.target.closest(".ps-star") || e.target.closest(".ps-drag")) return;
        var heading = e.target.closest(".ps-heading");
        if (!heading) return;
        heading.parentElement.classList.toggle("collapsed");
    });

    /* ---- Favorite star: move section to the top ----------------------- */
    sections.querySelectorAll(".ps-star").forEach(function (star) {
        star.addEventListener("click", function (e) {
            e.stopPropagation();
            star.classList.toggle("active");
            var section = star.closest(".page-section");
            if (star.classList.contains("active")) {
                sections.prepend(section); // favorited → top
            }
        });
    });

    /* ---- Highlight sections that have a value set --------------------- */
    function sectionHasValue(section) {
        var inputs = section.querySelectorAll("input, select");
        for (var i = 0; i < inputs.length; i++) {
            var el = inputs[i];
            if (el.type === "checkbox" || el.type === "radio") {
                // ignore the boxes that are checked by default
                if (el.checked && !el.defaultChecked) return true;
            } else if (el.tagName === "SELECT") {
                if (el.selectedIndex > 0) return true;
            } else if (el.value && el.value.trim() !== "") {
                return true;
            }
        }
        return false;
    }
    sections.addEventListener("change", function (e) {
        var section = e.target.closest(".page-section");
        if (!section) return;
        section.classList.toggle("highlighted", sectionHasValue(section));
    });

    /* ---- Preview My Results: fake a list size ------------------------- */
    var previewBtn = document.getElementById("preview-btn");
    var peopleCount = document.getElementById("people-count");
    var other = document.getElementById("preview-other");

    function fmt(n) { return n.toLocaleString("en-CA"); }

    function computePreview() {
        // Start from the full file and shrink a little for each active section,
        // so the number reacts to the criteria the trainee selects.
        var base = 84000;
        var active = sections.querySelectorAll(".page-section.highlighted").length;
        var people = Math.max(0, Math.round(base * Math.pow(0.62, active)));
        peopleCount.textContent = fmt(people);
        peopleCount.classList.remove("faded");
        document.getElementById("c-phones").textContent = fmt(Math.round(people * 0.78));
        document.getElementById("c-doors").textContent = fmt(Math.round(people * 0.44));
        document.getElementById("c-mail").textContent = fmt(Math.round(people * 0.41));
        other.hidden = false;
    }

    if (previewBtn) {
        previewBtn.addEventListener("click", function () {
            peopleCount.textContent = "…";
            setTimeout(computePreview, 400); // tiny delay to feel like a server call
        });
    }

    /* ---- Add Step / Run Search (training stubs) ----------------------- */
    var addBtn = document.getElementById("add-step-btn");
    if (addBtn) addBtn.addEventListener("click", function () {
        alert("Add Step\n\nIn Liberalist this adds another step (Add / Remove / Narrow People, "
            + "Sample, or Householding) to refine your list. Disabled in this training mock.");
    });

    var runBtn = document.getElementById("run-btn");
    if (runBtn) runBtn.addEventListener("click", function () {
        if (confirm("Run Search?\n\nThis would clear your current list of 1,802 people and load "
            + "the search results into My List. (Training mock — no data is changed.)")) {
            alert("Search complete — results would now load into My List.");
        }
    });

    /* ---- Survey Questions: reveal responses + filters on selection ---- */
    // Each question maps to its own set of response options.
    var SURVEY_QUESTIONS = {
        "2029 Affiliation: ID by Volunteer": [
            "Liberal", "Possible Liberal", "PC", "NDP", "Green", "Not Liberal",
            "Not PC", "Undecided", "Won't Say", "Not Voting", "Independent"
        ],
        "2025 Affiliation: ID by Volunteer": [
            "Liberal", "Possible Liberal", "PC", "NDP", "Green", "Not Liberal",
            "Not PC", "Undecided", "Won't Say", "Not Voting", "Independent"
        ],
        "2029 Volunteer: Volunteer Status": [
            "Yes, Sign Me Up", "No", "Engage Later", "Current Volunteer"
        ],
        "2026 Action: BE - Sign Request": [
            "Sign requested", "Large sign requested", "Sign Refused", "Call to Confirm",
            "Sign Installed", "Large sign installed", "Sign Maintenance Req",
            "Maintenance Complete", "Wrong Riding", "Sign Removal Request", "Sign Removed"
        ]
    };

    function dateRangeSelect() {
        return '<select class="field"><option>--Select a Date Range Type--</option>'
            + '<option>Between</option><option>In the range of</option>'
            + '<option>In the month of</option></select>';
    }

    var sqSelect = document.getElementById("sq-question");
    var sqDetail = document.getElementById("sq-detail");

    if (sqSelect && sqDetail) {
        sqSelect.addEventListener("change", function () {
            var q = sqSelect.value;
            var responses = SURVEY_QUESTIONS[q];

            if (!responses) {            // blank or "Show Archived..."
                sqDetail.hidden = true;
                sqDetail.innerHTML = "";
                return;
            }

            var checks = responses.map(function (r) {
                return '<label class="fieldCheckRadio"><input type="checkbox"> ' + r + "</label>";
            }).join("");

            sqDetail.innerHTML =
                '<table class="cal-table"><tbody>'
                + '<tr><td class="van-label">Responses</td><td>'
                +   '<div class="result-grid">' + checks + "</div></td></tr>"
                + '<tr><td class="van-label">Input Type</td><td>'
                +   '<select class="field"><option></option><option>Manual</option>'
                +   '<option>Bulk</option><option>VPB</option><option>Mobile</option>'
                +   '<option>Website</option></select></td></tr>'
                + '<tr><td class="van-label">Contact Type</td><td>'
                +   '<select class="field"><option></option><option>Phone</option>'
                +   '<option>Walk</option><option>Event</option><option>SMS Text</option>'
                +   '<option>Personal Email</option></select></td></tr>'
                + '<tr><td class="van-label">Canvassed By</td><td>'
                +   '<input class="field" type="text"></td></tr>'
                + '<tr><td class="van-label">Entered By</td><td>'
                +   '<select class="field"><option></option><option>Doe, Jane</option>'
                +   '<option>Smith, John</option><option>Volunteer, A</option></select></td></tr>'
                + '<tr><td class="van-label">Date Canvassed</td><td>' + dateRangeSelect() + "</td></tr>"
                + '<tr><td class="van-label">Date Entered</td><td>' + dateRangeSelect() + "</td></tr>"
                + '<tr><td class="van-label">Committee</td><td>'
                +   '<select class="field"><option></option>'
                +   '<option>098 Sample District</option><option>022 Sample West</option></select></td></tr>'
                + '<tr><td></td><td><label class="fieldCheckRadio">'
                +   '<input type="checkbox"> Include most recent response only</label></td></tr>'
                + '<tr><td class="van-label">Origin</td><td>'
                +   '<select class="field"><option></option>'
                +   '<option>Include only data originating from this database</option>'
                +   '<option>Include only data originating from other databases</option></select></td></tr>'
                + "</tbody></table>";
            sqDetail.hidden = false;

            // selecting a question marks the section as having a value
            sqDetail.closest(".page-section").classList.add("highlighted");
        });
    }
})();
