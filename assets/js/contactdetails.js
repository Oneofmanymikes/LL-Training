/* ==========================================================================
   Contact Record (ContactsDetails) — the individual profile page.
   A clean-room approximation of the real VAN ContactsDetails layout: a
   full-width data-entry control panel, then two columns (wide + narrow), each
   with a FAVORITES panel and an alphabetically-sorted OTHER SECTIONS panel.

   The set of page sections differs by database side, matching the real app:
     Voter File   — Activist Codes, Addresses, Contact History, Early Voting,
                    Election Day Polling Location, Email, Name • Salutation,
                    Notes, Phones, Self-Reported Demographics, Survey Responses,
                    Targets, Voting History  + (narrow) Also At Voting Address,
                    Districts, Vital Stats, Voter File VANID, Actions
     Shared       — adds Attached Files, Online Forms, Past Events, Social
                    Media, Supporter Groups, Targeted Emails, Upcoming Events,
                    Volunteer Profile + (narrow) Fast Action, VAN ID

   Reads one person from the training dataset (by ?id= / ?side=). All people
   are fictional — see assets/data/training-data.js.
   ========================================================================== */
(function () {
    "use strict";

    var SIDES = window.TRAINING_DB_SIDES || {};
    var FAV_KEY = "llTrainingFavSections";

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
    function dataFor(s) { return (s === "shared" ? window.TRAINING_SHARED : window.TRAINING_VOTERFILE) || []; }
    function idOf(p, s) { return s === "shared" ? p.contactId : p.vanId; }
    function currentList() { return dataFor(side()); }
    function currentIndex() {
        var list = currentList(), id = qs("id");
        if (id) for (var i = 0; i < list.length; i++) if (idOf(list[i], side()) === id) return i;
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
    function table(rowsHtml) { return '<table class="cal-table"><tbody>' + rowsHtml + "</tbody></table>"; }
    function emptyNote(text) { return '<p class="muted-note ps-empty">' + esc(text) + "</p>"; }
    function input(value, ph) {
        return '<input class="field" type="text" value="' + esc(value || "") + '"'
            + (ph ? ' placeholder="' + esc(ph) + '"' : "") + ">";
    }
    function voterFileTwin(p) {
        var vf = window.TRAINING_VOTERFILE || [];
        for (var i = 0; i < vf.length; i++)
            if ((vf[i].name || "").toLowerCase() === (p.name || "").toLowerCase()) return vf[i];
        return null;
    }
    function othersAtAddress(p, s) {
        return dataFor(s).filter(function (o) {
            return o !== p && (o.address || "").toLowerCase() === (p.address || "").toLowerCase()
                && (o.zip || "").toLowerCase() === (p.zip || "").toLowerCase();
        });
    }

    /* ====================================================================
       Section content renderers — each returns an HTML string for the body.
       ==================================================================== */
    function rActivist(p, s) {
        var codes = [];
        if (s === "shared") {
            (p.contactTypes || []).forEach(function (t) { codes.push({ name: t, scope: "098 Sample District" }); });
            if (p.membership) codes.push({ name: p.membership, scope: "098 Sample District" });
        }
        if (!codes.length) return emptyNote(s === "shared"
            ? "No activist codes applied to this contact."
            : "Activist codes are applied on the Shared Contacts side of the database.");
        return '<ul class="chip-list">' + codes.map(function (c) {
            return '<li class="chip">' + esc(c.name) + ' <span class="chip-scope">' + esc(c.scope) + "</span></li>";
        }).join("") + "</ul>";
    }
    function rAddresses(p, s) {
        var label = s === "shared" ? "Home Address" : "Voting Address";
        return table(
            row(label, esc(p.address) + "<br>" + esc(p.city) + ", ON " + esc(p.zip))
            + row("Mailing Address", '<span class="muted-note">Same as ' + label.toLowerCase() + "</span>")
            + row("Type", label.replace(" Address", "")));
    }
    function rContactHistory(p) {
        var rows = [];
        var sign = p.survey && p.survey["2026 Action: BE - Sign Request"];
        if (Array.isArray(sign)) sign.forEach(function (h) {
            rows.push({ date: h.date, type: "Walk", by: "Volunteer, A", result: h.response });
        });
        if (p.phone) rows.push({ date: "05/05/2025", type: "Phone", by: "Doe, Jane", result: "Canvassed" });
        if (!rows.length) return emptyNote("No contact history recorded.");
        return '<table class="mini-table"><thead><tr><th>Date</th><th>Type</th><th>Contacted By</th><th>Result</th></tr></thead><tbody>'
            + rows.map(function (r) {
                return "<tr><td>" + esc(r.date) + "</td><td>" + esc(r.type) + "</td><td>"
                    + esc(r.by) + '</td><td><span class="rd-blue">' + esc(r.result) + "</span></td></tr>";
            }).join("") + "</tbody></table>";
    }
    function rEarlyVoting() {
        return table(row("Early Voted", '<span class="muted-note">No</span>')
            + row("E-Day Voted", '<span class="muted-note">No</span>')
            + row("Vote Method", '<span class="muted-note">Not recorded</span>'));
    }
    function rPollingLocation(p) {
        return table(row("Polling Location", "Sample Community Centre")
            + row("Address", "120 Sample St, Toronto")
            + row("Poll", p.poll ? esc(p.poll) : '<span class="muted-note">—</span>'));
    }
    function rEmail(p, s) {
        if (!p.email) return emptyNote("No email address on file.");
        return table(row("Email", '<a href="#" onclick="return false">' + esc(p.email) + "</a>"
            + (s === "shared" ? ' <span class="muted-note">(Personal)</span>' : "")));
    }
    function rNameSalutation(p) {
        var n = firstLast(p.name);
        return table(
            row("Name", '<span class="multi-field">' + input(n.first, "First") + input("", "Middle")
                + input(n.last, "Last") + "</span>")
            + row("Nickname", input(""))
            + row("Pronouns", '<select class="field"><option></option><option>She/Her/Hers</option>'
                + "<option>He/Him/His</option><option>They/Them/Theirs</option></select>")
            + '<tr><td class="van-label sub-head" colspan="2">Salutations</td></tr>'
            + row("Informal Salutation", input(n.first))
            + row("Formal Salutation", input(n.display))
            + row("Additional Salutation", input(""))
            + '<tr><td class="van-label sub-head" colspan="2">Envelope Names</td></tr>'
            + row("Informal Envelope Name", input(n.display))
            + row("Formal Envelope Name", input(n.display)))
            + '<div class="ps-foot"><button class="btn btn-sm" data-action="Save Name">Save</button></div>';
    }
    function rNotes() {
        return '<textarea class="notes-area" rows="3" placeholder="Add a note about this contact '
            + '(training mock — not saved)."></textarea>'
            + '<div class="ps-foot"><button class="btn btn-sm btn-primary" data-action="Save Note">Save</button>'
            + '<button class="btn btn-sm" data-action="Save &amp; Pin Note">Save &amp; Pin</button>'
            + '<button class="btn btn-sm" data-action="Note Options">Options</button></div>';
    }
    function rPhones(p, s) {
        if (!p.phone) return emptyNote("No phone numbers on file.");
        return table(row("Phone", esc(p.phone)
            + ' <span class="muted-note">(' + (s === "shared" ? "Personal" : "Main") + ")</span>"));
    }
    function rDemographics() {
        return table(
            row("Race / Ethnicity", '<select class="field"><option></option><option>Self-reported…</option></select>')
            + row("Preferred Language", '<select class="field"><option></option><option>English</option>'
                + "<option>French</option></select>")
            + row("Religion", input("")));
    }
    function rSocialMedia() {
        return table(row("Twitter / X", input("", "@handle"))
            + row("Facebook", input("", "profile URL"))
            + row("Instagram", input("", "@handle")));
    }
    function rSupporter(p) {
        var groups = [];
        if (p.membership) groups.push(p.membership);
        if (p.lastDonation) groups.push("Donor " + (p.lastDonation.date || "").slice(-4));
        if (!groups.length) return emptyNote("This contact is not in any supporter groups.");
        return '<ul class="chip-list">' + groups.map(function (g) {
            return '<li class="chip">' + esc(g) + "</li>";
        }).join("") + "</ul>";
    }
    function rSurvey(p) {
        var survey = p.survey || {}, keys = Object.keys(survey);
        if (!keys.length) return emptyNote("No survey responses recorded for this contact.");
        return keys.map(function (q) {
            var val = survey[q];
            if (Array.isArray(val)) {
                if (!val.length) return '<div class="survey-q"><div class="survey-q-name">' + esc(q) + "</div>"
                    + emptyNote("No responses yet.") + "</div>";
                var rows = val.map(function (h) {
                    return "<tr><td>" + esc(h.date) + '</td><td><span class="rd-blue">'
                        + esc(h.response) + "</span></td></tr>";
                }).join("");
                return '<div class="survey-q"><div class="survey-q-name">' + esc(q)
                    + ' <span class="survey-q-count">(' + val.length + " responses)</span></div>"
                    + '<table class="mini-table"><thead><tr><th>Date</th><th>Response</th></tr></thead><tbody>'
                    + rows + "</tbody></table></div>";
            }
            return '<div class="survey-q"><div class="survey-q-name">' + esc(q) + "</div>"
                + '<div class="survey-q-resp"><span class="rd-red">' + esc(val) + "</span></div></div>";
        }).join("");
    }
    function rTargets(p) {
        var aff = p.survey && p.survey["2025 Affiliation: ID by Volunteer"];
        var gotv = (aff === "Liberal" || aff === "Possible Liberal") ? "Yes" : "No";
        return table(row("GOTV Universe", '<span class="rd-blue">' + gotv + "</span>")
            + row("Persuasion Universe", aff === "Undecided" ? '<span class="rd-blue">Yes</span>' : "No")
            + row("Support Score", '<span class="muted-note">Not modelled (training)</span>'));
    }
    function rVotingHistory(p, s) {
        if (s === "shared") return emptyNote("Voting history lives on the Voter File side of the database.");
        var hist = [
            { y: "2025 Provincial General", v: "Voted" },
            { y: "2022 Provincial General", v: (p.age && p.age >= 21) ? "Voted" : "Did Not Vote" },
            { y: "2021 Federal General", v: "Voted" }
        ];
        return '<table class="mini-table"><thead><tr><th>Election</th><th>Participation</th></tr></thead><tbody>'
            + hist.map(function (h) {
                var cls = h.v === "Voted" ? "rd-blue" : "muted-note";
                return "<tr><td>" + esc(h.y) + '</td><td><span class="' + cls + '">' + esc(h.v) + "</span></td></tr>";
            }).join("") + "</tbody></table>"
            + '<p class="muted-note">Participation only — the marked ballot is secret.</p>';
    }
    function rVolunteer(p) {
        return table(row("Volunteer Status", esc(p.volunteerStatus))
            + row("Contact Types", (p.contactTypes || []).join(", "))
            + row("Availability", '<span class="muted-note">Not recorded</span>'));
    }
    function rListEmpty(msg) { return function () { return emptyNote(msg); }; }

    /* ---- narrow-column sections --------------------------------------- */
    function rAlsoAt(p, s) {
        var others = othersAtAddress(p, s);
        if (!others.length) return emptyNote("No other contacts at this address.");
        return '<ul class="also-list">' + others.map(function (o) {
            return '<li><a href="' + profileHref(o, s) + '">' + esc(firstLast(o.name).display) + "</a></li>";
        }).join("") + "</ul>";
    }
    function rDistricts(p) {
        return table(row("Provincial Riding", "098 Sample District")
            + row("Federal Riding", "Sample Centre")
            + row("Municipal Ward", "Ward 12")
            + row("Poll", p.poll ? esc(p.poll) : '<span class="muted-note">—</span>'));
    }
    function rFastAction() {
        return emptyNote("Quick one-click survey responses appear here. (Training mock.)");
    }
    function rVitals(p, s) {
        var html = "";
        if (s !== "shared") html += row("Age", p.age ? esc(p.age) : "");
        if (s === "shared") {
            html += row("Volunteer Status", esc(p.volunteerStatus));
            html += row("Membership", esc(p.membership));
            html += row("Last Donation", p.lastDonation ? esc(p.lastDonation.amount + " · " + p.lastDonation.date) : "");
        }
        html += row("Do Not Call", '<span class="muted-note">No</span>');
        html += row("Do Not Email", '<span class="muted-note">No</span>');
        return table(html);
    }
    function rIds(p, s) {
        if (s === "shared") {
            var twin = voterFileTwin(p);
            var vfLink = twin
                ? '<a href="contactdetails.html?side=voterfile&id=' + encodeURIComponent(twin.vanId) + '">'
                    + esc(twin.vanId) + "</a>"
                : '<span class="muted-note">Not matched to the voter file</span>';
            return table(row("VAN ID", esc(p.contactId)) + row("Source", "Committee data entry")
                + row("Date Created", "16/03/2024") + row("Voter File VANID", vfLink));
        }
        return table(row("Voter File VANID", esc(p.vanId))
            + row("Elections Ontario ID", esc((p.poll || "000") + "-" + (p.seq || "0000")))
            + row("Old Polling Division", p.poll ? esc(p.poll) : "")
            + row("Election Sequence ID", p.seq ? esc(p.seq) : ""));
    }
    function rActions(p, s) {
        var actions = s === "shared"
            ? ["Save All", "Merge Duplicate", "Create User Account", "Remove from My Contacts", "Clone"]
            : ["Save All", "Add to My List", "Merge Duplicate"];
        return '<div class="action-list">' + actions.map(function (a, i) {
            return '<button class="btn ' + (i === 0 ? "btn-primary" : "") + ' btn-block" data-action="'
                + esc(a) + '">' + esc(a) + "</button>";
        }).join("") + "</div>";
    }

    /* ====================================================================
       Section registry. `sides` limits which database side shows a section;
       `col` is 'wide' or 'narrow'; `open` opens it by default.
       ==================================================================== */
    var SECTIONS = [
        // wide
        { key: "ActivistCodes", name: "Activist Codes", icon: "i-tags", col: "wide", render: rActivist },
        { key: "Addresses", name: "Addresses", icon: "i-address", col: "wide", render: rAddresses },
        { key: "StoredFiles", name: "Attached Files", icon: "i-folder", col: "wide", sides: ["shared"], render: rListEmpty("No files have been attached to this contact.") },
        { key: "ContactHistory", name: "Contact History", icon: "i-list", col: "wide", render: rContactHistory },
        { key: "EarlyVoting", name: "Early Voting", icon: "i-book", col: "wide", sides: ["voterfile"], render: rEarlyVoting },
        { key: "PollingLocation", name: "Election Day Polling Location", icon: "i-pin", col: "wide", sides: ["voterfile"], render: rPollingLocation },
        { key: "EMail", name: "Email", icon: "i-mail", col: "wide", render: rEmail },
        { key: "SalutationCouple", name: "Name • Salutation", icon: "i-nameplate", col: "wide", render: rNameSalutation },
        { key: "Notes", name: "Notes", icon: "i-note", col: "wide", render: rNotes },
        { key: "OnlineForms", name: "Online Forms", icon: "i-listalt", col: "wide", sides: ["shared"], render: rListEmpty("This contact has not submitted any online forms.") },
        { key: "EventsPast", name: "Past Events", icon: "i-book", col: "wide", sides: ["shared"], render: rListEmpty("No past event participation recorded.") },
        { key: "Phones", name: "Phones", icon: "i-phone", col: "wide", render: rPhones },
        { key: "SelfReport", name: "Self-Reported Demographics", icon: "i-people", col: "wide", render: rDemographics },
        { key: "SocialMedia", name: "Social Media", icon: "i-globe", col: "wide", sides: ["shared"], render: rSocialMedia },
        { key: "SupporterGroups", name: "Supporter Groups", icon: "i-folder", col: "wide", sides: ["shared"], render: rSupporter },
        { key: "SurveyQuestions", name: "Survey Responses", icon: "i-charts", col: "wide", render: rSurvey },
        { key: "TargetedEmails", name: "Targeted Emails", icon: "i-mail", col: "wide", sides: ["shared"], render: rListEmpty("No targeted emails have been sent to this contact.") },
        { key: "Targets", name: "Targets", icon: "i-pie", col: "wide", sides: ["voterfile"], render: rTargets },
        { key: "EventsFuture", name: "Upcoming Events", icon: "i-book", col: "wide", sides: ["shared"], render: rListEmpty("No upcoming events for this contact.") },
        { key: "Volunteers", name: "Volunteer Profile", icon: "i-people", col: "wide", sides: ["shared"], render: rVolunteer },
        { key: "VotingHistory", name: "Voting History", icon: "i-book", col: "wide", sides: ["voterfile"], render: rVotingHistory },
        // narrow
        { key: "AlsoInHousehold", name: function (s) { return s === "shared" ? "Also At Home Address" : "Also At Voting Address"; }, icon: "i-people", col: "narrow", render: rAlsoAt },
        { key: "Districts", name: "Districts", icon: "i-pin", col: "narrow", render: rDistricts },
        { key: "FastAction", name: "Fast Action", icon: "i-list", col: "narrow", sides: ["shared"], render: rFastAction },
        { key: "VanID", name: function (s) { return s === "shared" ? "VAN ID" : "Voter File VANID"; }, icon: "i-nameplate", col: "narrow", render: rIds },
        { key: "VitalStats", name: "Vital Stats & Contact Preferences", icon: "i-user", col: "narrow", render: rVitals },
        { key: "Actions", name: "Actions", icon: "i-listalt", col: "narrow", open: true, render: rActions }
    ];

    function nameOf(sec, s) { return typeof sec.name === "function" ? sec.name(s) : sec.name; }
    function sectionsFor(s, col) {
        return SECTIONS.filter(function (sec) {
            return sec.col === col && (!sec.sides || sec.sides.indexOf(s) !== -1);
        });
    }

    /* ---- favorites + expand state ------------------------------------- */
    function loadFavs() {
        try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (e) { return []; }
    }
    function saveFavs(arr) { try { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); } catch (e) {} }
    var favorites = loadFavs();
    var expanded = {};                 // key -> true when a section is open

    function profileHref(p, s) {
        return "contactdetails.html?side=" + encodeURIComponent(s) + "&id=" + encodeURIComponent(idOf(p, s));
    }

    function buildSection(sec, p, s) {
        var open = !!expanded[sec.key] || (sec.open && expanded[sec.key] !== false);
        var fav = favorites.indexOf(sec.key) !== -1;
        var el = document.createElement("section");
        el.className = "page-section" + (open ? "" : " collapsed");
        el.setAttribute("data-key", sec.key);
        el.innerHTML =
            '<div class="ps-heading">'
            + '<svg class="ps-chevron"><use href="#i-chevron-down"></use></svg>'
            + '<svg class="ps-leadicon"><use href="#' + sec.icon + '"></use></svg>'
            + '<span class="ps-title">' + esc(nameOf(sec, s)) + "</span>"
            + '<button class="ps-star' + (fav ? " active" : "") + '" title="Favorite this section">'
            + '<svg class="icon"><use href="#i-star"></use></svg></button></div>'
            + '<div class="ps-body">' + sec.render(p, s) + "</div>";
        return el;
    }

    function renderSections() {
        var s = render._side, p = render._record;
        if (!p) return;
        ["wide", "narrow"].forEach(function (col) {
            var favBox = document.getElementById("fav-" + col);
            var otherBox = document.getElementById("sections-" + col);
            favBox.innerHTML = "";
            otherBox.innerHTML = "";

            var list = sectionsFor(s, col);
            var favList = favorites
                .map(function (k) { return list.filter(function (x) { return x.key === k; })[0]; })
                .filter(Boolean);
            var others = list.filter(function (sec) { return favorites.indexOf(sec.key) === -1; })
                .sort(function (a, b) { return nameOf(a, s).localeCompare(nameOf(b, s)); });

            favList.forEach(function (sec) { favBox.appendChild(buildSection(sec, p, s)); });
            others.forEach(function (sec) { otherBox.appendChild(buildSection(sec, p, s)); });

            if (!favList.length) favBox.innerHTML = '<p class="muted-note">No favorite sections yet — '
                + "click a star to pin one here.</p>";
        });
    }

    /* ====================================================================
       Summary header + control panel
       ==================================================================== */
    function typedFact(value, type) {
        if (!value) return "";
        return esc(value) + ' <span class="cs-type">(' + esc(type) + ")</span>";
    }
    function renderSummary(p, s) {
        var n = firstLast(p.name), shared = s === "shared";
        document.getElementById("cs-avatar").textContent = initials(p.name);
        document.getElementById("cs-name").textContent = n.display;
        document.getElementById("cs-phone").innerHTML = p.phone
            ? (shared ? typedFact(p.phone, "Personal") : esc(p.phone)) : "No phone on file";

        var emailLi = document.getElementById("cs-email-li");
        if (p.email) {
            document.getElementById("cs-email").innerHTML =
                '<a href="#" onclick="return false">' + esc(p.email) + "</a>"
                + (shared ? ' <span class="cs-type">(Personal)</span>' : "");
            emailLi.hidden = false;
        } else { emailLi.hidden = true; }

        document.getElementById("cs-address").innerHTML =
            esc(p.address) + ", " + esc(p.city) + " " + esc(p.zip)
            + (shared ? ' <span class="cs-type">(Home)</span>' : "");

        document.getElementById("cs-follow").hidden = !shared;
        var committee = document.getElementById("cs-committee");
        if (shared) {
            committee.innerHTML = "You are viewing this person in <strong>098 Sample District</strong> &middot; "
                + '<a href="#" onclick="return false">View person in a different committee</a>';
            committee.hidden = false;
        } else { committee.hidden = true; }

        var tag = document.getElementById("cs-tag"), label;
        if (shared) {
            label = (p.contactTypes && p.contactTypes.length) ? p.contactTypes.join(" · ") : "Shared Contact";
        } else {
            var aff = p.survey && (p.survey["2025 Affiliation: ID by Volunteer"]
                || p.survey["2029 Affiliation: ID by Volunteer"]);
            label = aff ? ("ID: " + aff) : "Not yet ID'd";
        }
        tag.textContent = label;
        tag.hidden = false;

        var sideBox = document.getElementById("cs-side"), info = SIDES[s] || {};
        sideBox.textContent = info.name || (shared ? "Shared Contacts" : "Voter File");
        sideBox.className = "cs-side " + (shared ? "shared" : "voterfile");
    }
    function renderBanner(s) {
        var banner = document.getElementById("db-side-banner"), info = SIDES[s] || {};
        banner.className = "db-side-banner " + (s === "shared" ? "shared" : "voterfile");
        banner.innerHTML = "<strong>" + esc(info.name || "Voter File") + "</strong> &mdash; "
            + esc(info.description || "")
            + (info.editable ? "" : " <em>(core elector data is read-only)</em>");
    }

    /* ====================================================================
       Page wiring
       ==================================================================== */
    function render() {
        var s = side(), list = currentList(), idx = currentIndex(), p = list[idx];
        if (!p) { document.getElementById("cs-name").textContent = "Record not found"; return; }

        render._side = s; render._idx = idx; render._record = p;

        renderSummary(p, s);
        renderBanner(s);
        renderSections();

        document.getElementById("rn-pos-input").value = idx + 1;
        document.getElementById("rn-total").textContent = list.length;
        document.getElementById("rn-id-label").textContent = s === "shared" ? "VAN ID" : "Voter File VANID";
    }

    function goTo(idx) {
        var s = render._side || side(), list = dataFor(s);
        if (idx < 0) idx = list.length - 1;
        if (idx >= list.length) idx = 0;
        var p = list[idx];
        history.replaceState(null, "", profileHref(p, s));
        render();
    }

    /* ---- delegated clicks inside the section grid --------------------- */
    var grid = document.getElementById("profile-grid");
    var ACTION_HELP = {
        "Save All": "Saves every change made across all sections of this record.",
        "Merge Duplicate": "Finds and merges another record that is the same person.",
        "Create User Account": "Gives this contact a login to the database.",
        "Remove from My Contacts": "Removes this person from your committee's Shared Contacts.",
        "Clone": "Creates a new contact pre-filled from this one.",
        "Add to My List": "Adds this person to your current My List.",
        "Save Name": "Saves the name and salutation fields.",
        "Save Note": "Saves this note to the contact.",
        "Save &amp; Pin Note": "Saves the note and pins it to the top of the record.",
        "Note Options": "Opens advanced note options (category, attachments)."
    };
    function trainingAlert(title, body) {
        alert(title + "\n\n" + (body || "") + "\n\n(Training mock — no data is changed.)");
    }
    grid.addEventListener("click", function (e) {
        var actionBtn = e.target.closest("button[data-action]");
        if (actionBtn) {
            var a = actionBtn.getAttribute("data-action").replace(/&amp;/g, "&");
            trainingAlert(a, ACTION_HELP[actionBtn.getAttribute("data-action")]);
            return;
        }
        var star = e.target.closest(".ps-star");
        if (star) {
            e.stopPropagation();
            var secEl = star.closest(".page-section"), key = secEl.getAttribute("data-key");
            var i = favorites.indexOf(key);
            if (i === -1) favorites.push(key); else favorites.splice(i, 1);
            saveFavs(favorites);
            renderSections();
            return;
        }
        var heading = e.target.closest(".ps-heading");
        if (heading) {
            var sec = heading.parentElement, k = sec.getAttribute("data-key");
            sec.classList.toggle("collapsed");
            expanded[k] = !sec.classList.contains("collapsed");
        }
    });

    /* ---- in-page tabs (Page Sections / Bio / Financial Household) ------ */
    var tabs = document.getElementById("profile-tabs");
    tabs.addEventListener("click", function (e) {
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

    /* ---- control panel ------------------------------------------------ */
    document.getElementById("rn-next").addEventListener("click", function () { goTo((render._idx || 0) + 1); });
    document.getElementById("rn-back").addEventListener("click", function () { goTo((render._idx || 0) - 1); });
    document.getElementById("rn-rec-go").addEventListener("click", function () {
        var n = parseInt(document.getElementById("rn-pos-input").value, 10);
        if (n >= 1 && n <= dataFor(render._side).length) goTo(n - 1);
        else alert("Enter a record number within the list. (Training mock.)");
    });
    document.getElementById("rn-go").addEventListener("click", function () {
        var q = (document.getElementById("rn-id-input").value || "").trim().toLowerCase();
        if (!q) return;
        var list = dataFor(render._side || side());
        for (var i = 0; i < list.length; i++)
            if (idOf(list[i], render._side).toLowerCase() === q) { goTo(i); return; }
        alert("No record in this list has that ID. (Training mock — try an ID shown on the record.)");
    });
    document.getElementById("rn-id-input").addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); document.getElementById("rn-go").click(); }
    });
    document.getElementById("rn-pos-input").addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); document.getElementById("rn-rec-go").click(); }
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
            if (b.getAttribute("data-view") !== "standard")
                trainingAlert(b.textContent.trim() + " view",
                    "Switches how this record's fields are laid out for data entry.");
        });
    });
    document.getElementById("cs-follow").addEventListener("click", function () {
        this.classList.toggle("following");
        this.innerHTML = this.classList.contains("following")
            ? '<svg class="icon"><use href="#i-star"></use></svg> Following'
            : '<svg class="icon"><use href="#i-star"></use></svg> Follow';
    });

    // Re-render if the user switches the database tab (jump to first record).
    if (window.LLTraining) window.LLTraining.onSideChange(function () {
        var s = window.LLTraining.getSide(), list = dataFor(s);
        if (list.length) history.replaceState(null, "", profileHref(list[0], s));
        render();
    });

    render();
})();
