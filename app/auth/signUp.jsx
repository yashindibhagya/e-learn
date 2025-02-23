import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Pressable, Alert } from "react-native";
import React, { useContext, useState } from "react";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../config/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import { UserDetailContext } from "../../context/UserDetailContext";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUserDetail } = useContext(UserDetailContext);

  const CreateNewAccount = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    try {
      const resp = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = resp.user;
      console.log("User Created:", user);
      await SaveUser(user);
    } catch (error) {
      console.log("Error:", error.message);
      Alert.alert("Sign Up Failed", error.message);
    }
  };

  const SaveUser = async (user) => {
    const data = {
      name: name.trim(),
      email: email.trim(),
      member: false,
      uid: user?.uid,
    };

    try {
      await setDoc(doc(db, "users", user.uid), data); // Fix syntax error here
      setUserDetail(data);
      console.log("User saved to Firestore");
      Alert.alert("Success", "Account created successfully!");
      router.push("/auth/signIn");
    } catch (error) {
      console.log("Error saving user:", error.message);
      Alert.alert("Error", "Failed to save user data.");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("./../../assets/images/logo.png")} style={styles.logo} />
      <Text style={styles.heading}>Create New Account</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.textInput}
        onChangeText={setName}
        value={name}
      />
      <TextInput
        placeholder="Email"
        style={styles.textInput}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.textInput}
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity onPress={CreateNewAccount} style={styles.button}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <Text>Already have an account?</Text>
        <Pressable onPress={() => router.push("/auth/signIn")}>
          <Text style={styles.signIn}>Sign In here</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 25,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  heading: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    width: "100%",
    padding: 15,
    fontSize: 14,
    marginTop: 10,
    borderRadius: 8,
  },
  button: {
    padding: 15,
    backgroundColor: "#3c0061",
    width: "100%",
    marginTop: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  signIn: {
    color: "#3c0061",
    fontWeight: "bold",
    marginLeft: 5,
  },
});
