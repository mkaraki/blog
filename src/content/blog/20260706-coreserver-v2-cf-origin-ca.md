---
slug: 20260706-coreserver-v2-cf-origin-ca
title: CoreServer v2でCloudflare Origin CAを使う
date: 2026-07-05T16:52:15.041Z
author: mkaraki
---

近年は証明書を発行すると、Certificate Transparency Log に残り、内部用サイトのドメインが流出したり、公開直後から`/wp-admin`等への攻撃が始まったりします。

この問題を解決する最も簡単な方法はワイルドカード証明書を発行することですが、Let's Encrypt 等では TXT レコードの追加が求められ、CoreServer の自動発行・更新では対応できず、証明書の有効期限が年々短くなっていく昨今、手動更新もあまり現実的ではありません。

そこで、Cloudflare の発行する最長 15 年の証明書を使った Cloudflare と CoreServer 間の TLS 通信を行うことで、Certificate Transparency Log に残す証明書を Cloudflare の自動発行するワイルドカードの Edge Certificate のみにしようという試みです。

もちろん、この手法を使うには Cloudflare にプロキシさせることが条件となります。一応 Cloudflare の CA を各デバイスに配り、信用するように設定することも可能ですが、あまり良い方法とは言えないでしょう。

また、本手法では CoreServer V2 のサブドメイン登録機能を使うことで、サブドメインで提供されるサイトすべての証明書の設定を一括で終わらせられるようにしています。Cloudflare にプロキシさせたくないサイトは、サブドメインとして登録するのでは無く、ドメイン登録画面から設定し、個別に Let's Encrypt 等の証明書を渡す必要があります。

## CloudflareでOrigin CAを発行する

Cloudflare は頻繁に UI が変わるので、[Cloudflare origin CA · Cloudflare SSL/TLS docs](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/) あたりを直接確認していただければと思います。

CoreServer V2 から ECC に対応していますので、Private key type は ECC にすると良いでしょう。

Hostnames に関しては APEX を使う場合、ワイルドカードに加え、APEX も登録すると良いでしょう。また、後から証明書を区別しやすいように、`note--for-coreserver`等のサブドメインも登録すると便利です。

また、事前にドキュメントの「Cloudflare Origin CA root certificate」セクションから、ECC の CA をダウンロードしてください。

## CoreServerでドメインの設定とSSLの設定を行う

管理画面の「ドメイン」->「ドメイン管理」で、利用したいドメインを追加します。Cloudflare の無料プランの場合、登録ドメイン直下しか使えませんので、例えば「example.com」を Cloudflare に登録されている場合、CoreServer に登録するドメインは同じく「example.com」となります。

登録後、「SSL証明書設定」を開き、画面右上のドメイン名を設定したいドメインに変更します。その後、「事前に生成された証明書とキーを貼り付け」を選択し、画面の右上に現れた「SSL CA証明書」をクリックし、事前にダウンロードした Origin CA のルート証明書を貼り付け、「Use a CA Cert」にチェックを入れて保存します。

その後、1 画面戻り、鍵と証明書に Cloudflare のダッシュボードに表示された証明書を貼り付けます。

ECC を利用している場合、鍵の`BEGIN PRIVATE KEY`及び`END PRIVATE KEY`をそれぞれ、`BEGIN EC PRIVATE KEY`と`END EC PRIVATE KEY`に変更してください。

## 公開するサブドメインを追加する

CoreServer の設定で、「ウェブ」->「サブドメイン管理」と進み、画面右上のドメイン名を設定したいドメインに変更します。その後、サブドメインを追加からお好みのサブドメインを登録します。

その後、Cloudflare の DNS 管理画面に当該ドメインと CoreServer の A/AAAA もしくは CNAME レコードを追加し、プロキシ設定をオンにします。
