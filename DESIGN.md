---
name: 洋豆角小程序
description: 现有小程序主题的提取记录，仅约束小程序范围
colors:
  brand: "#3f8875"
  action: "#286858"
  deep: "#153f36"
  navy: "#173d5b"
  mint: "#dff4ea"
  paper: "#fdfcf8"
  wash: "#eef5f1"
  ink: "#18302b"
  muted: "#536a63"
  line: "#c8d9d2"
typography:
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "28rpx"
rounded:
  card: "24rpx"
---

# Design System: 洋豆角小程序

## Overview

从现有代码提取，不是重新设计品牌。沿用浅绿底、深绿操作按钮、深色中文系统字体与圆角卡片。新增规划界面是操作型工具，先保证信息与状态清楚。

## Colors

brand 与 action 承担品牌及主操作，paper/wash 区分内容与页面底色，ink/muted 区分正文与辅助信息；不依赖颜色独自表示条件状态。

## Typography

沿用 app.wxss 中文系统字体，不加载装饰字体。用标题、正文和辅助文字的层级组织信息。

## Layout

继承现有小程序单列布局；规划详情内容可滚动，底部操作不得遮挡内容。

## Elevation & Depth

现有卡片阴影为 `0 14rpx 36rpx rgba(23, 61, 91, 0.08)`，不新增发光或玻璃效果。

## Shapes

卡片沿用主题圆角，信息分组轻量，不将每个短句包成卡片。

## Do's and Don'ts

- Do 沿用 tokens.wxss，优先可读中文和清晰操作。
- Don't 把视觉示例中的专业条件当成真实数据。
- Don't 为新功能另造一套配色或修改原有页面主题。

## Built surface: AI 留学规划（2026-10-15）

用户已批准此局部页面采用聊天优先的白底版本，替代最初的 C 方向；以上站点及其他小程序页面的主题不变。该页面使用白色内容底、墨色正文（#252724）、浅灰用户气泡（#f1f2f0），品牌绿只用于少量选择和核验状态。系统中文字体保持不变。

轻顶栏将历史、新对话等收进菜单；背景是一行摘要与编辑入口。助手段落不加外框，专业图片与正文通过留白和极细分隔组织，证据默认收起，底部只有一个圆角输入区。不恢复厚 tab、全屏背景条或逐条卡片。

背景渐进输入每次最多两题，chips 与必要输入搭配，最后摘要须明确确认；更多字段按需进入。保存、年龄与隐私、顾问表单分别使用主动打开的独立面板。错误和重试在面板内可见，不能用颜色代替文字状态。

本次基于实际 WXML/WXSS/controller 的本地预览已经用户确认；这是原型视觉确认，不是微信真机验收。原生键盘、长屏滚动与安全区仍需发布前在真实设备复核。
