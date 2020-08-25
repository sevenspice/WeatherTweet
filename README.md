# 概要

[Google Cloud Functions](https://cloud.google.com/functions/docs/concepts/overview?hl=ja)を使用した気象情報ツイートスクリプト。

## 動作例

* [島根県気象情報BOT](https://twitter.com/shimane_weather)
    * 1 時間ごとにFunctionsをキックして島根県内の気象情報をツイートし続ける。

# 必要条件

| アプリケーション | バージョン               |
| :--------------- | :----------------------- |
| node.js          | `>=8.11.4`               |
| npm              | `>=5.6.0`                |
| gcloud          | `>=256.0.0`              |

* [Google Cloud Platform](https://cloud.google.com/docs/overview/?hl=ja)でのプロジェクト作成まで完了していること。

## 連携サービス

以下のサービスから予め API へアクセスするためのトークンを取得すること。

| サービス名                                                                                              | 
| :------------------------------------------------------------------------------------------------------ | 
| [Twitter Developer](https://developer.twitter.com/content/developer-twitter/ja.html)                    |
| [OpenWeatherMap](https://openweathermap.org/api)                                                        |
| [Yahoo Open Local Platform](https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/weather.html) |

# スタートガイド

リポジトリをクローンする。
```
git clone https://github.com/sevenspice/WeatherTweet.git weather-tweet
```

ディレクトリを移動する。
```
cd weather-tweet
```

設定ファイルを記述する。
```
cp .env.origin.yaml .env.yaml
vi .env.yaml
```
* 設定については[設定ファイル](#設定ファイル)を参照すること。

Google Cloud Platformへデプロイする。
```
gcloud beta functions deploy weatherTweet --set-env-vars TZ=Asia/Tokyo --runtime nodejs10 --trigger-http
```

実行する。
```
curl "https://[YOUR_REGION]-[YOUR_PROJECT_ID].cloudfunctions.net/weatherTweet"
```

# 開発環境構築手順

ローカル環境にエミュレーターをインストールする。
```
sudo npm install -g @google-cloud/functions-emulator
```

インストールを確認する。
```
sudo functions --help
```
* ヘルプが表示されれば確認完了。

エミュレーターを起動する。
```
sudo functions start
```

※ 停止させる場合は以下の通り。
```
sudo functions stop
```

※ 強制終了させる場合は以下の通り。
```
sudo functions kill
```

※ 削除する場合は以下の通り。
```
sudo npm uninstall -g @google-cloud/functions-emulator
```

※ プロセスを確認する方法は以下の通り。
```
ps aux | grep functions-emulator | grep -v grep
```

## ローカル環境のエミュレーターにデプロイする手順

リポジトリをクローンする。
```
git clone https://github.com/sevenspice/WeatherTweet.git weather-tweet
```

ディレクトリを移動する。
```
cd weather-tweet
```

設定ファイルを記述する。
```
cp .env.yaml.origin .env.yaml
vi .env.yaml
```
* 設定については[設定ファイル](#設定ファイル)を参照すること。

デプロイを実行する。
```
functions deploy weatherTweet --trigger-http
```

※ 関数の削除。
```
functions delete weatherTweet
```

## Functionsの実行

実行する。
```
functions call weatherTweet
```

ログを確認する。
```
functions logs read
```

# 設定ファイル

``` yaml
# Twitter APIのトークン情報を設定する
TWITTER:
  API_SCHEME: 'https'
  API_HOST: 'api.twitter.com'
  API_ENDPOINT: '/1.1/statuses/update.json'
  API_PROTOCOL: 'POST'
  API_CONSUMER_KEY: ''
  API_CONSUMER_SECRET: ''
  API_ACCESS_TOKEN: ''
  API_ACCESS_TOKEN_SECRET: ''
# Yahoo APIのトークン情報を設定する
YAHOO:
  API_ENDPOINT: 'https://map.yahooapis.jp/weather/V1/place'
  API_APPLICATION_ID: ''
  API_APPLICATION_SECRET: ''
# Open wather mapのトークン情報を設定する
OPENWEATHERMAP:
  API_ENDPOINT: 'https://api.openweathermap.org/data/2.5/weather'
  API_KEY: ''
# 気象情報を取得したい地域の名称と位置情報を設定する
CITIES:
  MATSUE:
    NAME: '松江'
    LONG: 133.0488
    LAT: 35.4681
  IZUMO:
    NAME: '出雲'
    LONG: 132.7549
    LAT: 35.3669
  HAMADA:
    NAME: '浜田'
    LONG: 132.0799
    LAT: 34.8991
```
