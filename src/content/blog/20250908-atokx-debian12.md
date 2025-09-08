---
title: Debian 12 (x86)にATOK X for Linuxをインストールする
date: 2025-09-08T00:00:00+09:00
author: mkaraki
---

大昔にジャストシステムから発売されたATOK X for LinuxをDebian 12にインストールします。

この手順でインストールしたATOK Xは極めて不安定かつ、低速で、
変換ウィンドウやメニューすら表示されない有様ですが、
ある程度の動作確認は取れた為、現在の知識で出来る最善を記録する目的で記事にします。

トライアンドエラーを繰り返しまくった為、
もしかしたら必要の無い手順が入っているかもしれない。

また、DebianのIIIMFをインストールすれば改善するかもしれないが、
今回は付属のHTTとXIMで動かす。

## 環境及び検証内容

下記の環境をセットアップしています。
基本的にはDebianのインストーラで最小構成 + System Utilityをインストールした後、
`xinit`と`openbox`をインストールした形です。

- Debian 12.9 i386
- `openbox 3.6.1-10`
- `xinit 1.4.0-1`
- 日本語設定
    - `LANG=ja_JP.UTF-8`
    - `XKBMODEL=pc105`
    - `XKBLAYOUT=jp`
    - `fonts-noto-cjk`

下記のソフトウェアにて日本語入力を検証しました。

- `vim-gtk3 2:9.0.1378-2+deb12u2`（成功）
- `xterm 379-1`（成功）
- `kwrite`（失敗, 反応せず）
- `kate`（失敗, 反応せず）

### 既知の問題

現状、下記の問題が起きており、解決方法は不明です。

- IMEのオンオフ切り替えが極めて遅い
    - gvim等はつられてInsertモードへの切り替えなども遅くなる
- 変換の切り替えが遅くなる
    - 候補の二つ目くらいまでは軽量に動くが、それ以降を呼ぼうとするとかなり遅くなる
- 変換候補ウィンドウやATOKパレットなどが表示されない
    - 入力文字種表示のみが出てくる状態
- X全体がフリーズして操作を受け付けなくなる場合がある
    - X全体ではなくアプリケーション単位でhtt (XIM)を読ませると影響を小さく出来る
- `AtokPaletteAux`, `SystemLineAux`, `LookupAux`が継続的にセグフォする
    - `segfault at 35 ip ... sp ... error 4 in libglib-1.2.so.0.0.10[...]`らしい
    - 読み込ませる`libglib`を書き直したら直りそうだけど、さすがに知識が足りなさすぎる

## 公式tgzパッケージの展開

適当なディレクトリに、CD内の`atokx-1.0-1.i386.tgz`と`iiimf.tgz`をコピーし、
`tar xf filename.tgz`で展開する。

その後、`cp -R ./{etc,usr,var} /`でシステムにインストールする。

## `init.d/functions`のインストール

CentOSの`initscripts`のソースパッケージに含まれている、`rc.d/init.d/functions`を`/etc/rc.d/init.d/functions`に保存する。

今回は、[`initscripts-9.03.31-2.el6.centos.src.rpm`](https://vault.centos.org/6.3/os/Source/SPackages/initscripts-9.03.31-2.el6.centos.src.rpm)から展開した。
（[Wayback Machineのリンク](https://web.archive.org/web/20241231115226/https://vault.centos.org/6.3/os/Source/SPackages/initscripts-9.03.31-2.el6.centos.src.rpm)）

## `consoletype`のビルド

Gentooプロジェクトの`gentoo-functions`から、[`consoletype.c`](https://gitweb.gentoo.org/proj/gentoo-functions.git/tree/consoletype.c?id=f0ca05097fc2f454deae6eedc1bf94d6cd543013)をもらってくる。
コンパイルはただ`gcc consoletype.c`すればよい。

先のinitscriptsにある`consoletype.c`をビルドしても良さそうであるが、こちらは未検証。

コンパイルしたファイルは、`/sbin/consoletype`に設置する。

## `libxt`のインストール

普通にaptで入る。
一応`libc6`や`libx11`も明示的に入れておくが、
多分最初から入っていると思う。

```bash
apt install libc6 libx11-6 libxt-dev
```

## `atokx`及び`IIim`サービスのSystemdへの登録と実行

本来は`init.d`ファイルをSystemd向けに書き直すべきであろうが、
めんどくさいので、そのままSystemdから呼び出す形にする。

まず、`/usr/lib/systemd/system/atokx.service`は下記のようになる。
IIimの後に起動するようにしているが、特に要らない気もする。

```service
[Unit]
Description=ATOK X Server
After=IIim.service

[Service]
Type=forking
ExecStart=/etc/rc.d/init.d/atokx start
ExecStop=/etc/rc.d/init.d/atokx stop

[Install]
WantedBy=default.target
```

`/usr/lib/systemd/system/IIim.service`は下記の通り。
こちらはsimpleで直接実行した方がエラー時の復旧的にもよいと思う。

```service
[Unit]
Description=IIim

[Service]
Type=forking
ExecStart=/etc/rc.d/init.d/IIim start
ExecStop=/etc/rc.d/init.d/IIim stop

[Install]
WantedBy=default.target
```

2つとも設置できたら、下記のコマンドで起動してしまう。

```bash
systemctl daemon-reload
systemctl enable --now atokx IIim
```

## `xrdb`の配置

aptで`x11-xserver-utils`をインストールした後、
下記のコマンドで`/usr/X11R6/bin`の中に`xrdb`のシンボリックリンクを置く。

```bash
mkdir -p /usr/X11R6/bin
ln -s /usr/bin/xrdb /usr/X11R6/bin/xrdb
```

## GTK1.2のインストール

aptにはもう存在しないため、
GNOMEプロジェクトから[`glib-1.2.10.tar.gz`](https://download.gnome.org/sources/glib/1.2/glib-1.2.10.tar.gz)と[`gtk+-1.2.10.tar.gz`](https://download.gnome.org/sources/gtk%2B/1.2/gtk%2B-1.2.10.tar.gz)をダウンロードしてくる。

### `glib`のインストール

ダウンロードしてきた`glib`のパッケージを展開し、
`gstrfuncs.c`を修正する。

おそらくこの修正は間違ったアプローチであるが、
現状これしか解決策が思い浮かばないので、
そのまま編集してしまう。

下記にpatchファイルを貼る。
適当にファイルに保存し、
`patch < saved-patch-file.patch`すれば適用されるはず。

```diff
--- gstrfuncs.c    2025-09-08 20:32:11.237763156 +0900
+++ gstrfuncs.c.patched 2025-09-08 16:31:52.089892394 +0900
@@ -867,8 +867,8 @@
                   /* beware of positional parameters
                    */
                 case '$':
-                  g_warning (G_GNUC_PRETTY_FUNCTION
-                             "(): unable to handle positional parameters (%%n$)");
+                  g_warning (G_GNUC_PRETTY_FUNCTION);
+                             /* "(): unable to handle positional parameters (%%n$)"); */
                   len += 1024; /* try adding some safety padding */
                   break;

@@ -1034,8 +1034,8 @@
                   /*          n   .   dddddddddddddddddddddddd   E   +-  eeee */
                   conv_len += 1 + 1 + MAX (24, spec.precision) + 1 + 1 + 4;
                   if (spec.mod_extra_long)
-                    g_warning (G_GNUC_PRETTY_FUNCTION
-                               "(): unable to handle long double, collecting double only");
+                    g_warning (G_GNUC_PRETTY_FUNCTION);
+                               /* "(): unable to handle long double, collecting double only"); */
 #ifdef HAVE_LONG_DOUBLE
 #error need to implement special handling for long double
 #endif
@@ -1077,8 +1077,8 @@
                   conv_done = TRUE;
                   if (spec.mod_long)
                     {
-                      g_warning (G_GNUC_PRETTY_FUNCTION
-                                 "(): unable to handle wide char strings");
+                      g_warning (G_GNUC_PRETTY_FUNCTION);
+                                 /* "(): unable to handle wide char strings"); */
                       len += 1024; /* try adding some safety padding */
                     }
                   break;
@@ -1108,9 +1108,9 @@
                   conv_len += format - spec_start;
                   break;
                 default:
-                  g_warning (G_GNUC_PRETTY_FUNCTION
-                             "(): unable to handle `%c' while parsing format",
-                             c);
+                  g_warning (G_GNUC_PRETTY_FUNCTION);
+                             /* "(): unable to handle `%c' while parsing format",
+                             c); */
                   break;
                 }
               conv_done |= conv_len > 0;
```

パッチの適用が終わったら、Configureとmake、make installを行う。
今回はインストール先を変更したいため、`prefix`を設定する。
また、コンパイルエラーをなくすために、いくつかのむちゃくちゃなオプションも指定する。

```bash
CFLAGS='-fcommon -D__const__=__volatile__' ./configure --prefix=/usr/local/gtk-1.2
make
make install
```

もしシステム全体にインストールしたい場合は、
`prefix`を明示的に`/`にする。
設定した`prefix`は`gtk+`のインストールでも同じ値を設定する。

### `gtk+`のインストール

こちらも展開し、下記のコマンドでconfigureとmake、make installを行う。
パッチの適用は特に必要無い。

```bash
LD_LIBRARY_PATH=/usr/local/gtk-1.2/lib:$LD_LIBRARY_PATH GLIB_CONFIG=/usr/local/gtk-1.2/bin/glib-config CFLAGS='-fcommon' ./configure --prefix=/usr/local/gtk-1.2
make
make install
```

もし、先ほどのセクションでシステム全体に`glib`をインストールした場合は、configureコマンドを下記の要に変更する。

```bash
CFLAGS='-fcommon' ./configure --prefix=/
```

## `EUC-JP`のロケール生成

`/etc/locale.gen`の`ja_JP.EUC-JP`の行をコメントを外し、
`locale-gen`コマンドを実行して適用する。

システム全体のロケールを変更する必要は、
Fefora Core 1がUTF-8であることを考えるとなさそう。

## `libXi.so`のインストール

aptで`libxi-dev`をインストールする。

Fedora Core 1向けのインストール手順を踏襲する為の手順のため、
もしかしたら飛ばせるかもしれない。

飛ばす場合は、`atokx_client`スクリプトの`LD_PRELOAD`も設定しないように。

## `atokx_client`スクリプトの編集

`/usr/lib/im/locale/ja/atokserver/atokx_client`を編集する。

```bash
/usr/lib/im/httx -if atok12 -lc_basiclocale ja_JP -xim htt_xbe &
```

と書いてある行を、下記のように変更する。
`LD_LIBRARY_PATH`はGTK1.2をシステム全体に入れた場合は要らない。

```bash
LD_PRELOAD=/usr/lib/i386-linux-gnu/libXi.so LD_LIBRARY_PATH=/usr/local/gtk-1.2/lib:$LD_LIBRARY_PATH LANG=ja_JP.eucJP /usr/lib/im/httx -if atok12 -lc_basiclocale ja_JP -xim htt_xbe &
```

## 自動起動スクリプトを書く

`httx`がそれなりの頻度で落ちるため、
自動で再起動するスクリプトを用意する。

本資料では、これを`~/.htt_helper.sh`に置く。
`chmod +x`を忘れないように。

```bash
#!/bin/bash

while true; do
    htt_proc=`ps x | grep "/usr/lib/im/httx" | wc -l`

    if [ $htt_proc -lt 2 ]; then
        logger -is -p user.info -t htt_helper "httx might crashed or not booted. Restarting."
        . /usr/lib/im/locale/ja/atokserver/atokx_client
    fi
done
```

## `xinitrc`を書く

`~/.xinitrc`に下記の内容を記述する。

上記の自動再起動スクリプトを使わない場合は、`~/.htt_helper.sh`の行をコメントアウトし、
1行上にある純正のローダを呼び出す行のコメントを外す。

```bash
#!/bin/bash
export XMODIFIERS=@im=htt
export XIM="htt"

export XIM_PROGRAM=/bin/true

export GTK_IM_MODULE=xim
export QT_IM_MODULE=xim

#. /usr/lib/im/locale/ja/atokserver/atokx_client
~/.htt_helper.sh &

exec /etc/X11/xinit/xinitrc
```

## 参考資料

- [覚え書き: /etc/init.d/functions の解説](https://darutk-oboegaki.blogspot.com/2012/10/etcinitdfunctions.html)
- [[018139]Fedora Core 1設定例（参考情報）, ジャストシステムズ](https://support.justsystems.com/faq/1032/app/servlet/qadoc?QID=018139)
- [atok on Gentoo Linux - 落穂拾い](https://blog.goo.ne.jp/gleaning/e/c3d9ea48faf49445f0ba5feb2d4ddeee)

