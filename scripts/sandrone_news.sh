#!/bin/bash
# Sandrone: AI/LLM News at 8:00 AM - Send to Discord

NEWS_DIR="/Users/akamatsushiyu/clawd/news"
mkdir -p "$NEWS_DIR"

TODAY_LOG="$NEWS_DIR/news_$(date '+%Y%m%d').txt"
MSG_FILE="$NEWS_DIR/msg_$(date '+%Y%m%d').txt"

echo "Fetching AI/LLM news..." >> "$TODAY_LOG"
echo "--- $(date '+%Y-%m-%d %H:%M:%S') ---" >> "$TODAY_LOG"

# Build Discord message
echo "**🤖 サンドローネのAIニュース速報（$(date '+%Y/%m/%d')）**" > "$MSG_FILE"
echo "" >> "$MSG_FILE"

# TechCrunch AI via RSS
echo "" >> "$TODAY_LOG"
echo "=== TechCrunch AI ===" >> "$TODAY_LOG"

curl -s -A "Mozilla/5.0" "https://techcrunch.com/category/artificial-intelligence/feed/" 2>/dev/null | \
  awk '/<title>/{gsub(/<[^>]*>/,""); title=$0} /<link>/{gsub(/<[^>]*>/,""); link=$0} /^$/{if(title!="" && link!="" && title!="AI News & Artificial Intelligence"){print "• " title "\n  " link; title=""; link=""}}' | \
  head -8 | \
  while IFS=$'\n' read line; do
    echo "$line" >> "$TODAY_LOG"
    echo "$line" >> "$MSG_FILE"
  done

echo "" >> "$MSG_FILE"
echo "" >> "$TODAY_LOG"
echo "=== VentureBeat AI ===" >> "$TODAY_LOG"

# Try VentureBeat RSS
curl -s -A "Mozilla/5.0" "https://venturebeat.com/category/ai/feed/" 2>/dev/null | \
  awk '/<title>/{gsub(/<[^>]*>/,""); title=$0} /<link>/{gsub(/<[^>]*>/,""); link=$0} /^$/{if(title!="" && link!="" && index(title, "VentureBeat")==0){print "• " title "\n  " link; title=""; link=""}}' | \
  head -5 | \
  while IFS=$'\n' read line; do
    echo "$line" >> "$TODAY_LOG"
    echo "$line" >> "$MSG_FILE"
  done

echo "" >> "$TODAY_LOG"
echo "Done." >> "$TODAY_LOG"
echo "---" >> "$TODAY_LOG"

# Commit to git
cd /Users/akamatsushiyu/clawd
git add "$NEWS_DIR/" 2>/dev/null
git commit -m "AI news update at $(date '+%Y-%m-%d 08:00')" 2>/dev/null || true
git push origin main 2>/dev/null || true

# Send to Discord
MSG_TEXT=$(cat "$MSG_FILE")
/Users/akamatsushiyu/.local/share/fnm/node-versions/v24.13.0/installation/bin/clawdbot message send --channel discord --target "channel:1246811851577360427" --message "$MSG_TEXT"
