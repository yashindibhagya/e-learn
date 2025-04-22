import { View, StyleSheet, FlatList, SafeAreaView, StatusBar, useWindowDimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import Intro from '../../../Components/CourseView/Intro';
import Chapters from '../../../Components/CourseView/Chapters';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

export default function CourseView() {
    const { courseParams, courseId } = useLocalSearchParams();
    const [course, setCourse] = useState(null)
    const { width } = useWindowDimensions();

    useEffect(() => {
        if (!courseParams) {
            GetCourseById()
        } else {
            setCourse(JSON.parse(courseParams))
        }
    }, [courseId])

    const GetCourseById = async () => {
        try {
            const docRef = await getDoc(doc(db, 'Courses', courseId))
            if (docRef.exists()) {
                const courseData = docRef.data();
                setCourse({ ...courseData, docId: courseId });
            }
        } catch (error) {
            console.error("Error fetching course:", error);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
            {course && (
                <FlatList
                    data={[]}
                    ListHeaderComponent={
                        <View style={[styles.container, { width }]}>
                            <Intro course={course} />
                            <Chapters course={course} />
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
})