package model

import "database/sql"

func GetSettings(db *sql.DB) (map[string]string, error) {
	rows, err := db.Query("SELECT key, value FROM settings")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	settings := make(map[string]string)
	for rows.Next() {
		var k string
		var v sql.NullString
		if err := rows.Scan(&k, &v); err != nil {
			return nil, err
		}
		if v.Valid {
			settings[k] = v.String
		}
	}
	return settings, nil
}

func UpdateSettings(db *sql.DB, settings map[string]string) error {
	for k, v := range settings {
		_, err := db.Exec(
			"INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
			k, v,
		)
		if err != nil {
			return err
		}
	}
	return nil
}
