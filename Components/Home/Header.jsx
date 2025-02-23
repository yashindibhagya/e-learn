import { View, Text, StyleSheet, Platform } from 'react-native'
import React, { useContext } from 'react'
import { UserDetailContext } from '@/context/UserDetailContext';

export default function Header() {

    const {userDetail, setUserDetail} = useContext(UserDetailContext)
  return (
    <View>
        <View>
            <Text style={styles.heading}>
                Hello, {userDetail?.name}      </Text>

            <Text style={styles.started}>Let's Get Started!!</Text>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    heading:{
        fontWeight: '900',
        fontSize: 28,
        color: '#fff'
    },

    started:{
        fontSize: 16,
        //color: '#3c0061',
        color: '#fff',
        fontWeight: '600'
    },


})