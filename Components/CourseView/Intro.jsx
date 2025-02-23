import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Image , StyleSheet } from 'react-native'
import { imageAssets } from '../../constants/Option'
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from './../../Components/shared/Button'
import { useRouter } from 'expo-router';

export default function Intro({course}) {
    const router = useRouter();
  return (
    <View>
      <Image source={imageAssets[course?.bannerImage]} style={styles.image} />


      <View style={styles.courseName} >
        <Text style={styles.courseText}>{course?.courseName}</Text>

            
        <View style={styles.chapter} >
            <Ionicons name="book-outline" size={20} color="#3c0061" />
            <Text 
                style={styles.chapterText}>
                {course?.chapters?.length} Chapters
            </Text>
        </View>

        <Text style={styles.desc}>Desciption:</Text>
        <Text style={styles.description}>{course?.description}</Text>

        <Button text={'Start Now'}
            onPress={()=>console.log('')}
        />
      </View>
      <Pressable style={{
            position: 'absolute',
            padding: 10
        }}
        onPress={()=>router.back()}
        >
            <Ionicons name="arrow-back-outline" size={24} color="black" />
        </Pressable>

    </View>
    )
}
      
const styles = StyleSheet.create({
    image:{
        width: '100%',
        height: 280
    },
    courseName:{
        padding: 20
    },
    courseText:{
        fontWeight: '900',
        fontSize: 25
    },
    chapter:{
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        marginTop: 5
      },
  
      chapterText:{
        fontSize: 16,
        color: '#3c0061',
        fontWeight: '600'
      },
      desc:{
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 10
      },
      description:{
        fontSize: 14,
        fontWeight: '400'
      }
      
})