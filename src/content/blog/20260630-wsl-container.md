---
slug: 20260630-wsl-container
title: WSL containerを触ってみた
date: 2026-06-30T09:36:41.447Z
author: mkaraki
---

## 環境

* Windows 11 Pro 25H2 (OS Build 26200.8655)
* Windows Subsystem for Linux 2.9.3
* Git for Windows (git version 2.54.0.windows.1)

## インストール

特に再起動などは要求されず、下記のコマンドを打ち、後は指示にしたがうだけで終わりました。

ただし、Docker Desktop on Windowsとの相性は悪いらしく、WSL needs updatingの画面が表示されました。現在使っているのが、`Docker Desktop on Windows` 4.75.0 (227598) と少し古いのが影響しているのかもしれません。

```powershell
wsl --update --pre-release
```

## 使ってみる

基本は `docker` コマンドの代わりに `wslc` コマンドを叩くだけで使えます。検証するにあたり、Docker Composeが移植できるか試したかったのですが、どうやらそちらは非対応のよう。

[Clystian氏](https://github.com/clystian) がパッチを作っているらしく、そちらはある程度試せる状態の用です。詳細は [clystian/WSLのPR #1](https://github.com/clystian/WSL/pull/1) をご参照ください。

また、公式リポジトリの [Discussion #40836](https://github.com/microsoft/WSL/discussions/40836) 及び [Issue #40948](https://github.com/microsoft/WSL/issues/40948) はあまり活発ではなさそうです。WSL Container自体が最近の発表かつ、Public Preview入りしたばかりですから、これはばかりはしょうがないです。

下記に実際に打ってみたコマンドを貼ります。最低限コンテナで遊ぶ分には問題なく動いてくれます。

```powershell
# Ubuntuのシェルをお試し
> wslc run --rm -it ubuntu:noble

# ps等の有名なショートカットは普通に動く
> wslc ps
CONTAINER ID   NAME            IMAGE         CREATED          STATUS                 PORTS
AADC7244B1FB   noble_beartooth ubuntu:noble  16 minutes ago   running 16 minutes ago

# 独自のPHPIpam Dockerイメージのビルド
# Src: https://github.com/mkaraki/phpipam-frankenphp-docker/tree/897f4c2f121d8e7c991c23c984e1bb6897b6931d
# デフォルトだと動かない為、後述する修正を実施。
> wslc build -t phpipam:latest .

# 簡単に http://localhost:8080 で接続できることを確認
> wslc run --rm -it -p 8080:80 phpipam:latest

# マウントテスト
# 先頭に`/mnt/`を付けたりもしたが、ダメそうである。
> wslc run --rm -it -p 8080:80 -v /d/projects/phpipam-frankenphp-docker/Dockerfile:/test phpipam:latest
> wslc exec -it 1da35be50090 sh
$ cat /test
cat: /test: Is a directory
```

## Docker Buildのお試し

前セクションで `wslc build` コマンドを叩きましたが、これはうまく動きませんでした。表示されたWARNING、ERRORは下記の通り。

```
WARNING: current commit information was not captured by the build: git was not found in the system: exec: "git": executable file not found in $PATH
ERROR: failed to solve: dockerfile parse error on line 19: unknown flag: exclude
```

まず、本環境にはGit for Windowsがインストールされていますが、これは認識されないようです。

そして根本的なエラーとしては、`COPY` 命令における `--exclude` オプションを認識していない。本問題の解決は容易で、ファイル先頭に `# syntax=docker/dockerfile:1.25.0` とDockerfileのシンタックスバージョンを指定することで解決しました。

標準で使われているSyntaxバージョンについては調査して居ませんが、これからはSyntaxバージョンを指定するようにした方が安全かもしれません。

## 全体的な感想

`compose` コマンドや `cp` コマンドが無いなど、Docker Desktop on Windowsの代替として使うにはあまりにも頼りないですが、簡単なデータベースを検証用途で動かす等の用途ではある程度使えそうです。

Network系のコマンドや、Volume系のコマンドは検証から外しましたが、Docker Compose実装パッチのスクリーンショットを見る限り、こちらもうまく動いてくれそうです。

## Ref

* [WSL container is now available for public preview - Windows Command Line](https://devblogs.microsoft.com/commandline/wsl-container-is-now-available-for-public-preview/)
* [Will WSLC implement Compose? · microsoft/WSL · Discussion #40836](https://github.com/microsoft/WSL/discussions/40836)
* [docker/dockerfile - Docker Image](https://hub.docker.com/r/docker/dockerfile/)
