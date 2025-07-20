---
title: pfSenseを透過ファイアウォールとして設定する
date: 2023-01-19T00:00:00+09:00
author: mkaraki
slug: '20230119-pfsense-transp'
---

普段はFortinetに魂を売っている筆者ではあるが、
さすがに各VMホストに導入するためだけにFortiGate-VMを購入していては破産するため、
pfSenseでお手軽ファイアウォールをするために透過ファイアウォールの設定を行う。

pfSenseは簡単に透過ファイアウォールを設定することができないので、
将来の私向けのメモとして記録を残す。

## 環境

- pfSense 2.6.0

## 手順

### インストール・WAN/LAN設定

インストール後にWAN/LAN設定がある、
後々のACL記述でWAN/LANの概念が存在するのため、
VMの外をWAN、VM内をLANとした。

### IPアドレス割り当て

WEB UIにアクセスするためにWAN/LANのどちらか好きな方にIPアドレスを割り当てる。

ここで設定した値は後程消すことになるので、ある程度適当でも構わない。

また、使わないインターフェースはアドレス設定を空白で入力し、
アドレス無しで設定すると幸せになれるかもしれない。

### WebUIへのアクセス・初期設定

`admin:pfsense`でアクセスできる。
初期設定は適当に済ませるとよい。

WAN側から設定画面にアクセスしたい場合はShellから、

```
pfctl -d
```

でファイアウォールを一時無効化できる。

設定値は基本的に今後も使うが、
IPアドレス設定はどうせ消すため、適当でよい。

### Bridgeを作る

Web UIで`Interfaces -> Assignments -> Bridges -> Add`からBridgeを作り、
WANとLANを追加する。

`System -> Advanced -> System Tunables`から設定を開き、
`net.link.bridge.pfil_bridge`を`1`にする。

`Interface -> Assignments`から、
`BRIDGE0`をAddし、`OPT1`を作る。

### NATをオフにする

NATは不要なので、
`Firewall -> NAT -> Outbound`で設定に入り、
`Disable Outbound NAT rule generation`を指定する。

### IPアドレスを設定する

WANとLANの`IPv4/6 Configuration Type`をそれぞれNoneに設定する。

OPT1にIPv4/IPv6アドレスを最適な値に指定する。

OPT1はおそらくWANとLANをWeb UIから削除した後にCLIで設定するとよいだろう。

## ルールの書き方

ファイアウォールルールでは、LAN・WAN・OPT1をすべて利用できる。

そのため、最低限様々な通信を通したい場合、
すべてのセクションにおいてとりあえずAllow allをするとよいだろう。
