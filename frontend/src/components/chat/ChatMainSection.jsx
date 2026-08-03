import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { fetchUserProfile } from "../../api/authApi";
import { getProjectById, getProjectMembers } from "../../api/projectApi";
import { getProjectMessages } from "../../api/messageApi";
import useChat from "../../hooks/useChat";
import InviteProjectMemberModal from "../project/InviteProjectMemberModal";
import ProjectDetailsSidebar from "./ProjectDetailsSidebar";

const INITIAL_ATTACHMENTS = [
  {
    id: "att-1",
    name: "latency_report_shard_04.csv",
    size: "1.2 MB",
    date: "Today, 10:48 AM",
    icon: "csv",
    color: "text-tertiary bg-tertiary/10",
  },
  {
    id: "att-2",
    name: "error_log_screenshot.png",
    size: "4.8 MB",
    date: "Oct 24 • 11:20 AM",
    icon: "image",
    color: "text-primary bg-primary/10",
  },
  {
    id: "att-3",
    name: "nginx_ingress_ssl_err.log",
    size: "840 KB",
    date: "Today, 09:15 AM",
    icon: "terminal",
    color: "text-yellow-400 bg-yellow-400/10",
  },
  {
    id: "att-4",
    name: "architecture_diagram_v2.pdf",
    size: "3.5 MB",
    date: "Oct 20 • 04:15 PM",
    icon: "description",
    color: "text-cyan-400 bg-cyan-400/10",
  },
];

const formatTimestamp = (dateStr) => {
  if (!dateStr)
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const mapApiMessage = (msg, currentUserId) => {
  const senderName = msg.senderName || msg.user?.name || "Team Member";
  const avatar =
    msg.senderProfileImage ||
    msg.user?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      senderName
    )}&background=2563eb&color=fff`;

  return {
    id: msg.id,
    senderId: msg.senderId,
    senderName,
    senderAvatar: avatar,
    content: msg.message || msg.content || "",
    createdAt: msg.createdAt,
    timestamp: formatTimestamp(msg.createdAt),
    isMe: msg.senderId === currentUserId,
    edited: msg.edited || false,
  };
};

const deduplicateMessages = (msgList) => {
  const seen = new Set();
  return msgList.filter((m) => {
    if (!m.id) return true;
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
};

const ChatMainSection = ({ id, projectId }) => {
  // STOMP WebSocket Chat hook
  const {
    messages: socketMessages,
    sendMessage
  } = useChat(
    projectId,
    `/topic/projects/${projectId}`,
    `/app/projects/${projectId}/send`
  );

  // Core state
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Messages & Pagination state
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Tabs & Layout state
  const [activeTab, setActiveTab] = useState("messages"); // 'messages' | 'files' | 'pinned' | 'members'
  const [attachmentsList, setAttachmentsList] = useState(INITIAL_ATTACHMENTS);

  // Chat composer state
  const [inputText, setInputText] = useState("");
  const [attachedFileDraft, setAttachedFileDraft] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Sync incoming real-time STOMP WebSocket messages
  useEffect(() => {
    if (socketMessages && socketMessages.length > 0) {
      const latestMsg = socketMessages[socketMessages.length - 1];
      if (latestMsg) {
        const formatted = mapApiMessage(latestMsg, user?.id);
        setMessages((prev) => {
          if (prev.some((m) => m.id === formatted.id)) {
            return prev;
          }
          return [...prev, formatted];
        });
      }
    }
  }, [socketMessages, user?.id]);

  // Load project, user profile data & initial messages (Page 0)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let currentUserId = null;

        // 1. Fetch current user
        const userRes = await fetchUserProfile();
        if (userRes?.data) {
          setUser(userRes.data);
          currentUserId = userRes.data.id;
        }

        // 2. Fetch project details
        if (projectId) {
          const projectRes = await getProjectById(projectId);
          if (projectRes?.data) {
            setProject(projectRes.data);
          }
        }

        // 3. Fetch project members
        if (projectId) {
          try {
            const membersRes = await getProjectMembers(projectId);
            if (membersRes?.data && membersRes.data.length > 0) {
              const mapped = membersRes.data.map((m, idx) => ({
                id: m.user?.id || idx + 10,
                name: m.user?.name || `Member ${idx + 1}`,
                role: m.user?.email || "Project Collaborator",
                projectRole: m.role || "CONTRIBUTOR",
                status: idx % 2 === 0 ? "ONLINE" : "BUSY",
                avatar: m.user?.profileImage,
              }));
              setMembers(mapped);
            }
          } catch (err) {
            console.error("Failed to load project members:", err);
          }
        }

        // 4. Fetch initial project messages (Page 0)
        if (projectId) {
          try {
            const messagesRes = await getProjectMessages(projectId, 0, 10);
            const data = messagesRes?.data || messagesRes;
            if (data && data.content) {
              // Backend content array has newest messages first [newest, ..., oldest]
              // Reverse to chronological order [oldest, ..., newest]
              const chronological = [...data.content].reverse();
              const mapped = chronological.map((msg) =>
                mapApiMessage(msg, currentUserId)
              );
              setMessages(mapped);
              setPage(0);
              setIsLastPage(data.last ?? (data.totalPages <= 1));
            }
          } catch (err) {
            console.error("Failed to load initial project messages:", err);
          }
        }
      } catch (error) {
        console.error("Error initializing Project Chat page:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  // Infinite Scroll: Load older messages when scrolling near top
  const loadMoreMessages = async () => {
    if (loadingMore || isLastPage || !projectId) return;
    setLoadingMore(true);

    const container = chatContainerRef.current;
    const previousScrollHeight = container ? container.scrollHeight : 0;

    try {
      const nextPage = page + 1;
      const res = await getProjectMessages(projectId, nextPage, 10);
      const data = res?.data || res;

      if (data && data.content && data.content.length > 0) {
        // Reverse content array so oldest messages appear first in the chunk
        const chronological = [...data.content].reverse();
        const mappedOlder = chronological.map((msg) =>
          mapApiMessage(msg, user?.id)
        );

        setMessages((prev) => deduplicateMessages([...mappedOlder, ...prev]));
        setPage(nextPage);
        setIsLastPage(data.last ?? (nextPage >= (data.totalPages || 1) - 1));

        // Preserve scroll position so UI doesn't jump abruptly
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop =
              container.scrollHeight - previousScrollHeight;
          }
        });
      } else {
        setIsLastPage(true);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    // Trigger loadMore when scrolled within 30px of top
    if (container.scrollTop <= 30 && !isLastPage && !loadingMore) {
      loadMoreMessages();
    }
  };

  // Scroll to bottom on initial load / new messages
  useEffect(() => {
    if (activeTab === "messages" && page === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab, page]);

  // Helper initials generator
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Send message
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedFileDraft) return;

    const textToSend = inputText.trim();
    if (textToSend) {
      const success = sendMessage(textToSend);
      if (success === false) {
        toast.error("Unable to send message via WebSocket. Reconnecting...");
        return;
      }
    }

    setInputText("");
    setAttachedFileDraft(null);
    setShowEmojiPicker(false);
  };

  // Mock file attachment selection
  const handleAttachMockFile = (fileType) => {
    if (fileType === "csv") {
      setAttachedFileDraft({
        name: `query_performance_${Math.floor(Math.random() * 100)}.csv`,
        size: "1.4 MB",
        type: "CSV Data File",
        icon: "description",
      });
    } else if (fileType === "image") {
      setAttachedFileDraft({
        name: `dashboard_error_trace_${Math.floor(Math.random() * 100)}.png`,
        size: "2.8 MB",
        type: "PNG Image",
        icon: "image",
      });
    } else {
      setAttachedFileDraft({
        name: `api_spec_patch_${Math.floor(Math.random() * 100)}.json`,
        size: "420 KB",
        type: "JSON Document",
        icon: "code",
      });
    }
    toast.success("File attached!");
  };

  // Filter messages by search query
  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery.trim()) return true;
    return (
      msg.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter pinned messages
  const pinnedMessages = messages.filter((m) => m.isPinned);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-background">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-on-surface-variant animate-pulse">
            Loading Project Chat Hub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 flex flex-col h-screen min-w-0 bg-surface overflow-hidden">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-gutter h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm shrink-0">
          <div className="flex items-center gap-4 md:gap-6 min-w-0">
            <Link
              to={`/workspaces/${id}/projects/${projectId}`}
              className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-surface-container-high"
              title="Back to Project Overview"
            >
              <span className="material-symbols-outlined text-[22px]">
                arrow_back
              </span>
            </Link>
            <div className="flex flex-col truncate">
              <span className="text-label-sm font-label-sm text-outline uppercase tracking-wider truncate">
                {project?.name || "Enterprise CRM Integration"}
              </span>
              <h2 className="text-headline-md font-headline-md font-extrabold text-on-surface text-base md:text-xl truncate">
                Project Chat & Collaboration
              </h2>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Member Avatars Stack */}
            <div className="hidden sm:flex items-center -space-x-2 mr-1">
              {members.slice(0, 3).map((m, idx) =>
                m.avatar ? (
                  <img
                    key={idx}
                    className="w-8 h-8 rounded-full border-2 border-surface-container object-cover"
                    src={m.avatar}
                    alt={m.name}
                    title={m.name}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        m.name
                      )}&background=2563eb&color=fff`;
                    }}
                  />
                ) : (
                  <span
                    key={idx}
                    className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface"
                  >
                    {getInitials(m.name)}
                  </span>
                )
              )}
              {members.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface">
                  +{members.length - 3}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3 md:px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg font-medium text-xs md:text-sm click-active transition-all hover:bg-secondary-container/80 cursor-pointer"
            >
              Invite
            </button>
            <div className="h-6 w-px bg-outline-variant hidden sm:block"></div>

            <button
              onClick={() => setIsRightSidebarOpen((prev) => !prev)}
              className={`p-2 rounded-full transition-colors hidden xl:block ${
                isRightSidebarOpen
                  ? "text-primary bg-surface-container-highest"
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              }`}
              title="Toggle Ticket Details Sidebar"
            >
              <span className="material-symbols-outlined">dock_to_left</span>
            </button>

            <button
              onClick={() => toast("Notifications enabled for this project.")}
              className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors"
              title="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        {/* 3-Column Work Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Center Column: Chat Content */}
          <section className="flex-1 flex flex-col min-w-0 bg-surface">
            {activeTab === "messages" && (
              <>
                {/* Conversation Thread with Infinite Scroll */}
                <div
                  ref={chatContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-gutter space-y-6 custom-scrollbar"
                >
                  {/* Top Infinite Scroll Loader */}
                  {loadingMore && (
                    <div className="flex items-center justify-center py-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-outline ml-2">
                        Loading earlier messages...
                      </span>
                    </div>
                  )}

                  {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl text-outline mb-2">
                        forum
                      </span>
                      <p className="font-medium text-sm">No messages found</p>
                      <p className="text-xs text-outline mt-1">
                        {searchQuery
                          ? `No matches for "${searchQuery}"`
                          : "Be the first to start the conversation!"}
                      </p>
                    </div>
                  ) : (
                    filteredMessages.map((msg) => {
                      if (msg.type === "system") {
                        return (
                          <div
                            key={msg.id || `sys-${Math.random()}`}
                            className="flex items-center justify-center py-1"
                          >
                            <div className="flex items-center gap-2 px-4 py-1 bg-surface-container rounded-full border border-outline-variant/30 text-xs text-on-surface-variant font-medium">
                              <span className="material-symbols-outlined text-[16px] text-primary">
                                info
                              </span>
                              <span>{msg.content}</span>
                              <span className="text-[10px] text-outline ml-1">
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      const isSelf = msg.senderId === user?.id || msg.isMe;

                      return (
                        <div
                          key={msg.id || `msg-${Math.random()}`}
                          className={`flex gap-3.5 max-w-3xl group ${
                            isSelf ? "flex-row-reverse ml-auto" : ""
                          }`}
                        >
                          <img
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-outline-variant"
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                msg.senderName
                              )}&background=2563eb&color=fff`;
                            }}
                          />
                          <div
                            className={`space-y-1.5 ${
                              isSelf ? "flex flex-col items-end" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {!isSelf && (
                                <span className="font-bold text-sm text-on-surface">
                                  {msg.senderName}
                                </span>
                              )}
                              <span className="text-[11px] text-outline font-label-sm">
                                {msg.timestamp}
                              </span>
                              {isSelf && (
                                <span className="font-bold text-sm text-on-surface">
                                  {msg.senderName}
                                </span>
                              )}
                              {msg.isPinned && (
                                <span
                                  className="material-symbols-outlined text-[14px] text-tertiary"
                                  title="Pinned message"
                                >
                                  push_pin
                                </span>
                              )}
                            </div>

                            {/* Message Bubble: Right-aligned for logged in user, Left-aligned for others */}
                            <div
                              className={`p-3.5 rounded-2xl border text-body-md transition-all ${
                                isSelf
                                  ? "bg-primary-container text-on-primary-container border-primary-container/40 rounded-tr-none shadow-md"
                                  : "bg-surface-container-high text-on-surface border-outline-variant/60 rounded-tl-none"
                              }`}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>

                            {/* Hover Quick Action Bar */}
                            <div
                              className={`flex items-center gap-1.5 pt-0.5 ${
                                isSelf ? "justify-end" : ""
                              }`}
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-surface-container-high rounded-lg p-0.5 border border-outline-variant/60">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.content);
                                    toast.success("Copied to clipboard");
                                  }}
                                  className="p-1 text-on-surface-variant hover:text-on-surface rounded cursor-pointer"
                                  title="Copy text"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    content_copy
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Composer */}
                <div className="p-gutter pt-0 shrink-0">
                  {attachedFileDraft && (
                    <div className="mb-2 px-3 py-1.5 bg-surface-container-high rounded-lg border border-outline-variant flex items-center justify-between max-w-md animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          {attachedFileDraft.icon}
                        </span>
                        <span className="text-xs font-medium text-on-surface truncate max-w-[200px]">
                          {attachedFileDraft.name}
                        </span>
                        <span className="text-[10px] text-outline">
                          ({attachedFileDraft.size})
                        </span>
                      </div>
                      <button
                        onClick={() => setAttachedFileDraft(null)}
                        className="text-outline hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          close
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Emoji Quick Toolbar Overlay */}
                  {showEmojiPicker && (
                    <div className="mb-2 p-2 bg-surface-container-high border border-outline-variant rounded-xl flex gap-2 overflow-x-auto custom-scrollbar animate-in zoom-in-95 duration-150">
                      {[
                        "👍",
                        "❤️",
                        "🔥",
                        "🚀",
                        "👀",
                        "💡",
                        "✅",
                        "🎉",
                        "🙌",
                        "💯",
                      ].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setInputText((prev) => prev + " " + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="text-lg hover:bg-surface-container p-1.5 rounded-lg transition-transform hover:scale-125 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={handleSendMessage}
                    className="bg-surface-container rounded-xl border border-outline-variant shadow-lg p-2 focus-within:ring-2 ring-primary/30 transition-all"
                  >
                    <textarea
                      className="w-full bg-transparent border-none focus:ring-0 text-body-md p-2 placeholder:text-outline text-on-surface resize-none font-body-md"
                      placeholder={`Message ${
                        project?.name || "project team"
                      }... (Enter to send)`}
                      rows={2}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />

                    <div className="flex items-center justify-between px-2 py-1 border-t border-outline-variant/30 pt-2">
                      <div className="flex items-center gap-1">
                        <div className="relative group/attbtn">
                          <button
                            type="button"
                            onClick={() => handleAttachMockFile("csv")}
                            className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer"
                            title="Attach File (CSV / Screenshot / Logs)"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              add_circle
                            </span>
                          </button>
                          {/* Quick attach popup menu */}
                          <div className="hidden group-hover/attbtn:flex absolute bottom-full left-0 mb-2 bg-surface-container-high border border-outline-variant rounded-lg shadow-xl p-1 flex-col gap-1 min-w-[140px] z-50">
                            <button
                              type="button"
                              onClick={() => handleAttachMockFile("csv")}
                              className="px-2 py-1 text-left text-xs hover:bg-surface-container rounded text-on-surface flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[16px] text-tertiary">
                                description
                              </span>
                              <span>Attach CSV Report</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttachMockFile("image")}
                              className="px-2 py-1 text-left text-xs hover:bg-surface-container rounded text-on-surface flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[16px] text-primary">
                                image
                              </span>
                              <span>Attach Screenshot</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttachMockFile("json")}
                              className="px-2 py-1 text-left text-xs hover:bg-surface-container rounded text-on-surface flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[16px] text-yellow-400">
                                code
                              </span>
                              <span>Attach Code Log</span>
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setInputText((prev) => prev + " **bold text**")
                          }
                          className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer"
                          title="Format Bold"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            format_bold
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setInputText((prev) => prev + " @Marcus ")
                          }
                          className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer"
                          title="Mention Team Member"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            alternate_email
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker((prev) => !prev)}
                          className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer"
                          title="Add Emoji"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            sentiment_satisfied
                          </span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={!inputText.trim() && !attachedFileDraft}
                        className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold flex items-center gap-2 click-active transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span className="text-xs md:text-sm">Send</span>
                        <span className="material-symbols-outlined text-[18px]">
                          send
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {/* View Tab: Files */}
            {activeTab === "files" && (
              <div className="flex-1 p-gutter overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-headline-md font-bold text-on-surface">
                      Shared Project Files
                    </h3>
                    <p className="text-xs text-outline mt-1">
                      All documentation, logs, and screenshots attached in this
                      chat.
                    </p>
                  </div>
                  <button
                    onClick={() => handleAttachMockFile("csv")}
                    className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-lg text-xs font-bold flex items-center gap-1.5 hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      upload_file
                    </span>
                    <span>Upload File</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attachmentsList.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/60 hover:border-primary transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${file.color}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {file.icon}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate group-hover:text-primary">
                            {file.name}
                          </p>
                          <p className="text-xs text-outline">
                            {file.size} • {file.date}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          toast.success(`Downloading ${file.name}...`)
                        }
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                        title="Download file"
                      >
                        <span className="material-symbols-outlined">
                          download
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Tab: Pinned */}
            {activeTab === "pinned" && (
              <div className="flex-1 p-gutter overflow-y-auto custom-scrollbar space-y-4">
                <div>
                  <h3 className="text-headline-md font-bold text-on-surface">
                    Pinned Messages & Announcements
                  </h3>
                  <p className="text-xs text-outline mt-1">
                    Important notices and updates saved by administrators.
                  </p>
                </div>
                {pinnedMessages.length === 0 ? (
                  <p className="text-xs text-outline">
                    No pinned messages yet.
                  </p>
                ) : (
                  pinnedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 bg-surface-container-high rounded-xl border border-tertiary-container/30 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-tertiary text-[18px]">
                            push_pin
                          </span>
                          <span className="text-xs font-bold text-on-surface">
                            {msg.senderName}
                          </span>
                          <span className="text-[10px] text-outline">
                            • {msg.timestamp}
                          </span>
                        </div>
                      </div>
                      <p className="text-body-md text-on-surface">
                        {msg.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* View Tab: Members */}
            {activeTab === "members" && (
              <div className="flex-1 p-gutter overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-headline-md font-bold text-on-surface">
                      Project Team Members
                    </h3>
                    <p className="text-xs text-outline mt-1">
                      Active collaborators on {project?.name || "this project"}.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      person_add
                    </span>
                    <span>Invite Member</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            className="w-10 h-10 rounded-lg object-cover"
                            src={m.avatar}
                            alt={m.name}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                m.name
                              )}&background=2563eb&color=fff`;
                            }}
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-surface-container-high ${
                              m.status === "ONLINE"
                                ? "bg-emerald-500"
                                : m.status === "BUSY"
                                ? "bg-amber-500"
                                : "bg-slate-500"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            {m.name}
                          </p>
                          <p className="text-xs text-outline">{m.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant text-on-surface-variant">
                        {m.projectRole === "PROJECT_ADMIN"
                          ? "Admin"
                          : "Contributor"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Right Sidebar: Project Details Component */}
          {isRightSidebarOpen && <ProjectDetailsSidebar project={project} />}
        </div>
      </main>

      {/* Invite Member Modal */}
      <InviteProjectMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={projectId}
        projectName={project?.name}
        onSuccess={async () => {
          toast.success("Member invited to project chat!");
        }}
      />
    </>
  );
};

export default ChatMainSection;
