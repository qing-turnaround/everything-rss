package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/qing-turnaround/everything-rss/backend/internal/model"
)

type FeedHandler struct{ DB *sql.DB }

func (h *FeedHandler) List(w http.ResponseWriter, r *http.Request) {
	var catID *string
	if v := r.URL.Query().Get("category_id"); v != "" {
		catID = &v
	}
	feeds, err := model.ListFeeds(h.DB, catID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, feeds)
}

func (h *FeedHandler) Create(w http.ResponseWriter, r *http.Request) {
	var f model.Feed
	if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := model.CreateFeed(h.DB, &f); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, f)
}

func (h *FeedHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var f model.Feed
	if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := model.UpdateFeed(h.DB, id, &f); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	f.ID = id
	writeJSON(w, http.StatusOK, f)
}

func (h *FeedHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := model.DeleteFeed(h.DB, id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
