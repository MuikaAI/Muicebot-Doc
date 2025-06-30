# 使用插件🧩

## 使用 Nonebot2 插件

本项目完全兼容基于原生 Nonebot2 开发的插件，您只需要按照 `nb plugin install` 的正常方式安装插件即可

## 使用 Muicebot 插件

Muicebot 插件可用于引入新的 Function Call 函数或实现更多好玩的功能，也欢迎您为 Muicebot 编写更多的插件！

Muicebot 插件开发文档: [开发 Muicebot 插件](/develop/plugin)

### 自定义插件

Muicebot 时会自动查找 `plugins` 文件夹下的插件并加载(`load_plugins`)，因此你可以在此文件夹中放入您获取或自编写的 Muicebot 插件

> [!WARNING]
>
> 十分不建议使用此方式加载 Nonebot 或其他 Bot 插件，这样可能导致意想不到的后果，除非你是插件开发者或知道你在干什么

### 商店插件

Muicebot 的插件索引库为 [MuikaAI/Muicebot-Plugins-Index](https://github.com/MuikaAI/Muicebot-Plugins-Index)

您可以通过 `.store` 命令安装插件等操作，`.store` 命令常见的用法如下:

- `.store install <插件名>` 安装插件
- `.store show` 查看已安装的插件信息
- `.store update <插件名>` 更新插件
- `.store uninstall <插件名>` 卸载插件

安装 `Muicebot-Plugin-Status` 插件：

> .store install picstatus

### 内嵌插件

Muicebot 内嵌了一系列插件优化对话体验(`builtin_plugins`)，而无意实现其他额外功能。

你可以通过以下全局配置关闭内嵌插件，但这样做会丢失一些功能（比如无法格式化思考模型产生的结果），我们不建议你们这么做。

```dotenv
ENABLE_BUILTIN_PLUGINS=False
```

以下是所有内嵌插件的列表及它们所实现的功能。

| 插件名                | 功能                                                            |
| --------------------- | --------------------------------------------------------------- |
| muicebot_plugin_store | 可以从 Muicebot 插件索引库中安装、更新插件                      |
| access_control        | 提供黑白名单机制                                                |
| get_current_time      | Function Call插件: 用于获取当前时间                             |
| ~~get_username~~      | Function Call插件: 获取当前用户名（即将弃用，建议使用人设模板） |
| thought_processor     | Hook插件: 能够提取思考模型的思考过程和思考结果                  |

部分内嵌插件存在可选配置：

- muicebot_plugin_store:
  - `STORE_INDEX`
    说明: 商店索引文件获取位置，当网络受限时你可修改此选项
    默认值: `"https://raw.githubusercontent.com/MuikaAI/Muicebot-Plugins-Index/refs/heads/main/plugins.json"`

- access_control:
  - `access_control__whitelist`
    说明: 白名单列表。当白名单列表为空时不启用。只能设置群聊ID
    默认值: []
  - `access_control__blacklist`
    说明: 黑名单列表。无论是否为空都默认启用黑名单，除非白名单不为空。能同时设置用户和群聊ID
    默认值: []

- thought_processor:

  _参考全局配置项_
