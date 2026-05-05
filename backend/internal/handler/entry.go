package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/qing-turnaround/everything-rss/backend/internal/model"
)

type EntryHandler struct{ DB *sql.DB }

func (h *EntryHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	p := model.ListEntriesParams{
		Limit: 20,
	}

	if v := q.Get("feed_id"); v != "" {
		p.FeedID = &v
	}
	if v := q.Get("view_type"); v != "" {
		p.ViewType = &v
	}
	if v := q.Get("is_read"); v != "" {
		n, _ := strconv.Atoi(v)
		p.IsRead = &n
	}
	if v := q.Get("tag"); v != "" {
		p.Tag = &v
	}
	if v := q.Get("cursor"); v != "" {
		n, _ := strconv.ParseInt(v, 10, 64)
		p.Cursor = &n
	}
	if v := q.Get("limit"); v != "" {
		n, _ := strconv.Atoi(v)
		if n > 0 {
			p.Limit = n
		}
	}

	resp, err := model.ListEntries(h.DB, p)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *EntryHandler) MarkRead(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := model.MarkRead(h.DB, id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *EntryHandler) MarkAllRead(w http.ResponseWriter, r *http.Request) {
	var body struct {
		FeedID   *string `json:"feedId"`
		ViewType *string `json:"viewType"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if err := model.MarkAllRead(h.DB, body.FeedID, body.ViewType); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
