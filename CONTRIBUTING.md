# 贡献指南

感谢你有兴趣为护眼小助手项目做出贡献！以下是一些参与该项目开发的指南。

## 环境设置

要设置本地开发环境，请按照以下步骤操作：

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/eye-protection-assistant.git
   cd eye-protection-assistant
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 开发指南

### 分支和提交

1. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **遵循提交规范**  
   请遵循以下的提交消息格式：
   ```
   [类型]: 简短描述

   一个更详细的变更描述
   ```

   类型可以是：
   - `feat`: 新功能
   - `fix`: bug 修复
   - `docs`: 文档变更
   - `style`: 不影响代码功能的变更（格式化，缩进等）
   - `refactor`: 既不是新功能也不是 bug 修复的代码变化
   - `perf`: 提高性能的代码更改
   - `test`: 添加或修改测试用例
   - `chore`: 对构建过程或辅助工具的更改

3. **提交你的更改**
   ```bash
   git add .
   git commit -m "[类型]: 描述你的更改"
   git push origin feature/your-feature-name
   ```

4. **创建 Pull Request**  
   在 GitHub 网站上向主分支发起 Pull Request。

### 代码规范

1. **TypeScript 规范**  
   - 始终使用类型注释
   - 避免使用 `any` 类型
   - 尽量使用接口来定义对象结构

2. **React 规范**  
   - 使用函数组件而非类组件
   - 注重组件的可复用性
   - 遵循 React Hooks 的规则

3. **CSS 规范**  
   - 使用 CSS 变量保持样式一致性
   - 遵循现有的命名规范

### 测试

提交前请运行测试，确保所有测试都通过：

```bash
npm test
```

如果你的贡献包含新的功能，请为该功能添加适当的测试用例。

## 报告 Bug

如果你发现了 Bug，请可以通过以下步骤报告：

1. 使用 GitHub 的 Issues 功能 [https://github.com/195376970/eye-protection-assistant/issues](https://github.com/195376970/eye-protection-assistant/issues)
2. 使用 Bug 报告模板创建新的 Issue
3. 提供尽可能多的信息，包括：
   - 问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 截图（如有）
   - 系统信息（操作系统、应用版本）

## 功能请求

如果你有新功能的建议，请通过以下步骤提交：

1. 使用 GitHub 的 Issues 功能 [https://github.com/195376970/eye-protection-assistant/issues](https://github.com/195376970/eye-protection-assistant/issues)
2. 使用功能请求模板创建新的 Issue
3. 描述你的功能请求，包括：
   - 功能的用途
   - 可能的实现方式
   - 其他相关信息

## 代码审查过程

所有提交的 Pull Request 将经过如下审查流程：

1. 自动检查（测试、代码风格等）
2. 代码审查者的手动审查
3. 与实现细节相关的讨论
4. 可能需要的修改
5. 最终合并

## 联系方式

如果你有任何问题或建议，请使用 GitHub Issues 与我们联系。

再次感谢你对护眼小助手项目的贡献！