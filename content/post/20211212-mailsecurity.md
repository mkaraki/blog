---
title: 簡易的なメール受信のセキュリティ的な話
tags: 
- Mail
date: 2021-12-12T00:00:00+09:00
author: mkaraki
slug: '20211212-mailsecurity'
---

普段私はメールサーバからのレポートやCron Daemonからのメールくらいしか受け取りませんが、
近頃人間からメールを受け取る機会が増えたのでセキュリティについて語ろうと思います。

## PPAPとは
Japanese Mail Cultureといえば[PPAP](https://ja.wikipedia.org/wiki/PPAP_(%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3))でしょう。

> Password付きZIPファイルを送ります、Passwordを送ります、Angoka（暗号化）Protocol（プロトコル）
>
> JIPDEC, [くたばれPPAP！ ～メールにファイルを添付する習慣を変えるところから始める働き方改革～](https://www.jaipa.or.jp/event/isp_mtg/asahikawa_190912-13/190913-3.pdf) より

日本企業においてはマナーなどと形容される謎文化です。

この文化の難点はただ一つ、パスワード付きzipファイルはセキュリティを通り抜ける点です。

試しに、[7-Zip](https://www.7-zip.org/)などのツールで適当にパスワード付きzipを作って[Virus Total](https://www.virustotal.com/)あたりに投げてみてください。
普段なら賛否両論なソフトウェアもあっという間に安全なファイルに早変わりします。

![やばいファイル](https://user-images.githubusercontent.com/26180919/145703763-2b50090f-6719-4ca1-8a3a-59f727e9e7bf.png)  
生の状態のやばいファイル

![PPAPされたやばいファイル](https://user-images.githubusercontent.com/26180919/145703728-98402092-af08-4bb3-8542-c612fa99b791.png)  
PPAPされたやばいファイル

ちなみに、今回スキャンに掛けた[ShinoLocker](https://shinolocker.com/)はランサムウェアと同じ動作をするテスト用シミュレータです。
もし本物のランサムウェアが現場のセキュリティをかいくぐって職場に入り込んだら…ぞっとしますよね。

実際にEmotetの感染経路にPPAPが存在します。([IPAの記事](https://www.ipa.go.jp/security/announce/20191202.html))

### PPAP撲滅派の動き
PPAPは百害あって一利なしの存在です。

人によっては誤送信防止という人もいるかもしれませんが、
パスワードをすぐに送る時点で誤送信防止かは怪しいですし、
そもそもパスワード付きzipのパスワードは簡易的なものが多く、総当たり可能な桁数であることがほとんどです。

例えば[IIJ](https://www.iij.ad.jp/)は[パスワード付きzipファイルが添付されたメールを受信サーバ側で破棄する運用に変更されました](https://www.iij.ad.jp/ppap/)。

これを受け、私個人や、団体としてもPPAPを施されたメールをすべてブロックするか、
相手にZipファイルのハッシュ値を電話で確認するなどの手法でセキュリティ対策としています。

## SPF/DKIM
SPF/DKIMは発信者特定の技術です。
双方の違いは[SendGridが出している記事](https://sendgrid.kke.co.jp/blog/?p=10121)がとても参考になります。

これらを設定していない企業からのメールは本当にそのメールが当該企業から来たものなのかを判定することが難しいため、
一度電話やSMSなどの連絡手段を用いてメールが本人から送られたものなのかを確認する運用をしています。

注意点として、SPFレコードが設定されてるメールの場合、メールの転送を行うとFAILになります。
DKIMはこのような問題が起きないため、DKIMも必ず設定し、SPFはSOFTFAILにすることをお勧めしています。

また、DMARCを設定することによって、自社ドメインを騙ったメールが送信されているかを簡単に確認することができるので、設定をお勧めします。

## 文面
最後は送信者に対する忠告の意が大きいです。

Gmailなどのメールプロバイダでは文面でメールをブロックする場合があるそうです。

例えばハートが使われていたり、`? 、 。`が多用されていたりなど、
どう考えてもビジネスメールとして相応しくないメールは迷惑メールボックス行きになります。

また、直接的な金銭の要求なども迷惑メールボックス行きになります。

確かに、現代では個人同士のやり取りにメールを利用することは少なくなりましたし、
このフィルターは妥当に思えますが、親しい間柄のビジネスメールでは未だありそうなケースです。
送信者の方はご注意ください。
