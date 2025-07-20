---
title: Updater.classマルウェアの自己増殖について
date: 2022-12-31T00:00:00+09:00
author: mkaraki
slug: '20221231-updater-class-dotlog'
---

この記事ではリバースエンジニアリングというより自己増殖の過程をお見せします。

ここでいう`.log`ファイルは
[VirusTotal上のこちら](https://www.virustotal.com/gui/file/a98cb11c4779fa8b5d81986b2b8e22b1b03e3cce579c2b7b209814cb7e446bfe)のファイルの事を指します。

## 検証環境

- Docker
- mcr.microsoft.com/openjdk/jdk:17-ubuntu

## はじめに

実際にサーバアプリケーションを使いプラグインを感染させた挙動は、
[Any.Run](https://app.any.run/tasks/4ce2e325-fff6-48c3-8a3f-04e59e998137)でご確認いただけます。

[実際に実行した際のログ](https://gist.github.com/mkaraki/15edaf485ec215d3e2ebd6b60559c52d)
はGistに張っておきます。
空のZipファイルを入れていた関係でエラーだらけですが、
書き換え対象のファイルは判別できるかと思います。

筆者はセキュリティ専門家ではありません。
見当違いなことを言っている箇所が多いと思います。

## 挙動

挙動はとてもシンプルです。
HDD内のすべての`jar`ファイルに対して、変更を試みます。
ファイルを直接writeでオープンするのではなく、
同じディレクトリ内に`.tmp`で終わるファイルを作ってからそれを上書きコピーして保存を行うため、Any.Run上では上書き扱いの警告が出ていません。

### プラグイン別の実装

完全にコードを読んだわけではありませんが、
少なくとも下記をincludeしているものに対しては特殊な書き換えを行うようです。

- `net/labymod/api/LabyModAddon`
  - `onEnable`に対し、書き換えを実施
- `net/md_5/bungee/api/plugin/Plugin`,  
  `org/bukkit/plugin/java/JavaPlugin`
  - `onLoad`もしくは`onEnable`にインジェクション

### リバースエンジニアリングについて

やはり難読化されています。

今回記事で取り扱っているものは、
JADXで解析できたうち、mainメソッドから簡単に追えた範囲のみです。

## 被害を防ぐために

今回のマルウェアは
[MCAntiMalware](https://github.com/OpticFusion1/MCAntiMalware)
で検知可能でした。
また、自己増殖をするため、ファイルのハッシュを厳格にチェックする機構や、
厳しいACLと監査ログがあれば、同じように被害を防げた可能性があります。