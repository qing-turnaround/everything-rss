package model

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type Collection struct {
	ID        string `json:"id"`
	EntryID   string `json:"entryId"`
	Tag       string `json:"tag"`
	CreatedAt int64  `json:"createdAt"`
}

func ListCollections(db *sql.DB, tag *string) ([]Collection, error) {
	query := "SELECT id, entry_id, tag, created_at FROM collections"
	var args []any
	if tag != nil {
		query += " WHERE tag = ?"
		args = append(args, *tag)
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cols []Collection
	for rows.Next() {
		var c Collection
		if err := rows.Scan(&c.ID, &c.EntryID, &c.Tag, &c.CreatedAt); err != nil {
			return nil, err
		}
		cols = append(cols, c)
	}
	if cols == nil {
		cols = []Collection{}
	}
	return cols, nil
}

func CreateCollection(db *sql.DB, c *Collection) error {
	c.ID = uuid.New().String()
	c.CreatedAt = time.Now().Unix()
	_, err := db.Exec(
		"INSERT OR IGNORE INTO collections (id, entry_id, tag, created_at) VALUES (?, ?, ?, ?)",
		c.ID, c.EntryID, c.Tag, c.CreatedAt,
	)
	return err
}

func DeleteCollection(db *sql.DB, id string) error {
	_, err := db.Exec("DELETE FROM collections WHERE id = ?", id)
	return err
}
