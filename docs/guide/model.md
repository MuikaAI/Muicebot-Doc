# 模型加载器🤖

## 模型加载器信息

在 Muicebot 中，每一个可用于与 LLM 进行交互的实例被称为模型加载器，这些模型加载器存放于代码目录中的 `muicebot.llm` 文件夹下，并通常以首字母大写的形式命名以便于 SDK 区分。

每个模型加载器都继承于模型基类 `BasicModel` 并统一使用 `ModelConfig` 获取配置项，但由于 SDK 实现情况，每个模型加载器所需要的配置项和实现的功能都不尽相同。

本页面列举了每一个模型加载器目前在 Muicebot 中实现的功能并给出了它们所支持的配置项。

### 实现的加载器及其支持的模型

我们目前实现了以下模型加载器:

| 模型加载器                                                   | 介绍                                                         | 模型列表                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| [Azure](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Azure.py) | 可调用 [GitHub Marketplace ](https://github.com/marketplace/models)中的在线模型 | [Github MarketPlace](https://github.com/marketplace?type=models) |
| [Dashscope](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Dashscope.py) | 可调用阿里云百炼平台的在线模型                               | [官方文档](https://help.aliyun.com/zh/model-studio/getting-started/models) |
| [Gemini](https://aistudio.google.com/)                       | 使用 Gemini Python SDK 访问 Google Gemini 服务中的模型       | [模型列表](https://ai.google.dev/gemini-api/docs/models?hl=zh-cn) |
| [Ollama](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Ollama.py) | 使用 Ollama Python SDK 访问 Ollama 接口，需要提前启动模型服务 | [模型列表](https://ollama.com/search)                        |
| [Openai](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Openai.py) | 可调用 OpenAI API 格式的接口，支持 DeepSeek 官方API          | *any*                                                        |


对于不同的加载器，可能需要额外的依赖，请根据报错提示安装。

有关各个模型加载器的配置，参见 [模型加载器配置](/model/configuration.md)

### 加载器功能支持列表

| 模型加载器   | 流式对话  | 多模态输入/输出 | 推理模型调用 | 工具调用 | 联网搜索 |
| ----------- | -------- | -------- | ------------ | -------------------- | -------------------- |
| `Azure`     | ✅       | 🎶🖼️/❌   | ⭕            | ✅                    | ❌                    |
| `Dashscope` | ✅       | 🎶🖼️/❌       | ✅            | ⭕                    | ✅                    |
| `Gemini`    | ✅       | ✅/🖼️         | ⭕            | ✅                    | ✅                    |
| `Ollama`    | ✅       | 🖼️/❌         | ✅            | ✅                    | ❌                    |
| `Openai`    | ✅       | ✅/🎶      | ✅            | ✅                    | ❌                    |

✅：表示此加载器能很好地支持该功能并且 `MuiceBot` 已实现

⭕：表示此加载器虽支持该功能，但使用时可能遇到问题

🚧：表示此加载器虽然支持该功能，但 `MuiceBot` 未实现或正在实现中

❓：表示 Maintainer 暂不清楚此加载器是否支持此项功能，可能需要进一步翻阅文档和检查源码

❌：表示此加载器不支持该功能

多模态标记：🎶表示音频；🎞️ 表示视频；🖼️ 表示图像；📄表示文件；✅ 表示完全支持

*要使用多模态，请在模型配置中写入 `multimodal: true` 来启用多模态功能

关于部分模型加载器的 ⭕ 标记

1. `Azure` 的推理模型调用可能因为各种各样的原因出现报错或长响应时间

2. `Dashscope` 的联网搜索功能疑似存在问题，要么不承认自己会联网搜索，要么生成到一半然后胡言乱语； Function Call 疑似与该功能冲突

3. `Dashscope` 因内部API原因，使用 `qvq-32b` 会出现思考死循环；`qwen-omni` 需要使用 `OpenAI` 加载器加载

4. `Gemini` 无法返回思考过程。其多模态文件输入有限制，支持的文件类型另请参阅[官方文档](https://ai.google.dev/gemini-api/docs/document-processing?hl=zh-cn&lang=python)

5. 对于 `Openai` 和 `Gemini` 加载器，如需使用代理，请配置 `HTTP_PROXY` 和 `HTTPS_PROXY` 变量


## 编写模型加载器配置

在 `configs` 文件夹下新建 `models.yml`，用于存储模型加载器的配置。

### 基本格式

对于不同的模型加载器，所需要的配置项都大不相同。但大体的格式都和以下的示例配置差不多

```yaml
azure:  # 配置名称。唯一，可任取，不一定和模型加载器名称有关联
  loader: Azure  # 模型加载器名称。对应的是 `muicebot/llm` 下的 `.py` 文件。通常模型加载器的首字母都是大写
  model_name: DeepSeek-R1  # 模型名称（可选，默认为 DeepSeek-R1）
  template: Muice  # 人设提示词 Jinja2 模板名称（不用带文件后缀）
  api_key: ghp_xxxxxxxxxxxxxxxxx  # GitHub Token（若配置了环境变量，此项不填）
  stream: true # 流式对话
  multimodal: false # 是否启用多模态（可选。注意：使用的模型必须是多模态的）
  function_call: true # 是否启用工具调用（可选。需要编写 function call 插件并启用）
```

以上给出了 Azure 模型加载器的一个示例配置，您可以在接下来的 [模型加载器配置项一览](#模型加载器配置项一览) 一节中获取这些模型加载器分别支持的配置。

如果你不知道这些配置中哪些是必须的，那么你可以先填写一个 `loader` 配置，模型加载器初始化时会抛出错误并提示您

我们支持多个模型配置，并可在聊天中通过指令动态切换，例如：

```yaml
dashscope:
  loader: Dashscope # 使用 dashscope 加载器
  default: true # 默认配置文件
  template: Muice # 人设提示词 Jinja2 模板名称（不用带文件后缀）
  multimodal: true # 是否启用多模态（可选，注意：使用的模型必须是多模态的）
  model_name: qwen2.5-vl-7b-instruct # 模型名称
  api_key: sk-xxxxxxxxxxxxxxxxxxxxxxx # API 密钥（必须）
  max_tokens: 1024 # 模型生成的最大 token 数（可选，默认为 1024）
  temperature: 0.7 #  模型生成的温度参数（可选，默认为 0.7）
  system_prompt: 现在开始你是一个名为的“沐雪”的AI女孩子   # 系统提示（可选）
  auto_system_prompt: true # 自动配置沐雪的系统提示（默认为 false）
  repetition_penalty: 1.2

azure:
  loader: Azure # 使用 azure 加载器
  model_name: DeepSeek-R1 # 模型名称（可选，默认为 DeepSeek-R1）
  template: Muice # 人设提示词 Jinja2 模板名称（不用带文件后缀）
  token: ghp_xxxxxxxxxxxxxxxxx # GitHub Token（若配置了环境变量，此项不填）
  system_prompt: '我们来玩一个角色扮演的小游戏吧，现在开始你是一个名为的“沐雪”的AI女孩子，用猫娘的语气和我说话。' # 系统提示（可选）
  auto_system_prompt: true # 自动配置沐雪的系统提示（默认为 false）
```

在聊天中使用 `.load <model_config_name>` 指令（仅超级管理员）即可动态切换配置文件，比如 `.load azure`。

在某个模型配置中配置 `default: true` 即可将此模型配置设为默认。如果没有默认的模型配置，则会加载第一个。

**至少存在一个模型配置作为默认配置**

若手动更改 `models.yml` 配置文件也能触发配置更新（注意：此操作不会有bot消息提示，只有控制台输出）。

### 共有配置项

下面的配置项是每一个模型加载器都共有的，并且发挥着重要的功能：

```yaml
loader: Openai # 模型加载器名称，这些模型加载器位于插件目录下的 llm 文件夹中，并初始化同名文件的同名类，如果不存在则报错。注意，每个模型加载器因为兼容问题，开头首字母都是大写的
multimodal: true # 多模态支持。设置为 true 将处理多模态事件。如果调用的模型不是多模态模型忽略这些多模态消息

template: Muice # 人设提示词 Jinja2 模板，模板文件需要存放在 `./templates` 文件夹下。Muice为内嵌模板。默认值为空或全局默认值
template_mode: system # 模板嵌入模式: `system` 为嵌入到系统提示; `user` 为嵌入到用户提示中。默认为 `system`
```

其中，沐雪人设模板文件存放于：[Muice.jinja2](https://github.com/Moemu/MuiceBot/blob/main/muicebot/builtin_templates/Muice.jinja2)

关于人设文件的具体写法，请参考 [人设模板的撰写](/develop/template)


## 模型加载器配置项一览

对于每一个模型加载器，他们需要或支持的模型配置都不尽相同。本页面将向您展示目前 MuiceBot 所有的模型加载器类所需要的不同配置。你也可以从 [_types.py](https://github.com/Moemu/MuiceBot/blob/main/Muice/llm/_types.py) 中获取所有支持的模型配置项。

### Azure (Github Models)

```yaml
loader: Azure # 使用 Azure 加载器（必填）
model_name: DeepSeek-R1 # 模型名称（必填）
api_key: <your-github-token-goes-here> # GitHub Token 或 Azure Key（必填）
template: Muice # 使用的模板名称（可选，无默认值）
max_tokens: 1024 # 模型生成的最大 token 数（可选，默认为 1024）
temperature: 0.75 # 模型生成的温度参数（可选）
top_p: 0.95 # 模型生成的 Top_p 参数（可选）
frequency_penalty: 1.0 # 模型的频率惩罚（可选）
presence_penalty: 0.0 # 模型的存在惩罚（可选）
stream: false # 流式对话
multimodal: false # 是否启用多模态（可选。注意：使用的模型必须是多模态的）
function_call: false # 是否启用工具调用（可选。需要编写 function call 插件并启用）
```

### Dashscope (阿里百炼大模型平台)

```yaml
loader: Dashscope # 使用 Dashscope 加载器（必须）
model_name: qwen-max # 模型名称（必须）
template: Muice # 使用的模板名称（可选，无默认值）
multimodal: false # 是否启用多模态（可选。注意：使用的模型必须是多模态的）
api_key: xxxxxx # API 密钥（必须）
max_tokens: 1024 # 模型生成的最大 token 数（可选，默认为 1024）
temperature: 0.7 #  模型生成的温度参数（可选，默认为 0.7）
top_p: 0.95 # 模型生成的 Top_p 参数（可选）
repetition_penalty: 1.2 # 模型生成的重复惩罚（可选）
stream: false # 流式对话
online_search: false # 联网搜索（目前仅支持 qwen-max/plus/turbo 系列模型）
function_call: false # 是否启用工具调用（可选。需要编写 function call 插件并启用）
content_security: false # 内容安全（可选。需要开通内容审核服务。不支持 Qwen-VL、Qwen-Audio 系列模型）
```

### Gemini (Google)

```yaml
loader: Gemini # 使用 Dashscope 加载器（必须）
model_name: gemini-2.0-flash # 模型名称（必须）
template: Muice # 使用的模板名称（可选，无默认值）
multimodal: false # 是否启用多模态（可选。注意：使用的模型必须是多模态的）
# modalities: ["text", "image"]  # 启用的返回模态（使用多模态的画图功能时才取消注释此配置项）
api_key: xxxxxx # API 密钥（必须）
max_tokens: 1024 # 模型生成的最大 token 数（可选，默认为 1024）
temperature: 0.7 #  模型生成的温度参数（可选，默认为 0.7）
top_p: 0.95 # 模型生成的 Top_p 参数（可选）
top_k: 3 # 模型生成的 Top_k 参数（可选）
presence_penalty: 1.5 # 存在惩罚系数，用于调整已出现的词的概率
frequency_penalty: 1.0 # 频率惩罚系数，用于调整频繁出现的词的概率
stream: false # 流式对话
online_search: false # 联网搜索
function_call: false # 是否启用工具调用（可选。需要编写 function call 插件并启用）
content_security: false # 内容安全（可选。默认为中级及以上）
```

### Ollama

```yaml
loader: Ollama # 使用 Ollama 加载器（必填）
model_name: deepseek-r1 # ollama 模型名称（必填）
template: Muice # 使用的模板名称（可选，无默认值）
api_host: http://localhost:11434 # ollama 客户端端口（可选）
top_k: 20 #从概率分布中选择最高概率的前k个候选项
top_p: 0.9 # 从概率分布中选择累积概率达到阈值p的候选项
temperature: 0.8 # 温度参数，用于调整概率分布的形状
repeat_penalty: 1.2 # 模型的重复惩罚
presence_penalty: 1.5 # 存在惩罚系数，用于调整已出现的词的概率
frequency_penalty: 1.0 # 频率惩罚系数，用于调整频繁出现的词的概率
stream: false # 流式对话
multimodal: false # 是否启用多模态（可选。注意：使用的模型必须是多模态的）
function_call: false # 是否启用工具调用（可选。需要编写 function call 插件并启用）
```

### Openai (支持 DeepSeek 官方 API 调用)

```yaml
loader: Openai # 使用 openai 加载器（必填）
model_name: text-davinci-003 # 模型名称（必填）
template: Muice # 使用的模板名称（可选，无默认值）
api_key: xxxxxx # API 密钥（必须）
api_host: https://api.openai.com/v1 # 服务器 API 接口地址 （可选，默认 OpenAI 服务）
max_tokens: 1024 # 模型生成的最大 token 数（可选，默认为 1024）
temperature: 0.7 #  模型生成的温度参数（可选，默认为 0.7，对R1使用无效）
stream: false # 流式对话
multimodal: false # 是否启用多模态（可选。注意：使用的模型必须是多模态的）
# modalities: ["text", "audio"]  # 启用的返回模态（当使用 qwen-omni 时才取消注释此配置项）
# audio: {"voice": "Cherry", "format": "wav"}  # 多模态音频配置（当使用 qwen-omni 时才取消注释此配置项）
function_call: false # 是否启用工具调用（可选。需要编写 function call 插件并启用）
```