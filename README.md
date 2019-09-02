# 概要

[Google Cloud Functions](https://cloud.google.com/functions/docs/concepts/overview?hl=ja) を使用した気象情報ツイートツール。

# 必要条件

| アプリケーション | バージョン               |
| :--------------- | :----------------------- |
| node.js          | `>=8.11.4`               |
| npm              | `>=5.6.0`                |
| gcloud ※        | `>=256.0.0`              |

* [Google Cloud Platform](https://cloud.google.com/docs/overview/?hl=ja) でのプロジェクト作成まで完了していること。

※ gcloud ( Google Cloud SDK ) のインストール方法は[ここ](https://cloud.google.com/sdk/docs/?hl=ja#linux)。

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
cp .env.yaml.origin .env.yaml
vi .env.yaml
```
※ サービスのトークン個所は取得したものを記述して保存する。  
※ 天気情報を取得する地点を変更する場合は `CITIES` の個所を修正すること。

Google Cloud Platform へデプロイする。
```
gcloud beta functions deploy weatherTweet --trigger-http
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
※ サービスのトークン個所は取得したものを記述して保存する。  
※ 天気情報を取得する地点を変更する場合は `CITIES` の個所を修正すること。

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

