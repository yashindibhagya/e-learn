import { View, Text, StyleSheet, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { Image } from 'react-native';
import { imageAssets } from '../../../constants/Option';
import Intro from '../../../Components/CourseView/Intro';
import Chapters from '../../../Components/CourseView/Chapters';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

export default function CourseView() {

    const {courseParams,courseId } = useLocalSearchParams();
    const [course,setCourse] = useState([])
    //const course = JSON.parse(courseParams);

    useEffect(()=>{
      if(!courseParams){
        GetCourseById()
      }
      else{
        setCourse(JSON.parse(courseParams))
      }
    },[courseId])
    
    const GetCourseById=async() =>{
      const docRef = await getDoc(doc(db , 'Courses' , courseId))
      const courseData = docRef.data()
      setCourse(courseData)
    }

  return course &&(
    <FlatList
      data={[]}
      ListHeaderComponent = {
      <View style={styles.container}>
        <Intro course={course}/>
        <Chapters course={course}/>
      </View> 
      }
    />
  )
}

const styles = StyleSheet.create({
    container:{
        backgroundColor: '#fff',
        flex: 1
    },
})