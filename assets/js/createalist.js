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
})();
