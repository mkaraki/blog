+++
date = 2021-07-19T15:00:00Z
slug = "20210720-free-inet-services"
tags = []
title = "無料で使えるインターネット関連サービス一覧"

+++

　この記事は別のサイトと連携している記事です。

　常に金欠な私が見つけた無料でいい感じのサービスをメモがてら書いていきます。

　特定のサービスに密接に関わっており、利用に当たり当該サービスの利用を強制されるような物は省略します。
例えば、AWS Budget ManagementはAWSサービスの利用が前提になりますので、この記事では扱いません。

　また、あくまでもメモとして書いていますので、筆者が絶対に使わないであろうサービスや、
無料範囲が設定されたサービスも省略します。

## 認証系

### [JumpCloud](https://jumpcloud.com/)

　認証系サービスとしてかなり優秀で、10ユーザまでLDAPやRADIUSが使え、独自の認証連携ソフトウェア上で10デバイスまで無料でほぼフル機能がついています。おまけに最初の10日間は24時間365日チャットサポートが有るという素晴らしい待遇。

　サポートを実際に私も受けましたが、画面共有をしながら状況の確認を行っていただき、かなり親切で丁寧な印象を受けました。また、どうやら10日を超えてもフォームでサポートを受けられる気がします。（未確認）

　ご自宅WPA2 EnterpriseやZabbix LDAPなどをやってみたい方は一度試してみてもいいと思います。

### [Azure Entra ID (旧 Azure Active Directory)](https://azure.microsoft.com/ja-jp/services/active-directory/)

　こちらはSSOとActive Directoryにおいてかなり優秀なシステムです。ローカルのActive Directoryと連携できるAzure AD Connectも無料で使える上、Windows 10 Proなどで使えるAzure ADログインに対応しています（当たり前の話ですが）。いつの間にかSSOも無制限になっており、ユーザもある程度入れられたと記憶しています（具体的な数を調べられなかった）

　JumpCloudと連携することでJumpCloud側の制限である10ユーザまでRadiusやLDAPを利用できるようになります。

### [Cloudflare Access](https://www.cloudflare.com/ja-jp/teams/access/)

　自分がホストしているWebサービスなどにアクセスする際にメールアドレス認証やSSOをかませる事ができるサービスです。
50ユーザまで無料で利用できます。

　例えばGrafanaのWebコンソールにアクセスできるユーザを先に紹介しているAzure ADなどで制限することが出来ます。アクセス元はCloudflareのIP扱いになるので、それだけをファイアウォールで許可することである程度安全な環境を作ることが出来ます（ただし、監視などの通信についてはよく考える必要性がありますが）

### [Google Cloud Identity Free](https://cloud.google.com/identity/)

　IdPになってくれるサービスです。Googleアカウントとほぼ同じ機能がIDに割り当てられるのが特徴で、実際にAndroidなどでログインすることもできます。

　50ユーザまで無料で利用でき、LDAPと同期することなどもできるようです。

　無料版の開始URLがとてもわかりづらい場所にあります。

### [IBM Cloud App ID](https://www.ibm.com/jp-ja/products/app-id)

　モバイルアプリやWebアプリにユーザ認証機能を入れるサービスらしいです。
月に1,000イベントまで無料です。

## CDN

### [Cloudflare](https://www.cloudflare.com/)

　定番ですが一応紹介しておきます。CDNとして使えますし、IPv6やIPv4非対応ホストにそれぞれのIPを作ってあげる用途で使うことも一応可能です。また、SSL非対応のホストに外見だけSSLを渡すことも出来ます（Cloudflareとホスト間の通信は暗号化されないので注意）

### [Amazon CloudFront](https://aws.amazon.com/cloudfront/)

　1TBまで無料ですが、細かい制限がありそうです。

## VPS

### [Oracle Cloud Free Tier - Compute VM](https://www.oracle.com/jp/cloud/free/)

　1/8 OCPUと1GBメモリを搭載している2つのVMを使えます。私はここにVPNとZabbixを置いています。かなり快適ですし、これが無料なのは信じられないレベルです。

　今はどうやらARMのVMを4台用意できるようです。

### [Google Cloud Compute Engine](https://cloud.google.com/compute/docs)

　`e2-micro`がアメリカの一部リージョンに限り無料で利用できます。

## Web Server

### [GitHub Pages](https://pages.github.com/)

　GitHubが提供する静的サイト限定のサービスです。標準でJekyllに対応している他、GitHub Actionsと合わせることでHugoなどのビルドも自動化出来ます。

　SSLや独自ドメイン（サブドメイン含む）に対応していますが、ホストするコンテンツが1GB以内である、1ヶ月に100GBまで、1時間に10ビルドまでなどの制限があるそうです。（[About GitHub Pages - GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#usage-limits)）

### [Cloudflare Pages](https://pages.cloudflare.com/)

　かなり制限が緩めの静的サイト向けサービスです。独自ドメイン利用時は基本的にCNAMEで設定します。
Cloudflare Workersと組み合わせて動的なサイトを作ることもできます。

　ビルド数制限が月単位で存在します。

### [Azure App Service](https://learn.microsoft.com/ja-jp/azure/app-service/overview)

　Node.jsやPHPなどに対応したWebアプリのホスティングサービスです。10個󠄀のWebアプリをホストできるようですが、ストレージの条件がぱっと見ではわからないため、詳細は記述しません。

### [XREA](https://www.xrea.com/)

　GMOが提供するレンタルサーバです。スペックは下記の通り。

* 1GB のストレージ
* マルチドメイン（10個）
* 1GB/Day の転送量
* WordPress利用可能
* チャットサポート
* CGI/SSI/Perl/PHP/Ruby対応
* SSL対応（独自、Let's encrypt）
* **広告が表示されます**

　また、メインではないのでしょうが、一応100個までメールアドレスを発行できるため、メールサーバとしても使えます。一日あたり1,000通もメールをメールを送ることは無いでしょうから十分だと思っています。

### [StarServer Free](https://www.star.ne.jp/free/)

　Netowlの提供するレンタルサーバです。プランは下記のとおりです。

* 2GB 広告無し
* 4GB
* 2GB PHP, MySQL(50MB)

　一番上のプラン以外はスマートフォンアクセス時にのみ広告が表示されます。難点として、SSL非対応です。また、ドメインを1つ追加できると謳っていますが、TLDにかなり厳しい制限があり、それ以外を利用するには有料プランにしなければならないとのこと。

　個人的には静的なサイトを2GBプランを使ってCloudflareを噛ませて公開するのに丁度いいと思っています。

### [XFREE](https://www.xfree.ne.jp/)

　Xserverが提供するレンタルサーバです。プランは下記の通り。

* 1GB 広告無し（条件付き）
* 1GB PHP, MySQL(50MB)
* 2GB WordPress (DB: 100MB)

　一番上のプランは3ヶ月以上ファイルを変更する動作をしていない場合に広告表示、それ以外は常時のようです。独自のドメインは10個とのことですが、私が試した限りStarServer Freeと同じようにリストに無いTLDを持つドメインは追加できません。こちらもSSL非対応です。

　使い道としてはStarServer Freeと同じ感じになると思います。

## Git/Version Control

### [Azure DevOps](https://azure.microsoft.com/ja-jp/products/devops/)

　5ユーザまで無料のGitサーバやCI/CDができる環境がいろいろそろったやつです。
今は正直GitHubが優秀なのでそれでいいと思います。

### [Google Cloud Source Repository](https://cloud.google.com/source-repositories/docs?hl=ja)

　5ユーザまでで、50GBのストレージが利用できます。ダウンロードは月50GBまで無料です。

### [AWS CodeCommit](https://aws.amazon.com/codecommit/)

　5ユーザまで、50GBのストレージが利用できます。Gitリクエストは1月1万件󠄀まで利用できます。

## CD/Build Tools

### [IBM Cloud Continuous Delivery](https://www.ibm.com/products/continuous-delivery)

　500ジョブまで無料です。おそらく外部システムへの展開もやってくれる気がします。

### [Google Cloud Build](https://cloud.google.com/build/docs)

　合計で月に120分ビルドできます。

### [AWS CodeBuild](https://aws.amazon.com/codebuild/)

　月に100分までビルド可能だそうです。

### [AWS CodePipeline](https://aws.amazon.com/codepipeline/)

　1件のみパイプラインを設定できます。

## Database

### [IBM Cloudant](https://www.ibm.com/jp-ja/products/cloudant)

　1GBまで無料で使える、JSONを保存できるデータベースのようです。

### [Google Firestore](https://cloud.google.com/firestore/docs?hl=ja)

　1プロジェクト当たり1GBのストレージが利用できます。読み込みは5万リクエストまで、書込みと削除は2万リクエストまでです。

### [Oracle Autonomous Database](https://www.oracle.com/jp/cloud/free/)

　20GBのストレージと1つのOCPUをもつDBを1つ使えるようです。

### [Oracle NoSQL Database](https://www.oracle.com/jp/cloud/free/)

　読み書きが約1億回無料でできるようです。また、1テーブル当たり25GBで、3テーブルまで作れるらしいです。

### [Amazon DynamoDB](https://aws.amazon.com/dynamodb/)

　NoSQLサービスです。25GBのストレージを無料で利用できます。

## Container Hosting

### [Azure Container Apps](https://learn.microsoft.com/ja-jp/azure/container-apps/overview)

　制限はかなりありそうですが、簡易的なコンテナをホストするくらいなら使えそうなサービスです。

## Container/Package Registry

### [IBM Container Registry](https://www.ibm.com/products/container-registry)

　月に5GBのダウンロード方向の通信が無料らしいです。保存は月に0.5GBまで無料という表記がありますが、詳細は不明です。

### [AWS CodeArtifact](https://aws.amazon.com/codeartifact)

　2GBのストレージと10万件のリクエストが無料なアーティファクトリポジトリです。

## スクリプト実行

　このセクションを説明するワードが無かったので、とりあえず仮で「スクリプト実行」とします。
Cloudflare WorkersやAWS Lambdaなどがこの仲間です。
Webから呼び出せることを条件にしています。

### [Azure Functions](https://learn.microsoft.com/ja-jp/azure/azure-functions/functions-overview)

　100万回まで無料とのこと。

### [Google Cloud Run](https://cloud.google.com/run/docs)

　200万リクエスト、1GBの下りネットワークが無料です。計算リソースについても詳細な制限があります。

### [AWS Lambda](https://aws.amazon.com/lambda/)

　100万リクエストまで無料です。

### [Cloudflare Workers](https://www.cloudflare.com/ja-jp/developer-platform/workers/)

　1日当たり、10万リクエストまで無料です。

## Object Storage

### [Google Cloud Storage](https://cloud.google.com/storage/docs)

　5GBまで無料のようです。また、下りは毎月1GBまで無料で、5,000回までPUTリクエストなどが無料で行えるそうです。

### [Oracle Cloud Object Storage](https://www.oracle.com/jp/cloud/free/)

　10GBの普通のオブジェクトストレージと低頻度アクセスのオブジェクトストレージ、そしてアーカイブストレージを使わせてもらえるようです。
リクエスト自体は5万リクエストまで無料とのこと。通信容量課金は計算機に乗ってなかったのですが、おそらくテナントとして課金され、10TBまで無料となるのかなと思います。

### [Cloudflare R2](https://www.cloudflare.com/ja-jp/developer-platform/r2/)

　10GB、100万クラスA、1000万クラスBまで無料です。

## 通知・メール送信

### [Azure Notification Hubs](https://learn.microsoft.com/ja-jp/azure/notification-hubs/notification-hubs-push-notification-overview)

　100万件までのプッシュ通知が無料とのこと。

### [Oracle Cloud Email Delivery](https://www.oracle.com/jp/cloud/free/)

　3,000件󠄀まで無料とのことだが詳細不明。

### [Mailjet](https://www.mailjet.com/)

　メールの送信サービスです。独自ドメインなどからメールを送信したい場合にとても重宝します（私はZabbixのアラートに使っています）。1日に200通までしか送れませんが、そこまで使うことはないと思います。（というか、1日にアラート200件来たら諦めてサーバの電源引っこ抜く）

　APIを使ってメール送信もできるので、様々なサービスと連携ができそうです。

### [Amazon SNS](https://aws.amazon.com/sns/)

　100万メッセージの発行まで無料です。

## DNS

### [Cloudflare](https://www.cloudflare.com/)

　Webが関連するところにはだいたい現れるであろうCloudflareです。DNSツールとしてかなり使いやすく、対応しているサービスをホストするのであればIPを隠す事もできます。

　アカウントの共有機能を使って大きなプロジェクトのDNSを複数人で管理したり、APIを使って動作を自動化したりも可能です（応用してDDNSのような使い方もできます）

　対応しているドメインであればDNSSECなどのセキュリティ機能もありますし、格安の[Cloudflare Registrar](https://www.cloudflare.com/ja-jp/products/registrar/)が利用可能な場合は、何も考えずにここに載せてもいいと思っています。

### [Hurricane Electric Free DNS Management](https://dns.he.net/)

　Hurricane Electricが提供しているDNSです。DDNSに対応しているサービスで、かなりわかりやすい部類だと思います。DNS機能としては細かい制限がありますがクリティカルなものは無かったと思います。

## Email Forward

### [ImprovMX](https://improvmx.com/)

　特定のドメインに来たメールすべてを特定のアドレスに転送できる凄い奴です。制限として、独自に転送先を変更できるアドレスは25個までであることと、10Mbまでの添付ファイルまでしか受け付けてくれないことがあります。

## VPN

### [Tailscale](https://tailscale.com/)

　外向きの通信が通れば大体使えるすごいやつです。無料版だと20デバイスまで接続できるとのこと。（私が初めて見たときには100だった気がする）サブネットルーティングなどが使えるためかなり便利なサービスです。（しかし、現在無料で使えるサービスにかなりの制限がかかっているので、Oracle CloudにSoftEther VPN置いたほうが良さそうと思ったり…）

### [VPN Azure](http://www.vpnazure.net/ja/)

　SoftEther VPNに置いて、NAPTやファイアウォール超えをするときにとても重宝するサービスです。前提としてSoftEther VPN Serverを建てる必要がありますが、Oracle Cloudの無料枠などに置くと完全無料でいい感じのVPNが作れます。注意点として、内部に用意する仮想ネットワークはv6非対応です。L2 VPNではv6をつかうことが出来ます。

## システム監視

### [Grafana Cloud](https://grafana.com/products/cloud/)

　3ユーザまでで、1万メトリック、50GBのログなどを14日間保存できるサービスです。
Grafanaファミリーで動いているので、LokiやPrometheusがそのまま使えます。

## データ処理

### [Google Cloud BigQuery](https://cloud.google.com/bigquery/docs)

　1TBまでの処理と、10GBのストレージが無料で利用できます。
