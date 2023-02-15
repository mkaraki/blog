---
title: WindowsをSSLインスペクション環境で利用する
date: 2023-02-16T00:00:00+09:00
author: mkaraki
slug: '20230216-winsslbump'
---

メモ記事です。
私が困難に直面し次第、追記をします。
IssueとかPR投げてもらえれば反映するかもしれません。

## Python

pipを使いWindowsの証明書を利用できるようにするパッケージを入れる。
現状、[requests](https://pypi.org/project/requests/)で動作確認済み。
venv先にもインストールする必要がある。

pip自体もSSLを利用するため、明示的にいくつかのホストをTrustedさせている。

```
pip install pip-system-certs --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org
```
