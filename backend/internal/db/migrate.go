package db

import (
	"database/sql"
	"embed"
	"fmt"
	"strings"
)

//go:embed migrations/*.sql
var migrationFS embed.FS

func Migrate(db *sql.DB) error {
	data, err := migrationFS.ReadFile("migrations/001_init.sql")
	if err != nil {
		return fmt.Errorf("read migration: %w", err)
	}

	stmts := strings.Split(string(data), "--> statement-breakpoint")
	for _, stmt := range stmts {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" {
			continue
		}
		if _, err := db.Exec(stmt); err != nil {
			if !strings.Contains(err.Error(), "already exists") {
				return fmt.Errorf("exec migration: %w", err)
			}
		}
	}

	defaults := map[string]string{
		"rsshub_instance":        "https://rsshub.app",
		"fetch_interval_default": "300",
		"theme":                  "system",
	}
	for k, v := range defaults {
		_, err := db.Exec("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", k, v)
		if err != nil {
			return fmt.Errorf("seed setting %q: %w", k, err)
		}
	}

	return nil
}
