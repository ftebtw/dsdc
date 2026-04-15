#!/usr/bin/env node
// One-shot script to add 7 new blog posts for Feb-Apr 2026.
// Safe to re-run: skips any slug that already exists.

import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "content", "blog-posts.json");
const existing = JSON.parse(fs.readFileSync(file, "utf8"));
const existingSlugs = new Set(existing.map((p) => p.slug));

const sub = (content) => ({ type: "subheading", content });
const p = (content) => ({ type: "paragraph", content });

const posts = [
  // ===================================================================
  // POST 1
  // ===================================================================
  {
    slug: "public-speaking-activities-for-kids",
    title: "Public Speaking Activities for Kids You Can Do at Home",
    excerpt:
      "Nine practical speaking exercises you can do with your child tonight — from topic talks to family debate night — to build confidence without a classroom in sight.",
    date: "2026-02-11",
    author: "DSDC Team",
    category: "Parent Tips",
    readTime: "7 min read",
    sections: [
      p(
        "If your child is the first to volunteer at the dinner table but freezes up the moment the teacher calls on them in class, you are not alone. Most kids can talk freely at home but tighten up the second there is an audience — and that is actually good news. It means the skill is not missing; it just needs practice in a setting that gradually raises the stakes."
      ),
      p(
        "The best place to start is right at your kitchen table. You do not need a curriculum, a coach, or a classroom to build your child's speaking confidence. You need ten minutes, a bit of structure, and a willingness to be slightly ridiculous together. Here are nine activities you can start tonight."
      ),
      sub("Why Home Is the Best First Stage"),
      p(
        "Kids learn to speak in public the same way they learn any other skill — reps plus feedback in a place they feel safe enough to try and fail. Home is the only environment where your child gets both, without the social risk of a classroom or stage. The goal at this stage is not polish. It is time on their feet, in front of people who love them, talking about things."
      ),
      p(
        "None of the activities below require any materials you do not already have. Most take under ten minutes. All of them work best if you participate too — kids take speaking practice more seriously when it is something the whole family does together."
      ),
      sub("1. The Two-Minute Topic Talk"),
      p(
        "Write 20 random topics on slips of paper — \"my favourite breakfast,\" \"why dogs are better than cats,\" \"the weirdest thing in our fridge,\" \"what I would do with a million dollars.\" Pull one out and give your child two minutes to speak on it with no prep time. No notes, no take-backs. It is fine if they stumble. It is fine if they only fill 45 seconds the first time. **What it builds:** thinking on your feet and overcoming the blank-page fear that shuts most kids down the moment they are asked to speak without warning."
      ),
      sub("2. Family Debate Night"),
      p(
        "Pick a motion the whole family can weigh in on: \"pineapple belongs on pizza,\" \"summer holidays should be longer,\" \"video games make you smarter.\" Assign sides — and do not let your child pick the side they already believe. Each side gets two minutes to argue. You will be surprised how much structure kids naturally develop when they have to defend a position they disagree with. **What it builds:** argument construction, mental flexibility, and the confidence to stand behind a position in front of other people."
      ),
      sub("3. Storytelling Dice or Cards"),
      p(
        "Grab a set of storytelling dice (or make your own with index cards) featuring random images — a castle, a cat, a storm, a suitcase. Roll three and give your child two minutes to invent a story that uses all of them. No right answer. No judging. Just a timer and a willingness to commit. **What it builds:** creative thinking under time pressure and the ability to structure a narrative on the fly — the same muscle students use in impromptu speaking and World Schools debate."
      ),
      sub("4. \"Teach Me Something\" Mini-Presentations"),
      p(
        "Ask your child to spend ten minutes preparing a three-minute presentation on anything they know well — how to beat a Minecraft boss, why blue whales are interesting, how to do a bike trick. You sit down and pay genuine attention. Ask one real question at the end. This simple setup mirrors how real presentations work: preparation, delivery, and handling questions from an audience. **What it builds:** structuring information for a listener who does not already know the topic, plus handling live questions without panicking."
      ),
      sub("5. The Impromptu Question Jar"),
      p(
        "Keep a jar of questions on the kitchen counter. Not softballs — questions with substance: \"should kids be allowed to have phones at school?\" \"is it better to be really good at one thing or okay at many things?\" \"what is the best rule in our house, and what is the worst?\" At least once a week, pull one out and ask your child to answer for one minute. **What it builds:** the habit of forming opinions quickly and defending them with reasons — the foundation of every debate format used in Canada."
      ),
      sub("6. Record, Watch, and Rate"),
      p(
        "Have your child record a one-minute speech on their phone, then watch it back with you. This one is uncomfortable the first time and incredibly useful after. Ask them to rate themselves on three things: eye contact, volume, and whether they sounded confident. No criticism from you — let their self-assessment do the work. **What it builds:** self-awareness, which is the single fastest accelerator of public speaking improvement. Most kids have no idea what they look like when they speak until they see it."
      ),
      sub("7. Dinner Table Timers"),
      p(
        "At dinner, introduce a \"one-minute share\" round. Each family member gets sixty seconds to talk about something from their day — highs, lows, or something they learned. Use an actual timer. The time limit matters: it teaches kids to prioritise, cut filler, and land their point before running out of time. **What it builds:** economy of words and the ability to respect a clock — a skill every competitive debater has to develop eventually."
      ),
      sub("8. The Persuasive Pitch Challenge"),
      p(
        "Once a week, let your child try to change your mind about something — with rules. They have two minutes. They need three reasons. They have to use at least one example from their own experience. If their argument is genuinely good, follow through on it (within reason). Kids take this seriously when the stakes are real, and \"convince me to let you stay up thirty minutes later\" is a surprisingly rigorous exercise in persuasion. **What it builds:** real-world persuasion, which is what public speaking is actually for."
      ),
      sub("9. Read Aloud — With Performance"),
      p(
        "Pick a book slightly above your child's reading level and have them read a paragraph aloud, but with direction: \"read it like you're telling your best friend a secret,\" \"read it like you're a sports commentator,\" \"read it like you're furious.\" Silly on purpose. The point is not the book — it is separating the words on the page from the voice that delivers them. **What it builds:** vocal variety, expression, and the confidence to sound like something other than a robot reciting a textbook."
      ),
      sub("Making It Stick"),
      p(
        "Three rules for keeping this going. First, do it often but not long — ten minutes three times a week beats an hour once a month. Second, celebrate effort, not polish. The worst thing you can do is make your child feel judged in the one place they should feel safe trying. Third, join in. If you are willing to give a two-minute topic talk on \"my worst haircut,\" your child will too."
      ),
      p(
        "One more thing worth remembering: the goal is not to raise a performer. It is to raise a kid who can speak when they need to — in class, in interviews, in life. The activities above feel light because they are. The skills they build are anything but."
      ),
      sub("When Home Practice Needs a Classroom"),
      p(
        "Home activities are a fantastic starting point, but there is a ceiling. Once your child is comfortable talking in front of you, the next step is practicing in front of peers their own age, in a structured environment where a coach can give specific feedback. That is where group classes come in. Our [public speaking classes for kids](/public-speaking-classes-for-kids) are built for exactly this moment: students who have found their voice at home and are ready to test it somewhere slightly less forgiving (in the best way)."
      ),
      p(
        "For families whose kids are leaning into debate specifically, our [beginner debate classes](/debate-classes-for-beginners) take the same muscles these games build and apply them to formal argument structure. You can also read more about [the benefits of public speaking](/blog/public-speaking-benefits), or [book a free consultation](/book) if you are not sure which program fits."
      ),
      p(
        "The short version: the hardest part of public speaking is the first time. Home is the best place to take the first swing, and the second, and the tenth. By the time your child walks into a classroom, they will already know what their voice sounds like in front of an audience — and that is worth more than any warm-up a coach can run."
      ),
    ],
  },

  // ===================================================================
  // POST 2
  // ===================================================================
  {
    slug: "shy-child-public-speaking",
    title: "How to Help a Shy Child Build Confidence Speaking",
    excerpt:
      "A practical, empathetic guide for parents of shy or introverted kids — how to build speaking confidence at home, when to bring in a class, and what actually works.",
    date: "2026-02-25",
    author: "DSDC Team",
    category: "Parent Tips",
    readTime: "8 min read",
    sections: [
      p(
        "Your child dreads presentations. Raises their hand only when they are certain. Asks to go to the bathroom on show-and-tell day. If any of this sounds familiar, take a breath — your kid is not broken, and you are not failing them. Shyness in speaking situations is one of the most common things we see in first-time families at DSDC, and it is almost always something kids can work through."
      ),
      p(
        "The mistake most well-meaning parents make is not ignoring the problem. It is pushing too hard, too early, in the wrong direction. Here is what actually helps."
      ),
      sub("Shyness Is Normal — Not a Disorder"),
      p(
        "First, reframe. Shyness is a temperament trait, not a medical condition. Some kids walk into a room and want to meet everyone. Others walk in and take ten minutes to decide if the room is safe. Both are normal. Neither is wrong. Introverted and shy kids become strong public speakers all the time — Rebecca, who founded DSDC, built her whole career on public speaking and still describes herself as an introvert outside the classroom."
      ),
      p(
        "What matters is the skill, not the temperament. Quiet kids do not need to become loud kids. They need to become kids who can speak up when it matters, even if they would rather not."
      ),
      sub("The Difference Between Shyness and Anxiety"),
      p(
        "There is, however, a difference between ordinary shyness and genuine anxiety. Shyness is discomfort — your child does not love being called on, but they can do it when asked. Anxiety is avoidance that comes with physical symptoms: stomachaches before school, tearfulness about presentations days in advance, panic responses, or refusal to attend activities they otherwise enjoy."
      ),
      p(
        "If you are seeing signs of genuine anxiety — especially if it is affecting sleep, eating, or school attendance — talk to your child's doctor or a child psychologist before adding any public speaking activities to the mix. The Canadian Mental Health Association has good resources on recognising anxiety in children. Public speaking practice is useful alongside professional support, not as a replacement for it. The strategies below are for ordinary shyness, which is what most families are dealing with."
      ),
      sub("Start Small and Private"),
      p(
        "The fastest way to make a shy child hate speaking is to put them in front of an audience before they are ready. Start with an audience of one: you. Before any group setting, give your child practice in the kitchen, in the car, at bedtime. Low stakes. No grades. No corrections unless they ask."
      ),
      p(
        "Even better, make the practice feel like something else. Ask them to \"explain how your video game works\" or \"tell me the story of that book.\" They are practicing public speaking — they just do not know it yet, which is exactly the point."
      ),
      sub("Celebrate Effort, Not Polish"),
      p(
        "This is the hardest rule for parents to internalise. When your shy child finally gives it a try — mumbles through a short talk, goes quiet in the middle, forgets what they were saying — resist the urge to critique. Even gentle, well-meaning feedback like \"you could speak up a bit louder next time\" can land as \"I failed.\""
      ),
      p(
        "Praise specifically, praise effort, and praise things under their control: \"I noticed you kept going even when you lost your place — that is really hard to do.\" \"You tried something new tonight. That took guts.\" Polish comes from repetition. Repetition only happens if your child does not dread the next attempt."
      ),
      sub("Never Force, Never Shame"),
      p(
        "There is a version of parenting advice that says to throw them in the deep end. For shy speakers, the deep end reliably produces a kid who avoids the pool for the next decade. If your child does not want to give a speech at the birthday party, do not make them. If they will not raise their hand in class for weeks, do not punish. Do not compare them to siblings or classmates. Do not tell them \"there is nothing to be afraid of\" — to them, there clearly is."
      ),
      p(
        "What you are trying to build is a child who associates speaking with agency, not obligation. That means every step forward has to be a step they chose."
      ),
      sub("Practice One-on-One Before Group Settings"),
      p(
        "Here is a practical ladder that works for most shy kids. Step one: your child talks to you about something they love, for two minutes. Step two: they do it in front of one other family member. Step three: a FaceTime call with a grandparent. Step four: a small group of friends or cousins. Step five: an actual class."
      ),
      p(
        "It can take weeks to move up a rung. That is fine. The ladder works because each step feels only slightly harder than the one before. Skipping rungs is what breaks the process — and once broken, it is much harder to restart."
      ),
      sub("Let Them Choose Topics They Care About"),
      p(
        "Forcing a shy child to speak about something they do not care about is doubly hard — they have to fight both their nerves and their boredom. Let them speak about what they actually love. Dinosaurs. Taylor Swift. How pizza is made. Their favourite soccer team. Their D&D character."
      ),
      p(
        "When a kid is genuinely interested in their topic, the words come easier and the nerves get quieter. It is also how you discover, as a parent, that your \"shy kid\" becomes suddenly articulate when the subject is right. That is not a different child. That is the same child in a setting where the stakes feel bearable."
      ),
      sub("How the Right Class Environment Helps"),
      p(
        "At some point, home practice hits its ceiling. For shy kids, moving from parents to peers is the hardest step — and also the most important. The classroom environment matters enormously. A large, competitive, elimination-style setting is usually wrong for a shy first-time student. A small, warm, structured group is right."
      ),
      p(
        "What to look for: small class sizes (8-12 is ideal — enough for social exposure, small enough that the coach knows every student), coaches trained to pull quieter kids in gently, no \"everyone must speak on day one\" pressure, and a progression from low-stakes activities into real speaking. Warm-ups matter. Structure matters. Who is in the room matters."
      ),
      sub("Signs Your Child Might Be Ready"),
      p(
        "You do not need your child to be bouncing off the walls with excitement. But a few signals suggest they are ready to try a class: they can comfortably speak for a minute or two at home about something they like, they are willing to talk on FaceTime or phone calls with family, and they have expressed — even reluctantly — that they would like to get better at speaking in class. That last one is the biggest. Motivation is worth more than confidence at this stage."
      ),
      sub("What to Expect in the First Few Sessions"),
      p(
        "At DSDC, our novice classes are specifically designed for shy and first-time students. The first session is almost always gentle: introductions, simple warm-up games, no pressure to do anything unfamiliar alone. Week two might involve a short activity in pairs. By weeks three and four, most kids are giving short, low-stakes speeches — usually without realising how far they have come in a month."
      ),
      p(
        "The turning point is usually around session four or five. Something clicks. The student who whispered on day one volunteers to go first. Parents email us surprised. It happens so reliably we barely write it down anymore."
      ),
      sub("The DSDC Approach for Shy Students"),
      p(
        "Our novice-level [beginner debate classes](/debate-classes-for-beginners) and [public speaking classes for kids](/public-speaking-classes-for-kids) are built around exactly this progression. Coaches are briefed on students who need extra warmth in the first few weeks. Class sizes stay small. Nothing gets thrown at a new student in week one that they have not already done once in a less intimidating version."
      ),
      p(
        "If your child is on the shy end of the spectrum and you are not sure where to start, [book a free consultation](/book) and we will help you figure out which [class](/classes) is the right first step. The goal is not to change who your child is. It is to give them a voice that works when they need it."
      ),
      p(
        "Most shy kids who stay with it for a term come out the other side looking at you like, \"what was I so worried about?\" That is the whole job."
      ),
    ],
  },

  // ===================================================================
  // POST 3
  // ===================================================================
  {
    slug: "choosing-debate-program-for-kids",
    title: "What to Look for When Choosing a Debate Program",
    excerpt:
      "Nine things worth checking before you enroll your child in any debate program — coach credentials, class size, feedback, pricing, tournament support, and more.",
    date: "2026-03-05",
    author: "DSDC Team",
    category: "Parents & Resources",
    readTime: "9 min read",
    sections: [
      p(
        "Choosing a debate program for your child is harder than it should be. Websites do not list prices. Class sizes are not published. \"Award-winning coaches\" can mean anything from university debate champions to part-time tutors. You are trying to spend real money on something that supposedly changes your child's academic and social trajectory, and the sector makes it deliberately hard to compare options."
      ),
      p(
        "This article is a framework, not a sales pitch. Here are nine things worth checking before you hand over a tuition cheque — and what \"good\" looks like for each. Use it to evaluate any program, including ours."
      ),
      sub("1. Coach Credentials and Competitive Experience"),
      p(
        "Enthusiasm is not a qualification. The best debate coaches are people who have actually competed at a high level — national tournaments, varsity university circuits, world championships — and then learned how to teach. Competitive experience matters because it is how coaches know what judges look for, what separates a winning argument from a losing one, and where students typically get stuck."
      ),
      p(
        "Ask any program: where did your coaches compete, and at what level? If they cannot answer specifically, keep looking. At DSDC, our coaches come from UBC, SFU, the University of Sydney, the Canadian National Debate Team, and the World University Debating Championships. You can [meet our coaching team](/team) on our website — we list every coach with their credentials and experience, because we think parents deserve to know exactly who their child is learning from."
      ),
      sub("2. Class Size"),
      p(
        "Class size in a speaking program is not a vanity metric — it is a mechanical constraint on how much your child actually gets to speak. In a 30-student class, each student might get two or three minutes of speaking time per session. In an 8-12 student class, they get twenty to thirty. That is an order-of-magnitude difference, and it compounds over a term."
      ),
      p(
        "Aim for 8-12 students per class as the sweet spot: large enough to have a real group dynamic and a variety of speakers to practice against, small enough that the coach knows every student by name and gives them meaningful attention each session. That is the size we run at DSDC, for exactly that reason. A program that will not tell you its class size before booking a call is telling you something."
      ),
      sub("3. Feedback Structure"),
      p(
        "Ask the program: \"how often does my child get personalised feedback, and what does it look like?\" Some programs give feedback only at the end of term. Some just give group feedback (\"good job today, team\") that does not tell any single student what to fix. Neither is worth much."
      ),
      p(
        "You want a program where every student gets specific, individual feedback every class. \"Your argument was strong but you rushed your conclusion — next week I want you to slow down the last twenty seconds\" is what coaching sounds like. \"Great effort everyone\" is not. At DSDC, coaches give individual feedback after every practice round, and parents receive structured progress notes at key points in the term."
      ),
      sub("4. Format Coverage"),
      p(
        "Canadian high school debate runs on a handful of formats — CNDF, British Parliamentary, World Schools, and Cross-Examination. Canadian middle school debate often uses modified versions of these. Make sure the program you are considering actually teaches the formats used at the tournaments your child would eventually enter."
      ),
      p(
        "A program built around formats that are not used at Canadian Nationals or provincial tournaments is not preparing your child for the competitive pathway — it is just teaching general speaking. That is not always a problem if general speaking is the goal. But if your child might eventually want to [qualify for Canadian Nationals](/blog/qualify-canadian-nationals), make sure the coaching covers the formats they will compete in. You can read more about [debate formats in Canada](/blog/canadian-debate-formats) if you are new to the landscape."
      ),
      sub("5. Transparent Pricing"),
      p(
        "If you cannot find pricing on the website, that is a red flag. We have written about this extensively before (see [how much debate classes cost](/blog/debate-classes-cost)), but the short version: any program that hides its fees until after a \"consultation call\" is almost certainly pricing you based on perceived willingness to pay."
      ),
      p(
        "Fair pricing for group classes in Canada is roughly $30-60 per hour. The higher end of that range is reasonable for coaches with elite competitive experience. Anything dramatically outside that range — in either direction — warrants questions. At DSDC, our [pricing](/pricing) is public: $30 CAD per hour for regular group debate, $40 per hour for World Scholar's Cup coaching, and $50 per hour for our advanced BP competitive program. No quotes. No negotiation. Everyone pays the same rate."
      ),
      sub("6. Trial Policy and Risk"),
      p(
        "Does the program let you try a class before committing? Can you withdraw if it is not working after a few sessions? The answer should be yes to at least one of those. Programs confident in their product are not afraid to let students sample it. Programs that lock families into long-term contracts up front are usually relying on inertia to keep students enrolled."
      ),
      p(
        "Even better: look for programs with flexible session counts or short initial terms. A family should not have to commit to twelve months of tuition before knowing whether their child likes the coach."
      ),
      sub("7. Progression Pathway"),
      p(
        "A serious debate program has a clear ladder: novice, junior, senior, advanced competitive. Each level has specific skills it builds on, and students move up when they are ready — not when the calendar says so. Ask the program: what happens after the beginner class? How do you know when my child is ready for the next level?"
      ),
      p(
        "If the answer is vague, you are probably looking at a program that treats every student the same for the entire term. That works for casual enrichment but not for students who want to grow. At DSDC, we run [classes](/classes) at Novice, Junior, Senior, Advanced Competitive, Public Speaking, and World Scholar's Cup levels, with clear transitions between them and coaches who recommend level changes based on actual development, not age."
      ),
      sub("8. Tournament Support"),
      p(
        "If your child eventually wants to compete — and many do, even the ones who do not start out interested — the program's tournament support matters. Does the coach help students prepare for specific tournaments? Do they attend tournaments with their students, either in person or online? Do they debrief after rounds?"
      ),
      p(
        "A program that only teaches in the classroom and sends students to tournaments alone is missing the most important part of competitive development. Tournament feedback — the kind coaches can only give after watching a real round against unfamiliar opponents — is where debaters grow the fastest."
      ),
      sub("9. Track Record"),
      p(
        "Every program claims \"great results.\" Ask for specifics. What tournaments have students placed at? How many qualified for regionals, provincials, nationals? What is the World Scholar's Cup qualification rate? If the numbers are not on the website, ask. A program that cannot cite specific student achievements — with tournament names and dates — is one where those achievements may not exist."
      ),
      p(
        "You can see DSDC's [student awards and results](/awards) on our website. We list tournament outcomes because parents deserve to see what the program has actually produced, not just what we claim it can. Among the numbers worth highlighting: a 100% qualification rate for our World Scholar's Cup teams from regionals to the Tournament of Champions at Yale since 2020."
      ),
      sub("Putting It All Together"),
      p(
        "The good news is that applying this framework takes about fifteen minutes. Visit the website. Check coach bios. Check class sizes. Check pricing. Check if there is a trial or withdrawal option. Check what the awards page actually says. If you cannot find half of that in fifteen minutes, the program is not making it easy on purpose."
      ),
      p(
        "If everything checks out and you want to see how DSDC compares directly, [book a free consultation](/book) and we will walk you through exactly what your child would experience in our classes. We do not do sales pitches — we do honest fits. Sometimes that means telling families that a different schedule or a different class level is a better match, and that is fine too."
      ),
      p(
        "The goal here is the right program for your child, not any particular program. The framework above works regardless of which one you choose."
      ),
    ],
  },

  // ===================================================================
  // POST 4
  // ===================================================================
  {
    slug: "how-to-start-debate-club",
    title: "How to Start a Debate Club at Your School",
    excerpt:
      "A student's step-by-step guide to starting a debate club at your school — finding a sponsor, recruiting members, picking a format, and running your first meetings.",
    date: "2026-03-18",
    author: "DSDC Team",
    category: "Student Tips",
    readTime: "9 min read",
    sections: [
      p(
        "So you want to start a debate club at your school. Maybe there is not one and you are tired of waiting. Maybe there used to be one and it died when the teacher sponsor retired. Maybe you watched a debate tournament online and thought, \"I could do that, if I had somewhere to practice.\" Whatever the reason, here is the good news: starting a debate club is easier than you think, and you do not need permission from the universe to do it. You need a plan and the willingness to send a few emails."
      ),
      p(
        "I am writing this for you, the student. If you follow the steps below, you can realistically have a functioning club meeting within four weeks. Not a perfect club. Not a championship-winning club. A real club, with members and a room and a format. The rest is practice."
      ),
      sub("Step 1: Find a Teacher Sponsor"),
      p(
        "Every school club needs a staff sponsor. Your job is to find a teacher willing to let you use their classroom once a week and sign off on the paperwork. Here is who to ask, in order: an English teacher who already loves argument and discussion, a Social Studies or History teacher (they run the most motion-ready classrooms), a debate-adjacent subject like Philosophy or Law if your school offers it, and finally any teacher you already have a good relationship with, even if they teach something unrelated."
      ),
      p(
        "When you ask, do not open with \"will you sponsor my club?\" Open with \"I am starting a debate club at the school — could I have five minutes to tell you about it?\" Then pitch it: there is student interest, you have a plan, you will handle recruiting and organisation, all they need to do is be in the room and sign forms. Make it sound low-effort, because for them, it should be."
      ),
      sub("Step 2: Recruit Your First Members"),
      p(
        "You do not need twenty people on day one. You need six to eight. That is enough for a practice round. It is less intimidating to recruit. It is easier to schedule. Here is how to get them: start with friends who are already curious, then post a short notice on your school's announcement system or Instagram page, and finally ask your teacher sponsor to mention it in class."
      ),
      p(
        "Key thing: do not pitch debate as \"competitive arguing.\" That scares most people off. Pitch it as \"getting better at speaking, making arguments, and having strong opinions you can actually defend.\" Most students want that. Very few students think of it as \"debate.\" The people you recruit in week one do not have to become lifelong debaters. They just have to show up to meetings so the club can exist."
      ),
      sub("Step 3: Pick a Starting Format"),
      p(
        "Do not try to teach every format at once. Pick one that matches where you are. If your school is in Canada and you want a path to [qualify for Canadian Nationals](/blog/qualify-canadian-nationals), start with CNDF. If you want your members to compete at international tournaments and have members interested in global issues, start with World Schools. British Parliamentary is excellent for later but less friendly as a first exposure — it is a lot of positions and rules to explain in week one."
      ),
      p(
        "CNDF is the right pick for most Canadian school clubs. Two-on-two, short speeches, a mix of prepared and impromptu motions, clear structure that new students can grasp in one session. Once the club is established, you can add other formats later. You can read more about [debate formats in Canada](/blog/canadian-debate-formats) before deciding which one to start with."
      ),
      sub("Step 4: Structure Your First Few Meetings"),
      p(
        "Your first meeting needs to do three things: introduce the format clearly, give members a taste of actually doing it, and get them to want to come back. Here is a template that works."
      ),
      p(
        "**Meeting 1 — What debate is and why we are doing it.** Explain the format in fifteen minutes. Do a group exercise where everyone picks one side of an easy motion (\"school should start at 10am\") and shares one reason for thirty seconds each. End early. Leave people wanting more."
      ),
      p(
        "**Meeting 2 — Case building.** Give members a motion in advance. Walk through how to build an argument: claim, reason, evidence, example. Have them build cases in pairs. No full rounds yet."
      ),
      p(
        "**Meeting 3 — First practice round.** Put two teams on each side of a motion. Run short speeches (three to four minutes each, or less if needed). Time it with a phone. Do not worry about style. Do not judge formally. Just get everyone talking."
      ),
      p(
        "**Meetings 4 onwards — Full rounds, rotating speakers, and feedback.** This is when the club starts to feel like a club, and when the learning actually compounds week over week."
      ),
      sub("Step 5: Connect with Your Provincial Debate Association"),
      p(
        "Every province has a debate association that runs tournaments and supports school clubs. In BC, it is DSABC. In Ontario, it is OSDU. In Alberta, it is ADSA. Across the country, the Canadian Student Debating Federation oversees national-level tournaments and connects provincial bodies together."
      ),
      p(
        "Email your provincial association, tell them you are starting a club, and ask for their tournament calendar and any school resources they offer. Most associations are thrilled to hear from new schools and will send you motions, judging guides, and upcoming tournament information. This is free, and most clubs never think to do it. You will have a huge head start if you do. You can also read [our complete guide to debate in Canada](/guide-to-debate-in-canada) for a deeper overview of how the national system works."
      ),
      sub("Step 6: Register for Your First Tournament"),
      p(
        "The fastest way to accelerate your club's progress is to actually go to a tournament. Not in a month or two — start preparing to register for one within your first term. Pick a beginner-friendly tournament, one where novice divisions exist. Register two or three teams. Even if nobody wins, the experience of a real round against outside opponents is worth ten practice sessions. It is the moment debate stops being a club activity and becomes a real thing."
      ),
      p(
        "Prep for it by running full-length practice rounds in the weeks leading up, and by assigning members specific speaker positions so everyone knows their role going in. Debrief afterwards, honestly, and use what you learned to plan the next month of club meetings."
      ),
      sub("Step 7: Get Outside Coaching Support"),
      p(
        "School clubs are great for practice and community, but they have limits. Teacher sponsors usually do not have deep competitive debate backgrounds. Clubs meet once a week. Feedback quality varies widely. If you or your team want to go past the \"fun hobby\" stage into real competition, outside coaching makes a difference — fast."
      ),
      p(
        "A lot of the students at DSDC started or revitalised their school debate clubs after joining our program. They bring what they learn at DSDC back to their club meetings and raise the level of everyone around them. It is one of the things we are most proud of. Our [beginner debate classes](/debate-classes-for-beginners) are a natural fit alongside school club practice, and if you are serious about competing, our senior and advanced [classes](/classes) will accelerate you faster than school club alone."
      ),
      p(
        "If you want to talk through what makes sense for your situation, [book a free consultation](/book) and we can map out a plan that works with your school schedule."
      ),
      p(
        "The hardest part of starting a club is the first email to the teacher sponsor. Everything after that is just doing the work. If you are reading this article, you are already further ahead than most students who said they would start a debate club and never did. Send the email this week."
      ),
    ],
  },

  // ===================================================================
  // POST 5
  // ===================================================================
  {
    slug: "what-debate-class-looks-like",
    title: "What Does a Debate Class Actually Look Like?",
    excerpt:
      "A minute-by-minute walkthrough of a typical DSDC debate class — warm-up, lecture, case building, practice round, and feedback — plus answers to common first-class fears.",
    date: "2026-04-01",
    author: "DSDC Team",
    category: "Parents & Resources",
    readTime: "8 min read",
    sections: [
      p(
        "If your child is about to start debate classes, there is a good chance they are a little nervous — and so are you. Most parents have not been in a debate class themselves. The word \"debate\" conjures images of students in suits pointing fingers at each other on a stage. That is not what a real class looks like, at least not at DSDC. Let's walk through what actually happens from minute one to minute ninety."
      ),
      p(
        "Every DSDC class runs for two hours live on Zoom. The structure is deliberately the same from week to week because consistency makes students comfortable — they know what is coming and when, which dramatically lowers first-class anxiety. Here is the breakdown."
      ),
      sub("Warm-Up (5-10 Minutes)"),
      p(
        "Classes start with low-pressure speaking. Word games, quick-fire questions, short icebreakers — things designed to get students talking before they realise they are doing the scary part. No one is judged. No one has to give a speech. It is the equivalent of stretching before a workout, and it is the single most important part of the class for first-timers."
      ),
      p(
        "Typical warm-ups include \"two truths and a lie,\" one-word storytelling around the group, or quick-round opinion questions like \"what is the best snack in the world, and why.\" Silly on purpose. By the end, every student has heard their own voice in the class and the room feels like a room rather than a test."
      ),
      sub("Topic Introduction and Mini-Lecture (15-20 Minutes)"),
      p(
        "The coach introduces the topic of the day. This could be a specific debate skill (building a strong second-speaker rebuttal, for instance), a type of argument (cost-benefit analysis vs. principle-based arguments), or the motion that students will debate later in the class. The coach explains the concept, walks through examples, and answers questions."
      ),
      p(
        "This section is the most \"traditional classroom\" part of the class — but it is interactive. Coaches ask students to weigh in, offer their own examples, and raise questions. At the novice level it is heavily guided. At the advanced level it is more discussion than lecture."
      ),
      sub("Case-Building Exercise (15-20 Minutes)"),
      p(
        "Students split into pairs or work individually to prepare arguments on a specific motion. This is where they apply the concept from the lecture to a real debate. Coaches float between Zoom breakout rooms, answering questions, pushing back on weak arguments, and helping students structure their cases before the full round begins."
      ),
      p(
        "This is genuinely the most educational part of most classes. Learning by doing beats learning by watching, every single time. Kids who were uncertain about the concept at the start of the lecture leave the case-building block understanding it much better — because they just used it."
      ),
      sub("Practice Round (20-30 Minutes)"),
      p(
        "This is the main event: an actual debate round. Teams are assigned sides (often with students debating a position they do not personally agree with, which is the whole point). Speaker positions are assigned. A timekeeper runs the clock. The round unfolds just like it would at a tournament."
      ),
      p(
        "For novice classes, rounds are shorter — three-minute speeches, maybe no Points of Information, simpler motions. For senior competitive classes, rounds are full-length and use real tournament motions. Either way, this is where the skills get real. Students stand up (or unmute) and do the thing."
      ),
      sub("Feedback and Debrief (15-20 Minutes)"),
      p(
        "After the round, the coach gives feedback. Not group feedback. Individual feedback to each student, on specific things they did well and specific things to work on. \"Your opening was clear but you never weighed your argument against the opposition's — next week, try spending the last thirty seconds explaining why your point matters more than theirs.\" That is what useful feedback looks like."
      ),
      p(
        "The class also discusses what worked. Students learn from watching each other get feedback almost as much as from receiving their own. By the end of the debrief, every student has a concrete thing to work on before next week — and the coach has a note for the following session."
      ),
      sub("What a Novice Class Feels Like"),
      p(
        "If you are enrolling a first-time student, this is what to expect. The warm-up is longer. The lecture is more hand-holding. Case-building is in pairs, not solo. Practice rounds are short — often with a coach helping mid-round if a student gets stuck. Feedback is gentle and focused on effort, not technique. The energy of the room is friendly, sometimes silly, never high-pressure."
      ),
      p(
        "Most novice classes have a moment around session four or five where the vibe shifts. Students stop treating it like a class they have to attend and start treating it like something they look forward to. That is when the real learning accelerates."
      ),
      sub("What a Senior Competitive Class Feels Like"),
      p(
        "At the other end of the spectrum, a senior competitive class is much more demanding. Motions are complex. Students are expected to research and prep outside of class. Rounds run full length. Feedback is technical and specific — not \"you did well,\" but \"your second contention was weaker than your first, and you did not respond to the opposition's framework argument, which cost you the round in the judge's eyes.\""
      ),
      p(
        "The atmosphere is serious but collegial. Students know each other, push each other, and treat the practice rounds like real competition. This is where students prepare for nationals, BP university prep, and international tournaments."
      ),
      sub("\"What If I Don't Know Anything About the Topic?\""),
      p(
        "That is fine. Most students do not, most of the time. Debate is about thinking, not prior knowledge. Coaches introduce topics with enough context for students to engage, and many motions are deliberately about things students can reason about from scratch. Your child does not need to be a current affairs expert to do well."
      ),
      sub("\"What If I Freeze?\""),
      p(
        "Everyone freezes sometimes, especially early on. When it happens, coaches step in — sometimes literally, by offering a prompt; sometimes by pausing the round and letting the student reset. Nobody gets left stranded. Freezing is not failure at DSDC; it is the moment the coach steps in and teaches the student how to recover. That recovery skill is one of the most important things any debater learns."
      ),
      sub("\"Do I Need to Know Debate Jargon?\""),
      p(
        "No. Students pick up the vocabulary naturally over the first few weeks — motion, proposition, rebuttal, POI. Coaches use the terms and define them in context. Nobody is expected to walk in speaking debate fluently, and nobody is embarrassed for not knowing yet. If you want a head start, we have a full glossary of debate terminology elsewhere on the blog."
      ),
      sub("The Bottom Line"),
      p(
        "The first class is always the scariest. By the end of session two, most students have forgotten why they were nervous. By session four, most are asking if they can try harder material. The structure is designed to get students there — reliably — without making them feel like they are being thrown into something."
      ),
      p(
        "If you want to explore our [beginner debate classes](/debate-classes-for-beginners), [public speaking classes for kids](/public-speaking-classes-for-kids), or [online debate classes](/online-debate-classes), you can [compare all classes](/classes) or [book a free consultation](/book) and we will walk you through exactly which class fits your child's age and experience level."
      ),
    ],
  },

  // ===================================================================
  // POST 6
  // ===================================================================
  {
    slug: "debate-improves-writing-academics",
    title: "How Debate Improves Writing and Academic Performance",
    excerpt:
      "Debate is a speaking activity — but its biggest payoff is academic. How it improves essay structure, critical reading, research skills, and exam performance.",
    date: "2026-04-08",
    author: "DSDC Team",
    category: "Parents & Resources",
    readTime: "8 min read",
    sections: [
      p(
        "If you are considering debate classes for your child, you have probably thought about the speaking benefits — confidence, articulation, stage presence. Those are real, and they matter. But they are not the biggest reason to enroll. The biggest reason is something most parents do not realise until their child has been in classes for a term or two: debate makes kids better students, across almost every subject."
      ),
      p(
        "Parents of debate students routinely report the same thing. English grades go up. Essay marks jump noticeably. History papers suddenly have actual thesis statements. The student who used to struggle with exam essays is finishing them on time. This is not a coincidence — debate exercises the exact cognitive muscles that drive school performance, and it does it in a way no classroom can match."
      ),
      sub("Debate Is Essay Structure in Disguise"),
      p(
        "When a student builds a debate case, they are doing something identical in structure to writing an essay. The core unit of a debate argument is claim + reason + evidence + example. The core unit of an essay paragraph is thesis + topic sentence + supporting evidence + analysis. These are not similar. They are the same. One is spoken in real time; the other is written over a week. The underlying skill is the same."
      ),
      p(
        "Debate forces students to do this under pressure, dozens of times per class, for months on end. By the time a serious debater sits down to write an essay, the structure is not something they have to consciously remember — it is automatic. The thesis writes itself because they have made the same kind of claim out loud a hundred times. The body paragraphs practically pre-organise themselves. Conclusions land cleanly because students have spent months practicing how to \"weigh\" arguments at the end of debate rounds."
      ),
      p(
        "Ask any English teacher what most students get wrong in essays: structure, not content. Structure is the thing debate fixes."
      ),
      sub("Rebuttal Teaches Critical Reading"),
      p(
        "One of the least glamorous parts of debate is also the most academically valuable: rebuttal. Rebuttal is the part of a round where a student responds to the opposition's arguments — identifying weaknesses, pointing out logical fallacies, exposing unsupported claims. To do it well, students have to learn how to listen to an argument, analyse its structure in real time, and find its flaws."
      ),
      p(
        "This is, almost exactly, the skill required to do well in literary analysis, document-based history questions, and science paper critique. When a student can tell you that a character's motivation in a novel is supported by two pieces of evidence but contradicted by a third, they are running the same mental process they run when they spot a hole in an opposing debater's case. Schools call it critical reading. Debaters call it rebuttal. It is the same muscle."
      ),
      p(
        "Students who do debate for a year routinely see their reading comprehension scores jump — especially on the parts of reading tests that ask them to identify the author's argument, detect bias, or evaluate evidence. These are the high-value questions on every standardised test. They are also the questions that most students never explicitly learn to answer."
      ),
      sub("Research for Debates Builds Information Literacy"),
      p(
        "Preparing for a debate on any substantive motion — climate policy, criminal justice, AI regulation — means doing research. Real research. Finding credible sources, distinguishing news articles from opinion pieces, evaluating studies, weighing contradictory evidence. Students learn fast that a random blog post is not the same as a peer-reviewed paper, and that \"someone on Reddit said\" is not an argument that survives rebuttal."
      ),
      p(
        "This is information literacy, and it is one of the skills educators repeatedly identify as critical for modern students and consistently missing from most school curricula. Debate teaches it as a byproduct. By the time a student is preparing cases for World Schools or BP competitive rounds, they are doing academic-level research as a matter of routine. That translates directly into the research they will do for high school essays, science fair projects, and eventually university papers."
      ),
      sub("Impromptu Debate and Exam Performance"),
      p(
        "Here is the one that surprises parents most. Impromptu debate — the format where students get a motion, have fifteen or twenty minutes to prepare, and then speak on it — is essentially an oral exam. Students have to structure thoughts quickly, deploy knowledge under time pressure, and deliver a coherent argument in a high-stakes setting without being able to go back and edit."
      ),
      p(
        "The skill that lets students do this — fast thinking, structured thinking, staying calm under pressure — is the same skill that lets students perform well on timed essay exams. Every student who has done a year of impromptu debate has effectively trained for written timed essays without realising it. English provincial exams, AP essay questions, university admission tests — these all reward students who can think fast and structure clearly. Impromptu debate builds both at once."
      ),
      sub("The Feedback Loop Advantage"),
      p(
        "One of the reasons debate produces rapid improvement — faster than most classroom settings — is the feedback loop. In a debate class, students attempt a skill, try it live, and get specific feedback from a coach on what to adjust. Then they try it again the following week. That cycle — attempt, feedback, revision, re-attempt — is the fastest known way to learn any skill."
      ),
      p(
        "In school, feedback is slow and often generic. An essay comes back two weeks after it was written, with a mark and a few comments. By the time the student gets it, they have forgotten the assignment and do not carry the feedback into the next essay. In debate class, feedback happens the same day, in specific detail, and the next opportunity to apply it is a week away. This is why kids who do debate improve at written argument faster than kids who only practice written argument in school — the feedback loop is dramatically tighter."
      ),
      sub("What the Research Says"),
      p(
        "The academic literature backs this up. A widely cited study from the University of California, published in the Review of Educational Research, found that students who participated in competitive debate programs showed significant gains in English reading comprehension and grade point average compared to non-debate students, even after controlling for baseline academic performance. Similar studies from the UK and US have linked debate participation with stronger critical thinking and improved writing scores."
      ),
      p(
        "Debate is one of the few extracurriculars with this kind of consistent, measurable academic payoff. It is also one of the reasons debate is so valued on university applications. Admissions committees are looking for students who can think — and debate is one of the cleanest signals available that a student actually can. We have written separately about [how debate helps with university admissions](/blog/debate-university-admissions-canada) and [the best extracurriculars for university](/blog/best-extracurriculars-university-canada), both of which cover this in more depth."
      ),
      sub("The Parent's Version"),
      p(
        "If you do not care about competitive debate at all — if you just want your child to do better in school — debate is still one of the most efficient activities you can enroll them in. An hour of debate class does more for your child's writing, reading, and thinking than most tutoring sessions in those same subjects. Not because tutoring is bad. Because debate exercises all three at once, under pressure, with instant feedback."
      ),
      p(
        "You can also read more about [the benefits of public speaking](/blog/public-speaking-benefits) to see the related confidence and communication gains, which are the parts of debate that show up outside the classroom."
      ),
      p(
        "If you want to see how our [classes](/classes) are structured for this kind of outcome, or explore [debate classes for kids](/debate-classes-for-kids), [book a free consultation](/book) and we will walk you through which level fits your child. The academic benefits kick in within a term for most students. The long-term benefits compound year after year."
      ),
    ],
  },

  // ===================================================================
  // POST 7
  // ===================================================================
  {
    slug: "debate-terminology-beginners",
    title: "Debate Terminology Every Beginner Should Know",
    excerpt:
      "A clear glossary of the 25 most essential debate terms for new students and parents — motions, rebuttal, POIs, formats, and tournament vocabulary explained.",
    date: "2026-04-15",
    author: "DSDC Team",
    category: "Student Tips",
    readTime: "10 min read",
    sections: [
      p(
        "Walking into your first debate class is a lot. There is a whole vocabulary everyone seems to already know — motions, POIs, weighing, the tab, \"break rounds.\" Nobody explains it because they assume you will pick it up. You will, eventually. But a head start helps. Here are the 25 or so terms worth knowing on day one, grouped by when you will actually encounter them."
      ),
      p(
        "Read this once before your first class and skim it again after. The terms will stick faster when you have heard them used in context. By your third or fourth class, this list will feel obvious. Until then, bookmark it."
      ),
      sub("General Terms"),
      p(
        "**Motion (or Resolution).** The statement your debate is about. Something like \"this house would ban homework\" or \"this house believes that social media does more harm than good.\" \"The motion\" is the single most common word you will hear in any debate room. Every round starts with one."
      ),
      p(
        "**Proposition (or Government).** The team arguing in favour of the motion. If the motion is \"ban homework,\" the proposition wants homework banned. Depending on format, this side is also called \"Government,\" \"Affirmative,\" or \"Pro.\" It is always the side arguing yes."
      ),
      p(
        "**Opposition (or Negation).** The team arguing against the motion. They want the status quo kept or the motion rejected. Also called \"Negative\" or \"Con\" depending on format. Always the \"no\" side."
      ),
      p(
        "**Adjudicator (or Judge).** The person evaluating the round and deciding who won. Adjudicators also give feedback at the end, which is where most of your learning will come from in your first year. \"Judge\" is more common in casual speech; \"adjudicator\" is the technical term."
      ),
      p(
        "**Speaker Role.** Your position within your team. First speaker, second speaker, third speaker — each role has specific responsibilities that differ by format. In a two-on-two format, the first speaker opens the case and the second speaker develops and rebuts. In World Schools, there are three speakers with different responsibilities again. Knowing your role going into a round matters more than it sounds."
      ),
      sub("Argumentation Terms"),
      p(
        "**Substantive.** A positive argument in favour of your side — the \"why we are right\" part of your case. You will hear it used as \"let me give you our first substantive.\" Substantives are what you build your case around. Strong substantives win rounds."
      ),
      p(
        "**Rebuttal.** The part of your speech where you respond to the other team's arguments — pointing out flaws, weaknesses, or contradictions. Rebuttal is the difference between a student who is \"learning debate\" and a student who is actually debating. Without rebuttal, you are giving a speech. With rebuttal, you are having a debate."
      ),
      p(
        "**POI (Point of Information).** A short question or statement offered by the opposing team during your speech. In most formats, POIs can be offered during specific windows — usually not in the first or last minute of a speech. The speaker can accept or decline. Taking a POI well is a sign of confidence. Ignoring all of them can cost you style points."
      ),
      p(
        "**Case.** The full set of arguments your team has built for one side of a motion. Your case is usually structured as: framing (how the debate should be judged), substantives (your main arguments), and examples or evidence. \"What is your case?\" is shorthand for \"what are your main points?\""
      ),
      p(
        "**Contention.** Roughly synonymous with \"argument\" or \"point.\" A specific claim you are making, usually numbered. \"Our first contention is that...\" The term comes from policy debate but is used widely across formats."
      ),
      p(
        "**Assertion vs. Argument.** An assertion is a claim without reasoning (\"phones in schools are bad\"). An argument is a claim with reasoning (\"phones in schools are bad because they measurably reduce student focus, and studies show...\"). Debaters are expected to make arguments, not assertions. Coaches will harp on this constantly for the first few weeks. It is worth learning the difference quickly."
      ),
      p(
        "**Burden of Proof.** The obligation to actually prove your case, not just claim it. Typically, the proposition carries more burden of proof because they are arguing for change. Knowing who has the burden helps you decide what you actually need to prove in order to win."
      ),
      p(
        "**Weighing.** The act of explaining why your arguments matter more than the opposition's. Weighing comes at the end of a speech and often at the end of the round. Good weighing sounds like \"even if the opposition is right about X, our argument about Y is more important because...\" Weighing is one of the highest-leverage skills in debate and one of the last things students learn to do well."
      ),
      sub("Debate Formats"),
      p(
        "**CNDF (Canadian National Debate Format).** Two-on-two, used in Canadian national and regional tournaments. Mix of prepared and impromptu motions. Constructive speeches followed by rebuttal and a short summary. The default format for Canadian high school debate."
      ),
      p(
        "**British Parliamentary (BP).** Four teams of two debaters, competing against each other rather than in a head-to-head. Each team takes one of four positions: Opening Government, Opening Opposition, Closing Government, Closing Opposition. Used in university debate worldwide and in some high school competitive programs. Harder to learn, rewarding once you do."
      ),
      p(
        "**World Schools.** Three-on-three teams, with prepared and impromptu rounds. Popular internationally and in World Schools championships. Emphasises teamwork and global issues. Longer speeches than CNDF."
      ),
      p(
        "**Cross-Examination.** A format featuring direct questioning periods between opposing debaters — one side asks the other a series of questions on record, with the answers used against them later. Common in Canadian regional, provincial, and national tournaments, and in many US high school circuits."
      ),
      p(
        "You can read more about [debate formats in Canada](/blog/canadian-debate-formats) if you want a deeper breakdown of how each one works in practice."
      ),
      sub("Tournament Terms"),
      p(
        "**Round.** A single debate match between teams. Tournaments typically have four to six preliminary rounds, followed by elimination rounds for the top teams."
      ),
      p(
        "**Break.** To \"break\" at a tournament is to advance from the preliminary rounds into the elimination rounds (quarterfinals, semifinals, finals). \"Breaking\" is the first goal for most competitive teams. It is the line between \"we came\" and \"we did well.\""
      ),
      p(
        "**Tab.** The live ranking of teams at a tournament, based on speaker points and wins. \"Check the tab\" means \"see where we stand.\" The tab is also what pairs teams for upcoming rounds."
      ),
      p(
        "**Speaker Points.** Individual scores given to each debater by adjudicators, usually on a scale (often 60-100 or similar). Teams win or lose rounds; speaker points track individual performance across the tournament. Top individual speakers are recognised even if their team does not break."
      ),
      p(
        "**Power-Matching.** The system tournaments use to pair teams for later rounds — teams with similar records are matched against each other. Lose one round and you are paired against other one-loss teams in the next round. The effect is that by late rounds, everyone is facing opponents roughly at their level."
      ),
      p(
        "**Motion Release.** The moment a new motion is announced to debaters at a tournament. For prepared motions, you get it weeks in advance. For impromptu, you get it minutes before your round starts."
      ),
      p(
        "**Prep Time.** The time given to build your case after receiving an impromptu motion. Usually 15-30 minutes depending on format. Prep time is where tournaments are actually won — by the teams who use those minutes well."
      ),
      sub("The Short Version"),
      p(
        "Do not worry about memorising all of these. You will pick them up naturally in your first few weeks of classes. The important thing is recognising the words when you hear them so you are not lost on day one. Everything else comes with practice."
      ),
      p(
        "If you want to jump into a class that will use these terms in a low-pressure, beginner-friendly environment, our [beginner debate classes](/debate-classes-for-beginners) are designed exactly for students at this stage — no prior knowledge assumed. You can also read [our complete guide to debate in Canada](/guide-to-debate-in-canada) for a broader look at the landscape, or [compare all classes](/classes) on our website. When you are ready, [book a free consultation](/book) and we will help you figure out which level fits."
      ),
    ],
  },
];

// Filter out any posts whose slugs already exist (safe re-run).
const added = [];
const skipped = [];
for (const post of posts) {
  if (existingSlugs.has(post.slug)) {
    skipped.push(post.slug);
  } else {
    existing.push(post);
    existingSlugs.add(post.slug);
    added.push(post.slug);
  }
}

fs.writeFileSync(file, JSON.stringify(existing, null, 2) + "\n");

console.log("Added:");
added.forEach((s) => console.log("  +", s));
if (skipped.length) {
  console.log("Skipped (already exist):");
  skipped.forEach((s) => console.log("  =", s));
}
console.log(`Total posts in file: ${existing.length}`);
