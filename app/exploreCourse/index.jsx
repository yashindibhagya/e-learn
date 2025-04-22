import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function ExploreCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'Courses'));
                const coursesList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCourses(coursesList);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#3c0061" style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Available Courses</Text>
            {courses.length === 0 ? (
                <Text style={styles.noCourses}>No courses available at the moment.</Text>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Pressable style={styles.courseItem} onPress={() => router.push(`/course/${item.id}`)}>
                            <Text style={styles.courseTitle}>{item.title}</Text>
                            <Text style={styles.courseDesc}>{item.description || 'No description available'}</Text>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3c0061',
        marginBottom: 15,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noCourses: {
        textAlign: 'center',
        fontSize: 16,
        color: '#555',
    },
    courseItem: {
        padding: 15,
        backgroundColor: '#f3e5f5',
        borderRadius: 10,
        marginBottom: 10,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3c0061',
    },
    courseDesc: {
        fontSize: 14,
        color: '#555',
    },
});
