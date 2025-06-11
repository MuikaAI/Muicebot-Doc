# 更新指南

在更新之前，我们推荐您查看最新版本的 [发布页](https://github.com/Moemu/MuiceBot/releases) 中的版本兼容性提醒来查看版本兼容情况

你可以通过 Pypi 更新 Muicebot:

```shell
pip upgrade muicebot
```

但是我们不建议您进行跨版本更新，这样做可能会导致意想不到的版本鸿沟

在进行大版本更新后，如果此版本包含数据库更新，请先通过下面的指令迁移数据库：

```shell
nb orm upgrade
```

## 从 1.0 之前的版本迁移

> 相伴二余载，出发下一站

在 Muicebot 1.0 中，我们对数据库进行了优化，从直接对数据库的操作转移到了通过 `nonebot-plugin-orm` 层提供的 orm session 进行数据库操作。由于两者的数据库内容互不相通，因此无法读取 1.0 之前的数据库文件。

要执行数据迁移，请在启动 Bot 后给机器人输入以下指令(SUPERUSER Only):

```
.migrate
```

当显示 `已成功迁移 x 条记录✨` 时，表示迁移成功

如果显示 `旧数据库版本低于 v2，无法迁移` ，表示你要么从 Muicebot 0.3.x 之前的版本跳级到了 1.x 要么就是遇到鬼了，怎么可能出现这个字段

此节和迁移插件将于 Muicebot `1.3` 废弃


## 从 Muice-Chatbot 迁移

目前我们已经停止对 Muice-Chatbot 的迁移支持，如果你仍然想从 Muice-Chatbot 中迁移数据，请参见: [文档站存档](https://github.com/MuikaAI/Muicebot-Doc/blob/c2c279294aa200cd9f800f8a053b1ab05d53e3fd/docs/guide/migrations.md) 并将 Muicebot 降级到 0.1.x 然后再逐级更新到 0.2.0, 0.3.0, 0.4.3

为此带来的不便我们深表歉意