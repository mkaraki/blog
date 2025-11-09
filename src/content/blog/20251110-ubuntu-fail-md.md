---
title: ソフトウェアRAIDの削除方法
date: 2025-11-10T00:00:00+09:00
author: mkaraki
---

Ubuntu Server 24.04等で利用されている新しいインストーラでは、`/dev/md*`が存在し、
ディスクがRAIDで利用されている場合、RAID無しで設定しようとするとインストール時にコケる。

元々RAID環境で使われていたストレージを利用しようとすると、
元々使っていたRAID環境が復元されるようで、
これを無効化しなければインストールに失敗する。

## 環境

- Express5800 T110i
- RAIDカード無し, AHCIモード
- Ubuntu Server 24.04.3

## 手順

画面上のHelpからシェルを開き、下記コマンドでRAIDの設定状況とデバイス名を取得します。

```bash
cat /proc/mdstat
```

RAIDを停止し、RAIDの構成デバイスからスーパーブロックを削除します。
コントローラの仕様によっては、`/dev/sda1`のようにパーティションがRAIDメンバーになっているかもしれません。

```bash
mdadm --stop /dev/md126
mdadm --zero-superblock /dev/sda
```

昔はパーティションテーブルが残っているとインストールにコケたため、
念のためにディスクのパーティションテーブルあたりを削除しておきます。

```bash
dd if=/dev/zero of=/dev/sda bs=512M count=2
```

最期に再起動をすることで、RAIDブロックに起因するエラーは改善されます。
