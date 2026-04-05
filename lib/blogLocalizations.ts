import type {
  ArticleAuthorProfile,
  BlogFaqItem,
  BlogPost,
  BlogSection,
} from "@/lib/blogPosts";
import { translatedChineseBlogSlugs } from "@/lib/blogChineseSlugs";

type BlogPostLocalization = {
  title: string;
  excerpt: string;
  category?: string;
  readTime?: string;
  sections: BlogSection[];
  faqItems?: BlogFaqItem[];
};

const categoryTranslations: Record<string, string> = {
  "Parents & Resources": "家长指南",
  "Parents & Pricing": "家长与价格",
  "Competitive Debate": "竞赛辩论",
  "World Scholar's Cup": "世界学者杯",
  "Student Tips": "学生技巧",
  "Public Speaking": "公共演讲",
};

const translatedFounderProfile: Partial<ArticleAuthorProfile> = {
  title: "首席教练兼创始人",
  credential: "加拿大全国赛总决赛选手；美国全国赛八强",
  description: "Rebecca 于 2017 年创办 DSDC，已指导超过 1,000 名学生学习辩论与公共演讲。",
};

const translatedChineseBlogSlugSet = new Set<string>(translatedChineseBlogSlugs);

const zhPostOverrides: Record<string, BlogPostLocalization> = {
  "guide-to-debate-in-canada": {
    title: "加拿大中学生辩论完整指南",
    excerpt:
      "给家长的一份清晰入门指南：了解加拿大中学辩论体系、常见赛制、各省组织、比赛路径，以及孩子如何开始学习辩论。",
    category: "竞赛辩论",
    readTime: "12 分钟阅读",
    sections: [
      {
        type: "paragraph",
        content:
          "如果您的孩子对竞赛辩论感兴趣，或者您正在尝试弄清楚加拿大的中学辩论体系到底是怎么运作的，这篇文章就是为您准备的。很多家长第一次接触辩论时，都会被各种协会、赛制、选拔赛和术语弄得很困惑。",
      },
      {
        type: "paragraph",
        content:
          "我们把最重要的信息整理成一篇家长看得懂、学生也能直接参考的中文指南。无论您在温哥华、多伦多、卡尔加里还是其他城市，这份介绍都能帮助您判断孩子应该从哪里开始，以及什么样的课程或俱乐部更适合。",
      },
      {
        type: "subheading",
        content: "加拿大的中学辩论由谁负责？",
      },
      {
        type: "paragraph",
        content:
          "加拿大全国层面的中学辩论主要由 **Canadian Student Debating Federation（CSDF）** 统筹。CSDF 连接全国各省和地区的辩论协会，并组织加拿大高中生最重要的全国性赛事，包括 CNDF 全国赛、British Parliamentary 全国赛，以及法语辩论项目。",
      },
      {
        type: "paragraph",
        content:
          "在全国组织之下，各省通常都有自己的辩论协会，负责地区赛、省赛、学校社团支持和本地培训。也就是说，孩子真正的入门路径通常不是先直接碰到全国赛，而是先从学校、地区俱乐部或本省的训练体系开始，再逐步参加更高水平的比赛。",
      },
      {
        type: "subheading",
        content: "家长最应该认识的省级辩论组织",
      },
      {
        type: "list",
        content: "如果您在为孩子寻找比赛入口，可以先看所在省份的组织：",
        items: [
          "**BC 省：** DSABC（Debate and Speech Association of British Columbia）。BC 的辩论活动最活跃的区域集中在大温、本拿比、列治文、素里以及维多利亚一带。",
          "**安省：** OSDU（Ontario Student Debating Union）。多伦多、密西沙加、Brampton、Markham、Oakville 和 Waterloo 一带的赛事机会相对丰富。",
          "**阿尔伯塔省：** ADSA（Alberta Debate and Speech Association）。卡尔加里和埃德蒙顿的辩论基础较强，学生常从学校社团进入比赛体系。",
          "**魁省：** 英语和法语辩论各有不同路径，蒙特利尔周边会看到较活跃的学校与大学辩论生态。",
          "**海洋三省与其他地区：** 社群规模可能较小，但仍然有地区赛和省级组织，只是赛事数量通常少于 BC 和 Ontario。",
        ],
      },
      {
        type: "subheading",
        content: "加拿大中学生最常见的辩论赛制",
      },
      {
        type: "paragraph",
        content:
          "**CNDF（Canadian National Debate Format）** 是加拿大中学里最经典也最常见的赛制之一。它强调清晰的论点结构、反驳和总结能力，特别适合建立扎实的基础。",
      },
      {
        type: "paragraph",
        content:
          "**British Parliamentary（BP）** 是高中高段和大学常见的国际赛制。四支队伍同时比赛，学生必须在更复杂的比较框架里临场思考，因此特别能训练高阶分析、战略判断和即兴反应。",
      },
      {
        type: "paragraph",
        content:
          "**Cross-Examination（交叉质询）** 更强调盘问、即时回应和拆解对方论证。喜欢高互动、节奏快、逻辑攻防强烈的学生，往往会很喜欢这个赛制。",
      },
      {
        type: "paragraph",
        content:
          "**World Schools** 则融合了英式和北美辩论传统，强调三人团队配合、议题理解和国际视野。对希望参加国际赛事或 World Schools / World Scholar's Cup 相关训练的学生来说，这种赛制很有帮助。",
      },
      {
        type: "subheading",
        content: "一场比赛通常是怎么进行的？",
      },
      {
        type: "paragraph",
        content:
          "不同赛制的细节不同，但大多数比赛都会包含题目理解、立论、反驳、总结和评分。学生通常需要在有限时间内整理思路，和队友快速分工，然后在裁判面前完成一轮完整论证。",
      },
      {
        type: "paragraph",
        content:
          "很多比赛还会区分 prepared motions（提前准备题）和 impromptu motions（现场题）。这意味着孩子不仅要学会研究和写 case，也要学会在短时间内组织语言、抓重点和临场判断。",
      },
      {
        type: "subheading",
        content: "加拿大学生通常如何从入门走到全国赛？",
      },
      {
        type: "paragraph",
        content:
          "最常见的路径是：学校社团或课外课程入门，参加地区赛，表现稳定后进入省级比赛，再从省赛中争取全国赛资格。不同省份会有不同细则，但整体逻辑都类似：先建立基础，再累积比赛经验，最后冲刺更高级别的赛事。",
      },
      {
        type: "paragraph",
        content:
          "这也是为什么我们通常不建议家长一开始就只盯着“能不能拿奖”。对于大多数孩子来说，更重要的是先找到一个适合年龄和程度的训练环境，先把表达、结构、研究和自信建立起来。",
      },
      {
        type: "subheading",
        content: "孩子应该怎样开始学习辩论？",
      },
      {
        type: "list",
        content: "",
        items: [
          "先确认孩子是完全新手，还是已经参加过学校社团、Model UN 或演讲比赛。",
          "再看孩子的目标是提升表达自信、准备学校活动，还是认真走竞赛路线。",
          "优先选择有清晰分级、稳定反馈和小班练习机会的课程，而不是只看宣传词。",
          "如果本地没有合适项目，在线辩论课往往是更现实也更高质量的选择。",
        ],
      },
      {
        type: "subheading",
        content: "家长在选课时最该看什么？",
      },
      {
        type: "paragraph",
        content:
          "第一，看教练是否真的懂加拿大中学辩论和国际赛制。第二，看班级人数和学生实际开口机会。第三，看反馈是否具体到结构、逻辑、语言和比赛表现。第四，看课程是否有合理的节奏，而不是一上来就把新手丢进高压比赛里。",
      },
      {
        type: "paragraph",
        content:
          "对很多 Vancouver、Toronto 和其他加拿大城市的家庭来说，在线课程还有一个现实优势：不用通勤，孩子能接触到更强的教练，也更容易持续训练。只要课程是直播、小班、互动型的，线上完全可以做得非常有效。",
      },
      {
        type: "subheading",
        content: "DSDC 能如何帮助您的孩子？",
      },
      {
        type: "paragraph",
        content:
          "DSDC 为 4 至 12 年级学生提供分层次的在线辩论与公共演讲课程。我们既帮助完全新手建立自信和基本结构，也帮助有比赛目标的学生学习 CNDF、BP、World Schools、交叉质询、选拔赛准备和赛后复盘。",
      },
      {
        type: "paragraph",
        content:
          "如果您想先判断孩子适合哪一类课程，可以先看 [在线辩论课程](/online-debate-classes)、[完整课程页](/classes) 和 [教练团队](/team)。这样在预约咨询时，您会更容易拿到清晰、具体的建议。",
      },
      {
        type: "paragraph",
        content: "[预约免费咨询](/book)",
      },
      {
        type: "subheading",
        content: "实用链接",
      },
      {
        type: "list",
        content: "以下资源值得家长收藏：",
        items: [
          "[Canadian Student Debating Federation](https://www.csdf-fcde.ca/)",
          "[BC Debate and Speech Association](https://www.bcdebate.ca/aboutus/join)",
          "[World Schools Debating Championships](https://wsdcdebating.org/)",
          "[浏览 DSDC 辩论课程](/classes)",
          "[查看在线辩论课如何运作](/online-debate-classes)",
          "[了解温哥华辩论课程](/debate-classes-vancouver)",
          "[了解多伦多辩论课程](/debate-classes-toronto)",
          "[开始报名](/register)",
        ],
      },
    ],
  },
  "best-debate-programs-vancouver": {
    title: "温哥华儿童辩论课程怎么选？2026 家长指南",
    excerpt:
      "如果您在比较温哥华的儿童辩论课程，这篇文章会从教练资历、班级人数、反馈质量、赛制匹配度和线上学习体验几个角度，帮您快速判断什么项目更值得报名。",
    category: "家长指南",
    readTime: "8 分钟阅读",
    sections: [
      {
        type: "paragraph",
        content:
          "很多家长搜索“温哥华辩论课程”时，会先看到一堆看起来都不错的网站。但真正难的不是找到一个项目，而是判断哪个项目真的适合自己的孩子。课程名字可以都写成“高级”“竞赛”“精英”，可孩子最后能不能真正开口、真正进步，差别很大。",
      },
      {
        type: "paragraph",
        content:
          "如果您想找的是能让孩子稳定成长、愿意持续上课、又能把表达和逻辑真正练出来的 debate program，这篇文章会帮助您建立一个更实用的比较标准。",
      },
      {
        type: "subheading",
        content: "比较温哥华辩论课程时，家长最该看什么？",
      },
      {
        type: "paragraph",
        content:
          "**先看教练。** 教练是否真的参加过中学或大学高水平辩论？是否懂得如何教不同年龄段学生？会打比赛和会教学并不完全一样，优秀项目通常兼具这两点。",
      },
      {
        type: "paragraph",
        content:
          "**再看班级人数。** 一个 8 到 12 人的小班，和一个 25 人的大班，学习体验完全不同。学生有没有频繁发言、被逐一纠正、被点名做 drill，这些都直接决定学习效率。",
      },
      {
        type: "paragraph",
        content:
          "**反馈质量也非常关键。** 很多课程上完后只有几句泛泛而谈的口头评论。真正强的辩论课程会给学生明确的改进方向，例如立论不够聚焦、比较不够充分、例子不够具体、POI 处理不够成熟等。",
      },
      {
        type: "paragraph",
        content:
          "**赛制要和目标匹配。** 如果孩子未来想参加 BC 或加拿大的正式比赛，课程最好接触到 CNDF、BP 或交叉质询等真正会用到的赛制。如果目标是提升自信和表达，则课程结构、练习密度和支持感比比赛结果更重要。",
      },
      {
        type: "subheading",
        content: "线上课程会比线下差吗？",
      },
      {
        type: "paragraph",
        content:
          "不一定。对很多大温家庭来说，线上课程反而更强。原因很现实：不用通勤、更容易坚持、能接触到更好的教练，而且优质在线课程通常会把班级人数控制得更小，学生每周真正开口的时间更多。",
      },
      {
        type: "paragraph",
        content:
          "如果课程是直播、互动式、带 breakout 讨论和赛后反馈的，线上辩论并不会变成“听课”。恰恰相反，它常常让学生更快进入高频练习状态，尤其适合住在 Burnaby、Richmond、Surrey、North Vancouver 或需要跨城通勤的家庭。",
      },
      {
        type: "subheading",
        content: "温哥华家长在报名前应该问哪些问题？",
      },
      {
        type: "list",
        content: "",
        items: [
          "班级平均多少人？每节课孩子大概会说几次？",
          "教练是否有加拿大或国际辩论比赛背景？",
          "课程是按年龄和程度分班，还是所有学生混在一起？",
          "孩子会收到怎样的反馈？是口头点评、书面反馈，还是两者都有？",
          "课程更偏自信表达、基础逻辑，还是正式竞赛训练？",
          "如果孩子是完全新手，课程会不会太快、太难或太有压力？",
        ],
      },
      {
        type: "paragraph",
        content:
          "这些问题能帮助您把注意力放在“孩子会怎么学”上，而不是只看宣传页面写得漂不漂亮。真正适合的项目，通常能把这些问题答得非常具体。",
      },
      {
        type: "subheading",
        content: "为什么很多 Vancouver 家庭会选择 DSDC？",
      },
      {
        type: "paragraph",
        content:
          "DSDC 的优势不只是“在线”。更关键的是，我们把线上做成了真正高互动的小班训练。学生不是听讲结束，而是在每节课里反复开口、练结构、练 rebuttal、练分析、练比赛中的临场决策。",
      },
      {
        type: "paragraph",
        content:
          "我们服务的不只是 Vancouver 市区，也包括 Burnaby、Richmond、Surrey、Coquitlam、New Westminster、North Vancouver、West Vancouver 等家庭。对于需要兼顾学业和其他活动的家长来说，稳定、可持续的上课方式往往比“距离近”更重要。",
      },
      {
        type: "paragraph",
        content:
          "如果您还在比较，不妨先看 [课程页面](/classes)、[价格](/pricing)、[教练团队](/team) 和 [线上 vs 线下辩论课](/blog/online-vs-in-person-debate-classes)。这些页面能帮助您更快判断哪条路径适合自己的孩子。",
      },
      {
        type: "subheading",
        content: "下一步怎么做最有效？",
      },
      {
        type: "paragraph",
        content:
          "最好的下一步不是盲目报名，而是先把孩子的年龄、经验和目标说清楚。这样我们才能告诉您，是应该从基础辩论、自信表达、竞赛训练，还是公共演讲开始。",
      },
      {
        type: "paragraph",
        content: "[预约免费咨询](/book)",
      },
    ],
    faqItems: [
      {
        question: "比较温哥华儿童辩论课程时，家长最该优先看什么？",
        answer:
          "先看教练质量、班级人数、反馈方式，以及课程是否符合孩子的年龄和目标。地点方便当然重要，但不应该盖过教学结构本身。",
      },
      {
        question: "线上辩论课程真的能和线下课程一样有效吗？",
        answer:
          "可以，只要课程是直播、小班、互动型的。优质在线课程通常会给学生更多实际开口机会，还省去长时间通勤。",
      },
      {
        question: "为什么住在 Vancouver 以外的家庭也会参加 DSDC？",
        answer:
          "因为 DSDC 是在线授课，Burnaby、Richmond、Surrey、Coquitlam 甚至多伦多和 GTA 的家庭都能参加同样的课程与教练体系。",
      },
      {
        question: "怎么看一个辩论课程是否适合初学者？",
        answer:
          "看它是否有清晰分级、支持性的教练、稳定的小班练习机会，以及不会一开始就把新手丢进过高压的竞赛环境里。",
      },
      {
        question: "DSDC 只适合想打比赛的学生吗？",
        answer:
          "不是。很多学生加入是为了提升自信、逻辑思维和学校里的表达能力。比赛是一条路线，但不是唯一目标。",
      },
      {
        question: "如果我还在比较不同项目，最好的下一步是什么？",
        answer:
          "先查看 DSDC 的课程、价格和教练介绍，再预约一次免费咨询。这样能根据孩子的年级、经验和目标获得更具体的建议。",
      },
    ],
  },
  "online-vs-in-person-debate-classes": {
    title: "线上辩论课和线下辩论课，哪一种更适合孩子？",
    excerpt:
      "很多家长都会问：线上辩论课真的有用吗？这篇文章从社交、班级人数、反馈质量、通勤成本和教练资源几个角度，帮您判断哪种方式更适合自己的孩子。",
    category: "家长指南",
    readTime: "6 分钟阅读",
    sections: [
      {
        type: "paragraph",
        content:
          "这是家长最常问的问题之一。尤其是第一次给孩子找辩论课时，很多家庭会直觉地觉得“线下应该更好”。这个想法完全可以理解，因为我们都习惯把课堂学习和实体教室联系在一起。",
      },
      {
        type: "paragraph",
        content:
          "但在辩论这件事上，答案没有那么简单。线上和线下都有真实优势。关键不是哪一种形式听起来更传统，而是哪一种形式更能让您的孩子稳定开口、持续练习，并且接受高质量反馈。",
      },
      {
        type: "subheading",
        content: "线下辩论课的优势",
      },
      {
        type: "paragraph",
        content:
          "线下课程最大的优势是环境感。孩子真的走进一个教室，能见到同龄同学、感受到课堂氛围，对某些学生来说会更有仪式感，也更容易进入“我要认真参与”的状态。",
      },
      {
        type: "paragraph",
        content:
          "如果孩子年龄较小、很依赖面对面互动，或者您家附近恰好有一个真正强而且规模合适的辩论项目，线下课当然可以很有效。",
      },
      {
        type: "subheading",
        content: "线上辩论课的优势",
      },
      {
        type: "paragraph",
        content:
          "优质的在线辩论课并不是“隔着屏幕听讲”，而是把课堂时间集中在高频练习上。对于很多家庭来说，线上课的真正优势包括：更小的班级、更好的教练资源、更少的通勤成本，以及更稳定的长期坚持率。",
      },
      {
        type: "paragraph",
        content:
          "在线模式还打破了地域限制。住在温哥华的学生不需要只选家附近的老师；住在 Toronto、Mississauga、Brampton 或 Calgary 的学生，也可以加入同样高质量的课程。对想认真进步的家庭来说，这一点非常重要。",
      },
      {
        type: "paragraph",
        content:
          "另外，很多线上项目会提供更清晰的赛后反馈。因为课程流程本身就是数字化的，教练更容易在课后留下结构、反驳、例子和表达层面的具体建议，而不是只有短短几句口头点评。",
      },
      {
        type: "subheading",
        content: "家长最在意的社交问题怎么办？",
      },
      {
        type: "paragraph",
        content:
          "这是非常合理的担心。很多家长怕线上课缺少社交互动。但实际情况是，辩论本身就是高互动活动。只要课程安排得好，学生会不断和同学配对讨论、做 rebuttal drills、打 mini rounds、交换观点，互动强度并不低。",
      },
      {
        type: "paragraph",
        content:
          "而且很多学生会在同一个 cohort 里连续上几个学期，关系会越来越熟。对于原本不太敢说话的孩子来说，先在熟悉的线上环境中建立信心，反而是更温和、更可持续的开始。",
      },
      {
        type: "subheading",
        content: "什么样的孩子更适合哪一种形式？",
      },
      {
        type: "list",
        content: "",
        items: [
          "**更适合线下：** 家附近就有优质项目，孩子特别需要实体课堂氛围，而且时间与通勤都能长期配合。",
          "**更适合线上：** 想要更强的教练、更小的班级、更稳定的反馈，或者家庭不想把大量周末时间花在路上。",
          "**两种都可以：** 有些学生学期中参加在线课程，暑期再参加线下训练营，两者可以互补。",
        ],
      },
      {
        type: "subheading",
        content: "DSDC 为什么选择在线模式？",
      },
      {
        type: "paragraph",
        content:
          "因为对大多数家庭来说，真正推动进步的不是“孩子有没有进教室”，而是“孩子有没有高频开口、被认真反馈、并且能持续练习”。我们把课程设计成直播、小班、高互动，就是为了把这些最重要的学习因素做好。",
      },
      {
        type: "paragraph",
        content:
          "如果您想先了解 DSDC 的具体课程，可以看看 [全部课程](/classes)、[价格](/pricing) 或 [温哥华辩论课程页](/debate-classes-vancouver)。如果您已经在比较线上和线下的选择，最快的方法还是直接聊聊孩子的情况。",
      },
      {
        type: "paragraph",
        content: "[预约免费咨询](/book)",
      },
    ],
  },
  "debate-vs-model-un": {
    title: "辩论和模拟联合国，哪个更适合孩子？",
    excerpt:
      "辩论和 Model UN 都能提升表达能力，但它们训练的节奏、反馈方式和学生体验并不一样。家长可以从竞争性、结构性和孩子的性格特点三个角度来选择。",
    category: "家长指南",
    readTime: "7 分钟阅读",
    sections: [
      {
        type: "paragraph",
        content:
          "如果您的孩子喜欢时事、公共议题、说服别人，您大概率已经看到过两个常见选项：competitive debate 和 Model UN。它们看起来很像，因为都涉及演讲、观点表达和国际议题，但实际上，它们训练的能力和课堂体验有明显差异。",
      },
      {
        type: "subheading",
        content: "什么是竞赛辩论？",
      },
      {
        type: "paragraph",
        content:
          "在竞赛辩论中，学生会被分到正方或反方，围绕一项具体议题展开结构化论证。每一轮都有固定发言顺序、时间限制、回应机制和评分标准，目标是说服裁判并在逻辑、战略和表达上赢下比赛。",
      },
      {
        type: "paragraph",
        content:
          "辩论特别强调“论证是否成立”。孩子要学会立论、举例、比较、反驳、识别对方漏洞，并在压力下把想法讲清楚。这种训练对逻辑和即时思考的提升非常明显。",
      },
      {
        type: "subheading",
        content: "什么是 Model UN？",
      },
      {
        type: "paragraph",
        content:
          "Model UN 是模拟联合国会议。学生会扮演不同国家的代表，在委员会中发表立场演讲、协商、起草 resolution、建立联盟，并在更长时间的会议流程里推动议题发展。",
      },
      {
        type: "paragraph",
        content:
          "它不像辩论那样每一轮只有“输赢”或明确排名，而更偏向外交、协商和会议参与。适合喜欢国际政治、喜欢社交互动、愿意花时间沉浸在角色中的学生。",
      },
      {
        type: "subheading",
        content: "两者最大的区别是什么？",
      },
      {
        type: "list",
        content: "",
        items: [
          "**竞争性不同：** 辩论是明确的竞技型活动；Model UN 更偏协作与会议模拟。",
          "**表达方式不同：** 辩论要求高密度、结构化、时间精准的发言；Model UN 更强调立场陈述、谈判与会议礼仪。",
          "**反馈方式不同：** 辩论通常每轮都会得到很具体的裁判反馈；Model UN 的反馈往往更整体、更结果导向。",
          "**准备方式不同：** 辩论要为正反双方建立论证；Model UN 要做国家背景研究、政策立场和 resolution 写作。",
        ],
      },
      {
        type: "subheading",
        content: "辩论最能培养哪些能力？",
      },
      {
        type: "paragraph",
        content:
          "辩论最强的地方在于逻辑和表达。孩子会逐渐学会：怎样把复杂问题讲得清楚，怎样在别人反驳后快速回应，怎样在时间有限的情况下抓重点，怎样把“我觉得”变成“我能证明”。对于希望提升学术表达、写作结构、面试表现和课堂参与度的学生来说，辩论非常有效。",
      },
      {
        type: "subheading",
        content: "Model UN 最能培养哪些能力？",
      },
      {
        type: "paragraph",
        content:
          "Model UN 更擅长培养国际议题理解、外交语言、会议参与和长时间协商能力。它适合喜欢时政、喜欢和人打交道、愿意在一个更开放的框架中慢慢推进意见整合的学生。",
      },
      {
        type: "subheading",
        content: "家长应该怎么选？",
      },
      {
        type: "list",
        content: "",
        items: [
          "**优先选辩论：** 如果孩子喜欢结构清晰的挑战、希望快速得到反馈、想强化逻辑和说服力。",
          "**优先选 Model UN：** 如果孩子喜欢国际关系、协商和较开放的会议氛围。",
          "**两者都尝试：** 如果孩子时间允许，也可以先通过辩论建立表达基础，再去体验 Model UN。很多能力是互相支持的。",
        ],
      },
      {
        type: "subheading",
        content: "如果孩子想先从辩论开始呢？",
      },
      {
        type: "paragraph",
        content:
          "对于大多数想提升公开表达和分析能力的学生来说，辩论通常是更清晰的起点，因为它的训练目标、反馈机制和成长路径都更明确。如果您想进一步比较，可以先看 [在线辩论课程](/online-debate-classes) 和 [完整课程页](/classes)。",
      },
      {
        type: "paragraph",
        content: "[预约免费咨询](/book)",
      },
    ],
  },
  "public-speaking-benefits": {
    title: "孩子学习公共演讲，有哪些真正长期的好处？",
    excerpt:
      "公共演讲不只是“会讲话”而已。它会影响孩子的自信、课堂参与、领导力、面试表现和未来学术发展。这篇文章解释家长最常忽略的几个关键价值。",
    category: "公共演讲",
    readTime: "5 分钟阅读",
    sections: [
      {
        type: "paragraph",
        content:
          "很多家长给孩子报名 public speaking class，并不是想把孩子立刻变成比赛型演讲者，而是希望他们更自信、更会表达、更敢在课堂上发言。这个出发点其实非常正确，因为公共演讲的价值本来就远远超过“站上台讲话”。",
      },
      {
        type: "subheading",
        content: "1. 它最直接地提升孩子的自信",
      },
      {
        type: "paragraph",
        content:
          "很多孩子不是没想法，而是不知道怎么讲出来，或者一站到别人面前就紧张。公共演讲训练会让孩子逐渐习惯组织思路、面对听众、开口表达。一次次练习下来，孩子会慢慢形成一种内在感受：我可以把自己的想法说清楚。",
      },
      {
        type: "subheading",
        content: "2. 它会影响课堂参与和学业表现",
      },
      {
        type: "paragraph",
        content:
          "能清楚表达的人，往往也更能在课堂讨论、项目展示、口头报告和申请面试中表现出来。公共演讲和辩论训练会让孩子更会组织信息、更会抓重点，也更愿意在学校里主动参与。",
      },
      {
        type: "subheading",
        content: "3. 它能培养领导力和社交沟通",
      },
      {
        type: "paragraph",
        content:
          "领导力并不只是“带队”或者“当班长”，更重要的是能不能把观点讲清楚、让别人听得懂、愿意跟随。一个表达清晰、态度稳健、能照顾听众感受的孩子，往往在团队活动里更容易承担责任。",
      },
      {
        type: "subheading",
        content: "4. 它对升学和未来面试也有帮助",
      },
      {
        type: "paragraph",
        content:
          "无论是申请学校、参加奖学金面试，还是未来实习和工作，清晰而自信的表达都会让孩子更有优势。公共演讲训练不是为了背一套华丽说辞，而是为了让孩子在关键时刻真的能把自己讲明白。",
      },
      {
        type: "subheading",
        content: "为什么越早开始越好？",
      },
      {
        type: "paragraph",
        content:
          "因为表达习惯是可以长期累积的。越早接触系统化的 speaking practice，孩子越容易把“开口表达”当成自然的事，而不是每次都带着紧张和回避。对原本比较害羞的孩子来说，这种早期支持尤其重要。",
      },
      {
        type: "subheading",
        content: "DSDC 的公共演讲课是怎么做的？",
      },
      {
        type: "paragraph",
        content:
          "我们不会只让学生背稿上台，而是通过结构化练习，帮助他们一步步建立内容组织、声音控制、表达清晰度、临场反应和听众意识。课程既关注技巧，也关注孩子开口时的心理安全感。",
      },
      {
        type: "paragraph",
        content:
          "如果您想同时比较辩论和公共演讲，可以先看 [课程页](/classes)、[公共演讲课程页](/public-speaking-classes-for-kids) 和 [教练团队](/team)。",
      },
      {
        type: "paragraph",
        content: "[预约免费咨询](/book)",
      },
    ],
  },
  "british-parliamentary-debate-guide": {
    title: "什么是英式议会制辩论（BP）？给家长和新手的入门指南",
    excerpt:
      "British Parliamentary 辩论是高中高段和大学最常见的国际赛制之一。四队同场、即兴性强、策略复杂，但也正因为如此，它非常能训练高阶分析和临场应变。",
    category: "竞赛辩论",
    readTime: "7 分钟阅读",
    sections: [
      {
        type: "paragraph",
        content:
          "如果您第一次听到 BP，通常都会觉得它比普通两队制辩论复杂得多。四支队伍、同边不同队、opening 和 closing、还要抢 extension，这些术语确实让很多新生和家长一开始有点摸不着头绪。",
      },
      {
        type: "subheading",
        content: "BP 的基本结构是什么？",
      },
      {
        type: "paragraph",
        content:
          "一场 British Parliamentary debate 一共有四支队伍、八位辩手。它们分成两边：Government（正方）和 Opposition（反方）。每一边又各自分成 Opening 和 Closing 两支队伍，所以总共有 Opening Government、Opening Opposition、Closing Government、Closing Opposition。",
      },
      {
        type: "list",
        content: "",
        items: [
          "Opening Government（OG）",
          "Opening Opposition（OO）",
          "Closing Government（CG）",
          "Closing Opposition（CO）",
        ],
      },
      {
        type: "subheading",
        content: "为什么它和普通辩论不一样？",
      },
      {
        type: "paragraph",
        content:
          "因为你不是只打一个对手，而是同时和三支队伍竞争。裁判最后会把四队排成第一到第四名。也就是说，即使你和另一支队伍站在同一边，你们仍然是在竞争名次的。",
      },
      {
        type: "paragraph",
        content:
          "这让 BP 特别考验战略。Opening teams 负责把辩题框架搭起来，Closing teams 则必须在不和同边冲突的前提下，提出有价值的新延伸（extension），证明自己对这场辩论贡献更大。",
      },
      {
        type: "subheading",
        content: "每个位置大概负责什么？",
      },
      {
        type: "paragraph",
        content:
          "OG 要先定义题目并建立最基础的政府立场；OO 要即时回应并建立反方框架；CG 和 CO 则需要在后半场带来新的分析角度，而不是只是重复 opening team 已经说过的话。",
      },
      {
        type: "paragraph",
        content:
          "所以，BP 的难点并不只是“会不会说”，而是你能不能判断这场辩论还缺什么、你的队伍需要怎样补位、以及如何在复杂比较中凸显自己的独立价值。",
      },
      {
        type: "subheading",
        content: "什么是 POI？",
      },
      {
        type: "paragraph",
        content:
          "POI 是 Point of Information，也就是在对方发言中间提出的短问题或挑战。它既是攻击机会，也是防守压力。学生不仅要学会什么时候提 POI、提什么最有杀伤力，也要学会在自己发言时稳住节奏、有效接 POI。",
      },
      {
        type: "subheading",
        content: "裁判最看重什么？",
      },
      {
        type: "list",
        content: "",
        items: [
          "是否完成了自己所在位置的角色任务",
          "论点是否清晰、有比较、能真正推动辩论",
          "extension 是否新且重要，而不是换一种说法重复旧内容",
          "回应和反驳是否抓住了场上的核心冲突",
          "表达是否清楚、节奏是否稳、战略判断是否成熟",
        ],
      },
      {
        type: "subheading",
        content: "BP 为什么特别适合有一定基础的学生？",
      },
      {
        type: "paragraph",
        content:
          "因为 BP 要求学生在更高密度的比较框架里思考。它非常适合已经具备基础立论和反驳能力、想进一步提升战略深度、国际竞赛视野和即兴分析水平的学生。很多高中高年级学生和大学辩手都会把 BP 作为主赛制。",
      },
      {
        type: "subheading",
        content: "孩子想学 BP，该怎么开始？",
      },
      {
        type: "paragraph",
        content:
          "最好的方式是先建立清晰的基础，再逐步进入 BP 的角色分工、extension 训练和 round strategy。DSDC 的课程会帮助学生从普通结构化辩论过渡到更高阶的 BP 思维，而不是一开始就被复杂规则压垮。",
      },
      {
        type: "paragraph",
        content:
          "如果您想看看孩子目前更适合哪一层级，可以先浏览 [课程页](/classes)、[在线辩论课程](/online-debate-classes) 或 [多伦多辩论课程页](/debate-classes-toronto)。",
      },
      {
        type: "paragraph",
        content: "[预约免费咨询](/book)",
      },
    ],
  },
};

function translateReadTime(readTime: string) {
  const minutes = readTime.match(/(\d+)/)?.[1];
  return minutes ? `${minutes} 分钟阅读` : readTime;
}

function localizeAuthorProfile(authorProfile?: ArticleAuthorProfile) {
  if (!authorProfile) return authorProfile;

  if (authorProfile.slug === "rebecca-amisano") {
    return {
      ...authorProfile,
      ...translatedFounderProfile,
    };
  }

  return authorProfile;
}

export function hasChineseBlogTranslation(slug: string) {
  return translatedChineseBlogSlugSet.has(slug);
}

export function localizeBlogPost(post: BlogPost, locale: "en" | "zh"): BlogPost {
  if (locale !== "zh") {
    return post;
  }

  const override = zhPostOverrides[post.slug];

  return {
    ...post,
    ...(override ?? {}),
    author: post.author === "DSDC Team" ? "DSDC 团队" : post.author,
    category: override?.category ?? categoryTranslations[post.category] ?? post.category,
    readTime: override?.readTime ?? translateReadTime(post.readTime),
    authorProfile: localizeAuthorProfile(post.authorProfile),
  };
}

export function getLocalizedBlogPosts(posts: BlogPost[], locale: "en" | "zh") {
  const localizedPosts = posts.map((post) => localizeBlogPost(post, locale));

  if (locale === "zh") {
    return localizedPosts.filter((post) => hasChineseBlogTranslation(post.slug));
  }

  return localizedPosts;
}

export function getLocalizedBlogPost(posts: BlogPost[], slug: string, locale: "en" | "zh") {
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    return undefined;
  }

  if (locale === "zh" && !hasChineseBlogTranslation(slug)) {
    return undefined;
  }

  return localizeBlogPost(post, locale);
}
