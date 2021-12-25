---
title: 謎の l.instagram.com ドメインが含まれているDMについて
tags: 
- Security
date: 2021-12-25T00:00:00+09:00
author: mkaraki
slug: '20211225-instagram-link'
---

今Twitterを騒がしている`l.instagram.com`ドメインのメッセージですが、
先日このメッセージが来たので、これの正体について少し探ろうと思います。

この記事内では無害化した複数のリンクを記述しているがもし除く場合は自己責任でどうぞ。

## 届いたメッセージ

![image](https://user-images.githubusercontent.com/26180919/147385322-6fca6ec3-89bd-46df-ae4a-24e863c63b5b.png)

リンク(無害化済み): `https:// l [dot] instagram [dot] com /?[My Twitter ID]_41_4559965334=e208e6be6eb9bf297853619e7cbeeeb5&e=ATO57b9Db1Mn3Ux88bPC-yAhRTW3Y4c9jBdUr86_sREpA1AL0RtYnjrvhw3WWJked-hV2C2V&s=1&s=1&u=http:// business [dot] instagram [dot] com /micro_site/url/?event_type=click&site=igb&destination=https%3A%2F%2Fwww.facebook.com%2Fads%2Fig_redirect%2F%3Fd%3DAd-9UUpXVqVLNUx_LYaKZeKek5oYlWjoEdXwzKgPbUE9qRpf4p77ahkKJVJ0kuzPpFtsCo6iNW3tiZLDTY2LPR4xCa63d0ycYdTB4uq9n11GSU2h81N4csFuuiw8b0crQB08jWUYW08n1cc2LujG0j00JXW6R7_-_xEeAwWPs56HHv7PQhgj6ktkhSEU5AhwI8vAMSgikxz8VtJ4JiQRzIjL%26a%3D1%26hash%3DAd9_0TyBjc1n8sHe`

わかる人にはわかると思いますが、`l.instagram.com`ドメインはTwitterなどで使われているような`t.co`ドメインのような役割を持っています。

[ソース](https://web-omusubi.com/blog/omusubi79.html)

## このメッセージのリンク先
最終的には`https:// m [dot] ztney [dot] com /#BST`に飛ばされます。

流れとしては
1. t.coからLocationヘッダで`http://l.instagram.com`に飛ぶ
2. そのまま307, Locationヘッダで`https://l.instagram.com`に飛ぶ 
3. JavaScriptまたはrefreshタグで`https:// business [dot] instagram [dot] com /micro_site/url/?event_type=click&site=igb&destination=https://www.facebook.com/ads/ig_redirect/?d=Ad-9UUpXVqVLNUx_LYaKZeKek5oYlWjoEdXwzKgPbUE9qRpf4p77ahkKJVJ0kuzPpFtsCo6iNW3tiZLDTY2LPR4xCa63d0ycYdTB4uq9n11GSU2h81N4csFuuiw8b0crQB08jWUYW08n1cc2LujG0j00JXW6R7_-_xEeAwWPs56HHv7PQhgj6ktkhSEU5AhwI8vAMSgikxz8VtJ4JiQRzIjL&a=1&hash=Ad9_0TyBjc1n8sHe`に飛ぶ
4. 302, Locationタグで`https:// www [dot] facebook [dot] com /ads/ig_redirect/?d=Ad-9UUpXVqVLNUx_LYaKZeKek5oYlWjoEdXwzKgPbUE9qRpf4p77ahkKJVJ0kuzPpFtsCo6iNW3tiZLDTY2LPR4xCa63d0ycYdTB4uq9n11GSU2h81N4csFuuiw8b0crQB08jWUYW08n1cc2LujG0j00JXW6R7_-_xEeAwWPs56HHv7PQhgj6ktkhSEU5AhwI8vAMSgikxz8VtJ4JiQRzIjL&a=1&hash=Ad9_0TyBjc1n8sHe`に飛ぶ
5. 302, Locationタグで`http:// bartinkizogrenciyurdu [dot] com /STALK`に飛ぶ
6. 307, Locationタグで`https`に飛ぶ
7. 5,6の流れをURL末端に`/`を入れて実施
8. 302, Locationで`https://m [dot] ztney [dot] com/_BST_`に飛ぶ
9. いろいろあって`https:// m [dot] ztney [dot] com /#BST`に飛ぶ（理由がわからんかった）

このリンクはよくできていて、`t.co`を経由していないと(ほかにも条件はありそうですが)[Instagram business](https://business.instagram.com/)に飛ばされます。

## LOG IN WITH TWITTERの挙動
最終的にはTwitterのアプリケーション連携に行くが、途中の流れは下記のようになる。

1. ボタンは`https://m [dot] ztney [dot] com/gir`に飛ぶ
2. 302, Locationで`https://www [dot] twitbu [dot] com/web/bridge.php?ref=ztney`に飛ぶ
3. ランダムなトークンを設定した状態で、302でTwitterの連携画面に

`oauth_token`の値が毎回変更されているのが個人的には面白かった。
連携アプリケーション名はランダムで変更されているようだ。

連携画面はこんな感じ。
![image](https://user-images.githubusercontent.com/26180919/147386075-4a528ae5-6673-4326-a715-a28b857eccff.png)

~~たれか暇な人API制限かかるまでアカウント登録してみてくれないかな…~~

## 最後に
こういうの調べるの楽しい！
