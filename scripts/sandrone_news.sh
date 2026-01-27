#!/bin/bash
# Sandrone: AI/LLM News at 8:00 AM

echo "Fetching AI/LLM news..." >> /tmp/sandrone_news.log
echo "--- $(date '+%Y-%m-%d %H:%M:%S') ---" >> /tmp/sandrone_news.log

# TechCrunch AI category
echo "TechCrunch AI:" >> /tmp/sandrone_news.log
curl -s https://techcrunch.com/category/artificial-intelligence/ 2>/dev/null | grep -o '<a[^>]*class="post-block__title__link"[^>]*>[^<]*</a>' | sed 's/<[^>]*>//g' | sed 's/^/  • /' >> /tmp/sandrone_news.log

echo "" >> /tmp/sandrone_news.log

# VentureBeat AI
echo "VentureBeat AI:" >> /tmp/sandrone_news.log
curl -s https://venturebeat.com/category/ai/ 2>/dev/null | grep -o '<h3[^>]*>[^<]*</h3>' | sed 's/<[^>]*>//g' | sed 's/^/  • /' >> /tmp/sandrone_news.log

# Commit news to repo
cd /Users/akamatsushiyu/clawd
git add -A 2>/dev/null
git commit -m "AI news update at $(date '+%Y-%m-%d 08:00')" 2>/dev/null || echo "No changes to commit" >> /tmp/sandrone_news.log
git push origin main 2>/dev/null

echo "Done." >> /tmp/sandrone_news.log
