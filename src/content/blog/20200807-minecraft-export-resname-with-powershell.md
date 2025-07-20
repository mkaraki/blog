+++
date = 2020-08-06T15:00:00Z
slug = "20200807-minecraft-export-resname-with-powershell"
tags = ["JSON", "Minecraft", "PowerShell"]
title = "PowerShellを使ってMinecraftのリソースを正式名でエクスポートする"

+++
# 最初に
Minecraftはデフォルトリソースをハッシュ名にして保存しています。実際のリソース名とはJSONファイルを使用して関連付けています。

```json
{"objects": 
    {
        "resource1.png": 
            {"hash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "size": 1234},
        "resource2.png": 
            {"hash": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "size": 5678}
    }
}
```

このような形でハッシュとリソース名を対応付けています。これをリソース名にしてエクスポートしようという試みです。

# 対応環境
Minecraft 1.16とPowerShell 5.1で実行できることを確認しました。また、オープンソース版のPowerShellでも実行できると思われます。

**最低限の検証しかしていません。**

# 実際のコード
```powershell
$objects_dir = "C:\Users\Owner\AppData\Roaming\.minecraft\assets\objects"; # .minecraftフォルダ内のassets/objectsまでのフルパス
$listjson = "C:\Users\Owner\AppData\Roaming\.minecraft\assets\indexes\1.16.json" # .minecraftフォルダ内のassets/indexes内の任意のバージョン名のJSONファイルまでのフルパス

$exportdir = "C:\Users\Owner\AppData\Roaming\.minecraft\assets\extracted" # エクスポート先フォルダのフルパス

# ===================

$json = Get-Content $listjson
$list = ConvertFrom-Json -InputObject $json


foreach ($r in $list.objects.psobject.Properties) { 
    $fname = $r.Name
    $afname = $list.objects.$fname.hash

    $hash_dirname = $afname.Substring(0, 2);

    $from = $objects_dir + '\' + $hash_dirname + '\' + $afname;
    $to = $exportdir + '\' + $fname;

    $destdir = Split-Path $to -Parent;
    
    if (!(Test-Path -Path $destdir)) { $0_ = New-Item $destdir -Type Directory }
    Copy-Item -Path $from -Destination $to
}
```

汚いコードですが概ねこのような形です。先頭の３行(改行含め４行)を書き換えて利用してください。

# 注意点・解説
　先ほども説明した通り、JSONでリストが作られています。そのため、`ConvertFrom-Json`で簡単に読み込むことができました。しかし、いくつか注意点があります。

## PowerShell 5.1ではJSONをHashtableにできない
　Windows 10に標準搭載されているPowerShellは`-AsHashtable`オプションに対応していません。そのため、`PSCustomObject`で出力されたオブジェクト名をそのまま取得することができません。
　これを解決するために、foreach文では`psobject.Properties`を取得したいオブジェクトにつけることによって、プロパティのデータをforeachにかけています。
　これによって取得したオブジェクト名をそのまま埋め込み、`$list.objects.$fname.hash`とすることによってPSCustomObjectのままでデータを取得しています。

## ファイルコピー時に親ディレクトリがない
　PowerShellの`Copy-Item`コマンドレットは親ディレクトリを自動的に作ることはできません。そのため、`Split-Path $to -Parent`で親ディレクトリを取得し、当該ディレクトリがなかった場合は、新しくディレクトリを作成しています。

## ディレクトリ作成時のログ
 `New-Item`コマンドレットを使用すると、実行時に結果としてディレクトリの詳細データを出力します。しかし、今回は邪魔なだけなので、`$0_`変数に結果を代入させることによって表示をなくしています。