import { User } from "@/common/model";
import BackButton from "@/components/back-button";
import SubmitButton from "@/components/submit-button";
import { useErrorPopup } from "@/src/context/ErrorPopupContext";
import { ApiError } from "@/src/services/api";
import { fetchVehicles, login } from "@/src/services/auth";
import { Colors, getSpacing, getTypography } from "@/src/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AddAccount() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUsers, setHasUsers] = useState(false);
  const { showError } = useErrorPopup();

  useEffect(() => {
    AsyncStorage.getItem("users").then((storageUsers) => {
      if (storageUsers) {
        setHasUsers(JSON.parse(storageUsers).length > 0);
      }
    });
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      showError("Atenção", "Preencha todos os campos!");
      return;
    }

    const storageUsers = await AsyncStorage.getItem("users");
    let users: User[] = [];

    if (storageUsers) {
      users = JSON.parse(storageUsers);
    }

    const userAlreadyExists = users.find(
      (user) => email === user.email
    );

    if (userAlreadyExists) {
      showError("Atenção", "Usuário já adicionado!");
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(email, password);

      const vehicles = await fetchVehicles(data.token);

      users.push({
        id: data.user.id,
        email: data.user.email,
        name: data.user.nome,
        accessToken: data.token,
        refreshToken: data.refreshToken,
        vehicles,
      });

      await AsyncStorage.setItem("users", JSON.stringify(users));

      router.replace("/");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          showError("Erro", "Credenciais inválidas");
        } else {
          showError("Erro", `Erro ao conectar com o servidor (${error.status})`);
        }
      } else {
        showError("Erro", "Não foi possível conectar ao servidor");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {hasUsers && <BackButton />}

        <View style={styles.formContainer}>
          <View style={styles.card}>
            <View style={styles.cardAccent} />

            <View style={styles.titleSection}>
              <Text style={styles.title}>RastroApp</Text>
              <Text style={styles.subtitle}>Adicionar conta</Text>
            </View>

            <TextInput
              onChangeText={setEmail}
              value={email}
              placeholder="Email"
              keyboardType={Platform.OS === "ios" ? "email-address" : undefined}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={Colors.textTertiary}
              cursorColor={Colors.primary}
              selectionColor={Colors.primaryLight}
              style={styles.input}
            />

            <TextInput
              onChangeText={setPassword}
              value={password}
              placeholder="Senha"
              secureTextEntry
              placeholderTextColor={Colors.textTertiary}
              cursorColor={Colors.primary}
              selectionColor={Colors.primaryLight}
              style={styles.input}
            />

            <SubmitButton
              label="Acessar"
              onClick={handleLogin}
              loading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: getSpacing("px4"),
    paddingBottom: getSpacing("px12"),
  },
  card: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: getSpacing("px3"),
    paddingBottom: getSpacing("px5"),
  },
  cardAccent: {
    height: 2,
    backgroundColor: Colors.primary,
  },
  titleSection: {
    alignItems: "center",
    paddingTop: getSpacing("px8"),
    paddingBottom: getSpacing("px6"),
  },
  title: {
    color: Colors.text,
    fontSize: getTypography("h1"),
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: getTypography("body"),
    marginTop: getSpacing("px1"),
    marginBottom: getSpacing("px1"),
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: getSpacing("px5"),
    paddingHorizontal: getSpacing("px3"),
    color: Colors.text,
    fontSize: getTypography("body"),
    marginBottom: getSpacing("px3"),
  },
});