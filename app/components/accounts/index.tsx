import { User } from "@/common/model";
import { useRouter } from "expo-router";
import { Fragment } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AccountItem from "./account-item";
import { Colors, getSpacing } from "@/src/theme";

interface Props {
  users: User[];
  selectedImei: string;
  onVehicleClick: (imei: string) => void;
  onRemoveAccount: (removeUser: User) => void;
}

export default function Accounts({
  users,
  selectedImei,
  onVehicleClick,
  onRemoveAccount,
}: Props) {
  const router = useRouter();

  function handleAddAccount() {
    router.push("/add-account");
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <View style={styles.container}>
          {users.map((user) => (
            <Fragment key={user.id}>
              <AccountItem
                type="user"
                title={user.name}
                onRemoveAccount={() => onRemoveAccount(user)}
              />

              {user.vehicles.map((vehicle) => (
                <AccountItem
                  key={vehicle.imei}
                  type="vehicle"
                  title={vehicle.name}
                  isSelected={selectedImei === vehicle.imei}
                  onClick={() => onVehicleClick(vehicle.imei)}
                />
              ))}
            </Fragment>
          ))}

          <AccountItem type="add" title="Adicionar" onClick={handleAddAccount} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: getSpacing("px2"),
    marginVertical: getSpacing("px1_5"),
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  scrollContent: {
    paddingHorizontal: getSpacing("px2"),
    paddingVertical: getSpacing("px0_5"),
    gap: getSpacing("px1"),
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    paddingRight: 8,
  },
});