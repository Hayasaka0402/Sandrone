/**
 * OZ World Clock - ニュースアーカイブ画像展開機能
 * サマーウォーズ風: 1時間ごとに画像が放射状に「ブワっ」と広がる
 */

// NewsAPI設定（注: 無料プランはlocalhost限定）
const NEWS_API_KEY = '60f9386aac0b4405bebbea5d84a0895e';
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines?country=jp&category=general&pageSize=12';

// フォールバック用のサンプル画像（Unsplash API）
const FALLBACK_IMAGE_URL = 'https://source.unsplash.com/400x300/?city,technology,japan';

// アニメーション設定
const CONFIG = {
    imageCount: 12,           // 12方向（時計の12時間）
    expandDuration: 1500,     // 展開アニメーション時間(ms)
    displayDuration: 5000,    // 表示時間(ms)
    fadeOutDuration: 1000,    // フェードアウト時間(ms)
    radius: 400,              // 展開半径(px)
};

// 状態管理
let isAnimating = false;
let newsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1時間（ミリ秒）

/**
 * ニュース画像を取得（NewsAPI → Unsplash フォールバック）
 */
async function fetchNewsImages() {
    // キャッシュチェック（1時間以内なら再利用）
    const now = Date.now();
    if (newsCache && (now - lastFetchTime < CACHE_DURATION)) {
        console.log('[NEWS] キャッシュされた画像を使用');
        return newsCache;
    }

    try {
        // NewsAPI試行
        const response = await fetch(`${NEWS_API_URL}&apiKey=${NEWS_API_KEY}`);

        if (!response.ok) {
            throw new Error(`NewsAPI エラー: ${response.status}`);
        }

        const data = await response.json();
        const articles = data.articles || [];

        // 画像付き記事のみフィルター
        const imagesWithTitles = articles
            .filter(article => article.urlToImage)
            .slice(0, CONFIG.imageCount)
            .map(article => ({
                url: article.urlToImage,
                title: article.title || 'ニュース',
                source: article.source?.name || '不明'
            }));

        if (imagesWithTitles.length >= 6) {
            console.log(`[NEWS] NewsAPIから${imagesWithTitles.length}件取得成功`);
            newsCache = imagesWithTitles;
            lastFetchTime = now;
            return imagesWithTitles;
        }

        throw new Error('画像付き記事が不足');

    } catch (error) {
        console.warn('[NEWS] NewsAPI失敗、フォールバックを使用:', error.message);
        return generateFallbackImages();
    }
}

/**
 * フォールバック画像生成（Unsplash + ダミータイトル）
 */
function generateFallbackImages() {
    const categories = [
        'tokyo', 'nature', 'technology', 'architecture',
        'space', 'ocean', 'mountain', 'cityscape',
        'japan', 'sunset', 'urban', 'abstract'
    ];

    return Array.from({ length: CONFIG.imageCount }, (_, i) => ({
        url: `https://source.unsplash.com/400x300/?${categories[i]}`,
        title: `画像 ${i + 1}`,
        source: 'Unsplash'
    }));
}

/**
 * 画像カード（棒付き）を作成
 */
function createNewsCard(imageData, index) {
    // アイテムコンテナ（棒＋画像）
    const item = document.createElement('div');
    item.className = 'news-item';

    // 12方向に配置（30度間隔、12時位置から開始）
    const angle = (index * 30) - 90; // -90度で12時位置から開始

    // CSS変数で角度と距離を設定
    item.style.setProperty('--angle', `${angle}deg`);
    item.style.setProperty('--distance', `${CONFIG.radius}px`);

    // 棒（地球儀と画像を繋ぐ線）
    const line = document.createElement('div');
    line.className = 'news-line';

    // 画像カード
    const card = document.createElement('div');
    card.className = 'news-card';

    // 画像
    const img = document.createElement('img');
    img.src = imageData.url;
    img.alt = imageData.title;
    img.onerror = () => {
        // 画像読み込み失敗時はプレースホルダー（円形）
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Ccircle fill="%23ddd" cx="75" cy="75" r="75"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="14"%3E画像なし%3C/text%3E%3C/svg%3E';
    };

    // タイトル
    const title = document.createElement('div');
    title.className = 'news-title';
    title.textContent = imageData.title.substring(0, 40) + (imageData.title.length > 40 ? '...' : '');

    card.appendChild(img);
    card.appendChild(title);
    item.appendChild(line);
    item.appendChild(card);

    return item;
}

/**
 * メイン: 画像展開アニメーション実行
 */
async function triggerNewsArchive() {
    if (isAnimating) {
        console.log('[ARCHIVE] アニメーション実行中のためスキップ');
        return;
    }

    isAnimating = true;
    console.log('[ARCHIVE] 画像展開アニメーション開始');

    // コンテナ取得
    const container = document.getElementById('news-archive-container');
    if (!container) {
        console.error('[ARCHIVE] コンテナが見つかりません');
        isAnimating = false;
        return;
    }

    // 前回の画像をクリア
    container.innerHTML = '';

    // 画像取得
    const images = await fetchNewsImages();

    // カード作成＆追加
    images.forEach((imageData, index) => {
        const item = createNewsCard(imageData, index);
        container.appendChild(item);
    });

    // 一気に全部展開（少し遅延してアニメーション開始）
    setTimeout(() => {
        const items = container.querySelectorAll('.news-item');
        items.forEach(item => {
            item.classList.add('show');
        });
    }, 100);

    // フェードアウト開始（一気に全部）
    setTimeout(() => {
        const items = container.querySelectorAll('.news-item');
        items.forEach(item => {
            item.classList.add('fade-out');
        });
    }, CONFIG.displayDuration);

    // クリーンアップ
    setTimeout(() => {
        container.innerHTML = '';
        isAnimating = false;
        console.log('[ARCHIVE] アニメーション完了');
    }, CONFIG.displayDuration + CONFIG.fadeOutDuration + 500);
}

/**
 * 毎時0分の自動トリガー
 */
function setupAutoTrigger() {
    setInterval(() => {
        const now = new Date();
        if (now.getMinutes() === 0 && now.getSeconds() === 0) {
            console.log('[ARCHIVE] 毎時0分 - 自動トリガー');
            triggerNewsArchive();
        }
    }, 1000); // 1秒ごとにチェック
}

/**
 * 初期化
 */
function initNewsArchive() {
    console.log('[ARCHIVE] ニュースアーカイブ機能を初期化');

    // テストボタンのイベントリスナー
    const testButton = document.getElementById('test-archive-btn');
    if (testButton) {
        testButton.addEventListener('click', () => {
            console.log('[ARCHIVE] テストボタンがクリックされました');
            triggerNewsArchive();
        });
    }

    // 自動トリガー設定
    setupAutoTrigger();

    console.log('[ARCHIVE] 初期化完了');
}

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsArchive);
} else {
    initNewsArchive();
}
