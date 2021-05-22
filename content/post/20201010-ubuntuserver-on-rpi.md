---
title: Raspberry Pi上でUbuntu server 20.04を動かしてsshできるようにするまで
tags: 
- RaspberryPi
- Ubuntu
- UbuntuServer
- ubuntu20.04
- SSH
date: 2020-10-10T00:00:00+09:00
slug: '20201010-ubuntuserver-on-rpi'
---
# 経緯
Raspbian環境が壊れたので新しく環境を用意しようとしたところ、私の大好きなUbuntuが使えることを知りました。しかし、インストールからsshできるまでかなりの時間を割かなければならなかったので、ここにメモがてら書き留めることにしました。

# イメージ焼き
特に難しいことはないです。[Install Ubuntu Server on a Raspberry Pi 2, 3 or 4 | Ubuntu](https://ubuntu.com/download/raspberry-pi) から使いたいRaspberry Pi向けのイメージをダウンロードしてください。
その際、zipではなくxzで圧縮されていますので、Windowsユーザーの方は7zipなどを使ってください。

# 起動
初期パスワードだけ注意してください。

|ユーザー名|パスワード|
|---|---|
|ubuntu|ubuntu|

その際、パスワードの変更を求められます。もう一度初期パスワードの入力をしなければならないのでご注意ください。

# openssh-serverの設定
openssh-serverはインストールされていますが、hostkeyが設定されていません。
次のコマンドを使ってhostkeyを自動生成させてください。

```shell
$ sudo dpkg-reconfigure openssh-server
```

生成出来たらopenssh-serverを再起動してください。

```shell
$ sudo service ssh restart
```

# 参考
- Ubuntu 20.04 LTS Server を Raspberry Pi 4 にインストール - Qiita, https://qiita.com/azumabashi/items/182f365cf7405156788c 2020.10.10 参照.
- How To: Ubuntu / Debian Linux Regenerate OpenSSH Host Keys - nixCraft, https://www.cyberciti.biz/faq/howto-regenerate-openssh-host-keys/ 2020.10.10 参照.
