package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/qing-turnaround/everything-rss/backend/internal/model"
)

type SettingHandler struct{ DB *sql.DB }

func (h *SettingHandler) Get(w http.ResponseWriter, r *http.Request) {
	settings, err := model.GetSettings(h.DB)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (h *SettingHandler) Update(w http.ResponseWriter, r *http.Request) {
	var body map[string]string
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := model.UpdateSettings(h.DB, body); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
