---
title: Mailjetを使ったメール送信サーバをUbuntu22.04とPostfixで作る
date: 2023-08-27T00:00:00+09:00
author: mkaraki
slug: '20230827-mailjet-postfix'
---

## 目的

Zabbixなどのメールを配信するサーバをMailjetを使って構築します。
Mailjetを使うことで、OP25Bが行われているプロバイダでもメールを送信できるようにします。

## Postfixのインストール

`libsasl2-modules`がないと認証で失敗するため、同時にインストールします。

Postfixの設定はNo configで続行してください。

```
apt install libsasl2-modules postfix 
```

## Postfixの設定

Postfixの設定例です。
実際の拠点で使っているものを記述しているので、
いくつか不要な表記があると思います。
各自で消してください。

```
relayhost = in-v3.mailjet.com:587
smtp_sasl_auth_enable = yes
smtp_use_tls = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_security_options = noanonymous

command_directory = /usr/sbin
daemon_directory = /usr/lib/postfix/sbin
data_directory = /var/lib/postfix

myhostname = example.com
mydomain = example.com

local_recipient_maps =

mail_owner = postfix

myorigin = $mydomain
smtpd_banner = $myhostname ESMTP

inet_protocols = all
inet_interfaces = all
mynetworks_style = subnet
mynetworks = 127.0.0.0/8

smtpd_relay_before_recipient_restrictions = yes
smtpd_relay_restrictions =  permit_mynetworks, reject_unauth_destination
smtpd_recipient_restrictions = permit_mynetworks, reject_unauth_destination

setgid_group = postdrop

message_size_limit = 10485760
mailbox_size_limit = 0
compatibility_level = 3.6
```

## 認証情報の設定

`/etc/postfix/sasl_passwd`は次の内容になります。
ホスト名指定が`in-v3`ではなく`in`のみになっていることに注意してください。

```
in.mailjet.com APIKey:SecretKey
```

## 適用

最後にpostmapを実行し、Postfixを再起動します。

```
sudo postmap hash:/etc/postfix/sasl_passwd
sudo systemctl restart postfix
```
