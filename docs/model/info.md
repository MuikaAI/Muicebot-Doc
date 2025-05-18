# 模型加载器信息

## 实现的加载器及其支持的模型

我们目前实现了以下模型加载器:

| 模型加载器                                                   | 介绍                                                         | 支持的模型列表                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| [Azure](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Azure.py) | 可调用 [GitHub Marketplace ](https://github.com/marketplace/models)中的在线模型 | [*模型列表*](https://github.com/marketplace?type=models)     |
| [Dashscope](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Dashscope.py) | 可调用阿里云百炼平台的在线模型                               | [*模型列表*](https://help.aliyun.com/zh/model-studio/getting-started/models) |
| [Llmtuner](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Llmtuner.py) | 可调用 [LLaMA-Factory](https://github.com/hiyouga/LLaMA-Factory/tree/main) 支持的模型 | [*模型列表*](https://github.com/hiyouga/LLaMA-Factory/blob/main/README_zh.md#模型) |
| [Ollama](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Ollama.py) | 使用 Ollama Python SDK 访问 Ollama 接口，需要提前启动模型服务 | [*模型列表*](https://ollama.com/search)                      |
| [Openai](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Openai.py) | 可调用 OpenAI API 格式的接口，支持 DeepSeek 官方API          | *any*                                                        |
| [Rwkv](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Rwkv.py) | 使用 [RWKV-Runner](https://github.com/josStorer/RWKV-Runner) 提供的 API 服务访问 RWKV 模型 | *RWKV-any*                                                   |
| [Transformers](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Transformers.py) | 使用 transformers 方案加载, 适合通过 P-tuning V2 方式微调的模型 | ChatGLM                                                      |
| [Xfyun](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Xfyun.py) | 可调用由 [星火大模型精调平台](https://training.xfyun.cn/) 微调的在线模型 | [*模型列表*](https://training.xfyun.cn/modelSquare)          |

对于不同的加载器，可能需要额外的依赖，请根据报错提示安装。

有关各个模型加载器的配置，参见 [模型加载器配置](/model/configuration.md)

## 加载器功能支持列表

本页面将向您展示目前所有模型加载器支持功能的情况，以便帮助您更好的配置模型

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


关于部分模型加载器的 ⭕ 标记

1. `Azure` 的推理模型调用可能因为各种各样的原因出现报错或长响应时间

2. `Dashscope` 的联网搜索功能疑似存在问题，要么不承认自己会联网搜索，要么生成到一半然后胡言乱语； Function Call 疑似与该功能冲突

3. `Dashscope` 因内部API原因，使用 `qvq-32b` 会出现思考死循环；`qwen-omni` 需要使用 `OpenAI` 加载器加载

4. `Gemini` 无法返回思考过程。其多模态文件输入有限制，支持的文件类型另请参阅[官方文档](https://ai.google.dev/gemini-api/docs/document-processing?hl=zh-cn&lang=python)

5. 对于 `Openai` 和 `Gemini` 加载器，如需使用代理，请配置 `HTTP_PROXY` 和 `HTTPS_PROXY` 变量