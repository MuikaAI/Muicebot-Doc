# 嵌入模型配置📎

## 嵌入模型提供者信息

类似于模型加载器，在 Muicebot 中，每一个可用于获取字符串的嵌入向量形式的嵌入模型被称为嵌入模型加载器，这些模型加载器存放于代码目录中的 `muicebot.llm.embeddings` 文件夹下，并通常以首字母大写的形式命名以便于 SDK 区分。

每个嵌入模型加载器都继承于模型基类 `EmbeddingModel` 并统一使用 `EmbeddingConfig` 获取配置项，但由于 SDK 实现情况，每个嵌入模型加载器所需要的配置项和实现的功能都不尽相同。

**嵌入模型的配置是可选的，当且仅当你安装了需要使用嵌入模型的插件（比如 muicebot-plugin-memory）时才需要配置**

本页面列举了每一个嵌入模型加载器目前在 Muicebot 中实现的功能并给出了它们所支持的配置项。

### 实现的加载器及其支持的模型

我们目前实现了以下模型加载器:

| 模型加载器                                                                      | 介绍                                                                            | 模型列表                                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Azure](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Azure.py)         | 可调用 [GitHub Marketplace ](https://github.com/marketplace/models)中的在线模型 | [Github MarketPlace](https://github.com/marketplace?type=models)           |
| [Dashscope](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Dashscope.py) | 可调用阿里云百炼平台的在线模型                                                  | [官方文档](https://help.aliyun.com/zh/model-studio/getting-started/models) |
| [Gemini](https://aistudio.google.com/)                                          | 使用 Gemini Python SDK 访问 Google Gemini 服务中的模型                          | [模型列表](https://ai.google.dev/gemini-api/docs/models?hl=zh-cn)          |
| [Ollama](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Ollama.py)       | 使用 Ollama Python SDK 访问 Ollama 接口，需要提前启动 Ollama 服务器             | [模型列表](https://ollama.com/search)                                      |
| [Openai](https://github.com/Moemu/MuiceBot/tree/main/Muice/llm/Openai.py)       | 可调用 OpenAI API 格式的接口                                                    | _any_                                                                      |

对于不同的加载器，可能需要额外的依赖，请根据报错提示安装。

## 编写配置

在 `configs` 文件夹下新建 `embeddings.yml`，用于存储嵌入模型加载器的配置。

**基本格式**

对于不同的模型加载器，所需要的配置项都大体相似。以下示例列出了所有支持的配置项。

```yaml
default: # 配置名称。唯一，可任取，不一定和模型加载器名称有关联
  provider: openai # 模型加载器名称。对应的是 `muicebot/llm/providers` 下的 `.py` 文件。
  default: true # 是否默认
  model: "text-embedding-v4" # 嵌入模型名称
  api_key: sk-xxxxxxxxxxxxxxxxxxx # 在线服务的 api key
  api_secret: 0d000721Onanie # 在线服务的 api secret(对于 Openai 来说可忽略)
  api_host: "https://dashscope.aliyuncs.com/compatible-mode/v1" # base_url
```

## 关于嵌入信息的统一性

一般来说，我们强烈推荐**有且仅有一个长久使用的嵌入模型配置**，因为对于一段文本来说，不同嵌入模型返回的结果都大不相同，如果使用不同的模型会导致最终计算的结果失准或产生异常错误。

不需要保证大语言模型和嵌入模型的模型加载器/模型类别是相同的。目前仅支持查询文本的向量嵌入

## 嵌入的缓存

每一次查询嵌入都会优先从本地收集缓存，目的是节省缓存查询次数和开销。缓存目录为 `get_plugin_data_dir() / embedding`

为了确保在切换缓存模型时，原有的缓存与新的嵌入不会产生冲突，我们同时写入了以下 `json` 内容来确保缓存安全：

```json
{
  "provider": "<模型提供者类名>",
  "api_host": "<self.config.api_host>",
  "model": "<self.config.model>",
  "text_hash": "<文本的 sha256 内容>"
}
```
