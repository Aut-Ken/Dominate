package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// ==================== WebSocket Hub ====================

// Message types for WebSocket events
const (
	EventTaskCreated   = "task_created"
	EventTaskUpdated   = "task_updated"
	EventTaskDeleted   = "task_deleted"
	EventChatMessage   = "chat_message"
	EventNotification  = "notification"
	EventActivityLog   = "activity_log"
	EventMemberJoined  = "member_joined"
	EventProjectUpdate = "project_update"
)

// WSMessage is the structure sent over WebSocket
type WSMessage struct {
	Event   string      `json:"event"`
	Payload interface{} `json:"payload"`
	UserID  string      `json:"userId,omitempty"` // who triggered
}

// Client represents a WebSocket connection
type Client struct {
	conn   *websocket.Conn
	userID string
	send   chan []byte
}

// Hub manages all WebSocket connections
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

var (
	hub      *Hub
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins for dev
		},
	}
)

func init() {
	hub = &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
	go hub.run()
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("[WS] Client connected: %s (total: %d)", client.userID, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			log.Printf("[WS] Client disconnected: %s (total: %d)", client.userID, len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Broadcast sends a message to ALL connected clients
func Broadcast(event string, payload interface{}) {
	msg := WSMessage{Event: event, Payload: payload}
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("[WS] Failed to marshal broadcast: %v", err)
		return
	}
	hub.broadcast <- data
}

// SendToUser sends a message to a SPECIFIC user
func SendToUser(userID string, event string, payload interface{}) {
	msg := WSMessage{Event: event, Payload: payload}
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}
	hub.mu.RLock()
	defer hub.mu.RUnlock()
	for client := range hub.clients {
		if client.userID == userID {
			select {
			case client.send <- data:
			default:
			}
		}
	}
}

// GetOnlineCount returns the number of connected clients
func GetOnlineCount() int {
	hub.mu.RLock()
	defer hub.mu.RUnlock()
	return len(hub.clients)
}

// HandleWebSocket is the Gin handler for WebSocket connections
func HandleWebSocket(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		userID = "anonymous"
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[WS] Upgrade error: %v", err)
		return
	}

	client := &Client{
		conn:   conn,
		userID: userID,
		send:   make(chan []byte, 256),
	}

	hub.register <- client

	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(512 * 1024)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(30 * time.Second) // ping interval
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
