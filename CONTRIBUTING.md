# 贡献指南

感谢您有兴趣为护眼小助手项目做出贡献。本文档将指导您如何参与项目开发与改进。

## 开发环境设置

要设置本地开发环境，请按照以下步骤操作：

```bash
# 克隆仓库
git clone https://github.com/yourusername/eye-protection-assistant.git
cd eye-protection-assistant

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 开发流程

### 分支管理

我们采用基于功能分支的开发模式：

```bash
# 创建功能分支
git checkout -b feature/your-feature-name

# 创建修复分支
git checkout -b fix/bug-description
```

### 提交规范

请遵循以下的提交消息格式：

```
[类型]: 简短描述（不超过50个字符）

详细说明（可选，每行不超过72个字符）
```

提交类型包括：
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 格式调整（不影响代码功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动

### Pull Request流程

1. 确保你的分支是基于最新的main分支创建的
2. 在提交PR前运行测试并确保通过
3. 提交PR并等待代码审查
4. 根据反馈进行必要的修改
5. 合并PR（由项目维护者执行）

## 代码规范

### TypeScript规范

- 使用类型注解增强代码可读性和可维护性
- 避免使用`any`类型，尽量使用具体类型或泛型
- 使用接口（interface）定义对象结构，提高代码可维护性
- 遵循命名约定：
  - 接口名前不加`I`前缀
  - 类型别名使用PascalCase
  - 变量和函数使用camelCase

### React最佳实践

- 使用函数组件和Hooks，避免类组件（除非有特殊需求）
- 对于复杂组件，考虑使用React.memo减少不必要的重渲染
- 保持组件职责单一，优先考虑组件复用性
- 使用TypeScript为props和state定义类型

### 样式规范

- 使用CSS Module或CSS-in-JS解决方案
- 利用CSS变量实现样式复用和主题切换
- 遵循BEM命名方法论（Block-Element-Modifier）
- 避免使用!important

## 测试

提交代码前请运行测试，确保所有测试通过：

```bash
npm test
```

如有新增功能，请编写相应的单元测试。我们使用Jest作为测试框架。

## Bug报告

如果您发现了Bug，请通过以下步骤报告：

1. 检查Issue列表，确认Bug尚未被报告
2. 创建新Issue，使用Bug模板
3. 提供详细信息：
   - Bug描述
   - 复现步骤
   - 预期行为与实际行为
   - 系统环境（操作系统、应用版本等）
   - 相关截图（如有）

## 功能请求

如果您有新功能建议，请：

1. 创建新Issue，使用功能请求模板
2. 详细描述功能需求和使用场景
3. 可以提供实现思路或相关参考资料

## 代码审查

所有PR都会经过代码审查流程：

1. 自动化测试检查（CI/CD流程）
2. 代码风格检查
3. 功能验证
4. 代码审查者的反馈与建议

我们鼓励开发者积极参与代码审查过程，这有助于提高代码质量并促进知识分享。

## 联系方式

如有任何问题，请通过GitHub Issues与项目维护者联系。

感谢您对护眼小助手项目的贡献！