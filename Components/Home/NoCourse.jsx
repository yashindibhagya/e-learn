import { View, Text, StyleSheet, Image} from 'react-native'
import React from 'react'
import Button from '../shared/Button'
import { useRouter } from 'expo-router'

export default function NoCourse() {
    const router = useRouter();
  return (
    <View>
        <View style={styles.content}>
            <Image source={require('./../../assets/images/book.png')} style={styles.image} />
            <Text style={styles.text}>You Don't Have Any Course</Text>

            <Button text={'Create New Course'} style={styles.button} onPress={()=>router.push('/addCourse')} />
            <Button text={'Explore Existing Courses'}
                type='outline' 
                style={styles.button}/>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    content: {
        marginTop: 40,
        display: 'flex',
        alignItems: 'center',
    },

    image:{
        height: 200,
        width: 200
    },

    text:{
        fontWeight: 'bold',
        fontSize: 25,
        textAlign: 'center',
        marginTop: 30
    },
})