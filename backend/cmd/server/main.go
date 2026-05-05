package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/qing-turnaround/everything-rss/backend/internal/db"
	"github.com/qing-turnaround/everything-rss/backend/internal/fetcher"
	"github.com/qing-turnaround/everything-rss/backend/internal/handler"
)

func main() {
	dbPath := flag.String("db", "./data/rss.db", "SQLite database path")
	addr := flag.String("addr", ":8080", "HTTP listen address")
	flag.Parse()

	database, err := db.Open(*dbPath)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer database.Close()

	fetcher.Start(database)

	feeds := &handler.FeedHandler{DB: database}
	entries := &handler.EntryHandler{DB: database}
	categories := &handler.CategoryHandler{DB: database}
	collections := &handler.CollectionHandler{DB: database}
	settings := &handler.SettingHandler{DB: database}
	imports := &handler.ImportHandler{DB: database}

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Route("/api", func(r chi.Router) {
		r.Get("/feeds", feeds.List)
		r.Post("/feeds", feeds.Create)
		r.Put("/feeds/{id}", feeds.Update)
		r.Delete("/feeds/{id}", feeds.Delete)

		r.Get("/entries", entries.List)
		r.Put("/entries/{id}/read", entries.MarkRead)
		r.Put("/entries/read-all", entries.MarkAllRead)

		r.Get("/categories", categories.List)
		r.Post("/categories", categories.Create)
		r.Put("/categories/{id}", categories.Update)
		r.Delete("/categories/{id}", categories.Delete)

		r.Get("/collections", collections.List)
		r.Post("/collections", collections.Create)
		r.Delete("/collections/{id}", collections.Delete)

		r.Get("/settings", settings.Get)
		r.Put("/settings", settings.Update)

		r.Post("/import/opml", imports.ImportOPML)
	})

	log.Printf("Everything RSS server listening on %s", *addr)
	if err := http.ListenAndServe(*addr, r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
