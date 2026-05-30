import { User } from "@/common/model";
import { streamChat } from "@/src/services/chat";
import { Colors, getSpacing, getTypography } from "@/src/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  ReduceMotion,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const TOOL_LABELS: Record<string, string> = {
  list_vehicles: "Listando veículos",
  get_vehicle_current_location: "Buscando localização atual",
  get_vehicle_history: "Buscando histórico do veículo",
  reverse_geocode: "Obtendo endereço",
  get_vehicle_speed: "Verificando velocidade",
};

const SUGGESTIONS = [
  { icon: "location-dot", text: "Onde está meu carro agora?" },
  { icon: "gauge-high", text: "Qual a velocidade máxima hoje?" },
  { icon: "car", text: "Liste meus veículos" },
];

function TypingIndicator() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const anim = (sv: SharedValue<number>, delay: number) => {
      setTimeout(() => {
        sv.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        );
      }, delay);
    };
    anim(dot1, 0);
    anim(dot2, 200);
    anim(dot3, 400);
  }, [dot1, dot2, dot3]);

  const style1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const style2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const style3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.typingRow}>
      <Animated.View style={[styles.typingDot, { backgroundColor: Colors.primaryLight }, style1]} />
      <Animated.View style={[styles.typingDot, { backgroundColor: Colors.primaryLight }, style2]} />
      <Animated.View style={[styles.typingDot, { backgroundColor: Colors.primaryLight }, style3]} />
    </View>
  );
}

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/;

  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const match = remaining.match(regex);
    if (!match) {
      if (remaining) nodes.push(remaining);
      break;
    }

    const before = remaining.slice(0, match.index!);
    if (before) nodes.push(before);

    const full = match[0];
    const boldItalic = match[1];
    const bold = match[2];
    const italic = match[3];
    const code = match[4];

    const k = key++;

    if (code) {
      nodes.push(
        <Text key={`c-${k}`} style={styles.codeText}>{code}</Text>,
      );
    } else if (boldItalic) {
      nodes.push(
        <Text key={`bi-${k}`} style={{ fontWeight: "800", fontStyle: "italic" }}>{boldItalic}</Text>,
      );
    } else if (bold) {
      nodes.push(
        <Text key={`b-${k}`} style={{ fontWeight: "800" }}>{bold}</Text>,
      );
    } else if (italic) {
      nodes.push(
        <Text key={`i-${k}`} style={{ fontStyle: "italic" }}>{italic}</Text>,
      );
    }

    remaining = remaining.slice(match.index! + full.length);
  }

  return nodes;
}

function MarkdownText({ content, style }: { content: string; style?: any }) {
  if (!content) return null;

  const nodes: React.ReactNode[] = [];
  const lines = content.split("\n");

  lines.forEach((line, i) => {
    if (i > 0) nodes.push("\n");

    if (line.startsWith("### ")) {
      nodes.push(
        <Text key={`h3-${i}`} style={{ fontWeight: "800", fontSize: 16 }}>{line.slice(4)}</Text>,
      );
      return;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <Text key={`h2-${i}`} style={{ fontWeight: "800", fontSize: 17 }}>{line.slice(3)}</Text>,
      );
      return;
    }

    if (line.startsWith("# ")) {
      nodes.push(
        <Text key={`h1-${i}`} style={{ fontWeight: "800", fontSize: 18 }}>{line.slice(2)}</Text>,
      );
      return;
    }

    if (/^(\d+)\.\s/.test(line)) {
      const [, num, rest] = line.match(/^(\d+)\.\s(.+)/)!;
      nodes.push(
        <Text key={`l-${i}`}>{`  ${num}. `}{parseInline(rest)}</Text>,
      );
      return;
    }

    if (/^[-*]\s/.test(line)) {
      nodes.push(
        <Text key={`l-${i}`}>{"  • "}{parseInline(line.slice(2))}</Text>,
      );
      return;
    }

    if (line.startsWith("⏳ ") && line.endsWith("...")) {
      nodes.push(
        <Text key={`tool-${i}`} style={styles.toolCallText}>{line}</Text>,
      );
      return;
    }

    const inline = parseInline(line);
    if (inline.length > 0) {
      nodes.push(<Text key={`l-${i}`}>{inline}</Text>);
    }
  });

  return <Text style={style}>{nodes}</Text>;
}

export default function ChatScreen() {
  const router = useRouter();
  const { imei } = useLocalSearchParams<{ imei: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const abortRef = useRef<boolean>(false);
  const sendIconRotation = useSharedValue(0);

  useEffect(() => {
    async function loadUser() {
      const storageUsers = await AsyncStorage.getItem("users");
      if (storageUsers) {
        const parsed: User[] = JSON.parse(storageUsers);
        const matchedUser = imei
          ? parsed.find((u) => u.vehicles.some((v) => v.imei === imei))
          : undefined;
        setUser(matchedUser ?? parsed[0] ?? null);
      }
    }
    loadUser();
  }, [imei]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", scrollToEnd);
    return () => show.remove();
  }, [scrollToEnd]);

  useEffect(() => {
    if (isStreaming) {
      sendIconRotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
      );
    } else {
      sendIconRotation.value = withTiming(0, { duration: 200 });
    }
  }, [isStreaming, sendIconRotation]);

  const sendIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sendIconRotation.value}deg` }],
  }));

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
          const clean = event.data
            .replace(/<\/?assistant>/g, "")
            .replace(/<\/?s>/g, "")
            .replace(/<\/?system>/g, "")
            .replace(/<\/?tool>/g, "");
          if (!clean) continue;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + clean,
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
                content: last.content + `⏳ ${TOOL_LABELS[event.data] || `Consultando ${event.data}`}...\n\n`,
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
        entering={FadeInUp.duration(250)
          .delay(Math.min(index * 40, 200))
          .reduceMotion(ReduceMotion.System)}
        style={[
          styles.messageRow,
          isUser ? styles.userRow : styles.assistantRow,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <FontAwesome6 name="robot" size={12} color={Colors.primaryLight} />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {isUser ? (
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.userBubbleGradient}
            >
              <Text style={[styles.bubbleText, styles.userBubbleText]}>
                {item.content}
              </Text>
            </LinearGradient>
          ) : (
            <>
              <View style={styles.assistantAccent} />
              <View style={styles.assistantContent}>
                <MarkdownText
                  content={item.content}
                  style={styles.bubbleText}
                />
                {isStreaming &&
                  index === messages.length - 1 &&
                  !item.content && <TypingIndicator />}
              </View>
            </>
          )}
        </View>
      </Animated.View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome6 name="arrow-left" size={18} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Rastro AI</Text>
            <Text style={styles.headerSubtitle}>Assistente veicular</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statusDot} />
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.emptyIconBg}
            >
              <FontAwesome6 name="user-slash" size={32} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>Nenhuma conta ativa</Text>
          <Text style={styles.emptySubtitle}>
            Adicione uma conta para conversar com seu veículo
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="arrow-left" size={18} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Rastro AI</Text>
          <Text style={styles.headerSubtitle}>Assistente veicular</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusDot, isStreaming && styles.statusDotActive]} />
        </View>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View
            entering={FadeInUp.duration(400).reduceMotion(ReduceMotion.System)}
            style={styles.emptyIconContainer}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.emptyIconBg}
            >
              <FontAwesome6 name="comments" size={32} color="white" />
            </LinearGradient>
          </Animated.View>
          <Animated.Text
            entering={FadeInUp.duration(400)
              .delay(100)
              .reduceMotion(ReduceMotion.System)}
            style={styles.emptyTitle}
          >
            Pergunte sobre seu veículo
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.duration(400)
              .delay(150)
              .reduceMotion(ReduceMotion.System)}
            style={styles.emptySubtitle}
          >
            Use linguagem natural para consultar dados em tempo real
          </Animated.Text>
          <Animated.View
            entering={FadeInUp.duration(400)
              .delay(200)
              .reduceMotion(ReduceMotion.System)}
            style={styles.suggestions}
          >
            {SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.text}
                style={styles.suggestionChip}
                onPress={() => handleSuggestion(suggestion.text)}
                activeOpacity={0.7}
              >
                <FontAwesome6
                  name={suggestion.icon}
                  size={14}
                  color={Colors.primaryLight}
                />
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToEnd}
          showsVerticalScrollIndicator={false}
        />
      )}

      {error && (
        <Animated.View
          entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
          style={styles.errorBar}
        >
          <View style={styles.errorIcon}>
            <FontAwesome6 name="triangle-exclamation" size={14} color={Colors.error} />
          </View>
          <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Tentar</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.inputWrapper}>
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
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                inputText.trim() && !isStreaming
                  ? [Colors.primary, Colors.primaryDark]
                  : ["#ffffff20", "#ffffff10"]
              }
              style={styles.sendGradient}
            >
              {isStreaming ? (
                <Animated.View style={sendIconAnimatedStyle}>
                  <FontAwesome6 name="spinner" size={16} color="white" />
                </Animated.View>
              ) : (
                <FontAwesome6 name="arrow-up" size={16} color="white" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: getSpacing("px4"),
    paddingTop: getSpacing("px4"),
    paddingBottom: getSpacing("px3"),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: getSpacing("px3"),
  },
  headerTitle: {
    fontSize: getTypography("h4"),
    fontWeight: getTypography("fontWeight").bold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: getTypography("caption"),
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 1,
  },
  headerRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success + "50",
  },
  statusDotActive: {
    backgroundColor: Colors.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getSpacing("px8"),
    gap: getSpacing("px2"),
  },
  emptyIconContainer: {
    marginBottom: getSpacing("px3"),
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: getTypography("h3"),
    fontWeight: getTypography("fontWeight").bold,
    color: Colors.text,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: getTypography("body"),
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: getSpacing("px3"),
  },
  suggestions: {
    gap: getSpacing("px2"),
    width: "100%",
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px3"),
    backgroundColor: Colors.backgroundLight,
    borderRadius: 14,
    paddingVertical: getSpacing("px3"),
    paddingHorizontal: getSpacing("px4"),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: getTypography("body"),
    color: Colors.text,
    flex: 1,
  },
  messageList: {
    paddingHorizontal: getSpacing("px4"),
    paddingVertical: getSpacing("px3"),
    paddingBottom: getSpacing("px4"),
  },
  messageRow: {
    marginBottom: getSpacing("px3"),
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  assistantRow: {
    justifyContent: "flex-start",
    gap: getSpacing("px2"),
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: "78%",
  },
  userBubble: {
    borderBottomRightRadius: 2,
    overflow: "hidden",
  },
  userBubbleGradient: {
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingVertical: getSpacing("px3"),
    paddingHorizontal: getSpacing("px4"),
  },
  assistantBubble: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundLight,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assistantAccent: {
    width: 3,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 4,
  },
  assistantContent: {
    flex: 1,
    paddingVertical: getSpacing("px3"),
    paddingHorizontal: getSpacing("px3"),
  },
  bubbleText: {
    fontSize: getTypography("body"),
    color: Colors.text,
    lineHeight: 22,
  },
  userBubbleText: {
    color: "white",
  },
  toolCallText: {
    fontSize: getTypography("body"),
    color: Colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 22,
  },
  codeText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    backgroundColor: Colors.backgroundLight,
    color: Colors.primaryLight,
    fontSize: 13,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: getSpacing("px1"),
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  errorBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error + "18",
    marginHorizontal: getSpacing("px3"),
    marginBottom: getSpacing("px1"),
    borderRadius: 12,
    paddingVertical: getSpacing("px2"),
    paddingHorizontal: getSpacing("px3"),
    gap: getSpacing("px2"),
    borderWidth: 1,
    borderColor: Colors.error + "30",
  },
  errorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.error + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    flex: 1,
    fontSize: getTypography("bodySmall"),
    color: Colors.error,
  },
  retryButton: {
    paddingVertical: getSpacing("px1_5"),
    paddingHorizontal: getSpacing("px3"),
    borderRadius: 8,
    backgroundColor: Colors.error + "25",
    borderWidth: 1,
    borderColor: Colors.error + "40",
  },
  retryText: {
    fontSize: getTypography("caption"),
    color: Colors.error,
    fontWeight: getTypography("fontWeight").semibold,
  },
  inputWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    paddingBottom: Platform.OS === "ios" ? getSpacing("px4") : getSpacing("px2"),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: getSpacing("px3"),
    paddingTop: getSpacing("px2"),
    gap: getSpacing("px2"),
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 22,
    paddingHorizontal: getSpacing("px4"),
    paddingVertical: Platform.OS === "ios" ? getSpacing("px3") : getSpacing("px2"),
    fontSize: getTypography("body"),
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
