import { internalMutation } from "./_generated/server";

const d = (iso: string) => new Date(iso).getTime();

// ─── content helpers ──────────────────────────────────────────────────────────
// Simulate Exa search result (LinkedIn / Legacy.com)
const exaResult = (title: string, url: string, text: string, published_date: string) =>
  JSON.stringify({ results: [{ title, url, text, published_date }] });

// Simulate Apify instagram-profile-scraper result
const igPosts = (posts: { username: string; timestamp: string; caption: string; likes: number; comments: number; locationName?: string }[]) =>
  JSON.stringify(posts.map((p, i) => ({ id: `IG${String(i + 1).padStart(5, "0")}`, ...p })));

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {

    // ─────────────────────────────────────────────────────────────────────────
    // CLIENTS — 10 total
    // ─────────────────────────────────────────────────────────────────────────

    // ── c0  Ahmad Fariz bin Razali ───────────────────────────────────────────
    const c0 = await ctx.db.insert("clients", {
      first_name: "Ahmad Fariz",
      last_name: "bin Razali",
      age: 34,
      nationality: "MY",
      income_range: "RM 8,000–12,000",
      number: "+60112345678",
      email: "ahmadfariz@gmail.com",
      socials: [
        { type: "instagram", value: "ahmadfariz_my" },
        { type: "linkedin", value: "ahmad-fariz-razali" },
      ],
      marital_status: "married",
      dependents: [
        { relationship: "spouse", first_name: "Nurul", last_name: "Hidayah", age: 31 },
        { relationship: "child",  first_name: "Irfan", last_name: "bin Razali", age: 3 },
      ],
      existing_policies: [
        {
          policy_id: "POL-001",
          name: "Great Eastern Term Life",
          type: "term_life",
          start_date: "2021-03-01",
          beneficiaries: [{ relationship: "spouse", first_name: "Nurul", last_name: "Hidayah" }],
        },
      ],
      sales_opportunities: [
        { created_at: d("2026-05-18"), description: "Just promoted to Lead Engineer — income jumped, current term underinsured. Propose CI rider." },
        { created_at: d("2026-06-14"), description: "Baby Aisyah born June 13 — education endowment window open now." },
      ],
      persona: {
        tags: ["family-oriented", "career-driven"],
        summary: "Ambitious engineer, newly promoted, young family with a newborn — protection gap is widening fast.",
        updated_at: d("2026-06-13"),
      },
      recent_signals: [
        {
          date_fetched: d("2026-05-17"),
          platform: "linkedin",
          content: exaResult(
            "Ahmad Fariz bin Razali – Lead Engineer at TechCorp Malaysia",
            "https://linkedin.com/in/ahmad-fariz-razali",
            "Promoted to Lead Engineer starting May 2026. Post: 'Alhamdulillah, hard work pays off. Grateful for this team.' 318 reactions.",
            "2026-05-16",
          ),
        },
        {
          date_fetched: d("2026-06-13"),
          platform: "instagram",
          content: igPosts([
            {
              username: "ahmadfariz_my",
              timestamp: "2026-06-13T10:34:00Z",
              caption: "Baby Aisyah joined us! 💕 Born 13 June. Our little family just got a whole lot more beautiful. Alhamdulillah 🤲",
              likes: 234,
              comments: 45,
              locationName: "KPJ Damansara Specialist Hospital",
            },
          ]),
        },
      ],
      created_at: d("2026-03-22"),
      is_seed: true,
    });

    // ── c1  Nurul Ain binti Sulaiman ─────────────────────────────────────────
    const c1 = await ctx.db.insert("clients", {
      first_name: "Nurul Ain",
      last_name: "binti Sulaiman",
      age: 29,
      nationality: "MY",
      income_range: "RM 4,000–6,000",
      number: "+60123456789",
      email: "nurulain@outlook.com",
      socials: [
        { type: "instagram", value: "nurulain.sulaiman" },
        { type: "linkedin", value: "nurul-ain-sulaiman" },
      ],
      marital_status: "married",
      dependents: [
        { relationship: "spouse", first_name: "Hafiz", last_name: "bin Azman", age: 31 },
        { relationship: "child",  first_name: "Adam Hakimi", last_name: "bin Hafiz", age: 0 },
      ],
      existing_policies: [],
      sales_opportunities: [
        { created_at: d("2026-04-26"), description: "First pregnancy — no existing policy. Maternity rider + whole life starter package." },
        { created_at: d("2026-06-01"), description: "Baby Adam Hakimi born May 30 — close the family plan while emotion is still high." },
      ],
      persona: {
        tags: ["family-oriented", "religious-conservative"],
        summary: "New mother, schoolteacher, faith-centred lifestyle — takaful framing resonates, keep it warm and gentle.",
        updated_at: d("2026-05-30"),
      },
      recent_signals: [
        {
          date_fetched: d("2026-04-24"),
          platform: "instagram",
          content: igPosts([
            {
              username: "nurulain.sulaiman",
              timestamp: "2026-04-24T19:10:00Z",
              caption: "Baby's room is almost ready 🌸 Can't wait to meet you little one.",
              likes: 187,
              comments: 32,
            },
          ]),
        },
        {
          date_fetched: d("2026-05-30"),
          platform: "instagram",
          content: igPosts([
            {
              username: "nurulain.sulaiman",
              timestamp: "2026-05-30T21:05:00Z",
              caption: "Adam Hakimi arrived on May 30 💙 We are over the moon. Alhamdulillah.",
              likes: 412,
              comments: 89,
              locationName: "Hospital Putrajaya",
            },
          ]),
        },
      ],
      created_at: d("2026-03-25"),
      is_seed: true,
    });

    // ── c2  Khairul Anwar bin Zainudin ───────────────────────────────────────
    const c2 = await ctx.db.insert("clients", {
      first_name: "Khairul Anwar",
      last_name: "bin Zainudin",
      age: 38,
      nationality: "MY",
      income_range: "RM 10,000–15,000",
      number: "+60178901234",
      email: "khairul.zainudin@work.com",
      socials: [
        { type: "instagram", value: "khairul.anwar.kl" },
        { type: "linkedin", value: "khairul-anwar-zainudin" },
      ],
      marital_status: "married",
      dependents: [
        { relationship: "spouse", first_name: "Syafiqah", last_name: "binti Yusof", age: 35 },
        { relationship: "child",  first_name: "Mia", last_name: "binti Khairul", age: 5 },
        { relationship: "child",  first_name: "Aidan", last_name: "bin Khairul", age: 0 },
      ],
      existing_policies: [
        {
          policy_id: "POL-002",
          name: "Prudential Whole Life Plus",
          type: "whole_life",
          start_date: "2020-07-01",
          beneficiaries: [{ relationship: "spouse", first_name: "Syafiqah", last_name: "binti Yusof" }],
        },
      ],
      sales_opportunities: [
        { created_at: d("2026-04-08"), description: "Promoted to Head of IT — income jump, existing whole life sum assured is now insufficient." },
        { created_at: d("2026-06-12"), description: "Baby Aidan arrived June 11 — second child rider + education endowment for both kids." },
      ],
      persona: {
        tags: ["career-driven", "family-oriented"],
        summary: "Upwardly mobile IT leader, two young kids, mortgage — classic dual-income protection and education savings case.",
        updated_at: d("2026-06-11"),
      },
      recent_signals: [
        {
          date_fetched: d("2026-04-07"),
          platform: "linkedin",
          content: exaResult(
            "Khairul Anwar bin Zainudin – Head of IT at Celcom Axiata",
            "https://linkedin.com/in/khairul-anwar-zainudin",
            "Khairul Anwar bin Zainudin just announced: 'Thrilled to step into the Head of IT role at Celcom Axiata. Excited for what's ahead!' 241 reactions.",
            "2026-04-07",
          ),
        },
        {
          date_fetched: d("2026-06-11"),
          platform: "instagram",
          content: igPosts([
            {
              username: "khairul.anwar.kl",
              timestamp: "2026-06-11T14:22:00Z",
              caption: "Baby no. 2 is here! Welcoming baby Aidan 💙 Mia loves her little brother already. Alhamdulillah.",
              likes: 298,
              comments: 61,
              locationName: "Pantai Hospital Kuala Lumpur",
            },
          ]),
        },
      ],
      created_at: d("2026-04-08"),
      is_seed: true,
    });

    // ── c3  Raj Kumar ────────────────────────────────────────────────────────
    const c3 = await ctx.db.insert("clients", {
      first_name: "Raj",
      last_name: "Kumar",
      age: 47,
      nationality: "SG",
      income_range: "SGD 18,000–25,000",
      number: "+6594567890",
      email: "raj.kumar.sg@gmail.com",
      socials: [
        { type: "linkedin", value: "raj-kumar-sg" },
      ],
      marital_status: "married",
      dependents: [
        { relationship: "spouse", first_name: "Lakshmi", last_name: "Kumar", age: 44 },
        { relationship: "child",  first_name: "Vikram", last_name: "Kumar", age: 19 },
      ],
      existing_policies: [
        {
          policy_id: "POL-SG-001",
          name: "Prulife Premium Whole Life",
          type: "whole_life",
          start_date: "2010-03-01",
          beneficiaries: [{ relationship: "spouse", first_name: "Lakshmi", last_name: "Kumar" }],
        },
        {
          policy_id: "POL-SG-002",
          name: "AIA CI Protector",
          type: "critical_illness",
          start_date: "2017-09-01",
          beneficiaries: [{ relationship: "spouse", first_name: "Lakshmi", last_name: "Kumar" }],
        },
      ],
      sales_opportunities: [
        { created_at: d("2026-04-14"), description: "Promoted to MD APAC — estate exposure has grown significantly. Annuity + trust nomination conversation now." },
      ],
      persona: {
        tags: ["luxury-high-net-worth", "career-driven"],
        summary: "Senior executive, high net worth, sophisticated buyer — lead with legacy planning and estate structure, not basic coverage.",
        updated_at: d("2026-04-13"),
      },
      recent_signals: [
        {
          date_fetched: d("2026-04-13"),
          platform: "linkedin",
          content: exaResult(
            "Raj Kumar – Managing Director, APAC at Keppel Capital",
            "https://linkedin.com/in/raj-kumar-sg",
            "Raj Kumar updated his position to Managing Director, APAC at Keppel Capital. Post: 'Humbled and excited to take on this expanded remit. Ready to drive growth across the region.' 504 reactions, 62 comments.",
            "2026-04-13",
          ),
        },
      ],
      created_at: d("2026-04-04"),
      is_seed: true,
    });

    // ── c4  Brittany Park ────────────────────────────────────────────────────
    const c4 = await ctx.db.insert("clients", {
      first_name: "Brittany",
      last_name: "Park",
      age: 35,
      nationality: "US",
      income_range: "$130,000–160,000",
      number: "+12025550106",
      email: "brittany.park@techco.com",
      socials: [
        { type: "instagram", value: "brittanypark_" },
        { type: "linkedin", value: "brittany-park-pm" },
      ],
      marital_status: "married",
      dependents: [
        { relationship: "spouse", first_name: "Chris", last_name: "Park", age: 37 },
        { relationship: "child",  first_name: "Emma", last_name: "Park", age: 1 },
        { relationship: "child",  first_name: "Jack", last_name: "Park", age: 0 },
      ],
      existing_policies: [],
      sales_opportunities: [
        { created_at: d("2026-05-12"), description: "Second baby Jack arrived — on maternity leave, no disability coverage. Urgent income bridge." },
        { created_at: d("2026-06-09"), description: "Hit with layoff while on leave — no safety net, two young kids. Compassionate outreach, full review needed." },
      ],
      persona: {
        tags: ["family-oriented", "career-driven"],
        summary: "High-earning product manager, second child just born, hit with layoff while on maternity leave — highest urgency case in the batch.",
        updated_at: d("2026-06-07"),
      },
      recent_signals: [
        {
          date_fetched: d("2026-05-11"),
          platform: "instagram",
          content: igPosts([
            {
              username: "brittanypark_",
              timestamp: "2026-05-11T09:45:00Z",
              caption: "Jack arrived! Our family is now 4 ❤️ Emma is already the best big sister. We are exhausted and so full of love.",
              likes: 621,
              comments: 104,
              locationName: "Sibley Memorial Hospital, Washington DC",
            },
          ]),
        },
        {
          date_fetched: d("2026-06-07"),
          platform: "linkedin",
          content: exaResult(
            "TechCo announces product division restructuring — 200 roles impacted",
            "https://linkedin.com/posts/techco-official",
            "TechCo posted a restructuring announcement. In the comments, Brittany Park wrote: 'Unfortunately I'm among those affected. On maternity leave but the call came yesterday. Open to connecting with anyone in the product space.' #OpenToWork tag added to her profile.",
            "2026-06-07",
          ),
        },
      ],
      created_at: d("2026-04-14"),
      is_seed: true,
    });

    // ── c5  Raina Haroon ⭐ ──────────────────────────────────────────────────
    const c5 = await ctx.db.insert("clients", {
      first_name: "Raina",
      last_name: "Haroon",
      age: 32,
      nationality: "MY",
      income_range: "RM 15,000–25,000",
      number: "+60173024851",
      email: "raina.haroon@gmail.com",
      socials: [
        { type: "instagram", value: "rainaharoon" },
        { type: "linkedin", value: "raina-haroon" },
      ],
      marital_status: "married",
      dependents: [
        { relationship: "spouse", first_name: "Zaki", last_name: "Haroon", age: 35 },
        { relationship: "child",  first_name: "Alya", last_name: "Haroon", age: 0 },
      ],
      existing_policies: [],
      sales_opportunities: [
        { created_at: d("2026-04-11"), description: "Pregnant entrepreneur with no existing policy — maternity rider + business loan protection, urgent." },
        { created_at: d("2026-06-20"), description: "Baby Alya born June 19 — executive whole life now, while the moment is fresh." },
      ],
      persona: {
        tags: ["entrepreneur", "career-driven"],
        summary: "Tech founder, first child just arrived, no formal coverage — highest unprotected income exposure in the book.",
        updated_at: d("2026-06-19"),
      },
      recent_signals: [
        {
          date_fetched: d("2026-04-09"),
          platform: "instagram",
          content: igPosts([
            {
              username: "rainaharoon",
              timestamp: "2026-04-09T20:15:00Z",
              caption: "little one coming soon 🤍 feeling so grateful and a little terrified haha. can't wait.",
              likes: 543,
              comments: 88,
            },
          ]),
        },
        {
          date_fetched: d("2026-05-28"),
          platform: "legacy",
          content: exaResult(
            "In Memoriam – Haroon bin Suleiman",
            "https://legacy.com/obituaries/haroon-suleiman-85203",
            "Haroon bin Suleiman, 68, passed away on 26 May 2026. Beloved husband and father. Survived by his wife Zainab and two children. Private family service held at Al-Ikhlas Mosque, Petaling Jaya.",
            "2026-05-27",
          ),
        },
        {
          date_fetched: d("2026-06-19"),
          platform: "instagram",
          content: igPosts([
            {
              username: "rainaharoon",
              timestamp: "2026-06-19T22:44:00Z",
              caption: "Our daughter Alya is here 🌸 Born June 19. We are completely, utterly in love. Thank you for all the love and dua 🤍",
              likes: 1204,
              comments: 247,
              locationName: "Sunway Medical Centre",
            },
          ]),
        },
      ],
      created_at: d("2026-04-09"),
      is_seed: true,
    });

    // ── c6  Shannon Choo ⭐ ──────────────────────────────────────────────────
    const c6 = await ctx.db.insert("clients", {
      first_name: "Shannon",
      last_name: "Choo",
      age: 29,
      nationality: "MY",
      income_range: "RM 12,000–18,000",
      number: "+60122468905",
      email: "shannon.choo@ytlailabs.com",
      socials: [
        { type: "linkedin", value: "shannon-choo-ytl" },
      ],
      marital_status: "single",
      dependents: [],
      existing_policies: [],
      sales_opportunities: [
        { created_at: d("2026-04-22"), description: "Promoted to Head of AI Products at YTL AI Labs — income now significant, zero protection. Disability income entry point." },
      ],
      persona: {
        tags: ["career-driven"],
        summary: "Fast-rising AI product lead at a tech lab — analytically minded, will respond to data-driven framing over emotional pitches.",
        updated_at: d("2026-04-21"),
      },
      recent_signals: [
        {
          date_fetched: d("2026-04-21"),
          platform: "linkedin",
          content: exaResult(
            "Shannon Choo – Head of AI Products at YTL AI Labs",
            "https://linkedin.com/in/shannon-choo-ytl",
            "Shannon Choo updated her title to Head of AI Products at YTL AI Labs. Post: 'Excited to be leading the AI product function here. Big things ahead.' 387 reactions, 54 comments.",
            "2026-04-21",
          ),
        },
      ],
      created_at: d("2026-04-18"),
      is_seed: true,
    });

    // ── c7  Ammara Somji ⭐ ──────────────────────────────────────────────────
    const c7 = await ctx.db.insert("clients", {
      first_name: "Ammara",
      last_name: "Somji",
      age: 28,
      nationality: "MY",
      income_range: "RM 6,000–9,000",
      number: "+60174974300",
      email: "ammara.somji@gmail.com",
      socials: [
        { type: "instagram", value: "ammarasomji" },
        { type: "linkedin", value: "ammara-somji" },
      ],
      marital_status: "single",
      dependents: [],
      existing_policies: [],
      sales_opportunities: [
        { created_at: d("2026-05-04"), description: "New job at Petronas — first salary jump, no coverage yet. Starter term + hospital & surgical." },
      ],
      persona: {
        tags: ["career-driven"],
        summary: "Early-career professional, just joined a major corporate — prime moment for a first policy before lifestyle inflation sets in.",
        updated_at: d("2026-05-03"),
      },
      recent_signals: [
        {
          date_fetched: d("2026-05-03"),
          platform: "linkedin",
          content: exaResult(
            "Ammara Somji – Graduate Analyst at Petronas",
            "https://linkedin.com/in/ammara-somji",
            "Ammara Somji announced: 'Officially a Petronasian! Thrilled to start this new chapter as a Graduate Analyst. Here\'s to learning everything.' 198 reactions.",
            "2026-05-02",
          ),
        },
        {
          date_fetched: d("2026-05-10"),
          platform: "instagram",
          content: igPosts([
            {
              username: "ammarasomji",
              timestamp: "2026-05-10T08:30:00Z",
              caption: "First week at the new job done ✅ KLCC views from the office are not bad at all 😅 Grateful.",
              likes: 214,
              comments: 38,
              locationName: "KLCC, Kuala Lumpur",
            },
          ]),
        },
      ],
      created_at: d("2026-04-22"),
      is_seed: true,
    });

    // ── c8  Menna Bawazir ⭐ ─────────────────────────────────────────────────
    const c8 = await ctx.db.insert("clients", {
      first_name: "Menna",
      last_name: "Bawazir",
      age: 30,
      nationality: "MY",
      income_range: "RM 7,000–10,000",
      number: "+601162687670",
      email: "menna.bawazir@outlook.com",
      socials: [
        { type: "instagram", value: "mennabawazir" },
        { type: "linkedin", value: "menna-bawazir" },
      ],
      marital_status: "engaged",
      dependents: [],
      existing_policies: [],
      sales_opportunities: [
        { created_at: d("2026-04-18"), description: "Just got engaged — pre-wedding is the best window for a joint life plan before the rush begins." },
      ],
      persona: {
        tags: ["family-oriented", "religious-conservative"],
        summary: "Newly engaged, planning a wedding — takaful framing for a joint life plan will land well before the ceremony.",
        updated_at: d("2026-04-17"),
      },
      recent_signals: [
        {
          date_fetched: d("2026-04-17"),
          platform: "instagram",
          content: igPosts([
            {
              username: "mennabawazir",
              timestamp: "2026-04-17T19:55:00Z",
              caption: "He asked 💍 and obviously I said yes 🥹 Alhamdulillah for this blessing. Can\'t wait for this next chapter.",
              likes: 732,
              comments: 156,
            },
          ]),
        },
      ],
      created_at: d("2026-04-17"),
      is_seed: true,
    });

    // ── c9  Juri AlShamary ⭐ ─────────────────────────────────────────────────
    const c9 = await ctx.db.insert("clients", {
      first_name: "Juri",
      last_name: "AlShamary",
      age: 34,
      nationality: "MY",
      income_range: "RM 9,000–13,000",
      number: "+60177742294",
      email: "juri.alshamary@gmail.com",
      socials: [
        { type: "instagram", value: "juri.alshamary" },
        { type: "linkedin", value: "juri-alshamary" },
      ],
      marital_status: "married",
      dependents: [
        { relationship: "spouse", first_name: "Sara", last_name: "AlShamary", age: 31 },
        { relationship: "child",  first_name: "Yousef", last_name: "AlShamary", age: 4 },
      ],
      existing_policies: [
        {
          policy_id: "POL-003",
          name: "Etiqa Family Takaful",
          type: "takaful",
          start_date: "2022-08-01",
          beneficiaries: [{ relationship: "spouse", first_name: "Sara", last_name: "AlShamary" }],
        },
      ],
      sales_opportunities: [
        { created_at: d("2026-05-11"), description: "Just moved into a new property in Ara Damansara — MRTA and mortgage protection needed on top of existing takaful." },
      ],
      persona: {
        tags: ["family-oriented", "religious-conservative"],
        summary: "Young family with a child, faith-centred, newly settled in a new home — takaful top-up and MRTA are the natural next steps.",
        updated_at: d("2026-05-10"),
      },
      recent_signals: [
        {
          date_fetched: d("2026-05-10"),
          platform: "instagram",
          content: igPosts([
            {
              username: "juri.alshamary",
              timestamp: "2026-05-10T11:20:00Z",
              caption: "New home, new chapter. Alhamdulillah. Yousef already claimed the biggest room 😂 So grateful for this blessing.",
              likes: 489,
              comments: 73,
              locationName: "Ara Damansara, Selangor",
            },
          ]),
        },
      ],
      created_at: d("2026-04-24"),
      is_seed: true,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // PROJECT — 1 total
    // ─────────────────────────────────────────────────────────────────────────

    await ctx.db.insert("projects", {
      batch_sales_angle: "Scan flagged high-urgency life events across 7 clients this week — new babies, a layoff on maternity leave, a promotion cluster, and a new home. Hit them before the moment passes.",
      created_at: d("2026-06-14"),
      clients: [
        {
          client_id: c5,
          notes: "Baby Alya born June 19. Entrepreneur, zero coverage. Close executive whole life + maternity rider this week.",
          status: "to_follow_up",
          next_follow_up_scheduled: "2026-06-23",
        },
        {
          client_id: c4,
          notes: "Second baby born May 11, hit with layoff June 7 while on leave. Two kids, no income protection. Urgent compassionate outreach.",
          status: "followup_after_success",
          next_follow_up_scheduled: "2026-06-15",
        },
        {
          client_id: c0,
          notes: "Promoted Lead Engineer May, baby Aisyah born June 13. Term underinsured + education endowment window open.",
          status: "to_follow_up",
          next_meeting_scheduled: "2026-06-21",
        },
        {
          client_id: c2,
          notes: "Head of IT April, baby Aidan born June 11. Whole life sum assured from 2020 is insufficient for two kids.",
          status: "to_follow_up",
          next_follow_up_scheduled: "2026-06-22",
        },
        {
          client_id: c1,
          notes: "Baby Adam Hakimi born May 30. No existing policy. Proposal sent June 1 — no reply yet. Follow up now.",
          status: "meeting_scheduled",
          next_meeting_scheduled: "2026-06-16",
        },
        {
          client_id: c3,
          notes: "MD APAC confirmed April. Annuity + trust proposal shared — ready to close. Schedule final meeting.",
          status: "to_follow_up",
          next_meeting_scheduled: "2026-06-18",
        },
        {
          client_id: c9,
          notes: "Moved into Ara Damansara. MRTA + takaful top-up needed. First outreach — warm tone.",
          status: "to_follow_up",
          next_follow_up_scheduled: "2026-06-17",
        },
      ],
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CHAT HISTORY — 5 messages per client × 10 clients
    // ─────────────────────────────────────────────────────────────────────────

    await ctx.db.insert("chat_history", {
      client_id: c0,
      messages: [
        { sender: "advisor", message: "Hi Ahmad Fariz! Saw the Lead Engineer announcement on LinkedIn — huge congratulations! Well deserved 🎉", timestamp: d("2026-05-18") },
        { sender: "client",  message: "Thank you! And actually, we have even bigger news... wife is expecting too 😅", timestamp: d("2026-05-18") },
        { sender: "advisor", message: "Wow, double celebration! That's exactly why we should look at a maternity rider and an education plan. When are you free for a call?", timestamp: d("2026-05-19") },
        { sender: "client",  message: "This Saturday 10am works for me.", timestamp: d("2026-05-19") },
        { sender: "advisor", message: "Saturday 10am confirmed! I'll prepare a full family plan proposal. Looking forward to it.", timestamp: d("2026-05-20") },
      ],
      updated_at: d("2026-05-20"),
    });

    await ctx.db.insert("chat_history", {
      client_id: c1,
      messages: [
        { sender: "advisor", message: "Salam Nurul Ain! Saw your beautiful announcement — congratulations! First baby is such a special milestone 🌸", timestamp: d("2026-04-25") },
        { sender: "client",  message: "Thank you! We're so excited. Due in July. Honestly a bit nervous too haha.", timestamp: d("2026-04-25") },
        { sender: "advisor", message: "That's so normal! One thing that will give you peace of mind — making sure you're covered before the birth. Do you have any existing policy?", timestamp: d("2026-04-26") },
        { sender: "client",  message: "Honestly no. I've been meaning to sort this out for ages.", timestamp: d("2026-04-26") },
        { sender: "advisor", message: "Let's fix that. I'll send you a simple family starter plan — takes 20 minutes to go through. Can we do Thursday 8pm?", timestamp: d("2026-04-27") },
      ],
      updated_at: d("2026-04-27"),
    });

    await ctx.db.insert("chat_history", {
      client_id: c2,
      messages: [
        { sender: "advisor", message: "Khairul! Head of IT at Celcom — that's a serious promotion. Congratulations! 🙌", timestamp: d("2026-04-08") },
        { sender: "client",  message: "Thank you! Came with a pay bump too. Finally feels like things are moving.", timestamp: d("2026-04-08") },
        { sender: "advisor", message: "That's exactly the right time to review your whole life cover — the 2020 sum assured probably doesn't reflect your income anymore.", timestamp: d("2026-04-09") },
        { sender: "client",  message: "You're right. And actually Syafiqah is also expecting our second. So two big changes at once!", timestamp: d("2026-04-09") },
        { sender: "advisor", message: "Perfect timing to get everything reviewed. I'll prepare a proposal covering both kids and your new income. How's next week?", timestamp: d("2026-04-10") },
      ],
      updated_at: d("2026-04-10"),
    });

    await ctx.db.insert("chat_history", {
      client_id: c3,
      messages: [
        { sender: "advisor", message: "Raj, congratulations on the Managing Director role! APAC is a huge remit — you've worked incredibly hard for this.", timestamp: d("2026-04-14") },
        { sender: "client",  message: "Thank you. It comes with a lot of responsibility. More to protect now too, honestly.", timestamp: d("2026-04-14") },
        { sender: "advisor", message: "Exactly. This is the right time to talk about an annuity and a proper trust structure. Your estate exposure has grown significantly.", timestamp: d("2026-04-15") },
        { sender: "client",  message: "I've been putting this off for too long. Let's do it. Can we meet next week?", timestamp: d("2026-04-15") },
        { sender: "advisor", message: "Wednesday lunch, 12:30pm at your office? I'll bring the full legacy + annuity proposal.", timestamp: d("2026-04-16") },
      ],
      updated_at: d("2026-04-16"),
    });

    await ctx.db.insert("chat_history", {
      client_id: c4,
      messages: [
        { sender: "advisor", message: "Brittany! Jack is adorable — congratulations to you and Chris. Welcome to the four-person club! 💙", timestamp: d("2026-05-12") },
        { sender: "client",  message: "Thank you! Exhausted but so happy. Emma is obsessed with him already.", timestamp: d("2026-05-12") },
        { sender: "advisor", message: "Brittany, I saw the news about TechCo. I'm really sorry — are you affected?", timestamp: d("2026-06-08") },
        { sender: "client",  message: "Yes. Got the call yesterday. On leave with a newborn and now this. Honestly terrified.", timestamp: d("2026-06-08") },
        { sender: "advisor", message: "I understand. Let me pull your full situation today and call you this afternoon — we'll figure this out together.", timestamp: d("2026-06-08") },
      ],
      updated_at: d("2026-06-08"),
    });

    await ctx.db.insert("chat_history", {
      client_id: c5,
      messages: [
        { sender: "advisor", message: "Hi Raina! Congratulations on the pregnancy — what exciting news! 🤍", timestamp: d("2026-04-10") },
        { sender: "client",  message: "Thank you! Still early but couldn't keep quiet haha. A lot to figure out.", timestamp: d("2026-04-10") },
        { sender: "advisor", message: "I saw the news about your father-in-law. I'm so sorry Raina. Please take all the time you need.", timestamp: d("2026-05-29") },
        { sender: "client",  message: "Thank you. Tough week. But also a reminder of why this stuff matters.", timestamp: d("2026-05-29") },
        { sender: "advisor", message: "Raina! Baby Alya is here — the post is so beautiful 🌸 Warmest congratulations to you and Zaki.", timestamp: d("2026-06-20") },
      ],
      updated_at: d("2026-06-20"),
    });

    await ctx.db.insert("chat_history", {
      client_id: c6,
      messages: [
        { sender: "advisor", message: "Shannon! Head of AI Products — that's a significant step up. Congratulations!", timestamp: d("2026-04-22") },
        { sender: "client",  message: "Thanks haha! More responsibility, which honestly means I should probably sort out my coverage.", timestamp: d("2026-04-22") },
        { sender: "advisor", message: "Exactly my thinking. At a lab environment there's always funding risk. A disability income plan gives you a solid floor regardless.", timestamp: d("2026-04-23") },
        { sender: "client",  message: "That makes sense. What does it actually look like? Can you show me the numbers?", timestamp: d("2026-04-23") },
        { sender: "advisor", message: "I'll send you a comparison of two options by Friday — both fit comfortably within your income range.", timestamp: d("2026-04-24") },
      ],
      updated_at: d("2026-04-24"),
    });

    await ctx.db.insert("chat_history", {
      client_id: c7,
      messages: [
        { sender: "advisor", message: "Ammara! Saw the Petronas announcement — congratulations on the new role! Big company, great start.", timestamp: d("2026-05-04") },
        { sender: "client",  message: "Thank you! First real corporate job. First proper salary too 😅", timestamp: d("2026-05-04") },
        { sender: "advisor", message: "This is honestly the best time to start a policy — young, healthy, first salary. Premiums are as low as they'll ever be.", timestamp: d("2026-05-05") },
        { sender: "client",  message: "I know I should. I just don't know where to start. It feels overwhelming.", timestamp: d("2026-05-05") },
        { sender: "advisor", message: "No worries — I'll keep it simple. Just a starter term + H&S for now. Can we do a quick 20-min call this week?", timestamp: d("2026-05-06") },
      ],
      updated_at: d("2026-05-06"),
    });

    await ctx.db.insert("chat_history", {
      client_id: c8,
      messages: [
        { sender: "advisor", message: "Menna, congratulations on the engagement! Such a beautiful announcement 💍", timestamp: d("2026-04-18") },
        { sender: "client",  message: "Thank you so much! We're so happy. Still feels surreal honestly.", timestamp: d("2026-04-18") },
        { sender: "advisor", message: "Pre-wedding is genuinely the best time to set up a joint life plan — before the wedding rush makes everything hard to schedule.", timestamp: d("2026-04-19") },
        { sender: "client",  message: "I've actually been thinking about this. We both want to be covered properly.", timestamp: d("2026-04-19") },
        { sender: "advisor", message: "Perfect. I'll put together a takaful joint plan for both of you. How's next week for a chat?", timestamp: d("2026-04-20") },
      ],
      updated_at: d("2026-04-20"),
    });

    await ctx.db.insert("chat_history", {
      client_id: c9,
      messages: [
        { sender: "advisor", message: "Juri, congratulations on the new home in Ara Damansara! What a milestone for the family 🏡", timestamp: d("2026-05-11") },
        { sender: "client",  message: "Alhamdulillah! Yousef loves it. Lots of space for him to run around now.", timestamp: d("2026-05-11") },
        { sender: "advisor", message: "Now that you own the property, MRTA becomes really important — it clears the mortgage if anything happens to you.", timestamp: d("2026-05-12") },
        { sender: "client",  message: "Yes, the bank mentioned something about this. What's the difference between MRTA and just increasing my existing takaful?", timestamp: d("2026-05-12") },
        { sender: "advisor", message: "Great question — they serve different purposes. Can I call you this weekend to walk through both options?", timestamp: d("2026-05-13") },
      ],
      updated_at: d("2026-05-13"),
    });
  },
});
