# 从 Muice-Chatbot 中迁移

> 相伴二余载，出发下一站

由于 Muice-Chatbot 已停止功能性更新，我们强烈建议您从 Muice-Chatbot 迁移至 MuiceBot ，本章内容将向您介绍 Muice-Chatbot 与 MuiceBot 中的差异和迁移教程，以便帮助您决定何时如何迁移。

## 实现差异

Muice-Chatbot 通过搭建 Onebot V11 反向 WebSocket 服务实现机器人服务，代码可读性差，不容易扩展，在部分 Onebot 实现上容易出现问题；
但 MuiceBot 基于 Nonebot 机器人框架，通过多种适配器实现完美兼容各类聊天平台，具体服务实现隐藏在适配器代码中，让开发者专注于聊天交互逻辑处理，代码鲁棒性好，不容易抛出错误。

## 尚未实现的功能

本节向您介绍 MuiceBot 还未实现的 Muice-Chatbot 功能，以便帮助您决策是否开始迁移。

| 特性           | Muice-Chabot | MuiceBot                                      |
| -------------- | ------------ | --------------------------------------------- |
| 适配器支持      | Onebot V11   | 支持包括 Onebot 协议在内的多种 Nonebot 适配器 |
| 模型加载器实现  | 本地+远程    | 本地(ollama)+远程                             |
| 主动对话       | 支持         | 支持                                          |
| 指令           | 支持         | 部分移除                                      |
| OFA 图像识别   | 支持         | 尚未支持                                      |
| 语音合成       | fish-speech  | 尚未支持                                      |
| Faiss 记忆模块 | 支持         | 尚未支持                                      |

请注意: 由于依赖树太大，我们移除了 `llmtuner` 模型加载器，请使用 `ollama` 或换用在线 API 作为替代

## 环境迁移

我们十分建议您重新搭建环境并重新撰写配置文件，直接在旧环境上运行可能出现问题。参见：[快速开始](/guide/setup)

在迁移之前，我们同时建议您阅读 Nonebot 的文档，就算您不打算贡献代码或深挖机器人背后的实现：[快速上手 | NoneBot](https://nonebot.dev/docs/quick-start)

## 数据库迁移

与 Muice-Chatbot 不同， MuiceBot 使用了 SQLite3 数据库保存对话数据，提升了数据读取性能和数据安全性，本节将指导您如何从 Muice-Chatbot 的数据文件中迁移。

> [!WARNING]
>
> 本篇教程不适用于 Faiss 向量记忆的数据库迁移，因为 MuiceBot 尚未实现（

按照 [快速开始](/guide/setup) 配置好 Muicebot 后，首先运行一次 MuiceBot ，获取数据库路径：

```shell
03-18 09:56:50 [INFO] Muice | 数据库路径: C:\Users\Muika\AppData\Local\nonebot2\Muice\ChatHistory.db
```

然后找到 Muice-Chatbot 的 `memory` 文件夹，复制文件路径：

```
D:\Muice-Chatbot\memory
```

执行数据库迁移脚本：

```shell
python migrations.py D:\Muice-Chatbot\memory C:\Users\Muika\AppData\Local\nonebot2\Muice\ChatHistory.db
```

当输出 "✅迁移完成！" 时表示数据库已迁移完成并在 MuiceBot 上可用

> [!NOTE]
>
> MuiceBot 目前通过 session 会话信息获取对话历史上下文，通常情况下这与 Muice-Chatbot 数据文件的命名一致，但也存在迁移后还是无法获取以前的历史上下文的可能性。这种情况下请考虑手动编辑 MuiceBot 的数据库中的 `USERID` 列, 此内容可通过 `.whoami` 命令中的会话信息获得