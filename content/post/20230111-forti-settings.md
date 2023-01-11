---
title: 個人的なFortiの設定
date: 2023-01-11T00:00:00+09:00
author: mkaraki
slug: '20230111-forti-settings'
---

この記事では、他の環境にも転用が効きそうなFortiGateの設定を記述します。

基本的に私が使っているFortiGateに合わせて随時更新していくと思います。

## 前提

- FortiGate 50E
- FortiOS 6.2.12

## 更新履歴

|バージョン|日時|内容|
|---|---|---|
|初版|2023-01-11||

## Security Fablic

### Settings

Cloud Loggingを有効に設定、
頻度は`Realtime`を選択

### Fabric Connectors

- [CERT Polska](https://cert.pl/)の[List of malicious domains](https://cert.pl/en/posts/2020/03/malicious_domains/)を1440秒ごとに受信
- [Feodo Tracker](https://feodotracker.abuse.ch/)の`Botnet C2 Indicators Of Compromise (IOCs)`の過去30日分の物を利用

## Policy & Objects

### IPv4 Policy

先頭に

- Feodo Trackerリストからの通信をDROP (Logあり)
- Feodo Trackerリストへの通信をDROP (Logあり)

を追加

## Security Profiles

### AntiVirus

- Detect Viruses: Block
- Inspected Protocols: すべてOn
- APT Protection Options: すべてOn
  - Original File Destination: お好みで (私はDiscard)

### Web Filter

- FortiGard category based filter: お好みで (ライセンスがない場合はOff)
- File Filter
  - Log: On
  - Scan Archived Contents: On
  - List:
    - Deny password protected
      - Protocols: HTTP + FTP
      - File types: 7z, rar, zip
      - Action: Block
      - Direction: Incoming
      - Match Password Protected Files: On
- Search Engines: お好みで
- Static URL Filter
  - Block invalid URLs: On

### DNS Filter

- FortiGuard category based filter
  - Remote Categoriesに[Fabric Connectors](#fablic-connectors)で指定した定義があるのでブロック
  - それ以外はお好みで、個人的には
    - Malicious Websites: Block
    - Phishing: Block
    - Spam URLS: Block
    - Dynamic DNS: Monitor
    - Newly Observed Domain: Monitor
    - Newly Registerd Domain: Monitor
    - Unrated: Monitor
- Static Domain Filter
  - External IP Block Lists: [Fabric Connectors](#fablic-connectors)で指定した定義があるのでブロック
- Options
  - Allow DNS requests when a rating error occurs: お好みで (私はOm)
  - Log all DNS queries and responses: On

### Application Control

- Categories: ProxyとP2Pをブロック、それ以外はMonitor
- Options
  - Allow and Log DNS Traffic: Yes
  - QUIC: Block

### Intrusion Prevention

- `Obfuscated.JavaScript.Access`: Allow, Disable Logging
- Seveity 3-5: Block, Log
- Seveity 2: Default, Log
- Scan Outgoing Connections to Botnet Sites: ライセンスがあるならBlock

### Email Filter

- Enable Spam Detection and Filtering: On
- Span Detection by Protocol: お好みで
- FortiGuard Spam Filtering: すべてOn
- Local Spam Filtering: Black White List以外On
- File Filter: すべてOn

### SSL/SSH Inspection

別で記事を用意します。
