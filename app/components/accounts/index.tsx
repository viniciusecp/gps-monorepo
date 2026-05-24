import { User } from "@/common/model";
import { useRouter } from "expo-router";
import { Fragment, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import AccountItem from "./account-item";
import { Colors, getSpacing } from "../../src/theme";

interface Props {
  users: User[];
  onVehicleClick: (imei: string) => void;
  onRemoveAccount: (removeUser: User) => void;
}

export default function Accounts({
  users,
  onVehicleClick,
  onRemoveAccount,
}: Props) {
  const router = useRouter();

  const [selectedImei, setSelectedImei] = useState("");

  function handleAddAccount() {
    router.push("/add-account");
  }

  function handleVehicleClick(imei: string) {
    setSelectedImei(imei);
    onVehicleClick(imei);
  }

  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      horizontal
      style={styles.scrollView}
    >
      {users.map((user) => (
        <Fragment key={user.name}>
          <AccountItem
            type="user"
            title={user.name}
            onRemoveAccount={() => onRemoveAccount(user)}
          />

          {user.vehicles.map((vehicle) => (
            <AccountItem
              key={vehicle.name}
              type="vehicle"
              title={vehicle.name}
              isSelected={selectedImei === vehicle.imei}
              onClick={() => handleVehicleClick(vehicle.imei)}
            />
          ))}
        </Fragment>
      ))}

      <AccountItem type="add" title="Adicionar" onClick={handleAddAccount} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: getSpacing("px2"),
  },
});
