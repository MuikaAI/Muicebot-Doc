# 定时任务配置⏰

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

以上的配置文件定义了三个定时任务配置，以 `afternoon` 定时任务为例，它将在每一天的 12:30 向目标为 1234567890123 的用户或群组发送 "中午好呀各位~吃饭了没有？"

正如你所见，每个定时任务在 `schedule` 下以列表的形式进行配置。

其中 `id` 和 `trigger` 是 `nonebot_plugin_apscheduler` 的原始参数，分别代表定时任务名称和触发器。

`trigger` 项接受两个值 `cron` 与 `interval`，分别代表定时调度器和固定间隔执行器。

`args` 用于传入两个触发器所需要的不同的参数值，其中：

- `cron` 接受以下参数值： `year`、`month`、`day`、`week`、`day_of_week`、`hour`、`minute`、`second`、`start_date`、`end_date`、`timezone`

- `interval` 接受以下参数值： `week`、`day_of_week`、`hour`、`minute`、`second`、`start_date`、`end_date`、`timezone`

`ask` 和 `say` 虽作为可选参数但必须选择一个，分别代表了传递给模型的 prompt 和直接发送信息的文本内容

`target` 指定发送信息的目标用户/群聊 ID。对于非私聊场景，你可能需要提取 `.whoami` 指令中的群聊ID

定时任务运行引擎将在 `driver.on_bot_connect` 时启动，你也可以运行 `.schedule` 指令手动启动引擎