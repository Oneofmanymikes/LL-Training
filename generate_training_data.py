#!/usr/bin/env python3
"""Generate 100 fake voter records for the Liberalist training project.

All data is synthetic:
  - Phone numbers use the 555 exchange (reserved for fiction).
  - Emails use the example.com / example.org domains (RFC 2606 reserved).

Some fields are intentionally left blank to simulate incomplete records.
"""

import csv
import random

random.seed(42)  # reproducible output

FIRST_NAMES = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael",
    "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan",
    "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher",
    "Nancy", "Daniel", "Lisa", "Matthew", "Margaret", "Anthony", "Betty",
    "Mark", "Sandra", "Donald", "Ashley", "Steven", "Dorothy", "Paul",
    "Kimberly", "Andrew", "Emily", "Joshua", "Donna", "Kenneth", "Michelle",
    "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward",
    "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Aisha", "Mohammed", "Priya",
    "Wei", "Sofia", "Diego", "Fatima", "Liam", "Olivia", "Noah",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
    "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
    "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
    "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
    "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Patel", "Singh", "Chen", "Kim", "Khan",
    "Murphy", "Cook", "Bailey", "Cooper", "Richardson",
]

STREETS = [
    "Maple Ave", "Oak St", "Main St", "Elm St", "Cedar Rd", "Pine St",
    "Birch Ln", "Willow Way", "King St", "Queen St", "Bay St", "Front St",
    "Dundas St", "College St", "Bloor St", "Yonge St", "Lakeshore Blvd",
]

DONOR_STATUSES = ["", "", "$25", "$50", "$100", "$250", "$500", "$1,000",
                  "$50 (monthly)", "$100 (monthly)", "Lapsed", "Declined"]

VOTER_ID_STATUSES = ["", "", "Strong Support", "Support", "Lean Support",
                     "Undecided", "Lean Against", "Against", "Do Not Contact",
                     "Moved"]

SIGN_REQUESTS = ["", "", "", "Requested - Pending", "Requested - Delivered",
                 "Lawn Sign", "Large Sign", "Window Sign", "Removed", "Declined"]

VOLUNTEER_STATUSES = ["", "", "", "Interested", "Active", "Canvasser",
                      "Phone Bank", "Driver", "Data Entry", "Inactive",
                      "Lead Volunteer"]


def blankable(value, blank_chance=0.0):
    """Return value, or "" with the given probability (extra incompleteness)."""
    if random.random() < blank_chance:
        return ""
    return value


def main():
    rows = []
    used_ids = set()

    for i in range(100):
        # Unique voter ID, e.g. LL-100042
        while True:
            vid = f"LL-{random.randint(100000, 999999)}"
            if vid not in used_ids:
                used_ids.add(vid)
                break

        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)

        # Fictional 555 phone number: (555) 01XX-XXXX style kept clearly fake
        phone = blankable(
            f"(555) 555-{random.randint(0, 9999):04d}", blank_chance=0.12
        )

        # Fictional email on a reserved domain
        domain = random.choice(["example.com", "example.org", "example.net"])
        email = blankable(
            f"{first.lower()}.{last.lower()}{random.randint(1, 99)}@{domain}",
            blank_chance=0.15,
        )

        donor = random.choice(DONOR_STATUSES)
        voter_id = random.choice(VOTER_ID_STATUSES)
        sign = random.choice(SIGN_REQUESTS)
        volunteer = random.choice(VOLUNTEER_STATUSES)

        rows.append({
            "Voter ID": vid,
            "First Name": first,
            "Last Name": last,
            "Phone": phone,
            "Email": email,
            "Donor Records": donor,
            "Voter ID Records": voter_id,
            "Sign Requests": sign,
            "Volunteer Status": volunteer,
        })

    fieldnames = [
        "Voter ID", "First Name", "Last Name", "Phone", "Email",
        "Donor Records", "Voter ID Records", "Sign Requests", "Volunteer Status",
    ]

    with open("training_data.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} records to training_data.csv")


if __name__ == "__main__":
    main()
