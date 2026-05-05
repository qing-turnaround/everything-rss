package model

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type Category struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Order     int    `json:"order"`
	CreatedAt int64  `json:"createdAt"`
}

func ListCategories(db *sql.DB) ([]Category, error) {
	rows, err := db.Query("SELECT id, name, \"order\", created_at FROM categories ORDER BY \"order\" ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cats []Category
	for rows.Next() {
		var c Category
		if err := rows.Scan(&c.ID, &c.Name, &c.Order, &c.CreatedAt); err != nil {
			return nil, err
		}
		cats = append(cats, c)
	}
	if cats == nil {
		cats = []Category{}
	}
	return cats, nil
}

func CreateCategory(db *sql.DB, c *Category) error {
	c.ID = uuid.New().String()
	c.CreatedAt = time.Now().Unix()
	_, err := db.Exec(
		"INSERT INTO categories (id, name, \"order\", created_at) VALUES (?, ?, ?, ?)",
		c.ID, c.Name, c.Order, c.CreatedAt,
	)
	return err
}

func UpdateCategory(db *sql.DB, id string, c *Category) error {
	_, err := db.Exec(
		"UPDATE categories SET name=?, \"order\"=? WHERE id=?",
		c.Name, c.Order, id,
	)
	return err
}

func DeleteCategory(db *sql.DB, id string) error {
	_, err := db.Exec("DELETE FROM categories WHERE id = ?", id)
	return err
}
