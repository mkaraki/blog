+++
date = 2021-08-01T03:00:00Z
slug = "20210801-homemade-federated-auth"
tags = [ 'FreeRADIUS', 'daloRADIUS', 'OpenLDAP', 'LDAP Account Manager', 'SimpleSAMLphp' ]
title = "ご自宅統合認証システムを作った話"
tableOfContents = true
+++
この記事では自宅でLDAP, RADIUS, SAML IdPからなるかんたんな認証システムを作った話をします。
また、おまけとしてRADIUSでインターネット利用状況の取得をした話も書きます。

今回もメモ要素が強いです。
間違いなどは報告いただけると助かります。

## 環境
- Ubuntu 20.04
- hoge.example.com をホスト名に設定
- example.com をドメインとして利用

**注意:** この記事ではSuffixなどの書き換え指示を書きません。ご自身で読み替えてください。

## LDAP

### ホスト名の設定
この手順はスキップすることも出来ますが、統合認証システムのみを動かすホストであれば設定しておいて損はないと思います。

```shell
$ sudo hostnamectl set-hostname hoge.example.com
```

また、`/etc/hosts`にある旧ホスト名も設定し直してください。

### slapd, ldap-utilsのインストール
必要に応じて`sudo apt update`を行ってください。

```shell
$ sudo apt -y install slapd ldap-utils
```

途中で管理者パスワードを設定するように言われるので、思うがままにパスワードを設定してください。

> 管理者アカウントは初期状態で `cn=admin,dc=example,dc=com` となります。  
> ドメイン名を読み替え、メモをしておくことを推奨します

#### ホスト名の設定をスキップした場合。
ホスト名の設定を行わなかった場合、下記のコマンドを使うことにより手動でドメインの設定を行うことが出来ます。

```
sudo dpkg-reconfigure slapd
```

設定値は下記の通りです
|Name|Value|
|:--|:--|
|Omit OpenLDAP ...|No|
|DNS domain name|ホスト名のドメイン部（hoge.example.com => example.com）|
|Organization name|上と同じ|
|Administrator Password|管理者パスワード|

以降の設定はデフォルト値を利用してください。

### LDAPにユーザ・グループ用のOUを追加
`base.ldif`ファイルを作り、下記の内容を書き込んでください。

```ldif
dn: ou=people,dc=example,dc=com
objectClass: organizationalUnit
ou: people

dn: ou=groups,dc=example,dc=com
objectClass: organizationalUnit
ou: groups 
```

```shell
# ldapadd -x -D cn=admin,dc=example,dc=com -W -f base.ldif
Enter LDAP Password: <管理者パスワードを入力>
```

### OpenLDAPでレプリケーションを設定する。

#### プロバイダーサーバ (マスター)の設定
`sync.ldif`のようなファイルを作り、下記の内容を記述します。
```ldif
dn: cn=module,cn=config
objectClass: olcModuleList
cn: module
olcModulePath: /usr/lib/ldap
olcModuleLoad: syncprov.la

dn: olcOverlay=syncprov,olcDatabase={1}mdb,cn=config
objectClass: olcOverlayConfig
objectClass: olcSyncProvConfig
olcOverlay: syncprov
olcSpSessionLog: 100
```

下記のコマンドで適用します。
```shell
$ sudo ldapadd -Y EXTERNAL -H ldapi:/// -f sync.ldif
```

#### コンシューマーサーバ (スレーブ)の設定
[ホスト名の設定](#ホスト名の設定)と[slapd, ldap-utilsのインストール](#slapd,-ldap-utilsのインストール)まで行ってください。

`sync.ldif`のようなファイルを作り、下記の内容を記述してください。（項目はそれぞれ読み替えてください）
```ldif
dn: olcDatabase={1}mdb,cn=config
changetype: modify
add: olcSyncRepl
olcSyncRepl: rid=001
  provider=ldap://hoge.example.com:389/
  bindmethod=simple
  binddn="cn=admin,dc=example,dc=com"
  credentials=adminpassword
  searchbase="dc=example,dc=com"
  scope=sub
  schemachecking=on
  type=refreshAndPersist
  retry="30 5 300 3"
  interval=00:00:01:00
```

`olcSyncRepl`の詳細
- `provider` 同期先LDAP
- `binddn` 管理者ユーザ名
- `credentials` 管理者パスワード
- `searchbase` 同期するDN (ドメイン名が良いと思われる)
- `retry` 失敗時のリトライ動作 (`[<retry interval> <# of retries>]+`)
- `interval` 同期間隔 (`dd:hh:mm:ss`)

詳細は[LDAP Administrator's Guide](https://www.openldap.org/doc/admin25/slapdconfig.html#syncrepl)を参照

下記のコマンドで適用します。
```shell
$ sudo ldapadd -Y EXTERNAL -H ldapi:/// -f sync.ldif
```

## LDAP Account Manager

### LDAP Account Managerのインストール
まず、Apache2とPHPをインストールします。

```shell
$ sudo apt -y install apache2 php php-cgi libapache2-mod-php php-mbstring php-common php-pear
```

PHPを有効化します。
```shell
$ sudo a2enconf php7.4-cgi
$ sudo systemctl reload apache2
```

LDAP Account Managerをインストールします。
```
$ sudo apt -y install ldap-account-manager
```

**注意:** インストール時はすべてのホストからの通信を受けるようになっています。
`/etc/apache2/conf-enabled/ldap-account-manager.conf`を編集し、アクセス可能ホストを絞ることを強く推奨します。

関連の設定が終わったらApache2を再起動します。
```shell
$ sudo systemctl restart apache2
```

### LDAP Account Managerの初期設定
画像無しでは解説がとても難しいので別の解説サイトを提示します。

[Ubuntu 20.04 LTS : OpenLDAP : LDAP Account Manager 設定 : Server World](https://www.server-world.info/query?os=Ubuntu_20.04&p=openldap&f=8)

[Server World](https://www.server-world.info) はOS毎に様々なサービスの設定方法を提示しているサイトです。
日本語でわかりやすく書いてありますので、なにか作りたいものがある場合は一度ここを参照してみることをおすすめします。

### WPA2 EnterpriseなどのMS-CHAP認証を行いたい場合
**本来設定すべきではありませんが**、MS-CHAP認証を利用したい場合はパスワードを平文で保管する必要があります。

`Server Settings > Module settings > Unix > Options > Password hash type`
を`PLAIN`に設定してください。

## FreeRADIUS

### FreeRADIUSのインストール
ここではLDAPと連携したRADIUSに必要なパッケージをインストールします。
利用状況や課金管理は別の項で解説します。

```shell
$ sudo apt -y install freeradius freeradius-ldap freeradius-utils
```

### FreeRADIUSとLDAPの連携設定
この項ではファイル名先頭の`/etc/freeradius/3.0/`を省略して記述します。

まず、`users`を編集し、LDAP認証に対応させます。 
下のコードを追記してください。
また、それ以外のコードはコメントアウトしても構いません。
```
DEFAULT Auth-Type = LDAP
        Fall-Through = 1
```

次にldapのmodを有効化します。
```
$ sudo ln -s /etc/freeradius/3.0/mods-available/ldap /etc/freeradius/3.0/mods-enabled/ldap
```

`mods-enabled/ldap`を編集し、LDAP接続先を設定します。
- 19行目あたり `server = ''`でサーバを設定します
- 28行目あたり `identity = ''`に管理者アカウントを設定します
- 29行目あたり `password = ''`に管理者パスワードを設定します
- 33行目あたり `base_dn = ''`に検索対象のDNを設定します。
  この記事通りの設定の場合、`ou=people,dc=example,dc=com`となります。

`sites-enabled/default`と`sites-enabled/inner-tunnel`を編集し、ldapを有効にします。
- `authorize`セクション内の`ldap`のコメントアウトを外します
- `authenticate`セクション内の`Auth-Type LDAP`セクションのコメントアウトをすべて外します
- 'post-auth'セクションの`ldap`のコメントアウトを外します

以上で連携設定は完了です。
必要に応じてClientを設定してください。
すべての設定が終わったらFreeRADIUSを再起動して設定を読み込ませてください。

### FreeRADIUSでEAP-PEAP/MS-CHAPv2を設定する
この項ではファイル名先頭の`/etc/freeradius/3.0/`を省略して記述します。

#### EAP用の証明書を生成
私は[Let's Encrypt](https://letsencrypt.org/)を利用しました。
注意点として、証明書ファイルの所有者を`freerad:freerad`に設定しておかないとFreeRADIUSから読み込めなくなります。

#### FreeRADIUSの設定
`mods-enabled/eap`を編集します。
- `eap`セクション`default_eap_type`を`peap`に設定
- `eap`セクション内`peap`セクションの`use_tunneled_reply`を`yes`に
- `eap`セクション内`tls-config til-common`セクションの下記の項目を変更してください。
  - `private_key_password` 秘密鍵のパスワードを指定します。Let's encryptの場合は無視して大丈夫です。
  - `private_key_file` 秘密鍵のファイルを指定してください。Let's encryptでは`privkey.pem`が該当します。
  - `certificate_file` 証明書ファイルを指定してください。 Let's encryptでは`fullchain.pem`が該当します。

#### 注意事項
MS-CHAPv2で認証をする際は、LDAP側に平文でパスワードが保管されている必要があります。
パスワードの取り扱いには十分注意してください。

### FreeRADIUS側でRealmに応じてVlanを切り替える
この項ではファイル名先頭の`/etc/freeradius/3.0/`を省略して記述します。

`proxy.conf`にRealmを設定します。
設定値にstripを付けることで、LDAP側に問い合わせるユーザ名からRealm部を削除します。
```
realm hoge.fuga {
    strip
}
```

`users`に付与したいVLANを記述します。同じ方法でその他のAttributeも付与できます。
```conf
# Realmが一致している場合にVLANを割り振る
DEFAULT Realm == "hoge.fuga"
        Tunnel-Type = 13,
        Tunnel-Medium-Type = 6,
        Tunnel-Private-Group-Id = 100

# ユーザ名とRealmが一致している場合にVLANを割り振る
DEFAULT User-Name == "user@hoge.fuga"
        Tunnel-Type = 13,
        Tunnel-Medium-Type = 6,
        Tunnel-Private-Group-Id = 100
```

#### 課金システムで表示されるユーザ名を一致させたい
```conf
        User-Name = "user",
```
を`DEFAULT`行の下に挿入してください。

### RADIUSで課金管理 (Accounting) を行う

#### MySQLを設定する
```shell
$ sudo apt -y install mysql-server
```
必要に応じて`sudo mysql_secure_installation`を使い設定を行ってください。
今回は完全に閉鎖された空間で利用することを前提にこの設定を行いません。

もし、rootパスワードを設定した場合、記事内の`mysql -u root`を`mysql -u root -p`に読み替えてください。

`sudo mysql -u root`でMySQLに入り以下のSQLを投入してください。
```sql
CREATE DATABASE radius;
GRANT ALL ON radius.* TO radius@localhost IDENTIFIED BY "radius";
FLUSH PRIVILEGES;
QUIT
```

**注意:** 今回のインストール例ではRADIUS用アカウントのパスワードを`radius`に設定しています。
これは非常に脆弱なパスワードであり、強固なパスワードに設定し直すことを強く推奨します。

Root権限で下記のコマンドを実行します。
```shell
# mysql -u root radius < /etc/freeradius/3.0/mods-config/sql/main/mysql/schema.sql
```

下記の内容でsqlファイルを作成し、上記の方法でradiusデータベースに適応させてください。
```sql
DROP TABLE radacct
CREATE TABLE radacct (
  radacctid bigint(21) NOT NULL auto_increment,
  acctsessionid varchar(64) NOT NULL default '',
  acctuniqueid varchar(32) NOT NULL default '',
  username varchar(64) NOT NULL default '',
  groupname varchar(64) NOT NULL default '',
  realm varchar(64) default '',
  nasipaddress varchar(15) NOT NULL default '',
  nasportid varchar(32) default NULL,
  nasporttype varchar(32) default NULL,
  acctstarttime datetime NULL default NULL,
  acctupdatetime datetime NULL default NULL,
  acctstoptime datetime NULL default NULL,
  acctinterval int(12) default NULL,
  acctsessiontime int(12) unsigned default NULL,
  acctauthentic varchar(32) default NULL,
  connectinfo_start varchar(50) default NULL,
  connectinfo_stop varchar(50) default NULL,
  acctinputoctets bigint(20) default NULL,
  acctoutputoctets bigint(20) default NULL,
  calledstationid varchar(50) NOT NULL default '',
  callingstationid varchar(50) NOT NULL default '',
  acctterminatecause varchar(32) NOT NULL default '',
  servicetype varchar(32) default NULL,
  framedprotocol varchar(32) default NULL,
  framedipaddress varchar(15) NOT NULL default '',
  framedipv6address varchar(45) NOT NULL default '',
  framedipv6prefix varchar(45) NOT NULL default '',
  framedinterfaceid varchar(44) NOT NULL default '',
  delegatedipv6prefix varchar(45) NOT NULL default '',
  class varchar(64) default NULL,
  PRIMARY KEY (radacctid),
  UNIQUE KEY acctuniqueid (acctuniqueid),
  KEY username (username),
  KEY framedipaddress (framedipaddress),
  KEY framedipv6address (framedipv6address),
  KEY framedipv6prefix (framedipv6prefix),
  KEY framedinterfaceid (framedinterfaceid),
  KEY delegatedipv6prefix (delegatedipv6prefix),
  KEY acctsessionid (acctsessionid),
  KEY acctsessiontime (acctsessiontime),
  KEY acctstarttime (acctstarttime),
  KEY acctinterval (acctinterval),
  KEY acctstoptime (acctstoptime),
  KEY nasipaddress (nasipaddress),
  INDEX bulk_close (acctstoptime, nasipaddress, acctstarttime)
) ENGINE = INNODB;
```

**情報:** 私がインストールを試みた際は、`/etc/freeradius/3.0/mods-config/sql/main/mysql/schema.sql`に不具合があり、[GitHubに存在する正しいスキーマ](https://github.com/FreeRADIUS/freeradius-server/blob/master/raddb/mods-config/sql/main/mysql/schema.sql)を適用し、間違っているテーブルを削除しました。  
この不具合は一時的なものであると考えられるため、記事の閲覧時にこの手順が必要ない可能性が高いです。
また、今回修正したのは最低限課金情報取得に必要なテーブルであり、その他のテーブルにも不具合がある可能性があります。  
不具合があった場合はFreeRADIUSを終了させ、`sudo freeradius -X`を実行し、エラーを確認してください。

#### FreeRADIUSをMySQLに対応させる
この項ではファイル名先頭の`/etc/freeradius/3.0/`を省略して記述します。

sql関係のパッケージをインストールします。
```shell
$ sudo apt -y install freeradius-mysql
```

次に、sqlのmodを有効化します。
```shell
$ sudo ln -s /etc/freeradius/3.0/mods-available/sql /etc/freeradius/3.0/mods-enabled/
```

`mods-enabled/sql`を編集し、SQL接続情報を記述します。
- `sql`セクションの`dialect`を`mysql`に設定
- `sql`セクションの`driver`を`rlm_sql_${dialect}`に設定
- `sql`セクジョン下の`mysql`セクションに存在する`tls`セクション全体をコメントアウト
- `sql`セクションの`server`, `port`を必要に応じて変更
- `sql`セクションの`login`, `password`を前の項で設定したユーザ名、パスワードに設定


`sites-enabled/default`を編集し、課金情報をMySQLに保管する設定にします。
- `accounting`セクション内の`sql`をコメントアウトします

#### daloRADIUSをインストールする
今回daloRADIUSは課金情報確認の為だけにインストールします。

前提パッケージをインストールします。
```shell
$ sudo apt -y install php libapache2-mod-php php-{gd,common,mail,mail-mime,mysql,pear,db,mbstring,xml,curl} unzip
```

daloRADIUSをダウンロードし、`/var/www/html`に展開します。
```shell
$ wget https://github.com/lirantal/daloradius/archive/master.zip
$ unzip master.zip
$ sudo mv daloradius-master /var/www/html/daloradius
```

MySQLに必要なテーブルを挿入します。
```shell
$ sudo mysql -u root radius < /var/www/html/daloradius/contrib/db/fr2-mysql-daloradius-and-freeradius.sql
$ sudo mysql -u root radius < /var/www/html/daloradius/contrib/db/mysql-daloradius.sql
```

`/var/www/html/daloradius/library/daloradius.conf.php`を編集し、MySQLへのアクセス情報を設定します。
```php
$configValues['CONFIG_DB_HOST'] = 'localhost'; # MySQLのホストを設定
$configValues['CONFIG_DB_PORT'] = '3306'; # MySQLのポートを設定
$configValues['CONFIG_DB_USER'] = 'radius'; # ユーザ名を設定
$configValues['CONFIG_DB_PASS'] = 'radius'; # パスワードを設定
$configValues['CONFIG_DB_NAME'] = 'radius'; # データベース名を設定
```

これでdaloRADIUSのインストールは終了です。
初期パスワードは`radius`です。

## SAML IdP
SimpleSAMLphpを利用し、SAML IdPを行います。  
RSAのSSL証明書が必要になります。私は[Let's encrypt](https://letsencrypt.org/)を使いました。

### SimpleSAMLIdPをインストール
下記のコマンドでインストールと有効化を行います。
```shell
$ sudo apt -y install simplesamlphp
$ sudo a2enconf simplesamlphp
$ sudo service apache2 restart
```

### SimpleSAMLIdPを設定
`/var/lib/simplesamlphp/secrets.inc.php`を編集し、管理者パスワードを設定します。
```php
<?php
$config['auth.adminpassword'] = 'password';
$config['secretsalt'] = 'SALT'; // この項目は初期状態にしておくべきです。
```

`/usr/share/simplesamlphp/config/config.php`を編集し、設定を行います。
```php
    // 前略
    'admin.protectindexpage' => true, // ログインしていないとサーバ情報が見れないようにする
    'admin.protectmetadata' => true, // 同上
    // 中略
    'enable.saml20-idp' => true, // SAML2.0 IdPを有効化
    // 後略
```

`/usr/share/simplesamlphp/config/authsources.php`を編集し、LDAPへの接続情報を記述します。
```php
  // 前略
  'example-ldap' => array( // `example-ldap` はお好みで変更可能です
      'ldap:LDAP',
      'hostname' => 'ldap://hoge.example.com',
      'enable_tls' => false,
      'timeout' = 0,
      'port' = 389,
      'attributes' => null,
      'dnpattern' => 'uid=%username%,ou=people,dc=example,dc=com', // 検索対象のDNと検索パターンを指定
      // 入力されたユーザ名が`%username%`に入る。uid=やcn=として検索パターンを指定できる。
      'search.enable' => true,
      'search.base' => 'ou=people,dc=example,dc=com', // 検索対象DN
      'search.attributes' => array('uid', 'mail'), // 検索対象の属性
      'search.username' => null,
      'search.password' => null,
  ),
  // 後略
```

かなりコンフィグを省略しましたが、概ねこの様になっていれば大丈夫です。

次に`/usr/share/simplesamlphp/config/metadata/saml20-idp-hosted.php`を編集してIdPの設定を行います。
```php
<?php
$metadata['__DYNAMIC:1__'] = [
  /*
   *  * The hostname for this IdP. This makes it possible to run multiple
   *   * IdPs from the same configuration. '__DEFAULT__' means that this one
   *    * should be used by default.
   *     */
  'host' => '__DEFAULT__',

  /*
   *  * The private key and certificate to use when signing responses.
   *   * These are stored in the cert-directory.
   *    */
  'privatekey' => '/usr/share/simplesamlphp/config/privkey.pem', // SSL秘密鍵
  'certificate' => '/usr/share/simplesamlphp/config/fullchain.pem', // SSL証明書

  /*
   *  * The authentication source which should be used to authenticate the
   *   * user. This must match one of the entries in config/authsources.php.
   *    */
  'auth' => 'example-ldap', // 先程`example-ldap`を書き換えた場合はこちらも書き換えてください。
];
```

この後はSPを`/usr/share/simplesamlphp/config/metadata/saml20-sp-remote.php`に記述し、IdPの情報をSPに登録する処理になりますが、この記事では取り扱いません。

## 参考
- https://computingforgeeks.com/install-and-configure-openldap-server-ubuntu/
- https://qiita.com/cffnpwr/items/be903005e291d0ece514
- https://www.server-world.info/query?os=Ubuntu_20.04&p=openldap&f=1
- https://www.server-world.info/query?os=Ubuntu_20.04&p=openldap&f=8
- https://computingforgeeks.com/how-to-install-freeradius-and-daloradius-on-ubuntu/
- https://qiita.com/bashaway/items/c96a2b14c46acd8cdc40
- https://www.casleyconsulting.co.jp/blog/engineer/230/
- http://mx.eduroam.jp/docs/conf-freeradius.html
- http://networklab.sub.jp/lab/network/wifi/201502/476/
- https://www.nii.ac.jp/openforum/upload/20190529PM_Auth_03_Suenaga.pdf
- https://techexpert.tips/ja/freeradius-ja/ubuntu-linux%E3%81%A7%E3%81%AEmysql%E7%B5%B1%E5%90%88%E3%81%A8freeradius%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB/
- https://github.com/FreeRADIUS/freeradius-server/blob/master/raddb/mods-config/sql/main/mysql/schema.sql
- https://www.server-world.info/query?os=Ubuntu_20.04&p=openldap&f=6
- https://www.openldap.org/doc/admin25/slapdconfig.html#syncrepl
- https://www.secioss.co.jp/simplesamlphp%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6ad%E8%AA%8D%E8%A8%BC%E3%81%99%E3%82%8Bsaml-idp%E3%82%92%E4%BD%9C%E3%82%8D%E3%81%86/
- https://simplesamlphp.org/docs/stable/ldap:ldap
- https://simplesamlphp.org/docs/stable/simplesamlphp-idp
