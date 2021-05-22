+++
date = 2021-02-05T15:00:00Z
slug = "20210206-oraclecloud-ubuntu-inbound-firewall"
tags = ["OracleCloud"]
title = "Oracle Cloudのminimal UbuntuのInstanceで外からつながらない問題"

+++
自分用のメモです。

# 環境
- Oracle Cloudインスタンス
- Image: Canonical-Ubuntu-20.04-Minimal-2020.12.10-0
- Shape: VM.Standard.E2.1.Micro

# 原因
iptablesのルールである

```
-A INPUT -j REJECT --reject-with icmp-host-prohibited
```

# 解決策
```
/etc/iptables/rules.v4
```
の17行目にある

```
-A INPUT -j REJECT --reject-with icmp-host-prohibited
```

をコメントアウトして再起動。（すべてのポートが晒されるので注意）
