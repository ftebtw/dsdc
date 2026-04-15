// Debate glossary entries. Each becomes its own /glossary/[slug] page with
// DefinedTerm schema, unique meta tags, and substantive body content so it
// ranks independently for "what is [term] in debate" queries.

export type GlossaryBodySection =
  | { type: "paragraph"; content: string }
  | { type: "heading"; content: string }
  | { type: "list"; items: string[] };

export type GlossaryEntry = {
  slug: string;
  term: string; // display name, e.g. "Points of Information"
  shortDefinition: string; // 1-2 sentence definition used in schema + previews
  metaTitle: string;
  metaDescription: string;
  category: GlossaryCategory;
  body: GlossaryBodySection[];
  relatedLinks: Array<{ href: string; label: string }>;
  relatedTermSlugs: string[];
};

export type GlossaryCategory =
  | "Speech Structure"
  | "Case Construction"
  | "Arguments & Logic"
  | "Strategy & Judging"
  | "Format Roles"
  | "Round Mechanics";

export const glossaryEntries: GlossaryEntry[] = [
  {
    slug: "constructive-speech",
    term: "Constructive Speech",
    shortDefinition:
      "A constructive speech is the main body of a debate speech where a speaker builds their case, introduces new arguments, and develops the core substance of the round.",
    metaTitle: "What Is a Constructive Speech in Debate? | DSDC Glossary",
    metaDescription:
      "A constructive speech is where a debater builds their case and introduces new arguments. Learn how constructive speeches work in CNDF, BP, and World Schools debate, with examples from real rounds.",
    category: "Speech Structure",
    body: [
      {
        type: "paragraph",
        content:
          "A constructive speech is the part of a debate round where a speaker actively builds their case - introducing arguments, defining terms, explaining why their side is right, and laying out the substance that the rest of the round will fight over. Constructive speeches are usually the longest speeches in a round and they happen before any rebuttal work starts.",
      },
      {
        type: "heading",
        content: "How Constructive Speeches Work",
      },
      {
        type: "paragraph",
        content:
          "In most formats, both teams give constructive speeches in a set order. The first Proposition speaker defines the motion and introduces the case. The first Opposition speaker responds and introduces counter-arguments. Later constructive speakers build on their team's earlier arguments, add new material, and start attacking the other side's case in detail.",
      },
      {
        type: "heading",
        content: "Typical Length",
      },
      {
        type: "paragraph",
        content:
          "Constructive speeches usually run 5-8 minutes depending on the format. CNDF and World Schools both use 8-minute constructive speeches at senior levels. Junior WSDC and novice formats often use shorter 5-6 minute speeches to keep the pace accessible for younger debaters.",
      },
      {
        type: "heading",
        content: "Why Constructives Matter",
      },
      {
        type: "paragraph",
        content:
          "Constructive speeches set the terms of the entire round. A weak constructive means the rest of your team is defending thin arguments for the next thirty minutes. A strong constructive means the other team is forced onto your preferred battleground. Good coaches spend more time drilling constructive structure than almost any other part of debate.",
      },
    ],
    relatedLinks: [
      { href: "/classes", label: "Learn debate at DSDC" },
      { href: "/blog/debate-terminology-beginners", label: "Debate terminology for beginners" },
    ],
    relatedTermSlugs: ["rebuttal", "summary-speech", "case", "roadmap"],
  },
  {
    slug: "rebuttal",
    term: "Rebuttal",
    shortDefinition:
      "A rebuttal is a direct response to the opposing team's arguments - explaining why their claims are wrong, weak, or less important than your own.",
    metaTitle: "What Is a Rebuttal in Debate? | DSDC Glossary",
    metaDescription:
      "A rebuttal is a direct response to the opposing team's arguments in a debate round. Learn how rebuttals work, how judges weigh them, and how to write one that wins.",
    category: "Speech Structure",
    body: [
      {
        type: "paragraph",
        content:
          "A rebuttal is a direct response to the other team's arguments. Rather than introducing new material, a rebuttal speaker focuses on attacking opposing claims - pointing out logical flaws, missing evidence, bad assumptions, or reasons why the other side's impact is smaller than their own.",
      },
      {
        type: "heading",
        content: "When Rebuttals Happen",
      },
      {
        type: "paragraph",
        content:
          "Some formats have dedicated rebuttal speeches at the end of the round (CNDF has a Prime Minister's Rebuttal and an Opposition Rebuttal, for example). Other formats, like World Schools, use the third speaker on each side to focus almost exclusively on rebuttal. British Parliamentary weaves rebuttal into every constructive speech after the first.",
      },
      {
        type: "heading",
        content: "What Good Rebuttal Looks Like",
      },
      {
        type: "paragraph",
        content:
          "Strong rebuttal is specific. Instead of saying 'their argument is wrong,' a good rebuttal says 'their argument assumes X, but X only holds under Y condition, and Y does not apply here because Z.' Judges consistently reward rebuttal that engages with the other team's best arguments, not just their weakest ones.",
      },
      {
        type: "heading",
        content: "Rebuttal vs Clash",
      },
      {
        type: "paragraph",
        content:
          "Rebuttal is one of the main ways clash happens in a debate. A round with lots of clash means both teams are actually responding to each other - not just reading scripts. Judges notice immediately when a speaker skips rebuttal in favor of restating their own case.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Practice rebuttal at DSDC" }],
    relatedTermSlugs: ["clash", "constructive-speech", "warrant", "drop"],
  },
  {
    slug: "summary-speech",
    term: "Summary Speech",
    shortDefinition:
      "A summary speech is a short end-of-round speech where a debater distills the main arguments and explains why their side has won the debate overall.",
    metaTitle: "What Is a Summary Speech in Debate? | DSDC Glossary",
    metaDescription:
      "A summary speech closes a debate round by highlighting the strongest arguments on each side and explaining why your team has won. Learn how to write one.",
    category: "Speech Structure",
    body: [
      {
        type: "paragraph",
        content:
          "A summary speech is a short, focused speech near the end of a debate round where a speaker distills the full round down to the most important points and explains why their side has won. Summary speeches are not the place for new arguments - they are the place to clarify, compare, and close.",
      },
      {
        type: "heading",
        content: "Common Structure",
      },
      {
        type: "paragraph",
        content:
          "Most summary speeches follow a three-part structure: first, explain the key clashes in the round; second, explain why your side won those clashes; third, weigh impacts to show why your side winning matters more than theirs. That last step is often called weighing and it is where good summary speakers separate themselves from average ones.",
      },
      {
        type: "heading",
        content: "Why Summary Matters to Judges",
      },
      {
        type: "paragraph",
        content:
          "Judges often decide close rounds based on the summary speech. If they have heard thirty minutes of back-and-forth argument and then one speaker cleanly explains what the round was really about, that is the speech they remember when filling out the ballot. Good summary speakers practice compression - saying more in less time.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Train with DSDC coaches" }],
    relatedTermSlugs: ["weighing-mechanism", "reply-speech", "voter", "clash"],
  },
  {
    slug: "reply-speech",
    term: "Reply Speech",
    shortDefinition:
      "A reply speech is a short closing speech in World Schools format, delivered by the first or second speaker, that summarizes the round and explains why their side won.",
    metaTitle: "What Is a Reply Speech in World Schools Debate? | DSDC Glossary",
    metaDescription:
      "Reply speeches are short closing speeches unique to World Schools debate. Learn what they do, who gives them, and how to write one that wins the round.",
    category: "Speech Structure",
    body: [
      {
        type: "paragraph",
        content:
          "A reply speech is a short closing speech used primarily in the World Schools debate format. Each side gets one four-minute reply speech at the end of the round, delivered by the first or second speaker (not the third). The Opposition delivers their reply first, and the Proposition delivers theirs last.",
      },
      {
        type: "heading",
        content: "What a Reply Speech Does",
      },
      {
        type: "paragraph",
        content:
          "The job of a reply speech is to bias the judge toward your side by framing the entire round. It is not the place to introduce new arguments - reply speakers review what happened, explain which arguments mattered most, and argue that their side won the most important clashes.",
      },
      {
        type: "heading",
        content: "Why the Proposition Speaks Last",
      },
      {
        type: "paragraph",
        content:
          "In World Schools, the Proposition's reply speech comes last so that they have the final word. This is balanced out by the fact that the Proposition also spoke first - they had to commit to a definition and a case before the Opposition had said anything. Speaking last in reply compensates for speaking first in substance.",
      },
    ],
    relatedLinks: [
      { href: "/blog/world-schools-debate-format", label: "World Schools format guide" },
      { href: "/classes", label: "Train for World Schools" },
    ],
    relatedTermSlugs: ["summary-speech", "whip-speech", "voter", "weighing-mechanism"],
  },
  {
    slug: "roadmap",
    term: "Roadmap (Signposting)",
    shortDefinition:
      "A roadmap is a brief statement at the start of a speech that tells the judge what the speaker will cover and in what order. It is also called signposting.",
    metaTitle: "What Is a Roadmap in Debate? Signposting Explained | DSDC Glossary",
    metaDescription:
      "A roadmap (or signposting) is a short statement that tells the judge what a debate speech will cover and in what order. Learn why roadmaps win rounds.",
    category: "Speech Structure",
    body: [
      {
        type: "paragraph",
        content:
          "A roadmap is a short statement at the start of a debate speech that tells the judge what the speaker will cover and in what order. Roadmaps are one of the simplest techniques in debate, and also one of the most underused by beginners. A good roadmap takes about ten seconds and makes the rest of a speech dramatically easier to follow.",
      },
      {
        type: "heading",
        content: "Why Roadmaps Work",
      },
      {
        type: "paragraph",
        content:
          "Judges take notes (called a flow) during every speech. A roadmap gives them the structure to organize those notes before you start talking. When the judge knows in advance that you will cover three arguments - economic, social, and political - they can pre-label three columns and cleanly track your content. Without a roadmap, judges often misplace arguments on their flow, which means fewer points for the speaker.",
      },
      {
        type: "heading",
        content: "Signposting Throughout the Speech",
      },
      {
        type: "paragraph",
        content:
          "Signposting is not just about the opening roadmap. Good debaters signpost throughout the speech - saying things like 'now to my second argument,' 'in rebuttal to their first point,' or 'moving to the impact of this argument.' Each signpost keeps the judge oriented and prevents them from missing key content.",
      },
      {
        type: "heading",
        content: "Example",
      },
      {
        type: "paragraph",
        content:
          "\"Today I will argue three things: first, that the current policy is failing; second, that our proposal addresses the root cause; and third, that the opposition's alternative would make the problem worse. Let me begin with the failure of the current policy...\" That is a clean, effective roadmap that takes about fifteen seconds.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Practice signposting at DSDC" }],
    relatedTermSlugs: ["constructive-speech", "flow", "case", "framework"],
  },
  {
    slug: "point-of-information",
    term: "Point of Information",
    shortDefinition:
      "A Point of Information (POI) is a short interjection offered by an opposing team during a debater's speech. The speaker can accept or decline each offer.",
    metaTitle: "What Is a Point of Information in Debate? | DSDC Glossary",
    metaDescription:
      "Points of Information (POIs) let the opposing team briefly interrupt a speech to challenge the speaker. Learn how POIs work and how to take them well.",
    category: "Round Mechanics",
    body: [
      {
        type: "paragraph",
        content:
          "A Point of Information, usually called a POI, is a short interjection from the opposing team during a debater's speech. The opposing debater stands, offers a POI, and the speaker chooses to either accept (and let the opposing debater speak for up to 15 seconds) or decline. POIs are used in British Parliamentary, World Schools, CNDF, and Junior WSDC, among other formats.",
      },
      {
        type: "heading",
        content: "When POIs Can Be Offered",
      },
      {
        type: "paragraph",
        content:
          "POIs can only be offered during the middle of a speech - usually not in the first minute or the last minute. This protected time at the start gives the speaker time to set up their argument, and the protected time at the end lets them close without interruption. The exact timing rules vary slightly by format.",
      },
      {
        type: "heading",
        content: "How to Take a POI Well",
      },
      {
        type: "paragraph",
        content:
          "Accepting POIs well is a sign of confidence and debate maturity. Judges reward speakers who take one or two POIs per speech, respond calmly, and return to their own argument without losing momentum. Declining every POI or looking rattled during one are both red flags that lower speaker points.",
      },
      {
        type: "heading",
        content: "How to Offer a POI",
      },
      {
        type: "paragraph",
        content:
          "A good POI is short, specific, and damaging. The best POIs ask a question that the speaker cannot answer without conceding something important. A weak POI is a long-winded speech disguised as a question, which judges see through immediately.",
      },
    ],
    relatedLinks: [
      { href: "/blog/british-parliamentary-debate-guide", label: "British Parliamentary format guide" },
      { href: "/classes", label: "Practice POIs at DSDC" },
    ],
    relatedTermSlugs: ["clash", "rebuttal", "speaker-points", "prep-time"],
  },
  {
    slug: "clash",
    term: "Clash",
    shortDefinition:
      "Clash is the direct engagement between two opposing arguments in a debate - where one side attacks a specific claim from the other side and the other side defends it.",
    metaTitle: "What Is Clash in Debate? | DSDC Glossary",
    metaDescription:
      "Clash is the direct engagement between two opposing arguments in a debate round. Judges reward clash heavily - learn why and how to create it.",
    category: "Arguments & Logic",
    body: [
      {
        type: "paragraph",
        content:
          "Clash refers to the direct engagement between opposing arguments in a debate. When one team attacks a specific claim and the other team defends it, that is clash. A round with strong clash feels like a real argument - two sides actually responding to each other rather than reading prepared scripts past each other.",
      },
      {
        type: "heading",
        content: "Why Judges Reward Clash",
      },
      {
        type: "paragraph",
        content:
          "Judges prefer clash because it helps them decide the round. When both sides engage on the same issue, the judge can see which argument is stronger. When both sides ignore each other and just repeat their own points, the judge is left having to pick a winner with no real comparison. Experienced judges will even lower speaker scores for teams that refuse to engage.",
      },
      {
        type: "heading",
        content: "How to Create Clash",
      },
      {
        type: "paragraph",
        content:
          "The simplest way to create clash is to rebut specific claims from the other side by name. Instead of saying 'the other side is wrong,' say 'their second argument claimed that X, but X fails because of Y.' That level of specificity forces the opposing team to defend the exact claim you attacked, which is clash.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Train with DSDC" }],
    relatedTermSlugs: ["rebuttal", "drop", "turn", "constructive-speech"],
  },
  {
    slug: "warrant",
    term: "Warrant",
    shortDefinition:
      "A warrant is the reason an argument is true - the explanation that connects evidence or assumptions to a conclusion. Arguments without warrants are just assertions.",
    metaTitle: "What Is a Warrant in Debate? | DSDC Glossary",
    metaDescription:
      "A warrant is the reason an argument is true - the explanation connecting evidence to conclusion. Learn why warrants separate real arguments from empty claims.",
    category: "Arguments & Logic",
    body: [
      {
        type: "paragraph",
        content:
          "A warrant is the reason an argument is true - the explanation that connects a claim to a conclusion. Every real argument in debate has three parts: a claim (what you are asserting), a warrant (why it is true), and an impact (why it matters). A claim without a warrant is just an assertion, and judges consistently dismiss unwarranted claims.",
      },
      {
        type: "heading",
        content: "Claim, Warrant, Impact",
      },
      {
        type: "paragraph",
        content:
          "The claim-warrant-impact structure is the single most useful framework new debaters learn. Claim: 'Raising the minimum wage will reduce poverty.' Warrant: 'Because workers earning below a living wage are the primary demographic in the poverty statistic, and wage increases shift them above the threshold.' Impact: 'Reducing poverty by X percent improves health outcomes, school performance, and economic mobility for the next generation.' Without the warrant, the argument is just a slogan.",
      },
      {
        type: "heading",
        content: "How Judges Use Warrants",
      },
      {
        type: "paragraph",
        content:
          "Judges weigh warranted arguments higher than unwarranted ones. If one team says 'their policy will fail' with no warrant, and the other team says 'our policy will succeed because of X mechanism Y evidence Z precedent,' the judge will almost always prefer the warranted side. Rebutting a warrant also means attacking the reasoning, not just the claim.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Train argumentation at DSDC" }],
    relatedTermSlugs: ["impact", "link", "case", "contention"],
  },
  {
    slug: "impact",
    term: "Impact",
    shortDefinition:
      "The impact of an argument is why it matters - what will happen in the real world if the argument is true, and how big that consequence is.",
    metaTitle: "What Is Impact in Debate? | DSDC Glossary",
    metaDescription:
      "The impact is why a debate argument matters - the real-world consequence if it is true. Learn how judges weigh impacts and how to write strong ones.",
    category: "Arguments & Logic",
    body: [
      {
        type: "paragraph",
        content:
          "In debate, the impact of an argument is why it matters - what will happen in the real world if the argument is true, and how big the consequence is. Impacts are what judges weigh against each other when deciding who won. An argument without an impact is technically correct but strategically useless.",
      },
      {
        type: "heading",
        content: "Two Dimensions of Impact",
      },
      {
        type: "paragraph",
        content:
          "Judges weigh impacts along two axes: magnitude and probability. Magnitude is how big the effect is - how many people are affected, how severe the harm is, how permanent the consequence is. Probability is how likely it is that the impact actually happens given the argument. A small impact with high probability can outweigh a huge impact with low probability.",
      },
      {
        type: "heading",
        content: "Terminal Impacts",
      },
      {
        type: "paragraph",
        content:
          "A terminal impact is the final consequence you are defending - the thing that matters in itself, not as a means to something else. Reducing poverty is a terminal impact. 'Improving one specific regulation' is not a terminal impact unless you connect it to a bigger harm or benefit. Good debaters always trace arguments out to their terminal impacts.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Learn impact weighing at DSDC" }],
    relatedTermSlugs: ["warrant", "weighing-mechanism", "link", "voter"],
  },
  {
    slug: "link",
    term: "Link (Argument Link)",
    shortDefinition:
      "An argument link is the logical chain that connects a premise to a consequence. A strong link explains exactly how one thing leads to another; a weak link is easy to attack.",
    metaTitle: "What Is a Link in Debate Arguments? | DSDC Glossary",
    metaDescription:
      "An argument link is the logical chain connecting a premise to its consequence. Learn how judges evaluate link strength and how to attack a weak link.",
    category: "Arguments & Logic",
    body: [
      {
        type: "paragraph",
        content:
          "In debate, a link is the logical chain that connects a premise to a consequence. When you argue that a policy will lead to an impact, the link is the step-by-step explanation of how the policy actually causes that outcome. Strong arguments have clearly explained links; weak arguments leave the link implicit and assume the judge will fill it in.",
      },
      {
        type: "heading",
        content: "Why Links Get Attacked",
      },
      {
        type: "paragraph",
        content:
          "Attacking a link is often the most efficient rebuttal strategy. You do not need to argue that the other team's impact is wrong - you just have to show that their policy does not actually lead to the impact they claim. If the link breaks, the impact does not apply, and their entire argument collapses.",
      },
      {
        type: "heading",
        content: "Link Chains",
      },
      {
        type: "paragraph",
        content:
          "A link chain is when multiple links connect a policy to a distant impact. For example: policy leads to outcome A, outcome A leads to outcome B, outcome B leads to the final impact. The longer the chain, the easier it is for the opposing team to attack one link and break the whole argument. Skilled debaters keep link chains short when possible.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Build stronger arguments at DSDC" }],
    relatedTermSlugs: ["warrant", "impact", "uniqueness", "turn"],
  },
  {
    slug: "uniqueness",
    term: "Uniqueness",
    shortDefinition:
      "Uniqueness is the argument that a specific outcome only happens because of a specific cause - used to defend a policy or attack a counterplan by showing that something is truly new.",
    metaTitle: "What Is Uniqueness in Debate Arguments? | DSDC Glossary",
    metaDescription:
      "Uniqueness is the claim that an outcome only happens because of a specific cause. Learn why uniqueness matters in policy debates and how to argue it.",
    category: "Arguments & Logic",
    body: [
      {
        type: "paragraph",
        content:
          "Uniqueness in debate refers to the claim that a specific outcome happens only because of a specific cause. It is a concept most commonly used in policy and Cross-Examination debate, where it is essential for proving that a disadvantage or advantage is truly caused by the proposed policy rather than something else.",
      },
      {
        type: "heading",
        content: "Why Uniqueness Matters",
      },
      {
        type: "paragraph",
        content:
          "If the outcome you are describing would happen anyway - with or without your opponent's policy - then their argument loses force. Uniqueness is the answer to 'so what? That was going to happen regardless.' Strong uniqueness arguments show that the link between the policy and the impact is specifically caused by that policy and nothing else.",
      },
      {
        type: "heading",
        content: "A Quick Example",
      },
      {
        type: "paragraph",
        content:
          "Imagine the Opposition argues: 'Your tax policy will hurt the economy.' The Proposition might respond: 'The economy is already slowing down regardless of our policy - that slowdown is not unique to us.' That uniqueness response weakens the Opposition's argument by removing the specific causal link.",
      },
    ],
    relatedLinks: [
      { href: "/blog/cross-examination-debate-guide", label: "Cross-Examination format guide" },
      { href: "/classes", label: "Train with DSDC coaches" },
    ],
    relatedTermSlugs: ["link", "disadvantage", "impact", "counterplan"],
  },
  {
    slug: "turn",
    term: "Turn (Argument Turn)",
    shortDefinition:
      "A turn is an argument that takes the opposing team's claim and uses it in your favor - showing that their logic actually supports your side instead of theirs.",
    metaTitle: "What Is a Turn in Debate? | DSDC Glossary",
    metaDescription:
      "An argument turn flips the other team's claim against them. Learn what turns are, when to use them, and why judges love them.",
    category: "Arguments & Logic",
    body: [
      {
        type: "paragraph",
        content:
          "A turn is a rebuttal move where a debater takes an argument from the opposing team and uses it to support their own side. Rather than attacking the argument directly, a turn accepts the claim and redirects it. When it works, a turn is one of the most damaging moves in debate because it simultaneously defeats the other side and strengthens your own.",
      },
      {
        type: "heading",
        content: "Link Turn vs Impact Turn",
      },
      {
        type: "paragraph",
        content:
          "A link turn argues that the opposing team's policy actually leads to the opposite outcome of what they claim. An impact turn argues that the outcome they claim is good is actually bad (or vice versa). Both types force the opposing team to defend their own argument from a new angle.",
      },
      {
        type: "heading",
        content: "Example of a Turn",
      },
      {
        type: "paragraph",
        content:
          "Opposition: 'Raising the minimum wage will reduce employment.' Proposition link turn: 'Actually, raising the minimum wage increases consumer spending power, which drives up demand for local goods and services, which creates more employment, not less.' The claim is accepted (minimum wage affects employment), but the direction is reversed.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Learn turns at DSDC" }],
    relatedTermSlugs: ["rebuttal", "link", "impact", "clash"],
  },
  {
    slug: "drop",
    term: "Drop",
    shortDefinition:
      "A dropped argument is one that was made earlier in the round but never answered by the opposing team. Judges usually treat dropped arguments as conceded.",
    metaTitle: "What Does Drop an Argument Mean in Debate? | DSDC Glossary",
    metaDescription:
      "A dropped argument in debate is one the opposing team failed to answer. Judges usually treat drops as conceded - learn why and how to use drops strategically.",
    category: "Arguments & Logic",
    body: [
      {
        type: "paragraph",
        content:
          "In debate, to drop an argument means to leave it unanswered. When one team makes a claim and the other team never responds to it, that claim is considered dropped. Most judging traditions treat dropped arguments as conceded, meaning the judge accepts them as true for the rest of the round.",
      },
      {
        type: "heading",
        content: "How Drops Win Rounds",
      },
      {
        type: "paragraph",
        content:
          "Drops are a common way debaters win close rounds. A team that tracks every argument on their flow can notice when the other side has forgotten to respond to a key point, then call that out in their summary speech. Judges often base their decision on which side clearly won on the dropped arguments rather than on the arguments where both sides clashed.",
      },
      {
        type: "heading",
        content: "How to Avoid Dropping Arguments",
      },
      {
        type: "paragraph",
        content:
          "Good debaters flow carefully (keeping detailed notes) so they can see exactly what still needs to be answered. A short checklist before each speech - 'what are the two arguments I must address?' - prevents most accidental drops. Accidental drops are one of the biggest preventable mistakes in beginner debate.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Practice flowing at DSDC" }],
    relatedTermSlugs: ["flow", "rebuttal", "clash", "warrant"],
  },
  {
    slug: "extension",
    term: "Extension",
    shortDefinition:
      "An extension is a new argument or new analysis introduced by a second constructive speaker to build on their team's case - common in British Parliamentary where closing teams must extend beyond the opening team.",
    metaTitle: "What Is an Extension in Debate? | DSDC Glossary",
    metaDescription:
      "An extension is a new argument a second-half debater adds to build on their team's case. Essential concept for British Parliamentary debate.",
    category: "Strategy & Judging",
    body: [
      {
        type: "paragraph",
        content:
          "An extension is a new argument or new analytical angle introduced by a debater later in the round to build on their team's earlier case. The term is most important in British Parliamentary debate, where the closing Government and closing Opposition teams must add an extension that differs meaningfully from what their opening team already said.",
      },
      {
        type: "heading",
        content: "Why Extensions Exist in BP",
      },
      {
        type: "paragraph",
        content:
          "In British Parliamentary, two teams on each side compete against each other as well as against the other side. The closing teams need a reason for the judge to rank them above their opening teammates, and the extension is that reason. A closing team that just restates the opening team's arguments will almost always lose because they have added nothing new to the round.",
      },
      {
        type: "heading",
        content: "What Makes a Good Extension",
      },
      {
        type: "paragraph",
        content:
          "Good extensions are meaningfully different from the opening team's material. That can mean a new argument, a new angle on an existing argument, a new impact, or a new analytical framework. The key test: can the judge clearly point to something the closing team added that the opening team did not already say?",
      },
    ],
    relatedLinks: [
      { href: "/blog/british-parliamentary-debate-guide", label: "British Parliamentary guide" },
      { href: "/classes", label: "Train for BP at DSDC" },
    ],
    relatedTermSlugs: ["whip-speech", "case", "contention", "clash"],
  },
  {
    slug: "whip-speech",
    term: "Whip Speech",
    shortDefinition:
      "A whip speech is the final speech from each team in British Parliamentary debate. Whips focus almost entirely on comparing and weighing the competing cases.",
    metaTitle: "What Is a Whip Speech in BP Debate? | DSDC Glossary",
    metaDescription:
      "A whip speech closes each side in British Parliamentary debate by comparing arguments and weighing impacts. Learn how whip speakers win rounds.",
    category: "Format Roles",
    body: [
      {
        type: "paragraph",
        content:
          "A whip speech is the final speech given by each team in British Parliamentary debate. The Government Whip and the Opposition Whip each get one chance to close out their side of the round. Whip speeches are unique because they almost never introduce new arguments - instead, they focus on comparing and weighing everything that has already been said.",
      },
      {
        type: "heading",
        content: "What Whip Speakers Do",
      },
      {
        type: "paragraph",
        content:
          "A strong whip speech identifies the main clashes in the round, explains how their team won each one, and weighs impacts to show why their team's victories matter more. Whip speakers also often defend their own side's extension from attacks by the opposing teams.",
      },
      {
        type: "heading",
        content: "Why Whip Speeches Matter",
      },
      {
        type: "paragraph",
        content:
          "In BP, whip speeches often decide the ranking of teams within a side. A strong whip can push a closing team to first place, while a weak whip can drop them to fourth. Because the whip speaks last, it is the speech judges remember most clearly when they start deliberating - making whip performance disproportionately important to the final result.",
      },
    ],
    relatedLinks: [
      { href: "/blog/british-parliamentary-debate-guide", label: "British Parliamentary format" },
      { href: "/classes", label: "Train with DSDC" },
    ],
    relatedTermSlugs: ["extension", "summary-speech", "weighing-mechanism", "reply-speech"],
  },
  {
    slug: "case",
    term: "Case",
    shortDefinition:
      "A case is the set of arguments a debate team builds to support their side of the motion. It includes claims, warrants, impacts, and the overall strategy for winning the round.",
    metaTitle: "What Is a Case in Debate? | DSDC Glossary",
    metaDescription:
      "A case is the complete set of arguments a debate team builds to support their side. Learn what makes a strong case and how DSDC students build one.",
    category: "Case Construction",
    body: [
      {
        type: "paragraph",
        content:
          "A case in debate is the complete set of arguments a team builds to support their side of a motion. It includes everything the team plans to argue - the core claims, the warrants behind them, the impacts that make them matter, and the overall strategy for winning the round. Building a strong case is the single most important step in preparing for a debate.",
      },
      {
        type: "heading",
        content: "Elements of a Good Case",
      },
      {
        type: "list",
        items: [
          "A clear definition of the motion and any contested terms",
          "2-4 main arguments, each with claim-warrant-impact structure",
          "Anticipated responses to the strongest opposing arguments",
          "A clear framework for weighing impacts against the opposing side",
          "A memorable opening and closing that tells the judge why this case matters",
        ],
      },
      {
        type: "heading",
        content: "Case Construction at DSDC",
      },
      {
        type: "paragraph",
        content:
          "Case construction is one of the biggest focus areas in our [online debate classes](/online-debate-classes). Students learn to research topics, organize arguments, weigh impacts, and build cases that are hard to attack. Many of our students who start in novice classes come in assuming case construction is about writing speeches - they leave understanding it is about building an argument that holds up when the other team pushes back.",
      },
    ],
    relatedLinks: [
      { href: "/online-debate-classes", label: "Online debate classes" },
      { href: "/blog/how-to-write-debate-case", label: "How to write a debate case" },
    ],
    relatedTermSlugs: ["contention", "framework", "warrant", "impact"],
  },
  {
    slug: "contention",
    term: "Contention",
    shortDefinition:
      "A contention is a main argument within a team's case. Most debate cases are built on 2-4 distinct contentions, each with its own claim, warrant, and impact.",
    metaTitle: "What Is a Contention in Debate? | DSDC Glossary",
    metaDescription:
      "A contention is a main argument within a debate case. Learn how contentions are structured and how many you should have in a typical round.",
    category: "Case Construction",
    body: [
      {
        type: "paragraph",
        content:
          "A contention is a main argument within a debate case. Where a full case is the entire set of arguments a team presents, a contention is one of the individual building blocks. Most debate cases are built around 2-4 distinct contentions, each with its own internal claim, warrant, and impact.",
      },
      {
        type: "heading",
        content: "How Many Contentions Should a Case Have?",
      },
      {
        type: "paragraph",
        content:
          "Most strong debate cases have between two and four main contentions. Fewer than two feels thin; more than four spreads speaking time too thin for each contention to receive proper warranting. Three is often considered the sweet spot - enough to cover the motion from multiple angles while leaving time to develop each one properly.",
      },
      {
        type: "heading",
        content: "Independent Contentions",
      },
      {
        type: "paragraph",
        content:
          "Good contentions are independent - the judge should be able to accept one even if they reject the others. That way, if the opposing team successfully rebuts your first contention, your case does not collapse. This is sometimes called making your case robust to attack.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Build cases at DSDC" }],
    relatedTermSlugs: ["case", "warrant", "impact", "framework"],
  },
  {
    slug: "framework",
    term: "Framework",
    shortDefinition:
      "A framework is the standard a debate team asks the judge to use when evaluating the round. Frameworks tell the judge which arguments should count and how to weigh them.",
    metaTitle: "What Is a Framework in Debate? | DSDC Glossary",
    metaDescription:
      "A framework in debate is the standard the judge should use to evaluate the round. Learn how frameworks influence how judges decide who wins.",
    category: "Case Construction",
    body: [
      {
        type: "paragraph",
        content:
          "In debate, a framework is the standard a team asks the judge to use when evaluating the round. A framework tells the judge which arguments should count, which should not, and how to weigh competing claims. Whoever establishes the framework often controls how the judge sees the rest of the debate.",
      },
      {
        type: "heading",
        content: "Examples of Frameworks",
      },
      {
        type: "paragraph",
        content:
          "A team defending a public health policy might argue: 'Judge, you should evaluate this round based on which policy saves the most lives.' A team opposing it might counter: 'No - you should evaluate based on which policy most protects individual liberty.' Those are two different frameworks, and whichever the judge accepts tends to decide the round.",
      },
      {
        type: "heading",
        content: "Why Frameworks Matter",
      },
      {
        type: "paragraph",
        content:
          "Frameworks matter because they prioritize certain types of impacts over others. A team that wins the framework but loses most specific arguments can still win the round because their framework made the arguments they did win matter more. Experienced debaters spend real time fighting over frameworks, not just over individual claims.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Train with DSDC coaches" }],
    relatedTermSlugs: ["weighing-mechanism", "case", "contention", "voter"],
  },
  {
    slug: "burden-of-proof",
    term: "Burden of Proof",
    shortDefinition:
      "The burden of proof is the responsibility to prove something in a debate. In most formats, the side proposing change has the burden of showing their case is better than the status quo.",
    metaTitle: "What Is Burden of Proof in Debate? | DSDC Glossary",
    metaDescription:
      "The burden of proof is the responsibility to prove your side in a debate. Learn how burden of proof works in CNDF, BP, World Schools, and CX.",
    category: "Case Construction",
    body: [
      {
        type: "paragraph",
        content:
          "The burden of proof in debate is the responsibility to prove something - to establish a claim with enough evidence and reasoning that a reasonable judge would accept it. In most formats, the side proposing change carries the primary burden of proof because they are asking the judge to move away from the status quo.",
      },
      {
        type: "heading",
        content: "Who Has the Burden",
      },
      {
        type: "paragraph",
        content:
          "In a policy motion, the Proposition has the burden to show that their proposed policy is better than what currently exists. The Opposition can often win simply by showing that the Proposition did not meet that burden - they do not necessarily need to prove the status quo is perfect. This asymmetry is important because it means the Proposition usually needs to do more work to win.",
      },
      {
        type: "heading",
        content: "Burden in Value Debates",
      },
      {
        type: "paragraph",
        content:
          "In value debates (where the motion is not a policy but a comparison of ideas), the burden is usually more balanced. Both sides share the responsibility to prove their claim is more true or more important than the opposing view. In those rounds, framework becomes especially important because it tells the judge how to decide who met the burden better.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Practice at DSDC" }],
    relatedTermSlugs: ["framework", "case", "status-quo", "resolution"],
  },
  {
    slug: "counter-model",
    term: "Counter-Model (Counterplan)",
    shortDefinition:
      "A counter-model or counterplan is an alternative policy proposed by the Opposition instead of accepting or rejecting the Proposition's plan outright.",
    metaTitle: "What Is a Counter-Model in Debate? | DSDC Glossary",
    metaDescription:
      "A counter-model (or counterplan) is an alternative policy the Opposition proposes instead of rejecting the Proposition outright. Learn when and how to use one.",
    category: "Strategy & Judging",
    body: [
      {
        type: "paragraph",
        content:
          "A counter-model, also called a counterplan in some formats, is an alternative policy the Opposition proposes instead of simply rejecting the Proposition's plan. Rather than arguing 'do not do X,' the Opposition says 'instead of X, we should do Y, because Y solves the same problem better.'",
      },
      {
        type: "heading",
        content: "Why Use a Counter-Model",
      },
      {
        type: "paragraph",
        content:
          "A counter-model shifts the burden of the round. Instead of defending the status quo - which the Proposition has just criticized - the Opposition offers a different forward-looking alternative. This lets them concede that the status quo is flawed (sometimes unavoidable) while still opposing the specific Proposition plan.",
      },
      {
        type: "heading",
        content: "When Counter-Models Work",
      },
      {
        type: "paragraph",
        content:
          "Counter-models work best when the Opposition has a genuinely better alternative that solves the same underlying problem. They work poorly when the alternative is unrelated to the motion or when it fails to address the harm the Proposition identified. Judges usually evaluate counter-models by comparing them directly against the Proposition plan rather than against the status quo.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Learn counter-models at DSDC" }],
    relatedTermSlugs: ["status-quo", "disadvantage", "permutation", "framework"],
  },
  {
    slug: "motion",
    term: "Motion",
    shortDefinition:
      "A motion is the topic or resolution that a debate round is fought over. Motions usually start with 'This House' in parliamentary formats.",
    metaTitle: "What Is a Motion in Debate? | DSDC Glossary",
    metaDescription:
      "A motion is the topic debaters argue over in a round. Learn how motions are worded in CNDF, World Schools, and BP debate formats.",
    category: "Round Mechanics",
    body: [
      {
        type: "paragraph",
        content:
          "A motion is the topic a debate round is fought over. In parliamentary-style formats, motions usually begin with 'This House' - for example, 'This House would raise the minimum wage.' The Proposition supports the motion and the Opposition argues against it. Motions are sometimes also called resolutions, especially in American formats.",
      },
      {
        type: "heading",
        content: "Types of Motions",
      },
      {
        type: "paragraph",
        content:
          "Debate motions come in several common types: policy motions propose a specific action; value motions ask whether something is good or bad; fact motions ask whether a claim is true; and analysis motions ask about the reasons behind a phenomenon. Each type requires a slightly different approach to case construction.",
      },
      {
        type: "heading",
        content: "Prepared vs Impromptu Motions",
      },
      {
        type: "paragraph",
        content:
          "Some tournaments release motions in advance (prepared motions) so teams can research in depth. Others release motions just minutes before the round starts (impromptu motions), testing how quickly students can analyze and build a case. World Schools and CNDF both use a mix. British Parliamentary usually uses impromptu motions with 15 minutes of prep.",
      },
    ],
    relatedLinks: [
      { href: "/blog/cndf-debate-format-explained", label: "CNDF format guide" },
      { href: "/blog/british-parliamentary-debate-guide", label: "British Parliamentary format guide" },
    ],
    relatedTermSlugs: ["resolution", "prep-time", "case", "framework"],
  },
  {
    slug: "resolution",
    term: "Resolution",
    shortDefinition:
      "A resolution is another word for the topic of a debate round, especially in American formats like Policy debate and Lincoln-Douglas debate.",
    metaTitle: "What Is a Resolution in Debate? | DSDC Glossary",
    metaDescription:
      "A resolution is another word for the topic of a debate round, used mostly in American formats. Learn the difference between resolutions and motions.",
    category: "Round Mechanics",
    body: [
      {
        type: "paragraph",
        content:
          "A resolution is another word for the topic of a debate round. It is most often used in American debate formats like Policy (Cross-Examination), Lincoln-Douglas, and Public Forum. Canadian and British formats usually call the same thing a motion. Functionally, there is no difference - a resolution is what the round is about.",
      },
      {
        type: "heading",
        content: "How Resolutions Are Written",
      },
      {
        type: "paragraph",
        content:
          "Resolutions in American formats often begin with 'Resolved:' followed by the topic statement. For example: 'Resolved: The United States federal government should substantially increase investment in renewable energy.' The affirmative team argues in favor of the resolution, and the negative team argues against it.",
      },
      {
        type: "heading",
        content: "Season-Long Resolutions",
      },
      {
        type: "paragraph",
        content:
          "Unlike parliamentary formats that use different motions each round, American formats often use the same resolution for an entire season or competitive period. That allows for deep research and evidence preparation, which is why Policy debate is so evidence-heavy and why cases are so long and detailed.",
      },
    ],
    relatedLinks: [
      { href: "/blog/cross-examination-debate-guide", label: "Cross-Examination format guide" },
      { href: "/classes", label: "Train for CX at DSDC" },
    ],
    relatedTermSlugs: ["motion", "case", "status-quo", "affirmative-negative"],
  },
  {
    slug: "weighing-mechanism",
    term: "Weighing Mechanism",
    shortDefinition:
      "A weighing mechanism is the method a debate team uses to compare competing impacts and show the judge why their side's impacts matter more.",
    metaTitle: "What Is a Weighing Mechanism in Debate? | DSDC Glossary",
    metaDescription:
      "A weighing mechanism is how debaters compare competing impacts to show the judge who wins. Learn the three main weighing metrics and how to use them.",
    category: "Strategy & Judging",
    body: [
      {
        type: "paragraph",
        content:
          "A weighing mechanism is the method a debate team uses to compare competing impacts and show the judge why their side's impacts matter more. Weighing is one of the most important skills in debate because most rounds come down to a judge choosing between two legitimate sets of arguments - and weighing tells them which set to prefer.",
      },
      {
        type: "heading",
        content: "The Three Main Weighing Metrics",
      },
      {
        type: "list",
        items: [
          "Magnitude - how big the impact is (how many people, how severe, how permanent)",
          "Probability - how likely the impact is to actually happen",
          "Timeframe - how soon the impact will occur",
        ],
      },
      {
        type: "paragraph",
        content:
          "A good weighing speech usually touches on all three. For example: 'Our impact affects more people (magnitude), is more likely to happen because of our specific link chain (probability), and happens sooner than their slow-moving long-term harm (timeframe). That is why our side wins.'",
      },
      {
        type: "heading",
        content: "Why Weighing Separates Good Debaters From Great Ones",
      },
      {
        type: "paragraph",
        content:
          "Most debaters can make arguments. Far fewer can compare their arguments to their opponents' in a way that tells the judge exactly how to decide. Weighing is the skill that separates strong speakers from round-winners. At DSDC, weighing is a core focus from junior levels upward because it is the single biggest lever a debater can pull to improve their win rate.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Practice weighing at DSDC" }],
    relatedTermSlugs: ["impact", "voter", "framework", "summary-speech"],
  },
  {
    slug: "voter",
    term: "Voter (Voting Issue)",
    shortDefinition:
      "A voter, or voting issue, is a specific argument a debater tells the judge to use as the deciding factor when casting their ballot.",
    metaTitle: "What Is a Voter in Debate? | DSDC Glossary",
    metaDescription:
      "A voter is a specific argument debaters tell the judge to use as the deciding factor in a round. Learn how voting issues work in CX and policy debate.",
    category: "Strategy & Judging",
    body: [
      {
        type: "paragraph",
        content:
          "A voter, also called a voting issue, is a specific argument a debater presents to the judge as the deciding factor for the round. Instead of hoping the judge picks the right thing to focus on, the debater tells them: 'Evaluate the round based on this specific issue, and on this issue, we win.'",
      },
      {
        type: "heading",
        content: "Voters in Different Formats",
      },
      {
        type: "paragraph",
        content:
          "Voters are most common in Cross-Examination debate, where closing speeches often explicitly list 'reasons to vote Affirmative' or 'reasons to vote Negative.' In parliamentary formats, the same function is served by the weighing section of a summary or whip speech, even if the term 'voter' is not used directly.",
      },
      {
        type: "heading",
        content: "How to Write a Strong Voter",
      },
      {
        type: "paragraph",
        content:
          "A strong voter does three things: identifies a specific issue both teams debated, explains why that issue is the most important thing in the round, and explains why your side won it. Generic voters like 'we had better arguments' do not help the judge decide - specific voters like 'the economy argument is the most important voter because it affected the most people, and we won the economy argument because the opposing team dropped our unique link' give the judge a clear path to your side.",
      },
    ],
    relatedLinks: [
      { href: "/blog/cross-examination-debate-guide", label: "Cross-Examination guide" },
      { href: "/classes", label: "Train with DSDC" },
    ],
    relatedTermSlugs: ["weighing-mechanism", "summary-speech", "framework", "impact"],
  },
  {
    slug: "cross-apply",
    term: "Cross-Apply",
    shortDefinition:
      "To cross-apply an argument is to use an argument made in response to one issue as a response to a different issue in the same round.",
    metaTitle: "What Does Cross-Apply Mean in Debate? | DSDC Glossary",
    metaDescription:
      "To cross-apply in debate is to use one argument to respond to a different issue in the same round. Learn when and how to cross-apply effectively.",
    category: "Strategy & Judging",
    body: [
      {
        type: "paragraph",
        content:
          "To cross-apply an argument in debate is to take an argument made earlier in response to one issue and use it as a response to a different issue in the same round. Cross-application is efficient - it lets a debater respond to more of their opponent's arguments in less time without having to make new points from scratch.",
      },
      {
        type: "heading",
        content: "Example",
      },
      {
        type: "paragraph",
        content:
          "If the Opposition argues that the Proposition's economic impact is uncertain, and the Proposition earlier established strong economic evidence for a different contention, the Proposition can cross-apply that evidence to respond to the uncertainty claim. 'Cross-apply our evidence from contention one here - that same evidence shows the impact is certain, not uncertain.'",
      },
      {
        type: "heading",
        content: "Why Judges Like Cross-Application",
      },
      {
        type: "paragraph",
        content:
          "Judges appreciate cross-application because it shows the debater is thinking about the round as a connected whole rather than as separate arguments. It also saves time, which allows speakers to cover more ground within their speech. A skilled debater might cross-apply three or four arguments in a single speech.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Train debate strategy at DSDC" }],
    relatedTermSlugs: ["rebuttal", "warrant", "drop", "clash"],
  },
  {
    slug: "permutation",
    term: "Permutation (Perm)",
    shortDefinition:
      "A permutation is an argument that combines the Proposition's plan with the Opposition's counterplan to show they are not mutually exclusive.",
    metaTitle: "What Is a Permutation in Debate? | DSDC Glossary",
    metaDescription:
      "A permutation (or perm) argues the Proposition plan and Opposition counterplan can both happen at once. Key concept in Cross-Examination debate.",
    category: "Strategy & Judging",
    body: [
      {
        type: "paragraph",
        content:
          "A permutation, usually shortened to perm, is an argument that combines the Proposition's plan with the Opposition's counterplan to show that the two are not mutually exclusive. The Proposition uses a permutation to argue: 'We could do both our plan and their counterplan - there is no reason to choose one over the other, so vote for our plan because it adds value.'",
      },
      {
        type: "heading",
        content: "Where Perms Are Used",
      },
      {
        type: "paragraph",
        content:
          "Permutations are most common in Cross-Examination (Policy) debate, where counterplans are a standard Opposition strategy. Parliamentary formats do not always use the term 'permutation,' but the same strategic move exists: 'Judge, both policies can happen together, so rejecting ours is pointless.'",
      },
      {
        type: "heading",
        content: "How the Opposition Responds",
      },
      {
        type: "paragraph",
        content:
          "The Opposition responds to a permutation by explaining why the two plans cannot coexist - usually by showing they compete for resources, contradict each other's assumptions, or produce incompatible outcomes. If the Opposition wins this 'competition' debate, the permutation fails and the round returns to a straight comparison of the two plans.",
      },
    ],
    relatedLinks: [
      { href: "/blog/cross-examination-debate-guide", label: "Cross-Examination guide" },
      { href: "/classes", label: "Train at DSDC" },
    ],
    relatedTermSlugs: ["counter-model", "disadvantage", "uniqueness", "link"],
  },
  {
    slug: "disadvantage",
    term: "Disadvantage (DA)",
    shortDefinition:
      "A disadvantage is an Opposition argument that claims the Proposition's plan will cause a specific bad outcome. Disadvantages have a link, internal link, and impact.",
    metaTitle: "What Is a Disadvantage in Debate? | DSDC Glossary",
    metaDescription:
      "A disadvantage (DA) is an Opposition argument that the Proposition's plan will cause a bad outcome. Learn the standard DA structure and how to defend against one.",
    category: "Strategy & Judging",
    body: [
      {
        type: "paragraph",
        content:
          "A disadvantage, often shortened to DA, is an Opposition argument that claims the Proposition's plan will cause a specific bad outcome. Disadvantages are most common in Cross-Examination debate, where the Negative team frequently reads one or more DAs as part of their core strategy.",
      },
      {
        type: "heading",
        content: "The Standard DA Structure",
      },
      {
        type: "list",
        items: [
          "Uniqueness - the bad outcome is not currently happening",
          "Link - the Proposition's plan causes the bad outcome",
          "Internal Link - the causal chain between the plan and the impact",
          "Impact - the terminal consequence of the bad outcome (why it matters)",
        ],
      },
      {
        type: "paragraph",
        content:
          "A DA that is missing any of these pieces is usually easy to attack. For example, if the Proposition shows that the 'bad outcome' is already happening without their plan, they have defeated the uniqueness and the DA is dead.",
      },
      {
        type: "heading",
        content: "How to Respond to a Disadvantage",
      },
      {
        type: "paragraph",
        content:
          "The Proposition can respond to a DA in several ways: attack the uniqueness (show the outcome already happens), attack the link (show the plan does not cause the outcome), attack the internal link (break the causal chain), attack the impact (show the outcome is not as bad as claimed), or turn the DA (show the plan actually prevents the outcome).",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Train with DSDC" }],
    relatedTermSlugs: ["uniqueness", "link", "impact", "turn"],
  },
  {
    slug: "kritik",
    term: "Kritik",
    shortDefinition:
      "A kritik is a philosophical or structural challenge to the assumptions behind an opponent's argument or the entire debate framework. Common in Cross-Examination debate.",
    metaTitle: "What Is a Kritik in Debate? | DSDC Glossary",
    metaDescription:
      "A kritik challenges the assumptions behind an opponent's argument or the debate framework itself. Learn how kritiks work in Cross-Examination debate.",
    category: "Strategy & Judging",
    body: [
      {
        type: "paragraph",
        content:
          "A kritik, sometimes spelled critique, is a debate argument that challenges the philosophical or structural assumptions behind an opponent's position - or behind the debate itself. Instead of attacking the specific claims being made, a kritik argues that the way the opponent is framing the issue is fundamentally flawed.",
      },
      {
        type: "heading",
        content: "Where Kritiks Are Used",
      },
      {
        type: "paragraph",
        content:
          "Kritiks are most common in Cross-Examination (Policy) debate in the United States. They are rare or absent in most parliamentary formats. CX kritiks often draw on philosophers like Foucault, Derrida, or Heidegger to argue that the opposing team's framing perpetuates a deeper harm - militarism, colonialism, capitalism, or similar critical-theory concepts.",
      },
      {
        type: "heading",
        content: "Controversy and Use",
      },
      {
        type: "paragraph",
        content:
          "Kritiks are polarizing in the debate community. Some judges love them and see them as a way to engage with deeper ideas. Others reject them as technical tricks that avoid the actual topic. DSDC generally does not teach kritiks at the high school level because most Canadian tournament judges do not evaluate them well and they are rare outside American CX.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Learn formats at DSDC" }],
    relatedTermSlugs: ["framework", "disadvantage", "counter-model", "burden-of-proof"],
  },
  {
    slug: "status-quo",
    term: "Status Quo",
    shortDefinition:
      "The status quo is the current state of affairs - the way things are before any proposed change. Opposition teams in policy debates usually defend the status quo.",
    metaTitle: "What Does Status Quo Mean in Debate? | DSDC Glossary",
    metaDescription:
      "The status quo is the current state of affairs before any proposed change. Learn how status quo works in policy debate and when it is strong defense.",
    category: "Strategy & Judging",
    body: [
      {
        type: "paragraph",
        content:
          "The status quo in debate refers to the current state of affairs - the way things are right now, before any proposed change. In a policy debate, the Proposition argues that the status quo is broken and needs to change, while the Opposition often defends the status quo or proposes a counter-model that is still different from the Proposition's plan.",
      },
      {
        type: "heading",
        content: "Defending the Status Quo",
      },
      {
        type: "paragraph",
        content:
          "Defending the status quo is a valid Opposition strategy, but it is not always easy. If the Proposition has identified a real problem, simply saying 'leave things alone' will not work - the Opposition has to explain why the status quo is better than the proposed change despite the problem. That usually means arguing the problem is less serious than the Proposition claims, or that the proposed solution creates new problems worse than the original.",
      },
      {
        type: "heading",
        content: "When to Move Away From the Status Quo",
      },
      {
        type: "paragraph",
        content:
          "If the status quo is too hard to defend, the Opposition can propose a counter-model or counterplan that moves away from the current state of affairs in a different direction than the Proposition. This lets them concede the problem exists while still opposing the specific Proposition plan.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Train at DSDC" }],
    relatedTermSlugs: ["counter-model", "burden-of-proof", "uniqueness", "resolution"],
  },
  {
    slug: "prop-opp",
    term: "Prop / Opp (Proposition / Opposition)",
    shortDefinition:
      "Prop and Opp are the two sides in parliamentary debate formats. Proposition supports the motion; Opposition argues against it.",
    metaTitle: "What Are Prop and Opp in Debate? | DSDC Glossary",
    metaDescription:
      "Prop (Proposition) and Opp (Opposition) are the two sides in parliamentary debate. Learn which side does what and how speakers are organized.",
    category: "Format Roles",
    body: [
      {
        type: "paragraph",
        content:
          "Prop and Opp are the two sides in parliamentary-style debate formats. Prop stands for Proposition and Opp stands for Opposition. The Proposition supports the motion being debated, and the Opposition argues against it. In CNDF, British Parliamentary, and World Schools, every round has a Prop side and an Opp side.",
      },
      {
        type: "heading",
        content: "Other Names for the Same Roles",
      },
      {
        type: "paragraph",
        content:
          "Different formats use slightly different names for the same two sides. CNDF calls them Government and Opposition. British Parliamentary uses Government and Opposition too, but splits each side into opening and closing teams. American formats use Affirmative and Negative. Functionally, the 'supporting' side and the 'opposing' side exist in every format.",
      },
      {
        type: "heading",
        content: "Which Side Speaks First",
      },
      {
        type: "paragraph",
        content:
          "In every parliamentary format, the Proposition speaks first. The Prime Minister (or First Proposition speaker) opens the round by defining the motion and introducing the case. This gives the Prop the first word, but also the burden of setting up the entire debate.",
      },
    ],
    relatedLinks: [
      { href: "/blog/cndf-debate-format-explained", label: "CNDF format guide" },
      { href: "/blog/british-parliamentary-debate-guide", label: "BP format guide" },
    ],
    relatedTermSlugs: ["prime-minister", "leader-of-opposition", "affirmative-negative", "motion"],
  },
  {
    slug: "prime-minister",
    term: "Prime Minister (PM)",
    shortDefinition:
      "In parliamentary debate, the Prime Minister is the first Proposition speaker - the debater who opens the round, defines the motion, and introduces the Proposition case.",
    metaTitle: "Who Is the Prime Minister in Debate? | DSDC Glossary",
    metaDescription:
      "The Prime Minister opens a parliamentary debate by defining the motion and introducing the Proposition case. Learn what the PM's job is in CNDF, BP, and World Schools.",
    category: "Format Roles",
    body: [
      {
        type: "paragraph",
        content:
          "In parliamentary debate, the Prime Minister is the first Proposition speaker - the debater who opens the round. The PM has three main jobs: define the motion, introduce the Proposition case, and set up the terms of the debate. Everything that happens in the rest of the round builds on what the PM says first.",
      },
      {
        type: "heading",
        content: "The PM's Responsibilities",
      },
      {
        type: "list",
        items: [
          "Define any contested terms in the motion",
          "Set the framework for how the judge should evaluate the round",
          "Introduce 2-4 main contentions with claim-warrant-impact structure",
          "Give the Opposition something concrete to respond to",
        ],
      },
      {
        type: "heading",
        content: "Why the PM Speech Is Hard",
      },
      {
        type: "paragraph",
        content:
          "The PM speaks first, which means they have no opposing arguments to respond to yet. Every decision - what to define, what to contend, how to frame the round - has to be made in prep time. A weak PM speech makes the rest of the round much harder for the Proposition team. A strong PM speech makes it much harder for the Opposition to recover.",
      },
    ],
    relatedLinks: [
      { href: "/blog/cndf-debate-format-explained", label: "CNDF format guide" },
      { href: "/classes", label: "Train PM speeches at DSDC" },
    ],
    relatedTermSlugs: ["prop-opp", "leader-of-opposition", "motion", "case"],
  },
  {
    slug: "leader-of-opposition",
    term: "Leader of the Opposition (LO)",
    shortDefinition:
      "The Leader of the Opposition is the first Opposition speaker in parliamentary debate. The LO responds to the Prime Minister's case and introduces the Opposition's own arguments.",
    metaTitle: "Who Is the Leader of the Opposition in Debate? | DSDC Glossary",
    metaDescription:
      "The Leader of the Opposition is the first Opposition speaker in parliamentary debate. Learn what the LO does and why it is a pivotal role.",
    category: "Format Roles",
    body: [
      {
        type: "paragraph",
        content:
          "In parliamentary debate, the Leader of the Opposition, often called the LO, is the first Opposition speaker. The LO has two main jobs: respond to the Prime Minister's case (rebuttal) and introduce the Opposition's own arguments (constructive). This makes the LO speech one of the most demanding in the round because it is half rebuttal and half constructive.",
      },
      {
        type: "heading",
        content: "What the LO Needs to Do",
      },
      {
        type: "list",
        items: [
          "Accept or challenge the PM's definition of the motion",
          "Rebut the PM's main contentions with specific counter-arguments",
          "Introduce the Opposition's own core arguments",
          "Set up a clear opposition narrative for later speakers to build on",
        ],
      },
      {
        type: "heading",
        content: "Why LO Is a Pivotal Role",
      },
      {
        type: "paragraph",
        content:
          "The LO has to respond to the PM without having had time to prepare rebuttal in advance. A skilled LO spots the PM's weakest contention, attacks it hard, and pivots to introduce their own case before the time runs out. A weak LO just reads a prepared case without engaging with what the PM actually said - a common beginner mistake that judges penalize heavily.",
      },
    ],
    relatedLinks: [
      { href: "/blog/cndf-debate-format-explained", label: "CNDF format guide" },
      { href: "/classes", label: "Train LO speeches at DSDC" },
    ],
    relatedTermSlugs: ["prime-minister", "prop-opp", "rebuttal", "constructive-speech"],
  },
  {
    slug: "affirmative-negative",
    term: "Affirmative / Negative",
    shortDefinition:
      "Affirmative and Negative are the two sides in American debate formats like Policy, Lincoln-Douglas, and Public Forum. Affirmative supports the resolution; Negative argues against it.",
    metaTitle: "What Are Affirmative and Negative in Debate? | DSDC Glossary",
    metaDescription:
      "Affirmative and Negative are the two sides in American debate formats. Learn how Aff and Neg roles work in Policy, Lincoln-Douglas, and Public Forum debate.",
    category: "Format Roles",
    body: [
      {
        type: "paragraph",
        content:
          "Affirmative and Negative are the two sides in American debate formats like Policy (Cross-Examination), Lincoln-Douglas, and Public Forum. The Affirmative team, often called Aff, argues in favor of the resolution. The Negative team, often called Neg, argues against it. The terms are used the same way Proposition and Opposition are in parliamentary formats.",
      },
      {
        type: "heading",
        content: "Burden of Proof on the Aff",
      },
      {
        type: "paragraph",
        content:
          "In American policy formats, the Affirmative has the burden of proof - they must prove that the resolution should be adopted. The Negative does not need to prove the current policy is perfect; they just need to show that the Affirmative did not meet the burden of proof. This asymmetry shapes the entire strategy of both sides.",
      },
      {
        type: "heading",
        content: "Aff and Neg Strategies",
      },
      {
        type: "paragraph",
        content:
          "Affirmative cases usually include a plan (a specific policy proposal), advantages (benefits of the plan), and defenses against common objections. Negative strategies typically involve disadvantages, counterplans, kritiks, or procedural arguments like topicality (claiming the Aff plan does not actually meet the resolution).",
      },
    ],
    relatedLinks: [
      { href: "/blog/cross-examination-debate-guide", label: "Cross-Examination format guide" },
      { href: "/classes", label: "Train with DSDC" },
    ],
    relatedTermSlugs: ["prop-opp", "resolution", "burden-of-proof", "disadvantage"],
  },
  {
    slug: "prep-time",
    term: "Prep Time",
    shortDefinition:
      "Prep time is the time given to debaters to prepare their case after receiving a motion or between speeches. Prep time length varies by format.",
    metaTitle: "What Is Prep Time in Debate? | DSDC Glossary",
    metaDescription:
      "Prep time is the time given to debaters to prepare cases and speeches. Learn how much prep time each format gives and how to use it effectively.",
    category: "Round Mechanics",
    body: [
      {
        type: "paragraph",
        content:
          "Prep time in debate is the time given to debaters to prepare their case after receiving a motion or to organize their thoughts between speeches. The amount of prep time varies by format - British Parliamentary gives 15 minutes, some World Schools motions are released hours or days in advance, and Cross-Examination uses a shared prep-time pool that speakers can draw from during the round.",
      },
      {
        type: "heading",
        content: "Why Prep Time Matters",
      },
      {
        type: "paragraph",
        content:
          "Prep time is where rounds are often won or lost. Teams that use prep time well come into the round with a clear case, anticipated rebuttals, and a plan for what to do if the other side attacks a specific argument. Teams that waste prep time end up improvising the entire round and usually get outclassed.",
      },
      {
        type: "heading",
        content: "How to Use Prep Time Well",
      },
      {
        type: "list",
        items: [
          "Spend the first minute understanding the motion and defining key terms",
          "Spend the next few minutes brainstorming arguments on both sides",
          "Build 2-4 main contentions with clear claim-warrant-impact structure",
          "Anticipate the strongest opposing arguments and plan responses",
          "Write a short roadmap for the opening speech before time runs out",
        ],
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Learn prep technique at DSDC" }],
    relatedTermSlugs: ["case", "motion", "constructive-speech", "roadmap"],
  },
  {
    slug: "flow",
    term: "Flow (Flowing)",
    shortDefinition:
      "Flowing is the practice of taking detailed notes during a debate round, tracking every argument on both sides. A flow is the resulting set of notes.",
    metaTitle: "What Is Flowing in Debate? | DSDC Glossary",
    metaDescription:
      "Flowing is the practice of taking detailed notes during a debate round. Learn why flowing is essential and how to develop strong flowing habits.",
    category: "Round Mechanics",
    body: [
      {
        type: "paragraph",
        content:
          "Flowing is the practice of taking detailed notes during a debate round to track every argument on both sides. A flow is the set of notes that results. Experienced debaters keep a flow during every round because it helps them remember what was said, spot dropped arguments, and respond precisely in later speeches.",
      },
      {
        type: "heading",
        content: "How a Flow Is Structured",
      },
      {
        type: "paragraph",
        content:
          "Most flows are organized in columns - one column per speech, with arguments flowing across the columns as they are introduced, attacked, and answered. Each argument gets a short label, and arrows or notes track how it evolved across the round. The goal is to be able to look at your flow after the round and reconstruct the entire debate.",
      },
      {
        type: "heading",
        content: "Why Flowing Is Essential",
      },
      {
        type: "paragraph",
        content:
          "Judges flow every round. If you want to win on a dropped argument, you need a flow to prove the argument was dropped. If you want to cross-apply an earlier response to a later issue, you need a flow to remember the earlier response. Good flowing is one of the fastest ways to improve as a debater because it makes everything else easier.",
      },
      {
        type: "heading",
        content: "Digital vs Paper",
      },
      {
        type: "paragraph",
        content:
          "Some debaters flow on paper, others use laptops. Both work. The important thing is that the flow is clear enough for the debater to read quickly during a speech without losing focus on what is being said. Flowing is a skill that improves with practice - most students take 3-6 months of consistent practice before their flows become truly useful.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Practice flowing at DSDC" }],
    relatedTermSlugs: ["drop", "cross-apply", "rebuttal", "ballot"],
  },
  {
    slug: "speaker-points",
    term: "Speaker Points",
    shortDefinition:
      "Speaker points are individual scores judges give to each debater at the end of a round. They evaluate style, content, and strategy, and are used to rank speakers in a tournament.",
    metaTitle: "What Are Speaker Points in Debate? | DSDC Glossary",
    metaDescription:
      "Speaker points are individual scores judges give to each debater after a round. Learn how speaker points work and why they matter at tournaments.",
    category: "Round Mechanics",
    body: [
      {
        type: "paragraph",
        content:
          "Speaker points are individual scores that judges assign to each debater at the end of a round. They usually fall on a scale (for example, 70-80 or 20-30 depending on the format) and they measure how well each debater spoke - combining style, content, and strategy into a single number. Speaker points are separate from the win-loss result of the round.",
      },
      {
        type: "heading",
        content: "Why Speaker Points Matter",
      },
      {
        type: "paragraph",
        content:
          "Speaker points determine individual speaker rankings at tournaments, which matter for awards like Top Speaker. They also break ties when multiple teams have the same win-loss record. A debater who wins every round but speaks poorly can finish behind a debater who lost a round but spoke exceptionally well in the others.",
      },
      {
        type: "heading",
        content: "What Judges Score",
      },
      {
        type: "list",
        items: [
          "Clarity and pacing of delivery",
          "Quality of argumentation and reasoning",
          "Strength of rebuttal and engagement with the other side",
          "Strategic choices - attacking the right arguments, weighing well, prioritizing wisely",
          "Handling of Points of Information and cross-examination",
        ],
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Improve speaker scores at DSDC" }],
    relatedTermSlugs: ["ballot", "point-of-information", "voter", "weighing-mechanism"],
  },
  {
    slug: "ballot",
    term: "Ballot",
    shortDefinition:
      "A ballot is the judge's written decision at the end of a debate round, recording who won, individual speaker points, and usually a short explanation of the result.",
    metaTitle: "What Is a Ballot in Debate? | DSDC Glossary",
    metaDescription:
      "A ballot is the judge's written decision after a debate round. Learn what judges write on a ballot and how to use ballot feedback to improve.",
    category: "Round Mechanics",
    body: [
      {
        type: "paragraph",
        content:
          "A ballot in debate is the judge's written decision at the end of a round. It records which team won, individual speaker points for each debater, and usually a short Reason For Decision (RFD) explaining why the judge chose one side over the other. Ballots are one of the most important feedback tools debaters have.",
      },
      {
        type: "heading",
        content: "What a Good Ballot Includes",
      },
      {
        type: "list",
        items: [
          "Win/loss result for each team",
          "Speaker points for each debater",
          "Reason For Decision - which arguments were most important and why",
          "Specific feedback on strengths and weaknesses",
          "Suggestions for improvement",
        ],
      },
      {
        type: "heading",
        content: "How to Learn From Ballots",
      },
      {
        type: "paragraph",
        content:
          "Good debaters collect their ballots after every round and review them. Patterns across multiple ballots are especially useful - if three different judges say your rebuttal is weak, that is a clear signal to work on rebuttal. If one judge says your speaking pace is too fast and another says it is fine, you can probably ignore the one-off feedback and focus on the consistent notes.",
      },
    ],
    relatedLinks: [{ href: "/classes", label: "Get structured feedback at DSDC" }],
    relatedTermSlugs: ["speaker-points", "flow", "voter", "clash"],
  },
  {
    slug: "impromptu-vs-prepared",
    term: "Impromptu vs Prepared",
    shortDefinition:
      "Impromptu motions are released minutes before a round starts; prepared motions are released in advance so teams can research. Most tournaments use a mix.",
    metaTitle: "Impromptu vs Prepared Debate Motions | DSDC Glossary",
    metaDescription:
      "Learn the difference between impromptu and prepared debate motions and how each affects case construction, research, and round strategy.",
    category: "Round Mechanics",
    body: [
      {
        type: "paragraph",
        content:
          "Debate motions come in two types based on when they are released. Impromptu motions are released just before a round starts - usually 15 to 60 minutes beforehand - forcing teams to build a case entirely from scratch during prep time. Prepared motions are released hours, days, or even weeks in advance, giving teams time to research and refine.",
      },
      {
        type: "heading",
        content: "What Impromptu Rewards",
      },
      {
        type: "paragraph",
        content:
          "Impromptu motions reward quick thinking, general knowledge, and strong case-construction habits. Debaters who are good at impromptu can walk into any topic and still produce a structured, warranted case in a short time. Parliamentary formats like British Parliamentary and CNDF rely heavily on impromptu motions.",
      },
      {
        type: "heading",
        content: "What Prepared Rewards",
      },
      {
        type: "paragraph",
        content:
          "Prepared motions reward deep research, evidence quality, and polished case writing. Teams can build cases with detailed statistics, expert quotes, and nuanced frameworks that would be impossible to produce in 15 minutes. Cross-Examination (Policy) debate uses prepared motions for an entire season, which is why CX cases are so research-heavy.",
      },
      {
        type: "heading",
        content: "Hybrid Formats",
      },
      {
        type: "paragraph",
        content:
          "World Schools uses both - some motions are released well in advance so teams can prepare, and others are impromptu with limited prep time. Debaters who train in hybrid formats develop both skill sets, which makes them more versatile overall.",
      },
    ],
    relatedLinks: [
      { href: "/blog/british-parliamentary-debate-guide", label: "British Parliamentary format guide" },
      { href: "/blog/world-schools-debate-format", label: "World Schools format guide" },
    ],
    relatedTermSlugs: ["motion", "prep-time", "case", "resolution"],
  },
  {
    slug: "opening-government",
    term: "Opening Government",
    shortDefinition:
      "Opening Government is the first Proposition team in British Parliamentary debate. They open the round by defining the motion and setting up the Proposition case.",
    metaTitle: "What Is Opening Government in BP Debate? | DSDC Glossary",
    metaDescription:
      "Opening Government is the first Proposition team in British Parliamentary debate. Learn the OG's role and why it shapes the entire round.",
    category: "Format Roles",
    body: [
      {
        type: "paragraph",
        content:
          "Opening Government, usually abbreviated OG, is the first Proposition team in a British Parliamentary debate round. OG has two speakers: the Prime Minister and the Deputy Prime Minister. Their job is to open the round by defining the motion, setting up the Proposition case, and establishing the territory on which the debate will be fought.",
      },
      {
        type: "heading",
        content: "OG Responsibilities",
      },
      {
        type: "paragraph",
        content:
          "OG sets the tone for the entire round. Their definition of the motion, the arguments they introduce, and the framework they establish all shape what the other three teams (Opening Opposition, Closing Government, Closing Opposition) can do. A strong OG gives their side a clear advantage; a weak OG hands the closing teams an opening to dominate.",
      },
      {
        type: "heading",
        content: "Competing With Closing Government",
      },
      {
        type: "paragraph",
        content:
          "In BP, Opening Government and Closing Government are on the same side but also competing with each other for rank in the round. OG wants to set up a case that is so comprehensive Closing Government struggles to add anything meaningful. Closing Government wants OG to leave enough room for a strong extension. That internal tension is one of the things that makes BP unique.",
      },
    ],
    relatedLinks: [
      { href: "/blog/british-parliamentary-debate-guide", label: "British Parliamentary format" },
      { href: "/classes", label: "Train BP at DSDC" },
    ],
    relatedTermSlugs: ["prime-minister", "closing-government", "extension", "prop-opp"],
  },
  {
    slug: "closing-government",
    term: "Closing Government",
    shortDefinition:
      "Closing Government is the second Proposition team in British Parliamentary debate. They must extend beyond Opening Government's case to rank above them.",
    metaTitle: "What Is Closing Government in BP Debate? | DSDC Glossary",
    metaDescription:
      "Closing Government is the second Proposition team in British Parliamentary debate. Learn how CG extends the case and why the extension matters.",
    category: "Format Roles",
    body: [
      {
        type: "paragraph",
        content:
          "Closing Government, usually abbreviated CG, is the second Proposition team in a British Parliamentary debate round. CG has two speakers: the Member of Government and the Government Whip. Because they speak later than Opening Government, their job is to extend the Proposition case with new material - an argument, an angle, or an analysis that the opening team did not already cover.",
      },
      {
        type: "heading",
        content: "Why the Extension Is Critical",
      },
      {
        type: "paragraph",
        content:
          "Closing Government is technically on the same side as Opening Government, but they compete with OG for rank in the round. A Closing Government that just repeats what OG already said will usually rank below them because they added nothing. A Closing Government that introduces a meaningful extension can rank above OG, even as a second-half team.",
      },
      {
        type: "heading",
        content: "What Makes a Good CG Extension",
      },
      {
        type: "paragraph",
        content:
          "A strong extension is genuinely new - either a new argument, a new analytical angle on an existing argument, a new impact, or a new framework. It must also be relevant: extensions that drift away from the motion usually hurt rather than help. The best CG speakers listen carefully during the first three speeches, spot the gap in the Proposition case, and fill it decisively.",
      },
    ],
    relatedLinks: [
      { href: "/blog/british-parliamentary-debate-guide", label: "British Parliamentary format" },
      { href: "/classes", label: "Train BP at DSDC" },
    ],
    relatedTermSlugs: ["opening-government", "extension", "whip-speech", "prop-opp"],
  },
];

export function getGlossaryEntry(slug: string): GlossaryEntry | undefined {
  return glossaryEntries.find((entry) => entry.slug === slug);
}

export function getAllGlossarySlugs(): string[] {
  return glossaryEntries.map((entry) => entry.slug);
}

export function getGlossaryCategories(): GlossaryCategory[] {
  const seen = new Set<GlossaryCategory>();
  for (const entry of glossaryEntries) {
    seen.add(entry.category);
  }
  return Array.from(seen);
}
