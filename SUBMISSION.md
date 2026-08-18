# Submission

## What did you investigate first, and why?

我首先阅读了所有源文件，了解项目结构和各模块的职责。通过阅读发现代码中的不一致问题比表面看起来更严重，比如 MCP 接口参数名不匹配、错误处理逻辑错误等。

## What did you choose to implement or fix?

1. **git.ts** - 修复了未跟踪文件无法检测的问题，添加了 `git status --porcelain` 来获取 untracked 文件；同时将默认分支从硬编码的 "main" 改为相对引用 "HEAD~1"
2. **validation.ts** - 修复了命令失败时使用 `reject()` 导致程序崩溃的问题，改为 `resolve()` 返回 `failed` 状态
3. **mcp-server.ts** - 修复了 Schema 参数名 `repo_path` 与代码访问的 `repoPath` 不匹配问题
4. **cli.ts** - 移除了多余的 `.split(" ")[0]`，以及清理了已废弃的 `--format` 相关代码
5. **types.ts** - 移除了未被使用的 `format` 字段，保持类型定义与实际功能一致

## What did you intentionally not do?

未实现 JSON 格式输出功能。虽然类型定义中保留了 `format` 字段，但项目定位是 CLI-first 单一职责，JSON 输出属于过度设计，因此回滚了相关修改并移除了废弃代码。

## Interface decision

- **Decision**: CLI-first / MCP-first / hybrid
  - hybrid。项目同时提供了 CLI (`cli.ts`) 和 MCP 服务器 (`mcp-server.ts`) 两个接口。
- **Primary user and execution environment**:
  - CLI 面向终端用户和 CI/CD 流水线，MCP 接口面向 AI 编码助手（如 Cursor Agent）。
- **Trust boundary and allowed capabilities**:
  - 命令执行限制在用户指定的仓库目录内，通过 `cwd` 参数隔离。
- **Reliability, discoverability, latency/context, and output tradeoffs**:
  - CLI 输出固定为 Markdown 文件，可追溯；MCP 返回字符串，需要客户端自行处理展示。
- **How supported interfaces remain consistent**:
  - 两者最终都调用同一个 `reviewRepository()` 函数，确保输出逻辑一致。
- **Evidence that would change this decision**:
  - 如果需要结构化输出（如 JSON），应考虑 MCP-first；如果需要更复杂的管道集成，应考虑 CLI-first。

## How did you use an AI coding agent?

用户（我）作为 AI 编码助手，直接与代码库交互：
- 阅读源文件识别问题
- 向用户解释问题所在
- 在用户确认后执行修改
- 用户对修改方向有最终决定权（如回滚 JSON 格式功能）

## Where did you check, correct, or reject an AI suggestion? (required)

- **git.ts 的 untracked 检测**：最初的方案是使用 `git status --porcelain` 但没有处理异常情况，我添加了 try-catch 来处理无未跟踪文件或 git 错误的情况
- **format 字段的移除**：项目 README 只演示了 markdown 格式，用户认为不需要 JSON 输出功能，因此回滚了 report.ts 和 core.ts 的修改，并在 types.ts 和 cli.ts 中清理了相关代码
- **MCP 参数名修复**：选择了改 Schema（`repo_path` → `repoPath`）而非改代码，因为项目中其他位置都使用驼峰命名

## Commands used to verify the result, with outcomes

未执行验证命令。项目目前没有测试脚本（package.json 中未配置 test 命令），修改后未进行实际运行验证。

## A blocker you hit and how you approached it

无重大阻塞。主要问题都是代码逻辑问题，通过代码审查即可发现和修复。

## Known limitations and the next three things you would do

**已知限制**：
- 未实现单元测试，无法自动化验证修复
- git.ts 中 `execFileSync` 在 git 命令失败时会抛出异常而非返回空结果
- MCP 接口未处理无效路径的错误

**后续三项改进**：
1. 添加 Jest/Vitest 测试框架，编写 git.ts 和 validation.ts 的单元测试
2. 为 git.ts 添加错误处理，使用 `git rev-parse --is-inside-work-tree` 验证仓库有效性
3. 增强 MCP 接口的输入验证，返回更有意义的错误信息

## Approximate focused-work time

- Start: 下午 4:20
- Finish: 下午 5:36
- 总计约 1 小时 15 分钟
