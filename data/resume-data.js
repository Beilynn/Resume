/**
 * ============================================================
 * ★ 简历数据配置层（唯一内容来源，仅修改内部键值对即可）★
 * 界面为「整图即界面」：主画面位图铺满，四张票券卡片由透明热区
 * 承接交互；点击后弹窗按 sections 中 type 渲染对应内容。
 * ============================================================
 */

/* window.RESUME_DATA 赋值语法勿改；图片路径均为相对入口 doubao/ 的路径。 */
window.RESUME_DATA = {

  /* ---------- 站点基础信息（图内已绘制，保留仅作档案） ---------- */
  site: {
    title: "Beilynn / RESUME",
    tags: "PSYCHOLOGY · RESEARCH · CODE",
    footerLeft: "Beilynn • PERSONAL ARCHIVE",
    footerRight: "IDEAS INTO REALITY"
  },

  /* ---------- 人物视觉素材 ---------- */
  media: {
    mainImage: "img/简历封面.png",
    avatar: "img/ip形象设计.png",
    states: [
      { image: "img/1.png", label: "个人介绍" },
      { image: "img/2.png", label: "校园经历" },
      { image: "img/3.png", label: "GitHub 项目" },
      { image: "img/4.png", label: "荣誉技能" }
    ]
  },

  /* ---------- 人物动画视频（留空则隐藏播放按钮） ---------- */
  video: {
    url: "",
    poster: "",
    caption: "人物动画"
  },

  /* ---------- 四个板块与详情弹窗内容 ---------- */
  sections: [
    /* ========== 01 个人介绍 ========== */
    {
      id: "01",
      title: "个人介绍",
      enTitle: "INTRODUCTION",
      stateIndex: 0,
      hotspot: { top: 11.0, left: 3.4, width: 21.3, height: 25.0 },
      type: "profile",
      detail: {
        avatar: "img/ip形象设计.png",
        basics: [
          { label: "姓名",     value: "Beilynn" },
          { label: "GitHub",   value: "github.com/Beilynn", href: "https://github.com/Beilynn" },
          { label: "电话",     value: "13335879383" },
          { label: "QQ 邮箱",  value: "2642983645@qq.com" },
          { label: "Gmail",    value: "zhengbeilin17@gmail.com" },
          { label: "政治面貌", value: "中共党员发展对象" },
          { label: "专业",     value: "应用心理学（2024 级）" },
          { label: "籍贯",     value: "浙江温州" }
        ],
        education: {
          school: "宁波大学教师教育学院",
          major: "应用心理学",
          period: "2024.09 至今",
          courses: [
            "普通心理学", "发展心理学", "实验心理学",
            "教育心理学", "社会心理学", "心理测量学", "心理统计与应用"
          ],
          gpa: "3.82 / 4",
          rank: "绩点排名 3 / 73 · 综测排名 3 / 73"
        },
        evaluation:
          "应用心理学专业在读学生，系统学习认知、发展、教育与社会心理学等核心课程，掌握心理测量与统计分析方法；具备实验设计、行为实验编程与数据处理能力，可使用 R、Python、MATLAB 完成数据清洗、方差分析与结果可视化。文字表达较为扎实，有新闻宣传与学术写作实践；做事严谨细致、执行力较强，重视团队协作与沟通对接，能够按目标保质保量完成任务。"
      }
    },

    /* ========== 02 校园经历 ========== */
    {
      id: "02",
      title: "校园经历",
      enTitle: "EXPERIENCE",
      stateIndex: 1,
      hotspot: { top: 6.0, left: 26.7, width: 22.0, height: 23.5 },
      type: "timeline",
      detail: {
        intro: "在校期间参与志愿服务、社会实践与宣传写作，在真实任务中锻炼表达、统筹与协作能力。",
        items: [
          {
            title: "志愿服务",
            period: "累计 200+ 小时",
            text: "长期参与校、院两级志愿服务与公益活动，累计服务时长 200 小时以上；承担活动对接、现场组织与执行落地工作，具备稳定的服务意识、沟通协调能力与岗位责任心。"
          },
          {
            title: "暑期社会实践 · 暑托班教学",
            period: "2026 年暑期",
            text: "面向低年级儿童设计并讲授趣味课程，承担日常教学、陪护管理与秩序维护；结合儿童认知特点组织课堂活动，锻炼了教学设计、口头表达与事务统筹能力。"
          },
          {
            title: "宣传报道负责人",
            period: "2026 年暑期实践",
            text: "负责实践团队新闻稿件的撰写、修改与多平台投稿，累计在《中国青年报》（国家级）及潮新闻、新湖南、甬派等省市级媒体刊发稿件六十余篇，具备较好的文字表达、选题判断与对外协作能力。"
          }
        ],
        gallery: []
      }
    },

    /* ========== 03 GitHub 项目 ========== */
    {
      id: "03",
      title: "GitHub 项目",
      enTitle: "OPEN SOURCE",
      stateIndex: 2,
      hotspot: { top: 6.0, left: 52.2, width: 22.0, height: 24.0 },
      type: "projects",
      detail: {
        note: "",
        projects: [
          {
            name: "ZBL_Blog · 个人知识博客",
            desc: "独立设计与开发的个人博客站点，基于 Next.js 15、Tailwind CSS 与 Framer Motion 构建，集成内容展示、信息聚合与交互动效模块，已通过 Netlify 完成线上部署并支持持续更新。",
            url: "https://github.com/Beilynn/ZBL_Blog",
            tags: ["Next.js", "Tailwind CSS", "Framer Motion", "Netlify"],
            status: "已上线"
          },
          {
            name: "AI 问诊安全工具 · 网络疑病症科普站",
            desc: "面向网络疑病症（Cyberchondria）与健康信息素养主题的静态科普站点，梳理循证研究与干预证据，内置 12 题自评清单及症状自查、体检报告解读、用药冲突核对等安全边界问诊模板，强调信息整理不替代临床诊断，已通过 GitHub Pages 上线。",
            url: "https://beilynn.github.io/AI_assisted_consultation/",
            tags: ["HTML / CSS / JavaScript", "GitHub Pages", "健康信息素养", "循证科普"],
            status: "已上线",
            linkText: "查看作品 →"
          },
          {
            name: "心理学实验与统计分析代码",
            desc: "围绕课程实验与研究设计，使用 R、Python、MATLAB 完成数据清洗、相关分析、重复测量方差分析与图表可视化，代码结构清晰、注释完整，便于教学复刻与结果复现。",
            url: "#",
            tags: ["R", "Python", "MATLAB", "统计建模"],
            status: "整理中"
          }
        ]
      }
    },

    /* ========== 04 荣誉技能 ========== */
    {
      id: "04",
      title: "荣誉技能",
      enTitle: "HONOR & SKILL",
      stateIndex: 3,
      hotspot: { top: 11.5, left: 76.2, width: 18.5, height: 24.0 },
      type: "honors",
      detail: {
        skills: [
          {
            group: "编程与数据统计",
            items: ["R 语言", "Python", "MATLAB", "HTML / CSS / JavaScript"]
          },
          {
            group: "专业方法",
            items: ["实验设计与行为编程", "心理统计与方差分析", "心理测量与量表编制", "文献检索与综述撰写", "学术论文写作（APA 体例）"]
          },
          {
            group: "外语能力",
            items: ["英语 CET-4", "英语 CET-6"]
          },
          {
            group: "办公工具",
            items: ["Word", "Excel", "PowerPoint", "WPS 办公套件"]
          }
        ],
        awards: [
          { name: "2025-2026 学年省政府奖学金", level: "省级" },
          { name: "2024-2025 学年“三好学生”",   level: "" },
          { name: "2024 学年校三等奖学金",        level: "校级" },
          { name: "宁波大学第八届“卡尔·马克思杯”校级初赛一等奖", level: "校级" },
          { name: "全国高校心理学专业本科生创新创业论坛校赛三等奖", level: "校级" },
          { name: "第四届“南孔杯”廉洁文学创作大赛院赛优秀奖",     level: "院级" }
        ]
      }
    }
  ]
};
