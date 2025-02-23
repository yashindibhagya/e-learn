import { View, Text, StyleSheet, Image , TouchableOpacity} from 'react-native'
import React, { useContext } from 'react'
import { useRouter } from 'expo-router';
import {onAuthStateChanged} from 'firebase/auth';
import {auth, db} from './../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { UserDetailContext } from '@/context/UserDetailContext';

export default function index() {

  const router=useRouter();
  const {userDetail, setUserDetail} = useContext(UserDetailContext)

  /*
  //every time when user refreash the page not to start with this page
  onAuthStateChanged(auth, async(user) =>{
    if (user){
      console.log(user);
      const result = await getDoc(doc(db, 'users', user?.email));
      setUserDetail(result.data())
      router.replace('/(tabs)/home')
    }
  });   
  */


  return (
    <View style={styles.container}>
      <Image style={styles.image}
        source = {require('./../assets/images/learning.png')} />

      <View  style={styles.welcome}>
        <Text style={styles.text}>Welcome to e-learing center</Text>

        <Text style={styles.para}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore eius perferendis sint maxime dolorum est mollitia voluptas, earum possimus, rem enim. Eveniet dicta modi ratione minima, recusandae repudiandae quod harum!
        </Text>

        <View style={styles.button}>
          <TouchableOpacity onPress={() => router.push("/auth/signUp")}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.button, {
          backgroundColor:'#3c0061', 
          //marginTop: 1,
          borderWidth: 1,
          borderColor: '#fff'
          }]}>
          <TouchableOpacity onPress={() => router.push("/auth/signIn")}>
            <Text style={[styles.buttonText, {
              color: '#fff'
              }]}>Already have an account?</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Dark green background
    //alignItems: "center",
    //justifyContent: "center",
  },

  image:{
    width: '100%',
    height: 300, // Reduce height so text is visible
    position: "absolute", // Position image behind content
    marginTop: 20, // Stick it to the top
  },
  welcome:{
    marginTop: 350,
    padding: 25,
    backgroundColor: '#3c0061',
    height: '100%',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35
  },
  text:{
    color: '#fff',
    fontSize: 30,
    fontWeight:'bold',
    textAlign: 'center'
  },
  para:{
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
    lineHeight: 22
  },

  button:{
    padding: 13,
    backgroundColor: '#fff',
    marginTop: 20,
    borderRadius: 10,
    width:350,
    height: 50,
    alignSelf: 'center'
  },
  buttonText:{
    textAlign: 'center',
    fontSize: 16
  },

})

