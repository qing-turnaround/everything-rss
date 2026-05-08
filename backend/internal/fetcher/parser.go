package fetcher

import (
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/mmcdole/gofeed"
	"github.com/qing-turnaround/everything-rss/backend/internal/model"
)

const browserUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

func ParseFeed(feedURL string) ([]model.Entry, error) {
	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest("GET", feedURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", browserUA)
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Pragma", "no-cache")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("http error: %s", resp.Status)
	}

	fp := gofeed.NewParser()
	feed, err := fp.Parse(resp.Body)
	if err != nil {
		return nil, err
	}

	var entries []model.Entry
	for _, item := range feed.Items {
		e := model.Entry{
			ID:   uuid.New().String(),
			GUID: itemGUID(item),
		}

		if item.Title != "" {
			e.Title = &item.Title
		}
		if item.Link != "" {
			e.URL = &item.Link
		}
		if item.Content != "" {
			e.Content = &item.Content
		}
		if item.Description != "" {
			e.Summary = &item.Description
		}
		if len(item.Authors) > 0 && item.Authors[0].Name != "" {
			e.Author = &item.Authors[0].Name
		}

		if item.PublishedParsed != nil {
			ts := item.PublishedParsed.Unix()
			e.PublishedAt = &ts
		} else if item.UpdatedParsed != nil {
			ts := item.UpdatedParsed.Unix()
			e.PublishedAt = &ts
		} else {
			ts := time.Now().Unix()
			e.PublishedAt = &ts
		}

		thumb, media := extractMedia(item)
		if thumb != "" {
			e.Thumbnail = &thumb
		}
		if media != "" {
			e.MediaURL = &media
		}

		e.CreatedAt = time.Now().Unix()
		entries = append(entries, e)
	}
	return entries, nil
}

func itemGUID(item *gofeed.Item) string {
	if item.GUID != "" {
		return item.GUID
	}
	if item.Link != "" {
		return item.Link
	}
	return item.Title
}

func extractMedia(item *gofeed.Item) (thumbnail, mediaURL string) {
	if ext, ok := item.Extensions["media"]; ok {
		if contents, ok := ext["content"]; ok && len(contents) > 0 {
			if url := contents[0].Attrs["url"]; url != "" {
				mediaURL = url
			}
		}
		if thumbs, ok := ext["thumbnail"]; ok && len(thumbs) > 0 {
			if url := thumbs[0].Attrs["url"]; url != "" {
				thumbnail = url
			}
		}
	}

	if mediaURL == "" && len(item.Enclosures) > 0 {
		mediaURL = item.Enclosures[0].URL
	}

	if item.Image != nil && thumbnail == "" {
		thumbnail = item.Image.URL
	}

	return
}
