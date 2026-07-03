---
slug: 20260630-apple-container
title: Apple containerを使ってみた
date: 2026-06-30T11:00:35.749Z
updatedDate: 2026-07-03T03:37:47.675Z
author: mkaraki
---

現在私の使っているMacintoshはM1 MacBook Airの8GBモデルという、なんとも言えない性能のマシンです。Apple siliconの初めてのマシンで、macOS上で動くソフトウェアはよほど無理をしない限り、8GBであることを忘れる程快適に動作してくれますが、Asahi Linuxはもちろん、macOS上であってもDockerを動かすとメモリとバッテリーをかなり消費します。

本記事では、8GB macOSにおいて、Apple containerがDockerの代わりにまともに動き、開発環境として使えるのかを検証したいと考えています。

## 環境

* MacBook Air A2337 (M1, 8GB RAM, 256GB SSD)
* container 1.0.0

## 使ってみる

下記に試したコマンド及び結果を記述します。

```bash
# 独自のPHPIpam Dockerイメージのビルド
# Src: https://github.com/mkaraki/phpipam-frankenphp-docker/tree/897f4c2f121d8e7c991c23c984e1bb6897b6931d
# container-runtime-linux用のVMサービスが2.13GB程度のメモリ消費
# arm64である影響で最後まで実行できず
container build -t phpipam:latest .

# さすがに動く
container run -it --rm ubuntu:noble

# 簡単なDockerfileのビルド
container build -t ipdb:latest .

# ポート待ち受けを行うApache2 PHPアプリのテスト
container run --rm -it -p 8080:80 ipdb:latest

# Volumeマウントを伴うFrankenPHPアプリケーション
container run --rm -it -p 8080:8080 -v $(pwd)/books:/books:ro cbz-viewer:latest
```

軽く試したところ、Containerを使い始めると、Virtual Machine Serviceが立ち上がり、メモリを2.13GB程消費し始めます。これにより、Activity Monitor上でのMemory Usedが7GB前後をうろうろするようになり、一応JetBrains IDEとMS Edgeを追加で立ち上げてもきちんと動いてはいるものの、かなり不安感はあります。この状態でCompressedが2.97GB、Swapは8.35GBです。

使っているターミナルがWarpだったり、裏でTeamsやEvernoteなどが動いていたりと、Container以外にもメモリ使用率を上げている要因はありますが、とはいえ8GBのMacBookではプログラマーになる夢を見るには少し厳しいかもしれません。

また、WSL containerと同様に、こちらもDocker Compose相当の機能を実装されていないようです。しかし、[apple/container #1736](https://github.com/apple/container/pull/1736)にパッチが上がっているので、もしかしたら近いうちに動かせるようになるかもしれません。

## Cloudflare One Clientとの相性問題

VMが53をBINDする為、`mDNSResponder`関係のエラーが出る場合があるとのこと。一度`container system stop`を行ってから、再接続しよう。Cloudflareのドキュメントによれば、再接続後に再度Container Systemを起動すれば動かせるらしいが、こちらは未検証。

## Ref

* [pple/container: A tool for creating and running Linux containers using lightweight virtual machines on a Mac. It is written in Swift, and optimized for Apple silicon.](https://github.com/apple/container)
* [Add container-compose: docker-compose compatibility layer by demostenex · Pull Request #1736 · apple/container](https://github.com/apple/container/pull/1736)
* [Client errors · Cloudflare One docs](https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/troubleshooting/client-errors/)
