# 插件开发

## 开发 Function Call 插件

工具调用是目前主流大语言模型的重要能力之一，使用工具函数，AI可以获得操作现实的能力并协助我们完成更多的日常任务。

让我们从获取天气的 `weather.py` 开始。

### 第一个插件

在 `muicebot/plugins` 下创建 `weather.py` 文件，填入：

```python
from muicebot.plugin import PluginMetadata
from muicebot.plugin.func_call import on_function_call
from muicebot.plugin.func_call.parameter import String
from pydantic import BaseModel, Field

# 插件元数据（发布到商店必备）
__plugin_meta__ = PluginMetadata(
    name="muicebot-plugin-weather",
    description="获取天气",
    usage="在配置文件中配置好 api_key 后通过 function_call 调用"
)

# 注册一个 Function Call 函数，并声明 location 参数
class Params(BaseModel):
    location: str = Field(description="城市。(格式:城市英文名,国家两位大写英文简称)")

@on_function_call(description="可以用于查询天气", params=Params)
async def get_weather(location: str) -> str:
    # 这里可以调用天气API查询天气，这里只是一个简单的示例
    return f"{location}的天气是晴天, 温度是25°C"
```

尽管这与 Nonebot 的插件编写基本一致，但这里还是有几个要点：

- 通过 `muicebot.plugin.PluginMetadata` 撰写插件元数据

- 通过 `@on_function_call` 装饰器注册可供 AI 直接调用的 `function_call` 函数。这里我们需要填写两个参数：

    - `description` 函数描述。这个字段会被传入到模型加载器的 `tools` 列表，来给 AI 决定何时调用

    - 通过装饰器的 `params` 参数定义工具参数模型（可选）

- **十分建议** 使用异步函数作为被修饰函数，无论是否有异步调用

### 声明 Function Call 工具参数

从 1.0.2 开始，Muicebot 支持 Pydantic 模型作为 Function Call 的参数声明参数，而逐渐弃用旧的 `.params` 方法。因为 Pydantic 模型更类型安全和灵活

具体流程如下:

编写一个 Function Call 函数的 Pydantic 参数模型:

```python
from pydantic import BaseModel, Field
from typing import Optional, List

class Paramparameters(BaseModel):
    code: str = Field(description="Python 代码")
    file_ids: Optional[List[str]] = Field(description="（可选）要操作的完整文件名(id_filename.suffix)列表", default=None)
```

然后注册一个 Function Call 函数，并传入参数模型类 `params`:

```python
@on_function_call("可用于运行 Python 代码的工具，具体代码将在 docker 沙盒环境安全运行。"
                  "是否允许联网取决于用户具体设置，默认情况下沙盒环境不允许联网。"
                  "要操作文件，请从 `./attachments/` 文件夹下通过文件名访问。"
                  "要输出文件，请在程序输出中加入<output>./path/filename.suffix</output>标签，标签内部为有效的文件路径",
                   params=Paramparameters)
async def handle_code(code: str, file_ids: Optional[list[str]] = None) -> str:
    files: list[Resource] = []
    for file_id in (file_ids or []):
        if file_id not in _file_ids.values():
            return "Files ID 不存在！"
        files.extend([file for file in _file_ids.keys() if _file_ids[file] == file_id])

    return "..."
```

运行或者 Debug ，然后看 AI 是否如预期一般调用了该函数。

### 依赖注入

MuiceBot 的 Function_call 插件支持 NoneBot2 原生的会话上下文依赖注入（暂不支持 `T_State`）:

- Event 及其子类实例
- Bot 及其子类实例
- Matcher 及其子类实例
- Muice 类(Muicebot only) (即将弃用，请改为使用 `Muice.get_instance()` 方法获取)

下面让我们使用依赖注入来给我们的 `weather.py` 添加一个简单获取用户名的功能

```python
from nonebot.adapters import Bot, Event
from nonebot.adapters.onebot.v12 import Bot as Onebotv12Bot
from pydantic import BaseModel, Field

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

class Params(BaseModel):
    location: str = Field(description="城市。(格式:城市英文名,国家两位大写英文简称)")

@on_function_call(description="可以用于查询天气", params=Params)
async def get_weather(location: str, bot: Bot, event: Event) -> str:
    username = await get_username(bot, event)
    return f"{username}你好，{location}的天气是晴天, 温度是25°C"
```

## 开发钩子函数插件

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