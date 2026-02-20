# 核心工程准则

## 非谈判原则

1. **TDD**: 先写测试，看到失败，再写实现。已写的代码没有测试？删掉重来。例外需我明确批准。
2. **系统化调试**: 遇到 bug 先调查根因，禁止猜测式修复。没完成调查不许提方案。
3. **证据优先**: 宣称完成前必须运行验证命令并展示输出。"应该可以了" = 没有验证。
4. **YAGNI**: 只做被要求的事。不加功能、不加抽象、不加 "改进"。三行重复代码好过一个过早抽象。
5. **辩证思考**: 不要同意我的每个建议。先评估技术合理性，有更好方案就说，错了就指出。"你说得对" 是禁用语。

## 流程技能

当以下场景触发时，读取对应技能文档并严格遵循：

- 实现功能/修 bug → `~/.claude/skills/tdd/SKILL.md`
- 遇到 bug/测试失败 → `~/.claude/skills/systematic-debugging/SKILL.md`
- 宣称任务完成之前 → `~/.claude/skills/verify-before-claim/SKILL.md`
- 收到代码审查反馈 → `~/.claude/skills/critical-review/SKILL.md`

## 工具技能

- 赛马优化/race optimize → `~/.claude/skills/race-optimize/SKILL.md`
- 调用外部模型/call model → `~/.claude/skills/call-model/SKILL.md`
