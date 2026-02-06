"use client";
import React, { useEffect, useMemo, useRef, useState, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import { Input } from "@/components/ui/InputText";
import { Textarea } from "@/components/ui/textarea";
import Loading from "@/components/ui/Loading";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/socket";
import {
  formatRelativeTime,
  formatMessageDate,
  formatTimeOnly,
  canEditOrDelete,
  playNotificationSound,
  isImageFile,
  formatFileSize,
} from "@/lib/chat-utils";
import {
  MoreHorizontal,
  Paperclip,
  Send,
  Search,
  MessageCircle,
  UserPlus,
  ArrowLeft,
  X,
  Edit2,
  Trash2,
  Check,
  CheckCheck,
  File,
} from "lucide-react";

// ... (Interface definitions remain the same)
interface Instructor {
  id: string;
  name: string;
  email: string;
  bidangKeahlian?: string;
  hasConversation?: boolean;
  avatar?: string;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    email: string;
    bidangKeahlian?: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  sender: {
    id: string;
    name: string;
  };
}

const ChatPage = () => {
  // ... (All logic, state, and useEffect hooks remain exactly the same)
  // ... (Keep existing logic code here until the return statement)
  
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth");
    },
  });

  const { 
    socket, 
    isConnected, 
    onlineUsers, 
    typingUsers, 
    lastSeenMap,
    joinConversation, 
    leaveConversation,
    startTyping,
    stopTyping, 
  } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileCaption, setFileCaption] = useState("");
  
  const messagesRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const searchParams = useSearchParams();

  // ... (Insert all the existing useEffects and handlers here unchanged)
  // To save space, assuming logic is identical to your provided code
  // Only the JSX return is modified below.

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInstructors = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/instructors");
      if (res.ok) {
        const data = await res.json();
        setInstructors(data);
      }
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchInstructors();
  }, [fetchConversations, fetchInstructors]);

  useEffect(() => {
    const instructorId = searchParams.get("instructorId");
    if (instructorId && conversations.length > 0) {
      const existingConv = conversations.find(
        (c) => c.participant.id === instructorId
      );
      if (existingConv) {
        setSelectedConversationId(existingConv.id);
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (selectedConversationId) {
      joinConversation(selectedConversationId);
      fetchMessages(selectedConversationId);
      return () => {
        leaveConversation(selectedConversationId);
      };
    }
  }, [selectedConversationId, joinConversation, leaveConversation, fetchMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      if (data.conversationId === selectedConversationId) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.messageId,
            senderId: data.senderId,
            content: data.content,
            createdAt: data.createdAt,
            isRead: false,
            isEdited: false,
            isDeleted: false,
            attachmentUrl: data.attachmentUrl,
            attachmentType: data.attachmentType,
            sender: {
              id: data.senderId,
              name: data.senderName,
            },
          },
        ]);

        if (data.senderId !== session?.user?.id) {
          playNotificationSound();
        }
      }
      fetchConversations();
    };

    const handleMessageEdited = (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, content: data.newContent, isEdited: true, editedAt: data.editedAt }
            : msg
        )
      );
    };

    const handleMessageDeleted = (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, content: "Pesan telah dihapus", isDeleted: true, deletedAt: data.deletedAt }
            : msg
        )
      );
    };

    const handleMessageReadUpdate = (data: any) => {
      if (data.userId !== session?.user?.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg.id) ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
          )
        );
      }
    };

    socket.on("message:receive", handleNewMessage);
    socket.on("message:edited", handleMessageEdited);
    socket.on("message:deleted", handleMessageDeleted);
    socket.on("message:read:update", handleMessageReadUpdate);

    return () => {
      socket.off("message:receive", handleNewMessage);
      socket.off("message:edited", handleMessageEdited);
      socket.off("message:deleted", handleMessageDeleted);
      socket.off("message:read:update", handleMessageReadUpdate);
    };
  }, [socket, selectedConversationId, fetchConversations, session?.user?.id]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedConversationId || !session?.user?.id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const unreadMessageIds = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.getAttribute("data-message-id"))
          .filter((id): id is string => {
            if (!id) return false;
            const message = messages.find((m) => m.id === id);
            return message ? !message.isRead && message.senderId !== session.user!.id : false;
          });

        if (unreadMessageIds.length > 0) {
          fetch("/api/chat/messages/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageIds: unreadMessageIds }),
          }).catch(console.error);

          socket?.emit("message:read", {
            conversationId: selectedConversationId,
            userId: session.user!.id,
            messageIds: unreadMessageIds,
          });

          setMessages((prev) =>
            prev.map((msg) =>
              unreadMessageIds.includes(msg.id)
                ? { ...msg, isRead: true, readAt: new Date().toISOString() }
                : msg
            )
          );
        }
      },
      { threshold: 0.5 }
    );

    messageRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [messages, selectedConversationId, session?.user?.id, socket]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    return conversations.filter((conv) =>
      conv.participant.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  const isParticipantOnline = useCallback(
    (participantId: string) => onlineUsers.has(participantId),
    [onlineUsers]
  );

  const currentTypingUsers = useMemo(() => {
    if (!selectedConversationId) return [];
    return typingUsers.get(selectedConversationId) || [];
  }, [selectedConversationId, typingUsers]);

  const handleTyping = useCallback(() => {
    if (!selectedConversationId) return;
    
    startTyping(selectedConversationId);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConversationId);
    }, 2000);
  }, [selectedConversationId, startTyping, stopTyping]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File terlalu besar! Maksimal 10MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setFilePreviewUrl(URL.createObjectURL(file));
    setFileCaption(messageDraft);
    setShowFilePreview(true);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedConversation || !session?.user) return;

    setUploadingFile(true);
    setShowFilePreview(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const { url } = await uploadRes.json();

      const res = await fetch(
        `/api/chat/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: fileCaption.trim(),
            attachmentUrl: url,
            attachmentType: isImageFile(selectedFile.name) ? "image" : "file",
          }),
        }
      );

      if (res.ok) {
        const newMessage = await res.json();

        socket?.emit("message:send", {
          conversationId: selectedConversationId,
          senderId: session.user.id,
          recipientId: selectedConversation.participant.id,
          content: newMessage.content,
          messageId: newMessage.id,
          senderName: session.user.name,
          createdAt: newMessage.createdAt,
          attachmentUrl: url,
          attachmentType: newMessage.attachmentType,
        });

        setFileCaption("");
        setSelectedFile(null);
        setFilePreviewUrl(null);
        fetchConversations();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Gagal mengupload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCancelFilePreview = () => {
    setShowFilePreview(false);
    setSelectedFile(null);
    setFileCaption("");
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) return;

    try {
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingContent.trim() }),
      });

      if (res.ok) {
        const updatedMessage = await res.json();

        socket?.emit("message:edit", {
          messageId,
          conversationId: selectedConversationId,
          newContent: updatedMessage.content,
          editedAt: updatedMessage.editedAt,
        });

        setEditingMessageId(null);
        setEditingContent("");
      } else {
        const error = await res.json();
        alert(error.error || "Gagal mengedit pesan");
      }
    } catch (error) {
      console.error("Error editing message:", error);
      alert("Gagal mengedit pesan");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Hapus pesan ini?")) return;

    try {
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const deletedMessage = await res.json();

        socket?.emit("message:delete", {
          messageId,
          conversationId: selectedConversationId,
          deletedAt: deletedMessage.deletedAt,
        });
      } else {
        const error = await res.json();
        alert(error.error || "Gagal menghapus pesan");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Gagal menghapus pesan");
    }
  };

  const handleSendMessage = async () => {
    const content = messageDraft.trim();
    if (!content || !selectedConversation || !session?.user) return;

    if (selectedConversationId) {
      stopTyping(selectedConversationId);
    }

    try {
      const res = await fetch(
        `/api/chat/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (res.ok) {
        const newMessage = await res.json();
        
        socket?.emit("message:send", {
          conversationId: selectedConversationId,
          senderId: session.user.id,
          recipientId: selectedConversation.participant.id,
          content,
          messageId: newMessage.id,
          senderName: session.user.name,
          createdAt: newMessage.createdAt,
        });

        setMessageDraft("");
        fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const startConversation = async (instructorId: string) => {
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId }),
      });

      if (res.ok) {
        const conv = await res.json();
        await fetchConversations();
        setSelectedConversationId(conv.id);
        setShowNewChatModal(false);
        setIsMobileViewingChat(true);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  // --- RENDER ---

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loading text="Memuat chat..." />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#FDFBF7]"
    >
      <DashboardHeader />
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  Chat Instruktur
                </h1>
                <p className="text-slate-500 font-bold text-sm mt-1">
                  Berkonsultasi langsung dengan instruktur pilihan Anda
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <span className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-100 px-4 py-2 rounded-full border-2 border-emerald-200 shadow-sm transform rotate-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border border-white" />
                    Terhubung
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-xs font-black text-slate-500 bg-slate-100 px-4 py-2 rounded-full border-2 border-slate-200">
                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
                    Menghubungkan...
                  </span>
                )}
              </div>
            </div>

            {/* Chat Container - Kartun Style */}
            <div className="rounded-[2.5rem] border-4 border-slate-200 bg-white shadow-[0_8px_0_0_#cbd5e1] overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
              
              {/* Sidebar - Conversation List */}
              <div
                className={`${
                  isMobileViewingChat ? "hidden" : "flex"
                } lg:flex flex-col w-full lg:w-80 xl:w-96 border-r-4 border-slate-100 bg-slate-50/30`}
              >
                {/* Search & New Chat */}
                <div className="p-5 border-b-2 border-slate-100 space-y-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      placeholder="Cari percakapan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 bg-white border-2 border-slate-200 rounded-2xl h-12 focus:border-emerald-400 focus:shadow-[0_0_0_2px_#34d399] transition-all"
                    />
                  </div>
                  <Button
                    onClick={() => setShowNewChatModal(true)}
                    className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-black rounded-2xl h-12 border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 transition-all"
                  >
                    <UserPlus className="h-5 w-5 mr-2" strokeWidth={3} />
                    Chat Baru
                  </Button>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-2 border-slate-200">
                        <MessageCircle className="h-10 w-10 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold">Belum ada percakapan</p>
                      <p className="text-slate-400 text-xs mt-1 font-medium">
                        Mulai chat dengan instruktur
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setSelectedConversationId(conv.id);
                          setIsMobileViewingChat(true);
                        }}
                        className={`w-full flex items-start gap-3 p-4 rounded-3xl transition-all border-2 ${
                          selectedConversationId === conv.id
                            ? "bg-white border-emerald-400 shadow-[0_4px_0_0_#34d399] -translate-y-1 z-10"
                            : "bg-white border-transparent hover:border-slate-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-slate-100 shadow-sm">
                            <AvatarImage
                              src={conv.participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant.name}`}
                              alt={conv.participant.name || ""}
                            />
                            <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold">
                              {conv.participant.name?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {isParticipantOnline(conv.participant.id) && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-800 truncate text-sm">
                              {conv.participant.name}
                            </p>
                            {conv.lastMessage && (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {formatRelativeTime(conv.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-emerald-600 truncate uppercase tracking-wider mb-1">
                            {conv.participant.bidangKeahlian || "Instruktur"}
                          </p>
                          {conv.lastMessage && (
                            <p className="text-xs text-slate-500 truncate font-medium">
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="shrink-0 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md transform -rotate-12">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div
                className={`${
                  isMobileViewingChat ? "flex" : "hidden"
                } lg:flex flex-col flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat`}
              >
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center justify-between border-b-2 border-slate-100 px-6 py-4 bg-white/90 backdrop-blur-md z-20">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setIsMobileViewingChat(false)}
                          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 rounded-full"
                        >
                          <ArrowLeft className="h-5 w-5" strokeWidth={3} />
                        </button>
                        <div className="relative">
                          <Avatar className="h-11 w-11 border-2 border-white shadow-md ring-2 ring-slate-100">
                            <AvatarImage
                              src={selectedConversation.participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.participant.name}`}
                              alt={selectedConversation.participant.name || ""}
                            />
                            <AvatarFallback className="bg-emerald-100 text-emerald-600 font-black">
                              {selectedConversation.participant.name
                                ?.slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {isParticipantOnline(selectedConversation.participant.id) && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-bounce" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-lg leading-tight">
                            {selectedConversation.participant.name}
                          </p>
                          <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            {isParticipantOnline(selectedConversation.participant.id) ? (
                              <span className="text-emerald-500">Online</span>
                            ) : (
                              lastSeenMap.get(selectedConversation.participant.id) ? (
                                `Terakhir dilihat ${formatRelativeTime(lastSeenMap.get(selectedConversation.participant.id)!)}`
                              ) : (
                                "Offline"
                              )
                            )}
                            {currentTypingUsers.length > 0 && (
                              <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full ml-1 animate-pulse">
                                mengetik...
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-xl">
                        <MoreHorizontal className="h-6 w-6 text-slate-400" />
                      </Button>
                    </div>

                    {/* Messages Area */}
                    <div
                      ref={messagesRef}
                      className="flex-1 overflow-y-auto p-6 space-y-6"
                    >
                      {messagesLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loading />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                          <div className="w-24 h-24 bg-slate-100 rounded-3xl border-4 border-slate-200 border-dashed flex items-center justify-center mb-4 transform rotate-6">
                            <MessageCircle className="h-12 w-12 text-slate-300" />
                          </div>
                          <p className="text-slate-500 font-bold text-lg">Belum ada pesan</p>
                          <p className="text-slate-400 text-sm font-medium mt-1 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                            Sapa instrukturmu sekarang! 👋
                          </p>
                        </div>
                      ) : (
                        <>
                          {messages.map((message, index) => {
                            const isCurrentUser = message.senderId === session?.user?.id;
                            const showDate =
                              index === 0 ||
                              new Date(message.createdAt).toDateString() !==
                                new Date(messages[index - 1].createdAt).toDateString();

                            return (
                              <React.Fragment key={message.id}>
                                {showDate && (
                                  <div className="flex items-center justify-center my-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full border-2 border-slate-200">
                                      {formatMessageDate(message.createdAt)}
                                    </span>
                                  </div>
                                )}
                                <div
                                  ref={(el) => {
                                    if (el) {
                                      messageRefs.current.set(message.id, el);
                                    } else {
                                      messageRefs.current.delete(message.id);
                                    }
                                  }}
                                  data-message-id={message.id}
                                  className={`flex ${
                                    isCurrentUser ? "justify-end" : "justify-start"
                                  } group`}
                                >
                                  <div className={`flex items-end gap-3 max-w-[85%] sm:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Action Buttons */}
                                    {isCurrentUser && canEditOrDelete(message.createdAt) && !message.isDeleted && (
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 mb-2">
                                        <button
                                          className="p-1.5 bg-white border border-slate-200 rounded-full hover:bg-emerald-50 hover:text-emerald-500 shadow-sm transition-colors"
                                          onClick={() => {
                                            setEditingMessageId(message.id);
                                            setEditingContent(message.content);
                                          }}
                                        >
                                          <Edit2 className="h-3 w-3" />
                                        </button>
                                        <button
                                          className="p-1.5 bg-white border border-slate-200 rounded-full hover:bg-red-50 hover:text-red-500 shadow-sm transition-colors"
                                          onClick={() => handleDeleteMessage(message.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    )}
                                    
                                    {/* Message Bubble */}
                                    <div
                                      className={`relative px-5 py-4 shadow-sm border-2 ${
                                        isCurrentUser
                                          ? message.isDeleted
                                            ? "bg-slate-100 border-slate-300 text-slate-500 italic rounded-2xl"
                                            : "bg-gradient-to-br from-emerald-400 to-teal-400 border-emerald-600 text-white rounded-[2rem] rounded-tr-none shadow-[2px_4px_0_0_#059669]"
                                          : message.isDeleted
                                          ? "bg-slate-50 border-slate-200 text-slate-400 italic rounded-2xl"
                                          : "bg-white border-slate-200 text-slate-800 rounded-[2rem] rounded-tl-none shadow-[2px_4px_0_0_#e2e8f0]"
                                      }`}
                                    >
                                      {editingMessageId === message.id ? (
                                        <div className="space-y-3 min-w-[200px]">
                                          <Textarea
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            className="text-sm bg-white/20 border-2 border-white/30 text-white placeholder-white/50 focus:border-white focus:ring-0 rounded-xl"
                                            rows={2}
                                          />
                                          <div className="flex gap-2 justify-end">
                                            <button
                                              onClick={() => {
                                                setEditingMessageId(null);
                                                setEditingContent("");
                                              }}
                                              className="px-3 py-1 text-xs font-bold text-white/80 hover:bg-white/10 rounded-lg"
                                            >
                                              Batal
                                            </button>
                                            <button
                                              onClick={() => handleEditMessage(message.id)}
                                              className="px-3 py-1 text-xs font-bold bg-white text-emerald-600 rounded-lg shadow-sm hover:scale-105 transition-transform"
                                            >
                                              Simpan
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          {message.attachmentUrl && (
                                            <div className="mb-3 overflow-hidden rounded-xl border-2 border-black/5">
                                              {message.attachmentType === "image" ? (
                                                <img
                                                  src={message.attachmentUrl}
                                                  alt="Attachment"
                                                  className="max-w-full max-h-64 object-cover"
                                                />
                                              ) : (
                                                <a
                                                  href={message.attachmentUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className={`flex items-center gap-3 p-3 ${isCurrentUser ? 'bg-white/20 hover:bg-white/30' : 'bg-slate-50 hover:bg-slate-100'} transition-colors`}
                                                >
                                                  <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <File className="h-5 w-5 text-emerald-500" />
                                                  </div>
                                                  <span className="text-sm font-bold underline decoration-wavy">File attachment</span>
                                                </a>
                                              )}
                                            </div>
                                          )}
                                          {message.content && (
                                            <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
                                              {message.content}
                                            </p>
                                          )}
                                          <div className={`flex items-center gap-1.5 mt-2 justify-end opacity-80`}>
                                            <p className="text-[10px] font-bold">
                                              {formatTimeOnly(message.createdAt)}
                                              {message.isEdited && " • diedit"}
                                            </p>
                                            {isCurrentUser && (
                                              <span>
                                                {message.isRead ? (
                                                  <CheckCheck className="h-3.5 w-3.5" strokeWidth={3} />
                                                ) : (
                                                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                                )}
                                              </span>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          })}
                          
                          {/* Typing Indicator Bubble */}
                          {currentTypingUsers.length > 0 && (
                            <div className="flex justify-start">
                              <div className="bg-white border-2 border-slate-200 rounded-[2rem] rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                <div
                                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                />
                                <div
                                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Message Input - Floating Style */}
                    <div className="p-5 bg-white/80 backdrop-blur-sm relative z-20">
                      <div className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-lg p-2 flex items-end gap-2 focus-within:border-emerald-400 focus-within:shadow-[0_0_0_3px_rgba(52,211,153,0.2)] transition-all">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleFileSelect}
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        />
                        <button
                          type="button"
                          className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-all disabled:opacity-50"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFile}
                        >
                          {uploadingFile ? (
                            <div className="flex items-center justify-center">
                              <Loading size="sm" />
                            </div>
                          ) : (
                            <Paperclip className="h-6 w-6" strokeWidth={2.5} />
                          )}
                        </button>
                        
                        <Textarea
                          placeholder="Ketik pesan..."
                          value={messageDraft}
                          onChange={(e) => {
                            setMessageDraft(e.target.value);
                            handleTyping();
                          }}
                          onKeyDown={handleKeyDown}
                          className="flex-1 min-h-[48px] max-h-32 border-0 focus:ring-0 shadow-none resize-none py-3 text-slate-700 font-medium placeholder:text-slate-400 bg-transparent"
                          rows={1}
                        />
                        
                        <button
                          onClick={handleSendMessage}
                          disabled={!messageDraft.trim()}
                          className="p-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-full shadow-[0_4px_0_0_#059669] hover:-translate-y-1 hover:shadow-[0_6px_0_0_#059669] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                        >
                          <Send className="h-5 w-5" strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-6 border-4 border-emerald-100 transform rotate-3 shadow-lg">
                      <MessageCircle className="h-12 w-12 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">
                      Pilih Percakapan
                    </h2>
                    <p className="text-slate-500 font-medium max-w-sm">
                      Pilih percakapan di sebelah kiri atau mulai chat baru dengan
                      instruktur favoritmu!
                    </p>
                    <Button
                      onClick={() => setShowNewChatModal(true)}
                      className="mt-6 bg-emerald-400 hover:bg-emerald-500 text-white font-black rounded-2xl h-12 px-8 border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 transition-all"
                    >
                      <UserPlus className="h-5 w-5 mr-2" strokeWidth={3} />
                      Mulai Chat Baru
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* File Preview Modal */}
      {showFilePreview && selectedFile && filePreviewUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border-4 border-white shadow-2xl transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b-2 border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-800">
                Preview File
              </h3>
              <button
                onClick={handleCancelFilePreview}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
                disabled={uploadingFile}
              >
                <X className="h-6 w-6 text-slate-500" strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
              {isImageFile(selectedFile.name) ? (
                <div className="p-2 bg-white rounded-2xl shadow-md rotate-1">
                  <img
                    src={filePreviewUrl}
                    alt="Preview"
                    className="w-full h-auto rounded-xl border border-slate-200"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 bg-white border-4 border-slate-200 border-dashed rounded-3xl">
                  <File className="h-20 w-20 text-emerald-400 mb-4" />
                  <p className="text-slate-800 font-bold text-lg">{selectedFile.name}</p>
                  <p className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full mt-2">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t-2 border-slate-100 bg-white">
              <Textarea
                placeholder="Tambahkan caption (opsional)..."
                value={fileCaption}
                onChange={(e) => setFileCaption(e.target.value)}
                className="mb-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-400 focus:shadow-[0_0_0_2px_#34d399] resize-none"
                rows={2}
                disabled={uploadingFile}
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleSendFile}
                  disabled={uploadingFile}
                  className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-white font-black rounded-xl h-12 border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 transition-all"
                >
                  {uploadingFile ? (
                    <>
                      <Loading size="sm" />
                      <span className="ml-2">Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" strokeWidth={3} />
                      Kirim
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelFilePreview}
                  disabled={uploadingFile}
                  variant="outline"
                  className="rounded-xl h-12 font-bold border-2 border-slate-200 hover:bg-slate-50"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md max-h-[80vh] overflow-hidden border-4 border-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="p-5 border-b-2 border-slate-100 bg-emerald-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800">
                  Pilih Instruktur
                </h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"
                >
                  <X className="h-6 w-6 text-slate-500" strokeWidth={3} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-96 p-2">
              {instructors.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">
                  Tidak ada instruktur tersedia
                </div>
              ) : (
                instructors.map((instructor) => (
                  <button
                    key={instructor.id}
                    onClick={() => startConversation(instructor.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-all rounded-2xl group border-2 border-transparent hover:border-slate-100 mb-1"
                  >
                    <div className="relative">
                      <Avatar className="h-14 w-14 border-2 border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor.name}`}
                          alt={instructor.name || ""}
                        />
                        <AvatarFallback className="bg-amber-100 text-amber-600 font-black">
                          {instructor.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isParticipantOnline(instructor.id) && (
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">
                        {instructor.name}
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        {instructor.bidangKeahlian || "Instruktur"}
                      </p>
                    </div>
                    {instructor.hasConversation && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                        Chat Ada
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loading />
      </div>
    }>
      <ChatPage />
    </Suspense>
  );
}