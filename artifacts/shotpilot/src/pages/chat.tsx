import { Navbar } from "@/components/navbar";
import { useState, useRef, useEffect } from "react";
import { 
  useListOpenaiConversations, 
  useCreateOpenaiConversation, 
  useGetOpenaiConversation,
  useDeleteOpenaiConversation,
  getListOpenaiConversationsQueryKey,
  getGetOpenaiConversationQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, Loader2, Plus, Trash2, Menu, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Chat() {
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedMessage, setStreamedMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: isLoadingConvs } = useListOpenaiConversations();
  
  const { data: activeConversation, isLoading: isLoadingMessages } = useGetOpenaiConversation(
    activeConvId || 0,
    { query: { enabled: !!activeConvId, queryKey: getGetOpenaiConversationQueryKey(activeConvId || 0) } }
  );

  const createConv = useCreateOpenaiConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setActiveConvId(data.id);
        if (window.innerWidth < 768) setSidebarOpen(false);
      }
    }
  });

  const deleteConv = useDeleteOpenaiConversation({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        if (activeConvId === variables.id) {
          setActiveConvId(null);
        }
      }
    }
  });

  const handleCreateNew = () => {
    createConv.mutate({ data: { title: "New Conversation" } });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    // If no conversation exists, create one first
    let currentId = activeConvId;
    if (!currentId) {
      try {
        const newConv = await createConv.mutateAsync({ data: { title: input.substring(0, 30) } });
        currentId = newConv.id;
        setActiveConvId(currentId);
      } catch (e) {
        console.error("Failed to create conversation");
        return;
      }
    }

    const messageText = input;
    setInput("");
    setIsStreaming(true);
    setStreamedMessage("");

    // Optimistically update UI
    if (activeConversation) {
      const optimisticMsg = { 
        id: Date.now(), 
        conversationId: currentId, 
        role: "user", 
        content: messageText, 
        createdAt: new Date().toISOString() 
      };
      
      queryClient.setQueryData(getGetOpenaiConversationQueryKey(currentId), {
        ...activeConversation,
        messages: [...activeConversation.messages, optimisticMsg]
      });
    }

    try {
      const res = await fetch(`/api/openai/conversations/${currentId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText })
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.content) {
                assistantMsg += data.content;
                setStreamedMessage(assistantMsg);
              }
            } catch (e) {
              // Ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch (e) {
      console.error("Streaming failed:", e);
    } finally {
      setIsStreaming(false);
      setStreamedMessage("");
      // Refresh messages to get the real saved messages
      queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(currentId!) });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, streamedMessage]);

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Toggle */}
        <Button 
          variant="outline" 
          size="icon" 
          className="md:hidden absolute bottom-20 right-4 z-50 rounded-full shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Sidebar */}
        <div className={cn(
          "w-72 border-r border-border bg-muted/10 flex flex-col absolute md:relative z-40 h-full transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-4 border-b border-border flex justify-between items-center bg-background">
            <h2 className="font-semibold tracking-tight">Conversations</h2>
            <Button size="icon" variant="ghost" onClick={handleCreateNew} disabled={createConv.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background md:bg-transparent">
            {isLoadingConvs ? (
              <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : conversations?.length === 0 ? (
              <div className="text-center p-4 text-sm text-muted-foreground">No conversations yet</div>
            ) : (
              conversations?.map((conv) => (
                <div 
                  key={conv.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group",
                    activeConvId === conv.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                  )}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="text-sm truncate font-medium">{conv.title || "New Chat"}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConv.mutate({ id: conv.id });
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background relative w-full">
          {!activeConvId && !isLoadingMessages ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Camera className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Pro Camera Assistant</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Ask questions about gear, lighting setups, cinematic techniques, or troubleshooting your equipment.
              </p>
              <Button onClick={handleCreateNew} size="lg">Start a Conversation</Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {isLoadingMessages ? (
                  <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : (
                  <>
                    {activeConversation?.messages?.map((msg) => (
                      <div key={msg.id} className={cn(
                        "flex w-full",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}>
                        <div className={cn(
                          "max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5",
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground rounded-tr-sm" 
                            : "bg-muted/50 border border-border/50 text-foreground rounded-tl-sm"
                        )}>
                          <div className="text-[0.95rem] leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isStreaming && streamedMessage && (
                      <div className="flex w-full justify-start">
                        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 bg-muted/50 border border-border/50 text-foreground rounded-tl-sm">
                          <div className="text-[0.95rem] leading-relaxed whitespace-pre-wrap">
                            {streamedMessage}<span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle"></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                  </>
                )}
              </div>
              
              <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about lighting, framing, settings..."
                    className="pr-12 py-6 rounded-full bg-muted/50 border-muted focus-visible:ring-primary/30"
                    disabled={isStreaming}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="absolute right-1.5 h-10 w-10 rounded-full"
                    disabled={!input.trim() || isStreaming}
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
