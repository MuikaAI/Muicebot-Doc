# API 参考

以下列出了 Muicebot 中常见的 API 接口和类以供插件开发者们使用

## muicebot.muice

本模块负责主消息处理流程

### class Muice

Muice 交互类（主消息处理流程），以单例模式提供

可以通过 `Muice()` 或者是 `Muice.get_instance()` 方法获得以供 Muice 实例

#### def ask(self, session: async_scoped_session, message: Message,enable_history: bool = True, enable_plugins: bool = True,)

- **说明**
  调用模型（完整的消息处理流程）

- **参数**
  - `session:async_scoped_session` 数据库会话
  - `message:Message` 消息主体
  - `enable_history:bool` 是否启用历史记录
  - `enable_plugins:bool` 是否启用工具插件

- **返回**
  - `ModelCompletions` 模型回复

#### def ask_stream(self, session: async_scoped_session, message: Message,enable_history: bool = True, enable_plugins: bool = True,)

- **说明**
  流式调用模型（完整的消息处理流程）

- **参数**
  - `session:async_scoped_session` 数据库会话
  - `message:Message` 消息主体
  - `enable_history:bool` 是否启用历史记录
  - `enable_plugins:bool` 是否启用工具插件

- **返回**
  - `AsyncGenerator[ModelStreamCompletions, None]` 模型回复

#### def refresh(self, userid: str, session: async_scoped_session,)

- **说明**
  刷新对话

- **参数**
  - `session:async_scoped_session` 数据库会话
  - `userid:str` 用户ID

- **返回**
  - `Union[AsyncGenerator[ModelStreamCompletions, None], ModelCompletions]`

## muicebot.models

本模块定义了 Muicebot 消息处理流程中的数据类

### class Resource

多模态消息

#### class-var type

- **类型**

  Literal["image", "video", "audio", "file"]

- **说明**

  消息类型

#### class-var path

- **类型**

  str

- **说明**

  本地存储地址(对于模型处理是必需的)

#### class-var url

- **类型**

  Optional[str]

- **说明**

  远程存储地址(一般不传入模型处理中)

#### class-var raw

- **类型**

  Optional[Union[bytes, BytesIO]]

- **说明**

  二进制数据（只使用于模型返回且不保存到数据库中）

#### class-var mimetype

- **类型**

  Optional[str]

- **说明**

  文件元数据类型

#### def ensure_mimetype(self)

- **说明**

  确保文件元数据类型存在，否则就获取

#### def to_dict(self)

- **说明**

  落库时存储的数据
  (注意：与模型进行交互的多模态文件必须在本地拥有备份)

- **返回类型**

  dict

<details>
<summary>具体代码实现</summary>

```python
def to_dict(self) -> dict:
"""
落库时存储的数据
(注意：与模型进行交互的多模态文件必须在本地拥有备份)
"""
return {"type": self.type, "path": self.path, "mimetype": self.mimetype}
```

</details>

### class Message

#### class-var id

- **类型**

  Optional[int]

- **说明**

  每条消息的唯一ID

#### class-var time

- **类型**

  str

- **说明**

  字符串形式的时间数据：%Y.%m.%d %H:%M:%S
  若要获取格式化的 datetime 对象，请使用 format_time

- **默认值**

  `datetime.strftime(datetime.now(), "%Y.%m.%d %H:%M:%S")`

#### class-var userid

- **类型**

  str

- **说明**

  Nonebot 的用户id

#### class-var groupid

- **类型**

  str

- **说明**

  群组id，私聊设为-1

- **默认值**

  "-1"

#### class-var message

- **类型**

  str

- **说明**

  消息主体

#### class-var respond

- **类型**

  str

- **说明**

  模型回复（不包含思维过程）

#### class-var history

- **类型**

  int

- **说明**

  消息是否可用于对话历史中，以整数形式映射布尔值

#### class-var resources

- **类型**

  List[[Resource](#class-resource)]

- **说明**

  多模态消息内容

#### class-var usage

- **类型**

  int

- **说明**

  使用的总 tokens, 若模型加载器不支持则设为 -1

- **默认值**

  -1

#### class-var profile

- **类型**

  str

- **说明**

  消息所属存档

- **默认值**

  "\_default"

#### property format_time

- **类型**

  str

- **说明**

  时间字符串转换为 datetime 对象

#### def to_dict(self)

- **返回类型**

  dict

#### def from_dict(data: dict)

- **返回类型**

  [Message](#class-message)

## muicebot.llm

本模块定义了 LLM 定义及其 Provider 实现

### abstract class BaseLLM(model_config: ModelConfig)

#### class-var config

- **类型**

  [ModelConfig](#class-modelconfigbasemodel)

- **说明**

  模型配置

#### class-var is_runing

- **类型**

  bool

- **说明**

  模型状态

- **默认值**

  False

#### class-var \_total_tokens

- **类型**

  int

- **说明**

  本次总请求（包括工具调用）使用的总token数。当此值设为-1时，表明此模型加载器不支持该功能

- **默认值**

  -1

#### def \_require(self, \*require_fields: str)

- **说明**

  通用校验方法：检查指定的配置项是否存在，不存在则抛出错误

- **参数**
  - `*require_fields:str` 需要检查的字段名称（字符串）

#### def \_build_messages(self, request: ModelRequest)

- **说明**

  构建 SDK 专用历史上下文的函数

- **返回类型**

  list

#### def load(self)

- **说明**

  加载模型（通常是耗时操作，在线模型如无需校验可直接返回 true）

- **返回**

  bool 是否加载成功

### abstractmethod def ask(self, request: ModelRequest, \*, stream: bool = False)

- **说明**

  模型交互询问

- **参数**

  [ModelRequest](#class-modelrequest) request 模型调用请求体
  bool stream 是否开启流式对话

- **返回**

  Union[[ModelCompletions](#class-modelcompletions), AsyncGenerator[[ModelStreamCompletions](#class-modelstreamcompletions), None]] 模型输出体

### class ModelConfig(BaseModel)

模型通用配置

参见: [\_config.py](https://github.com/Moemu/MuiceBot/blob/main/muicebot/llm/_config.py#L7)

### class ModelRequest

模型调用请求

#### class-var prompt

- **类型**

  str

#### class-var history

- **类型**

  List[[Message](#class-message)]

- **默认值**

  []

#### class-var resources

- **类型**

  List[[Resource](#class-resource)]

- **默认值**

  []

#### class-var tools

- **类型**

  Optional[List[dict]]

- **默认值**

  []

#### class-var system

- **类型**

  Optional[str]

- **默认值**

  None

### class ModelCompletions

模型输出

#### class-var text

- **类型**

  str

#### class-var usage

- **类型**

  int

- **默认值**

  -1

#### class-var resources

- **类型**

  List[[Resource](#class-resource)]

- **默认值**

  []

#### class-var succeed

- **类型**

  Optional[bool]

- **默认值**

  true

### class ModelStreamCompletions

模型流式输出

#### class-var chunk

- **类型**

  str

#### class-var usage

- **类型**

  int

- **默认值**

  -1

#### class-var resources

- **类型**

  List[[Resource](#class-resource)]

- **默认值**

  []

#### class-var succeed

- **类型**

  Optional[bool]

- **默认值**

  true
