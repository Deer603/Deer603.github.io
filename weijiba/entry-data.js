(() => {
  "use strict";

  const entries = {
    ...window.WEIJIBA_PERSON_ENTRIES,
    "luchun": {
      title: "鹿群",
      type: "微信群",
      description: "以校园熟人为主的微信群，现有档案涵盖校园事务、工程项目及群内用语。",
      facts: [["2026年11月导出群名", "Zetacognition🦌"], ["现存最早记录", "2025年5月12日"], ["主要话题", "校园生活、科技与娱乐"]],
      overview: ["鹿群是以校园熟人为主的微信群。群内交流涉及课程、工程实践、数码设备、娱乐和日常生活，并形成了“高认知”“共🦌主义”等群内用语。[1][2]2026年11月26日的聊天导出清单将群名记为“Zetacognition🦌”。[2]"],
      sections: [
        { id: "topics", title: "交流内容", paragraphs: [
          "早期综合报告将校园事务、科技、娱乐及成员互动列为群内常见话题。课程讨论涉及作业、考试和机器人基础，工程讨论涉及设备选型、项目分工和软件工具。[1]",
          "聊天档案还记载了成员对603AI、KunCode和DeerPhotos等项目的分享。群内用语可见于提醒、评价和戏仿口号等不同情境。[2]"
        ] },
        { id: "archives", title: "档案与统计", paragraphs: [
          "截至2026年8月25日的综合报告统计了57,216条消息，覆盖471个日历日，其中469天有消息记录。报告以发言满100条为条件，将14人纳入核心成员分析。[1]",
          "2026年11月26日版导出覆盖2025年5月12日23:31:53至2026年11月26日13:59:36，49,393条消息分布于557天。该导出包含文本、引用、系统消息、链接、聊天记录、转账和红包七种类型。[2]"
        ] }
      ],
      references: [
        "《鹿群聊天记录话题主轴综合分析报告》V1.0，统计范围与话题概览。",
        "《鹿群20261126》导出清单及群聊记录。"
      ],
      categories: ["微信群", "鹿群文化"],
      related: ["history", "tech", "high-cognition", "gonglu", "short-messages", "603-vision", "kuncode", "deerphotos"],
      revised: "2026年11月26日"
    },
    "history": {
      title: "群内编年史与群史",
      type: "鹿群编年",
      description: "依据鹿群聊天档案编排的校园交流、用语和项目分享年表。",
      facts: [["档案时间范围", "2025年5月12日至2026年11月26日"], ["日期依据", "消息发送时间"]],
      overview: ["群内编年史与群史是依据鹿群聊天档案编排的年表，选录校园交流、群内用语和公开项目的分享记录。现有材料始于2025年5月12日，截止于2026年11月26日。[1]"],
      sections: [
        { id: "early", title: "2025年", paragraphs: [], items: [
          "5月12日，现存聊天档案的最早记录。[1]",
          "6月5日，群内多次出现关于“困困”称呼的问句。[1]",
          "10月23日，群内先后出现三版图像提示，采用伦勃朗《夜巡》作为群像构图参考。[1]"
        ] },
        { id: "terms", title: "2026年1月至8月", paragraphs: [], items: [
          "1月13日，彭鹏发出“打卡了孩子们”的晚间提醒，随后在多个日期重复使用该句。[1]",
          "3月2日，魏子奇分享《机器人基础》课程笔记。[1]",
          "6月23日，成员围绕机器人运动学中的雅可比矩阵及其奇异性发言。[1]",
          "7月10日及8月7日，群聊分别记录“集体高认知化”和“共🦌主义”的用例。[1]"
        ] },
        { id: "projects", title: "2026年9月至11月", paragraphs: [], items: [
          "9月25日，成员分享Deer603网站链接。[1]",
          "10月12日，成员分享603AI及KunCode项目页面。[1]",
          "10月16日，与“鹿味测试”有关的讨论中出现“你是个鹿嘞”网页链接。[1]",
          "10月27日，18:07出现DeerPhotos仓库链接，19:02出现V3.0.0发行页链接。[1][2]"
        ] }
      ],
      references: [
        "《鹿群20261126》群聊记录，2025年5月12日至2026年11月26日。",
        { title: "DeerPhotos V3.0.0发行页", url: "https://github.com/Roylyl/DeerPhotos/releases/tag/V3.0.0" }
      ],
      categories: ["群史", "鹿群文化"],
      related: ["luchun", "high-cognition", "gonglu", "portrait-generator", "jacobian-rapid", "603-vision", "kuncode", "deerphotos", "deer-taste-test"],
      revised: "2026年11月26日"
    },
    "gonglu": {
      title: "共🦌主义",
      type: "鹿群用语",
      description: "借用口号句式的鹿群戏仿用语。",
      facts: [["使用范围", "鹿群"], ["可查用例", "2026年8月7日及17日"]],
      overview: ["共🦌主义是鹿群中借用口号句式的戏仿用语。其中“🦌”指代鹿群，“主义”与“出发”“指日可待”等措辞组成宣言式表达。[1]"],
      sections: [
        { id: "usage", title: "使用实例", paragraphs: [
          "2026年8月7日，群内一条消息写道“鹿群要向共🦌主义出发”。8月17日，群内先后出现“🦌群蒸蒸日上”与“共🦌主义指日可待”。前一用例采用号召句式，后一用例以祝颂口吻承接上一条消息。[1]"
        ] }
      ],
      references: [
        "《鹿群20261126》群聊记录，2026年8月7日、8月17日。"
      ],
      categories: ["鹿群术语", "群聊语言"],
      related: ["high-cognition", "history", "luchun"],
      revised: "2026年11月26日"
    },
    "high-cognition": {
      title: "高认知（鹿群用语）",
      type: "鹿群用语",
      description: "鹿群中用于评价发言、调侃和构造戏仿名称的用语。",
      facts: [["使用场合", "评价、调侃与戏仿命名"], ["衍生形式", "集体高认知化、高认知大学"]],
      overview: ["高认知是鹿群中的非正式用语。群聊记录中，该词可用于评价发言，也可作为夸张修饰语，用在调侃或戏仿性质的名称中。[1]"],
      sections: [
        { id: "usage", title: "评价与调侃", paragraphs: [
          "2026年6月12日，一条消息将“低认知人群”与“高认知发言”并列，构成高、低对照。8月13日，有成员在讨论AI模型使用额度时，以每天数亿个token夸张描述用量。[1]"
        ] },
        { id: "collective", title: "衍生形式", paragraphs: [
          "2026年7月6日的聊天记录中出现“高认知大学”。7月10日，成员提出“集体高认知化”的说法。11月23日的消息另有“高认知分享会”一称，档案记录的是讨论中使用的名称。[1]"
        ] }
      ],
      references: [
        "《鹿群20261126》群聊记录，2026年6月12日、7月6日、7月10日、8月13日及11月23日。"
      ],
      categories: ["鹿群术语", "群聊语言"],
      related: ["gonglu", "kunkun", "short-messages", "history", "luchun"],
      revised: "2026年11月26日"
    },
    "short-messages": {
      title: "短句连发",
      type: "鹿群聊天形式",
      description: "鹿群聊天中由连续短消息构成的提问、提醒与回应。",
      facts: [["群聊文本长度中位数", "约6个字符"], ["詹绍源样本文本长度中位数", "约5个字符"]],
      overview: ["短句连发指鹿群聊天中以连续发送的短消息推进对话的形式。消息可以由同一成员分条发送，也可由不同成员接续发出。可查用例包括课程提醒、考试讨论和重复问句。[1][3]"],
      sections: [
        { id: "examples", title: "发言形式", paragraphs: [
          "2025年6月18日凌晨，彭鹏发消息提醒线性代数任务即将关闭，随后另发“快刷”。同日，李彦臻在考试讨论中先后使用“十有八九稳了”和“考试稳了”。[3]",
          "2025年10月23日，三名成员在约一分钟内相继发送“何意味”。单独发送的问号、数字和“nb”也出现在回应中。[3]"
        ] },
        { id: "statistics", title: "文本长度", paragraphs: [
          "早期综合报告统计的群聊文本长度中位数约为6个字符。詹绍源语言风格报告中的专项样本中，文本长度中位数约为5个字符，约77%的文字消息不超过8个字符。[1][2]"
        ] }
      ],
      references: [
        "《鹿群聊天记录话题主轴综合分析报告》V1.0。",
        "《ZhanShaoyuan语言风格分析报告》。",
        "鹿群初始聊天档案，2025年6月18日、10月23日。"
      ],
      categories: ["群聊语言"],
      related: ["he-meaning", "nb-context", "six-six-six", "steady", "check-in-kids", "kunkun", "peng-peng", "li-yanzhen", "luchun"],
      revised: "2026年11月26日"
    },
    "tech": {
      title: "鹿群科技话题",
      type: "鹿群讨论专题",
      description: "鹿群的科技讨论及其在早期专题报告中的分类统计。",
      facts: [["报告选取", "1,721条核心科技消息"], ["主题分类", "7类，可交叉"]],
      overview: ["鹿群科技话题涵盖硬件与数码设备、工程项目、数字平台、人工智能、学习、软件开发及数据安全。《鹿群_科技IT话题详细报告》按上述方向对1,721条核心科技消息进行分类。[1]"],
      sections: [
        { id: "matrix", title: "主题分类", paragraphs: [
          "表中数字为各主题的匹配条数。同一条消息可归入多个主题，因此各项数字可以交叉。[1]"
        ], table: {
          caption: "科技话题分类统计",
          headers: ["主题","匹配消息数"],
          rows: [
            ["硬件与数码","503"],
            ["项目与竞赛","480"],
            ["数字平台与产品","323"],
            ["AI与大模型","316"],
            ["学习与课程","213"],
            ["编码与开发","151"],
            ["安全与数据","136"]
          ]
        } },
        { id: "projects", title: "工程项目与课程", paragraphs: [
          "603视界对2025年9月招新活动的报道列出无人机应用、超声波定向扬声器、植物生长灯和泡茶机。2025年10月的另一篇文章提出帕尔贴制冷、涂层、立体绿化与调整生活方式等应对高温的设想。[2][3]",
          "2026年3月2日，魏子奇在群内分享机器人基础课程笔记。6月23日，群内的机器人运动学讨论涉及雅可比矩阵的定义和奇异性判定。[4]"
        ] },
        { id: "devices", title: "设备与软件", paragraphs: [
          "2026年8月6日，罗宇伦和魏子奇讨论笔记本电脑的接口数量、USB-C供电和电源适配器重量。10月12日，成员分享603AI和KunCode项目页面。10月27日，DeerPhotos的仓库和发行页链接出现在群聊中。[4]"
        ] }
      ],
      references: [
        "《鹿群_科技IT话题详细报告》，核心消息筛选与七方向统计。",
        { title: "603视界《科技之光》", url: "https://mp.weixin.qq.com/s/PN3bXURXRR3MiOGZAhOxmg" },
        { title: "603视界《603欧洲空调困局》（2025年10月15日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484141&idx=2&sn=aad97aa5dc6123606ea0594e4851bbad&chksm=c503717a37f3a0190c434276513c52197cdc1ac89b1da4595162d988cd4b28d13c05eb393005#rd" },
        "《鹿群20261126》群聊记录，2026年3月2日、6月23日、8月6日、10月12日及27日。"
      ],
      categories: ["鹿群科技"],
      related: ["robot-basics", "jacobian-rapid", "603-tech-light", "603-ai-android", "kuncode", "deerphotos"],
      revised: "2026年11月26日"
    },
    "he-meaning": {
      title: "何意味",
      type: "鹿群用语",
      description: "鹿群中用来询问含义或表达疑惑的三字短语。",
      facts: [["使用范围", "鹿群群聊"], ["早期档案匹配", "77条文本或标题"]],
      overview: ["何意味是鹿群聊天中用来询问含义的简短问语。该词也可单独作为回应，用以表示困惑或调侃。[1]"],
      sections: [
        { id: "usage", title: "使用实例", paragraphs: [
          "2025年10月23日8:01至8:02，罗宇伦、陈祖涵和彭鹏相继发送“何意味”。[1]"
        ] },
        { id: "archive", title: "档案记录", paragraphs: [
          "在2026年8月版档案中，以“何意味”检索文本及标题所得77条记录分布于65个日期。最早匹配见于2025年10月14日，最晚见于2026年8月22日。[1]"
        ] }
      ],
      references: [
        "鹿群初始聊天档案，2025年10月14日至2026年8月22日的匹配记录及2025年10月23日的连续发言。"
      ],
      categories: ["鹿群术语", "群聊语言"],
      related: ["short-messages", "peng-peng", "history"],
      revised: "2026年11月26日"
    },
    "jacobian-rapid": {
      title: "雅可比速问速答",
      type: "鹿群聊天事件",
      description: "鹿群于2026年6月23日围绕雅可比矩阵的奇异性和定义进行的对话。",
      facts: [["发生日期", "2026年6月23日"], ["主题", "机器人运动学"]],
      overview: ["雅可比速问速答是鹿群于2026年6月23日的一段机器人运动学对话。詹绍源提出雅可比矩阵的奇异性判定问题，夏炜城随后询问矩阵的含义。[1]"],
      sections: [
        { id: "dialogue", title: "对话经过", paragraphs: [
          "23:04:46，詹绍源发出“速问速答 雅可比怎么判断奇异”。23:05:27，夏炜城回应“雅可比是什么”。[1]"
        ] },
        { id: "background", title: "机器人运动学背景", paragraphs: [
          "在机械臂运动学中，雅可比矩阵把关节速度映射为末端速度。其数值取决于机械臂的关节构型。当矩阵在某一构型的秩低于机械臂可达到的最大秩时，该构型为奇异构型，末端可实现的瞬时运动方向因而减少。[2]"
        ] }
      ],
      references: [
        "鹿群聊天记录，2026年6月23日23:04:46及23:05:27。",
        { title: "Modern Robotics：雅可比矩阵与奇异性", url: "https://modernrobotics.northwestern.edu/nu-gm-book-resource/5-3-singularities/" }
      ],
      categories: ["群聊事件", "鹿群科技"],
      related: ["robot-basics", "kunkun", "xia-weicheng", "tech", "history"],
      revised: "2026年11月26日"
    },
    "robot-basics": {
      title: "机器人基础",
      type: "鹿群课程资料",
      description: "2026年3月2日由魏子奇分享的机器人基础课程笔记。",
      facts: [["分享日期", "2026年3月2日"], ["分享者", "魏子奇"]],
      overview: ["《机器人基础》是魏子奇于2026年3月2日在鹿群分享的课程笔记，涵盖机械臂运动学、传感器、控制及路径规划。[1]"],
      sections: [
        { id: "contents", title: "笔记内容", paragraphs: [
          "运动学部分涉及关节与连杆、坐标变换、正逆运动学及雅可比矩阵。笔记还列举比例－积分－微分控制（PID）、模型预测控制（MPC）、A*搜索、快速扩展随机树（RRT）和近端策略优化（PPO）等方法。[1]"
        ] },
        { id: "application", title: "应用实例", paragraphs: [
          "笔记以智能采茶机为例，说明机器人基础课程的工程实践内容。[1]"
        ] }
      ],
      references: [
        "鹿群聊天记录，2026年3月2日，魏子奇分享机器人基础课程笔记。"
      ],
      categories: ["鹿群科技"],
      related: ["jacobian-rapid", "wei-ziqi", "tech"],
      revised: "2026年11月26日"
    },
    "603-vision": {
      title: "603视界",
      type: "微信公众号",
      description: "以湖南农业大学603寝室为主要题材的校园微信公众号。",
      facts: [["平台", "微信公众号"], ["主要题材", "湖南农业大学芷兰24栋南603寝室及校园生活"], ["栏目", "603动态、603观察、603游记、603创客、603人物志、603杂笔"]],
      overview: ["603视界是以湖南农业大学芷兰24栋南603寝室及周边校园生活为主要题材的微信公众号。所刊内容包括校园活动报道、工程项目介绍、寝室纪事、游记和人物特写。[1]"],
      sections: [
        { id: "projects", title: "校园活动与项目", paragraphs: [
          "2025年9月16日刊出的《科技之光》报道了一次招新宣讲会后的工程项目展示。11月24日的《Desk Park乐队》记述了该乐队的首次排练。[2][3]",
          "公众号曾刊载KunCode的macOS版上线消息。2026年8月9日刊出的应用说明介绍了603视界的Android应用及其四个AI角色。[4][5]"
        ] },
        { id: "dorm", title: "寝室纪事与游记", paragraphs: [
          "2025年10月的《603能源危机》以新闻体描写寝室用电与电费争论。2026年5月的一篇短讯称，寝室因空调滤网积灰受潮而暂停使用空调，拟安排清洁。[6][7]",
          "《雨夜失糕》叙述了寝室成员筹备生日及取糕的经过。《岳阳楼，望浙江》记载五位成员于2026年3月8日从长沙赴岳阳游览的行程。[8][9]"
        ] }
      ],
      references: [
        "《603视界》公开资料核查报告，公众号简介、栏目与公开文章索引，检索截止2026年9月4日。",
        { title: "603视界《科技之光》原文", url: "https://mp.weixin.qq.com/s/PN3bXURXRR3MiOGZAhOxmg" },
        { title: "603视界《Desk Park乐队》（2025年11月24日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484358&idx=1&sn=0e5dff2c5e1422576e9c315c4bd50538&chksm=c59ec3580a9e8f1181e008b8350b17f8abfeaf15d04b003e201090ecbd13c69e07afbed715d9#rd" },
        "603视界公众号主页截图，置顶文章《603动态｜603官方IDE「KunCode」MacOS版本上线！》。",
        { title: "603视界《603视界AI安卓端应用程序》（2026年8月9日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484595&idx=1&sn=bd45448c67a4b12038c9b169e82a8230&chksm=c5da99e9c37f5fa9531055d3320fb53b71a26d5747258f19e3646c6c9c0f691b8b1b6bd6a7b9#rd" },
        { title: "603视界《603能源危机》（2025年10月13日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484110&idx=1&sn=0f667baea4b84597ba17c37e6f74b445&chksm=c56bb70e534c495f70e147f44513837011812e8cc94ce9b875ce8caaad9cb714a5140447de44#rd" },
        { title: "603视界《603空调异味事件》（2026年5月13日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484523&idx=2&sn=a9787967a502456f1aa5c82fec3bf6cb&chksm=c5ace73e26263bce25613781439c86face7430247ce87ef6cc5c244203a3e2c3c5a70b5df974#rd" },
        { title: "603视界《雨夜失糕》（2026年5月13日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484523&idx=1&sn=0126b6171ac5374c8e13c881c806942f&chksm=c58620d2de8d7ca75a173ef7451bd9072453988c4f344fe860c40a7c92ee8fe2858e1e94dbb1#rd" },
        { title: "603视界《岳阳楼，望浙江》（2026年3月9日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484454&idx=2&sn=475df4f1b0e1b233df4a6daab3285dbf&chksm=c57ba834577feab9417d34fa47d394579d9885ce18863cd67d59ba2c8a01dc11b8102a6abdf5#rd" }
      ],
      categories: ["校园媒体", "鹿群文化"],
      related: ["base-0017", "603-tech-light", "603-lost-cake", "603-yueyang-trip", "desk-park", "kuncode", "603-ai-android", "luchun"],
      revised: "2026年11月26日"
    },
    "kuncode": {
      title: "KunCode",
      type: "集成开发环境",
      description: "由603维护、基于Code - OSS的跨平台开源开发环境。",
      facts: [["维护方", "603"], ["上游项目", "Code - OSS"], ["系统", "Windows、macOS"], ["许可证", "MIT"]],
      overview: ["KunCode是由603维护的开源集成开发环境，基于Code - OSS。它提供代码编辑、项目管理、终端、调试及扩展管理，内置使用本地语料的困困AI助手。[1][2]"],
      sections: [
        { id: "platforms", title: "版本与平台", paragraphs: [
          "2026年9月4日的项目资料记录了V1.0.0的两种安装包，分别面向Windows x64和采用Apple芯片的Mac。2026年10月3日发布的V2.0.0增加了面向Intel处理器的macOS x64安装包，并继续提供Windows x64及macOS arm64安装包。[2][3]"
        ] },
        { id: "features", title: "扩展与助手", paragraphs: [
          "KunCode使用Open VSX作为扩展画廊。项目文档将困困AI描述为依赖本地语料与场景匹配的助手，可在离线状态下提供回应。[1][2]"
        ] },
        { id: "luchun", title: "公开介绍与群内分享", paragraphs: [
          "603视界公众号主页曾置顶KunCode的macOS版本上线文章。2026年10月12日，鹿群聊天记录出现该项目的页面链接。[4][5]"
        ] }
      ],
      references: [
        { title: "KunCode项目说明", url: "https://github.com/Roylyl/KunCode#readme" },
        { title: "KunCode V2.0.0发行说明及安装包", url: "https://github.com/Roylyl/KunCode/releases/tag/V2.0.0" },
        "KunCode V1.0.0项目页面及安装信息，2026年9月4日资料快照。",
        "603视界公众号主页截图所示的KunCode macOS版上线文章。",
        "《鹿群20261126》群聊记录，2026年10月12日。"
      ],
      categories: ["开源软件", "鹿群科技"],
      related: ["603-vision", "603-ai-android", "tech", "deerphotos"],
      externalLinks: [["KunCode项目网站", "https://deer603.github.io/kuncode/"], ["KunCode发行记录", "https://github.com/Roylyl/KunCode/releases"]],
      revised: "2026年11月26日"
    },
    "603-tech-light": {
      title: "科技之光｜603寝室成员在招新宣讲会后展示创新成果",
      type: "603视界报道",
      description: "603视界于2025年9月16日刊发的招新宣讲与工程项目展示报道。",
      facts: [["刊载媒体", "603视界"], ["刊载日期", "2025年9月16日"], ["报道主题", "招新宣讲会后的项目展示"]],
      overview: ["《科技之光｜603寝室成员在招新宣讲会后展示创新成果》是603视界于2025年9月16日刊发的报道，记述六名成员在招新宣讲会之后介绍工程项目的情况。[1]"],
      sections: [
        { id: "projects", title: "报道内容", paragraphs: [
          "据该文，詹绍源介绍了无人机应用构想，罗宇伦和魏子奇介绍了超声波定向扬声器。黎健毓和李彦臻展示的项目为智能植物生长灯，夏炜城介绍的项目为智能泡茶机。[1]"
        ] }
      ],
      references: [
        { title: "603视界《科技之光｜603寝室成员在招新宣讲会后展示创新成果》（2025年9月16日）", url: "https://mp.weixin.qq.com/s/PN3bXURXRR3MiOGZAhOxmg" }
      ],
      categories: ["公众号文章", "鹿群科技"],
      related: ["603-vision", "tech", "kunkun", "luo-yulun", "wei-ziqi", "xia-weicheng", "li-jianyu", "li-yanzhen"],
      revised: "2026年11月26日"
    },
    "603-ai-android": {
      title: "603视界AI安卓端应用程序",
      type: "Android应用",
      description: "以603人物形象为角色来源，提供对话、语录及收藏的Android应用。",
      facts: [["发布方", "603视界"], ["公开报道日期", "2026年8月9日"], ["操作系统", "Android"], ["对话角色", "4个"]],
      overview: ["603视界AI安卓端应用程序是603视界于2026年8月9日介绍的Android应用。应用以603人物为角色来源，提供多角色对话、语录浏览和内容收藏功能，项目页面以“603AI”为名。[1][2]"],
      sections: [
        { id: "features", title: "角色与功能", paragraphs: [
          "应用文章列出的四个角色为汇元AI、朴AI、龟龟AI和Tango AI，话题分别涉及认知、数码系统、机器人以及开发与日常生活。项目页面展示的角色名称为困困、朴AI、龟龟及探戈。[1][2]",
          "文章还介绍流式回复、触觉反馈、分享、认知地图与使用统计。项目页面列明本地保存功能。[1][2]"
        ] },
        { id: "distribution", title: "分发与群内分享", paragraphs: [
          "发布方以APK分发应用，并将系统要求标为Android 8.0或更高版本。2026年10月12日，成员在鹿群分享603AI项目页面。[1][2][3]"
        ] }
      ],
      references: [
        { title: "603视界《603视界AI安卓端应用程序》（2026年8月9日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484595&idx=1&sn=bd45448c67a4b12038c9b169e82a8230&chksm=c5da99e9c37f5fa9531055d3320fb53b71a26d5747258f19e3646c6c9c0f691b8b1b6bd6a7b9#rd" },
        { title: "603AI项目页面及应用说明", url: "https://deer603.github.io/603ai/" },
        "《鹿群20261126》群聊记录，2026年10月12日。"
      ],
      categories: ["鹿群项目", "鹿群科技"],
      related: ["603-vision", "kuncode", "deerphotos", "tech"],
      externalLinks: [],
      revised: "2026年11月26日"
    },
    "desk-park": {
      title: "Desk Park乐队",
      type: "校园乐队",
      description: "据603视界报道，于2025年11月23日首次排练的校园乐队。",
      facts: [["活动场所", "湖南农业大学"], ["首次排练", "2025年11月23日"], ["排练曲目", "《热河》《春风十里》"]],
      overview: ["Desk Park乐队是603视界报道的一支校园乐队。据报道，该乐队于2025年11月23日在湖南农业大学卓越工程师学院排练房首次排练，目的是准备元旦晚会。[1]"],
      sections: [
        { id: "members", title: "排练阵容与曲目", paragraphs: [
          "报道所列排练阵容包括吉他手罗宇伦和唐博釜、贝斯手黎健毓、鼓手李彦臻、键盘手宁玮琦及主唱雷镓镁。排练曲目为《热河》与《春风十里》。[1]"
        ] },
        { id: "performances", title: "相关演出记录", paragraphs: [
          "603视界于2025年10月13日刊出的文章，题为《罗宇伦与宁玮琦破冰演出》。可见的标题记载了两名成员在新生破冰活动中的演出。[2]"
        ] }
      ],
      references: [
        { title: "603视界《Desk Park乐队》（2025年11月24日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484358&idx=1&sn=0e5dff2c5e1422576e9c315c4bd50538&chksm=c59ec3580a9e8f1181e008b8350b17f8abfeaf15d04b003e201090ecbd13c69e07afbed715d9#rd" },
        { title: "603视界《罗宇伦与宁玮琦破冰演出》（2025年10月13日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484110&idx=2&sn=df353c60912ba71944406fe595f6de83&chksm=c5bd0d2468d190aad2da266a249f33c7c1ef8c625199ba104244cfbd285fbade6a796c1c9a2d#rd" }
      ],
      categories: ["校园音乐", "603视界"],
      related: ["luo-yulun", "li-jianyu", "li-yanzhen", "603-vision"],
      revised: "2026年11月26日"
    },
    "603-yueyang-trip": {
      title: "岳阳楼，望浙江",
      type: "603视界游记",
      description: "603视界刊载的游记，记述五名603成员赴岳阳游览的行程。",
      facts: [["刊载媒体", "603视界"], ["刊载日期", "2026年3月9日"], ["出行日期", "2026年3月8日"]],
      overview: ["《岳阳楼，望浙江》是603视界于2026年3月9日刊载的游记，记述黎健毓、魏子奇、夏炜城、罗宇伦和李彦臻前一日前往岳阳的行程。[1]"],
      sections: [
        { id: "route", title: "行程", paragraphs: [
          "据游记，五人乘高铁从长沙南站到岳阳东站，转乘公交前往岳阳楼景区，之后到访汴河街、湖南理工大学和南湖。[1]"
        ] },
        { id: "title", title: "题名相关意象", paragraphs: [
          "文中借景区名称“瞻岳门”中“瞻”与“詹”的同音，提及未参与此次行程的詹绍源。[1]"
        ] }
      ],
      references: [
        { title: "603视界《岳阳楼，望浙江》（2026年3月9日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484454&idx=2&sn=475df4f1b0e1b233df4a6daab3285dbf&chksm=c57ba834577feab9417d34fa47d394579d9885ce18863cd67d59ba2c8a01dc11b8102a6abdf5#rd" }
      ],
      categories: ["公众号文章", "校园生活"],
      related: ["603-vision", "xia-weicheng"],
      revised: "2026年11月26日"
    },
    "603-lost-cake": {
      title: "雨夜失糕",
      type: "603视界纪事",
      description: "603视界刊载的寝室纪事，记述一次生日筹备及预订蛋糕未能取到的经过。",
      facts: [["刊载媒体", "603视界"], ["刊载日期", "2026年5月13日"], ["取糕地点", "湖南农业大学北门外卖架"]],
      overview: ["《雨夜失糕》是603视界于2026年5月13日刊载的寝室纪事，记述603与604寝室成员筹备黎健毓生日期间，预订的蛋糕未能在约定地点取到的经过。[1]"],
      sections: [
        { id: "record", title: "事件经过", paragraphs: [
          "据文章，彭鹏在雨夜前往湖南农业大学北门外卖架取糕，到达时蛋糕已不在原处。蛋糕去向和事后处理在该文中无进一步记载。[1]"
        ] }
      ],
      references: [
        { title: "603视界《雨夜失糕》（2026年5月13日）", url: "http://mp.weixin.qq.com/s?__biz=Mzk2NDAwMTc2Mw==&mid=2247484523&idx=1&sn=0126b6171ac5374c8e13c881c806942f&chksm=c58620d2de8d7ca75a173ef7451bd9072453988c4f344fe860c40a7c92ee8fe2858e1e94dbb1#rd" }
      ],
      categories: ["公众号文章", "校园生活"],
      related: ["603-vision", "peng-peng", "li-jianyu"],
      revised: "2026年11月26日"
    },
    "portrait-generator": {
      title: "人物群像生成器",
      type: "鹿群创作活动",
      description: "鹿群成员以群内角色为素材进行的生成式AI群像创作。",
      facts: [["创作形式", "生成式AI群像"], ["可查实例", "2025年10月23日的《夜巡》构图提示"]],
      overview: ["人物群像生成器指鹿群以成员昵称、动物意象和道具为素材，借助生成式AI构造集体肖像的做法。2025年10月23日的聊天记录保存了以伦勃朗《夜巡》为构图参考的多版文字提示。[1]"],
      sections: [
        { id: "composition", title: "《夜巡》构图实例", paragraphs: [
          "2025年10月23日10:39至10:50，群内先后出现三版群像提示。各版沿用《夜巡》的群像构图，并调整角色的位置、服饰和道具。部分角色以动物形象呈现。[1]"
        ] },
        { id: "software", title: "相关图像生成项目", paragraphs: [
          "2026年10月27日，Roylyl在群内分享DeerPhotos项目仓库和V3.0.0发行页。该项目使用预先整理的角色参考资料生成聚餐、旅行等场景图像。[1][2]"
        ] }
      ],
      references: [
        "《鹿群20261126》群聊记录，2025年10月23日和2026年10月27日。",
        { title: "DeerPhotos项目说明", url: "https://github.com/Roylyl/DeerPhotos#readme" }
      ],
      categories: ["AI图像语境", "鹿群文化"],
      related: ["deerphotos", "history", "luchun"],
      revised: "2026年11月26日"
    },
    "deerphotos": {
      title: "DeerPhotos",
      type: "鹿群项目",
      description: "Roylyl维护的图像生成代理技能，以鹿群角色参考图和场景指令为输入。",
      facts: [["中文名", "鹿图"], ["维护者", "Roylyl"], ["适用环境", "支持生图工具的代理环境"], ["记录版本", "3.0.0"], ["许可证", "MIT"]],
      overview: ["DeerPhotos（中文名鹿图）是Roylyl维护的生成式人工智能图像技能，面向鹿群的角色群像与场景创作。技能把姓名和别名映射到固定角色，由宿主的图像生成工具处理参考图及构图要求。[1]"],
      sections: [
        { id: "design", title: "角色资料与生成流程", paragraphs: [
          "项目为角色提供标准图、全身多角度参考及人物设定。收到人物和场景指令后，技能选择对应的参考文件并交由宿主工具生成图像。后续指令可沿用出场角色，调整地点、服装、姿势或构图。[1]",
          "生成结果附带场景记录，记录出场角色、参考文件、提示词和技能版本。[1]"
        ] },
        { id: "history", title: "版本记录与群内分享", paragraphs: [
          "3.0.0的项目说明列出11位角色和83个别名，并记载该版新增了以白鹅为形象的角色戴而。[1][2]",
          "2026年10月27日18:07，Roylyl在鹿群分享项目仓库链接。同日19:02，群内出现V3.0.0发行页链接。[3]"
        ] },
        { id: "license", title: "许可证", paragraphs: [
          "项目仓库以MIT许可证发布，许可证文件的版权署名为Roylyl。[4]"
        ] }
      ],
      references: [
        { title: "DeerPhotos项目说明", url: "https://github.com/Roylyl/DeerPhotos#readme" },
        { title: "DeerPhotos V3.0.0发行页", url: "https://github.com/Roylyl/DeerPhotos/releases/tag/V3.0.0" },
        "《鹿群20261126》群聊记录，2026年10月27日18:07及19:02。",
        { title: "DeerPhotos许可证", url: "https://github.com/Roylyl/DeerPhotos/blob/main/LICENSE" }
      ],
      categories: ["鹿群项目", "生成式AI"],
      related: ["portrait-generator", "luo-yulun", "luchun", "history"],
      externalLinks: [["DeerPhotos源代码仓库", "https://github.com/Roylyl/DeerPhotos"]],
      revised: "2026年11月26日"
    },
    "kun-coach": {
      title: "困教练",
      type: "鹿群称呼",
      description: "詹绍源在鹿群使用的自称，常见于带有战术安排语气的发言。",
      facts: [["使用者", "詹绍源"], ["档案用例", "2026年3月至4月"]],
      overview: ["困教练是詹绍源在鹿群聊天中使用的自称，由其群内昵称“困困”和“教练”一词组成。现有用例中，这一称呼有时与安排战术的说法并用。[1]"],
      sections: [
        { id: "usage", title: "群内用法", paragraphs: [
          "2026年3月15日23:50，詹绍源发出“困教练给你们安排战术”。4月2日10:17，他在另一段群聊中直接写道“我是困教练”。[1]"
        ] }
      ],
      references: ["《鹿群20261126》群聊档案，2026年3月15日23:50:29、4月2日10:17:38。"],
      categories: ["鹿群术语", "群聊语言"],
      related: ["kunkun", "short-messages", "luchun"],
      revised: "2026年11月26日"
    },
    "particle": {
      title: "对齐一下颗粒度",
      type: "鹿群用语",
      description: "鹿群以沟通用语提示统一讨论的细节层次，也用作简短回应。",
      facts: [["主要形式", "对齐一下颗粒度、对齐颗粒度"], ["档案用例", "2026年7月至11月"]],
      overview: ["对齐一下颗粒度是鹿群使用的沟通用语。“颗粒度”在这一说法中指讨论或描述的细节层次，“对齐”指使参与者采用相近的尺度。档案亦记录了它作为独立短句和戏仿回应的用法。[1]"],
      sections: [
        { id: "usage", title: "群内用法", paragraphs: [
          "2026年7月30日14:11，群内转发了一段标题含“对齐颗粒度”的电影相关内容。詹绍源接着发出“🦌群现在要对齐一下颗粒度”，次日又用“我们对齐一下颗粒度”。[1]",
          "11月4日有成员单独发出“对齐一下颗粒度”，其后收到握手表情回应。11月19日的群聊中，另一条消息将“对齐颗粒度”与“战后复盘”并用。[1]"
        ] }
      ],
      references: ["《鹿群20261126》群聊档案，2026年7月30日14:11至14:13、7月31日00:22、11月4日19:20、11月19日23:21。"],
      categories: ["鹿群术语", "群聊语言"],
      related: ["kunkun", "high-cognition", "short-messages"],
      revised: "2026年11月26日"
    },
    "frame-study": {
      title: "逐帧学习",
      type: "鹿群用语",
      description: "以视频逐帧观看的说法表示仔细观察和学习的群聊用语。",
      facts: [["档案用例", "2026年3月17日及8月3日"], ["见载使用者", "詹绍源"]],
      overview: ["逐帧学习是鹿群中用来表示仔细观察和学习的说法。用语借用了视频播放中逐帧观看的表达。詹绍源曾在对成员发言和面向群体的号召中使用它。[1]"],
      sections: [
        { id: "usage", title: "群内用例", paragraphs: [
          "2026年3月17日14:40，詹绍源发出“你魏逐帧学习”。8月3日18:07，他改用“🦌群一起逐帧学习”，将称呼对象换成整个鹿群。[1]"
        ] }
      ],
      references: ["《鹿群20261126》群聊档案，2026年3月17日14:40:03、8月3日18:07:38。"],
      categories: ["鹿群术语", "群聊语言"],
      related: ["kunkun", "high-cognition", "short-messages"],
      revised: "2026年11月26日"
    },
    "check-in-kids": {
      title: "打卡了孩子们",
      type: "鹿群提醒语",
      description: "彭鹏在2026年1月至2月用于晚间打卡提醒的固定说法。",
      facts: [["使用者", "彭鹏"], ["用例时段", "2026年1月13日至2月3日"], ["档案匹配", "12条"]],
      overview: ["打卡了孩子们是彭鹏在鹿群发出的固定提醒语。在现有聊天档案中，该句由同一发送者在12个不同的日期发出，形式均为单独一条文字消息。[1]"],
      sections: [
        { id: "records", title: "档案记录", paragraphs: [
          "最早一条见于2026年1月13日22:03，此后1月17日、18日及19日连续三天均有记录。该时段最后一条为2月3日22:37的消息。[1]"
        ] }
      ],
      references: ["《鹿群20261126》群聊档案，2026年1月13日22:03:53至2月3日22:37:20的匹配文本。"],
      categories: ["鹿群术语", "群聊语言"],
      related: ["peng-peng", "short-messages", "history"],
      revised: "2026年11月26日"
    },
    "steady": {
      title: "稳了",
      type: "鹿群用语",
      description: "在鹿群用于表示对结果的把握或作为简短回应的口语。",
      facts: [],
      overview: ["稳了是鹿群聊天中的常见简短发言，用于表示对结果的把握。档案中既有直接说明对象的“考试稳了”，也有单独发出“稳了”的用例。[1]"],
      sections: [
        { id: "usage", title: "群内用法", paragraphs: [
          "2025年6月18日的考试讨论中，李彦臻先说“十有八九稳了”，随后发出“考试稳了”，表达对考试结果的预期。2026年8月6日，有成员在短视频讨论中仅回复“稳了”。[1]"
        ] }
      ],
      references: ["《鹿群20261126》群聊档案，2025年6月18日10:59至11:00、2026年8月6日20:29。"],
      categories: ["鹿群术语", "群聊语言"],
      related: ["li-yanzhen", "short-messages", "nb-context"],
      revised: "2026年11月26日"
    },
    "six-six-six": {
      title: "666",
      type: "鹿群用语",
      description: "鹿群用于短评、接话和表达反应的数字写法。",
      facts: [["档案匹配", "150条独立消息"], ["统计范围", "2026年11月26日导出中的文字及引用回复"]],
      overview: ["666在鹿群聊天中常单独成句，出现在成员分享消息之后，可作短评、接话或表示赞叹。语气随讨论对象和前后发言而变化。[1]"],
      sections: [
        { id: "usage", title: "群内用法", paragraphs: [
          "2025年9月2日，有成员提到可以把项目空间的桌子搬回寝室，随后有人发出“666”。10月13日，一条“666”出现在两名成员谈论分数的消息之间。[1]",
          "以2026年11月26日版档案的文字消息及引用回复为范围，去除首尾空白后，消息正文恰为“666”的记录有150条。[1]"
        ] }
      ],
      references: ["《鹿群20261126》群聊档案。示例见2025年9月2日18:11及10月13日01:25至01:32。"],
      categories: ["鹿群术语", "群聊语言"],
      related: ["nb-context", "steady", "short-messages"],
      revised: "2026年11月26日"
    },
    "nb-context": {
      title: "nb",
      type: "鹿群用语",
      description: "鹿群用于表示赞叹或作即时回应的字母缩写。",
      facts: [["档案匹配", "191条独立消息"], ["统计范围", "2026年11月26日导出中的文字及引用回复"]],
      overview: ["nb是鹿群聊天中用于表示赞叹或作即时回应的字母缩写。现有档案中，它多以一条独立的短消息出现。[1]"],
      sections: [
        { id: "usage", title: "群内用法", paragraphs: [
          "2025年6月14日，群友谈及交完论文后的时间安排，随后一条消息回复“nb”。6月18日，谈到考试答题情况时也出现同样的独立回复。[1]",
          "以2026年11月26日版档案的文字消息及引用回复为范围，去除首尾空白并忽略大小写后，消息正文恰为“nb”的记录有191条。[1]"
        ] }
      ],
      references: ["《鹿群20261126》群聊档案。示例见2025年6月14日21:45及6月18日10:38。"],
      categories: ["鹿群术语", "群聊语言"],
      related: ["six-six-six", "steady", "short-messages"],
      revised: "2026年11月26日"
    },
    "61": {
      title: "61",
      type: "鹿群用语",
      description: "群内既用于指称某人，也见于普通数字计数的写法。",
      facts: [],
      overview: ["61在鹿群聊天中既可作为数字，也可用作对某人的指称。两种用法可由句子中的搭配和所讨论的内容区分。[1]"],
      sections: [
        { id: "usage", title: "群内用法", paragraphs: [
          "2025年6月8日，有成员发出“截图发给61了”，“61”在句中指收取截图的人。2026年11月21日的团建讨论中，该写法也用来指称一名参与者。[1]",
          "在2025年7月23日的一条消息“群人数刚好是61”中，“61”直接表示人数。[1]"
        ] }
      ],
      references: ["《鹿群20261126》群聊档案，2025年6月8日20:07、7月23日18:10、2026年11月21日16:25。"],
      categories: ["鹿群术语", "群聊语言"],
      related: ["short-messages", "he-meaning", "luchun"],
      revised: "2026年11月26日"
    },
    "base-0017": {
      title: "603寝室",
      type: "鹿群场所",
      description: "湖南农业大学芷兰24栋南603，603视界所刊多篇校园生活记录的主要场景。",
      facts: [["地点", "湖南农业大学芷兰24栋南603"], ["相关公众号", "603视界"]],
      overview: ["603寝室是湖南农业大学芷兰24栋南603寝室。鹿群聊天中常简写为“603”。寝室及其周边生活是微信公众号603视界的主要题材之一。[1][2]"],
      sections: [
        { id: "publications", title: "刊文记录", paragraphs: [
          "603视界的刊载记录包括《雨夜失糕》所述的生日筹备，以及招新宣讲会后由数名603成员介绍工程项目的报道。[1][3]"
        ] },
        { id: "chat", title: "群聊中的指称", paragraphs: [
          "2026年10月31日00:03，黎健毓在群中发出“等下来603吃蛋糕”，将寝室号用作集合地点的简写。[2]"
        ] }
      ],
      references: [
        "《603视界》公开资料核查报告，公众号简介及公开刊文题材，检索截止2026年9月4日。",
        "《鹿群20261126》群聊档案，2026年10月31日00:03:46。",
        { title: "603视界《科技之光｜603寝室成员在招新宣讲会后展示创新成果》", url: "https://mp.weixin.qq.com/s/PN3bXURXRR3MiOGZAhOxmg" }
      ],
      categories: ["校园生活", "603视界"],
      related: ["603-vision", "603-lost-cake", "603-tech-light", "luchun"],
      revised: "2026年11月26日"
    },
    "deer-taste-test": {
      title: "鹿味测试",
      type: "鹿群网页项目",
      description: "鹿群对网页《你是个鹿嘞》中相似度排行功能的称呼。",
      facts: [["网页名称", "你是个鹿嘞"], ["群内分享记录", "2026年10月16日"]],
      overview: ["鹿味测试是鹿群成员对网页《你是个鹿嘞》中相似度排行功能的称呼。页面说明列出照片和摄像头两种输入方式，并称画面在本机处理。[1][2]"],
      sections: [
        { id: "history", title: "群内分享", paragraphs: [
          "2026年10月16日10:27，Roylyl在群内发送《你是个鹿嘞》的网页地址，13秒后又发送“先做鹿味测试”。[1]"
        ] }
      ],
      references: [
        "《鹿群20261126》群聊档案，2026年10月16日10:27:36、10:27:49。",
        { title: "你是个鹿嘞", url: "https://deer603.github.io/urdeer/" }
      ],
      categories: ["鹿群术语", "鹿群项目"],
      related: ["history", "luchun", "portrait-generator", "deerphotos"],
      revised: "2026年11月26日"
    }
  };

  const categoryTargets = {
    "群史": "history",
    "鹿群文化": "luchun",
    "鹿群术语": "short-messages",
    "群聊语言": "short-messages",
    "鹿群科技": "tech",
    "鹿群项目": "tech",
    "公众号文章": "603-vision",
    "603视界": "603-vision"
  };

  window.WEIJIBA_ENTRY_CATALOG = entries;
  window.WEIJIBA_ENTRY_TERMS = Object.entries(entries).map(([slug, entry]) => [entry.title, slug]);

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const iconPaths = {
    language: '<path d="M3 5h12M9 2v3m-4 3c1 4 4 7 8 9M13 5c-1 6-4 10-10 13m11 3 4-10 4 10m-6-4h4"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>'
  };
  const icon = name => '<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + iconPaths[name] + '</svg>';
  const entryLink = slug => window.WEIJIBA_ENTRY_URL?.(slug) || 'article.html?entry=' + encodeURIComponent(slug);
  const siteArticlesUrl = entryLink("luchun").replace(/[^/]+\/$/, "index.html#articles");

  const formatProse = value => String(value)
    .replace(/(?<=[\p{Script=Han}]) +(?=[A-Za-z0-9/])/gu, "")
    .replace(/(?<=[A-Za-z0-9/]) +(?=[\p{Script=Han}])/gu, "")
    .replace(/(?<=[A-Za-z0-9]) +\/[ ]*(?=[A-Za-z0-9])|(?<=[A-Za-z0-9])\/ +(?=[A-Za-z0-9])/g, "/");

  // 同一份渲染逻辑供静态生成器和旧地址入口使用。
  function renderEntry(slug) {
    const entry = entries[slug];
    if (!entry) return null;

    const prose = value => escapeHtml(formatProse(value)).replace(/\[(\d+)\]/g, (token, index) =>
      entry.references[Number(index) - 1] ? `<sup class="citation"><a href="#ref-${index}" aria-label="参考资料${index}">${token}</a></sup>` : token);
    const paragraphs = values => values.map(value => `<p>${prose(value)}</p>`).join("");
    const [lead, ...intro] = entry.overview;
    const titles = [entry.title, window.WEIJIBA_ENTRY_PATHS[slug]].filter(Boolean);
    const openingTitle = titles.flatMap(title => [title, "《" + title + "》"]).find(title => lead.startsWith(title));
    const leadHtml = openingTitle ? "<b>" + prose(openingTitle) + "</b>" + prose(lead.slice(openingTitle.length)) : prose(lead);
    const overview = "<p>" + leadHtml + "</p>" + paragraphs(intro);
    const facts = entry.facts.map(([label, value]) => `<tr><th scope="row">${prose(label)}</th><td>${prose(value)}</td></tr>`).join("");
    const infobox = facts ? `<aside class="infobox" aria-label="${escapeHtml(entry.title)}概要"><div class="infobox-title">${escapeHtml(entry.title)}</div><div class="infobox-subtitle">${prose(entry.type)}</div><table><tbody>${facts}</tbody></table></aside>` : "";
    const notice = entry.notice ? `<div class="article-notice" role="note"><span class="notice-icon" aria-hidden="true">${icon("info")}</span><p>${prose(entry.notice)}</p></div>` : "";

    const outboundLink = (label, url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    const entryAnchor = target => `<a href="${entryLink(target)}" target="_blank" rel="noopener">${escapeHtml(entries[target].title)}</a>`;
    const list = (items, tag = "ul") => `<${tag}${tag === "ul" ? ' class="see-also-list"' : ""}>${items.join("")}</${tag}>`;
    const dataTable = ({ caption, headers, rows }) => {
      const columns = headers.map(header => "<th scope=\"col\">" + prose(header) + "</th>").join("");
      const body = rows.map(([label, ...values]) => "<tr><th scope=\"row\">" + prose(label) + "</th>" +
        values.map(value => "<td>" + prose(value) + "</td>").join("") + "</tr>").join("");
      return "<table class=\"article-data-table\"><caption>" + prose(caption) + "</caption><thead><tr>" + columns +
        "</tr></thead><tbody>" + body + "</tbody></table>";
    };
    const sections = entry.sections.map(({ id, title, paragraphs: values, items, table }) => {
      const itemList = items ? "<ul>" + items.map(item => "<li>" + prose(item) + "</li>").join("") + "</ul>" : "";
      return { id, title, body: paragraphs(values) + itemList + (table ? dataTable(table) : "") };
    });

    const related = entry.related;
    if (related.length) sections.push({ id: "related", title: "参见", body: list(related.map(target => `<li>${entryAnchor(target)}</li>`)) });

    const references = entry.references.map((reference, index) => {
      const content = typeof reference === "string" ? prose(reference) : outboundLink(reference.title, reference.url);
      return `<li id="ref-${index + 1}">${content}</li>`;
    });
    if (references.length) sections.push({ id: "references", title: "参考资料", body: list(references, "ol") });
    const externalLinks = (entry.externalLinks || []).map(([title, url]) => `<li>${outboundLink(title, url)}</li>`);
    if (externalLinks.length) sections.push({ id: "external-links", title: "外部链接", body: list(externalLinks) });

    const sectionHtml = sections.map(({ id, title, body }) => `<section id="${escapeHtml(id)}" class="article-section${id === "references" ? " references" : ""}"><h2><span>${prose(title)}</span></h2>${body}</section>`).join("");
    const categories = entry.categories.map(category => {
      const target = categoryTargets[category];
      const href = target && target !== slug ? entryLink(target) : siteArticlesUrl;
      return `<a href="${href}">${prose(category)}</a>`;
    }).join("");
    const revised = entry.revised ? `<p class="last-edited" id="history-note">本页面修订于${escapeHtml(entry.revised)}。</p>` : "";

    const articleHtml = `
    <header class="article-heading">
      <div class="title-line">
        <h1>${escapeHtml(entry.title)}</h1>
        <button class="language-button" type="button" id="article-language-button" aria-expanded="false" aria-controls="article-language-menu">${icon("language")} 2种语言</button>
        <div class="language-menu" id="article-language-menu" hidden><button type="button" data-language="简体中文">简体中文</button><button type="button" data-language="繁體中文">繁體中文</button></div>
      </div>
      <div class="article-toolbar">
        <div class="subject-tabs"><a class="active" href="#top">条目</a><button type="button" data-demo="讨论页">讨论</button></div>
        <div class="variant-control"><button type="button" data-demo="字词转换">不转换${icon("chevron")}</button></div>
        <div class="view-tabs"><a class="active" href="#top">阅读</a><button type="button" data-demo="编辑">编辑</button><button type="button" data-demo="查看历史">查看历史</button><button type="button" data-demo="工具">工具${icon("chevron")}</button></div>
      </div>
    </header>
    <p class="article-tagline">魏鸡百科，困困的百科全书</p>
    ${notice}
    ${infobox}
    ${overview}
    ${sectionHtml}
    <div class="categories"><span>分类：</span>${categories}</div>
    ${revised}`;

    const tocHtml = '<a class="is-active" href="#top">序言</a>' + sections.map(({ id, title }, index) =>
      `<a href="#${escapeHtml(id)}"><span>${index + 1}</span> ${prose(title)}</a>`).join("");

    return { title: entry.title, description: entry.title + "—" + formatProse(entry.description), articleHtml, tocHtml };
  }

  window.WEIJIBA_RENDER_ENTRY = renderEntry;

  const article = document.querySelector(".article-main article");
  const toc = document.querySelector("#toc");
  if (!article || !toc) return;
  const querySlug = new URLSearchParams(window.location.search).get("entry");
  const slug = querySlug || window.WEIJIBA_ENTRY_FROM_PATH?.(window.location.pathname) || "kunkun";
  const canonical = window.WEIJIBA_ENTRY_URL?.(slug);
  if (canonical && /\/article\.html$/.test(window.location.pathname)) {
    // 导航到静态页，避免只改URL后相对资源解析到词条子目录。
    const hash = entries[slug] ? window.location.hash || "" : "";
    window.location.replace(canonical + hash);
    return;
  }
  const rendered = renderEntry(slug);
  if (!rendered) {
    document.title = "未找到词条—魏鸡百科";
    article.innerHTML = '<header class="article-heading"><h1>未找到词条</h1></header><p>这个词条暂时不存在。你可以返回<a href="' + siteArticlesUrl + '">魏鸡百科首页</a>继续浏览。</p>';
    toc.innerHTML = '<a href="#top">未找到词条</a>';
    return;
  }
  document.title = rendered.title + "—魏鸡百科，困困的百科全书";
  document.querySelector('meta[name="description"]')?.setAttribute("content", rendered.description);
  article.innerHTML = rendered.articleHtml;
  toc.innerHTML = rendered.tocHtml;
  window.WEIJIBA_NORMALIZE_ENTRY_LINKS?.();
  // 旧入口在正文生成后定位章节；普通静态词条交给浏览器恢复滚动。
  if (window.location.hash) {
    try { document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView(); } catch (_) {}
  }
})();
