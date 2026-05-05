package fetcher

import (
	"database/sql"
	"log"
	"math"
	"strconv"
	"sync"
	"time"

	"github.com/qing-turnaround/everything-rss/backend/internal/model"
)

func Start(db *sql.DB) {
	go func() {
		log.Println("[fetcher] started, fetching immediately...")
		FetchAll(db)

		ticker := time.NewTicker(60 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			FetchAll(db)
		}
	}()
}

func FetchAll(db *sql.DB) {
	feeds, err := model.ListFeeds(db, nil)
	if err != nil {
		log.Printf("[fetcher] list feeds error: %v", err)
		return
	}

	defaultInterval := getDefaultInterval(db)
	now := time.Now().Unix()

	var due []model.Feed
	for _, f := range feeds {
		if shouldFetch(f, defaultInterval, now) {
			due = append(due, f)
		}
	}

	if len(due) == 0 {
		return
	}

	log.Printf("[fetcher] %d/%d feeds due for fetching", len(due), len(feeds))

	sem := make(chan struct{}, 5)
	var wg sync.WaitGroup

	for _, f := range due {
		wg.Add(1)
		sem <- struct{}{}
		go func(feed model.Feed) {
			defer wg.Done()
			defer func() { <-sem }()
			fetchSingle(db, feed)
		}(f)
	}
	wg.Wait()
}

func fetchSingle(db *sql.DB, feed model.Feed) {
	url := feed.FeedURL
	entries, err := ParseFeed(url)
	if err != nil {
		log.Printf("[fetcher] ✗ %s: %v", feed.Title, err)
		db.Exec("UPDATE feeds SET error_count = error_count + 1 WHERE id = ?", feed.ID)
		return
	}

	newCount := 0
	for i := range entries {
		entries[i].FeedID = feed.ID
		inserted, err := model.InsertEntry(db, &entries[i])
		if err != nil {
			log.Printf("[fetcher] insert error for %s: %v", feed.Title, err)
			continue
		}
		if inserted {
			newCount++
		}
	}

	now := time.Now().Unix()
	db.Exec("UPDATE feeds SET last_fetched_at = ?, error_count = 0 WHERE id = ?", now, feed.ID)
	log.Printf("[fetcher] ✓ %s: %d new entries", feed.Title, newCount)
}

func shouldFetch(f model.Feed, defaultInterval int64, now int64) bool {
	if f.LastFetchedAt == nil {
		return true
	}

	interval := defaultInterval
	if f.FetchInterval != nil && *f.FetchInterval > 0 {
		interval = *f.FetchInterval
	}

	backoff := math.Pow(2, math.Min(float64(f.ErrorCount), 6))
	effectiveInterval := float64(interval) * backoff

	return float64(now-*f.LastFetchedAt) >= effectiveInterval
}

func getDefaultInterval(db *sql.DB) int64 {
	settings, err := model.GetSettings(db)
	if err != nil {
		return 300
	}
	if v, ok := settings["fetch_interval_default"]; ok {
		n, err := strconv.ParseInt(v, 10, 64)
		if err == nil {
			return n
		}
	}
	return 300
}
