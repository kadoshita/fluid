# ベースイメージとしてNode.js 24（Debian bullseye-slim版）を使用
FROM node:24.12.0-bullseye-slim AS base

# 依存関係のインストールステージ
FROM base AS deps

WORKDIR /app

# 依存関係ファイルのみをコピーしてキャッシュを最適化
COPY package.json package-lock.json ./
# 本番依存関係のみをインストール
RUN npm ci --omit=dev

# ビルダーステージ
FROM base AS builder

WORKDIR /app

# 全ての依存関係をインストール（devDependenciesを含む）
COPY package.json package-lock.json ./
RUN npm ci

# ソースコードをコピー
COPY . .

# Next.jsのビルド（standaloneモードで最小限の依存関係のみ出力）
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 本番実行ステージ - Distrolessイメージを使用
FROM gcr.io/distroless/nodejs24-debian12:nonroot

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Tokyo
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# publicディレクトリと.nextの静的ファイルをコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static

# Distrolessイメージはデフォルトで非特権ユーザー(nonroot)で実行される
# USER命令は不要

EXPOSE 3000

CMD ["server.js"]