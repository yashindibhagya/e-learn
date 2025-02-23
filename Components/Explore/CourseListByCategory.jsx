import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../config/firebaseConfig'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { imageAssets } from '../../constants/Option';
import CourseList from '../Home/CourseList';

export default function CourseListByCategory({ category }) {
    const router = useRouter();
    const [courseList, setCourseList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        GetCourseListByCategory();
    }, [category]); // ✅ Add dependency array to prevent infinite loop

    const GetCourseListByCategory = async () => {
        setCourseList([]); // Reset course list before fetching
        setLoading(true);
        
        try {
            const q = query(
                collection(db, 'Courses'),
                where('category', '==', category),
                orderBy('createdOn', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const courses = querySnapshot.docs.map(doc => doc.data());

            setCourseList(courses); // ✅ Set new state properly
        } catch (error) {
            console.error("Error fetching courses:", error);
        }

        setLoading(false);
    };

    return (
        <View>
            {courseList?.length >0 && <CourseList courseList={courseList} heading={category}/>}
        </View>
    );
}

const styles = StyleSheet.create({
    courseContainer:{
        padding: 10,
        backgroundColor: '#fff',
        margin: 6,
        width: 260,
        borderRadius: 15,
        elevation: 4
      },
      courseName:{
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 10
      },
      chapter:{
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        marginTop: 5
      },
  
      chapterText:{
        fontSize: 12
      }
})
