package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/qing-turnaround/everything-rss/backend/internal/model"
)

type CategoryHandler struct{ DB *sql.DB }

func (h *CategoryHandler) List(w http.ResponseWriter, r *http.Request) {
	cats, err := model.ListCategories(h.DB)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, cats)
}

func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var c model.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := model.CreateCategory(h.DB, &c); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, c)
}

func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var c model.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := model.UpdateCategory(h.DB, id, &c); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	c.ID = id
	writeJSON(w, http.StatusOK, c)
}

func (h *CategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := model.DeleteCategory(h.DB, id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
