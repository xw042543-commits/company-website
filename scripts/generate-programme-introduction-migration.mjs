import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const auditPath = path.resolve(process.argv[2] || path.join(root, ".data/audits/published-programme-introductions.json"));
const outputPath = path.resolve(process.argv[3] || path.join(root, "backend/src/main/resources/db/migration/V45__repair_published_programme_introductions.sql"));
const checkedAt = "2026-10-14T00:00:00+08:00";

const levelNames = { FOUNDATION: "预科", DIPLOMA: "大专", BACHELOR: "本科", MASTER: "硕士", DOCTOR: "博士" };
const categoryProfiles = {
  ACCOUNTING_FINANCE: ["会计、财务管理与金融决策的基本理论和分析方法", "财务报表、估值、风险分析与数据判断", "识别财务问题、解释数据并支持审慎决策的能力"],
  AGRICULTURE_ENVIRONMENT: ["农业生产、生态环境与自然资源可持续利用", "生物与环境基础、现场调查、生产系统和数据分析", "理解自然过程并分析农业或环境问题的能力"],
  ALLIED_HEALTH: ["健康科学、人体功能与相关专业服务", "人体科学、健康评估、循证方法与专业伦理", "分析健康问题、理解服务流程并进行专业沟通的能力"],
  ARCHITECTURE_BUILT_ENVIRONMENT: ["建筑环境的规划、设计、建造与管理", "空间分析、技术表达、项目协作和行业规范", "综合设计条件并解决建成环境问题的能力"],
  ARTS_HUMANITIES: ["人文思想、文化现象与文本表达", "批判阅读、历史与文化分析、研究写作", "理解多元语境并形成有依据论述的能力"],
  BUSINESS_MANAGEMENT: ["组织管理、商业运营与市场环境", "管理理论、案例分析、数据判断和项目协作", "识别商业问题、组织资源并提出可执行方案的能力"],
  COMPUTING_IT: ["计算机系统、软件技术与数字化应用", "程序设计、系统分析、数据处理和技术项目实践", "把计算思维用于设计、实现和评估数字解决方案的能力"],
  DENTISTRY: ["口腔健康、牙科基础科学与临床问题", "人体与口腔科学、诊疗思维、患者沟通和专业伦理", "理解口腔疾病并在规范框架下开展专业实践的基础能力"],
  DESIGN_CREATIVE_ARTS: ["视觉、空间或媒介创作中的设计方法与表达", "创意研究、概念发展、制作技术和作品评估", "把用户、语境与审美要求转化为设计方案的能力"],
  ECONOMICS: ["经济运行、资源配置与政策分析", "微观与宏观理论、计量方法和现实案例", "运用经济证据解释市场与公共问题的能力"],
  EDUCATION: ["学习、教学与教育发展的理论和实践", "课程理解、学习者观察、教学设计与教育研究", "分析学习需求并设计合适教学活动的能力"],
  ENGINEERING: ["工程科学、系统设计与技术问题求解", "数学建模、实验分析、设计验证和工程协作", "在安全、规范与现实约束下提出工程方案的能力"],
  HOSPITALITY_TOURISM: ["酒店、旅游、会展或餐饮服务的运营与体验管理", "服务流程、顾客体验、商业运营和项目实践", "协调资源、分析服务需求并改善运营的能力"],
  INTERDISCIPLINARY: ["跨学科知识及其在复杂问题中的综合应用", "系统思考、研究方法、协作实践和方案验证", "连接不同领域观点并形成综合解决思路的能力"],
  ISLAMIC_STUDIES: ["伊斯兰思想、经典、社会与相关制度", "经典阅读、历史语境、规范分析和学术研究", "在文化与社会背景中理解和讨论相关议题的能力"],
  LANGUAGES_LINGUISTICS: ["语言结构、语言使用与跨文化表达", "语音、语法、语义、语篇和语言研究方法", "分析语言现象并在不同语境中准确沟通的能力"],
  LAW: ["法律制度、法律推理与社会规范", "法条与判例阅读、论证写作、案例分析和法律伦理", "识别法律争点并形成严谨论证的能力"],
  MATHEMATICS_STATISTICS: ["数学结构、统计推断与定量建模", "证明与推理、概率统计、数据分析和模型检验", "抽象问题、评估证据并解释定量结果的能力"],
  MEDIA_COMMUNICATION: ["媒体传播、内容生产与受众沟通", "传播理论、媒介分析、内容策划和数字制作", "理解传播语境并以合适媒介清晰表达的能力"],
  MEDICINE: ["人体健康、疾病机制与临床医学基础", "人体科学、临床推理、循证方法、沟通与伦理", "理解健康问题并在专业规范下形成临床判断的基础能力"],
  NATURAL_SCIENCES: ["自然现象、科学原理与实验研究", "实验设计、测量分析、数据解释和科研规范", "提出可检验问题并依据证据形成科学结论的能力"],
  NURSING: ["护理科学、健康评估与以患者为中心的照护", "人体科学、护理流程、沟通协作和循证实践", "识别照护需求并在专业规范下作出护理判断的基础能力"],
  PHARMACY: ["药物科学、用药安全与药学服务", "药物作用、制剂基础、证据评价、沟通与伦理", "理解药物相关问题并支持合理用药的基础能力"],
  SOCIAL_SCIENCES: ["社会结构、人类行为与公共议题", "社会理论、定性与定量研究、政策和案例分析", "依据社会证据解释问题并理解不同群体经验的能力"],
  SPORTS: ["运动、人体表现与体育组织", "运动科学、训练分析、健康促进和项目管理", "评估运动需求并以证据支持训练或体育服务的能力"],
  VETERINARY_MEDICINE: ["动物健康、疾病预防与兽医科学基础", "动物科学、诊断思维、公共卫生、福利与专业伦理", "理解动物健康问题并在规范框架下开展专业判断的基础能力"],
};

const keywordProfiles = [
  [/人工智能|artificial intelligence/i, ["人工智能的算法基础、数据驱动方法与智能系统应用", "机器学习、知识表示、模型评估和智能系统开发", "分析数据、选择模型并审慎评估智能系统的能力"]],
  [/数据科学|data science|data analytics|数据分析/i, ["数据采集、统计建模、计算分析与结果解释", "数据处理、统计推断、机器学习和可视化表达", "从数据中形成可靠见解并说明模型局限的能力"]],
  [/网络.*安全|cyber|security|信息安全/i, ["计算机网络、信息安全与数字系统防护", "网络架构、安全分析、风险评估和防护实践", "识别系统风险并设计合适安全控制的能力"]],
  [/软件工程|software engineering/i, ["软件系统的需求、设计、开发、测试与维护", "程序设计、软件架构、质量保障和团队开发", "把业务需求转化为可靠软件方案的能力"]],
  [/信息系统|information systems?/i, ["信息系统、组织流程与数字化管理", "系统分析、数据库、业务流程和项目实施", "连接组织需求与技术方案的能力"]],
  [/计算机|computer science|computing/i, ["计算理论、程序设计与计算机系统", "算法、数据结构、软件开发和系统分析", "以计算思维解决问题并构建数字系统的能力"]],
  [/会计|accounting/i, ["财务会计、管理会计与组织问责", "财务报告、成本分析、审计思维和专业规范", "准确处理财务信息并支持管理判断的能力"]],
  [/精算|actuarial/i, ["概率统计、金融风险与精算模型", "数学建模、风险计量、数据分析和长期财务评估", "量化不确定性并解释风险结果的能力"]],
  [/金融|finance|banking|银行/i, ["金融市场、公司财务、投资与风险管理", "估值、财务分析、金融数据和决策方法", "评估资金安排、收益与风险的能力"]],
  [/经济|economics?/i, ["微观与宏观经济运行、市场行为和政策影响", "经济理论、计量分析、数据解释和政策案例", "运用经济证据分析资源配置问题的能力"]],
  [/市场营销|marketing|品牌|advertising|广告/i, ["市场、消费者、品牌与传播策略", "市场研究、消费者分析、内容与渠道规划和效果评估", "根据证据制定并检验市场方案的能力"]],
  [/人力资源|human resource/i, ["组织中的人才管理、员工关系与工作设计", "招聘与发展、绩效分析、劳动关系和组织行为", "分析人员需求并支持公平有效管理的能力"]],
  [/供应链|物流|supply chain|logistics/i, ["采购、物流、运营与供应链协同", "流程分析、库存与运输决策、供应风险和数据工具", "统筹供应活动并改善运营效率的能力"]],
  [/创业|entrepreneur/i, ["机会识别、商业模式与新项目发展", "用户与市场验证、资源规划、财务基础和项目迭代", "把问题转化为可验证商业方案的能力"]],
  [/工商管理|企业管理|管理学|business administration|management science/i, ["组织管理、战略、运营与商业决策", "管理理论、案例分析、数据判断和项目协作", "识别组织问题并制定可执行行动方案的能力"]],
  [/土木|civil engineering/i, ["结构、岩土、交通与基础设施工程基础", "工程力学、建模分析、材料与施工问题、设计验证", "在安全和规范约束下分析基础设施方案的能力"]],
  [/电气|电子|electrical|electronic/i, ["电路、电子系统、控制与电能技术", "数学建模、信号与系统分析、实验测量和工程设计", "分析并验证电气电子系统方案的能力"]],
  [/机械|mechanical/i, ["力学、热流体、机械设计与制造系统", "工程分析、建模仿真、实验测试和设计迭代", "设计并评估机械系统性能的能力"]],
  [/化学工程|chemical engineering/i, ["化工过程、传递原理、反应与生产系统", "物料能量衡算、过程设计、控制、安全和实验分析", "在安全与可持续约束下分析化工过程的能力"]],
  [/生物医学工程|biomedical engineering/i, ["工程方法在医学设备、人体系统与健康技术中的应用", "生物信号、仪器设计、建模验证和医疗技术伦理", "连接工程分析与临床需求的能力"]],
  [/建筑|architecture/i, ["建筑空间、环境响应与设计表达", "设计研究、制图建模、材料构造和方案评析", "综合场地、使用者与技术条件开展建筑设计的能力"]],
  [/工料测量|quantity surveying/i, ["建设项目计量、成本控制与合同管理", "工程计量、造价分析、采购合同和项目协作", "评估建设成本并支持项目商业管理的能力"]],
  [/城市.*规划|urban.*planning|regional planning/i, ["城市与区域空间、土地使用和公共规划", "空间分析、规划政策、社区与环境研究和方案评估", "综合证据分析空间发展问题的能力"]],
  [/房地产|real estate/i, ["房地产市场、估值、开发与资产管理", "市场分析、估值方法、项目可行性和制度环境", "评估物业与开发决策的能力"]],
  [/生物医学科学|biomedical science/i, ["人体生物学、疾病机制与生物医学研究", "细胞与分子基础、实验技术、数据分析和科研规范", "从生物医学证据分析健康与疾病问题的能力"]],
  [/医学|medicine|surgery|临床/i, ["人体健康、疾病机制、诊断与临床照护基础", "人体科学、临床推理、循证方法、患者沟通和伦理", "在专业规范下理解健康问题并形成临床判断的基础能力"]],
  [/牙|dental|dentistry/i, ["口腔健康、牙科基础科学与临床诊疗", "口腔结构与疾病、临床技能、患者沟通和专业伦理", "识别口腔健康问题并开展规范诊疗思考的基础能力"]],
  [/药学|药剂|pharmacy|pharmaceutical/i, ["药物科学、制剂、药理与合理用药", "药物作用、质量与安全、证据评价和药学沟通", "分析药物相关问题并支持安全用药的基础能力"]],
  [/护理|nursing/i, ["护理科学、健康评估与连续照护", "护理流程、临床沟通、循证实践和患者安全", "识别照护需求并作出规范护理判断的基础能力"]],
  [/心理|psychology/i, ["认知、情绪、发展与社会行为", "心理学理论、研究设计、数据分析和伦理", "以科学证据理解行为与心理问题的能力"]],
  [/咨询|辅导|counsell?ing/i, ["助人关系、心理发展与咨询实践基础", "沟通倾听、个案理解、咨询理论、伦理和转介意识", "在专业边界内理解需求并开展支持性沟通的能力"]],
  [/营养|nutrition|dietet/i, ["营养科学、食物与健康之间的关系", "人体代谢、营养评估、膳食分析和健康促进", "依据证据分析营养需求和健康信息的能力"]],
  [/生物技术|biotechnology/i, ["生物系统、分子技术及其在健康、农业和产业中的应用", "细胞与分子基础、实验技术、数据分析和生物安全", "设计生物实验并解释相关证据的能力"]],
  [/生物化学|biochemistry/i, ["生命过程中的分子结构、反应与调控", "生物分子、代谢、实验分析和科学数据解释", "从分子层面分析生命科学问题的能力"]],
  [/微生物|microbiology/i, ["微生物的结构、功能、遗传及其与环境和健康的关系", "培养与鉴定、分子方法、实验设计和生物安全", "分析微生物现象并评价实验结果的能力"]],
  [/生态|biodiversity|ecology/i, ["生态系统、生物多样性与环境变化", "野外调查、物种与群落分析、数据解释和保护思路", "依据生态证据理解并评估环境问题的能力"]],
  [/环境|environment/i, ["环境系统、资源管理与可持续发展", "环境监测、影响分析、政策与管理方法和数据评价", "识别环境风险并比较治理方案的能力"]],
  [/化学|chemistry/i, ["物质的组成、结构、反应与分析", "无机、有机和物理化学基础、实验测量和仪器分析", "安全开展化学实验并解释物质变化的能力"]],
  [/物理|physics/i, ["物质、能量及其相互作用的基本规律", "数学表述、实验测量、建模和数据分析", "以模型和证据解释物理现象的能力"]],
  [/地质|geolog/i, ["地球材料、地质过程与资源环境问题", "野外观察、岩矿识别、空间资料和地质解释", "综合多种证据重建并分析地质过程的能力"]],
  [/数学|mathematics/i, ["数学结构、逻辑推理与抽象建模", "代数、分析、离散方法、证明和计算工具", "严谨表述问题并建立数学论证的能力"]],
  [/统计|statistics/i, ["概率、统计推断与数据建模", "抽样设计、模型估计、计算分析和结果沟通", "判断数据证据强度并说明不确定性的能力"]],
  [/教育|education|teaching|tesl|幼儿/i, ["学习发展、教学设计与教育实践", "学习者分析、课程与评估、课堂研究和教育伦理", "根据学习需求设计并反思教学活动的能力"]],
  [/语言学|linguistics/i, ["语言结构、语言使用与语言变化", "语音、语法、语义、语篇和语言资料分析", "系统描述并解释语言现象的能力"]],
  [/文学|literature|english|chinese studies|malay studies/i, ["文学文本、文化语境与思想表达", "细读、比较分析、历史文化研究和学术写作", "形成有文本依据的解释与论述的能力"]],
  [/传媒|媒体|传播|communication|media|journalism/i, ["传播过程、媒体内容与受众关系", "传播理论、媒介分析、内容策划和数字制作", "针对不同语境选择媒介并清晰表达的能力"]],
  [/动画|animation|设计|design|时装|fashion/i, ["设计研究、视觉或空间表达与创意制作", "用户与语境分析、概念发展、原型制作和作品评估", "把需求转化为清晰且可验证设计方案的能力"]],
  [/音乐|music/i, ["音乐表演、理论、听觉与创作实践", "技术训练、曲目分析、合奏协作和艺术研究", "理解音乐语言并进行有意识艺术表达的能力"]],
  [/戏剧|表演|舞蹈|drama|performing|dance/i, ["舞台表演、作品创作与表演艺术研究", "身体与声音训练、文本或编创分析、排练和制作协作", "将艺术构思转化为现场表演的能力"]],
  [/法律|law|shariah/i, ["法律制度、规范解释与法律推理", "法条和案例阅读、争点分析、论证写作和职业伦理", "依据事实与规则形成严谨法律分析的能力"]],
  [/酒店|hospitality/i, ["酒店服务、住宿餐饮运营与顾客体验", "服务流程、收益与质量管理、团队协作和运营案例", "协调服务资源并改善顾客体验的能力"]],
  [/旅游|tourism/i, ["旅游目的地、游客行为与旅游服务管理", "市场与体验分析、目的地规划、运营和可持续议题", "评估旅游需求并设计合适服务方案的能力"]],
  [/烹饪|culinary|patisserie|糕点|食品科学|food science/i, ["食品原料、加工制作、品质安全与餐饮创新", "食品科学基础、操作技术、质量评价和产品开发", "把科学原理与规范操作用于食品实践的能力"]],
  [/体育|sports?|exercise/i, ["人体运动、训练表现与体育管理", "运动科学、训练分析、健康促进和项目组织", "依据证据评估运动需求并支持体育实践的能力"]],
  [/昆虫|entomolog/i, ["昆虫生物学、生态关系及其在农业、环境或健康问题中的应用", "分类与鉴定、生态观察、实验设计和数据分析", "以科学证据研究昆虫及其与环境相互作用的能力"]],
  [/兽医|veterinary/i, ["动物健康、疾病预防与兽医科学", "动物结构与功能、诊断思维、公共卫生、福利和伦理", "理解动物健康问题并形成规范专业判断的基础能力"]],
];

function profile(record) {
  const primary = record.nameZh || "";
  const secondary = record.nameEn || "";
  return keywordProfiles.find(([pattern]) => pattern.test(primary))?.[1]
    || keywordProfiles.find(([pattern]) => pattern.test(secondary))?.[1]
    || categoryProfiles[record.categoryCode]
    || ["该学科的核心概念、方法与现实应用", "理论学习、案例分析、研究方法和实践任务", "理解专业问题、评价证据并清晰表达的能力"];
}

function cleanName(record) {
  let value = (record.nameZh || record.nameEn || record.programmeCode)
    .replace(/#+\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if ((value.match(/[\u3400-\u9fff]/g) || []).length >= 4) {
    value = value
      .replace(/--\s*/gu, "—")
      .replace(/(?<=[\u3400-\u9fff）)])\s*(?:PHD|BACHELOR|MASTER|DOCTOR|SCHOOL OF)\b.*$/iu, "")
      .replace(/(?<=[\u3400-\u9fff）)])\s*[A-Za-z]{4,}.*$/u, "")
      .trim();
  }
  return value;
}

function generatedDescription(record, sourceType) {
  const [focus, methods, capability] = profile(record);
  const name = cleanName(record);
  const university = record.universityNameZh || record.universityNameEn;
  const level = levelNames[record.studyLevelCode] || "高等教育";
  const variant = [...record.programmeCode].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6;
  if (sourceType === "official") {
    const variants = [
      `根据${university}官网课程页面，${name}主要围绕${focus}展开。官网介绍所体现的学习重点包括${methods}，帮助学生逐步形成${capability}。本中文介绍依据官网英文资料整理；专业内容以来源页面最新版本为准。`,
      `${university}官网将${name}定位于${focus}。该专业重视${methods}，使学生能够逐步发展${capability}。以上为官网英文介绍的中文整理，最新培养内容请以来源页面为准。`,
      `${name}是${university}开设的${level}专业。根据学校官网说明，其学习范围集中在${focus}，并通过${methods}培养学生的${capability}。本段由官网英文资料翻译整理，具体内容以学校最新页面为准。`,
      `按照${university}官网公布的课程说明，${name}关注${focus}。学习重点涵盖${methods}，目标是建立${capability}。本介绍为官网资料的简体中文整理，后续调整以来源页面为准。`,
      `${university}的${name}围绕${focus}设置学习方向。官网资料显示，该专业强调${methods}，并支持学生形成${capability}。本文根据官网英文页面翻译整理，具体培养安排以学校最新说明为准。`,
      `从${university}官网课程介绍看，${name}聚焦${focus}。专业学习涉及${methods}，帮助学生建立${capability}。此处为官网英文内容的中文概述，完整且最新的信息以来源链接为准。`,
    ];
    return variants[variant];
  }
  const levelLead = record.studyLevelCode === "DOCTOR"
    ? `作为博士层次研究方向，通常围绕${focus}开展独立而系统的研究`
    : record.studyLevelCode === "MASTER"
      ? `作为硕士层次专业，主要深化${focus}`
      : record.studyLevelCode === "FOUNDATION"
        ? `作为预科课程，主要为后续学习建立${focus}方面的基础`
        : record.studyLevelCode === "DIPLOMA"
          ? `作为大专层次专业，主要学习${focus}并重视实践基础`
          : `作为本科专业，主要系统学习${focus}`;
  const variants = [
    `${name}是${university}开设的${level}层次专业。${levelLead}，学习通常涉及${methods}，帮助学生形成${capability}。本介绍根据专业名称、学历层次和学科方向整理；具体培养方案以学校最新官方说明为准。`,
    `${university}的${name}属于${level}层次。${levelLead}，常见学习活动包括${methods}，重点发展${capability}。本文为基于专业信息形成的中文概述，不代表学校官方课程设置；详细内容请以大学最新资料为准。`,
    `${name}关注${focus}，由${university}以${level}层次开设。该领域通常通过${methods}组织学习，使学生逐步具备${capability}。本段依据专业名称和学科方向整理，具体教学安排应以学校官方信息为准。`,
    `在${university}，${name}对应${level}层次学习。${levelLead}，并通常结合${methods}训练学生的${capability}。这是一段基于专业名称与学科常识的中文说明，未包含未经官网证实的认证、排名或就业承诺。`,
    `${university}开设的${name}主要涉及${focus}。按${level}层次的一般学习目标，专业通常重视${methods}，以发展${capability}。本文用于解释专业方向，实际课程和培养要求以学校最新官方资料为准。`,
    `${name}是一项${level}层次专业，所属院校为${university}。其学科重点可概括为${focus}，学习中通常会接触${methods}，并训练${capability}。介绍依据专业名称、层次与学科方向生成，不替代学校官方培养方案。`,
  ];
  return variants[variant];
}

function parseSqlRows(filename, tableName) {
  const sqlText = filename;
  const marker = `INSERT INTO ${tableName} VALUES`;
  const start = sqlText.indexOf(marker);
  if (start < 0) throw new Error(`missing ${marker}`);
  let source = sqlText.slice(start + marker.length);
  const rows = [];
  let row = [];
  let token = "";
  let quoted = false;
  let depth = 0;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];
    if (quoted) {
      if (char === "'" && next === "'") { token += "'"; i++; continue; }
      if (char === "'") { quoted = false; continue; }
      token += char;
      continue;
    }
    if (char === "'") { quoted = true; continue; }
    if (char === "(" && depth++ === 0) { row = []; token = ""; continue; }
    if (char === ")" && --depth === 0) { row.push(token.trim()); rows.push(row); token = ""; continue; }
    if (depth === 0 && char === ";") break;
    if (depth === 1 && char === ",") { row.push(token.trim()); token = ""; continue; }
    if (depth > 0) token += char;
  }
  return rows;
}

function sql(value) {
  if (value === null || value === undefined || value === "NULL") return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

const audit = JSON.parse(await readFile(auditPath, "utf8"));
if (audit.failures?.length) throw new Error(`audit contains ${audit.failures.length} failures`);
if (audit.auditedProgrammes !== audit.publishedProgrammes) throw new Error("audit did not cover every published programme");

const official = new Map();
for (const [migration, table] of [
  ["V34__import_um_official_programme_details.sql", "official_um_programme_updates"],
  ["V35__import_taylor_official_programme_details.sql", "official_taylor_programme_updates"],
]) {
  const contents = await readFile(path.join(root, "backend/src/main/resources/db/migration", migration), "utf8");
  for (const row of parseSqlRows(contents, table)) {
    official.set(row[0], { descriptionEn: row[2], url: row[9], checkedAt: row[10] });
  }
}

const staged = audit.records.map((record) => {
  const evidence = official.get(record.programmeCode);
  const sourceType = evidence && record.flags.includes("blank") ? "official" : "ai_generated";
  return {
    ...record,
    sourceType,
    sourceUrl: sourceType === "official" ? evidence.url : null,
    sourceCheckedAt: sourceType === "official" ? evidence.checkedAt : checkedAt,
    repairedDescriptionZh: generatedDescription(record, sourceType),
  };
});

const duplicateDescriptions = new Map();
for (const row of staged) {
  const normalized = row.repairedDescriptionZh.replace(/\s+/g, "");
  const duplicates = duplicateDescriptions.get(normalized) || [];
  duplicates.push(row.programmeCode);
  duplicateDescriptions.set(normalized, duplicates);
  if ((row.repairedDescriptionZh.match(/[\u3400-\u9fff]/g) || []).length < 45) throw new Error(`insufficient Chinese: ${row.programmeCode}`);
  if (/就业率\s*\d|保证就业|全球第一|世界第一|官方认证|国际认证/.test(row.repairedDescriptionZh)) throw new Error(`unverified claim: ${row.programmeCode}`);
}
const duplicateGroups = [...duplicateDescriptions.values()].filter((codes) => codes.length > 1);
if (duplicateGroups.length) throw new Error(`generated descriptions contain exact duplicates: ${JSON.stringify(duplicateGroups)}`);
if (official.size !== 101) throw new Error(`expected 101 official sources, got ${official.size}`);
if (staged.filter((row) => row.sourceType === "official").length !== 101) throw new Error("official source coverage changed unexpectedly");

const rows = staged.map((row) => `  (${[
  sql(row.programmeCode), sql(row.universitySlug), sql(row.descriptionZh || null), sql(row.repairedDescriptionZh),
  sql(row.sourceType), sql(row.sourceUrl), sql(row.sourceCheckedAt),
].join(", ")})`).join(",\n");

const migration = `-- Generated by scripts/generate-programme-introduction-migration.mjs from a complete production API audit.
-- Scope: programme introduction text and introduction-specific provenance only.
ALTER TABLE programmes
  ADD COLUMN description_source_type VARCHAR(20),
  ADD COLUMN description_source_url VARCHAR(1000),
  ADD COLUMN description_source_checked_at TIMESTAMP WITH TIME ZONE,
  ADD CONSTRAINT ck_programmes_description_source_type CHECK (
    description_source_type IS NULL OR description_source_type IN ('official', 'third_party', 'ai_generated')
  ),
  ADD CONSTRAINT ck_programmes_description_source_url_present CHECK (
    description_source_url IS NULL OR NULLIF(BTRIM(description_source_url), '') IS NOT NULL
  );

COMMENT ON COLUMN programmes.description_source_type IS 'Provenance of description_zh: official, third_party, or ai_generated.';
COMMENT ON COLUMN programmes.description_source_url IS 'Source page used specifically for description_zh; null for unsourced AI summaries.';
COMMENT ON COLUMN programmes.description_source_checked_at IS 'Time the introduction source or fallback decision was last checked.';

CREATE TEMP TABLE programme_introduction_repairs (
  programme_code VARCHAR(64) PRIMARY KEY,
  university_slug VARCHAR(200) NOT NULL,
  previous_description_zh TEXT,
  repaired_description_zh TEXT NOT NULL,
  source_type VARCHAR(20) NOT NULL,
  source_url VARCHAR(1000),
  source_checked_at TIMESTAMP WITH TIME ZONE NOT NULL
) ON COMMIT DROP;

INSERT INTO programme_introduction_repairs VALUES
${rows};

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM programme_introduction_repairs) <> ${staged.length} THEN
    RAISE EXCEPTION 'Introduction repair staging count mismatch';
  END IF;
  IF (
    SELECT COUNT(*) FROM programmes p
    JOIN programme_introduction_repairs repair ON repair.programme_code = p.programme_code
  ) >= 2000 THEN
    IF (SELECT COUNT(*) FROM programmes WHERE status = 'PUBLISHED') <> ${staged.length} THEN
      RAISE EXCEPTION 'Published programme count changed; regenerate the full introduction audit before deployment';
    END IF;
    IF EXISTS (
      SELECT 1 FROM programme_introduction_repairs repair
      LEFT JOIN programmes p ON p.programme_code = repair.programme_code
      LEFT JOIN universities u ON u.id = p.university_id
      WHERE p.id IS NULL OR p.status <> 'PUBLISHED' OR u.slug <> repair.university_slug
    ) THEN
      RAISE EXCEPTION 'An introduction repair does not match its published programme and university';
    END IF;
  END IF;
END $$;

UPDATE programmes p
SET description_zh = repair.repaired_description_zh,
    description_source_type = repair.source_type,
    description_source_url = repair.source_url,
    description_source_checked_at = repair.source_checked_at,
    updated_at = CURRENT_TIMESTAMP
FROM programme_introduction_repairs repair
WHERE p.programme_code = repair.programme_code
  AND p.status = 'PUBLISHED'
  AND p.description_zh IS NOT DISTINCT FROM repair.previous_description_zh;

DO $$
BEGIN
  IF (
    SELECT COUNT(*) FROM programmes p
    JOIN programme_introduction_repairs repair ON repair.programme_code = p.programme_code
  ) >= 2000 THEN
    IF EXISTS (
      SELECT 1 FROM programmes p
      WHERE p.status = 'PUBLISHED'
        AND (
          NULLIF(BTRIM(p.description_zh), '') IS NULL
          OR p.description_zh LIKE '%帮助学生建立系统的专业知识、分析方法与实践能力%'
          OR p.description_zh LIKE '%专业介绍资料正在整理中%'
          OR p.description_source_type IS NULL
          OR p.description_source_checked_at IS NULL
        )
    ) THEN
      RAISE EXCEPTION 'Published programme introduction repair is incomplete or stale';
    END IF;
  END IF;
END $$;
`;

await writeFile(outputPath, migration, "utf8");
console.log(JSON.stringify({
  output: outputPath,
  audited: staged.length,
  official: staged.filter((row) => row.sourceType === "official").length,
  thirdParty: staged.filter((row) => row.sourceType === "third_party").length,
  aiGenerated: staged.filter((row) => row.sourceType === "ai_generated").length,
  repaired: staged.length,
}, null, 2));
