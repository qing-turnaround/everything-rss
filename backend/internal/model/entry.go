package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Entry struct {
	ID          string  `json:"id"`
	FeedID      string  `json:"feedId"`
	GUID        string  `json:"guid"`
	Title       *string `json:"title"`
	URL         *string `json:"url"`
	Content     *string `json:"content"`
	Summary     *string `json:"summary"`
	Author      *string `json:"author"`
	Thumbnail   *string `json:"thumbnail"`
	MediaURL    *string `json:"mediaUrl"`
	PublishedAt *int64  `json:"publishedAt"`
	IsRead      int     `json:"isRead"`
	CreatedAt   int64   `json:"createdAt"`
}

type ListEntriesParams struct {
	FeedID   *string
	ViewType *string
	IsRead   *int
	Tag      *string
	Cursor   *int64
	Limit    int
}

type EntriesResponse struct {
	Entries    []Entry `json:"entries"`
	NextCursor *int64  `json:"nextCursor"`
}

func ListEntries(db *sql.DB, p ListEntriesParams) (*EntriesResponse, error) {
	if p.Limit <= 0 {
		p.Limit = 20
	}

	if p.Tag != nil {
		return listEntriesByTag(db, p)
	}

	var conditions []string
	var args []any

	if p.FeedID != nil {
		conditions = append(conditions, "e.feed_id = ?")
		args = append(args, *p.FeedID)
	}

	if p.ViewType != nil {
		conditions = append(conditions, "e.feed_id IN (SELECT id FROM feeds WHERE view_type = ?)")
		args = append(args, *p.ViewType)
	}

	if p.IsRead != nil {
		conditions = append(conditions, "e.is_read = ?")
		args = append(args, *p.IsRead)
	}

	if p.Cursor != nil {
		conditions = append(conditions, "e.published_at < ?")
		args = append(args, *p.Cursor)
	}

	query := "SELECT e.id, e.feed_id, e.guid, e.title, e.url, e.content, e.summary, e.author, e.thumbnail, e.media_url, e.published_at, e.is_read, e.created_at FROM entries e"
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += fmt.Sprintf(" ORDER BY e.published_at DESC LIMIT %d", p.Limit+1)

	return queryEntries(db, query, args, p.Limit)
}

func listEntriesByTag(db *sql.DB, p ListEntriesParams) (*EntriesResponse, error) {
	rows, err := db.Query("SELECT entry_id FROM collections WHERE tag = ?", *p.Tag)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entryIDs []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		entryIDs = append(entryIDs, id)
	}

	if len(entryIDs) == 0 {
		return &EntriesResponse{Entries: []Entry{}}, nil
	}

	placeholders := make([]string, len(entryIDs))
	args := make([]any, len(entryIDs))
	for i, id := range entryIDs {
		placeholders[i] = "?"
		args[i] = id
	}

	query := fmt.Sprintf(
		"SELECT e.id, e.feed_id, e.guid, e.title, e.url, e.content, e.summary, e.author, e.thumbnail, e.media_url, e.published_at, e.is_read, e.created_at FROM entries e WHERE e.id IN (%s)",
		strings.Join(placeholders, ","),
	)

	if p.Cursor != nil {
		query += " AND e.published_at < ?"
		args = append(args, *p.Cursor)
	}

	query += fmt.Sprintf(" ORDER BY e.published_at DESC LIMIT %d", p.Limit+1)

	return queryEntries(db, query, args, p.Limit)
}

func queryEntries(db *sql.DB, query string, args []any, limit int) (*EntriesResponse, error) {
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []Entry
	for rows.Next() {
		var e Entry
		if err := rows.Scan(&e.ID, &e.FeedID, &e.GUID, &e.Title, &e.URL, &e.Content, &e.Summary, &e.Author, &e.Thumbnail, &e.MediaURL, &e.PublishedAt, &e.IsRead, &e.CreatedAt); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}

	resp := &EntriesResponse{Entries: entries}
	if resp.Entries == nil {
		resp.Entries = []Entry{}
	}

	if len(entries) > limit {
		resp.Entries = entries[:limit]
		resp.NextCursor = entries[limit-1].PublishedAt
	}

	return resp, nil
}

func InsertEntry(db *sql.DB, e *Entry) (bool, error) {
	if e.ID == "" {
		e.ID = uuid.New().String()
	}
	if e.CreatedAt == 0 {
		e.CreatedAt = time.Now().Unix()
	}
	result, err := db.Exec(
		"INSERT OR IGNORE INTO entries (id, feed_id, guid, title, url, content, summary, author, thumbnail, media_url, published_at, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)",
		e.ID, e.FeedID, e.GUID, e.Title, e.URL, e.Content, e.Summary, e.Author, e.Thumbnail, e.MediaURL, e.PublishedAt, e.CreatedAt,
	)
	if err != nil {
		return false, err
	}
	n, _ := result.RowsAffected()
	return n > 0, nil
}

func MarkRead(db *sql.DB, id string) error {
	_, err := db.Exec("UPDATE entries SET is_read = 1 WHERE id = ?", id)
	return err
}

func MarkAllRead(db *sql.DB, feedID, viewType *string) error {
	query := "UPDATE entries SET is_read = 1"
	var conditions []string
	var args []any

	if feedID != nil {
		conditions = append(conditions, "feed_id = ?")
		args = append(args, *feedID)
	}
	if viewType != nil {
		conditions = append(conditions, "feed_id IN (SELECT id FROM feeds WHERE view_type = ?)")
		args = append(args, *viewType)
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	_, err := db.Exec(query, args...)
	return err
}
