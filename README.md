# ラーメンブログ

地域のラーメン店舗やスポット情報を管理・共有できるブログシステムです。管理者が地域の店舗情報や写真を投稿し、カテゴリー別に整理して閲覧できる、シンプルで使いやすい情報共有プラットフォームを目指しています。

## 特徴と機能の説明

### 1. シンプルな記事管理システム

- 店舗名、営業時間、電話番号などの基本情報を構造化して管理
- カバー画像のアップロード機能
- サニタイズされたHTML形式での本文内容の保存

### 2. カテゴリーベースの柔軟な記事管理

- 複数カテゴリーでの記事分類が可能
- カテゴリーフィルタリング機能
- 記事が存在しないカテゴリーの可視化

### 3. レスポンシブデザイン

- モバイルからデスクトップまで、様々な画面サイズに対応
- Tailwind CSSを活用した一貫性のあるUI設計

## 使用技術 (技術スタック)

### システム構成図

flowchart TB
subgraph Client["クライアント"]
Browser["ブラウザ"]
end

    subgraph Vercel["Vercel"]
        direction TB
        NextJS["Next.js App"]
        API["API Routes"]
    end

    subgraph Supabase["Supabase"]
        direction TB
        Database[(Database)]
        Storage["Storage\n(画像ファイル)"]
    end

    Browser -->|"HTTPS"| NextJS
    NextJS -->|"API Calls"| API
    API -->|"CRUD Operations"| Database
    API -->|"File Operations"| Storage

    style Client fill:#f5f5f5,stroke:#333,stroke-width:2px
    style Vercel fill:#f0f0f0,stroke:#333,stroke-width:2px
    style Supabase fill:#e6f3ff,stroke:#333,stroke-width:2px
    style Browser fill:#fff,stroke:#666
    style NextJS fill:#fff,stroke:#666
    style API fill:#fff,stroke:#666
    style Database fill:#fff,stroke:#666
    style Storage fill:#fff,stroke:#666

### フロントエンド

- TypeScript
- Next.js (App Router)
- Tailwind CSS
- FontAwesome
- DOMPurify (XSS対策)

### バックエンド

- Supabase
  - データベース
  - ストレージ (画像管理)

### インフラ

- Vercel

## 開発期間・体制

- 開発体制: 個人開発
- 開発期間: 2024.12 ~ 2025.2（時間）

## 工夫した点

### 1. ユーザビリティ

- カテゴリーフィルターのインタラクティブな操作性
- 記事がないカテゴリーの視覚的な表示
- ローディング状態の適切な表示

### 2. パフォーマンス

- 画像の最適化（Next.js Image component使用）

## 既知の課題と今後の展望

### 1. 機能拡張

- ユーザー認証システムの実装
- コメント機能の追加
- 記事の検索機能

### 2. UI/UX改善

- 記事のソート機能
- より詳細な店舗情報の入力フォーム
- 地図との連携

### 3. 技術的改善

- テストの追加
- エラーハンドリングの強化
- SEO対策の実装

このアプリケーションは、ラーメン情報の効率的な管理と共有を実現する基盤として、さらなる機能拡張と改善を継続的に行っていく予定です。
