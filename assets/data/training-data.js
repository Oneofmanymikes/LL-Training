/* ==========================================================================
   LL-Training — master training dataset
   ----------------------------------------------------------------------------
   Single source of truth for the mock. Loaded as a plain <script> (so it works
   when pages are opened directly from disk) and exposes two globals:

     window.TRAINING_SURVEY_QUESTIONS  – survey questions -> response options
     window.TRAINING_CONTACTS          – fictional people + their survey data

   EVERYTHING HERE IS FICTIONAL. Names, addresses, phones, emails and survey
   responses are invented for staff training. Do not add real voter data.
   ========================================================================== */

/* ---- Survey questions and their valid responses ----------------------- */
window.TRAINING_SURVEY_QUESTIONS = {
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

/* ==========================================================================
   The two sides of the database
   ----------------------------------------------------------------------------
   VOTER FILE   (the "My Voters" tab)
     A static list of electors sourced from Elections Ontario. Used mainly to
     ID voters (affiliation, sign requests, GOTV). Volunteers can record
     canvass/survey responses against these records but cannot edit the core
     elector data.

   SHARED CONTACTS (the "Shared Contacts" tab)
     The committee's own editable people — most volunteers, donors and
     members live here. Records can be created and edited by volunteers.
   ========================================================================== */
window.TRAINING_DB_SIDES = {
    voterfile: {
        id: "voterfile",
        tabLabel: "My Voters",
        name: "Voter File",
        description: "Static electors from Elections Ontario. Used to ID voters; "
            + "canvass and survey responses are recorded here. Core elector data is read-only.",
        editable: false
    },
    shared: {
        id: "shared",
        tabLabel: "Shared Contacts",
        name: "Shared Contacts",
        description: "The committee's volunteers, donors and members. "
            + "Records can be created and edited by volunteers.",
        editable: true
    }
};

/* ---- VOTER FILE contacts -----------------------------------------------
   Each carries the columns shown in Quick Look Up plus a `survey` object
   keyed by question name. Single-pick questions (Affiliation, Volunteer
   Status) store one response; Sign Request stores a dated history array so
   trainees can see "past sign history".
   ------------------------------------------------------------------------ */
window.TRAINING_VOTERFILE = [
    {
        vanId: "EID0000001A", name: "Tremblay, Alice", address: "14 Maple Ave", city: "Toronto",
        zip: "M4P 1A1", age: 42, phone: "(416) 555-0142", province: "ON",
        email: "alice.t@example.com", poll: "012", seq: "0041",
        survey: {
            "2025 Affiliation: ID by Volunteer": "Liberal",
            "2029 Affiliation: ID by Volunteer": "Liberal",
            "2029 Volunteer: Volunteer Status": "Yes, Sign Me Up",
            "2026 Action: BE - Sign Request": [
                { date: "12/04/2025", response: "Sign requested" },
                { date: "20/04/2025", response: "Sign Installed" }
            ]
        }
    },
    {
        vanId: "EID0000002B", name: "Nguyen, Binh", address: "227 Birch St", city: "Scarborough",
        zip: "M1L 2B3", age: 35, phone: "(647) 555-0188", province: "ON",
        email: "", poll: "008", seq: "",
        survey: {
            "2025 Affiliation: ID by Volunteer": "Possible Liberal",
            "2029 Volunteer: Volunteer Status": "Engage Later",
            "2026 Action: BE - Sign Request": []
        }
    },
    {
        vanId: "EID0000003C", name: "Okafor, Chidi", address: "9 Cedar Cres", city: "Toronto",
        zip: "M4C 3C4", age: 28, phone: "(416) 555-0110", province: "ON",
        email: "c.okafor@example.com", poll: "012", seq: "0107",
        survey: {
            "2025 Affiliation: ID by Volunteer": "Liberal",
            "2029 Affiliation: ID by Volunteer": "Possible Liberal",
            "2029 Volunteer: Volunteer Status": "Current Volunteer",
            "2026 Action: BE - Sign Request": [
                { date: "10/04/2025", response: "Large sign requested" },
                { date: "18/04/2025", response: "Large sign installed" },
                { date: "02/05/2025", response: "Sign Maintenance Req" },
                { date: "04/05/2025", response: "Maintenance Complete" }
            ]
        }
    },
    {
        vanId: "EID0000004D", name: "Patel, Deepa", address: "1530 Danforth Ave", city: "Toronto",
        zip: "M4J 1N4", age: 51, phone: "", province: "ON",
        email: "deepa.p@example.com", poll: "019", seq: "0233",
        survey: {
            "2025 Affiliation: ID by Volunteer": "NDP",
            "2029 Volunteer: Volunteer Status": "No",
            "2026 Action: BE - Sign Request": [
                { date: "11/04/2025", response: "Call to Confirm" },
                { date: "13/04/2025", response: "Sign Refused" }
            ]
        }
    },
    {
        vanId: "EID0000005E", name: "Smith, Evan", address: "44 Elm St", city: "Scarborough",
        zip: "M1K 5E6", age: 63, phone: "(437) 555-0173", province: "ON",
        email: "", poll: "024", seq: "0088",
        survey: {
            "2025 Affiliation: ID by Volunteer": "PC",
            "2029 Volunteer: Volunteer Status": "No",
            "2026 Action: BE - Sign Request": []
        }
    },
    {
        vanId: "EID0000006F", name: "Rossi, Franca", address: "88 Fir Rd", city: "Toronto",
        zip: "M4E 2F7", age: 47, phone: "(416) 555-0155", province: "ON",
        email: "franca.r@example.com", poll: "010", seq: "",
        survey: {
            "2025 Affiliation: ID by Volunteer": "Liberal",
            "2029 Affiliation: ID by Volunteer": "Liberal",
            "2029 Volunteer: Volunteer Status": "Yes, Sign Me Up",
            "2026 Action: BE - Sign Request": [
                { date: "09/04/2025", response: "Sign requested" },
                { date: "15/04/2025", response: "Sign Installed" },
                { date: "28/06/2025", response: "Sign Removal Request" },
                { date: "30/06/2025", response: "Sign Removed" }
            ]
        }
    },
    {
        vanId: "EID0000007G", name: "Lee, Grace", address: "301 Glen Manor Dr", city: "Toronto",
        zip: "M4E 2X4", age: 39, phone: "(647) 555-0129", province: "ON",
        email: "grace.lee@example.com", poll: "010", seq: "0150",
        survey: {
            "2025 Affiliation: ID by Volunteer": "Undecided",
            "2029 Volunteer: Volunteer Status": "Engage Later",
            "2026 Action: BE - Sign Request": [
                { date: "14/04/2025", response: "Sign requested" }
            ]
        }
    },
    {
        vanId: "EID0000008H", name: "Haddad, Hani", address: "12 Holly Lane", city: "Scarborough",
        zip: "M1N 1H2", age: 31, phone: "", province: "ON",
        email: "", poll: "008", seq: "0061",
        survey: {
            "2025 Affiliation: ID by Volunteer": "Possible Liberal",
            "2029 Volunteer: Volunteer Status": "Yes, Sign Me Up",
            "2026 Action: BE - Sign Request": [
                { date: "16/04/2025", response: "Sign requested" },
                { date: "17/04/2025", response: "Wrong Riding" }
            ]
        }
    },
    {
        vanId: "EID0000009I", name: "Murphy, Ian", address: "76 Ivy Close", city: "Toronto",
        zip: "M4M 2J9", age: 58, phone: "(416) 555-0190", province: "ON",
        email: "ian.m@example.com", poll: "019", seq: "0312",
        survey: {
            "2025 Affiliation: ID by Volunteer": "Green",
            "2029 Volunteer: Volunteer Status": "No",
            "2026 Action: BE - Sign Request": []
        }
    },
    {
        vanId: "EID0000010J", name: "Kowalski, Jana", address: "205 Juniper Blvd", city: "Scarborough",
        zip: "M1G 4K1", age: 44, phone: "(437) 555-0166", province: "ON",
        email: "jana.k@example.com", poll: "024", seq: "",
        survey: {
            "2025 Affiliation: ID by Volunteer": "Liberal",
            "2029 Affiliation: ID by Volunteer": "Possible Liberal",
            "2029 Volunteer: Volunteer Status": "Current Volunteer",
            "2026 Action: BE - Sign Request": [
                { date: "08/04/2025", response: "Large sign requested" },
                { date: "19/04/2025", response: "Large sign installed" }
            ]
        }
    }
];

/* Back-compat alias: earlier code referenced TRAINING_CONTACTS. */
window.TRAINING_CONTACTS = window.TRAINING_VOTERFILE;

/* ---- SHARED CONTACTS -----------------------------------------------------
   The committee's editable people: volunteers, donors and members. These are
   not Elections Ontario electors — they are records the committee maintains.
   `contactTypes` flags how each person relates to the committee.
   -------------------------------------------------------------------------- */
window.TRAINING_SHARED = [
    {
        contactId: "SC0000001A", name: "Tremblay, Alice", address: "14 Maple Ave", city: "Toronto",
        zip: "M4P 1A1", phone: "(416) 555-0142", email: "alice.t@example.com",
        contactTypes: ["Volunteer", "Member"], volunteerStatus: "Current Volunteer",
        membership: "Member 2025", lastDonation: { date: "03/02/2025", amount: "$100.00" }
    },
    {
        contactId: "SC0000002B", name: "Okafor, Chidi", address: "9 Cedar Cres", city: "Toronto",
        zip: "M4C 3C4", phone: "(416) 555-0110", email: "c.okafor@example.com",
        contactTypes: ["Volunteer"], volunteerStatus: "Current Volunteer",
        membership: "", lastDonation: null
    },
    {
        contactId: "SC0000003C", name: "Rossi, Franca", address: "88 Fir Rd", city: "Toronto",
        zip: "M4E 2F7", phone: "(416) 555-0155", email: "franca.r@example.com",
        contactTypes: ["Volunteer", "Donor"], volunteerStatus: "Yes, Sign Me Up",
        membership: "", lastDonation: { date: "18/01/2025", amount: "$250.00" }
    },
    {
        contactId: "SC0000004D", name: "Kowalski, Jana", address: "205 Juniper Blvd", city: "Scarborough",
        zip: "M1G 4K1", phone: "(437) 555-0166", email: "jana.k@example.com",
        contactTypes: ["Volunteer", "Member"], volunteerStatus: "Current Volunteer",
        membership: "Member 2025", lastDonation: { date: "22/11/2024", amount: "$50.00" }
    },
    {
        contactId: "SC0000005E", name: "Andersson, Mark", address: "640 King St W", city: "Toronto",
        zip: "M5V 1M7", phone: "(416) 555-0201", email: "m.andersson@example.com",
        contactTypes: ["Donor"], volunteerStatus: "No",
        membership: "", lastDonation: { date: "05/03/2025", amount: "$500.00" }
    },
    {
        contactId: "SC0000006F", name: "Bianchi, Sofia", address: "77 Roncesvalles Ave", city: "Toronto",
        zip: "M6R 2K9", phone: "(647) 555-0212", email: "sofia.b@example.com",
        contactTypes: ["Member"], volunteerStatus: "Engage Later",
        membership: "Member 2024", lastDonation: null
    },
    {
        contactId: "SC0000007G", name: "Osei, Daniel", address: "300 Markham Rd", city: "Scarborough",
        zip: "M1J 3C5", phone: "(437) 555-0223", email: "daniel.osei@example.com",
        contactTypes: ["Volunteer", "Donor", "Member"], volunteerStatus: "Current Volunteer",
        membership: "Member 2025", lastDonation: { date: "12/02/2025", amount: "$75.00" }
    },
    {
        contactId: "SC0000008H", name: "Wong, Emily", address: "18 Finch Ave E", city: "Toronto",
        zip: "M2N 4R8", phone: "(416) 555-0234", email: "emily.wong@example.com",
        contactTypes: ["Volunteer"], volunteerStatus: "Yes, Sign Me Up",
        membership: "", lastDonation: null
    }
];
