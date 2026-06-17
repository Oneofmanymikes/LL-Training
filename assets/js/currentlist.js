/* ==========================================================================
   LL-Training — current list / saved search state
   ----------------------------------------------------------------------------
   Create A List saves a search query here; My List, Counts & Crosstabs, the
   Virtual Phone Bank and Cut Turf all read the SAME filtered list from here so
   the whole flow stays consistent. Persisted in localStorage so it survives
   navigation between pages. Everything is fictional training data.

   Query shape:
     { side: "voterfile"|"shared",
       survey:  { question: "...", responses: ["Liberal", ...] },   // optional
       activistCodes: ["Member 2025", ...] }                        // optional
   ========================================================================== */
(function () {
    "use strict";

    var KEY = "llTrainingSearch";

    function dataFor(side) {
        return (side === "shared" ? window.TRAINING_SHARED : window.TRAINING_VOTERFILE) || [];
    }

    // Activist codes on the Shared side are derived from contact types + membership.
    function derivedCodes(p) {
        var codes = (p.contactTypes || []).slice();
        if (p.membership) codes.push(p.membership);
        return codes;
    }

    function getQuery() {
        try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; }
    }
    function setQuery(q) { try { localStorage.setItem(KEY, JSON.stringify(q)); } catch (e) {} }
    function clearQuery() { try { localStorage.removeItem(KEY); } catch (e) {} }

    function hasCriteria(q) {
        if (!q) return false;
        var hasSurvey = q.survey && q.survey.question && q.survey.responses && q.survey.responses.length;
        var hasCodes = q.activistCodes && q.activistCodes.length;
        return !!(hasSurvey || hasCodes);
    }

    function matches(p, q) {
        if (q.survey && q.survey.question && q.survey.responses && q.survey.responses.length) {
            var v = p.survey && p.survey[q.survey.question];
            var ok = false;
            if (Array.isArray(v)) ok = v.some(function (h) { return q.survey.responses.indexOf(h.response) !== -1; });
            else ok = q.survey.responses.indexOf(v) !== -1;
            if (!ok) return false;
        }
        if (q.activistCodes && q.activistCodes.length) {
            var codes = derivedCodes(p);
            if (!q.activistCodes.some(function (c) { return codes.indexOf(c) !== -1; })) return false;
        }
        return true;
    }

    // The list a page should show for a side: the saved search result if the
    // query applies to that side, otherwise the full file.
    function getList(side) {
        var q = getQuery(), all = dataFor(side);
        if (!q || q.side !== side || !hasCriteria(q)) return all.slice();
        return all.filter(function (p) { return matches(p, q); });
    }

    function isFiltered(side) {
        var q = getQuery();
        return !!(q && q.side === side && hasCriteria(q));
    }

    // Human-readable criteria lines for the My List "Description" box.
    function describe(side) {
        var q = getQuery();
        if (!q || q.side !== side || !hasCriteria(q)) return [];
        var lines = [];
        if (q.survey && q.survey.question && q.survey.responses && q.survey.responses.length) {
            lines.push({ label: q.survey.question, value: q.survey.responses.join(", ") });
        }
        if (q.activistCodes && q.activistCodes.length) {
            lines.push({ label: "Activist Codes", value: q.activistCodes.join(", ") });
        }
        return lines;
    }

    window.LLList = {
        getQuery: getQuery, setQuery: setQuery, clearQuery: clearQuery,
        getList: getList, isFiltered: isFiltered, describe: describe, dataFor: dataFor
    };
})();
