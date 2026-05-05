package handler

import (
	"database/sql"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/qing-turnaround/everything-rss/backend/internal/model"
)

type ImportHandler struct{ DB *sql.DB }

type opml struct {
	Body opmlBody `xml:"body"`
}

type opmlBody struct {
	Outlines []opmlOutline `xml:"outline"`
}

type opmlOutline struct {
	Text     string        `xml:"text,attr"`
	Title    string        `xml:"title,attr"`
	Type     string        `xml:"type,attr"`
	XMLURL   string        `xml:"xmlUrl,attr"`
	HTMLURL  string        `xml:"htmlUrl,attr"`
	Children []opmlOutline `xml:"outline"`
}

func (h *ImportHandler) ImportOPML(w http.ResponseWriter, r *http.Request) {
	file, _, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing file")
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	var doc opml
	if err := xml.Unmarshal(data, &doc); err != nil {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("invalid OPML: %v", err))
		return
	}

	imported, skipped := 0, 0
	for _, outline := range doc.Body.Outlines {
		h.processOutline(outline, nil, &imported, &skipped)
	}

	writeJSON(w, http.StatusOK, map[string]int{
		"imported": imported,
		"skipped":  skipped,
	})
}

func (h *ImportHandler) processOutline(o opmlOutline, categoryID *string, imported, skipped *int) {
	if o.XMLURL != "" {
		title := o.Title
		if title == "" {
			title = o.Text
		}
		if title == "" {
			title = o.XMLURL
		}
		f := model.Feed{
			Title:      title,
			FeedURL:    o.XMLURL,
			ViewType:   "article",
			CategoryID: categoryID,
		}
		if o.HTMLURL != "" {
			f.SiteURL = &o.HTMLURL
		}
		if err := model.CreateFeed(h.DB, &f); err != nil {
			*skipped++
		} else {
			*imported++
		}
		return
	}

	if len(o.Children) > 0 {
		name := o.Title
		if name == "" {
			name = o.Text
		}
		cat := model.Category{
			ID:        uuid.New().String(),
			Name:      name,
			CreatedAt: time.Now().Unix(),
		}
		model.CreateCategory(h.DB, &cat)

		for _, child := range o.Children {
			h.processOutline(child, &cat.ID, imported, skipped)
		}
	}
}
