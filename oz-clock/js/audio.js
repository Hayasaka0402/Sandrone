// サマーウォーズ OZ World Clock - 時報機能
// Web Audio APIによる時報音
// 仕様: 987.77Hz (B5の音) 毎秒 + 1975.53Hz (B6) 0秒

let audioContext = null;
let previousSecond = -1;
let hasPlayedThisSecond = false;
// LocalStorageから設定を読み込み（デフォルトはOFF）
let audioEnabled = localStorage.getItem('ozClockAudioEnabled') === 'true';

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playBeep(frequency, duration, type = 'sine') {
    if (!audioContext) initAudio();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function checkTimeSignal() {
    const now = new Date();
    const seconds = now.getSeconds();

    if (!audioEnabled) {
        console.log('Audio disabled, seconds:', seconds);
        return;
    }

    // 秒が変わったらフラグをリセット
    if (previousSecond !== seconds) {
        hasPlayedThisSecond = false;
        previousSecond = seconds;
    }

    // 既に再生済みの場合はスキップ
    if (hasPlayedThisSecond) return;

    console.log('Playing beep at second:', seconds);

    // 0秒のみ長い音（B6）
    if (seconds === 0) {
        playBeep(1975.53, 0.5, 'sine');  // 1975.53Hz = B6（2オクターブ上のB）
        hasPlayedThisSecond = true;
    } else {
        // それ以外の秒は毎秒短い音（B5）
        playBeep(987.77, 0.1, 'sine');  // 987.77Hz = B5（1オクターブ上のB）
        hasPlayedThisSecond = true;
    }
}

// 時報監視（1秒ごとにチェック）
setInterval(checkTimeSignal, 1000);

// ボタンの表示を更新
function updateButtonDisplay(audioBtn) {
    if (audioEnabled) {
        audioBtn.textContent = '🔊 時報ON';
        audioBtn.classList.add('active');
    } else {
        audioBtn.textContent = '🔇 時報OFF';
        audioBtn.classList.remove('active');
    }
}

// ボタンイベント
document.addEventListener('DOMContentLoaded', function() {
    const audioBtn = document.getElementById('audio-btn');
    console.log('Audio.js loaded, button:', audioBtn);
    console.log('Initial audioEnabled:', audioEnabled);

    if (audioBtn) {
        // 初期表示を設定
        updateButtonDisplay(audioBtn);

        // クリックイベント
        audioBtn.addEventListener('click', () => {
            console.log('Button clicked!');
            initAudio();

            // 状態をトグル
            audioEnabled = !audioEnabled;
            console.log('audioEnabled toggled to:', audioEnabled);

            // LocalStorageに保存
            localStorage.setItem('ozClockAudioEnabled', audioEnabled);

            // ボタン表示を更新
            updateButtonDisplay(audioBtn);
        });
    } else {
        console.error('Audio button not found!');
    }
});
