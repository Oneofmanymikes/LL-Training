/* ==========================================================================
   Quick Look Up — interactions
   A fictional sample dataset the trainee can search, plus column sorting.
   No real voter data — every person below is invented for training.
   ========================================================================== */
(function () {
    "use strict";

    // --- Fictional sample contacts (loaded from the shared training dataset) --
    var PEOPLE = window.TRAINING_CONTACTS || [];

    var body = document.getElementById("qlu-body");
    var foot = document.getElementById("qlu-foot");
    if (!body) return;

    var sortKey = null, sortAsc = true;

    function val(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim().toLowerCase() : "";
    }

    function lastFirst(name) {
        // "Last, First" → return {last, first}
        var parts = name.split(",");
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
        if (city && p.city.toLowerCase().indexOf(city) === -1) return false;
        if (zip && p.zip.toLowerCase().replace(/\s+/g, "").indexOf(zip) === -1) return false;
        if (street && p.address.toLowerCase().indexOf(street) === -1) return false;
        if (email && p.email.toLowerCase().indexOf(email) === -1) return false;
        if (phone && p.phone.replace(/\D/g, "").indexOf(phone) === -1) return false;
        return true;
    }

    function render(rows) {
        body.innerHTML = "";
        if (!rows.length) {
            body.innerHTML = '<tr class="no-results-row"><td colspan="10">No contacts match your search.</td></tr>';
            foot.textContent = "0 People";
            return;
        }
        rows.forEach(function (p) {
            var tr = document.createElement("tr");
            tr.innerHTML =
                '<td><a href="#" onclick="return false">' + p.name + "</a></td>" +
                "<td>" + p.address + "</td>" +
                "<td>" + p.city + "</td>" +
                "<td>" + p.zip + "</td>" +
                "<td>" + (p.age || "") + "</td>" +
                "<td>" + p.phone + "</td>" +
                "<td>" + p.province + "</td>" +
                "<td>" + p.email + "</td>" +
                "<td>" + p.poll + "</td>" +
                "<td>" + p.seq + "</td>";
            body.appendChild(tr);
        });
        foot.innerHTML = "<b>" + rows.length + (rows.length === 1 ? " Person" : " People") + " ·</b> 1 Page";
    }

    function currentRows() {
        var rows = PEOPLE.filter(matches);
        if (sortKey) {
            rows.sort(function (a, b) {
                var x = (a[sortKey] + "").toLowerCase(), y = (b[sortKey] + "").toLowerCase();
                if (sortKey === "age") { x = +a.age || 0; y = +b.age || 0; }
                return (x < y ? -1 : x > y ? 1 : 0) * (sortAsc ? 1 : -1);
            });
        }
        return rows;
    }

    function search() { render(currentRows()); }

    document.getElementById("qlu-search").addEventListener("click", search);
    document.getElementById("qlu-clear").addEventListener("click", function () {
        document.querySelectorAll(".panel-filter input[type=text]").forEach(function (i) { i.value = ""; });
        document.getElementById("f-addrtype").value = "0";
        sortKey = null;
        search();
    });
    document.getElementById("qlu-remember").addEventListener("click", function () {
        alert("Remember Filters\n\nIn Liberalist this saves your current search criteria so they're "
            + "pre-filled next time you open Quick Look Up. (Training mock — nothing is stored.)");
    });

    // Enter key in any filter field runs the search
    document.querySelectorAll(".panel-filter input").forEach(function (i) {
        i.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); search(); } });
    });

    // Column sorting
    document.querySelectorAll("#qlu-table th[data-sort]").forEach(function (th) {
        th.addEventListener("click", function () {
            var key = th.getAttribute("data-sort");
            if (sortKey === key) sortAsc = !sortAsc; else { sortKey = key; sortAsc = true; }
            search();
        });
    });

    // Initial view: show everything
    search();
})();
