# 全局配置📃

`.env` 是 NoneBot 框架及其适配器使用的配置文件。而 MuiceBot 也使用 `.env.{environment}` 配置基本配置。

在机器人目录下新建 `.env` 或 `.env.prod` 配置文件，并用 Dotenv 格式撰写配置项。

目前支持的配置有:

| 配置项                   | 类型(默认值)                            | 说明                                                         |
| ------------------------ | --------------------------------------- | ------------------------------------------------------------ |
| `MUICE_NICKNAMES`        | list = ["muice"]                        | 沐雪的自定义昵称，作为消息前缀条件响应信息事件               |
| `DEFAULT_TEMPLATE`       | Optional[str] = None                    | 默认使用的人设模板。None为不使用                             |
| `MAX_HISTORY_EPOCH`      | int = 0                                 | 最大记忆历史轮数。0为全部使用                                |
| `THOUGHT_PROCESS_MODE`   | int = 2                                 | 针对 Deepseek-R1 等思考模型的思考过程提取模式。为0则不处理，1为提取思考过程和结果，2为仅输出结果 |
| `INPUT_TIMEOUT`          | int = 0                                 | 输入等待时间。在这时间段内的消息将会被合并为同一条消息使用   |
| `LOG_LEVEL`              | str = "INFO"                            | 日志等级                                                     |
| `TELEGRAM_PROXY`         | Optional[str] = None                    | tg适配器代理，并使用该代理下载文件                           |
| `STORE_INDEX`            | str = "...raw.githubusercontent.com..." | 商店索引文件获取位置，当网络受限时你可修改此选项               |
| `ENABLE_BUILTIN_PLUGINS` | bool = True                             | 启用内嵌插件                                                 |
| `ENABLE_ADAPTERS`        | list = ["~.onebot.v11", "~.onebot.v12"] | 在入口文件中启用的 Nonebot 适配器(仅 Debug 环境)             |

## 建议配置项一览

### 响应昵称配置🧸

正常情况下，MuiceBot 只会处理 `at_event` 事件或者是指令事件，对于某些客户端来说 @bot 的操作还是太麻烦了，有没有更加简单的方法？

有的兄弟，有的。我们可以定义一个响应前缀来让沐雪响应消息事件。

在 `.env` 文件中配置：

```dotenv
MUICE_NICKNAMES=["沐雪", "muice", "雪"]
```

这将响应前缀为“沐雪”、“muice”、“雪”的消息事件，且无需在响应前缀后面加入空格分隔符，比如下列的消息将被沐雪响应：

> 雪，今天的天气怎么样？

默认值: `["muice"]`

### 超级用户

超级用户可以执行例如 `.load` 之类改变机器人运行方式的指令，在配置文件中设置用户ID可以将其设为超级用户：

```dotenv
SUPERUSERS=["123456789"]
```

> [!NOTE]
>
> 用户 ID 不一定是平台上显示的 ID ，比如 QQ 频道中的用户 ID 就不是 QQ 号。对此我们推荐你使用 `.whoami` 指令获取当前用户 ID

*虽然但是，我的master只有一个哦*

默认值: `[]`

### 使用自定义插件/内嵌插件

目前的内嵌插件有:

- `access_control` Nonebot 黑白名单管理
- `get_current_time` 获取当前时间的 Function Call 插件
- `get_username` 获取当前对话用户名的 Function Call 插件
- `thought_processor` 思维链处理
- `muicebot_plugin_store` 商店插件管理

以下设置可以调整内嵌插件的开启或关闭

```dotenv
ENABLE_BUILTIN_PLUGINS=true
```

默认值: `true`

对于自定义的 Muicebot 或 Nonebot 插件，可以存放在机器人运行目录下的 `plugins` 文件夹下，程序启动时会自动加载。

### 加载指定的 Nonebot 适配器(仅 Debug 用途)

默认情况下，机器人入口文件只会加载 `nonebot.adapters.onebot.v11/12` 适配器，要想在 debug 环境中引入其他适配器，请参考：

```dotenv
enable_adapters = ["nonebot.adapters.onebot.v11", "nonebot.adapters.onebot.v12", "nonebot.adapters.telegram"]
```