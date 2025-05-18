# DotEnv 配置文件📃

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
| `ENABLE_BUILTIN_PLUGINS` | bool = True                             | 启用内嵌插件                                                 |
| `ENABLE_ADAPTERS`        | list = ["~.onebot.v11", "~.onebot.v12"] | 在入口文件中启用的 Nonebot 适配器(仅 Debug 环境)             |

# YAML 配置文件⚙️

比起 dotenv ，yaml 配置给我们提供了更大的灵活性。因此我们也将使用 yaml 语法撰写更加灵活的配置。

在机器人目录上新建 `configs` 文件夹，下面的配置都在此文件夹中新建。

## 模型配置(models.yml)

在 `configs` 文件夹下新建 `models.yml`，用于存储模型加载器的配置。

对于不同的模型加载器，所需要的配置项都大不相同。但大体遵循这样一个格式:

```yaml
<model_config_name>: # 配置名称。唯一，可任取，不一定和模型加载器名称有关联
  loader: <model_loader_name> # 模型加载器名称。对应的是 `muicebot/llm` 下的 `.py` 文件。通常模型加载器的首字母都是大写
  template: Muice # 人设提示词 Jinja2 模板名称（不用带文件后缀）
  config1: value1 # 具体的配置项和值
  ...
```

下面是 Azure 模型加载器的一个示例配置，您可以在 [模型加载器配置](/model/configuration) 一节中获取这些模型加载器分别所需要的配置。

```yaml
azure:
  loader: Azure # 使用 azure 加载器
  model_name: DeepSeek-R1 # 模型名称（可选，默认为 DeepSeek-R1）
  template: Muice # 人设提示词 Jinja2 模板名称（不用带文件后缀）
  api_key: ghp_xxxxxxxxxxxxxxxxx # GitHub Token（若配置了环境变量，此项不填）
  system_prompt: '我们来玩一个角色扮演的小游戏吧，现在开始你是一个名为的“沐雪”的AI女孩子，用猫娘的语气和我说话。' # 系统提示（可选）
  auto_system_prompt: true # 自动配置沐雪的系统提示（默认为 false）
```

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

在某个模型配置中配置 `default: true` 即可将此模型配置设为默认。如果没有默认的模型配置，则会加载第一个。

**至少存在一个模型配置作为默认配置**

在聊天中使用 `.load <model_config_name>` 指令（仅超级管理员）即可动态切换配置文件，比如 `.load xfyun`。

若手动更改 `models.yml` 配置文件也能触发配置更新（注意：此操作不会有bot消息提示，只有控制台输出）。


至此，模型配置这一节就差不多介绍完了。但下面的一些模型配置项也值得一谈，它们对每个模型加载器都是共有的：

```yaml
loader: Xfyun # 模型加载器名称，这些模型加载器位于插件目录下的 llm 文件夹中，并初始化同名文件的同名类，如果不存在则报错。注意，每个模型加载器因为兼容问题，开头首字母都是大写的
multimodal: true # 多模态支持。目前仅支持 Dashscope 加载器。设置为 true 将处理图片事件。如果调用的模型不是多模态模型将引发报错

template: Muice # 人设提示词 Jinja2 模板，模板文件需要存放在 `./templates` 文件夹下。Muice为内嵌模板。默认值为空或全局默认值
template_mode: system # 模板嵌入模式: `system` 为嵌入到系统提示; `user` 为嵌入到用户提示中。默认为 `system`
```

其中，沐雪人设模板文件存放于：[Muice.jinja2](https://github.com/Moemu/MuiceBot/blob/main/muicebot/builtin_templates/Muice.jinja2)

关于人设文件的具体写法，请参考 [人设模板的撰写](/develop/template)


如果一切顺利，以 QQ 适配器为例，在运行 `nb run` 后，你将会看到以下输出，这表明 Bot 已经开始工作：

```shell
(MuxueBot) C:\Users\Muika\Desktop\nonebot-plugin-muice>nb run
[SUCCESS] init: NoneBot is initializing...
[INFO] init: Current Env: prod
[SUCCESS] load_plugin: Succeeded to load plugin "nonebot_plugin_alconna:uniseg" from "nonebot_plugin_alconna.uniseg"
[SUCCESS] load_plugin: Succeeded to load plugin "nonebot_plugin_waiter"
[SUCCESS] load_plugin: Succeeded to load plugin "nonebot_plugin_alconna"
[SUCCESS] load_plugin: Succeeded to load plugin "nonebot_plugin_localstore"
[SUCCESS] load_plugin: Succeeded to load plugin "nonebot_plugin_apscheduler"
[INFO] __init__: 数据库路径: C:\Users\Muika\AppData\Local\nonebot2\Muice\ChatHistory.db
[SUCCESS] load_plugin: Succeeded to load plugin "Muice"
[SUCCESS] run: Running NoneBot...
[SUCCESS] run: Loaded adapters: OneBot V12, OneBot V11, Telegram, QQ
[INFO] _serve: Started server process [40776]
[INFO] startup: Waiting for application startup.
[INFO] _start_scheduler: Scheduler Started
[INFO] load_model: 正在加载模型...
[INFO] load_model: 模型加载成功
[INFO] on_startup: MuiceAI 聊天框架已开始运行⭐
[INFO] startup: Application startup complete.
[INFO] _log_started_message: Uvicorn running on http://127.0.0.1:8080 (Press CTRL+C to quit)
[INFO] log: QQ | Bot 123456789 connected
```

现在，当你 @ 机器人或执行命令时 Bot 将开始回复消息流程，除此之外它不会做任何事，除非定时任务开始。

可以愉快地和机器人玩耍啦！⭐

## 定时任务(schedules.yml)

在 `configs` 文件夹下新建 `schedules.yml`，用于存储定时任务调度器的配置。

众所周知，MuiceBot 基于 `nonebot_plugin_apscheduler` 的定时任务，可定时向大语言模型交互或直接发送信息。这也是沐雪系列模型的一个特色之一，尽管其效果确实不是很好（

有关定时任务的配置格式大致与 `models.yml` 相同，同样支持多个定时任务配置：

```yaml
<schedule_config_name>: # 配置名称。唯一，可任取，不一定和模型加载器名称有关联
  trigger: <cron/interval> # 调度器种类，分别为定时调度器和固定间隔执行器
  args: # 调度器参数，详见下方的说明
    arg1: value1
    arg2: value2
  <ask/say>: some words # 两个可选参数，ask代表的是向模型传入的字符串，say是直接输出给用户的消息文本
  target: # 定时任务目标，具体参数参考下方给出的链接
    detail_type: private/group
    args: ...
```

下面是一个配置文件示例。

```yaml
morning:
  trigger: cron
  args:
    hour: 8
    minute: 30
  ask: <日常问候：早上>
  target: '123456789'  # 私聊（目标用户ID）

afternoon:
  trigger: cron
  args:
    hour: 12
    minute: 30
  say: 中午好呀各位~吃饭了没有？
  target: '1234567890123'  # 群聊（目标群聊ID）

auto_create_topic:
  trigger: interval
  args:
    minutes: 30
  random: 1
  ask: "<生成推文: 胡思乱想>"
  target: '1234567890123'
```

正如你所见，每个定时任务在 `schedule` 下以列表的形式进行配置。

其中 `id` 和 `trigger` 是 `nonebot_plugin_apscheduler` 的原始参数，分别代表定时任务名称和触发器。

`trigger` 项接受两个值 `cron` 与 `interval`，分别代表定时调度器和固定间隔执行器。

`args` 用于传入两个触发器所需要的不同的参数值，其中：

- `cron` 接受以下参数值： `year`、`month`、`day`、`week`、`day_of_week`、`hour`、`minute`、`second`、`start_date`、`end_date`、`timezone`

- `interval` 接受以下参数值： `week`、`day_of_week`、`hour`、`minute`、`second`、`start_date`、`end_date`、`timezone`

`ask` 和 `say` 虽作为可选参数但必须选择一个，分别代表了传递给模型的 prompt 和直接发送信息的文本内容

`target` 指定发送信息的目标用户/群聊 ID。对于非私聊场景，你可能需要提取 `.whoami` 指令中的群聊ID

定时任务运行引擎将在 `driver.on_bot_connect` 时启动，你也可以运行 `.schedule` 指令手动启动引擎


## 插件配置(plugins.yml)

根据 Nonebot 的官方文档，普通的 Nonebot 项目需要在 `.env` 文件中填写插件配置。

由于 dotenv 文件的编写总是不那么轻松，而且当插件配置项一多时，可读性就不是很高了。因此我们引入了 yaml 插件配置，与此同时兼容原先的 `.env` 文件（yaml 优先级更高）。

在 `configs` 文件夹下新建 `plugins.yml` 文件。

假设现在有一个 `weather` 插件，它的插件配置脚本如下：

```python
from pydantic import BaseModel, field_validator

class ScopeConfig(BaseModel):
    api_key: str
    base_url: str = "https://api.openweathermap.org/data/2.5/weather"

class Config(BaseModel):
    weather: ScopeConfig
```

在它的插件文档中，它要求我们这样编写 `.env` 文件：

```dotenv
WEATHER__API_KEY=123456
WEATHER__BASE_URL=https://api.openweathermap.org/data/2.5/weather
```

你可以看到这个插件使用了 `env_nested_delimiter` 配置，以 `weather` 作为前缀。

那么我们可以这样编写我们的 `plugins.yml` 文件：

```yaml
weather:
  api_key: 123456
  base_url: https://api.openweathermap.org/data/2.5/weather
```

这样当插件调用 `plugin_config = get_plugin_config(Config).weather` 时就能正常获取到 api_key 和 base_url 。

> [!WARNING]
>
> 为了保险起见，我们仍然建议 Nonebot 相关运行配置仍然写在 dotenv 文件中（比如适配器配置和超级用户配置），
> 而像模型配置、插件配置、调度器配置等这些 MuiceBot 中特有的配置我们就可以使用 yaml 格式编写配置文件


## 内嵌插件配置(plugins.yml)

### access_control(黑白名单管理)

这个插件可以设置黑白名单，用于过滤用户和群聊的消息

默认启用黑名单机制，只有在白名单存在且黑名单为空时才会启用白名单

白名单仅能设置群聊ID，而黑名单能同时设置用户和群聊ID

你可以通过 `.whoami` 指令获取当前的用户ID和群聊ID，目前带参数的选项还在开发中。

```yaml
access_control:
  whitelist: ["telegram_Telegram_7312500650_-1002344076710_1580"]
  blacklist: []
```