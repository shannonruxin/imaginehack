import { internalMutation } from "./_generated/server";

const d = (iso: string) => new Date(iso).getTime();

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    // ── 1. CLIENTS ──────────────────────────────────────────────────────────

    const c0 = await ctx.db.insert("clients", {
      name: "Ahmad Fariz bin Razali",
      age: 34,
      number: "+60112345678",
      nationality: "Malaysian",
      email: "ahmad.fariz@gmail.com",
      occupation: "Software Engineer",
      income_range: "RM 8,000–12,000",
      known_family_members: ["Nurul Hidayah (wife)", "Irfan (son, 3)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [
        { policy_id: "POL-001", name: "Term Life Basic", type: "term_life", start_date: "2021-03-01", beneficiaries: ["Nurul Hidayah"] },
      ],
      financial_goals: ["children education fund", "mortgage protection"],
      sales_opportunities: ["critical illness rider", "education endowment"],
      platforms: [],
      created_at: d("2026-03-20"),
    });

    const c1 = await ctx.db.insert("clients", {
      name: "Nurul Ain binti Sulaiman",
      age: 29,
      number: "+60123456789",
      nationality: "Malaysian",
      email: "nurulain@outlook.com",
      occupation: "Primary School Teacher",
      income_range: "RM 4,000–6,000",
      known_family_members: ["Hafiz (husband)"],
      marital_status: "married",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["maternity coverage", "savings plan"],
      sales_opportunities: ["maternity rider", "whole life policy"],
      platforms: [],
      created_at: d("2026-03-22"),
    });

    const c2 = await ctx.db.insert("clients", {
      name: "Mohd Rizal bin Othman",
      age: 42,
      number: "+60134567890",
      nationality: "Malaysian",
      email: "rizal.othman@yahoo.com",
      occupation: "Civil Servant",
      income_range: "RM 5,000–7,000",
      known_family_members: ["Rashidah (wife)", "Adam (son, 10)", "Alysha (daughter, 7)"],
      marital_status: "married",
      no_of_dependents: 3,
      existing_policies: [
        { policy_id: "POL-002", name: "Family Takaful", type: "takaful", start_date: "2018-06-01", beneficiaries: ["Rashidah"] },
      ],
      financial_goals: ["retirement planning", "children university fund"],
      sales_opportunities: ["retirement annuity", "unit trust top-up"],
      platforms: [],
      created_at: d("2026-03-25"),
    });

    const c3 = await ctx.db.insert("clients", {
      name: "Siti Hajar binti Mahmud",
      age: 31,
      number: "+60145678901",
      nationality: "Malaysian",
      email: "sitihajar.m@gmail.com",
      occupation: "Pharmacist",
      income_range: "RM 7,000–10,000",
      known_family_members: ["Azhar (fiancé)"],
      marital_status: "engaged",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["wedding savings", "joint life plan post-marriage"],
      sales_opportunities: ["joint life policy", "critical illness plan"],
      platforms: [],
      created_at: d("2026-03-28"),
    });

    const c4 = await ctx.db.insert("clients", {
      name: "Zainal Abidin bin Hamid",
      age: 51,
      number: "+60156789012",
      nationality: "Malaysian",
      email: "zainal.hamid@proton.me",
      occupation: "Business Owner",
      income_range: "RM 20,000–30,000",
      known_family_members: ["Rohani (wife)", "Zulaikha (daughter, 23)", "Zulhilmi (son, 20)"],
      marital_status: "married",
      no_of_dependents: 1,
      existing_policies: [
        { policy_id: "POL-003", name: "Executive Term", type: "term_life", start_date: "2015-01-15", end_date: "2030-01-15", beneficiaries: ["Rohani"] },
        { policy_id: "POL-004", name: "Business Keyman", type: "keyman", start_date: "2019-04-01", beneficiaries: ["Zainal Abidin Sdn Bhd"] },
      ],
      financial_goals: ["business succession", "estate planning"],
      sales_opportunities: ["trust nomination update", "legacy plan"],
      platforms: [],
      created_at: d("2026-04-01"),
    });

    const c5 = await ctx.db.insert("clients", {
      name: "Farah Nadia binti Aziz",
      age: 27,
      number: "+60167890123",
      nationality: "Malaysian",
      email: "farahnadia.aziz@gmail.com",
      occupation: "Digital Marketing Executive",
      income_range: "RM 4,500–6,500",
      known_family_members: [],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["emergency fund", "investment-linked plan"],
      sales_opportunities: ["ILP", "hospital & surgical"],
      platforms: [],
      created_at: d("2026-04-03"),
    });

    const c6 = await ctx.db.insert("clients", {
      name: "Khairul Anwar bin Zainudin",
      age: 38,
      number: "+60178901234",
      nationality: "Malaysian",
      email: "khairul.zainudin@work.com",
      occupation: "IT Manager",
      income_range: "RM 10,000–15,000",
      known_family_members: ["Syafiqah (wife)", "Mia (daughter, 5)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [
        { policy_id: "POL-005", name: "Whole Life Plus", type: "whole_life", start_date: "2020-07-01", beneficiaries: ["Syafiqah"] },
      ],
      financial_goals: ["school fees buffer", "passive income"],
      sales_opportunities: ["education endowment top-up", "annuity"],
      platforms: [],
      created_at: d("2026-04-05"),
    });

    const c7 = await ctx.db.insert("clients", {
      name: "Amirah Zulaikha binti Nasir",
      age: 33,
      number: "+60189012345",
      nationality: "Malaysian",
      email: "amirah.zulaikha@gmail.com",
      occupation: "HR Manager",
      income_range: "RM 7,000–9,000",
      known_family_members: ["Irwan (husband)", "Dania (daughter, 2)"],
      marital_status: "married",
      no_of_dependents: 1,
      existing_policies: [],
      financial_goals: ["second child planning", "life coverage upgrade"],
      sales_opportunities: ["maternity rider", "child critical illness"],
      platforms: [],
      created_at: d("2026-04-08"),
    });

    const c8 = await ctx.db.insert("clients", {
      name: "Hafizuddin bin Kamarudin",
      age: 45,
      number: "+60190123456",
      nationality: "Malaysian",
      email: "hafiz.kamarudin@hotmail.com",
      occupation: "Senior Accountant",
      income_range: "RM 9,000–12,000",
      known_family_members: ["Zarina (wife)", "Arif (son, 15)", "Alya (daughter, 12)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [
        { policy_id: "POL-006", name: "Retirement Saver", type: "endowment", start_date: "2014-03-01", end_date: "2034-03-01", beneficiaries: ["Zarina"] },
      ],
      financial_goals: ["early retirement at 55", "university fund top-up"],
      sales_opportunities: ["retirement booster", "medical card upgrade"],
      platforms: [],
      created_at: d("2026-04-10"),
    });

    const c9 = await ctx.db.insert("clients", {
      name: "Nabilah binti Roslan",
      age: 26,
      number: "+60112109876",
      nationality: "Malaysian",
      email: "nabilah.roslan@gmail.com",
      occupation: "Fresh Graduate / Junior Engineer",
      income_range: "RM 3,000–4,500",
      known_family_members: [],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["first job protection", "savings starter"],
      sales_opportunities: ["starter term plan", "PA coverage"],
      platforms: [],
      created_at: d("2026-04-12"),
    });

    // Singapore
    const c10 = await ctx.db.insert("clients", {
      name: "Wei Ling Tan",
      age: 36,
      number: "+6591234567",
      nationality: "Singaporean",
      email: "weiling.tan@gmail.com",
      occupation: "Financial Analyst",
      income_range: "SGD 7,000–10,000",
      known_family_members: ["David Tan (husband)", "Ethan (son, 4)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [
        { policy_id: "POL-SG-001", name: "DPS Enhanced", type: "term_life", start_date: "2020-01-01", beneficiaries: ["David Tan"] },
      ],
      financial_goals: ["HDB mortgage protection", "children Medisave top-up"],
      sales_opportunities: ["CI plan upgrade", "whole life for child"],
      platforms: [],
      created_at: d("2026-03-21"),
    });

    const c11 = await ctx.db.insert("clients", {
      name: "Jun Xian Lim",
      age: 30,
      number: "+6592345678",
      nationality: "Singaporean",
      email: "junxian.lim@outlook.sg",
      occupation: "Software Developer",
      income_range: "SGD 6,000–9,000",
      known_family_members: ["Rachel (girlfriend)"],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["BTO flat savings", "investment growth"],
      sales_opportunities: ["ILP", "term plan pre-marriage"],
      platforms: [],
      created_at: d("2026-03-24"),
    });

    const c12 = await ctx.db.insert("clients", {
      name: "Priya Sharma",
      age: 40,
      number: "+6593456789",
      nationality: "Singaporean",
      email: "priya.sharma@corp.sg",
      occupation: "Project Manager",
      income_range: "SGD 10,000–14,000",
      known_family_members: ["Raj (husband)", "Arjun (son, 8)", "Meera (daughter, 5)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [
        { policy_id: "POL-SG-002", name: "Great Eastern Flexi", type: "whole_life", start_date: "2016-05-01", beneficiaries: ["Raj Sharma"] },
      ],
      financial_goals: ["CI early payout", "overseas education fund"],
      sales_opportunities: ["CI booster", "education endowment"],
      platforms: [],
      created_at: d("2026-04-02"),
    });

    const c13 = await ctx.db.insert("clients", {
      name: "Raj Kumar",
      age: 47,
      number: "+6594567890",
      nationality: "Singaporean",
      email: "raj.kumar.sg@gmail.com",
      occupation: "Business Development Director",
      income_range: "SGD 18,000–25,000",
      known_family_members: ["Lakshmi (wife)", "Vikram (son, 19)"],
      marital_status: "married",
      no_of_dependents: 1,
      existing_policies: [
        { policy_id: "POL-SG-003", name: "Prulife Premium", type: "whole_life", start_date: "2010-03-01", beneficiaries: ["Lakshmi Kumar"] },
        { policy_id: "POL-SG-004", name: "AIA CI Protector", type: "critical_illness", start_date: "2017-09-01", beneficiaries: ["Lakshmi Kumar"] },
      ],
      financial_goals: ["retirement at 60", "legacy trust"],
      sales_opportunities: ["trust nomination", "annuity plan"],
      platforms: [],
      created_at: d("2026-04-04"),
    });

    const c14 = await ctx.db.insert("clients", {
      name: "Mei Yin Chen",
      age: 32,
      number: "+6595678901",
      nationality: "Singaporean",
      email: "meiyin.chen@startup.io",
      occupation: "Product Designer",
      income_range: "SGD 6,500–9,500",
      known_family_members: [],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["income protection", "health coverage"],
      sales_opportunities: ["hospital plan", "disability income"],
      platforms: [],
      created_at: d("2026-04-06"),
    });

    const c15 = await ctx.db.insert("clients", {
      name: "Bryan Ng",
      age: 35,
      number: "+6596789012",
      nationality: "Singaporean",
      email: "bryan.ng.sg@gmail.com",
      occupation: "Operations Manager",
      income_range: "SGD 8,000–11,000",
      known_family_members: ["Cindy (wife)", "Lucas (son, 1)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [
        { policy_id: "POL-SG-005", name: "NTUC Income Star", type: "whole_life", start_date: "2019-11-01", beneficiaries: ["Cindy Ng"] },
      ],
      financial_goals: ["second child ready", "mortgage cover"],
      sales_opportunities: ["maternity plan", "mortgage term"],
      platforms: [],
      created_at: d("2026-04-09"),
    });

    const c16 = await ctx.db.insert("clients", {
      name: "Sarah Ho",
      age: 28,
      number: "+6597890123",
      nationality: "Singaporean",
      email: "sarah.ho.sg@gmail.com",
      occupation: "Nurse",
      income_range: "SGD 4,500–6,500",
      known_family_members: [],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["healthcare gap", "savings for wedding"],
      sales_opportunities: ["integrated shield plan", "endowment plan"],
      platforms: [],
      created_at: d("2026-04-11"),
    });

    const c17 = await ctx.db.insert("clients", {
      name: "Kevin Teo",
      age: 43,
      number: "+6598901234",
      nationality: "Singaporean",
      email: "kevin.teo@finance.sg",
      occupation: "CFO",
      income_range: "SGD 20,000–30,000",
      known_family_members: ["Janet (wife)", "Chloe (daughter, 14)", "Marcus (son, 11)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [
        { policy_id: "POL-SG-006", name: "Manulife Signature", type: "whole_life", start_date: "2012-07-01", beneficiaries: ["Janet Teo"] },
      ],
      financial_goals: ["overseas university fund", "succession planning"],
      sales_opportunities: ["education endowment boost", "keyman coverage"],
      platforms: [],
      created_at: d("2026-04-13"),
    });

    // UK
    const c18 = await ctx.db.insert("clients", {
      name: "James Thompson",
      age: 39,
      number: "+447700900001",
      nationality: "British",
      email: "james.thompson@gmail.co.uk",
      occupation: "Solicitor",
      income_range: "£60,000–80,000",
      known_family_members: ["Claire (wife)", "Oliver (son, 7)", "Lily (daughter, 4)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [
        { policy_id: "POL-UK-001", name: "Legal & General Term", type: "term_life", start_date: "2019-01-01", end_date: "2039-01-01", beneficiaries: ["Claire Thompson"] },
      ],
      financial_goals: ["private school fees", "mortgage clearance"],
      sales_opportunities: ["income protection", "private medical"],
      platforms: [],
      created_at: d("2026-03-23"),
    });

    const c19 = await ctx.db.insert("clients", {
      name: "Emma Richardson",
      age: 34,
      number: "+447700900002",
      nationality: "British",
      email: "emma.richardson@protonmail.com",
      occupation: "GP Doctor",
      income_range: "£90,000–110,000",
      known_family_members: ["Tom (partner)"],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["early retirement at 50", "property portfolio"],
      sales_opportunities: ["whole of life", "CI plan"],
      platforms: [],
      created_at: d("2026-03-26"),
    });

    const c20 = await ctx.db.insert("clients", {
      name: "Oliver Bennett",
      age: 48,
      number: "+447700900003",
      nationality: "British",
      email: "oliver.bennett@outlook.com",
      occupation: "Engineering Director",
      income_range: "£85,000–105,000",
      known_family_members: ["Sophie (wife)", "Ethan (son, 18)", "Isabelle (daughter, 15)"],
      marital_status: "married",
      no_of_dependents: 1,
      existing_policies: [
        { policy_id: "POL-UK-002", name: "Aviva Whole Life", type: "whole_life", start_date: "2008-04-01", beneficiaries: ["Sophie Bennett"] },
      ],
      financial_goals: ["pension planning", "IHT mitigation"],
      sales_opportunities: ["trust arrangement", "keyman review"],
      platforms: [],
      created_at: d("2026-04-01"),
    });

    const c21 = await ctx.db.insert("clients", {
      name: "Sophie Clarke",
      age: 31,
      number: "+447700900004",
      nationality: "British",
      email: "sophie.clarke@gmail.com",
      occupation: "Marketing Manager",
      income_range: "£45,000–60,000",
      known_family_members: ["Alex (fiancé)"],
      marital_status: "engaged",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["wedding fund", "joint life plan"],
      sales_opportunities: ["joint term plan", "critical illness"],
      platforms: [],
      created_at: d("2026-04-07"),
    });

    const c22 = await ctx.db.insert("clients", {
      name: "Harry Williams",
      age: 37,
      number: "+447700900005",
      nationality: "British",
      email: "harry.williams.uk@gmail.com",
      occupation: "Architect",
      income_range: "£55,000–75,000",
      known_family_members: ["Zoe (wife)", "Finn (son, 3)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [],
      financial_goals: ["income continuity", "life cover for mortgage"],
      sales_opportunities: ["mortgage protection", "income protection"],
      platforms: [],
      created_at: d("2026-04-14"),
    });

    const c23 = await ctx.db.insert("clients", {
      name: "Charlotte Evans",
      age: 29,
      number: "+447700900006",
      nationality: "British",
      email: "charlotte.evans@hotmail.co.uk",
      occupation: "Secondary School Teacher",
      income_range: "£32,000–42,000",
      known_family_members: [],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["long-term savings", "health gap"],
      sales_opportunities: ["ISA-linked endowment", "private medical"],
      platforms: [],
      created_at: d("2026-04-16"),
    });

    const c24 = await ctx.db.insert("clients", {
      name: "Thomas Wright",
      age: 53,
      number: "+447700900007",
      nationality: "British",
      email: "thomas.wright@corp.co.uk",
      occupation: "MD / Company Owner",
      income_range: "£150,000+",
      known_family_members: ["Helen (wife)", "George (son, 25)", "Amelia (daughter, 22)"],
      marital_status: "married",
      no_of_dependents: 0,
      existing_policies: [
        { policy_id: "POL-UK-003", name: "Zurich Executive", type: "whole_life", start_date: "2005-06-01", beneficiaries: ["Helen Wright"] },
        { policy_id: "POL-UK-004", name: "Business Protection Cover", type: "keyman", start_date: "2018-02-01", beneficiaries: ["Wright & Co Ltd"] },
      ],
      financial_goals: ["business exit strategy", "estate planning"],
      sales_opportunities: ["trust review", "shareholder protection"],
      platforms: [],
      created_at: d("2026-04-18"),
    });

    const c25 = await ctx.db.insert("clients", {
      name: "Grace Patel",
      age: 35,
      number: "+447700900008",
      nationality: "British",
      email: "grace.patel@nhs.uk",
      occupation: "NHS Consultant",
      income_range: "£75,000–95,000",
      known_family_members: ["Nikhil (husband)", "Arya (daughter, 2)"],
      marital_status: "married",
      no_of_dependents: 1,
      existing_policies: [],
      financial_goals: ["second maternity leave income", "CI protection"],
      sales_opportunities: ["CI plan", "income protection"],
      platforms: [],
      created_at: d("2026-04-20"),
    });

    // US
    const c26 = await ctx.db.insert("clients", {
      name: "Marcus Johnson",
      age: 41,
      number: "+12025550101",
      nationality: "American",
      email: "marcus.johnson@gmail.com",
      occupation: "Sales Director",
      income_range: "$120,000–160,000",
      known_family_members: ["Alicia (wife)", "Jaylen (son, 12)", "Destiny (daughter, 9)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [
        { policy_id: "POL-US-001", name: "Northwestern Mutual Term", type: "term_life", start_date: "2016-08-01", end_date: "2036-08-01", beneficiaries: ["Alicia Johnson"] },
      ],
      financial_goals: ["college 529 plan", "retirement 401k top-up"],
      sales_opportunities: ["whole life conversion", "disability income"],
      platforms: [],
      created_at: d("2026-03-27"),
    });

    const c27 = await ctx.db.insert("clients", {
      name: "Ashley Williams",
      age: 33,
      number: "+12025550102",
      nationality: "American",
      email: "ashley.williams.us@gmail.com",
      occupation: "UX Researcher",
      income_range: "$85,000–110,000",
      known_family_members: ["Jordan (partner)"],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["FIRE planning", "health coverage gap"],
      sales_opportunities: ["disability income", "IUL policy"],
      platforms: [],
      created_at: d("2026-03-29"),
    });

    const c28 = await ctx.db.insert("clients", {
      name: "Tyler Brooks",
      age: 28,
      number: "+12025550103",
      nationality: "American",
      email: "tyler.brooks.atl@gmail.com",
      occupation: "Data Analyst",
      income_range: "$65,000–85,000",
      known_family_members: [],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["starter life policy", "student loan protection"],
      sales_opportunities: ["term plan", "accidental death"],
      platforms: [],
      created_at: d("2026-04-03"),
    });

    const c29 = await ctx.db.insert("clients", {
      name: "Megan Foster",
      age: 38,
      number: "+12025550104",
      nationality: "American",
      email: "megan.foster@healthcare.org",
      occupation: "Hospital Administrator",
      income_range: "$95,000–125,000",
      known_family_members: ["Steve (husband)", "Olivia (daughter, 6)", "Noah (son, 3)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [
        { policy_id: "POL-US-002", name: "Prudential VUL", type: "variable_universal_life", start_date: "2017-03-01", beneficiaries: ["Steve Foster"] },
      ],
      financial_goals: ["education fund", "mortgage payoff"],
      sales_opportunities: ["CI rider add-on", "term top-up"],
      platforms: [],
      created_at: d("2026-04-05"),
    });

    const c30 = await ctx.db.insert("clients", {
      name: "Jordan Lee",
      age: 26,
      number: "+12025550105",
      nationality: "American",
      email: "jordan.lee.nyc@gmail.com",
      occupation: "Graphic Designer",
      income_range: "$55,000–75,000",
      known_family_members: [],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["first policy", "emergency fund"],
      sales_opportunities: ["20-year term", "accidental coverage"],
      platforms: [],
      created_at: d("2026-04-08"),
    });

    const c31 = await ctx.db.insert("clients", {
      name: "Brittany Park",
      age: 35,
      number: "+12025550106",
      nationality: "American",
      email: "brittany.park@techco.com",
      occupation: "Product Manager",
      income_range: "$130,000–160,000",
      known_family_members: ["Chris (husband)", "Emma (daughter, 1)"],
      marital_status: "married",
      no_of_dependents: 2,
      existing_policies: [],
      financial_goals: ["income continuity", "second child planning"],
      sales_opportunities: ["disability plan", "maternity add-on"],
      platforms: [],
      created_at: d("2026-04-10"),
    });

    const c32 = await ctx.db.insert("clients", {
      name: "Derek Chen",
      age: 44,
      number: "+12025550107",
      nationality: "American",
      email: "derek.chen@investco.com",
      occupation: "Investment Banker",
      income_range: "$250,000+",
      known_family_members: ["Linda (wife)", "Brandon (son, 16)", "Kira (daughter, 13)"],
      marital_status: "married",
      no_of_dependents: 1,
      existing_policies: [
        { policy_id: "POL-US-003", name: "MassMutual Whole Life", type: "whole_life", start_date: "2009-10-01", beneficiaries: ["Linda Chen"] },
        { policy_id: "POL-US-004", name: "Corporate COLI", type: "coli", start_date: "2021-01-01", beneficiaries: ["Chen Capital LLC"] },
      ],
      financial_goals: ["estate minimisation", "IUL top-up"],
      sales_opportunities: ["trust structure review", "annuity rollover"],
      platforms: [],
      created_at: d("2026-04-12"),
    });

    const c33 = await ctx.db.insert("clients", {
      name: "Samantha Rivera",
      age: 30,
      number: "+12025550108",
      nationality: "American",
      email: "samantha.rivera.la@gmail.com",
      occupation: "Elementary School Teacher",
      income_range: "$50,000–65,000",
      known_family_members: [],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["pension supplement", "health gap"],
      sales_opportunities: ["supplemental health", "20-year term"],
      platforms: [],
      created_at: d("2026-04-15"),
    });

    // Mixed / Special
    const c34 = await ctx.db.insert("clients", {
      name: "Raina Haroon",
      age: 32,
      number: "+60111234567",
      nationality: "Malaysian",
      email: "raina.haroon@gmail.com",
      occupation: "Tech Entrepreneur",
      income_range: "RM 15,000–25,000",
      known_family_members: ["Zaki (husband)"],
      marital_status: "married",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["startup protection", "high-value CI plan"],
      sales_opportunities: ["business loan protection", "executive whole life"],
      platforms: [],
      created_at: d("2026-04-17"),
    });

    const c35 = await ctx.db.insert("clients", {
      name: "Shannon Choo",
      age: 29,
      number: "+6593001234",
      nationality: "Singaporean",
      email: "shannon.choo@ytlailabs.com",
      occupation: "AI Product Lead",
      income_range: "SGD 9,000–13,000",
      known_family_members: [],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["income protection for startup risk", "CI early"],
      sales_opportunities: ["disability income", "CI plan"],
      platforms: [],
      created_at: d("2026-04-19"),
    });

    const c36 = await ctx.db.insert("clients", {
      name: "Lim Xin Yi",
      age: 27,
      number: "+6594002345",
      nationality: "Singaporean",
      email: "xinyi.lim@gmail.com",
      occupation: "Biomedical Researcher",
      income_range: "SGD 5,000–7,000",
      known_family_members: [],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["research sabbatical income protection", "health plan"],
      sales_opportunities: ["integrated shield upgrade", "income protection"],
      platforms: [],
      created_at: d("2026-04-21"),
    });

    const c37 = await ctx.db.insert("clients", {
      name: "Muhammad Izzat bin Fadzillah",
      age: 30,
      number: "+60113456789",
      nationality: "Malaysian",
      email: "izzat.fadzillah@gmail.com",
      occupation: "Mechanical Engineer",
      income_range: "RM 5,500–7,500",
      known_family_members: ["Liyana (wife)"],
      marital_status: "married",
      no_of_dependents: 1,
      existing_policies: [],
      financial_goals: ["new home cover", "family plan"],
      sales_opportunities: ["MRTA", "family takaful"],
      platforms: [],
      created_at: d("2026-04-23"),
    });

    const c38 = await ctx.db.insert("clients", {
      name: "Cassandra Ng",
      age: 36,
      number: "+6595003456",
      nationality: "Singaporean",
      email: "cassandra.ng@consultancy.sg",
      occupation: "Management Consultant",
      income_range: "SGD 11,000–16,000",
      known_family_members: ["Ben (husband)", "Zara (daughter, 4)"],
      marital_status: "married",
      no_of_dependents: 1,
      existing_policies: [
        { policy_id: "POL-SG-007", name: "AIA Platinum", type: "whole_life", start_date: "2018-09-01", beneficiaries: ["Ben Ng"] },
      ],
      financial_goals: ["CI upgrade", "second property coverage"],
      sales_opportunities: ["CI booster", "home protection plan"],
      platforms: [],
      created_at: d("2026-04-25"),
    });

    const c39 = await ctx.db.insert("clients", {
      name: "Danish Afiq bin Ramli",
      age: 25,
      number: "+60114567890",
      nationality: "Malaysian",
      email: "danish.afiq@gmail.com",
      occupation: "Junior Content Creator",
      income_range: "RM 3,000–5,000",
      known_family_members: [],
      marital_status: "single",
      no_of_dependents: 0,
      existing_policies: [],
      financial_goals: ["first policy ever", "social media income protection"],
      sales_opportunities: ["starter term", "disability plan"],
      platforms: [],
      created_at: d("2026-04-27"),
    });

    // ── 2. SIGNALS ──────────────────────────────────────────────────────────

    // March signals (early, general)
    await ctx.db.insert("signals", {
      client_id: c0,
      platform: "linkedin",
      signal_type: "general_life_update",
      summary: "Ahmad Fariz posted about completing a professional certification, hinting at upskilling phase.",
      confidence: "medium",
      detected_at: d("2026-03-22"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c10,
      platform: "linkedin",
      signal_type: "promotion",
      summary: "Wei Ling Tan updated her LinkedIn title to Senior Financial Analyst.",
      confidence: "high",
      detected_at: d("2026-03-24"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c26,
      platform: "linkedin",
      signal_type: "new_job",
      summary: "Marcus Johnson listed a new position at a Fortune 500 firm starting March 2026.",
      confidence: "high",
      detected_at: d("2026-03-27"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c18,
      platform: "instagram",
      signal_type: "new_home",
      summary: "James Thompson posted photos of keys and a new front door captioned 'finally home!'",
      confidence: "high",
      detected_at: d("2026-03-28"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c2,
      platform: "instagram",
      signal_type: "general_life_update",
      summary: "Mohd Rizal shared a family holiday photo suggesting a relaxed life phase.",
      confidence: "low",
      detected_at: d("2026-03-30"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c27,
      platform: "linkedin",
      signal_type: "new_job",
      summary: "Ashley Williams announced a new senior role at a well-funded startup.",
      confidence: "high",
      detected_at: d("2026-03-31"),
      batched: false, actioned: false,
    });

    // April signals (engagements, promotions ramp up)
    await ctx.db.insert("signals", {
      client_id: c3,
      platform: "instagram",
      signal_type: "engagement",
      summary: "Siti Hajar posted engagement ring photo with caption 'He said YES 💍' on Instagram.",
      confidence: "high",
      detected_at: d("2026-04-02"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c21,
      platform: "instagram",
      signal_type: "engagement",
      summary: "Sophie Clarke announced engagement to Alex in an Instagram story with wedding dress emoji.",
      confidence: "high",
      detected_at: d("2026-04-03"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c11,
      platform: "linkedin",
      signal_type: "promotion",
      summary: "Jun Xian Lim updated title to Senior Software Engineer and shared team celebration photo.",
      confidence: "high",
      detected_at: d("2026-04-05"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c6,
      platform: "linkedin",
      signal_type: "promotion",
      summary: "Khairul Anwar shared a post celebrating his promotion to Head of IT.",
      confidence: "high",
      detected_at: d("2026-04-07"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c34,
      platform: "instagram",
      signal_type: "pregnancy",
      summary: "Raina Haroon posted a baby bump photo captioned 'little one coming soon 🤍'",
      confidence: "high",
      detected_at: d("2026-04-09"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c14,
      platform: "linkedin",
      signal_type: "new_job",
      summary: "Mei Yin Chen announced she's joining a Series B tech company as Lead Product Designer.",
      confidence: "high",
      detected_at: d("2026-04-10"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c37,
      platform: "instagram",
      signal_type: "new_home",
      summary: "Muhammad Izzat shared photos of moving boxes and a new apartment with 'new chapter' caption.",
      confidence: "high",
      detected_at: d("2026-04-11"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c19,
      platform: "instagram",
      signal_type: "engagement",
      summary: "Emma Richardson posted a ring photo with Tom, captioned 'He asked, I said YES ✨'",
      confidence: "high",
      detected_at: d("2026-04-12"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c13,
      platform: "linkedin",
      signal_type: "promotion",
      summary: "Raj Kumar updated his profile to Managing Director, APAC at his firm.",
      confidence: "high",
      detected_at: d("2026-04-13"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c28,
      platform: "linkedin",
      signal_type: "layoff",
      summary: "Tyler Brooks posted an #OpenToWork update noting his company went through a round of cuts.",
      confidence: "high",
      detected_at: d("2026-04-14"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c22,
      platform: "instagram",
      signal_type: "new_baby",
      summary: "Harry Williams posted a hospital photo: 'Finn just got a baby sister. Finn Williams 2.0 ❤️'",
      confidence: "high",
      detected_at: d("2026-04-15"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c5,
      platform: "linkedin",
      signal_type: "new_job",
      summary: "Farah Nadia updated her profile with a new Marketing Manager role at a regional brand.",
      confidence: "high",
      detected_at: d("2026-04-16"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c29,
      platform: "instagram",
      signal_type: "pregnancy",
      summary: "Megan Foster announced third pregnancy with 'Baby Foster #3 due in November' post.",
      confidence: "high",
      detected_at: d("2026-04-17"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c4,
      platform: "linkedin",
      signal_type: "relocation",
      summary: "Zainal Abidin updated his LinkedIn location to Johor Bahru, hinting at business expansion.",
      confidence: "medium",
      detected_at: d("2026-04-18"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c20,
      platform: "linkedin",
      signal_type: "promotion",
      summary: "Oliver Bennett listed VP Engineering at a FTSE 100 company, major salary jump implied.",
      confidence: "high",
      detected_at: d("2026-04-19"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c9,
      platform: "linkedin",
      signal_type: "new_job",
      summary: "Nabilah posted her first LinkedIn update about starting at a petrochemical company.",
      confidence: "high",
      detected_at: d("2026-04-20"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c35,
      platform: "linkedin",
      signal_type: "promotion",
      summary: "Shannon Choo updated title to Head of AI Products at YTL AI Labs.",
      confidence: "high",
      detected_at: d("2026-04-21"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c33,
      platform: "instagram",
      signal_type: "engagement",
      summary: "Samantha Rivera posted engagement news with caption 'Starting our forever 💍'",
      confidence: "high",
      detected_at: d("2026-04-22"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c8,
      platform: "linkedin",
      signal_type: "burnout",
      summary: "Hafizuddin shared a long post about work-life balance struggles and stepping back from hustle culture.",
      confidence: "medium",
      detected_at: d("2026-04-23"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c1,
      platform: "instagram",
      signal_type: "pregnancy",
      summary: "Nurul Ain posted a glowing bump photo: 'Baby's room is almost ready 🌸'",
      confidence: "high",
      detected_at: d("2026-04-24"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c38,
      platform: "linkedin",
      signal_type: "new_job",
      summary: "Cassandra Ng announced she's starting her own advisory boutique after leaving her firm.",
      confidence: "high",
      detected_at: d("2026-04-25"),
      batched: false, actioned: false,
    });

    // May signals (peak)
    await ctx.db.insert("signals", {
      client_id: c3,
      platform: "instagram",
      signal_type: "marriage",
      summary: "Siti Hajar posted wedding photos — married Azhar on May 3rd.",
      confidence: "high",
      detected_at: d("2026-05-04"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c12,
      platform: "instagram",
      signal_type: "pregnancy",
      summary: "Priya Sharma posted a hospital ultrasound photo: 'Baby #3 on the way!'",
      confidence: "high",
      detected_at: d("2026-05-05"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c16,
      platform: "instagram",
      signal_type: "engagement",
      summary: "Sarah Ho posted an engagement photo at Marina Bay Sands.",
      confidence: "high",
      detected_at: d("2026-05-06"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c30,
      platform: "linkedin",
      signal_type: "layoff",
      summary: "Jordan Lee's employer posted mass layoffs; Jordan confirmed in a comment they were affected.",
      confidence: "high",
      detected_at: d("2026-05-07"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c7,
      platform: "instagram",
      signal_type: "new_baby",
      summary: "Amirah Zulaikha posted: 'Welcome baby Rayyan 💙 Born May 8th' — second child arrived.",
      confidence: "high",
      detected_at: d("2026-05-09"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c25,
      platform: "instagram",
      signal_type: "pregnancy",
      summary: "Grace Patel shared a pregnancy announcement: 'Baby Patel #2 joining us in November 🌙'",
      confidence: "high",
      detected_at: d("2026-05-10"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c31,
      platform: "instagram",
      signal_type: "new_baby",
      summary: "Brittany Park posted: 'Jack arrived! Our family is now 4 ❤️' — second child born.",
      confidence: "high",
      detected_at: d("2026-05-11"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c17,
      platform: "linkedin",
      signal_type: "promotion",
      summary: "Kevin Teo updated to Group CFO, indicating a major career milestone.",
      confidence: "high",
      detected_at: d("2026-05-12"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c23,
      platform: "instagram",
      signal_type: "marriage",
      summary: "Charlotte Evans posted wedding photos — married her partner of 4 years.",
      confidence: "high",
      detected_at: d("2026-05-13"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c32,
      platform: "linkedin",
      signal_type: "layoff",
      summary: "Derek Chen's bank announced a restructuring; Derek's division was dissolved per LinkedIn comments.",
      confidence: "medium",
      detected_at: d("2026-05-14"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c15,
      platform: "instagram",
      signal_type: "new_baby",
      summary: "Bryan Ng posted: 'Baby girl Isla is here 🌸 Our family just doubled in love.'",
      confidence: "high",
      detected_at: d("2026-05-15"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c39,
      platform: "instagram",
      signal_type: "new_job",
      summary: "Danish Afiq posted about signing with a brand deal agency — major income shift.",
      confidence: "medium",
      detected_at: d("2026-05-16"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c0,
      platform: "linkedin",
      signal_type: "promotion",
      summary: "Ahmad Fariz updated his title to Lead Engineer, implying higher income.",
      confidence: "high",
      detected_at: d("2026-05-17"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c24,
      platform: "legacy",
      signal_type: "general_life_update",
      summary: "Thomas Wright's company announced a major asset sale — potential business wind-down.",
      confidence: "medium",
      detected_at: d("2026-05-18"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c36,
      platform: "linkedin",
      signal_type: "new_job",
      summary: "Lim Xin Yi announced she's starting a biotech PhD at NUS — major life/income change.",
      confidence: "high",
      detected_at: d("2026-05-19"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c2,
      platform: "instagram",
      signal_type: "new_baby",
      summary: "Mohd Rizal posted a birth announcement: 'Welcome to the world, baby Aisyah 🌸' — third child.",
      confidence: "high",
      detected_at: d("2026-05-20"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c19,
      platform: "instagram",
      signal_type: "marriage",
      summary: "Emma Richardson posted wedding photos — married Tom in a countryside ceremony.",
      confidence: "high",
      detected_at: d("2026-05-22"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c21,
      platform: "instagram",
      signal_type: "marriage",
      summary: "Sophie Clarke posted wedding day photos — married Alex in a London registry.",
      confidence: "high",
      detected_at: d("2026-05-24"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c5,
      platform: "instagram",
      signal_type: "relocation",
      summary: "Farah Nadia posted 'Selamat datang KL! New city, new chapter 🏙️'",
      confidence: "high",
      detected_at: d("2026-05-25"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c26,
      platform: "linkedin",
      signal_type: "promotion",
      summary: "Marcus Johnson announced Regional VP title following strong Q1 performance.",
      confidence: "high",
      detected_at: d("2026-05-26"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c34,
      platform: "legacy",
      signal_type: "general_life_update",
      summary: "Legacy.com search shows an obituary for Raina Haroon's father-in-law — family bereavement.",
      confidence: "medium",
      detected_at: d("2026-05-28"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c8,
      platform: "linkedin",
      signal_type: "layoff",
      summary: "Hafizuddin posted that his firm announced a 15% headcount reduction — he appears impacted.",
      confidence: "high",
      detected_at: d("2026-05-29"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c1,
      platform: "instagram",
      signal_type: "new_baby",
      summary: "Nurul Ain posted: 'Adam Hakimi arrived on May 30 💙 We are over the moon.'",
      confidence: "high",
      detected_at: d("2026-05-30"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c33,
      platform: "instagram",
      signal_type: "marriage",
      summary: "Samantha Rivera married her fiancé in a small backyard ceremony — posted wedding album.",
      confidence: "high",
      detected_at: d("2026-05-31"),
      batched: false, actioned: false,
    });

    // June signals (urgent)
    await ctx.db.insert("signals", {
      client_id: c37,
      platform: "instagram",
      signal_type: "new_baby",
      summary: "Muhammad Izzat posted: 'Alhamdulillah — baby Umar is here! Born June 2 🌙'",
      confidence: "high",
      detected_at: d("2026-06-02"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c29,
      platform: "linkedin",
      signal_type: "layoff",
      summary: "Megan Foster's hospital network announced layoffs. Her LinkedIn went silent — confirmed affected in a comment.",
      confidence: "high",
      detected_at: d("2026-06-03"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c11,
      platform: "instagram",
      signal_type: "engagement",
      summary: "Jun Xian Lim posted an engagement photo with Rachel at Gardens by the Bay.",
      confidence: "high",
      detected_at: d("2026-06-04"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c38,
      platform: "linkedin",
      signal_type: "promotion",
      summary: "Cassandra Ng announced she secured seed funding for her advisory boutique.",
      confidence: "high",
      detected_at: d("2026-06-05"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c31,
      platform: "linkedin",
      signal_type: "layoff",
      summary: "Brittany Park's employer announced layoffs in product division. She added #OpenToWork tag.",
      confidence: "high",
      detected_at: d("2026-06-07"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c12,
      platform: "instagram",
      signal_type: "new_baby",
      summary: "Priya Sharma posted: 'Baby Kavya arrived 3 weeks early! Everyone is safe and healthy 🙏'",
      confidence: "high",
      detected_at: d("2026-06-08"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c25,
      platform: "linkedin",
      signal_type: "promotion",
      summary: "Grace Patel announced appointment as Consultant Lead — significant pay rise.",
      confidence: "high",
      detected_at: d("2026-06-09"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c27,
      platform: "instagram",
      signal_type: "pregnancy",
      summary: "Ashley Williams posted a pregnancy reveal: 'Our tiny surprise — due December 2026 🌟'",
      confidence: "high",
      detected_at: d("2026-06-10"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c6,
      platform: "instagram",
      signal_type: "new_baby",
      summary: "Khairul Anwar posted: 'Baby no. 2 is here! Welcoming baby Aidan 💙'",
      confidence: "high",
      detected_at: d("2026-06-11"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c32,
      platform: "linkedin",
      signal_type: "new_job",
      summary: "Derek Chen posted that he's joined a boutique M&A firm as Partner.",
      confidence: "high",
      detected_at: d("2026-06-12"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c0,
      platform: "instagram",
      signal_type: "new_baby",
      summary: "Ahmad Fariz posted a newborn photo: 'Baby Aisyah joined us! 💕 Born June 13.'",
      confidence: "high",
      detected_at: d("2026-06-13"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c36,
      platform: "instagram",
      signal_type: "engagement",
      summary: "Lim Xin Yi posted an engagement announcement — engaged to her lab partner.",
      confidence: "high",
      detected_at: d("2026-06-14"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c4,
      platform: "legacy",
      signal_type: "general_life_update",
      summary: "Legacy.com obituary for Zainal Abidin's business partner — business succession risk.",
      confidence: "medium",
      detected_at: d("2026-06-15"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c9,
      platform: "instagram",
      signal_type: "engagement",
      summary: "Nabilah posted an engagement photo: 'Said yes to my bestfriend ✨'",
      confidence: "high",
      detected_at: d("2026-06-16"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c28,
      platform: "linkedin",
      signal_type: "new_job",
      summary: "Tyler Brooks posted about starting a new data role at a health-tech startup.",
      confidence: "high",
      detected_at: d("2026-06-17"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c39,
      platform: "linkedin",
      signal_type: "layoff",
      summary: "Danish Afiq's brand agency announced closure — he is now fully freelance.",
      confidence: "high",
      detected_at: d("2026-06-18"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c34,
      platform: "instagram",
      signal_type: "new_baby",
      summary: "Raina Haroon posted: 'Our daughter Alya is here 🌸 Born June 19. We are so in love.'",
      confidence: "high",
      detected_at: d("2026-06-19"),
      batched: false, actioned: false,
    });

    await ctx.db.insert("signals", {
      client_id: c24,
      platform: "linkedin",
      signal_type: "layoff",
      summary: "Thomas Wright announced he's stepped down as MD following company acquisition — income disruption.",
      confidence: "high",
      detected_at: d("2026-06-20"),
      batched: false, actioned: false,
    });

    // ── 3. OUTREACH BATCHES ──────────────────────────────────────────────────

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W13",
      batch_sales_angle: "New job = income jump — time to upgrade coverage before lifestyle inflation sets in.",
      created_at: d("2026-03-28"),
      clients: [
        { client_id: c10, notes: "Wei Ling just got promoted — pitch Senior CI plan & policy review.", outreached: true },
        { client_id: c26, notes: "Marcus started at Fortune 500 — group benefits gap likely. Push disability + whole life.", outreached: true },
        { client_id: c27, notes: "Ashley moved to a startup — no corporate safety net. Disability income urgent.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W14",
      batch_sales_angle: "New home purchase — mortgage protection gap is the #1 risk for young couples.",
      created_at: d("2026-04-02"),
      clients: [
        { client_id: c18, notes: "James just bought a home — MPPI and income protection needed immediately.", outreached: true },
        { client_id: c37, notes: "Izzat moved to a new apartment — MRTA + family takaful conversation starter.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W15",
      batch_sales_angle: "Engagement season — couples planning marriage are the best time to set up joint protection.",
      created_at: d("2026-04-06"),
      clients: [
        { client_id: c3, notes: "Siti Hajar just got engaged — joint life plan and critical illness discussion.", outreached: true },
        { client_id: c21, notes: "Sophie Clarke engaged to Alex — joint term and CI plan before wedding.", outreached: true },
        { client_id: c19, notes: "Emma Richardson engaged — she's a GP, premium policies make sense. Whole of life review.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W16",
      batch_sales_angle: "Pregnancy announcements — new parents need upgraded life and medical coverage before baby arrives.",
      created_at: d("2026-04-12"),
      clients: [
        { client_id: c34, notes: "Raina is pregnant — maternity rider urgent. Also review business protection.", outreached: true },
        { client_id: c1, notes: "Nurul Ain announced pregnancy — full family plan review needed.", outreached: true },
        { client_id: c29, notes: "Megan expecting baby #3 — existing VUL may not cover adequately, top-up conversation.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W17",
      batch_sales_angle: "Career promotions — higher income means bigger estate gap and tax exposure.",
      created_at: d("2026-04-18"),
      clients: [
        { client_id: c6, notes: "Khairul promoted to Head of IT — review existing whole life sum assured.", outreached: true },
        { client_id: c11, notes: "Jun Xian now Senior SWE — income growing, time to introduce ILP and term upgrade.", outreached: true },
        { client_id: c13, notes: "Raj Kumar moved to MD — annuity + legacy trust conversation now highly relevant.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W18",
      batch_sales_angle: "New baby arrivals — families just expanded; coverage must grow with them.",
      created_at: d("2026-04-20"),
      clients: [
        { client_id: c22, notes: "Harry Williams has second child — now 2 dependents, mortgage + child CI needed.", outreached: true },
        { client_id: c7, notes: "Amirah's baby Rayyan just arrived — full family plan review, second child rider.", outreached: true },
        { client_id: c15, notes: "Bryan Ng's baby Isla arrived — second child CI and education endowment.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W19",
      batch_sales_angle: "Job loss = income gap — clients who just lost jobs need short-term income protection review.",
      created_at: d("2026-04-19"),
      clients: [
        { client_id: c28, notes: "Tyler was laid off — review existing coverage, intro redundancy protection concept.", outreached: true },
        { client_id: c30, notes: "Jordan laid off — term plan needs reassessment, cash flow tight.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W20",
      batch_sales_angle: "May marriages — newly married couples need joint protection plans before honeymoon ends.",
      created_at: d("2026-05-06"),
      clients: [
        { client_id: c3, notes: "Siti Hajar just married Azhar — now is the time to convert to joint life policy.", outreached: true },
        { client_id: c23, notes: "Charlotte Evans married — new joint household income, intro combined cover.", outreached: true },
        { client_id: c33, notes: "Samantha Rivera married — new shared financial obligations, family plan conversation.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W21",
      batch_sales_angle: "May new babies — expanded families need immediate policy reviews.",
      created_at: d("2026-05-14"),
      clients: [
        { client_id: c2, notes: "Rizal's third child Aisyah arrived — family takaful coverage review for 3 children.", outreached: true },
        { client_id: c31, notes: "Brittany's second baby Jack arrived — also on maternity leave, income gap urgent.", outreached: true },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W22",
      batch_sales_angle: "Q2 layoffs — protect income now before savings run dry.",
      created_at: d("2026-05-30"),
      clients: [
        { client_id: c8, notes: "Hafizuddin laid off at 45 — retirement savings at risk, annuity review critical.", outreached: true },
        { client_id: c32, notes: "Derek's division dissolved — COLI and estate plan review given high net worth.", outreached: false },
        { client_id: c29, notes: "Megan Foster affected by hospital layoffs — pregnant + no income, urgent protection gap.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W23",
      batch_sales_angle: "June babies — new arrivals demand same-week policy review.",
      created_at: d("2026-06-04"),
      clients: [
        { client_id: c37, notes: "Baby Umar arrived June 2 — MRTA + family takaful upgrade conversation.", outreached: true },
        { client_id: c6, notes: "Baby Aidan arrived June 11 — second child rider and education endowment now.", outreached: false },
        { client_id: c0, notes: "Ahmad Fariz's newborn Aisyah June 13 — just promoted too, best outreach moment.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W24",
      batch_sales_angle: "June engagements — act fast before wedding planning consumes their attention.",
      created_at: d("2026-06-06"),
      clients: [
        { client_id: c11, notes: "Jun Xian just got engaged — pre-wedding joint plan conversation.", outreached: true },
        { client_id: c9, notes: "Nabilah engaged — young and just started working, first proper policy now.", outreached: false },
        { client_id: c36, notes: "Xin Yi engaged — PhD + engagement = major transition, income protection needed.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W25",
      batch_sales_angle: "June layoffs — high urgency, clients may be scrambling. Compassionate outreach.",
      created_at: d("2026-06-10"),
      clients: [
        { client_id: c31, notes: "Brittany hit with layoff after second baby — extreme income gap, urgent review.", outreached: false },
        { client_id: c39, notes: "Danish agency folded — freelancer with no safety net, intro starter protection plan.", outreached: false },
        { client_id: c24, notes: "Thomas stepped down as MD — HNW client, estate and succession now urgent.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W26",
      batch_sales_angle: "Raina & Ashley — pregnancy + career milestone dual trigger for comprehensive plan review.",
      created_at: d("2026-06-14"),
      clients: [
        { client_id: c34, notes: "Raina's baby Alya arrived June 19 — second conversation, close the maternity + CI deal.", outreached: false },
        { client_id: c27, notes: "Ashley pregnant and career ascending — disability + maternity add-on urgent.", outreached: false },
      ],
    });

    await ctx.db.insert("outreach_batches", {
      week_of: "2026-W27",
      batch_sales_angle: "Priya + Grace — high-income professional new mothers, CI upgrade is the close.",
      created_at: d("2026-06-17"),
      clients: [
        { client_id: c12, notes: "Priya's baby Kavya arrived early — existing plan insufficient, CI boost pitch.", outreached: false },
        { client_id: c25, notes: "Grace promoted and pregnant — dual income milestone + second child, full review.", outreached: false },
      ],
    });

    // ── 4. PROJECTS ──────────────────────────────────────────────────────────

    await ctx.db.insert("projects", {
      name: "Young Families Drive 2026",
      sales_angle: "Capture new-parent and expecting-parent segments before competitors. Focus on maternity riders, child CI, and education endowments.",
      created_at: d("2026-04-15"),
      clients: [
        { client_id: c0, notes: "New baby + promotion. Priority close for full family plan.", status: "contacted", outreached: true },
        { client_id: c1, notes: "First baby. Maternity rider and whole life combo.", status: "responded", outreached: true },
        { client_id: c7, notes: "Second baby arrived. Review existing coverage.", status: "contacted", outreached: true },
        { client_id: c15, notes: "Second baby. New mortgage + two kids = urgent.", status: "pending", outreached: false },
        { client_id: c22, notes: "Second child. Mortgage protection needed.", status: "pending", outreached: false },
        { client_id: c29, notes: "Third pregnancy + layoff — critical case.", status: "contacted", outreached: true },
        { client_id: c31, notes: "Second baby + layoff. Extreme income gap.", status: "contacted", outreached: true },
        { client_id: c34, notes: "First baby arrived June 19. Business protection + maternity close.", status: "responded", outreached: true },
        { client_id: c37, notes: "First baby Umar. MRTA + takaful upgrade.", status: "contacted", outreached: true },
      ],
    });

    await ctx.db.insert("projects", {
      name: "Career Milestone Outreach",
      sales_angle: "Target clients who recently changed jobs, got promoted, or started businesses. Higher income = bigger gap. Strike before lifestyle inflation absorbs the surplus.",
      created_at: d("2026-04-22"),
      clients: [
        { client_id: c5, notes: "Promoted to Marketing Manager. First proper policy opportunity.", status: "pending", outreached: false },
        { client_id: c6, notes: "Head of IT. Existing whole life review + top-up.", status: "contacted", outreached: true },
        { client_id: c9, notes: "First job. Starter plan before she spends it all.", status: "pending", outreached: false },
        { client_id: c10, notes: "Senior FA. CI upgrade pitch.", status: "responded", outreached: true },
        { client_id: c11, notes: "Senior SWE + engaged. ILP and joint plan.", status: "contacted", outreached: true },
        { client_id: c13, notes: "Promoted to MD. Annuity + legacy trust.", status: "closed_won", outreached: true },
        { client_id: c14, notes: "Joined Series B startup — no corporate benefits.", status: "pending", outreached: false },
        { client_id: c17, notes: "Promoted to Group CFO. Succession and keyman.", status: "responded", outreached: true },
        { client_id: c20, notes: "VP Engineering at FTSE 100. IHT mitigation review.", status: "contacted", outreached: true },
        { client_id: c26, notes: "Regional VP. Disability and whole life conversion.", status: "responded", outreached: true },
        { client_id: c27, notes: "New role at startup + pregnant. Disability + maternity.", status: "contacted", outreached: true },
        { client_id: c35, notes: "Head of AI Products. Disability income — startup risk.", status: "pending", outreached: false },
        { client_id: c38, notes: "Self-employed — no corporate safety net. Keyman + income protection.", status: "contacted", outreached: true },
      ],
    });

    await ctx.db.insert("projects", {
      name: "Life Events Q2 2026",
      sales_angle: "All major life events detected April–June 2026. Multi-segment blitz — marriages, moves, new homes, bereavements. Generic opener: 'Life changed, let's make sure your protection did too.'",
      created_at: d("2026-05-01"),
      clients: [
        { client_id: c3, notes: "Engaged + married in 6 weeks. Joint plan close.", status: "closed_won", outreached: true },
        { client_id: c16, notes: "Engaged. Pre-wedding conversation.", status: "pending", outreached: false },
        { client_id: c18, notes: "New home. Mortgage protection.", status: "responded", outreached: true },
        { client_id: c19, notes: "Engaged + married. Joint whole of life.", status: "contacted", outreached: true },
        { client_id: c21, notes: "Engaged + married. CI + term intro.", status: "responded", outreached: true },
        { client_id: c23, notes: "Married. Joint protection plan.", status: "pending", outreached: false },
        { client_id: c33, notes: "Married. New shared finances.", status: "pending", outreached: false },
        { client_id: c36, notes: "Engaged + PhD. Income protection now.", status: "pending", outreached: false },
        { client_id: c9, notes: "Engaged. First policy — engage now.", status: "pending", outreached: false },
      ],
    });

    await ctx.db.insert("projects", {
      name: "Premium Client Retention",
      sales_angle: "HNW and senior clients facing business change, restructuring, or retirement horizon. Protect AUM, update nominations, introduce trust structures.",
      created_at: d("2026-05-15"),
      clients: [
        { client_id: c4, notes: "Business partner passed. Succession review urgent.", status: "contacted", outreached: true },
        { client_id: c8, notes: "Laid off at 45. Retirement savings at risk.", status: "contacted", outreached: true },
        { client_id: c24, notes: "Stepped down as MD. Estate and trust review.", status: "responded", outreached: true },
        { client_id: c32, notes: "Division dissolved. New firm. Policy review + COLI.", status: "contacted", outreached: true },
        { client_id: c17, notes: "Group CFO. Succession planning.", status: "closed_won", outreached: true },
        { client_id: c20, notes: "VP Engineering. IHT and pension strategy.", status: "responded", outreached: true },
        { client_id: c13, notes: "MD APAC. Annual review — premium client.", status: "closed_won", outreached: true },
      ],
    });

    // ── 5. CHAT HISTORY ──────────────────────────────────────────────────────

    // Ahmad Fariz — onboarding March, follow-up May, June baby close
    await ctx.db.insert("chat_history", {
      client_id: c0,
      updated_at: d("2026-06-14"),
      messages: [
        { sender: "advisor", message: "Hi Ahmad Fariz! Welcome to ImagineHack. I'm your personal advisor, Shannon. Great to connect with you!", timestamp: d("2026-03-21") },
        { sender: "client", message: "Hi Shannon! Thanks for reaching out. Looking forward to reviewing my coverage.", timestamp: d("2026-03-21") },
        { sender: "advisor", message: "Congrats on the new certification! Any big career plans on the horizon?", timestamp: d("2026-03-23") },
        { sender: "client", message: "Actually yes, I'm in line for a Lead Engineer role. Should know in a month or so.", timestamp: d("2026-03-23") },
        { sender: "advisor", message: "Exciting! That'll change your income picture. Let's revisit your term cover once that's confirmed.", timestamp: d("2026-03-24") },
        { sender: "client", message: "Sounds good. I'll update you.", timestamp: d("2026-03-24") },
        { sender: "advisor", message: "Ahmad Fariz, I saw the big news — Lead Engineer! Congrats 🎉 Shall we chat about your coverage now?", timestamp: d("2026-05-18") },
        { sender: "client", message: "Ha yes! And actually, we have more news... wife is expecting too 😅", timestamp: d("2026-05-18") },
        { sender: "advisor", message: "Wow, double celebration! That's exactly why we should look at maternity rider and a proper education plan. When are you free?", timestamp: d("2026-05-19") },
        { sender: "client", message: "This weekend works. Saturday 10am?", timestamp: d("2026-05-19") },
        { sender: "advisor", message: "Saturday 10am confirmed. I'll prepare a family plan proposal.", timestamp: d("2026-05-20") },
        { sender: "advisor", message: "Ahmad Fariz, I just saw baby Aisyah arrived! Congratulations to you and your wife! 💕", timestamp: d("2026-06-14") },
        { sender: "client", message: "Thank you Shannon! She's healthy and beautiful alhamdulillah.", timestamp: d("2026-06-14") },
        { sender: "advisor", message: "Wonderful. Now more than ever, let's get the family plan sorted. Can we confirm our proposal from last month?", timestamp: d("2026-06-14") },
        { sender: "client", message: "Yes, let's do it. I'm ready to sign.", timestamp: d("2026-06-15") },
      ],
    });

    // Nurul Ain — pregnancy to birth close
    await ctx.db.insert("chat_history", {
      client_id: c1,
      updated_at: d("2026-06-01"),
      messages: [
        { sender: "advisor", message: "Salam Nurul Ain! I noticed your beautiful pregnancy announcement. Congratulations! 🌸", timestamp: d("2026-04-25") },
        { sender: "client", message: "Thank you! We're so excited. First baby due in July.", timestamp: d("2026-04-25") },
        { sender: "advisor", message: "How wonderful! As your advisor, I'd love to make sure you're protected during this phase. Do you have a maternity rider on your current plan?", timestamp: d("2026-04-26") },
        { sender: "client", message: "Honestly I'm not sure. I don't think I have any policy yet?", timestamp: d("2026-04-26") },
        { sender: "advisor", message: "That's perfectly okay. Let me share what a starter family plan looks like. Are you free for a quick 20-minute call this week?", timestamp: d("2026-04-27") },
        { sender: "client", message: "Thursday evening works, 8pm?", timestamp: d("2026-04-27") },
        { sender: "advisor", message: "Thursday 8pm confirmed! I'll send you a brief summary beforehand.", timestamp: d("2026-04-28") },
        { sender: "advisor", message: "Nurul Ain, congratulations on Adam Hakimi! What a lovely name 💙", timestamp: d("2026-05-31") },
        { sender: "client", message: "He's here and healthy! We're so happy.", timestamp: d("2026-05-31") },
        { sender: "advisor", message: "Perfect timing — now that he's here, shall we finalise the family plan we discussed? It covers both of you and Adam.", timestamp: d("2026-06-01") },
        { sender: "client", message: "Yes please. Can you send me the documents?", timestamp: d("2026-06-01") },
      ],
    });

    // Siti Hajar — engagement to marriage to close
    await ctx.db.insert("chat_history", {
      client_id: c3,
      updated_at: d("2026-05-10"),
      messages: [
        { sender: "advisor", message: "Siti Hajar, saw your beautiful engagement post! Congratulations to you and Azhar! 💍", timestamp: d("2026-04-03") },
        { sender: "client", message: "Thank you so much! We're planning a May wedding.", timestamp: d("2026-04-03") },
        { sender: "advisor", message: "Exciting! Getting engaged is also a great time to think about joint life protection. Would you be open to a chat?", timestamp: d("2026-04-04") },
        { sender: "client", message: "Sure, maybe after the wedding? Things are a bit hectic now 😅", timestamp: d("2026-04-04") },
        { sender: "advisor", message: "Of course! I'll check back in after the big day.", timestamp: d("2026-04-05") },
        { sender: "advisor", message: "Siti Hajar, congratulations! Saw the wedding photos — you looked stunning! 🌸", timestamp: d("2026-05-05") },
        { sender: "client", message: "Thank you Shannon! We just got back from Langkawi.", timestamp: d("2026-05-05") },
        { sender: "advisor", message: "Welcome back! Now that you're officially Mrs Azhar, shall we sort out your joint life plan?", timestamp: d("2026-05-06") },
        { sender: "client", message: "Yes! Can we do this week? I want both of us covered properly.", timestamp: d("2026-05-07") },
        { sender: "advisor", message: "Absolutely. I'll prepare a joint term + CI proposal for both of you. How's Friday 2pm?", timestamp: d("2026-05-07") },
        { sender: "client", message: "Friday 2pm is perfect.", timestamp: d("2026-05-08") },
        { sender: "advisor", message: "Confirmed! Looking forward to getting you both sorted.", timestamp: d("2026-05-08") },
        { sender: "client", message: "Shannon, we reviewed the proposal. We want to proceed with the joint plan!", timestamp: d("2026-05-10") },
        { sender: "advisor", message: "Amazing news! I'll prepare the paperwork and share signing instructions shortly.", timestamp: d("2026-05-10") },
      ],
    });

    // Raina Haroon — pregnancy + business discussion
    await ctx.db.insert("chat_history", {
      client_id: c34,
      updated_at: d("2026-06-20"),
      messages: [
        { sender: "advisor", message: "Hi Raina! Congratulations on the pregnancy — what exciting news! 🤍", timestamp: d("2026-04-10") },
        { sender: "client", message: "Thank you! Still early days but couldn't keep quiet haha.", timestamp: d("2026-04-10") },
        { sender: "advisor", message: "As an entrepreneur, your income protection is especially important right now. Do you have any existing coverage?", timestamp: d("2026-04-11") },
        { sender: "client", message: "Nothing formal. I've been meaning to sort this out.", timestamp: d("2026-04-11") },
        { sender: "advisor", message: "Let's change that. I can walk you through a plan that covers you, the business, and the baby. When are you free?", timestamp: d("2026-04-12") },
        { sender: "client", message: "Next Tuesday, 3pm?", timestamp: d("2026-04-12") },
        { sender: "advisor", message: "Tuesday 3pm locked in. See you then!", timestamp: d("2026-04-13") },
        { sender: "advisor", message: "Raina, I just saw the news about your father-in-law. I'm so sorry for your loss. Please take all the time you need.", timestamp: d("2026-05-29") },
        { sender: "client", message: "Thank you Shannon. It's been a tough week. But also a reminder of why insurance matters.", timestamp: d("2026-05-30") },
        { sender: "advisor", message: "Absolutely. Whenever you're ready, I'm here.", timestamp: d("2026-05-30") },
        { sender: "advisor", message: "Raina! Baby Alya is here — the announcement is so beautiful 🌸 Warmest congratulations.", timestamp: d("2026-06-20") },
        { sender: "client", message: "She's perfect 😭 Thank you so much Shannon.", timestamp: d("2026-06-20") },
        { sender: "advisor", message: "I'll give you a few days to settle in. Then let's close the plan — for you, Alya, and the business.", timestamp: d("2026-06-20") },
      ],
    });

    // Wei Ling Tan — promotion + CI discussion
    await ctx.db.insert("chat_history", {
      client_id: c10,
      updated_at: d("2026-05-15"),
      messages: [
        { sender: "advisor", message: "Wei Ling, congratulations on your promotion to Senior Financial Analyst! Well deserved!", timestamp: d("2026-03-25") },
        { sender: "client", message: "Thank you! It comes with a nice pay bump too 😊", timestamp: d("2026-03-25") },
        { sender: "advisor", message: "That's great news. With higher income, it might be time to review your DPS coverage — the sum assured may not be adequate anymore.", timestamp: d("2026-03-26") },
        { sender: "client", message: "I've been thinking the same. What would you recommend?", timestamp: d("2026-03-26") },
        { sender: "advisor", message: "A CI plan addition would be a great start. I'll put together a comparison for you.", timestamp: d("2026-03-27") },
        { sender: "client", message: "Sounds good! Looking forward to seeing the options.", timestamp: d("2026-03-27") },
        { sender: "advisor", message: "Here's the CI plan comparison I mentioned. Three options across different budget ranges. Let me know which resonates.", timestamp: d("2026-04-01") },
        { sender: "client", message: "Option B looks right for me. Can we proceed?", timestamp: d("2026-05-14") },
        { sender: "advisor", message: "Option B it is! I'll prepare the application. Excited to get you upgraded.", timestamp: d("2026-05-15") },
      ],
    });

    // Marcus Johnson — new job, promotion, growing plan
    await ctx.db.insert("chat_history", {
      client_id: c26,
      updated_at: d("2026-05-28"),
      messages: [
        { sender: "advisor", message: "Marcus! Congrats on the new role at the Fortune 500. Big move!", timestamp: d("2026-03-28") },
        { sender: "client", message: "Thanks! It's been a crazy few weeks. New city, new team.", timestamp: d("2026-03-28") },
        { sender: "advisor", message: "I want to make sure your benefits gap is covered in transition. The corporate plan may not kick in for 90 days.", timestamp: d("2026-03-29") },
        { sender: "client", message: "Good point. What do you suggest?", timestamp: d("2026-03-29") },
        { sender: "advisor", message: "A short-term disability bridge and reviewing your existing Northwestern term. Let's schedule a call.", timestamp: d("2026-03-30") },
        { sender: "client", message: "This week? Wednesday 6pm EST?", timestamp: d("2026-03-30") },
        { sender: "advisor", message: "Wednesday 6pm confirmed!", timestamp: d("2026-03-31") },
        { sender: "advisor", message: "Marcus, saw you're now Regional VP! Incredible trajectory. Time to revisit the conversation about whole life conversion.", timestamp: d("2026-05-27") },
        { sender: "client", message: "Yeah I was just thinking about this. Income tripled from 3 years ago and coverage hasn't kept up.", timestamp: d("2026-05-27") },
        { sender: "advisor", message: "That's exactly the gap we need to close. I'll prepare a full review this week.", timestamp: d("2026-05-28") },
      ],
    });

    // James Thompson — new home
    await ctx.db.insert("chat_history", {
      client_id: c18,
      updated_at: d("2026-04-10"),
      messages: [
        { sender: "advisor", message: "James, love the new home photos! Congratulations — massive milestone!", timestamp: d("2026-03-29") },
        { sender: "client", message: "Thank you! It's been a dream for years. Just completed yesterday.", timestamp: d("2026-03-29") },
        { sender: "advisor", message: "Now that you own the property, mortgage protection becomes essential. Your family should be covered if anything happens to you.", timestamp: d("2026-03-30") },
        { sender: "client", message: "I hadn't thought about that. How does it work?", timestamp: d("2026-03-30") },
        { sender: "advisor", message: "MPPI clears the mortgage if you die or are unable to work. I can show you a level term option that also includes income protection.", timestamp: d("2026-03-31") },
        { sender: "client", message: "That sounds exactly right. Please send me details.", timestamp: d("2026-04-01") },
        { sender: "advisor", message: "Sent! The proposal includes a 25-year level term aligned to your mortgage duration.", timestamp: d("2026-04-02") },
        { sender: "client", message: "Reviewed it. Looks comprehensive. One question — does the income protection include sick pay top-up?", timestamp: d("2026-04-08") },
        { sender: "advisor", message: "Yes, there's a deferred period option you can choose. Happy to walk you through on a call.", timestamp: d("2026-04-09") },
        { sender: "client", message: "Let's do it. Friday 5pm?", timestamp: d("2026-04-10") },
      ],
    });

    // Priya Sharma — pregnancy + baby arrival
    await ctx.db.insert("chat_history", {
      client_id: c12,
      updated_at: d("2026-06-09"),
      messages: [
        { sender: "advisor", message: "Priya, three kids — you're a superwoman! Congratulations on the announcement! 🙏", timestamp: d("2026-05-06") },
        { sender: "client", message: "Haha thank you! A bit of a surprise but we're thrilled.", timestamp: d("2026-05-06") },
        { sender: "advisor", message: "With baby #3 on the way, your existing Great Eastern Flexi might need a top-up. Shall I review it?", timestamp: d("2026-05-07") },
        { sender: "client", message: "Yes please. I haven't touched it since 2016.", timestamp: d("2026-05-07") },
        { sender: "advisor", message: "I'll run a full audit and compare against your current needs with three dependents.", timestamp: d("2026-05-08") },
        { sender: "advisor", message: "Priya, baby Kavya is so precious! So glad she arrived safely even if a little early. 🌸", timestamp: d("2026-06-09") },
        { sender: "client", message: "She's perfect. Thank you Shannon. NICU for a few days but she's strong.", timestamp: d("2026-06-09") },
        { sender: "advisor", message: "So relieved. When you're settled, let's finalise the CI booster — Kavya's arrival makes it urgent.", timestamp: d("2026-06-09") },
      ],
    });

    // Megan Foster — pregnancy + layoff
    await ctx.db.insert("chat_history", {
      client_id: c29,
      updated_at: d("2026-06-05"),
      messages: [
        { sender: "advisor", message: "Megan, baby #3 coming — you must be over the moon! Congrats!", timestamp: d("2026-04-18") },
        { sender: "client", message: "Yes! Due in November. Third one definitely wasn't in the plan but here we are 😄", timestamp: d("2026-04-18") },
        { sender: "advisor", message: "Your existing Prudential VUL is a good base, but let's see if a CI rider would help given the growing family.", timestamp: d("2026-04-19") },
        { sender: "client", message: "Open to that. Schedule me in next week.", timestamp: d("2026-04-19") },
        { sender: "advisor", message: "Megan, I saw the news about your hospital. I'm really sorry. Are you okay?", timestamp: d("2026-06-04") },
        { sender: "client", message: "Honestly it's been awful. Pregnant and now no job. Terrified.", timestamp: d("2026-06-04") },
        { sender: "advisor", message: "I completely understand. Let's make sure your existing VUL is set up optimally and look at short-term income bridging options.", timestamp: d("2026-06-04") },
        { sender: "client", message: "Please. I need to understand what I'm working with.", timestamp: d("2026-06-05") },
        { sender: "advisor", message: "I'll pull your full policy summary today and call you this afternoon.", timestamp: d("2026-06-05") },
      ],
    });

    // Raj Kumar — promotion to close
    await ctx.db.insert("chat_history", {
      client_id: c13,
      updated_at: d("2026-05-20"),
      messages: [
        { sender: "advisor", message: "Raj, congratulations on the MD promotion! You've worked incredibly hard for this.", timestamp: d("2026-04-14") },
        { sender: "client", message: "Thank you. APAC is a big remit. More responsibility, more pressure.", timestamp: d("2026-04-14") },
        { sender: "advisor", message: "Exactly the right time to think about an annuity plan and legacy trust. Your estate will be significant.", timestamp: d("2026-04-15") },
        { sender: "client", message: "I've been putting this off for years. Let's finally do it.", timestamp: d("2026-04-15") },
        { sender: "advisor", message: "I'll put together a legacy + annuity proposal. Can we meet next week?", timestamp: d("2026-04-16") },
        { sender: "client", message: "Wednesday lunch, 12:30pm?", timestamp: d("2026-04-16") },
        { sender: "advisor", message: "Perfect. I'll bring the full proposal.", timestamp: d("2026-04-17") },
        { sender: "client", message: "Shannon, reviewed the proposal with my lawyer. We're ready to proceed.", timestamp: d("2026-05-19") },
        { sender: "advisor", message: "Fantastic! This is a major milestone Raj. I'll coordinate with the trust department to get everything set up.", timestamp: d("2026-05-20") },
      ],
    });

    // Kevin Teo — promotion + succession
    await ctx.db.insert("chat_history", {
      client_id: c17,
      updated_at: d("2026-06-02"),
      messages: [
        { sender: "advisor", message: "Kevin, Group CFO — wow! Huge congratulations. This is a big deal.", timestamp: d("2026-05-13") },
        { sender: "client", message: "It came with a lot of responsibility! Chloe starts university in 4 years, timing is interesting.", timestamp: d("2026-05-13") },
        { sender: "advisor", message: "That's exactly why we should review your Manulife Signature now. Sum assured from 2012 is probably not enough.", timestamp: d("2026-05-14") },
        { sender: "client", message: "Agreed. Also want to look at keyman for myself now that I'm executive level.", timestamp: d("2026-05-14") },
        { sender: "advisor", message: "Great call. I'll prepare a CFO-tier review — keyman, education endowment upgrade, and succession review.", timestamp: d("2026-05-15") },
        { sender: "client", message: "Shannon, went through the proposal with Janet. We're both happy. Let's sign.", timestamp: d("2026-06-02") },
        { sender: "advisor", message: "Excellent Kevin! I'll send over the application forms. Thank you for your trust.", timestamp: d("2026-06-02") },
      ],
    });

    // Tyler Brooks — layoff + recovery
    await ctx.db.insert("chat_history", {
      client_id: c28,
      updated_at: d("2026-06-18"),
      messages: [
        { sender: "advisor", message: "Tyler, sorry to hear about the layoff. How are you holding up?", timestamp: d("2026-04-15") },
        { sender: "client", message: "It's rough. Didn't see it coming. Updating resume now.", timestamp: d("2026-04-15") },
        { sender: "advisor", message: "This is exactly why income protection exists. Do you have any existing coverage we should review?", timestamp: d("2026-04-16") },
        { sender: "client", message: "Nothing really. Always meant to sort it out.", timestamp: d("2026-04-16") },
        { sender: "advisor", message: "Now is a good time to lock in a plan while you're still healthy and young. Premiums are low at 28.", timestamp: d("2026-04-17") },
        { sender: "client", message: "Makes sense. But tight on cash right now. What's the most affordable entry point?", timestamp: d("2026-04-17") },
        { sender: "advisor", message: "A 20-year term at your age starts around $40/month. Very manageable. Shall I send a quote?", timestamp: d("2026-04-18") },
        { sender: "client", message: "Yes please.", timestamp: d("2026-04-18") },
        { sender: "advisor", message: "Tyler! Saw you landed a new role at the health-tech startup — amazing news!", timestamp: d("2026-06-18") },
        { sender: "client", message: "Yes!! So relieved. New chapter.", timestamp: d("2026-06-18") },
        { sender: "advisor", message: "Perfect timing. Now that income is back, let's finalise that term plan. Ready?", timestamp: d("2026-06-18") },
        { sender: "client", message: "100% ready. Let's do it.", timestamp: d("2026-06-18") },
      ],
    });

    // Harry Williams — second baby
    await ctx.db.insert("chat_history", {
      client_id: c22,
      updated_at: d("2026-05-05"),
      messages: [
        { sender: "advisor", message: "Harry, congratulations on the new arrival! Little Finn just became a big brother! 🎉", timestamp: d("2026-04-16") },
        { sender: "client", message: "Haha yes! Two under 4 now. It's chaos but wonderful.", timestamp: d("2026-04-16") },
        { sender: "advisor", message: "Two kids means double the reason to protect your income. You currently have no coverage in our records.", timestamp: d("2026-04-17") },
        { sender: "client", message: "I know, I've been meaning to sort this. The mortgage is also giving me anxiety.", timestamp: d("2026-04-17") },
        { sender: "advisor", message: "I can cover both — mortgage protection term + income protection. Shall I put a joint proposal together?", timestamp: d("2026-04-18") },
        { sender: "client", message: "Yes, please. Can you send it by end of week?", timestamp: d("2026-04-18") },
        { sender: "advisor", message: "Proposal sent! It covers a 30-year mortgage term + 5-year income protection at 75% of salary.", timestamp: d("2026-04-22") },
        { sender: "client", message: "Looks solid. Zoe reviewed it too. We're happy with it.", timestamp: d("2026-05-05") },
      ],
    });

    // Brittany Park — new baby + layoff crisis
    await ctx.db.insert("chat_history", {
      client_id: c31,
      updated_at: d("2026-06-10"),
      messages: [
        { sender: "advisor", message: "Brittany! Jack is adorable — welcome to the world little one! 💙", timestamp: d("2026-05-12") },
        { sender: "client", message: "Thank you! Exhausted but so happy.", timestamp: d("2026-05-12") },
        { sender: "advisor", message: "While you're on maternity leave, let's make sure income continuity is in place. Any existing disability coverage?", timestamp: d("2026-05-13") },
        { sender: "client", message: "Not really. Company had some group benefits but I think they're quite basic.", timestamp: d("2026-05-13") },
        { sender: "advisor", message: "Brittany, I saw the news about the product division layoffs. I'm so sorry. Are you affected?", timestamp: d("2026-06-08") },
        { sender: "client", message: "Yes. Got the call yesterday. I'm on leave with a newborn and now this.", timestamp: d("2026-06-08") },
        { sender: "advisor", message: "This is genuinely difficult, and I want to help. Let me review your group policy and see what you're entitled to on exit.", timestamp: d("2026-06-08") },
        { sender: "client", message: "Please. Chris and I are panicking a bit.", timestamp: d("2026-06-09") },
        { sender: "advisor", message: "I'll have a full breakdown for you by tomorrow. We'll figure this out together.", timestamp: d("2026-06-09") },
        { sender: "client", message: "Thank you Shannon. Really appreciate you.", timestamp: d("2026-06-10") },
      ],
    });

    // Emma Richardson — engagement to marriage
    await ctx.db.insert("chat_history", {
      client_id: c19,
      updated_at: d("2026-05-24"),
      messages: [
        { sender: "advisor", message: "Emma, congratulations on the engagement! Such a beautiful photo.", timestamp: d("2026-04-13") },
        { sender: "client", message: "Thank you! Tom and I are over the moon.", timestamp: d("2026-04-13") },
        { sender: "advisor", message: "As a GP, you have excellent earning potential. Pre-marriage is the perfect time to set up a whole of life plan.", timestamp: d("2026-04-14") },
        { sender: "client", message: "I've been thinking about this actually. We both want to protect each other.", timestamp: d("2026-04-14") },
        { sender: "advisor", message: "I'll prepare a joint whole of life proposal. It can be set up before the wedding.", timestamp: d("2026-04-15") },
        { sender: "advisor", message: "Emma, congratulations! Saw the wedding photos — what a beautiful ceremony!", timestamp: d("2026-05-23") },
        { sender: "client", message: "Thank you Shannon! Tom and I are officially Mr and Mrs now 🥲", timestamp: d("2026-05-23") },
        { sender: "advisor", message: "Now the fun part — getting your joint policy sorted! Shall we pick up where we left off?", timestamp: d("2026-05-23") },
        { sender: "client", message: "Yes, we're both ready. Can you resend the proposal?", timestamp: d("2026-05-24") },
        { sender: "advisor", message: "Resent! Looking forward to protecting Mr and Mrs Tom and Emma.", timestamp: d("2026-05-24") },
      ],
    });

    // Jun Xian Lim — promotion + engagement
    await ctx.db.insert("chat_history", {
      client_id: c11,
      updated_at: d("2026-06-05"),
      messages: [
        { sender: "advisor", message: "Jun Xian, Senior Software Engineer — congratulations! Big step up!", timestamp: d("2026-04-06") },
        { sender: "client", message: "Thanks! Feels great. Saving up for the BTO too.", timestamp: d("2026-04-06") },
        { sender: "advisor", message: "Two financial goals converging — income growth and homeownership. Good time to start an ILP to grow savings.", timestamp: d("2026-04-07") },
        { sender: "client", message: "Interested. How does it work compared to just ETFs?", timestamp: d("2026-04-07") },
        { sender: "advisor", message: "ILP gives you life protection bundled with investment — useful if you plan to start a family soon.", timestamp: d("2026-04-08") },
        { sender: "client", message: "Actually, speaking of — I just proposed to Rachel last night! 💍", timestamp: d("2026-06-05") },
        { sender: "advisor", message: "CONGRATULATIONS!! What incredible news! This changes everything — joint plan conversation is now live!", timestamp: d("2026-06-05") },
        { sender: "client", message: "Haha yes, I figured you'd say that.", timestamp: d("2026-06-05") },
        { sender: "advisor", message: "Let's set up a joint policy for you and Rachel before the wedding. Can we schedule next week?", timestamp: d("2026-06-05") },
      ],
    });

    // Hafizuddin — burnout + layoff
    await ctx.db.insert("chat_history", {
      client_id: c8,
      updated_at: d("2026-06-01"),
      messages: [
        { sender: "advisor", message: "Hi Hafizuddin, saw your post about work-life balance. It takes courage to be honest about that.", timestamp: d("2026-04-24") },
        { sender: "client", message: "Thanks. Just needed to get it out. 20 years in this industry and I'm drained.", timestamp: d("2026-04-24") },
        { sender: "advisor", message: "That's understandable. Have you started thinking about what a phased retirement might look like?", timestamp: d("2026-04-25") },
        { sender: "client", message: "Yes, actually. I want to retire at 55 but not sure if I have enough.", timestamp: d("2026-04-25") },
        { sender: "advisor", message: "Your retirement saver endowment matures in 2034. Combined with a review of your current portfolio, we could model an early exit.", timestamp: d("2026-04-26") },
        { sender: "advisor", message: "Hafiz, I saw the news about your company's restructuring. I'm sorry to hear this. Are you impacted?", timestamp: d("2026-05-30") },
        { sender: "client", message: "Yes. Effective end of June. At 45 this is my worst nightmare.", timestamp: d("2026-05-30") },
        { sender: "advisor", message: "I understand how scary this must feel. Your endowment is a safety net here. Let me review what you can access and when.", timestamp: d("2026-05-31") },
        { sender: "client", message: "Please. I need clarity on my financial runway.", timestamp: d("2026-05-31") },
        { sender: "advisor", message: "I'll prepare a full breakdown by tomorrow. We'll map out the next 18 months.", timestamp: d("2026-06-01") },
      ],
    });

    // Amirah Zulaikha — second baby
    await ctx.db.insert("chat_history", {
      client_id: c7,
      updated_at: d("2026-05-15"),
      messages: [
        { sender: "advisor", message: "Amirah, welcome baby Rayyan! 💙 What a beautiful name.", timestamp: d("2026-05-10") },
        { sender: "client", message: "Thank you! He's perfect. Big sister Dania is obsessed with him 😄", timestamp: d("2026-05-10") },
        { sender: "advisor", message: "Two kids now! Let's make sure your family plan covers both of them properly.", timestamp: d("2026-05-11") },
        { sender: "client", message: "I was actually just thinking about this. We have nothing for Rayyan yet.", timestamp: d("2026-05-11") },
        { sender: "advisor", message: "Let's add a second child rider and start an education endowment for him. Are you free for a call this week?", timestamp: d("2026-05-12") },
        { sender: "client", message: "Thursday afternoon, 3pm?", timestamp: d("2026-05-13") },
        { sender: "advisor", message: "Thursday 3pm it is! I'll prepare a family plan proposal for both children.", timestamp: d("2026-05-13") },
        { sender: "client", message: "Shannon, discussed with Irwan. We want to proceed with the proposal for both kids.", timestamp: d("2026-05-15") },
        { sender: "advisor", message: "Wonderful! I'll prepare the application for both riders. Rayyan and Dania are in safe hands.", timestamp: d("2026-05-15") },
      ],
    });

    // Mohd Rizal — third baby
    await ctx.db.insert("chat_history", {
      client_id: c2,
      updated_at: d("2026-05-22"),
      messages: [
        { sender: "advisor", message: "Rizal, baby Aisyah is here! Congratulations — three children is such a blessing 🌸", timestamp: d("2026-05-21") },
        { sender: "client", message: "Alhamdulillah. Third one came quickly after the holiday haha.", timestamp: d("2026-05-21") },
        { sender: "advisor", message: "Your Family Takaful was set up in 2018 for two children. With Aisyah, we should update beneficiaries and look at coverage.", timestamp: d("2026-05-21") },
        { sender: "client", message: "Yes, been meaning to do this for a while actually.", timestamp: d("2026-05-22") },
        { sender: "advisor", message: "Let me prepare an updated proposal for your review. Can we connect next week?", timestamp: d("2026-05-22") },
        { sender: "client", message: "Sure, next Monday 8pm?", timestamp: d("2026-05-22") },
      ],
    });

    // Zainal Abidin — business partner death
    await ctx.db.insert("chat_history", {
      client_id: c4,
      updated_at: d("2026-06-16"),
      messages: [
        { sender: "advisor", message: "Zainal, I'm so sorry to hear about your business partner. This must be a very difficult time.", timestamp: d("2026-06-16") },
        { sender: "client", message: "It's been a shock. We built the company together for 18 years.", timestamp: d("2026-06-16") },
        { sender: "advisor", message: "I understand. From a practical standpoint, now is the most important time to review your business succession plan and shareholder protection.", timestamp: d("2026-06-16") },
        { sender: "client", message: "Yes. I need to make sure the company survives and my family is protected too.", timestamp: d("2026-06-16") },
        { sender: "advisor", message: "Absolutely. I'll prepare a succession and keyman review. Can we meet in person this week?", timestamp: d("2026-06-16") },
        { sender: "client", message: "Yes. I need this sorted. Thursday?", timestamp: d("2026-06-16") },
      ],
    });

    // Shannon Choo — career milestone
    await ctx.db.insert("chat_history", {
      client_id: c35,
      updated_at: d("2026-05-01"),
      messages: [
        { sender: "advisor", message: "Shannon! Head of AI Products — that's a significant title change. Congratulations!", timestamp: d("2026-04-22") },
        { sender: "client", message: "Thanks haha! More work but also more responsibility to protect my income now.", timestamp: d("2026-04-22") },
        { sender: "advisor", message: "Exactly. At a lab environment there's always risk of funding changes. A disability income plan would give you a solid floor.", timestamp: d("2026-04-23") },
        { sender: "client", message: "That makes sense. Can you show me what that looks like?", timestamp: d("2026-04-23") },
        { sender: "advisor", message: "Will do! I'll send you a comparison of two disability income options by end of week.", timestamp: d("2026-04-24") },
        { sender: "client", message: "Perfect. Looking forward to it.", timestamp: d("2026-05-01") },
      ],
    });
  },
});
