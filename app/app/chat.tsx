import { User } from "@/common/model";
import { streamChat } from "@/src/services/chat";
import { Colors, getSpacing, getTypography } from "@/src/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  ReduceMotion,
} from "react-native-reanimated";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Onde está meu carro agora?",
  "Qual a velocidade máxima hoje?",
  "Liste meus veículos",
];

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const abortRef = useRef<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      const storageUsers = await AsyncStorage.getItem("users");
      if (storageUsers) {
        const parsed: User[] = JSON.parse(storageUsers);
        if (parsed.length > 0) {
          setUser(parsed[0]);
        }
      }
    }
    loadUser();
  }, []);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }, []);

  async function handleSend(message: string) {
    if (!message.trim() || isStreaming || !user) return;

    const userMsg: ChatMessage = { role: "user", content: message.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsStreaming(true);
    setError(null);
    abortRef.current = false;

    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      for await (const event of streamChat(message, user.accessToken)) {
        if (abortRef.current) break;

        if (event.event === "token") {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + event.data,
              };
            }
            return updated;
          });
          scrollToEnd();
        } else if (event.event === "tool_call") {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + `\n[Consultando ${event.data}...]`,
              };
            }
            return updated;
          });
        } else if (event.event === "error") {
          setError(event.data);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao conectar";
      setError(message);
    } finally {
      setIsStreaming(false);
      scrollToEnd();
    }
  }

  function handleSuggestion(suggestion: string) {
    handleSend(suggestion);
  }

  function handleRetry() {
    if (messages.length >= 2) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        setMessages((prev) => prev.slice(0, -1));
        handleSend(lastUserMsg.content);
        return;
      }
    }
    setError(null);
  }

  function renderMessage({ item, index }: { item: ChatMessage; index: number }) {
    const isUser = item.role === "user";
    return (
      <Animated.View
        entering={FadeInUp.duration(200)
          .delay(Math.min(index * 30, 150))
          .reduceMotion(ReduceMotion.System)}
        style={[
          styles.messageRow,
          isUser ? styles.userRow : styles.assistantRow,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
            {item.content}
            {isStreaming &&
              !isUser &&
              index === messages.length - 1 &&
              !item.content && (
                <Text style={styles.typingDots}>...</Text>
              )}
          </Text>
        </View>
      </Animated.View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat IA</Text>
          <View style={{ width: 20 }} />
        </View>
        <View style={styles.emptyContainer}>
          <FontAwesome6
            name="user-slash"
            size={40}
            color={Colors.textTertiary}
          />
          <Text style={styles.emptyTitle}>Nenhuma conta</Text>
          <Text style={styles.emptySubtitle}>
            Adicione uma conta para usar o chat
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat IA</Text>
        <View style={{ width: 20 }} />
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome6
            name="comments"
            size={40}
            color={Colors.primary}
          />
          <Text style={styles.emptyTitle}>
            Pergunte sobre seus veículos
          </Text>
          <Text style={styles.emptySubtitle}>
            Use linguagem natural para consultar dados dos seus veículos
          </Text>
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionChip}
                onPress={() => handleSuggestion(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToEnd}
        />
      )}

      {error && (
        <Animated.View
          entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
          style={styles.errorBar}
        >
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua pergunta..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={1000}
          editable={!isStreaming}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isStreaming) && styles.sendButtonDisabled,
          ]}
          onPress={() => handleSend(inputText)}
          disabled={!inputText.trim() || isStreaming}
        >
          <FontAwesome6
            name={isStreaming ? "spinner" : "paper-plane"}
            size={16}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getSpacing("px4"),
    paddingTop: getSpacing("px4"),
    paddingBottom: getSpacing("px3"),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: getTypography("h3"),
    fontWeight: getTypography("fontWeight").bold,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getSpacing("px6"),
    gap: getSpacing("px2"),
  },
  emptyTitle: {
    fontSize: getTypography("h3"),
    fontWeight: getTypography("fontWeight").semibold,
    color: Colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: getTypography("body"),
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: getSpacing("px4"),
  },
  suggestions: {
    gap: getSpacing("px2"),
    width: "100%",
  },
  suggestionChip: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: getSpacing("px3"),
    paddingHorizontal: getSpacing("px4"),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: getTypography("body"),
    color: Colors.primary,
    textAlign: "center",
  },
  messageList: {
    paddingHorizontal: getSpacing("px4"),
    paddingVertical: getSpacing("px3"),
  },
  messageRow: {
    marginBottom: getSpacing("px2"),
    flexDirection: "row",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  assistantRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingVertical: getSpacing("px2"),
    paddingHorizontal: getSpacing("px3"),
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.backgroundLight,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: getTypography("body"),
    color: Colors.text,
    lineHeight: 20,
  },
  userBubbleText: {
    color: "white",
  },
  typingDots: {
    color: Colors.textSecondary,
  },
  errorBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 68, 68, 0.15)",
    paddingVertical: getSpacing("px2"),
    paddingHorizontal: getSpacing("px4"),
    borderTopWidth: 1,
    borderTopColor: Colors.error,
  },
  errorText: {
    flex: 1,
    fontSize: getTypography("caption"),
    color: Colors.error,
  },
  retryButton: {
    marginLeft: getSpacing("px2"),
    paddingVertical: getSpacing("px1"),
    paddingHorizontal: getSpacing("px3"),
    borderRadius: 8,
    backgroundColor: Colors.error,
  },
  retryText: {
    fontSize: getTypography("caption"),
    color: "white",
    fontWeight: getTypography("fontWeight").semibold,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: getSpacing("px3"),
    paddingVertical: getSpacing("px2"),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    gap: getSpacing("px2"),
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: getSpacing("px4"),
    paddingVertical: getSpacing("px2"),
    fontSize: getTypography("body"),
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
