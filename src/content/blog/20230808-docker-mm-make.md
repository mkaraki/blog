---
title: Mattermostをdocker-composeとCloudflare TunnelでUbuntu Server 22.04上に構築する
date: 2023-08-08T00:00:00+09:00
author: mkaraki
slug: '20230808-docker-mm-make'
---

## はじめに

今回構築するMattermostは下記の構成になります。

- Port 8065でHTTP Listen
- Cloudflare Tunnelでリバースプロキシ
- Callsは利用しない
- Bleveは利用しない
- S3は利用しない

このレッスンでは下記の環境を自身で用意してください

- x64 CPUを搭載したPC (Dockerが動作すること)
- 上記のPCでDVDもしくはUSBからブートさせる機材
- DVD-RとDVDドライブもしくは4GB以上のUSBメモリ

このレッスンでは、コンピュータ内のデータが消去されます。
すべての操作は慎重に行ってください。

もしレッスンを行うにあたって不安な場合、
担当者の空き時間をあらかじめ確認し、その時間に合わせてレッスンを行ってください。

## Ubuntu Server 22.04のインストール

Ubuntuは2年おきに長期サポート版がリリースされます。
2022年4月にリリースされた22.04が現在の最新リリースであり、
次の長期サポート版は2024年4月リリース予定の24.04です。

この資料では22.04を利用して環境を構築しますが、
基本最新の長期サポート版を利用してください。
長期サポート版はダウンロード時などにLTSと表記されます。
参考にしてください。

### Ubuntu Serverのダウンロード

Ubuntu Serverは[公式サイトのダウンロードページ](https://ubuntu.com/download/server)からダウンロードできます。
Alternative downloadsからTorrentなどでダウンロードすることもできます。
必要に応じて活用してください。

日本のミラーサイトからダウンロードすることもできます。
詳しくは[Ubuntu Japanese Teamのページ](https://www.ubuntulinux.jp/ubuntu/mirrors)を参照してください。

### Ubuntu Serverのインストール

基本は[Ubuntu公式ドキュメント](https://ubuntu.com/server/docs/install/step-by-step)や
[Server Worldの記事](https://www.server-world.info/query?os=Ubuntu_22.04&p=install)
を参考にするといいでしょう。

サイトと違う点として、
インストールする際には`Ubuntu server (minimized)`を選択してください。

ネットワークの設定についてはかなり癖があります。
とりあえずDHCPのネットワークで設定を実施してください。
固定IPでの設定は別に記事にします。

OpenSSHサーバは必ずオンにしてください。
これ以降はSSHでの操作を行います。

Dockerを使うと記述していますが、
インストール最後のアプリケーションをインストールする画面では何も選択しないでください。

## IPアドレスの確認

インストール時に設定したユーザ名とパスワードでまずPC本体でログインします。

```shell
$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: enp2s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 18:66:da:2f:e1:b4 brd ff:ff:ff:ff:ff:ff
    inet 17.0.0.2/24 brd 17.0.0.255 scope global enp2s0
       valid_lft forever preferred_lft forever
    inet6 2620:149:af0::10/64 scope global dynamic mngtmpaddr noprefixroute
       valid_lft 2591920sec preferred_lft 604720sec
```

`ip a`コマンドでIPアドレスを確認してください。

基本的に`enp`や`eth`から始まる物が有線LANで、inetの行にIPアドレスが記載されています。
この場合、`17.0.0.2`がIPアドレスで、`/24`がサブネットマスクです。

IPv6アドレスも同じように`inet6`の行で確認できます。

このIPアドレスをメモしておいてください。

## SSHでのアクセス

Windows 10からはSSHクライアントが標準でインストールされています。

SSHコマンドの基本文法は下記のとおりです。

```
usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface]
           [-b bind_address] [-c cipher_spec] [-D [bind_address:]port]
           [-E log_file] [-e escape_char] [-F configfile] [-I pkcs11]
           [-i identity_file] [-J [user@]host[:port]] [-L address]
           [-l login_name] [-m mac_spec] [-O ctl_cmd] [-o option] [-p port]
           [-Q query_option] [-R address] [-S ctl_path] [-W host:port]
           [-w local_tun[:remote_tun]] destination [command
```

基本的に使うのは`-l`, `-p`, `-L`, `destination`でしょう。
    
`-l`はログインするユーザ名、
`-p`はポート番号、
`-L`はポートフォワーディング（本ドキュメントでは利用しません）の設定です。

`destination`では宛先（サーバ）を設定します。

初期設定の場合下記のコマンドでログインできます。

```shell
ssh -l 初期設定で作ったユーザ名 サーバのIPアドレス
```

最初にアクセスする際には下記の表示が出ます。

```
The authenticity of host 'サーバのIPアドレス' can't be established.
ED25519 key fingerprint is SHA256:ABCDEF0123456789.....
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

`yes`と入力し`Enter`を押してください。

その後、パスワードを要求されます。
パスワードの入力時には文字が一切表示されませんが、正常な挙動です。

下記のような画面が出ればログインできています（もっと少ない場合もあります）

```
Welcome to Ubuntu 22.04.1 LTS (GNU/Linux 5.15.0-53-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

This system has been minimized by removing packages and content that are
not required on a system that users do not log into.

To restore this content, you can run the 'unminimize' command.

Last login: Tue Aug  8 01:46:27 2023 from 17.0.3.129
ユーザ名@サーバ名:~$
```

試しに`ip a`などのコマンドをうち、
サーバ本体で打った時と同じ値になるか試してみましょう。

### 基本コマンドについて

基本的なファイル操作などについては、[LearningDocs](https://mkarakiapps.com/LearningDocs/ja/linux/linux-command01.html)で解説しています。
実際に試してみてください。

下記では、Learning Docsで解説していないコマンドを解説します。

#### sudo

Linuxにはrootという特権ユーザが存在します。
rootではおおよそ大体の(破壊を含む)すべての行動ができます。
その危険性から、Ubuntuではrootユーザは初期状態で無効化
（パスワードが設定されておらずログインできないユーザ）
になっていますが、特権ユーザとして実行しないといけない処理
（アプリケーションのインストール等）
を行う際には`sudo`コマンドを利用し、特権ユーザに成り上がります。

`sudo`コマンドは下記のように使います。

```shell
sudo 特権で実行したいコマンド
```

例えば、`apt`コマンドはアプリケーションのインストールやアップデートを行うコマンドですが、
特権ユーザでないと実行できません。

```shell
$ apt update # 通常ユーザで実行
Reading package lists... Done
E: Could not open lock file /var/lib/apt/lists/lock - open (13: Permission denied)
E: Unable to lock directory /var/lib/apt/lists/
W: Problem unlinking the file /var/cache/apt/pkgcache.bin - RemoveCaches (13: Permission denied)
W: Problem unlinking the file /var/cache/apt/srcpkgcache.bin - RemoveCaches (13: Permission denied)

$ sudo apt update # sudoを使って実行
[sudo] password for ユーザ: # ここでパスワードを入力（一定期間sudoしてないと表示される）
Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
Get:2 http://archive.ubuntu.com/ubuntu jammy-updates InRelease [119 kB]
Get:3 http://archive.ubuntu.com/ubuntu jammy-backports InRelease [109 kB]
Get:4 http://archive.ubuntu.com/ubuntu jammy-security InRelease [110 kB]
Get:5 http://archive.ubuntu.com/ubuntu jammy-updates/main amd64 Packages [868 kB]
Get:6 http://archive.ubuntu.com/ubuntu jammy-updates/main Translation-en [212 kB]
Get:7 http://archive.ubuntu.com/ubuntu jammy-updates/main amd64 c-n-f Metadata [15.6 kB]
Get:8 http://archive.ubuntu.com/ubuntu jammy-updates/universe amd64 Packages [964 kB]
Get:9 http://archive.ubuntu.com/ubuntu jammy-updates/universe Translation-en [209 kB]
Fetched 2,613 kB in 4s (686 kB/s)
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
26 packages can be upgraded. Run 'apt list --upgradable' to see them.
```

`sudo`とても危険なコマンドです。
なんでも`sudo`に頼らず、本当にroot権限が必要か、
そもそも今行おうとしている作業が本当に正しいのかをよく確認してください。
大いなる力には大いなる責任が伴います。

#### apt

`apt`はDebian系のLinuxで利用されるパッケージ管理システムです。

基本的には下記の構文で主に利用されます。

```shell
$ sudo apt update # パッケージ情報の更新
$ sudo apt upgrade # パッケージの更新
$ sudo apt install パッケージ名 # パッケージのインストール
$ sudo apt remove パッケージ名 # パッケージのアンインストール
$ sudo apt purge パッケージ名 # パッケージの設定ごと削除
$ sudo apt autoremove # 不要なパッケージの削除
$ sudo apt autopurge # 不要なパッケージの設定ごと削除
$ apt search パッケージ名や検索ワード # パッケージの検索
```

基本的に、aptコマンドで何かしらの作業をする前に、
必ず`apt update`を行ってください。

aptコマンドでは、パッケージの情報をローカルに一度保管するため、
ローカルのデータが古いと様々なコマンドが失敗します。

## Dockerとdocker-composeのインストール

Dockerはコンテナ型の仮想化技術です。
Kernelレベルでの仮想化を行うため、
仮想化ソフトウェアを利用するよりも軽量で高速に動作します。

また、イメージという概念でアプリケーションの展開を行うため、
とてもめんどくさい環境構築も比較的楽になります。

[Docker公式のマニュアル](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)を読むのが一番良いでしょう。

インストールする際は最新のバージョン
（英語的にはLatest Version）をインストールしてください。

Docker Composeも同じように[公式ドキュメント](https://docs.docker.com/compose/install/linux/#install-using-the-repository)を参考にインストールしてください。

最後にインストールできているか確認しましょう

```
$ docker --version
Docker version 24.0.5, build ced0996

$ docker-compose --version
docker-compose version 1.29.2, build unknown
```

値が違っても構いません。
エラーが出ていないことを確認してください。

## DockerとDocker Composeで遊ぶ

さて、Dockerで遊んでみましょう。

試しに

```shell
$ sudo docker run --rm -it ubuntu:latest bash
```

などと実行し、Ubuntuのイメージを実行してみましょう。

シェルに`root@ランダムな文字列:/#`と表示されれば成功です。

この環境はあくまで仮想環境です。
`rm -rf /*`などを打っても多分大丈夫だと思います（責任は取りません）

`exit`で抜けましょう。

Docker Composeは少し便利になったDockerです。

通常Dockerでは、ネットワークなどで接続性を用意する場合、
それはもうめんどくさい手順が必要ですが、
Docker Composeでは同一のYamlファイル内のコンテナは
初期状態で同一のネットワークに接続され、Yaml内のキーの名前で名前解決できるため、
DBが必要なアプリケーションの構築などでとても便利です。

Dockerとdocker-composeについて説明しようとするとかなり長くなるので、
詳しくはググるか個別で質問して解決してください。

### 覚えておくべきこと

Dockerではコンテナとイメージがよく出てきます。
イメージからコンテナが作られ、コンテナ内で様々な事象が起こります。
コンテナは不要になれば破棄できます。

イメージが同じであれば、基本的には同じ内容コンテナが生成されます。

#### 永続化

Volumeを使うと、コンテナの特定のディレクトリやファイルなどを、
現実のシステム上のディレクトリやファイルにマウント（若者的にはリンクとか言った方がいい？）できます。
これにより、コンテナ内のデータを永続化できます。

試してみましょう

あらかじめホストで`ls /tmp`を実行し、中身をなんとなく覚えておいてください。

```
docker run --rm -it -v /tmp:/hosttmp:ro ubuntu:latest bash
```

このコマンドでコンテナを構築し、`ls /hosttmp`を実行すると大体同じ内容になっているはずです。
`:ro`をつけているため、touchなどを実行しようとしても弾かれると思います。

#### ポート開放

Exposeという概念があります。
Dockerでは標準でネットワークに対しホストのIPでNAPT([e-Worldの解説](https://e-words.jp/w/NAPT.html))されるため、
Exposeを使い明示的にポートを指定してアクセスを許可する必要があります。

例えば、

```
docker run --rm -it -p 8080:80 nginx:latest
```

で8080ポートでnginxにアクセスできます。

試しにブラウザで`http://サーバのIP:8080/`にアクセスしてみてください。
Welcome to nginx!が表示されるはずです。

`Ctrl` + `C`の同時押しで終了しましょう。

## Mattermostの構築

推奨される手順は[公式ドキュメント](https://docs.mattermost.com/install/install-docker.html)に記述されていますが、
今回は独自流で進めます。

Mattermost用にディレクトリを作り、その中に移動します。
今後はその中で主に作業を行います。

`.env`ファイルを作り下記の内容にします。
ただし、コメントは削除してください（日本語が不具合を起こすかもしれないので）

```shell
# Mattermostを公開するドメインを設定してください。
# cloudflaredで公開できるドメインを設定してください。
DOMAIN=mattermost.example.com

# タイムゾーン設定です
# 日本ならAsia/Tokyoそれ以外は
# https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
# を参照してください。
TZ=Asia/Tokyo

# PCが再起動した際にどのようにするかの設定です。
# always: 停止されていた場合でも再起動時に起動する
# unless-stopped: 停止されていなければ再起動時に起動する
# on-failure: エラーで停止した場合のみ再起動する
RESTART_POLICY=unless-stopped

# Postgresデータベースのバージョンです。
# https://hub.docker.com/_/postgres
# に書いてある最新のbetaやalphaとついていないバージョンを指定しるとよいでしょう。
POSTGRES_IMAGE_TAG=15-alpine
# Postgresの永続化先です
# このディレクトリを削除するとデータベースが消えます。
POSTGRES_DATA_PATH=./volumes/db/var/lib/postgresql/data

# Postgresのユーザ名、パスワード、データベース名です。
# この値をMattermost側で設定し、MattermostがDBを使えるようにします。
POSTGRES_USER=mmuser
POSTGRES_PASSWORD=mmuser_password
POSTGRES_DB=mattermost

# Mattermostの設定ファイル関連の永続化設定です
MATTERMOST_CONFIG_PATH=./volumes/app/mattermost/config
MATTERMOST_DATA_PATH=./volumes/app/mattermost/data
MATTERMOST_LOGS_PATH=./volumes/app/mattermost/logs
MATTERMOST_PLUGINS_PATH=./volumes/app/mattermost/plugins
MATTERMOST_CLIENT_PLUGINS_PATH=./volumes/app/mattermost/client/plugins
MATTERMOST_BLEVE_INDEXES_PATH=./volumes/app/mattermost/bleve-indexes

# Bleve index (全文検索)の設定です
# いじらないでください。
MM_BLEVESETTINGS_INDEXDIR=/mattermost/bleve-indexes

# 課金している場合は`mattermost-enterprise-edition`に変更してください。
# それ以外は`mattermost-team-edition`のままにしてください。
MATTERMOST_IMAGE=mattermost-team-edition
# バージョンは
# https://hub.docker.com/r/mattermost/mattermost-team-edition/tags
# https://docs.mattermost.com/install/self-managed-changelog.html
# の2つの両方にある物を選択してください。
# 現状の最新は8.0です。
MATTERMOST_IMAGE_TAG=8.0

# Mattermostの公開ポートです。
# そのまま使うわけではないので8065にしたままにすることを推奨します。
APP_PORT=8065

# データベースの設定です。
# 変更しないでください
MM_SQLSETTINGS_DRIVERNAME=postgres
MM_SQLSETTINGS_DATASOURCE=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?sslmode=disable&connect_timeout=10

# Mattermostの公開URL設定です
# 特定ポートで公開したい場合などは編集する必要がありますが、
# 今回の設定では不要です
MM_SERVICESETTINGS_SITEURL=https://${DOMAIN}
```

`docker-compose.yml`を作り下記の内容にします。

```yaml
version: "2.4"

services:
  postgres:
    image: postgres:${POSTGRES_IMAGE_TAG}
    restart: ${RESTART_POLICY}
    security_opt:
      - no-new-privileges:true
    pids_limit: 100
    read_only: true
    tmpfs:
      - /tmp
      - /var/run/postgresql
    volumes:
      - ${POSTGRES_DATA_PATH}:/var/lib/postgresql/data
    environment:
      - TZ
      - POSTGRES_USER
      - POSTGRES_PASSWORD
      - POSTGRES_DB

  mattermost:
    depends_on:
      - postgres
    image: mattermost/${MATTERMOST_IMAGE}:${MATTERMOST_IMAGE_TAG}
    restart: ${RESTART_POLICY}
    security_opt:
      - no-new-privileges:true
    pids_limit: 200
    tmpfs:
      - /tmp
    volumes:
      - ${MATTERMOST_CONFIG_PATH}:/mattermost/config:rw
      - ${MATTERMOST_DATA_PATH}:/mattermost/data:rw
      - ${MATTERMOST_LOGS_PATH}:/mattermost/logs:rw
      - ${MATTERMOST_PLUGINS_PATH}:/mattermost/plugins:rw
      - ${MATTERMOST_CLIENT_PLUGINS_PATH}:/mattermost/client/plugins:rw
      - ${MATTERMOST_BLEVE_INDEXES_PATH}:/mattermost/bleve-indexes:rw
    environment:
      - TZ
      - MM_SQLSETTINGS_DRIVERNAME
      - MM_SQLSETTINGS_DATASOURCE
      - MM_BLEVESETTINGS_INDEXDIR
      - MM_SERVICESETTINGS_SITEURL
    ports:
      - ${APP_PORT}:8065
```

`docker-compose up -d`で実行します。
`docker-compose logs -f`でログを確認できます。

ログが出力されなくなったら`Ctrl` + `C`で終了しましょう。

## Cloudflaredのインストール

今回は[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
でサーバを公開します。

[Cloudflare packages](https://pkg.cloudflare.com/index.html#ubuntu-jammy)を参考にaptでCloudflaredをインストールできるようにします。

インストールが終わったら`cloudflared --version`でインストールが正常にできているか試してみましょう。

```shell
$ cloudflared --version
cloudflared version 2022.10.3 (built 2022-10-26-1030 UTC)
```

Cloudflaredの設定は[Cloudflareの公式ドキュメント](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/tunnel-guide/remote/)を参照してください。
Cloudflareは明らかにいい方向に向かっていますが、UIの変更が多いため、ここで説明しても多分すぐ変わります。

Public Hostnameで設定するローカルアドレスは`http://localhost:8065`です。
Additional application settingsは不要です。

Connect a networkセクションはスキップしてください。

## 動作確認

最後に、Mattermostにドメイン越しでアクセスできるか試してください。

初期設定も必要に応じて行ってください
（本来は初期設定は公開前に行ってください。セキュリティ事故が起こります）