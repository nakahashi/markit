# markit

markitはデスクトップに付箋を張り付けられるアプリケーションです。

各付箋の内容は、常にローカルの1つのテキストファイルと同期します。なので、

 * 好きなエディタやスクリプトから、付箋の内容を編集できます。
 * 付箋の内容を簡単に他の目的に流用できます。
 * クラウドストレージサービスを使えば、複数クライアントでの付箋の同期も簡単です。

付箋をMarkdownフォーマットで作成すると、編集はプレーンテキスト、編集時以外はMarkdownプレビューで表示できます。

同期用のフォルダに画像ファイルを置くと、画像を表示する付箋を作成できます。

markitはWindows、Mac、Linuxで動作します。

目下開発中です…

***

# todo

## 色設定

## フォント設定

## フォーマット判定

 * 画像系の拡張子 → 'img'
 * utf8:拡張子が'md' → 'md'
 * utf8で上記以外 → 'txt'

## 画像プレビュー

## Markdownプレビュー

 * md2reactを使う

## ズーム

## プロモーション

 * テンプレート: [DevAid]( http://themes.3rdwavemedia.com/website-templates/devaid-free-bootstrap-theme-developers/)

## プラットフォームごとの作りこみ

 * Mac: メニュー
 * Ubuntus: 調査

## その他

 * autoResize時のブレ

 * [15604:0505/014225:ERROR:ipc_channel_win.cc(512)] pipe error: 232 のログ
  https://github.com/electron/electron/issues/3078 では「harmless warning」って言ってるが、ホント？
