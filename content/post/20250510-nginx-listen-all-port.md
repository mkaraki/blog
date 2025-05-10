---
title: nginxで全ポートをlistenする
date: 2025-05-10T00:00:00+09:00
author: mkaraki
slug: '20250510-nginx-listen-all-port'
---

nginxで全ポートをlistenする方法です。
実験がてら作ってみた方法ですから、実際にこのような事をしたい場合は、
iptablesでREDIRECTする方が良いでしょう。

今回はどうしてもserver_portを利用したかったので、
このような力業を利用しました。

## 環境

- Debian 12 Bookworm
- `nginx-full 1.22.1-9+deb12u1` (Debianのパッケージ)

## ポート利用状況の確認

下記のコマンドでポートをLISTENしているプロセスが無いか確認します。
もしLISTENしているプロセスがあれば、そのポートを利用しない事を選択するか、
LISTENしているプロセスの停止を検討してください。

```bash
lsof -i | grep LISTEN
```

## nginxのインストール

今回は、`server_token`を`off`にしたいため、`nginx-full`をインストールします。

```bash
apt install nginx-full
```

## nginxの設定

まず、`nginx.conf`の`server_tokens off;`をコメントアウトし、
サーバのバージョン情報などを秘匿します。

65535ポートをv4とv6でlistenするため、
`worker_connections`と`worker_rlimit_nofile`を余裕を持って`200000`に設定します。

`worker_rlimit_nofile`はファイル先頭の`worker_processes`あたりに、
`worker_connections`は`events`セクションに設定します。

## limits.confの設定

`/etc/security/limits.conf`に`www-data`ユーザの最大ファイル数を設定します。
先ほど設定した、`worker_rlimit_nofile`の値よりも大きい値を設定してください。

```conf
www-data soft nofile 200000
www-data hard nofile 200000
```

## sysctlの設定

`/etc/sysctl.conf`に下記の設定を追加します。
先ほどと同じように、`fs.file-max`の値は、`worker_rlimit_nofile`の値よりも大きい値を設定してください。

```conf
fs.file-max = 200000
```

設定変更後、下記のコマンドで適用します。
この後再起動をするので、下記のステップは省略しても良いです。

```bash
sysctl -p
```

## systemdの設定

`/etc/systemd/system.conf`の`[Manager]`セクションにある、`DefaultLimitNOFILE`を設定します。
この値も、`worker_rlimit_nofile`の値よりも大きい値を設定してください。

```conf
[Manager]
# 省略
DefaultLimitNOFILE=200000
```

コメントアウトされている行ですから、コメントアウトして編集しても良いですし、
最後の方に追記してもかまいません。

## サイトの設定

`listen`ディレクティブは下記のようになります。
この例では、listenしたいインターフェイスのIPアドレスを`1.2.3.4`と`cafe::1:2:3:4`にしています。
環境に応じて変更してください。

```conf
listen 1.2.3.4:1-65535;
listen [cafe::1:2:3:4]:1-65535;
```

## システムの再起動を行う

`limites.conf`や`systemd`の設定を行ったので、再起動を行います。
デフォルトで`nginx`が起動するはずですから、動作確認も同時に行ってください。

## 参考サイト

- https://www.antitree.com/2017/06/running-nginx-on-all-ports/
- https://unix.stackexchange.com/questions/366352/etc-security-limits-conf-not-applied
- https://serverfault.com/questions/279262/nginx-proxy-a-large-port-range-to-equivalent-port-on-a-different-ip-address
