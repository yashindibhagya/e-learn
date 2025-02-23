import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import { useRouter } from 'expo-router';
import { UserDetailContext } from '../../context/UserDetailContext';
import { Ionicons } from '@expo/vector-icons';
import { ProfileMenu } from '../../constants/Option'; // Import ProfileMenu

export default function ProfileScreen() {
  const router = useRouter();
  const { userDetail } = useContext(UserDetailContext);

  return (
    <View style={styles.container}>
      <Text style={styles.profileTitle}>Profile</Text>

      {/* Profile Section */}
      <View style={styles.profileHeader}>
        <Image 
          source={require('./../../assets/images/logo.png')} 
          style={styles.profileImage} 
        />
        <Text style={styles.userName}>{userDetail?.name || 'User Name'}</Text>
        <Text style={styles.userEmail}>{userDetail?.email || 'user@example.com'}</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        {ProfileMenu.map((item, index) => (
          <MenuItem key={index} icon={item.icon} text={item.name} onPress={() => router.push(item.path)} />
        ))}
      </View>
    </View>
  );
}

// Menu Item Component with Styled Icon
const MenuItem = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.iconWrapper}>
      <Ionicons name={icon} size={22} color="#3c0061" style={styles.iconStyle} />
    </View>
    <Text style={styles.menuText}>{text}</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    alignItems: 'center',
  },
  profileTitle: {
    marginBottom: 30,
    fontSize: 26,
    fontWeight: '900',
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    //borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  userEmail: {
    fontSize: 14,
    color: '#555',
  },
  menuContainer: {
    width: '90%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: '#rgb(241, 217, 255)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  iconStyle: {
    textAlign: 'center',
  },
  menuText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#000',
  },
});
