window.FELIX_DIARY_SEED = {
  version: "2026-08-17-summary-v3",
  entries: {
    "2026-08-18": {
      date: "2026-08-18",
      questions: [
        "为什么 scheduled task 运行时会报 503 No available channel for model gpt-5.6-luna？",
        "为什么 GitHub Pages 打开网页会先看到缓存过的旧内容？",
        "怎样让学习日志每天自动整理后同步到 GitHub Pages？"
      ],
      learning: [
        "scheduled task 失败不一定是代码问题，也可能是模型通道临时不可用。",
        "给静态站点脚本加版本号可以降低浏览器缓存影响。",
        "用本地自动化整理日志，再推送到 main 和 gh-pages，可以让网站按天更新。",
        "GitHub Pages 的部署状态和浏览器本机存储都会影响你看到的页面内容。"
      ],
      notes: [
        "今天把自动化模型从 gpt-5.6-luna 调整为了更稳的备选模型。",
        "网站展示与本地缓存分离时，要同时处理 Pages 部署和浏览器缓存。"
      ],
      updatedAt: "2026-08-18T23:59:00.000+08:00",
      seedVersion: "2026-08-18-summary-v1"
    },
    "2026-08-17": {
      date: "2026-08-17",
      questions: [
        "做一个学习日志，精简记载每天在 Codex 上询问的问题和学习的内容。",
        "做一个独属于 Felix 的学习日志网站，具备修改、添加文字和记忆存储功能。",
        "把学习日记上传到 GitHub，并通过 GitHub Pages 发布成网页。",
        "让每日学习记录可以由 Codex 自动整理并同步到网站。"
      ],
      learning: [
        "可以用 Markdown 建立每日一页的学习记录结构。",
        "可以用 Codex 自动化在每天 00:00 定时更新日志。",
        "本地静态网站可以用浏览器 localStorage 保存个人学习记录。",
        "导入/导出 JSON 备份可以避免记录只留在单个浏览器里。",
        "GitHub Pages 可以把仓库中的静态网页发布成可访问的网站。",
        "`gh-pages` 分支可以作为 GitHub Pages 的专用发布分支。",
        "自动化任务可以在更新日志后提交并推送到 GitHub，让网站刷新后看到新内容。"
      ],
      notes: [
        "网站名为 Felix的学习日记。",
        "日志按日期独立管理，适合记录 agent 学习过程。",
        "网站不是实时抓取 Codex 对话，而是通过每日整理、提交和推送来更新。"
      ],
      updatedAt: "2026-08-17T23:59:00.000+08:00",
      seedVersion: "2026-08-17-summary-v3"
    }
  }
};
