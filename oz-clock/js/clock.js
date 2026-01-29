// サマーウォーズ OZ World Clock - 時刻表示
// 本物のフォーマット: 20:34:08:78 (ピンク部分あり)

function updateClock() {
    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    // センチ秒に変換（ミリ秒を10で割って整数化）
    const centiseconds = Math.floor(milliseconds / 10);

    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    const centisecondsStr = String(centiseconds).padStart(2, '0');

    // 全て黒色で表示
    const timeString = `${hoursStr}:${minutesStr}:${secondsStr}:${centisecondsStr}`;

    const displayElement = document.getElementById('time-display');
    if (displayElement) {
        displayElement.textContent = timeString;
    }
}

// 10msごとに時刻更新（センチ秒表示のため）
setInterval(updateClock, 10);
updateClock();
