package model

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type Feed struct {
	ID            string  `json:"id"`
	Title         string  `json:"title"`
	SiteURL       *string `json:"siteUrl"`
	FeedURL       string  `json:"feedUrl"`
	Description   *string `json:"description"`
	IconURL       *string `json:"iconUrl"`
	ViewType      string  `json:"viewType"`
	CategoryID    *string `json:"categoryId"`
	RSSHubRoute   *string `json:"rsshubRoute"`
	FetchInterval *int64  `json:"fetchInterval"`
	LastFetchedAt *int64  `json:"lastFetchedAt"`
	ErrorCount    int     `json:"errorCount"`
	CreatedAt     int64   `json:"createdAt"`
}

func ListFeeds(db *sql.DB, categoryID *string) ([]Feed, error) {
	query := "SELECT id, title, site_url, feed_url, description, icon_url, view_type, category_id, rsshub_route, fetch_interval, last_fetched_at, error_count, created_at FROM feeds"
	var args []any
	if categoryID != nil {
		query += " WHERE category_id = ?"
		args = append(args, *categoryID)
	}
	query += " ORDER BY created_at DESC"

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var feeds []Feed
	for rows.Next() {
		var f Feed
		if err := rows.Scan(&f.ID, &f.Title, &f.SiteURL, &f.FeedURL, &f.Description, &f.IconURL, &f.ViewType, &f.CategoryID, &f.RSSHubRoute, &f.FetchInterval, &f.LastFetchedAt, &f.ErrorCount, &f.CreatedAt); err != nil {
			return nil, err
		}
		feeds = append(feeds, f)
	}
	if feeds == nil {
		feeds = []Feed{}
	}
	return feeds, nil
}

func CreateFeed(db *sql.DB, f *Feed) error {
	f.ID = uuid.New().String()
	f.CreatedAt = time.Now().Unix()
	if f.ViewType == "" {
		f.ViewType = "article"
	}
	_, err := db.Exec(
		"INSERT INTO feeds (id, title, site_url, feed_url, description, icon_url, view_type, category_id, rsshub_route, fetch_interval, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		f.ID, f.Title, f.SiteURL, f.FeedURL, f.Description, f.IconURL, f.ViewType, f.CategoryID, f.RSSHubRoute, f.FetchInterval, f.CreatedAt,
	)
	return err
}

func UpdateFeed(db *sql.DB, id string, f *Feed) error {
	_, err := db.Exec(
		"UPDATE feeds SET title=?, site_url=?, feed_url=?, description=?, icon_url=?, view_type=?, category_id=?, rsshub_route=?, fetch_interval=? WHERE id=?",
		f.Title, f.SiteURL, f.FeedURL, f.Description, f.IconURL, f.ViewType, f.CategoryID, f.RSSHubRoute, f.FetchInterval, id,
	)
	return err
}

func DeleteFeed(db *sql.DB, id string) error {
	_, err := db.Exec("DELETE FROM feeds WHERE id = ?", id)
	return err
}

func GetFeedByID(db *sql.DB, id string) (*Feed, error) {
	var f Feed
	err := db.QueryRow(
		"SELECT id, title, site_url, feed_url, description, icon_url, view_type, category_id, rsshub_route, fetch_interval, last_fetched_at, error_count, created_at FROM feeds WHERE id = ?", id,
	).Scan(&f.ID, &f.Title, &f.SiteURL, &f.FeedURL, &f.Description, &f.IconURL, &f.ViewType, &f.CategoryID, &f.RSSHubRoute, &f.FetchInterval, &f.LastFetchedAt, &f.ErrorCount, &f.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &f, nil
}
