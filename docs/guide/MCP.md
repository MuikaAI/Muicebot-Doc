# 使用 MCP 服务📇

Muicebot 内置了一套 MCP Client 的实现，并将其封装为 Function Call 的方式引入到 LLM 中。

因此，你可以在 Muicebot 中使用 MCP 服务，只需配置 MCP Server 的配置即可。

## MCP Server 配置

创建 `configs/mcp.json` 用于配置 MCP Server, 文件内容和标准 MCP Server Config 格式一致。

以下是一个示例，该示例展现了如何配置高德地图的 MCP Server 配置

```json
{
  "mcpServers": {
    "amap-maps": {
      "command": "npx",
      "args": ["-y", "@amap/amap-maps-mcp-server"],
      "env": {
        "AMAP_MAPS_API_KEY": "<your api key>"
      }
    }
  }
}
```

保存并启动 `Muicebot`, `amap-maps` MCP Server 实例应被加载。

有关 MCP Server 的更多信息，参见: [MCP Server 开发文档](https://modelcontextprotocol.io/quickstart/server)
