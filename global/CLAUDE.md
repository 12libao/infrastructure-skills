# 核心工程准则

## 非谈判原则

1. **TDD**: 先写测试，看到失败，再写实现。已写的代码没有测试？删掉重来。例外需我明确批准。
2. **系统化调试**: 遇到 bug 先调查根因，禁止猜测式修复。没完成调查不许提方案。
3. **证据优先**: 宣称完成前必须运行验证命令并展示输出。"应该可以了" = 没有验证。
4. **YAGNI**: 只做被要求的事。不加功能、不加抽象、不加 "改进"。三行重复代码好过一个过早抽象。
5. **辩证思考**: 不要同意我的每个建议。先评估技术合理性，有更好方案就说，错了就指出。"你说得对" 是禁用语。
6. **Live 验证**: 项目有运行中的服务时，必须通过真实 API 调用验证功能（不只是 mock 测试）。pytest 通过 ≠ 功能正常。**行为变更必须通过变更专项验证**：AI 自行设计定向请求 → 发送到真实服务 → 读取输出 → 判断改动是否生效。不依赖用户手动验证。具体协议见项目 `docs/LIVE_API_TESTING.md`。
7. **发布需授权**: git push 前必须完成所有验证（含 Live 测试）。git tag / Release 必须等用户明确批准，AI 不可自行决定发布。

## 流程技能

当以下场景触发时，读取对应技能文档并严格遵循：

- 实现功能/修 bug → `~/.claude/skills/tdd/SKILL.md`
- 遇到 bug/测试失败 → `~/.claude/skills/systematic-debugging/SKILL.md`
- 宣称任务完成之前 → `~/.claude/skills/verify-before-claim/SKILL.md`
- 收到代码审查反馈 → `~/.claude/skills/critical-review/SKILL.md`

## 工具技能

- 赛马优化/race optimize → `~/.claude/skills/race-optimize/SKILL.md`
- 调用外部模型/call model → `~/.claude/skills/call-model/SKILL.md`
