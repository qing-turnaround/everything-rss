package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/qing-turnaround/everything-rss/backend/internal/model"
)

type CollectionHandler struct{ DB *sql.DB }

func (h *CollectionHandler) List(w http.ResponseWriter, r *http.Request) {
	var tag *string
	if v := r.URL.Query().Get("tag"); v != "" {
		tag = &v
	}
	cols, err := model.ListCollections(h.DB, tag)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, cols)
}

func (h *CollectionHandler) Create(w http.ResponseWriter, r *http.Request) {
	var c model.Collection
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := model.CreateCollection(h.DB, &c); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, c)
}

func (h *CollectionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := model.DeleteCollection(h.DB, id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
