# Product — 洋豆角小程序规划功能

<!-- impeccable:product-schema 1 -->

## Platform

web

此记录仅覆盖微信小程序 WXML/WXSS 界面，不将其视为独立 iOS 或 Android 原生应用。

## Users

中国大陆学生，准备申请马来西亚预科、本科、硕士或博士。

## Product Purpose

通过对话补充并确认背景，查询现有目录，使用核验过的证据形成可追溯规划，用户主动保存或转顾问。

## Capabilities and Constraints

保留现有小程序整体主题，规划页采用用户批准的聊天优先白底局部界面。聊天、渐进背景确认、专业结果、保存与顾问分享分别明确呈现。不自动申请或付款，不承诺录取；证据不足明确标注待核实。模型与数据未满足发布条件时入口保持关闭。

## Evidence on Hand

已确认设计：docs/superpowers/specs/2026-10-15-malaysia-planning-agent-design.md。现有视觉来源：miniapp/miniprogram/styles/tokens.wxss、app.wxss。效果图中示例不是官方招生事实。

## Product Principles

- 条件判断由核验规则决定，不由模型猜测。
- 背景、保存与分享都由用户确认。
- 不改变存量手动规划。
- 先展示视觉效果图，经用户选定后实现界面。
