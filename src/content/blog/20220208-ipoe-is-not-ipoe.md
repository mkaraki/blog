---
title: 日本国内に蔓延る営業ワードとしてのIPoEを撲滅したい話
tags:
  - internet
  - NTT
  - IPoE
date: 2022-02-08T00:00:00+09:00
author: mkaraki
slug: '20220208-ipoe-is-not-ipoe'
---

そもそも私もよく分かっていないが「IPoEは早い」などと洗脳されている友人を救うために書きました。

訂正等ありましたら[ここ](https://github.com/mkaraki/blog/blob/main/content/post/20220208-ipoe-is-not-ipoe.md)からお気軽にIssueやPull Request送ってください。


## 本来のIPoE
そもそも、NTT契約において「フレッツ・v6オプション（[東](https://flets.com/v6option/), [西](https://flets-w.com/opt/v6option/)）」
契約状態であれば、IPoEとしての接続が可能です。

IPoEとはInternet Protocol (NGNの場合はIPv6)をEthernet (フレッツの場合は光ファイバに変換される)に通すだけで、
これ単体ではIPv6のみが利用可能になります。
（また、NTT自体はプロバイダとしての役割を持っていないため、
インターネットに向けたIPv6通信にはVNEに契約し、VNE保有のIPv6アドレスを受け取れるようにする必要性があります）

```
________________________________
|          |      |            |
| Ethernet | IPv6 | Content    |
|__________|______|____________|
```
図にするとこんな感じ

これは、PPPoE時代から存在するシステムで、PPPoEはIPv4のみの対応（例外あり）であり、
これにIPv6を新たに提供するために導入されたものです（多分）。

しかし、これではIPv4が利用できません。

具体的に言うと、[Yahoo! JAPAN](https://www.yahoo.co.jp/)や[GitHub](https://github.com)などの
**ほぼすべての** Webサービスに接続できなくなります。

### PPPoE
IPv4の接続性が無いと困りますから、IPv4の接続は別で確保する必要があります。

（正確にはPPPoEを利用した通信が先ですが、）PPPoEではIPv4接続性（一部はIPv6も対応）を提供します。
PPPoEはIPoE上で動作するのではなく、Ethernet（光回線）上でPPPの通信を行います。

PPPの通信はIPv4を内包します。

```
_____________________________________
|          |     |      |            |
| Ethernet | PPP | IPv4 | Content    |
|__________|_____|______|____________|
```

こんな感じ。

#### PPPoEが遅いと言われる理由
営業マンやブログはPPPoEが遅いと言います。

これは、PPPoEの通信にはプロバイダ側設備に行く前に一度NTT側設備を経由しますが、
その機材が昨今のトラヒック増加から処理が追いついていないことに起因します。

つまり、人口が少ない街などではPPPoEが遅いという現象は**発生しません**。

## 営業マンが言うIPoE
都市圏では人口の増加によりNTT側設備が悲鳴を上げ、PPPoEでの通信に限界が出てきました。

そこで現れたのが営業マンがIPoEなどと読んでいる技術です。
実情的にはIPv4 over IPv6となります。

これは、これまでPPPoEを使っていたIPv4の通信をIPv6上に載せてインターネットに羽ばたかせます。

```
______________________________________
|          |      |      |            |
| Ethernet | IPv6 | IPv4 | Content    |
|__________|______|______|____________|
```
図にするとこんな感じ。相手に到達する際は送信時のEthernetとIPv6が取っ払われます。

技術的には
- MAP-E
- DS-ite

になり、代表的なサービスとして
- [v6プラス](https://www.jpne.co.jp/service/v6plus/)
- [OCN バーチャルコネクトサービス](https://www.ntt.com/business/services/network/internet-connect/ocn-business/option/v-access-ipoe.html)
- [Transix](https://www.mfeed.ad.jp/transix/overview.html)

などがあります。

また、MAP-Eでは1IPを複数契約で共有するので、IPv4アドレスを節約することが出来ます。

### で、早いの?
結論を言えば、人口の多い都会においてPPPoEより早くなる場合があります。

しかし、人口の少ない田舎や、PPPoE利用者の少ない地域においてはPPPoEのほうが早くなるでしょう。

そもそも、IPoE方式では一部のサービスが利用できなくなる場合がありますので、
大前提としてPPPoEでの速度低下が著しい場合に試してみるのが賢い方法と言えます。

## 参考文献
- https://www.janog.gr.jp/meeting/janog42/application/files/8015/3238/7118/janog42-IPoE-vne_toyama.pdf
- [PPPoEが遅い理由とは？また、IPoEとの違い、メリット・デメリットを解説](https://biz.nuro.jp/column/004.html)
