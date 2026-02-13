import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  ListGroup, 
  Form, 
  Button, 
  Badge,
  InputGroup,
  Alert
} from 'react-bootstrap';
import { Send, User, MessageSquare } from 'lucide-react';
import { message } from 'antd';

const Messaging = ({ currentUser, otherUser, propertyId = null, onClose = null }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(otherUser || null);
  const messagesEndRef = useRef(null);

  const currentUserData = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    } else {
      fetchConversations();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://localhost:8001/api/user/getmessages', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        // Group messages by conversation partner
        const conversationMap = new Map();
        response.data.data.forEach(msg => {
          const otherId = msg.senderId._id === currentUserData._id ? msg.receiverId._id : msg.senderId._id;
          const otherUser = msg.senderId._id === currentUserData._id ? msg.receiverId : msg.senderId;
          
          if (!conversationMap.has(otherId)) {
            conversationMap.set(otherId, {
              user: otherUser,
              lastMessage: msg,
              unreadCount: msg.receiverId._id === currentUserData._id && !msg.isRead ? 1 : 0
            });
          } else {
            const conv = conversationMap.get(otherId);
            conv.lastMessage = msg;
            if (msg.receiverId._id === currentUserData._id && !msg.isRead) {
              conv.unreadCount += 1;
            }
          }
        });

        setConversations(Array.from(conversationMap.values()));
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (otherUserId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8001/api/user/getmessages?otherUserId=${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setMessages(response.data.data);
        // Mark messages as read
        response.data.data.forEach(msg => {
          if (msg.receiverId._id === currentUserData._id && !msg.isRead) {
            markMessageAsRead(msg._id);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await axios.post('http://localhost:8001/api/user/markmessageread', 
        { messageId },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await axios.post('http://localhost:8001/api/user/sendmessage',
        {
          receiverId: selectedConversation._id,
          propertyId,
          message: newMessage.trim(),
          messageType: propertyId ? 'inquiry' : 'general'
        },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );

      if (response.data.success) {
        setNewMessage('');
        // Add the new message to the conversation
        const newMsg = response.data.data;
        setMessages(prev => [...prev, newMsg]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString();
  };

  if (!currentUser) {
    return (
      <Alert variant="warning">
        Please login to use messaging.
      </Alert>
    );
  }

  return (
    <Container fluid className="p-0">
      <Row className="g-0" style={{ height: '500px' }}>
        {/* Conversations List */}
        <Col md={4} className="border-end">
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">
                <MessageSquare size={18} className="me-2" />
                Messages
              </h6>
            </Card.Header>
            <ListGroup className="overflow-auto" style={{ height: 'calc(100% - 56px)' }}>
              {conversations.length === 0 ? (
                <div className="text-center p-4 text-muted">
                  <MessageSquare size={48} />
                  <p className="mt-2">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv, index) => (
                  <ListGroup.Item
                    key={index}
                    action
                    active={selectedConversation?._id === conv.user._id}
                    onClick={() => setSelectedConversation(conv.user)}
                    className="d-flex justify-content-between align-items-start"
                  >
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">{conv.user.name}</div>
                      <div className="text-muted small">
                        {conv.lastMessage.message.substring(0, 30)}...
                      </div>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">
                        {formatDate(conv.lastMessage.createdAt)}
                      </small>
                      {conv.unreadCount > 0 && (
                        <Badge bg="danger" pill className="ms-2">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Chat Area */}
        <Col md={8}>
          <Card className="h-100">
            {selectedConversation ? (
              <>
                <Card.Header className="bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <User size={18} className="me-2" />
                      <strong>{selectedConversation.name}</strong>
                    </div>
                    {onClose && (
                      <Button variant="outline-secondary" size="sm" onClick={onClose}>
                        ×
                      </Button>
                    )}
                  </div>
                </Card.Header>

                <Card.Body className="overflow-auto p-3" style={{ height: 'calc(100% - 140px)' }}>
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.length === 0 ? (
                        <div className="text-center text-muted">
                          <MessageSquare size={48} />
                          <p className="mt-2">Start a conversation</p>
                        </div>
                      ) : (
                        messages.map((msg, index) => (
                          <div
                            key={index}
                            className={`d-flex mb-3 ${msg.senderId._id === currentUserData._id ? 'justify-content-end' : 'justify-content-start'}`}
                          >
                            <div
                              className={`px-3 py-2 rounded-3 ${msg.senderId._id === currentUserData._id ? 'bg-primary text-white' : 'bg-light'}`}
                              style={{ maxWidth: '70%' }}
                            >
                              <div>{msg.message}</div>
                              <div className={`small ${msg.senderId._id === currentUserData._id ? 'text-white-50' : 'text-muted'}`}>
                                {formatTime(msg.createdAt)}
                                {msg.senderId._id === currentUserData._id && (
                                  <span className="ms-2">
                                    {msg.isRead ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </Card.Body>

                <Card.Footer className="bg-light">
                  <Form onSubmit={sendMessage}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={loading}
                      />
                      <Button type="submit" variant="primary" disabled={loading || !newMessage.trim()}>
                        <Send size={18} />
                      </Button>
                    </InputGroup>
                  </Form>
                </Card.Footer>
              </>
            ) : (
              <Card.Body className="d-flex align-items-center justify-content-center text-muted">
                <div className="text-center">
                  <MessageSquare size={48} />
                  <p className="mt-2">Select a conversation to start messaging</p>
                </div>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Messaging;
