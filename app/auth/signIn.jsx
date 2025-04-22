import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Pressable, ToastAndroid, ActivityIndicator } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { UserDetailContext } from '../../context/UserDetailContext';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUserDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);

  // Check if the user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User already signed in:", user);
        await getUserDetail(user.uid);
        router.replace('/(tabs)/home');
      }
    });

    return unsubscribe; // Clean up listener on component unmount
  }, []);

  const onSignInClick = async () => {
    if (!email || !password) {
      ToastAndroid.show('Email and password are required.', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    try {
      const resp = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = resp.user;
      console.log("User signed in:", user);
      await getUserDetail(user.uid);
      setLoading(false);

      // Navigate to home after successful sign-in
      router.replace('/(tabs)/home');
    } catch (e) {
      console.log("Sign-in error:", e.message);
      setLoading(false);
      ToastAndroid.show('Incorrect email or password', ToastAndroid.SHORT);
    }
  };

  // Fetch user details
  const getUserDetail = async (uid) => {
    try {
      const result = await getDoc(doc(db, 'users', uid));
      if (result.exists()) {
        setUserDetail(result.data());
        console.log("User details:", result.data());
      } else {
        console.log("User data not found in Firestore.");
      }
    } catch (error) {
      console.log("Error fetching user details:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.heading}>Sign In</Text>

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
        secureTextEntry={true} 
        style={styles.textInput}
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity onPress={onSignInClick} disabled={loading} style={styles.button}>
        {!loading ? (
          <Text style={styles.buttonText}>Sign In</Text>
        ) : (
          <ActivityIndicator size="small" color="#fff" />
        )}
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <Text>Don't have an account?</Text>
        <Pressable onPress={() => router.push("/auth/signUp")}>
          <Text style={styles.signIn}>Create New Account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 25,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  heading: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    width: '100%',
    padding: 15,
    fontSize: 14,
    marginTop: 10,
    borderRadius: 8,
  },
  button: {
    padding: 15,
    backgroundColor: '#3c0061',
    width: '100%',
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signIn: {
    color: '#3c0061',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
