# 插件开发

## 使用 Nonebot2 插件

本项目完全兼容基于原生 Nonebot2 开发的插件，您只需要按照 `nb plugin install` 的正常方式安装插件即可

## 使用 Muicebot 插件

### 自定义插件

Muicebot 时会自动查找 `plugins` 文件夹下的插件并加载，因此你可以在此文件夹中放入您的自定义插件

对于依赖 `nonebot_plugin_localstore` 的插件，我们并不建议通过此方式加载，因为 `get_plugin_data_dir` 函数可能会返回一个非预期的插件目录

### 商店插件

Muicebot 的插件索引库为 [MuikaAI/Muicebot-Plugins-Index](https://github.com/MuikaAI/Muicebot-Plugins-Index)

您可以通过 `.store` 命令安装插件等操作，`.store` 命令常见的用法如下:

- `.store install <插件名>` 安装插件
- `.store update <插件名>` 更新插件
- `.store uninstall <插件名>` 卸载插件

## 开发 Function Call 插件

工具调用是目前主流大语言模型的重要能力之一，使用工具函数，AI可以获得操作现实的能力并协助我们完成更多的日常任务。

让我们从获取天气的 `weather.py` 开始。

### 第一个插件

在 `muicebot/plugins` 下创建 `weather.py` 文件，填入：

```python
from muicebot.plugin import PluginMetadata
from muicebot.plugin.func_call import on_function_call
from muicebot.plugin.func_call.parameter import String

__metadata__ = PluginMetadata(
    name="muicebot-plugin-weather",
    description="获取天气",
    usage="在配置文件中配置好 api_key 后通过 function_call 调用"
)

@on_function_call(description="可以用于查询天气").params(
    location = String(description="城市。(格式:城市英文名,国家两位大写英文简称)", required=True)
)
async def get_weather(location: str) -> str:
    # 这里可以调用天气API查询天气，这里只是一个简单的示例
    return f"{location}的天气是晴天, 温度是25°C"
```

尽管这与 Nonebot 的插件编写基本一致，但这里还是有几个要点：

- 通过 `muicebot.plugin.PluginMetadata` 撰写插件元数据

- 通过 `@on_function_call` 装饰器注册可供 AI 直接调用的 `function_call` 函数。这里我们需要填写一个参数：

    - `description` 函数描述。这个字段会被传入到模型加载器的 `tools` 列表，来给 AI 决定何时调用

- 通过装饰器的 `params` 方法定义函数参数（可选）

- **十分建议** 使用异步函数作为被修饰函数，无论是否有异步调用

### 依赖注入

MuiceBot 的 Function_call 插件支持 NoneBot2 原生的会话上下文依赖注入（暂不支持 `T_State`）:

- Event 及其子类实例
- Bot 及其子类实例
- Matcher 及其子类实例
- Muice 类（TODO）

下面让我们使用依赖注入来给我们的 `weather.py` 添加一个简单获取用户名的功能

```python
from nonebot.adapters import Bot, Event
from nonebot.adapters.onebot.v12 import Bot as Onebotv12Bot

from muicebot.plugin import PluginMetadata
from muicebot.plugin.func_call import on_function_call

# 省略部分代码...

async def get_username(bot: Bot, event: Event) -> str:
    '''
    根据具体适配器实现获取用户名
    '''
    userid = event.get_user_id()
    username = ""

    if isinstance(bot, Onebotv12Bot):
        userinfo = await bot.get_user_info(user_id=userid)
        username = userinfo.get("user_displayname", userid)

    if not username:
        username = userid

    return username

@on_function_call(description="可以用于查询天气").params(
    location = String(description="城市。(格式:城市英文名,国家两位大写英文简称)", required=True)
)
async def get_weather(location: str, bot: Bot, event: Event) -> str:
    username = await get_username(bot, event)
    return f"{username}你好，{location}的天气是晴天, 温度是25°C"
```

### 配置文件

现在，我们的天气函数只能返回固定的字段，还未能调用真实的 API 接口来获取更详细的天气信息。

为了使用 API 接口，我们需要 API Key，这时我们可以使用配置文件来安全地存储密钥。

新建 config.py ，填写：

```python
from pydantic import BaseModel, field_validator

class ScopeConfig(BaseModel):
    api_key: str
    base_url: str = "https://api.openweathermap.org/data/2.5/weather"

class Config(BaseModel):
    weather: ScopeConfig
```

MuiceBot 的插件配置模型写法和 Nonebot 模型写法是一样的，但这里我们使用了 scope 配置。事实上，对于 MuiceBot ，我们推荐使用 scope 写法从而避免在配置项前填写长长的插件前缀。

但最重要的理由是，我们推荐使用 YAML 语法填写 MuiceBot 的插件配置，参见：[配置文件](/guide/configuration)

然后像正常的 Nonebot 插件一样，加载插件配置即可。

参考 openweathermap 的接口文档，在 `weather.py` 中写入：

```python
from muicebot.plugin import on_function_call, String
from nonebot import logger
from nonebot import get_plugin_config
from .config import Config
import httpx

plugin_config = get_plugin_config(Config).weather # 获取插件配置

@on_function_call(description="可以用于查询天气").params(
    location = String(description="城市。(格式:城市英文名,国家两位大写英文简称)", required=True)
)
async def get_weather(location: str) -> str:
    """查询指定地点的天气信息"""
    base_url = plugin_config.base_url

    # 构建请求参数
    params = {
        "q": location,
        "appid": plugin_config.api_key,
        "units": "metric",  # 摄氏温度
        "lang": "zh_cn"     # 中文
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(base_url, params=params, timeout=10)

            if response.status_code != 200:
                logger.error(f"请求失败: {response.status_code} - {response.text}")
                return f"获取天气信息失败：{response.status_code}"

            data = response.json()

            # 解析返回的天气数据
            city = data.get("name", location)
            weather_desc = data["weather"][0]["description"]
            temp = data["main"]["temp"]
            humidity = data["main"]["humidity"]
            wind_speed = data["wind"]["speed"]

            # 格式化天气信息
            result = (
                f"{city} 的天气：\n"
                f"天气：{weather_desc}\n"
                f"温度：{temp}°C\n"
                f"湿度：{humidity}%\n"
                f"风速：{wind_speed} m/s"
            )
            return result

    except httpx.HTTPError as e:
        logger.error(f"HTTP请求异常: {str(e)}")
        return "获取天气信息失败，请稍后再试。"
    except Exception as e:
        logger.error(f"出现异常: {str(e)}")
        return "查询天气时发生错误，请检查日志。"
```

配置好后就可以运行了。你看，很简单不是吗？

## 使用钩子函数

在 `Muicebot` 的整个消息处理流程中，提供了 4 个钩子函数可以用来修改消息处理流程中的一些数据，从而有利于 TTS，记忆插件的编写

### on_before_pretreatment

这个钩子函数会在 `Muice._prepare_prompt()` 之前运行。支持依赖注入，可以注入 `Message` (如无特殊说明，以下的 `Message` 都出自 [Muicebot 的数据类](https://github.com/Moemu/MuiceBot/blob/main/muicebot/models.py)) 和 Nonebot 的原生依赖注入（如 `bot`, `Message` 对象）

```python
from muicebot.plugin.hook import on_before_pretreatment
from muicebot.models import Message

@on_before_pretreatment(priority=10)
def _(message: Message):
    message.message += "(已插入钩子函数)"
```

### on_before_completion

这个钩子函数会在将数据传入模型(`Muice` 的 `model.ask()`)之前调用。支持依赖注入，可以注入 `ModelRequest` 和 Nonebot 的原生依赖注入

```python
from muicebot.plugin.hook import on_before_completion
from muicebot.llm import ModelRequest
from nonebot.permission import SUPERUSER

@on_before_completion(rule=SUPERUSER)
def _(request: ModelRequest):
    request.system = "你是一个叫 Muika 的猫娘"
```

### on_stream_chunk

这个函数将在流式调用中途(`Muice` 的 `model.ask_stream()`)调用。支持依赖注入，可以注入 `ModelStreamCompletions` 和 Nonebot 的原生依赖注入

> [!TIP]
>
> 这个函数将依次获得流式迭代器中的所有包，因此可通过钩子函数修改流式输出
>
> 尽管我们没有引入额外的会话上下文信息帮助你判断当前包在哪个对话中，但是你仍然可以通过 Nonebot 的原生上下文注入和全局变量帮助你实现实现会话存储和定位

```python
# muicebot/builtin_plugins/thought_processor.py

import re
from dataclasses import dataclass

from nonebot.adapters import Event

from muicebot.config import plugin_config
from muicebot.llm import ModelCompletions, ModelStreamCompletions
from muicebot.models import Message
from muicebot.plugin.hook import on_after_completion, on_finish_chat, on_stream_chunk

_PROCESS_MODE = plugin_config.thought_process_mode
_STREAM_PROCESS_STATE: dict[str, bool] = {}
_PROCESSCACHES: dict[str, "ProcessCache"] = {}


@dataclass
class ProcessCache:
    thoughts: str = ""
    result: str = ""

@on_stream_chunk(priority=1)
def stream_processor(chunk: ModelStreamCompletions, event: Event):
    session_id = event.get_session_id()
    cache = _PROCESSCACHES.setdefault(session_id, ProcessCache())
    state = _STREAM_PROCESS_STATE

    # 思考过程中
    if "<think>" in chunk.chunk:
        state[session_id] = True
        cache.thoughts += chunk.chunk.replace("<think>", "")
        if _PROCESS_MODE == 1:
            chunk.chunk = chunk.chunk.replace("<think>", "思考过程: ")
        elif _PROCESS_MODE == 2:
            chunk.chunk = ""
        return

    # 思考结束
    elif "</think>" in chunk.chunk:
        del state[session_id]
        cache.result += chunk.chunk.replace("</think>", "")
        if _PROCESS_MODE == 1:
            chunk.chunk = chunk.chunk.replace("</think>", "\n\n")
        elif _PROCESS_MODE == 2:
            chunk.chunk = chunk.chunk.replace("</think>", "")
        return

    # 思考过程中
    elif state.get(session_id, False):
        cache.thoughts += chunk.chunk
        if _PROCESS_MODE == 2:
            chunk.chunk = ""

    # 思考结果中
    else:
        cache.result += chunk.chunk
```

### on_after_completion

这个钩子函数会在将数据传入模型(`Muice` 的 `model.ask()`)之后调用。支持依赖注入，可以注入 `ModelCompletions` 和 Nonebot 的原生依赖注入

> [!INFO]
>
> 当启用流式时，将传入完整的 `ModelCompletions` 构造。此时，仅支持 Resources 属性的修改。
> 尽管如此，对于 TTS 任务，已经完全够用

```python
# edge_tts.py
from muicebot.plugin.hook import on_after_completion
from muicebot.models import Resource
from muicebot.llm import ModelCompletions
from nonebot import logger
import tempfile
import edge_tts

VOICE = "zh-CN-XiaoxiaoNeural"  # 可配置

# 合成并播放 TTS 音频
async def synthesize_and_play(text: str) -> str:
    logger.info("tts处理中...")
    communicate = edge_tts.Communicate(text, VOICE)
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        path = f.name
    await communicate.save(path)

    logger.info(f"[TTS] 合成完成: {path}")

    return path

@on_after_completion(priority=20)
async def tts_after_completion(completions: ModelCompletions):
    text = completions.text.strip()
    if text:
        path = await synthesize_and_play(text)
        completions.resources.append(Resource(type='audio', path=path))
```

`on_after_completion` 修饰器还支持传入 `stream` 参数，用于是否仅在(非)流式中处理，默认为无限制

### on_finish_chat

这个钩子函数会在结束对话(存库前)调用。支持依赖注入，可以注入 `Message` 和 Nonebot 的原生依赖注入

```python
from muicebot.plugin.hook import on_finish_chat
from muicebot.models import Message
from nonebot.permission import SUPERUSER
from muicebot_plugin_memory import save_memory

@on_finish_chat()
def _(message: Message):
    await save_memory(message.text, message.respond)
```