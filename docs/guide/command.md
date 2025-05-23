# 指令介绍🕹️

## 一般内嵌指令

MuiceBot 内嵌了多种指令方便开发者开发和日常聊天，只需使用前缀 “.” 或 “/” 即可调用指令。

调用 `.help` 将返回指令说明（无需 @ 机器人）

> 基本命令：
> help 输出此帮助信息
> status 显示当前状态
> refresh 刷新模型输出
> reset 清空对话记录
> undo 撤回上一个对话
> load <config_name> 加载模型
> whoami 输出当前会话信息以便调试
> （支持的命令前缀：“.”、“/”）

调用 `.status` 将返回 Bot 运行状态，包括了模型状态和定时任务调度器状态

> 当前模型加载器：Xfyun
> 模型加载器状态：运行中
> 多模态模型: 否

调用 `.load <config_name>` 将加载新的模型加载器配置文件，比如 `.load model.dashscope`。此指令仅限超级用户操作。

> 已成功加载 model.dashscope

> .status

> 当前模型加载器：Dashscope
> 模型加载器状态：运行中
> 多模态模型: 是

当 `.load` 未提供任何参数时将加载默认配置文件。

需要注意的一点是，`.undo` 不是撤回 Bot 的发言，而是撤回*消息发送者*的上一次对话事件，将其从数据库中删除而不是调用适配器撤回接口

一些命令虽然不存在于文档中，但它确实存在于代码，比如 `.schedule` 。这个指令虽然不会返回任何东西，但它负责启用定时任务引擎。对于某些适配器连接后不会触发 `driver.on_bot_connect` 的事件，其非常有用

## 商店插件指令

当启用内嵌插件时，商店插件将自动加载。插件索引库位置: [MuikaAI/Muicebot-Plugins-Index](https://github.com/MuikaAI/Muicebot-Plugins-Index)

有关商店插件的指令都是以 `.store` 为前缀，可以通过 `.store help` 获取所有可用的商店指令

> install <插件名> 安装插件
> show 查看已安装的商店插件信息
> update <插件名> 更新插件
> uninstall <插件名> 卸载插件