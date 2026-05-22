import { User } from "@/common/model";
import BackButton from "@/components/back-button";
import ErrorPopup from "@/components/error-popup";
import { SubmitButton } from "@/components/submit-button";
import { ApiError } from "@/src/services/api";
import { fetchVehicles, login } from "@/src/services/auth";
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
  const [errorPopup, setErrorPopup] = useState({ visible: false, title: "", message: "" });

  useEffect(() => {
    AsyncStorage.getItem("users").then((storageUsers) => {
      if (storageUsers) {
        setHasUsers(JSON.parse(storageUsers).length > 0);
      }
    });
  }, []);

  function showError(title: string, message: string) {
    setErrorPopup({ visible: true, title, message });
  }

  function hideError() {
    setErrorPopup({ visible: false, title: "", message: "" });
  }

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
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {hasUsers && <BackButton />}

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ffffff1a",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 24,
            }}
          >
            <Text
              style={{
                color: "#fafafa",
                fontSize: 32,
                fontWeight: "bold",
                alignSelf: "center",
                marginBottom: 32,
              }}
            >
              RastroApp
            </Text>

            <TextInput
              onChangeText={setEmail}
              value={email}
              placeholder="Digite seu email aqui..."
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              placeholderTextColor="#fafafa3e"
              style={styles.input}
            />

            <TextInput
              onChangeText={setPassword}
              value={password}
              placeholder="Digite sua senha aqui..."
              secureTextEntry
              placeholderTextColor="#fafafa3e"
              style={styles.input}
            />

            <SubmitButton
              label="Acessar"
              onClick={handleLogin}
              loading={isLoading}
              containerStyle={{ marginTop: 18 }}
            />
          </View>
        </View>
      </ScrollView>

      <ErrorPopup
        visible={errorPopup.visible}
        title={errorPopup.title}
        message={errorPopup.message}
        onClose={hideError}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#ffffff0b",
    borderWidth: 1,
    borderColor: "#ffffff26",
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 12,
    color: "#fafafa",
    marginBottom: 12,
    fontSize: 18,
  },
});
