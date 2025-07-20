---
title: Updater.classマルウェアの本体部分の考察
date: 2022-12-31T16:00:00+09:00
author: mkaraki
slug: '20221231-updater-class-update'
---

この記事は`Updater.class`ファイルがダウンロードする
`kernel-certs-debug4917.log`ファイルを簡単にのぞき見を行い、
考察を行った。

## はじめに

筆者は専門家では無く、
リバースエンジニアリングを隅々まで行ったわけではない。
本記事内には見当違いな場所もあると思われる。

## 外部との通信

URLは踏めないようにしているが無害化は行っていない。
間違ってアクセスしないように十分注意すること。

このプログラムは下記と接続を行う:
- `http://t23e7v6uz8idz87ehugwq.skyrage.de/version`
- `http://t23e7v6uz8idz87ehugwq.skyrage.de/qqqqqqqqq`
- `ssl://qw3e1ee12e9hzheu9h1912hew1sh12uw9.skyrage.de:17929`

実際の通信内容は[Any.Run](https://app.any.run/tasks/7accb28d-a771-4353-bbc6-bf7647c59c47)から
pcap
をダウンロードできるためそれを見ていただいたほうが良いとは思うが、
`qqqqqqqqq`はjarファイル
([VirusTotal](https://www.virustotal.com/gui/file/9cf6f6698d6e5d7f2c97bedfb67429422269e0dfe677f3b10c99919e81d7642a))
で、`version`は数値データ
(`921`)
の入ったテキストファイルであった。

### ssl通信について

SSL通信であるため中の通信は覗けなかったが、
プログラムを確認した知人がいうには独自仕様の通信ではないかとの意見があった。

サーバ側の証明書は下記のものが利用されていた。
```
> openssl x509 -in key.crt -text -noout
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            26:aa:65:34:32:16:cf:c8:08:16:02:73:56:b8:4f:13:d8:73:77:7f
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C = AU, ST = Some-State, O = Internet Widgits Pty Ltd
        Validity
            Not Before: Jul 18 16:25:40 2022 GMT
            Not After : Jul 15 16:25:40 2032 GMT
        Subject: C = AU, ST = Some-State, O = Internet Widgits Pty Ltd
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
                    00:ab:5a:5d:ae:36:ed:5f:21:43:a3:32:c3:a7:66:
                    4b:43:97:4a:ee:61:c2:d2:30:2d:13:4e:02:a3:8d:
                    1b:89:4e:13:15:be:4b:d6:82:7f:44:ae:3d:4a:a7:
                    b1:50:5a:f2:6a:76:a6:55:f9:1a:1e:84:de:e5:a8:
                    56:60:8b:40:11:21:bb:dc:79:56:f9:fc:b7:7b:28:
                    ca:16:a6:37:cf:a4:4e:a6:de:d6:07:6c:8b:88:20:
                    df:b0:3b:69:70:43:a2:46:fe:2d:76:63:bb:2b:bf:
                    97:bb:03:1f:1c:a3:46:3e:9d:40:c8:21:61:98:4f:
                    ce:95:84:b0:35:f2:da:8d:1d:ef:7c:9d:ec:a9:61:
                    ce:8d:b0:f8:50:bd:8a:69:b3:66:80:e6:31:10:b1:
                    b4:00:c2:51:0e:e7:30:d9:34:c7:26:38:07:50:50:
                    75:82:a3:e6:97:56:e6:26:ef:5f:0d:d3:bc:7c:61:
                    2f:f4:d6:55:96:3e:a0:ed:c4:19:ee:42:aa:7d:f1:
                    2b:43:e2:20:4a:5c:31:99:d0:84:a5:82:30:3f:ca:
                    42:84:94:3d:ac:3f:eb:a1:ac:81:c5:02:d0:cd:ee:
                    83:99:a8:7d:26:74:a6:65:e0:16:6f:81:5d:f7:64:
                    8a:fe:ed:3f:cc:08:06:4c:a7:b3:1b:b4:7d:da:7b:
                    17:33
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Subject Key Identifier:
                50:D7:07:2A:09:4A:78:A7:FF:88:45:84:6F:B5:42:BC:DF:C1:51:6C
            X509v3 Authority Key Identifier:
                keyid:50:D7:07:2A:09:4A:78:A7:FF:88:45:84:6F:B5:42:BC:DF:C1:51:6C

            X509v3 Basic Constraints: critical
                CA:TRUE
    Signature Algorithm: sha256WithRSAEncryption
         0a:d3:f9:c6:20:ad:69:c7:44:42:ae:95:5c:bb:4a:b5:47:ba:
         98:03:e2:20:a0:8c:cc:fb:77:15:dc:ac:4d:be:f4:5c:05:38:
         ed:a3:87:b5:15:2d:8d:b6:a6:00:8b:76:f7:82:71:ae:af:7e:
         01:36:cf:6b:27:cd:f5:06:3e:c3:54:13:a4:a0:07:50:00:e6:
         46:98:20:41:bf:32:ae:c9:42:56:81:f5:e2:07:e1:d7:7d:52:
         20:e4:81:a6:df:f9:4c:06:ef:a0:fd:7e:0a:ec:a6:4e:bc:ed:
         03:42:1f:d4:cb:e9:79:b9:b4:d3:9f:8d:1b:58:52:d2:b1:d2:
         94:02:8b:ed:07:43:18:3e:c8:65:c5:dd:cc:64:a5:23:99:a9:
         44:f8:5f:3f:6e:2a:fe:9f:4c:e3:26:d5:19:27:51:a7:7a:d6:
         77:9d:11:b3:4f:a0:90:1a:6b:c6:de:c8:6f:f6:33:83:4c:3b:
         11:8f:1b:11:3e:0a:07:15:5e:5e:43:ce:4e:70:e5:90:cf:84:
         b7:43:ff:03:fe:fd:6e:fb:ee:fb:1a:ec:7e:17:ec:20:36:cc:
         87:5c:a3:57:21:5b:29:9e:71:d9:aa:50:f6:a7:ed:57:97:7b:
         8b:34:2a:8d:64:79:9b:eb:f7:89:52:39:95:17:8c:f1:3a:a9:
         46:da:a0:a7
```

自己署名されたものであり、CAが設定されていない。

`ST = Some-State`となっているところはおそらく詰めが甘かった部分ではないかと思う。

そして、おそらくこの通信がこのプログラムのキーとなる部分ではないかと考える。

## 被害を抑える方法

今回のプログラムが実行された際の被害を抑える方法としては、
- サーバがアクセスするFQDN, IPをホワイトリスト制にする
  - DNSなどでそもそも引っかからないようにする
  - 指定されたDNS以外への通信をリジェクトする
- SSL通信をすべてInspectし、CA証明書のチェックも強制する
  - FortiGateのライセンスがない機材でも、
    当該の設定を導入したところ通信がクローズされるようになった

などが考えられる。

また、現状[主要な商用エンドポイントセキュリティソフトでの検知が可能](https://www.virustotal.com/gui/file/753579034abcffedd35f0fd9f3eac771b6f63d743194f9c6c2a64fe49db218b7/detection)であるため、
サーバ上に商用のエンドポイントセキュリティを入れ、定期的なスキャンを掛けることでも早期発見につながった可能性がある。